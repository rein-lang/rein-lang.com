#!/usr/bin/env sh
# Regenerate reference/cli.md from `rein docs-cli` and fail if the committed file differs.
set -eu

root="$(cd "$(dirname "$0")/../../.." && pwd)"
target="website/docs/reference/cli.md"

cd "$root"
cargo run --quiet -p rein -- docs-cli > "$target"

# An untracked file has no diff, so it must fail on its own.
if ! git ls-files --error-unmatch "$target" >/dev/null 2>&1; then
  echo "$target is not tracked by git; commit it before the drift check means anything" >&2
  exit 1
fi
git diff --exit-code -- "$target"
echo "CLI reference is up to date."
