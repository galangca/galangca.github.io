"""Fetch citation stats for the Google Scholar profile into assets/data/scholar.json.

Scholar blocks requests from GitHub's runners (HTTP 403), so this goes through SerpAPI's
google_scholar_author engine. It needs the SERPAPI_KEY environment variable (a repo secret
in Actions). If the request fails or the response lacks the stats, the existing JSON is
left untouched and the script exits non-zero.
"""
import datetime
import json
import os
import pathlib
import sys
import urllib.parse
import urllib.request

AUTHOR_ID = "iZGbEqEAAAAJ"
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "data" / "scholar.json"

key = os.environ.get("SERPAPI_KEY")
if not key:
    sys.exit("SERPAPI_KEY is not set.")

query = urllib.parse.urlencode({
    "engine": "google_scholar_author",
    "author_id": AUTHOR_ID,
    "hl": "en",
    "api_key": key,
})
data = json.load(urllib.request.urlopen("https://serpapi.com/search.json?" + query, timeout=60))
if "error" in data:
    sys.exit("SerpAPI error: " + data["error"])

# cited_by.table is a list of single-key rows: citations, h_index, i10_index, each with an "all" value.
try:
    table = {k: v["all"] for row in data["cited_by"]["table"] for k, v in row.items()}
    stats = {
        "citations": int(table["citations"]),
        "h_index": int(table["h_index"]),
        "i10_index": int(table["i10_index"]),
        "updated": datetime.date.today().isoformat(),
    }
except (KeyError, TypeError, ValueError):
    sys.exit("Could not find citation stats in the SerpAPI response.")

old = json.loads(OUT.read_text()) if OUT.exists() else {}
if {k: v for k, v in old.items() if k != "updated"} == {k: v for k, v in stats.items() if k != "updated"}:
    print("No change:", stats)
else:
    OUT.write_text(json.dumps(stats, indent=2) + "\n")
    print("Updated:", stats)
