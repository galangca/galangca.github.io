"""Fetch citation stats from the public Google Scholar profile into assets/data/scholar.json.

Scholar has no API, so this reads the profile page. If Scholar blocks the request or the
page layout changes, the existing JSON is left untouched and the script exits non-zero.
"""
import datetime
import json
import pathlib
import re
import sys
import urllib.request

PROFILE = "https://scholar.google.com/citations?user=iZGbEqEAAAAJ&hl=en"
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "data" / "scholar.json"

req = urllib.request.Request(PROFILE, headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/128.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
})
html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")

# The stats table lists all-time and recent values in pairs: citations, h-index, i10-index.
values = [int(v) for v in re.findall(r'class="gsc_rsb_std">(\d+)<', html)]
if len(values) < 6:
    sys.exit("Could not find citation stats on the Scholar page (blocked or layout changed).")

stats = {
    "citations": values[0],
    "h_index": values[2],
    "i10_index": values[4],
    "updated": datetime.date.today().isoformat(),
}
old = json.loads(OUT.read_text()) if OUT.exists() else {}
if {k: v for k, v in old.items() if k != "updated"} == {k: v for k, v in stats.items() if k != "updated"}:
    print("No change:", stats)
else:
    OUT.write_text(json.dumps(stats, indent=2) + "\n")
    print("Updated:", stats)
