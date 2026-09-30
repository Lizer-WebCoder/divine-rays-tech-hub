/**
 * Divine Rays — Sign in / Create account navigation
 * Login card = login only; Create End-User / Agent cards = registration only.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_NAV_FIX_V4) return;
  window.__DR_LOGIN_NAV_FIX_V4 = 1;

  function mainLoginCard() {
    return document.querySelector(
      '#login-screen .login-card:not(.login-card-register), .login-card:not(.login-card-register)'
    );
  }

  function ensureScreenVisible() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!login) return;
    login.hidden = false;
    login.classList.remove('is-hidden');
    login.style.removeProperty('display');
    login.style.removeProperty('visibility');
    login.style.removeProperty('height');
    login.style.removeProperty('overflow');
    login.style.removeProperty('pointer-events');
  }

  function hideShellRegisterForms() {
    ['register-customer', 'register-agent'].forEach(function (id) {
      var f = document.getElementById(id);
      if (f) {
        f.classList.remove('active');
        f.style.setProperty('display', 'none', 'important');
      }
    });
  }

  function showRegister(kind) {
    ensureScreenVisible();
    var isAgent = kind === 'agent';
    var loginCard = mainLoginCard();
    if (loginCard) {
      loginCard.classList.add('is-hidden-for-reg');
      loginCard.style.setProperty('display', 'none', 'important');
    }
    document.querySelectorAll('.login-card-register').forEach(function (c) {
      var want = isAgent ? 'dr-register-card-agent' : 'dr-register-card-customer';
      if (c.id === want) {
        c.classList.add('is-open');
        c.style.setProperty('display', 'block', 'important');
      } else {
        c.classList.remove('is-open');
        c.style.setProperty('display', 'none', 'important');
      }
    });
    hideShellRegisterForms();
    document.querySelectorAll('form.login-form').forEach(function (f) {
      if (f.id === 'login-customer' || f.id === 'login-agent') {
        f.classList.remove('active');
      }
    });
    document.querySelectorAll('.ltab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-ltab') === (isAgent ? 'agent' : 'customer'));
    });
    try {
      if (window.DRLoginTheme && window.DRLoginTheme.showRegister) {
        window.DRLoginTheme.showRegister(isAgent ? 'agent' : 'customer');
      }
    } catch (e) {}
  }

  function showLogin(id) {
    ensureScreenVisible();
    id = id || 'login-customer';
    if (id.indexOf('register') !== -1) {
      id = id.indexOf('agent') !== -1 ? 'login-agent' : 'login-customer';
    }
    var isAgent = id.indexOf('agent') !== -1;

    document.querySelectorAll('.login-card-register').forEach(function (c) {
      c.classList.remove('is-open');
      c.style.setProperty('display', 'none', 'important');
    });

    var loginCard = mainLoginCard();
    if (loginCard) {
      loginCard.classList.remove('is-hidden-for-reg');
      loginCard.style.removeProperty('display');
    }

    hideShellRegisterForms();

    document.querySelectorAll('form.login-form').forEach(function (f) {
      f.classList.remove('active');
      if (f.id === 'register-customer' || f.id === 'register-agent') {
        f.style.setProperty('display', 'none', 'important');
      } else {
        f.style.removeProperty('display');
      }
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
      if (window.DRLoginTheme && window.DRLoginTheme.showLogin) {
        window.DRLoginTheme.showLogin(id);
      }
    } catch (e) {}
  }

  function go(id) {
    id = id || 'login-customer';
    if (id.indexOf('register-agent') !== -1 || id === 'register-agent') {
      showRegister('agent');
      return;
    }
    if (id.indexOf('register-customer') !== -1 || id === 'register-customer' || id.indexOf('register') !== -1) {
      showRegister(id.indexOf('agent') !== -1 ? 'agent' : 'customer');
      return;
    }
    showLogin(id);
  }

  document.addEventListener(
    'click',
    function (e) {
      var el = e.target;
      if (!el || !el.closest) return;

      var btn = el.closest('button[data-dr-show]');
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
    ensureScreenVisible();
    var regOpen = document.querySelector('.login-card-register.is-open');
    if (regOpen) {
      var loginCard = mainLoginCard();
      if (loginCard) {
        loginCard.classList.add('is-hidden-for-reg');
        loginCard.style.setProperty('display', 'none', 'important');
      }
      hideShellRegisterForms();
      return;
    }
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

  window.DRLoginNavFix = { go: go, repair: repair, showRegister: showRegister, showLogin: showLogin };
  window.showForm = function (id) {
    go(id);
  };
})();
