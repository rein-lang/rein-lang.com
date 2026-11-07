# Rein language reference

Status: proof of concept. Private. Rules here drive the checker and the evaluator.
Design reasons and open questions live in [decisions.md](decisions.md).

Rein is a strict subset of TypeScript. Every Rein file is valid TypeScript syntax. `npm run check-ts-syntax` in `editors/vscode` proves it for `examples/`.

## 1. Project layout

- A project root is a directory that contains a `rein.toml` file.
- Each function is one file with the `.rein` extension.
- Every project has a `main.rein` at the project root. It is the agent's entry point. The checker reports a project without it.
- A function name is the file path relative to the project root, without `.rein`, using `/` as separator. `ci/fix.rein` defines `ci/fix`. The root `main.rein` defines `main`.
- The name of the `export default function` inside a file is a TypeScript identifier. It need not match the file name.
- Subdirectories are allowed.
- A reference resolves only inside the same project (section 4, Imports).
- `rein.toml` is a marker. The examples hold one comment line.
- The directory walk skips hidden directories (names starting with `.`), `target/` and `node_modules/`.
- The walk follows symlinks. A symlink loop does not repeat a directory.
- A `.rein` file that cannot be read (for example, not UTF-8) is an error on that file. The file stays in the project, with empty text. The message is `cannot read file: <io error>`.
- When two sources map to the same function name, the later one wins. This applies to editor overlays only.

## 2. Lexical rules

- A line comment starts with `//` and ends at the end of the line.
- A doc comment starts with `/**` and ends at the first `*/`. Its raw text is the doc block (section 4). `/**/` is an empty doc comment.
- A plain block comment `/* ... */` is not supported. The error is `use `//` for comments or `/** */` for the doc block`.
- An unterminated doc comment is an error: `unterminated doc comment; add */`.
- A STRING is text in double quotes or single quotes. Escapes: `\"`, `\'`, `\\`, `\n`. A raw newline is not allowed inside a STRING.
- An IDENT matches `[A-Za-z_][A-Za-z0-9_]*`.
- Keywords: `import`, `from`, `export`, `default`, `function`, `if`, `else`, `switch`, `case`, `return`, `boolean`. A keyword cannot be a name.
- Reserved words: `for`, `while`, `do`, `const`, `let`, `var`. They are not Rein. Using one gives a helpful error (section 3). A file name segment cannot be one either.
- Operators: `===`, `!==`, `&&`, `||`, `!`, `|`, `(`, `)`, `{`, `}`, `,`, `:`, `;`.
  - `==` is an error: `use `===` instead of `==``.
  - `!=` is an error: `use `!==` instead of `!=``.
- Any other character, such as `@`, is an error: `unexpected character`.
- A UTF-8 byte order mark at the start of a file is whitespace.

## 3. Grammar

```
file        := import* DOC? "export" "default" "function" IDENT "(" params? ")" block
import      := "import" IDENT "from" STRING ";"?
params      := param ("," param)* ","?
param       := DOC IDENT ":" type            // DOC is required; the checker reports a missing one
type        := "boolean" | "|"? STRING ("|" STRING)*
block       := "{" stmt* "}"
stmt        := if | switch | return
if          := "if" "(" expr ")" block ("else" (if | block))?
switch      := "switch" "(" IDENT ")" "{" clause* "}"
clause      := ("case" STRING ":")+ (block | stmt*)   // a label with no body joins the next body
             | "default" ":" (block | stmt*)          // default is the last clause
return      := "return" (STRING | IDENT) ";"?
expr        := and ("||" and)*
and         := unary ("&&" unary)*
unary       := "!" unary | atom
atom        := "(" expr ")" | IDENT (("===" | "!==") STRING)?
```

The function doc (`DOC?`) is optional in the grammar so the checker can name the missing doc. Every parameter has a doc comment in the same way: the checker reports `parameter `x` needs a doc comment`.

Helpful errors from the parser:

