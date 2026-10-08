/**
 * Divine Rays — heartbeat / ECG lifeline v13
 * Login: continuous neon ECG that NEVER stops while login is on screen
 * Portal: spinning gears
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  try { delete window.__DR_HEARTBEAT_DRAW; } catch (e0) {}
  window.__DR_HEARTBEAT_DRAW = 13;

  var CSS_ID = 'dr-gears-bg';
  var BOX_ID = 'dr-lifeline';
  var lastTheme = null;
  var lastMode = null;
  var rafId = null;
  var ecgOffset = 0;
  var lastTs = 0;
  var keepAlive = null;

  function isLight() {
    try {
      if (document.documentElement.getAttribute('data-theme') === 'light') return true;
      return localStorage.getItem('dr_theme') === 'light';
    } catch (e) {
      return false;
    }
  }

  function loginEl() {
    return document.getElementById('login-screen') || document.querySelector('.login-screen');
  }

  function isLoginScreen() {
    var login = loginEl();
    if (!login) return false;
    if (login.hidden) return false;
    if (login.classList.contains('is-hidden')) return false;
    try {
      var st = window.getComputedStyle(login);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
    } catch (e) {}
    return true;
  }

  function isPortalActive() {
    if (isLoginScreen()) return false;
    try {
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      if (pa && pa.classList.contains('active')) return true;
      if (pc && pc.classList.contains('active')) return true;
      if (document.body && document.body.classList.contains('is-portal')) return true;
    } catch (e) {}
    return false;
  }

  function colors() {
    if (isLight()) {
      return { a: '#7c6af0', b: '#9b8af5', c: '#b8a9fc', opacity: '0.35' };
    }
    return { a: '#a78bfa', b: '#8b7cf0', c: '#6d5ef5', opacity: '0.42' };
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

  function gearsSvg() {
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

  var ECG_UNIT =
    'M0 50 H40 L48 50 L54 40 L60 50 L72 5 L90 95 L108 50 H160 ' +
    'L168 50 L174 40 L180 50 L192 8 L210 92 L228 50 H280 ' +
    'L288 50 L294 40 L300 50 L312 6 L330 94 L348 50 H400';

  function ecgSvg() {
    var core = isLight() ? '#6d28d9' : '#f3e8ff';
    var glow = isLight() ? '#a78bfa' : '#e9d5ff';
    var d =
      ECG_UNIT +
      ' ' +
      ECG_UNIT.replace(/M0 /g, 'M400 ') +
      ' ' +
      ECG_UNIT.replace(/M0 /g, 'M800 ') +
      ' ' +
      ECG_UNIT.replace(/M0 /g, 'M1200 ');
    return (
      '<svg id="dr-ecg-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 100" ' +
      'preserveAspectRatio="none" width="300%" height="100%" ' +
      'style="display:block;position:absolute;left:0;top:50%;height:260px;margin-top:-130px;' +
      'overflow:visible;will-change:transform;' +
      'filter:drop-shadow(0 0 8px ' + glow + ') drop-shadow(0 0 18px ' + glow + ')">' +
      '<path fill="none" stroke="' + glow + '" stroke-width="10" stroke-linecap="round" ' +
      'stroke-linejoin="round" opacity="0.45" d="' + d + '"/>' +
      '<path class="dr-ecg-core" fill="none" stroke="' + core + '" stroke-width="3.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" opacity="1" d="' + d + '"/>' +
      '</svg>'
    );
  }

  var CSS = [
    '#' + BOX_ID + '{',
    'position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;',
    'z-index:1!important;pointer-events:none!important;overflow:hidden!important;',
    'background:transparent!important;opacity:1!important;visibility:visible!important;',
    'display:block!important;margin:0!important;padding:0!important',
    '}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline svg{display:block;overflow:visible}',
    '#dr-lifeline .dr-spin-cw{transform-origin:0 0;animation:drGearCW 30s linear infinite}',
    '#dr-lifeline .dr-spin-ccw{transform-origin:0 0;animation:drGearCCW 24s linear infinite}',
    '#dr-lifeline .dr-spin-cw-fast{transform-origin:0 0;animation:drGearCW 18s linear infinite}',
    '#dr-lifeline .dr-spin-ccw-slow{transform-origin:0 0;animation:drGearCCW 36s linear infinite}',
    '@keyframes drGearCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes drGearCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}',
    'body.is-login #login-screen,body.is-login .login-screen,',
    '#login-screen,.login-screen{',
    'background:transparent!important;background-color:transparent!important;',
    'background-image:none!important;position:relative!important;z-index:3!important}',
    '#login-screen .login-card,.login-card{position:relative!important;z-index:6!important}',
    'body.is-login{background:#0c0c14!important}',
    'html[data-theme="light"] body.is-login{background:#f0f0f5!important}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
  }

  function ensureBox() {
    var box = document.getElementById(BOX_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = BOX_ID;
      box.setAttribute('aria-hidden', 'true');
    }
    if (document.body && box.parentNode !== document.body) {
      document.body.insertBefore(box, document.body.firstChild);
    }
    return box;
  }

  function stopRaf() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastTs = 0;
  }

  function startEcgLoop(forceRebuild) {
    var box = ensureBox();
    box.style.cssText =
      'position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;' +
      'z-index:1!important;pointer-events:none!important;overflow:hidden!important;' +
      'opacity:1!important;visibility:visible!important;display:block!important;' +
      'background:transparent!important';

    var needBuild = forceRebuild || !box.querySelector('.dr-ecg-core') || !document.getElementById('dr-ecg-svg');
    if (needBuild) {
      box.innerHTML = ecgSvg();
      ecgOffset = 0;
      lastTs = 0;
    }

    var svg = document.getElementById('dr-ecg-svg');
    if (!svg) return;

    if (rafId && !forceRebuild) return;

    stopRaf();
    var speed = 120;

    function frame(ts) {
      if (!isLoginScreen() && isPortalActive()) {
        rafId = null;
        return;
      }
      if (!lastTs) lastTs = ts;
      var dt = Math.min(50, ts - lastTs);
      lastTs = ts;
      ecgOffset += (speed * dt) / 1000;

      var loopW = Math.max(400, (window.innerWidth || 1200) * 0.55);
      if (ecgOffset >= loopW) ecgOffset -= loopW;

      if (svg && svg.parentNode) {
        svg.style.transform = 'translateX(' + (-ecgOffset) + 'px)';
      } else {
        rafId = null;
        setTimeout(function () {
          if (isLoginScreen() || !isPortalActive()) startEcgLoop(true);
        }, 50);
        return;
      }
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  }

  function showGears(force) {
    stopRaf();
    var box = ensureBox();
    box.style.cssText =
      'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;' +
      'z-index:0!important;pointer-events:none!important;overflow:hidden!important;' +
      'opacity:1!important;visibility:visible!important;display:block!important;' +
      'background:transparent!important';
    var theme = isLight() ? 'light' : 'dark';
    if (force || !box.querySelector('.dr-spin-cw') || lastTheme !== theme || lastMode !== 'portal') {
      box.innerHTML = gearsSvg();
      lastTheme = theme;
      lastMode = 'portal';
    }
  }

  function tick(force) {
    injectCss();
    try {
      document.body.classList.toggle('is-login', isLoginScreen());
      document.body.classList.toggle('is-portal', isPortalActive());
    } catch (e) {}

    if (isLoginScreen()) {
      lastMode = 'login';
      var theme = isLight() ? 'light' : 'dark';
      var themeChanged = lastTheme !== theme;
      lastTheme = theme;
      startEcgLoop(!!force || themeChanged);
      return;
    }

    if (isPortalActive()) {
      lastMode = 'portal';
      showGears(!!force);
      return;
    }

    lastMode = 'login';
    startEcgLoop(!!force);
  }

  function boot() {
    tick(true);
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { tick(true); });
  }

  [40, 200, 600, 1200, 2500, 4000, 7000].forEach(function (ms) {
    setTimeout(function () { tick(true); }, ms);
  });

  if (keepAlive) clearInterval(keepAlive);
  keepAlive = setInterval(function () {
    if (isPortalActive()) return;
    var alive = document.getElementById('dr-ecg-svg') && document.getElementById(BOX_ID);
    if (!alive || !rafId) tick(true);
  }, 2000);

  window.addEventListener('resize', function () {
    clearTimeout(window.__drHbR);
    window.__drHbR = setTimeout(function () {
      if (!isPortalActive()) tick(true);
    }, 150);
  });

  window.DRHeartbeatDraw = {
    refresh: function () { tick(false); },
    force: function () { tick(true); }
  };
  window.DRGearsBg = window.DRHeartbeatDraw;
})();
