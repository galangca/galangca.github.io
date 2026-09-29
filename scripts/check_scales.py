"""Check assets/data/llm-scales.json after editing it.

Usage: python scripts/check_scales.py [--resolve]
--resolve also asks doi.org whether each DOI exists (needs internet; slower).
"""
import json
import pathlib
import re
import sys
import urllib.error
import urllib.request

DATA = pathlib.Path(__file__).resolve().parent.parent / "assets" / "data" / "llm-scales.json"

CONSTRUCTS = {
    "attitudes", "acceptance-use", "trust", "reliance", "credibility", "dependence", "literacy",
    "self-efficacy", "anxiety", "ethics-concerns", "privacy", "academic-integrity", "learning",
    "anthropomorphism", "social-presence", "relationships", "workplace", "health", "creativity", "other",
}
REQUIRED = ["id", "name", "summary", "target", "constructs", "populations", "subscales",
            "psychometrics", "status", "citation", "authors", "year", "language", "adaptations"]
DOI = re.compile(r"^10\.\d{4,9}/\S+$")


def doi_exists(doi):
    req = urllib.request.Request("https://doi.org/api/handles/" + doi, headers={"User-Agent": "check_scales"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.load(r).get("responseCode") == 1
    except urllib.error.HTTPError:
        return False


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    problems, ids, dois = [], set(), []
    for i, s in enumerate(data.get("scales", [])):
        label = s.get("id") or f"scale #{i}"
        for field in REQUIRED:
            if s.get(field) in (None, "", []) and field not in ("adaptations", "populations"):
                problems.append(f"{label}: missing {field}")
        if s.get("id") in ids:
            problems.append(f"{label}: duplicate id")
        ids.add(s.get("id"))
        evidence = s.get("evidence", "verified")
        if evidence not in ("verified", "partial", "unconfirmed"):
            problems.append(f"{label}: evidence must be 'verified', 'partial' or 'unconfirmed'")
        elif evidence != "verified" and not s.get("flag_reason"):
            problems.append(f"{label}: flagged scales need a flag_reason")
        if s.get("status") not in ("published", "preprint"):
            problems.append(f"{label}: status must be 'published' or 'preprint'")
        for c in s.get("constructs", []):
            if c not in CONSTRUCTS:
                problems.append(f"{label}: unknown construct '{c}'")
        if not s.get("doi") and not s.get("url"):
            problems.append(f"{label}: needs a doi or url")
        for d in [s.get("doi")] + [a.get("doi") for a in s.get("adaptations", [])]:
            if d:
                if DOI.match(d):
                    dois.append((label, d))
                else:
                    problems.append(f"{label}: malformed DOI '{d}' (write it as 10.xxxx/..., without https://doi.org/)")

    if "--resolve" in sys.argv:
        for label, d in dois:
            if not doi_exists(d):
                problems.append(f"{label}: DOI does not resolve: {d}")

    print(f"{len(data.get('scales', []))} scales, {len(dois)} DOIs checked")
    if problems:
        print("\n".join(problems))
        sys.exit(1)
    print("OK")


main()
