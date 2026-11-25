# Agent interface: plan and known gaps

These notes moved from the site page [Agent interface](../language/interface.md). They are for people who work on Rein.

## Saved runs (optional)

- Save live runs to disk, so a run resumes after a crash. It is optional, and it is not the main path.

## Harness enforcement (proposal)

- A hook injects the current step of each live run into the agent context, on each prompt. The agent sees what the program waits on.
- A Stop hook blocks the agent from ending its turn while a run waits on a step. The hook tells the agent to answer the step or to call `rein_stop`.
- The hooks read the live runs from the host, with `rein_list`.
- The harness then enforces the program the way an operating system enforces a process. The agent cannot drift away from it.

## Not in scope

- Graph editors.
- Links between agents.
- Protocol layers above MCP.

## Conflicts with spec section 11

- Section 11 says the runtime keeps nothing between calls. The evaluator still keeps nothing. The MCP host and `rein run` keep the answers in memory, above the evaluator.
- A step from `rein_start`, `rein_answer` and `rein_status` has a `run` field. A `rein step` response does not. MCP steps list their keys in alphabetical order.
- In `rein step`, a bad answer is an error with exit code 1. In a live run, a bad answer is an error step, and the run goes on.
- Sections 9 and 10 named the single-function command `rein run`. It is now `rein eval`. `rein run` starts a live run.
- The manifest `entry` can name a file other than `main.rein`. The checker still asks for a `main.rein` in each program.
