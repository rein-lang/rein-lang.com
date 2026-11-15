# Agent requirements (proposal)

Status: `agentSetup` and `Setup` are built. The handler templates are a
proposal.

A program states which harness, model tier and effort suit it, with one std
function, `agentSetup`. Std tells the agent the program's targets and asks
for the matrix of its setup: harness, model tier and effort, one result per
row. The developer's code is only the
handlers: what happens when a row does not match.

Example: a program that only commits and pushes runs well on the cheapest
model of any harness, with medium effort or more. A review program needs the
strongest model and high effort.

## Why

- Most steps of a simple program need no strong model. A strong model costs
  more and runs slower.
- Some programs fail on a weak model or a low effort. The author knows this.
  The agent that starts the program does not.
- The ask and the compare are the same in every program, so they are std.
  What to do on a mismatch differs per program: send a subagent, open a new
  local or remote session, ask the user, or go on. That is the handler.

## Example

```ts
/**
 * Commit the staged changes and push them.
 */
export default async function main() {
  /** Your setup. */
  const setup: Setup = await agentSetup(
    harness=`any`,
    model=`cheap`,
    effort=`>= medium`,
  );

  switch (setup.effort) {
    case "ok":
      return `Commit the staged changes with a short message, then push.`;
    case "mismatch":
      return `Start a subagent on the cheapest model with effort medium.
Give it this task: run the commit-push program.`;
    case "unknown":
      return askUser(question=`Is your effort medium or higher?`);
  }
}
```

- `agentSetup(...)` is std. In one request it gives the agent the targets and
  asks it to rate its harness, model tier and effort against them. The answer
  is a `Setup`.
- `setup.effort` is `"ok"`, `"mismatch"` or `"unknown"`. The `switch` is the
  developer's code. A `switch` has no `default`, so it lists every case. An
  `if` handles only the case it tests, and the code after it handles the rest.
- Required or recommended is the handler's choice. Here a low effort sends a
  subagent, so effort is required. The model row has no handler, so the
  cheapest model is only a recommendation.

## Topics

- [The std function](agent-requirements/std-functions.md): `agentSetup`, its
  targets, the `Setup` result, and the checker rules.
- [Handlers](agent-requirements/handling.md): what a handler can do, the std
  templates for a bad setup, and hand-offs.
- [Scope, build order and decisions](agent-requirements/scope-and-plan.md).
