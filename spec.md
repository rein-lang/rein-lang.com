# Rein language reference

Status: proof of concept. Private. Rules here drive the checker and the evaluator.
Design reasons and open questions live in [decisions.md](decisions.md).

Rein mimics TypeScript syntax and types, except `@` references. A reader who knows TypeScript can read a Rein file. Rein is not TypeScript: it has no imports, no loops, no variables except answers, and no `default` or `else`.

## 1. Project layout

- A flow root is a directory that contains a `main.rein` file. A flow is a flow root found through scopes (section 1a), or a directory passed to a command.
- Each function is one file with the `.rein` extension.
- Every flow root has a `main.rein`. It is the agent's entry point. The checker reports a flow root without it.
- A function name is the file path relative to the flow root, without `.rein`, using `/` as separator. `ci/fix.rein` defines `ci/fix`. The root `main.rein` defines `main`.
- The name of the `export default function` inside a file is a TypeScript identifier. It need not match the file name.
- Subdirectories are allowed.
- A reference resolves only inside the same flow root (section 4, References).
- The directory walk skips hidden directories (names starting with `.`), `target/` and `node_modules/`.
- A subdirectory with its own `main.rein` is another flow. The walk does not enter it.
- The walk follows symlinks. A symlink loop does not repeat a directory.
- A `.rein` file that cannot be read (for example, not UTF-8) is an error on that file. The file stays in the project, with empty text. The message is `cannot read file: <io error>`.
- When two sources map to the same function name, the later one wins. This applies to editor overlays only.

### 1a. Flows and scopes

Flows live in scoped `.rein/` folders, like `.claude/`. One subfolder per flow:

```text
repo/.rein/merge-pr/main.rein          project scope (the `.rein/` in the working directory or any ancestor)
~/.rein/my-pr-review/main.rein         user scope
/etc/rein/deploy-gate/main.rein        system scope (macOS also /Library/Application Support/Rein/)
```

- A flow is a folder directly under a scoped `.rein/` (or a system folder) that holds `main.rein`. A folder without `main.rein` is not a flow and is not listed.
- The flow name is the folder name.
- The project scope walks up from the working directory and uses every `.rein/` it finds. The user scope is not also a project scope when it is an ancestor of the working directory.
- Precedence on a name clash: project, then user, then system. Inside the project scope, the nearest `.rein/` up the tree wins.
- A flow that loses a clash is shadowed. `rein flows` lists it and marks it.
- `REIN_HOME` replaces the user scope folder. `REIN_SYSTEM_DIRS` replaces the system folders, as a colon-separated list. Both exist for tests and daemons.
- `rein check <dir>` and `rein run --root <dir>` still work on any flow root passed explicitly.
- Imports do not exist. References (`@./`, `@../`) stay inside the flow root.

## 2. Lexical rules

- A line comment starts with `//` and ends at the end of the line.
- A doc comment starts with `/**` and ends at the first `*/`. Its raw text is the doc block (section 4). `/**/` is an empty doc comment.
- A plain block comment `/* ... */` is not supported. The error is `use `//` for comments or `/** */` for the doc block`.
- An unterminated doc comment is an error: `unterminated doc comment; add */`.
- A STRING is text in double quotes or single quotes. Escapes: `\"`, `\'`, `\\`, `\n`. A raw newline is not allowed inside a STRING.
- A TEMPLATE is text in backticks. It may hold newlines. It can interpolate a name with `${name}`. Only a bare name is allowed inside `${}`. Escapes: `` \` ``, `\\`, `\$`, `\n`.
- A REF is `@` followed by `./` or `../`, then path names made of letters, digits and `_`, separated by `/`. It has no extension. Examples: `@./ci/fix`, `@../escalate`. A bare `@name` is an error: `references are relative: write `@./name``.
- An IDENT matches `[A-Za-z_][A-Za-z0-9_]*`.
- Keywords: `import`, `from`, `export`, `default`, `function`, `if`, `else`, `switch`, `case`, `return`, `boolean`. A keyword cannot be a name.
- Reserved words: `for`, `while`, `do`, `const`, `let`, `var`. They are not Rein. Using one gives a helpful error (section 3). A file name segment cannot be one either. `const` is allowed only for an answer (section 4, Async requests).
- `string` and `async` are names with a role in a type or a function header. `await` and `request` are names with a role in an answer.
- Operators: `===`, `!==`, `&&`, `||`, `!`, `|`, `(`, `)`, `{`, `}`, `,`, `:`, `;`, `=`.
  - `==` is an error: `use `===` instead of `==``.
  - `!=` is an error: `use `!==` instead of `!=``.
- Any other character, such as `#`, is an error: `unexpected character`.
- A UTF-8 byte order mark at the start of a file is whitespace.

