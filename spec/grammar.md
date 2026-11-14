## 3. Grammar

```
file        := item*                         // one function, or one struct in a `.struct.rein` file
item        := DOC? ("export" "default"?)? "interface" IDENT "{" field* "}"    // a struct (section 4, Structs)
             | DOC? "export" "default" "async"? "function" IDENT "(" params? ")" block
params      := param ("," param)* ","?       // more than one param is a checker error
param       := DOC IDENT ":" type            // a scalar parameter. DOC is required; the checker reports a missing one
             | "{" IDENT ("," IDENT)* ","? "}" ":" (IDENT | REF)   // a struct parameter, destructured
field       := DOC IDENT ":" type (";" | ",")?   // DOC is required; the checker reports a missing one
type        := "boolean" | "string" | "|"? STRING ("|" STRING)*
block       := "{" stmt* "}"
stmt        := if | switch | return | answer
if          := "if" "(" expr ")" block       // no else: see section 5
switch      := "switch" "(" IDENT ")" "{" clause* "}"
clause      := "case" STRING ":" (block | stmt*)   // a label with no body joins the next body
answer      := DOC "const" IDENT ":" (type | IDENT | REF) "=" "await" awaited ";"?   // IDENT or REF: a struct answer (section 4, Struct answers)
awaited     := "request" "(" value ")"       // ask the agent to do a step (section 4, Async requests)
             | REF | REF "(" args ")"        // a call with return (section 4, Calls with return)
return      := "return" (STRING | TEMPLATE | REF | REF "(" args ")" | IDENT "(" args ")") ";"?   // REF with args: a template call or a hand-off
args        := arg ("," arg)* ","?           // the args of a call or a hand-off
arg         := IDENT "=" value               // named, as in Python. A value with no name is a checker error
value       := STRING | TEMPLATE | IDENT | IDENT "(" args ")" | REF "(" args ")"
expr        := and ("||" and)*
and         := unary ("&&" unary)*
unary       := "!" unary | atom
atom        := "(" expr ")" | IDENT (("===" | "==" | "!==" | "!=") STRING)?
```

A call argument is a STRING, a TEMPLATE, a bare name of a `string` parameter of the caller (or a `string` field of a struct answer, `pick.pr`), or a template call. A hand-off cannot be an argument of a call. Wherever a name is read (a condition, a switch subject, a call argument, `${}`), it may be `answer.field`: one `.` and one level. A declaration never has a `.`.

Every argument has a name, as in Python: `name=value`. The name is a parameter of the callee: its scalar parameter, or a field of its struct parameter. The order of the arguments does not matter. A positional argument is a checker error, and no flag allows it. A parameter is given once.

Helpful errors from the parser:

| Input | Message |
| --- | --- |
| `for`, `while`, `do` in a body | `Rein has no loops yet` |
| `let`, `var` in a body, or `const` that is not an answer | `Rein has no variables, except `/** question */ const x: type = await request(...)`` |
| `import` at the top of a file | `Rein has no imports; reference functions with `@./path` and use std functions directly` |
| `default` in a switch | `Rein has no `default`; add a `case` for every member` |
| `else` | `Rein has no `else`: end the `if` block with a return, and handle the other case after it` |
| `return;` with no value | `` `return` needs a value: a string, a template, or `@./function` `` |
| `true` or `false` in a condition or comparison | `use the boolean parameter directly` |
| a doc comment in any other place | `the doc comment must go right before `export default function`, an `interface`, a parameter, a field, or a const answer` |
| `x: Name` or `x: @./name` as a parameter | `` a struct parameter is destructured: write `{ field, ... }: Name` `` |
| a doc comment before a struct parameter | `` a struct parameter has no doc comment; document each field in its `interface` `` |
| `await` of a name other than `request` or a reference | `only `request` or a reference like `@program` can be awaited` |
| `await` outside a `const` answer, such as `await @./x;` or `return await @./x;` | `` `await` gives an answer; write `/** question */ const name: Type = await @program(...);`, then read `name` `` |
| a bare name as a return value | `expected a string, a template literal, or a reference like `@./path`` |
| a second `export default function` | `expected end of file ...; a file holds one `export default function`` |
