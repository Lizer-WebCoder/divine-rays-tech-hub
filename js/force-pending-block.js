/**
 * Divine Rays — force-pending-block v29
 * Only block EXPLICITLY pending identities. Unknown is not pending.
 * Developers: kirzhianquijano@gmail.com, iiyasora2002@gmail.com
 * Shake once per attempt; again on each new Sign in click.
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_V29) return;
  window.__DR_FORCE_PENDING_V29 = 1;

  var DEVS = {
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1
  };
  var MSG = 'Your account is pending Administrator approval. Please wait until a Developer approves your account.';
  var _toastEl = null;
  var _uiOn = false;
  var _lastIdent = '';

  function norm(s) { return String(s || '').trim().toLowerCase(); }
  function isDev(v) { return !!DEVS[norm(v)]; }
  function agentForm() {
    return document.getElementById('login-agent') ||
      document.querySelector('#login-screen form.login-form.active');
  }
  function readIdentity() {
    var form = agentForm();
    var el =
      (form && form.querySelector('input[type="email"]')) ||
      (form && form.querySelector('input[name="email"]')) ||
      (form && form.querySelector('input[name="username"]')) ||
      (form && form.querySelector('input[type="text"]'));
    var v = el ? (el.value || '').trim() : '';
    if (!v && form) {
      var all = form.querySelectorAll('input:not([type="password"]):not([type="hidden"])');
      for (var i = 0; i < all.length; i++) {
        if ((all[i].value || '').trim()) { v = (all[i].value || '').trim(); break; }
      }
    }
    return { raw: v, un: norm(v), em: norm(v) };
  }
  function getStatus(un, em) {
    try {
      if (window.DRProfiles && typeof window.DRProfiles.getApprovalStatus === 'function') {
        var s = window.DRProfiles.getApprovalStatus(un || em);
        if (s) return s;
      }
    } catch (e) {}
    try {
      var map = JSON.parse(localStorage.getItem('dr_approval_map') || '{}');
      if (un && map[un]) return map[un];
      if (em && map[em]) return map[em];
      var m2 = JSON.parse(localStorage.getItem('dr_staff_approval') || '{}');
      if (un && m2['pending:' + un] === 'pending') return 'pending';
      if (em && m2['pending:' + em] === 'pending') return 'pending';
      if (un && m2['u:' + un] === 'approved') return 'approved';
      if (em && m2['e:' + em] === 'approved') return 'approved';
    } catch (e2) {}
    return 'unknown';
  }
  function markPending(un, em) {
    try {
      var map = JSON.parse(localStorage.getItem('dr_approval_map') || '{}');
      if (un) map[un] = 'pending';
      if (em) map[em] = 'pending';
      localStorage.setItem('dr_approval_map', JSON.stringify(map));
      var m2 = JSON.parse(localStorage.getItem('dr_staff_approval') || '{}');
      if (un) m2['pending:' + un] = 'pending';
      if (em) m2['pending:' + em] = 'pending';
      localStorage.setItem('dr_staff_approval', JSON.stringify(m2));
    } catch (e) {}
  }
  function isPendingIdentity() {
    var u = readIdentity();
    if (!u.raw) return false;
    if (isDev(u.un) || isDev(u.em)) return false;
    return getStatus(u.un, u.em) === 'pending';
  }
  function clearPendingUI() {
    try {
      document.querySelectorAll('.login-card.login-pending-glow').forEach(function (c) {
        c.classList.remove('login-pending-glow', 'dr-shake');
      });
      document.querySelectorAll('.toast[data-dr-force-pending]').forEach(function (t) {
        try { t.remove(); } catch (e) { t.style.display = 'none'; }
      });
      document.body.classList.remove('dr-pending-blocked');
      _uiOn = false;
    } catch (e) {}
  }
  function showPendingUI() {
    try {
      var card = document.querySelector('#login-agent .login-card, #login-screen .login-card, .login-card');
      if (card) {
        card.classList.add('login-pending-glow');
        card.classList.remove('dr-shake');
        void card.offsetWidth;
        card.classList.add('dr-shake');
      }
      var box = document.getElementById('login-screen') || document.body;
      if (!_toastEl || !_toastEl.parentNode) {
        _toastEl = document.createElement('div');
        _toastEl.className = 'toast';
        _toastEl.setAttribute('data-dr-force-pending', '1');
        box.appendChild(_toastEl);
      }
      _toastEl.textContent = MSG;
      _toastEl.style.display = 'block';
      _toastEl.style.opacity = '1';
    } catch (e5) {}
    _uiOn = true;
  }
  function hidePortalIfOpen() {
    try {
      var pa = document.getElementById('portal-agent');
      if (pa && pa.classList.contains('active')) {
        pa.classList.remove('active');
        pa.style.setProperty('display', 'none', 'important');
        document.body.classList.remove('dr-portal-ok');
      }
    } catch (e) {}
  }
  function unlockPortal() {
    try {
      document.body.classList.add('dr-portal-ok');
      document.body.classList.remove('dr-pending-blocked');
    } catch (e) {}
  }
  function blockNow() {
    var u = readIdentity();
    if (u.raw) markPending(u.un, u.em);
    showPendingUI();
    hidePortalIfOpen();
    try {
      document.body.classList.add('dr-pending-blocked');
      document.body.classList.remove('dr-portal-ok', 'is-portal');
    } catch (e) {}
  }
  function syncIdentityUI() {
    var u = readIdentity();
    var key = u.raw || '';
    if (key === _lastIdent) return;
    _lastIdent = key;
    if (!key) return;
    if (isDev(u.un) || isDev(u.em) || getStatus(u.un, u.em) !== 'pending') {
      if (_uiOn) clearPendingUI();
    }
  }
  function stop(ev) {
    try {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    } catch (e) {}
  }
  function onPendingAttempt(ev) {
    if (window.__drBooting) return true;
    if (!isPendingIdentity()) {
      return false;
    }
    stop(ev);
    blockNow();
    return true;
  }
  function wireForm() {
    if (window.__DR_PAUSE_LOGIN_SCRIPTS) return;
    var form = agentForm();
    if (!form) return;
    if (!form.__drFpV29Submit) {
      form.__drFpV29Submit = 1;
      form.addEventListener('submit', function (ev) {
        if (onPendingAttempt(ev)) return;
      }, true);
    }
    if (!form.__drFpV29Click) {
      form.__drFpV29Click = 1;
      form.addEventListener('click', function (ev) {
        var t = ev.target;
        if (!t) return;
        var btn = t.closest ? t.closest('button[type="submit"], button.btn-primary, button.btn') : null;
        if (!btn) return;
        if (onPendingAttempt(ev)) return;
      }, true);
    }
    if (!form.__drFpV29Key) {
      form.__drFpV29Key = 1;
      form.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') onPendingAttempt(ev);
      }, true);
    }
    if (!form.__drFpV29Input) {
      form.__drFpV29Input = 1;
      var t = null;
      form.addEventListener('input', function (ev) {
        try {
          var tgt = ev && ev.target;
          if (tgt && (tgt.type === 'password' || (tgt.id || '').indexOf('password') !== -1)) return;
        } catch (e0) {}
        if (window.__DR_PAUSE_LOGIN_SCRIPTS) return;
        if (t) clearTimeout(t);
        t = setTimeout(function () { try { syncIdentityUI(); } catch (e) {} }, 500);
      }, true);
    }
  }

  window.DRForcePending = {
    isPendingIdentity: isPendingIdentity,
    clearPendingUI: clearPendingUI,
    blockNow: blockNow,
    unlockPortal: unlockPortal,
    v: 29
  };

  wireForm();
  setTimeout(wireForm, 300);
  setTimeout(wireForm, 1200);
})();