## 3. Grammar

```
file        := DOC? "export" "default" "async"? "function" IDENT "(" params? ")" block
params      := param ("," param)* ","?
param       := DOC IDENT ":" type            // DOC is required; the checker reports a missing one
type        := "boolean" | "string" | "|"? STRING ("|" STRING)*
block       := "{" stmt* "}"
stmt        := if | switch | return | answer
if          := "if" "(" expr ")" block       // no else: see section 5
switch      := "switch" "(" IDENT ")" "{" clause* "}"
clause      := "case" STRING ":" (block | stmt*)   // a label with no body joins the next body
answer      := DOC "const" IDENT ":" type "=" "await" "request" "(" value ")" ";"?
return      := "return" (STRING | TEMPLATE | REF | REF "(" args ")" | IDENT "(" args ")") ";"?
args        := value ("," value)* ","?       // the args of a template call
value       := STRING | TEMPLATE | IDENT "(" args ")" | REF "(" args ")"
expr        := and ("||" and)*
and         := unary ("&&" unary)*
unary       := "!" unary | atom
atom        := "(" expr ")" | IDENT (("===" | "!==") STRING)?
```

A template call argument is a STRING or a TEMPLATE. A call cannot be an argument of a call. `value` is an argument of `request` only, so it can be a template call.

Helpful errors from the parser:

| Input | Message |
| --- | --- |
| `for`, `while`, `do` in a body | `Rein has no loops yet` |
| `let`, `var` in a body, or `const` that is not an answer | `Rein has no variables, except `/** question */ const x: type = await request(...)`` |
| `import` at the top of a file | `Rein has no imports; reference functions with `@./path` and use std functions directly` |
| `default` in a switch | `Rein has no `default`; add a `case` for every member` |
| `else` | `Rein has no `else`: end the `if` block with a return, and handle the other case after it` |
| `return;` with no value | `` `return` needs a value: a string, a template, or `@./function` `` |
| `true` or `false` in a condition or comparison | `use the boolean parameter directly` |
| a doc comment in any other place | `the doc comment must go right before `export default function`, a parameter, or a const answer` |
| `await` of a name other than `request` | `only `request` can be awaited` |
| a bare name as a return value | `expected a string, a template literal, or a reference like `@./path`` |
| a second `export default function` | `expected end of file ...; a file holds one `export default function`` |

## 4. Declarations

### Functions

- `export default function NAME(params) block` is the whole function. The file holds exactly one. `export default async function` is an async function (section 4, Async requests).
- The function doc comment sits right before `export default function`. It gives the function description. It is required, and it must not be empty.
- The parameter list may end with a comma.
- The body is a block. It must return on every path (section 5).
- An empty body is an error: `function must return something`.

### Doc comments

Rein has two kinds of doc comment. Each one holds only its own text.

- The function doc comment. It sits right before `export default function`.
- A parameter doc comment. It sits right before the parameter, inside the parameter list. It gives the question the agent must answer for that parameter.
- An answer doc comment. It sits right before the `const` of an async request (section 4, Async requests).

