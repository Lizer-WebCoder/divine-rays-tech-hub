/**
 * Divine Rays — light/dark: single heartbeat pulse (6s L→R, fade, reset)
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

  var HB_SVG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='100' viewBox='0 0 320 100'%3E%3Cpath fill='none' stroke='%23PURPLE%23' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' d='M0 50 H70 C78 50 82 50 88 42 C94 34 98 22 104 22 C110 22 114 34 120 42 C126 50 130 50 138 50 H160 C168 50 172 50 178 38 C184 26 188 12 194 12 C200 12 204 26 210 38 C216 50 220 50 228 50 H320'/%3E%3C/svg%3E";

  var lightStroke = HB_SVG.replace('%23PURPLE%23', '%236d5ef5');
  var darkStroke = HB_SVG.replace('%23PURPLE%23', '%23a78bfa');

  var CSS = [
    'html[data-theme="light"]{color-scheme:light!important}',
    'html[data-theme="light"],html[data-theme="light"] body{',
    'background:#ffffff!important;background-color:#ffffff!important;',
    'background-image:radial-gradient(ellipse 90% 55% at 50% -12%,rgba(109,94,245,.32),transparent 58%),',
    'radial-gradient(ellipse 55% 45% at 100% 100%,rgba(167,139,250,.16),transparent 50%),',
    'radial-gradient(ellipse 45% 40% at 0% 85%,rgba(124,106,240,.12),transparent 48%)!important;',
    'color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent,html[data-theme="light"] #portal-agent.active,',
    'html[data-theme="light"] #portal-customer,html[data-theme="light"] #portal-customer.active,',
    'html[data-theme="light"] #portal-agent .main,html[data-theme="light"] #portal-agent main.main,',
    'html[data-theme="light"] #portal-customer .main,html[data-theme="light"] .app-shell,',
    'html[data-theme="light"] .login-screen,html[data-theme="light"] #login-screen{',
    'background:transparent!important;background-color:transparent!important;background-image:none!important;color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent .sidebar{background:rgba(255,255,255,.94)!important;border-right:1px solid #e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .mode-bar{background:rgba(255,255,255,.92)!important;border-bottom:1px solid #e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .stat-card,html[data-theme="light"] #portal-agent .stat-card,',
    'html[data-theme="light"] .ticket-card,html[data-theme="light"] #portal-agent .ticket-card,',
    'html[data-theme="light"] #portal-customer .ticket-card{',
    'background:rgba(255,255,255,.95)!important;border:1px solid #e2e0f0!important;color:#1a1a2e!important;',
    'box-shadow:0 2px 12px rgba(91,76,224,.08)!important}',
    'html[data-theme="light"] h1,html[data-theme="light"] h2,html[data-theme="light"] h3,html[data-theme="light"] h4,',
    'html[data-theme="light"] .page-title,html[data-theme="light"] .ticket-card h4,html[data-theme="light"] .ticket-meta,',
    'html[data-theme="light"] .nav-btn,html[data-theme="light"] label,html[data-theme="light"] #logged-user-label,',
    'html[data-theme="light"] .stat-label{color:#1a1a2e!important;-webkit-text-fill-color:#1a1a2e!important;background:none!important}',
    'html[data-theme="light"] .stat-value{color:#4c3fd4!important}',
    'html[data-theme="light"] .nav-btn.active{color:#4c3fd4!important;background:rgba(109,94,245,.12)!important}',
    'html[data-theme="light"] input,html[data-theme="light"] select,html[data-theme="light"] textarea{',
    'background:#f7f6fc!important;color:#1a1a2e!important;border:1px solid #d8d4ec!important}',
    'html[data-theme="light"] #portal-customer .ticket-form,html[data-theme="light"] #customer-form.ticket-form,',
    'html[data-theme="light"] #portal-customer .customer-tabs,html[data-theme="light"] .comment,',
    'html[data-theme="light"] #csat-panel,html[data-theme="light"] .login-card,html[data-theme="light"] .modal-card{',
    'background:rgba(255,255,255,.96)!important;border-color:#e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .badge-open{background:#dbeafe!important;color:#1d4ed8!important}',
    'html[data-theme="light"] .badge-resolved{background:#d1fae5!important;color:#047857!important}',
    'html[data-theme="light"] .badge-medium{background:#fef3c7!important;color:#a16207!important}',
    'html[data-theme="light"] .badge-closed{background:#e5e7eb!important;color:#374151!important}',
    'html[data-theme="light"] .badge-critical,html[data-theme="light"] .badge-high{background:#fee2e2!important;color:#b91c1c!important}',
    '#dr-lifeline{display:block;position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}',
    '#dr-lifeline .dr-line{',
    'position:absolute;left:0;width:100%;height:100px;top:55%;',
    'background-repeat:no-repeat;background-position:left center;background-size:320px 100px;',
    'opacity:0;will-change:transform,opacity}',
    'html[data-theme="light"] #dr-lifeline .dr-line{',
    'background-image:url("' + lightStroke + '");',
    'animation:drHbMove 6s ease-in-out infinite}',
    'html[data-theme="dark"] #dr-lifeline .dr-line,',
    'html:not([data-theme="light"]) #dr-lifeline .dr-line{',
    'background-image:url("' + darkStroke + '");',
    'animation:drHbMove 6s ease-in-out infinite}',
    '@keyframes drHbMove{',
    '0%{transform:translateX(-15%);opacity:0}',
    '8%{opacity:.55}',
    '70%{opacity:.45}',
    '88%{transform:translateX(85%);opacity:.15}',
    '100%{transform:translateX(100%);opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){#dr-lifeline .dr-line{animation:none!important;opacity:.25;transform:none}}',
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
    } else if (!box.querySelector('.dr-line') || box.querySelectorAll('.dr-line').length !== 1) {
      box.innerHTML = '<div class="dr-line"></div>';
    }
  }

  function tick() {
    injectCss();
    ensureLifeline();
  }

  tick();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
  setTimeout(tick, 300);
  setTimeout(tick, 1000);
  setTimeout(tick, 2500);
  setInterval(function () { injectCss(); }, 6000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) {
        setTimeout(tick, 50);
      }
    },
    true
  );

  window.DRLightForce = { refresh: tick };
})();
