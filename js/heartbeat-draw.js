/**
 * Divine Rays — heartbeat draws left→right (not slide, not blink-only)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW) return;
  window.__DR_HEARTBEAT_DRAW = 1;

  var CSS_ID = 'dr-heartbeat-draw';
  var LINE_ID = 'dr-lifeline';

  var HB =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='100' viewBox='0 0 480 100'%3E%3Cpath fill='none' stroke='%23COL%23' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' d='M0 50 H80 L88 50 L96 38 L104 50 H140 L148 50 L156 12 L164 88 L172 44 L180 50 H240 L248 50 L256 36 L264 50 H300 L308 50 L316 16 L324 84 L332 46 L340 50 H400 L408 50 L416 40 L424 50 H480'/%3E%3C/svg%3E";
  var lightCol = HB.replace('%23COL%23', '%235b4ce0');
  var darkCol = HB.replace('%23COL%23', '%23a78bfa');

  var CSS = [
    '#dr-lifeline{',
    'display:block!important;position:fixed!important;left:0!important;right:0!important;',
    'top:50%!important;height:100px!important;margin-top:-50px!important;',
    'z-index:0!important;pointer-events:none!important;overflow:hidden!important}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline .dr-line{',
    'position:absolute;left:0;top:0;width:100%;height:100px;',
    'background-repeat:repeat-x;background-size:480px 100px;background-position:left center;',
    'transform-origin:left center;will-change:clip-path,opacity}',
    'html[data-theme="light"] #dr-lifeline .dr-line{',
    'background-image:url("' + lightCol + '");',
    'animation:drHbDraw 6.5s ease-in-out infinite}',
    'html[data-theme="dark"] #dr-lifeline .dr-line,',
    'html:not([data-theme="light"]) #dr-lifeline .dr-line{',
    'background-image:url("' + darkCol + '");',
    'animation:drHbDraw 6.5s ease-in-out infinite}',
    '@keyframes drHbDraw{',
    '0%{clip-path:inset(0 100% 0 0);opacity:0.2}',
    '8%{opacity:0.55}',
    '55%{clip-path:inset(0 0% 0 0);opacity:0.6}',
    '75%{clip-path:inset(0 0% 0 0);opacity:0.45}',
    '92%{clip-path:inset(0 0% 0 0);opacity:0.12}',
    '100%{clip-path:inset(0 100% 0 0);opacity:0.05}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '#dr-lifeline .dr-line{animation:none!important;clip-path:none!important;opacity:0.35}',
    '}'
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

  function ensureLine() {
    var box = document.getElementById(LINE_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = LINE_ID;
      box.setAttribute('aria-hidden', 'true');
      box.innerHTML = '<div class="dr-line"></div>';
      document.body.insertBefore(box, document.body.firstChild);
    } else if (!box.querySelector('.dr-line')) {
      box.innerHTML = '<div class="dr-line"></div>';
    }
  }

  function tick() {
    inject();
    ensureLine();
  }

  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setTimeout(tick, 400);
  setTimeout(tick, 1500);
  setInterval(inject, 8000);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) setTimeout(tick, 50);
  }, true);

  window.DRHeartbeatDraw = { refresh: tick };
})();
