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
10. Every project has a `main.rein`; it is the agent's entry point.
11. Each component holds its own docs: the function has its doc comment, and each input has its own doc comment right before it.
12. Rein is as strict as possible: every case is handled explicitly. There is no `default` and no `else`. Every `if` block returns, and the code after it handles the other case.
13. Templates work like Rust macros: they expand to a string. A standard library ships templates such as `delegate(model, task)`.
14. A function can send the agent an async request and branch on the typed response (`const x: boolean = await request(...)`).
15. Every function returns something on every path: a string, a template, or a reference to another function.
16. No import statements: functions reference each other with relative paths (`@./path`, `@../path`).
17. The runtime is stateless: each step takes the project and all answers so far and returns the next question, request or final instruction. The CLI is interface-agnostic; a daemon can wrap the same request/response types later.
18. Programs are named apps in visible folders: project (`rein/`), user (the user programs folder, filled by `rein install`), system; the closest scope wins. The agent finds and launches them by name, not by navigating a dot-folder.
19. Rein injects itself into agent sessions with a SessionStart hook, built on polyhook so it works across agents.
20. A program holds its state, like a computer app. The agent does not enter every answer again.
21. A program takes inputs, such as a pull request link.
22. No global scope. A function gets a value only from its parameters. The caller passes it.
23. Templates are permanent, and user templates (`templates/*.rein`) stay, not only the std `delegate` and `askUser`. A template call is a value, not a step: it nests as an argument and adds no hop to the `rein step` trace. Template arguments are always checked: the count equals the parameter count, every parameter is used in the template literal, and every parameter has its own doc comment. (2026-11-12)

## PoC choices (revisable)

Each choice can change. The reason is one line.

- Rein mimics TypeScript syntax and types, except `@` references. Why: the owner wants TypeScript syntax, and the references need a form TypeScript does not have. Rein files are not valid TypeScript, so the TypeScript syntax check is gone.
- File extension is `.rein`. Why: short, and easy to match in editors.
- A flow root is a directory that holds `main.rein`. The `rein.toml` marker is gone. Why: the entry file already marks the root, and a folder per flow matches `.claude/`.
- Scopes: project (`rein/` up the tree), user (`~/.config/rein/programs/`), system (`/etc/rein/`). Why: visible folders an agent can read and write with its normal tools.
- The hook injects the context on the first prompt, not at session start. Why: polyhook 0.2.0 cannot write a SessionStart context in Claude Code's format. It names the event `UserPromptSubmit` (or `BeforeAgent` for a payload it misreads as Gemini CLI). Claude Code expects `hookEventName: "SessionStart"`. The prompt path is in polyhook's format. Revisit when polyhook can write SessionStart context.
- `install` writes only `claude-code`. Why: polyhook's `tools.toml` gives docs links for the other tools, but no config file location.
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
- Functions not reachable from `main` give a warning. Why: an unused function is usually a mistake, such as a missing reference.
- Evaluation is lazy. The runtime asks only for the parameters the taken path needs. Why: the agent does not answer questions that do not change the result.
- `if` is a guard with no `else`. Why: each branch returns, so a function is a list of checks, and the reader sees each case in order.
- Conditions allow `&&`, `||`, `!`, and `===` / `!==` on union parameters. Why: enough logic for branching, with no arithmetic or loops.
- Switch has no `default`. Every union member needs a case. Why: a new member is a compile error, not a silent fallback.
- A function must return on every path. Why: an agent must always get a next step.
- Reference cycles are allowed, but the checker warns. Why: a cycle acts like a loop, and Rein has no loops yet. A retry flow needs one.
- One step per eval. `rein eval` evaluates one function and returns its string or the next function. The agent, or the harness, decides whether to follow it. Why: the agent keeps control of each step.
- `choice` stays the CLI and JSON name for a union parameter. Why: the output shape is stable for agent tools.
- Agents consume flows through `rein step` (protocol v1, see [spec.md section 11](spec.md#11-stepping-agent-interface)). The caller sends every answer so far, and the runtime follows references itself. Why: no state is kept between calls, so a CLI, a harness or a daemon can drive the same flow. CLI, MCP tool, or library are still open for the transport; the request and response types are the same for each.
- Agents hold a live run through the MCP host, `rein serve --mcp` (see [interface.md](interface.md)). Why: Claude Code and Codex cannot keep a stdin open across tool calls, so the run lives in a host process. The evaluator stays stateless; the host keeps the answers.
- Programs live in a visible `rein/` folder with a `rein.json` manifest, and `rein install` registers them. Why: an agent finds, reads and writes visible files with its normal tools, so it can author programs too.

## Open questions

- Free-text answers. A free-text answer from the agent is still not possible. Each question is a `boolean` or a union.
- Loops and retries. Today a retry is a reference cycle.
- Side effects inside functions. Today a return value is text for the agent to act on, and a request is the only step that waits for the agent.
- References across projects. Today references stay inside one project.
- Who answers inputs: agent judgment, or deterministic tools.
