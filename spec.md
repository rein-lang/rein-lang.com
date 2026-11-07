# Rein language reference

Status: proof of concept. Private. Rules here drive the checker and the evaluator.
Design reasons and open questions live in [decisions.md](decisions.md).

## 1. Project layout

- A project root is a directory that contains a `rein.toml` file.
- Each function is one file with the `.rein` extension.
- A function name is the file path relative to the project root, without `.rein`, using `/` as separator. `ci/fix.rein` defines `ci/fix`.
- Subdirectories are allowed.
- A reference resolves only inside the same project.
- `rein.toml` is a marker. The examples hold one comment line.
- The directory walk skips hidden directories (names starting with `.`), `target/` and `node_modules/`.
- The walk follows symlinks. A symlink loop does not repeat a directory.
- A `.rein` file that cannot be read (for example, not UTF-8) is an error on that file. The file stays in the project, with empty text. The message is `cannot read file: <io error>`.
- When two sources map to the same function name, the later one wins. This applies to editor overlays only.
- A function file name must follow the rule in section 8.

## 2. Lexical rules

- A comment starts with `//` and ends at the end of the line.
- A STRING is text in double quotes. Escapes: `\"`, `\\`, `\n`. A raw newline is not allowed inside a STRING.
- An IDENT matches `[A-Za-z_][A-Za-z0-9_]*`. An IDENT cannot be a keyword.
- A REF is `@` followed by one or more segments separated by `/`. Segment characters: see open questions.
- Keywords: `description`, `input`, `if`, `else`, `switch`, `case`, `default`, `return`, `bool`, `choice`, `not`, `and`, `or`.
- `true`, `false`, `yes`, `no` are not keywords. They are bool values (section 7).
- A UTF-8 byte order mark at the start of a file is whitespace.

## 3. Grammar

```
file        := description input* stmt*
description := "description" STRING
input       := "input" IDENT ":" type STRING
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

## 4. Declarations

- The first statement of a file is `description`. It holds one non-empty STRING. It describes the function.
- `input` declares a value the agent must provide. The STRING after the type is the question the agent must answer.
- Input names are unique within a file.
- Input types:
  - `bool`: true or false.
  - `choice(...)`: one value from a list of options. A choice needs at least 2 unique, non-empty options.

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
| `description` is missing or is not the first statement |
| `description` text is empty |
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

A function returns on every path under these rules:

- `if` returns only when it has an `else`, and both branches return.
- `switch` returns when every `case` returns and either `default` returns, or the cases cover every option.

### Warnings

| Rule |
| --- |
| An input is declared but never used |
| A statement can never run (for example, code after `return`) |
| References form a cycle, such as `a -> b -> a`. A cycle acts as a loop. The checker gives one warning on every `@ref` that lies on the cycle, so an N-file cycle gives N warnings. A self-reference (a file that returns its own `@ref`) is a cycle. |

## 9. Evaluation

- One run evaluates one function.
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
| `rein run FUNCTION [--root DIR] [--set name=value]... [--json]` | Evaluate one step. Prints the returned string, or `@target` with the target's description and inputs. Exit code 2 when an input is needed. |
| `rein describe FUNCTION [--root DIR]` | Print the function's schema as JSON. Usable as an agent tool schema. |
| `rein graph [--root DIR]` | Print a Mermaid flowchart of the references. |
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
