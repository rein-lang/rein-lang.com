## Transport

The four contracts do not depend on the transport. The step objects stay the same.

| Transport | Good for | Limit |
| --- | --- | --- |
| MCP host | An agent in a harness. The tools have types. There are no exit codes and no shell quoting. | Each tool costs context. A harness with many tools can hide them until the agent searches. |
| CLI | Scripts, CI, and a harness with no MCP. | Finding 2 and finding 5. |

For an MCP host:

- Give the agent three tools: list the programs, start a run, answer a step. Keep the status, stop and list-runs tools for the operator, on the CLI.
- Use the server instructions for the advise level. They can replace the first-prompt context block.
- Runs that live only in memory are lost when the host exits, and the hook cannot read them. The run log on disk solves both.

For the CLI in an agent mode: exit with code 0 for `question`, `request` and `done`. Only `error` is non-zero.
