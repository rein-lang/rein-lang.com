# Rein language reference

Status: proof of concept. Private. Rules here drive the checker and the evaluator.
Design reasons and open questions live in [decisions.md](decisions.md).

Rein mimics TypeScript syntax and types, except `@` references. A reader who knows TypeScript can read a Rein file. Rein is not TypeScript: it has no imports, no loops, no global scope, and no `default` or `else`. A function gets its values only from its parameter and its answers.

## 1. Project layout

- A flow root is a directory that contains a `main.rein` file. A flow is a flow root found through scopes (section 1a), or a directory passed to a command. A program can also be one `.rein` file: its folder is the flow root and its name is the entry (section 1a).
- Each function is one file with the `.rein` extension.
- A shared struct is one file named `<name>.struct.rein` (section 4, Structs). It is not a function. `rein graph`, the reachability warning, and workspace symbols as functions leave it out. `rein show` prints it.
- Every flow root has a `main.rein`. It is the agent's entry point. The checker reports a flow root without it. A program run from its own entry file needs none (section 1a).
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

Programs (flows) live in scopes: project, user, and system. The folders, the manifest, precedence, and shadowing are in [Install a program](docs/install-programs.md).

- `rein check <dir>`, `rein eval --root <dir>` and `rein run --root <dir>` still work on any flow root passed explicitly.
- A program is also one `.rein` file, the file form. `rein step <file.rein>`, `rein run <file.rein>` and `rein check <file.rein>` take it: the file's folder is the flow root, and the file name without `.rein` is the entry. No folder, manifest or scope is needed. Scopes and `rein list` only find programs by name.
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
- `string`, `async` and `interface` are names with a role in a type, a function header, or a struct. `await` and `request` are names with a role in an answer.
- Operators: `===`, `!==`, `&&`, `||`, `!`, `|`, `(`, `)`, `{`, `}`, `,`, `:`, `;`, `=`.
  - `==` is an error: `use `===` instead of `==``.
  - `!=` is an error: `use `!==` instead of `!=``.
- Any other character, such as `#`, is an error: `unexpected character`.
- A UTF-8 byte order mark at the start of a file is whitespace.

## 3. Grammar

```
file        := item*                         // one function, or one struct in a `.struct.rein` file
item        := DOC? ("export" "default"?)? "interface" IDENT "{" field* "}"    // a struct (section 4, Structs)
             | DOC? "export" "default" "async"? "function" IDENT "(" params? ")" block
params      := param ("," param)* ","?       // more than one param is a checker error
param       := DOC IDENT ":" type            // a scalar parameter. DOC is required; the checker reports a missing one
             | "{" IDENT ("," IDENT)* ","? "}" ":" (IDENT | REF)   // a struct parameter, destructured
field       := DOC IDENT ":" type (";" | ",")?   // DOC is required; the checker reports a missing one
type        := "boolean" | "string" | "|"? STRING ("|" STRING)*
block       := "{" stmt* "}"
stmt        := if | switch | return | answer
if          := "if" "(" expr ")" block       // no else: see section 5
switch      := "switch" "(" IDENT ")" "{" clause* "}"
clause      := "case" STRING ":" (block | stmt*)   // a label with no body joins the next body
answer      := DOC "const" IDENT ":" type "=" "await" "request" "(" value ")" ";"?
return      := "return" (STRING | TEMPLATE | REF | REF "(" args ")" | IDENT "(" args ")") ";"?   // REF with args: a template call or a hand-off
args        := arg ("," arg)* ","?           // the args of a call or a hand-off
arg         := IDENT "=" value               // named, as in Python. A value with no name is a checker error
value       := STRING | TEMPLATE | IDENT | IDENT "(" args ")" | REF "(" args ")"
expr        := and ("||" and)*
and         := unary ("&&" unary)*
unary       := "!" unary | atom
atom        := "(" expr ")" | IDENT (("===" | "!==") STRING)?
```

A call argument is a STRING, a TEMPLATE, a bare name of a `string` parameter of the caller, or a template call. A hand-off cannot be an argument of a call.

