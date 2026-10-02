/**
 * Divine Rays — force pending staff block V3 — sync glow/toast, 1 shake, keep background
 * Orange login-card glow (10s) + single pending toast that shakes on re-click.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_BLOCK >= 3) return;
  window.__DR_FORCE_PENDING_BLOCK = 3;

  var KEY = 'dr_staff_approval';
  var MSG =
    'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
  var GLOW_MS = 10000;
  var TOAST_MS = 10000;
  var _glowTimer = null;
  var _toastEl = null;
  var _toastTimer = null;
  var _busy = false;
  var _lastPendingAt = 0;

  function map() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }
  function isDev(n) {
    return !!DEVS[String(n || '').toLowerCase().trim()];
  }
  function isApproved(id, un, em) {
    var m = map();
    if (id && m[id] === 'approved') return true;
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (un && m['u:' + un] === 'approved') return true;
    if (em && m['e:' + em] === 'approved') return true;
    return false;
  }
  function markPending(id, un, em) {
    var m = map();
    if (id) m[id] = 'pending';
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (un) m['pending:' + un] = 'pending';
    if (em) m['pending:' + em] = 'pending';
    try {
      localStorage.setItem(KEY, JSON.stringify(m));
    } catch (e) {}
  }
  function isCustomer(r) {
    r = String(r || '').toLowerCase();
    return (
      r === 'customer' ||
      r === 'user' ||
      r === 'end-user' ||
      r === 'enduser' ||
      r === 'end_user'
    );
  }
  function isStaff(r) {
    r = String(r || '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .trim();
    if (!r) return false;
    if (isCustomer(r)) return false;
    if (
      r === 'agent' ||
      r === 'admin' ||
      r === 'owner' ||
      r === 'developer' ||
      r === 'dev'
    )
      return true;
    if (r.indexOf('tech support') !== -1 || r.indexOf('it tech') !== -1) return true;
    if (r.indexOf('admin') !== -1 || r.indexOf('agent') !== -1 || r === 'staff' || r === 'support')
      return true;
    return false;
  }
  function sb() {
    try {
      if (window.DR && window.DR.sb) return window.DR.sb();
    } catch (e) {}
    return window.__drSb || window.__drAgentSb || null;
  }

  function ensureCss() {
    if (document.getElementById('dr-force-pending-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-force-pending-css';
    s.textContent = [
      'body.dr-pending-blocked #portal-agent{display:none!important;visibility:hidden!important;opacity:0!important}',
      'body.dr-pending-blocked #login-screen{display:flex!important;visibility:visible!important;opacity:1!important;z-index:60!important}',
      'body.dr-pending-blocked .toast.success{display:none!important}',
      'body.dr-pending-blocked canvas,body.dr-pending-blocked .lifeline,body.dr-pending-blocked #bg-canvas,',
      'body.dr-pending-blocked .bg-anim,body.dr-pending-blocked #login-bg,body.dr-pending-blocked .login-bg{',
      'visibility:visible!important;opacity:1!important;display:block!important}',
      'body.dr-pending-blocked{background:inherit!important}',
      '.login-card.login-pending-glow,#login-screen .login-card.login-pending-glow,',
      '.login-card.dr-login-pending,#login-screen .login-card.dr-login-pending{',
      'border-color:rgba(251,146,60,0.95)!important;',
      'box-shadow:0 0 22px rgba(251,146,60,0.85),0 0 52px rgba(249,115,22,0.55),0 0 80px rgba(234,88,12,0.3),0 12px 40px rgba(0,0,0,0.3)!important;',
      'transition:box-shadow .25s ease,border-color .25s ease!important}',
      'html[data-theme="light"] .login-card.login-pending-glow,html[data-theme="light"] #login-screen .login-card.login-pending-glow,',
      'html[data-theme="light"] .login-card.dr-login-pending,html[data-theme="light"] #login-screen .login-card.dr-login-pending{',
      'border-color:rgba(234,88,12,0.95)!important;',
      'box-shadow:0 0 28px rgba(251,146,60,0.9),0 0 56px rgba(249,115,22,0.55),0 10px 32px rgba(30,30,60,0.08)!important}',
      '.login-card.login-pending-shake,#login-screen .login-card.login-pending-shake{',
      'animation:dr-pending-shake 0.35s ease}',
      '@keyframes dr-pending-shake{',
      '0%,100%{transform:translateX(0)}',
      '25%{transform:translateX(-6px)}',
      '50%{transform:translateX(6px)}',
      '75%{transform:translateX(-3px)}}',
      '.toast.dr-pending-toast-shake{animation:dr-pending-shake 0.35s ease}',
      '.toast[data-dr-force-pending]{',
      'pointer-events:auto;padding:0.9rem 1.15rem;border-radius:14px;max-width:min(22rem,92vw);',
      'background:rgba(28,22,42,0.98);border:1px solid rgba(251,146,60,0.55);',
      'color:#eeeef6;font-size:0.9rem;line-height:1.45;box-shadow:0 12px 32px rgba(0,0,0,0.5)}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function getLoginCard() {
    return (
      document.querySelector('#login-screen .login-card') ||
      document.querySelector('.login-card') ||
      null
    );
  }

  function applyOrangeGlow() {
    ensureCss();
    var card = getLoginCard();
    if (!card) return;
    card.classList.remove('login-fail-glow', 'login-fail-shake', 'login-pass-ok', 'login-fail-healing');
    card.classList.add('login-pending-glow');
    card.classList.add('dr-login-pending');
  }

  function shakeCard() {
    var card = getLoginCard();
    if (!card) return;
    card.classList.remove('login-pending-shake');
    void card.offsetWidth;
    card.classList.add('login-pending-shake');
    setTimeout(function () {
      try {
        card.classList.remove('login-pending-shake');
      } catch (e) {}
    }, 350);
  }

  function lockPortal() {
    ensureCss();
    try {
      document.body.classList.add('dr-pending-blocked');
      var pa = document.getElementById('portal-agent');
      if (pa) {
        pa.classList.remove('active');
        pa.style.setProperty('display', 'none', 'important');
      }
      var ls = document.getElementById('login-screen');
      if (ls) {
        ls.hidden = false;
        ls.style.display = '';
        ls.classList.add('active');
      }
    } catch (e) {}
  }

  function showPendingToast(isRepeat) {
    ensureCss();
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.style.cssText =
        'position:fixed;top:1rem;right:1rem;z-index:2147483646;display:flex;flex-direction:column;gap:0.5rem;max-width:min(22rem,92vw);pointer-events:none';
      document.body.appendChild(c);
    }
    c.style.zIndex = '2147483646';

    Array.prototype.slice.call(c.querySelectorAll('.toast')).forEach(function (el) {
      if (el === _toastEl) return;
      var tx = (el.textContent || '').toLowerCase();
      if (
        tx.indexOf('pending') !== -1 ||
        el.getAttribute('data-dr-force-pending') ||
        el.getAttribute('data-dr-pending-approval')
      ) {
        try {
          el.parentNode.removeChild(el);
        } catch (e) {}
      }
    });

    if (!_toastEl || !_toastEl.parentNode) {
      _toastEl = document.createElement('div');
      _toastEl.className = 'toast error';
      _toastEl.setAttribute('data-dr-force-pending', '1');
      _toastEl.setAttribute('role', 'alert');
      c.appendChild(_toastEl);
    }
    _toastEl.textContent = MSG;
    _toastEl.style.display = 'block';
    _toastEl.style.opacity = '1';
    _toastEl.style.visibility = 'visible';

    if (isRepeat) {
      _toastEl.classList.remove('dr-pending-toast-shake');
      void _toastEl.offsetWidth;
      _toastEl.classList.add('dr-pending-toast-shake');
      setTimeout(function () {
        try {
          _toastEl && _toastEl.classList.remove('dr-pending-toast-shake');
        } catch (e) {}
      }, 350);
      shakeCard();
    }
  }

  function clearPendingVisuals() {
    try {
      var card = getLoginCard();
      if (card) {
        card.classList.remove('login-pending-glow', 'dr-login-pending', 'login-pending-shake');
      }
    } catch (e) {}
    try {
      if (_toastEl && _toastEl.parentNode) _toastEl.parentNode.removeChild(_toastEl);
    } catch (e2) {}
    _toastEl = null;
    if (_glowTimer) {
      clearTimeout(_glowTimer);
      _glowTimer = null;
    }
    if (_toastTimer) {
      clearTimeout(_toastTimer);
      _toastTimer = null;
    }
  }

  function showPendingUI(isRepeat) {
    lockPortal();
    applyOrangeGlow();
    showPendingToast(!!isRepeat);
    if (_glowTimer) clearTimeout(_glowTimer);
    if (_toastTimer) clearTimeout(_toastTimer);
    _glowTimer = setTimeout(function () {
      clearPendingVisuals();
    }, GLOW_MS);
    _toastTimer = _glowTimer;
    try {
      var c = document.getElementById('toast-container');
      if (c) {
        Array.prototype.slice.call(c.querySelectorAll('.toast')).forEach(function (el) {
          if (((el.textContent || '') + '').toLowerCase().indexOf('signed in') !== -1) {
            try {
              el.parentNode.removeChild(el);
            } catch (e) {}
          }
        });
      }
    } catch (e2) {}
  }

  function shouldBlock(user, profile) {
    if (!user) return false;
    var meta = user.user_metadata || {};
    var uid = user.id;
    var email = (user.email || (profile && profile.email) || '').toLowerCase();
    var un = String(meta.username || (profile && profile.username) || '')
      .toLowerCase()
      .trim();
    if (isDev(un)) return false;
    if (meta.approval_status === 'approved' || meta.approved === true) return false;
    if (isApproved(uid, un, email)) return false;
    var role = String(
      (profile && profile.role) ||
        meta.role ||
        (profile && profile.staff_role) ||
        meta.staff_role ||
        ''
    ).toLowerCase();
    if (isCustomer(role) || isCustomer((profile && profile.role) || meta.role)) return false;
    if (meta.approval_status === 'pending' || meta.approved === false) {
      markPending(uid, un, email);
      return true;
    }
    var m = map();
    if (
      (uid && m[uid] === 'pending') ||
      (un && m['pending:' + un] === 'pending') ||
      (email && m['pending:' + email] === 'pending')
    )
      return true;
    if (
      isStaff(role) ||
      isStaff((profile && profile.role) || '') ||
      isStaff((profile && profile.staff_role) || '')
    ) {
      markPending(uid, un, email);
      return true;
    }
    if (profile && !isCustomer(profile.role)) {
      markPending(uid, un, email);
      return true;
    }
    return false;
  }

  async function kick() {
    try {
      var client = sb();
      if (client && client.auth) await client.auth.signOut({ scope: 'local' });
    } catch (e) {}
    try {
      window.__drFullLoaded = false;
      window.__drBooting = false;
      window.__drProfile = null;
    } catch (e2) {}
  }

  function wrapShowApp() {
    function wrap(fn) {
      if (!fn || fn.__drForcePendingWrapV2) return fn;
      var w = function (p) {
        try {
          var role = p && p.role;
          var un = (p && p.username) || '';
          var em = (p && p.email) || '';
          var id = p && p.id;
          if (
            !isDev(un) &&
            !isApproved(id, un, em) &&
            !isCustomer(role) &&
            (isStaff(role) || isStaff(p && p.staff_role) || (p && !isCustomer(role)))
          ) {
            markPending(id, un, em);
            showPendingUI(false);
            kick();
            return;
          }
        } catch (e) {}
        return fn.apply(this, arguments);
      };
      w.__drForcePendingWrapV2 = 1;
      return w;
    }
    try {
      if (typeof window.showApp === 'function') window.showApp = wrap(window.showApp);
      if (window.DR && typeof window.DR.showApp === 'function') window.DR.showApp = wrap(window.DR.showApp);
    } catch (e) {}
  }

  async function checkSession() {
    if (_busy) return;
    _busy = true;
    try {
      wrapShowApp();
      var client = sb();
      if (!client) return;
      var s = await client.auth.getSession();
      var session = s && s.data && s.data.session;
      if (!session || !session.user) return;
      var user = session.user;
      var profile = null;
      try {
        var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
        profile = pr && pr.data;
      } catch (e) {}
      if (shouldBlock(user, profile)) {
        showPendingUI(false);
        await kick();
        lockPortal();
      }
    } catch (e) {
    } finally {
      _busy = false;
    }
  }

  function observePendingToast() {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var found = false;
    Array.prototype.slice.call(c.querySelectorAll('.toast')).forEach(function (el) {
      var tx = (el.textContent || '').toLowerCase();
      if (tx.indexOf('pending administrator approval') !== -1) found = true;
    });
    if (found) {
      var now = Date.now();
      var isRepeat = now - _lastPendingAt < 8000 && _lastPendingAt > 0;
      _lastPendingAt = now;
      applyOrangeGlow();
      if (isRepeat) showPendingToast(true);
      else showPendingToast(false);
      Array.prototype.slice.call(c.querySelectorAll('.toast')).forEach(function (el) {
        if (el === _toastEl) return;
        var tx = (el.textContent || '').toLowerCase();
        if (tx.indexOf('pending administrator approval') !== -1) {
          try {
            el.parentNode.removeChild(el);
          } catch (e) {}
        }
      });
    }
  }

  function onSubmit(ev) {
    var form = ev.target;
    if (!form || form.id !== 'login-agent') return;
    try {
      var inp = document.getElementById('agent-username') || document.getElementById('agent-user');
      var userOrEmail = inp ? (inp.value || '').trim() : '';
      var un = userOrEmail.indexOf('@') === -1 ? userOrEmail.toLowerCase() : '';
      var em = userOrEmail.indexOf('@') !== -1 ? userOrEmail.toLowerCase() : '';
      var m = map();
      var marked =
        (un && m['pending:' + un] === 'pending') || (em && m['pending:' + em] === 'pending');
      if (marked && !isApproved(null, un, em) && !isDev(un)) {
        var now = Date.now();
        var isRepeat = now - _lastPendingAt < 8000 && _lastPendingAt > 0;
        _lastPendingAt = now;
        setTimeout(function () {
          showPendingUI(isRepeat);
        }, 30);
      }
    } catch (e) {}
  }

  if (!window.__drForcePendingSubmitV2) {
    window.__drForcePendingSubmitV2 = 1;
    document.addEventListener('submit', onSubmit, true);
  }

  wrapShowApp();
  checkSession();
  setInterval(function () {
    wrapShowApp();
    checkSession();
    observePendingToast();
  }, 700);

  window.DRForcePending = {
    showPendingUI: showPendingUI,
    applyOrangeGlow: applyOrangeGlow
  };
})();
