# Install a program

This page is the single source for installing a Rein program. Other pages link here.

Status: the npm model is proposed. Sections marked **(Built)** describe the `rein` binary today. Sections marked **(Proposed)** are not built.

## Model (Proposed)

- A program is an npm package.
- Rein has no package manager and no registry of its own. It uses pnpm.
- Rein does not install programs globally. It installs them into one pnpm project.
- That project is `<user programs folder>/npm/`. It has its own `package.json` and `pnpm-lock.yaml`. Rein manages both.
- Rein runs pnpm in that folder. You do not run pnpm there yourself.

## User programs folder (Built)

Rein finds the user programs folder this way:

- If `REIN_HOME` is set, the folder is `$REIN_HOME`.
- Otherwise, if `XDG_CONFIG_HOME` is set, the folder is `$XDG_CONFIG_HOME/rein/programs/`.
- Otherwise, the folder is `~/.config/rein/programs/`.

The npm project is the `npm/` folder inside it. With the default path, it is `~/.config/rein/programs/npm/`.

## Install, update, and remove (Proposed)

Each command runs pnpm in `<user programs folder>/npm/`:

| Rein command | pnpm command that Rein runs |
| --- | --- |
| `rein install <package>[@<semver range>]` | `pnpm add --ignore-scripts <package>[@<semver range>]` |
| `rein uninstall <package>` | `pnpm remove <package>` |
| `rein update [<package>]` | `pnpm update --ignore-scripts [<package>]` |

```sh
rein install pr-handling@^1
# Rein runs, in ~/.config/rein/programs/npm/:
pnpm add --ignore-scripts pr-handling@^1
```

- Every source that pnpm accepts works. Rein passes the source to pnpm unchanged.
- `rein update` with no name updates each direct dependency within its range.
- To move to a new major version, install the new range. `rein update` keeps the old range.

Sources:

```sh
rein install github:owner/repo                        # pnpm add --ignore-scripts github:owner/repo
rein install git+https://example.com/owner/repo.git   # pnpm add --ignore-scripts git+https://...
rein install file:../pr-handling                      # local folder, for development
```

## Several versions side by side (Proposed)

pnpm can hold two versions of one package. It does this with npm aliases. An alias gives a package a second name:

```sh
pnpm add pr-handling-v1@npm:pr-handling@^1 pr-handling-v2@npm:pr-handling@^2
```

pnpm writes both aliases to `package.json`. It links each alias at the top level of `node_modules/`. Rein uses each alias as a program name. An agent can then run either version:

```sh
rein install pr-handling-v1@npm:pr-handling@^1
rein install pr-handling-v2@npm:pr-handling@^2
rein run pr-handling-v1
rein run pr-handling-v2
```

- The alias is the program name. The `name` field in the package does not change it.
- Selecting a version by a range, such as `rein run pr-handling@1`, is an open question. See [Open questions](#open-questions).

## Program package (Proposed)

A program package uses `package.json`, as a VS Code extension does. It has these standard fields:

- `name`, `version`, `description`, `license`, `repository`, `files`, `keywords`
- `engines.rein`: the Rein version range that the program works with. It works like `engines.vscode`.

```json
{
  "name": "pr-handling",
  "version": "1.0.0",
  "description": "Decide how the agent handles a pull request.",
  "license": "MIT",
  "repository": "github:owner/pr-handling",
  "files": ["**/*.rein"],
  "keywords": ["rein", "pull-request"],
  "engines": {
    "rein": "^0.1.0"
  }
}
```

- Rein checks `engines.rein` at install.
- Rein-specific fields do not go in `package.json`. A separate Rein file holds them. That file is defined later.

## Discovery and scopes

Rein finds programs in three scopes:

| Scope | Folder | Precedence |
| --- | --- | --- |
| Project | A `rein/` folder in the working directory or a parent folder | 1, highest |
| User | The user programs folder (see above), including its `npm/` folder (Proposed) | 2 |
| System | `/etc/rein/`. On macOS also `/Library/Application Support/Rein/` | 3, lowest |

- On a name clash, the higher scope wins.
- Inside the project scope, the nearest `rein/` folder wins.
- A program that loses a clash is shadowed. `rein list` marks it `(shadowed by <scope>)`. The name runs the winning program.
- `REIN_SYSTEM_DIRS` replaces the system folders. It is a colon-separated list.
- `rein list` also lists the packages in `<user programs folder>/npm/node_modules/` (Proposed). Each top-level link is one program. Its link name is its program name, including an alias.

## Confirm the install (Built)

Run these commands:

```sh
rein list
rein show <name>
```

- `rein list` shows each visible program: name, scope, path, description, and first question. Add `--json` for JSON output.
- `rein show <name>` prints the manifest and every `.rein` file. The entry file comes first.
- A program you installed in the user programs folder has the scope `user`.
- User programs appear from any directory. Project programs appear only under their project.

## Run the program (Built)

```sh
rein run <name>
```

`rein run <name>` starts the program from any directory. Answer each question on stdin. An agent starts the same program by name with `rein_start`. A live run in `rein serve --mcp` keeps the files it loaded at start.

## Today (Built)

- The manifest is `rein.json`. Its fields are `name`, `description`, and `entry`. Every field is optional.
  - `name` defaults to the folder name.
  - `description` defaults to the first paragraph of the doc comment in the entry file.
  - `entry` defaults to `main.rein`.
- A `rein.json` that is not valid JSON is ignored. The defaults apply.
- A folder that starts with `.` is not a program. A folder with only `main.rein` is a program.
- `rein install <path>` links a folder into the user programs folder. The proposed `rein install` takes a package instead.
- A folder copied by hand into the user programs folder still works. Remove it with `rm -r ~/.config/rein/programs/<name>`.

The future of `rein.json` is an open question.

## Agent hook

Today `rein install claude-code` writes the agent hook, not a program. It is a different topic. See [spec section 12](docs/spec.md#12-agent-integration).

## Open questions

- The name of the future Rein file, and its fields. Rein-specific fields go there.
- The future of `rein.json`. Does the Rein file replace it?
- Version selection at start. Is it `rein run pr-handling@1`, or the alias name `rein run pr-handling-v1`?
- Project scope. Does a project also get a pnpm folder?
- Lockfile sharing. Is there one `pnpm-lock.yaml` for all programs, or one per program?
- Scripts. pnpm runs install scripts. The proposal passes `--ignore-scripts` by default. Should a package be able to allow its own scripts?
- Name clash. Does `rein install claude-code` stay the hook command, or can a package use that name?
