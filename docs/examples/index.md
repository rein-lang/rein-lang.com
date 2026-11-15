---
title: "Rein examples"
description: "Read and run example Rein processes: incident triage, pull request merge and review, support tickets, priority work, and two published programs."
---

# Examples

Each example below, except the published programs, is a process under `examples/rein/<name>/`, with a `package.json` manifest. Open one to read its files and run it.

- [incident-triage](/examples/incident-triage): Decide how the on-call agent handles a new production alert.
- [merge-pr](/examples/merge-pr): Decide the next step for a pull request task.
- [pr-handling](/examples/pr-handling): Decide the next step for a pull request: review it, fix it, or merge it.
- [priority-work](/examples/priority-work): Find the high priority projects of a workplace, then work on their pull requests.
- [support-ticket](/examples/support-ticket): Decide how the support agent handles a customer ticket.

A published program lives in its own repo. Install it with `rein install -g`:

- [logo-creation](/examples/logo-creation): Create a logo for a project. Shows bundled scripts and a script as a gate.
- [vscode-extension](/examples/vscode-extension): Ship a VS Code extension to the Marketplace. Shows a resumable process and hand-offs to other programs.

Clone [rein-lang/examples](https://github.com/rein-lang/examples), and run `rein list` from its folder to list them. Then run one by name. See [Install a program](docs/install-programs.md):

```sh
git clone https://github.com/rein-lang/examples
cd examples
rein list
rein run support-ticket
```
