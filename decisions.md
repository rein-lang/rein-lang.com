# Decisions

Status: proof of concept. Private.
Language rules live in [spec.md](spec.md). This file holds the reasons and the open work.

## Facts from the owner

1. Rein is a programming language to describe agent flows. Instead of managing the harness or a graph (like Hermes, LangGraph or Deep Agents), Rein gives the agent instructions for what to do.
2. No `for` or `while` for now. Only `if` and `switch`.
3. Each function is one file.
4. Example: when the agent wants to merge a PR, it runs the `merge_pr` function. Its input is, for example, "is this a docs-only update?". Body: if yes, return "approved"; if not, return a reference to another function.
5. Each function has a description.
6. A return value is always a string or a reference to another function.
7. This repo is a proof of concept, private for now. It holds everything known for a fact so far: the language server, a VS Code extension, and several example projects.
8. Use Rust as much as possible. The core, the CLI and the language server are Rust. The VS Code extension is a thin JS client.
9. Rein mimics TypeScript types and syntax as much as possible (for example `|` unions for choices), because TypeScript is very good to write and read.
10. Every project has a `main.rein`; it is the agent's entry point. A program run from its own file needs none (fact 25).
11. Each component holds its own docs: the function has its doc comment, and each input has its own doc comment right before it.
12. Rein is as strict as possible: every case is handled explicitly. There is no `default` and no `else`. Every `if` block returns, and the code after it handles the other case.
13. Templates work like Rust macros: they expand to a string. A standard library ships templates such as `delegate(model, task)`.
14. A function can send the agent an async request and branch on the typed response (`const x: boolean = await request(...)`).
15. Every function returns something on every path: a string, a template, or a reference to another function.
16. No import statements: functions reference each other with relative paths (`@./path`, `@../path`).
17. The runtime is stateless: each step takes the project and all answers so far and returns the next question, request or final instruction. The CLI is interface-agnostic; a daemon can wrap the same request/response types later.
18. A program is its entry file (fact 25). Scoped folders are only a catalog: project (`rein/`), user (the user programs folder, filled by `rein install -g`), system; the closest scope wins. `rein list` shows the catalog. The agent finds a program there by name, not by navigating a dot-folder. (Amended 2026-11-12.)
19. Rein injects itself into agent sessions with a SessionStart hook, built on polyhook so it works across agents.
20. A program holds its state, like a computer app. The agent does not enter every answer again.
21. A program takes inputs, such as a pull request link.
22. No global scope. A function gets a value only from its parameters. The caller passes it.
23. Templates are permanent, and user templates (`templates/*.rein`) stay, not only the std `delegate` and `askUser`. A template call is a value, not a step: it nests as an argument and adds no hop to the `rein step` trace. Template arguments are always checked: the count equals the parameter count, every parameter is used in the template literal, and every parameter has its own doc comment. (2026-11-12)
24. Call arguments are named, as in Python: `f(name=value, other=value)`. A positional argument is a compile error, and no flag allows it. Order does not matter. Each name is a parameter, given once. A name says what a value is, and it still works when a parameter moves. (2026-11-12)
25. A program is its entry file. If you want a pluggable program, use the files: give any `.rein` file to the CLI and run it from there. No `rein/` folder, manifest or scope is needed. A compiled one-file program is a planned tool (see Planned). (2026-11-12)
26. A function takes one parameter at most. The parameter is a scalar or a struct. An inline struct lives in the function's file, is that function's input, and cannot be exported. A struct that more than one function needs is a standalone `<name>.struct.rein` file that exports only that struct. (2026-11-12)

## PoC choices (revisable)

Each choice can change. The reason is one line.

