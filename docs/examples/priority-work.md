---
title: "priority-work: await another function"
description: "A Rein program that uses await. It finds the high priority projects of a workplace with one function, then works on their pull requests with the result."
---

# priority-work

A program that needs the result of another function as a value. It finds the high priority projects of a workplace, then works on their pull requests.

`main` calls `find_projects` with `await`. The agent walks `find_projects` as it walks a hand-off: it answers its question and gets its final instruction. Then the agent does that instruction and answers `main.projects` with the result. `main` goes on with the answer.

## Files

| File | Function | Job |
| --- | --- | --- |
| `main.rein` | `main` | Entry point. Awaits `find_projects`, then routes on its result. |
| `find_projects.rein` | `find_projects` | Tells the agent how to find the priority repositories. |
| `open_prs.rein` | `open_prs` | Works on the open pull requests of the repositories. |

## Run it

```sh
git clone https://github.com/rein-lang/examples
cd examples
rein check rein/priority-work
rein step --flow priority-work --input workplace=~/work
```

## Graph

The decision graph, from `rein graph priority-work`:

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

```json
{
  "name": "priority-work",
  "version": "0.1.0",
  "description": "Find the high priority projects of a workplace, then work on their pull requests.",
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
interface Projects {
  /**
   * The high priority repositories (`owner/name`), comma-separated,
   * or `-`.
   */
  repos: string;
  /** Did find_projects find no repository? */
  none: boolean;
}

/**
 * Work on the high priority projects of a workplace.
 */
export default async function main(
  /** The workplace folder that lists the projects. */
  workplace: string,
) {
  /** The high priority repositories. */
  const projects: Projects = await @./find_projects(workplace=workplace);

  if (projects.none) {
    return `No priority project has activity.`;
  }

  return @./open_prs(repos=projects.repos);
}
```

### `find_projects.rein`

```rein
interface Input {
  /** The workplace folder that lists the projects. */
  workplace: string;
  /** Does the workplace have a priority list, such as `Ideas.md`? */
  has_list: boolean;
}

/**
 * Find the high priority repositories of a workplace that had activity
 * this week.
 */
export default function findProjects({ workplace, has_list }: Input) {
  if (!has_list) {
    return `Report that ${workplace} has no priority list.`;
  }

  return `Read the priority list in ${workplace}. Pick the high priority
  repositories with activity this week.`;
}
```

### `open_prs.rein`

```rein
interface Input {
  /** The repositories to work on, comma-separated. */
  repos: string;
  /** Does any of these repositories have an open pull request? */
  has_open_prs: boolean;
}

/**
 * Work on the open pull requests of the repositories, or open one.
 */
export default function openPrs({ repos, has_open_prs }: Input) {
  if (!has_open_prs) {
    return `Open a pull request for the oldest issue in ${repos}.`;
  }

  return `Merge the open pull requests in ${repos}, oldest first.`;
}
```
