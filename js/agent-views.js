/**
 * Divine Rays — agent view layout + polished list chrome
 * Dashboard: no Recent tickets
 * My / Unassigned / All: list-only with better header
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_VIEWS_V2) return;
  window.__DR_AGENT_VIEWS_V2 = 1;

  var STYLE_ID = 'dr-agent-views-css';
  var CSS = [
    'body.dr-view-dashboard #ticket-list,',
    'body.dr-view-dashboard h3.stats-heading.dr-recent-label,',
    'body.dr-view-dashboard .dr-recent-wrap,',
    'body.dr-view-dashboard #dr-ticket-pager,',
    'body.dr-view-dashboard #dr-list-heading,',
    'body.dr-view-dashboard .dr-list-toolbar{display:none!important}',
    'body.dr-view-list #view-dashboard > .stats-section{display:none!important}',
    'body.dr-view-list #agent-perf-list{display:none!important}',
    'body.dr-view-list #view-dashboard > h3.stats-heading:not(.dr-list-heading){display:none!important}',
    'body.dr-view-list #ticket-list{display:flex!important;flex-direction:column!important;gap:.65rem!important}',
    'body.dr-view-list h3.dr-list-heading{display:none!important}',
    'body.dr-view-list .dr-list-toolbar{',
    'display:flex!important;align-items:center;justify-content:space-between;gap:1rem;',
    'margin:0 0 1rem;padding:.85rem 1.1rem;border-radius:14px;',
    'border:1px solid rgba(139,124,247,.22);background:rgba(26,24,42,.55)}',
    'html[data-theme="light"] body.dr-view-list .dr-list-toolbar{',
    'background:#fff!important;border-color:rgba(109,94,245,.18)!important;',
    'box-shadow:0 2px 12px rgba(30,30,60,.05)}',
    '.dr-list-toolbar-left{display:flex;flex-direction:column;gap:.2rem;min-width:0}',
    '.dr-list-toolbar-left h2{margin:0;font-size:1.05rem;font-weight:700;color:#eeeef6}',
    'html[data-theme="light"] .dr-list-toolbar-left h2{color:#1e1b4b!important}',
    '.dr-list-toolbar-left p{margin:0;font-size:.8rem;color:#9898b0}',
    'html[data-theme="light"] .dr-list-toolbar-left p{color:#6b7280!important}',
    '.dr-list-toolbar-right{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}',
    '.dr-limit-wrap{display:inline-flex;align-items:center;gap:.4rem;margin-left:.35rem}',
    '.dr-limit-wrap label{font-size:.78rem;color:var(--text-muted,#9898b0);white-space:nowrap}',
    '#filter-limit{min-width:4.5rem}',
    'body.dr-view-list .dr-ticket-pager{display:flex!important}',
    '.dr-ticket-pager{',
    'display:none;align-items:center;justify-content:center;gap:.75rem;',
    'margin:1rem 0 .25rem;padding:.65rem .9rem;border-radius:12px;',
    'border:1px solid rgba(139,124,247,.22);background:rgba(26,24,42,.45)}',
    'html[data-theme="light"] .dr-ticket-pager{',
    'background:#fff!important;border-color:rgba(109,94,245,.18)!important;',
    'box-shadow:0 2px 12px rgba(30,30,60,.05)}',
    '.dr-page-btn{',
    'appearance:none;border:1px solid rgba(139,124,247,.35);background:rgba(109,94,245,.18);',
    'color:#c4b5fd;font-size:.85rem;font-weight:600;padding:.45rem .9rem;border-radius:10px;',
    'cursor:pointer;transition:background .15s,border-color .15s,opacity .15s}',
    '.dr-page-btn:hover:not(:disabled):not(.is-disabled){',
    'background:rgba(109,94,245,.32);border-color:rgba(167,139,250,.55)}',
    '.dr-page-btn:disabled,.dr-page-btn.is-disabled{opacity:.4;cursor:not-allowed}',
    'html[data-theme="light"] .dr-page-btn{',
    'background:#f5f3ff;color:#5b21b6;border-color:rgba(109,94,245,.3)}',
    'html[data-theme="light"] .dr-page-btn:hover:not(:disabled):not(.is-disabled){',
    'background:#ede9fe;border-color:rgba(109,94,245,.5)}',
    '.dr-page-info{font-size:.85rem;font-weight:600;color:#c4c4d4;min-width:6.5rem;text-align:center}',
    'html[data-theme="light"] .dr-page-info{color:#374151!important}',
    'body.dr-view-list .ticket-card{',
    'border-radius:14px!important;transition:transform .15s ease,box-shadow .15s ease,border-color .15s}',
    'body.dr-view-list .ticket-card:hover{',
    'transform:translateY(-1px);border-color:rgba(167,139,250,.45)!important;',
    'box-shadow:0 8px 24px rgba(109,94,245,.12)}',
    'body.dr-view-list .ticket-meta .meta-sep{opacity:.45;margin:0 .4rem;font-weight:700;user-select:none}',
    'body.dr-view-list .ticket-body{min-width:0}',
    'body.dr-view-list .ticket-body h4{',
    'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function currentNavView() {
    var active = document.querySelector('#portal-agent .nav-btn.active');
    if (!active) return 'dashboard';
    var t = (active.textContent || '').trim().toLowerCase();
    if (t.indexOf('unassigned') !== -1) return 'unassigned';
    if (t.indexOf('my ticket') !== -1) return 'my-tickets';
    if (t.indexOf('all ticket') !== -1) return 'all-tickets';
    if (t.indexOf('knowledge') !== -1) return 'kb';
    if (t.indexOf('admin') !== -1) return 'admin';
    return 'dashboard';
  }

  function markRecentHeading() {
    document.querySelectorAll('#view-dashboard h3.stats-heading').forEach(function (h) {
      var t = (h.textContent || '').toLowerCase();
      if (t.indexOf('recent') !== -1) h.classList.add('dr-recent-label');
    });
  }

  function ensureToolbar(view) {
    var list = document.getElementById('ticket-list');
    if (!list || !list.parentNode) return null;
    var bar = document.getElementById('dr-list-toolbar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'dr-list-toolbar';
      bar.className = 'dr-list-toolbar';
      bar.innerHTML =
        '<div class="dr-list-toolbar-left">' +
        '<h2 id="dr-list-title">Tickets</h2>' +
        '<p class="kb-sub" id="dr-list-sub"></p>' +
        '</div>' +
        '<div class="dr-list-toolbar-right" id="dr-list-toolbar-right"></div>';
      list.parentNode.insertBefore(bar, list);
    }
    var titles = {
      'my-tickets': { title: 'My claimed tickets', sub: 'Tickets assigned to you' },
      unassigned: { title: 'Unassigned tickets', sub: 'Open queue waiting for an agent' },
      'all-tickets': { title: 'All tickets', sub: 'Full queue across the team' }
    };
    var meta = titles[view] || { title: 'Tickets', sub: '' };
    var tEl = document.getElementById('dr-list-title');
    var sEl = document.getElementById('dr-list-sub');
    if (tEl) tEl.textContent = meta.title;
    if (sEl) sEl.textContent = meta.sub;
    return bar;
  }

  var _lastView = '';
  function applyLayout() {
    injectCss();
    markRecentHeading();
    var view = currentNavView();
    var body = document.body;
    if (!body) return;

    var isList = view === 'my-tickets' || view === 'unassigned' || view === 'all-tickets';
    var isDash = view === 'dashboard';

    body.classList.toggle('dr-view-dashboard', !!isDash);
    body.classList.toggle('dr-view-list', !!isList);

    var bar = ensureToolbar(view);
    if (bar) bar.style.display = isList ? '' : 'none';
    try {
      if (window.DRFilters && window.DRFilters.ensureControls) window.DRFilters.ensureControls();
    } catch (e) {}

    if (isList && view !== _lastView) {
      _lastView = view;
      try {
        var lf = window.DR && DR.getListFilter && DR.getListFilter();
        if (lf) lf.page = 0;
        if (typeof window.applyTicketFilters === 'function') {
          window.applyTicketFilters(false);
        }
      } catch (e) {}
    } else if (!isList) {
      _lastView = view;
    }
  }

  function boot() {
    injectCss();
    applyLayout();

    var nav = document.querySelector('#portal-agent .nav');
    if (nav) {
      new MutationObserver(function () {
        setTimeout(applyLayout, 40);
        setTimeout(applyLayout, 200);
      }).observe(nav, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }

    document.addEventListener(
      'click',
      function (e) {
        var t = e.target;
        if (t && ((t.classList && t.classList.contains('nav-btn')) || (t.closest && t.closest('.nav-btn')))) {
          setTimeout(applyLayout, 40);
          setTimeout(applyLayout, 250);
        }
      },
      true
    );
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 200);
  setTimeout(boot, 1000);

  window.DRAgentViews = { refresh: applyLayout };
})();
