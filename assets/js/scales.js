/* LLM Scale Finder: renders assets/data/llm-scales.json and filters it.
   Curate scales by editing that JSON file, then run scripts/check_scales.py. */
(function () {
  var DATA_URL = '../assets/data/llm-scales.json';
  var list = document.getElementById('scale-list');
  if (!list) return;

  var search = document.getElementById('scale-search');
  var status = document.getElementById('scale-status');
  var empty = document.getElementById('scale-empty');
  var popSelect = document.getElementById('population-filter');
  var langSelect = document.getElementById('language-filter');
  var itemsBox = document.getElementById('items-filter');
  var sortSelect = document.getElementById('sort');
  var perPageSelect = document.getElementById('per-page');
  var moreButton = document.getElementById('show-more');
  var yearBars = document.getElementById('year-bars');
  var yearTip = document.getElementById('year-tip');
  var state = { construct: 'all', status: 'all', evidence: 'all', year: 'all' };
  var FLAG_LABELS = { partial: 'partial evidence', unconfirmed: 'unconfirmed' };
  function isVerified(s) { return (s.evidence || 'verified') === 'verified'; }
  var scales = [];
  var years = [];     // every publication year in the data, oldest first
  var matches = [];   // scales passing the current filters, sorted
  var limit = 5;      // how many of them are on screen
  function perPage() { return +perPageSelect.value || Infinity; }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }
  function doiUrl(doi) { return doi ? (/^https?:/.test(doi) ? doi : 'https://doi.org/' + doi) : null; }
  function uniqueSorted(values) {
    return values.filter(function (v, i, a) { return v && a.indexOf(v) === i; }).sort(function (a, b) { return a.localeCompare(b); });
  }
  // "Arabic & English" counts as both languages; "Not reported" is not a language.
  function languagesOf(s) {
    return [s.language].concat((s.adaptations || []).map(function (a) { return a.language; }))
      .join(' & ').split(' & ').filter(function (l) { return l && l !== 'Not reported'; });
  }

  function card(s) {
    var link = doiUrl(s.doi) || s.url || s.preprint_url;
    var title = el('a', { href: link, text: s.name + (s.acronym ? ' (' + s.acronym + ')' : '') });
    var badge = el('span', { 'class': 'badge ' + s.status, text: s.status });
    var flag = isVerified(s) ? null : el('span', { 'class': 'badge ' + s.evidence, text: FLAG_LABELS[s.evidence] || s.evidence });
    var meta = [s.authors, s.venue].filter(Boolean).join(' · ');
    var facts = [s.items ? s.items + ' items' : null, s.response, s.target].filter(Boolean).join(' · ');

    var tags = el('div', { 'class': 'row-foot' }, (s.constructs || []).map(function (c) { return el('span', { 'class': 'tag', text: '#' + c }); }));
    if (s.items_available) tags.appendChild(el('span', { 'class': 'tag', text: 'items available' }));
    if ((s.adaptations || []).length) tags.appendChild(el('span', { 'class': 'tag', text: '+' + s.adaptations.length + ' translation' + (s.adaptations.length > 1 ? 's' : '') }));

    var details = el('details', { 'class': 'scale-more' }, [el('summary', { text: 'subscales, psychometrics & citation' })]);
    var subRows = (s.subscales || []).map(function (sub) {
      return el('tr', {}, [el('td', { text: sub.name }), el('td', { 'class': 'n', text: sub.items == null ? '–' : String(sub.items) }), el('td', { text: sub.description })]);
    });
    if (subRows.length) {
      details.appendChild(el('table', { 'class': 'subscales' }, [
        el('thead', {}, [el('tr', {}, [el('th', { text: 'subscale' }), el('th', { 'class': 'n', text: 'items' }), el('th', { text: 'what it captures' })])]),
        el('tbody', {}, subRows)
      ]));
    }
    var p = s.psychometrics || {};
    var samples = (p.samples || []).map(function (x) { return [x.n ? 'n = ' + x.n : null, x.population, x.country].filter(Boolean).join(', '); }).join('; ');
    var dl = el('dl', { 'class': 'scale-facts' });
    [['structure', p.structure], ['reliability', p.reliability], ['validity', (p.validity || []).join('; ')],
     ['samples', samples], ['populations', (s.populations || []).join(', ')], ['language', s.language]].forEach(function (row) {
      if (row[1]) { dl.appendChild(el('dt', { text: row[0] })); dl.appendChild(el('dd', { text: row[1] })); }
    });
    details.appendChild(dl);

    if ((s.adaptations || []).length) {
      details.appendChild(el('p', { 'class': 'm', text: 'Validated translations and adaptations:' }));
      details.appendChild(el('ul', { 'class': 'adaptations' }, s.adaptations.map(function (a) {
        var href = doiUrl(a.doi) || a.url;
        return el('li', {}, [el('strong', { text: a.language + (a.country ? ' (' + a.country + ')' : '') + ': ' }),
          href ? el('a', { href: href, text: a.citation }) : a.citation,
          a.status === 'preprint' ? el('span', { 'class': 'badge preprint', text: 'preprint' }) : null]);
      })));
    }

    var cite = el('p', { 'class': 'citation', text: s.citation });
    var copy = el('button', { type: 'button', 'class': 'linklike', text: 'copy citation' });
    copy.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(s.citation).then(function () {
        copy.textContent = 'copied ✓';
        setTimeout(function () { copy.textContent = 'copy citation'; }, 1500);
      });
    });
    var links = el('div', { 'class': 'row-foot' }, [copy,
      s.doi ? el('a', { 'class': 'open', href: doiUrl(s.doi), text: 'paper ↗' }) : (s.url ? el('a', { 'class': 'open', href: s.url, text: 'paper ↗' }) : null),
      s.preprint_url ? el('a', { 'class': 'open', href: s.preprint_url, text: 'preprint ↗' }) : null]);
    details.appendChild(cite);
    details.appendChild(links);

    return el('li', { id: s.id }, [
      el('span', { 'class': 'y', text: s.year ? String(s.year) : '' }),
      el('div', {}, [title, ' ', badge, flag,
        meta ? el('div', { 'class': 'm', text: meta }) : null,
        el('p', { 'class': 'scale-summary', text: s.summary }),
        s.flag_reason ? el('p', { 'class': 'flag', text: 'Why flagged: ' + s.flag_reason }) : null,
        facts ? el('div', { 'class': 'm v', text: facts }) : null,
        tags, details])
    ]);
  }

  function haystack(s) {
    return [s.name, s.acronym, s.summary, s.target, s.authors, s.citation, s.venue, s.language, s.response,
      (s.constructs || []).join(' '), (s.populations || []).join(' '),
      (s.subscales || []).map(function (x) { return x.name + ' ' + x.description; }).join(' '),
      (s.adaptations || []).map(function (a) { return a.language + ' ' + a.country + ' ' + a.citation; }).join(' ')
    ].join(' ').toLowerCase();
  }

  function apply() {
    var terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var pop = popSelect.value, lang = langSelect.value, needItems = itemsBox.checked;
    // The year chart counts scales passing every filter except year, so its bars show where the rest would land.
    var base = scales.filter(function (s) {
      return (state.construct === 'all' || s.constructs.indexOf(state.construct) !== -1) &&
        (state.status === 'all' || s.status === state.status) &&
        (state.evidence === 'all' || (state.evidence === 'verified') === isVerified(s)) &&
        (!pop || (s.populations || []).indexOf(pop) !== -1) &&
        (!lang || languagesOf(s).indexOf(lang) !== -1) &&
        (!needItems || s.items_available) &&
        terms.every(function (t) { return s._text.indexOf(t) !== -1; });
    });
    renderYears(base);
    var shown = base.filter(function (s) { return state.year === 'all' || String(s.year) === state.year; });
    var sort = sortSelect.value;
    shown.sort(function (a, b) {
      if (sort === 'az') return a.name.localeCompare(b.name);
      if (sort === 'short') return (a.items || 999) - (b.items || 999) || a.name.localeCompare(b.name);
      return (b.year || 0) - (a.year || 0) || a.name.localeCompare(b.name);
    });
    matches = shown;
    limit = perPage();
    render();
  }

  function renderYears(base) {
    var byYear = {};
    years.forEach(function (y) { byYear[y] = { published: 0, preprint: 0 }; });
    base.forEach(function (s) { if (byYear[s.year]) byYear[s.year][s.status === 'preprint' ? 'preprint' : 'published']++; });
    var max = Math.max.apply(null, years.map(function (y) { return byYear[y].published + byYear[y].preprint; }).concat(1));
    var picked = state.year !== 'all';
    yearBars.replaceChildren.apply(yearBars, years.map(function (y) {
      var c = byYear[y], total = c.published + c.preprint, on = String(y) === state.year;
      var seg = function (kind) {
        return c[kind] ? el('span', { 'class': kind, style: 'height:max(2px,' + (c[kind] / max * 6.2).toFixed(3) + 'rem)' }) : null;
      };
      var col = el('button', { type: 'button', 'class': 'yc-col' + (picked ? ' dim' : ''), 'aria-pressed': String(on),
        'aria-label': y + ': ' + total + ' scales (' + c.published + ' published, ' + c.preprint + ' preprint)' + (on ? ', selected' : ''),
        disabled: !total && !on }, [
        el('span', { 'class': 'yc-n', text: String(total) }),
        el('span', { 'class': 'yc-bar' }, [seg('published'), seg('preprint')]),
        el('span', { 'class': 'yc-y', text: String(y) })
      ]);
      function tip() {
        yearTip.replaceChildren(el('b', { text: total + ' scales' }), ' in ' + y, el('br'), c.published + ' published · ' + c.preprint + ' preprint');
        yearTip.hidden = false;
        var box = yearBars.getBoundingClientRect(), r = col.getBoundingClientRect();
        var left = r.left - box.left + r.width / 2 - yearTip.offsetWidth / 2;
        yearTip.style.left = Math.max(0, Math.min(left, yearBars.parentNode.clientWidth - yearTip.offsetWidth)) + 'px';
      }
      col.addEventListener('pointerenter', tip);
      col.addEventListener('focus', tip);
      col.addEventListener('pointerleave', function () { yearTip.hidden = true; });
      col.addEventListener('blur', function () { yearTip.hidden = true; });
      // Clicking the selected year again clears the year filter.
      col.addEventListener('click', function () { setYear(on ? 'all' : String(y)); });
      return col;
    }));
  }

  function setYear(y) {
    state.year = y;
    document.querySelectorAll('[data-year]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-year') === y); });
    apply();
  }

  function render() {
    var visible = matches.slice(0, limit);
    list.replaceChildren.apply(list, visible.map(function (s) { return s._card; }));
    empty.style.display = matches.length ? 'none' : 'block';

    var left = matches.length - visible.length;
    moreButton.hidden = !left;
    moreButton.textContent = 'show ' + Math.min(perPage(), left) + ' more ↓ (' + left + ' left)';

    var pool = scales.filter(function (s) {
      return state.evidence === 'all' || (state.evidence === 'verified') === isVerified(s);
    }).length;
    var hidden = state.evidence === 'verified' ? scales.length - pool : 0;
    status.textContent = (matches.length === pool ? pool + ' scales' : matches.length + ' of ' + pool + ' scales match') +
      (left ? ', showing ' + visible.length : '') +
      (hidden ? ' (' + hidden + ' flagged scales hidden)' : '');
  }

  function toCsv() {
    var cols = ['name', 'acronym', 'year', 'status', 'authors', 'venue', 'doi', 'url', 'preprint_url', 'target', 'constructs', 'populations', 'items', 'response', 'subscales', 'structure', 'reliability', 'items_available', 'language', 'translations', 'evidence', 'flag_reason', 'summary', 'citation'];
    var rows = scales.map(function (s) {
      var p = s.psychometrics || {};
      var v = { constructs: (s.constructs || []).join('; '), populations: (s.populations || []).join('; '),
        subscales: (s.subscales || []).map(function (x) { return x.name + (x.items ? ' (' + x.items + ')' : ''); }).join('; '),
        structure: p.structure, reliability: p.reliability,
        translations: (s.adaptations || []).map(function (a) { return a.language; }).join('; '),
        evidence: s.evidence || 'verified' };
      return cols.map(function (c) {
        var val = c in v ? v[c] : s[c];
        val = val == null ? '' : String(val);
        return /[",\n]/.test(val) ? '"' + val.replace(/"/g, '""') + '"' : val;
      }).join(',');
    });
    return [cols.join(',')].concat(rows).join('\n');
  }

  function setup(data) {
    scales = data.scales;
    scales.forEach(function (s) { s._text = haystack(s); s._card = card(s); });

    // Stats and construct counts describe the validated set; the dropdowns list every value.
    var verified = scales.filter(isVerified);
    document.getElementById('n-scales').textContent = verified.length;
    document.getElementById('n-published').textContent = verified.filter(function (s) { return s.status === 'published'; }).length;
    document.getElementById('n-preprint').textContent = verified.filter(function (s) { return s.status === 'preprint'; }).length;
    document.getElementById('n-languages').textContent = uniqueSorted([].concat.apply([], verified.map(languagesOf))).length;
    var langs = uniqueSorted([].concat.apply([], scales.map(languagesOf)));
    document.getElementById('n-flagged').textContent = scales.length - verified.length;
    document.getElementById('updated').textContent = data.updated;

    var counts = {};
    scales.forEach(function (s) { s.constructs.forEach(function (c) { counts[c] = counts[c] || 0; }); });
    verified.forEach(function (s) { s.constructs.forEach(function (c) { counts[c]++; }); });
    var group = document.getElementById('construct-filters');
    Object.keys(counts).sort().forEach(function (c) {
      group.appendChild(el('button', { type: 'button', 'data-construct': c, 'aria-pressed': 'false', text: '#' + c + ' ' + counts[c] }));
    });
    uniqueSorted([].concat.apply([], scales.map(function (s) { return s.populations || []; }))).forEach(function (p) {
      popSelect.appendChild(el('option', { value: p, text: p }));
    });
    langs.forEach(function (l) { langSelect.appendChild(el('option', { value: l, text: l })); });
    var known = scales.map(function (s) { return s.year; }).filter(Boolean);
    for (var y = Math.min.apply(null, known); y <= Math.max.apply(null, known); y++) years.push(y);
    var yearGroup = document.getElementById('year-filters');
    years.forEach(function (y) { yearGroup.appendChild(el('button', { type: 'button', 'data-year': String(y), 'aria-pressed': 'false', text: String(y) })); });

    function chipGroup(attr, key) {
      var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-' + attr + ']'));
      buttons.forEach(function (b) {
        b.addEventListener('click', function () {
          state[key] = b.getAttribute('data-' + attr);
          buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          apply();
        });
      });
    }
    chipGroup('construct', 'construct');
    chipGroup('status', 'status');
    chipGroup('evidence', 'evidence');
    chipGroup('year', 'year');
    [search, popSelect, langSelect, itemsBox, sortSelect, perPageSelect].forEach(function (c) { c.addEventListener('input', apply); });
    moreButton.addEventListener('click', function () {
      var first = list.children.length;
      limit += perPage();
      render();
      if (list.children[first]) list.children[first].querySelector('a').focus({ preventScroll: true });
    });

    document.getElementById('csv-download').addEventListener('click', function () {
      var url = URL.createObjectURL(new Blob([toCsv()], { type: 'text/csv;charset=utf-8' }));
      var a = el('a', { href: url, download: 'llm-scales.csv' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });

    apply();

    // A link like llm-scales.html#some-scale-id shows and opens that scale, even if it is flagged or past the first page.
    var linked = location.hash && scales.filter(function (s) { return s.id === location.hash.slice(1); })[0];
    if (linked && !isVerified(linked)) document.querySelector('[data-evidence="all"]').click();
    if (linked && matches.indexOf(linked) >= limit) { limit = matches.indexOf(linked) + 1; render(); }
    var target = linked && document.getElementById(linked.id);
    if (target && target.querySelector('details')) {
      target.querySelector('details').open = true;
      requestAnimationFrame(function () { target.scrollIntoView(); });
    }
  }

  fetch(DATA_URL, { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(setup)
    .catch(function () { status.textContent = 'Could not load the scale data. Try the JSON download below.'; });
})();
