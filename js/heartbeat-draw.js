/**
 * Divine Rays — continuous spinning steam gears (no animation reset)
 * Gears on portal only · ECG on login · Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW) {
    try { delete window.__DR_HEARTBEAT_DRAW; } catch (e) {}
  }
  window.__DR_HEARTBEAT_DRAW = 1;

  var CSS_ID = 'dr-gears-bg';
  var BOX_ID = 'dr-lifeline';
  var lastTheme = null;

  function isLight() {
    try {
      return (
        document.documentElement.getAttribute('data-theme') === 'light' ||
        localStorage.getItem('dr_theme') === 'light'
      );
    } catch (e) {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }
  }

  function themeKey() {
    return isLight() ? 'light' : 'dark';
  }

  function loginVisible() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!login) return false;
    if (login.hidden || login.classList.contains('is-hidden')) return false;
    try {
      var st = window.getComputedStyle(login);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
    } catch (e) {}
    return true;
  }

  function portalActive() {
    return !loginVisible();
  }

  function colors() {
    if (isLight()) {
      return { a: '#7c6af0', b: '#9b8af5', c: '#b8a9fc', hub: '#5b4ce0', opacity: '0.28' };
    }
    return { a: '#a78bfa', b: '#8b7cf0', c: '#6d5ef5', hub: '#c4b5fd', opacity: '0.34' };
  }

  function gearPath(teeth, outerR, innerR, holeR) {
    var pts = [];
    var step = (Math.PI * 2) / teeth;
    for (var i = 0; i < teeth; i++) {
      var a0 = i * step - step * 0.5;
      var a2 = a0 + step * 0.32;
      var a3 = a0 + step * 0.68;
      var a4 = a0 + step * 0.85;
      pts.push(
        [Math.cos(a0 + step * 0.18) * outerR, Math.sin(a0 + step * 0.18) * outerR],
        [Math.cos(a2) * outerR, Math.sin(a2) * outerR],
        [Math.cos(a2) * innerR, Math.sin(a2) * innerR],
        [Math.cos(a3) * innerR, Math.sin(a3) * innerR],
        [Math.cos(a3) * outerR, Math.sin(a3) * outerR],
        [Math.cos(a4) * outerR, Math.sin(a4) * outerR]
      );
    }
    var d = 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2);
    for (var j = 1; j < pts.length; j++) {
      d += ' L' + pts[j][0].toFixed(2) + ' ' + pts[j][1].toFixed(2);
    }
    d += ' Z';
    d +=
      ' M' +
      holeR +
      ' 0 A' +
      holeR +
      ' ' +
      holeR +
      ' 0 1 0 ' +
      -holeR +
      ' 0 A' +
      holeR +
      ' ' +
      holeR +
      ' 0 1 0 ' +
      holeR +
      ' 0 Z';
    return d;
  }

  function oneGear(cls, fill, teeth, outer, inner, hole, cx, cy, scale) {
    var d = gearPath(teeth, outer, inner, hole);
    var s = scale || 1;
    return (
      '<g transform="translate(' +
      cx +
      ' ' +
      cy +
      ') scale(' +
      s +
      ')">' +
      '<g class="' +
      cls +
      '">' +
      '<path fill="' +
      fill +
      '" fill-rule="evenodd" d="' +
      d +
      '"/>' +
      '<circle cx="0" cy="0" r="' +
      (hole * 0.55).toFixed(1) +
      '" fill="' +
      fill +
      '" opacity="0.85"/>' +
      '</g></g>'
    );
  }

  function svgMarkup() {
    var c = colors();
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" ' +
      'width="100%" height="100%" style="display:block;opacity:' +
      c.opacity +
      '">' +
      oneGear('dr-spin-cw', c.a, 12, 90, 62, 22, 180, 200, 1.15) +
      oneGear('dr-spin-ccw', c.b, 10, 70, 48, 18, 340, 280, 1) +
      oneGear('dr-spin-cw-fast', c.c, 14, 110, 76, 26, 620, 180, 1.25) +
      oneGear('dr-spin-ccw-slow', c.a, 9, 55, 38, 14, 900, 320, 0.95) +
      oneGear('dr-spin-cw', c.b, 11, 80, 55, 20, 1050, 160, 1.1) +
      oneGear('dr-spin-ccw', c.c, 13, 95, 66, 24, 480, 480, 1.05) +
      oneGear('dr-spin-cw-fast', c.a, 8, 48, 32, 12, 200, 520, 0.9) +
      oneGear('dr-spin-ccw-slow', c.b, 12, 88, 60, 20, 780, 520, 1) +
      '</svg>'
    );
  }

  var CSS = [
    '#' + BOX_ID + '{',
    'z-index:0!important;pointer-events:none!important;overflow:hidden!important;',
    'background:transparent!important',
    '}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline svg{width:100%;height:100%;display:block}',
    '#dr-lifeline .dr-spin-cw{transform-origin:0 0;animation:drGearCW 30s linear infinite}',
    '#dr-lifeline .dr-spin-ccw{transform-origin:0 0;animation:drGearCCW 24s linear infinite}',
    '#dr-lifeline .dr-spin-cw-fast{transform-origin:0 0;animation:drGearCW 18s linear infinite}',
    '#dr-lifeline .dr-spin-ccw-slow{transform-origin:0 0;animation:drGearCCW 36s linear infinite}',
    '@keyframes drGearCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes drGearCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}',
    '#login-screen,.login-screen{position:relative!important;z-index:2!important}',
    '#login-screen .login-card,.login-card{position:relative!important;z-index:3!important}',
    'body,.app-shell,#portal-customer,#portal-agent{position:relative;z-index:1}',
    '@keyframes drEcgDraw{',
    '0%{stroke-dashoffset:var(--dr-len);opacity:0}',
    '3%{opacity:1}',
    '88%{stroke-dashoffset:0;opacity:1}',
    '100%{stroke-dashoffset:0;opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '#dr-lifeline .dr-spin-cw,#dr-lifeline .dr-spin-ccw,#dr-lifeline .dr-spin-cw-fast,#dr-lifeline .dr-spin-ccw-slow{animation:none!important}',
    '#dr-lifeline .dr-ecg-draw{animation:none!important;stroke-dashoffset:0!important;opacity:0.5}',
    '}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      document.head.appendChild(el);
      el.textContent = CSS;
    } else {
      el.textContent = CSS;
    }
  }

  var ECG_PATTERNS = [
    'M0 50 H40 L50 50 L58 42 L65 50 L78 5 L95 95 L112 50 H170 L180 50 L188 42 L195 50 L208 8 L225 92 L242 50 H300 L310 50 L318 42 L325 50 L338 4 L355 96 L372 50 H430 L440 50 L448 42 L455 50 L468 10 L485 90 L502 50 H560 L570 50 L578 42 L585 50 L598 6 L615 94 L632 50 H690 L700 50 L708 42 L715 50 H720',
    'M0 50 H30 L38 46 L45 50 L52 38 L60 50 L72 3 L92 97 L110 50 H160 L168 46 L175 50 L182 38 L190 50 L202 5 L222 95 L240 50 H290 L298 46 L305 50 L312 38 L320 50 L332 4 L352 96 L370 50 H420 L428 46 L435 50 L442 38 L450 50 L462 6 L482 94 L500 50 H550 L558 46 L565 50 L572 38 L580 50 L592 3 L612 97 L630 50 H680 L688 46 L695 50 L702 38 L710 50 H720',
    'M0 50 H25 L33 42 L40 50 L48 32 L56 50 L68 8 L80 50 L88 28 L100 92 L115 50 L125 36 L135 50 H185 L193 42 L200 50 L208 32 L216 50 L228 6 L240 50 L248 28 L260 94 L275 50 L285 36 L295 50 H345 L353 42 L360 50 L368 32 L376 50 L388 8 L400 50 L408 28 L420 92 L435 50 L445 36 L455 50 H505 L513 42 L520 50 L528 32 L536 50 L548 6 L560 50 L568 28 L580 94 L595 50 L605 36 L615 50 H665 L673 42 L680 50 L688 32 L696 50 L708 8 L720 50'
  ];
  var ecgIndex = 0;
  var ecgTimer = null;
  var lastMode = null;

  function ecgStroke() {
    return isLight() ? '#5b21b6' : '#e9d5ff';
  }
  function ecgGlow() {
    if (isLight()) {
      return 'drop-shadow(0 0 3px #7c3aed) drop-shadow(0 0 10px rgba(109,40,217,0.65))';
    }
    return 'drop-shadow(0 0 4px #e9d5ff) drop-shadow(0 0 14px #c4b5fd) drop-shadow(0 0 28px rgba(167,139,250,0.9))';
  }
  function ecgMarkup() {
    var d = ECG_PATTERNS[ecgIndex % ECG_PATTERNS.length];
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 100" preserveAspectRatio="none" width="100%" height="100%" style="display:block">' +
      '<path class="dr-ecg-draw" fill="none" stroke="' + ecgStroke() + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="' + d + '"/>' +
      '</svg>'
    );
  }

  function ensureBox() {
    var box = document.getElementById(BOX_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = BOX_ID;
      box.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(box, document.body.firstChild);
    }
    return box;
  }

  function runEcgCycle() {
    if (ecgTimer) {
      clearTimeout(ecgTimer);
      ecgTimer = null;
    }
    if (!loginVisible()) return;
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    var box = ensureBox();
    if (login && box.parentNode !== login) {
      login.insertBefore(box, login.firstChild);
    }
    box.style.cssText = 'display:block!important;position:absolute!important;left:0!important;right:0!important;width:100%!important;top:50%!important;height:200px!important;margin-top:-100px!important;z-index:1!important;pointer-events:none!important;opacity:1!important;visibility:visible!important';
    box.innerHTML = ecgMarkup();
    var path = box.querySelector('.dr-ecg-draw');
    if (!path) return;
    var len = 1600;
    try { len = path.getTotalLength() || 1600; } catch (e) {}
    path.style.setProperty('--dr-len', len);
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    path.style.filter = ecgGlow();
    path.style.animation = 'none';
    void path.getBoundingClientRect();
    path.style.animation = 'drEcgDraw 10s linear forwards';
    ecgTimer = setTimeout(function () {
      ecgIndex = (ecgIndex + 1) % ECG_PATTERNS.length;
      if (loginVisible()) runEcgCycle();
    }, 10080);
  }

  function ensureGears(force) {
    var box = ensureBox();
    var mode = portalActive() ? 'portal' : 'login';

    if (mode === 'login') {
      if (lastMode !== 'login' || force) {
        lastMode = 'login';
        lastTheme = themeKey();
        runEcgCycle();
      } else if (themeKey() !== lastTheme) {
        lastTheme = themeKey();
        var p = box.querySelector('.dr-ecg-draw');
        if (p) {
          p.setAttribute('stroke', ecgStroke());
          p.style.filter = ecgGlow();
        }
      }
      return;
    }

    if (ecgTimer) {
      clearTimeout(ecgTimer);
      ecgTimer = null;
    }
    if (box.parentNode !== document.body) {
      document.body.insertBefore(box, document.body.firstChild);
    }
    box.style.cssText = 'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;z-index:0!important;pointer-events:none!important;overflow:hidden!important;opacity:1!important;visibility:visible!important;background:transparent!important';
    var theme = themeKey();
    var hasGears = !!box.querySelector('.dr-spin-cw');
    if (force || !hasGears || lastTheme !== theme || lastMode !== 'portal') {
      box.innerHTML = svgMarkup();
      lastTheme = theme;
      lastMode = 'portal';
    }
  }

  function tick(force) {
    injectCss();
    try {
      document.body.classList.toggle('is-login', loginVisible());
      document.body.classList.toggle('is-portal', portalActive());
    } catch (e) {}
    ensureGears(!!force);
    if (window.DRForceLightBg && window.DRForceLightBg.refresh) {
      try { window.DRForceLightBg.refresh(); } catch (e) {}
    }
  }

  tick(true);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      tick(false);
    });
  }
  setTimeout(function () { tick(false); }, 800);
  setTimeout(function () { tick(false); }, 2000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-theme' || t.id === 'dr-login-theme' || (t.classList && t.classList.contains('btn-theme')))) {
        setTimeout(function () {
          if (portalActive()) tick(true);
          else {
            var p = document.querySelector('#dr-lifeline .dr-ecg-draw');
            if (p) {
              p.setAttribute('stroke', ecgStroke());
              p.style.filter = ecgGlow();
            } else tick(true);
          }
        }, 60);
      }
    },
    true
  );

  setInterval(function () {
    tick(false);
  }, 2000);

  window.DRHeartbeatDraw = {
    refresh: function () { tick(false); },
    force: function () { tick(true); }
  };
  window.DRGearsBg = window.DRHeartbeatDraw;
})();
