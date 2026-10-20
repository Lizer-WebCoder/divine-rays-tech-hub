/**
 * Divine Rays - login-auth-fail-hard v1
 * Wrong password (incl. Caps Lock case mismatch) must NEVER open a portal.
 * - Hard sign-out + clear portal flags on every auth failure
 * - Block residual trySession / boot from painting portal after a failed attempt
 * - CapsLock hint on password fields (password remains case-sensitive)
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_AUTH_FAIL_HARD >= 1) return;
  window.__DR_LOGIN_AUTH_FAIL_HARD = 1;

  var failUntil = 0;

  function clearPortalFlags() {
    try {
      sessionStorage.removeItem('dr_skip_boot_gear');
      sessionStorage.removeItem('dr_post_login_boot');
      sessionStorage.removeItem('dr_dev_portal_pref');
      sessionStorage.removeItem('dr_force_emp_once');
      document.documentElement.removeAttribute('data-dr-portal-pref');
      document.documentElement.classList.remove('dr-post-login');
    } catch (e) {}
  }

  function forceLoginOnly() {
    try {
      document.body.classList.add('is-login');
      document.body.classList.remove(
        'dr-portal-ok',
        'is-portal',
        'is-portal-employee',
        'is-portal-admin'
      );
      ['portal-customer', 'portal-agent', 'dr-post-login-boot', 'dr-portal-loader', 'dr-portal-ambient'].forEach(
        function (id) {
          var el = document.getElementById(id);
          if (!el) return;
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('opacity', '0', 'important');
          el.classList.remove('active', 'is-on');
        }
      );
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (ls) {
        ls.hidden = false;
        ls.style.setProperty('display', '', 'important');
        ls.style.setProperty('visibility', 'visible', 'important');
        ls.style.setProperty('opacity', '1', 'important');
      }
    } catch (e) {}
  }

  async function hardFailCleanup(client) {
    failUntil = Date.now() + 4000;
    clearPortalFlags();
    forceLoginOnly();
    try {
      if (client && client.auth) await client.auth.signOut({ scope: 'local' });
    } catch (e1) {
      try {
        if (window.supabaseClient && window.supabaseClient.auth)
          await window.supabaseClient.auth.signOut({ scope: 'local' });
      } catch (e2) {}
    }
  }

  function sb() {
    try {
      return window.supabaseClient || window.sb || window.__drSb || null;
    } catch (e) {
      return null;
    }
  }

  function wireCapsHint() {
    document.querySelectorAll('input[type="password"]').forEach(function (inp) {
      if (inp.__drCapsHint) return;
      inp.__drCapsHint = 1;
      var hint = document.createElement('div');
      hint.className = 'dr-caps-hint';
      hint.style.cssText =
        'display:none;color:#fbbf24;font-size:0.75rem;margin-top:0.25rem;text-align:left;';
      hint.textContent = 'Caps Lock is on — passwords are case-sensitive.';
      try {
        if (inp.parentNode) inp.parentNode.appendChild(hint);
      } catch (e) {}
      function check(ev) {
        try {
          var on = ev.getModifierState && ev.getModifierState('CapsLock');
          hint.style.display = on ? 'block' : 'none';
        } catch (e2) {}
      }
      inp.addEventListener('keydown', check);
      inp.addEventListener('keyup', check);
      inp.addEventListener('focus', check);
      inp.addEventListener('blur', function () {
        hint.style.display = 'none';
      });
    });
  }

  function patchClient(client) {
    if (!client || !client.auth || client.auth.__drFailHard) return;
    var orig = client.auth.signInWithPassword.bind(client.auth);
    client.auth.signInWithPassword = async function (creds) {
      var result;
      try {
        result = await orig(creds);
      } catch (err) {
        await hardFailCleanup(client);
        throw err;
      }
      if (result && result.error) {
        await hardFailCleanup(client);
        var msg = (result.error.message || '').toString();
        if (/invalid login credentials|invalid.*password|email.*password/i.test(msg)) {
          result.error.message =
            'Invalid email or password. Passwords are case-sensitive (check Caps Lock).';
        }
      } else if (!(result && result.data && result.data.user)) {
        await hardFailCleanup(client);
        result = result || {};
        result.error = result.error || { message: 'Invalid email or password.' };
      } else {
        failUntil = 0;
      }
      return result;
    };
    client.auth.__drFailHard = 1;
  }

  function patchBoot() {
    if (window.__drBootFailPatched) return;
    window.__drBootFailPatched = 1;
    var wrap = function (name) {
      var o = window[name];
      if (typeof o !== 'function' || o.__drFailHard) return;
      window[name] = async function () {
        if (Date.now() < failUntil) {
          forceLoginOnly();
          clearPortalFlags();
          return;
        }
        return o.apply(this, arguments);
      };
      window[name].__drFailHard = 1;
    };
    wrap('bootWorkspace');
    wrap('showPortalLoader');
  }

  function apply() {
    var c = sb();
    if (c) patchClient(c);
    patchBoot();
    wireCapsHint();
  }

  apply();
  setTimeout(apply, 200);
  setTimeout(apply, 800);
  setTimeout(apply, 2000);
  setInterval(function () {
    apply();
  }, 5000);

  window.DRLoginAuthFailHard = {
    v: 1,
    hardFailCleanup: hardFailCleanup,
    forceLoginOnly: forceLoginOnly
  };
})();
