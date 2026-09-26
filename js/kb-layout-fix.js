/**
 * Divine Rays — Knowledge Base full width + hide when not active
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_KB_LAYOUT) {
    try { delete window.__DR_KB_LAYOUT; } catch (e) {}
  }
  window.__DR_KB_LAYOUT = 1;

  function hideInactiveKb() {
    var view = document.getElementById('view-kb');
    if (!view) return;
    if (view.classList.contains('active')) {
      view.style.removeProperty('display');
      view.style.removeProperty('visibility');
      view.style.removeProperty('height');
      view.style.removeProperty('overflow');
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
    } else {
      view.style.setProperty('display', 'none', 'important');
      view.style.setProperty('visibility', 'hidden', 'important');
      view.style.setProperty('height', '0', 'important');
      view.style.setProperty('overflow', 'hidden', 'important');
      view.style.setProperty('pointer-events', 'none', 'important');
    }
  }

  function expand() {
    hideInactiveKb();
  }

  expand();
  setTimeout(expand, 400);
  setTimeout(expand, 1200);
  setInterval(expand, 2500);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t) return;
      var txt = (t.textContent || '').toLowerCase();
      var nav = t.closest && t.closest('.nav-btn, [data-view], button');
      if (txt.indexOf('knowledge') !== -1 || (t.getAttribute && t.getAttribute('data-view') === 'kb') ||
          (nav && (nav.getAttribute('data-view') || nav.id || '').indexOf('kb') !== -1)) {
        setTimeout(expand, 80);
        setTimeout(expand, 400);
      } else if (nav || /dashboard|tickets|unassigned|admin|my tickets|all tickets/i.test(txt)) {
        setTimeout(expand, 80);
        setTimeout(expand, 300);
      }
    },
    true
  );

  window.DRKbLayout = { refresh: expand, hideInactive: hideInactiveKb };
})();
