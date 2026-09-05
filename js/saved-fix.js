/** Saved views empty-state polish */
(function () {
  function fix() {
    var list = document.getElementById('saved-views-list');
    if (!list) return;
    var empty = list.querySelector('.saved-empty');
    if (empty) {
      empty.textContent = 'No saved filters yet';
      empty.title = 'Set filters, then click Save current filters';
    }
    if ((list.textContent || '').trim() === 'None yet') {
      list.innerHTML = '<p class="saved-empty">No saved filters yet</p>';
    }
  }
  setInterval(fix, 1200);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix);
  else fix();
})();
