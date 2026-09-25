/**
 * Divine Rays — single center ECG monitor lifeline (continuous draw, no blink)
 * Credit: Lizzz · All Rights Reserved
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
    'M0 50 H40 L48 50 L54 42 L60 50 H90 L96 50 L102 18 L108 82 L114 38 L120 50 ' +
    'H160 L166 50 L172 44 L178 50 H210 L216 50 L222 20 L228 80 L234 40 L240 50 ' +
    'H280 L286 50 L292 45 L298 50 H330 L336 50 L342 16 L348 84 L354 36 L360 50 ' +
    'H400 L406 50 L412 43 L418 50 H450 L456 50 L462 22 L468 78 L474 42 L480 50 H520';

  function svgMarkup(stroke) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 100" preserveAspectRatio="none" ' +
      'width="100%" height="100%" style="display:block">' +
      '<path class="dr-ecg-path" fill="none" stroke="' +
      stroke +
      '" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" ' +
      'd="' +
      PATH +
      '"/>' +
      '</svg>'
    );
  }

  var CSS = [
    '#dr-lifeline{',
    'display:block!important;position:fixed!important;',
    'left:4%!important;right:4%!important;width:92%!important;',
    'top:50%!important;height:140px!important;margin-top:-70px!important;',
    'z-index:0!important;pointer-events:none!important;overflow:visible!important}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline svg{width:100%;height:100%;display:block}',
    '#dr-lifeline .dr-ecg-path{',
    'stroke-dasharray:900;',
    'stroke-dashoffset:900;',
    'animation:drEcgSweep 4.5s linear infinite}',
    'html[data-theme="light"] #dr-lifeline .dr-ecg-path{',
    'filter:drop-shadow(0 0 4px rgba(91,76,224,0.55))}',
    'html[data-theme="dark"] #dr-lifeline .dr-ecg-path,',
    'html:not([data-theme="light"]) #dr-lifeline .dr-ecg-path{',
    'filter:drop-shadow(0 0 6px rgba(167,139,250,0.65))}',
    '@keyframes drEcgSweep{',
    '0%{stroke-dashoffset:900}',
    '100%{stroke-dashoffset:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '#dr-lifeline .dr-ecg-path{animation:none!important;stroke-dashoffset:0!important;opacity:0.4}',
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

  function strokeColor() {
    var light =
      document.documentElement.getAttribute('data-theme') === 'light' ||
      (function () {
        try {
          return localStorage.getItem('dr_theme') === 'light';
        } catch (e) {
          return false;
        }
      })();
    return light ? '#5b4ce0' : '#c4b5fd';
  }

  function ensureLine() {
    var box = document.getElementById(LINE_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = LINE_ID;
      box.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(box, document.body.firstChild);
    }
    box.innerHTML = svgMarkup(strokeColor());
  }

  function tick() {
    injectCss();
    ensureLine();
  }

  tick();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
  setTimeout(tick, 400);
  setTimeout(tick, 1500);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) {
        setTimeout(tick, 40);
      }
    },
    true
  );

  window.DRHeartbeatDraw = { refresh: tick };
})();
