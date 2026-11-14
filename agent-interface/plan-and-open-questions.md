## What stays

- The pure core and the four response kinds.
- One function for each file, and the checker rules.
- The agent calls the program. The program never owns the loop.

## Order

Each step is usable without the next one.

1. The run log on disk and the key guard, on top of the MCP host.
2. State between runs: the subject, the three kinds, and the expiry rule.
3. The outcome status and one gate.
4. Probes and program inputs. Inputs are built; probes are not.

## Open questions

- Where does a program declare its gate: a doc tag in `main.rein`, or the manifest?
- Cycles: answers for each visit, or a checker error?
- How does the hook match a run to a session? The hook can record the run id from the event after the start tool call. A weaker match is the working directory.
- State: when does the state of a subject end? For a pull request, merged or closed is the likely end.
- State: how does a program declare the kind of each question: remember, or read again?
- Trust: a probe runs a command from a program file. Does a project-scope program from a cloned repo need consent first?
- Contract 4 opens a gate one time. Does a failed tool call need a second try without a new run?
- How does a gate pass a value from the guarded command to the run, such as the pull request number?
- Does the source of a program belong in the agent's tools? An agent that reads the source can pick answers for the outcome it wants.
- Not verified: does the first-prompt context reach a subagent? A gate does not depend on the answer.
