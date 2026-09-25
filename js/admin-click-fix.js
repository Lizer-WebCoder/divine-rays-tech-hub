/**
 * Divine Rays — admin clicks only (do NOT hijack nav/views)
 * App uses view-dashboard for my/unassigned/all tickets — never hide it
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_CLICK_FIX) {
    try { delete window.__DR_ADMIN_CLICK_FIX; } catch (e) {}
  }
  window.__DR_ADMIN_CLICK_FIX = 1;

  var CSS_ID = 'dr-admin-click-fix';

  var CSS = [
    'body:has(#portal-agent.active) #login-screen,',
    'body:has(#portal-customer.active) #login-screen,',
    '#login-screen.is-hidden,#login-screen[hidden]{',
    'display:none!important;visibility:hidden!important;pointer-events:none!important;',
    'z-index:-1!important}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#portal-agent.active{pointer-events:auto!important}',
    '#portal-agent.active .sidebar,#portal-agent.active .main,#portal-agent.active main.main{',
    'pointer-events:auto!important;position:relative;z-index:3}',
    '#portal-agent .nav-btn,#portal-agent button,#portal-agent a,#portal-agent select,',
    '#portal-agent input,#portal-agent textarea,#portal-agent .ticket-card,#portal-agent .stat-card{',
    'pointer-events:auto!important}',
    '#portal-agent #view-dashboard,#portal-agent #view-dashboard.active,',
    '#portal-agent .tickets-list,#portal-agent .ticket-list,#portal-agent #tickets-list,',
    '#portal-agent .ticket-card,#portal-agent .kb-list,#portal-agent #kb-list,',
    '#portal-agent .kb-article,#portal-agent [id*="kb"]{',
    'opacity:1!important;visibility:visible!important}',
    '#portal-agent #view-dashboard.active{display:block!important}',
    '#portal-agent #view-admin.active{display:block!important}',
    '#portal-agent #view-detail.active{display:block!important}',
    '#portal-agent.active .main,#portal-agent.active main.main{',
    'width:auto!important;max-width:none!important;min-width:0!important}',
    '#portal-agent .tickets-list,#portal-agent .ticket-list,#portal-agent .kb-list{',
    'width:100%!important;max-width:none!important;box-sizing:border-box!important}',
    'html[data-theme="light"] #portal-agent .stat-card,',
    'html[data-theme="light"] #portal-agent .ticket-card,',
    'html[data-theme="light"] #portal-agent .kb-article{',
    'background:rgba(255,255,255,.92)!important;color:#1a1a2e!important;opacity:1!important}',
    '.mode-bar{z-index:400!important;pointer-events:auto!important}'
  ].join('');

  function inject() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function unblockLogin() {
    var login = document.getElementById('login-screen');
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    var active =
      (pa && pa.classList.contains('active')) || (pc && pc.classList.contains('active'));
    if (active && login) {
      login.hidden = true;
      login.classList.add('is-hidden');
      try {
        login.style.setProperty('display', 'none', 'important');
        login.style.setProperty('pointer-events', 'none', 'important');
      } catch (e) {}
    }
  }

  function restoreDashboardIfNeeded() {
    var pa = document.getElementById('portal-agent');
    if (!pa || !pa.classList.contains('active')) return;
    var any = pa.querySelector('.view.active');
    if (!any) {
      var dash = document.getElementById('view-dashboard');
      if (dash) dash.classList.add('active');
    }
  }

  function tick() {
    inject();
    unblockLogin();
    restoreDashboardIfNeeded();
  }

  tick();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
  setTimeout(tick, 200);
  setTimeout(tick, 1000);
  setTimeout(tick, 2500);
  setInterval(function () {
    unblockLogin();
    restoreDashboardIfNeeded();
  }, 5000);

  window.DRAdminClickFix = { refresh: tick };
})();
