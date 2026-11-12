# Agent interface

Status: proof of concept. The MCP host, `rein run`, `rein list` and `rein show` are built. Harness enforcement is a proposal.

A Rein program is a running app. The agent finds it by name, starts it, and answers it step by step. The program keeps its state while it runs. The agent does not resend earlier answers.

## Authoring stays the same

- A program is written in `.rein` files, in the TypeScript-like syntax of [spec.md](spec.md).
- Each parameter is a question. Its doc comment is the question text.
- Functions reference each other with `@./path` and `@../path`.
- A parameter asks for a fact. A `request` asks the agent to do a step, then answer.
- The evaluator in `rein_core::step` is not changed. Every interface below calls it.

## Programs are named apps

Programs are named apps. To install, list, and remove them, see [Install a program](docs/install-programs.md).

- `rein run <name>` starts the program from any directory.

## Agents can author programs

An agent can write a program, then use it:

1. The agent writes a program folder with a `main.rein` and a manifest. The [install page](docs/install-programs.md) describes the manifest.
2. The agent runs `rein check <folder>`.
3. The agent installs the folder as described in [Install a program](docs/install-programs.md).
4. The agent, or another agent, starts it with `rein_start` or `rein run <name>`.

This is why programs are visible files. An agent reads and writes visible files with its normal tools. It does not need to know about a dot-folder. `rein show` gives an agent the source of any installed program, so it can read a program before it changes or copies it.

## The MCP host is the primary interface

Claude Code and Codex call tools. They cannot keep a stdin open across tool calls. So the running program lives in a host process, and the agent talks to it through MCP.

`rein serve --mcp` is a long-running MCP server on stdio. It holds live runs in memory. It uses rmcp, the official Rust MCP SDK.

| Tool | Arguments | Returns |
| --- | --- | --- |
| `rein_programs` | none | Each program: name, description, path, scope, and `first_step`. |
| `rein_show` | `name` | The program source. |
| `rein_start` | `name` | The first step, with `run`, the run id. |
| `rein_answer` | `run_id`, `value` | The next step. A wrong value returns an error step. The run stays alive and waits on the same key. |
| `rein_status` | `run_id` | The step the run waits on, with its trace and the answers so far. |
| `rein_stop` | `run_id` | `{"run": ..., "stopped": true}`. The host forgets the run. |
| `rein_list` | none | The live runs, each with its current step. |

- A step has the same shape as a `rein step` response, plus `run`.
- `rein_answer` answers the key the run waits on. The agent sends only the value.
- An unknown run id is a tool error.
- Runs live until `rein_stop` or until the host exits. Saving runs to disk, to resume after a crash, is not built. It is optional, and it is not the main path.

Register it in Claude Code:

```text
claude mcp add rein -- rein serve --mcp
```

### Worked example over MCP

This is real output. A small Python client spoke JSON-RPC to `rein serve --mcp` in `examples/`. `>>` is a message to the host. `<<` is the tool text. Long lines are cut with `...`.

```text
>> {"jsonrpc": "2.0", "method": "tools/list", "id": 2}
<< tools: ['rein_answer', 'rein_list', 'rein_programs', 'rein_show', 'rein_start', 'rein_status', 'rein_stop']
>> tools/call rein_start {"name": "support-ticket"}
<< {"answers":{},"description":"Is the customer on the VIP plan?","function":"main","key":"main.vip","kind":"question","name":"vip","options":null,"run":"run-1","trace":["main"],"type":"boolean","version":1}
>> tools/call rein_answer {"run_id": "run-1", "value": "maybe"}
<< {"answers":{"main.vip":"maybe"},"diagnostics":[],"key":"main.vip","kind":"error","message":"invalid value `maybe` for `vip`; expected true, false, yes or no","run":"run-1","trace":[],"version":1}
>> tools/call rein_answer {"run_id": "run-1", "value": "no"}
<< {"answers":{"main.vip":"no"},"description":"What category best fits the ticket?","function":"main","key":"main.category","kind":"question","name":"category","options":["billing","account","how_to"],"run":"run-1","trace":["main"],"type":"union","version":1}
>> tools/call rein_answer {"run_id": "run-1", "value": "how_to"}
<< {"answers":{"main.category":"how_to","main.vip":"no"},"description":"Did you find a help article that answers the question?","function":"answer/faq","key":"answer/faq.articleFound","kind":"question",...,"run":"run-1","trace":["main","answer/faq"],...}
>> tools/call rein_answer {"run_id": "run-1", "value": "yes"}
<< {...,"instruction":"Reply with the help article link and ask the customer if it solved the problem.","key":"answer/faq.solved","kind":"request",...,"run":"run-1",...}
>> tools/call rein_answer {"run_id": "run-1", "value": "yes"}
<< {"answers":{"answer/faq.articleFound":"yes","answer/faq.solved":"yes","main.category":"how_to","main.vip":"no"},"instruction":"Close the ticket as solved.","kind":"done","run":"run-1","trace":["main","answer/faq"],"version":1}
>> tools/call rein_stop {"run_id": "run-1"}
<< {"run":"run-1","stopped":true}
```