Every argument has a name, as in Python: `name=value`. The name is a parameter of the callee: its scalar parameter, or a field of its struct parameter. The order of the arguments does not matter. A positional argument is a checker error, and no flag allows it. A parameter is given once.

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
| a doc comment in any other place | `the doc comment must go right before `export default function`, an `interface`, a parameter, a field, or a const answer` |
| `x: Name` or `x: @./name` as a parameter | `` a struct parameter is destructured: write `{ field, ... }: Name` `` |
| a doc comment before a struct parameter | `` a struct parameter has no doc comment; document each field in its `interface` `` |
| `await` of a name other than `request` | `only `request` can be awaited` |
| a bare name as a return value | `expected a string, a template literal, or a reference like `@./path`` |
| a second `export default function` | `expected end of file ...; a file holds one `export default function`` |

## 4. Declarations

### Functions

- `export default function NAME(param) block` is the whole function. The file holds exactly one. `export default async function` is an async function (section 4, Async requests).
- The function doc comment sits right before `export default function`. It gives the function description. It is required, and it must not be empty. There is no flag to skip this rule. `rein check`, `rein eval`, `rein step`, `rein run` and the MCP tools all refuse a function without one.
- The function has zero parameters or one (section 4, Parameters). The parameter may end with a comma.
- The body is a block. It must return on every path (section 5).
- An empty body is an error: `function must return something`.
- A function has at most 40 lines. Its lines run from the `export default` line to its closing `}`, both included. Every line counts, blank and comment lines too. The doc comment above the function and any `interface` outside those lines do not count.
- A program sets another limit with `maxFunctionLines` in its `rein.json`: a positive integer, such as `"maxFunctionLines": 60`. A `.struct.rein` file is not a function, so the limit does not apply to it.

### Doc comments

Rein has four kinds of doc comment. Each one holds only its own text.

- The function doc comment. It sits right before `export default function`.
- A parameter doc comment. It sits right before the parameter, inside the parameter list. It gives the question the agent must answer for that parameter.
- A field doc comment. It sits right before the field, inside the `interface`. It gives the question for that field, or the text the caller passes. A shared struct also has a struct doc comment, right before `export default interface`.
- An answer doc comment. It sits right before the `const` of an async request (section 4, Async requests).

```ts
interface Ticket {
  /** What kind of ticket is it? */
  category: "billing" | "bug" | "question";
  /**
   * Is the customer a VIP?
   * Check the account tier in the CRM.
   */
  vip: boolean;
}

/**
 * Route a new support ticket to the right handling.
 */
export default function handleTicket({ category, vip }: Ticket) {
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
- An empty function description is an error. An empty parameter doc comment is an error: `parameter `x` needs a doc comment: /** question */ x: ...`. A field gives `field `x` needs a doc comment: /** question */ x: ...`.

### Parameters

- A function has zero parameters or one. Two or more is an error: `` a function takes one parameter; put `a` and `b` in a struct ``.
- The parameter is a scalar or a struct.
- A scalar parameter is `name: type`. The type is `boolean`, a union of strings, or `string`.
- `boolean` is true or false. A union is one of its string members. It needs at least 2 unique, non-empty members. A leading `|` is allowed.
- `string` is text. It is an input: the caller passes its value, and the agent is never asked for it (section 4, Inputs).
- A struct parameter is destructured: `{ a, b }: Name`. The braces name every field of the struct, each one once. The body reads each field by its name, as it reads a scalar parameter.
- Errors on the braces: `` `z` is not a field of `Name`; fields are a, b ``, `` destructure every field of `Name`; missing: `b` ``, and `` `a` is destructured twice ``.
- In the rest of this reference, a parameter is the scalar parameter or a field of the struct parameter. Its name is unique within the function. Answer keys, `--set`, `--input`, `rein describe` and the graph use the field names.

### Structs

A struct is a TypeScript `interface`: a list of fields. A field is like a scalar parameter: a doc comment, a name and a type (`boolean`, `string`, or a union). A field ends with `;`, `,`, or nothing. A field cannot be a struct. Rein has one struct form, `interface`. It has no `type X = { ... }`.

A struct is inline or shared.

- An inline struct is an `interface` in the file of the function. It is the input of that function only. No other file can name it.
- An inline struct cannot be exported. Error: `` input struct `Input` cannot be exported; to share it, move it to its own `.struct.rein` file ``.
- The function names its inline struct: `({ a, b }: Input)`. A missing one is an error: `` cannot find struct `Input`; declare `interface Input { ... }` in this file ``.
- An inline struct that the function does not take gives a warning: `` unused struct `X`; an inline struct is the input of the function in its file ``.
- A shared struct is a file `<name>.struct.rein`. It holds one `export default interface` and nothing else. Error: ``a `.struct.rein` file holds one `export default interface` and nothing else``.
- A shared struct needs a doc comment: `` missing doc comment on struct `Name`; put /** description */ right before `export default interface` ``.
- A function names a shared struct with a reference: `({ a, b }: @./message)` names the struct of `message.struct.rein` in the same folder. The reference rules apply (section 4, References): the path is relative, has no extension, and stays inside the root. A missing file is an error: `` cannot find struct `@./message`; a shared struct is a `message.struct.rein` file ``.
- When two functions take the same struct, use a shared struct. An inline struct belongs to one function.
- A function reference, such as `return @./message;`, never names a `.struct.rein` file.

Example: `templates/message.struct.rein`, a shared struct that two templates take.

```ts
/**
 * One sentence for the customer: what happened, then what comes next.
 */
