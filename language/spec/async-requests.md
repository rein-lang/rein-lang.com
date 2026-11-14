### Async requests

A function can ask the agent for a step and wait for an answer. The answer is a typed `const`:

```ts
/** Answer a FAQ ticket with a help article, or escalate it. */
export default async function answerFaq(
  /** Did you find a help article that answers the question? */
  article_found: boolean,
) {
  if (!article_found) {
    return @../escalate;
  }
  /** Did the customer confirm the article solved the problem? */
  const solved: boolean = await request(
    `Reply with the help article link and ask the customer if it solved the problem.`,
  );
  if (solved) {
    return `Close the ticket as solved.`;
  }
  return @../escalate;
}
```

- The `const` must have a doc comment, a type (`boolean`, a union of strings, or a struct; not `string`), `= await request(value)`, and an optional `;`. A bare `string` is an error: ``a `string` answer is not allowed; answer a struct with a `string` field``.
- `value` is a string, a template literal, or a template call. ``await request(delegate(model=`use opus model`, task=`code review the pr`))`` is valid.
- The `const` is the only `const` in Rein. It is an answer, not a variable. Its name is a parameter for the rest of its block. A name clash with a parameter or another answer is an error: `duplicate name`. Using the name before its declaration is an error: `` `x` is used before it is declared ``.
- `await` needs `export default async function`. An `async` function with no `await` is a warning: `` `async` function has no `await`; drop `async` ``.
- An answer is never free text. To get a value such as a link, answer a struct with a `string` field (next section).
- The answer is stateless. When the run reaches the `await`, and no value is given for the answer, the run stops with a request (section 9).

### Struct answers

An answer can be a struct. The struct is an inline `interface` in the file, or a shared `@./name` (`name.struct.rein`). Section 4, Structs, gives the struct rules.

```ts
interface Pick {
  /** The link of the pull request. */
  pr: string;
  /** Which task pr-handling runs. */
  task: "review" | "address comments" | "fix ci" | "merge";
}

/** Pick the next pull request notification and hand it off. */
export default async function pullRequest() {
  /** The pull request of the next notification. */
  const pick: Pick = await request(`Pick the next pull request notification.`);
  return @pr-handling(pr=pick.pr);
}
```

- Only a `request` answer can be a struct. A parameter cannot.
- Every field is `boolean`, a union, or `string`, and has a doc comment (the struct rules of section 4). A `string` field is allowed because the struct gives the value a name, a doc comment and a schema.
- `pick.pr` reads one field. It is one level: `a.b.c` is an error. The field is in scope as long as the answer is.
- A `string` field is used where a `string` parameter is used: a hand-off or template argument (`@./merge(pr=pick.pr)`) and `${pick.pr}` in a template literal. A `boolean` or union field is used like a boolean or union answer: in a condition or in a `switch` (`switch (pick.task)`).
- Errors: `` `z` is not a field of `Pick`; fields are pr, task ``, `` `pick.pr` is a string input; a condition cannot read it ``, and `` `pick` is a struct answer; read one of its fields, like `pick.field` ``.
- `rein step` asks for the struct as a JSON object (section 11).
