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

## PoC choices (revisable)

Each choice can change. The reason is one line.

- Every Rein file is valid TypeScript syntax (checked by `npm run check-ts-syntax`). Why: the owner wants TypeScript syntax, and the check keeps the claim true.
- File extension is `.rein`. Why: short, and easy to match in editors.
- Project root is the directory with a `rein.toml` marker file. Why: one clear root for names and imports.
- Function name is the file path relative to the root, without `.rein` (`ci/fix.rein` is `ci/fix`). Why: the name is the location, so no separate registry is needed. The `export default function` name is a free identifier. Why: it follows TypeScript, where the name need not match the file.
- Functions are used through imports: `import fixCi from "./ci/fix"`, then `return fixCi;`. Why: the same form as TypeScript modules, and the checker can see each dependency.
- Import paths start with `./` or `../` and have no extension, and must stay inside the project. Why: a path that is relative and bounded keeps every function inside one project, as before.
- Inputs are parameters of the exported function: `boolean`, or a union of strings such as `"green" | "red"`. Why: a TypeScript signature the agent can read, and the checker can test values.
- Each parameter has its own doc comment right before it. The function has its own doc comment before `export default function`. Why: each component holds its own docs, so an edit to one parameter never touches another.
- `rein run` and `rein describe` default to `main`. Why: the entry point is one name, so the agent needs no argument to start a flow.
- Functions not reachable from `main` give a warning. Why: an unused function is usually a mistake, such as a missing import.
- Evaluation is lazy. The runtime asks only for the parameters the taken path needs. Why: the agent does not answer questions that do not change the result.
- Conditions allow `&&`, `||`, `!`, and `===` / `!==` on union parameters. Why: enough logic for branching, with no arithmetic or loops.
- Switch case labels with no body join the next body, as in TypeScript. A non-empty clause must end in `return`. Why: no silent fallthrough, and the TypeScript shape stays.
- A function must return on every path. The checker enforces it. Why: an agent must always get a next step.
- Reference cycles are allowed, but the checker warns. Why: a cycle acts like a loop, and Rein has no loops yet. A retry flow needs one.
- One step per run. `rein run` evaluates one function and returns its string or the next function. The agent, or the harness, decides whether to follow it. Why: the agent keeps control of each step.
- `choice` stays the CLI and JSON name for a union parameter. Why: the output shape is stable for agent tools.

## Open questions

- Imports that pass arguments. Today a target gets no values from the caller.
- Free-text inputs and string interpolation. Today a parameter is only `boolean` or a union of strings.
- Loops and retries. Today a retry is an import cycle.
- How agents consume flows: CLI, MCP tool, or library.
- Side effects and actions inside functions. Today a return value is text for the agent to act on.
- Imports across projects. Today imports stay inside one project.
- Who answers inputs: agent judgment, or deterministic tools.
