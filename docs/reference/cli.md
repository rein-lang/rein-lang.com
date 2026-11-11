# Command-Line Help for `rein`

This document contains the help content for the `rein` command-line program.

**Command Overview:**

* [`rein`↴](#rein)
* [`rein check`↴](#rein-check)
* [`rein run`↴](#rein-run)
* [`rein eval`↴](#rein-eval)
* [`rein step`↴](#rein-step)
* [`rein describe`↴](#rein-describe)
* [`rein graph`↴](#rein-graph)
* [`rein list`↴](#rein-list)
* [`rein show`↴](#rein-show)
* [`rein serve`↴](#rein-serve)
* [`rein agent-context`↴](#rein-agent-context)
* [`rein hook`↴](#rein-hook)
* [`rein install`↴](#rein-install)
* [`rein lsp`↴](#rein-lsp)

## `rein`

A small language for agent decision flows

**Usage:** `rein <COMMAND>`

###### **Subcommands:**

* `check` — Check a project directory, or one .rein file, and print diagnostics
* `run` — Run a flow as a live process. Writes one step per line, reads one answer per line on stdin
* `eval` — Evaluate one function, for debugging. Agents use `rein run` or `rein step`
* `step` — Step the whole flow from `main`. This is the agent-facing interface: answer one key per call
* `describe` — Print a function's schema as JSON
* `graph` — Print the reference graph as a Mermaid flowchart
* `list` — List the programs visible from here: name, scope, path, description, and first question
* `show` — Print a program's source: its manifest and every .rein file
* `serve` — Serve the agent interface. Holds live runs in memory
* `agent-context` — Print the block an agent needs to use the visible flows
* `hook` — The agent hook entry point. Reads one event on stdin. Run by the agent, not by hand
* `install` — Register a program folder in the user programs folder, or write a tool's hook config (`claude-code`)
* `lsp` — Run the language server on stdio



## `rein check`

Check a project directory, or one .rein file, and print diagnostics

**Usage:** `rein check [PATH]`

###### **Arguments:**

* `<PATH>` — Project directory or .rein file

  Default value: `.`



## `rein run`

Run a flow as a live process. Writes one step per line, reads one answer per line on stdin

**Usage:** `rein run [OPTIONS] [FLOW]`

###### **Arguments:**

* `<FLOW>` — Program to run, by name (see `rein list`)

###### **Options:**

* `--root <ROOT>` — Project root. Default: the nearest directory with main.rein
* `--entry <ENTRY>` — Function to start from, as its path under the root without `.rein`. Default: `main`
* `--json` — Speak JSON Lines: one step object out, one `{"key","value"}` answer in, per line



## `rein eval`

Evaluate one function, for debugging. Agents use `rein run` or `rein step`

**Usage:** `rein eval [OPTIONS] [FUNCTION]`

###### **Arguments:**

* `<FUNCTION>` — Function name, as its path under the root without `.rein`. Default: `main`

  Default value: `main`

###### **Options:**

* `--root <ROOT>` — Project root. Default: the nearest directory with main.rein
* `--set <NAME=VALUE>` — Input value as name=value. Repeat for each input
* `--json` — Print the result as JSON



## `rein step`

Step the whole flow from `main`. This is the agent-facing interface: answer one key per call

**Usage:** `rein step [OPTIONS]`

###### **Options:**

* `--entry <ENTRY>` — Function to start from, as its path under the root without `.rein`. Default: `main`
* `--root <ROOT>` — Project root. Default: the nearest directory with main.rein
* `--flow <FLOW>` — Flow to step, by name, from the scoped `rein/` folders (see `rein list`)
* `--answer <KEY=VALUE>` — Answer as key=value, such as `merge_pr.ci=green`. Repeat for each answer
* `--input <NAME=VALUE>` — Value of a `string` parameter of the entry function, as name=value. Repeat for each input
* `--stdin` — Read the whole request as JSON from stdin. Output is always JSON
* `--json` — Print the response as JSON



## `rein describe`

Print a function's schema as JSON

**Usage:** `rein describe [OPTIONS] [FUNCTION]`

###### **Arguments:**

* `<FUNCTION>` — Function name. Default: `main`

  Default value: `main`

###### **Options:**

* `--root <ROOT>` — Project root. Default: the nearest directory with main.rein



## `rein graph`

Print the reference graph as a Mermaid flowchart

**Usage:** `rein graph [OPTIONS]`

###### **Options:**

* `--root <ROOT>` — Project root. Default: the nearest directory with main.rein



## `rein list`

List the programs visible from here: name, scope, path, description, and first question

**Usage:** `rein list [OPTIONS]`

###### **Options:**

* `--json` — Print the list as JSON



## `rein show`

Print a program's source: its manifest and every .rein file

**Usage:** `rein show <NAME>`

###### **Arguments:**

* `<NAME>` — Program name (see `rein list`)



## `rein serve`

Serve the agent interface. Holds live runs in memory

**Usage:** `rein serve [OPTIONS]`

###### **Options:**

* `--mcp` — Speak MCP on stdio. The only transport today



## `rein agent-context`

Print the block an agent needs to use the visible flows

**Usage:** `rein agent-context [OPTIONS]`

###### **Options:**

* `--format <FORMAT>` — Output format

  Default value: `text`

  Possible values: `text`, `json`




## `rein hook`

The agent hook entry point. Reads one event on stdin. Run by the agent, not by hand

**Usage:** `rein hook [OPTIONS]`

###### **Options:**

* `--caller <CALLER>` — The agent that sends the event, such as `claude-code`. Sets polyhook's caller



## `rein install`

Register a program folder in the user programs folder, or write a tool's hook config (`claude-code`)

**Usage:** `rein install [OPTIONS] <TOOL>`

###### **Arguments:**

* `<TOOL>` — A program folder to register, or the agent tool, such as `claude-code`

###### **Options:**

* `--project` — Write to the project's settings (`.claude/settings.json`). Default
* `--user` — Write to the user's settings (`~/.claude/settings.json`)
* `--dry-run` — Print the resulting file and write nothing



## `rein lsp`

Run the language server on stdio

**Usage:** `rein lsp`



