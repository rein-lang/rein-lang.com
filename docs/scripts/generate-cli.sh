#!/usr/bin/env sh
# Regenerate reference/cli.md from `rein docs-cli`. Run by the docs scripts and by check-cli-drift.sh.
set -eu

root="$(cd "$(dirname "$0")/../../.." && pwd)"

cd "$root"
cargo run --quiet -p rein -- docs-cli > website/docs/reference/cli.md
