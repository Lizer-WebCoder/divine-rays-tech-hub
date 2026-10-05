/**
 * Divine Rays — force pending staff block V6
 * Only blocks EXPLICITLY pending accounts. Approved staff log in normally.
 * Shows toast on auth errors. Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_BLOCK >= 6) return;
  window.__DR_FORCE_PENDING_BLOCK = 6;

  var KEY = 'dr_staff_approval';
  var MSG =
    'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
  var FADE_MS = 5000;
  var _timer = null;
  var _toastEl = null;
  var _uiOn = false;
  var _shakeLock = false;

  function map() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }
  function save(m) {
    try {
      localStorage.setItem(KEY, JSON.stringify(m));
    } catch (e) {}
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
    save(m);
  }
  function isMarkedPending(id, un, em) {
    var m = map();
    if (id && m[id] === 'pending') return true;
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (un && m['pending:' + un] === 'pending') return true;
    if (em && m['pending:' + em] === 'pending') return true;
    return false;
  }
  function isCustomer(r) {
    r = String(r || '').toLowerCase();
    return r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'end_user';
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
      'body.dr-pending-blocked canvas,body.dr-pending-blocked .lifeline,body.dr-pending-blocked #bg-canvas{visibility:visible!important;opacity:1!important}',
      '.login-card.login-pending-glow,#login-screen .login-card.login-pending-glow,',
      '.login-card.dr-login-pending,#login-screen .login-card.dr-login-pending{',
      'border-color:rgba(251,146,60,0.95)!important;',
      'box-shadow:0 0 22px rgba(251,146,60,0.85),0 0 52px rgba(249,115,22,0.55),0 0 80px rgba(234,88,12,0.3),0 12px 40px rgba(0,0,0,0.3)!important;',
      'transition:box-shadow .25s ease,border-color .25s ease!important}',
      '.login-card.login-pending-shake{animation:dr-fp-shake 0.35s ease}',
      '@keyframes dr-fp-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-3px)}}',
      '.toast.dr-pending-toast-shake{animation:dr-fp-shake 0.35s ease}',
      '.toast[data-dr-force-pending]{pointer-events:auto;padding:0.9rem 1.15rem;border-radius:14px;max-width:min(22rem,92vw);',
      'background:rgba(28,22,42,0.98);border:1px solid rgba(251,146,60,0.55);color:#eeeef6;font-size:0.9rem;line-height:1.45;box-shadow:0 12px 32px rgba(0,0,0,0.5)}',
      '#login-agent button[type="submit"].dr-btn-loading{opacity:0.75!important;cursor:wait!important;pointer-events:none!important;transform:scale(0.98)}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function card() {
    return document.querySelector('#login-screen .login-card') || document.querySelector('.login-card');
  }
  function btn() {
    var f = document.getElementById('login-agent');
    return f ? f.querySelector('button[type="submit"]') : null;
  }
  function setLoading(on) {
    var b = btn();
    if (!b) return;
    if (on) {
      if (!b.getAttribute('data-dr-label-save'))
        b.setAttribute('data-dr-label-save', (b.textContent || 'Sign in as Admin').trim());
      b.classList.add('dr-btn-loading');
      b.disabled = true;
      b.textContent = 'Signing in…';
    } else {
      b.classList.remove('dr-btn-loading');
      b.disabled = false;
      var s = b.getAttribute('data-dr-label-save') || 'Sign in as Admin';
      if (/agent/i.test(s)) s = 'Sign in as Admin';
      b.textContent = s;
    }
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

  function clearUI() {
    try {
      var c = card();
      if (c) c.classList.remove('login-pending-glow', 'dr-login-pending', 'login-pending-shake');
    } catch (e) {}
    try {
      if (_toastEl && _toastEl.parentNode) _toastEl.parentNode.removeChild(_toastEl);
    } catch (e2) {}
    _toastEl = null;
    _uiOn = false;
    if (_timer) {
      clearTimeout(_timer);
      _timer = null;
    }
  }

  function shake() {
    if (_shakeLock) return;
    _shakeLock = true;
    var c = card();
    if (c) {
      c.classList.remove('login-pending-shake');
      void c.offsetWidth;
      c.classList.add('login-pending-shake');
    }
    if (_toastEl) {
      _toastEl.classList.remove('dr-pending-toast-shake');
      void _toastEl.offsetWidth;
      _toastEl.classList.add('dr-pending-toast-shake');
    }
    setTimeout(function () {
      try {
        if (c) c.classList.remove('login-pending-shake');
        if (_toastEl) _toastEl.classList.remove('dr-pending-toast-shake');
      } catch (e) {}
      _shakeLock = false;
    }, 400);
  }

  function showPending(isRepeat) {
    ensureCss();
    lockPortal();
    var c = card();
    if (c) {
      c.classList.remove('login-fail-glow', 'login-pass-ok');
      c.classList.add('login-pending-glow', 'dr-login-pending');
    }
    var box = document.getElementById('toast-container');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast-container';
      box.style.cssText =
        'position:fixed;top:1rem;right:1rem;z-index:2147483646;display:flex;flex-direction:column;gap:0.5rem;max-width:min(22rem,92vw);pointer-events:none';
      document.body.appendChild(box);
    }
    Array.prototype.slice.call(box.querySelectorAll('.toast')).forEach(function (el) {
      if (el === _toastEl) return;
      var tx = (el.textContent || '').toLowerCase();
      if (
        tx.indexOf('pending') !== -1 ||
        tx.indexOf('signed in') !== -1 ||
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
      box.appendChild(_toastEl);
    }
    _toastEl.textContent = MSG;
    _toastEl.style.display = 'block';
    _toastEl.style.opacity = '1';
    if (isRepeat) shake();
    _uiOn = true;
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(clearUI, FADE_MS);
    setLoading(false);
  }

  function shouldBlock(user, profile, hint) {
    if (!user) return false;
    var meta = user.user_metadata || {};
    var uid = user.id;
    var email = (user.email || (profile && profile.email) || '').toLowerCase();
    var un = String(meta.username || (profile && profile.username) || hint || '')
      .toLowerCase()
      .trim();
    if (isDev(un)) return false;
    if (meta.approval_status === 'approved' || meta.approved === true) return false;
    if (isApproved(uid, un, email)) return false;

    var role = String(
      (profile && profile.role) || meta.role || (profile && profile.staff_role) || meta.staff_role || ''
    ).toLowerCase();
    if (isCustomer(role) || isCustomer((profile && profile.role) || meta.role)) return false;

    if (meta.approval_status === 'pending' || meta.approved === false) {
      markPending(uid, un, email);
      return true;
    }
    if (isMarkedPending(uid, un, email)) return true;

    if (profile && (profile.approval_status === 'pending' || profile.approved === false)) {
      markPending(uid, un, email);
      return true;
    }
    return false;
  }

  async function quietSignOut() {
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

  function onSubmit(ev) {
    var form = ev.target;
    if (!form || form.id !== 'login-agent') return;

    var inp = document.getElementById('agent-username') || document.getElementById('agent-user');
    var userOrEmail = inp ? (inp.value || '').trim() : '';
    var un = userOrEmail.indexOf('@') === -1 ? userOrEmail.toLowerCase() : '';
    var em = userOrEmail.indexOf('@') !== -1 ? userOrEmail.toLowerCase() : '';

    if (isMarkedPending(null, un, em) && !isApproved(null, un, em) && !isDev(un)) {
      try {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      } catch (e) {}
      showPending(_uiOn);
      quietSignOut();
      return;
    }
  }

  function wrapShowApp() {
    function wrap(fn) {
      if (!fn || fn.__drFpWrapV6) return fn;
      var w = function (p) {
        try {
          var un = (p && p.username) || '';
          var em = (p && p.email) || '';
          var id = p && p.id;
          if (isDev(un)) return fn.apply(this, arguments);
          if (isApproved(id, un, em)) return fn.apply(this, arguments);
          if (p && (p.approval_status === 'approved' || p.approved === true))
            return fn.apply(this, arguments);
          if (isMarkedPending(id, un, em)) {
            showPending(false);
            quietSignOut();
            return;
          }
          if (p && (p.approval_status === 'pending' || p.approved === false)) {
            markPending(id, un, em);
            showPending(false);
            quietSignOut();
            return;
          }
        } catch (e) {}
        return fn.apply(this, arguments);
      };
      w.__drFpWrapV6 = 1;
      return w;
    }
    try {
      if (typeof window.showApp === 'function') window.showApp = wrap(window.showApp);
      if (window.DR && typeof window.DR.showApp === 'function') window.DR.showApp = wrap(window.DR.showApp);
    } catch (e) {}
  }

  async function checkSession() {
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
      if (shouldBlock(user, profile, (user.user_metadata || {}).username || '')) {
        showPending(false);
        await quietSignOut();
        lockPortal();
      }
    } catch (e) {}
  }

  function hookGate() {
    try {
      if (window.DRAgentApproval && window.DRAgentApproval.showPendingToast && !window.DRAgentApproval.__drFpHookV6) {
        var orig = window.DRAgentApproval.showPendingToast;
        window.DRAgentApproval.showPendingToast = function () {
          showPending(_uiOn);
          try {
            return orig.apply(this, arguments);
          } catch (e) {}
        };
        window.DRAgentApproval.__drFpHookV6 = 1;
      }
    } catch (e) {}
  }

  if (!window.__drForcePendingSubmitV6) {
    window.__drForcePendingSubmitV6 = 1;
    document.addEventListener('submit', onSubmit, true);
  }

  ensureCss();
  wrapShowApp();
  hookGate();
  checkSession();
  setInterval(function () {
    wrapShowApp();
    hookGate();
    checkSession();
  }, 1500);

  window.DRForcePending = {
    showPendingUI: showPending,
    clearPendingVisuals: clearUI
  };
})();
