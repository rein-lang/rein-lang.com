---
title: "Install a Rein program"
description: "Install a Rein program like an app with rein install -g. List, show, update and remove programs. See how your agent finds them and how to watch them run."
---

# Install a program

A Rein program is an app for an AI agent. You install it like an app. Your agent then opens it when a task matches.

Status: proof of concept. The commands work today. Version selection and the program's own config file are not final.

## Install a program

A program is an npm package. Install it for you, so every folder can use it:

```sh
rein install -g github:rein-lang/moscow-prioritization
```

The package is [rein-lang/moscow-prioritization](https://github.com/rein-lang/moscow-prioritization). It prioritizes a list with MoSCoW, and it writes `moscow.md`. The program's name is `moscow-prioritization`, from its `package.json`.

Install inside one repository, with no `-g`:

```sh
rein install <package>@^1
```

This puts the program in the repo's `rein/npm/` folder. It works only inside a repository. Outside a repository, use `-g`.

`rein install` passes its arguments to `pnpm add`. Any pnpm flag works. Rein adds `--ignore-scripts`, so an install script does not run. To let scripts run, pass `--ignore-scripts=false`.

The user programs are in `~/.config/rein/programs/npm/`. Set `REIN_HOME` to move them.

## See your programs

```sh
rein list                              # the names of the programs visible from here
rein list -l                          # scope, version, name, path and description
rein list 'pr-*'                       # only the names that match a glob
rein show moscow-prioritization        # the manifest and every .rein file
```

A program from `-g` has the scope `user`. A program in a repo has the scope `project`. A project program wins over a user program with the same name. Run `rein list -a` to see the programs that lost a name clash.

## Update and remove

```sh
rein update                            # update each direct dependency within its range
rein update --latest                   # take the latest version, even past the range
rein update -g moscow-prioritization   # update a user program
rein uninstall -g moscow-prioritization
```

`rein update` runs `pnpm update --ignore-scripts`. `rein uninstall` runs `pnpm remove`. Add `-g` to pick the user folder.

## How your agent finds programs

Your agent needs the list of programs before it can open one. Two commands give it that list:

- `rein agent-context` prints the block an agent reads. It lists the visible programs and how to start them. Add `--format json` for the same data as JSON.
- `rein hook` is the entry point that agent hooks call. It reads one event on stdin. You do not run it by hand. See [Agent interface](/reference/interface) for what the hooks do.

To let the agent start a program in a run, serve the programs over MCP with `rein serve --mcp`. The agent then calls `rein_start`, and answers each step until the run is `done`. See [CLI: serve, agent-context, hook, lsp, dap](/reference/cli-agents).

## Bundle scripts {#bundle-scripts-built}

A program can ship shell scripts in a `scripts/` folder, next to its `.rein` files. Add the folder to the package's `files` list. A step then names the script, and the agent runs it when the step says so. Scripts do not run at install, so `--ignore-scripts` does not affect them.

Keep shell commands in scripts, not in the text of a step. A script is code. You can test it, review it, and run it by hand.

## Watch a program run

```sh
rein watch
```

`rein watch` serves a page on `127.0.0.1`. It refreshes every 2 seconds. The page shows the agents that use Rein now, their answers, and the step each run waits on. It reads the run logs and changes nothing. Use `--no-open` to skip the browser, and `--port <PORT>` to pick the port.

## Next steps

- [Getting started](/getting-started): install the CLI and write a first program.
- [Concepts](/concepts): what a program is, and how its steps work.
- [Skills and programs](/rein-vs-skills): when to write an app and when to write a manual.
- [CLI: list, show, install, uninstall, update](/reference/cli-programs): every flag.
- [The full install model](https://github.com/rein-lang/rein-lang.com/blob/main/language/install-programs.md): the package model, scopes, bundled scripts and side-by-side versions.
