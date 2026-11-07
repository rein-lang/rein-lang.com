# Rein language reference

Status: proof of concept. Private. Rules here drive the checker and the evaluator.
Design reasons and open questions live in [decisions.md](decisions.md).

## 1. Project layout

- A project root is a directory that contains a `rein.toml` file.
- Each function is one file with the `.rein` extension.
- Every project has a `main.rein` at the project root. It is the agent's entry point. The checker reports a project without it.
- A function name is the file path relative to the project root, without `.rein`, using `/` as separator. `ci/fix.rein` defines `ci/fix`. The root `main.rein` defines `main`.
- Subdirectories are allowed.
- A reference resolves only inside the same project.
- `rein.toml` is a marker. The examples hold one comment line.
- The directory walk skips hidden directories (names starting with `.`), `target/` and `node_modules/`.
- The walk follows symlinks. A symlink loop does not repeat a directory.
- A `.rein` file that cannot be read (for example, not UTF-8) is an error on that file. The file stays in the project, with empty text. The message is `cannot read file: <io error>`.
- When two sources map to the same function name, the later one wins. This applies to editor overlays only.
- A function file name must follow the rule in section 8.

## 2. Lexical rules

- A line comment starts with `//` and ends at the end of the line.
- A doc comment starts with `/**` and ends at the first `*/`. Its raw text is the doc block (section 4). `/**/` is an empty doc comment.
- A plain block comment `/* ... */` is not supported. Use `//` for comments or `/** */` for the doc block.
- An unterminated doc comment is an error: `unterminated doc comment; add */`.
- A STRING is text in double quotes. Escapes: `\"`, `\\`, `\n`. A raw newline is not allowed inside a STRING.
- An IDENT matches `[A-Za-z_][A-Za-z0-9_]*`. An IDENT cannot be a keyword.
- A REF is `@` followed by one or more segments separated by `/`. Segment characters: see open questions.
- Keywords: `input`, `if`, `else`, `switch`, `case`, `default`, `return`, `bool`, `choice`, `not`, `and`, `or`.
- `description` is not a keyword. It is an ordinary IDENT.
- `true`, `false`, `yes`, `no` are not keywords. They are bool values (section 7).
- A UTF-8 byte order mark at the start of a file is whitespace.

## 3. Grammar

```
file        := DOC? input* stmt*
input       := "input" IDENT ":" type
type        := "bool" | "choice" "(" STRING ("," STRING)* ","? ")"
stmt        := if | switch | return
if          := "if" expr block ("else" (if | block))?
switch      := "switch" IDENT "{" case* default? "}"
case        := "case" STRING block
default     := "default" block
block       := "{" stmt* "}"
return      := "return" (STRING | REF)
expr        := and ("or" and)*
and         := unary ("and" unary)*
unary       := "not" unary | atom
atom        := "(" expr ")" | IDENT (("==" | "!=") STRING)?
```

`DOC` is a doc comment token (section 2). It is allowed only as the first token of the file. Line comments may come before it.

## 4. Declarations

### Doc block

The doc block is the `/** */` comment at the top of the file. It follows the TypeScript convention.

```rein
// optional line comments may come before the doc block
/**
 * Decide whether a pull request can be merged.
 *
 * Longer text may span lines and paragraphs.
 *
 * @param docs_only Does the PR change only documentation files?
 * @param ci - What is the CI status of the PR?
 *   Continuation lines belong to the previous tag.
 */
input docs_only: bool
input ci: choice("green", "red", "pending")
```

Parsing rules:

- For each line, strip the leading whitespace, then one leading `*`, then one following space if present.
- The text before the first line that starts with `@` is the function description. It is trimmed. Line breaks are kept. Three or more line breaks in a row become one paragraph break.
- `@param <name> [-] <text>` gives an input its question. The optional `-` is removed. The text runs on through the following lines, up to the next `@` line. Continuation lines are joined with a space, and the text is trimmed.
- Any other tag (for example `@returns` or `@example`) is not part of the description. It gives a warning (section 8).
- A `/**` anywhere except the first token is a syntax error: `the doc comment must be at the top of the file`.
- A plain `/* */` comment is a syntax error (section 2).

### Functions

- The doc block gives the function description. It must be present and not empty.
- Each input must have one `@param` with the same name, and the text after the name is its question.

### Inputs

- `input` declares a value the agent must provide. The `@param` text for that input is the question the agent must answer.
- Input names are unique within a file.
- Input types:
  - `bool`: true or false.
  - `choice(...)`: one value from a list of options. A choice needs at least 2 unique, non-empty options.

Example. The doc block and the `input` lines together describe the input `ci`:

```rein
/**
 * Decide whether a pull request can be merged.
 *
 * @param ci What is the CI status of the PR?
 */
input ci: choice("green", "red", "pending")
```

## 5. Statements

- `if` runs a block when its condition holds. `else` runs when it does not. `else` may chain to another `if`.
- `switch` picks one `case` by the value of a choice input. `default` runs when no case matches.
- `default` must be the last branch of a switch. A `case` after `default` is a syntax error.
- A `switch` with no matching case and no `default` falls through to the next statement. This is the same as an `if` without `else`. The "every path returns" rule (section 8) still catches a function that then ends without returning.
- `return` ends the function with a STRING or a REF.
- Rein has no `for` and no `while`.

