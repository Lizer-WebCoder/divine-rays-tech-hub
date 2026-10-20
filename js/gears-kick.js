/**
 * Divine Rays - gears-kick v1
 * After portal paints / post-login fade, SMIL gears often stay frozen until a
 * hard refresh. Force-restart every animateTransform once the ambient is visible.
 */
(function () {
  'use strict';
  if (window.__DR_GEARS_KICK >= 1) return;
  window.__DR_GEARS_KICK = 1;

  var lastKick = 0;

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

  function restartSmil(root) {
    if (!root) return 0;
    var n = 0;
    try {
      root.querySelectorAll('animateTransform, animate, animateMotion').forEach(function (a) {
        try {
          if (typeof a.beginElement === 'function') {
            a.beginElement();
            n++;
          } else {
            var parent = a.parentNode;
            if (parent) {
              var clone = a.cloneNode(true);
              parent.replaceChild(clone, a);
              n++;
            }
          }
        } catch (e1) {
          try {
            var p = a.parentNode;
            if (p) {
              p.appendChild(a);
              n++;
            }
          } catch (e2) {}
        }
      });
    } catch (e) {}
    return n;
  }

  function kick(force) {
    if (!portalMode()) return;
    var now = Date.now();
    if (!force && now - lastKick < 800) return;
    lastKick = now;
    try {
      var amb = document.getElementById('dr-portal-ambient');
      if (!amb) {
        if (window.DRPortalShell && window.DRPortalShell.ensureAmbient) {
          window.DRPortalShell.ensureAmbient(true);
          amb = document.getElementById('dr-portal-ambient');
        }
      }
      if (!amb) return;
      amb.style.setProperty('display', 'block', 'important');
      amb.style.setProperty('visibility', 'visible', 'important');
      amb.style.setProperty('opacity', '1', 'important');
      var gears = amb.querySelector('.dr-gears, .dr-gears-svg') || amb;
      restartSmil(gears);
      setTimeout(function () {
        restartSmil(document.getElementById('dr-portal-ambient'));
      }, 120);
      setTimeout(function () {
        restartSmil(document.getElementById('dr-portal-ambient'));
      }, 400);
    } catch (e) {}
  }

  function onLoaderGone() {
    kick(true);
    setTimeout(function () {
      kick(true);
    }, 300);
    setTimeout(function () {
      kick(true);
    }, 900);
  }

  function watchLoader() {
    try {
      var ids = ['dr-post-login-boot', 'dr-portal-loader', 'dr-phase-boot'];
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el || el.__drKickObs) return;
        el.__drKickObs = true;
        var obs = new MutationObserver(function () {
          try {
            if (
              el.classList.contains('is-done') ||
              el.classList.contains('is-fading') ||
              el.classList.contains('is-gone') ||
              el.style.display === 'none' ||
              el.style.opacity === '0'
            ) {
              onLoaderGone();
            }
          } catch (e) {}
        });
        obs.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
      });
    } catch (e) {}
  }

  function earlyWarm() {
    if (!portalMode() && !document.documentElement.classList.contains('dr-post-login')) return;
    try {
      if (window.DRPortalShell && window.DRPortalShell.ensureAmbient) {
        window.DRPortalShell.ensureAmbient(true);
      }
      kick(true);
    } catch (e) {}
  }

  earlyWarm();
  watchLoader();
  setTimeout(earlyWarm, 200);
  setTimeout(earlyWarm, 600);
  setTimeout(watchLoader, 400);
  setTimeout(function () {
    kick(true);
  }, 1000);
  setTimeout(function () {
    kick(true);
  }, 1800);
  setTimeout(function () {
    kick(true);
  }, 2800);

  document.addEventListener(
    'visibilitychange',
    function () {
      if (!document.hidden && portalMode()) kick(true);
    },
    true
  );

  window.DRGearsKick = { v: 1, kick: kick };
})();
