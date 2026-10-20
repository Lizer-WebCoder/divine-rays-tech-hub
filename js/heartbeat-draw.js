/**
 * Divine Rays — ECG + gears v39
 * Seamless continuous ECG on login — never destroy/rebuild SVG mid-cycle.
 * Fixes: lifeline vanish/reset every few seconds; no opacity 0 flash.
 * Boot elements permanently sealed after login is ready.
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW >= 39) return;
  try {
    if (window.__DR_ECG_TIMER) clearTimeout(window.__DR_ECG_TIMER);
    if (window.__DR_ECG_INTERVAL) clearInterval(window.__DR_ECG_INTERVAL);
  } catch (e0) {}
  window.__DR_HEARTBEAT_DRAW = 39;
  window.__DR_ECG_OK = true;
  try { document.documentElement.setAttribute('data-ecg', 'on'); } catch (e) {}

  var BOX_ID = 'dr-lifeline';
  var CSS_ID = 'dr-heartbeat-css';
  var lastMode = null;
  var __ecgReady = false;

  var ECG_D =
    'M0 50 H40 L50 50 L58 42 L65 50 L78 5 L95 95 L112 50 H170 L180 50 L188 42 L195 50 L208 8 L225 92 L242 50 H300 L310 50 L318 42 L325 50 L338 4 L355 96 L372 50 H430 L440 50 L448 42 L455 50 L468 10 L485 90 L502 50 H560 L570 50 L578 42 L585 50 L598 6 L615 94 L632 50 H690 L700 50 L708 42 L715 50 L720 50';

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
    } catch (e) {}
    return false;
  }

  function sealBoot() {
    try {
      ['boot', 'dr-phase-boot'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.add('is-done', 'dr-skip');
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        try {
          if (el.parentNode) el.parentNode.removeChild(el);
        } catch (eR) {}
      });
      window.__DR_BOOT_DONE = true;
    } catch (e) {}
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
      '@keyframes drEcgLoop{0%{stroke-dashoffset:1600}100%{stroke-dashoffset:0}}',
      '@keyframes drEcgGlowPulse{0%,100%{opacity:0.28}50%{opacity:0.42}}',
      '@keyframes drEcgCorePulse{0%,100%{opacity:0.85}50%{opacity:0.95}}',
      'body.dr-portal-ok #dr-lifeline,body.is-portal #dr-lifeline{opacity:0!important;visibility:hidden!important;pointer-events:none!important}',
      'body.is-login #dr-lifeline{opacity:1!important;visibility:visible!important;display:block!important;z-index:1!important}',
      'body.is-login #dr-lifeline .dr-ecg-core,body.is-login #dr-lifeline .dr-ecg-glow{display:block!important;visibility:visible!important;opacity:1!important}',
      'body.is-login #boot,body.is-login #dr-phase-boot,#boot.is-done,#dr-phase-boot.is-done{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}'
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

  function startContinuousEcg() {
    if (!loginVisible() || isPortalSession() || portalActive()) return;
    if (isBooting()) return;

    sealBoot();
    injectCss();

    var box = ensureBox();
    if (!box) return;

    try {
      document.body.classList.add('is-login');
      document.body.classList.remove('dr-portal-ok', 'is-portal', 'is-portal-employee', 'is-portal-admin');
    } catch (e) {}

    box.style.cssText =
      'position:fixed!important;left:0!important;right:0!important;width:100%!important;' +
      'top:50%!important;height:180px!important;margin-top:-90px!important;' +
      'z-index:1!important;pointer-events:none!important;opacity:1!important;visibility:visible!important;' +
      'background:transparent!important;overflow:visible!important;display:block!important';

    if (box.querySelector('.dr-ecg-core') && __ecgReady) {
      lastMode = 'login';
      return;
    }

    var core = isLight() ? '#7c3aed' : '#f3e8ff';
    var glow = isLight() ? 'rgba(167,139,250,0.45)' : 'rgba(233,213,255,0.42)';
    var fid = 'drEcgBlurV39';

    box.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 100" preserveAspectRatio="none" width="100%" height="100%" style="display:block;overflow:visible">' +
      '<defs><filter id="' + fid + '" x="-25%" y="-60%" width="150%" height="220%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<path class="dr-ecg-glow" fill="none" stroke="' + glow + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#' + fid + ')" d="' + ECG_D + '"/>' +
      '<path class="dr-ecg-core" fill="none" stroke="' + core + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="' + ECG_D + '"/>' +
      '</svg>';

    var paths = box.querySelectorAll('.dr-ecg-core, .dr-ecg-glow');
    var len = 1600;
    try {
      var coreP = box.querySelector('.dr-ecg-core');
      if (coreP) {
        var L = coreP.getTotalLength();
        if (L && L > 700) len = L;
      }
    } catch (eL) {}

    for (var i = 0; i < paths.length; i++) {
      var p = paths[i];
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
      if (p.classList.contains('dr-ecg-core')) {
        p.style.animation =
          'drEcgLoop 12s linear infinite, drEcgCorePulse 2.4s ease-in-out infinite';
      } else {
        p.style.animation =
          'drEcgLoop 12s linear infinite, drEcgGlowPulse 2.4s ease-in-out infinite';
      }
    }

    __ecgReady = true;
    lastMode = 'login';
    window.__DR_ECG_DRAWN = 1;
  }

  function ensureGears(force) {
    injectCss();
    var portal = isPortalSession() || portalActive();

    if (isBooting() && !portal) return;

    if (!portal) {
      if (!loginVisible()) return;
      startContinuousEcg();
      return;
    }

    __ecgReady = false;
    lastMode = 'portal';
    try {
      var box = document.getElementById(BOX_ID);
      if (box) {
        box.innerHTML = '';
        box.style.opacity = '0';
        box.style.visibility = 'hidden';
      }
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
      return !!(amb && amb.querySelector('.dr-spin-cw') && amb.querySelector('animateTransform'));
    } catch (e) {
      return false;
    }
  }

  function tick() {
    injectCss();
    try {
      if (loginVisible() && !isPortalSession()) {
        sealBoot();
        startContinuousEcg();
      } else {
        ensureGears(false);
      }
    } catch (e) {}
  }

  injectCss();
  setTimeout(tick, 80);
  setTimeout(tick, 400);
  setTimeout(tick, 1000);
  setTimeout(tick, 2000);
  setInterval(function () {
    if (loginVisible() && !isPortalSession()) {
      sealBoot();
      if (!document.querySelector('#dr-lifeline .dr-ecg-core')) startContinuousEcg();
    }
  }, 4000);

  window.DRHeartbeatDraw = {
    force: function () {
      __ecgReady = false;
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
    v: 39
  };
})();
