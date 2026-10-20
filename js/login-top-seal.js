/**
 * Divine Rays - login-top-seal v1
 * Kill broken UI peeking/flashing at top of login page:
 * portal ambient, mode-bars, portal shells, residual boot layers.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_TOP_SEAL >= 1) return;
  window.__DR_LOGIN_TOP_SEAL = 1;

  var CSS_ID = 'dr-login-top-seal-css';

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

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.is-login:not(.dr-portal-ok) #dr-portal-ambient,',
      'html:not([data-dr-portal-pref]) body.is-login #dr-portal-ambient,',
      'body.is-login:not(.is-portal) #dr-portal-ambient{',
      'display:none!important;visibility:hidden!important;opacity:0!important;',
      'pointer-events:none!important;z-index:-1!important}',
      'body.is-login:not(.dr-portal-ok) #portal-customer,',
      'body.is-login:not(.dr-portal-ok) #portal-agent,',
      'body.is-login:not(.is-portal) #portal-customer,',
      'body.is-login:not(.is-portal) #portal-agent{',
      'display:none!important;visibility:hidden!important;opacity:0!important;',
      'pointer-events:none!important;height:0!important;overflow:hidden!important}',
      'body.is-login:not(.dr-portal-ok) #mode-bar-employee,',
      'body.is-login:not(.dr-portal-ok) #mode-bar-admin,',
      'body.is-login:not(.dr-portal-ok) .mode-bar-employee,',
      'body.is-login:not(.dr-portal-ok) .mode-bar-admin,',
      'body.is-login:not(.dr-portal-ok) .mode-bar,',
      'body.is-login:not(.dr-portal-ok) #dr-dev-portal-switch{',
      'display:none!important;visibility:hidden!important;opacity:0!important;',
      'pointer-events:none!important;height:0!important;max-height:0!important}',
      'body.is-login #boot.is-done,body.is-login #boot.dr-skip,',
      'body.is-login #dr-phase-boot.is-done{',
      'display:none!important;opacity:0!important;visibility:hidden!important;',
      'pointer-events:none!important}',
      'body.is-login:not(.dr-post-login) #dr-post-login-boot:not(.is-on){',
      'display:none!important;opacity:0!important;visibility:hidden!important}',
      'body.is-login #login-screen,body.is-login .login-screen{',
      'position:relative!important;z-index:2!important;overflow:hidden!important}',
      'body.is-login #dr-login-ambient{',
      'position:fixed!important;inset:0!important;z-index:0!important;',
      'pointer-events:none!important}',
      'body.is-login #dr-lifeline{z-index:1!important;pointer-events:none!important}'
    ].join('');
  }

  function sealDom() {
    if (!loginVisible() || isPostLogin()) return;
    try {
      document.body.classList.add('is-login');
      document.body.classList.remove('dr-portal-ok', 'is-portal', 'is-portal-employee', 'is-portal-admin');
    } catch (e) {}
    var hideIds = [
      'dr-portal-ambient',
      'portal-customer',
      'portal-agent',
      'mode-bar-employee',
      'mode-bar-admin',
      'dr-dev-portal-switch',
      'dr-post-login-boot'
    ];
    hideIds.forEach(function (id) {
      try {
        var el = document.getElementById(id);
        if (!el) return;
        if (id === 'dr-post-login-boot' && el.classList.contains('is-on')) return;
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.classList.remove('active');
      } catch (e2) {}
    });
    try {
      document.querySelectorAll('.mode-bar, .mode-bar-employee, .mode-bar-admin').forEach(function (n) {
        n.style.setProperty('display', 'none', 'important');
        n.style.setProperty('visibility', 'hidden', 'important');
      });
    } catch (e3) {}
    try {
      ['boot', 'dr-phase-boot'].forEach(function (id) {
        var b = document.getElementById(id);
        if (!b) return;
        if (b.classList.contains('is-done') || b.classList.contains('dr-skip')) {
          b.style.setProperty('display', 'none', 'important');
          b.style.setProperty('opacity', '0', 'important');
        }
      });
    } catch (e4) {}
  }

  function apply() {
    injectCss();
    if (loginVisible() && !isPostLogin()) sealDom();
  }

  apply();
  setTimeout(apply, 80);
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setInterval(function () {
    if (loginVisible() && !isPostLogin()) sealDom();
  }, 2500);

  window.DRLoginTopSeal = { v: 1, refresh: apply };
})();
