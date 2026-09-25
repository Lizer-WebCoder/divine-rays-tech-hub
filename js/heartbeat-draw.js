/**
 * Divine Rays — ECG life line with multiple patterns (purple glow)
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

  // Patterns inspired by classic ECG shapes (viewBox 0 0 720 100, baseline y=50)
  var PATTERNS = [
    // 1 — Classic QRS (top-left of reference)
    'M0 50 H40 L50 50 L58 42 L65 50 L78 8 L92 92 L105 50 H160 ' +
    'L170 50 L178 42 L185 50 L198 10 L212 90 L225 50 H280 ' +
    'L290 50 L298 42 L305 50 L318 6 L332 94 L345 50 H400 ' +
    'L410 50 L418 42 L425 50 L438 12 L452 88 L465 50 H520 ' +
    'L530 50 L538 42 L545 50 L558 8 L572 92 L585 50 H640 ' +
    'L650 50 L658 42 L665 50 L678 10 L692 90 L705 50 H720',

    // 2 — Double P + tall R (top-right)
    'M0 50 H35 L42 48 L48 50 L55 40 L62 50 L72 5 L88 95 L100 50 H150 ' +
    'L157 48 L163 50 L170 40 L177 50 L187 8 L203 92 L215 50 H265 ' +
    'L272 48 L278 50 L285 40 L292 50 L302 6 L318 94 L330 50 H380 ' +
    'L387 48 L393 50 L400 40 L407 50 L417 10 L433 90 L445 50 H495 ' +
    'L502 48 L508 50 L515 40 L522 50 L532 5 L548 95 L560 50 H610 ' +
    'L617 48 L623 50 L630 40 L637 50 L647 8 L663 92 L675 50 H720',

    // 3 — Multi-wave with secondary peaks (middle-left)
    'M0 50 H30 L38 45 L45 50 L52 38 L60 50 L70 12 L82 50 L90 35 L100 88 L112 50 L122 40 L132 50 H180 ' +
    'L188 45 L195 50 L202 38 L210 50 L220 10 L232 50 L240 35 L250 90 L262 50 L272 40 L282 50 H330 ' +
    'L338 45 L345 50 L352 38 L360 50 L370 8 L382 50 L390 35 L400 92 L412 50 L422 40 L432 50 H480 ' +
    'L488 45 L495 50 L502 38 L510 50 L520 12 L532 50 L540 35 L550 88 L562 50 L572 40 L582 50 H630 ' +
    'L638 45 L645 50 L652 38 L660 50 L670 10 L682 50 L690 35 L700 90 L712 50 H720',

    // 4 — Sharp multi-spike (middle-right)
    'M0 50 H40 L50 50 L58 30 L65 50 L75 5 L85 50 L92 25 L100 95 L110 50 L118 30 L125 50 H175 ' +
    'L185 50 L193 30 L200 50 L210 8 L220 50 L227 25 L235 92 L245 50 L253 30 L260 50 H310 ' +
    'L320 50 L328 30 L335 50 L345 6 L355 50 L362 25 L370 94 L380 50 L388 30 L395 50 H445 ' +
    'L455 50 L463 30 L470 50 L480 10 L490 50 L497 25 L505 90 L515 50 L523 30 L530 50 H580 ' +
    'L590 50 L598 30 L605 50 L615 5 L625 50 L632 25 L640 95 L650 50 L658 30 L665 50 H720',

    // 5 — Dense irregular spikes (bottom-left)
    'M0 50 H25 L32 40 L38 50 L45 28 L52 50 L58 15 L65 50 L72 35 L80 5 L88 95 L96 50 L102 20 L110 50 L118 30 L125 8 L132 50 H180 ' +
    'L187 40 L193 50 L200 28 L207 50 L213 15 L220 50 L227 35 L235 5 L243 95 L251 50 L257 20 L265 50 L273 30 L280 8 L287 50 H335 ' +
    'L342 40 L348 50 L355 28 L362 50 L368 15 L375 50 L382 35 L390 5 L398 95 L406 50 L412 20 L420 50 L428 30 L435 8 L442 50 H490 ' +
    'L497 40 L503 50 L510 28 L517 50 L523 15 L530 50 L537 35 L545 5 L553 95 L561 50 L567 20 L575 50 L583 30 L590 8 L597 50 H645 ' +
    'L652 40 L658 50 L665 28 L672 50 L678 15 L685 50 L692 35 L700 5 L708 95 L715 50 H720',

    // 6 — Complex with deep terminal V (bottom-right)
    'M0 50 H35 L42 42 L50 50 L58 35 L68 50 L78 8 L90 50 L98 30 L108 95 L120 50 L130 40 L140 50 H190 ' +
    'L198 42 L206 50 L214 35 L224 50 L234 10 L246 50 L254 30 L264 92 L276 50 L286 40 L296 50 H346 ' +
    'L354 42 L362 50 L370 35 L380 50 L390 6 L402 50 L410 30 L420 94 L432 50 L442 40 L452 50 H502 ' +
    'L510 42 L518 50 L526 35 L536 50 L546 12 L558 50 L566 30 L576 90 L588 50 L598 40 L608 50 H658 ' +
    'L666 42 L674 50 L682 35 L692 50 L702 8 L712 50 L718 95 L720 50'
  ];

  var STROKE = 'rgba(196,181,253,0.95)';
  var patternIndex = 0;

  function svgMarkup(pathD) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 100" preserveAspectRatio="none" ' +
      'width="100%" height="100%" style="display:block;overflow:visible">' +
      '<path class="dr-ecg-draw" fill="none" stroke="' + STROKE + '" ' +
      'stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" d="' + pathD + '"/>' +
      '</svg>'
    );
  }

  var CSS = [
    '#dr-lifeline{',
    'display:block!important;position:fixed!important;',
    'left:0!important;right:0!important;width:100%!important;',
    'top:38%!important;height:180px!important;margin-top:-90px!important;',
    'z-index:1!important;pointer-events:none!important;overflow:visible!important;',
    'opacity:1!important;visibility:visible!important}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline svg{width:100%;height:100%;display:block;overflow:visible}',
    '#dr-lifeline .dr-ecg-draw{',
    'stroke-dasharray:1400;',
    'stroke-dashoffset:1400;',
    'animation:drEcgDrawFade 5.5s ease-in-out infinite;',
    'filter:drop-shadow(0 0 6px rgba(196,181,253,0.9)) drop-shadow(0 0 14px rgba(124,106,240,0.65)) drop-shadow(0 0 28px rgba(124,106,240,0.35))}',
    '@keyframes drEcgDrawFade{',
    '0%{stroke-dashoffset:1400;opacity:0.2}',
    '6%{opacity:0.95}',
    '50%{stroke-dashoffset:0;opacity:1}',
    '65%{stroke-dashoffset:0;opacity:0.9}',
    '85%{stroke-dashoffset:0;opacity:0}',
    '100%{stroke-dashoffset:1400;opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '#dr-lifeline .dr-ecg-draw{animation:none!important;stroke-dashoffset:0!important;opacity:0.5}',
    '}',
    '#login-screen .login-card{position:relative;z-index:2}',
    '#login-screen{position:relative;z-index:1}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function ensureLine() {
    var box = document.getElementById(LINE_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = LINE_ID;
      box.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(box, document.body.firstChild);
    }
    var pathD = PATTERNS[patternIndex % PATTERNS.length];
    box.innerHTML = svgMarkup(pathD);
  }

  function nextPattern() {
    patternIndex = (patternIndex + 1) % PATTERNS.length;
    ensureLine();
  }

  function tick() {
    injectCss();
    ensureLine();
  }

  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setTimeout(tick, 400);
  setTimeout(tick, 1200);

  setInterval(nextPattern, 5500);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) setTimeout(tick, 40);
  }, true);

  window.DRHeartbeatDraw = { refresh: tick, next: nextPattern };
})();