export default interface Message {
  /** The first part of the sentence, such as the action taken. */
  opening: string;
  /** The next step the customer can expect. */
  nextStep: string;
}
```

`templates/tell_customer.rein` takes it. `templates/close_ticket.rein` takes it the same way.

```ts
/**
 * Tell the customer what happens next, in one sentence.
 */
export default function tellCustomer({ opening, nextStep }: @./message) {
  return `${opening} ${nextStep}`;
}
```

A caller gives each field by name: `@../templates/tell_customer(opening="...", nextStep="...")`.

### References

A reference names another function of the project. The path is relative to the file that holds it, and it has no extension.

- `@./name` is a function in the same folder. `@./ci/fix` is `ci/fix` in the same folder. `@../escalate` is `escalate` one folder up.
- The reference resolves to `<dir of current file>/<path>.rein`. The target must stay inside the project root. `@../../outside` in `ci/fix.rein` is an error: `` `@../../outside` leaves the project root ``.
- A missing target is an error on the reference: `` cannot find function `@../x` ``.
- Function identity is the root-relative name (`ci/fix`). The CLI, JSON, graph, cycles, and reachability from `main` use it.
- `return @./path;` hands the agent to the function (section 9). The function must have no `string` parameter.
- `return @./path(name=value);` calls a template (section 4, Templates). It hands the agent to a normal function with values (section 4, Inputs).
- A reference to a template without a call is an error: `` `@./tpl` is a template; call it with arguments, like `@./tpl(...)` ``.

### Std

The std library needs no import. Its names are always available: `delegate`, `askUser`, and `request`.

| Name | Kind | Signature | Text |
| --- | --- | --- | --- |
| `delegate` | template | `delegate({ model, task }: Input)` | "Delegate this task to a subagent.\nModel: ${model}\nTask: ${task}". Doc: "Hand a task to a subagent, with the model to use." Its input is an inline struct. Fields: `model`, the model the subagent runs on; `task`, what the subagent does. A call is `delegate(model="...", task="...")`. |
| `askUser` | template | `askUser(question: string)` | "Ask the user: ${question}". Doc: "Ask the user a question and wait for the answer." Param: `question`, the question in the user's language. |
| `request` | built in | `await request(value)` | Asks the agent to do a step, then wait for its answer (section 4, Async requests). It is not a template. |

An unknown std name is an error that lists the std names: `` `x` is not in std; std has: askUser, delegate, request ``.

### Templates

A template is a file whose function meets every rule below. It is like a Rust macro: it expands to a string. Any other function is a normal function. A normal function may mix `string` fields with boolean and union fields in its struct.

- It has a parameter. The parameter is a `string`, or a struct whose fields are all `string`. Each one has its own doc comment.
- The body is exactly one `return` of a template literal. There is no `if`, no `switch`, no import, and no other statement.
- Every parameter is used in the template literal: `` template parameter `x` is not used; add ${x} to the template ``.
- A template is called from a function, by a std name (`delegate(...)`) or a reference (`@./templates/reply(...)`).
- A template call is a value, not a step. It adds no hop to the `rein step` trace.
- Call arguments are named (`name=value`) and their values are strings, template literals, bare names of a `string` parameter of the caller, or template calls. A template literal argument may interpolate a union parameter or a union answer of the caller. A boolean cannot be interpolated.
- Every parameter is given once, by name: `` missing argument `b` in call to `@./tpl`; write `b=value` ``.
- A template is never run by itself: `rein eval <template>` is an error, `templates are called from functions, not run`.

Section 4, Structs, shows a template, `templates/tell_customer.rein`, that takes a shared struct.

### Inputs

A `string` parameter of a normal function is an input. The caller passes its value. The agent is never asked for it.

- An input is used only in a template literal, as `${name}`, or as a bare name argument of a call.
- A condition or a switch subject cannot read an input. Error: `` `pr` is a string input; a condition cannot read it ``.
- `return @./merge(pr=pr);` hands the agent to a normal function and passes the value. The arguments bind by name to the target's `string` parameters.
- An argument is `name=value`, where the value is a STRING, a template literal, or a bare name of a `string` parameter of the caller. Any other bare name is an error: `` `x` is not a string input ``.
- Every `string` parameter of the target is given by name, once. `return @./merge;` to that function is an error: `` `@./merge` takes 1 argument, got 0 ``.
- Arguments to a function with no `string` parameter are an error: `` `@./x` takes no arguments; return it without a call ``.

Example, `main.rein` and `merge.rein`. `main` passes `pr` to `merge`. `merge` uses it in a template literal. `merge` also asks the agent for `ci`, a union, so it is a normal function.

```ts
/**
 * Merge the pull request when it is ready.
 */
