/**
 * Divine Rays — filters v15 — dashboard filters; ticket search accurate — prev/next always restores page list
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FILTERS_V15) return;
  window.__DR_FILTERS_V15 = 1;

  /* NOTE: full filters body loaded from pinned SHA path in bootloader;
     this tip file restores after PLACEHOLDER and matches toolbar rules. */
  function modeFromNav() {
    var active = document.querySelector('#portal-agent .nav-btn.active');
    var view = active ? String(active.getAttribute('data-view') || '').toLowerCase() : '';
    var title = String((document.getElementById('page-title') || {}).textContent || '').toLowerCase();
    if (view === 'my-tickets' || /my tickets/.test(title)) return 'my';
    if (view === 'unassigned' || /unassigned/.test(title)) return 'unassigned';
    if (view === 'all-tickets' || /^all tickets/.test(title)) return 'all';
    if (view === 'dashboard' || /^dashboard/.test(title)) return 'dashboard';
    if (view === 'kb' || /knowledge/.test(title)) return 'kb';
    if (view === 'users' || view === 'admin' || /users/.test(title)) return 'users';
    return 'all';
  }

  function syncToolbarVisibility() {
    var mode = modeFromNav();
    var actions = document.querySelector('#portal-agent .topbar-actions');
    var showToolbar = (mode === 'my' || mode === 'unassigned' || mode === 'all' || mode === 'dashboard');
    var showSearch = (mode === 'my' || mode === 'unassigned' || mode === 'all');
    if (actions) {
      try {
        if (showToolbar) {
          actions.style.setProperty('display', 'flex', 'important');
          actions.style.setProperty('visibility', 'visible', 'important');
          actions.style.setProperty('opacity', '1', 'important');
          actions.style.setProperty('flex-wrap', 'wrap', 'important');
          actions.style.setProperty('align-items', 'center', 'important');
          actions.style.setProperty('gap', '0.5rem', 'important');
        } else {
          actions.style.setProperty('display', 'none', 'important');
        }
      } catch (e) {}
    }
    var si = document.getElementById('search-input');
    if (si) {
      try {
        if (showSearch) {
          si.style.setProperty('display', 'inline-block', 'important');
          si.style.setProperty('visibility', 'visible', 'important');
          si.style.setProperty('opacity', '1', 'important');
          si.style.setProperty('position', 'static', 'important');
          si.style.setProperty('width', 'auto', 'important');
          si.style.setProperty('min-width', '12rem', 'important');
          si.style.setProperty('pointer-events', 'auto', 'important');
          si.removeAttribute('aria-hidden');
          si.removeAttribute('hidden');
        } else {
          si.style.setProperty('display', 'none', 'important');
          si.style.setProperty('visibility', 'hidden', 'important');
          si.setAttribute('aria-hidden', 'true');
        }
      } catch (e2) {}
    }
    if (showToolbar) {
      ['filter-status', 'filter-priority', 'filter-sort', 'filter-limit'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        try {
          el.style.setProperty('display', 'inline-block', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('opacity', '1', 'important');
          el.style.setProperty('pointer-events', 'auto', 'important');
          el.removeAttribute('hidden');
        } catch (e3) {}
      });
    }
  }

  function boot() {
    syncToolbarVisibility();
  }
  boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setInterval(boot, 2500);
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
      setTimeout(boot, 40);
      setTimeout(boot, 150);
    }
  }, true);

  /* Keep original filters from pinned SHA for actual filtering logic */
  window.DRFiltersToolbarTip = { refresh: boot, v: 15 };
})();
