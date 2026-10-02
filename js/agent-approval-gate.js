/**
 * Divine Rays — Agent approval gate V6
 * Scope: ONLY pending Agent/Admin (IT Tech Support) staff.
 * Approved / Developers / End-Users: normal login unchanged.
 * Pending: intercept Agent login BEFORE portal loads (no flash, no refresh).
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_APPROVAL_GATE_V6) return;
  window.__DR_AGENT_APPROVAL_GATE_V6 = 1;
  window.__DR_AGENT_APPROVAL_GATE_V5 = 99;
  window.__DR_AGENT_APPROVAL_GATE = 1;

  var APPROVAL_KEY = 'dr_staff_approval';
  var PENDING_MSG =
    'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var TOAST_MS = 5000;
  var MAX_TOASTS = 3;
  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
  var _pendingToastEl = null;
  var _pendingToastTimer = null;
  var _gateBusy = false;
  var _lastPendingShow = 0;
  var _blockCssReady = false;

  function getApprovalMap() {
    try {
      return JSON.parse(localStorage.getItem(APPROVAL_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function setApprovalMap(map) {
    try {
      localStorage.setItem(APPROVAL_KEY, JSON.stringify(map || {}));
    } catch (e) {}
  }

  function markPending(userId, username, email) {
    var map = getApprovalMap();
    if (userId) map[userId] = 'pending';
    var un = username ? String(username).toLowerCase().trim() : '';
    var em = email ? String(email).toLowerCase().trim() : '';
    if (un) map['pending:' + un] = 'pending';
    if (em) map['pending:' + em] = 'pending';
    setApprovalMap(map);
  }

  function isMarkedPending(userId, username, email) {
    var map = getApprovalMap();
    if (userId && map[userId] === 'pending') return true;
    var un = username ? String(username).toLowerCase().trim() : '';
    var em = email ? String(email).toLowerCase().trim() : '';
    if (un && map['pending:' + un] === 'pending') return true;
    if (em && map['pending:' + em] === 'pending') return true;
    return false;
  }

  function isApproved(userId, username, email) {
    var map = getApprovalMap();
    if (userId && map[userId] === 'approved') return true;
    var un = username ? String(username).toLowerCase().trim() : '';
    var em = email ? String(email).toLowerCase().trim() : '';
    if (un && map['u:' + un] === 'approved') return true;
    if (em && map['e:' + em] === 'approved') return true;
    return false;
  }

  function isDeveloperUsername(name) {
    return !!DEVS[String(name || '').toLowerCase().trim()];
  }

  function sb() {
    try {
      if (window.DR && typeof window.DR.sb === 'function') {
        var c = window.DR.sb();
        if (c) return c;
      }
    } catch (e) {}
    return window.__drSb || window.__drAgentSb || null;
  }

  function ensureBlockCss() {
    if (_blockCssReady && document.getElementById('dr-approval-block-css')) return;
    var el = document.getElementById('dr-approval-block-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-approval-block-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent =
      'body.dr-pending-blocked #portal-agent,' +
      'body.dr-staff-gate-lock #portal-agent{' +
      '  display:none!important;visibility:hidden!important;pointer-events:none!important;' +
      '  opacity:0!important;position:absolute!important;left:-9999px!important}' +
      'body.dr-pending-blocked #login-screen,' +
      'body.dr-staff-gate-lock #login-screen,' +
      'body.dr-pending-blocked #auth-screen,' +
      'body.dr-staff-gate-lock #auth-screen{' +
      '  display:flex!important;visibility:visible!important;opacity:1!important;' +
      '  pointer-events:auto!important;z-index:50!important}' +
      'body.dr-pending-blocked .login-card,' +
      '.login-card.dr-login-pending{' +
      '  border-color:rgba(251,146,60,0.9)!important;' +
      '  box-shadow:0 0 0 1px rgba(251,146,60,0.5),0 0 32px 8px rgba(251,146,60,0.5),0 0 64px 16px rgba(251,146,60,0.25)!important;' +
      '  transition:box-shadow 0.35s ease,border-color 0.35s ease}' +
      'body.dr-pending-blocked .toast.success{display:none!important}' +
      'body.dr-pending-blocked canvas,body.dr-staff-gate-lock canvas,' +
      'body.dr-pending-blocked .lifeline,body.dr-staff-gate-lock .lifeline{visibility:visible!important;opacity:1!important}';
    _blockCssReady = true;
  }

  function setLoginPendingGlow(on) {
    try {
      document.querySelectorAll('.login-card').forEach(function (card) {
        if (on) card.classList.add('dr-login-pending');
        else card.classList.remove('dr-login-pending');
      });
    } catch (e) {}
  }

  function setPendingBlocked(on) {
    ensureBlockCss();
    try {
      if (on) {
        document.body.classList.add('dr-pending-blocked');
        document.body.classList.add('dr-staff-gate-lock');
        setLoginPendingGlow(true);
        removeSignedInToasts();
      } else {
        document.body.classList.remove('dr-pending-blocked');
        document.body.classList.remove('dr-staff-gate-lock');
        setLoginPendingGlow(false);
      }
    } catch (e) {}
  }

  function lockPortalPreview() {
    ensureBlockCss();
    try {
      document.body.classList.add('dr-staff-gate-lock');
      var pa = document.getElementById('portal-agent');
      if (pa) {
        pa.classList.remove('active');
        pa.style.display = 'none';
      }
    } catch (e) {}
  }

  function unlockPortalPreview() {
    try {
      document.body.classList.remove('dr-staff-gate-lock');
      document.body.classList.remove('dr-pending-blocked');
      setLoginPendingGlow(false);
    } catch (e) {}
  }

  function ensureToastContainer() {
    var c = document.getElementById('toast-container');
    if (c) return c;
    c = document.createElement('div');
    c.id = 'toast-container';
    c.setAttribute('aria-live', 'polite');
    c.style.cssText =
      'position:fixed;top:1rem;right:1rem;z-index:100000;display:flex;flex-direction:column;gap:0.5rem;max-width:min(22rem,92vw);pointer-events:none;';
    document.body.appendChild(c);
    return c;
  }

  function trimToastStack() {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var kids = Array.prototype.slice.call(c.querySelectorAll('.toast'));
    while (kids.length > MAX_TOASTS) {
      var old = kids.shift();
      try {
        if (old && old.parentNode) old.parentNode.removeChild(old);
      } catch (e) {}
    }
  }

  function removeSignedInToasts() {
    try {
      var c = document.getElementById('toast-container');
      if (!c) return;
      Array.prototype.slice.call(c.querySelectorAll('.toast')).forEach(function (el) {
        var tx = (el.textContent || '').toLowerCase();
        if (tx.indexOf('signed in') !== -1) {
          try {
            el.parentNode && el.parentNode.removeChild(el);
          } catch (e0) {}
        }
      });
    } catch (e) {}
  }

  function showPendingToast(msg) {
    var text = msg || PENDING_MSG;
    var c = ensureToastContainer();
    Array.prototype.slice.call(c.querySelectorAll('.toast')).forEach(function (el) {
      if (el !== _pendingToastEl && (el.textContent || '').indexOf('pending Administrator approval') !== -1) {
        try {
          el.parentNode && el.parentNode.removeChild(el);
        } catch (e0) {}
      }
    });
    if (!_pendingToastEl || !_pendingToastEl.parentNode) {
      _pendingToastEl = document.createElement('div');
      _pendingToastEl.className = 'toast error';
      _pendingToastEl.setAttribute('data-dr-pending-approval', '1');
      _pendingToastEl.style.cssText =
        'pointer-events:auto;padding:0.85rem 1.1rem;border-radius:14px;' +
        'background:rgba(28,22,42,0.96);border:1px solid rgba(251,146,60,0.45);' +
        'color:#eeeef6;font-size:0.9rem;line-height:1.45;box-shadow:0 12px 32px rgba(0,0,0,0.45);';
      c.appendChild(_pendingToastEl);
    }
    _pendingToastEl.textContent = text;
    trimToastStack();
    if (_pendingToastTimer) clearTimeout(_pendingToastTimer);
    _pendingToastTimer = setTimeout(function () {
      try {
        if (_pendingToastEl && _pendingToastEl.parentNode) {
          _pendingToastEl.parentNode.removeChild(_pendingToastEl);
        }
      } catch (e1) {}
      _pendingToastEl = null;
      _pendingToastTimer = null;
    }, TOAST_MS);
    _lastPendingShow = Date.now();
  }

  function showAgentError(msg) {
    try {
      var box = document.getElementById('error-login-agent');
      if (box) {
        box.textContent = msg || PENDING_MSG;
        box.style.display = '';
        box.hidden = false;
      }
    } catch (e) {}
    showPendingToast(msg || PENDING_MSG);
  }

  function isStaffRole(role) {
    var r = String(role || '').toLowerCase();
    return r === 'agent' || r === 'admin';
  }

  function isCustomerRole(role) {
    var r = String(role || '').toLowerCase();
    return (
      r === 'customer' ||
      r === 'user' ||
      r === 'end-user' ||
      r === 'enduser' ||
      r === 'end_user'
    );
  }

  function checkPendingSync(user, profile, loginHint) {
    if (!user) return false;
    var meta = user.user_metadata || {};
    var uid = user.id;
    var email = (user.email || (profile && profile.email) || '').toLowerCase();
    var username = (
      meta.username ||
      (profile && profile.username) ||
      loginHint ||
      ''
    )
      .toString()
      .toLowerCase()
      .trim();

    if (isDeveloperUsername(username)) return false;
    if (meta.approval_status === 'approved' || meta.approved === true) return false;
    if (isApproved(uid, username, email)) return false;

    var role = String((profile && profile.role) || meta.role || '').toLowerCase();
    if (isCustomerRole(role)) return false;

    if (meta.approval_status === 'pending' || meta.approved === false) {
      markPending(uid, username, email);
      return true;
    }
    if (isMarkedPending(uid, username, email)) return true;
    if (isStaffRole(role)) {
      markPending(uid, username, email);
      return true;
    }
    return false;
  }

  async function checkPendingAndBlock(user, profile, loginHint) {
    return checkPendingSync(user, profile, loginHint);
  }

  async function quietSignOut() {
    try {
      var client = sb();
      if (client && client.auth) {
        try {
          await client.auth.signOut({ scope: 'local' });
        } catch (e0) {}
      }
    } catch (e) {}
    try {
      window.__drFullLoaded = false;
      window.__drBooting = false;
      window.__drProfile = null;
    } catch (e4) {}
  }

  function keepLoginVisible() {
    ensureBlockCss();
    setPendingBlocked(true);
    try {
      var pa = document.getElementById('portal-agent');
      if (pa) {
        pa.classList.remove('active');
        pa.style.display = 'none';
      }
      var ls = document.getElementById('login-screen');
      if (ls) {
        ls.hidden = false;
        ls.style.display = '';
        ls.classList.add('active');
      }
    } catch (e) {}
  }

  async function resolveEmail(userOrEmail, client) {
    if (!userOrEmail) return null;
    if (userOrEmail.indexOf('@') !== -1) return userOrEmail.trim();
    try {
      var r = await client
        .from('profiles')
        .select('email')
        .eq('username', userOrEmail.trim())
        .maybeSingle();
      return r.data && r.data.email ? r.data.email : null;
    } catch (e) {
      return null;
    }
  }

  function wireLoginGate() {
    var form = document.getElementById('login-agent');
    if (!form || form.__drApprovalGateV6) return;
    form.__drApprovalGateV6 = 1;

    form.addEventListener(
      'submit',
      function (ev) {
        if (form.__drGateAllowPass) {
          form.__drGateAllowPass = false;
          unlockPortalPreview();
          return;
        }

        ev.preventDefault();
        ev.stopPropagation();
        try {
          ev.stopImmediatePropagation();
        } catch (e) {}

        if (_gateBusy) {
          showPendingToast(PENDING_MSG);
          keepLoginVisible();
          return;
        }

        lockPortalPreview();
        ensureBlockCss();

        (async function () {
          _gateBusy = true;
          try {
            var client = sb();
            if (!client) {
              showAgentError('Sign-in unavailable. Try again.');
              _gateBusy = false;
              return;
            }

            var inp =
              document.getElementById('agent-username') ||
              document.getElementById('agent-user');
            var passEl = document.getElementById('agent-password');
            var userOrEmail = inp ? (inp.value || '').trim() : '';
            var password = passEl ? passEl.value : '';

            if (!userOrEmail || !password) {
              showAgentError('Enter username/email and password.');
              unlockPortalPreview();
              _gateBusy = false;
              return;
            }

            var email = await resolveEmail(userOrEmail, client);
            if (!email) {
              showAgentError('Username not found');
              unlockPortalPreview();
              _gateBusy = false;
              return;
            }

            var auth = await client.auth.signInWithPassword({
              email: email,
              password: password
            });
            if (auth.error) {
              showAgentError(auth.error.message || 'Sign-in failed');
              unlockPortalPreview();
              _gateBusy = false;
              return;
            }

            var user = auth.data && auth.data.user;
            if (!user) {
              showAgentError('Sign-in failed');
              unlockPortalPreview();
              _gateBusy = false;
              return;
            }

            var profile = null;
            try {
              var pr = await client
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
              profile = pr && pr.data;
            } catch (e1) {}

            var loginHint =
              userOrEmail.indexOf('@') === -1
                ? userOrEmail
                : (profile && profile.username) || '';
            var pending = checkPendingSync(user, profile, loginHint);

            if (pending) {
              keepLoginVisible();
              removeSignedInToasts();
              await quietSignOut();
              keepLoginVisible();
              removeSignedInToasts();
              showAgentError(PENDING_MSG);
              _lastPendingShow = Date.now();
              _gateBusy = false;
              return;
            }

            unlockPortalPreview();
            removeSignedInToasts();
            await quietSignOut();
            form.__drGateAllowPass = true;
            _gateBusy = false;
            try {
              if (typeof form.requestSubmit === 'function') form.requestSubmit();
              else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            } catch (e2) {
              try {
                form.submit();
              } catch (e3) {}
            }
          } catch (err) {
            showAgentError((err && err.message) || 'Sign-in error');
            unlockPortalPreview();
            _gateBusy = false;
          }
        })();
      },
      true
    );
  }

  function patchShowApp() {
    function wrap(fn) {
      if (!fn || fn.__drApprovalWrapV6) return fn;
      var wrapped = function (p) {
        try {
          if (document.body.classList.contains('dr-pending-blocked')) {
            keepLoginVisible();
            return;
          }
        } catch (e) {}
        return fn.apply(this, arguments);
      };
      wrapped.__drApprovalWrapV6 = 1;
      return wrapped;
    }
    try {
      if (typeof window.showApp === 'function') window.showApp = wrap(window.showApp);
      if (window.DR && typeof window.DR.showApp === 'function') window.DR.showApp = wrap(window.DR.showApp);
    } catch (e) {}
  }

  function wireSessionGuard() {
    if (window.__drApprovalSessionGuardV6) return;
    window.__drApprovalSessionGuardV6 = 1;

    setInterval(function () {
      (async function () {
        try {
          patchShowApp();
          if (!document.body.classList.contains('dr-pending-blocked')) return;

          keepLoginVisible();
          removeSignedInToasts();

          var client = sb();
          if (!client) return;
          var sess = await client.auth.getSession();
          var session = sess && sess.data && sess.data.session;
          if (!session || !session.user) return;

          var user = session.user;
          var profile = null;
          try {
            var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
            profile = pr && pr.data;
          } catch (e1) {}
          var role = String((profile && profile.role) || (user.user_metadata || {}).role || '').toLowerCase();
          if (!isStaffRole(role)) return;
          if (checkPendingSync(user, profile, (user.user_metadata || {}).username || '')) {
            await quietSignOut();
            keepLoginVisible();
          }
        } catch (e) {}
      })();
    }, 1200);
  }

  window.DRAgentApproval = {
    markPending: markPending,
    isMarkedPending: isMarkedPending,
    isApproved: isApproved,
    getApprovalMap: getApprovalMap,
    setApprovalMap: setApprovalMap,
    showPendingToast: showPendingToast,
    checkPendingAndBlock: checkPendingAndBlock
  };

  function tick() {
    ensureBlockCss();
    wireLoginGate();
    wireSessionGuard();
    patchShowApp();
  }

  tick();
  setInterval(tick, 2000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
})();
