/**
 * Divine Rays — purple ECG on login page (inside login-screen, behind card)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW) {
    try { delete window.__DR_HEARTBEAT_DRAW; } catch (e) {}
  }
  window.__DR_HEARTBEAT_DRAW = 1;

  var CSS_ID = 'dr-ecg-glow-css';
  var LINE_ID = 'dr-ecg-glow';

  var PATTERNS = [
    'M0 50 H40 L50 50 L58 42 L65 50 L78 5 L95 95 L112 50 H170 ' +
    'L180 50 L188 42 L195 50 L208 8 L225 92 L242 50 H300 ' +
    'L310 50 L318 42 L325 50 L338 4 L355 96 L372 50 H430 ' +
    'L440 50 L448 42 L455 50 L468 10 L485 90 L502 50 H560 ' +
    'L570 50 L578 42 L585 50 L598 6 L615 94 L632 50 H690 ' +
    'L700 50 L708 42 L715 50 H720',

    'M0 50 H30 L38 46 L45 50 L52 38 L60 50 L72 3 L92 97 L110 50 H160 ' +
    'L168 46 L175 50 L182 38 L190 50 L202 5 L222 95 L240 50 H290 ' +
    'L298 46 L305 50 L312 38 L320 50 L332 4 L352 96 L370 50 H420 ' +
    'L428 46 L435 50 L442 38 L450 50 L462 6 L482 94 L500 50 H550 ' +
    'L558 46 L565 50 L572 38 L580 50 L592 3 L612 97 L630 50 H680 ' +
    'L688 46 L695 50 L702 38 L710 50 H720',

    'M0 50 H25 L33 42 L40 50 L48 32 L56 50 L68 8 L80 50 L88 28 L100 92 L115 50 L125 36 L135 50 H185 ' +
    'L193 42 L200 50 L208 32 L216 50 L228 6 L240 50 L248 28 L260 94 L275 50 L285 36 L295 50 H345 ' +
    'L353 42 L360 50 L368 32 L376 50 L388 8 L400 50 L408 28 L420 92 L435 50 L445 36 L455 50 H505 ' +
    'L513 42 L520 50 L528 32 L536 50 L548 6 L560 50 L568 28 L580 94 L595 50 L605 36 L615 50 H665 ' +
    'L673 42 L680 50 L688 32 L696 50 L708 8 L720 50',

    'M0 50 H35 L45 50 L55 28 L62 50 L75 2 L88 50 L96 22 L108 98 L122 50 L132 28 L140 50 H190 ' +
    'L200 50 L210 28 L217 50 L230 4 L243 50 L251 22 L263 96 L277 50 L287 28 L295 50 H345 ' +
    'L355 50 L365 28 L372 50 L385 3 L398 50 L406 22 L418 97 L432 50 L442 28 L450 50 H500 ' +
    'L510 50 L520 28 L527 50 L540 5 L553 50 L561 22 L573 95 L587 50 L597 28 L605 50 H655 ' +
    'L665 50 L675 28 L682 50 L695 2 L708 50 L716 22 L720 50',

    'M0 50 H20 L28 38 L35 50 L42 25 L50 50 L56 12 L64 50 L72 30 L82 3 L92 97 L102 50 L110 18 L120 50 L128 28 L136 6 L145 50 H195 ' +
    'L203 38 L210 50 L217 25 L225 50 L231 12 L239 50 L247 30 L257 3 L267 97 L277 50 L285 18 L295 50 L303 28 L311 6 L320 50 H370 ' +
    'L378 38 L385 50 L392 25 L400 50 L406 12 L414 50 L422 30 L432 3 L442 97 L452 50 L460 18 L470 50 L478 28 L486 6 L495 50 H545 ' +
    'L553 38 L560 50 L567 25 L575 50 L581 12 L589 50 L597 30 L607 3 L617 97 L627 50 L635 18 L645 50 L653 28 L661 6 L670 50 H720',

    'M0 50 H30 L38 40 L48 50 L56 30 L68 50 L80 4 L95 50 L105 25 L118 98 L135 50 L148 38 L160 50 H210 ' +
    'L218 40 L228 50 L236 30 L248 50 L260 6 L275 50 L285 25 L298 96 L315 50 L328 38 L340 50 H390 ' +
    'L398 40 L408 50 L416 30 L428 50 L440 4 L455 50 L465 25 L478 98 L495 50 L508 38 L520 50 H570 ' +
    'L578 40 L588 50 L596 30 L608 50 L620 8 L635 50 L645 25 L658 94 L675 50 L688 38 L700 50 H720'
  ];

  var STROKE = '#e9d5ff';
  var patternIndex = 0;
  var animating = false;

  function svgMarkup(pathD) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 100" preserveAspectRatio="none" ' +
      'width="100%" height="100%" style="display:block;overflow:visible">' +
      '<path class="dr-ecg-draw" fill="none" stroke="' + STROKE + '" stroke-width="4" ' +
      'stroke-linecap="round" stroke-linejoin="round" d="' + pathD + '"/>' +
      '</svg>'
    );
  }

  var CSS = [
    '#login-screen, .login-screen{position:relative!important;overflow:hidden!important}',
    '#' + LINE_ID + '{',
    'display:block!important;position:absolute!important;',
    'left:0!important;right:0!important;width:100%!important;',
    'top:50%!important;height:220px!important;margin-top:-110px!important;',
    'z-index:1!important;pointer-events:none!important;',
    'overflow:visible!important;opacity:1!important;visibility:visible!important}',
    '#' + LINE_ID + ',#' + LINE_ID + ' *{pointer-events:none!important}',
    '#' + LINE_ID + ' svg{width:100%!important;height:100%!important;display:block!important;overflow:visible!important}',
    '#' + LINE_ID + ' .dr-ecg-draw{',
    'stroke-dasharray:1600;',
    'stroke-dashoffset:1600;',
    'animation:none;',
    'filter:drop-shadow(0 0 4px #e9d5ff) drop-shadow(0 0 14px #c4b5fd) drop-shadow(0 0 28px rgba(167,139,250,0.9)) drop-shadow(0 0 48px rgba(124,106,240,0.55))!important}',
    '@keyframes drEcgDraw{',
    '0%{stroke-dashoffset:1600;opacity:0}',
    '3%{opacity:1}',
    '78%{stroke-dashoffset:0;opacity:1}',
    '88%{stroke-dashoffset:0;opacity:0.5}',
    '100%{stroke-dashoffset:0;opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '#' + LINE_ID + ' .dr-ecg-draw{animation:none!important;stroke-dashoffset:0!important;opacity:0.7}',
    '}',
    '#login-screen .login-card, .login-screen .login-card{position:relative!important;z-index:5!important}',
    '#dr-login-theme{z-index:10050!important}',
    '#dr-lifeline{opacity:0!important;visibility:hidden!important;height:0!important;overflow:hidden!important}'
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

  function loginVisible() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!login) return false;
    if (login.hidden || login.classList.contains('is-hidden')) return false;
    var st = window.getComputedStyle(login);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    return true;
  }

  function ensureBox() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    var box = document.getElementById(LINE_ID);

    if (!loginVisible()) {
      if (box) box.style.display = 'none';
      return null;
    }

    if (!box) {
      box = document.createElement('div');
      box.id = LINE_ID;
      box.setAttribute('aria-hidden', 'true');
    }

    if (box.parentNode !== login) {
      login.insertBefore(box, login.firstChild);
    }
    box.style.display = 'block';
    return box;
  }

  function runCycle() {
    if (animating) return;
    if (!loginVisible()) {
      animating = false;
      return;
    }
    animating = true;
    injectCss();
    var box = ensureBox();
    if (!box) {
      animating = false;
      return;
    }

    var pathD = PATTERNS[patternIndex % PATTERNS.length];
    box.innerHTML = svgMarkup(pathD);

    var path = box.querySelector('.dr-ecg-draw');
    if (!path) {
      animating = false;
      return;
    }

    path.style.animation = 'none';
    void path.getBoundingClientRect();
    path.style.animation = 'drEcgDraw 17s cubic-bezier(0.4, 0, 0.2, 1) forwards';

    setTimeout(function () {
      patternIndex = (patternIndex + 1) % PATTERNS.length;
      animating = false;
      runCycle();
    }, 17100);
  }

  function tick() {
    injectCss();
    ensureBox();
    if (!animating && loginVisible()) runCycle();
  }

  tick();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
  setTimeout(tick, 300);
  setTimeout(tick, 800);
  setTimeout(tick, 1500);
  setInterval(function () {
    if (!animating && loginVisible()) runCycle();
  }, 2000);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) {
      setTimeout(function () { injectCss(); }, 40);
    }
  }, true);

  window.DRHeartbeatDraw = {
    refresh: tick,
    next: function () {
      patternIndex = (patternIndex + 1) % PATTERNS.length;
      animating = false;
      runCycle();
    }
  };
})();
