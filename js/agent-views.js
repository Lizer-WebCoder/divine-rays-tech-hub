/**
 * Divine Rays — agent view layout
 * Dashboard: no Recent tickets
 * My / Unassigned / All: list only (no Overview blocks)
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_VIEWS) return;
  window.__DR_AGENT_VIEWS = 1;

  var STYLE_ID = 'dr-agent-views-css';
  var CSS = [
    '/* Dashboard: hide recent tickets block */',
    'body.dr-view-dashboard #ticket-list,',
    'body.dr-view-dashboard h3.stats-heading.dr-recent-label,',
    'body.dr-view-dashboard .dr-recent-wrap{display:none!important}',
    '/* List views: hide overview / stats / team board */',
    'body.dr-view-list #view-dashboard > .stats-section{display:none!important}',
    'body.dr-view-list #agent-perf-list{display:none!important}',
    'body.dr-view-list #view-dashboard > h3.stats-heading:not(.dr-list-heading){display:none!important}',
    'body.dr-view-list #ticket-list{display:block!important}',
    'body.dr-view-list h3.dr-list-heading{display:block!important;margin:0 0 .85rem!important}'
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
    try {
      if (window.currentView) return window.currentView;
    } catch (e) {}
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

  function applyLayout() {
    injectCss();
    markRecentHeading();
    var view = currentNavView();
    var body = document.body;
    if (!body) return;

    var isList =
      view === 'my-tickets' ||
      view === 'unassigned' ||
      view === 'all-tickets';
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

    if (isList) {
      try {
        if (window.DR && typeof DR.renderTicketList === 'function') DR.renderTicketList();
        else if (typeof window.applyTicketFilters === 'function') window.applyTicketFilters(false);
      } catch (e) {}
    }
  }

  function boot() {
    injectCss();
    applyLayout();

    var nav = document.querySelector('#portal-agent .nav');
    if (nav) {
      new MutationObserver(function () {
        setTimeout(applyLayout, 30);
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
          setTimeout(applyLayout, 600);
        }
      },
      true
    );

    setInterval(applyLayout, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);

  window.DRAgentViews = { refresh: applyLayout };
})();
