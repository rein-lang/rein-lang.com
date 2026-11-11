# Examples

Each example is a flow under `examples/rein/<flow>/`, with a `rein.json` manifest. Open one to read its files and run it.

- [incident-triage](/examples/incident-triage): Decide how the on-call agent handles a new production alert.
- [merge-pr](/examples/merge-pr): Decide the next step for a pull request task.
- [pr-handling](/examples/pr-handling): Decide the next step for a pull request: review it, fix it, or merge it.
- [support-ticket](/examples/support-ticket): Decide how the support agent handles a customer ticket.

Run `rein list` from the `examples` folder to list them. Then run one by name. See [flows and scopes](docs/spec.md#1a-flows-and-scopes):

```sh
cd examples
rein list
rein run support-ticket
```
