/**
 * Divine Rays — Light mode polish + hide Showing meta (v10)
 * Light top bar: soft lavender (not browser-white).
 * Dark top-bar logo: dark plate + purple gear.
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LIGHT_MODE_POLISH_V10) return;
  window.__DR_LIGHT_MODE_POLISH_V10 = 1;
  window.__DR_LIGHT_MODE_POLISH_V9 = 1;

  var STYLE_ID = 'dr-light-mode-polish-css';
  var BAR_H = 52;

  var CSS = [
    'body.is-login .mode-bar,body:not(.is-portal) .mode-bar,.mode-bar.dr-login-hide{',
    '  display:none!important;visibility:hidden!important;pointer-events:none!important;height:0!important;overflow:hidden!important',
    '}',
    'body.is-portal .mode-bar,body.is-portal .mode-bar:not(.dr-login-hide){',
    '  position:fixed!important;top:0!important;left:0!important;right:0!important;',
    '  width:100%!important;max-width:100vw!important;',
    '  z-index:2147483000!important;pointer-events:auto!important;',
    '  box-sizing:border-box!important;transform:none!important;margin:0!important;',
    '  display:flex!important;visibility:visible!important',
    '}',
    'body.is-portal #app-shell,#app-shell:not([hidden]){padding-top:' + BAR_H + 'px!important}',
    'body.is-login #app-shell{padding-top:0!important}',

    'html[data-theme="light"] body.is-portal .mode-bar{',
    '  background:linear-gradient(180deg,#ebe6ff 0%,#e2dbfc 100%)!important;',
    '  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    '  border-bottom:1px solid rgba(109,94,245,0.28)!important;',
    '  box-shadow:0 2px 14px rgba(91,33,182,0.12)',
    '}',
    'html[data-theme="dark"] body.is-portal .mode-bar,html:not([data-theme="light"]) body.is-portal .mode-bar{',
    '  background:rgba(18,16,28,0.96)!important;',
    '  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    '  border-bottom:1px solid rgba(139,124,247,0.25)!important',
    '}',
    'html[data-theme="light"] body.is-portal .mode-bar,html[data-theme="light"] body.is-portal .mode-bar .user-info,',
    'html[data-theme="light"] body.is-portal .mode-bar span,html[data-theme="light"] body.is-portal .mode-bar a{color:#1e1b4b!important}',
    'html[data-theme="light"] body.is-portal .mode-bar .brand,html[data-theme="light"] body.is-portal .mode-bar .logo-text{color:#4c1d95!important;font-weight:700}',

    'html[data-theme="light"] #portal-customer .customer-tabs{',
    '  background:rgba(255,255,255,0.75)!important;',
    '  border:1px solid rgba(109,94,245,0.2)!important;border-radius:14px!important;',
    '  padding:0.35rem!important;gap:0.4rem!important',
    '}',
    'html[data-theme="light"] #portal-customer .customer-tabs .ctab,',
    'html[data-theme="light"] #portal-customer .customer-tabs button{',
    '  background:transparent!important;color:#5b21b6!important;',
    '}',
    'html[data-theme="light"] #portal-customer .customer-tabs .ctab:hover{background:#f3f0ff!important;color:#4c1d95!important}',
    'html[data-theme="light"] #portal-customer .customer-tabs .ctab.active{',
    '  background:linear-gradient(135deg,#7c6af0,#9b8afb)!important;color:#fff!important;',
    '}',

    'html[data-theme="light"] #portal-agent .ticket-card{',
    '  background:#fff!important;border-color:rgba(109,94,245,0.18)!important;color:#1e1b4b',
    '}',
    'html[data-theme="light"] #portal-agent .ticket-card h4{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .ticket-meta{color:#5b5675!important}',
    'html[data-theme="light"] #portal-agent .sidebar{',
    '  background:rgba(255,255,255,0.20)!important;',
    '  backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;',
    '  border-right:1px solid rgba(109,94,245,0.18)!important',
    '}',
    'html[data-theme="light"] #portal-agent .nav-btn{color:#4c1d95!important}',
    'html[data-theme="light"] #portal-agent .nav-btn.active{',
    '  background:rgba(109,94,245,0.12)!important;color:#4c1d95!important',
    '}',

    'html[data-theme="light"] .stat-card{',
    '  background:#fff!important;border:1px solid rgba(109,94,245,0.22)!important;',
    '}',
    'html[data-theme="light"] .stat-card .stat-value{color:#4c1d95!important}',
    'html[data-theme="light"] .stat-card .stat-label{color:#5b5675!important}',

    'html[data-theme="light"] .comments-section{background:#fff!important;border-color:rgba(109,94,245,0.22)!important}',
    'html[data-theme="light"] .comment{background:#f7f5ff!important;border-color:rgba(109,94,245,0.2)!important}',

    'html[data-theme="light"] #search-input,html[data-theme="light"] select,html[data-theme="light"] input[type="text"]{',
    '  background:#fff!important;color:#1e1b4b!important;border-color:rgba(109,94,245,0.3)!important',
    '}',

    'html[data-theme="light"] .mode-bar .logo,',
    'html[data-theme="light"] .mode-bar .logo-gear,',
    'html[data-theme="light"] .mode-bar .mode-brand .logo,',
    'html[data-theme="light"] .mode-bar .brand .logo{',
    '  background:#fff!important;',
    '  border:1px solid rgba(109,94,245,0.28)!important;',
    '  color:#6d5ef5!important;',
    '  box-shadow:0 1px 4px rgba(109,94,245,0.12)!important',
    '}',
    'html[data-theme="light"] .mode-bar .logo svg,',
    'html[data-theme="light"] .mode-bar .logo-gear svg,',
    'html[data-theme="light"] .mode-bar .gear-icon,',
    'html[data-theme="light"] .mode-bar .logo .gear-icon{',
    '  color:#6d5ef5!important;fill:#6d5ef5!important;stroke:#6d5ef5!important',
    '}',
    'html[data-theme="light"] .mode-bar .logo img,',
    'html[data-theme="light"] .mode-bar .mode-brand img{',
    '  filter:none!important;opacity:1!important',
    '}',

    'html[data-theme="dark"] .mode-bar .logo,',
    'html[data-theme="dark"] .mode-bar .logo-gear,',
    'html[data-theme="dark"] .mode-bar .mode-brand .logo,',
    'html[data-theme="dark"] .mode-bar .brand .logo,',
    'html:not([data-theme="light"]) .mode-bar .logo,',
    'html:not([data-theme="light"]) .mode-bar .logo-gear{',
    '  background:rgba(28,24,48,0.95)!important;',
    '  border:1px solid rgba(139,124,247,0.35)!important;',
    '  color:#a78bfa!important;',
    '  box-shadow:0 1px 6px rgba(0,0,0,0.35)!important',
    '}',
    'html[data-theme="dark"] .mode-bar .logo svg,',
    'html[data-theme="dark"] .mode-bar .logo-gear svg,',
    'html[data-theme="dark"] .mode-bar .gear-icon,',
    'html:not([data-theme="light"]) .mode-bar .gear-icon{',
    '  color:#a78bfa!important;fill:#a78bfa!important;stroke:#a78bfa!important',
    '}',
    /* Hide inaccurate "Showing 1-20 of N · Page X/Y" under tab headers */
    '#filter-hint, .filter-hint, #list-hint, .list-hint{',
    '  display:none!important;visibility:hidden!important;height:0!important;',
    '  margin:0!important;padding:0!important;overflow:hidden!important;font-size:0!important',
    '}'
  ].join('');

  function inject() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
    try {
      var fh = document.getElementById('filter-hint');
      if (fh) { fh.textContent = ''; fh.style.display = 'none'; }
      document.querySelectorAll('.filter-hint, #list-hint, .list-hint').forEach(function (n) {
        n.textContent = '';
        n.style.display = 'none';
      });
    } catch (e) {}
  }

  function forceSidebarLight() {
    try {
      var theme = document.documentElement.getAttribute('data-theme') || 'dark';
      var side = document.querySelector('#portal-agent .sidebar');
      if (side && theme === 'light') {
        side.style.setProperty('background', 'rgba(255,255,255,0.20)', 'important');
        side.style.setProperty('backdrop-filter', 'blur(12px)', 'important');
        side.style.setProperty('-webkit-backdrop-filter', 'blur(12px)', 'important');
      }
      var logos = document.querySelectorAll('.mode-bar .logo, .mode-bar .logo-gear, .mode-bar .mode-brand .logo, .mode-bar .brand .logo');
      var icons = document.querySelectorAll('.mode-bar .gear-icon, .mode-bar .logo svg, .mode-bar .logo-gear svg');
      if (theme === 'light') {
        logos.forEach(function (el) {
          el.style.setProperty('background', '#ffffff', 'important');
          el.style.setProperty('border', '1px solid rgba(109,94,245,0.28)', 'important');
          el.style.setProperty('color', '#6d5ef5', 'important');
          el.style.setProperty('box-shadow', '0 1px 4px rgba(109,94,245,0.12)', 'important');
        });
        icons.forEach(function (el) {
          el.style.setProperty('color', '#6d5ef5', 'important');
          el.style.setProperty('fill', '#6d5ef5', 'important');
          el.style.setProperty('stroke', '#6d5ef5', 'important');
        });
        var bar = document.querySelector('body.is-portal .mode-bar');
        if (bar) {
          bar.style.setProperty('background', 'linear-gradient(180deg,#ebe6ff 0%,#e2dbfc 100%)', 'important');
          bar.style.setProperty('border-bottom', '1px solid rgba(109,94,245,0.28)', 'important');
        }
      } else {
        logos.forEach(function (el) {
          el.style.setProperty('background', 'rgba(28,24,48,0.95)', 'important');
          el.style.setProperty('border', '1px solid rgba(139,124,247,0.35)', 'important');
          el.style.setProperty('color', '#a78bfa', 'important');
          el.style.setProperty('box-shadow', '0 1px 6px rgba(0,0,0,0.35)', 'important');
        });
        icons.forEach(function (el) {
          el.style.setProperty('color', '#a78bfa', 'important');
          el.style.setProperty('fill', '#a78bfa', 'important');
          el.style.setProperty('stroke', '#a78bfa', 'important');
        });
        var bar2 = document.querySelector('body.is-portal .mode-bar');
        if (bar2) {
          bar2.style.setProperty('background', 'rgba(18,16,28,0.96)', 'important');
          bar2.style.setProperty('border-bottom', '1px solid rgba(139,124,247,0.25)', 'important');
        }
      }
    } catch (e) {}
  }

  function boot() {
    inject();
    forceSidebarLight();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1200);
  setInterval(forceSidebarLight, 1500);

  window.DRLightModePolish = { refresh: boot, v: 10 };
})();
