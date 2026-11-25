---
title: "Call another program by its entry"
description: "A Rein import of another program names only its entry: import { main } from \"pr-handling\". See why, the error, and how to fix it."
---

# Call another program by its entry

A named import of another program names only the entry of that program. Write `import { main } from "pr-handling";`, where `main` is the name the entry declares. Any other path inside the program, such as `"pr-handling/ci/fix"`, is a `rein check` error.

The `@program` form is deprecated. It gives a warning, and it becomes an error in rein 0.2.0, on or after 2026-12-19. It has the same rule.

## Why

- A program is a unit with one job. Its entry is its one public door.
- The other functions of a program are private. They are parts of how the program does its job.
- The author moves and renames these files freely. A move changes the function path and its answer keys.
- So a reference to an inner function breaks when the author changes files. A reference to the entry does not.
- The caller gives the entry its inputs as named arguments. The entry then sends the run to the correct inner function.

## The error

`rein check` gives this error on the import:

```text
`"pr-handling/ci/fix"` names a function inside a program; import the program, such as `"pr-handling"`, and call its entry: https://rein-lang.com/docs/call-programs-by-entry
```

The `@program/ci/fix` form gives the same rule with its own text: `` `@pr-handling/ci/fix` reaches inside program `pr-handling`; call its entry `@pr-handling` instead ``.

## Fix it

### Call the entry with its inputs

Before, the caller goes into an inner function:

```ts
import { fix } from "pr-handling/ci/fix";

return fix(pr=pr);
```

After, the caller goes through the entry. The entry picks `ci/fix` from its own inputs:

```ts
import { main } from "pr-handling";

return main(pr=pr);
```

### Extract the function into its own program

Do you need only the one inner function, and not the full process of the entry? Then that program likely does more than one job. Move the function into a program of its own:

1. Make a new folder, such as `ci-fix/`.
2. Move the function into it as `main.rein`. Or keep its file and name it as `entry` in `rein.json`.
3. Add a `package.json` with the program name, such as `"name": "ci-fix"`.
4. Publish the program, or install it from its folder with `rein install ./ci-fix`.
5. Add `ci-fix` to `dependencies` in the `package.json` of each caller, such as with `pnpm add ci-fix`.
6. Make both programs import it and hand off to it: `import { main } from "ci-fix";` and `return main(pr=pr);`.

Now `pr-handling` and your program share one public program. Neither one reaches into the other.

See [Imports](/reference/spec#imports) for the full rule, and [References](/reference/spec#references) for the deprecated `@` form. See [Install a program](/install-programs) for the package files.
