---
description: "Decide how the on-call agent handles a new production alert."
---

<!--@include: ../../../examples/rein/incident-triage/README.md-->

## Graph

The decision flow, from `rein graph incident-triage`:

```mermaid
flowchart TD
    subgraph s0 ["main.rein"]
        f0(["main"])
        f0_0{"Are customers seeing errors or downtime right now?<br/>customerImpact: boolean"}
        f0_1{"How severe is the alert?<br/>severity: #quot;sev1#quot; | #quot;sev2#quot; | #quot;sev3#quot;"}
        f0_2{"Does a runbook exist for this alert?<br/>knownRunbook: boolean"}
    end
    subgraph s1 ["page_human.rein"]
        f1[["page_human"]]
        f1_0("Page the on-call engineer now. Post the alert summary in the incident channel. Wait for an acknowledgement before you take any other step.")
    end
    subgraph s2 ["runbook/follow.rein"]
        f2[["runbook/follow"]]
        f2_0[/"request: #quot;Run the runbook steps for this alert. Then check the alert status and report whether it cleared.#quot;"/]
        f2_1{"Did the runbook steps clear the alert?<br/>fixed: boolean"}
        f2_2("Close the alert. Write a one-line note with the steps you ran.")
    end
    subgraph s3 ["ticket/open.rein"]
        f3[["ticket/open"]]
        f3_0{"Is there already an open ticket for this alert?<br/>ticketExists: boolean"}
        f3_1("Add the alert details as a comment on the open ticket.")
        f3_2("Create a ticket with the alert name, severity, and first graph link. Assign it to the owning team.")
    end
    f0 --> f0_0
    f0_0 -->|"yes"| f1
    f0_0 -->|"no"| f0_1
    f0_1 -->|"sev1"| f1
    f0_1 -->|"sev2 / sev3"| f0_2
    f0_2 -->|"yes"| f2
    f0_2 -->|"no"| f3
    f1 --> f1_0
    f2 --> f2_0
    f2_0 --> f2_1
    f2_1 -->|"yes"| f2_2
    f2_1 -->|"no"| f1
    f3 --> f3_0
    f3_0 -->|"yes"| f3_1
    f3_0 -->|"no"| f3_2
```

## Source

### `package.json`

<<< ../../../examples/rein/incident-triage/package.json{json}

### `rein.json`

<<< ../../../examples/rein/incident-triage/rein.json{json}

### `main.rein`

<<< ../../../examples/rein/incident-triage/main.rein{rein}

### `page_human.rein`

<<< ../../../examples/rein/incident-triage/page_human.rein{rein}

### `runbook/follow.rein`

<<< ../../../examples/rein/incident-triage/runbook/follow.rein{rein}

### `ticket/open.rein`

<<< ../../../examples/rein/incident-triage/ticket/open.rein{rein}
