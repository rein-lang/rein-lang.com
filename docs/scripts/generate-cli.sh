#!/usr/bin/env sh
# Regenerate the CLI reference from `rein docs-cli`: an index page and one page per command group.
# The pages are cut from the one generated document at its `## `rein NAME`` headings.
set -eu

root="$(cd "$(dirname "$0")/../../.." && pwd)"

cd "$root"
ref=website/docs/reference
src="$(mktemp)"
trap 'rm -f "$src"' EXIT
cargo run --quiet -p rein -- docs-cli > "$src"

awk -v ref="$ref" '
BEGIN {
  g["check"] = "cli-run.md"; g["run"] = "cli-run.md"; g["eval"] = "cli-run.md"
  g["step"] = "cli-run.md"; g["describe"] = "cli-run.md"
  g["graph"] = "cli-inspect.md"; g["debug"] = "cli-inspect.md"; g["watch"] = "cli-inspect.md"
  g["list"] = "cli-programs.md"; g["show"] = "cli-programs.md"; g["install"] = "cli-programs.md"
  g["uninstall"] = "cli-programs.md"; g["update"] = "cli-programs.md"
  g["serve"] = "cli-agents.md"; g["agent-context"] = "cli-agents.md"; g["hook"] = "cli-agents.md"
  g["lsp"] = "cli-agents.md"; g["dap"] = "cli-agents.md"
  hd["cli-run.md"] = "# CLI: check, run, eval, step, describe"
  hd["cli-inspect.md"] = "# CLI: graph, debug, watch"
  hd["cli-programs.md"] = "# CLI: list, show, install, uninstall, update"
  hd["cli-agents.md"] = "# CLI: serve, agent-context, hook, lsp, dap"
  cur = "cli.md"
}
NR == 1 { notice = $0 }
/^## `rein/ {
  name = $0
  sub(/^## `rein ?/, "", name)
  sub(/`$/, "", name)
  cur = (name == "") ? "cli.md" : g[name]
}
{
  line = $0
  if (cur == "cli.md") {
    for (n in g) gsub("\\(#rein-" n "\\)", "(" g[n] "#rein-" n ")", line)
  } else if (!(cur in started)) {
    started[cur] = 1
    print notice > (ref "/" cur)
    print "" > (ref "/" cur)
    print hd[cur] > (ref "/" cur)
    print "" > (ref "/" cur)
  }
  print line > (ref "/" cur)
}
' "$src"
