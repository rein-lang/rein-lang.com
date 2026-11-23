---
description: "Learn the Rein model on one page: a Rein program is an app for the agent. Its process asks typed questions one at a time, and each function is one file."
---

# Concepts

Rein describes a program as a set of small functions. Each function is one file. The functions reference each other by path. Together they tell the agent what to do next, one step at a time.

```mermaid
flowchart TD
    A["Agent"] --> B["main"]
    B -- "asks" --> C["Answer"]
    C --> B
    B -- "hands off" --> D["Function"]
    D -- "instructs" --> E["Agent acts"]
```

## A program is an app

A Rein program is an app for an AI agent. The agent opens the program. The program asks one question. The agent answers, and the program gives the next step. The agent cannot skip a step.

Four words cover the model:

- **Program.** The app. You install it, list it, and update it. Its entry point is `main`.
- **Process.** The steps the program runs, from its first question to its last instruction.
- **Question.** One typed input that the agent must answer. The program asks only the questions the current path needs.
- **Step.** What the program gives the agent next: a question, a request, or the final instruction.

## The agent drives the process

Rein does not run the agent. The agent starts a program with the `rein_start` MCP tool, or with `rein run`, and answers it one step at a time. The program holds its state while it runs. The agent does each step it is given. See [Evaluation](/reference/spec#_9-evaluation) for what a run returns.

## Functions are files

A project holds one function per file, and the file path gives the function its name. The entry point is always `main`. A function describes itself in a doc comment. Every input carries a question of its own, which the agent reads before it answers. See [Declarations](/reference/spec#_4-declarations).

## Functions hand off by reference

A function ends in text for the agent, a reference to another function, or a call to a template that builds text. An import names another function by its path from the current file, as `import { fix } from "./fix";`. See [Imports](/reference/spec#imports) and [Templates](/reference/spec#templates).

## Inputs are typed questions

An input is a boolean or a choice of strings. Rein asks for an input only when the path it is on needs that input. Inputs look like TypeScript parameters, so they are easy to read. The agent gets one step at a time. [Progressive disclosure](/progressive-disclosure) explains why. See [Parameters](/reference/spec#parameters) and [Conditions](/reference/spec#_6-conditions).

## Requests wait for the agent

Some steps ask the agent to act first. The agent does the step, gives the answer, and the process goes on. A live run holds its answers. With `rein step`, Rein keeps no state: each call takes every answer so far. See [Async requests](/reference/spec#async-requests).

## Strict by design

Rein favors explicit cases over fallbacks. The checker reports a missing case, or a path with no result, before a run starts. The rules live in the [checker section](/reference/spec#_8-checker-rules). The reasons for these choices live in [Decisions](/reference/decisions). For why Rein is its own small language, see [Why not an existing language](/why-not-a-programming-language).

## Skills and programs

A skill is a manual. The agent reads it and decides each step. A program is an app. It asks the agent one question at a time. See [Skills and programs](/rein-vs-skills) for when to use each.
