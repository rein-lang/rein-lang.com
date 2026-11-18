# Roadmap

Status: alpha. This page lists future work only: Now, Next and Later.
Shipped work is in the [rein releases](https://github.com/rein-lang/rein/releases) and the merged pull requests.
Language rules live in [spec.md](spec.md). The reasons live in [decisions.md](decisions.md).

## Key dates

| Date | Release | `@./path` and `@program` references | Default import `import fix from "./ci/fix"` | Named import `import { fix } from "./ci/fix"` |
| --- | --- | --- | --- | --- |
| 2026-11-19 | the next release | Work. Each one gives a deprecation warning. | Works. Each one gives a deprecation warning. | Works. |
| 2026-12-19 | the first release on or after this date | An error. The program does not check or run. | An error. The program does not check or run. | The only way to name another file or program. |

The removal is a release, not a clock. An installed `rein` binary never starts to fail on a date by itself. The release that removes `@` references comes out on 2026-12-19 or soon after. Every warning names that date.

## Now: `import` replaces `@` references

Rein mimics TypeScript. The `@` reference is the one form TypeScript does not have. So Rein adopts the TypeScript named import, `import { name } from "path"`, and deprecates `@` references. The deprecation period is one month: from 2026-11-19 to 2026-12-19.

Rein keeps one import form: the named import. A default import, `import fix from "./ci/fix"`, works for the same month with a deprecation warning, so a file that a TypeScript habit or a tool writes still checks. It becomes an error on 2026-12-19, with the `@` references. Why only named imports: the name in the importing file is always the name that the target declares, so a reader and a search find one name for one function.

### The new syntax

The samples below use the planned syntax. Today's `rein check` rejects them until `import` ships.

A function file keeps its one `export default function`. Import it by the name it declares. `ci/fix.rein` declares `export default function fix`, so:

```typescript
import { fix } from "./ci/fix";
import { prHandling } from "pr-handling";

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

A shared struct file keeps its one `export default interface`. Import it the same way, by its name:

```typescript
import { Message } from "./message.struct";

/** Tells the customer the next step. */
export default function tellCustomer({ opening, next_step }: Message) {
  return `${opening} ${next_step}`;
}
```

| Today (deprecated) | From the next release |
| --- | --- |
| `return @./ci/fix;` | `import { fix } from "./ci/fix";` and `return fix;` |
| `return @../escalate;` | `import { escalate } from "../escalate";` and `return escalate;` |
| ``return @./tpl(a=`x`);`` | `import { tpl } from "./tpl";` and ``return tpl(a=`x`);`` |
| `const ok: boolean = await @./merge(pr=pr);` | `import { merge } from "./merge";` and `await merge(pr=pr)` |
| `({ a, b }: @./message)` | `import { Message } from "./message.struct";` and `({ a, b }: Message)` |
| `return @pr-handling(pr=pr);` or `@pr-handling/main` | `import { prHandling } from "pr-handling";` and `return prHandling(pr=pr);` |

No file needs a new export. Only the files that use `@` references change.

### Import rules

- Imports come first in the file, before the doc comment of the function.
- Each name in the braces is the name that the target's `export default function` or `export default interface` declares. Another name is an error: `` `./ci/fix` declares `fix`, not `fixCi`; write `import { fix } from "./ci/fix"` ``.
- `as` gives a local name when two targets declare the same name: `import { fix as ciFix } from "./ci/fix";`. An `as` that keeps the same name is a warning.
- A file exports one name, so the braces hold one name. A second name is an error.
- A default import, `import fix from "./ci/fix"`, resolves like the named import, under the local name it gives. Until 2026-12-19 it gives a warning: `` default imports are deprecated and become an error on 2026-12-19; write `import { fix } from "./ci/fix"` ``. From 2026-12-19 the same text is an error.
- A path that starts with `./` or `../` names a file of the project. It has no `.rein` extension. The root rules of references stay: the target must stay inside the project root.
- `"./message.struct"` names `message.struct.rein`. A struct name is used only as a type. A function name is used only as a hand-off, a template call or an `await`.
- A bare path, such as `"pr-handling"`, names an installed program. The name in the braces is the name its entry function declares. The `package.json` dependency rules of references stay. Any other function of the program is an error that links [Call another program by its entry](https://rein-lang.com/docs/call-programs-by-entry).
- The function identity stays the root-relative name, such as `ci/fix`. The CLI, the JSON output, the graph and the answer keys do not change. `@pr-handling/main.task` stays the answer key of another program.
- An import name cannot be a std name, such as `delegate` or `askUser`. Two imports with the same local name are an error. An unused import is a warning.
- Std names, such as `delegate` and `askUser`, stay global. They need no import.
- `import type`, `import * as`, side-effect imports (`import "./x"`) and `export ... from` are errors. Each one names the form to use.

### How Rein tells you

Every tool gives the same warning text and the same removal date.

- **`rein check`** gives a warning on each `@` reference and each default import:
  `` warning: `@./ci/fix` is deprecated and becomes an error on 2026-12-19; write `import { fix } from "./ci/fix";` and use `fix`. Run `rein migrate imports` to change every file ``.
  A default import gives the warning in the Import rules.
  The summary line counts them: `3 deprecated imports and references; they become errors on 2026-12-19`. The exit code stays 0 for warnings.
- **`rein check --deny-deprecated`** makes each deprecation an error. Use it in CI to stop new `@` references and default imports before the removal.
- **The language server** gives the same warning with:
  - the `Deprecated` diagnostic tag, so editors draw the reference struck through;
  - the diagnostic code `deprecated-reference`, which links to this page;
  - a quick fix, **Convert to named import**, for one reference or default import, and **Convert all in this file**;
  - a hover on the reference that shows the removal date and the new form.
- **The language server** also supports the new syntax: completion of import paths, program names and the declared name in the braces, go to definition and find references on import names, and a quick fix for a wrong name.
- **`rein migrate imports`** changes every file of the project. It adds one named import for each target, with `as` only when two names collide, replaces each reference with the name, and turns each default import into a named import. It renames the uses when the default import gave another name. It changes nothing when no `@` reference or default import is left. `rein migrate imports --check` lists the files it would change and exits 1 if there are any.
- **`rein step`, `rein run` and the MCP tools** stay quiet. A deprecation is never part of an agent step, so a run does not change during the month.
- **The VS Code extension** colors `import`, `from`, `as` and the path string.

### Work items

| Repo | Item |
| --- | --- |
| [rein](https://github.com/rein-lang/rein) | Parse named imports, and default imports with a deprecation warning. Resolve them with the reference rules and the declared name. Give the errors above. |
| [rein](https://github.com/rein-lang/rein) | Give the deprecation warnings for `@` references and default imports, the summary line and `--deny-deprecated` in `rein check`. |
| [rein](https://github.com/rein-lang/rein) | Language server: the `Deprecated` tag, the diagnostic code, the quick fixes, the hover, and import completion. |
| [rein](https://github.com/rein-lang/rein) | `rein migrate imports` and `--check`. |
| [rein](https://github.com/rein-lang/rein) | README: say that Rein uses `import { name } from`, not `@` references. |
| [vscode-rein](https://github.com/rein-lang/vscode-rein) | Grammar for `import { ... } from`. |
| [rein-lang.com](https://github.com/rein-lang/rein-lang.com) | Spec: new Imports section; References and Structs sections point to it. Update every example on the site. |
| [examples](https://github.com/rein-lang/examples) | Migrate every example program with `rein migrate imports`. |
| rein-lang programs | Migrate each program repo before 2026-12-19, and add `rein check --deny-deprecated` to its CI. |

## Next: remove `@` references and default imports (2026-12-19)

- `@./path`, `@../path`, `@program` and default imports become an error. The error text keeps the new form and the `rein migrate imports` hint.
- `rein migrate imports` stays for one more minor release, so a late program can still migrate in one command.
- The spec drops the deprecated forms.

## Later

- Bundle tool: compiles a program into one self-contained `.rein` file, so an agent can load one file and run it as a full program.
- Research an agent-agnostic tool that installs agent hooks. Why: each agent keeps its hook config in its own format and place, so Rein should not own a per-agent installer.
