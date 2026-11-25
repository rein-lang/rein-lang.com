---
title: "incident-triage: on-call alert process"
description: "A Rein process for an on-call agent. It asks three typed questions about a production alert, then pages a human, follows the runbook or opens a ticket."
---

# incident-triage

An on-call agent process. It decides how to handle a new production alert.

The process asks three questions: how severe the alert is, whether customers feel it, and whether a runbook exists. Then it picks one of three outcomes: page a human, follow the runbook, or open a ticket.

## Files

| File | Function | Job |
| --- | --- | --- |
| `main.rein` | `main` | Entry point. Routes the alert. |
| `page_human.rein` | `page_human` | Pages the on-call engineer. |
| `follow.rein` | `follow` | Asks the agent to run the known runbook and report whether the alert cleared. Pages a human if it did not. |
| `open.rein` | `open` | Opens or updates a ticket for non-urgent alerts. |

## Run it

```sh
git clone https://github.com/rein-lang/examples
cd examples
rein check rein/incident-triage
rein run incident-triage
```

## Graph

The decision graph, from `rein graph incident-triage`:

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

```json
{
  "name": "incident-triage",
  "version": "0.1.0",
  "description": "Decide how the on-call agent handles a new production alert.",
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
import { page_human } from "./page_human";
import { follow } from "./follow";
import { open } from "./open";

interface Alert {
  /** How severe is the alert? */
  severity: "sev1" | "sev2" | "sev3";
  /** Are customers seeing errors or downtime right now? */
  customer_impact: boolean;
  /** Does a runbook exist for this alert? */
  known_runbook: boolean;
}

/**
 * Decide how the on-call agent handles a new production alert.
 */
export default function main({
  severity,
  customer_impact,
  known_runbook,
}: Alert) {
  if (customer_impact) {
    return page_human;
  }

  switch (severity) {
    case "sev1":
      return page_human;
    case "sev2":
    case "sev3":
      if (known_runbook) {
        return follow;
      }

      return open;
  }
}
```

### `follow.rein`

```rein
import { page_human } from "./page_human";

/**
 * Follow the runbook for an alert that has one.
 */
export default async function followRunbook() {
  /** Did the runbook steps clear the alert? */
  const fixed: boolean = await request(
    `Run the runbook steps for this alert. Then check the alert status and
    report whether it cleared.`,
  );

  if (fixed) {
    return `Close the alert. Write a one-line note with the steps you ran.`;
  }

  return page_human;
}
```

### `open.rein`

```rein
/**
 * Open a ticket for an alert that needs follow-up but no page.
 */
export default function openTicket(
  /** Is there already an open ticket for this alert? */
  ticket_exists: boolean,
) {
  if (ticket_exists) {
    return `Add the alert details as a comment on the open ticket.`;
  }

  return `Create a ticket with the alert name, severity, and first graph link.
  Assign it to the owning team.`;
}
```

### `page_human.rein`

```rein
/**
 * Page the on-call engineer for an alert that needs a human now.
 */
export default function pageHuman() {
  return `Page the on-call engineer now. Post the alert summary in the incident
  channel. Wait for an acknowledgement before you take any other step.`;
}
```
