#!/usr/bin/env sh
# Regenerate the CLI reference pages (generate-cli.sh) and fail if a committed page differs.
set -eu

root="$(cd "$(dirname "$0")/../.." && pwd)"
targets="docs/reference/cli.md docs/reference/cli-run.md docs/reference/cli-inspect.md docs/reference/cli-programs.md docs/reference/cli-agents.md"

sh "$root/docs/scripts/generate-cli.sh"
cd "$root"

# An untracked file has no diff, so it must fail on its own.
for target in $targets; do
  if ! git ls-files --error-unmatch "$target" >/dev/null 2>&1; then
    echo "$target is not tracked by git; commit it before the drift check means anything" >&2
    exit 1
  fi
done
git diff --exit-code -- $targets
echo "CLI reference is up to date."
