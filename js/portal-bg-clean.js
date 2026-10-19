/**
 * Divine Rays — portal-bg-clean v1
 * On portals: hide login ambient layers (force-light + galaxy) so only portal-shell shows.
 * On login: hide portal ambient, keep single login ambient.
 * Stops background flash/twitch between login ↔ portal.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_BG_CLEAN >= 1) return;
  window.__DR_PORTAL_BG_CLEAN = 1;

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

  function hide(el) {
    if (!el) return;
    try {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('opacity', '0', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
    } catch (e) {}
  }

  function show(el) {
    if (!el) return;
    try {
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
    } catch (e) {}
  }

  function dedupeLoginAmbient() {
    try {
      var layers = document.querySelectorAll('#dr-login-ambient');
      for (var i = 1; i < layers.length; i++) {
        try {
          layers[i].parentNode.removeChild(layers[i]);
        } catch (e) {}
      }
      var amb = document.getElementById('dr-login-ambient');
      if (amb) {
        var hcs = amb.querySelectorAll('.dr-honeycomb');
        for (var h = 1; h < hcs.length; h++) {
          try {
            hcs[h].parentNode.removeChild(hcs[h]);
          } catch (eH) {}
        }
      }
    } catch (e2) {}
  }

  function apply() {
    try {
      var loginAmb = document.getElementById('dr-login-ambient');
      var portalAmb = document.getElementById('dr-portal-ambient');

      if (loginVisible()) {
        hide(portalAmb);
        dedupeLoginAmbient();
        loginAmb = document.getElementById('dr-login-ambient');
        if (loginAmb) show(loginAmb);
        try {
          document.body.classList.add('is-login');
          document.body.classList.remove('dr-portal-ok', 'is-portal');
        } catch (eB) {}
        return;
      }

      if (portalMode()) {
        hide(loginAmb);
        document.querySelectorAll('#dr-login-ambient').forEach(function (n) {
          hide(n);
        });
        if (portalAmb) {
          show(portalAmb);
          portalAmb.setAttribute('data-dr-ready', '1');
        }
        try {
          document.body.classList.remove('is-login');
          document.body.classList.add('dr-portal-ok', 'is-portal');
        } catch (eB2) {}
      }
    } catch (e3) {}
  }

  function patchPainters() {
    try {
      if (window.DRAmbientGalaxy && !window.DRAmbientGalaxy.__drPortalClean) {
        var g = window.DRAmbientGalaxy.refresh;
        window.DRAmbientGalaxy.refresh = function () {
          if (portalMode()) return;
          if (typeof g === 'function') g();
        };
        window.DRAmbientGalaxy.__drPortalClean = 1;
      }
    } catch (e) {}
  }

  apply();
  patchPainters();
  setTimeout(apply, 50);
  setTimeout(apply, 200);
  setTimeout(apply, 500);
  setTimeout(apply, 1000);
  setTimeout(apply, 2000);
  setInterval(function () {
    apply();
    patchPainters();
  }, 2500);

  window.DRPortalBgClean = { v: 1, refresh: apply };
})();
