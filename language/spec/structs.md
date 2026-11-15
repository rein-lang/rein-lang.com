### Structs

A struct is a TypeScript `interface`: a list of fields. A field is like a scalar parameter: a doc comment, a name and a type (`boolean`, `string`, or a union). A field ends with `;`, `,`, or nothing. A field cannot be a struct. Rein has one struct form, `interface`. It has no `type X = { ... }`.

A struct is inline or shared.

- An inline struct is an `interface` in the file of the function. It is the input of that function only. No other file can name it.
- An inline struct cannot be exported. Error: `` input struct `Input` cannot be exported; to share it, move it to its own `.struct.rein` file ``.
- A struct answer may name the std struct `Setup` (see Std and templates) without declaring it. A file that declares its own `interface Setup` uses its own.
- The function names its inline struct: `({ a, b }: Input)`. A missing one is an error: `` cannot find struct `Input`; declare `interface Input { ... }` in this file ``.
- An inline struct that the function does not take gives a warning: `` unused struct `X`; an inline struct is the input of the function in its file ``.
- A shared struct is a file `<name>.struct.rein`. It holds one `export default interface` and nothing else. Error: ``a `.struct.rein` file holds one `export default interface` and nothing else``.
- A shared struct needs a doc comment: `` missing doc comment on struct `Name`; put /** description */ right before `export default interface` ``.
- A function names a shared struct with a reference: `({ a, b }: @./message)` names the struct of `message.struct.rein` in the same folder. The reference rules apply (section 4, References): the path is relative, has no extension, and stays inside the root. A missing file is an error: `` cannot find struct `@./message`; a shared struct is a `message.struct.rein` file ``.
- When two functions take the same struct, use a shared struct. An inline struct belongs to one function.
- A function reference, such as `return @./message;`, never names a `.struct.rein` file.

Example: `message.struct.rein`, a shared struct that two templates take.

```ts
/**
 * One sentence for the customer: what happened, then what comes next.
 */
export default interface Message {
  /** The first part of the sentence, such as the action taken. */
  opening: string;
  /** The next step the customer can expect. */
  next_step: string;
}
```

`refund/tell_customer.rein` takes it. `faq/close_ticket.rein` takes it the same way.

```ts
/**
 * Tell the customer what happens next, in one sentence.
 */
export default function tellCustomer({ opening, next_step }: @../message) {
  return `${opening} ${next_step}`;
}
```

A caller gives each field by name: ``@./refund/tell_customer(opening=`...`, next_step=`...`)``.
