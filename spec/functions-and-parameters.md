## 4. Declarations

### Functions

- `export default function NAME(param) block` is the whole function. The file holds exactly one. `export default async function` is an async function (section 4, Async requests).
- The function doc comment sits right before `export default function`. It gives the function description. It is required, and it must not be empty. There is no flag to skip this rule. `rein check`, `rein eval`, `rein step`, `rein run` and the MCP tools all refuse a function without one.
- The function has zero parameters or one (section 4, Parameters). The parameter may end with a comma.
- The body is a block. It must return on every path (section 5).
- An empty body is an error: `function must return something`.
- A function has at most 40 lines. Its lines run from the `export default` line to its closing `}`, both included. Every line counts, blank and comment lines too. The doc comment above the function and any `interface` outside those lines do not count.
- A program sets another limit with `maxFunctionLines` in its `rein.json`: a positive integer, such as `"maxFunctionLines": 60`. A `.struct.rein` file is not a function, so the limit does not apply to it.

### Doc comments

Rein has four kinds of doc comment. Each one holds only its own text.

- The function doc comment. It sits right before `export default function`.
- A parameter doc comment. It sits right before the parameter, inside the parameter list. It gives the question the agent must answer for that parameter.
- A field doc comment. It sits right before the field, inside the `interface`. It gives the question for that field, or the text the caller passes. A shared struct also has a struct doc comment, right before `export default interface`.
- An answer doc comment. It sits right before the `const` of an async request (section 4, Async requests).

```ts
interface Ticket {
  /** What kind of ticket is it? */
  category: "billing" | "bug" | "question";
  /**
   * Is the customer a VIP?
   * Check the account tier in the CRM.
   */
  vip: boolean;
}

/**
 * Route a new support ticket to the right handling.
 */
export default function handleTicket({ category, vip }: Ticket) {
  if (vip) {
    return @./escalate;
  }
  return `Answer the ticket.`;
}
```

Parsing rules, for each doc block:

- For each line, strip the leading whitespace, then one leading `*`, then one following space if present.
- The text before the first line that starts with `@` is the description. It is trimmed. The lines of one paragraph are joined with one space, so a doc comment over several lines is one line of text. A blank line starts a new paragraph; a run of blank lines is one paragraph break. Example: `/** Does the pull request wait for another pull request or change that is` + newline + `* not merged yet? */` is the description `Does the pull request wait for another pull request or change that is not merged yet?`.
- Text after an `@` line is not part of the description.
- A `@` tag is an error when it is `@param`: `describe each parameter in its own doc comment, right before it`. Any other tag gives a warning: `unknown tag`.
- An empty function description is an error. An empty parameter doc comment is an error: `parameter `x` needs a doc comment: /** question */ x: ...`. A field gives `field `x` needs a doc comment: /** question */ x: ...`.

### Parameters

- A function has zero parameters or one. Two or more is an error: `` a function takes one parameter; put `a` and `b` in a struct ``.
- The parameter is a scalar or a struct.
- A scalar parameter is `name: type`. The type is `boolean`, a union of strings, or `string`.
- `boolean` is true or false. A union is one of its string members. It needs at least 2 unique, non-empty members. A leading `|` is allowed.
- `string` is text. It is an input: the caller passes its value, and the agent is never asked for it (section 4, Inputs).
- A struct parameter is destructured: `{ a, b }: Name`. The braces name every field of the struct, each one once. The body reads each field by its name, as it reads a scalar parameter.
- Errors on the braces: `` `z` is not a field of `Name`; fields are a, b ``, `` destructure every field of `Name`; missing: `b` ``, and `` `a` is destructured twice ``.
- In the rest of this reference, a parameter is the scalar parameter or a field of the struct parameter. Its name is unique within the function. Answer keys, `--set`, `--input`, `rein describe` and the graph use the field names.
