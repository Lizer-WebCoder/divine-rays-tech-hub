/**
 * Divine Rays — fix admin portal clicks + visible data
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_CLICK_FIX) return;
  window.__DR_ADMIN_CLICK_FIX = 1;

  var CSS_ID = 'dr-admin-click-fix';

  var CSS = [
    '#app-shell:not([hidden]):not(.is-hidden) ~ #login-screen,',
    'body:has(#portal-agent.active) #login-screen,',
    'body:has(#portal-customer.active) #login-screen,',
    '#login-screen.is-hidden,#login-screen[hidden]{',
    'display:none!important;visibility:hidden!important;pointer-events:none!important;',
    'opacity:0!important;z-index:-1!important;height:0!important;overflow:hidden!important}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important;z-index:0!important}',
    '#portal-agent.active{position:relative!important;z-index:2!important;pointer-events:auto!important}',
    '#portal-agent.active .sidebar,#portal-agent.active .main,#portal-agent.active main.main{',
    'pointer-events:auto!important;z-index:3!important;position:relative}',
    '#portal-agent .nav-btn,#portal-agent button,#portal-agent a,#portal-agent select,',
    '#portal-agent input,#portal-agent textarea,#portal-agent .ticket-card,#portal-agent .stat-card,',
    '#portal-agent label,#portal-agent .filters-bar,#portal-agent .filter-bar{',
    'pointer-events:auto!important}',
    '#portal-agent .nav-btn,#portal-agent button,#portal-agent a{cursor:pointer}',
    '#portal-agent select{cursor:pointer}',
    '#portal-agent .stat-value,#portal-agent .stat-label,#portal-agent .ticket-card h4,',
    '#portal-agent .ticket-meta,#portal-agent .nav-btn,#portal-agent table td,#portal-agent table th{',
    'opacity:1!important;visibility:visible!important}',
    'html[data-theme="light"] #portal-agent .stat-value{color:#4c3fd4!important;opacity:1!important}',
    'html[data-theme="light"] #portal-agent .stat-label,html[data-theme="light"] #portal-agent .ticket-meta,',
    'html[data-theme="light"] #portal-agent .nav-btn{color:#1a1a2e!important;opacity:1!important}',
    'html[data-theme="light"] #portal-agent .stat-card,html[data-theme="light"] #portal-agent .ticket-card{',
    'background:rgba(255,255,255,.88)!important;color:#1a1a2e!important;opacity:1!important;pointer-events:auto!important}',
    '#portal-agent .stat-card,#portal-agent .ticket-card{opacity:1!important;pointer-events:auto!important}',
    '.mode-bar{z-index:400!important;pointer-events:auto!important}',
    '.mode-bar button,.mode-bar a,.mode-bar select{pointer-events:auto!important}',
    '#portal-agent .view.active{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}',
    '#portal-agent .view:not(.active){display:none!important}'
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
    var active = (pa && pa.classList.contains('active')) || (pc && pc.classList.contains('active'));
    if (active && login) {
      login.hidden = true;
      login.classList.add('is-hidden');
      login.style.setProperty('display', 'none', 'important');
      login.style.setProperty('pointer-events', 'none', 'important');
      login.style.setProperty('z-index', '-1', 'important');
    }
  }

  function ensureNavClicks() {
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (btn) {
      btn.style.setProperty('pointer-events', 'auto', 'important');
      if (btn.__drNavOk) return;
      btn.__drNavOk = true;
      btn.addEventListener('click', function () {
        var view = btn.getAttribute('data-view');
        if (!view) return;
        document.querySelectorAll('#portal-agent .nav-btn').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        document.querySelectorAll('#portal-agent .view').forEach(function (v) {
          var id = v.id || '';
          var match = id === 'view-' + view || id === view;
          v.classList.toggle('active', match);
        });
      }, true);
    });
  }

  function tick() {
    inject();
    unblockLogin();
    ensureNavClicks();
  }

  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setTimeout(tick, 200);
  setTimeout(tick, 800);
  setTimeout(tick, 2000);
  setInterval(function () { unblockLogin(); inject(); }, 4000);

  window.DRAdminClickFix = { refresh: tick };
})();