The bad answer `maybe` did not end the run. The next answer went to the same key. The test `crates/rein/tests/mcp.rs` runs the same walk.

## `rein run`: one live run over stdio

`rein run <name>` starts one program as a process. It is for people, tests, and embedding in other programs.

- It writes one step per line to stdout. The step shape is the same as `rein step`.
- It reads one answer per line on stdin.
- With `--json`, an answer line is `{"key": "main.vip", "value": "no"}`. `key` is optional. The default is the key the run waits on.
- Without `--json`, it prints text and a `> ` prompt. A person types the value.
- A bad answer prints an error step. The run then asks the same step again.
- The run ends on `done` with exit code 0. A program that cannot start ends with exit code 1.
- When stdin closes first, the exit code says what the run waits on: 2 for a question, 3 for a request.

### Worked example over stdio

Real output, from `examples/`:

```text
$ rein list
incident-triage	project	.../examples/rein/incident-triage	Decide how the on-call agent handles a new production alert.	first: Are customers seeing errors or downtime right now?
merge-pr	project	.../examples/rein/merge-pr	Decide the next step for a pull request task.	first: Which task does the agent do?
support-ticket	project	.../examples/rein/support-ticket	Decide how the support agent handles a customer ticket.	first: Is the customer on the VIP plan?

$ printf 'no\nhow_to\nyes\nyes\n' | rein run support-ticket
question: main.vip: boolean - Is the customer on the VIP plan?
> question: main.category: "billing" | "account" | "how_to" - What category best fits the ticket?
> question: answer/faq.articleFound: boolean - Did you find a help article that answers the question?
> request: Reply with the help article link and ask the customer if it solved the problem.
then answer: answer/faq.solved: boolean - Did the customer confirm the article solved the problem?
> Close the ticket as solved.
trace: main -> answer/faq
# exit 0
```

With `--json`, the same run prints one JSON step per line. The test `run_json_lines_walks_to_done_and_survives_a_bad_answer` in `crates/rein/tests/step.rs` checks it.

After you install `support-ticket` ([Install a program](docs/install-programs.md)), it starts by name from any directory:

```text
$ cd /some/other/dir
$ printf 'yes\n' | rein run support-ticket
question: main.vip: boolean - Is the customer on the VIP plan?
> Assign the ticket to the tier 2 queue. Tell the customer a person will reply within one business day. Do not promise a refund or a fix.
trace: main -> escalate
```

## `rein step` stays for replay

Stateless `rein step` does not change. It is for replay, debugging, and tests. The same answers always give the same step. The old single-function `rein run FUNCTION --set ...` is now `rein eval`.

## Harness enforcement (proposal)

This part is not built.

- A hook injects the current step of each live run into the agent context, on each prompt. The agent sees what the program waits on.
- A Stop hook blocks the agent from ending its turn while a run waits on a step. The hook tells the agent to answer the step or to call `rein_stop`.
- The hooks read the live runs from the host, with `rein_list`.
- The harness then enforces the program the way an operating system enforces a process. The agent cannot drift away from it.

## Not in scope

- Graph editors.
- Links between agents.
- Protocol layers above MCP.

## Conflicts with spec section 11

- Section 11 says the runtime keeps nothing between calls. The evaluator still keeps nothing. The MCP host and `rein run` keep the answers in memory, above the evaluator.
- A step from `rein_start`, `rein_answer` and `rein_status` has a `run` field. A `rein step` response does not. MCP steps list their keys in alphabetical order.
- In `rein step`, a bad answer is an error with exit code 1. In a live run, a bad answer is an error step, and the run goes on.
- Sections 9 and 10 named the single-function command `rein run`. It is now `rein eval`. `rein run` starts a live run.
- Section 12 uses `rein install <tool>` for the hook config.
- The manifest `entry` can name a file other than `main.rein`. The checker still asks for a `main.rein` in each program.
