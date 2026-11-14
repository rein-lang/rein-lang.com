## 11. Stepping (agent interface)

`rein step` steps the whole flow in one call. It is the interface for agents. `rein eval` evaluates one function, and is the debug command. Live runs (`rein run`, `rein serve --mcp`) call the same logic and keep the answers above it; see [interface.md](../interface.md). The stepping logic lives in `rein_core::step`. It is pure: no I/O and no state. The CLI only parses flags, calls it, and prints.

Protocol version 1. A request and a response are JSON objects, each with a `version` field. A daemon or another transport can carry the same objects unchanged.

### Request

```json
{"version": 1, "entry": "main", "answers": {"main.vip": "no"}}
```

```json
{"version": 1, "flow": "support-ticket", "answers": {"main.vip": "no"}}
```

```json
{"version": 1, "entry": "main", "inputs": {"pr": "https://example.com/pr/1"}, "answers": {}}
```

- `version`: default `1`. Another value is an error. Adding the optional `flow` and `inputs` fields did not change the version.
- `flow`: optional. The name of a visible flow (section 1a). The CLI resolves it to a flow root and steps that root. Give `flow` or a root, not both.
- `entry`: the function to start from, by its path. Default `main`.
- `inputs`: optional. An object. Each key is the name of a `string` parameter of the entry function, and each value is its text. Default `{}`.
- `answers`: the answers so far. Each key is `<function path>.<name>`, where `name` is a parameter or a `const` answer, such as `merge_pr.ci` or `faq.solved`. A function of another program has the path `@program/function`, such as `@pr-handling/main.task`. Inside a call with return, a key starts with the caller's answer key and `>`. When `main` runs `const b: Found = await @./fn(...)`, the answers of `fn` in that call are `main.b>fn.ok`, and of another program `main.b>@pr-handling/main.draft`. Calls nest: `main.b>fn.c>leaf.ok`. A hand-off adds no prefix of its own: outside any call its keys are as before, and inside a call it keeps the call's prefix, such as `main.b>g.ok` when `fn` returns `@./g`. Each part before a `>` must be a call that a walk can make: `<function>.<const>`, an `await` whose target reaches the next function through hand-offs. Any other key is unknown, such as `main.b>leaf.ok` when `leaf` is only awaited by `fn`. Each value is as `--answer` takes it: `yes`, `no`, or a union member. The value of a struct answer is a JSON object, such as `{"pr": "https://example.com/pr/1", "task": "review"}`: with `--stdin` it is a real JSON object, and with `--answer` it is the JSON text (`--answer main.pick='{"pr":"https://example.com/pr/1","task":"review"}'`). The runtime checks it: it is an object, every field is present, no other field is, a `string` field is non-empty text, a `boolean` field is `true` or `false`, and a union field is a member. An error names the field, such as `` field `pick.pr` is empty; give some text ``. Responses echo a struct answer as a JSON object. Default `{}`.

### Response

`kind` is one of four values. Every response has `version`, `answers` (the answers the request gave, echoed back), and `trace` (the function paths visited, in order).

| `kind` | Fields | Meaning | Exit code |
| --- | --- | --- | --- |
| `question` | `key`, `function`, `name`, `type` (`boolean` or `union`), `options` (union members, else `null`), `description` | Answer `key`, then step again. | 2 |
| `request` | `key`, `function`, `instruction`, `response` (`name`, `type` (`boolean`, `union` or `struct`), `options`, `description`, and for a struct `fields`) | Do `instruction`, then answer `key`, then step again. | 3 |
| `done` | `instruction` | The flow ended. Do `instruction`. | 0 |
| `error` | `message`, `key` (or `null`), `diagnostics` (`file`, `line`, `column`, `message`) | The request is not valid. Fix it and step again. | 1 |

For a struct answer, `response.type` is `struct`, `options` is `null`, and `response.fields` lists the fields of the struct, in order. Each field is `{name, type, options, description}`: `type` is `boolean`, `union` or `string`, `options` lists the members of a union (else `null`), and `description` is the field doc comment. The answer is a JSON object with exactly these fields.

```json
{"kind": "request", "version": 1, "key": "main.pick", "function": "main", "instruction": "Pick the next pull request notification.",
 "response": {"name": "pick", "type": "struct", "options": null, "description": "The pull request of the next notification.",
  "fields": [
   {"name": "pr", "type": "string", "options": null, "description": "The link of the pull request."},
   {"name": "task", "type": "union", "options": ["review", "address comments", "fix ci", "merge"], "description": "Which task pr-handling runs."}]},
 "answers": {}, "trace": ["main"]}
```

The answer for that request, in `answers`:

```json
{"main.pick": {"pr": "https://example.com/pr/1", "task": "review"}}
```

### Stepping rules

- The step starts at `entry`. It evaluates the function with its inputs and the answers whose key names that function. The lazy rules of section 9 apply.
- A reference is followed in the same call. Only a question, a request, a final instruction, or an error ends a call. The `trace` shows each hop.
- A call with return (`const x: T = await REF(args);`) with no answer for `x` walks REF in the same call, as a hand-off. When that walk ends with text, the response is not `done`. It is a `request` for the caller's `const`: `key` and `function` are the caller's, such as `work.projects`, and `response` is the type of the `const`. `instruction` is the text, a blank line, and ``Then answer `<key>` with the result.``. The `trace` shows the hops into REF. When `x` has an answer, REF is not walked and the caller goes on. The keys of REF's answers start with the caller's key and `>`, such as `work.projects>find.ready`, so each call has its own answers. A second call of REF, or a recursive call, asks its questions again. A callee that awaits a function asks for its own `const` first. The 64-function limit still holds, so a recursion that the answers do not end is an error. `rein graph` and `rein watch` draw functions, not calls: a function walked in several calls is marked with the answers of its first call.
- A flow may visit at most 64 functions in one call. A flow that goes further is an error: `flow did not finish in 64 steps (reference cycle?)`.
- An answer is checked before the flow runs. An unknown key is an error, and the error names the key. A value outside the type is an error, and the message lists the accepted values.
- A string parameter cannot be answered. It is an input: give it in `inputs`.
- A `string` parameter of the entry function that has no key in `inputs` is an error: `` missing input `pr`; give it with --input pr=<value> ``.
- A key in `inputs` that is not a `string` parameter of the entry function is an error: `` unknown input `x` ``.
- A project with checker errors is refused. The error lists the diagnostics. Warnings do not block a step.
- A template cannot be the entry.

### Statelessness

The response depends only on the project and the request. The runtime keeps nothing between calls, so the caller sends every answer so far. A harness adds the key from the last response to `answers`, then steps again. The same project and the same request always give a byte-equal response. The code uses no clock, no randomness, and no global state.

### CLI

```text
rein step --root examples/rein/support-ticket --answer main.vip=no --json
rein step examples/rein/support-ticket/main.rein --answer main.vip=no --json
rein step --root examples/rein/support-ticket --stdin < request.json
rein step --flow support-ticket --json
```

The program is a `.rein` path or a `rein list` name, and it may be given as the positional argument. A path is the program itself: its folder is the root and its name is the entry (section 1a). `--flow` and `--root` still work.

`--stdin` reads one request as JSON, and then the output is always JSON. Do not combine `--stdin` with `--entry`, `--answer` or `--input`. `--answer` repeats for each key. An answer key may be given once. `--input` repeats for each name.
