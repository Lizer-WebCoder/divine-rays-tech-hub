/**
 * Divine Rays — force-pending-block v30
 * Only block EXPLICITLY pending identities. Unknown is not pending.
 * One shake per attempt; orange glow + toast fade back after ~3s.
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_V30) return;
  window.__DR_FORCE_PENDING_V30 = 1;

  var DEVS = {
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1
  };
  var MSG = 'Your account is pending Administrator approval. Please wait until a Developer approves your account.';
  var _toastEl = null;
  var _uiOn = false;
  var _lastIdent = '';
  var _fadeTimer = null;
  var _shakeTimer = null;

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
  function clearPendingUI(instant) {
    try {
      if (_fadeTimer) { clearTimeout(_fadeTimer); _fadeTimer = null; }
      if (_shakeTimer) { clearTimeout(_shakeTimer); _shakeTimer = null; }
    } catch (e0) {}
    try {
      document.querySelectorAll('.login-card.login-pending-glow, .login-card.dr-shake').forEach(function (c) {
        c.classList.remove('login-pending-glow', 'dr-shake', 'login-pending-fade');
        c.style.boxShadow = '';
        c.style.borderColor = '';
        c.style.transition = '';
      });
      document.querySelectorAll('.toast[data-dr-force-pending]').forEach(function (t) {
        try { t.remove(); } catch (e) { t.style.display = 'none'; }
      });
      _toastEl = null;
      document.body.classList.remove('dr-pending-blocked');
      _uiOn = false;
    } catch (e) {}
  }
  function schedulePendingFade() {
    try {
      if (_fadeTimer) clearTimeout(_fadeTimer);
    } catch (e) {}
    _fadeTimer = setTimeout(function () {
      try {
        var card = document.querySelector('.login-card.login-pending-glow');
        if (card) {
          card.classList.remove('dr-shake');
          card.style.transition = 'box-shadow 0.9s ease, border-color 0.9s ease';
          card.classList.add('login-pending-fade');
          card.classList.remove('login-pending-glow');
          setTimeout(function () {
            try {
              card.style.boxShadow = '';
              card.style.borderColor = '';
              card.style.transition = '';
              card.classList.remove('login-pending-fade');
            } catch (e2) {}
          }, 950);
        }
        if (_toastEl && _toastEl.parentNode) {
          _toastEl.style.transition = 'opacity 0.9s ease';
          _toastEl.style.opacity = '0';
          var toastRef = _toastEl;
          setTimeout(function () {
            try {
              if (toastRef && toastRef.parentNode) toastRef.parentNode.removeChild(toastRef);
            } catch (e3) {}
            if (_toastEl === toastRef) _toastEl = null;
          }, 950);
        }
        document.body.classList.remove('dr-pending-blocked');
        _uiOn = false;
      } catch (e4) {}
      _fadeTimer = null;
    }, 3200);
  }
  function showPendingUI() {
    try {
      if (_fadeTimer) { clearTimeout(_fadeTimer); _fadeTimer = null; }
      if (_shakeTimer) { clearTimeout(_shakeTimer); _shakeTimer = null; }

      var card = document.querySelector('#login-agent .login-card, #login-screen .login-card, .login-card');
      if (card) {
        card.classList.remove('login-pending-fade');
        card.style.transition = '';
        card.style.boxShadow = '';
        card.style.borderColor = '';
        card.classList.add('login-pending-glow');
        card.classList.remove('dr-shake');
        void card.offsetWidth;
        card.classList.add('dr-shake');
        _shakeTimer = setTimeout(function () {
          try { card.classList.remove('dr-shake'); } catch (e) {}
        }, 500);
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
      _toastEl.style.transition = 'opacity 0.25s ease';
      _toastEl.style.opacity = '1';
    } catch (e5) {}
    _uiOn = true;
    schedulePendingFade();
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
    if (!form.__drFpV30Submit) {
      form.__drFpV30Submit = 1;
      form.addEventListener('submit', function (ev) {
        if (onPendingAttempt(ev)) return;
      }, true);
    }
    if (!form.__drFpV30Click) {
      form.__drFpV30Click = 1;
      form.addEventListener('click', function (ev) {
        var t = ev.target;
        if (!t) return;
        var btn = t.closest ? t.closest('button[type="submit"], button.btn-primary, button.btn') : null;
        if (!btn) return;
        if (onPendingAttempt(ev)) return;
      }, true);
    }
    if (!form.__drFpV30Key) {
      form.__drFpV30Key = 1;
      form.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') onPendingAttempt(ev);
      }, true);
    }
    if (!form.__drFpV30Input) {
      form.__drFpV30Input = 1;
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
    v: 30
  };

  try {
    var st = document.getElementById('dr-pending-fade-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'dr-pending-fade-css';
      st.textContent = [
        '.login-card.login-pending-glow{',
        'animation:drPendingPulse 1.2s ease-in-out 2!important;',
        'transition:box-shadow .9s ease,border-color .9s ease}',
        '.login-card.dr-shake{animation:drCardShake .45s ease-in-out 1!important}',
        '.toast[data-dr-force-pending]{transition:opacity .9s ease}'
      ].join('');
      (document.head || document.documentElement).appendChild(st);
    }
  } catch (eCss) {}

  wireForm();
  setTimeout(wireForm, 300);
  setTimeout(wireForm, 1200);
})();
