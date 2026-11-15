#!/usr/bin/env python3
"""Fail when the built site has a broken internal link or anchor.

Usage: check-links.py <site folder>
"""
import html
import os
import re
import sys
from urllib.parse import unquote, urlparse

root = sys.argv[1]
pages = [os.path.join(d, f) for d, _, fs in os.walk(root) for f in fs if f.endswith(".html")]
cache = {}


def load(path):
    if path not in cache:
        text = open(path, encoding="utf8").read()
        cache[path] = (set(re.findall(r'\sid="([^"]+)"', text)), text)
    return cache[path]


def resolve(path):
    for candidate in (path, path + ".html", os.path.join(path, "index.html")):
        if os.path.isfile(candidate):
            return candidate
    return None


broken = set()
for page in pages:
    for match in re.finditer(r'<a\s[^>]*href="([^"]+)"', load(page)[1]):
        href = html.unescape(match.group(1))
        url = urlparse(href)
        if url.scheme or href.startswith("//"):
            continue
        if url.path == "":
            target = page
        elif url.path.startswith("/"):
            target = resolve(root + unquote(url.path).rstrip("/")) or resolve(root + unquote(url.path))
        else:
            target = resolve(os.path.normpath(os.path.join(os.path.dirname(page), unquote(url.path))))
        name = os.path.relpath(page, root)
        if not target:
            broken.add((name, href, "missing page"))
        elif url.fragment and target.endswith(".html") and unquote(url.fragment) not in load(target)[0]:
            broken.add((name, href, "missing anchor"))

for name, href, why in sorted(broken):
    print(f"{name}: {href}: {why}")
print(f"{len(pages)} pages, {len(broken)} broken links")
sys.exit(1 if broken else 0)
