---
description: "Decide how the support agent handles a customer ticket."
---

<!--@include: ../../../examples/rein/support-ticket/README.md-->

## Graph

The decision flow, from `rein graph support-ticket`:

```mermaid
flowchart TD
    subgraph s0 ["escalate.rein"]
        f0[["escalate"]]
        f0_0("Assign the ticket to the tier 2 queue. Tell the customer a person<br/>will reply within one business day. Do not promise a refund or a fix.")
    end
    subgraph s1 ["faq.rein"]
        f1[["faq"]]
        f1_0{"Did you find a help article that answers the question?<br/>article_found: boolean"}
        f1_1[/"request: ˋReply with the help article link and ask the customer if it solved the<br/>problem.ˋ"/]
        f1_2{"Did the customer confirm the article solved the problem?<br/>solved: boolean"}
        f1_3("@./faq/close_ticket(opening=ˋGlad the help article solved the problem.ˋ, next_step=ˋReply to this ticket if it comes back.ˋ)")
    end
    subgraph s2 ["faq/close_ticket.rein"]
        f2[["faq/close_ticket(opening, next_step)"]]
        f2_0("Tell the customer: ${opening} ${next_step} Then close the ticket as<br/>solved.")
    end
    subgraph s3 ["main.rein"]
        f3(["main"])
        f3_0{"Is the customer on the VIP plan?<br/>vip: boolean"}
        f3_1{"What category best fits the ticket?<br/>category: #quot;billing#quot; | #quot;account#quot; | #quot;how_to#quot;"}
    end
    subgraph s4 ["refund.rein"]
        f4[["refund"]]
        f4_0{"Is the requested refund above the agent's limit?<br/>refund_over_limit: boolean"}
        f4_1("@./refund/tell_customer(opening=ˋRefund the amount the customer asked for and confirm it in the<br/>ticket.ˋ, next_step=ˋThen tell the customer the refund takes 5 business days.ˋ)")
    end
    subgraph s5 ["refund/tell_customer.rein"]
        f5[["refund/tell_customer(opening, next_step)"]]
        f5_0("${opening} ${next_step}")
    end
    f0 --> f0_0
    f1 --> f1_0
    f1_0 -->|"no"| f0
    f1_0 -->|"yes"| f1_1
    f1_1 --> f1_2
    f1_2 -->|"yes"| f1_3
    f1_3 -.-> f2
    f1_2 -->|"no"| f0
    f2 --> f2_0
    f3 --> f3_0
    f3_0 -->|"yes"| f0
    f3_0 -->|"no"| f3_1
    f3_1 -->|"billing"| f4
    f3_1 -->|"account"| f0
    f3_1 -->|"how_to"| f1
    f4 --> f4_0
    f4_0 -->|"yes"| f0
    f4_0 -->|"no"| f4_1
    f4_1 -.-> f5
    f5 --> f5_0
```

## Source

### `package.json`

<<< ../../../examples/rein/support-ticket/package.json{json}

### `rein.json`

<<< ../../../examples/rein/support-ticket/rein.json{json}

### `main.rein`

<<< ../../../examples/rein/support-ticket/main.rein{rein}

### `escalate.rein`

<<< ../../../examples/rein/support-ticket/escalate.rein{rein}

### `faq.rein`

<<< ../../../examples/rein/support-ticket/faq.rein{rein}

### `faq/close_ticket.rein`

<<< ../../../examples/rein/support-ticket/faq/close_ticket.rein{rein}

### `message.struct.rein`

<<< ../../../examples/rein/support-ticket/message.struct.rein{rein}

### `refund.rein`

<<< ../../../examples/rein/support-ticket/refund.rein{rein}

### `refund/tell_customer.rein`

<<< ../../../examples/rein/support-ticket/refund/tell_customer.rein{rein}
