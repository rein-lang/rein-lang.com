---
title: "Install a Rein program"
description: "Install a Rein program like an app with rein install -g. List, show, update and remove programs. See how your agent finds them and how to watch them run."
---

A Rein program is an app for an AI agent. You install it like an app, and your agent opens it when a task matches. Install one for every folder with `rein install -g github:rein-lang/moscow-prioritization`.

<!--@include: ../language/install-programs.md-->

## How your agent finds programs

Your agent needs the list of programs before it can open one. `rein agent-context` prints the block an agent reads. It lists the visible programs and how to start them. Add `--format json` for the same data as JSON.

`rein hook` is the entry point that agent hooks call. It reads one event on stdin. You do not run it by hand. See [Agent interface](/reference/interface) for what the hooks do.

To serve the programs to an agent over MCP, run `rein serve --mcp`. See [CLI: serve, agent-context, hook, lsp, dap](/reference/cli-agents).

## Watch a program run

```sh
rein watch
```

`rein watch` serves a page on `127.0.0.1`. It refreshes every 2 seconds. The page shows the agents that use Rein now, their answers, and the step each run waits on. It reads the run logs and changes nothing. Use `--no-open` to skip the browser, and `--port <PORT>` to pick the port.
