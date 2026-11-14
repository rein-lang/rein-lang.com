## 9. Evaluation

- One run evaluates one function. By default that is `main`.
- The runtime asks for a parameter only when the taken path needs it. This is lazy evaluation.
- A run returns one of:
  - a STRING: the agent does what the text says. A template or a template call expands to a STRING.
  - a REF: the agent runs the target function next, using its description and inputs. The REF is the target's project path, such as `ci/fix`.
  - a request for a parameter: the agent answers the question, then runs again.
  - a request for the agent to act: the agent does the instruction, then answers the `const`, then runs again.
  - a call with return: the agent runs the target to its end, then answers the `const` with the result (section 4, Calls with return). `rein eval` prints it as a request with the instruction ``Run `<target>` to its end. Its final instruction is the result.``
- Parameter values come from `--set name=value`. A boolean takes `true`, `false`, `yes`, or `no`. A union takes one of its members. A `string` parameter takes any text, and it is never a question. Setting one name twice is an error: `input `name` set twice`.
- `--set` also gives an answer its value. An answer's value is checked when the run reaches its `const`.
- A template run by itself is an error.
- A hand-off with arguments carries their values, by name, to the target. The agent runs the target with them (section 4, Inputs).
