/**
 * Divine Rays — same ECG in light + dark (draw L→R, fade, restart)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW) {
    try { delete window.__DR_HEARTBEAT_DRAW; } catch (e) {}
  }
  window.__DR_HEARTBEAT_DRAW = 1;

  var CSS_ID = 'dr-heartbeat-draw';
  var LINE_ID = 'dr-lifeline';

  var PATH =
    'M0 50 ' +
    'H30 L42 50 L55 12 L68 88 L78 50 H120 ' +
    'L132 50 L145 18 L158 82 L168 50 H210 ' +
    'L222 50 L235 10 L248 90 L258 50 H300 ' +
    'L312 50 L325 20 L338 80 L348 50 H390 ' +
    'L402 50 L415 14 L428 86 L438 50 H480 ' +
    'L492 50 L505 22 L518 78 L528 50 H560 ' +
    'L572 50 L585 16 L598 84 L608 50 H640 ' +
    'L652 50 L665 12 L678 88 L688 50 H720';

  var STROKE = 'rgba(196,181,253,0.9)';

  function svgMarkup() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 100" preserveAspectRatio="none" ' +
      'width="100%" height="100%" style="display:block;overflow:visible">' +
      '<path class="dr-ecg-draw" fill="none" stroke="' +
      STROKE +
      '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" d="' +
      PATH +
      '"/>' +
      '</svg>'
    );
  }

  var CSS = [
    '#dr-lifeline{',
    'display:block!important;position:fixed!important;',
    'left:0!important;right:0!important;width:100%!important;',
    'top:42%!important;height:160px!important;margin-top:-80px!important;',
    'z-index:0!important;pointer-events:none!important;overflow:hidden!important}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline svg{width:100%;height:100%;display:block}',
    '#dr-lifeline .dr-ecg-draw{',
    'stroke-dasharray:1200;',
    'stroke-dashoffset:1200;',
    'animation:drEcgDrawFade 6s ease-in-out infinite;',
    'filter:drop-shadow(0 0 8px rgba(167,139,250,0.7)) drop-shadow(0 0 16px rgba(124,106,240,0.45))}',
    '@keyframes drEcgDrawFade{',
    '0%{stroke-dashoffset:1200;opacity:0.15}',
    '8%{opacity:0.85}',
    '55%{stroke-dashoffset:0;opacity:0.9}',
    '70%{stroke-dashoffset:0;opacity:0.85}',
    '88%{stroke-dashoffset:0;opacity:0}',
    '100%{stroke-dashoffset:1200;opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '#dr-lifeline .dr-ecg-draw{animation:none!important;stroke-dashoffset:0!important;opacity:0.4}',
    '}'
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

  function ensureLine() {
    var box = document.getElementById(LINE_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = LINE_ID;
      box.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(box, document.body.firstChild);
    }
    box.innerHTML = svgMarkup();
  }

  function tick() {
    injectCss();
    ensureLine();
  }

  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setTimeout(tick, 400);
  setTimeout(tick, 1500);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) setTimeout(tick, 40);
  }, true);

  window.DRHeartbeatDraw = { refresh: tick };
})();
