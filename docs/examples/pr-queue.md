---
description: "Merge the pull requests in a queue, one at a time. Shows a callback."
---

# pr-queue

A merge queue agent program. It merges the pull requests in a queue, one at a time. It shows a callback: a function that the caller passes, so the callee goes on to it when its work is done.

`main` picks a pull request and hands it to `merge` with `then=@./main`. `merge` does not know who called it. After the merge, it returns `then`, so the flow goes back to `main` for the next pull request.

## Files

| File | Function | Job |
| --- | --- | --- |
| `main.rein` | `main` | Entry point. Stops when the queue is empty. Picks the next pull request. |
| `merge.rein` | `merge` | Merges one pull request, then returns its callback `then`. |

## Run it

```sh
git clone https://github.com/rein-lang/examples
cd examples
rein check rein/pr-queue
rein step --root rein/pr-queue --json
```

## Graph

The decision flow, from `rein graph pr-queue`:

```mermaid
flowchart TD
    subgraph s0 ["main.rein"]
        f0(["main"])
        f0_0[/"request: #96;Open the merge queue. Look for a pull request that waits.#96;"/]
        f0_1{"Is a pull request waiting in the merge queue?<br/>waiting: boolean"}
        f0_2("Stop. The merge queue is empty.")
        f0_3[/"request: #96;Pick the oldest pull request.#96;<br/>pick: Pick"/]
    end
    subgraph s1 ["merge.rein"]
        f1[["merge(pr, then)"]]
        f1_0[/"request: #96;Merge ${pr}. Then delete its branch.#96;"/]
        f1_1{"Did the pull request merge?<br/>merged: boolean"}
        f1_2("askUser(question=#96;The merge of ${pr} failed. What do I do?#96;)")
        f1_3[["then"]]:::program
    end
    f0 --> f0_0
    f0_0 --> f0_1
    f0_1 -->|"no"| f0_2
    f0_1 -->|"yes"| f0_3
    f0_3 -->|"pr=pick.pr<br/>then=@./main"| f1
    f1 --> f1_0
    f1_0 --> f1_1
    f1_1 -->|"no"| f1_2
    f1_1 -->|"yes"| f1_3
    classDef program stroke-dasharray:4 2
```

## Source

### `package.json`

```json
{
  "name": "pr-queue",
  "version": "0.1.0",
  "description": "Merge the pull requests in a queue, one at a time. Shows a callback.",
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
interface Pick {
  /** The link of the pull request to merge next. */
  pr: string;
}

/**
 * Merge the pull requests in the queue, one at a time.
 */
export default async function main() {
  /** Is a pull request waiting in the merge queue? */
  const waiting: boolean = await request(
    `Open the merge queue. Look for a pull request that waits.`,
  );
  if (!waiting) {
    return `Stop. The merge queue is empty.`;
  }
  /** The next pull request in the queue. */
  const pick: Pick = await request(`Pick the oldest pull request.`);
  return @./merge(pr=pick.pr, then=@./main);
}
```

### `merge.rein`

```rein
interface Input {
  /** The link of the pull request to merge. */
  pr: string;
  /** Where the flow goes after the merge. */
  then: @;
}

/**
 * Merge one pull request, then go on to the callback.
 */
export default async function merge({ pr, then }: Input) {
  /** Did the pull request merge? */
  const merged: boolean = await request(
    `Merge ${pr}. Then delete its branch.`,
  );
  if (!merged) {
    return askUser(question=`The merge of ${pr} failed. What do I do?`);
  }
  return then;
}
```
