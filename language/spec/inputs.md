### Inputs

A `string` parameter of a normal function is an input. The caller passes its value. The agent is never asked for it.

- An input is used only in a template literal, as `${name}`, or as a bare name argument of a call.
- A condition or a switch subject cannot read an input. Error: `` `pr` is a string input; a condition cannot read it ``.
- `return @./merge(pr=pr);` hands the agent to a normal function and passes the value. The arguments bind by name to the target's parameters.
- An argument for a `string` parameter is `name=value`, where the value is a STRING, a template literal, or a bare name of a `string` parameter of the caller. Any other bare name is an error: `` `x` is not a string input ``.
- Every `string` parameter of the target is given by name, once. `return @./merge;` to that function is an error: `` `@./merge` takes 1 argument, got 0 ``.
- Arguments to a function with no parameters are an error: `` `@./x` takes no arguments; return it without a call ``.

#### Passing a boolean or a union

A hand-off, an `await` call, and a hand-off to another program can also pass a `boolean` or union parameter of the target. The target does not ask the agent for a passed value. Its conditions and `switch` read it like an answer.

- For a union parameter, the value is a bare name of a union parameter or answer of the caller, or a quoted member: `account=account`, `mode="fast"`.
- A caller union fits when each of its members is a member of the target's union. The target's union may have more members. A caller member that the target lacks is an error: `` `account` can be `shared`, which `account` of `@./handle` does not have; its members are `work`, `home` ``.
- A quoted value that is not a member is an error: `` `slow` is not a member of `mode` of `@./handle`; members are `fast`, `safe` ``.
- For a `boolean` parameter, the value is a bare name of a `boolean` parameter or answer of the caller, or `true` or `false`. So no parameter or answer is named `true` or `false`.
- Any other value is an error: `` `mode` of `@./handle` is `"fast" | "safe"`; pass a parameter or an answer of that type, like `mode=mode`, or a literal: `true`/`false` for a boolean, a quoted member for a union ``. A name of another type is an error: `` `ci` is `"green" | "red"`, but `big` of `@./review` is `boolean` ``.
- Passing a `boolean` or union parameter is optional. When the caller leaves it out, the target asks the agent, as before. The checker gives a warning: `` missing argument `ci` in call to `@./merge`; write `ci=value` ``.

```ts
export default function main(
  /** Which account? */
  account: "work" | "home",
) {
  return @./handle(account=account, mode="fast");
}
```

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
