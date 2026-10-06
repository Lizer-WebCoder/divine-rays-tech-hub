/**
 * Divine Rays — Dashboard: hide ticket list (use My/Unassigned/All tabs instead)
 * Does not touch Users Management or login gate.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_DASHBOARD_NO_TICKETS >= 1) return;
  window.__DR_DASHBOARD_NO_TICKETS = 1;

  var STYLE_ID = 'dr-dashboard-no-tickets-css';

  function injectCss() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.dr-view-dashboard #ticket-list,',
      'body.dr-view-dashboard #dr-ticket-pager,',
      'body.dr-view-dashboard #dr-list-toolbar,',
      'body.dr-view-dashboard .dr-list-toolbar,',
      'body.dr-view-dashboard h3.stats-heading.dr-recent-label,',
      'body.dr-view-dashboard h3.stats-heading.dr-list-heading,',
      'body.dr-view-dashboard .dr-recent-wrap{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;margin:0!important;padding:0!important}',
      'body:not(.dr-view-list):not(.dr-view-endusers):not(.dr-view-admin-staff) #portal-agent #view-dashboard.active #ticket-list,',
      'body:not(.dr-view-list):not(.dr-view-endusers):not(.dr-view-admin-staff) #portal-agent #view-dashboard.active #dr-ticket-pager,',
      'body:not(.dr-view-list):not(.dr-view-endusers):not(.dr-view-admin-staff) #portal-agent #view-dashboard.active #dr-list-toolbar,',
      'body:not(.dr-view-list):not(.dr-view-endusers):not(.dr-view-admin-staff) #portal-agent #view-dashboard.active .dr-list-toolbar{display:none!important}'
    ].join('');
  }

  function isDashboardActive() {
    var nav = document.querySelector('#portal-agent .nav-btn.active');
    if (nav) {
      var v = (nav.getAttribute('data-view') || '').toLowerCase();
      var t = (nav.textContent || '').trim().toLowerCase();
      if (v === 'dashboard' || t === 'dashboard') return true;
      if (t.indexOf('my ticket') !== -1 || t.indexOf('unassigned') !== -1 || t.indexOf('all ticket') !== -1) return false;
      if (t.indexOf('knowledge') !== -1 || t.indexOf('users') !== -1 || t.indexOf('admin') !== -1) return false;
    }
    var dash = document.getElementById('view-dashboard');
    if (dash && dash.classList.contains('active')) {
      if (document.body.classList.contains('dr-view-list')) return false;
      if (document.body.classList.contains('dr-view-endusers')) return false;
      if (document.body.classList.contains('dr-view-admin-staff')) return false;
      return true;
    }
    return false;
  }

  function hideTicketListOnDash() {
    injectCss();
    var onDash = isDashboardActive();
    document.body.classList.toggle('dr-view-dashboard', onDash);
    if (!onDash) return;

    var list = document.getElementById('ticket-list');
    if (list) {
      list.style.setProperty('display', 'none', 'important');
      list.setAttribute('data-dr-dash-hidden', '1');
    }
    document.querySelectorAll('#view-dashboard h3.stats-heading').forEach(function (h) {
      var t = (h.textContent || '').toLowerCase();
      if (t.indexOf('recent') !== -1 || t.indexOf('ticket') !== -1) {
        h.style.setProperty('display', 'none', 'important');
        h.classList.add('dr-recent-label');
      }
    });
    var pager = document.getElementById('dr-ticket-pager');
    if (pager) pager.style.setProperty('display', 'none', 'important');
    var bar = document.getElementById('dr-list-toolbar');
    if (bar) bar.style.setProperty('display', 'none', 'important');
  }

  function restoreListIfNeeded() {
    if (isDashboardActive()) return;
    var list = document.getElementById('ticket-list');
    if (list && list.getAttribute('data-dr-dash-hidden')) {
      list.style.removeProperty('display');
      list.removeAttribute('data-dr-dash-hidden');
    }
  }

  function tick() {
    hideTicketListOnDash();
    restoreListIfNeeded();
  }

  tick();
  setInterval(tick, 800);
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn');
    if (btn) setTimeout(tick, 50);
  }, true);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
})();
