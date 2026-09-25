/**
 * Divine Rays — force light mode (white + purple glow + ECG lifeline)
 * Injects CSS + DOM layer last so polish cannot override
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LIGHT_FORCE) return;
  window.__DR_LIGHT_FORCE = 1;

  var CSS_ID = 'dr-light-force-css';
  var LINE_ID = 'dr-lifeline';

  var CSS = [
    'html[data-theme="light"]{color-scheme:light!important}',
    'html[data-theme="light"],',
    'html[data-theme="light"] body{',
    'background:#ffffff!important;background-color:#ffffff!important;',
    'background-image:radial-gradient(ellipse 90% 55% at 50% -12%,rgba(109,94,245,.32),transparent 58%),',
    'radial-gradient(ellipse 55% 45% at 100% 100%,rgba(167,139,250,.16),transparent 50%),',
    'radial-gradient(ellipse 45% 40% at 0% 85%,rgba(124,106,240,.12),transparent 48%)!important;',
    'color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent,',
    'html[data-theme="light"] #portal-agent.active,',
    'html[data-theme="light"] #portal-customer,',
    'html[data-theme="light"] #portal-customer.active,',
    'html[data-theme="light"] #portal-agent .main,',
    'html[data-theme="light"] #portal-agent main.main,',
    'html[data-theme="light"] #portal-customer .main,',
    'html[data-theme="light"] .app-shell,',
    'html[data-theme="light"] .login-screen,',
    'html[data-theme="light"] #login-screen{',
    'background:transparent!important;background-color:transparent!important;',
    'background-image:none!important;color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent .sidebar{',
    'background:rgba(255,255,255,.94)!important;border-right:1px solid #e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .mode-bar{',
    'background:rgba(255,255,255,.92)!important;border-bottom:1px solid #e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .stat-card,',
    'html[data-theme="light"] #portal-agent .stat-card,',
    'html[data-theme="light"] .ticket-card,',
    'html[data-theme="light"] #portal-agent .ticket-card,',
    'html[data-theme="light"] #portal-customer .ticket-card{',
    'background:rgba(255,255,255,.95)!important;border:1px solid #e2e0f0!important;color:#1a1a2e!important;',
    'box-shadow:0 2px 12px rgba(91,76,224,.08)!important}',
    'html[data-theme="light"] h1,html[data-theme="light"] h2,html[data-theme="light"] h3,html[data-theme="light"] h4,',
    'html[data-theme="light"] .page-title,html[data-theme="light"] .ticket-card h4,',
    'html[data-theme="light"] .ticket-meta,html[data-theme="light"] .nav-btn,html[data-theme="light"] label,',
    'html[data-theme="light"] #logged-user-label,html[data-theme="light"] .stat-label{',
    'color:#1a1a2e!important;-webkit-text-fill-color:#1a1a2e!important;background:none!important}',
    'html[data-theme="light"] .stat-value{color:#4c3fd4!important}',
    'html[data-theme="light"] .nav-btn.active{color:#4c3fd4!important;background:rgba(109,94,245,.12)!important}',
    'html[data-theme="light"] input,html[data-theme="light"] select,html[data-theme="light"] textarea{',
    'background:#f7f6fc!important;color:#1a1a2e!important;border:1px solid #d8d4ec!important}',
    'html[data-theme="light"] #portal-customer .ticket-form,',
    'html[data-theme="light"] #customer-form.ticket-form,',
    'html[data-theme="light"] #portal-customer .customer-tabs,',
    'html[data-theme="light"] .comment,html[data-theme="light"] #csat-panel,',
    'html[data-theme="light"] .login-card,html[data-theme="light"] .modal-card{',
    'background:rgba(255,255,255,.96)!important;border-color:#e2e0f0!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .badge-open{background:#dbeafe!important;color:#1d4ed8!important}',
    'html[data-theme="light"] .badge-resolved{background:#d1fae5!important;color:#047857!important}',
    'html[data-theme="light"] .badge-medium{background:#fef3c7!important;color:#a16207!important}',
    'html[data-theme="light"] .badge-closed{background:#e5e7eb!important;color:#374151!important}',
    'html[data-theme="light"] .badge-critical,html[data-theme="light"] .badge-high{background:#fee2e2!important;color:#b91c1c!important}',
    '#dr-lifeline{display:none;position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}',
    'html[data-theme="light"] #dr-lifeline{display:block}',
    '#dr-lifeline .dr-line{position:absolute;left:0;right:0;height:120px;opacity:.5;background-repeat:repeat-x;background-size:480px 120px}',
    '#dr-lifeline .dr-line-a{top:68%;opacity:.55;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'480\' height=\'120\' viewBox=\'0 0 480 120\'%3E%3Cpath fill=\'none\' stroke=\'%236d5ef5\' stroke-width=\'2.4\' stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M0 60 H40 L52 60 L64 18 L76 102 L88 36 L100 60 H160 L172 60 L184 24 L196 96 L208 44 L220 60 H300 L312 60 L324 14 L336 106 L348 32 L360 60 H420 L432 60 L444 28 L456 92 L468 48 L480 60\'/%3E%3C/svg%3E");animation:drLfA 16s linear infinite}',
    '#dr-lifeline .dr-line-b{top:22%;opacity:.28;height:100px;background-size:560px 100px;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'560\' height=\'100\' viewBox=\'0 0 560 100\'%3E%3Cpath fill=\'none\' stroke=\'%239b8afb\' stroke-width=\'1.8\' stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M0 50 H60 L74 50 L88 12 L102 88 L116 28 L130 50 H240 L254 50 L268 16 L282 84 L296 34 L310 50 H420 L434 50 L448 10 L462 90 L476 26 L490 50 H560\'/%3E%3C/svg%3E");animation:drLfB 22s linear infinite}',
    '@keyframes drLfA{from{background-position:0 0}to{background-position:-480px 0}}',
    '@keyframes drLfB{from{background-position:0 0}to{background-position:560px 0}}',
    '@media (prefers-reduced-motion:reduce){#dr-lifeline .dr-line{animation:none!important}}',
    'html[data-theme="light"] #portal-agent,html[data-theme="light"] #portal-customer,html[data-theme="light"] #login-screen,html[data-theme="light"] .mode-bar{position:relative;z-index:1}'
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
      box.innerHTML = '<div class="dr-line dr-line-a"></div><div class="dr-line dr-line-b"></div>';
      document.body.insertBefore(box, document.body.firstChild);
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
  setInterval(function () { injectCss(); }, 4000);

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
