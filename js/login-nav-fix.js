/**
 * Divine Rays — fix Sign in / Create account navigation
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_NAV_FIX) return;
  window.__DR_LOGIN_NAV_FIX = 1;

  function go(id) {
    id = id || 'login-customer';
    try {
      if (window.DRLoginTheme && typeof window.DRLoginTheme.showForm === 'function') {
        window.DRLoginTheme.showForm(id);
      }
    } catch (e) {}
    try {
      if (typeof window.showForm === 'function') window.showForm(id);
    } catch (e) {}

    var isReg = id.indexOf('register') !== -1;
    var isAgent = id.indexOf('agent') !== -1;

    document.querySelectorAll('.login-card-register').forEach(function (c) {
      if (isReg) {
        var want = isAgent ? 'dr-register-card-agent' : 'dr-register-card-customer';
        if (c.id === want) {
          c.classList.add('is-open');
          c.style.setProperty('display', 'block', 'important');
        } else {
          c.classList.remove('is-open');
          c.style.setProperty('display', 'none', 'important');
        }
      } else {
        c.classList.remove('is-open');
        c.style.setProperty('display', 'none', 'important');
      }
    });

    document.querySelectorAll('.login-card:not(.login-card-register)').forEach(function (c) {
      if (isReg) {
        c.classList.add('is-hidden-for-reg');
        c.style.setProperty('display', 'none', 'important');
      } else {
        c.classList.remove('is-hidden-for-reg');
        c.style.removeProperty('display');
      }
    });

    document.querySelectorAll('form.login-form').forEach(function (f) {
      f.classList.remove('active');
    });
    var target = document.getElementById(id);
    if (target) target.classList.add('active');

    if (!isReg && window.switchLoginTab) {
      try { window.switchLoginTab(isAgent ? 'agent' : 'customer'); } catch (e) {}
    }
  }

  document.addEventListener(
    'click',
    function (e) {
      var el = e.target;
      if (!el) return;
      var a = el.closest ? el.closest('a, button, [data-dr-show]') : null;
      if (!a) return;

      var show = a.getAttribute && a.getAttribute('data-dr-show');
      if (show) {
        e.preventDefault();
        e.stopPropagation();
        go(show);
        return;
      }

      var text = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var href = (a.getAttribute && a.getAttribute('href')) || '';
      var onclick = (a.getAttribute && a.getAttribute('onclick')) || '';

      if (text === 'sign in' || text.indexOf('sign in') !== -1 || /showForm\(['"]login-/.test(onclick)) {
        e.preventDefault();
        e.stopPropagation();
        var onAgent = !!(a.closest && (a.closest('#dr-register-card-agent') || a.closest('#register-agent') || a.closest('[data-ltab="agent"]')));
        go(onAgent ? 'login-agent' : 'login-customer');
        return;
      }

      if (
        text.indexOf('create an account') !== -1 ||
        text.indexOf('create account') !== -1 ||
        /showForm\(['"]register-/.test(onclick) ||
        /showForm\(['"]register-/.test(href)
      ) {
        e.preventDefault();
        e.stopPropagation();
        var agentTab =
          !!(a.closest && a.closest('[data-ltab="agent"]')) ||
          !!(document.querySelector('.ltab.active[data-ltab="agent"]'));
        go(agentTab ? 'register-agent' : 'register-customer');
      }
    },
    true
  );

  // Expose for debugging
  window.DRLoginNavFix = { go: go };
})();
