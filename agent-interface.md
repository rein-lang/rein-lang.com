# Agent interface: proposal

Status: proposal. Not decided. No code implements it.
The current rules are in [spec.md section 11](spec/stepping.md#11-stepping-agent-interface) and [section 12](spec/agent-integration.md#12-agent-integration). The reasons for the current choices are in [decisions.md](decisions.md).

The built interface is in [interface.md](interface.md): the MCP host, `rein run`, and programs as named apps. This file proposes what comes next.

## Topics

- [Principle](agent-interface/principle.md): who judges, who acts, who remembers.
- [Current state](agent-interface/current-state.md): the interface today, and its findings.
- [Trigger](agent-interface/proposal-trigger.md): contract 1, the proposal for starting a program.
- [Step, answers and outcome](agent-interface/proposal-step-answers-outcome.md): contracts 2 to 4.
- [State between runs](agent-interface/state-between-runs.md): what a program keeps after a run.
- [Worked examples](agent-interface/worked-examples.md): merge-pr and incident-triage.
- [Transport](agent-interface/transport.md): MCP host and CLI.
- [Plan and open questions](agent-interface/plan-and-open-questions.md): what stays, the build order, and the open questions.
