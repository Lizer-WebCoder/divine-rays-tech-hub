/**
 * Divine Rays — light admin tech bg + centered heartbeat (pulse, not slide)
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
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='100' viewBox='0 0 480 100'%3E%3Cpath fill='none' stroke='%23COL%23' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' d='M0 50 H80 L88 50 L96 38 L104 50 H140 L148 50 L156 12 L164 88 L172 44 L180 50 H240 L248 50 L256 36 L264 50 H300 L308 50 L316 16 L324 84 L332 46 L340 50 H400 L408 50 L416 40 L424 50 H480'/%3E%3C/svg%3E";

  var lightCol = HB.replace('%23COL%23', '%235b4ce0');
  var darkCol = HB.replace('%23COL%23', '%23a78bfa');

  var TECH_BG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%237c6af0' opacity='0.18'/%3E%3Ccircle cx='60' cy='40' r='1.2' fill='%237c6af0' opacity='0.14'/%3E%3Ccircle cx='100' cy='25' r='1.5' fill='%237c6af0' opacity='0.16'/%3E%3Ccircle cx='40' cy='80' r='1.2' fill='%237c6af0' opacity='0.12'/%3E%3Ccircle cx='90' cy='90' r='1.5' fill='%237c6af0' opacity='0.15'/%3E%3Cpath d='M20 20h18M60 40h22M40 80h20' stroke='%237c6af0' stroke-width='0.6' opacity='0.1'/%3E%3C/svg%3E";

  var CSS = [
    'html[data-theme="light"]{color-scheme:light!important}',
    'html[data-theme="light"],html[data-theme="light"] body{',
    'background:#f6f5fc!important;background-color:#f6f5fc!important;',
    'background-image:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(109,94,245,.22),transparent 55%),',
    'radial-gradient(ellipse 40% 35% at 100% 100%,rgba(167,139,250,.1),transparent 50%)!important;',
    'color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent,html[data-theme="light"] #portal-agent.active{',
    'background-color:#f4f2fb!important;',
    'background-image:',
    'radial-gradient(ellipse 70% 45% at 15% 10%,rgba(124,106,240,.16),transparent 50%),',
    'radial-gradient(ellipse 50% 40% at 90% 80%,rgba(91,76,224,.1),transparent 45%),',
    'linear-gradient(180deg,rgba(255,255,255,.5),rgba(246,245,252,.85)),',
    'url("' + TECH_BG + '")!important;',
    'background-size:auto,auto,auto,120px 120px!important;',
    'background-repeat:no-repeat,no-repeat,no-repeat,repeat!important;',
    'color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent .main,html[data-theme="light"] #portal-agent main.main{background:transparent!important}',
    'html[data-theme="light"] #portal-customer,html[data-theme="light"] #portal-customer.active,',
    'html[data-theme="light"] #portal-customer .main,html[data-theme="light"] .app-shell,',
    'html[data-theme="light"] .login-screen,html[data-theme="light"] #login-screen{',
    'background:transparent!important;background-color:transparent!important;color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent .sidebar{background:rgba(255,255,255,.82)!important;border-right:1px solid #e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .mode-bar{background:rgba(255,255,255,.9)!important;border-bottom:1px solid #e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] h1,html[data-theme="light"] h2,html[data-theme="light"] h3,html[data-theme="light"] h4,',
    'html[data-theme="light"] .page-title,html[data-theme="light"] .ticket-card h4,html[data-theme="light"] .ticket-meta,',
    'html[data-theme="light"] .nav-btn,html[data-theme="light"] label,html[data-theme="light"] #logged-user-label,',
    'html[data-theme="light"] .stat-label{color:#1a1a2e!important;-webkit-text-fill-color:#1a1a2e!important;background:none!important}',
    'html[data-theme="light"] .stat-value{color:#4c3fd4!important}',
    'html[data-theme="light"] .nav-btn.active{color:#4c3fd4!important;background:rgba(109,94,245,.12)!important}',
    'html[data-theme="light"] input,html[data-theme="light"] select,html[data-theme="light"] textarea{',
    'background:rgba(255,255,255,.9)!important;color:#1a1a2e!important;border:1px solid #d8d4ec!important}',
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
    'background:rgba(255,255,255,.58)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    'border:1px solid rgba(109,94,245,.16)!important;box-shadow:0 2px 14px rgba(91,76,224,.06)!important;color:#1a1a2e!important}',
    '#dr-lifeline{display:block;position:fixed;left:0;right:0;top:50%;height:100px;margin-top:-50px;z-index:0;pointer-events:none;overflow:hidden}',
    '#dr-lifeline .dr-line{position:absolute;left:0;top:0;width:100%;height:100px;background-repeat:repeat-x;background-size:480px 100px;background-position:center center;opacity:.5;transform-origin:center center;will-change:opacity,filter}',
    'html[data-theme="light"] #dr-lifeline .dr-line{background-image:url("' + lightCol + '");animation:drHbPulse 2.4s ease-in-out infinite}',
    'html[data-theme="dark"] #dr-lifeline .dr-line,html:not([data-theme="light"]) #dr-lifeline .dr-line{background-image:url("' + darkCol + '");animation:drHbPulse 2.4s ease-in-out infinite}',
    '@keyframes drHbPulse{0%,100%{opacity:.28;filter:drop-shadow(0 0 0 transparent)}12%{opacity:.75;filter:drop-shadow(0 0 6px rgba(109,94,245,.55))}24%{opacity:.4;filter:drop-shadow(0 0 2px rgba(109,94,245,.25))}36%{opacity:.7;filter:drop-shadow(0 0 5px rgba(109,94,245,.45))}50%{opacity:.32}}',
    '@media (prefers-reduced-motion:reduce){#dr-lifeline .dr-line{animation:none!important;opacity:.35}}',
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
  setTimeout(tick, 2500);
  setInterval(function () { injectCss(); }, 6000);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) setTimeout(tick, 50);
  }, true);

  window.DRLightForce = { refresh: tick };
})();