export default function main(
  /** The pull request link. */
  pr: string,
) {
  return @./merge(pr=pr);
}
```

```ts
interface Input {
  /** The pull request link. */
  pr: string;
  /** What is the CI status of the PR? */
  ci: "green" | "red" | "pending";
}

/**
 * Merge the pull request when CI is green.
 */
export default function merge({ pr, ci }: Input) {
  if (ci === "green") {
    return `Merge ${pr}. Then delete its branch.`;
  }
  return "Wait for CI, then start this program again.";
}
```

### Async requests

A function can ask the agent for a step and wait for an answer. The answer is a typed `const`:

```ts
/** Answer a FAQ ticket with a help article, or escalate it. */
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
- `value` is a string, a template literal, or a template call. `await request(delegate(model="use opus model", task="code review the pr"))` is valid.
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
- A `string` parameter cannot be read by a condition or a switch (section 4, Inputs).
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
| The file has no function doc comment (`missing doc comment on `NAME`; put /** description */ right before `export default function``). A `//` line comment does not count. |
| The function description is empty (`empty description on `NAME`; write the function description in the doc comment`). A doc block with only `@` tags is empty. |
| A parameter has no doc comment or an empty one |
| A doc comment has `@param` |
| The function body is empty (`function must return something`) |
| A function has more lines than the limit (`` function `NAME` has N lines; the limit is M. Move part of it into its own function and call it with `@./name` ``). It points at the header, `export default function NAME` |
| `rein.json` sets `maxFunctionLines` to a value that is not a positive integer (`` `maxFunctionLines` in rein.json must be a positive integer, such as 40; found VALUE ``). It points at `rein.json`, and the limit stays 40 |
| Two parameters share a name |
| A function has two or more parameters (`` a function takes one parameter; put `a` and `b` in a struct ``) |
| A struct parameter names a field that its struct does not have, leaves a field out, or names a field twice |
| A struct parameter names an inline struct that the file does not declare, or a shared struct that does not resolve |
| An inline struct is exported |
| A field has no doc comment (`` field `x` needs a doc comment: /** question */ x: ... ``), two fields share a name, or a field union is not valid |
| A `.struct.rein` file holds a function, a second struct, or a struct that is not `export default` |
| A shared struct has no doc comment, or an empty one |
| A `.struct.rein` file name has a `/` part that is not an identifier (`invalid struct file name`) |
| A union has fewer than 2 members |
| A union has a duplicate or an empty member |
| A condition uses a union parameter bare |
| A condition compares a boolean parameter with `===` or `!==` |
| A condition or switch subject names an unknown parameter |
| A condition or switch subject names a `string` parameter (`` `pr` is a string input; a condition cannot read it ``) |
| A bare name in an argument is not a `string` parameter of the caller (`` `x` is not a string input ``) |
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
| A call or a hand-off has a positional argument (`` missing argument `a` in call to `@./tpl`; write `a=value` ``) |
| A call or a hand-off names an argument that is not a parameter (`` `c` is not a parameter of `@./tpl`; parameters are a, b ``) |
| A call or a hand-off gives one parameter twice (`` `a` is given twice in call to `@./tpl`; give each name once ``) |
| A call or a hand-off leaves a parameter out (`` missing argument `b` in call to `@./tpl`; write `b=value` ``) |
| A call or a hand-off gives arguments to a function with no `string` parameter (`` `@./x` takes no arguments; return it without a call ``) |
| A call to a function that is not a template is not the value of a `return`, for example inside an argument or a `request` value (`A hand-off cannot be an argument of a call.`) |
| A std name is unknown, or a call names a std item that is not a template |
| A template has an `if`, a `switch`, an import, or a statement other than one template return |
| A template parameter is not used |
| A template interpolates a boolean, or a name that is not a parameter or an answer |
| An import statement is in the file (`Rein has no imports`) |
| `await` without `export default async function` |
| `await` of a name other than `request` |
| An answer is a `string`, or has no doc comment |
| An answer name clashes with a parameter or another answer (`duplicate name`) |
| An answer is used before its declaration (`` `x` is used before it is declared ``) |
| The flow root has no `main.rein` (`project has no main.rein; it is the agent's entry point`). It is reported on `main.rein`, at 1:1. A step reports it only when its entry is missing too |

