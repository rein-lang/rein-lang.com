# Examples

Each example is a small project with a `main.rein` entry point. Open one to read its files and run it.

- [merge-pr](/examples/merge-pr): checks a pull request and picks the next step. Shows a reference cycle used as a retry.
- [incident-triage](/examples/incident-triage): route a production alert to a page, a runbook, or a ticket.
- [support-ticket](/examples/support-ticket): route a customer ticket. Shows a template and an async request.

Run any example from the repository root:

```sh
cargo run -p rein -- run --root examples/merge-pr
```
