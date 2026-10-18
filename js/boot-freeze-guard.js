/**
 * Divine Rays — boot freeze guard v2
 * Remove stuck boot/loader nodes from the DOM (does not touch features).
 * Does NOT clear post-login session flags (those are owned by login flow).
 */
(function () {
  'use strict';
  if (window.__DR_BOOT_FREEZE_GUARD >= 2) return;
  window.__DR_BOOT_FREEZE_GUARD = 2;

  function isPostLogin() {
    try {
      return (
        sessionStorage.getItem('dr_skip_boot_gear') === '1' ||
        sessionStorage.getItem('dr_post_login_boot') === '1'
      );
    } catch (e) {
      return false;
    }
  }

  function removeNode(id) {
    try {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.add('is-done');
      try {
        if (el.parentNode) el.parentNode.removeChild(el);
      } catch (e) {
        el.style.cssText = 'display:none!important';
      }
    } catch (e2) {}
  }

  function clearStuckGearOnly() {
    // Only remove boot gear shells — never touch login UI / portals / features
    removeNode('dr-phase-boot');
    try {
      var boot = document.getElementById('boot');
      if (boot && boot.classList.contains('is-done')) removeNode('boot');
    } catch (e) {}
  }

  // Late safety: if still stuck on gear after long wait (and not post-login rings)
  setTimeout(function () {
    try {
      if (isPostLogin()) return;
      var phase = document.getElementById('dr-phase-boot');
      if (phase && !phase.classList.contains('is-done')) {
        // login should have appeared by now
        if (document.getElementById('login-screen')) clearStuckGearOnly();
      }
    } catch (e) {}
  }, 6000);

  setTimeout(function () {
    try {
      window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
    } catch (e) {}
  }, 1500);
})();
