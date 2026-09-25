/**
 * Divine Rays — transparent admin bubbles + realistic single-line heartbeat
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LIGHT_FORCE) {
    try { delete window.__DR_LIGHT_FORCE; } catch (e) {}
  }
  window.__DR_LIGHT_FORCE = 1;

  var CSS_ID = 'dr-light-force-css';
  var LINE_ID = 'dr-lifeline';

  var HB =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='120' viewBox='0 0 400 120'%3E%3Cpath fill='none' stroke='%23COL%23' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' d='M0 60 H55 L62 60 L68 48 L74 60 H95 L100 60 L106 18 L112 102 L118 52 L124 60 H155 L162 60 L168 50 L174 60 H200 L206 60 L212 42 L218 60 H245 L250 60 L256 22 L262 98 L268 54 L274 60 H310 L316 60 L322 46 L328 60 H360 L366 60 L372 52 L378 60 H400'/%3E%3C/svg%3E";

  var lightCol = HB.replace('%23COL%23', '%235b4ce0');
  var darkCol = HB.replace('%23COL%23', '%23a78bfa');

  var CSS = [
    'html[data-theme="light"]{color-scheme:light!important}',
    'html[data-theme="light"],html[data-theme="light"] body{',
    'background:#ffffff!important;background-color:#ffffff!important;',
    'background-image:radial-gradient(ellipse 90% 55% at 50% -12%,rgba(109,94,245,.28),transparent 58%),',
    'radial-gradient(ellipse 55% 45% at 100% 100%,rgba(167,139,250,.14),transparent 50%)!important;',
    'color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent,html[data-theme="light"] #portal-agent.active,',
    'html[data-theme="light"] #portal-customer,html[data-theme="light"] #portal-customer.active,',
    'html[data-theme="light"] #portal-agent .main,html[data-theme="light"] #portal-agent main.main,',
    'html[data-theme="light"] #portal-customer .main,html[data-theme="light"] .app-shell,',
    'html[data-theme="light"] .login-screen,html[data-theme="light"] #login-screen{',
    'background:transparent!important;background-color:transparent!important;background-image:none!important;color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent .sidebar{background:rgba(255,255,255,.88)!important;border-right:1px solid #e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .mode-bar{background:rgba(255,255,255,.88)!important;border-bottom:1px solid #e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] h1,html[data-theme="light"] h2,html[data-theme="light"] h3,html[data-theme="light"] h4,',
    'html[data-theme="light"] .page-title,html[data-theme="light"] .ticket-card h4,html[data-theme="light"] .ticket-meta,',
    'html[data-theme="light"] .nav-btn,html[data-theme="light"] label,html[data-theme="light"] #logged-user-label,',
    'html[data-theme="light"] .stat-label{color:#1a1a2e!important;-webkit-text-fill-color:#1a1a2e!important;background:none!important}',
    'html[data-theme="light"] .stat-value{color:#4c3fd4!important}',
    'html[data-theme="light"] .nav-btn.active{color:#4c3fd4!important;background:rgba(109,94,245,.12)!important}',
    'html[data-theme="light"] input,html[data-theme="light"] select,html[data-theme="light"] textarea{',
    'background:rgba(247,246,252,.9)!important;color:#1a1a2e!important;border:1px solid #d8d4ec!important}',
    'html[data-theme="light"] #portal-customer .ticket-form,html[data-theme="light"] #customer-form.ticket-form,',
    'html[data-theme="light"] #portal-customer .customer-tabs,html[data-theme="light"] .comment,',
    'html[data-theme="light"] #csat-panel,html[data-theme="light"] .login-card,html[data-theme="light"] .modal-card{',
    'background:rgba(255,255,255,.9)!important;border-color:#e2e0f0!important;color:#1a1a2e!important}',
    '#portal-agent .stat-card,#portal-agent .ticket-card,#portal-agent .agent-badge,',
    '#portal-agent .sidebar-user-card,#portal-agent #dr-status-card,#portal-agent .dr-status-card,',
    '#portal-agent .ticket-detail,#portal-agent .comments-section,#portal-agent .agent-actions,',
    '#portal-agent .attach-panel,#portal-agent .agent-perf,#portal-agent .kb-manage,',
    '#portal-agent .comment,#portal-agent .modal-card,#portal-agent .filters-bar,#portal-agent .filter-bar{',
    'background:rgba(22,22,36,.45)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
    'border-color:rgba(167,139,250,.22)!important}',
    'html[data-theme="light"] #portal-agent .stat-card,html[data-theme="light"] #portal-agent .ticket-card,',
    'html[data-theme="light"] #portal-agent .agent-badge,html[data-theme="light"] #portal-agent .sidebar-user-card,',
    'html[data-theme="light"] #portal-agent #dr-status-card,html[data-theme="light"] #portal-agent .dr-status-card,',
    'html[data-theme="light"] #portal-agent .ticket-detail,html[data-theme="light"] #portal-agent .comments-section,',
    'html[data-theme="light"] #portal-agent .agent-actions,html[data-theme="light"] #portal-agent .attach-panel,',
    'html[data-theme="light"] #portal-agent .agent-perf,html[data-theme="light"] #portal-agent .kb-manage,',
    'html[data-theme="light"] #portal-agent .comment,html[data-theme="light"] #portal-agent .modal-card,',
    'html[data-theme="light"] #portal-agent .filters-bar,html[data-theme="light"] #portal-agent .filter-bar{',
    'background:rgba(255,255,255,.55)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    'border:1px solid rgba(109,94,245,.18)!important;box-shadow:0 2px 14px rgba(91,76,224,.06)!important;color:#1a1a2e!important}',
    '#dr-lifeline{display:block;position:fixed;left:0;right:0;bottom:12%;height:120px;z-index:0;pointer-events:none;overflow:hidden}',
    '#dr-lifeline .dr-line{position:absolute;left:0;top:0;height:120px;width:200%;background-repeat:repeat-x;background-size:400px 120px;background-position:0 50%;opacity:.7;will-change:background-position}',
    'html[data-theme="light"] #dr-lifeline .dr-line{background-image:url("' + lightCol + '");animation:drHbScroll 8s linear infinite;opacity:.65}',
    'html[data-theme="dark"] #dr-lifeline .dr-line,html:not([data-theme="light"]) #dr-lifeline .dr-line{background-image:url("' + darkCol + '");animation:drHbScroll 8s linear infinite;opacity:.55}',
    '@keyframes drHbScroll{0%{background-position:0 50%}100%{background-position:-400px 50%}}',
    '@media (prefers-reduced-motion:reduce){#dr-lifeline .dr-line{animation:none!important}}',
    '#portal-agent,#portal-customer,#login-screen,.mode-bar,.app-shell{position:relative;z-index:1}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function ensureLifeline() {
    var box = document.getElementById(LINE_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = LINE_ID;
      box.setAttribute('aria-hidden', 'true');
      box.innerHTML = '<div class="dr-line"></div>';
      document.body.insertBefore(box, document.body.firstChild);
    } else {
      box.innerHTML = '<div class="dr-line"></div>';
    }
  }

  function tick() {
    injectCss();
    ensureLifeline();
  }

  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setTimeout(tick, 300);
  setTimeout(tick, 1200);
  setTimeout(tick, 2800);
  setInterval(function () { injectCss(); }, 6000);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) setTimeout(tick, 50);
  }, true);

  window.DRLightForce = { refresh: tick };
})();