## 6. Conditions

- A bool input is used bare: `docs_only`.
- A choice input is compared with `==` or `!=`: `ci == "green"`.
- `not`, `and`, `or` combine conditions. `not` binds tightest, then `and`, then `or`. Parentheses group.
- Evaluation of `and` and `or` stops early when the result is known.

## 7. Values

- Bool values: `true`, `false`, `yes`, `no`. Both `yes` and `true` mean true. Both `no` and `false` mean false. Case does not matter: `TRUE`, `Yes` and `No` are valid.
- Choice values: one of the declared options, as a string.
- Return values: a STRING, or a REF to another function.

## 8. Checker rules

When a file has a syntax error, only that error is reported for the file. It is the first syntax error. The other checks run after the syntax error is fixed.

### Errors

| Rule |
| --- |
| A function file name has a `/` part that is not an identifier or is a keyword (`invalid function file name`) |
| The file has no doc comment (`missing doc comment; start the file with /** description */`) |
| A doc comment is not the first token of the file (`the doc comment must be at the top of the file`) |
| A doc comment is not closed (`unterminated doc comment; add */`) |
| A plain `/* */` comment is used (`use `//` for comments or `/** */` for the doc block`) |
| The function description is empty |
| An input has no `@param` (`input x has no description; add @param x <question> to the doc comment`) |
| A `@param` names no input (`@param y does not match any input`) |
| A `@param` name is used twice (`duplicate @param x`) |
| A `@param` has no text after its name (`@param x needs a question after the name`) |
| A `@param` has no name (`@param needs an input name`) |
| Two inputs share a name |
| A choice has fewer than 2 options |
| A choice has a duplicate option or an empty option |
| A condition uses a choice input bare |
| A condition compares a bool input with `==` or `!=` |
| A condition uses an undeclared name |
| `switch` subject is not a choice input |
| A compared value or case value is not an option of the input |
| Two `case` blocks use the same value |
| A path through the function ends without `return` |
| A REF points to a file that does not exist in the project |
| The project has no `main.rein` at the root (`project has no main.rein; it is the agent's entry point`). It is reported on `rein.toml`, at 1:1. |

A function returns on every path under these rules:

- `if` returns only when it has an `else`, and both branches return.
- `switch` returns when every `case` returns and either `default` returns, or the cases cover every option.

### Warnings

| Rule |
| --- |
| An input is declared but never used |
| A statement can never run (for example, code after `return`) |
| References form a cycle, such as `a -> b -> a`. A cycle acts as a loop. The checker gives one warning on every `@ref` that lies on the cycle, so an N-file cycle gives N warnings. A self-reference (a file that returns its own `@ref`) is a cycle. |
| A doc tag other than `@param` (`unknown tag @x; Rein supports @param`) |
| A function cannot be reached from `main` through references (`x is not reachable from main`). This warning is not given when `main` is missing or has a syntax error. |

## 9. Evaluation

- One run evaluates one function. By default that is `main`.
- The runtime asks for an input only when the taken path needs it. This is lazy evaluation.
- A run returns one of:
  - a STRING: the agent does what the text says.
  - a REF: the agent runs the target function next, using its description and inputs.
  - a request for an input: the agent answers the question, then runs again.
- Input values come from `--set name=value`. A bool takes `true`, `false`, `yes`, or `no`. A choice takes one of its options.

## 10. CLI

| Command | Purpose |
| --- | --- |
| `rein check [PATH]` | Check a project directory, or one file. Default `.`. Prints `file:line:col: error: message`. Exit code 1 when there are errors. |
| `rein run [FUNCTION] [--root DIR] [--set name=value]... [--json]` | Evaluate one step. `FUNCTION` defaults to `main`. Prints the returned string, or `@target` with the target's description and inputs. Exit code 2 when an input is needed. |
| `rein describe [FUNCTION] [--root DIR]` | Print the function's schema as JSON. `FUNCTION` defaults to `main`. Usable as an agent tool schema. |
| `rein graph [--root DIR]` | Print a Mermaid flowchart of the references. The `main` node is drawn as a stadium shape. |
| `rein lsp` | Run the language server over stdio. Provides diagnostics, hover, go to definition, and completion. |

### Input request output

Text form:

```text
need input <name> (<type>): <description>
```

### `rein run --json`

Each run prints one of these objects:

```json
{"kind":"text","value":"..."}
{"kind":"ref","function":"...","description":"...","inputs":[...]}
{"kind":"need_input","input":{"name":"...","type":"bool|choice","options":["..."],"description":"..."}}
```

`options` appears only for `choice` inputs.

### `rein describe` output

```json
{
  "name": "merge_pr",
  "description": "...",
  "inputs": [
    {"name": "docs_only", "type": "bool", "description": "..."},
    {"name": "ci", "type": "choice", "options": ["green", "red", "pending"], "description": "..."}
  ]
}
```
