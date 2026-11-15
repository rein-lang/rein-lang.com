#!/usr/bin/env python3
"""Run `rein check` on each complete Rein sample in the docs.

A complete sample is a `rein` or `ts` code block with `export default function`.
A sample is one file of a larger flow, so a message about a file that the
sample does not show is not a failure. Each other error or warning is.

Usage: check-samples.py   (from the repo root, with `rein` on PATH)
"""
import glob
import os
import re
import subprocess
import sys
import tempfile

# Messages about the files around a sample, which the docs do not show.
CONTEXT = ("cannot find function", "leaves the project root", "unknown parameter")

files = sorted(glob.glob("language/**/*.md", recursive=True)) + sorted(glob.glob("docs/*.md"))
failures = 0
samples = 0
for path in files:
    text = open(path, encoding="utf8").read()
    for match in re.finditer(r"```(?:rein|ts)\n(.*?)```", text, re.S):
        code = match.group(1)
        if not re.search(r"export default (async )?function", code):
            continue
        samples += 1
        line = text[: match.start()].count("\n") + 2
        with tempfile.TemporaryDirectory() as tmp:
            flow = os.path.join(tmp, "rein", "sample")
            os.makedirs(flow)
            with open(os.path.join(flow, "main.rein"), "w", encoding="utf8") as out:
                out.write(code)
            result = subprocess.run(["rein", "check", flow], capture_output=True, text=True)
        for message in result.stdout.splitlines():
            if ": error: " not in message and ": warning: " not in message:
                continue
            if any(context in message for context in CONTEXT):
                continue
            failures += 1
            print(f"{path}:{line}: {message.split('main.rein:', 1)[-1]}")

print(f"{samples} samples, {failures} failures")
sys.exit(1 if failures else 0)
