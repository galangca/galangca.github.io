/* Keep the homepage counts in sync with the paper lists, so adding a paper
   to the HTML is enough. Numbers written in the HTML are the no-JS fallback. */
(function () {
  function items(section) {
    return Array.prototype.slice.call(document.querySelectorAll('.paper-list[data-section="' + section + '"] li'));
  }
  var published = items('published');
  var reviewed = items('preprints').concat(items('under-review'), published);
  var counts = {
    published: published.length,
    'first-author': published.filter(function (li) { return /^\s*Galang,/.test(li.querySelector('.m').textContent); }).length
  };
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var key = el.dataset.count;
    if (key.indexOf('tag:') === 0) {
      var t = key.slice(4);
      el.textContent = reviewed.filter(function (li) { return li.dataset.tags.split(' ').indexOf(t) !== -1; }).length;
    } else if (counts[key] !== undefined && isFinite(counts[key])) {
      el.textContent = counts[key];
    }
  });
})();

/* Citation stats come from assets/data/scholar.json, refreshed weekly from Google Scholar
   by .github/workflows/scholar.yml. Numbers written in the HTML are the fallback. */
(function () {
  var els = document.querySelectorAll('[data-scholar]');
  if (!els.length || !window.fetch) return;
  fetch('assets/data/scholar.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (stats) {
      els.forEach(function (el) {
        var v = stats[el.dataset.scholar];
        if (typeof v === 'number') {
          el.textContent = v;
          if (stats.updated) el.title = 'Google Scholar, as of ' + stats.updated;
        }
      });
    })
    .catch(function () {});
})();

/* Filter the paper lists by topic tag and free-text search. */
(function () {
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.filters button'));
  var search = document.getElementById('paper-search');
  var status = document.getElementById('paper-status');
  var older = document.getElementById('older-papers');
  if (!buttons.length || !search) return;
  var tag = 'all';

  function apply() {
    var term = search.value.trim().toLowerCase();
    var shown = 0, total = 0;

    document.querySelectorAll('.paper-list').forEach(function (list) {
      list.querySelectorAll('li').forEach(function (item) {
        total++;
        var ok = (tag === 'all' || item.dataset.tags.split(' ').indexOf(tag) !== -1) &&
                 (!term || item.textContent.toLowerCase().indexOf(term) !== -1);
        item.hidden = !ok;
        if (ok) shown++;
      });
      var heading = list.previousElementSibling;
      if (heading && heading.classList.contains('yh')) heading.hidden = !list.querySelector('li:not([hidden])');
    });

    // Show "no matches" under any section whose lists are all filtered out.
    document.querySelectorAll('.empty').forEach(function (note) {
      var node = note.previousElementSibling, any = false;
      while (node && node.tagName !== 'H2') {
        if (node.querySelector('li:not([hidden])')) any = true;
        node = node.previousElementSibling;
      }
      note.style.display = any ? 'none' : 'block';
    });

    var filtering = tag !== 'all' || term;
    if (filtering && older) older.open = true;
    status.textContent = filtering ? shown + ' of ' + total + ' match' : '';
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      tag = button.dataset.f;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === button); });
      apply();
    });
  });
  search.addEventListener('input', apply);
})();
