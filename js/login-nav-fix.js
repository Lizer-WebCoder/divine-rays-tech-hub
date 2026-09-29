/**
 * Divine Rays — fix Sign in / Create account navigation
 * Only handles links — never form submit buttons
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_NAV_FIX_V2) return;
  window.__DR_LOGIN_NAV_FIX_V2 = 1;

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

    if (window.switchLoginTab) {
      try { window.switchLoginTab(isAgent ? 'agent' : 'customer'); } catch (e) {}
    }
  }

  document.addEventListener(
    'click',
    function (e) {
      var el = e.target;
      if (!el || !el.closest) return;

      // Never intercept real form submit / primary buttons
      var btn = el.closest('button, input[type="submit"], input[type="button"]');
      if (btn) {
        var showBtn = btn.getAttribute('data-dr-show');
        if (showBtn && btn.type !== 'submit' && btn.getAttribute('type') !== 'submit') {
          e.preventDefault();
          e.stopPropagation();
          go(showBtn);
        }
        return;
      }

      var a = el.closest('a, [data-dr-show]');
      if (!a) return;

      var show = a.getAttribute('data-dr-show');
      if (show) {
        e.preventDefault();
        e.stopPropagation();
        go(show);
        return;
      }

      if (a.tagName !== 'A') return;

      var text = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var href = a.getAttribute('href') || '';
      var onclick = a.getAttribute('onclick') || '';

      // Exact link labels only — not "Sign In as Agent"
      var isSignInLink =
        text === 'sign in' ||
        (text.indexOf('sign in') !== -1 && text.indexOf('as agent') === -1 && text.indexOf('as end') === -1) ||
        /showForm\(['"]login-/.test(onclick);

      if (isSignInLink) {
        e.preventDefault();
        e.stopPropagation();
        var onAgent = !!(
          a.closest('#dr-register-card-agent') ||
          a.closest('#register-agent') ||
          document.querySelector('.ltab.active[data-ltab="agent"]')
        );
        go(onAgent ? 'login-agent' : 'login-customer');
        return;
      }

      var isCreateLink =
        text.indexOf('create an account') !== -1 ||
        text.indexOf('create agent account') !== -1 ||
        text.indexOf('create end-user') !== -1 ||
        /showForm\(['"]register-/.test(onclick) ||
        /showForm\(['"]register-/.test(href);

      if (isCreateLink) {
        e.preventDefault();
        e.stopPropagation();
        var agentTab =
          !!(document.querySelector('.ltab.active[data-ltab="agent"]')) ||
          text.indexOf('agent') !== -1;
        go(agentTab ? 'register-agent' : 'register-customer');
      }
    },
    true
  );

  window.DRLoginNavFix = { go: go };
})();
