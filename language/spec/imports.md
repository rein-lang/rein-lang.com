### Imports

An import names a function or a shared struct of another file. Rein has one import form: the named import, as in TypeScript. The name in the braces is the name that the target declares.

```ts
import { fix } from "./ci/fix";
import { Message } from "./message.struct";
import { main } from "pr-handling";
```

- `import { fix } from "./ci/fix";` names the function that `ci/fix.rein` declares with `export default function`.
- `import { Message } from "./message.struct";` names the struct that `message.struct.rein` declares with `export default interface`.
- `import { main } from "pr-handling";` names the entry function of the installed program `pr-handling`. The name is the name that the entry declares, here `main`.

Rules:

- Imports come first in the file, before the doc comment of the function.
- Each name in the braces is the name that the target declares. Another name is an error: `` `./ci/fix` declares `fix`, not `fixCi`; write `import { fix } from "./ci/fix"` ``.
- `as` gives a local name when two targets declare the same name: `import { fix as ciFix } from "./ci/fix";`. An `as` that keeps the same name is a warning.
- A file exports one name, so the braces hold one name. A second name is an error. Write one `import` line for each name.
- A path that starts with `./` or `../` names a file of the project. It has no `.rein` extension. The target must stay inside the project root, as in References (section 4).
- `"./message.struct"` names `message.struct.rein`. A struct name is used only as a type. A function name is used only as a hand-off, a template call or an `await`.
- A bare path, such as `"pr-handling"`, names an installed program. The `package.json` dependency rules of References apply. Any other function of the program is an error. Call the program by its entry instead: https://rein-lang.com/docs/call-programs-by-entry.
- The function identity stays the root-relative name, such as `ci/fix`. The CLI, the JSON output, the graph and the answer keys do not change.
- An import name cannot be a std name, such as `delegate` or `askUser`. Std names stay global and need no import. Two imports with the same local name are an error.
- An import name cannot equal a parameter, destructured field, const or struct name of the file. rein 0.1.4 gives a warning. rein 0.2.0 makes it an error.
- An import that the file does not use is a warning.
- `import type`, `import * as` and side-effect imports (`import "./x";`) are errors. Each error names the form to use.

Two forms are deprecated. Each one still checks until rein 0.2.0.

- A default import, such as `import fix from "./ci/fix";`, gives a warning. It becomes an error on 2026-12-19.
- An `@` reference, such as `return @./ci/fix;`, gives a warning. It becomes an error on 2026-12-19. Write the named import instead, as in the example above. References (section 4) describe the old form.

`rein check --deny-deprecated` makes each deprecated form an error. `rein migrate imports` changes every file of a project to named imports. `rein migrate imports --check` lists the files it would change and exits 1 if there are any.
