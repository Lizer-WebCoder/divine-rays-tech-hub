/**
 * Divine Rays — force-pending-block v24
 * Production: first-click pending block, card-only UI, clear sticky state,
 * respect profiles.approval_status so approved users work on any device.
 * Developers (2): kirzhianquijano@gmail.com, iiyasora2002@gmail.com
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_V24) return;
  window.__DR_FORCE_PENDING_V24 = 1;

  var DEVS = {
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1
  };
  var MSG = 'Your account is pending Administrator approval. Please wait until a Developer approves your account.';
  var _toastEl = null;
  var _timer = null;
  var _uiOn = false;
  var _lastIdent = '';

  function norm(s) {
    return String(s || '').trim().toLowerCase();
  }
  function isDev(v) {
    return !!DEVS[norm(v)];
  }
  function agentForm() {
    return document.getElementById('login-agent') || document.querySelector('#login-screen form.login-form.active');
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
      var k = un || em;
      if (map[k]) return map[k];
      if (map[em]) return map[em];
    } catch (e2) {}
    return 'pending';
  }
  function markPending(un, em) {
    try {
      var map = JSON.parse(localStorage.getItem('dr_approval_map') || '{}');
      if (un) map[un] = map[un] || 'pending';
      if (em) map[em] = map[em] || 'pending';
      localStorage.setItem('dr_approval_map', JSON.stringify(map));
    } catch (e) {}
  }
  function isPendingIdentity() {
    var u = readIdentity();
    if (!u.raw) return false;
    if (isDev(u.un) || isDev(u.em)) return false;
    var st = getStatus(u.un, u.em);
    return st !== 'approved';
  }
  function clearPendingUI() {
    try {
      document.querySelectorAll('.login-card.login-pending-glow').forEach(function (c) {
        c.classList.remove('login-pending-glow', 'dr-shake');
      });
      document.querySelectorAll('.toast[data-dr-force-pending]').forEach(function (t) {
        t.style.display = 'none';
        t.remove();
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
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(function () {
      try { if (_toastEl) _toastEl.style.opacity = '0.9'; } catch (e6) {}
    }, 10000);
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
  }
  function syncIdentityUI() {
    var u = readIdentity();
    var key = u.raw || '';
    if (key === _lastIdent && _uiOn === isPendingIdentity()) return;
    _lastIdent = key;
    if (!key) return;
    if (isDev(u.un) || isDev(u.em) || getStatus(u.un, u.em) === 'approved') {
      if (_uiOn || document.querySelector('.toast[data-dr-force-pending]') || document.querySelector('.login-card.login-pending-glow')) {
        clearPendingUI();
      }
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
    syncIdentityUI();
    if (!isPendingIdentity()) {
      clearPendingUI();
      return false;
    }
    stop(ev);
    blockNow();
    return true;
  }
  function wireForm() {
    var form = agentForm();
    if (!form) return;
    if (!form.__drFpV24Submit) {
      form.__drFpV24Submit = 1;
      form.addEventListener('submit', function (ev) { onPendingAttempt(ev); }, true);
    }
    var btns = form.querySelectorAll('button, input[type="submit"]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.__drFpV24Btn) continue;
      b.__drFpV24Btn = 1;
      b.addEventListener('click', function (ev) { onPendingAttempt(ev); }, true);
    }
    if (!form.__drFpV24Key) {
      form.__drFpV24Key = 1;
      form.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') onPendingAttempt(ev);
      }, true);
    }
    if (!form.__drFpV24Input) {
      form.__drFpV24Input = 1;
      var _idt = null;
      form.addEventListener('input', function () {
        if (_idt) clearTimeout(_idt);
        _idt = setTimeout(function () { try { syncIdentityUI(); } catch (e) {} }, 400);
      }, true);
      form.addEventListener('change', function () { try { syncIdentityUI(); } catch (e) {} }, true);
    }
  }
  function wrapGates() {}
  document.addEventListener('submit', function (ev) {
    if (ev.target && (ev.target.id === 'login-agent' || (ev.target.closest && ev.target.closest('#login-agent')))) onPendingAttempt(ev);
  }, true);
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    if (!t.closest('button, input[type="submit"]')) return;
    if (!t.closest('#login-agent, #login-screen')) return;
    onPendingAttempt(ev);
  }, true);

  window.DRForcePending = {
    isPendingIdentity: isPendingIdentity,
    clearPendingUI: clearPendingUI,
    blockNow: blockNow,
    unlockPortal: unlockPortal,
    v: 24
  };

  wireForm();
  syncIdentityUI();
  setInterval(function () {
    wireForm();
    wrapGates();
    syncIdentityUI();
  }, 2000);
  setTimeout(wireForm, 100);
  setTimeout(wireForm, 500);
  setTimeout(wireForm, 2000);
})();
