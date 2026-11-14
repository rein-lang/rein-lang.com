---
description: "Find the high priority projects of a workplace, then work on their pull requests."
---

<!--@include: ../../../examples/rein/priority-work/README.md-->

## Graph

The decision flow, from `rein graph priority-work`:

```mermaid
flowchart TD
    subgraph s0 ["find_projects.rein"]
        f0[["find_projects(workplace)"]]
        f0_0{"Does the workplace have a priority list, such as ˋIdeas.mdˋ?<br/>has_list: boolean"}
        f0_1("Report that ${workplace} has no priority list.")
        f0_2("Read the priority list in ${workplace}. Pick the high priority<br/>repositories with activity this week.")
    end
    subgraph s1 ["main.rein"]
        f1(["main(workplace)"])
        f1_0[/"await @./find_projects<br/>projects: Projects"/]
        f1_1{"Did find_projects find no repository?<br/>projects.none: boolean"}
        f1_2("No priority project has activity.")
    end
    subgraph s2 ["open_prs.rein"]
        f2[["open_prs(repos)"]]
        f2_0{"Does any of these repositories have an open pull request?<br/>has_open_prs: boolean"}
        f2_1("Open a pull request for the oldest issue in ${repos}.")
        f2_2("Merge the open pull requests in ${repos}, oldest first.")
    end
    f0 --> f0_0
    f0_0 -->|"no"| f0_1
    f0_0 -->|"yes"| f0_2
    f1 --> f1_0
    f1_0 ==>|"workplace=workplace"| f0
    f1_0 --> f1_1
    f1_1 -->|"yes"| f1_2
    f1_1 -->|"no<br/>repos=projects.repos"| f2
    f2 --> f2_0
    f2_0 -->|"no"| f2_1
    f2_0 -->|"yes"| f2_2
```

## Source

### `package.json`

<<< ../../../examples/rein/priority-work/package.json{json}

### `rein.json`

<<< ../../../examples/rein/priority-work/rein.json{json}

### `main.rein`

<<< ../../../examples/rein/priority-work/main.rein{rein}

### `find_projects.rein`

<<< ../../../examples/rein/priority-work/find_projects.rein{rein}

### `open_prs.rein`

<<< ../../../examples/rein/priority-work/open_prs.rein{rein}
