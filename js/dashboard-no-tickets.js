/**
 * Divine Rays — Hide ticket list on Dashboard only; restore on other tabs
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_DASHBOARD_NO_TICKETS >= 3) return;
  window.__DR_DASHBOARD_NO_TICKETS = 3;

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
      'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important}',
      /* Explicit restore when NOT on dashboard */
      'body:not(.dr-view-dashboard) #ticket-list{',
      'display:flex!important;visibility:visible!important;height:auto!important;overflow:visible!important}',
      'body:not(.dr-view-dashboard) #dr-ticket-pager{',
      'visibility:visible!important;height:auto!important;overflow:visible!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function isListView() {
    var nav = document.querySelector('#portal-agent .nav-btn.active');
    if (!nav) return false;
    var v = (nav.getAttribute('data-view') || '').toLowerCase();
    var t = (nav.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (v === 'my-tickets' || v === 'unassigned' || v === 'all-tickets') return true;
    if (/my tickets|unassigned tickets|all tickets/.test(t)) return true;
    return false;
  }

  function isDashboard() {
    var nav = document.querySelector('#portal-agent .nav-btn.active');
    if (!nav) return false;
    var v = (nav.getAttribute('data-view') || '').toLowerCase();
    var t = (nav.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (isListView()) return false;
    if (/users|knowledge|admin|end-user/.test(t)) return false;
    return v === 'dashboard' || t === 'dashboard';
  }

  function showList() {
    var list = document.getElementById('ticket-list');
    if (!list) return;
    try {
      list.style.removeProperty('display');
      list.style.removeProperty('visibility');
      list.style.removeProperty('height');
      list.style.removeProperty('overflow');
      list.style.setProperty('display', 'flex', 'important');
      list.style.setProperty('visibility', 'visible', 'important');
    } catch (e) {}
    var pager = document.getElementById('dr-ticket-pager');
    if (pager) {
      try {
        pager.style.removeProperty('visibility');
        pager.style.removeProperty('height');
        pager.style.removeProperty('overflow');
      } catch (e2) {}
    }
  }

  function hideList() {
    var list = document.getElementById('ticket-list');
    if (!list) return;
    try {
      list.style.setProperty('display', 'none', 'important');
    } catch (e) {}
  }

  function tick() {
    injectCss();
    var onDash = isDashboard();
    document.body.classList.toggle('dr-view-dashboard', onDash);
    if (onDash) {
      hideList();
    } else if (isListView()) {
      showList();
      try {
        if (window.DRFilters && window.DRFilters.refresh) window.DRFilters.refresh();
        else if (typeof window.applyTicketFilters === 'function') window.applyTicketFilters(false);
      } catch (e3) {}
    } else {
      // Users / KB etc. — do not force-hide with sticky inline style
      var list = document.getElementById('ticket-list');
      if (list) {
        try {
          list.style.removeProperty('display');
          list.style.removeProperty('visibility');
        } catch (e4) {}
      }
    }
  }

  tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 2500);
  setInterval(tick, 4000);
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn');
    if (btn) {
      setTimeout(tick, 40);
      setTimeout(tick, 200);
      setTimeout(tick, 600);
    }
  }, true);

  window.DRDashboardNoTickets = { refresh: tick };
})();
