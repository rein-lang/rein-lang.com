---
description: "Decide the next step for a pull request task."
---

<!--@include: ../../../examples/rein/merge-pr/README.md-->

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
        f1_0{"Does the PR change only documentation files?<br/>docsOnly: boolean"}
        f1_1("approved")
        f1_2{"What is the CI status of the PR?<br/>ci: #quot;green#quot; | #quot;red#quot; | #quot;pending#quot;"}
        f1_3("wait for CI, then run merge_pr again")
    end
    subgraph s2 ["merge_pr/fix.rein"]
        f2[["merge_pr/fix"]]
        f2_0{"Did you push a fix for the failing job?<br/>fixPushed: boolean"}
        f2_1("Wait for CI to finish. Then start this program again with the task<br/>merge.")
        f2_2("Read the CI log. Fix the failing test or code. Push the fix. Then run<br/>merge_pr/fix again.")
    end
    subgraph s3 ["merge_pr/review_code.rein"]
        f3[["merge_pr/review_code"]]
        f3_0{"Does the PR change authentication, payments, or permissions code?<br/>securitySensitive: boolean"}
        f3_1>"delegate(model=#96;use opus model#96;, task=#96;code review the pr with a security focus#96;)"]
        f3_2>"delegate(model=#96;use haiku model#96;, task=#96;code review the pr#96;)"]
    end
    subgraph s4 ["review.rein"]
        f4[["review"]]
        f4_0{"Does the PR add or change a secret, token, or key?<br/>secretsAdded: boolean"}
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

<<< ../../../examples/rein/merge-pr/package.json{json}

### `rein.json`

<<< ../../../examples/rein/merge-pr/rein.json{json}

### `main.rein`

<<< ../../../examples/rein/merge-pr/main.rein{rein}

### `merge_pr.rein`

<<< ../../../examples/rein/merge-pr/merge_pr.rein{rein}

### `merge_pr/fix.rein`

<<< ../../../examples/rein/merge-pr/merge_pr/fix.rein{rein}

### `merge_pr/review_code.rein`

<<< ../../../examples/rein/merge-pr/merge_pr/review_code.rein{rein}

### `review.rein`

<<< ../../../examples/rein/merge-pr/review.rein{rein}
