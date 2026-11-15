# The std function

Status: built. [Agent requirements](../agent-requirements.md).

Std has one function for the setup, `agentSetup`, and one std struct,
`Setup`. Like `request`, they need no import. The source is in
`crates/rein-core/std/agentSetup.rein` and `crates/rein-core/std/Setup.struct.rein`.

```ts
  /** Your setup. */
  const setup: Setup = await agentSetup(
    harness=`claude-code | codex`,
    model=`cheap`,
    effort=`>= medium`,
  );
```

`await agentSetup(...)` is short for `await request(agentSetup(...))`. The
std template gives the request text, and `Setup` is the answer type.

## The targets

Each argument is text in backticks, and each one is required. Write `any`
for a row with no target.

| Argument | Value | `"ok"` when the agent's value is |
| --- | --- | --- |
| `harness` | ids joined with ` \| `, such as `` `claude-code \| codex` `` | one of them |
| `model`, `effort` | a value, such as `` `cheap` ``, or `==` and a value | exactly that value |
| `model`, `effort` | `>=` and a value, such as `` `>= medium` `` | that value or a higher one |
| `model`, `effort` | `>` and a value, such as `` `> cheap` `` | a higher value |
| `model`, `effort` | `<=` and a value, such as `` `<= standard` `` | that value or a lower one |
| `model`, `effort` | `<` and a value, such as `` `< frontier` `` | a lower value |
| any | `` `any` `` | every value |

| Row | Values |
| --- | --- |
| harness (no order) | `claude-code`, `codex`, `gemini-cli`, `cursor`, `windsurf`, `cline`, `amp`, `hermes`, `pi`, or another name |
| model, lowest first | `cheap`, `standard`, `frontier` |
| effort, lowest first | `low`, `medium`, `high`, `xhigh`, `max` |

- A tier, not a model id. A model id ages, and each harness has its own ids.
  `cheap` is the smallest and fastest model of the harness, `frontier` the
  strongest, `standard` the one between.
- The operators follow the order in the table below. An exact target also
  fails on a stronger model, because a stronger model costs more. `>=`
  accepts it, and `<=` caps the cost.

## The result

`Setup` is a std struct with one row per target:

| Field | Type |
| --- | --- |
| `harness` | `"ok" \| "mismatch" \| "unknown"` |
| `model` | `"ok" \| "mismatch" \| "unknown"` |
| `effort` | `"ok" \| "mismatch" \| "unknown"` |

- `"ok"`: the agent matches the target, or the target is `any`.
- `"mismatch"`: the agent does not match the target.
- `"unknown"`: the agent cannot tell, such as when it cannot see its effort.

## How the agent answers

A call stops the run with one `request`, as in
[Stepping](../spec/stepping.md). The instruction gives the targets and the
order of the values. The agent rates each row and answers a `Setup`:

```json
{"kind": "request", "key": "main.setup", "function": "main",
 "instruction": "Check your setup against the targets of this program.\nHarness: claude-code | codex. Model tier: cheap. Effort: >= medium. ...",
 "response": {"name": "setup", "type": "struct", "fields": [
  {"name": "harness", "type": "union", "options": ["ok", "mismatch", "unknown"]},
  {"name": "model", "type": "union", "options": ["ok", "mismatch", "unknown"]},
  {"name": "effort", "type": "union", "options": ["ok", "mismatch", "unknown"]}]}}
```

- The answer is a JSON object, such as
  `{"harness": "ok", "model": "mismatch", "effort": "ok"}`.
- The step protocol does not change: this is a struct answer.
- Rein does not check the answer against the real session. MCP does not send
  the model or the effort. The agent knows them from its own context.

## Checker rules

- A call is `const NAME: Setup = await agentSetup(...);`, with a doc comment,
  in an `async` function. The rules of
  [Async requests](../spec/async-requests.md) apply.
- The three arguments are named and required, as for every template call. A
  missing one is an error: `` missing argument `effort` in call to
  `agentSetup`; write `effort=value` ``.
- A file that declares its own `interface Setup` uses its own struct.
