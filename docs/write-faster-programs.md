---
title: "Write faster programs"
description: "Write Rein programs that run fast and reliably on a slow agent, such as a local model: fewer requests, scripts for facts, calls with return, shared programs, short answer keys and no early ends."
---

# Write faster programs

On a slow agent, most of the time goes to model calls. Each `request` is one call, and the agent reads the whole context for each call. So the shape of a program decides its speed. The rules below come from runs of Rein programs on a local model.

## Count requests, not lines

Each `request` costs one model call over the whole context. In one measured pull-request flow, the agent got about 25 questions before its review. Each question took 4 to 9 seconds.

Ask fewer questions. One request with a struct answer beats ten boolean requests. Let one script fill the struct. This example replaces three boolean requests:

```ts
interface Facts {
  /** Is the branch behind its base? */
  behind: boolean;
  /** The CI state of the pull request. */
  ci: "green" | "red" | "pending";
}

/** Check one pull request. */
export default async function check(
  /** The link of the pull request. */
  pr: string,
) {
  /** The facts of the pull request. */
  const facts: Facts = await request(
    `Run scripts/pr-facts.sh ${pr} from this program's folder.
    Answer with its JSON output.`,
  );

  if (facts.ci === "red") {
    return `Send the pull request to the fix step.`;
  }

  return `Send the pull request to review.`;
}
```

## Give the how: name a script for every fact

Name the script that gets each fact. Keep the model for judgment only.

A request that names only the fact makes the agent invent a method. In our runs, that took 60 to 110 seconds per question on a local model. A request that names a bundled script, which prints the typed answer, took about 5 seconds.

```ts
/** Check the branch of one pull request. */
export default async function check(
  /** The link of the pull request. */
  pr: string,
) {
  /** Is the branch behind its base? */
  const behind: boolean = await request(
    `Run scripts/behind.sh ${pr} from this program's folder.
    Answer yes when it prints behind.`,
  );

  return `Send the pull request to review.`;
}
```

Even for judgment, let one script gather all the text in a single call. See [Bundle scripts](/install-programs#bundle-scripts-built) for how a program ships its scripts.

## Never restart to go on

Do not tell the agent to start the program again. A restart asks every earlier question again. In our runs, each restart cost about 1.5 minutes.

Do not hand off back to an earlier function either. Rein replays the answers by key, so the second visit reuses the first answers. The run loops until it stops with `process did not finish in 64 steps (reference cycle?)`.

Use a call with return instead. Each call site has its own answer keys, so one function can run twice with fresh answers.

`main.rein`:

```ts
import { sync } from "./sync";

/** Sync a pull request twice, with a fresh answer for each call. */
export default async function main(
  /** The link of the pull request. */
  pr: string,
) {
  /** Did the first sync update the branch? */
  const first: "updated" | "failed" = await sync(pr=pr);

  /** Did the second sync update the branch? */
  const second: "updated" | "failed" = await sync(pr=pr);

  return `Both syncs ran. First: ${first}. Second: ${second}.`;
}
```

`sync.rein`:

```ts
/** Rebase the branch of a pull request on its base. */
export default async function sync(
  /** The link of the pull request. */
  pr: string,
) {
  /** Did the rebase finish without a conflict? */
  const clean: boolean = await request(
    `Run scripts/rebase.sh with the link ${pr}. Answer yes when it exits 0.`,
  );

  if (clean) {
    return `updated`;
  }

  return `failed`;
}
```

`rein step --root . --input pr=https://example.com/pr/1` asks for the first answer, and prints its key:

```text
then answer: main.first>sync.clean: boolean - Did the rebase finish without a conflict?
```

After that answer, the callee ends with text. The caller then asks for its own answer, `main.first`. The second call asks with its own keys, `main.second>sync.clean`.

## Share a program, not copies

Do not copy a sub-flow. Copies usually exist only because their last step differs. A call with return lets each caller choose its own next step, so one shared function replaces the copies.

The shared function returns one plain word for each outcome, and it must hold at least one `request`. A function with no request returns at once, and the checker warns that `async` has no `await`.

`release.rein` chooses its own next step after the same `sync` function:

```ts
import { sync } from "./sync";

/** Publish a pull request after its branch syncs. */
export default async function release(
  /** The link of the pull request. */
  pr: string,
) {
  /** Did the sync update the branch? */
  const synced: "updated" | "failed" = await sync(pr=pr);

  if (synced === "failed") {
    return `Stop the release. Tell the owner the branch did not sync.`;
  }

  return `Tag the release.`;
}
```

To share a whole program with another project, see [Call another program by its entry](/call-programs-by-entry).

## Keep answer keys easy to pass

The keys of awaited calls contain `>`, such as `main.first>sync.clean`. The agent must pass the full key, and quote it in the shell, because `>` is a redirect:

```sh
rein step --root . --input pr=https://example.com/pr/1 --answer 'main.first>sync.clean=yes'
```

Keep the nesting shallow and the `const` names short, so keys stay short. Do not ask the agent to build a key by hand in the request text. The step output prints the exact key, in its `then answer:` line.

## Do not end a run early

Every `return` ends the run. Return text only when the work of this run is done. When another question follows, ask it with a request. An early end costs a full replay: the next run asks every earlier question again.

```ts
/** Fix the branch of one pull request. */
export default async function fix(
  /** The link of the pull request. */
  pr: string,
) {
  /** Did the tests of the fix pass? */
  const tests_ok: boolean = await request(
    `Run scripts/tests.sh ${pr} from this program's folder.
    Answer yes when it exits 0.`,
  );

  if (!tests_ok) {
    return `Send the branch to the fix step.`;
  }

  return `Send the pull request to review.`;
}
```

See [Async requests](/reference/spec#async-requests) and [Calls with return](/reference/spec#calls-with-return) in the language reference.
