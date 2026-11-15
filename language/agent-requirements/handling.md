# Handlers

Status: the handler templates are a proposal. `agentSetup` is built. [Agent requirements](../agent-requirements.md).

A handler is the developer's code for one row of the `Setup`. The program
handles the row with `switch` or `if`, with no `else` and no `default`. Std does the
compare. The handler only says what the agent does next.

## What a handler can do

- Go on, maybe with a hint: ``return @./commit(hint=`...`);``.
- Send the work to a subagent with the right setup: `subagent(...)`.
- Open a new local or remote session: `localSession(...)`,
  `remoteSession(...)`.
- Ask the user: `askUser(...)`.
- Stop: return a text that says why.

## Required

```ts
  /** Your setup. */
  const setup: Setup = await agentSetup(
    harness=`any`,
    model=`>= frontier`,
    effort=`any`,
  );

  switch (setup.model) {
    case "ok":
      return @./review;
    case "mismatch":
      return remoteSession(
        harness=`claude-code`,
        model=`the strongest model`,
        effort=`high`,
        task=`Run the review program.`,
      );
    case "unknown":
      return askUser(question=`This review needs the strongest model. Go on?`);
  }
```

## Recommended

```ts
  /** Your setup. */
  const setup: Setup = await agentSetup(
    harness=`any`,
    model=`cheap`,
    effort=`any`,
  );

  if (setup.model === "mismatch") {
    return `Commit and push. A cheaper model can run this next time.`;
  }

  return `Commit and push.`;
```

The developer decides that `"ok"` and `"unknown"` go on with no hint.

## Std templates for a handler

Std adds three templates, next to `delegate` and `askUser`. `subagent` is
`delegate` plus `effort`. `delegate` stays as it is, because a new argument
would break every call of it today.

| Template | Text it gives the agent |
| --- | --- |
| `subagent({ model, effort, task })` | Start a subagent on `model` with effort `effort`, and give it `task`. |
| `localSession({ harness, model, effort, task })` | Open a new local `harness` session on `model` with effort `effort`, and run `task` in it. |
| `remoteSession({ harness, model, effort, task })` | Open a remote `harness` session on `model` with effort `effort`, and run `task` in it. |

- `task` usually starts the same program again. The new agent answers the
  checks again, and this time they pass.
- `model` is text, such as `the cheapest model`. The agent maps it to a model
  id of its harness. In Claude Code the Agent tool takes `model` (`haiku`,
  `sonnet`, `opus`, `fable`) and `effort` (`low` to `max`).
  Codex takes `codex exec -m <model> -c model_reasoning_effort=<effort>`.

## Hand-offs

A program can hand off to another program (`return @program/function`). The
target runs its own checks, if it has any, when the run reaches them. When a
handler sent a subagent, that subagent answers the checks.