| Input | Message |
| --- | --- |
| `for`, `while`, `do` in a body | `Rein has no loops yet` |
| `const`, `let`, `var` in a body | `Rein has no variables` |
| `true` or `false` in a condition or comparison | `use the boolean parameter directly` |
| a doc comment in any other place | `the doc comment must go right before `export default function` or a parameter` |
| a second `export default function` | `expected end of file ...; a file holds one `export default function`` |

## 4. Declarations

### Imports

`import name from "./path";` binds `name` to another function. The body returns it with `return name;`.

- The path starts with `./` or `../`. It has no extension.
- The path is relative to the directory of the importing file. `import x from "../merge_pr"` in `ci/fix.rein` names `merge_pr`.
- The path must stay inside the project root. `import x from "../../outside"` in `ci/fix.rein` is an error: `import '../../outside' leaves the project root`.
- A path with no file is an error on the path string: `cannot find module './x'`.
- A binding name is unique in the file. It also differs from every parameter name.
- An import that the body never returns gives a warning: `unused import`.
- Imports come first in the file. A `;` is optional.

### Doc comments

Rein has two kinds of doc comment. Each one holds only its own text.

- The function doc comment. It sits right before `export default function`, after the imports. It gives the function description.
- A parameter doc comment. It sits right before the parameter, inside the parameter list. It gives the question the agent must answer for that parameter.

```ts
import escalate from "./escalate";

/**
 * Route a new support ticket to the right handling.
 */
export default function handleTicket(
  /** What kind of ticket is it? */
  category: "billing" | "bug" | "question",
  /**
   * Is the customer a VIP?
   * Check the account tier in the CRM.
   */
  vip: boolean,
) {
  if (vip) {
    return escalate;
  }

  return "Answer the ticket.";
}
```

Parsing rules, for each doc block:

- For each line, strip the leading whitespace, then one leading `*`, then one following space if present.
- The text before the first line that starts with `@` is the description. It is trimmed. Line breaks are kept. Three or more line breaks in a row become one paragraph break.
- Text after an `@` line is not part of the description.
- A `@` tag is an error when it is `@param`: `describe each parameter in its own doc comment, right before it`. Any other tag gives a warning: `unknown tag`.
- An empty function description is an error. An empty parameter doc comment is an error: `parameter `x` needs a doc comment: /** question */ x: ...`.

### Function

- `export default function NAME(params) block` is the whole function. The file holds exactly one.
- The parameter list may end with a comma.
- The body is a block.

### Parameters

- A parameter is `name: type`. The type is `boolean` or a union of strings.
- `boolean` is true or false.
- A union is one of its string members. It needs at least 2 unique, non-empty members. A leading `|` is allowed, so a long union can start on its own line.
- Parameter names are unique within a function.

## 5. Statements

- `if (cond) { ... }` runs its block when the condition holds. `else` runs when it does not. `else` may chain to another `if`.
- `switch (name) { ... }` picks one group of `case` labels by the value of a union parameter.
  - Labels with no body join the next body: `case "a": case "b": return x;` is one group with two labels.
  - A clause body is a block or statements. The body ends at the next label or at `}`.
  - A body with statements must end in a terminating statement (section 6). Otherwise the error is `case falls through; end it with return`. The same rule applies to `default` (`default falls through; end it with return`).
  - `default` must be the last clause. It cannot share a body with a `case`.
  - A `switch` with no matching case and no `default` falls through to the next statement, as an `if` without `else` does. The "not all paths return" rule still catches a function that then ends without returning.
- `return "text";` or `return name;` ends the function. The `;` is optional.

## 6. Conditions

- A boolean parameter is used bare: `if (docsOnly)`, or negated: `if (!docsOnly)`.
- A union parameter is compared with `===` or `!==`: `if (ci === "green")`.
- `!`, `&&`, `||` combine conditions. `!` binds tightest, then `&&`, then `||`. Parentheses group.
- Evaluation of `&&` and `||` stops early when the result is known.

## 7. Values

- Boolean values: `true`, `false`, `yes`, `no` on the command line. `yes` and `true` mean true. `no` and `false` mean false. Case does not matter.
- Union values: one of the declared members, as a string.
- Return values: a STRING, or an imported function. A return of anything else is an error: `` `x` is not an imported function ``.

## 8. Checker rules

