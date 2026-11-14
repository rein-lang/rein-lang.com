## 8. Checker rules

When a file has a syntax error, only that error is reported for the file. It is the first syntax error. The other checks run after the syntax error is fixed.

### Errors

| Rule |
| --- |
| A quoted string in a text position (`` text uses backticks: write `...` instead of "..." ``). Text positions are listed in section 2, String kinds |
| A template in a tag position (`` a tag uses quotes: write "green" instead of `green` ``). It is a syntax error. A template with `${}` or a newline shows `...` |
| A function file name has a `/` part that is not an identifier, or is a keyword or reserved word (`invalid function file name`) |
| The file has no function doc comment (`missing doc comment on `NAME`; put /** description */ right before `export default function``). A `//` line comment does not count. |
| The function description is empty (`empty description on `NAME`; write the function description in the doc comment`). A doc block with only `@` tags is empty. |
| A parameter has no doc comment or an empty one |
| A doc comment has `@param` |
| The function body is empty (`function must return something`) |
| A function has more lines than the limit (`` function `NAME` has N lines; the limit is M. Move part of it into its own function and call it with `@./name` ``). It points at the header, `export default function NAME` |
| `rein.json` sets `maxFunctionLines` to a value that is not a positive integer (`` `maxFunctionLines` in rein.json must be a positive integer, such as 40; found VALUE ``). It points at `rein.json`, and the limit stays 40 |
| A line has more characters than the limit (`` line has N characters; the limit is M. Break the line; a long text can be a template (backticks) that spans lines ``). It points at the part of the line after character M |
| `rein.json` sets `maxLineLength` to a value that is not a positive integer (`` `maxLineLength` in rein.json must be a positive integer, such as 80; found VALUE ``). It points at `rein.json`, and the limit stays 80 |
| Two parameters share a name |
| A function has two or more parameters (`` a function takes one parameter; put `a` and `b` in a struct ``) |
| A struct parameter names a field that its struct does not have, leaves a field out, or names a field twice |
| A struct parameter names an inline struct that the file does not declare, or a shared struct that does not resolve |
| An inline struct is exported |
| A field has no doc comment (`` field `x` needs a doc comment: /** question */ x: ... ``), two fields share a name, or a field union is not valid |
| A `.struct.rein` file holds a function, a second struct, or a struct that is not `export default` |
| A shared struct has no doc comment, or an empty one |
| A `.struct.rein` file name has a `/` part that is not an identifier (`invalid struct file name`) |
| A union has fewer than 2 members |
| A union has a duplicate or an empty member |
| A condition uses a union parameter bare |
| A condition compares a boolean parameter with `===` or `!==` |
| A condition or switch subject names an unknown parameter |
| A condition or switch subject names a `string` parameter (`` `pr` is a string input; a condition cannot read it ``) |
| A bare name in an argument is not a `string` parameter of the caller (`` `x` is not a string input ``) |
| `switch` subject is not a union |
| A compared value or case value is not a member of the union |
| A switch does not have a case for every member |
| Two case labels use the same value |
| A `case` body does not end in a return (`case falls through; end it with return`) |
| An `if` block does not end in a return (`every `if` block must end in a return`) |
| A path through the function ends without a return (`every path must return something`) |
| A statement follows a terminating statement (`unreachable statement`) |
| A reference does not resolve (`` cannot find function `@./x` ``), or leaves the root (`` `@../../x` leaves the project root ``) |
| A program reference names a program that is not installed (`` cannot find program `x`; run `rein list` to list programs ``), or a function the program does not have (`` cannot find function `f` in program `x` ``) |
| A reference to a template is returned without a call |
| A call, a hand-off or an `await` has a positional argument (`` missing argument `a` in call to `@./tpl`; write `a=value` ``) |
| A call, a hand-off or an `await` names an argument that is not a parameter (`` `c` is not a parameter of `@./tpl`; parameters are a, b ``) |
| A call, a hand-off or an `await` gives one parameter twice (`` `a` is given twice in call to `@./tpl`; give each name once ``) |
| A call, a hand-off or an `await` leaves a parameter out (`` missing argument `b` in call to `@./tpl`; write `b=value` ``) |
| A call, a hand-off or an `await` gives arguments to a function with no `string` parameter (`` `@./x` takes no arguments; return it without a call ``) |
| A call to a function that is not a template is not the value of a `return`, for example inside an argument or a `request` value (`A hand-off cannot be an argument of a call.`) |
| A std name is unknown, or a call names a std item that is not a template |
| A template has an `if`, a `switch`, an import, or a statement other than one template return |
| A template parameter is not used |
| A template interpolates a boolean, or a name that is not a parameter or an answer |
| An import statement is in the file (`Rein has no imports`) |
| `await` without `export default async function` |
| `await` of a name other than `request` or a reference (`only `request` or a reference like `@program` can be awaited`) |
| `await` outside a `const` answer (`` `await` gives an answer; write `/** question */ const name: Type = await @program(...);`, then read `name` ``) |
| An `await` names a template (`` `@./tpl` is a template; only a function can be awaited ``). A target that does not resolve, or a wrong argument, gives the hand-off errors above |
| An answer has no doc comment |
| An answer is a `string` (``a `string` answer is not allowed; answer a struct with a `string` field``) |
| A struct answer names a struct that does not exist (`` cannot find struct `X` ``) |
| A field of a struct answer is not in the struct (`` `z` is not a field of `Pick`; fields are pr, task ``), or the answer itself is read as a value (`` `pick` is a struct answer; read one of its fields, like `pick.field` ``) |
| An answer name clashes with a parameter or another answer (`duplicate name`) |
| An answer is used before its declaration (`` `x` is used before it is declared ``) |
| The flow root has no `main.rein` (`project has no main.rein; it is the agent's entry point`). It is reported on `main.rein`, at 1:1. A step reports it only when its entry is missing too |
| A hand-off reaches, inside another program, a program that is not installed or a function that the program does not have (`` `@b/main` hands off to `@c/main`: unknown program `c`; run `rein list` to list programs, or `rein install -g c` to install it ``). It is reported on the function of this project that starts the hand-off, at 1:1 |

### Warnings

| Rule |
| --- |
| A parameter is declared but never used |
| An inline struct is not the parameter of the function in its file (`unused struct`) |
| An `async` function has no `await` |
| A reference cycle, such as `a -> b -> a`. A cycle acts as a loop. The checker gives one warning on every return of a reference that lies on the cycle |
| A doc tag other than `@param` (`unknown tag `@x``) |
| A function cannot be reached from the entry (`main`, or `entry` in `rein.json`) through references (`x is not reachable from main`). This warning is not given when the entry is missing or has a syntax error |
| A function that exactly one other function calls is not in the folder named after that caller (`` `fix_ci` is only called by `merge`; move it to `merge/fix_ci.rein` so the folders show the flow. The move changes its answer keys and breaks `@<program>/fix_ci` references from other programs ``). A function that only the entry calls belongs at the root. It is not given when the entry is missing or has a syntax error, since reachability is unknown. Section 1 has the rule and its exceptions |
| An `if` has no empty line above it, unless it is the first statement of its block (`add an empty line before `if``). It points at the `if` keyword. Section 2 has the rule |
| An `if` block has no empty line after its closing `}`, unless the next non-empty line is a `}` (`add an empty line after the `if` block`). It points at the `}`. Section 2 has the rule |
| A parameter, struct field or answer name holds an uppercase letter (`` `isDraft` is camelCase; names are snake_case: write `is_draft` ``) |
