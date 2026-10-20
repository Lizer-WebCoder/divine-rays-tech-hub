/**
 * Divine Rays - portal-bg-stable v1
 * Stops portal background light flicker caused by:
 * - force-light / galaxy still visible under portal ambient
 * - body background CSS being rewritten
 * - repeated hide/show of ambient layers
 * On portal: one static ambient only (portal-shell gears+honeycomb).
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_BG_STABLE >= 1) return;
  window.__DR_PORTAL_BG_STABLE = 1;

  var STYLE_ID = 'dr-portal-bg-stable-css';
  var lastMode = '';

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (!ls || ls.hidden) return false;
      var st = window.getComputedStyle ? getComputedStyle(ls) : null;
      if (st && (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity || '1') < 0.05))
        return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function portalMode() {
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
      var pref = document.documentElement.getAttribute('data-dr-portal-pref') || '';
      if (pref === 'employee' || pref === 'admin') return true;
    } catch (e) {}
    return false;
  }

  function injectPortalCss() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.is-portal #dr-login-ambient,',
      'body.dr-portal-ok #dr-login-ambient,',
      'html[data-dr-portal-pref] #dr-login-ambient,',
      'body.is-portal-employee #dr-login-ambient,',
      'body.is-portal-admin #dr-login-ambient{',
      'display:none!important;visibility:hidden!important;opacity:0!important;',
      'pointer-events:none!important;animation:none!important}',
      'body.is-portal #dr-login-ambient .dr-star-twinkle,',
      'body.dr-portal-ok #dr-login-ambient .dr-star-twinkle,',
      'body.is-portal #dr-login-ambient .dr-pulse{animation:none!important;opacity:0!important}',
      'body.is-portal,body.dr-portal-ok,body.is-portal-employee,body.is-portal-admin,',
      'html[data-dr-portal-pref] body{',
      'background-color:#0c0618!important;',
      'background-image:radial-gradient(ellipse at 50% 40%,#1e1240 0%,#0c0618 70%)!important;',
      'background-attachment:fixed!important}',
      '#dr-portal-ambient{',
      'display:block!important;visibility:visible!important;opacity:1!important;',
      'pointer-events:none!important;transition:none!important;animation:none!important;',
      'filter:none!important}',
      '#dr-portal-ambient .dr-hc,',
      '#dr-portal-ambient .dr-honeycomb{',
      'opacity:0.40!important;transition:none!important;animation:none!important;',
      'filter:none!important}',
      '#dr-portal-ambient .dr-gears,',
      '#dr-portal-ambient .dr-gears-svg{',
      'opacity:0.95!important;transition:none!important;filter:none!important}',
      'body.is-portal #dr-force-bg-lock{display:none!important}'
    ].join('');
  }

  function hideLoginAmbient() {
    try {
      document.querySelectorAll('#dr-login-ambient').forEach(function (n) {
        n.style.setProperty('display', 'none', 'important');
        n.style.setProperty('visibility', 'hidden', 'important');
        n.style.setProperty('opacity', '0', 'important');
        n.style.setProperty('pointer-events', 'none', 'important');
      });
    } catch (e) {}
  }

  function freezePortalAmbient() {
    try {
      var pa = document.getElementById('dr-portal-ambient');
      if (!pa) return;
      pa.style.setProperty('display', 'block', 'important');
      pa.style.setProperty('visibility', 'visible', 'important');
      pa.style.setProperty('opacity', '1', 'important');
      pa.style.setProperty('transition', 'none', 'important');
      pa.style.setProperty('filter', 'none', 'important');
      pa.setAttribute('data-dr-ready', '1');
      pa.querySelectorAll('.dr-hc, .dr-honeycomb, .dr-gears, .dr-gears-svg').forEach(function (n) {
        try {
          n.style.setProperty('transition', 'none', 'important');
          n.style.setProperty('filter', 'none', 'important');
        } catch (e2) {}
      });
      pa.querySelectorAll('.dr-hc, .dr-honeycomb').forEach(function (n) {
        try {
          n.style.setProperty('opacity', '0.40', 'important');
          n.style.setProperty('animation', 'none', 'important');
        } catch (e3) {}
      });
    } catch (e) {}
  }

  function patchForceLight() {
    try {
      if (window.DRForceLightBg && !window.DRForceLightBg.__drStable) {
        window.DRForceLightBg.refresh = function () {
          if (portalMode()) return;
        };
        window.DRForceLightBg.__drStable = 1;
      }
      var lock = document.getElementById('dr-force-bg-lock');
      if (lock && portalMode()) {
        lock.textContent =
          'html,body,#app-shell{background-color:#0c0618!important;' +
          'background-image:radial-gradient(ellipse at 50% 40%,#1e1240 0%,#0c0618 70%)!important;' +
          'background-attachment:fixed!important}';
      }
    } catch (e) {}
  }

  function patchGalaxy() {
    try {
      if (window.DRAmbientGalaxy && !window.DRAmbientGalaxy.__drStable) {
        var g = window.DRAmbientGalaxy.refresh;
        window.DRAmbientGalaxy.refresh = function () {
          if (portalMode()) return;
          if (typeof g === 'function') g();
        };
        window.DRAmbientGalaxy.__drStable = 1;
      }
    } catch (e) {}
  }

  function patchPortalShell() {
    try {
      if (window.DRPortalShell && window.DRPortalShell.ensureAmbient && !window.DRPortalShell.__drStable) {
        var orig = window.DRPortalShell.ensureAmbient;
        window.DRPortalShell.ensureAmbient = function (forceShow) {
          if (portalMode()) {
            var el = document.getElementById('dr-portal-ambient');
            if (el && el.querySelector('.dr-spin-cw')) {
              freezePortalAmbient();
              return true;
            }
          }
          var r = orig.call(window.DRPortalShell, forceShow);
          if (portalMode()) freezePortalAmbient();
          return r;
        };
        window.DRPortalShell.__drStable = 1;
      }
    } catch (e) {}
  }

  function apply() {
    injectPortalCss();
    if (portalMode()) {
      if (lastMode !== 'portal') lastMode = 'portal';
      hideLoginAmbient();
      freezePortalAmbient();
      patchForceLight();
      patchGalaxy();
      patchPortalShell();
      try {
        document.body.classList.add('dr-portal-ok', 'is-portal');
        document.body.classList.remove('is-login');
      } catch (e) {}
    } else if (loginVisible()) {
      lastMode = 'login';
    }
  }

  apply();
  setTimeout(apply, 100);
  setTimeout(apply, 400);
  setTimeout(apply, 1000);
  setTimeout(apply, 2000);
  setInterval(function () {
    if (!portalMode()) return;
    hideLoginAmbient();
    patchForceLight();
    var pa = document.getElementById('dr-portal-ambient');
    if (pa) {
      var op = pa.style.opacity;
      if (op && op !== '1') freezePortalAmbient();
    }
  }, 3000);

  window.DRPortalBgStable = { v: 1, refresh: apply };
})();
