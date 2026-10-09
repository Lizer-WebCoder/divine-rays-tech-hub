/**
 * Divine Rays — Dashboard chrome + cards alignment v2
 * Larger title, visible filters (no search), even stat cards
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_DASH_TOPBAR_FIX >= 2) return;
  window.__DR_DASH_TOPBAR_FIX = 2;

  function inject() {
    var el = document.getElementById('dr-dash-topbar-fix-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-dash-topbar-fix-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.is-portal .mode-bar,body:has(#portal-agent.active) .mode-bar{',
      'display:flex!important;visibility:visible!important;opacity:1!important;transition:none!important}',

      '#portal-agent .topbar,#portal-agent header.topbar,#portal-agent .main > .topbar{',
      'display:flex!important;align-items:center!important;flex-wrap:wrap!important;',
      'gap:0.65rem 1rem!important;padding:0.35rem 0 1rem!important;margin:0!important;',
      'background:transparent!important;background-image:none!important;',
      'border:none!important;border-radius:0!important;box-shadow:none!important;',
      'backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      'min-height:auto!important;overflow:visible!important}',

      '#portal-agent #page-title,#portal-agent .topbar h2{',
      'display:block!important;margin:0!important;padding:0!important;',
      'font-size:1.45rem!important;font-weight:700!important;line-height:1.25!important;',
      'letter-spacing:-0.02em!important;color:#f2f0fa!important;',
      'background:none!important;border:none!important;box-shadow:none!important}',
      'html[data-theme="light"] #portal-agent #page-title{color:#1a1625!important}',

      '#portal-agent .topbar-actions{',
      'display:flex!important;align-items:center!important;flex-wrap:wrap!important;',
      'gap:0.5rem!important;margin-left:auto!important;visibility:visible!important;',
      'opacity:1!important;overflow:visible!important}',

      '#portal-agent #search-input,#portal-agent input#search-input{',
      'display:none!important;visibility:hidden!important;width:0!important;height:0!important;',
      'position:absolute!important;left:-9999px!important;pointer-events:none!important}',

      '#portal-agent .topbar-actions select,',
      '#portal-agent #filter-status,',
      '#portal-agent #filter-priority,',
      '#portal-agent #filter-sort,',
      '#portal-agent #filter-limit,',
      '#portal-agent select.filter-select{',
      'display:inline-block!important;visibility:visible!important;opacity:1!important;',
      'position:static!important;width:auto!important;min-width:8.5rem!important;',
      'max-width:14rem!important;height:auto!important;min-height:2.35rem!important;',
      'padding:0.4rem 2rem 0.4rem 0.7rem!important;margin:0!important;',
      'border-radius:10px!important;font-size:0.84rem!important;font-weight:500!important;',
      'line-height:1.3!important;cursor:pointer!important;pointer-events:auto!important;',
      'appearance:auto!important;-webkit-appearance:menulist!important;',
      'color:#e8e6f4!important;background:#1c1a2e!important;',
      'border:1px solid rgba(139,124,247,.35)!important;',
      'box-shadow:0 1px 0 rgba(255,255,255,.04) inset!important}',
      'html[data-theme="light"] #portal-agent .topbar-actions select,',
      'html[data-theme="light"] #portal-agent #filter-status,',
      'html[data-theme="light"] #portal-agent #filter-priority,',
      'html[data-theme="light"] #portal-agent #filter-sort,',
      'html[data-theme="light"] #portal-agent #filter-limit{',
      'color:#1f1b33!important;background:#fff!important;border-color:rgba(109,94,245,.28)!important}',

      '#view-dashboard .stats{',
      'display:grid!important;',
      'grid-template-columns:repeat(4,minmax(0,1fr))!important;',
      'gap:0.85rem!important;margin:0!important;align-items:stretch!important}',
      '#view-dashboard .stats-section .stats{',
      'grid-template-columns:repeat(auto-fit,minmax(11.5rem,1fr))!important}',

      '#view-dashboard .stat-card{',
      'display:flex!important;flex-direction:column!important;',
      'align-items:flex-start!important;justify-content:space-between!important;',
      'gap:0.45rem!important;min-height:6rem!important;height:auto!important;',
      'padding:1.05rem 1.15rem!important;box-sizing:border-box!important;',
      'border-radius:0.95rem!important;width:auto!important;max-width:none!important}',

      '#view-dashboard .stat-label{',
      'display:block!important;width:100%!important;',
      'font-size:0.72rem!important;font-weight:650!important;letter-spacing:0.05em!important;',
      'text-transform:uppercase!important;line-height:1.25!important;',
      'color:#9b98b8!important;margin:0!important;order:1!important}',
      '#view-dashboard .stat-value{',
      'display:block!important;width:100%!important;',
      'font-size:1.75rem!important;font-weight:750!important;line-height:1.15!important;',
      'font-variant-numeric:tabular-nums!important;letter-spacing:-0.02em!important;',
      'color:#f2f0fa!important;margin:0!important;order:2!important;text-align:left!important}',
      'html[data-theme="light"] #view-dashboard .stat-label{color:#6b6785!important}',
      'html[data-theme="light"] #view-dashboard .stat-value{color:#1e1b4b!important}',

      '@media (max-width:1100px){',
      '  #view-dashboard .stats{grid-template-columns:repeat(3,minmax(0,1fr))!important}',
      '}',
      '@media (max-width:720px){',
      '  #view-dashboard .stats,#view-dashboard .stats-section .stats{',
      '  grid-template-columns:repeat(2,minmax(0,1fr))!important}',
      '  #portal-agent #page-title{font-size:1.25rem!important}',
      '}',
      '@media (max-width:420px){',
      '  #view-dashboard .stats{grid-template-columns:1fr 1fr!important;gap:0.6rem!important}',
      '  #view-dashboard .stat-value{font-size:1.45rem!important}',
      '}'
    ].join('');
  }

  function ensureFiltersVisible() {
    try {
      ['filter-status', 'filter-priority', 'filter-sort', 'filter-limit'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.style.setProperty('display', 'inline-block', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('pointer-events', 'auto', 'important');
        el.removeAttribute('hidden');
        el.classList.remove('is-hidden', 'hidden');
      });
      var si = document.getElementById('search-input');
      if (si) {
        si.style.setProperty('display', 'none', 'important');
        si.setAttribute('aria-hidden', 'true');
      }
    } catch (e) {}
  }

  function paintModeBar() {
    try {
      var pa = document.getElementById('portal-agent');
      if (pa && pa.classList.contains('active')) {
        document.body.classList.add('is-portal');
        document.body.classList.remove('is-login');
        var bar = document.querySelector('.mode-bar');
        if (bar) bar.style.cssText = 'display:flex!important;visibility:visible!important;opacity:1!important';
      }
    } catch (e) {}
  }

  function tick() {
    inject();
    ensureFiltersVisible();
    paintModeBar();
  }

  tick();
  setTimeout(tick, 50);
  setTimeout(tick, 250);
  setTimeout(tick, 800);
  setTimeout(tick, 2000);
  setInterval(function () {
    ensureFiltersVisible();
    paintModeBar();
  }, 3000);

  window.DRDashTopbarFix = { refresh: tick, v: 2 };
})();
