# Carl Michael Galang: personal website

This website has been redesigned by generative AI.

Open `index.html` to view the website.
Experiments are in `experiments/`, and research tools are in `tools/`.
The previous design is preserved in `archive/legacy-site/`.

## Layout

- `index.html`: homepage (profile, research threads, papers, contact)
- `cv.html`: CV summary with the embedded PDF
- `assets/css/site.css`: shared "lab notebook" styles for both pages, with automatic dark mode
- `assets/js/nav.js`: closes the tools dropdown on an outside click or Escape
- `assets/js/papers.js`: paper filters and the self-updating counts on the homepage
- `assets/data/scholar.json`: citation count and h-index, refreshed every Monday from Google Scholar by `.github/workflows/scholar.yml` (runs `scripts/update_scholar.py`; trigger it by hand from the Actions tab)
- `tools/ABDC_Explorer.html`: standalone ABDC Journal Quality Explorer (styles are inline)
- `tools/llm-scales.html` + `assets/js/scales.js`: LLM Scale Finder, a searchable catalogue of validated LLM / GenAI survey scales; its data is `assets/data/llm-scales.json`
- `tools/llm-scales-method.html`: how the scale list was made (model, agents, time, prompts); `assets/data/llm-scales-workflow.js` is the workflow script it links to
- `sitemap.xml`, `robots.txt`, `googlebce983d8863e843d.html`: search engine files (keep the Google file for Search Console)

## Adding a paper

Copy an existing `<li>` in the right list in `index.html` (`preprints`, `under-review`, `published` or `in-prep`) and edit it.
Set `data-tags` to one or more of `empathy`, `agency`, `human-ai`, `metascience` or `other`, and update the matching `#tag` chips.
The paper-count stat boxes and thread counts update themselves from the lists. The citation and h-index boxes come from `assets/data/scholar.json`.

## Adding a scale to the LLM Scale Finder

Add a record to `scales` in `assets/data/llm-scales.json` (copy an existing one) and update `updated` at the top.
Put validated translations in the original scale's `adaptations` list rather than as new records.
Set `evidence` to `verified` if the scale meets the bar, or to `partial` / `unconfirmed` with a one-sentence `flag_reason`; flagged scales are hidden unless visitors turn them on.
`constructs` must use the vocabulary listed in `scripts/check_scales.py`.
Then run `python scripts/check_scales.py --resolve` to catch missing fields, duplicate ids and DOIs that don't resolve.