```ts
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
    return @./escalate;
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

### Parameters

- A parameter is `name: type`. The type is `boolean`, a union of strings, or `string`.
- `boolean` is true or false. A union is one of its string members. It needs at least 2 unique, non-empty members. A leading `|` is allowed.
- `string` is text. Only a template takes string parameters (section 4, Templates).
- Parameter names are unique within a function.

### References

A reference names another function of the project. The path is relative to the file that holds it, and it has no extension.

- `@./name` is a function in the same folder. `@./ci/fix` is `ci/fix` in the same folder. `@../escalate` is `escalate` one folder up.
- The reference resolves to `<dir of current file>/<path>.rein`. The target must stay inside the project root. `@../../outside` in `ci/fix.rein` is an error: `` `@../../outside` leaves the project root ``.
- A missing target is an error on the reference: `` cannot find function `@../x` ``.
- Function identity is the root-relative name (`ci/fix`). The CLI, JSON, graph, cycles, and reachability from `main` use it.
- `return @./path;` hands the agent to the function (section 9).
- `return @./path(args);` calls a template (section 4, Templates).
- A reference to a template without a call is an error: `` `@./tpl` is a template; call it with arguments, like `@./tpl(...)` ``.

### Std

The std library needs no import. Its names are always available: `delegate`, `askUser`, and `request`.

| Name | Kind | Signature | Text |
| --- | --- | --- | --- |
| `delegate` | template | `delegate(model: string, task: string)` | "Delegate this task to a subagent.\nModel: ${model}\nTask: ${task}". Doc: "Hand a task to a subagent, with the model to use." Params: `model`, the model the subagent runs on; `task`, what the subagent does. |
| `askUser` | template | `askUser(question: string)` | "Ask the user: ${question}". Doc: "Ask the user a question and wait for the answer." Param: `question`, the question in the user's language. |
| `request` | built in | `await request(value)` | Asks the agent to do a step, then wait for its answer (section 4, Async requests). It is not a template. |

An unknown std name is an error that lists the std names: `` `x` is not in std; std has: askUser, delegate, request ``.

### Templates

A template is a file whose function has at least one `string` parameter. It is like a Rust macro: it expands to a string.

- Every parameter is `string`, with its own doc comment.
- The body is exactly one `return` of a template literal. There is no `if`, no `switch`, no import, and no other statement.
- Every parameter is used in the template literal: `` template parameter `x` is not used; add ${x} to the template ``.
- A template is called from a function, by a std name (`delegate(...)`) or a reference (`@./templates/reply(...)`).
- Call arguments are strings or template literals. A template literal argument may interpolate a union parameter or a union answer of the caller. A boolean cannot be interpolated.
- The number of arguments must equal the number of parameters: `` `@./tpl` takes 2 arguments, got 1 ``.
- A template is never run by itself: `rein run <template>` is an error, `templates are called from functions, not run`.

Example, `templates/tell_customer.rein`:

```ts
/**
 * Tell the customer what happens next, in one sentence.
 */
