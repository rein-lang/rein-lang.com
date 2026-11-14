## The interface today

| Contract | Today | Source |
| --- | --- | --- |
| Trigger | One context block on the first prompt. The agent decides when a task matches a program. | [hook.rs](../../crates/rein/src/hook.rs) |
| Step | The MCP host keeps the answers of a live run in memory. `rein step` stays for replay, and there the agent sends every answer. | [interface.md](../interface.md) |
| Answer source | The agent answers every question. | [decisions.md](../decisions.md), last open question |
| Outcome | `done` holds free text. | [spec.md section 11](../spec/stepping.md#11-stepping-agent-interface) |

## Findings

Measured on 2026-11-11 with the installed `rein 0.1.0`. The commit of that build is not known. On commit `9d65e21`, the test `reference_cycle_hits_the_hop_limit` in [step.rs](../../crates/rein-core/src/step.rs) asserts the error of finding 1.

1. A reached reference cycle always ends in an error. An answer key is `<function>.<name>`, so a second visit gets the same answers and takes the same path. A call with return (`await`) is the exception: the keys inside it start with the caller's answer key and `>`, such as `main.b>fn.ok`, so each call, and each level of a recursive call, gets its own answers ([spec.md section 11](../spec/stepping.md#11-stepping-agent-interface)). Run the `merge-pr` example with these answers:

   ```text
   $ rein step --root <merge-pr example> --json \
       --answer main.task=merge --answer merge_pr.docs_only=no \
       --answer merge_pr.ci=red --answer merge_pr/fix.fix_pushed=yes
   {"kind":"error", ... "message":"flow did not finish in 64 steps (reference cycle?)", ...}
   ```

   That run failed on that commit. The `merge-pr` example now ends the retry with a text, so `merge_pr/fix` no longer references `merge_pr`.
2. On the CLI, a question exits with code 2 and a request exits with code 3. In Claude Code, the shell tool reports a non-zero exit code as an error. A normal result looks like a failure.
3. Nothing checks that the agent started a program or finished it. The hook gives advice only.
4. With `rein step`, the agent can change an earlier answer between two calls. The runtime cannot see the change, because it keeps nothing.
5. With `rein step`, each call repeats every answer. The command grows with the program, and the agent must copy each key exactly.
