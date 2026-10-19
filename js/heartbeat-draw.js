/**
 * Divine Rays — ECG + gears v35 — SMIL spin; portal-first paint
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW >= 35) return;
  try {
    if (window.__DR_ECG_TIMER) clearTimeout(window.__DR_ECG_TIMER);
    if (window.__DR_ECG_INTERVAL) clearInterval(window.__DR_ECG_INTERVAL);
  } catch (e0) {}
  window.__DR_HEARTBEAT_DRAW = 35;

  var BOX_ID = 'dr-lifeline';
  var CSS_ID = 'dr-gears-bg-v35';
  var lastMode = null;
  var lastTheme = null;

  function themeKey() {
    try {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function isBooting() {
    try {
      if (window.__DR_BOOT_DONE === true) return false;
      var b = document.getElementById('boot');
      var p = document.getElementById('dr-phase-boot');
      if (b && !b.classList.contains('is-done') && !b.classList.contains('dr-skip')) {
        var st = getComputedStyle(b);
        if (st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity || '1') > 0.05)
          return true;
      }
      if (p && !p.classList.contains('is-done')) {
        var st2 = getComputedStyle(p);
        if (st2.display !== 'none' && st2.visibility !== 'hidden') return true;
      }
    } catch (e) {}
    return false;
  }

  function isPortalSession() {
    try {
      var tab = sessionStorage.getItem('dr_login_tab') || '';
      var pref = sessionStorage.getItem('dr_dev_portal_pref') || '';
      if (tab === 'customer' || tab === 'agent') return true;
      if (pref === 'employee' || pref === 'admin') return true;
      var dp = document.documentElement.getAttribute('data-dr-portal-pref') || '';
      if (dp === 'employee' || dp === 'admin') return true;
    } catch (e) {}
    return false;
  }

  function portalActive() {
    try {
      if (
        document.body &&
        (document.body.classList.contains('dr-portal-ok') ||
          document.body.classList.contains('is-portal') ||
          document.body.classList.contains('is-portal-employee') ||
          document.body.classList.contains('is-portal-admin'))
      )
        return true;
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (pc && pc.classList.contains('active')) return true;
      if (pa && pa.classList.contains('active')) return true;
    } catch (e) {}
    return false;
  }

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen');
      if (!ls) return false;
      if (ls.hidden) return false;
      var st = window.getComputedStyle ? getComputedStyle(ls) : null;
      if (st && (st.display === 'none' || st.visibility === 'hidden')) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function colors() {
    return {
      a: 'rgba(139,92,246,0.22)',
      b: 'rgba(167,139,250,0.18)',
      c: 'rgba(109,90,154,0.20)',
      opacity: '0.95'
    };
  }

  function gearPath(teeth, outer, inner, hole) {
    var pts = [];
    var step = (Math.PI * 2) / teeth;
    for (var i = 0; i < teeth; i++) {
      var a0 = i * step;
      var a1 = a0 + step * 0.35;
      var a2 = a0 + step * 0.5;
      var a3 = a0 + step * 0.85;
      pts.push([Math.cos(a0) * outer, Math.sin(a0) * outer]);
      pts.push([Math.cos(a1) * outer, Math.sin(a1) * outer]);
      pts.push([Math.cos(a2) * inner, Math.sin(a2) * inner]);
      pts.push([Math.cos(a3) * inner, Math.sin(a3) * inner]);
    }
    var d = 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2);
    for (var j = 1; j < pts.length; j++) d += 'L' + pts[j][0].toFixed(2) + ' ' + pts[j][1].toFixed(2);
    d += 'Z';
    d += 'M' + hole + ' 0A' + hole + ' ' + hole + ' 0 1 0 ' + -hole + ' 0A' + hole + ' ' + hole + ' 0 1 0 ' + hole + ' 0Z';
    return d;
  }

  function oneGear(cls, fill, teeth, outer, inner, hole, cx, cy, scale, dur, ccw) {
    var d = gearPath(teeth, outer, inner, hole);
    var s = scale || 1;
    var to = ccw ? '-360' : '360';
    var sec = dur || 30;
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
      '<animateTransform attributeName="transform" type="rotate" from="0 0 0" to="' +
      to +
      ' 0 0" dur="' +
      sec +
      's" repeatCount="indefinite"/>' +
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
      oneGear('dr-spin-cw', c.a, 12, 90, 62, 22, 180, 200, 1.15, 30, 0) +
      oneGear('dr-spin-ccw', c.b, 10, 70, 48, 18, 340, 280, 1, 24, 1) +
      oneGear('dr-spin-cw-fast', c.c, 14, 110, 76, 26, 620, 180, 1.25, 18, 0) +
      oneGear('dr-spin-ccw-slow', c.a, 9, 55, 38, 14, 900, 320, 0.95, 36, 1) +
      oneGear('dr-spin-cw', c.b, 11, 80, 55, 20, 1050, 160, 1.1, 28, 0) +
      oneGear('dr-spin-ccw', c.c, 13, 95, 66, 24, 480, 480, 1.05, 22, 1) +
      oneGear('dr-spin-cw-fast', c.a, 8, 48, 32, 12, 200, 520, 0.9, 16, 0) +
      oneGear('dr-spin-ccw-slow', c.b, 12, 88, 60, 20, 780, 520, 1, 34, 1) +
      '</svg>'
    );
  }

  var CSS = [
    '#' + BOX_ID + '{z-index:0!important;pointer-events:none!important;overflow:visible!important;background:transparent!important;filter:none!important}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important;filter:none!important;-webkit-filter:none!important}',
    '#dr-lifeline svg{width:100%;height:100%;display:block;overflow:visible}',
    '#login-screen,.login-screen{position:relative!important;z-index:2!important}'
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
      document.body.insertBefore(box, document.body.firstChild);
    }
    return box;
  }

  function clearEcgTimer() {
    try {
      if (window.__DR_ECG_TIMER) clearTimeout(window.__DR_ECG_TIMER);
    } catch (e) {}
    window.__DR_ECG_TIMER = null;
  }

  function runEcgCycle() {
    /* ECG path kept minimal — login only */
    lastMode = 'login';
  }

  function recolorEcgOnly() {}

  function ensureGears(force) {
    injectCss();
    var portal = false;
    try {
      portal =
        isPortalSession() ||
        portalActive() ||
        document.documentElement.getAttribute('data-dr-portal-pref') === 'employee' ||
        document.documentElement.getAttribute('data-dr-portal-pref') === 'admin' ||
        (document.body &&
          (document.body.classList.contains('dr-portal-ok') ||
            document.body.classList.contains('is-portal')));
    } catch (e0) {}

    if (isBooting() && !portal) return;

    var box = ensureBox();
    if (!box) return;

    if (!portal) {
      if (!loginVisible()) return;
      box.style.display = 'block';
      lastMode = 'login';
      return;
    }

    clearEcgTimer();
    if (box.parentNode !== document.body) document.body.insertBefore(box, document.body.firstChild);
    box.style.cssText =
      'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;' +
      'z-index:0!important;pointer-events:none!important;overflow:hidden!important;opacity:1!important;display:block!important;filter:none!important;visibility:visible!important';

    var hasSpin = !!box.querySelector('.dr-spin-cw');
    var hasAnim = !!box.querySelector('animateTransform');
    if (force || !hasSpin || !hasAnim || lastMode !== 'portal') {
      box.innerHTML = svgMarkup();
      lastTheme = themeKey();
      lastMode = 'portal';
    }
    try {
      document.documentElement.setAttribute('data-dr-gears-ready', '1');
    } catch (e1) {}
  }

  function isGearsReady() {
    try {
      var box = document.getElementById(BOX_ID);
      return !!(box && box.querySelector('.dr-spin-cw') && box.querySelector('animateTransform'));
    } catch (e) {
      return false;
    }
  }

  function tick() {
    injectCss();
    try {
      ensureGears(false);
    } catch (e) {}
  }

  injectCss();
  setTimeout(tick, 50);
  setTimeout(tick, 300);
  setTimeout(tick, 800);
  setTimeout(tick, 1600);
  setInterval(tick, 4000);

  window.DRHeartbeatDraw = {
    force: function () {
      ensureGears(true);
    },
    kickGears: function () {
      ensureGears(true);
    },
    ensureGears: ensureGears,
    isGearsReady: isGearsReady,
    refresh: tick,
    v: 35
  };
  window.DRGearsBg = window.DRHeartbeatDraw;
})();
