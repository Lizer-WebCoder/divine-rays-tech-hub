/**
 * Divine Rays — Hide ticket list on Dashboard (quiet)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_DASHBOARD_NO_TICKETS >= 2) return;
  window.__DR_DASHBOARD_NO_TICKETS = 2;

  function injectCss() {
    if (document.getElementById('dr-dash-no-tickets-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-dash-no-tickets-css';
    el.textContent = [
      'body.dr-view-dashboard #ticket-list,',
      'body.dr-view-dashboard #dr-ticket-pager,',
      'body.dr-view-dashboard #dr-list-toolbar,',
      'body.dr-view-dashboard .dr-list-toolbar,',
      'body.dr-view-dashboard h3.stats-heading.dr-recent-label{',
      'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function tick() {
    injectCss();
    var nav = document.querySelector('#portal-agent .nav-btn.active');
    var onDash = false;
    if (nav) {
      var v = (nav.getAttribute('data-view') || '').toLowerCase();
      var t = (nav.textContent || '').trim().toLowerCase();
      onDash = v === 'dashboard' || t === 'dashboard';
      if (/my ticket|unassigned|all ticket|users|knowledge/.test(t) && t !== 'dashboard') onDash = false;
    }
    var has = document.body.classList.contains('dr-view-dashboard');
    if (onDash !== has) document.body.classList.toggle('dr-view-dashboard', onDash);
    if (onDash) {
      var list = document.getElementById('ticket-list');
      if (list && list.style.display !== 'none') list.style.setProperty('display', 'none', 'important');
    }
  }

  tick();
  setTimeout(tick, 1000);
  setInterval(tick, 15000);
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn');
    if (btn) setTimeout(tick, 50);
  }, true);
})();
