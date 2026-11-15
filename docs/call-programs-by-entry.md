---
title: "Call another program by its entry"
description: "A Rein hand-off or await to another program targets only its entry: @program or @program/<entry>. See why, the error, and how to fix it."
---

# Call another program by its entry

A hand-off or an `await` to another program targets only the entry of that program. Write `@program` or `@program/<entry>`, such as `@pr-handling` or `@pr-handling/main`. Any other path, such as `@pr-handling/ci/fix`, is a `rein check` error.

## Why

- A program is a unit with one job. Its entry is its one public door.
- The other functions of a program are private. They are parts of how the program does its job.
- The author moves and renames these files freely. A move changes the function path and its answer keys.
- So a reference to an inner function breaks when the author changes files. A reference to the entry does not.
- The caller gives the entry its inputs as named arguments. The entry then sends the run to the correct inner function.

## The error

`rein check` gives this error on the reference:

```text
`@pr-handling/ci/fix` is not the entry of program `pr-handling`; call `@pr-handling` with its inputs. See https://rein-lang.com/docs/call-programs-by-entry
```

## Fix it

### Call the entry with its inputs

Before, the caller goes into an inner function:

```rein
return @pr-handling/ci/fix(pr=pr);
```

After, the caller goes through the entry. The entry picks `ci/fix` from its own inputs:

```rein
return @pr-handling(pr=pr);
```

### Extract the function into its own program

Do you need only the one inner function, and not the full process of the entry? Then that program likely does more than one job. Move the function into a program of its own:

1. Make a new folder, such as `ci-fix/`.
2. Move the function into it as `main.rein`. Or keep its file and name it as `entry` in `rein.json`.
3. Add a `package.json` with the program name, such as `"name": "ci-fix"`.
4. Publish the program, or install it from its folder with `rein install ./ci-fix`.
5. Add `ci-fix` to `dependencies` in the `package.json` of each caller, such as with `pnpm add ci-fix`.
6. Make both programs hand off to it: `return @ci-fix(pr=pr);`.

Now `pr-handling` and your program share one public program. Neither one reaches into the other.

See [References](/reference/spec#references) for the full rule, and [Install a program](/install-programs) for the package files.
