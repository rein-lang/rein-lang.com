---
description: "Install the Rein extension for VS Code. Get syntax highlighting, snippets and language server diagnostics for .rein files from the rein CLI."
---

# Rein for VS Code

The VS Code extension adds syntax highlighting, snippets, and language server support for `.rein` files. It lives in its own repo: [rein-lang/vscode-rein](https://github.com/rein-lang/vscode-rein).

## Requirements

The extension starts the `rein` CLI as its language server. Install it from this repo:

```sh
cargo install --git https://github.com/rein-lang/rein --tag v0.1.4 --locked rein
```

`rein` must be on your `PATH`. Otherwise set `rein.serverPath` to its full path.

## Install

Install [Rein Language](https://marketplace.visualstudio.com/items?itemName=rein-lang.rein-language) from the VS Code Marketplace:

```sh
code --install-extension rein-lang.rein-language
```

The [extension README](https://github.com/rein-lang/vscode-rein#readme) lists the features, commands, and settings.
