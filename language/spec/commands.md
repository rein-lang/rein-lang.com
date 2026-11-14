## 10. CLI

| Command | Purpose |
| --- | --- |
| `rein check [PATH]` | Check a project directory, a directory inside a project, or one `.rein` file. Default `.`. Prints `file:line:col: error: message` for the files under PATH. Exit code 1 when there are errors, when PATH does not exist, or when PATH is not a `.rein` file. |
| `rein eval [FUNCTION] [--root DIR] [--set name=value]... [--json]` | Evaluate one step. `FUNCTION` defaults to `main`. Prints the returned string, or `next: target` with the target's description and inputs. Exit code 2 when a parameter is needed. Exit code 3 when the agent must do a request. `--set` also gives a value to a `string` parameter. A name given twice with `--set` is an error. |
| `rein run [NAME] [--root DIR] [--entry FN] [--json]` | Run a program as a live process. Writes one step per line, reads one answer per line on stdin. See [interface.md](../interface.md). |
| `rein describe [FUNCTION] [--root DIR]` | Print the function's schema as JSON. `FUNCTION` defaults to `main`. Usable as an agent tool schema. A template's parameters have type `string`. |
| `rein graph [NAME \| --root DIR] [--refs] [--entry FN] [--input name=value]... [--answer key=value]... [--format mermaid\|dot\|json\|html] [-o FILE] [--open]` | Print the program graph. `NAME` is a program name (section 1a) or a `.rein` file. The default is the project around the current directory. The default view is the decision flow: one node per function, per question (its text, then `name: type`), per request, and per outcome (`done` text or `delegate`). An edge from a question has the answer as its label: `yes`, `no`, or union members. A hand-off edge has its named arguments. A dashed edge goes to a template that a call uses. `--refs` draws only one node per function and one edge per reference. Node ids are `f0`, `f1`, ... for the functions in name order, and `f<i>_<j>` for the steps of function `i` in source order, so the output is stable. The entry is drawn as a stadium shape. `--format` is `mermaid` (default), `dot` (Graphviz), `json`, or `html`. `-o FILE` writes to FILE. A `.svg` or `.png` FILE is rendered from DOT by Graphviz `dot`; when `dot` is not on PATH, the command fails and names it. JSON: `{version, view, entry, nodes: [{id, kind, function, label, entry?, name?, type?}], edges: [{from, to, kind, label?, args?: [{name, value}], taken?}], path?, current?}`. Node kinds: `function`, `question`, `condition`, `request`, `done`, `delegate`, `program` (a function of another program), `unresolved`. Edge kinds: `flow`, `handoff`, `template`, `call`. An `await @target` is a `request` node labelled `await @target` and `name: type`. A `call` edge goes from it to the target's node (a `program` node for another program), with the named arguments. Mermaid draws it thick (`==>`), DOT bold. The flow goes on from the `await` node. The graph shows functions, not calls. When a walk visits one function in several calls, its nodes are marked with the answers of its first call, in the order `rein step` walks (section 11). The `rein watch` graph follows the same rule. With `--entry`, `--input` or `--answer`, Rein first steps the flow with those values, as `rein step` does, with the same checks, error texts and exit code 1 on an error. The graph then marks the walk: the nodes and edges taken, the node where the walk stops (the next question, a request, or the outcome), and the rest dimmed. A missing answer stops the walk at its question. Mermaid uses the classes `taken`, `current` and `dimmed`; DOT uses colors and pen widths. JSON adds `path` (the ids of the nodes taken, in order), `current: {node, kind, key?}` (`kind` as the step response) and `taken: true` on each edge taken. The schema version stays 1: the fields are new and absent without a walk. `html` writes one page that draws the Mermaid diagram with mermaid 11.4.1 from cdn.jsdelivr.net, with a legend and the inputs and answers used. A `.html` FILE, or `--open`, picks `html` when `--format` is not given. `--open` opens the page in the default browser (`open` on macOS, `xdg-open` on Linux, nothing elsewhere). Without `-o`, it writes the page to a temporary file. |
| `rein debug [NAME \| --root DIR] [--entry FN] [--input name=value]... [--answer key=value]... [--port N] [--no-open]` | Debug a program in the browser. Serves one page on 127.0.0.1 (a free port unless `--port`), prints its URL, and opens it unless `--no-open`. Ctrl-C stops it. `--entry`, `--input` and `--answer` are optional starting values. A `string` input left unset is walked as the placeholder `<name>`, so the page always shows a step. The page can switch the entry. The page has one control per `string` input of the entry and per key the flow can ask for: yes/no, a list of the union members, or a text box (a struct answer is JSON). Empty is unset. On each change the page sends a step request to `POST /walk`. The server runs the step engine and answers `{step, mermaid, path, current, keys, placeholders}`: the step response, the graph with the walk marked as `rein graph --answer` marks it, the answer key of each question node, and the inputs walked as placeholders. `GET /schema` lists the controls: `{entry, functions, inputs: {function: [{name, description}]}, answers: [{key, type, options, fields, description}]}`. The server answers only a request whose Host is `127.0.0.1:PORT` or `localhost:PORT`. |
| `rein watch [--port N] [--no-open]` | Serve one page on 127.0.0.1 that lists the agents using rein now. Counter chips show the agents alive, and the newest run of each shown agent as waiting, done or error. Each agent has one card with its transport, cwd, session and pid. Each run has a status chip, its path as pills (the last pill is outlined while the run waits or fails), and a "now" line with the step it waits on. The newest run has a flow graph that marks the taken path and the "now" node. Its "Path" view shows only the functions on the path. Its "Whole program" view shows all functions. If the program changed since the run, the page shows "Program changed since this run" instead of the graph. Long text (instruction, question, answers, inputs, error, log lines) and earlier runs start closed. The page reads the run logs in `$REIN_RUNS_DIR`, else `$XDG_STATE_HOME/rein/runs`, else `~/.local/state/rein/runs`, and polls them every 2 s. Ended agents are hidden unless the page asks for them. It writes nothing. The server answers only a request whose Host is `127.0.0.1:PORT` or `localhost:PORT`. Ctrl-C stops it. |
| `rein step [--root DIR \| --flow NAME] [--entry FN] [--answer key=value]... [--input name=value]... [--stdin] [--json]` | Step the whole flow from its entry (`entry` in `rein.json`, else `main`, as `rein check` uses it). `--flow` picks a flow by name (section 1a); `--root` and `--flow` exclude each other. `--input` gives a value to a `string` parameter of the entry function. The agent-facing interface (section 11). |
| `rein list [-l] [-1] [-a] [-r] [-t] [--json] [PATTERN...]` | List the programs visible from here, as `ls` lists files. Names by default; `-l` for scope, version, path and description; `-a` for shadowed programs; PATTERN is a name glob. `rein flows` is an alias. |
| `rein show <NAME>` | Print a program's manifest and every `.rein` file, entry first. |
| `rein serve --mcp` | The MCP host. Holds live runs in memory. Tools: `rein_programs`, `rein_show`, `rein_start`, `rein_answer`, `rein_status`, `rein_stop`, `rein_list`. See [interface.md](../interface.md). |
| `rein agent-context [--format text\|json]` | Print the block an agent needs to use the visible flows (section 12). Prints nothing when there are none. |
| `rein hook [--caller NAME]` | The agent hook entry point (section 12). Reads one event on stdin. |
| `rein install [-g] <args>...` | Run `pnpm add --ignore-scripts <args>` in the npm folder: the repo's `rein/npm/`, or the user's with `-g`. See [Install a program](../install-programs.md). |
| `rein uninstall [-g] <args>...` | Run `pnpm remove <args>` in the same folder rules. |
| `rein update [-g] [<args>...]` | Run `pnpm update --ignore-scripts <args>` in the same folder rules. |
| `rein lsp` | Run the language server over stdio. See [Language server](editor-tools.md#language-server) for its features. |
| `rein dap` | Run the debug adapter over stdio (Debug Adapter Protocol). See [Debug adapter](editor-tools.md#debug-adapter). |

Exit codes: 0 for a text or reference result, 1 for an error, 2 for a parameter needed, 3 for a request.

Columns are 1-based and count Unicode characters. The language server counts character positions in UTF-16 code units, as the LSP protocol requires.

### Input request output

Text form:

```text
need input <name>: <type> - <description>
```

`<type>` is `boolean`, `string`, or a union as TypeScript writes it, such as `"green" | "red"`.

### Request output

Text form, from `rein eval` when the agent must act (exit code 3):

```text
request: <instruction>
then answer: <name>: <type> - <description>
hint: rerun with --set <name>=<value>
```

### Reference output

Text form, from `rein eval` when the next step is another function:

```text
next: <function>
  <description>
  <name>: <type> - <description>
```

### `rein eval --json`

Each run prints one of these objects:

```json
{"kind":"text","value":"..."}
{"kind":"ref","function":"...","description":"...","inputs":[...]}
{"kind":"need_input","input":{"name":"...","type":"boolean|union|string","options":["..."],"description":"..."}}
{"kind":"request","instruction":"...","response":{"name":"...","type":"boolean|union","options":["..."],"description":"..."}}
```

`options` appears only for `union` inputs. A boolean input has `"type":"boolean"`. A union input has `"type":"union"`, and its members are in `options`.

### `rein describe` output

```json
{
  "name": "merge_pr",
  "description": "...",
  "inputs": [
    {"name": "docs_only", "type": "boolean", "description": "..."},
    {"name": "ci", "type": "union", "options": ["green", "red", "pending"], "description": "..."}
  ]
}
```
