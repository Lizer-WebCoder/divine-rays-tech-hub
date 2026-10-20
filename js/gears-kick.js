/**
 * Divine Rays - gears-kick v2
 * Single SMIL restart after post-login (no multi-kick shake).
 * Earlier v1 called beginElement many times → gears looked like they were resetting.
 */
(function () {
  'use strict';
  if (window.__DR_GEARS_KICK >= 2) return;
  window.__DR_GEARS_KICK = 2;

  var kickedThisCycle = false;
  var lastKickAt = 0;

  function portalMode() {
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
      var pref = document.documentElement.getAttribute('data-dr-portal-pref') || '';
      if (pref === 'employee' || pref === 'admin') return true;
    } catch (e) {}
    return false;
  }

  function hasGears() {
    try {
      var amb = document.getElementById('dr-portal-ambient');
      return !!(amb && amb.querySelector('animateTransform'));
    } catch (e) {
      return false;
    }
  }

  function ensurePainted() {
    try {
      var amb = document.getElementById('dr-portal-ambient');
      if (!amb && window.DRPortalShell && window.DRPortalShell.ensureAmbient) {
        window.DRPortalShell.ensureAmbient(true);
        amb = document.getElementById('dr-portal-ambient');
      }
      if (!amb) return null;
      amb.style.setProperty('display', 'block', 'important');
      amb.style.setProperty('visibility', 'visible', 'important');
      amb.style.setProperty('opacity', '1', 'important');
      return amb;
    } catch (e) {
      return null;
    }
  }

  function restartSmilOnce(root) {
    if (!root) return 0;
    var n = 0;
    try {
      root.querySelectorAll('animateTransform').forEach(function (a) {
        try {
          if (typeof a.beginElement === 'function') {
            a.beginElement();
            n++;
          }
        } catch (e1) {}
      });
    } catch (e) {}
    return n;
  }

  function kickOnce() {
    if (!portalMode()) return;
    if (kickedThisCycle) return;
    var now = Date.now();
    if (now - lastKickAt < 2000) return;
    kickedThisCycle = true;
    lastKickAt = now;
    var amb = ensurePainted();
    if (!amb) {
      kickedThisCycle = false;
      return;
    }
    restartSmilOnce(amb);
  }

  function warmOnly() {
    if (!portalMode() && !document.documentElement.classList.contains('dr-post-login')) return;
    ensurePainted();
  }

  function onLoaderLeaving() {
    setTimeout(function () {
      kickOnce();
    }, 180);
  }

  function watchLoader() {
    try {
      var el = document.getElementById('dr-post-login-boot');
      if (!el || el.__drKickObsV2) return;
      el.__drKickObsV2 = true;
      var fired = false;
      var obs = new MutationObserver(function () {
        if (fired) return;
        try {
          if (
            el.classList.contains('is-fading') ||
            el.classList.contains('is-done') ||
            el.classList.contains('is-gone') ||
            el.style.display === 'none'
          ) {
            fired = true;
            onLoaderLeaving();
            try {
              obs.disconnect();
            } catch (eD) {}
          }
        } catch (e) {}
      });
      obs.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
    } catch (e) {}
  }

  try {
    if (
      sessionStorage.getItem('dr_skip_boot_gear') === '1' ||
      sessionStorage.getItem('dr_post_login_boot') === '1'
    ) {
      kickedThisCycle = false;
    }
  } catch (e) {}

  warmOnly();
  watchLoader();
  setTimeout(warmOnly, 300);
  setTimeout(watchLoader, 500);
  setTimeout(function () {
    if (portalMode()) {
      ensurePainted();
      var pl = document.getElementById('dr-post-login-boot');
      if (
        !kickedThisCycle &&
        hasGears() &&
        pl &&
        (pl.classList.contains('is-done') ||
          pl.classList.contains('is-fading') ||
          pl.style.display === 'none')
      ) {
        kickOnce();
      }
    }
  }, 1600);

  document.addEventListener(
    'visibilitychange',
    function () {
      if (document.hidden || !portalMode()) return;
      if (!hasGears()) {
        ensurePainted();
        kickedThisCycle = false;
        kickOnce();
      }
    },
    true
  );

  window.DRGearsKick = {
    v: 2,
    kick: function () {
      kickedThisCycle = false;
      kickOnce();
    }
  };
})();
