# Rein language reference

Status: proof of concept. Private. Rules here drive the checker and the evaluator.
Design reasons and open questions live in [decisions.md](decisions.md).

Rein mimics TypeScript syntax and types, except `@` references. A reader who knows TypeScript can read a Rein file. Rein is not TypeScript: it has no imports, no loops, no global scope, and no `default` or `else`. A function gets its values only from its parameter and its answers.
## Topics

Each topic file keeps its section numbers. Read the file for the rule you need.

- [Project layout](spec/project-layout.md): section 1, flows and scopes (1a).
- [Lexical rules](spec/lexical-rules.md): section 2.
- [Grammar](spec/grammar.md): section 3, and the parser errors.
- [Functions and parameters](spec/functions-and-parameters.md): section 4, functions, doc comments and parameters.
- [Structs](spec/structs.md): section 4, inline and shared structs.
- [References](spec/references.md): section 4, relative and program references.
- [Std and templates](spec/std-and-templates.md): section 4, std names and templates.
- [Inputs](spec/inputs.md): section 4, `string` parameters.
- [Async requests](spec/async-requests.md): section 4, `request` answers and struct answers.
- [Calls with return](spec/calls-with-return.md): section 4, `await` of a function.
- [Statements, conditions and values](spec/statements-conditions-values.md): sections 5, 6 and 7.
- [Checker rules](spec/checker-rules.md): section 8, errors and warnings.
- [Evaluation](spec/evaluation.md): section 9.
- [CLI commands](spec/commands.md): section 10, commands and output formats.
- [Editor tools](spec/editor-tools.md): section 10, language server and debug adapter.
- [Stepping](spec/stepping.md): section 11, the agent interface.
- [Agent integration](spec/agent-integration.md): section 12, agent hooks.
