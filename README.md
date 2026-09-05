# Carl Michael Galang — personal website

A static personal website for GitHub Pages. Open `index.html` in a browser to preview it; no installation or build step is needed. The homepage and CV page use plain HTML and a single shared stylesheet, with no JavaScript or external font dependencies.

## Where things belong

| Location | Purpose |
| --- | --- |
| `index.html` | Biography, research, all publications, preprints, and contact links |
| `cv.html` | CV overview, download, and embedded PDF |
| `assets/css/site.css` | Shared colours, typography, layout, and responsive styles |
| `assets/images/` | Portrait and favicon used by the personal site |
| `documents/source/` | Editable Word version of the CV |
| `experiments/` | Experiment pages intended to be hosted on this site |
| `tools/` | Standalone research utilities, such as the ABDC Explorer |
| `archive/legacy-site/` | Previous homepage, CV page, styles, images, and Bootstrap files |
| `C.V. Carl Michael Galang.pdf` | Public CV; original filename retained so existing links keep working |
| `Galang and Mekik 2015.pdf` | Existing paper; original public path retained |

## Research tasks and tools

Keep hosted experiments in `experiments/` and standalone utilities in `tools/`. The two retained pages are:

| File to edit | Task or tool |
| --- | --- |
| `experiments/llm_resp.html` | LLM responsibility / workplace evaluation study |
| `tools/ABDC_Explorer.html` | ABDC journal quality explorer |

Their contents are unchanged. The small `llm_resp.html` and `ABDC_Explorer.html` files at the repository root redirect old links to the new locations, preserving query parameters (including participant IDs, seeds, and test settings) and URL fragments. Edit the full pages in the folders, not the root redirects. Keep the redirects while old links are in use.

After the next GitHub Pages deployment, the direct addresses will be `/experiments/llm_resp.html` and `/tools/ABDC_Explorer.html`. No extra hosting configuration is needed for these folders.

For a new self-contained experiment, use `experiments/short-study-name.html`. If a study has its own images, scripts, or other files, group them under `experiments/short-study-name/` with an `index.html` entry point. Keep a published study's path and contents stable during data collection. Develop drafts outside the published site until you want to host them.

The retired pages `forecasting_task.html`, `forecasting-task-v5_5.html`, `lake.html`, and `lake_v3.html` were deleted at the owner's request. Their last committed versions remain in Git history. Their old URLs will stop serving those studies after these changes are published.

## Updating the website

- **Biography or contact:** edit `index.html`; keep the name and email consistent in `cv.html`.
- **Publications:** copy one `<li class="paper">` in `index.html` and update its year, title, authors, journal, and links. Journal articles, preprints, under-review work, and work in preparation are separate. Earlier articles are inside the “Earlier publications” `<details>` element and remain readable without JavaScript. Update the visible count and ordered-list `start` when moving articles into that section.
- **CV:** edit the Word file in `documents/source/`, export a PDF, and replace the root `C.V. Carl Michael Galang.pdf`. Keep the filename unchanged to preserve the existing URL. Update the HTML overview if appointments or education change.
- **Portrait:** replace `assets/images/carl-michael-galang.png` and update the HTML image dimensions and description if needed.
- **Appearance:** edit the colour and font variables at the top of `assets/css/site.css`.

The old site is retained for reference, including its original markup and broken links. `_config.yml` excludes the archive, editable document sources, and this guide from a normal GitHub Pages/Jekyll build. Those files remain visible in the GitHub repository; this is a publishing exclusion, not a privacy control. If you later switch to a custom static deployment, preserve those exclusions in its publishing step.

## Content notes

The redesign preserves all 28 journal articles, four preprints, one under-review paper, and four projects in preparation from the original homepage. It uses the existing biography and CV for the appointment and education overview. The PDF and Word document contents have not been edited.

Missing local paper downloads and placeholder `#` links were replaced by the existing publisher links. The malformed ScienceDirect URL was repaired. Each journal article has one “Read paper” link to its publisher page.

Two bibliography corrections were verified against publisher records: [Aczel et al. is dated 2026](https://www.nature.com/articles/s41586-025-09844-9), and [Edwards et al. is in volume 131](https://www.sciencedirect.com/science/article/pii/S1053810025000650). [Wiley identifies Can S. Mekik](https://onlinelibrary.wiley.com/doi/full/10.1111/cogs.13179) as the coauthor of *Cognitive Science in a Nutshell*, supporting the homepage initials C.S.

Other differences between the homepage and Word CV were preserved for author review: the subtitle of *To Move or Not to Move* and the author order/status of the multimodal LLM bias preprint. Publication statuses otherwise follow the original homepage.
