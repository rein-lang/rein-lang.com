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

## PoC choices (revisable)

Each choice can change. The reason is one line.

- File extension is `.rein`. Why: short, and easy to match in editors.
- Project root is the directory with a `rein.toml` marker file. Why: one clear root for names and references.
- Function name is the file path relative to the root, without `.rein` (`ci/fix.rein` is `ci/fix`). Why: the name is the location, so no separate registry is needed.
- References are written `@name`. Why: a reference can never be confused with a string.
- Inputs are typed: `bool` or `choice(...)`. Each input has a description, which is the question the agent must answer. Why: the agent knows what to ask and the checker can test values.
- Evaluation is lazy. The runtime asks only for the inputs the taken path needs. Why: the agent does not answer questions that do not change the result.
- Conditions allow `and`, `or`, `not`, and `==` / `!=` on choice inputs. Why: enough logic for branching, with no arithmetic or loops.
- A function must return on every path. The checker enforces it. Why: an agent must always get a next step.
- Reference cycles are allowed, but the checker warns. Why: a cycle acts like a loop, and Rein has no loops yet. A retry flow needs one.
- One step per run. `rein run` evaluates one function and returns its string or the next reference. The agent, or the harness, decides whether to follow it. Why: the agent keeps control of each step.

## Open questions

- References that pass arguments. Today a target gets no values from the caller.
- Free-text inputs and string interpolation. Today an input is only `bool` or `choice`.
- Loops and retries. Today a retry is a reference cycle.
- How agents consume flows: CLI, MCP tool, or library.
- Side effects and actions inside functions. Today a return value is text for the agent to act on.
- Versioning and imports across projects. Today references stay inside one project.
- Who answers inputs: agent judgment, or deterministic tools.
- Exact segment characters in a REF. The spec uses the IDENT character set as a guess.
