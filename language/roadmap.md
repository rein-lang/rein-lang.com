# Roadmap

Status: alpha. This page lists future work only: Now, Next and Later.
Shipped work is in the [rein releases](https://github.com/rein-lang/rein/releases) and the merged pull requests.
Language rules live in [spec.md](spec.md). The reasons live in [decisions.md](decisions.md).

## Key dates

| Date | Release | `@./path` and `@program` references | `import` statements |
| --- | --- | --- | --- |
| 2026-11-19 | the next release | Work. Each one gives a deprecation warning. | Work. |
| 2026-12-19 | the first release on or after this date | An error. The program does not check or run. | The only way to name another file or program. |

The removal is a release, not a clock. An installed `rein` binary never starts to fail on a date by itself. The release that removes `@` references comes out on 2026-12-19 or soon after. Every warning names that date.

## Now: `import` replaces `@` references

Rein mimics TypeScript. The `@` reference is the one form TypeScript does not have. So Rein adopts the TypeScript `import` statement and deprecates `@` references. The deprecation period is one month: from 2026-11-19 to 2026-12-19.

### The new syntax

The samples below use the planned syntax. Today's `rein check` rejects them until `import` ships.

A function file has one `export default function`. Import it with a default import:

```typescript
import fix from "./ci/fix";
import prHandling from "pr-handling";

interface Input {
  /** Did the same check pass on a rerun? */
  flaky: boolean;
  /** The pull request link. */
  pr: string;
}

/** Decides the next step for a failing pull request. */
export default function triage({ flaky, pr }: Input) {
  if (flaky) {
    return fix;
  }

  return prHandling(pr=pr);
}
```

A shared struct file holds one exported interface. Import it with a named import:

```typescript
import { Message } from "./message.struct";

/** Tells the customer the next step. */
export default function tellCustomer({ opening, next_step }: Message) {
  return `${opening} ${next_step}`;
}
```

| Today (deprecated) | From the next release |
| --- | --- |
| `return @./ci/fix;` | `import fix from "./ci/fix";` and `return fix;` |
| `return @../escalate;` | `import escalate from "../escalate";` and `return escalate;` |
| ``return @./tpl(a=`x`);`` | `import tpl from "./tpl";` and ``return tpl(a=`x`);`` |
| `const ok: boolean = await @./merge(pr=pr);` | `import merge from "./merge";` and `await merge(pr=pr)` |
| `({ a, b }: @./message)` | `import { Message } from "./message.struct";` and `({ a, b }: Message)` |
| `export default interface Message { ... }` in a `.struct.rein` file | `export interface Message { ... }` |
| `return @pr-handling(pr=pr);` or `@pr-handling/main` | `import prHandling from "pr-handling";` and `return prHandling(pr=pr);` |

### Import rules

- Imports come first in the file, before the doc comment of the function.
- A path that starts with `./` or `../` names a file of the project. It has no `.rein` extension. The root rules of references stay: the target must stay inside the project root.
- `"./message.struct"` names `message.struct.rein`. A default import of a `.struct.rein` file is an error: `` `./message.struct` is a struct file; import its interface by name, like `import { Message } from "./message.struct"` ``.
- A named import of a function file is an error: `` `./ci/fix` exports one default function; import it as `import fix from "./ci/fix"` ``.
- A bare path, such as `"pr-handling"`, names an installed program. A default import gives its entry. The `package.json` dependency rules of references stay. A named import of a program is an error that links [Call another program by its entry](https://rein-lang.com/docs/call-programs-by-entry).
- The local name is the caller's choice. The function identity stays the root-relative name, such as `ci/fix`. The CLI, the JSON output, the graph and the answer keys do not change. `@pr-handling/main.task` stays the answer key of another program.
- An import name cannot be a std name, such as `delegate` or `askUser`. Two imports with the same local name are an error. An unused import is a warning.
- Std names, such as `delegate` and `askUser`, stay global. They need no import.
- `import type`, `import * as`, side-effect imports (`import "./x"`) and `export ... from` are errors. Each one names the form to use.

### How Rein tells you

Every tool gives the same warning text and the same removal date.

- **`rein check`** gives a warning on each `@` reference and each `export default interface`:
  `` warning: `@./ci/fix` is deprecated and becomes an error on 2026-12-19; write `import fix from "./ci/fix";` and use `fix`. Run `rein migrate imports` to change every file ``.
  The summary line counts them: `3 deprecated references; they become errors on 2026-12-19`. The exit code stays 0 for warnings.
- **`rein check --deny-deprecated`** makes each deprecation an error. Use it in CI to stop new `@` references before the removal.
- **The language server** gives the same warning with:
  - the `Deprecated` diagnostic tag, so editors draw the reference struck through;
  - the diagnostic code `deprecated-reference`, which links to this page;
  - a quick fix, **Convert to import**, for one reference, and **Convert all references in this file**;
  - a hover on the reference that shows the removal date and the new form.
- **The language server** also supports the new syntax: completion of import paths and program names, go to definition and find references on import names, and rename of a local name.
- **`rein migrate imports`** changes every file of the project. It adds the imports, replaces each reference with the local name, and changes `export default interface` to `export interface`. It changes nothing when no `@` reference is left. `rein migrate imports --check` lists the files it would change and exits 1 if there are any.
- **`rein step`, `rein run` and the MCP tools** stay quiet. A deprecation is never part of an agent step, so a run does not change during the month.
- **The VS Code extension** colors `import`, `from` and the path string.

### Work items

| Repo | Item |
| --- | --- |
| [rein](https://github.com/rein-lang/rein) | Parse default and named imports. Resolve them with the reference rules. Give the errors above. |
| [rein](https://github.com/rein-lang/rein) | Give the deprecation warning, the summary line and `--deny-deprecated` in `rein check`. |
| [rein](https://github.com/rein-lang/rein) | Language server: the `Deprecated` tag, the diagnostic code, the quick fixes, the hover, and import completion. |
| [rein](https://github.com/rein-lang/rein) | `rein migrate imports` and `--check`. |
| [rein](https://github.com/rein-lang/rein) | README: say that Rein uses `import`, not `@` references. |
| [vscode-rein](https://github.com/rein-lang/vscode-rein) | Grammar for `import ... from`. |
| [rein-lang.com](https://github.com/rein-lang/rein-lang.com) | Spec: new Imports section; References and Structs sections point to it. Update every example on the site. |
| [examples](https://github.com/rein-lang/examples) | Migrate every example program with `rein migrate imports`. |
| rein-lang programs | Migrate each program repo before 2026-12-19, and add `rein check --deny-deprecated` to its CI. |

## Next: remove `@` references (2026-12-19)

- `@./path`, `@../path` and `@program` become an error. The error text keeps the new form and the `rein migrate imports` hint.
- `export default interface` in a `.struct.rein` file becomes an error.
- `rein migrate imports` stays for one more minor release, so a late program can still migrate in one command.
- The spec drops the deprecated forms.

## Later

- Bundle tool: compiles a program into one self-contained `.rein` file, so an agent can load one file and run it as a full program.
- Research an agent-agnostic tool that installs agent hooks. Why: each agent keeps its hook config in its own format and place, so Rein should not own a per-agent installer.