export default function tellCustomer(
  /** The first part of the sentence, such as the action taken. */
  opening: string,
  /** The next step the customer can expect. */
  nextStep: string,
) {
  return `${opening} ${nextStep}`;
}
```

### Async requests

A function can ask the agent for a step and wait for an answer. The answer is a typed `const`:

```ts
export default async function answerFaq(
  /** Did you find a help article that answers the question? */
  articleFound: boolean,
) {
  if (!articleFound) {
    return @../escalate;
  }
  /** Did the customer confirm the article solved the problem? */
  const solved: boolean = await request(
    "Reply with the help article link and ask the customer if it solved the problem.",
  );
  if (solved) {
    return "Close the ticket as solved.";
  }
  return @../escalate;
}
```

- The `const` must have a doc comment, a type (`boolean` or a union of strings; not `string`), `= await request(value)`, and an optional `;`.
- `value` is a string, a template literal, or a template call. `await request(delegate("use opus model", "code review the pr"))` is valid.
- The `const` is the only `const` in Rein. It is an answer, not a variable. Its name is a parameter for the rest of its block. A name clash with a parameter or another answer is an error: `duplicate name`. Using the name before its declaration is an error: `` `x` is used before it is declared ``.
- `await` needs `export default async function`. An `async` function with no `await` is a warning: `` `async` function has no `await`; drop `async` ``.
- The answer is stateless. When the run reaches the `await`, and no value is given for the answer, the run stops with a request (section 9).

## 5. Statements

- `if (cond) { ... }` is a guard. Its block must return on every path. Otherwise the error is `every `if` block must end in a return`.
- There is no `else`. The code after an `if` handles the other case. Guard chains are the form: check a case, return, and continue.
- `switch (name) { ... }` picks one group of `case` labels by the value of a union parameter or answer.
  - Every member of the union needs a case. Otherwise the error is `switch on `x` needs a case for every member; missing: `y``.
  - There is no `default`.
  - Labels with no body join the next body: `case "a": case "b": return x;` is one group.
  - A clause body that has statements must end in a return. Otherwise the error is `case falls through; end it with return`.
- `return "text";`, `return `text ${x}`;`, `return @./fn;`, or a call ends the function. The `;` is optional.
- A statement after a `return`, or after a `switch` that always returns, is an error: `unreachable statement`.
- A function must return on every path. A body that can end without a return is an error: `every path must return something; end the function with a return`.
- A function returns something on every path: a string, a template, or a reference to another function. `return;` with no value is an error.

## 6. Conditions

- A boolean parameter or answer is used bare: `if (docsOnly)`, or negated: `if (!docsOnly)`.
- A union parameter or answer is compared with `===` or `!==`: `if (ci === "green")`.
- `!`, `&&`, `||` combine conditions. `!` binds tightest, then `&&`, then `||`. Parentheses group.
- Evaluation of `&&` and `||` stops early when the result is known.

## 7. Values

- Boolean values: `true`, `false`, `yes`, `no` on the command line. `yes` and `true` mean true. `no` and `false` mean false. Case does not matter.
- Union values: one of the declared members, as a string.
- Return values: a STRING, a TEMPLATE, a reference, or a template call.

## 8. Checker rules

When a file has a syntax error, only that error is reported for the file. It is the first syntax error. The other checks run after the syntax error is fixed.

### Errors

| Rule |
| --- |
| A function file name has a `/` part that is not an identifier, or is a keyword or reserved word (`invalid function file name`) |
| The file has no function doc comment (`missing doc comment; put /** description */ right before `export default function``) |
| The function description is empty |
| A parameter has no doc comment or an empty one |
| A doc comment has `@param` |
| The function body is empty (`function must return something`) |
| Two parameters share a name |
| A union has fewer than 2 members |
| A union has a duplicate or an empty member |
| A condition uses a union parameter bare |
| A condition compares a boolean parameter with `===` or `!==` |
| A condition or switch subject names an unknown parameter |
| `switch` subject is not a union |
| A compared value or case value is not a member of the union |
| A switch does not have a case for every member |
| Two case labels use the same value |
| A `case` body does not end in a return (`case falls through; end it with return`) |
| An `if` block does not end in a return (`every `if` block must end in a return`) |
| A path through the function ends without a return (`every path must return something`) |
| A statement follows a terminating statement (`unreachable statement`) |
| A reference does not resolve (`` cannot find function `@./x` ``), or leaves the root (`` `@../../x` leaves the project root ``) |
| A reference to a template is returned without a call |
| A reference to a function is called (`only templates can be called; return the function to hand off`) |
| A call has the wrong number of arguments (`` `@./tpl` takes 2 arguments, got 1 ``) |
| A std name is unknown, or a call names a std item that is not a template |
| A template has an `if`, a `switch`, an import, or a statement other than one template return |
| A template takes a union or a boolean parameter |
| A template parameter is not used |
| A template interpolates a boolean, or a name that is not a parameter or an answer |
| An import statement is in the file (`Rein has no imports`) |
| `await` without `export default async function` |
| `await` of a name other than `request` |
| An answer is a `string`, or has no doc comment |
| An answer name clashes with a parameter or another answer (`duplicate name`) |
| An answer is used before its declaration (`` `x` is used before it is declared ``) |
| The flow root has no `main.rein` (`project has no main.rein; it is the agent's entry point`). It is reported on `main.rein`, at 1:1 |

### Warnings

| Rule |
| --- |
| A parameter is declared but never used |
| An `async` function has no `await` |
| A reference cycle, such as `a -> b -> a`. A cycle acts as a loop. The checker gives one warning on every return of a reference that lies on the cycle |
| A doc tag other than `@param` (`unknown tag `@x``) |
| A function cannot be reached from `main` through references (`x is not reachable from main`). This warning is not given when `main` is missing or has a syntax error |

## 9. Evaluation

- One run evaluates one function. By default that is `main`.
- The runtime asks for a parameter only when the taken path needs it. This is lazy evaluation.
- A run returns one of:
  - a STRING: the agent does what the text says. A template or a template call expands to a STRING.
  - a REF: the agent runs the target function next, using its description and inputs. The REF is the target's project path, such as `ci/fix`.
  - a request for a parameter: the agent answers the question, then runs again.
  - a request for the agent to act: the agent does the instruction, then answers the `const`, then runs again.
