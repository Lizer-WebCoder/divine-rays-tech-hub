/**
 * Divine Rays — agent view layout (no list re-render)
 * Dashboard: hide Recent tickets
 * My / Unassigned / All: list only
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_VIEWS) return;
  window.__DR_AGENT_VIEWS = 1;

  var STYLE_ID = 'dr-agent-views-css';
  var CSS = [
    'body.dr-view-dashboard #ticket-list,',
    'body.dr-view-dashboard h3.stats-heading.dr-recent-label,',
    'body.dr-view-dashboard .dr-recent-wrap{display:none!important}',
    'body.dr-view-list #view-dashboard > .stats-section{display:none!important}',
    'body.dr-view-list #agent-perf-list{display:none!important}',
    'body.dr-view-list #view-dashboard > h3.stats-heading:not(.dr-list-heading){display:none!important}',
    'body.dr-view-list #ticket-list{display:block!important}',
    'body.dr-view-list h3.dr-list-heading{display:block!important;margin:0 0 .85rem!important}',
    '.dr-limit-wrap{display:inline-flex;align-items:center;gap:.4rem;margin-left:.5rem}',
    '.dr-limit-wrap label{font-size:.78rem;color:var(--text-muted,#9898b0);white-space:nowrap}',
    '#filter-limit{min-width:4.5rem}'
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
    if (active) return active.getAttribute('data-view') || 'dashboard';
    return 'dashboard';
  }

  function ensureListHeading() {
    var list = document.getElementById('ticket-list');
    if (!list) return null;
    var h = document.getElementById('dr-list-heading');
    if (!h) {
      h = document.createElement('h3');
      h.id = 'dr-list-heading';
      h.className = 'stats-heading dr-list-heading';
      list.parentNode.insertBefore(h, list);
    }
    return h;
  }

  function markRecentHeading() {
    var list = document.getElementById('ticket-list');
    if (!list) return;
    var prev = list.previousElementSibling;
    while (prev && (prev.id === 'dr-list-heading' || (prev.classList && prev.classList.contains('dr-list-heading')))) {
      prev = prev.previousElementSibling;
    }
    if (prev && prev.classList && prev.classList.contains('stats-heading')) {
      prev.classList.add('dr-recent-label');
    }
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

    var heading = ensureListHeading();
    if (heading) {
      if (isList) {
        var titles = {
          'my-tickets': 'My claimed tickets',
          unassigned: 'Unassigned tickets',
          'all-tickets': 'All tickets'
        };
        heading.textContent = titles[view] || 'Tickets';
        heading.style.display = '';
      } else {
        heading.style.display = 'none';
      }
    }

    if (isList && view !== _lastView) {
      _lastView = view;
      try {
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
