# Install a program

This page is the single source for installing a Rein program. Other pages link here.

Status: the npm model is partly built. Sections marked **(Built)** describe the `rein` binary today. Sections marked **(Proposed)** are not built.

## Model (Built)

- A program is an npm package.
- Rein has no package manager and no registry of its own. It uses pnpm.
- Rein keeps one pnpm project per scope. The user scope has `<user programs folder>/npm/`. A repo has `<project rein folder>/npm/`. Each has its own `package.json` and `pnpm-lock.yaml`.
- Rein runs pnpm in those folders. You do not run pnpm there yourself.

## Which folder an install uses (Built)

`rein install`, `rein uninstall` and `rein update` pass their arguments to pnpm. The `-g` flag picks the folder:

| Command | Folder where pnpm runs | Scope |
| --- | --- | --- |
| `rein install <args>` | `<project rein folder>/npm/` | project (repo-bound) |
| `rein install -g <args>` | `<user programs folder>/npm/` | user |

- `-g` or `--global` is removed from the arguments. Rein does not pass it to pnpm, because pnpm's own `-g` means pnpm's global store.
- The project rein folder is the nearest `rein/` folder from the working directory up, the same folder project scope uses. If none exists, Rein makes `rein/` at the git repository root.
- Outside a repository, with no `rein/` folder, the command fails: `not in a repository; use -g to install for the user`.
- The npm folder and its `package.json` are created on first use, in either place. The `package.json` is `"private": true`, so it cannot be published.

## User programs folder (Built)

Rein finds the user programs folder this way:

- If `REIN_HOME` is set, the folder is `$REIN_HOME`.
- Otherwise, if `XDG_CONFIG_HOME` is set, the folder is `$XDG_CONFIG_HOME/rein/programs/`.
- Otherwise, the folder is `~/.config/rein/programs/`.

The user npm project is the `npm/` folder inside it. With the default path, it is `~/.config/rein/programs/npm/`.

## Install, update, and remove (Built)

| Rein command | pnpm command that Rein runs |
| --- | --- |
| `rein install <args>...` | `pnpm add --ignore-scripts <args>...` |
| `rein uninstall <args>...` | `pnpm remove <args>...` |
| `rein update [<args>...]` | `pnpm update --ignore-scripts [<args>...]` |

- The arguments go to pnpm unchanged. Any pnpm flag works. Rein reads no package spec. (A change is proposed: see Naming in decisions.md.)
- The one exception is `--ignore-scripts`. `add` and `update` get it first, so package install scripts do not run. If your arguments already contain `--ignore-scripts`, Rein adds nothing. To let scripts run, pass `--ignore-scripts=false`. `remove` gets no such flag.
- `rein update` with no arguments updates each direct dependency within its range.

```sh
rein install pr-handling@^1                  # pnpm add --ignore-scripts pr-handling@^1, in <repo>/rein/npm/
rein install -g pr-handling@^2               # pnpm add --ignore-scripts pr-handling@^2, in ~/.config/rein/programs/npm/
rein install --save-exact pr-handling@1.4.2  # pnpm add --ignore-scripts --save-exact pr-handling@1.4.2
rein install --ignore-scripts=false file:../pr-handling   # scripts run
rein update --latest                         # pnpm update --ignore-scripts --latest
rein uninstall pr-handling                   # pnpm remove pr-handling
```

Sources pnpm accepts work the same way:

```sh
rein install ./pr-handling                   # a local folder: pnpm links it
rein install file:../pr-handling             # the same, as a file: spec
rein install github:owner/repo
rein install git+https://example.com/owner/repo.git
```

## Several versions side by side (Built)

pnpm can hold two versions of one package. It does this with npm aliases. An alias gives a package a second name:

```sh
rein install -g pr-handling-v1@npm:pr-handling@^1
rein install -g pr-handling-v2@npm:pr-handling@^2
rein run pr-handling-v1
rein run pr-handling-v2
```

