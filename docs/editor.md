# Rein for VS Code

The VS Code extension adds syntax highlighting, snippets, and language server support for `.rein` files. It lives in its own repo: [rein-lang/vscode-rein](https://github.com/rein-lang/vscode-rein).

## Requirements

The extension starts the `rein` CLI as its language server. Install it from this repo:

```sh
cargo install --git https://github.com/tupe12334/rein rein
```

`rein` must be on your `PATH`. Otherwise set `rein.serverPath` to its full path.

## Install

Build and install the extension from the [vscode-rein install steps](https://github.com/rein-lang/vscode-rein#install).

The [extension README](https://github.com/rein-lang/vscode-rein#readme) lists the features, commands, and settings.
