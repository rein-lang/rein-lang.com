## 5. Statements

- `if (cond) { ... }` is a guard. Its block must return on every path. Otherwise the error is `every `if` block must end in a return`.
- There is no `else`. The code after an `if` handles the other case. Guard chains are the form: check a case, return, and continue.
- `switch (name) { ... }` picks one group of `case` labels by the value of a union parameter or answer.
  - Every member of the union needs a case. Otherwise the error is `switch on `x` needs a case for every member; missing: `y``.
  - There is no `default`.
  - Labels with no body join the next body: `case "a": case "b": return x;` is one group.
  - A clause body that has statements must end in a return. Otherwise the error is `case falls through; end it with return`.
- ``return `text`;``, `return `text ${x}`;`, `return @./fn;`, or a call ends the function. The `;` is optional.
- A statement after a `return`, or after a `switch` that always returns, is an error: `unreachable statement`.
- A function must return on every path. A body that can end without a return is an error: `every path must return something; end the function with a return`.
- A function returns something on every path: a string, a template, or a reference to another function. `return;` with no value is an error.

## 6. Conditions

- A boolean parameter or answer is used bare: `if (docs_only)`, or negated: `if (!docs_only)`.
- A union parameter or answer is compared with `===` or `!==`: `if (ci === "green")`.
- A `string` parameter, or a `string` field of a struct answer, cannot be read by a condition or a switch (section 4, Inputs). A `boolean` or union field of a struct answer (`pick.task`) is used like a boolean or union answer.
- `!`, `&&`, `||` combine conditions. `!` binds tightest, then `&&`, then `||`. Parentheses group.
- Evaluation of `&&` and `||` stops early when the result is known.

## 7. Values

- Boolean values: `true`, `false`, `yes`, `no` on the command line. `yes` and `true` mean true. `no` and `false` mean false. Case does not matter.
- Union values: one of the declared members, as a string.
- Return values: a STRING, a TEMPLATE, a reference, or a template call.
