## Principle

The agent is the sensor and the actuator. The runtime is the memory, the fact reader, and the gate.

| Job | Owner |
| --- | --- |
| Judge what it sees (an answer) | Agent |
| Do a step (a request) | Agent |
| Keep the answers of a run | Runtime |
| Read a fact that a command can read | Runtime |
| Stop a guarded action until the program allows it | Runtime |

With `rein step`, the agent has all five jobs. The MCP host moves the third job to the runtime while a run lives. The proposal moves the last three to the runtime, and keeps the state after a run ends.