- Parameter values come from `--set name=value`. A boolean takes `true`, `false`, `yes`, or `no`. A union takes one of its members. Setting one name twice is an error: `input `name` set twice`.
- `--set` also gives an answer its value. An answer's value is checked when the run reaches its `const`.
- A template run by itself is an error.

## 10. CLI

| Command | Purpose |
| --- | --- |
| `rein check [PATH]` | Check a project directory, a directory inside a project, or one `.rein` file. Default `.`. Prints `file:line:col: error: message` for the files under PATH. Exit code 1 when there are errors, when PATH does not exist, or when PATH is not a `.rein` file. |
| `rein run [FUNCTION] [--root DIR] [--set name=value]... [--json]` | Evaluate one step. `FUNCTION` defaults to `main`. Prints the returned string, or `next: target` with the target's description and inputs. Exit code 2 when a parameter is needed. Exit code 3 when the agent must do a request. A name given twice with `--set` is an error. |
| `rein describe [FUNCTION] [--root DIR]` | Print the function's schema as JSON. `FUNCTION` defaults to `main`. Usable as an agent tool schema. A template's parameters have type `string`. |
| `rein graph [--root DIR]` | Print a Mermaid flowchart of the references. Node ids are `n0`, `n1`, ... in name order, and the label is the function name. The `main` node is drawn as a stadium shape. |
| `rein step [--root DIR \| --flow NAME] [--entry FN] [--answer key=value]... [--stdin] [--json]` | Step the whole flow from `main`. `--flow` picks a flow by name (section 1a); `--root` and `--flow` exclude each other. The agent-facing interface (section 11). |
| `rein flows [--json]` | List the flows visible from here: name, scope, path, description, shadowed. |
| `rein agent-context [--format text\|json]` | Print the block an agent needs to use the visible flows (section 12). Prints nothing when there are none. |
| `rein hook [--caller NAME]` | The agent hook entry point (section 12). Reads one event on stdin. |
| `rein install <tool> [--project \| --user] [--dry-run]` | Write the tool's hook config so it runs `rein hook` (section 12). Only `claude-code`. |
| `rein lsp` | Run the language server over stdio. Provides diagnostics, hover, go to definition, and completion. |

Exit codes: 0 for a text or reference result, 1 for an error, 2 for a parameter needed, 3 for a request.

Columns are 1-based and count Unicode characters. The language server counts character positions in UTF-16 code units, as the LSP protocol requires.

### Input request output

Text form:

```text
need input <name>: <type> - <description>
```

`<type>` is `boolean`, `string`, or a union as TypeScript writes it, such as `"green" | "red"`.

### Request output

Text form, from `rein run` when the agent must act (exit code 3):

```text
request: <instruction>
then answer: <name>: <type> - <description>
hint: rerun with --set <name>=<value>
```

### Reference output

Text form, from `rein run` when the next step is another function:

```text
next: <function>
  <description>
  <name>: <type> - <description>
```

### `rein run --json`

Each run prints one of these objects:

```json
{"kind":"text","value":"..."}
{"kind":"ref","function":"...","description":"...","inputs":[...]}
{"kind":"need_input","input":{"name":"...","type":"boolean|union|string","options":["..."],"description":"..."}}
{"kind":"request","instruction":"...","response":{"name":"...","type":"boolean|union","options":["..."],"description":"..."}}
```

`options` appears only for `union` inputs. A boolean input has `"type":"boolean"`. A union input has `"type":"union"`, and its members are in `options`.

### `rein describe` output

```json
{
  "name": "merge_pr",
  "description": "...",
  "inputs": [
    {"name": "docsOnly", "type": "boolean", "description": "..."},
    {"name": "ci", "type": "union", "options": ["green", "red", "pending"], "description": "..."}
  ]
}
```

### Language server

- Diagnostics: the checker's errors and warnings, on each open file.
- Hover: on a reference, the target's description and inputs. On a std name, its doc. On a parameter name, its type and doc comment.
- Go to definition: on a reference, the target file.
- Completion: after `@./` or `@../`, the project functions relative to the current file. Each item replaces the whole reference token. Elsewhere, the parameter names, the std names, and keywords.

## 11. Stepping (agent interface)

