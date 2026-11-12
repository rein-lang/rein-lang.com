---
description: "Decide the next step for a pull request: review it, fix it, or merge it."
---

<!--@include: ../../../examples/rein/pr-handling/README.md-->

## Graph

The decision flow, from `rein graph pr-handling`:

```mermaid
flowchart TD
    subgraph s0 ["ci/fix.rein"]
        f0[["ci/fix(pr)"]]
        f0_0{"Why did the CI run fail?<br/>cause: #quot;test or code#quot; | #quot;flaky job#quot; | #quot;outside the pr#quot;"}
        f0_1("Run the failed job of ${pr} again, one time. If it fails again,<br/>start this program again for ${pr} with the cause test or code.")
        f0_2("askUser(question=#96;CI fails on ${pr} for a reason outside this pull request.<br/>Do I wait, or do I fix it in a new pull request?#96;)")
        f0_3[/"request: #96;Read the CI log of ${pr}. Find the first failing step. Fix the test<br/>or the code. Push one commit.#96;"/]
        f0_4{"Did you push a fix for the failing job?<br/>fixPushed: boolean"}
        f0_5("Wait for CI to finish on ${pr}. Then start this program again<br/>with the task merge.")
        f0_6("askUser(question=#96;I cannot fix the failing CI job of ${pr}. What do you want<br/>me to try?#96;)")
    end
    subgraph s1 ["comments/address.rein"]
        f1[["comments/address(pr)"]]
        f1_0{"Does the pull request have a review comment with no answer?<br/>openComments: boolean"}
        f1_1("No comment is open on ${pr}. Ask the reviewer for a new review.<br/>Then stop.")
        f1_2[/"request: #96;For each open comment on ${pr}: fix the code or reply with the reason<br/>you do not. Push one commit. Resolve each thread you fixed.#96;"/]
        f1_3{"Did you answer every open comment with a fix or a reply?<br/>allAnswered: boolean"}
        f1_4("Ask the reviewer for a new review of ${pr}. Then stop.")
        f1_5("askUser(question=#96;I cannot answer one or more review comments on ${pr}. Which<br/>change do you want?#96;)")
    end
    subgraph s2 ["main.rein"]
        f2(["main(pr)"])
        f2_0{"Is the pull request still a draft?<br/>draft: boolean"}
        f2_1("Stop. The pull request ${pr} is a draft. Wait until the author<br/>marks it ready.")
        f2_2{"Which task does the agent do on the pull request?<br/>task: #quot;review#quot; | #quot;address comments#quot; | #quot;fix ci#quot; | #quot;merge#quot;"}
    end
    subgraph s3 ["merge.rein"]
        f3[["merge(pr)"]]
        f3_0{"What is the CI status of the PR?<br/>ci: #quot;green#quot; | #quot;red#quot; | #quot;pending#quot;"}
        f3_1("Wait for CI to finish on ${pr}. Then start this program again.")
        f3_2{"Does the PR conflict with its base branch?<br/>conflicts: boolean"}
        f3_3("Rebase ${pr} on its base. Push. Then start this program again.")
        f3_4{"What is the review state of the PR?<br/>review: #quot;approved#quot; | #quot;changes requested#quot; | #quot;no review#quot;"}
        f3_5("Merge the pull request ${pr}. Then delete its branch.")
    end
    subgraph s4 ["review.rein"]
        f4[["review(pr)"]]
        f4_0{"Did you write this pull request yourself?<br/>ownPr: boolean"}
        f4_1("askUser(question=#96;This is my own pull request ${pr}. Who reviews it?#96;)")
        f4_2{"Does the PR change authentication, payments, or permissions code?<br/>securitySensitive: boolean"}
        f4_3[/"request: delegate(model=#quot;use opus model#quot;, task=#96;review the pull request ${pr}<br/>with a security focus and list each problem with file and line#96;)"/]
        f4_4{"Did the security review find a problem that must be fixed?<br/>securityProblem: boolean"}
        f4_5("@./templates/post_review(kind=#quot;request changes#quot;, body=#quot;each security problem, with its file and line#quot;, pr=pr)")
        f4_6("@./templates/post_review(kind=#quot;approve#quot;, body=#quot;the security checks you made#quot;, pr=pr)")
        f4_7[/"request: delegate(model=#quot;use haiku model#quot;, task=#96;review the pull request ${pr}<br/>and list each problem with file and line#96;)"/]
        f4_8{"What is the result of the code review?<br/>verdict: #quot;clean#quot; | #quot;small problems#quot; | #quot;blocking problems#quot;"}
        f4_9("@./templates/post_review(kind=#quot;approve#quot;, body=#quot;one line on what you checked#quot;, pr=pr)")
        f4_10("@./templates/post_review(kind=#quot;comment#quot;, body=#quot;each small problem, with its file and line#quot;, pr=pr)")
        f4_11("@./templates/post_review(kind=#quot;request changes#quot;, body=#quot;each blocking problem, with its file and line#quot;, pr=pr)")
    end
    subgraph s5 ["templates/post_review.rein"]
        f5[["templates/post_review(kind, body, pr)"]]
        f5_0("Post one review on the pull request ${pr}. Type: ${kind}. Body:<br/>${body}. Do not merge in this run.")
    end
    f0 --> f0_0
    f0_0 -->|"flaky job"| f0_1
    f0_0 -->|"outside the pr"| f0_2
    f0_0 -->|"test or code"| f0_3
    f0_3 --> f0_4
    f0_4 -->|"yes"| f0_5
    f0_4 -->|"no"| f0_6
    f1 --> f1_0
    f1_0 -->|"no"| f1_1
    f1_0 -->|"yes"| f1_2
    f1_2 --> f1_3
    f1_3 -->|"yes"| f1_4
    f1_3 -->|"no"| f1_5
    f2 --> f2_0
    f2_0 -->|"yes"| f2_1
    f2_0 -->|"no"| f2_2
    f2_2 -->|"review<br/>pr=pr"| f4
    f2_2 -->|"address comments<br/>pr=pr"| f1
    f2_2 -->|"fix ci<br/>pr=pr"| f0
    f2_2 -->|"merge<br/>pr=pr"| f3
    f3 --> f3_0
    f3_0 -->|"red<br/>pr=pr"| f0
    f3_0 -->|"pending"| f3_1
    f3_0 -->|"green"| f3_2
    f3_2 -->|"yes"| f3_3
    f3_2 -->|"no"| f3_4
    f3_4 -->|"approved"| f3_5
    f3_4 -->|"changes requested<br/>pr=pr"| f1
    f3_4 -->|"no review<br/>pr=pr"| f4
    f4 --> f4_0
    f4_0 -->|"yes"| f4_1
    f4_0 -->|"no"| f4_2
    f4_2 -->|"yes"| f4_3
    f4_3 --> f4_4
    f4_4 -->|"yes"| f4_5
    f4_5 -.-> f5
    f4_4 -->|"no"| f4_6
    f4_6 -.-> f5
    f4_2 -->|"no"| f4_7
    f4_7 --> f4_8
    f4_8 -->|"clean"| f4_9
    f4_9 -.-> f5
    f4_8 -->|"small problems"| f4_10
    f4_10 -.-> f5
    f4_8 -->|"blocking problems"| f4_11
    f4_11 -.-> f5
    f5 --> f5_0
```

## Source

### `package.json`

<<< ../../../examples/rein/pr-handling/package.json{json}

### `rein.json`

<<< ../../../examples/rein/pr-handling/rein.json{json}

### `main.rein`

<<< ../../../examples/rein/pr-handling/main.rein{rein}

### `ci/fix.rein`

<<< ../../../examples/rein/pr-handling/ci/fix.rein{rein}

### `comments/address.rein`

<<< ../../../examples/rein/pr-handling/comments/address.rein{rein}

### `merge.rein`

<<< ../../../examples/rein/pr-handling/merge.rein{rein}

### `review.rein`

<<< ../../../examples/rein/pr-handling/review.rein{rein}

### `templates/post_review.rein`

<<< ../../../examples/rein/pr-handling/templates/post_review.rein{rein}
