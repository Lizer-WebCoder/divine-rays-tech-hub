/**
 * Divine Rays — Agent approval gate V5.2
 * Scope: ONLY pending Agent/Admin (IT Tech Support) staff.
 * Approved staff, Developers, and all End-Users: normal login unchanged.
 * Soft block without full page refresh or portal flash.
 * Pending: no "Signed in" toast; orange glow on login card.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_APPROVAL_GATE_V5 >= 3) return;
  window.__DR_AGENT_APPROVAL_GATE_V5 = 3;
  window.__DR_AGENT_APPROVAL_GATE_V4 = 1;
  window.__DR_AGENT_APPROVAL_GATE_V3 = 1;
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
  var _lastKick = 0;
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
      'body.dr-pending-blocked #portal-agent{' +
      '  display:none!important;visibility:hidden!important;pointer-events:none!important;' +
      '  opacity:0!important}' +
      'body.dr-pending-blocked #login-screen,' +
      'body.dr-pending-blocked #auth-screen,' +
      'body.dr-pending-blocked .login-screen{' +
      '  display:block!important;visibility:visible!important;opacity:1!important;' +
      '  pointer-events:auto!important}' +
      'body.dr-pending-blocked canvas,' +
      'body.dr-pending-blocked .lifeline,' +
      'body.dr-pending-blocked #lifeline,' +
      'body.dr-pending-blocked .heartbeat-canvas{' +
      '  visibility:visible!important;opacity:1!important}' +
      'body.dr-pending-blocked .login-card,' +
      '.login-card.dr-login-pending{' +
      '  border-color:rgba(251,146,60,0.85)!important;' +
      '  box-shadow:0 0 0 1px rgba(251,146,60,0.45),0 0 28px 6px rgba(251,146,60,0.45),0 0 56px 12px rgba(251,146,60,0.22)!important;' +
      '  transition:box-shadow 0.35s ease,border-color 0.35s ease}' +
      'body.dr-pending-blocked .toast.success,' +
      'body.dr-pending-blocked .toast[data-dr-signed-in]{display:none!important}';
    _blockCssReady = true;
  }

  function setPendingBlocked(on) {
    ensureBlockCss();
    try {
      if (on) {
        document.body.classList.add('dr-pending-blocked');
        setLoginPendingGlow(true);
        removeSignedInToasts();
      } else {
        document.body.classList.remove('dr-pending-blocked');
        setLoginPendingGlow(false);
      }
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
        'background:rgba(28,22,42,0.96);border:1px solid rgba(167,139,250,0.35);' +
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

  function removeSignedInToasts() {
    try {
      var c = document.getElementById('toast-container');
      if (!c) return;
      Array.prototype.slice.call(c.querySelectorAll('.toast')).forEach(function (el) {
        var tx = (el.textContent || '').toLowerCase();
        if (
          tx.indexOf('signed in') !== -1 ||
          tx.indexOf('sign in…') !== -1 ||
          tx.indexOf('sign in...') !== -1
        ) {
          try {
            el.parentNode && el.parentNode.removeChild(el);
          } catch (e0) {}
        }
      });
    } catch (e) {}
  }

  function setLoginPendingGlow(on) {
    try {
      document.querySelectorAll('.login-card').forEach(function (card) {
        if (on) card.classList.add('dr-login-pending');
        else card.classList.remove('dr-login-pending');
      });
    } catch (e) {}
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

  async function checkPendingAndBlock(user, profile, loginHint) {
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

    if (
      role === 'customer' ||
      role === 'user' ||
      role === 'end-user' ||
      role === 'enduser' ||
      role === 'end_user'
    ) {
      return false;
    }

    var isStaff = role === 'agent' || role === 'admin';

    if (meta.approval_status === 'pending' || meta.approved === false) {
      markPending(uid, username, email);
      return true;
    }
    if (isMarkedPending(uid, username, email)) return true;

    if (isStaff) {
      markPending(uid, username, email);
      return true;
    }

    return false;
  }

  async function softSignOut() {
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

  function showLoginOnly() {
    ensureBlockCss();
    setPendingBlocked(true);
    try {
      var pa = document.getElementById('portal-agent');
      if (pa) pa.classList.remove('active');
      var ls =
        document.getElementById('login-screen') ||
        document.getElementById('auth-screen');
      if (ls) {
        ls.hidden = false;
        ls.style.display = '';
        ls.classList.add('active');
      }
    } catch (e2) {}
  }

  async function kickPending(user, profile, loginHint, silent) {
    var pending = await checkPendingAndBlock(user, profile, loginHint);
    if (!pending) {
      setPendingBlocked(false);
      return false;
    }
    _gateBusy = true;
    showLoginOnly();
    removeSignedInToasts();
    await softSignOut();
    showLoginOnly();
    removeSignedInToasts();
    if (!silent || Date.now() - _lastPendingShow > 2500) {
      showAgentError(PENDING_MSG);
    }
    removeSignedInToasts();
    _lastKick = Date.now();
    setTimeout(function () {
      _gateBusy = false;
    }, 600);
    var n = 0;
    var hold = setInterval(function () {
      n++;
      showLoginOnly();
      removeSignedInToasts();
      if (n > 20) clearInterval(hold);
    }, 120);
    return true;
  }

  function blockPendingSession(user, profile, loginHint) {
    return kickPending(user, profile, loginHint, false);
  }

  function patchShowApp() {
    function wrap(fn) {
      if (!fn || fn.__drApprovalWrap) return fn;
      var wrapped = async function (p) {
        try {
          var client = sb();
          if (client) {
            var sess = await client.auth.getSession();
            var session = sess && sess.data && sess.data.session;
            if (session && session.user) {
              var user = session.user;
              var profile = p || null;
              if (!profile) {
                try {
                  var pr = await client
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();
                  profile = pr && pr.data;
                } catch (e1) {}
              }
              var blocked = await checkPendingAndBlock(
                user,
                profile,
                (user.user_metadata || {}).username || ''
              );
              if (blocked) {
                await kickPending(user, profile, (user.user_metadata || {}).username || '', false);
                return;
              }
              setPendingBlocked(false);
            }
          }
        } catch (e) {}
        return fn.apply(this, arguments);
      };
      wrapped.__drApprovalWrap = 1;
      return wrapped;
    }
    try {
      if (typeof window.showApp === 'function') {
        window.showApp = wrap(window.showApp);
      }
      if (window.DR && typeof window.DR.showApp === 'function') {
        window.DR.showApp = wrap(window.DR.showApp);
      }
    } catch (e) {}
  }

  function patchToast() {
    try {
      if (window.DR && typeof window.DR.toast === 'function' && !window.DR.toast.__drPendingFilter) {
        var orig = window.DR.toast;
        window.DR.toast = function (msg, type) {
          try {
            if (
              document.body.classList.contains('dr-pending-blocked') &&
              /signed in/i.test(String(msg || ''))
            ) {
              return;
            }
          } catch (e) {}
          return orig.apply(this, arguments);
        };
        window.DR.toast.__drPendingFilter = 1;
      }
      if (typeof window.toast === 'function' && !window.toast.__drPendingFilter) {
        var orig2 = window.toast;
        window.toast = function (msg, type) {
          try {
            if (
              document.body.classList.contains('dr-pending-blocked') &&
              /signed in/i.test(String(msg || ''))
            ) {
              return;
            }
          } catch (e) {}
          return orig2.apply(this, arguments);
        };
        window.toast.__drPendingFilter = 1;
      }
    } catch (e) {}
  }

  function wireLoginGate() {
    var form = document.getElementById('login-agent');
    if (!form || form.__drApprovalGateV5) return;
    form.__drApprovalGateV5 = 1;

    form.addEventListener(
      'submit',
      function () {
        if (_gateBusy) {
          showPendingToast(PENDING_MSG);
          showLoginOnly();
          return;
        }
        ensureBlockCss();

        var tries = 0;
        var t = setInterval(function () {
          tries++;
          (async function () {
            try {
              var client = sb();
              if (!client) {
                if (tries > 40) clearInterval(t);
                return;
              }
              var sess = await client.auth.getSession();
              var session = sess && sess.data && sess.data.session;
              if (!session || !session.user) {
                if (tries > 40) clearInterval(t);
                return;
              }
              var user = session.user;
              var loginHint = '';
              try {
                var inp =
                  document.getElementById('agent-username') ||
                  document.getElementById('agent-user');
                loginHint = inp ? (inp.value || '').trim() : '';
              } catch (e0) {}

              var profile = null;
              try {
                var pr = await client
                  .from('profiles')
                  .select('*')
                  .eq('id', user.id)
                  .maybeSingle();
                profile = pr && pr.data;
              } catch (e1) {}

              clearInterval(t);
              var blocked = await kickPending(user, profile, loginHint, false);
              if (!blocked) setPendingBlocked(false);
            } catch (err) {
              if (tries > 40) clearInterval(t);
            }
          })();
        }, 120);
      },
      true
    );
  }

  function wireSessionGuard() {
    if (window.__drApprovalSessionGuardV5) return;
    window.__drApprovalSessionGuardV5 = 1;

    setInterval(function () {
      (async function () {
        try {
          patchShowApp();
          patchToast();
          var pa = document.getElementById('portal-agent');
          var portalOpen = !!(pa && pa.classList.contains('active'));
          var client = sb();
          if (!client) return;

          var sess = await client.auth.getSession();
          var session = sess && sess.data && sess.data.session;
          if (!session || !session.user) {
            if (portalOpen) showLoginOnly();
            return;
          }

          var user = session.user;
          var meta = user.user_metadata || {};
          var profile = null;
          try {
            var pr = await client
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            profile = pr && pr.data;
          } catch (e1) {}

          var role = String((profile && profile.role) || meta.role || '').toLowerCase();

          if (
            role === 'customer' ||
            role === 'user' ||
            role === 'end-user' ||
            role === 'enduser' ||
            role === 'end_user'
          ) {
            setPendingBlocked(false);
            return;
          }

          if (role !== 'agent' && role !== 'admin') {
            setPendingBlocked(false);
            return;
          }

          var blocked = await checkPendingAndBlock(user, profile, meta.username || '');
          if (blocked) {
            showLoginOnly();
            removeSignedInToasts();
            if (Date.now() - _lastKick > 3000) {
              await kickPending(user, profile, meta.username || '', true);
            }
          } else {
            setPendingBlocked(false);
          }
        } catch (e) {}
      })();
    }, 900);
  }

  function wirePortalObserver() {
    if (window.__drApprovalPortalObsV5) return;
    window.__drApprovalPortalObsV5 = 1;
    try {
      var pa = document.getElementById('portal-agent');
      if (!pa) {
        setTimeout(wirePortalObserver, 1200);
        return;
      }
      var mo = new MutationObserver(function () {
        if (!pa.classList.contains('active')) return;
        (async function () {
          try {
            var client = sb();
            if (!client) return;
            var sess = await client.auth.getSession();
            var session = sess && sess.data && sess.data.session;
            if (!session || !session.user) {
              showLoginOnly();
              return;
            }
            var user = session.user;
            var profile = null;
            try {
              var pr = await client
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
              profile = pr && pr.data;
            } catch (e1) {}
            await kickPending(user, profile, (user.user_metadata || {}).username || '', false);
          } catch (e) {}
        })();
      });
      mo.observe(pa, { attributes: true, attributeFilter: ['class', 'style'] });
    } catch (e) {}
  }

  window.DRAgentApproval = {
    markPending: markPending,
    isMarkedPending: isMarkedPending,
    isApproved: isApproved,
    getApprovalMap: getApprovalMap,
    setApprovalMap: setApprovalMap,
    showPendingToast: showPendingToast,
    checkPendingAndBlock: checkPendingAndBlock,
    kickPending: kickPending
  };

  function tick() {
    ensureBlockCss();
    patchToast();
    wireLoginGate();
    wireSessionGuard();
    wirePortalObserver();
    patchShowApp();
    if (document.body.classList.contains('dr-pending-blocked')) {
      removeSignedInToasts();
      setLoginPendingGlow(true);
    }
  }

  tick();
  setInterval(tick, 2500);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
})();
