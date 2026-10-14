/**
 * Divine Rays — portal boot after login v1
 * Success toast + spinning gear boot overlay until portal ready.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_BOOT_LOGIN >= 1) return;
  window.__DR_PORTAL_BOOT_LOGIN = 1;

  function toast(m, t) {
    try { if (window.DR && window.DR.toast) window.DR.toast(m, t || 'info'); } catch (e) {}
  }

  function showPortalBoot(sub) {
    try {
      if (!document.getElementById('dr-portal-boot-css')) {
        var st = document.createElement('style');
        st.id = 'dr-portal-boot-css';
        st.textContent = [
          '#dr-boot-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;',
          'flex-direction:column;gap:1.25rem;padding:1.5rem;text-align:center;',
          'background:radial-gradient(ellipse 80% 60% at 50% 40%,#1a1530 0%,#0c0c14 55%,#08080f 100%);',
          'color:#eeeef6;font-family:Inter,system-ui,sans-serif;transition:opacity 0.55s ease;opacity:1}',
          'html[data-theme="light"] #dr-boot-overlay{background:radial-gradient(ellipse 80% 60% at 50% 35%,#e8e4ff 0%,#f4f2ff 45%,#eceaf8 100%);color:#1a1625}',
          '#dr-boot-overlay.is-done{opacity:0;pointer-events:none}',
          '#dr-boot-overlay .boot-logo{width:72px;height:72px;border-radius:16px;',
          'box-shadow:0 8px 32px rgba(109,90,154,.35);animation:drPortalBootSpin 1.4s linear infinite;transform-origin:center center}',
          '#dr-boot-overlay .boot-title{font-size:1.35rem;font-weight:650;margin:0;letter-spacing:.02em}',
          '#dr-boot-overlay .boot-sub{font-size:.85rem;color:#9494ae;margin:0}',
          '@keyframes drPortalBootSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'
        ].join('');
        (document.head || document.documentElement).appendChild(st);
      }
      var ov = document.getElementById('dr-boot-overlay');
      if (!ov) {
        ov = document.createElement('div');
        ov.id = 'dr-boot-overlay';
        ov.setAttribute('role', 'status');
        ov.setAttribute('aria-live', 'polite');
        document.body.appendChild(ov);
      }
      ov.classList.remove('is-done');
      ov.style.display = 'flex';
      ov.style.opacity = '1';
      ov.style.pointerEvents = 'auto';
      ov.innerHTML =
        '<img class="boot-logo" src="favicon.svg?v=9.9.9-boot" alt="Divine Rays" width="72" height="72" />' +
        '<h1 class="boot-title">Divine Rays Tech Hub</h1>' +
        '<p class="boot-sub">' + (sub || 'Loading workspace…') + '</p>';
      try { document.body.classList.add('dr-boot-holding'); } catch (e) {}
    } catch (err) {}
  }

  function hidePortalBoot() {
    try {
      var ov = document.getElementById('dr-boot-overlay');
      if (ov) {
        ov.classList.add('is-done');
        setTimeout(function () {
          try { if (ov.parentNode) ov.parentNode.removeChild(ov); } catch (e) {}
        }, 600);
      }
      document.body.classList.remove('dr-boot-holding');
    } catch (e2) {}
  }

  function wrapLoad() {
    if (typeof window.loadFullAppThen !== 'function' || window.loadFullAppThen.__drPortalBoot) return;
    var prev = window.loadFullAppThen;
    window.loadFullAppThen = function (role) {
      try {
        if (window.DR && window.DR.toast && !window.DR.toast.__drPortalBootToast) {
          var _ot = window.DR.toast;
          window.DR.toast = function (m, t) {
            if (m === 'Signed in…' || m === 'Signed in...' || m === 'Signed in') {
              m = 'Successfully logged in';
              t = t || 'success';
            }
            return _ot.call(this, m, t);
          };
          window.DR.toast.__drPortalBootToast = 1;
        }
      } catch (eT) {}
      toast('Successfully logged in', 'success');
      showPortalBoot('Preparing your portal…');
      var ret = prev.apply(this, arguments);
      function done() {
        try {
          if (window.DRForcePending && window.DRForcePending.clearPendingUI) window.DRForcePending.clearPendingUI();
        } catch (e) {}
        try {
          document.body.classList.add('dr-portal-ok', 'is-portal');
        } catch (e2) {}
        hidePortalBoot();
      }
      if (ret && typeof ret.then === 'function') {
        return ret.then(function (v) {
          setTimeout(done, 700);
          return v;
        }).catch(function (err) {
          hidePortalBoot();
          throw err;
        });
      }
      setTimeout(done, 1200);
      return ret;
    };
    window.loadFullAppThen.__drPortalBoot = 1;
  }

  wrapLoad();
  setInterval(wrapLoad, 600);
  window.DRPortalBoot = { show: showPortalBoot, hide: hidePortalBoot, v: 1 };
})();
