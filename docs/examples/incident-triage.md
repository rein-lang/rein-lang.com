---
description: "Decide how the on-call agent handles a new production alert."
---

<!--@include: ../../../examples/rein/incident-triage/README.md-->

## Graph

The decision flow, from `rein graph incident-triage`:

```mermaid
flowchart TD
    subgraph s0 ["follow.rein"]
        f0[["follow"]]
        f0_0[/"request: ˋRun the runbook steps for this alert. Then check the alert status and<br/>report whether it cleared.ˋ"/]
        f0_1{"Did the runbook steps clear the alert?<br/>fixed: boolean"}
        f0_2("Close the alert. Write a one-line note with the steps you ran.")
    end
    subgraph s1 ["main.rein"]
        f1(["main"])
        f1_0{"Are customers seeing errors or downtime right now?<br/>customer_impact: boolean"}
        f1_1{"How severe is the alert?<br/>severity: #quot;sev1#quot; | #quot;sev2#quot; | #quot;sev3#quot;"}
        f1_2{"Does a runbook exist for this alert?<br/>known_runbook: boolean"}
    end
    subgraph s2 ["open.rein"]
        f2[["open"]]
        f2_0{"Is there already an open ticket for this alert?<br/>ticket_exists: boolean"}
        f2_1("Add the alert details as a comment on the open ticket.")
        f2_2("Create a ticket with the alert name, severity, and first graph link.<br/>Assign it to the owning team.")
    end
    subgraph s3 ["page_human.rein"]
        f3[["page_human"]]
        f3_0("Page the on-call engineer now. Post the alert summary in the incident<br/>channel. Wait for an acknowledgement before you take any other step.")
    end
    f0 --> f0_0
    f0_0 --> f0_1
    f0_1 -->|"yes"| f0_2
    f0_1 -->|"no"| f3
    f1 --> f1_0
    f1_0 -->|"yes"| f3
    f1_0 -->|"no"| f1_1
    f1_1 -->|"sev1"| f3
    f1_1 -->|"sev2 / sev3"| f1_2
    f1_2 -->|"yes"| f0
    f1_2 -->|"no"| f2
    f2 --> f2_0
    f2_0 -->|"yes"| f2_1
    f2_0 -->|"no"| f2_2
    f3 --> f3_0
```

## Source

### `package.json`

<<< ../../../examples/rein/incident-triage/package.json{json}

### `rein.json`

<<< ../../../examples/rein/incident-triage/rein.json{json}

### `main.rein`

<<< ../../../examples/rein/incident-triage/main.rein{rein}

### `follow.rein`

<<< ../../../examples/rein/incident-triage/follow.rein{rein}

### `open.rein`

<<< ../../../examples/rein/incident-triage/open.rein{rein}

### `page_human.rein`

<<< ../../../examples/rein/incident-triage/page_human.rein{rein}
