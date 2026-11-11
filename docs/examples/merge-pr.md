---
description: "Decide the next step for a pull request task."
---

<!--@include: ../../../examples/rein/merge-pr/README.md-->

## Graph

The decision flow, from `rein graph merge-pr`:

```mermaid
flowchart TD
    subgraph s0 ["ci/fix.rein"]
        f0[["ci/fix"]]
        f0_0{"Did you push a fix for the failing job?<br/>fixPushed: boolean"}
        f0_1("Wait for CI to finish. Then start this program again with the task merge.")
        f0_2("Read the CI log. Fix the failing test or code. Push the fix. Then run ci/fix again.")
    end
    subgraph s1 ["main.rein"]
        f1(["main"])
        f1_0{"Which task does the agent do?<br/>task: #quot;merge#quot; | #quot;security review#quot;"}
    end
    subgraph s2 ["merge_pr.rein"]
        f2[["merge_pr"]]
        f2_0{"Does the PR change only documentation files?<br/>docsOnly: boolean"}
        f2_1("approved")
        f2_2{"What is the CI status of the PR?<br/>ci: #quot;green#quot; | #quot;red#quot; | #quot;pending#quot;"}
        f2_3("wait for CI, then run merge_pr again")
    end
    subgraph s3 ["review_code.rein"]
        f3[["review_code"]]
        f3_0{"Does the PR change authentication, payments, or permissions code?<br/>securitySensitive: boolean"}
        f3_1>"delegate(model=#quot;use opus model#quot;, task=#quot;code review the pr with a security focus#quot;)"]
        f3_2>"delegate(model=#quot;use haiku model#quot;, task=#quot;code review the pr#quot;)"]
    end
    subgraph s4 ["security/review.rein"]
        f4[["security/review"]]
        f4_0{"Does the PR add or change a secret, token, or key?<br/>secretsAdded: boolean"}
        f4_1("Stop. Remove the secret from the diff. Rotate the secret. Then run merge_pr again.")
        f4_2("Check the auth and permission changes. Ask the security owner to approve. Then run merge_pr again.")
    end
    f0 --> f0_0
    f0_0 -->|"yes"| f0_1
    f0_0 -->|"no"| f0_2
    f1 --> f1_0
    f1_0 -->|"merge"| f2
    f1_0 -->|"security review"| f4
    f2 --> f2_0
    f2_0 -->|"yes"| f2_1
    f2_0 -->|"no"| f2_2
    f2_2 -->|"green"| f3
    f2_2 -->|"red"| f0
    f2_2 -->|"pending"| f2_3
    f3 --> f3_0
    f3_0 -->|"yes"| f3_1
    f3_0 -->|"no"| f3_2
    f4 --> f4_0
    f4_0 -->|"yes"| f4_1
    f4_0 -->|"no"| f4_2
```

## Source

### `rein.json`

<<< ../../../examples/rein/merge-pr/rein.json{json}

### `main.rein`

<<< ../../../examples/rein/merge-pr/main.rein{rein}

### `ci/fix.rein`

<<< ../../../examples/rein/merge-pr/ci/fix.rein{rein}

### `merge_pr.rein`

<<< ../../../examples/rein/merge-pr/merge_pr.rein{rein}

### `review_code.rein`

<<< ../../../examples/rein/merge-pr/review_code.rein{rein}

### `security/review.rein`

<<< ../../../examples/rein/merge-pr/security/review.rein{rein}
