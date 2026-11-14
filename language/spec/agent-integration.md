## 12. Agent integration

`rein hook` is the runtime side of an agent hook. The hook is built on polyhook, so the same hook code works across agents. Rein does not write the agent's hook config. There is no installer for it.

- The hook runs `rein hook --caller claude-code` on two events: `SessionStart` and `UserPromptSubmit`.
- `SessionStart` marks the session as pending. It writes nothing to the agent.
- The first `UserPromptSubmit` of a pending session gets the agent context (`rein agent-context`) as `additionalContext`. Later prompts of that session get nothing. A `SessionStart` from a resume, clear or compact makes the next prompt pending again.
- Every other event is a no-op: no output, exit 0. Errors are a no-op too, with the reason on stderr. The hook never blocks the agent.
- Other tools have no hook yet.

The context block says what flows are, lists the visible flows with their descriptions, and shows the stepping rule from section 11.
