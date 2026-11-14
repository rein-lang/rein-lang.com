### Inputs

A `string` parameter of a normal function is an input. The caller passes its value. The agent is never asked for it.

- An input is used only in a template literal, as `${name}`, or as a bare name argument of a call.
- A condition or a switch subject cannot read an input. Error: `` `pr` is a string input; a condition cannot read it ``.
- `return @./merge(pr=pr);` hands the agent to a normal function and passes the value. The arguments bind by name to the target's `string` parameters.
- An argument is `name=value`, where the value is a STRING, a template literal, or a bare name of a `string` parameter of the caller. Any other bare name is an error: `` `x` is not a string input ``.
- Every `string` parameter of the target is given by name, once. `return @./merge;` to that function is an error: `` `@./merge` takes 1 argument, got 0 ``.
- Arguments to a function with no `string` parameter are an error: `` `@./x` takes no arguments; return it without a call ``.

Example, `main.rein` and `merge.rein`. `main` passes `pr` to `merge`. `merge` uses it in a template literal. `merge` also asks the agent for `ci`, a union, so it is a normal function.

```ts
/**
 * Merge the pull request when it is ready.
 */
export default function main(
  /** The pull request link. */
  pr: string,
) {
  return @./merge(pr=pr);
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
