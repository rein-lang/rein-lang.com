# Examples

Each example is a flow under `examples/.rein/<flow>/`, with a `main.rein` entry point. Open one to read its files and run it.

- [merge-pr](/examples/merge-pr): checks a pull request and picks the next step. Shows a reference cycle used as a retry.
- [incident-triage](/examples/incident-triage): route a production alert to a page, a runbook, or a ticket.
- [support-ticket](/examples/support-ticket): route a customer ticket. Shows a template and an async request.

Run `rein flows` from the `examples` folder to list them. Then step one by name. See [flows and scopes](docs/spec.md#1a-flows-and-scopes):

```sh
cd examples
rein flows
rein step --flow support-ticket --json
```
