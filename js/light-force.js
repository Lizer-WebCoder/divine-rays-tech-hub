/**
 * Divine Rays — admin tech light bg + centered pulse + clickable UI
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LIGHT_FORCE) { try { delete window.__DR_LIGHT_FORCE; } catch (e) {} }
  window.__DR_LIGHT_FORCE = 1;

  var CSS_ID = 'dr-light-force-css';
  var LINE_ID = 'dr-lifeline';

  var HB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='100' viewBox='0 0 480 100'%3E%3Cpath fill='none' stroke='%23COL%23' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' d='M0 50 H80 L88 50 L96 38 L104 50 H140 L148 50 L156 12 L164 88 L172 44 L180 50 H240 L248 50 L256 36 L264 50 H300 L308 50 L316 16 L324 84 L332 46 L340 50 H400 L408 50 L416 40 L424 50 H480'/%3E%3C/svg%3E";
  var lightCol = HB.replace('%23COL%23', '%235b4ce0');
  var darkCol = HB.replace('%23COL%23', '%23a78bfa');
  var TECH_BG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%237c6af0' opacity='0.18'/%3E%3Ccircle cx='60' cy='40' r='1.2' fill='%237c6af0' opacity='0.14'/%3E%3Ccircle cx='100' cy='25' r='1.5' fill='%237c6af0' opacity='0.16'/%3E%3Ccircle cx='40' cy='80' r='1.2' fill='%237c6af0' opacity='0.12'/%3E%3Ccircle cx='90' cy='90' r='1.5' fill='%237c6af0' opacity='0.15'/%3E%3C/svg%3E";

  var CSS = [
    'html[data-theme="light"]{color-scheme:light!important}',
    'html[data-theme="light"],html[data-theme="light"] body{background:#f6f5fc!important;color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent,html[data-theme="light"] #portal-agent.active{',
    'background-color:#f4f2fb!important;',
    'background-image:radial-gradient(ellipse 70% 45% at 15% 10%,rgba(124,106,240,.16),transparent 50%),',
    'radial-gradient(ellipse 50% 40% at 90% 80%,rgba(91,76,224,.1),transparent 45%),url("' + TECH_BG + '")!important;',
    'background-size:auto,auto,120px 120px!important;background-repeat:no-repeat,no-repeat,repeat!important;color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent .main,html[data-theme="light"] #portal-agent main.main{background:transparent!important}',
    'html[data-theme="light"] #portal-agent .sidebar{background:rgba(255,255,255,.9)!important;border-right:1px solid #e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .mode-bar{background:rgba(255,255,255,.95)!important;border-bottom:1px solid #e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] h1,html[data-theme="light"] h2,html[data-theme="light"] h3,html[data-theme="light"] h4,',
    'html[data-theme="light"] .page-title,html[data-theme="light"] .ticket-card h4,html[data-theme="light"] .ticket-meta,',
    'html[data-theme="light"] .nav-btn,html[data-theme="light"] label,html[data-theme="light"] #logged-user-label,',
    'html[data-theme="light"] .stat-label{color:#1a1a2e!important;-webkit-text-fill-color:#1a1a2e!important}',
    'html[data-theme="light"] .stat-value{color:#4c3fd4!important}',
    'html[data-theme="light"] .nav-btn.active{color:#4c3fd4!important;background:rgba(109,94,245,.12)!important}',
    'html[data-theme="light"] input,html[data-theme="light"] select,html[data-theme="light"] textarea{',
    'background:#fff!important;color:#1a1a2e!important;border:1px solid #d8d4ec!important}',
    'html[data-theme="light"] #portal-agent .stat-card,html[data-theme="light"] #portal-agent .ticket-card{',
    'background:rgba(255,255,255,.9)!important;border:1px solid rgba(109,94,245,.16)!important;color:#1a1a2e!important;opacity:1!important}',
    '#portal-agent .stat-card,#portal-agent .ticket-card{opacity:1!important}',
    '#dr-lifeline{display:block;position:fixed;left:0;right:0;top:50%;height:100px;margin-top:-50px;z-index:0;pointer-events:none!important;overflow:hidden}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline .dr-line{position:absolute;left:0;top:0;width:100%;height:100px;background-repeat:repeat-x;background-size:480px 100px;background-position:center center;opacity:.45}',
    'html[data-theme="light"] #dr-lifeline .dr-line{background-image:url("' + lightCol + '");animation:drHbPulse 2.4s ease-in-out infinite}',
    'html[data-theme="dark"] #dr-lifeline .dr-line,html:not([data-theme="light"]) #dr-lifeline .dr-line{background-image:url("' + darkCol + '");animation:drHbPulse 2.4s ease-in-out infinite}',
    '@keyframes drHbPulse{0%,100%{opacity:.28}12%{opacity:.75}24%{opacity:.4}36%{opacity:.7}50%{opacity:.32}}',
    '#portal-agent.active{pointer-events:auto!important;z-index:5!important;position:relative}',
    '#portal-agent.active .sidebar,#portal-agent.active .main,#portal-agent.active main.main{pointer-events:auto!important;z-index:6!important;position:relative}',
    '#portal-agent button,#portal-agent .nav-btn,#portal-agent select,#portal-agent input,#portal-agent a,#portal-agent .ticket-card,#portal-agent .stat-card{pointer-events:auto!important;opacity:1!important}',
    '.mode-bar{z-index:400!important;pointer-events:auto!important}',
    '#login-screen.is-hidden,#login-screen[hidden]{display:none!important;pointer-events:none!important;z-index:-1!important}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) { el = document.createElement('style'); el.id = CSS_ID; document.head.appendChild(el); }
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
    } else { box.innerHTML = '<div class="dr-line"></div>'; }
  }
  function tick() { injectCss(); ensureLifeline(); }
  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setTimeout(tick, 300); setTimeout(tick, 1200); setTimeout(tick, 2500);
  setInterval(injectCss, 6000);
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) setTimeout(tick, 50);
  }, true);
  window.DRLightForce = { refresh: tick };
})();
