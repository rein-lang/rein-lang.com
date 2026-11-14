# Getting started

This page builds the `rein` command and runs a first flow. It needs a Rust toolchain with `cargo`.

## Install the CLI

From the repository root, install the binary:

```sh
cargo install --path crates/rein
rein --version
```

If you do not want to install it, run it through cargo from the repository root with `cargo run -p rein -- <command>`.

## Install the editor extension

The VS Code extension adds highlighting, diagnostics, and navigation. It uses the same `rein` binary. See [Editor](/editor) for the steps.

## Make a first project

A flow is a folder with a `main.rein` entry point. Flows live in a visible `rein/` folder, one subfolder per flow. The project needs no `rein.toml`. Create a folder named `hello` with one flow named `ticket`:

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

## Check the flow

Check the flow for errors. A clean flow prints `0 errors, 0 warnings`:

```sh
rein check hello/rein/ticket
```

## List the flows

From the project folder, list the flows the CLI can see:

```sh
rein list
```

The output shows `ticket`, its scope, its path, and its description.

## Step the flow

Step the flow by name. Rein asks for the input it needs and exits with code 2:

```sh
rein step --flow ticket --json
```

```json
{"kind":"question","version":1,"key":"main.urgent","function":"main","name":"urgent","type":"boolean","options":null,"description":"Is the ticket urgent?","answers":{},"trace":["main"]}
```

Give the answer under its `key`, then step again. The flow ends with `kind` set to `done`:

```sh
rein step --flow ticket --answer main.urgent=yes --json
```

```json
{"kind":"done","version":1,"instruction":"Escalate the ticket to on-call now.","answers":{"main.urgent":"yes"},"trace":["main"]}
```

For the full protocol, see [spec section 11](docs/spec/stepping.md#11-stepping-agent-interface).

## Debug a program

Open the flow in the debugger. It serves a page on `127.0.0.1` and opens it in the browser:

```sh
rein debug ticket
```

Set inputs and answers on the left, or answer the current question at the top. On each change the page walks the flow again. It marks the path taken, and shows the next question, the request, or the final instruction. **Back** removes the last answer. **Reset** removes all answers. To save a static view, run `rein graph ticket --answer main.urgent=yes -o ticket.html`.

See the agents that use rein right now, with the step each run waits on:

```sh
rein watch
```

It serves a page on `127.0.0.1` and refreshes it every 2 seconds. It reads the run logs that agents write, and changes nothing. The graph marks the taken steps and the "now" step. Each run shows a status chip. Use the **Path** and **Whole program** buttons to switch the graph view.

## Next steps

- Read the [Concepts](/concepts) page for the model.
- Open an [example](/examples/) and run it.
- Read the [language reference](/reference/spec) when you write functions.
- Look up every command and flag in the [CLI reference](/reference/cli).
