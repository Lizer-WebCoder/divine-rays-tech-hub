/**
 * Divine Rays — toolbar visibility fix
 * Dashboard: show filters, hide search
 * My / Unassigned / All Tickets: show search + filters
 * Overrides filters.js hide-on-dashboard for the whole toolbar
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FILTERS_TOOLBAR_FIX >= 1) return;
  window.__DR_FILTERS_TOOLBAR_FIX = 1;

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

  function apply() {
    var mode = modeFromNav();
    var showToolbar = (mode === 'my' || mode === 'unassigned' || mode === 'all' || mode === 'dashboard');
    var showSearch = (mode === 'my' || mode === 'unassigned' || mode === 'all');
    var onDash = mode === 'dashboard';

    try {
      document.body.classList.toggle('dr-view-dashboard', onDash);
    } catch (e0) {}

    var actions = document.querySelector('#portal-agent .topbar-actions');
    if (actions) {
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
    }

    var si = document.getElementById('search-input');
    if (si) {
      if (showSearch) {
        si.style.setProperty('display', 'inline-block', 'important');
        si.style.setProperty('visibility', 'visible', 'important');
        si.style.setProperty('opacity', '1', 'important');
        si.style.setProperty('position', 'static', 'important');
        si.style.setProperty('width', 'auto', 'important');
        si.style.setProperty('min-width', '12rem', 'important');
        si.style.setProperty('height', 'auto', 'important');
        si.style.setProperty('min-height', '2.35rem', 'important');
        si.style.setProperty('pointer-events', 'auto', 'important');
        si.removeAttribute('aria-hidden');
        si.removeAttribute('hidden');
      } else {
        si.style.setProperty('display', 'none', 'important');
        si.style.setProperty('visibility', 'hidden', 'important');
        si.setAttribute('aria-hidden', 'true');
      }
    }

    if (showToolbar) {
      ['filter-status', 'filter-priority', 'filter-sort', 'filter-limit'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.style.setProperty('display', 'inline-block', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('pointer-events', 'auto', 'important');
        el.style.setProperty('position', 'static', 'important');
        el.style.setProperty('width', 'auto', 'important');
        el.style.setProperty('min-width', '8.5rem', 'important');
        el.style.setProperty('min-height', '2.35rem', 'important');
        el.removeAttribute('hidden');
        el.classList.remove('is-hidden', 'hidden');
      });
    }
  }

  apply();
  setTimeout(apply, 100);
  setTimeout(apply, 400);
  setTimeout(apply, 1000);
  setTimeout(apply, 2500);
  setInterval(apply, 2000);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
      setTimeout(apply, 30);
      setTimeout(apply, 120);
    }
  }, true);

  window.DRFiltersToolbarFix = { refresh: apply, v: 1 };
})();
