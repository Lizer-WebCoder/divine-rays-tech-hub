/**
 * Divine Rays — heartbeat / ECG lifeline v15
 * CSS-driven continuous ECG on login (no RAF glitches / no disappear)
 * Portal: spinning gears
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  try { delete window.__DR_HEARTBEAT_DRAW; } catch (e0) {}
  window.__DR_HEARTBEAT_DRAW = 15;

  var CSS_ID = 'dr-hb-v15';
  var BOX_ID = 'dr-lifeline';
  var mode = null;
  var theme = null;

  function isLight() {
    try {
      if (document.documentElement.getAttribute('data-theme') === 'light') return true;
      return localStorage.getItem('dr_theme') === 'light';
    } catch (e) {
      return false;
    }
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

  function portalVisible() {
    if (loginVisible()) return false;
    try {
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      if (pa && pa.classList.contains('active')) return true;
      if (pc && pc.classList.contains('active')) return true;
    } catch (e) {}
    return false;
  }

  function wantLogin() {
    if (loginVisible()) return true;
    if (portalVisible()) return false;
    return true;
  }

  var ECG_UNIT =
    'M0 50 H40 L48 50 L54 40 L60 50 L72 5 L90 95 L108 50 H160 ' +
    'L168 50 L174 40 L180 50 L192 8 L210 92 L228 50 H280 ' +
    'L288 50 L294 40 L300 50 L312 6 L330 94 L348 50 H400';

  function buildEcg() {
    var core = isLight() ? '#6d28d9' : '#f3e8ff';
    var glow = isLight() ? '#a78bfa' : '#e9d5ff';
    var d =
      ECG_UNIT +
      ' ' + ECG_UNIT.replace(/M0 /g, 'M400 ') +
      ' ' + ECG_UNIT.replace(/M0 /g, 'M800 ') +
      ' ' + ECG_UNIT.replace(/M0 /g, 'M1200 ');
    return (
      '<div class="dr-ecg-track" style="position:absolute;left:0;top:50%;width:300%;height:260px;margin-top:-130px;' +
      'animation:drEcgScroll 9s linear infinite;will-change:transform;' +
      'filter:drop-shadow(0 0 8px ' + glow + ') drop-shadow(0 0 18px ' + glow + ')">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 100" preserveAspectRatio="none" ' +
      'width="100%" height="100%" style="display:block;overflow:visible">' +
      '<path fill="none" stroke="' + glow + '" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.45" d="' + d + '"/>' +
      '<path class="dr-ecg-core" fill="none" stroke="' + core + '" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" d="' + d + '"/>' +
      '</svg></div>'
    );
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
    d += ' M' + holeR + ' 0 A' + holeR + ' ' + holeR + ' 0 1 0 ' + -holeR +
      ' 0 A' + holeR + ' ' + holeR + ' 0 1 0 ' + holeR + ' 0 Z';
    return d;
  }

  function oneGear(cls, fill, teeth, outer, inner, hole, cx, cy, scale) {
    return (
      '<g class="' + cls + '" transform="translate(' + cx + ' ' + cy + ') scale(' + scale + ')">' +
      '<path d="' + gearPath(teeth, outer, inner, hole) + '" fill="' + fill + '" fill-rule="evenodd"/>' +
      '<circle cx="0" cy="0" r="' + (hole * 0.55).toFixed(1) + '" fill="' + fill + '" opacity="0.85"/>' +
      '</g>'
    );
  }

  function buildGears() {
    var c = isLight()
      ? { a: '#7c6af0', b: '#9b8af5', c: '#b8a9fc', o: '0.35' }
      : { a: '#a78bfa', b: '#8b7cf0', c: '#6d5ef5', o: '0.42' };
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" ' +
      'width="100%" height="100%" style="display:block;opacity:' + c.o + '">' +
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

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#' + BOX_ID + '{',
      'position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;',
      'z-index:1!important;pointer-events:none!important;overflow:hidden!important;',
      'background:transparent!important;opacity:1!important;visibility:visible!important;',
      'display:block!important;margin:0!important;padding:0!important}',
      '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
      '@keyframes drEcgScroll{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}',
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
    box.style.cssText =
      'position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;' +
      'z-index:1!important;pointer-events:none!important;overflow:hidden!important;' +
      'opacity:1!important;visibility:visible!important;display:block!important;' +
      'background:transparent!important';
    return box;
  }

  function showLogin(force) {
    injectCss();
    try {
      document.body.classList.add('is-login');
      document.body.classList.remove('is-portal');
    } catch (e) {}
    var box = ensureBox();
    var t = isLight() ? 'light' : 'dark';
    var ok = box.querySelector('.dr-ecg-core') && box.querySelector('.dr-ecg-track');
    if (force || !ok || theme !== t || mode !== 'login') {
      box.innerHTML = buildEcg();
      theme = t;
    }
    mode = 'login';
  }

  function showPortal(force) {
    injectCss();
    try {
      document.body.classList.add('is-portal');
      document.body.classList.remove('is-login');
    } catch (e) {}
    var box = ensureBox();
    var t = isLight() ? 'light' : 'dark';
    if (force || !box.querySelector('.dr-spin-cw') || theme !== t || mode !== 'portal') {
      box.innerHTML = buildGears();
      theme = t;
    }
    mode = 'portal';
  }

  function sync(force) {
    if (wantLogin()) showLogin(!!force);
    else showPortal(!!force);
  }

  function boot() {
    if (!document.body) {
      setTimeout(boot, 20);
      return;
    }
    sync(true);
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { sync(true); });
  }
  setTimeout(function () { sync(true); }, 80);
  setTimeout(function () {
    if (!document.querySelector('#dr-lifeline .dr-ecg-core')) sync(true);
  }, 400);

  setInterval(function () {
    if (portalVisible()) {
      if (mode !== 'portal') showPortal(false);
      return;
    }
    if (!document.querySelector('#dr-lifeline .dr-ecg-core')) showLogin(true);
  }, 3000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-theme' || t.id === 'dr-login-theme' || (t.classList && t.classList.contains('btn-theme')))) {
        setTimeout(function () { sync(true); }, 50);
      }
    },
    true
  );

  window.DRHeartbeatDraw = {
    refresh: function () { sync(false); },
    force: function () { sync(true); }
  };
  window.DRGearsBg = window.DRHeartbeatDraw;
})();
