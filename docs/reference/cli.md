# Command-Line Help for `rein`

This document contains the help content for the `rein` command-line program.

**Command Overview:**

* [`rein`↴](#rein)
* [`rein check`↴](#rein-check)
* [`rein run`↴](#rein-run)
* [`rein describe`↴](#rein-describe)
* [`rein graph`↴](#rein-graph)
* [`rein lsp`↴](#rein-lsp)

## `rein`

A small language for agent decision flows

**Usage:** `rein <COMMAND>`

###### **Subcommands:**

* `check` — Check a project directory, or one .rein file, and print diagnostics
* `run` — Evaluate one step of a function
* `describe` — Print a function's schema as JSON
* `graph` — Print the reference graph as a Mermaid flowchart
* `lsp` — Run the language server on stdio



## `rein check`

Check a project directory, or one .rein file, and print diagnostics

**Usage:** `rein check [PATH]`

###### **Arguments:**

* `<PATH>` — Project directory or .rein file

  Default value: `.`



## `rein run`

Evaluate one step of a function

**Usage:** `rein run [OPTIONS] [FUNCTION]`

###### **Arguments:**

* `<FUNCTION>` — Function name, as its path under the root without `.rein`. Default: `main`

  Default value: `main`

###### **Options:**

* `--root <ROOT>` — Project root. Default: the nearest directory with rein.toml
* `--set <NAME=VALUE>` — Input value as name=value. Repeat for each input
* `--json` — Print the result as JSON



## `rein describe`

Print a function's schema as JSON

**Usage:** `rein describe [OPTIONS] [FUNCTION]`

###### **Arguments:**

* `<FUNCTION>` — Function name. Default: `main`

  Default value: `main`

###### **Options:**

* `--root <ROOT>` — Project root. Default: the nearest directory with rein.toml



## `rein graph`

Print the reference graph as a Mermaid flowchart

**Usage:** `rein graph [OPTIONS]`

###### **Options:**

* `--root <ROOT>` — Project root. Default: the nearest directory with rein.toml



## `rein lsp`

Run the language server on stdio

**Usage:** `rein lsp`



