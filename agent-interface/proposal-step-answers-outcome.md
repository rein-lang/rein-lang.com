## Proposal: contracts 2 to 4

### 2. Step: the run keeps the answers

The MCP host already does the first part: a run has an id, and the host keeps its answers. The core stays pure: `step(project, answers)`. Two parts are not built:

- The run writes an append-only log to disk: one line for each answer, then the outcome. The hook is a different process, so it can read a run only from disk. A live run in memory is also lost when the host exits.
- An answer names the key it answers. A value for a different key is an error. This guards against two answers that an agent sends at the same time.
- The response does not repeat every answer.

For cycles, choose one of these:

- Give each visit of a function its own answers. A cycle then asks again, and a retry works.
- Make a reached cycle a checker error. A retry ends the run with the text "run the program again".

### 3. Answers: three sources

Each question names who answers it.

| Source | Who answers | Use |
| --- | --- | --- |
| `agent` | The agent, from what it sees. | Judgement, such as "is this change risky?" |
| `probe` | A command that the runtime runs. | Facts, such as the CI status. |
| `user` | The user only. | Approval, such as "may I deploy?" |

- A probe needs no agent turn. A program that reads its facts with probes asks fewer questions.
- A probe needs a program input, such as the pull request number. Program inputs are built ([spec.md section 4](../spec/functions-and-parameters.md#4-declarations)). Probes are still a proposal. An input is a `string`. It goes into templates and probes only, and never into a condition.
- The response for a `user` question says so. The harness can then use its own ask dialog, and the agent must not answer.

### 4. Outcome: a verdict that a gate can read

- `done` gets a status next to its text: allow or block. A std template such as `allow("...")` can set it.
- A gate opens only on an allow, and only one time.
- The run log and the outcome are the audit record of the decision.