- The alias is the program name. The `name` field in the package does not change it.
- Selecting a version by a range, such as `rein run pr-handling@1`, is still proposed. See [Open questions](#open-questions).

## Program package (Built)

A program package uses `package.json`, as a VS Code extension does. It has these standard fields:

- `name`, `version`, `description`, `license`, `repository`, `files`, `keywords`
- `engines.rein`: the Rein version range that the program works with. It works like `engines.vscode`.

```json
{
  "name": "pr-handling",
  "version": "1.0.0",
  "description": "Decide how the agent handles a pull request.",
  "license": "MIT",
  "repository": "github:owner/rein-pr-handling",
  "files": ["**/*.rein"],
  "keywords": ["rein", "pull-request"],
  "engines": {
    "rein": "^0.1.0"
  }
}
```

- Rein reads `name`, `version`, `description` and `engines.rein`. Other fields are npm's.
- Rein reads `^x.y.z` and `x.y.z` ranges in `engines.rein`. `rein list -l` warns about a program when the running rein does not hold one. Other range forms are not checked yet.
- Rein checks `engines.rein` at install. (Proposed)
- Rein-specific fields do not go in `package.json`. A separate Rein file holds them. That file is defined later. (Proposed)

## Discovery and scopes

Rein finds programs in three scopes:

| Scope | Folder | Precedence |
| --- | --- | --- |
| Project | A `rein/` folder in the working directory or a parent folder, and its `npm/` folder | 1, highest |
| User | The user programs folder (see above), and its `npm/` folder | 2 |
| System | `/etc/rein/`. On macOS also `/Library/Application Support/Rein/` | 3, lowest |

- On a name clash, the higher scope wins.
- Inside the project scope, the nearest `rein/` folder wins.
- A program that loses a clash is shadowed. `rein list` hides it. `rein list -a` shows it marked `(shadowed by <scope>)`. The name runs the winning program.
- `REIN_SYSTEM_DIRS` replaces the system folders. It is a colon-separated list.
- `rein list` also lists the packages in each `npm/node_modules/` folder of the project and user scopes. Each top-level link is one program, named by its link name, including an alias. A scope folder such as `@scope/` holds `@scope/name` programs. (A change is proposed: see Naming in decisions.md.) Dot entries such as `.pnpm` are skipped. A package without a Rein entry is not a program.
- `npm` is reserved in every `rein/` folder. It is the package project, so it is never a program.

## Confirm the install (Built)

Run these commands:

```sh
rein list
rein show <name>
```

- `rein list` prints each visible program's name, one per line. `rein list -l` adds scope, version, path and description. `rein list 'pr-*'` filters by name. `rein list -h` lists the other `ls`-style flags. Add `--json` for full records.
- `rein show <name>` prints the manifest and every `.rein` file. The entry file comes first.
- A package installed with `-g` has the scope `user`. A repo-bound package has the scope `project`.
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
  - `maxFunctionLines` sets the line limit of a function. See [spec section 4](spec/functions-and-parameters.md#functions).
  - `maxLineLength` sets the most characters a line may hold. The default is 80. See [spec section 2](spec/lexical-rules.md#2-lexical-rules).
  - When a `package.json` exists, its `name` and `description` win over these two fields.
- A `rein.json` that is not valid JSON is ignored. The defaults apply.
- A folder that starts with `.` is not a program. A folder with only `main.rein` is a program.
- A folder copied by hand into the user programs folder still works. Remove it with `rm -r ~/.config/rein/programs/<name>`.

The future of `rein.json` is an open question.

## Open questions

- The name of the future Rein file, and its fields. Rein-specific fields go there.
- The future of `rein.json`. Does the Rein file replace it?
- Version selection at start. Is it `rein run pr-handling@1`, or the alias name `rein run pr-handling-v1`?
- Lockfile sharing. Is there one `pnpm-lock.yaml` for all programs, or one per program?
- Scripts. The default passes `--ignore-scripts`. Should a package be able to allow its own scripts without the user passing `--ignore-scripts=false`?
