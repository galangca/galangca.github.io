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
