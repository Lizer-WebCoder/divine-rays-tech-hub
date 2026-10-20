/**
 * Divine Rays - portal-bg-clean v2
 * Keep login ambient and portal ambient mutually exclusive.
 * portalMode requires a real active portal panel — never pref alone.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_BG_CLEAN >= 2) return;
  window.__DR_PORTAL_BG_CLEAN = 2;

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
      if (document.body && document.body.classList.contains('is-login') && !document.body.classList.contains('dr-portal-ok'))
        return false;
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (pc && pc.classList.contains('active')) {
        try {
          var st = getComputedStyle(pc);
          if (st.display !== 'none' && st.visibility !== 'hidden') return true;
        } catch (e1) { return true; }
      }
      if (pa && pa.classList.contains('active')) {
        try {
          var st2 = getComputedStyle(pa);
          if (st2.display !== 'none' && st2.visibility !== 'hidden') return true;
        } catch (e2) { return true; }
      }
      if (
        document.body &&
        (document.body.classList.contains('dr-portal-ok') ||
          document.body.classList.contains('is-portal') ||
          document.body.classList.contains('is-portal-employee') ||
          document.body.classList.contains('is-portal-admin'))
      ) {
        if ((pc && pc.classList.contains('active')) || (pa && pa.classList.contains('active'))) return true;
      }
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
    } catch (e2) {}
  }

  function apply() {
    try {
      var loginAmb = document.getElementById('dr-login-ambient');
      var portalAmb = document.getElementById('dr-portal-ambient');
      dedupeLoginAmbient();
      if (loginVisible()) {
        try {
          document.body.classList.add('is-login');
          document.body.classList.remove('dr-portal-ok', 'is-portal');
        } catch (e) {}
        hide(portalAmb);
        if (loginAmb) show(loginAmb);
        return;
      }
      if (portalMode()) {
        try {
          document.body.classList.add('dr-portal-ok', 'is-portal');
          document.body.classList.remove('is-login');
        } catch (e) {}
        hide(loginAmb);
        if (portalAmb) show(portalAmb);
        return;
      }
      hide(portalAmb);
    } catch (e) {}
  }

  apply();
  setTimeout(apply, 50);
  setTimeout(apply, 200);
  setTimeout(apply, 600);
  setTimeout(apply, 1500);
  setInterval(apply, 4000);
  window.DRPortalBgClean = { v: 2, refresh: apply };
})();