### Warnings

| Rule |
| --- |
| A parameter is declared but never used |
| An inline struct is not the parameter of the function in its file (`unused struct`) |
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
- Parameter values come from `--set name=value`. A boolean takes `true`, `false`, `yes`, or `no`. A union takes one of its members. A `string` parameter takes any text, and it is never a question. Setting one name twice is an error: `input `name` set twice`.
- `--set` also gives an answer its value. An answer's value is checked when the run reaches its `const`.
- A template run by itself is an error.
- A hand-off with arguments carries their values, by name, to the target. The agent runs the target with them (section 4, Inputs).

## 10. CLI

| Command | Purpose |
| --- | --- |
| `rein check [PATH]` | Check a project directory, a directory inside a project, or one `.rein` file. Default `.`. Prints `file:line:col: error: message` for the files under PATH. Exit code 1 when there are errors, when PATH does not exist, or when PATH is not a `.rein` file. |
| `rein eval [FUNCTION] [--root DIR] [--set name=value]... [--json]` | Evaluate one step. `FUNCTION` defaults to `main`. Prints the returned string, or `next: target` with the target's description and inputs. Exit code 2 when a parameter is needed. Exit code 3 when the agent must do a request. `--set` also gives a value to a `string` parameter. A name given twice with `--set` is an error. |
| `rein run [NAME] [--root DIR] [--entry FN] [--json]` | Run a program as a live process. Writes one step per line, reads one answer per line on stdin. See [interface.md](interface.md). |
| `rein describe [FUNCTION] [--root DIR]` | Print the function's schema as JSON. `FUNCTION` defaults to `main`. Usable as an agent tool schema. A template's parameters have type `string`. |
| `rein graph [NAME \| --root DIR] [--refs] [--format mermaid\|dot\|json] [-o FILE]` | Print the program graph. `NAME` is a program name (section 1a) or a `.rein` file. The default is the project around the current directory. The default view is the decision flow: one node per function, per question (its text, then `name: type`), per request, and per outcome (`done` text or `delegate`). An edge from a question has the answer as its label: `yes`, `no`, or union members. A hand-off edge has its named arguments. A dashed edge goes to a template that a call uses. `--refs` draws only one node per function and one edge per reference. Node ids are `f0`, `f1`, ... for the functions in name order, and `f<i>_<j>` for the steps of function `i` in source order, so the output is stable. The entry is drawn as a stadium shape. `--format` is `mermaid` (default), `dot` (Graphviz), or `json`. `-o FILE` writes to FILE. A `.svg` or `.png` FILE is rendered from DOT by Graphviz `dot`; when `dot` is not on PATH, the command fails and names it. JSON: `{version, view, entry, nodes: [{id, kind, function, label, entry?, name?, type?}], edges: [{from, to, kind, label?, args?: [{name, value}]}]}`. Node kinds: `function`, `question`, `condition`, `request`, `done`, `delegate`, `unresolved`. Edge kinds: `flow`, `handoff`, `template`. |
| `rein step [--root DIR \| --flow NAME] [--entry FN] [--answer key=value]... [--input name=value]... [--stdin] [--json]` | Step the whole flow from `main`. `--flow` picks a flow by name (section 1a); `--root` and `--flow` exclude each other. `--input` gives a value to a `string` parameter of the entry function. The agent-facing interface (section 11). |
| `rein list [--json]` | List the programs visible from here: name, scope, path, description, shadowed, entry, and the first step. `rein flows` is an alias. |
| `rein show <NAME>` | Print a program's manifest and every `.rein` file, entry first. |
| `rein serve --mcp` | The MCP host. Holds live runs in memory. Tools: `rein_programs`, `rein_show`, `rein_start`, `rein_answer`, `rein_status`, `rein_stop`, `rein_list`. See [interface.md](interface.md). |
| `rein agent-context [--format text\|json]` | Print the block an agent needs to use the visible flows (section 12). Prints nothing when there are none. |
| `rein hook [--caller NAME]` | The agent hook entry point (section 12). Reads one event on stdin. |
| `rein install [-g] <args>...` | Run `pnpm add --ignore-scripts <args>` in the npm folder: the repo's `rein/npm/`, or the user's with `-g`. See [Install a program](install-programs.md). |
| `rein uninstall [-g] <args>...` | Run `pnpm remove <args>` in the same folder rules. |
| `rein update [-g] [<args>...]` | Run `pnpm update --ignore-scripts <args>` in the same folder rules. |
| `rein lsp` | Run the language server over stdio. See [Language server](#language-server) for its features. |

Exit codes: 0 for a text or reference result, 1 for an error, 2 for a parameter needed, 3 for a request.

Columns are 1-based and count Unicode characters. The language server counts character positions in UTF-16 code units, as the LSP protocol requires.

### Input request output

Text form:

```text
need input <name>: <type> - <description>
```

`<type>` is `boolean`, `string`, or a union as TypeScript writes it, such as `"green" | "red"`.

### Request output

Text form, from `rein eval` when the agent must act (exit code 3):

```text
request: <instruction>
then answer: <name>: <type> - <description>
hint: rerun with --set <name>=<value>
```

### Reference output

Text form, from `rein eval` when the next step is another function:

```text
next: <function>
  <description>
  <name>: <type> - <description>
```

### `rein eval --json`

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

The code is in `crates/rein/src/lsp/`, one module per feature. It reads the tree from `rein_core`'s parser and resolves references with `rein_core::project`. A reference cannot leave its program, so every feature below stays in one program, except workspace symbols.

- Diagnostics: the checker's errors and warnings, on each open file.
- References: on a reference, on a function's name, or anywhere else in a file, every `@./` reference to that function. On a parameter or a `name=` argument, its uses and `name=` in each call to its function. On a struct type or a struct name, every parameter type that names the struct. On a field, its place in `{ }` and its uses in each function that takes the struct, and `name=` in each call to those functions. The declaration is included when the client asks for it.
- Code lens: `N references` above each function, and above a shared struct the count of parameter types that name it. Its command, `rein.showReferences`, carries the file URI, the position, and the locations.
- Go to definition: a reference goes to the name of its function. A parameter or `name=` goes to the parameter. A struct type goes to its `interface`, in the same file or in its `.struct.rein` file. A field in `{ }`, in the body, or as `name=` goes to the field in its `interface`. A std template goes to its source, which the server writes to `rein-std/` in the temp directory. `request` is built in, so it has no source.
- Call hierarchy: incoming calls are the functions that reference the function, outgoing calls are the functions it references. Each call has the spans of its references.
- Hover: on a reference or a function's name, the description and the parameters. On a parameter, a field or `name=`, its type and question. On a struct type or a struct name, its doc and its fields. On a std name, its doc.
- Rename: a parameter renames its declaration, its uses, and `name=` in each call. A field renames it in its `interface`, in `{ }` and the body of each function that takes the struct, and `name=` in each call. A function renames its file in the same folder, the last segment of each reference, and the name after `export default function` when it was the file name. An inline struct renames its `interface` and the parameter type. A shared struct renames its file to `<new>.struct.rein`, the last segment of each `@./` type, and its `interface` name when it was the file name. A function or shared struct rename needs a client that can rename files.
- Document symbols: the function, with its parameters and `const` answers, then each struct with its fields.
- Workspace symbols: every function of every program under the workspace folders and of the open files. A function's name is its project path. A shared struct is a struct symbol, named by its path without `.struct`. Its container is the program folder.
- Completion: after `@./` or `@../`, the project functions relative to the current file, or after `}: ` the shared structs. Each item replaces the whole reference token. Inside call parentheses, where an argument name goes, the parameters (the fields of a struct parameter) not given yet, as `name=`. After `x === "` or `case "`, the members of the union, each replacing the whole literal. Elsewhere, the parameter names, the std names, and keywords.
- Signature help: inside call parentheses, the callee's parameters (the fields of a struct parameter), with the current one active.
- Quick fixes: add a doc comment to a function or a parameter that has none, and add `name=` to a positional argument.

## 11. Stepping (agent interface)

`rein step` steps the whole flow in one call. It is the interface for agents. `rein eval` evaluates one function, and is the debug command. Live runs (`rein run`, `rein serve --mcp`) call the same logic and keep the answers above it; see [interface.md](interface.md). The stepping logic lives in `rein_core::step`. It is pure: no I/O and no state. The CLI only parses flags, calls it, and prints.

Protocol version 1. A request and a response are JSON objects, each with a `version` field. A daemon or another transport can carry the same objects unchanged.

### Request

```json
{"version": 1, "entry": "main", "answers": {"main.vip": "no"}}
```

```json
{"version": 1, "flow": "support-ticket", "answers": {"main.vip": "no"}}
```

```json
{"version": 1, "entry": "main", "inputs": {"pr": "https://example.com/pr/1"}, "answers": {}}
```

- `version`: default `1`. Another value is an error. Adding the optional `flow` and `inputs` fields did not change the version.
- `flow`: optional. The name of a visible flow (section 1a). The CLI resolves it to a flow root and steps that root. Give `flow` or a root, not both.
- `entry`: the function to start from, by its path. Default `main`.
- `inputs`: optional. An object. Each key is the name of a `string` parameter of the entry function, and each value is its text. Default `{}`.
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

- The step starts at `entry`. It evaluates the function with its inputs and the answers whose key names that function. The lazy rules of section 9 apply.
- A reference is followed in the same call. Only a question, a request, a final instruction, or an error ends a call. The `trace` shows each hop.
- A flow may visit at most 64 functions in one call. A flow that goes further is an error: `flow did not finish in 64 steps (reference cycle?)`.
- An answer is checked before the flow runs. An unknown key is an error, and the error names the key. A value outside the type is an error, and the message lists the accepted values.
- A string parameter cannot be answered. It is an input: give it in `inputs`.
- A `string` parameter of the entry function that has no key in `inputs` is an error: `` missing input `pr`; give it with --input pr=<value> ``.
- A key in `inputs` that is not a `string` parameter of the entry function is an error: `` unknown input `x` ``.
- A project with checker errors is refused. The error lists the diagnostics. Warnings do not block a step.
- A template cannot be the entry.

### Statelessness

The response depends only on the project and the request. The runtime keeps nothing between calls, so the caller sends every answer so far. A harness adds the key from the last response to `answers`, then steps again. The same project and the same request always give a byte-equal response. The code uses no clock, no randomness, and no global state.

### CLI

```text
rein step --root examples/rein/support-ticket --answer main.vip=no --json
rein step examples/rein/support-ticket/main.rein --answer main.vip=no --json
rein step --root examples/rein/support-ticket --stdin < request.json
rein step --flow support-ticket --json
```

The program is a `.rein` path or a `rein list` name, and it may be given as the positional argument. A path is the program itself: its folder is the root and its name is the entry (section 1a). `--flow` and `--root` still work.

`--stdin` reads one request as JSON, and then the output is always JSON. Do not combine `--stdin` with `--entry`, `--answer` or `--input`. `--answer` repeats for each key. An answer key may be given once. `--input` repeats for each name.

## 12. Agent integration

`rein hook` is the runtime side of an agent hook. The hook is built on polyhook, so the same hook code works across agents. Rein does not write the agent's hook config. There is no installer for it.

- The hook runs `rein hook --caller claude-code` on two events: `SessionStart` and `UserPromptSubmit`.
- `SessionStart` marks the session as pending. It writes nothing to the agent.
- The first `UserPromptSubmit` of a pending session gets the agent context (`rein agent-context`) as `additionalContext`. Later prompts of that session get nothing. A `SessionStart` from a resume, clear or compact makes the next prompt pending again.
- Every other event is a no-op: no output, exit 0. Errors are a no-op too, with the reason on stderr. The hook never blocks the agent.
- Other tools have no hook yet.

The context block says what flows are, lists the visible flows with their descriptions, and shows the stepping rule from section 11.

