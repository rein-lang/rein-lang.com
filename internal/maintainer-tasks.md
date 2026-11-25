# Maintainer tasks

Work for the people who build Rein. Users see the plan for them on the site page [Roadmap](../language/roadmap.md).

## Before rein 0.2.0 (2026-12-19)

- Migrate each example program with `rein migrate imports`.
- Migrate each Rein program repo with `rein migrate imports`, and add `rein check --deny-deprecated` to its CI.

## Research

- An agent-agnostic tool that installs agent hooks. Why: each agent keeps its hook config in its own format and place, so Rein should not own a per-agent installer.
