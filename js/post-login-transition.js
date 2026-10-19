/**
 * Divine Rays — post-login-transition v2
 * Smooth opacity fade of loader; no ambient rebuild twitch.
 */
(function () {
  'use strict';
  if (window.__DR_POST_LOGIN_TX >= 2) return;
  window.__DR_POST_LOGIN_TX = 2;

  var DONE = false;
  var CSS_ID = 'dr-post-login-tx-css';

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#dr-post-login-boot, #dr-portal-loader {',
      '  transition: opacity 0.9s ease, visibility 0.9s ease !important;}',
      '#dr-post-login-boot.is-fading, #dr-portal-loader.is-fading,',
      '#dr-post-login-boot.is-done, #dr-portal-loader.is-done {',
      '  opacity:0 !important; visibility:hidden !important; pointer-events:none !important;}'
    ].join('');
  }

  function isPostLogin() {
    try {
      return (
        sessionStorage.getItem('dr_skip_boot_gear') === '1' ||
        sessionStorage.getItem('dr_post_login_boot') === '1' ||
        document.documentElement.classList.contains('dr-post-login')
      );
    } catch (e) {
      return false;
    }
  }

  function clearEarlyHold() {
    try {
      document.documentElement.removeAttribute('data-dr-hold-portal');
      document.querySelectorAll('style').forEach(function (s) {
        var t = s.textContent || '';
        if (t.indexOf('opacity:0') !== -1 && t.indexOf('portal-customer') !== -1 && t.indexOf('dr-post-login') !== -1) {
          try {
            s.textContent = t.replace(
              /#portal-customer,#portal-agent,\.mode-bar,#mode-bar-employee,#mode-bar-admin\{opacity:0!important;pointer-events:none!important\}/g,
              ''
            );
          } catch (eR) {}
        }
      });
      ['portal-customer', 'portal-agent'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (el.classList.contains('active')) {
          el.style.setProperty('opacity', '1', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('pointer-events', 'auto', 'important');
        }
      });
    } catch (e) {}
  }

  function warmAmbientOnce() {
    try {
      if (window.DRPortalShell && window.DRPortalShell.ensureAmbient) {
        window.DRPortalShell.ensureAmbient(true);
      }
    } catch (e) {}
  }

  function fadeOutLoaders() {
    ['dr-post-login-boot', 'dr-portal-loader'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      try {
        el.style.display = 'flex';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.transition = 'opacity 0.9s ease, visibility 0.9s ease';
        void el.offsetWidth;
        el.classList.add('is-fading');
        el.classList.add('is-done');
        el.classList.remove('is-on');
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
        setTimeout(function () {
          try {
            el.style.display = 'none';
            el.classList.add('is-gone');
          } catch (e2) {}
        }, 950);
      } catch (e) {}
    });
  }

  function runOnce() {
    if (DONE) return;
    if (!isPostLogin()) return;
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (!pc && !pa) return;

    DONE = true;
    injectCss();
    warmAmbientOnce();
    clearEarlyHold();

    setTimeout(function () {
      warmAmbientOnce();
      clearEarlyHold();
      fadeOutLoaders();
      try {
        sessionStorage.removeItem('dr_post_login_boot');
        setTimeout(function () {
          try {
            sessionStorage.removeItem('dr_skip_boot_gear');
          } catch (e) {}
        }, 1500);
      } catch (e2) {}
    }, 550);
  }

  injectCss();
  if (isPostLogin()) {
    warmAmbientOnce();
    setTimeout(runOnce, 600);
    setTimeout(runOnce, 1200);
    setTimeout(runOnce, 2000);
    setTimeout(function () {
      if (!DONE) {
        DONE = true;
        injectCss();
        clearEarlyHold();
        fadeOutLoaders();
      }
    }, 3500);
  }

  window.DRPostLoginTx = { v: 2, run: runOnce };
})();
