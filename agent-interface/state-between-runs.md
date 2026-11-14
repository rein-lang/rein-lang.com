## State between runs

Owner direction, 2026-11-11: the program holds the state, like a computer app. A user of an app does not enter everything again for each action.

Contract 2 covers one run. This section covers what stays after a run ends.

The state hangs on a subject, such as one pull request. A subject is like a document in an app. A run starts with its subject, and a later run on the same subject continues from the stored state.

The subject of a run is a program input, such as the pull request link. The caller passes it as a `string` parameter ([spec.md section 4](../spec/functions-and-parameters.md#4-declarations)).

Not all state is equal:

| Kind | Example | Rule |
| --- | --- | --- |
| An answer that the agent or the user gave | "Does the PR change permissions code?", "May I merge?" | Remember it. Ask one time. |
| A fact of the world | The CI status, the review state | Do not remember it. Read it again on each run. |
| Progress | The open step, the number of retries | Remember it. |

An app works the same way. It keeps what the user typed, and it loads the inbox again.

Effects on the `pr-handling` example:

- After a pushed CI fix, the next run does not ask for the draft state or the task again.
- "Run the failed job again, one time" becomes a rule. The program can count the retries.
- A retry is new progress, not a second visit with old answers. Finding 1 does not occur.

The core stays pure. The state is the run log of the subject, and a step is a function of that log.

Recommended place for the state: the state folder of the user, with one file for each repo and subject. Reasons:

- The hook and every session on the machine can read it.
- Nothing goes into git, and a cloned repo brings no state with it.

A limit: a second machine does not see the state. State that lives with the subject, such as on the pull request, can solve that later.

A stored answer can become wrong. A new commit can add permissions code after the agent answered "no". An answer needs a rule for when it expires.

Recommended expiry rule: an answer about the content of the subject expires when the content changes. For a pull request, that is a new head commit. An approval from the user expires the same way. Progress does not expire.
