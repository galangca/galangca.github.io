/* Open links to other sites in a new tab, so visitors don't leave this one.
   Set on click, so it also covers links added later by scripts (e.g. the scale cards). */
document.addEventListener('click', function (event) {
  var link = event.target.closest && event.target.closest('a[href]');
  if (link && /^https?:$/.test(link.protocol) && link.hostname !== location.hostname) {
    link.target = '_blank';
    link.rel = 'noopener';
  }
});

/* Close the nav dropdown on an outside click or Escape. */
(function () {
  var dropdown = document.querySelector('.nav-dropdown');
  if (!dropdown) return;

  document.addEventListener('click', function (event) {
    if (dropdown.open && !dropdown.contains(event.target)) dropdown.open = false;
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && dropdown.open) {
      dropdown.open = false;
      dropdown.querySelector('summary').focus();
    }
  });
})();
