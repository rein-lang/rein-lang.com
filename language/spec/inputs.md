### Inputs

Every parameter of a normal function is a call parameter. A call site passes each one by name: a hand-off `return @./x(...)`, `return @program(...)`, and an `await @./x(...)`.

- `return @./merge(pr=pr, ci=ci);` hands the agent to a normal function and passes the values. The arguments bind by name to the target's parameters.
- Every parameter of the target is given by name, once. `rein check` reports a call that leaves one out, at the call: `` missing argument `ci` in call to `@./merge`; write `ci=value` ``. A bare `return @./merge;` gives `` `@./merge` takes 2 arguments, got 0; pass `pr` and `ci` ``.
- A missing `string` argument is an error. A missing `boolean` or union argument is a warning for now, and it will become an error. While it is a warning, the target asks the agent for the value that was not passed.
- Arguments to a function with no parameter are an error: `` `@./x` takes no arguments; return it without a call ``.
- The entry function is the one exception. It gets its `string` parameters from `--input` or `rein_start` (section 11), and it asks its `boolean` and union parameters as questions.

The argument for a `string` parameter is a STRING, a template literal, or a bare name of a `string` parameter of the caller (or a `string` field of a struct answer, `pick.pr`). Any other bare name is an error: `` `x` is not a string input ``.

The argument for a `boolean` or union parameter is one of:

- A bare name of a parameter or an answer of the caller, of a compatible type: `ci=ci`. A `boolean` fits a `boolean`. A union fits a union when each of its members is a member of the target's union, so `"green" | "red"` fits `"green" | "red" | "pending"`.
- A field of a struct answer of a compatible type: `ci=info.ci`.
- A literal: `true` or `false` for a `boolean`, or a quoted member for a union: `ci="green"`.

Any other value is an error: `` `ci` of `@./merge` is `"green" | "red" | "pending"`; pass a parameter or an answer of that type, like `ci=ci`, or a literal: `true`/`false` for a boolean, a quoted member for a union ``. A name of the wrong type is an error: `` `ready` is `boolean`, but `ci` of `@./merge` is `"green" | "red" | "pending"` ``. `true` and `false` are literals, so no parameter, field or answer can have one as its name.

The runtime binds each passed value, so the target does not ask the agent for it.

A string input is used only in a template literal, as `${name}`, or as an argument of a call. A condition or a switch subject cannot read it. Error: `` `pr` is a string input; a condition cannot read it ``.

A value that a function needs during the run, and that no caller has, comes from a typed `await request(...)` inside the function (section 4, Async requests). The doc comment of the answer is the question. The agent gets it as the description of the question.

```ts
/** Is the PR a draft? */
const draft: boolean = await request(`Read ${pr}.`);
```

Example, `main.rein` and `merge.rein`. `main` gets `pr` from `--input` and asks for `ci`. It passes both to `merge`. `merge` uses `pr` in a template literal, and decides on `ci`.

```ts
interface Input {
  /** The pull request link. */
  pr: string;
  /** What is the CI status of the PR? */
  ci: "green" | "red" | "pending";
}

/**
 * Merge the pull request when it is ready.
 */
export default function main({ pr, ci }: Input) {
  return @./merge(pr=pr, ci=ci);
}
```

```ts
interface Input {
  /** The pull request link. */
  pr: string;
  /** What is the CI status of the PR? */
  ci: "green" | "red" | "pending";
}

/**
 * Merge the pull request when CI is green.
 */
export default function merge({ pr, ci }: Input) {
  if (ci === "green") {
    return `Merge ${pr}. Then delete its branch.`;
  }
  return `Wait for CI, then start this program again.`;
}
```
