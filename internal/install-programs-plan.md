# Install a program: plan and open questions

The site page [Install a program](../language/install-programs.md) describes what the `rein` binary does today. This page holds what is proposed and not built.

## Proposed

- Select a version by a range at start, such as `rein run pr-handling@1`. Today an npm alias gives a second version its own name.
- Rein checks `engines.rein` at install. Today `rein list -l` only warns.
- Rein-specific fields do not go in `package.json`. A separate Rein file holds them. That file is not defined yet.
- Program identity and local names: see Naming in [decisions.md](decisions.md).

## Open questions

- The name of the future Rein file, and its fields. Rein-specific fields go there.
- The future of `rein.json`. Does the Rein file replace it?
- Version selection at start. Is it `rein run pr-handling@1`, or the alias name `rein run pr-handling-v1`?
- Lockfile sharing. Is there one `pnpm-lock.yaml` for all programs, or one per program?
- Scripts. The default passes `--ignore-scripts`. Should a package be able to allow its own scripts without the user passing `--ignore-scripts=false`?
