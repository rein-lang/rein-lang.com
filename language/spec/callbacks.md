### Callbacks

A callback is a parameter of type `@`. The caller passes a function, and the function goes on to it when its work is done. So a callee continues the flow of its caller without naming the caller.

```ts
interface Input {
  /** The link of the pull request to merge. */
  pr: string;
  /** Where the flow goes after the merge. */
  then: @;
}

/** Merge one pull request, then go on to the callback. */
export default async function merge({ pr, then }: Input) {
  /** Did the pull request merge? */
  const merged: boolean = await request(`Merge the pull request.`);
  if (!merged) {
    return askUser(question=`The merge failed. What do I do?`);
  }
  return then;
}
```

- The caller passes a callback by name, like a `string` input: `return @./merge(pr=pr, then=@./after);`. The value is a reference: `@./path`, `@../path`, `@program` or `@program/function`. The reference rules apply (section 4, References).
- The target of the reference takes no arguments, as in `return @./path;`. A template is an error.
- `return then;` hands the agent to the function the caller passed. It is a hand-off, like `return @./path;`.
- A function passes a callback on by name: `return @./merge(pr=pr, then=then);`.
- A callback is not a value. A condition, a switch subject, a template literal, a `string` argument, or a `request` argument cannot read it: ``then` is a callback; return it (`return then;`) or pass it to a callback parameter`.
- A callback is never an answer: a `const x: @`, or a struct answer with a `@` field, is an error: `a callback is not an answer; the caller passes it`.
- A callback that is never used gives the warning `unused parameter`, as any parameter does.
- A callback argument is checked like a reference: ``then` is a callback; pass a reference like `then=@./name`` for a text value, and ``@./x` is a reference; only a callback (`@`) parameter takes one` for a reference passed to another parameter.
- A function with a callback parameter is not a template.
- The relative reference in `then=@./after` resolves in the file that writes it, so a callback can point back into the caller's own program. Program references resolve by name, as every `@program` does.
