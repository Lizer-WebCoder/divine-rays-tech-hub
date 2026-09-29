/**
 * Divine Rays — Sign in / Create account navigation (safe)
 * Never hides the main login card — register forms live inside it.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_NAV_FIX_V3) return;
  window.__DR_LOGIN_NAV_FIX_V3 = 1;

  function ensureLoginVisible() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (login) {
      login.hidden = false;
      login.classList.remove('is-hidden', 'is-hidden-for-reg');
      login.style.removeProperty('display');
      login.style.removeProperty('visibility');
      login.style.removeProperty('height');
      login.style.removeProperty('overflow');
      login.style.removeProperty('pointer-events');
    }
    document.querySelectorAll('.login-card').forEach(function (c) {
      c.classList.remove('is-hidden-for-reg');
      if (c.style && c.style.display === 'none') {
        c.style.removeProperty('display');
      }
    });
  }

  function go(id) {
    id = id || 'login-customer';
    ensureLoginVisible();

    try {
      if (window.DRLoginTheme && typeof window.DRLoginTheme.showForm === 'function') {
        window.DRLoginTheme.showForm(id);
      }
    } catch (e) {}
    try {
      if (typeof window.showForm === 'function' && window.showForm !== go) {
        // avoid recursion if we assigned showForm = go
      }
    } catch (e) {}

    var isAgent = id.indexOf('agent') !== -1;

    document.querySelectorAll('.login-card-register').forEach(function (c) {
      var want = isAgent ? 'dr-register-card-agent' : 'dr-register-card-customer';
      var open = id.indexOf('register') !== -1 && c.id === want;
      if (open) {
        c.classList.add('is-open');
        c.style.setProperty('display', 'block', 'important');
      } else {
        c.classList.remove('is-open');
        c.style.setProperty('display', 'none', 'important');
      }
    });

    document.querySelectorAll('form.login-form').forEach(function (f) {
      f.classList.remove('active');
      f.style.removeProperty('display');
    });
    var target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      target.style.setProperty('display', 'block', 'important');
    }

    document.querySelectorAll('.ltab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-ltab') === (isAgent ? 'agent' : 'customer'));
    });
    try {
      if (window.switchLoginTab) window.switchLoginTab(isAgent ? 'agent' : 'customer');
    } catch (e) {}
  }

  document.addEventListener(
    'click',
    function (e) {
      var el = e.target;
      if (!el || !el.closest) return;

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

  function repair() {
    ensureLoginVisible();
    var anyActive = document.querySelector('form.login-form.active');
    if (!anyActive) {
      var lc = document.getElementById('login-customer');
      if (lc) {
        lc.classList.add('active');
        lc.style.setProperty('display', 'block', 'important');
      }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', repair);
  } else {
    repair();
  }
  setTimeout(repair, 300);
  setTimeout(repair, 1200);

  window.DRLoginNavFix = { go: go, repair: repair };
  window.showForm = function (id) {
    go(id);
  };
})();