When a file has a syntax error, only that error is reported for the file. It is the first syntax error. The other checks run after the syntax error is fixed.

### Errors

| Rule |
| --- |
| A function file name has a `/` part that is not an identifier, or is a keyword or reserved word (`invalid function file name`) |
| The file has no function doc comment (`missing doc comment; put /** description */ right before `export default function``) |
| The function description is empty |
| A parameter has no doc comment or an empty one (`parameter x needs a doc comment: /** question */ x: ...`) |
| A doc comment has `@param` (`describe each parameter in its own doc comment, right before it`) |
| Two parameters share a name |
| A union has fewer than 2 members |
| A union has a duplicate or an empty member |
| A condition uses a union parameter bare |
| A condition compares a boolean parameter with `===` or `!==` |
| A condition or switch subject names an unknown parameter |
| `switch` subject is not a union parameter |
| A compared value or case value is not a member of the union |
| Two case labels use the same value |
| A `case` or `default` body does not end in a terminating statement (`case falls through; end it with return`) |
| A path through the function ends without `return` (`not all paths return a value`) |
| A `return` names something that is not an import (`` `x` is not an imported function ``) |
| An import path is not `./` or `../`, has an extension, leaves the root, or names no file |
| Two bindings share a name, or a binding shares a parameter name |
| The project has no `main.rein` at the root (`project has no main.rein; it is the agent's entry point`). It is reported on `rein.toml`, at 1:1 |

A function returns on every path under these rules:

- `if` returns only when it has an `else`, and both branches return.
- `switch` returns when every case group returns and either `default` returns, or the cases cover every member.

### Warnings

| Rule |
| --- |
| A parameter is declared but never used |
| An import is never returned |
| A statement can never run (for example, code after `return`) |
| References form a cycle, such as `a -> b -> a`. A cycle acts as a loop. The checker gives one warning on every `return` of an import that lies on the cycle. A self-reference is a cycle |
| A doc tag other than `@param` (`unknown tag `@x``) |
| A function cannot be reached from `main` through imports (`x is not reachable from main`). This warning is not given when `main` is missing or has a syntax error |

## 9. Evaluation

- One run evaluates one function. By default that is `main`.
- The runtime asks for a parameter only when the taken path needs it. This is lazy evaluation.
- A run returns one of:
  - a STRING: the agent does what the text says.
  - a REF: the agent runs the target function next, using its description and inputs. The REF is the target's project path, such as `ci/fix`.
  - a request for a parameter: the agent answers the question, then runs again.
- Parameter values come from `--set name=value`. A boolean takes `true`, `false`, `yes`, or `no`. A union takes one of its members.

## 10. CLI

| Command | Purpose |
| --- | --- |
| `rein check [PATH]` | Check a project directory, or one file. Default `.`. Prints `file:line:col: error: message`. Exit code 1 when there are errors. |
| `rein run [FUNCTION] [--root DIR] [--set name=value]... [--json]` | Evaluate one step. `FUNCTION` defaults to `main`. Prints the returned string, or `@target` with the target's description and inputs. Exit code 2 when an input is needed. |
| `rein describe [FUNCTION] [--root DIR]` | Print the function's schema as JSON. `FUNCTION` defaults to `main`. Usable as an agent tool schema. |
| `rein graph [--root DIR]` | Print a Mermaid flowchart of the imports. The `main` node is drawn as a stadium shape. |
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

`options` appears only for `choice` inputs. A union parameter is reported as `choice` in the CLI and JSON output.

### `rein describe` output

```json
{
  "name": "merge_pr",
  "description": "...",
  "inputs": [
    {"name": "docsOnly", "type": "bool", "description": "..."},
    {"name": "ci", "type": "choice", "options": ["green", "red", "pending"], "description": "..."}
  ]
}
```

### Language server

- Diagnostics: the checker's errors and warnings, on each open file.
- Hover: on an import name or a returned name, the target's description and inputs. On a parameter name, its type and doc comment.
- Go to definition: on an import path, an import name, or a returned name, the target file.
- Completion: after `return `, the imported names. Inside an import path, the project files as relative paths. Elsewhere, the parameter names and keywords.
