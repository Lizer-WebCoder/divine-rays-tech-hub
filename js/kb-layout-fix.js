/**
 * Divine Rays — force Knowledge Base to full width
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_KB_LAYOUT) return;
  window.__DR_KB_LAYOUT = 1;

  function expand() {
    try {
      var view = document.getElementById('view-kb');
      if (!view || !view.classList.contains('active')) return;

      view.style.maxWidth = 'none';
      view.style.width = '100%';

      view.querySelectorAll('.kb-manage, .kb-panel, #kb-manage-list, table').forEach(function (el) {
        el.style.maxWidth = 'none';
        el.style.width = '100%';
      });

      var p = view.parentElement;
      var hops = 0;
      while (p && hops < 6) {
        if (p.id === 'portal-agent' || p.id === 'portal-customer') break;
        try {
          var mw = window.getComputedStyle(p).maxWidth;
          if (mw && mw !== 'none' && parseInt(mw, 10) < 1100) {
            p.style.maxWidth = 'none';
            p.style.width = '100%';
          }
        } catch (e) {}
        p = p.parentElement;
        hops++;
      }
    } catch (e) {}
  }

  expand();
  setTimeout(expand, 400);
  setTimeout(expand, 1200);
  setInterval(expand, 3000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t) return;
      var txt = (t.textContent || '').toLowerCase();
      if (txt.indexOf('knowledge') !== -1 || (t.getAttribute && t.getAttribute('data-view') === 'kb')) {
        setTimeout(expand, 80);
        setTimeout(expand, 400);
      }
    },
    true
  );

  window.DRKbLayout = { refresh: expand };
})();
