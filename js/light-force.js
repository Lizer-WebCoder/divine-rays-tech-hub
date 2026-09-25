/**
 * Divine Rays — light tech-support background + safe pulse lifeline
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

  var TECH =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M40 0H0V40' fill='none' stroke='%237c6af0' stroke-width='0.5' opacity='0.12'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='160' height='160' fill='url(%23g)'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%237c6af0' opacity='0.2'/%3E%3Ccircle cx='100' cy='60' r='1.5' fill='%235b4ce0' opacity='0.18'/%3E%3Ccircle cx='140' cy='120' r='2' fill='%237c6af0' opacity='0.16'/%3E%3Ccircle cx='60' cy='140' r='1.5' fill='%235b4ce0' opacity='0.15'/%3E%3Cpath d='M20 20h24M100 60h28M60 140h20' stroke='%237c6af0' stroke-width='0.8' opacity='0.12'/%3E%3C/svg%3E";

  var CSS = [
    'html[data-theme="light"]{color-scheme:light!important}',
    'html[data-theme="light"],html[data-theme="light"] body{',
    'background-color:#eef0f8!important;',
    'background-image:',
    'radial-gradient(ellipse 90% 50% at 10% 0%,rgba(124,106,240,0.18),transparent 55%),',
    'radial-gradient(ellipse 60% 45% at 100% 20%,rgba(91,76,224,0.12),transparent 50%),',
    'radial-gradient(ellipse 50% 40% at 50% 100%,rgba(167,139,250,0.1),transparent 50%),',
    'url("' + TECH + '")!important;',
    'background-size:auto,auto,auto,160px 160px!important;',
    'background-attachment:fixed!important;',
    'color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent,html[data-theme="light"] #portal-agent.active{',
    'background-color:transparent!important;background-image:none!important;color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent .main,html[data-theme="light"] #portal-agent main.main{background:transparent!important}',
    'html[data-theme="light"] #portal-agent .sidebar{background:rgba(255,255,255,0.88)!important;border-right:1px solid #e0def0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .mode-bar{background:rgba(255,255,255,0.92)!important;border-bottom:1px solid #e0def0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] h1,html[data-theme="light"] h2,html[data-theme="light"] h3,',
    'html[data-theme="light"] .page-title,html[data-theme="light"] .nav-btn,',
    'html[data-theme="light"] label,html[data-theme="light"] #logged-user-label{',
    'color:#1a1a2e!important;-webkit-text-fill-color:#1a1a2e!important}',
    'html[data-theme="light"] .nav-btn.active{color:#4c3fd4!important;background:rgba(109,94,245,0.12)!important}',
    'html[data-theme="light"] input,html[data-theme="light"] select,html[data-theme="light"] textarea{',
    'background:rgba(255,255,255,0.9)!important;color:#1a1a2e!important;border:1px solid #d4d0ea!important}',
    'html[data-theme="light"] #portal-customer,html[data-theme="light"] #portal-customer.active{',
    'background:transparent!important;color:#1a1a2e!important}',
    '#dr-lifeline{display:block;position:fixed;left:0;right:0;top:50%;height:100px;margin-top:-50px;z-index:0;pointer-events:none!important;overflow:hidden}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline .dr-line{position:absolute;left:0;top:0;width:100%;height:100px;background-repeat:repeat-x;background-size:480px 100px;background-position:center center;opacity:.4}',
    'html[data-theme="light"] #dr-lifeline .dr-line{background-image:url("' + lightCol + '");animation:drHbPulse 2.4s ease-in-out infinite}',
    'html[data-theme="dark"] #dr-lifeline .dr-line,html:not([data-theme="light"]) #dr-lifeline .dr-line{background-image:url("' + darkCol + '");animation:drHbPulse 2.4s ease-in-out infinite}',
    '@keyframes drHbPulse{0%,100%{opacity:.25}12%{opacity:.7}24%{opacity:.35}36%{opacity:.65}50%{opacity:.3}}',
    '#portal-agent.active{pointer-events:auto!important;position:relative;z-index:2}',
    '#portal-agent.active .sidebar,#portal-agent.active .main{pointer-events:auto!important;position:relative;z-index:3}',
    '#portal-agent button,#portal-agent .nav-btn,#portal-agent select,#portal-agent input,#portal-agent a{pointer-events:auto!important}',
    '.mode-bar{z-index:400!important;pointer-events:auto!important}',
    '#login-screen.is-hidden,#login-screen[hidden]{display:none!important;pointer-events:none!important}'
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
  setInterval(injectCss, 6000);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) setTimeout(tick, 50);
  }, true);

  window.DRLightForce = { refresh: tick };
})();