`rein step` steps the whole flow in one call. It is the interface for agents. `rein run` evaluates one function, and is the debug command. The stepping logic lives in `rein_core::step`. It is pure: no I/O and no state. The CLI only parses flags, calls it, and prints.

Protocol version 1. A request and a response are JSON objects, each with a `version` field. A daemon or another transport can carry the same objects unchanged.

### Request

```json
{"version": 1, "entry": "main", "answers": {"main.vip": "no"}}
```

```json
{"version": 1, "flow": "support-ticket", "answers": {"main.vip": "no"}}
```

- `version`: default `1`. Another value is an error. Adding the optional `flow` field did not change the version.
- `flow`: optional. The name of a visible flow (section 1a). The CLI resolves it to a flow root and steps that root. Give `flow` or a root, not both.
- `entry`: the function to start from, by its path. Default `main`.
- `answers`: the answers so far. Each key is `<function path>.<name>`, where `name` is a parameter or a `const` answer, such as `merge_pr.ci` or `answer/faq.solved`. Each value is as `--answer` takes it: `yes`, `no`, or a union member. Default `{}`.

### Response

`kind` is one of four values. Every response has `version`, `answers` (the answers the request gave, echoed back), and `trace` (the function paths visited, in order).

| `kind` | Fields | Meaning | Exit code |
| --- | --- | --- | --- |
| `question` | `key`, `function`, `name`, `type` (`boolean` or `union`), `options` (union members, else `null`), `description` | Answer `key`, then step again. | 2 |
| `request` | `key`, `function`, `instruction`, `response` (`name`, `type`, `options`, `description`) | Do `instruction`, then answer `key`, then step again. | 3 |
| `done` | `instruction` | The flow ended. Do `instruction`. | 0 |
| `error` | `message`, `key` (or `null`), `diagnostics` (`file`, `line`, `column`, `message`) | The request is not valid. Fix it and step again. | 1 |

### Stepping rules

- The step starts at `entry`. It evaluates the function with the answers whose key names that function. The lazy rules of section 9 apply.
- A reference is followed in the same call. Only a question, a request, a final instruction, or an error ends a call. The `trace` shows each hop.
- A flow may visit at most 64 functions in one call. A flow that goes further is an error: `flow did not finish in 64 steps (reference cycle?)`.
- An answer is checked before the flow runs. An unknown key is an error, and the error names the key. A value outside the type is an error, and the message lists the accepted values.
- A string parameter cannot be answered. Only a template takes one.
- A project with checker errors is refused. The error lists the diagnostics. Warnings do not block a step.
- A template cannot be the entry.

### Statelessness

The response depends only on the project and the request. The runtime keeps nothing between calls, so the caller sends every answer so far. A harness adds the key from the last response to `answers`, then steps again. The same project and the same request always give a byte-equal response. The code uses no clock, no randomness, and no global state.

### CLI

```text
rein step --root examples/.rein/support-ticket --answer main.vip=no --json
rein step --root examples/.rein/support-ticket --stdin < request.json
rein step --flow support-ticket --json
```

`--stdin` reads one request as JSON, and then the output is always JSON. Do not combine `--stdin` with `--entry` or `--answer`. `--answer` repeats for each key. An answer key may be given once.

## 12. Agent integration

Rein puts itself into an agent session with a hook. The hook is built on polyhook, so the same hook code works across agents.

- `rein install claude-code --project` writes `.claude/settings.json`. `--user` writes `~/.claude/settings.json`. The merge keeps every other key and every other hook. A second run adds nothing. `--dry-run` prints the file and writes nothing.
- The hook runs `rein hook --caller claude-code` on two events: `SessionStart` and `UserPromptSubmit`.
- `SessionStart` marks the session as pending. It writes nothing to the agent.
- The first `UserPromptSubmit` of a pending session gets the agent context (`rein agent-context`) as `additionalContext`. Later prompts of that session get nothing. A `SessionStart` from a resume, clear or compact makes the next prompt pending again.
- Every other event is a no-op: no output, exit 0. Errors are a no-op too, with the reason on stderr. The hook never blocks the agent.
- Other tools are not supported yet. Their config file location is not in polyhook's `tools.toml`.

The context block says what flows are, lists the visible flows with their descriptions, and shows the stepping rule from section 11.