- Rein mimics TypeScript syntax and types, except `@` references. Why: the owner wants TypeScript syntax, and the references need a form TypeScript does not have. Rein files are not valid TypeScript, so the TypeScript syntax check is gone.
- File extension is `.rein`. Why: short, and easy to match in editors.
- A flow root is a directory that holds `main.rein`, or the folder of a program's entry file (fact 25). The `rein.toml` marker is gone. Why: the entry file already marks the root, and a folder per flow matches `.claude/`.
- Scopes: project (`rein/` up the tree), user (`~/.config/rein/programs/`), system (`/etc/rein/`). Why: visible folders an agent can read and write with its normal tools.
- The hook injects the context on the first prompt, not at session start. Why: polyhook 0.2.0 cannot write a SessionStart context in Claude Code's format. It names the event `UserPromptSubmit` (or `BeforeAgent` for a payload it misreads as Gemini CLI). Claude Code expects `hookEventName: "SessionStart"`. The prompt path is in polyhook's format. Revisit when polyhook can write SessionStart context.
- Function name is the file path relative to the root, without `.rein` (`ci/fix.rein` is `ci/fix`). Why: the name is the location, so no separate registry is needed. The `export default function` name is a free identifier. Why: it follows TypeScript, where the name need not match the file.
- Functions are used through references: `return @./ci/fix;`. Why: no import statement; a reference is a path from the current file, so a file is moved with its folder.
- A reference path starts with `./` or `../` and has no extension, and must stay inside the project. Why: a relative, bounded path keeps every function inside one project.
- Std names need no import: `delegate`, `askUser`, `request`. Why: the std library is part of the language, so it is always there.
- Templates are files with `string` parameters, called by a std name or a reference. Why: a template is a string builder, and calls keep the caller in control of the values.
- Inputs are parameters of the exported function: `boolean`, a union of strings such as `"green" | "red"`, or `string`. Why: a TypeScript signature the agent can read, and the checker can test values.
- A `string` parameter is an input: the caller passes it. A `boolean` or a union is a question. Why: the type decides, so no new keyword is needed.
- Each parameter has its own doc comment right before it. The function has its own doc comment before `export default function`. Why: each component holds its own docs, so an edit to one parameter never touches another.
- A function with no doc comment, or an empty one, is a compile error. No flag turns it off. Why: the description is what the agent and the reader see, so a function without one cannot run.
- An async answer is a `const` with a doc comment, and it is stateless. Why: the run stops at the request, the caller answers, and the run starts again with the answer. No state is kept between runs.
- `rein eval` and `rein describe` default to `main`. Why: the entry point is one name, so the agent needs no argument to start a flow.
- Functions not reachable from the entry (`main`, or `entry` in `rein.json`) give a warning. Why: an unused function is usually a mistake, such as a missing reference.
- Evaluation is lazy. The runtime asks only for the parameters the taken path needs. Why: the agent does not answer questions that do not change the result.
- `if` is a guard with no `else`. Why: each branch returns, so a function is a list of checks, and the reader sees each case in order.
- Conditions allow `&&`, `||`, `!`, and `===` / `!==` on union parameters. Why: enough logic for branching, with no arithmetic or loops.
- `==` is the same as `===`, and `!=` the same as `!==`. Why: Rein has no type coercion, so the strict/loose difference of JavaScript does not exist; `===` stays so TypeScript developers can write what they are used to.
- Switch has no `default`. Every union member needs a case. Why: a new member is a compile error, not a silent fallback.
- A function must return on every path. Why: an agent must always get a next step.
- A function has at most 40 lines, from `export default` to `}`, and every line counts, blank and comment lines too. `rein.json` sets `maxFunctionLines` for a longer one. Why: one plain count with no skip rule to learn, so the limit is easy to check by eye; the rule matches the common `max-lines-per-function` lint with no skips.
- A line has at most 80 characters, and `rein.json` sets `maxLineLength` for another limit. Why: 80 is Prettier's default `printWidth`, and Prettier recommends against more than 80 for readability (https://prettier.io/docs/options#print-width). Rein makes it an error, not a guideline, so long lines never land.
- The line length counts characters, not bytes, and a tab is one character. Why: a reader sees characters; bytes would punish non-English text.
- An `if` has an empty line above it and after its closing `}`, unless it is the first statement of its block or the next line is a `}`. Rein warns, not errors, so an installed program with a dense `if` still runs. Why: blank lines around `if` blocks keep programs readable, not dense, and the `if` is the one place where a reader must see where a check starts and ends.
- A template that spans lines drops the indent shared by its lines after the first, so the agent text has no code indentation. Why: a long instruction is written indented inside the code, and the indent is not part of the instruction. This departs from TypeScript on purpose: a TypeScript template keeps the indent.
- Reference cycles are allowed, but the checker warns. Why: a cycle acts like a loop, and Rein has no loops yet. A retry flow needs one.
- One step per eval. `rein eval` evaluates one function and returns its string or the next function. The agent, or the harness, decides whether to follow it. Why: the agent keeps control of each step.
- `choice` stays the CLI and JSON name for a union parameter. Why: the output shape is stable for agent tools.
- Agents consume flows through `rein step` (protocol v1, see [spec.md section 11](spec/stepping.md#11-stepping-agent-interface)). The caller sends every answer so far, and the runtime follows references itself. Why: no state is kept between calls, so a CLI, a harness or a daemon can drive the same flow. CLI, MCP tool, or library are still open for the transport; the request and response types are the same for each.
- Agents hold a live run through the MCP host, `rein serve --mcp` (see [interface.md](interface.md)). Why: Claude Code and Codex cannot keep a stdin open across tool calls, so the run lives in a host process. The evaluator stays stateless; the host keeps the answers.
- Programs live in a visible `rein/` folder with a `rein.json` manifest, and packages come from `rein install`. Why: an agent finds, reads and writes visible files with its normal tools, so it can author programs too.
- Programs are npm packages installed with pnpm into `<user programs>/npm` (with `-g`) or the repo's `rein/npm` (without). Why: Rein has no package manager of its own, and pnpm holds conflicting versions of one package side by side. (Proposed, 2026-11-12. The steps are on the Install a program page.)
- A struct is an `interface`. There is no `type X = { ... }` form. Why: one form keeps the grammar small, and an `interface` reads as a named record in TypeScript.
- A struct parameter is destructured: `({ a, b }: Input)`. Why: the body reads each field by its bare name, as before, so conditions, templates, answer keys and the step protocol do not change. It is valid TypeScript.
- The braces name every field of the struct. Why: Rein is strict, and a field the function cannot read is a mistake.
- A shared struct is named with a reference in the type position: `@./message` is `message.struct.rein`. Why: Rein has no imports (fact 16), and the reference form and its root rules already exist.
- A call names the fields: `f(a=..., b=...)`. Why: existing calls keep working, and fact 24 stays true.
- A `.struct.rein` file is not a function. It has no graph node and no reachability warning. Why: it holds no decision and cannot be run.
- A struct doc comment is required only on a shared struct. Why: an inline struct is described by its function.
- The std template `delegate` takes an inline struct. Why: std follows the one-parameter rule; its calls do not change.
- Text uses backticks and a tag uses quotes. Text is a return value, a call argument or a `request` argument; a tag is a union member, an `===` operand or a `case` label. The wrong kind is a compile error with the fix. Why: text needs line breaks and `${name}`, and a tag reads as a TypeScript literal type, so each kind shows its role.
- A function that exactly one other function calls lives in a folder named after that caller, next to the caller's file (`merge.rein` calls `merge/fix_ci.rein`). Why: the folder structure then represents the program, so a reader sees who calls what from the tree.
- A function that only the entry calls stays at the root. Why: the root already is the entry's folder, so a `main/` folder only adds a level.
- A function with two or more callers stays where it is. Why: it has no single owner. A later rule can put it at the nearest common folder of its callers.
- Std items, `.struct.rein` files, functions with no caller or not reachable from the entry, and other programs are not covered. Why: std items and other programs have no file in the project, a struct is not a function, and the reachability warning covers the rest. Unreachable functions that call each other would each be told to move into the other's folder.
- A target path that another file has gives no warning, and two functions with one target name each other with no quick fix. Why: a warning must be one the author can follow.
- A misplaced function is a warning that names the target path, and the language server has a quick fix that moves the file. Why: existing programs keep working while they move. The warning can become an error later, as a ratchet, when programs follow the rule.
- A function keeps its file name when it moves. Why: the folder already names the caller, and the quick fix stays one step.
- The quick fix moves the folder of the function's nested callees with it. Why: they stay in their caller's folder, so the move does not bring their warnings back.
- The warning says that a move changes the answer keys and breaks `@program/...` references from other programs. Why: an installed program can be referenced by path, and the author should know before moving.

## Cross-program references

- A program hands off to another installed program with `@program/function`, such as `@pr-handling/main(pr=pr)`. A bare `@program` means its entry. Why: the first name is the program, and `@./` and `@../` stay local, so no old file changes meaning. A program name never starts with a dot.
- A program name may hold `-`, such as `pr-handling`. Why: `rein list` shows names with `-`. The function path keeps the old name rule.
- A bare `@name` is no longer an error. Why: it now names a program. A typo gives `cannot find program`, which names the program.
- A hand-off in `return`, or the target of an `await` (Calls with return), with the same argument rules as a local hand-off. Why: one rule for all hand-offs. The target asks its other inputs itself.
- The programs are found by name through the scopes when a command loads the project. Why: the same lookup as `rein list` and `rein step NAME`; the core crate reads no environment.
- One shared run. The target functions are named `@program/function`, so answer keys are `@pr-handling/main.task`. Why: the interface stays the same, and a local `pr-handling/main.rein` cannot give the same key.
- No `rein.lock`. pnpm pins each called program: `pnpm-lock.yaml` records its version and integrity hash, and `node_modules` holds the installed copy. Why: a second lock would repeat what pnpm already does.
- A program reference inside a called program is followed, so a chain of hand-offs can cross many programs. Each program is linked once, by name. Why: the user's ask was that a program with a missing dependency tells the agent at once, not when the run reaches that step. A chain that stopped at the second program hid that program's own dependencies.
- Each program that a hand-off from the root can reach, through any number of programs, must be installed and have the named function before the first step. Otherwise `rein check`, `rein step`, `rein run` and the MCP start refuse to run, and name the missing program and how to install it. There is no flag. Why: an agent learns of a missing program before it does any work, and as strict as possible means one rule with no opt-out.
- Programs reached through other programs are found through the root project's scopes, not through the called program's own installs. Why: one lookup for every program, the same as `rein list`. A program that pnpm installed only as a dependency of another package is not visible, so install it in a scope to call it. (A change is proposed; see Naming, Identity and local names.)

## Naming

Anyone can build and share a program, so two authors can pick the same name. The rules below keep names short in code and still tell authors apart.

### Program names

- A program name is kebab-case, 1 to 3 words: a noun phrase that leads with the object, such as `pr-handling`, `product-fit`, `next-pr` or `self-improve`. Why: a hand-off reads as "hand the agent to `pr-handling`", and `rein list` groups programs by their object.
- A program name has no `rein-` prefix and no author. Why: every call already starts with `@`, so `@rein-pr-handling` says Rein twice; the author lives in the source, not in the name.
- Avoid a verb-first name (`handle-pr`) and a one-word name that is too wide (`pr`). Why: a verb-first name sorts by verb, and a wide name collides at once. The example `examples/rein/merge-pr` is older than this rule.

### Identity and local names (proposed)

- The identity of a program is `<owner>/<repo>` on GitHub, such as `tupe12334/rein-product-fit`. Why: GitHub makes it unique for free, so no registry is needed.
- In code, a program is called by a short local name: `return @product-fit;`. The grammar does not change, and a `.rein` file never holds an owner or an npm scope. Why: `@a/b/c` could be program `a/b` or program `a` with function `b/c`; and an owner in code would mean editing every call after a fork or a move.
- The caller binds each local name to an identity, as a pnpm alias in its `package.json` `dependencies`: `"product-fit": "github:tupe12334/rein-product-fit"`. The key is the local name. A program that calls another program and is shared has a `package.json`. A one-file program needs no manifest (fact 25): it calls through the scopes, as in the project you develop. Why: `rein install` already runs pnpm, so pnpm fetches it and `pnpm-lock.yaml` pins it, and the caller, not the author, owns the name.
- Inside an installed program, a call to a local name that its `package.json` does not bind is an error: `` `@x` is not bound; add "x" to dependencies ``. In the project you develop, it is a warning, and the call falls back to the scopes. This would replace the rule in Cross-program references that programs reached through other programs are found through the root project's scopes. Why: with many authors, a lookup per machine can call another author's program without a word.
- In one run, one local name has one identity. Two bindings of the same local name to different identities in one run is a `rein check` error that names both. Why: both would write the same answer keys, such as `@product-fit/main.task`.
- `rein install` gives a program its default local name: the package name without its `@scope/`. If that name is taken in the scope, the install stops and names the fix: `` `pr-handling` is already bob/rein-pr-handling; install with --as alice-pr-handling ``. Nothing is replaced in silence. `rein list` shows the name, the source and the version. These change Built rules in install-programs.md: today the arguments go to pnpm unchanged and Rein reads no package spec, and `rein list` names a scoped package `@scope/name`.
- A bare name, such as `rein install pr-handling@^1`, still goes to pnpm unchanged and means that npm package (install-programs.md). Rein adds no index that guesses a GitHub owner for a bare name. Why: pnpm already gives a bare name one meaning, and a guess could install another author's program.

### Repos and packages

- A program repo is `<owner>/rein-<name>`, such as `tupe12334/rein-pr-handling`. Programs of the `rein-lang` organization drop the prefix: `rein-lang/pr-handling`. Why: the prefix makes a program easy to find in a shared GitHub account; the organization already says Rein.
- A repo that holds a tool, not a program, names its kind: `vscode-rein`.
- Each program repo has the GitHub topic `rein-program`. Why: search can find programs by topic, not by guessing from names.
- A program has one canonical repo. A copy is archived with a link to it.
- The `package.json` `name` is the program name, as in the program package of install-programs.md. A program published to npm under a scope is `@<owner>/<name>`. Today `rein list` names it `@<owner>/<name>`; the proposal above would give it the part after the scope as its default local name.

### Function and file names

- A path segment is snake_case. A folder is a subject, and a leaf file is an imperative verb: `ci/fix`, `comments/address`, `check_approval`. Why: the path reads as a sentence, and one rule is easy to guess.
- A parameter, a struct field and an answer name are snake_case too: `is_draft`, `next_step`. `rein check` warns on a name with an uppercase letter and gives the snake_case name. Why: one style for paths and names, so an answer key such as `ci/fix.next_step` has one style. A path never holds `.`, so the key still shows where the path ends. (Owner's choice, 2026-11-13.)
- A template is a noun for the text it gives: `review_comment`. A struct is a singular noun: `message.struct.rein`.
- Apart from `templates/` (fact 23), no folder groups files by kind. A file that several functions use sits at their shared level. Why: a folder is a subject, and the single-caller rule already places each file.
- Keep paths shallow. Depth comes from the single-caller rule, so it is advice, not a limit.

### Renames and public surface

- The public surface of a program is its entry and its top-level files. A file in a folder is private. A call from another program into a private file is a warning (proposed). Why: the single-caller rule already moves helpers into folders, so the folders are the export list.
- A program has two names. The `package.json` `name` is only the default local name for new installs; changing it breaks no caller, because each caller keeps its own local name. The repo `<owner>/<repo>` is the identity; moving it breaks no caller either, because GitHub redirects the old repo. There is no rename alias in the language. Why: the binding already solves it.
- A breaking change is a new major version: a change to the entry's parameter or its fields, or to the public answer keys. A rename is not one.

## Struct answers

- An answer is a struct, never a free string. Only a `request` answer can be a struct, and its fields are `boolean`, a union, or `string`. Why: a struct names and documents every value, and the runtime validates it, so the agent cannot send loose text. A bare `string` answer is a checker error.
- A field is read as `pick.pr`, one level, and works like the parameter of its type: a `string` field goes into a hand-off or a template, a `boolean` or union field decides a branch. `rein step` gives the struct as a `fields` list and takes a JSON object. Why: one rule for every value, and a bad value is rejected with the field name.

## Calls with return

- `const name: Type = await @program(args);` runs another function and gives its result as the answer. `await @./path` works the same for a local function. Why: a program needs another program's result as a value, such as the repositories that `priority-projects` picks. A hand-off ends the caller, so nothing came back.
- The stepper walks the callee as a hand-off, with the callee's own keys. Its final text becomes a request whose key is the caller's `const`. Once answered, the caller goes on after the `await`. Why: `rein step` stays stateless. The answers replay the walk, and no call stack is kept between steps. The callee needs no change to be called.
- The answer has the doc and type rules of a `request` answer, and the call has the argument rules of a hand-off. Why: no new rules to learn.
- A template cannot be awaited. Why: it gives text, not a run. Put the text in `request(...)` instead.
- `rein graph` draws an `await` as a request node with a `call` edge to the callee. Why: the flow goes on from the answer, unlike a hand-off, which ends the function.
- Each call has its own answer keys: the caller's answer key, `>`, then the callee's key, such as `main.b>fn.ok`. Why: with one key per function, two calls of `fn` shared their answers, and a recursive call reused the outer level's answers and could never end. The prefix names the call site, so a key stays readable and stable across steps. A hand-off adds no prefix of its own: outside any call it keeps its old key, so no existing program changes, and inside a call it keeps the call's prefix.

## Planned (not built)

- Bundle tool: compiles a program into one self-contained `.rein` file, so an agent can load one file and run it as a full program.
- Research an agent-agnostic tool that installs agent hooks. Why: each agent keeps its hook config in its own format and place, so Rein should not own a per-agent installer.

## Open questions

- The one-file format. How several functions live in one file, and how references resolve inside it.

- Loops and retries. Today a retry is a reference cycle.
- Side effects inside functions. Today a return value is text for the agent to act on, and a request is the only step that waits for the agent.
- Who answers inputs: agent judgment, or deterministic tools.
- Once an index of programs exists, does a `rein-lang` program win a bare `rein install <name>`, or is `rein-lang` one owner like any other?
- Is per-program binding (Naming, Identity and local names) worth the change to how programs reached through other programs are found?
