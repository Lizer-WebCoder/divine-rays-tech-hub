/**
 * Divine Rays — ECG + gears v37
 * Login: full ECG lifeline centered in #dr-lifeline.
 * Portal: #dr-lifeline cleared — spinning gears live in portal-shell ambient only.
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW >= 37) return;
  try {
    if (window.__DR_ECG_TIMER) clearTimeout(window.__DR_ECG_TIMER);
    if (window.__DR_ECG_INTERVAL) clearInterval(window.__DR_ECG_INTERVAL);
  } catch (e0) {}
  window.__DR_HEARTBEAT_DRAW = 37;

  var BOX_ID = 'dr-lifeline';
  var CSS_ID = 'dr-heartbeat-css';
  var lastMode = null;
  var lastTheme = null;
  var lastEcgWidth = 0;
  var ecgIndex = 0;
  var __ecgBusy = false;
  var ECG_SPEED_PX_PER_SEC = 95;

  var ECG_PATTERNS = [
    'M0 50 H40 L50 50 L58 42 L65 50 L78 5 L95 95 L112 50 H170 L180 50 L188 42 L195 50 L208 8 L225 92 L242 50 H300 L310 50 L318 42 L325 50 L338 4 L355 96 L372 50 H430 L440 50 L448 42 L455 50 L468 10 L485 90 L502 50 H560 L570 50 L578 42 L585 50 L598 6 L615 94 L632 50 H690 L700 50 L708 42 L715 50 L720 50',
    'M0 50 H35 L45 50 L52 40 L60 50 L72 12 L88 88 L105 50 H160 L170 50 L178 38 L186 50 L200 0 L218 100 L235 50 H295 L305 50 L313 42 L320 50 L335 15 L350 85 L365 50 H425 L435 50 L443 40 L450 50 L465 8 L480 92 L495 50 H555 L565 50 L573 42 L580 50 L595 5 L612 95 L628 50 H685 L695 50 L705 45 L715 50 L720 50',
    'M0 50 H50 L60 50 L68 44 L75 50 L90 18 L105 82 L120 50 H180 L190 50 L198 40 L205 50 L220 10 L238 90 L255 50 H320 L330 50 L338 42 L345 50 L360 20 L375 80 L390 50 H450 L460 50 L468 38 L475 50 L490 5 L508 95 L525 50 H585 L595 50 L603 42 L610 50 L625 12 L640 88 L655 50 H710 L720 50'
  ];

  function isLight() {
    try {
      return (
        document.documentElement.getAttribute('data-theme') === 'light' ||
        document.body.classList.contains('theme-light')
      );
    } catch (e) {
      return false;
    }
  }
  function themeKey() {
    return isLight() ? 'l' : 'd';
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

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (!ls || ls.hidden) return false;
      var st = window.getComputedStyle ? getComputedStyle(ls) : null;
      if (
        st &&
        (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity || '1') < 0.05)
      )
        return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function portalActive() {
    try {
      if (loginVisible()) return false;
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

  function isPortalSession() {
    try {
      if (loginVisible()) return false;
      if (portalActive()) return true;
      var pref = document.documentElement.getAttribute('data-dr-portal-pref') || '';
      if ((pref === 'employee' || pref === 'admin') && !loginVisible()) return true;
      var tab = sessionStorage.getItem('dr_login_tab') || '';
      if ((tab === 'customer' || tab === 'agent') && !loginVisible()) return true;
    } catch (e) {}
    return false;
  }

  function ecgStroke() {
    return isLight() ? '#7c3aed' : '#f3e8ff';
  }
  function ecgGlowStroke() {
    return isLight() ? 'rgba(167,139,250,0.45)' : 'rgba(233,213,255,0.42)';
  }

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#' + BOX_ID + '{z-index:1!important;pointer-events:none!important;overflow:visible!important;background:transparent!important;filter:none!important}',
      '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
      '#dr-lifeline svg{width:100%;height:100%;display:block;overflow:visible}',
      '@keyframes drEcgGlowPulse{0%,100%{opacity:0.28}50%{opacity:0.42}}',
      '@keyframes drEcgCorePulse{0%,100%{opacity:0.85}50%{opacity:0.95}}',
      'body.dr-portal-ok #dr-lifeline,body.is-portal #dr-lifeline,html[data-dr-portal-pref] body:not(.is-login) #dr-lifeline{',
      'opacity:0!important;visibility:hidden!important;pointer-events:none!important}',
      'body.is-login #dr-lifeline{opacity:1!important;visibility:visible!important;display:block!important;z-index:1!important}',
      'body.is-login #dr-lifeline .dr-ecg-core,body.is-login #dr-lifeline .dr-ecg-glow{display:block!important;visibility:visible!important}'
    ].join('');
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
    } catch (e) {
      return 1200;
    }
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
    el.textContent =
      '@keyframes ' + animName + '{0%{stroke-dashoffset:' + len + '}100%{stroke-dashoffset:0}}';
  }

  function ecgMarkup() {
    var d = ECG_PATTERNS[ecgIndex % ECG_PATTERNS.length];
    var core = ecgStroke();
    var glow = ecgGlowStroke();
    var fid = 'drEcgBlur' + Date.now();
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 100" preserveAspectRatio="none" width="100%" height="100%" style="display:block;overflow:visible">' +
      '<defs><filter id="' +
      fid +
      '" x="-25%" y="-60%" width="150%" height="220%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<path class="dr-ecg-glow" fill="none" stroke="' +
      glow +
      '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#' +
      fid +
      ')" opacity="0.55" d="' +
      d +
      '"/>' +
      '<path class="dr-ecg-core" fill="none" stroke="' +
      core +
      '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="' +
      d +
      '"/>' +
      '</svg>'
    );
  }

  function clearEcgTimer() {
    try {
      if (window.__DR_ECG_TIMER) clearTimeout(window.__DR_ECG_TIMER);
    } catch (e) {}
    window.__DR_ECG_TIMER = null;
  }

  function runEcgCycle() {
    if (__ecgBusy) return;
    if (!loginVisible()) return;
    if (isPortalSession() || portalActive()) return;
    __ecgBusy = true;
    clearEcgTimer();

    var box = ensureBox();
    if (!box) {
      __ecgBusy = false;
      return;
    }
    if (box.parentNode !== document.body) document.body.insertBefore(box, document.body.firstChild);

    box.style.cssText =
      'position:fixed!important;left:0!important;right:0!important;width:100%!important;' +
      'top:50%!important;height:180px!important;margin-top:-90px!important;' +
      'z-index:1!important;pointer-events:none!important;opacity:0!important;visibility:visible!important;' +
      'background:transparent!important;overflow:visible!important;transition:opacity 0.35s ease-out!important;display:block!important';

    box.innerHTML = ecgMarkup();
    var paths = box.querySelectorAll('.dr-ecg-core, .dr-ecg-glow');
    if (!paths.length) {
      __ecgBusy = false;
      return;
    }

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
    ecgIndex++;

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
        pj.style.animation =
          animName + ' ' + durCss + ' linear forwards, drEcgCorePulse 2.4s ease-in-out infinite';
      } else {
        pj.style.animation =
          animName + ' ' + durCss + ' linear forwards, drEcgGlowPulse 2.4s ease-in-out infinite';
      }
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        try {
          box.style.opacity = '1';
        } catch (eOp) {}
      });
    });

    __ecgBusy = false;
    try {
      window.__DR_ECG_DRAWN = 1;
    } catch (eD) {}

    try {
      window.__DR_ECG_TIMER = setTimeout(function () {
        if (loginVisible() && !isPortalSession()) runEcgCycle();
      }, Math.max(dur * 1000 + 400, 9000));
    } catch (eT) {}
  }

  function ensureGears(force) {
    injectCss();
    var portal = isPortalSession() || portalActive();

    if (isBooting() && !portal) return;

    var box = ensureBox();
    if (!box) return;

    if (!portal) {
      if (!loginVisible()) return;
      try {
        document.body.classList.add('is-login');
        document.body.classList.remove('dr-portal-ok', 'is-portal');
      } catch (e) {}
      if (box.querySelector('.dr-ecg-core') && !force) {
        lastMode = 'login';
        return;
      }
      lastMode = 'login';
      runEcgCycle();
      return;
    }

    clearEcgTimer();
    lastMode = 'portal';
    try {
      if (box.querySelector('.dr-ecg-core') || box.querySelector('.dr-spin-cw')) {
        box.innerHTML = '';
      }
      box.style.opacity = '0';
      box.style.visibility = 'hidden';
    } catch (e2) {}
    try {
      if (window.DRPortalShell && window.DRPortalShell.ensureAmbient) {
        window.DRPortalShell.ensureAmbient(true);
      }
    } catch (e3) {}
  }

  function isGearsReady() {
    try {
      var amb = document.getElementById('dr-portal-ambient');
      if (amb && amb.querySelector('.dr-spin-cw') && amb.querySelector('animateTransform')) return true;
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
  setTimeout(tick, 80);
  setTimeout(tick, 400);
  setTimeout(tick, 1000);
  setTimeout(tick, 2000);
  setInterval(tick, 5000);

  window.DRHeartbeatDraw = {
    force: function () {
      ensureGears(true);
    },
    kickGears: function () {
      try {
        if (window.DRPortalShell && window.DRPortalShell.ensureAmbient)
          window.DRPortalShell.ensureAmbient(true);
      } catch (e) {}
    },
    ensureGears: ensureGears,
    isGearsReady: isGearsReady,
    refresh: tick,
    v: 37
  };
  window.DRGearsBg = window.DRHeartbeatDraw;
})();
