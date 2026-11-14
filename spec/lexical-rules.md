## 2. Lexical rules

- A line comment starts with `//` and ends at the end of the line.
- A doc comment starts with `/**` and ends at the first `*/`. Its raw text is the doc block (section 4). `/**/` is an empty doc comment.
- A plain block comment `/* ... */` is not supported. The error is `use `//` for comments or `/** */` for the doc block`.
- An unterminated doc comment is an error: `unterminated doc comment; add */`.
- A STRING is text in double quotes or single quotes. Escapes: `\"`, `\'`, `\\`, `\n`. A raw newline is not allowed inside a STRING.
- A TEMPLATE is text in backticks. It may span lines. Dedent: the least indent shared by its non-blank lines after the first is removed from each of those lines. Extra indent past it stays. This departs from TypeScript, which keeps the indent. Style: write each continued line at the indent of the line where the template starts. Example: a `return` at 2 spaces, with the template's second line also at 2 spaces, has the text `Tell the customer a person` + newline + `will reply.`, with no spaces after the newline. An escaped `\n` is not a line break and does not trigger the dedent. It can interpolate a name with `${name}`. Only a bare name is allowed inside `${}`. Escapes: `` \` ``, `\\`, `\$`, `\n`.
- String kinds. Text uses backticks; a tag uses quotes. Text needs line breaks and `${name}`; a tag reads as a TypeScript literal type.

  | Position | Form | Example |
  | --- | --- | --- |
  | Return value (an instruction or a final answer) | TEMPLATE | ``return `Merge the pull request.`;`` |
  | Call argument value: std templates (`delegate`, `askUser`), project templates, hand-offs and calls with return (`await @./x(...)`) with arguments | TEMPLATE, or a bare name of a `string` parameter | ``delegate(model=`use opus model`, task=`review ${pr}`)`` |
  | `request(...)` argument | TEMPLATE, or a template call | ``await request(`Run the tests.`)`` |
  | Union member in a parameter, field or answer type | STRING | `ci: "green" \| "red"` |
  | `===` and `!==` operand | STRING | `ci === "green"` |
  | `case` label | STRING | `case "green":` |

  A tag may use double or single quotes. Why: both are TypeScript string literal types, and one quote style is a formatter's job, not the compiler's. `rein.json` is JSON, not Rein, so the rule does not apply to it.
- A line holds at most 80 characters. This is the Prettier default `printWidth` (https://prettier.io/docs/options#print-width). The rule counts characters, not bytes, and a tab counts as one character. It applies to every line of every `.rein` file, `.struct.rein` files, doc comments and strings too. A program sets another limit with `maxLineLength` in its `rein.json`: a positive integer, such as `"maxLineLength": 120`.
- A blank line sets off each `if` from the code around it. The line above an `if` is empty, unless the `if` is the first statement of its block (the `if` follows the `{` that opens the block). The line after an `if` block's closing `}` is empty, unless the next non-empty line is a `}`, or the file ends. A `//` comment line directly above an `if` counts as the line before it, so the empty line goes above the comment. Rein has no `else` (section 5), so there is no `else if` chain. The rule is a warning, not an error: `add an empty line before `if`` or `add an empty line after the `if` block`. A program with these warnings still runs. Why: see [decisions.md](../decisions.md).
- A REF is `@` followed by `./` or `../`, then path names made of letters, digits and `_`, separated by `/`. It has no extension. Examples: `@./ci/fix`, `@../escalate`. A REF that does not start with `./` or `../` names another program: `@program` or `@program/function`. The program name is as `rein list` shows it, and may hold `-`. The function path holds names of letters, digits and `_`. Examples: `@pr-handling`, `@pr-handling/main`. A malformed one is an error: `a reference is `@./path`, `@../path`, or `@program/function` for another program`.
- An IDENT matches `[A-Za-z_][A-Za-z0-9_]*`. A declared name (a parameter, a struct field, an answer) is snake_case, as paths are: `is_draft`, `next_step`. A name with an uppercase letter is a warning that gives the snake_case name.
- Keywords: `import`, `from`, `export`, `default`, `function`, `if`, `else`, `switch`, `case`, `return`, `boolean`. A keyword cannot be a name.
- Reserved words: `for`, `while`, `do`, `const`, `let`, `var`. They are not Rein. Using one gives a helpful error (section 3). A file name segment cannot be one either. `const` is allowed only for an answer (section 4, Async requests).
- `string`, `async` and `interface` are names with a role in a type, a function header, or a struct. `await` and `request` are names with a role in an answer.
- Operators: `===`, `==`, `!==`, `!=`, `&&`, `||`, `!`, `|`, `(`, `)`, `{`, `}`, `,`, `:`, `;`, `=`.
  - `==` is the same as `===`, and `!=` the same as `!==`. The messages and the graph show `===` and `!==`.
- Any other character, such as `#`, is an error: `unexpected character`.
- A UTF-8 byte order mark at the start of a file is whitespace.
