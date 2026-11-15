---
description: "Reference for rein serve, agent-context, hook, lsp and dap. Serve programs to agents over MCP, hook into an agent, and start the editor servers."
---

# CLI: serve, agent-context, hook, lsp, dap

## `rein serve`

Serve the agent interface. Holds live runs in memory

**Usage:** `rein serve [OPTIONS]`

###### **Options:**

* `--mcp` — Speak MCP on stdio. The only transport today



## `rein agent-context`

Print the block an agent needs to use the visible processes

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



## `rein lsp`

Run the language server on stdio

**Usage:** `rein lsp`



## `rein dap`

Run the debug adapter on stdio (Debug Adapter Protocol). The VS Code extension starts it

**Usage:** `rein dap`



