# Roadmap

Status: alpha. This page lists future work only: Now, Next and Later.
Shipped work is in the [rein releases](https://github.com/rein-lang/rein/releases) and the merged pull requests. Named imports, the deprecation warnings, the language server support and `rein migrate imports` shipped in [rein 0.1.2](https://github.com/rein-lang/rein/releases/tag/v0.1.2).
Language rules live in [spec.md](spec.md).

## Key dates

| Date | Release | `@./path` and `@program` references | Default import `import fix from "./ci/fix"` | Named import `import { fix } from "./ci/fix"` |
| --- | --- | --- | --- | --- |
| 2026-11-19 | rein 0.1.2 | Work. Each one gives a deprecation warning. | Works. Each one gives a deprecation warning. | Works. |
| 2026-12-19 | rein 0.2.0, on or after 2026-12-19 | An error. The program does not check or run. | An error. The program does not check or run. | The only way to name another file or program. |

The removal is a release, not a clock. An installed `rein` binary never starts to fail on a date by itself. The release that removes `@` references comes out on 2026-12-19 or soon after. Every warning names that date.

## Now: migrate before 2026-12-19

Until 2026-12-19, `@` references and default imports still check. Each one gives a deprecation warning. Rein 0.1.2 has the new forms. Before that date, for each of your programs:

- Run `rein migrate imports` in the program folder.
- Add `rein check --deny-deprecated` to its CI, so no new `@` reference comes back.

Each change is one import line for each target. Only the files that use `@` references change.

| Deprecated | Named import |
| --- | --- |
| `return @./ci/fix;` | `import { fix } from "./ci/fix";` and `return fix;` |
| `return @../escalate;` | `import { escalate } from "../escalate";` and `return escalate;` |
| ``return @./tpl(a=`x`);`` | `import { tpl } from "./tpl";` and ``return tpl(a=`x`);`` |
| `const ok: boolean = await @./merge(pr=pr);` | `import { merge } from "./merge";` and `await merge(pr=pr)` |
| `({ a, b }: @./message)` | `import { Message } from "./message.struct";` and `({ a, b }: Message)` |
| `return @pr-handling(pr=pr);` or `@pr-handling/main` | `import { main } from "pr-handling";` and `return main(pr=pr);` |

## Next: remove `@` references and default imports (rein 0.2.0)

- `@./path`, `@../path`, `@program` and default imports become an error. The error text keeps the new form and the `rein migrate imports` hint.
- `rein migrate imports` stays for one more minor release, so a late program can still migrate in one command.
- The spec drops the deprecated forms.

## Later

- Bundle tool: compiles a program into one self-contained `.rein` file, so an agent can load one file and run it as a full program.
