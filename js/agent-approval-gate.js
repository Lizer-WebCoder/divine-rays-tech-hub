/**
 * Divine Rays — Agent approval gate V7.1
 * Faster pending popup, "Sign in as Admin" label, button loading feedback.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_APPROVAL_GATE_V7 >= 2) return;
  window.__DR_AGENT_APPROVAL_GATE_V7 = 2;
  window.__DR_AGENT_APPROVAL_GATE_V6 = 99;
  window.__DR_AGENT_APPROVAL_GATE = 1;

  var APPROVAL_KEY = 'dr_staff_approval';
  var PENDING_MSG =
    'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var TOAST_MS = 5000;
  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
  var _pendingToastEl = null;
  var _pendingToastTimer = null;
  var _busy = false;
  var _allowPass = false;
  var _btnOrigLabel = 'Sign in as Admin';

  function getMap() {
    try {
      return JSON.parse(localStorage.getItem(APPROVAL_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }
  function setMap(m) {
    try {
      localStorage.setItem(APPROVAL_KEY, JSON.stringify(m || {}));
    } catch (e) {}
  }
  function markPending(id, un, em) {
    var m = getMap();
    if (id) m[id] = 'pending';
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (un) m['pending:' + un] = 'pending';
    if (em) m['pending:' + em] = 'pending';
    setMap(m);
  }
  function isApproved(id, un, em) {
    var m = getMap();
    if (id && m[id] === 'approved') return true;
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (un && m['u:' + un] === 'approved') return true;
    if (em && m['e:' + em] === 'approved') return true;
    return false;
  }
  function isMarkedPending(id, un, em) {
    var m = getMap();
    if (id && m[id] === 'pending') return true;
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (un && m['pending:' + un] === 'pending') return true;
    if (em && m['pending:' + em] === 'pending') return true;
    return false;
  }
  function isDev(name) {
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

  function ensureCss() {
    if (document.getElementById('dr-approval-v7-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-approval-v7-css';
    el.textContent =
      'body.dr-pending-blocked #portal-agent,' +
      'body.dr-staff-gate-lock #portal-agent{' +
      'display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important}' +
      'body.dr-pending-blocked #login-screen,' +
      'body.dr-staff-gate-lock #login-screen{' +
      'display:flex!important;visibility:visible!important;opacity:1!important;z-index:60!important}' +
      'body.dr-pending-blocked .login-card,' +
      '.login-card.dr-login-pending{' +
      'border-color:rgba(251,146,60,0.95)!important;' +
      'box-shadow:0 0 0 1px rgba(251,146,60,0.55),0 0 36px 10px rgba(251,146,60,0.55),0 0 70px 18px rgba(251,146,60,0.28)!important}' +
      'body.dr-pending-blocked .toast.success{display:none!important}' +
      '#login-agent button[type="submit"].dr-btn-loading,' +
      '#login-agent .btn.dr-btn-loading{' +
      'opacity:0.75!important;cursor:wait!important;pointer-events:none!important;' +
      'transform:scale(0.98);filter:brightness(0.92);' +
      'box-shadow:inset 0 2px 8px rgba(0,0,0,0.35)!important;' +
      'transition:transform 0.12s ease,opacity 0.12s ease,filter 0.12s ease}' +
      '#login-agent button[type="submit"]:not(.dr-btn-loading):active{' +
      'transform:scale(0.97);filter:brightness(0.9)}' +
      '#login-agent button[type="submit"]{' +
      'transition:transform 0.12s ease,opacity 0.12s ease,filter 0.12s ease,box-shadow 0.12s ease}';
    (document.head || document.documentElement).appendChild(el);
  }

  function getAgentSubmitBtn() {
    var form = document.getElementById('login-agent');
    if (!form) return null;
    return form.querySelector('button[type="submit"]');
  }

  function polishAdminButton() {
    var btn = getAgentSubmitBtn();
    if (!btn) return;
    var tx = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (/sign\s*in\s*as\s*agent/i.test(tx) || tx === 'Sign In as Agent' || /as agent/i.test(tx)) {
      btn.textContent = _btnOrigLabel;
    }
    if (!btn.getAttribute('data-dr-admin-btn')) {
      btn.setAttribute('data-dr-admin-btn', '1');
      btn.setAttribute('aria-label', 'Sign in as Admin');
    }
  }

  function setBtnLoading(on) {
    var btn = getAgentSubmitBtn();
    if (!btn) return;
    if (on) {
      if (!btn.getAttribute('data-dr-label-save')) {
        btn.setAttribute('data-dr-label-save', (btn.textContent || _btnOrigLabel).trim());
      }
      btn.classList.add('dr-btn-loading');
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = 'Signing in…';
    } else {
      btn.classList.remove('dr-btn-loading');
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      var saved = btn.getAttribute('data-dr-label-save') || _btnOrigLabel;
      btn.textContent = saved.indexOf('Agent') !== -1 ? _btnOrigLabel : saved;
      btn.setAttribute('data-dr-label-save', _btnOrigLabel);
    }
  }

  function setGlow(on) {
    try {
      document.querySelectorAll('.login-card').forEach(function (c) {
        if (on) c.classList.add('dr-login-pending');
        else c.classList.remove('dr-login-pending');
      });
    } catch (e) {}
  }

  function lockUI() {
    ensureCss();
    try {
      document.body.classList.add('dr-staff-gate-lock');
      document.body.classList.add('dr-pending-blocked');
      setGlow(true);
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

  function unlockUI() {
    try {
      document.body.classList.remove('dr-staff-gate-lock');
      document.body.classList.remove('dr-pending-blocked');
      setGlow(false);
    } catch (e) {}
  }

  function removeSignedIn() {
    try {
      var c = document.getElementById('toast-container');
      if (!c) return;
      Array.prototype.slice.call(c.querySelectorAll('.toast')).forEach(function (el) {
        if (((el.textContent || '') + '').toLowerCase().indexOf('signed in') !== -1) {
          try {
            el.parentNode.removeChild(el);
          } catch (e) {}
        }
      });
    } catch (e) {}
  }

  function showPendingPopup() {
    ensureCss();
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.style.cssText =
        'position:fixed;top:1rem;right:1rem;z-index:2147483646;display:flex;flex-direction:column;gap:0.5rem;max-width:min(22rem,92vw);pointer-events:none;';
      document.body.appendChild(c);
    }
    c.style.zIndex = '2147483646';

    Array.prototype.slice.call(c.querySelectorAll('[data-dr-pending-approval]')).forEach(function (el) {
      if (el !== _pendingToastEl) {
        try {
          el.parentNode.removeChild(el);
        } catch (e) {}
      }
    });

    if (!_pendingToastEl || !_pendingToastEl.parentNode) {
      _pendingToastEl = document.createElement('div');
      _pendingToastEl.className = 'toast error';
      _pendingToastEl.setAttribute('data-dr-pending-approval', '1');
      _pendingToastEl.setAttribute('role', 'alert');
      c.appendChild(_pendingToastEl);
    }
    _pendingToastEl.style.cssText =
      'pointer-events:auto;padding:0.9rem 1.15rem;border-radius:14px;max-width:min(22rem,92vw);' +
      'background:rgba(28,22,42,0.98);border:1px solid rgba(167,139,250,0.45);' +
      'color:#eeeef6;font-size:0.9rem;line-height:1.45;box-shadow:0 12px 32px rgba(0,0,0,0.5);' +
      'display:block;opacity:1;visibility:visible;';
    _pendingToastEl.textContent = PENDING_MSG;

    if (_pendingToastTimer) clearTimeout(_pendingToastTimer);
    _pendingToastTimer = setTimeout(function () {
      try {
        if (_pendingToastEl && _pendingToastEl.parentNode) _pendingToastEl.parentNode.removeChild(_pendingToastEl);
      } catch (e) {}
      _pendingToastEl = null;
      _pendingToastTimer = null;
    }, TOAST_MS);

    try {
      var box = document.getElementById('error-login-agent');
      if (box) {
        box.textContent = PENDING_MSG;
        box.style.display = '';
        box.hidden = false;
      }
    } catch (e2) {}
  }

  function isStaff(role) {
    var r = String(role || '').toLowerCase();
    return r === 'agent' || r === 'admin';
  }
  function isCustomer(role) {
    var r = String(role || '').toLowerCase();
    return r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'end_user';
  }

  function isPending(user, profile, hint) {
    if (!user) return false;
    var meta = user.user_metadata || {};
    var uid = user.id;
    var email = (user.email || (profile && profile.email) || '').toLowerCase();
    var username = String(meta.username || (profile && profile.username) || hint || '')
      .toLowerCase()
      .trim();

    if (isDev(username)) return false;
    if (meta.approval_status === 'approved' || meta.approved === true) return false;
    if (isApproved(uid, username, email)) return false;

    var role = String((profile && profile.role) || meta.role || '').toLowerCase();
    if (isCustomer(role)) return false;

    if (meta.approval_status === 'pending' || meta.approved === false) {
      markPending(uid, username, email);
      return true;
    }
    if (isMarkedPending(uid, username, email)) return true;
    if (isStaff(role)) {
      markPending(uid, username, email);
      return true;
    }
    return false;
  }

  async function quietSignOut() {
    try {
      var client = sb();
      if (client && client.auth) {
        try {
          await client.auth.signOut({ scope: 'local' });
        } catch (e) {}
      }
    } catch (e2) {}
    try {
      window.__drFullLoaded = false;
      window.__drBooting = false;
      window.__drProfile = null;
    } catch (e3) {}
  }

  async function resolveEmail(userOrEmail, client) {
    if (!userOrEmail) return null;
    if (userOrEmail.indexOf('@') !== -1) return userOrEmail.trim();
    try {
      var r = await client.from('profiles').select('email').eq('username', userOrEmail.trim()).maybeSingle();
      return r.data && r.data.email ? r.data.email : null;
    } catch (e) {
      return null;
    }
  }

  async function handleAgentLogin(form) {
    if (_busy) {
      lockUI();
      showPendingPopup();
      setBtnLoading(true);
      return;
    }
    _busy = true;
    setBtnLoading(true);
    lockUI();
    removeSignedIn();

    try {
      var client = sb();
      if (!client) {
        unlockUI();
        setBtnLoading(false);
        _busy = false;
        _allowPass = true;
        try {
          form.requestSubmit();
        } catch (e) {}
        return;
      }

      var inp = document.getElementById('agent-username') || document.getElementById('agent-user');
      var passEl = document.getElementById('agent-password');
      var userOrEmail = inp ? (inp.value || '').trim() : '';
      var password = passEl ? passEl.value : '';

      if (!userOrEmail || !password) {
        unlockUI();
        setBtnLoading(false);
        _busy = false;
        return;
      }

      var quickUn = userOrEmail.indexOf('@') === -1 ? userOrEmail : '';
      var quickEm = userOrEmail.indexOf('@') !== -1 ? userOrEmail.toLowerCase() : '';
      if (isMarkedPending(null, quickUn, quickEm) && !isApproved(null, quickUn, quickEm) && !isDev(quickUn)) {
        showPendingPopup();
        setGlow(true);
      }

      var email = await resolveEmail(userOrEmail, client);
      if (!email) {
        unlockUI();
        setBtnLoading(false);
        try {
          var box = document.getElementById('error-login-agent');
          if (box) {
            box.textContent = 'Username not found';
            box.style.display = '';
          }
        } catch (e) {}
        _busy = false;
        return;
      }

      var auth = await client.auth.signInWithPassword({ email: email, password: password });
      if (auth.error) {
        unlockUI();
        setBtnLoading(false);
        try {
          var box2 = document.getElementById('error-login-agent');
          if (box2) {
            box2.textContent = auth.error.message || 'Sign-in failed';
            box2.style.display = '';
          }
        } catch (e) {}
        if (window.DR && window.DR.toast) window.DR.toast(auth.error.message || 'Sign-in failed', 'error');
        _busy = false;
        return;
      }

      var user = auth.data && auth.data.user;
      if (!user) {
        unlockUI();
        setBtnLoading(false);
        _busy = false;
        return;
      }

      var hint = userOrEmail.indexOf('@') === -1 ? userOrEmail : '';
      var metaPending = isPending(user, null, hint);
      if (metaPending) {
        showPendingPopup();
        setGlow(true);
        removeSignedIn();
        await quietSignOut();
        lockUI();
        setGlow(true);
        removeSignedIn();
        showPendingPopup();
        setBtnLoading(false);
        _busy = false;
        return;
      }

      var profile = null;
      try {
        var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
        profile = pr && pr.data;
      } catch (e1) {}

      hint = userOrEmail.indexOf('@') === -1 ? userOrEmail : (profile && profile.username) || '';
      var pending = isPending(user, profile, hint);

      if (pending) {
        showPendingPopup();
        setGlow(true);
        removeSignedIn();
        await quietSignOut();
        lockUI();
        setGlow(true);
        removeSignedIn();
        showPendingPopup();
        setBtnLoading(false);
        _busy = false;
        return;
      }

      unlockUI();
      removeSignedIn();
      setBtnLoading(false);
      await quietSignOut();
      _allowPass = true;
      _busy = false;
      try {
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      } catch (e4) {}
    } catch (err) {
      unlockUI();
      setBtnLoading(false);
      _busy = false;
      if (window.DR && window.DR.toast) window.DR.toast((err && err.message) || 'Sign-in error', 'error');
    }
  }

  function onSubmitCapture(ev) {
    var form = ev.target;
    if (!form || form.id !== 'login-agent') return;

    if (_allowPass) {
      _allowPass = false;
      unlockUI();
      setBtnLoading(false);
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();
    try {
      ev.stopImmediatePropagation();
    } catch (e) {}

    setBtnLoading(true);
    handleAgentLogin(form);
  }

  function wire() {
    ensureCss();
    polishAdminButton();
    if (!window.__drApprovalDocSubmitV7) {
      window.__drApprovalDocSubmitV7 = 1;
      document.addEventListener('submit', onSubmitCapture, true);
    }
  }

  setInterval(function () {
    try {
      polishAdminButton();
      if (!document.body.classList.contains('dr-pending-blocked')) return;
      lockUI();
      removeSignedIn();
      setGlow(true);
    } catch (e) {}
  }, 500);

  wire();
  setInterval(wire, 1200);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  }

  window.DRAgentApproval = {
    markPending: markPending,
    isApproved: isApproved,
    showPendingToast: showPendingPopup,
    PENDING_MSG: PENDING_MSG
  };
})();
