/**
 * Divine Rays — Dashboard topbar + mode-bar paint fix
 * - No black Dashboard header card
 * - Hide search, keep filters
 * - Mode-bar (theme/profile/logout) paints immediately with portal
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_DASH_TOPBAR_FIX >= 1) return;
  window.__DR_DASH_TOPBAR_FIX = 1;

  function inject() {
    if (document.getElementById('dr-dash-topbar-fix-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-dash-topbar-fix-css';
    el.textContent = [
      'body.is-portal .mode-bar,',
      'body:has(#portal-agent.active) .mode-bar,',
      'body:has(#portal-customer.active) .mode-bar{',
      'display:flex!important;visibility:visible!important;opacity:1!important;',
      'pointer-events:auto!important;transition:none!important}',
      '.mode-bar,.topbar-global,#mode-bar{transition:none!important;opacity:1!important}',

      '#portal-agent .topbar,',
      '#portal-agent header.topbar,',
      '#portal-agent .main > .topbar{',
      'display:flex!important;align-items:center!important;flex-wrap:wrap!important;',
      'gap:0.55rem 0.75rem!important;',
      'padding:0.15rem 0 0.85rem!important;margin:0 0 0.35rem!important;',
      'background:transparent!important;background-image:none!important;',
      'border:none!important;border-radius:0!important;',
      'box-shadow:none!important;backdrop-filter:none!important;',
      '-webkit-backdrop-filter:none!important}',

      '#portal-agent #page-title,',
      '#portal-agent .topbar h2{',
      'margin:0!important;padding:0!important;',
      'font-size:1.05rem!important;font-weight:650!important;',
      'letter-spacing:-0.01em!important;color:var(--text,#f0f0f8)!important;',
      'background:none!important;border:none!important;box-shadow:none!important}',

      'html[data-theme="light"] #portal-agent #page-title{color:var(--text,#1a1a2e)!important}',

      '#portal-agent .topbar-actions{',
      'display:flex!important;align-items:center!important;flex-wrap:wrap!important;',
      'gap:0.45rem!important;margin-left:auto!important}',

      '#portal-agent #search-input,',
      '#portal-agent input[type="search"]#search-input,',
      '#portal-agent .topbar-actions > input[type="search"]{',
      'display:none!important;visibility:hidden!important;width:0!important;height:0!important;',
      'padding:0!important;margin:0!important;border:0!important;opacity:0!important;',
      'pointer-events:none!important;position:absolute!important;left:-9999px!important}',

      '#portal-agent .topbar-actions select,',
      '#portal-agent #filter-status,',
      '#portal-agent #filter-priority,',
      '#portal-agent #filter-sort,',
      '#portal-agent #filter-limit{',
      'display:inline-flex!important;visibility:visible!important;opacity:1!important;',
      'min-height:2rem!important;padding:0.3rem 0.55rem!important;',
      'border-radius:8px!important;font-size:0.8rem!important}',

      '#view-dashboard > .view-header,',
      '#view-dashboard > .list-header{',
      'background:transparent!important;border:none!important;box-shadow:none!important;',
      'padding:0 0 0.5rem!important;margin:0!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function hideSearch() {
    try {
      var si = document.getElementById('search-input');
      if (si) {
        si.style.cssText = 'display:none!important;visibility:hidden!important;width:0!important;height:0!important';
        si.setAttribute('aria-hidden', 'true');
        si.tabIndex = -1;
      }
    } catch (e) {}
  }

  function paintModeBar() {
    try {
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      var on = (pa && pa.classList.contains('active')) || (pc && pc.classList.contains('active'));
      if (on) {
        document.body.classList.add('is-portal');
        document.body.classList.remove('is-login');
        var bar = document.querySelector('.mode-bar');
        if (bar) {
          bar.style.cssText = 'display:flex!important;visibility:visible!important;opacity:1!important';
        }
      }
    } catch (e) {}
  }

  function tick() {
    inject();
    hideSearch();
    paintModeBar();
  }

  tick();
  setTimeout(tick, 50);
  setTimeout(tick, 200);
  setTimeout(tick, 600);
  setTimeout(tick, 1500);
  setInterval(paintModeBar, 2000);

  window.DRDashTopbarFix = { refresh: tick };
})();
