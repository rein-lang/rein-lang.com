## Worked example: merge-pr

This section walks the `merge-pr` example through the four contracts. It shows the idea only. No syntax is decided.

The path is a code change with green CI. Today the agent makes five `rein step` calls on this path.

| Step | Today | With the four contracts |
| --- | --- | --- |
| Start | The agent must recall that the program exists. | The agent calls `gh pr merge 42`. The gate denies the call and names `merge-pr`. |
| `main.task` | The agent answers `merge`. | No question. The guarded action is the merge, so the gate starts the run at `merge_pr`. |
| `merge_pr.docs_only` | The agent answers. | The agent answers. |
| `merge_pr.ci` | The agent reads the CI status and answers. | A probe runs `gh pr checks 42`. The agent gets no question. |
| `merge_pr/review_code.security_sensitive` | The agent answers. | The agent answers. |
| End | `done` with free text: delegate a code review. | A request: the program waits for the review result, then returns a status. |

Today the agent answers four questions on this path. With the contracts it answers two.

Each end of the program gets a status:

| End today | With contract 4 |
| --- | --- |
| `"approved"` | Allow. The gate opens for one merge call. |
| `"wait for CI, then run merge_pr again"` | Block. The gate stays closed. |
| Delegate a code review | The program cannot end here. A gate needs a verdict, so the review becomes a request. |
| `merge_pr/fix` with a pushed fix | Finding 1 today. The result depends on the cycle choice in contract 2. |

Notes:

- A probe can also answer `docs_only`, because a command can list the changed files.
- The example has no approval question. A program can add one with the `user` source, such as "May I merge?".
- The probe needs the pull request number. The denied command holds it.

## Worked example: incident-triage

The path is a sev2 alert with no customer impact and a known runbook. Today the agent makes five `rein step` calls on this path.

| Step | Today | With the four contracts |
| --- | --- | --- |
| Start | The agent must recall that the program exists. | The alert starts the run. The first step is the prompt of the agent. |
| `main.customer_impact` | The agent answers. | The agent answers. |
| `main.severity` | The agent answers. | A probe reads the severity from the alert. |
| `main.known_runbook` | The agent answers. | A probe looks for the runbook file. |
| Approval | None. | A `user` question: "May I run the runbook steps?" The example has no such question today. |
| `follow.fixed` | The agent runs the steps, then answers. | The agent runs the steps. A probe reads the alert status. |
| End | `done` with free text: close the alert. | Allow, for a gate on the close action. |

Today the agent answers three questions and one request on this path. With the contracts it answers one question and does one request.

This example adds three points:

- A program that routes an event has no first action to guard. It needs the event trigger level.
- A probe can answer a request. The agent does the step, and the runtime checks the result.
- `page_human` ends with the text "Wait for an acknowledgement". That text is advice today. A request can hold the run until the acknowledgement.
