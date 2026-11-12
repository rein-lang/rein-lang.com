---
description: "Decide how the support agent handles a customer ticket."
---

<!--@include: ../../../examples/rein/support-ticket/README.md-->

## Graph

The decision flow, from `rein graph support-ticket`:

```mermaid
flowchart TD
    subgraph s0 ["answer/faq.rein"]
        f0[["answer/faq"]]
        f0_0{"Did you find a help article that answers the question?<br/>articleFound: boolean"}
        f0_1[/"request: #quot;Reply with the help article link and ask the customer if it solved the problem.#quot;"/]
        f0_2{"Did the customer confirm the article solved the problem?<br/>solved: boolean"}
        f0_3("@../templates/close_ticket(opening=#quot;Glad the help article solved the problem.#quot;, nextStep=#quot;Reply to this ticket if it comes back.#quot;)")
    end
    subgraph s1 ["billing/refund.rein"]
        f1[["billing/refund"]]
        f1_0{"Is the requested refund above the agent's limit?<br/>refundOverLimit: boolean"}
        f1_1("@../templates/tell_customer(opening=#quot;Refund the amount the customer asked for and confirm it in the ticket.#quot;, nextStep=#quot;Then tell the customer the refund takes 5 business days.#quot;)")
    end
    subgraph s2 ["escalate.rein"]
        f2[["escalate"]]
        f2_0("Assign the ticket to the tier 2 queue. Tell the customer a person will reply within one business day. Do not promise a refund or a fix.")
    end
    subgraph s3 ["main.rein"]
        f3(["main"])
        f3_0{"Is the customer on the VIP plan?<br/>vip: boolean"}
        f3_1{"What category best fits the ticket?<br/>category: #quot;billing#quot; | #quot;account#quot; | #quot;how_to#quot;"}
    end
    subgraph s4 ["templates/close_ticket.rein"]
        f4[["templates/close_ticket(opening, nextStep)"]]
        f4_0("Tell the customer: ${opening} ${nextStep} Then close the ticket as solved.")
    end
    subgraph s5 ["templates/tell_customer.rein"]
        f5[["templates/tell_customer(opening, nextStep)"]]
        f5_0("${opening} ${nextStep}")
    end
    f0 --> f0_0
    f0_0 -->|"no"| f2
    f0_0 -->|"yes"| f0_1
    f0_1 --> f0_2
    f0_2 -->|"yes"| f0_3
    f0_3 -.-> f4
    f0_2 -->|"no"| f2
    f1 --> f1_0
    f1_0 -->|"yes"| f2
    f1_0 -->|"no"| f1_1
    f1_1 -.-> f5
    f2 --> f2_0
    f3 --> f3_0
    f3_0 -->|"yes"| f2
    f3_0 -->|"no"| f3_1
    f3_1 -->|"billing"| f1
    f3_1 -->|"account"| f2
    f3_1 -->|"how_to"| f0
    f4 --> f4_0
    f5 --> f5_0
```

## Source

### `package.json`

<<< ../../../examples/rein/support-ticket/package.json{json}

### `rein.json`

<<< ../../../examples/rein/support-ticket/rein.json{json}

### `main.rein`

<<< ../../../examples/rein/support-ticket/main.rein{rein}

### `answer/faq.rein`

<<< ../../../examples/rein/support-ticket/answer/faq.rein{rein}

### `billing/refund.rein`

<<< ../../../examples/rein/support-ticket/billing/refund.rein{rein}

### `escalate.rein`

<<< ../../../examples/rein/support-ticket/escalate.rein{rein}

### `templates/close_ticket.rein`

<<< ../../../examples/rein/support-ticket/templates/close_ticket.rein{rein}

### `templates/message.struct.rein`

<<< ../../../examples/rein/support-ticket/templates/message.struct.rein{rein}

### `templates/tell_customer.rein`

<<< ../../../examples/rein/support-ticket/templates/tell_customer.rein{rein}
