# Scope, build order and decisions

Status: step 1 is built. The rest is a proposal. [Agent requirements](../agent-requirements.md).

## Not in scope

- Rein does not start models, call model APIs, or count cost.
- Rein does not check the agent's answer against the real session.
- The std function is the ask, and the program's handlers are the only
  custom code.

## Build order

Each step is one small pull request.

1. Built: the std struct `Setup` and the std template `agentSetup`, with
   `await agentSetup(...)` as a built-in await. Tests in `rein-core`.
2. Built: completion for `agentSetup` in the language server (tested). Hover
   on it is not tested yet.
3. The std templates `subagent`, `localSession` and `remoteSession`.

## Decided

- The name is `agentSetup`.
- The model tiers are `cheap`, `standard` and `frontier`. They avoid the word
  `medium`, which effort uses.
- `Setup` holds only `ok`, `mismatch` or `unknown` per row, not the agent's
  raw values. Add raw-value fields when a handler needs them.
