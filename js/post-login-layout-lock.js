/**
 * Divine Rays - post-login-layout-lock v1
 * Stops the whole page from "jumping" during post-login loading:
 * - freeze body scroll / overflow while loader is up
 * - keep loader fixed and isolated from document flow
 * - avoid min-height / mode-bar reflow thrash under the overlay
 */
(function () {
  'use strict';
  if (window.__DR_POST_LOGIN_LAYOUT >= 1) return;
  window.__DR_POST_LOGIN_LAYOUT = 1;

  var CSS_ID = 'dr-post-login-layout-css';
  var locked = false;

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

  function loaderOn() {
    try {
      var el = document.getElementById('dr-post-login-boot');
      if (!el) return false;
      if (el.classList.contains('is-done') || el.classList.contains('is-gone')) return false;
      if (el.style.display === 'none') return false;
      if (el.classList.contains('is-on') || el.classList.contains('is-fading')) return true;
      var st = window.getComputedStyle ? getComputedStyle(el) : null;
      if (st && st.display !== 'none' && parseFloat(st.opacity || '1') > 0.05) return true;
    } catch (e) {}
    return false;
  }

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#dr-post-login-boot{',
      'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;',
      'max-width:100vw!important;max-height:100vh!important;',
      'margin:0!important;padding:0!important;box-sizing:border-box!important;',
      'z-index:100000!important;',
      'overflow:hidden!important;will-change:opacity;',
      'transition:opacity 0.85s ease,visibility 0.85s ease!important}',
      '#dr-post-login-boot .pl-ring{transform-origin:50% 50%!important}',
      'html.dr-post-login,html.dr-post-login body,',
      'body.dr-layout-locked{',
      'overflow:hidden!important;height:100%!important;max-height:100vh!important;',
      'overscroll-behavior:none!important}',
      'html.dr-post-login #portal-customer.active,',
      'html.dr-post-login #portal-agent.active,',
      'body.dr-layout-locked #portal-customer.active,',
      'body.dr-layout-locked #portal-agent.active{',
      'min-height:100vh!important;height:auto!important;',
      'overflow:hidden!important}',
      '#mode-bar-employee,#mode-bar-admin,.mode-bar-employee,.mode-bar-admin{',
      'min-height:49px;box-sizing:border-box}',
      '#dr-portal-ambient{',
      'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;',
      'margin:0!important;will-change:auto}'
    ].join('');
  }

  function lock() {
    if (locked) return;
    locked = true;
    try {
      document.documentElement.classList.add('dr-post-login');
      document.body.classList.add('dr-layout-locked');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('overflow', 'hidden', 'important');
    } catch (e) {}
  }

  function unlock() {
    locked = false;
    try {
      document.body.classList.remove('dr-layout-locked');
      document.documentElement.style.removeProperty('overflow');
      document.body.style.removeProperty('overflow');
    } catch (e) {}
  }

  function tick() {
    injectCss();
    if (isPostLogin() || loaderOn()) {
      lock();
      try {
        var el = document.getElementById('dr-post-login-boot');
        if (el && !el.classList.contains('is-done') && !el.classList.contains('is-gone')) {
          el.style.setProperty('position', 'fixed', 'important');
          el.style.setProperty('inset', '0', 'important');
          el.style.setProperty('z-index', '100000', 'important');
          if (!el.classList.contains('is-fading')) {
            el.style.setProperty('display', 'flex', 'important');
          }
        }
      } catch (e) {}
    } else if (locked) {
      unlock();
    }
  }

  function watch() {
    try {
      var el = document.getElementById('dr-post-login-boot');
      if (!el || el.__drLayoutObs) return;
      el.__drLayoutObs = true;
      var obs = new MutationObserver(function () {
        if (
          el.classList.contains('is-done') ||
          el.classList.contains('is-gone') ||
          el.classList.contains('is-fading')
        ) {
          setTimeout(unlock, 900);
          setTimeout(function () {
            try {
              if (window.DRGearsKick && window.DRGearsKick.kick) window.DRGearsKick.kick(true);
            } catch (e) {}
          }, 200);
        }
      });
      obs.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
    } catch (e) {}
  }

  injectCss();
  tick();
  watch();
  setTimeout(tick, 50);
  setTimeout(tick, 200);
  setTimeout(watch, 300);
  setTimeout(tick, 800);
  setInterval(function () {
    if (isPostLogin() || loaderOn()) tick();
    else if (locked) unlock();
  }, 1500);

  window.DRPostLoginLayout = { v: 1, lock: lock, unlock: unlock };
})();
