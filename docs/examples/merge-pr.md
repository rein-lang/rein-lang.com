---
description: "Decide the next step for a pull request task."
---

# merge-pr

An agent flow that decides whether a pull request can merge.

## Files

| File | Function | Job |
| --- | --- | --- |
| `main.rein` | `main` | Entry point. Routes the task to a merge or a security review. |
| `merge_pr.rein` | `merge_pr` | Checks docs-only changes and CI status. |
| `merge_pr/review_code.rein` | `merge_pr/review_code` | Code review step after green CI. Delegates the review to a subagent, on a stronger model when the PR is security-sensitive. |
| `review.rein` | `review` | Checks for secrets and auth changes. Reached from `main` for a security review task. |
| `merge_pr/fix.rein` | `merge_pr/fix` | Fix a red CI run. Then the agent starts this program again. |

## Run it

```sh
cargo run -p rein -- check examples/rein/merge-pr
cargo run -p rein -- run --root examples/rein/merge-pr
```

## Retry without a cycle

`merge_pr` references `merge_pr/fix`. `merge_pr/fix` does not reference back. Rein has no loops yet, so the retry ends the run.
After a fix is pushed, `merge_pr/fix` returns the text "start this program again with the task merge".
The agent then starts the program again, and `merge_pr` checks the pull request again.

## Graph

The decision flow, from `rein graph merge-pr`:

```mermaid
flowchart TD
    subgraph s0 ["main.rein"]
        f0(["main"])
        f0_0{"Which task does the agent do?<br/>task: #quot;merge#quot; | #quot;security review#quot;"}
    end
    subgraph s1 ["merge_pr.rein"]
        f1[["merge_pr"]]
        f1_0{"Does the PR change only documentation files?<br/>docs_only: boolean"}
        f1_1("approved")
        f1_2{"What is the CI status of the PR?<br/>ci: #quot;green#quot; | #quot;red#quot; | #quot;pending#quot;"}
        f1_3("wait for CI, then run merge_pr again")
    end
    subgraph s2 ["merge_pr/fix.rein"]
        f2[["merge_pr/fix"]]
        f2_0{"Did you push a fix for the failing job?<br/>fix_pushed: boolean"}
        f2_1("Wait for CI to finish. Then start this program again with the task<br/>merge.")
        f2_2("Read the CI log. Fix the failing test or code. Push the fix. Then run<br/>merge_pr/fix again.")
    end
    subgraph s3 ["merge_pr/review_code.rein"]
        f3[["merge_pr/review_code"]]
        f3_0{"Does the PR change authentication, payments, or permissions code?<br/>security_sensitive: boolean"}
        f3_1>"delegate(model=ˋuse opus modelˋ, task=ˋcode review the pr with a security focusˋ)"]
        f3_2>"delegate(model=ˋuse haiku modelˋ, task=ˋcode review the prˋ)"]
    end
    subgraph s4 ["review.rein"]
        f4[["review"]]
        f4_0{"Does the PR add or change a secret, token, or key?<br/>secrets_added: boolean"}
        f4_1("Stop. Remove the secret from the diff. Rotate the secret. Then run<br/>merge_pr again.")
        f4_2("Check the auth and permission changes. Ask the security owner to<br/>approve. Then run merge_pr again.")
    end
    f0 --> f0_0
    f0_0 -->|"merge"| f1
    f0_0 -->|"security review"| f4
    f1 --> f1_0
    f1_0 -->|"yes"| f1_1
    f1_0 -->|"no"| f1_2
    f1_2 -->|"green"| f3
    f1_2 -->|"red"| f2
    f1_2 -->|"pending"| f1_3
    f2 --> f2_0
    f2_0 -->|"yes"| f2_1
    f2_0 -->|"no"| f2_2
    f3 --> f3_0
    f3_0 -->|"yes"| f3_1
    f3_0 -->|"no"| f3_2
    f4 --> f4_0
    f4_0 -->|"yes"| f4_1
    f4_0 -->|"no"| f4_2
```

## Source

### `package.json`

```json
{
  "name": "merge-pr",
  "version": "0.1.0",
  "description": "Decide the next step for a pull request task.",
  "license": "MIT",
  "private": true,
  "files": ["**/*.rein", "README.md", "rein.json"],
  "engines": {
    "rein": "^0.1.0"
  }
}
```

### `rein.json`

```json
{
  "entry": "main.rein"
}
```

### `main.rein`

```rein
/**
 * Decide the next step for a pull request task.
 */
export default function main(
  /** Which task does the agent do? */
  task: "merge" | "security review",
) {
  switch (task) {
    case "merge":
      return @./merge_pr;
    case "security review":
      return @./review;
  }
}
```

### `merge_pr.rein`

```rein
// merge_pr.rein

interface Input {
  /** Does the PR change only documentation files? */
  docs_only: boolean;
  /** What is the CI status of the PR? */
  ci: "green" | "red" | "pending";
}

/**
 * Decide whether a pull request can be merged.
 */
export default function mergePr({ docs_only, ci }: Input) {
  if (docs_only) {
    return `approved`;
  }

  switch (ci) {
    case "green":
      return @./merge_pr/review_code;
    case "red":
      return @./merge_pr/fix;
    case "pending":
      return `wait for CI, then run merge_pr again`;
  }
}
```

### `merge_pr/fix.rein`

```rein
/**
 * Fix a failing CI run, then check the pull request again.
 */
export default function fixCi(
  /** Did you push a fix for the failing job? */
  fix_pushed: boolean,
) {
  if (fix_pushed) {
    return `Wait for CI to finish. Then start this program again with the task
    merge.`;
  }

  return `Read the CI log. Fix the failing test or code. Push the fix. Then run
  merge_pr/fix again.`;
}
```

### `merge_pr/review_code.rein`

```rein
/**
 * Review the code changes in a pull request.
 */
export default function reviewCode(
  /** Does the PR change authentication, payments, or permissions code? */
  security_sensitive: boolean,
) {
  if (security_sensitive) {
    return delegate(
      model=`use opus model`,
      task=`code review the pr with a security focus`,
    );
  }

  return delegate(model=`use haiku model`, task=`code review the pr`);
}
```

### `review.rein`

```rein
/**
 * Review changes that touch security-sensitive code.
 */
export default function securityReview(
  /** Does the PR add or change a secret, token, or key? */
  secrets_added: boolean,
) {
  if (secrets_added) {
    return `Stop. Remove the secret from the diff. Rotate the secret. Then run
    merge_pr again.`;
  }

  return `Check the auth and permission changes. Ask the security owner to
  approve. Then run merge_pr again.`;
}
```
