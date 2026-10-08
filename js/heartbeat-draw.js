/**
 * Divine Rays — heartbeat / ECG lifeline v11
 * Login: full-viewport ECG behind card (always visible)
 * Portal: spinning gears background
 * Fixes: fixed body host, no CSS-var keyframe dash, transparent login bg
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW >= 11) return;
  window.__DR_HEARTBEAT_DRAW = 11;

  var CSS_ID = 'dr-gears-bg';
  var BOX_ID = 'dr-lifeline';
  var lastTheme = null;
  var lastMode = null;
  var ecgTimer = null;
  var ecgIndex = 0;
  var __tickBusy = false;
  var __ecgBusy = false;
  var lastEcgWidth = 0;

  function isLight() {
    try {
      return (
        document.documentElement.getAttribute('data-theme') === 'light' ||
        localStorage.getItem('dr_theme') === 'light'
      );
    } catch (e) {
      return false;
    }
  }

  function themeKey() {
    return isLight() ? 'light' : 'dark';
  }

  function loginVisible() {
    try {
      var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (!login) return false;
      if (login.hidden || login.classList.contains('is-hidden')) return false;
      var st = window.getComputedStyle(login);
      if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function portalActive() {
    try {
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      if (pa && pa.classList.contains('active')) return true;
      if (pc && pc.classList.contains('active')) return true;
      if (document.body && document.body.classList.contains('is-portal')) return true;
    } catch (e) {}
    return !loginVisible();
  }

  function colors() {
    if (isLight()) {
      return { a: '#7c6af0', b: '#9b8af5', c: '#b8a9fc', hub: '#5b4ce0', opacity: '0.32' };
    }
    return { a: '#a78bfa', b: '#8b7cf0', c: '#6d5ef5', hub: '#c4b5fd', opacity: '0.4' };
  }

  function ecgStroke() {
    return isLight() ? '#6d28d9' : '#f5e8ff';
  }
  function ecgGlowStroke() {
    return isLight() ? '#a78bfa' : '#d8b4fe';
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
      ' M' + holeR + ' 0 A' + holeR + ' ' + holeR + ' 0 1 0 ' + -holeR +
      ' 0 A' + holeR + ' ' + holeR + ' 0 1 0 ' + holeR + ' 0 Z';
    return d;
  }

  function oneGear(cls, fill, teeth, outer, inner, hole, cx, cy, scale) {
    var d = gearPath(teeth, outer, inner, hole);
    return (
      '<g class="' + cls + '" transform="translate(' + cx + ' ' + cy + ') scale(' + scale + ')">' +
      '<path d="' + d + '" fill="' + fill + '" fill-rule="evenodd"/>' +
      '<circle cx="0" cy="0" r="' + (hole * 0.55).toFixed(1) + '" fill="' + fill + '" opacity="0.85"/>' +
      '</g>'
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

  var ECG_PATTERNS = [
    'M0 50 H40 L50 50 L58 42 L65 50 L78 5 L95 95 L112 50 H170 L180 50 L188 42 L195 50 L208 8 L225 92 L242 50 H300 L310 50 L318 42 L325 50 L338 4 L355 96 L372 50 H430 L440 50 L448 42 L455 50 L468 10 L485 90 L502 50 H560 L570 50 L578 42 L585 50 L598 6 L615 94 L632 50 H690 L700 50 L708 42 L715 50 H720',
    'M0 50 H30 L38 46 L45 50 L52 38 L60 50 L72 3 L92 97 L110 50 H160 L168 46 L175 50 L182 38 L190 50 L202 5 L222 95 L240 50 H290 L298 46 L305 50 L312 38 L320 50 L332 4 L352 96 L370 50 H420 L428 46 L435 50 L442 38 L450 50 L462 6 L482 94 L500 50 H550 L558 46 L565 50 L572 38 L580 50 L592 3 L612 97 L630 50 H680 L688 46 L695 50 H720'
  ];

  var CSS = [
    'html,body{min-height:100%}',
    '#' + BOX_ID + '{',
    'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;',
    'z-index:0!important;pointer-events:none!important;overflow:visible!important;',
    'background:transparent!important;box-shadow:none!important;filter:none!important;',
    'opacity:1!important;visibility:visible!important;display:block!important',
    '}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline svg{width:100%;height:100%;display:block;overflow:visible}',
    '#dr-lifeline .dr-ecg-core,#dr-lifeline .dr-ecg-glow{',
    'will-change:stroke-dashoffset,opacity;transform:translateZ(0)}',
    '#dr-lifeline .dr-spin-cw{transform-origin:0 0;animation:drGearCW 30s linear infinite}',
    '#dr-lifeline .dr-spin-ccw{transform-origin:0 0;animation:drGearCCW 24s linear infinite}',
    '#dr-lifeline .dr-spin-cw-fast{transform-origin:0 0;animation:drGearCW 18s linear infinite}',
    '#dr-lifeline .dr-spin-ccw-slow{transform-origin:0 0;animation:drGearCCW 36s linear infinite}',
    '@keyframes drGearCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes drGearCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}',
    'body.is-login{background:#0c0c14!important}',
    'html[data-theme="light"] body.is-login{background:#f0f0f5!important}',
    'body.is-login #login-screen,body.is-login .login-screen,',
    '#login-screen.login-screen,.login-screen{',
    'background:transparent!important;background-color:transparent!important;',
    'background-image:none!important;position:relative!important;z-index:2!important}',
    '#login-screen .login-card,.login-card{position:relative!important;z-index:5!important}',
    'body.is-portal .app-shell,body.is-portal #portal-agent,body.is-portal #portal-customer{position:relative;z-index:1}',
    '@keyframes drEcgGlowPulse{0%,100%{opacity:0.55}50%{opacity:0.85}}',
    '@keyframes drEcgCorePulse{0%,100%{opacity:0.95}50%{opacity:1}}',
    '@media (prefers-reduced-motion:reduce){',
    '#dr-lifeline .dr-spin-cw,#dr-lifeline .dr-spin-ccw,#dr-lifeline .dr-spin-cw-fast,#dr-lifeline .dr-spin-ccw-slow{animation:none!important}',
    '#dr-lifeline .dr-ecg-core,#dr-lifeline .dr-ecg-glow{opacity:0.85!important}',
    '}'
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

  function ensureBox() {
    var box = document.getElementById(BOX_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = BOX_ID;
      box.setAttribute('aria-hidden', 'true');
      if (document.body) {
        document.body.insertBefore(box, document.body.firstChild);
      } else {
        document.documentElement.appendChild(box);
      }
    }
    if (document.body && box.parentNode !== document.body) {
      document.body.insertBefore(box, document.body.firstChild);
    }
    return box;
  }

  function hostStylePortal(box) {
    box.style.cssText =
      'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;' +
      'z-index:0!important;pointer-events:none!important;overflow:hidden!important;' +
      'opacity:1!important;visibility:visible!important;display:block!important;' +
      'background:transparent!important';
  }

  function hostStyleLogin(box) {
    box.style.cssText =
      'position:fixed!important;left:0!important;right:0!important;top:0!important;bottom:0!important;' +
      'width:100%!important;height:100%!important;' +
      'z-index:0!important;pointer-events:none!important;overflow:visible!important;' +
      'opacity:1!important;visibility:visible!important;display:block!important;' +
      'background:transparent!important;margin:0!important;padding:0!important';
  }

  function ecgMarkup() {
    var d = ECG_PATTERNS[ecgIndex % ECG_PATTERNS.length];
    var core = ecgStroke();
    var glow = ecgGlowStroke();
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 100" preserveAspectRatio="none" ' +
      'width="100%" height="100%" style="display:block;position:absolute;left:0;right:0;top:50%;' +
      'height:220px;margin-top:-110px;overflow:visible">' +
      '<path class="dr-ecg-glow" fill="none" stroke="' + glow + '" stroke-width="7" ' +
      'stroke-linecap="round" stroke-linejoin="round" d="' + d + '"/>' +
      '<path class="dr-ecg-core" fill="none" stroke="' + core + '" stroke-width="3.2" ' +
      'stroke-linecap="round" stroke-linejoin="round" d="' + d + '"/>' +
      '</svg>'
    );
  }

  function animatePath(path, len, durMs, isCore) {
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    path.style.opacity = isCore ? '1' : '0.7';
    path.style.transition = 'none';
    void path.getBoundingClientRect();
    path.style.transition = 'stroke-dashoffset ' + (durMs / 1000).toFixed(2) + 's linear';
    path.style.strokeDashoffset = '0';
  }

  function runEcgCycle() {
    if (__ecgBusy) return;
    if (ecgTimer) {
      clearTimeout(ecgTimer);
      ecgTimer = null;
    }
    if (portalActive()) return;
    __ecgBusy = true;

    try {
      document.body.classList.add('is-login');
      document.body.classList.remove('is-portal');
    } catch (e) {}

    injectCss();
    var box = ensureBox();
    hostStyleLogin(box);
    box.innerHTML = ecgMarkup();

    var paths = box.querySelectorAll('.dr-ecg-core, .dr-ecg-glow');
    if (!paths.length) {
      __ecgBusy = false;
      return;
    }

    var len = 1600;
    try {
      len = paths[paths.length - 1].getTotalLength() || 1600;
    } catch (e2) {}
    if (len < 200) len = 1600;

    var w = window.innerWidth || 1200;
    var sec = Math.max(3.2, Math.min(14, (w * 0.9) / 185));
    var durMs = Math.round(sec * 1000);
    lastEcgWidth = w;

    for (var i = 0; i < paths.length; i++) {
      var p = paths[i];
      var isCore = p.classList.contains('dr-ecg-core');
      animatePath(p, len, durMs, isCore);
      p.style.animation = isCore
        ? 'drEcgCorePulse 2.4s ease-in-out infinite'
        : 'drEcgGlowPulse 2.4s ease-in-out infinite';
    }

    __ecgBusy = false;
    ecgTimer = setTimeout(function () {
      ecgIndex = (ecgIndex + 1) % ECG_PATTERNS.length;
      if (!portalActive()) runEcgCycle();
    }, durMs + 80);
  }

  function ensureGears(force) {
    var box = ensureBox();
    var onPortal = portalActive();

    if (!onPortal) {
      if (lastMode !== 'login' || force || !box.querySelector('.dr-ecg-core')) {
        lastMode = 'login';
        lastTheme = themeKey();
        runEcgCycle();
      } else if (themeKey() !== lastTheme) {
        lastTheme = themeKey();
        var cores = box.querySelectorAll('.dr-ecg-core');
        var glows = box.querySelectorAll('.dr-ecg-glow');
        for (var ci = 0; ci < cores.length; ci++) cores[ci].setAttribute('stroke', ecgStroke());
        for (var gi = 0; gi < glows.length; gi++) glows[gi].setAttribute('stroke', ecgGlowStroke());
      }
      return;
    }

    if (ecgTimer) {
      clearTimeout(ecgTimer);
      ecgTimer = null;
    }
    try {
      document.body.classList.add('is-portal');
      document.body.classList.remove('is-login');
    } catch (e3) {}

    hostStylePortal(box);
    var theme = themeKey();
    var hasGears = !!box.querySelector('.dr-spin-cw');
    if (force || !hasGears || lastTheme !== theme || lastMode !== 'portal') {
      box.innerHTML = svgMarkup();
      lastTheme = theme;
      lastMode = 'portal';
    }
  }

  function tick(force) {
    if (__tickBusy) return;
    __tickBusy = true;
    try {
      injectCss();
      try {
        var onLogin = loginVisible() && !portalActive();
        document.body.classList.toggle('is-login', onLogin);
        document.body.classList.toggle('is-portal', !onLogin && portalActive());
      } catch (e) {}
      ensureGears(!!force);
    } finally {
      __tickBusy = false;
    }
  }

  function boot() {
    tick(true);
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { tick(true); });
  }
  setTimeout(function () { tick(true); }, 50);
  setTimeout(function () { tick(true); }, 300);
  setTimeout(function () { tick(true); }, 900);
  setTimeout(function () { tick(true); }, 2000);
  setInterval(function () { tick(false); }, 8000);

  window.addEventListener(
    'resize',
    function () {
      clearTimeout(window.__drHbResize);
      window.__drHbResize = setTimeout(function () {
        var box = document.getElementById(BOX_ID);
        var w = box ? box.clientWidth : 0;
        if (Math.abs(w - lastEcgWidth) > 40 && !portalActive()) {
          runEcgCycle();
        }
      }, 200);
    }
  );

  window.DRHeartbeatDraw = {
    refresh: function () { tick(false); },
    force: function () { tick(true); }
  };
  window.DRGearsBg = window.DRHeartbeatDraw;
})();
