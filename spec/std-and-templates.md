### Std

The std library needs no import. Its names are always available: `delegate`, `askUser`, and `request`.

| Name | Kind | Signature | Text |
| --- | --- | --- | --- |
| `delegate` | template | `delegate({ model, task }: Input)` | "Delegate this task to a subagent.\nModel: ${model}\nTask: ${task}". Doc: "Hand a task to a subagent, with the model to use." Its input is an inline struct. Fields: `model`, the model the subagent runs on; `task`, what the subagent does. A call is `delegate(model="...", task="...")`. |
| `askUser` | template | `askUser(question: string)` | "Ask the user: ${question}". Doc: "Ask the user a question and wait for the answer." Param: `question`, the question in the user's language. |
| `request` | built in | `await request(value)` | Asks the agent to do a step, then wait for its answer (section 4, Async requests). It is not a template. |

An unknown std name is an error that lists the std names: `` `x` is not in std; std has: askUser, delegate, request ``.

### Templates

A template is a file whose function meets every rule below. It is like a Rust macro: it expands to a string. Any other function is a normal function. A normal function may mix `string` fields with boolean and union fields in its struct.

- It has a parameter. The parameter is a `string`, or a struct whose fields are all `string`. Each one has its own doc comment.
- The body is exactly one `return` of a template literal. There is no `if`, no `switch`, no import, and no other statement.
- Every parameter is used in the template literal: `` template parameter `x` is not used; add ${x} to the template ``.
- A template is called from a function, by a std name (`delegate(...)`) or a reference (`@./templates/reply(...)`).
- A template call is a value, not a step. It adds no hop to the `rein step` trace.
- Call arguments are named (`name=value`) and their values are strings, template literals, bare names of a `string` parameter of the caller, or template calls. A template literal argument may interpolate a union parameter or a union answer of the caller. A boolean cannot be interpolated.
- Every parameter is given once, by name: `` missing argument `b` in call to `@./tpl`; write `b=value` ``.
- A template is never run by itself: `rein eval <template>` is an error, `templates are called from functions, not run`.

Section 4, Structs, shows a template, `refund/tell_customer.rein`, that takes a shared struct.
