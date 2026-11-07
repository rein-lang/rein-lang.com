# Getting started

This page builds the `rein` command and runs a first project. It needs a Rust toolchain with `cargo`.

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

A project is a folder with a `rein.toml` marker file and a `main.rein` entry point. Create a folder named `hello`.

`rein.toml` marks the project root. One comment line is enough:

```toml
# Rein project root
```

`main.rein` is the agent's entry point. This one asks one question and returns one of two instructions:

```rein
/**
 * Decide the next step for a new support ticket.
 */
export default function main(
  /** Is the ticket urgent? */
  urgent: boolean,
) {
  if (urgent) {
    return "Escalate the ticket to on-call now.";
  }
  return "Answer the ticket from the queue.";
}
```

## Check the project

Check the project for errors. A clean project prints `0 errors, 0 warnings`:

```sh
rein check hello
```

## Run a step

Run the entry point without an answer. Rein asks for the input it needs and exits with code 2:

```sh
rein run --root hello
```

```text
need input urgent: boolean - Is the ticket urgent?
hint: rerun with --set urgent=<value>
```

Give the answer and run again:

```sh
rein run --root hello --set urgent=yes
```

```text
Escalate the ticket to on-call now.
```

## Next steps

- Read the [Concepts](/concepts) page for the model.
- Open an [example](/examples/) and run it.
- Read the [language reference](/reference/spec) when you write functions.
- Look up every command and flag in the [CLI reference](/reference/cli).
