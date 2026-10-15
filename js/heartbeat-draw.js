/**
 * Divine Rays — ECG + gears v32 — no redraw if already drawn
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW >= 32) return;
  try {
    if (window.__DR_ECG_TIMER) clearTimeout(window.__DR_ECG_TIMER);
    if (window.__DR_ECG_INTERVAL) clearInterval(window.__DR_ECG_INTERVAL);
  } catch (e0) {}
  window.__DR_HEARTBEAT_DRAW = 32;

  var CSS_ID = 'dr-gears-bg-v32';
  var BOX_ID = 'dr-lifeline';
  var lastTheme = null;
  var lastMode = null;
  var ecgIndex = 0;
  var ecgTimer = null;
  var __ecgBusy = false;
  var __tickBusy = false;
  var lastEcgWidth = 0;
  var ECG_SPEED_PX_PER_SEC = 95;
  var __startedOnce = false;
  try {
    if (document.querySelector('#dr-lifeline .dr-ecg-core') || window.__DR_ECG_DRAWN) {
      __startedOnce = true;
      window.__DR_ECG_DRAWN = 1;
    }
  } catch (eInit) {}

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
  function themeKey() { return isLight() ? 'light' : 'dark'; }
  function isBooting() {
    try {
      if (window.__DR_BOOT_DONE === true) {
        var oDone = document.getElementById('dr-boot-overlay');
        if (!oDone || oDone.classList.contains('dr-boot-removed')) return false;
        if (oDone.classList.contains('is-done')) {
          try {
            return parseFloat(window.getComputedStyle(oDone).opacity || '0') > 0.08;
          } catch (eF) { return false; }
        }
      }
      if (document.body && document.body.classList.contains('dr-boot-holding')) return true;
      var o = document.getElementById('dr-boot-overlay');
      if (o && !o.classList.contains('is-done') && !o.classList.contains('dr-boot-removed')) return true;
      if (o && o.classList.contains('is-done')) {
        try {
          if (parseFloat(window.getComputedStyle(o).opacity || '0') > 0.08) return true;
        } catch (e3) {}
      }
    } catch (e) {}
    return false;
  }
  function loginVisible() {
    if (isBooting()) return false;
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!login || login.hidden || login.classList.contains('is-hidden')) return false;
    try {
      var st = window.getComputedStyle(login);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      if (login.offsetWidth < 80) return false;
    } catch (e) {}
    return true;
  }
  function portalActive() {
    if (isBooting() || loginVisible()) return false;
    try {
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      if (pa && pa.classList.contains('active')) return true;
      if (pc && pc.classList.contains('active')) return true;
    } catch (e) {}
    return false;
  }
  function loginInputFocused() {
    try {
      if (window.__DR_PAUSE_LOGIN_SCRIPTS) return true;
      var a = document.activeElement;
      if (!a) return false;
      var tag = (a.tagName || '').toUpperCase();
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return false;
      return !!(a.closest && a.closest('#login-screen, #login-agent, form.login-form, .login-card'));
    } catch (e) {
      return !!window.__DR_PAUSE_LOGIN_SCRIPTS;
    }
  }
  function colors() {
    if (isLight()) return { a: '#7c6af0', b: '#9b8af5', c: '#b8a9fc', opacity: '0.28' };
    return { a: '#a78bfa', b: '#8b7cf0', c: '#6d5ef5', opacity: '0.34' };
  }
  function ecgStroke() { return isLight() ? '#7c3aed' : '#f3e8ff'; }
  function ecgGlowStroke() {
    return isLight() ? 'rgba(167,139,250,0.45)' : 'rgba(233,213,255,0.42)';
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
    for (var j = 1; j < pts.length; j++) d += ' L' + pts[j][0].toFixed(2) + ' ' + pts[j][1].toFixed(2);
    d += ' Z';
    d += ' M' + holeR + ' 0 A' + holeR + ' ' + holeR + ' 0 1 0 ' + -holeR + ' 0 A' + holeR + ' ' + holeR + ' 0 1 0 ' + holeR + ' 0 Z';
    return d;
  }
  function oneGear(cls, fill, teeth, outer, inner, hole, cx, cy, scale) {
    var d = gearPath(teeth, outer, inner, hole);
    var s = scale || 1;
    return (
      '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')">' +
      '<g class="' + cls + '">' +
      '<path fill="' + fill + '" fill-rule="evenodd" d="' + d + '"/>' +
      '<circle cx="0" cy="0" r="' + (hole * 0.55).toFixed(1) + '" fill="' + fill + '" opacity="0.85"/>' +
      '</g></g>'
    );
  }
  function svgMarkup() {
    var c = colors();
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" ' +
      'width="100%" height="100%" style="display:block;opacity:' + c.opacity + '">' +
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
    '#' + BOX_ID + '{z-index:0!important;pointer-events:none!important;overflow:visible!important;background:transparent!important}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline svg{width:100%;height:100%;display:block;overflow:visible}',
    '#dr-lifeline .dr-spin-cw{transform-origin:0 0;animation:drGearCW 30s linear infinite}',
    '#dr-lifeline .dr-spin-ccw{transform-origin:0 0;animation:drGearCCW 24s linear infinite}',
    '#dr-lifeline .dr-spin-cw-fast{transform-origin:0 0;animation:drGearCW 18s linear infinite}',
    '#dr-lifeline .dr-spin-ccw-slow{transform-origin:0 0;animation:drGearCCW 36s linear infinite}',
    '@keyframes drGearCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes drGearCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}',
    '#login-screen,.login-screen{position:relative!important;z-index:2!important}',
    '@keyframes drEcgGlowPulse{0%,100%{opacity:0.28}50%{opacity:0.42}}',
    '@keyframes drEcgCorePulse{0%,100%{opacity:0.85}50%{opacity:0.95}}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    if (el.textContent !== CSS) el.textContent = CSS;
  }

  var ECG_PATTERNS = [
    'M0 50 H40 L50 50 L58 42 L65 50 L78 5 L95 95 L112 50 H170 L180 50 L188 42 L195 50 L208 8 L225 92 L242 50 H300 L310 50 L318 42 L325 50 L338 4 L355 96 L372 50 H430 L440 50 L448 42 L455 50 L468 10 L485 90 L502 50 H560 L570 50 L578 42 L585 50 L598 6 L615 94 L632 50 H690 L700 50 L708 42 L715 50 H720',
    'M0 50 H30 L38 46 L45 50 L52 38 L60 50 L72 3 L92 97 L110 50 H160 L168 46 L175 50 L182 38 L190 50 L202 5 L222 95 L240 50 H290 L298 46 L305 50 L312 38 L320 50 L332 4 L352 96 L370 50 H420 L428 46 L435 50 L442 38 L450 50 L462 6 L482 94 L500 50 H550 L558 46 L565 50 L572 38 L580 50 L592 3 L612 97 L630 50 H680 L688 46 L695 50 L702 38 L710 50 H720',
    'M0 50 H25 L33 42 L40 50 L48 32 L56 50 L68 8 L80 50 L88 28 L100 92 L115 50 L125 36 L135 50 H185 L193 42 L200 50 L208 32 L216 50 L228 6 L240 50 L248 28 L260 94 L275 50 L285 36 L295 50 H345 L353 42 L360 50 L368 32 L376 50 L388 8 L400 50 L408 28 L420 92 L435 50 L445 36 L455 50 H505 L513 42 L520 50 L528 32 L536 50 L548 6 L560 50 L568 28 L580 94 L595 50 L605 36 L615 50 H665 L673 42 L680 50 L688 32 L696 50 L708 8 L720 50'
  ];

  function ecgMarkup() {
    var d = ECG_PATTERNS[ecgIndex % ECG_PATTERNS.length];
    var core = ecgStroke();
    var glow = ecgGlowStroke();
    var fid = 'drEcgBlur' + Date.now();
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 100" preserveAspectRatio="none" width="100%" height="100%" style="display:block;overflow:visible">' +
      '<defs><filter id="' + fid + '" x="-25%" y="-60%" width="150%" height="220%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<path class="dr-ecg-glow" fill="none" stroke="' + glow + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#' + fid + ')" opacity="0.55" d="' + d + '"/>' +
      '<path class="dr-ecg-core" fill="none" stroke="' + core + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="' + d + '"/>' +
      '</svg>'
    );
  }

  function ensureBox() {
    var box = document.getElementById(BOX_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = BOX_ID;
      box.setAttribute('aria-hidden', 'true');
      if (document.body) document.body.insertBefore(box, document.body.firstChild);
    }
    return box;
  }

  function viewportWidth() {
    try {
      var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
      var w = (login && login.clientWidth) || window.innerWidth || 1200;
      return w < 320 ? 320 : w;
    } catch (e) { return 1200; }
  }

  function ecgDurationSec() {
    var w = viewportWidth();
    var sec = (w / ECG_SPEED_PX_PER_SEC) * 1.35;
    if (sec < 8) sec = 8;
    if (sec > 36) sec = 36;
    return sec;
  }

  function injectDrawKeyframes(len, animName) {
    var id = 'dr-ecg-draw-kf';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = '@keyframes ' + animName + '{0%{stroke-dashoffset:' + len + '}100%{stroke-dashoffset:0}}';
  }

  function purgeClones(box) {
    try {
      document.querySelectorAll('#dr-lifeline').forEach(function (el) {
        if (box && el !== box && el.parentNode) el.parentNode.removeChild(el);
      });
      document.querySelectorAll('.dr-ecg-core, .dr-ecg-glow').forEach(function (el) {
        if (!el.closest('#dr-lifeline') && el.parentNode) el.parentNode.removeChild(el);
      });
    } catch (e) {}
  }

  function recolorEcgOnly() {
    var cores = document.querySelectorAll('#dr-lifeline .dr-ecg-core');
    var glows = document.querySelectorAll('#dr-lifeline .dr-ecg-glow');
    if (!cores.length) return false;
    var core = ecgStroke();
    var glow = ecgGlowStroke();
    for (var i = 0; i < cores.length; i++) cores[i].setAttribute('stroke', core);
    for (var j = 0; j < glows.length; j++) glows[j].setAttribute('stroke', glow);
    lastTheme = themeKey();
    return true;
  }

  function clearEcgTimer() {
    if (ecgTimer) { clearTimeout(ecgTimer); ecgTimer = null; }
    try { if (window.__DR_ECG_TIMER) clearTimeout(window.__DR_ECG_TIMER); } catch (e) {}
    window.__DR_ECG_TIMER = null;
  }

  function runEcgCycle(opt) {
    if (__ecgBusy) return;
    if (isBooting()) return;
    if (!loginVisible()) return;
    if (loginInputFocused()) return;
    var forceNew = opt && opt.forceNew;
    if (__startedOnce) return;
    if (!forceNew && document.querySelector('#dr-lifeline .dr-ecg-core')) return;
    clearEcgTimer();
    __ecgBusy = true;
    __startedOnce = true;

    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    var box = ensureBox();
    purgeClones(box);
    if (login && box.parentNode !== login) login.insertBefore(box, login.firstChild);

    box.style.cssText =
      'display:block!important;position:absolute!important;left:0!important;right:0!important;' +
      'width:100%!important;top:50%!important;height:180px!important;margin-top:-90px!important;' +
      'z-index:1!important;pointer-events:none!important;opacity:0!important;visibility:visible!important;' +
      'background:transparent!important;overflow:visible!important;transition:opacity 0.35s ease-out!important';

    box.innerHTML = ecgMarkup();
    var paths = box.querySelectorAll('.dr-ecg-core, .dr-ecg-glow');
    if (!paths.length) { __ecgBusy = false; return; }

    var len = 1600;
    try {
      var coreP = box.querySelector('.dr-ecg-core') || paths[0];
      len = coreP.getTotalLength() || 1600;
      if (len < 700) len = 1600;
    } catch (e) {}

    var dur = ecgDurationSec();
    lastEcgWidth = viewportWidth();
    lastTheme = themeKey();
    lastMode = 'login';

    var animName = 'drEcgDraw_' + Date.now();
    injectDrawKeyframes(len, animName);

    for (var i = 0; i < paths.length; i++) {
      var p = paths[i];
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
      p.style.animation = 'none';
      p.style.opacity = '0';
    }
    void box.getBoundingClientRect();

    var durCss = dur.toFixed(2) + 's';
    for (var j = 0; j < paths.length; j++) {
      var pj = paths[j];
      pj.style.opacity = '1';
      if (pj.classList.contains('dr-ecg-core')) {
        pj.style.animation = animName + ' ' + durCss + ' linear forwards, drEcgCorePulse 2.4s ease-in-out infinite';
      } else {
        pj.style.animation = animName + ' ' + durCss + ' linear forwards, drEcgGlowPulse 2.4s ease-in-out infinite';
      }
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        try { box.style.opacity = '1'; } catch (eOp) {}
      });
    });

    __ecgBusy = false;
    window.__DR_ECG_TIMER = null;
    try { window.__DR_ECG_DRAWN = 1; } catch (eD) {}
  }

  function ensureGears(force) {
    if (isBooting()) return;
    var box = ensureBox();
    var mode = portalActive() ? 'portal' : 'login';
    if (mode === 'login') {
      if (!loginVisible()) return;
      box.style.display = 'block';
      purgeClones(box);
      if (box.querySelector('.dr-ecg-core') && box.querySelector('.dr-ecg-glow')) {
        if (themeKey() !== lastTheme) recolorEcgOnly();
        lastMode = 'login';
        return;
      }
      lastMode = 'login';
      lastTheme = themeKey();
      runEcgCycle(force ? { forceNew: true } : null);
      return;
    }
    clearEcgTimer();
    if (box.parentNode !== document.body) document.body.insertBefore(box, document.body.firstChild);
    box.style.cssText =
      'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;' +
      'z-index:0!important;pointer-events:none!important;overflow:hidden!important;opacity:1!important;display:block!important';
    var theme = themeKey();
    if (force || !box.querySelector('.dr-spin-cw') || lastTheme !== theme || lastMode !== 'portal') {
      box.innerHTML = svgMarkup();
      lastTheme = theme;
      lastMode = 'portal';
    }
  }

  function tick(force) {
    if (__tickBusy) return;
    if (loginInputFocused()) return;
    __tickBusy = true;
    try {
      injectCss();
      ensureGears(!!force);
      purgeClones(document.getElementById(BOX_ID));
    } finally {
      __tickBusy = false;
    }
  }

  function waitForLogin() {
    if (isBooting() || !loginVisible()) {
      setTimeout(waitForLogin, 80);
      return;
    }
    if (window.__DR_ECG_OK !== true) {
      setTimeout(waitForLogin, 80);
      return;
    }
    if (__startedOnce || document.querySelector('#dr-lifeline .dr-ecg-core')) return;
    tick(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(waitForLogin, 40); });
  } else {
    setTimeout(waitForLogin, 40);
  }

  window.__DR_ECG_INTERVAL = setInterval(function () {
    if (isBooting()) return;
    if (loginInputFocused()) return;
    if (loginVisible() && window.__DR_ECG_OK) tick(false);
  }, 2500);

  window.DRHeartbeatDraw = {
    refresh: function () { tick(false); },
    force: function () {
      if (window.__DR_ECG_DRAWN || document.querySelector('#dr-lifeline .dr-ecg-core')) return;
      __startedOnce = false;
      __ecgBusy = false;
      try {
        window.__DR_ECG_OK = true;
        document.documentElement.setAttribute('data-ecg', 'on');
        window.__DR_BOOT_DONE = true;
      } catch (e) {}
      tick(true);
    }
  };
  window.DRGearsBg = window.DRHeartbeatDraw;
})();
