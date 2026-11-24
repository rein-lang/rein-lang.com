---
description: "Install the rein CLI, write a first Rein process, then check, list, step and debug it. You need a Rust toolchain with cargo for the install."
---

# Getting started

Rein programs are apps for AI agents. This page installs the `rein` command, then builds a first program. The program asks one question and gives one instruction. The agent answers each step, and it cannot skip one. You need a Rust toolchain with `cargo` for the install.

## Install the CLI

Install the binary from a release tag:

```sh
cargo install --git https://github.com/rein-lang/rein --tag v0.1.5 --locked rein
rein --version
```

If you do not want to install it, clone [rein-lang/rein](https://github.com/rein-lang/rein) and run it from that folder with `cargo run -p rein -- <command>`.

## Install the editor extension

The VS Code extension adds highlighting, diagnostics, and navigation. It uses the same `rein` binary. See [Editor](/editor) for the steps.

## Make a first project

A process is a folder with a `main.rein` entry point. Processes live in a visible `rein/` folder, one subfolder per process. The project needs no `rein.toml`. Create a folder named `hello` with one process named `ticket`:

```sh
mkdir -p hello/rein/ticket
```

`main.rein` is the agent's entry point. This one asks one question and returns one of two instructions. Save it as `hello/rein/ticket/main.rein`:

```rein
/**
 * Decide the next step for a new support ticket.
 */
export default function main(
  /** Is the ticket urgent? */
  urgent: boolean,
) {
  if (urgent) {
    return `Escalate the ticket to on-call now.`;
  }

  return `Answer the ticket from the queue.`;
}
```

To install a program outside this project, see [Install a program](/install-programs).

## Check the process

Check the process for errors. A clean process prints `0 errors, 0 warnings`:

```sh
rein check hello/rein/ticket
```

## List the processes

Go to the project folder, and list the processes the CLI can see:

```sh
cd hello
rein list -l
```

The output shows `ticket`, its scope, its path, and its description.

## Step the process

Step the process by name. Rein asks for the input it needs and exits with code 2:

```sh
rein step --flow ticket --json
```

```json
{"kind":"question","version":1,"key":"main.urgent","function":"main","name":"urgent","type":"boolean","options":null,"description":"Is the ticket urgent?","answers":{},"trace":["main"]}
```

Give the answer under its `key`, then step again. The process ends with `kind` set to `done`:

```sh
rein step --flow ticket --answer main.urgent=yes --json
```

```json
{"kind":"done","version":1,"instruction":"Escalate the ticket to on-call now.","answers":{"main.urgent":"yes"},"trace":["main"]}
```

For the full protocol, see [spec section 11](/reference/spec#_11-stepping-agent-interface).

## Debug a program

Open the process in the debugger. It serves a page on `127.0.0.1` and opens it in the browser:

```sh
rein debug ticket
```

Set inputs and answers on the left, or answer the current question at the top. On each change the page walks the process again. It marks the path taken, and shows the next question, the request, or the final instruction. **Back** removes the last answer. **Reset** removes all answers. To save a static view, run `rein graph ticket --answer main.urgent=yes -o ticket.html`.

See the agents that use rein right now, with the step each run waits on:

```sh
rein watch
```

It serves a page on `127.0.0.1` and refreshes it every 2 seconds. It reads the run logs that agents write, and changes nothing. The graph marks the taken steps and the "now" step. Each run shows a status chip. Use the **Path** and **Whole program** buttons to switch the graph view.

## Next steps

- Read the [Concepts](/concepts) page for the model.
- Do you use skills today? Read [Rein and skills](/rein-vs-skills) to see where each one fits.
- Open an [example](/examples/) and run it.
- Read the [language reference](/reference/spec) when you write functions.
- Look up every command and flag in the [CLI reference](/reference/cli).
