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
- `tools/ABDC_Explorer.html`: standalone ABDC Journal Quality Explorer (styles are inline)
- `sitemap.xml`, `robots.txt`, `googlebce983d8863e843d.html`: search engine files (keep the Google file for Search Console)

## Adding a paper

Copy an existing `<li>` in the right list in `index.html` (`preprints`, `under-review`, `published` or `in-prep`) and edit it.
Set `data-tags` to one or more of `empathy`, `agency`, `human-ai`, `metascience` or `other`, and update the matching `#tag` chips.
The stat boxes and thread counts update themselves from the lists.
