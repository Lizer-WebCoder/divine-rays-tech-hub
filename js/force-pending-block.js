/**
 * Divine Rays — force-pending-block v21
 * - First-click block for pending (direct form wire)
 * - Clears pending UI when identity switches to Developer/approved
 * - Never leaves sticky toast/glow after a prior pending attempt
 * Developers (2): kirzhianquijano@gmail.com, iiyasora2002@gmail.com
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_BLOCK >= 21) return;
  window.__DR_FORCE_PENDING_BLOCK = 21;

  var KEY = 'dr_staff_approval';
  var DEVS = { kirzhianquijano: 1, iiyasora2002: 1 };
  var DEV_EMAILS = { 'kirzhianquijano@gmail.com': 1, 'iiyasora2002@gmail.com': 1 };
  var MSG = 'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var ERR_MSG = 'Account needs approval.';
  var ORANGE_SHADOW = '0 0 22px rgba(251,146,60,0.9),0 0 52px rgba(249,115,22,0.6),0 0 80px rgba(234,88,12,0.35)';
  var ORANGE_BORDER = 'rgba(251,146,60,0.95)';
  var _toastEl = null;
  var _timer = null;
  var _uiOn = false;
  var _lastIdent = '';

  function map() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function save(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  }
  function isDev(n) {
    var s = String(n || '').toLowerCase().trim();
    return !!(s && (DEVS[s] || DEV_EMAILS[s]));
  }
  function getStatus(un, em) {
    un = String(un || '').toLowerCase().trim();
    em = String(em || '').toLowerCase().trim();
    if (isDev(un) || isDev(em)) return 'approved';
    var m = map();
    if (un && m['u:' + un] === 'approved') return 'approved';
    if (em && m['e:' + em] === 'approved') return 'approved';
    return 'pending';
  }
  function markPending(un, em) {
    var m = map();
    un = String(un || '').toLowerCase().trim();
    em = String(em || '').toLowerCase().trim();
    if (un) { m['pending:' + un] = 'pending'; delete m['u:' + un]; }
    if (em) { m['pending:' + em] = 'pending'; delete m['e:' + em]; }
    save(m);
  }
  function card() {
    return document.querySelector('#login-screen .login-card') || document.querySelector('.login-card');
  }
  function agentForm() {
    return document.getElementById('login-agent');
  }
  function readIdentity() {
    var form = agentForm();
    var inp =
      document.getElementById('agent-username') ||
      document.getElementById('agent-user') ||
      document.getElementById('agent-email') ||
      (form && form.querySelector('input[type="email"]')) ||
      (form && form.querySelector('input[name="email"]')) ||
      (form && form.querySelector('input[name="username"]')) ||
      (form && form.querySelector('input[type="text"]'));
    var v = inp ? String(inp.value || '').trim() : '';
    if (!v && form) {
      var all = form.querySelectorAll('input:not([type="password"]):not([type="hidden"])');
      for (var i = 0; i < all.length; i++) {
        var x = String(all[i].value || '').trim();
        if (x) { v = x; break; }
      }
    }
    var un = v && v.indexOf('@') === -1 ? v.toLowerCase() : '';
    var em = v && v.indexOf('@') !== -1 ? v.toLowerCase() : '';
    return { un: un, em: em, raw: v };
  }
  function isPendingIdentity() {
    var u = readIdentity();
    if (!u.raw) return false;
    if (isDev(u.un) || isDev(u.em)) return false;
    return getStatus(u.un, u.em) !== 'approved';
  }
  function ensureCss() {
    if (document.getElementById('dr-force-pending-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-force-pending-css';
    s.textContent = [
      'body:not(.dr-portal-ok) #portal-agent{display:none!important;visibility:hidden!important;pointer-events:none!important}',
      '.login-card.login-pending-glow,.login-card.dr-login-pending{box-shadow:' + ORANGE_SHADOW + '!important;border-color:' + ORANGE_BORDER + '!important}',
      '@keyframes dr-fp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}',
      '.login-card.login-pending-shake{animation:dr-fp-shake 0.4s ease!important}',
      '.toast[data-dr-force-pending]{padding:0.9rem 1.15rem!important;border-radius:14px!important;background:rgba(30,20,10,0.95)!important;color:#fdba74!important;border:1px solid rgba(251,146,60,0.5)!important;box-shadow:0 8px 28px rgba(0,0,0,0.35)!important;font-size:0.9rem!important;line-height:1.4!important;z-index:2147483647!important}',
      '.login-error.dr-pending-err{color:#f97316!important;background:rgba(249,115,22,0.12)!important;border:1px solid rgba(249,115,22,0.35)!important;border-radius:10px!important;padding:0.55rem 0.75rem!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }
  function clearPendingUI() {
    _uiOn = false;
    if (_timer) { clearTimeout(_timer); _timer = null; }
    try {
      var c = card();
      if (c) {
        c.classList.remove('login-pending-glow', 'dr-login-pending', 'login-pending-shake');
        try {
          c.style.removeProperty('box-shadow');
          c.style.removeProperty('border-color');
          c.style.removeProperty('animation');
        } catch (e) {}
      }
    } catch (e2) {}
    try {
      var f = agentForm();
      if (f) {
        var err = f.querySelector('.login-error.dr-pending-err, .login-error');
        if (err && (err.classList.contains('dr-pending-err') || err.textContent === ERR_MSG)) {
          err.textContent = '';
          err.style.display = 'none';
          err.classList.remove('dr-pending-err');
        }
      }
    } catch (e3) {}
    try {
      if (_toastEl) {
        if (_toastEl.parentNode) _toastEl.parentNode.removeChild(_toastEl);
        _toastEl = null;
      }
      document.querySelectorAll('.toast[data-dr-force-pending]').forEach(function (el) {
        try { el.parentNode && el.parentNode.removeChild(el); } catch (e) {}
      });
    } catch (e4) {}
    try { document.body.classList.remove('dr-pending-blocked'); } catch (e5) {}
  }
  function showPendingUI() {
    ensureCss();
    var c = card();
    if (c) {
      c.classList.remove('login-fail-glow', 'login-pass-ok');
      c.classList.add('login-pending-glow', 'dr-login-pending');
      try {
        c.style.setProperty('box-shadow', ORANGE_SHADOW, 'important');
        c.style.setProperty('border-color', ORANGE_BORDER, 'important');
      } catch (e) {}
      c.classList.remove('login-pending-shake');
      void c.offsetWidth;
      c.classList.add('login-pending-shake');
      try {
        c.style.setProperty('animation', 'dr-fp-shake 0.4s ease', 'important');
        setTimeout(function () {
          try { c.style.removeProperty('animation'); } catch (e2) {}
          c.classList.remove('login-pending-shake');
        }, 420);
      } catch (e3) {}
    }
    try {
      var f = agentForm();
      if (f) {
        var err = f.querySelector('.login-error');
        if (!err) {
          err = document.createElement('div');
          err.className = 'login-error';
          f.insertBefore(err, f.firstChild);
        }
        err.classList.add('dr-pending-err');
        err.textContent = ERR_MSG;
        err.style.display = 'block';
      }
    } catch (e4) {}
    try {
      var box = document.getElementById('toast-container');
      if (!box) {
        box = document.createElement('div');
        box.id = 'toast-container';
        box.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:2147483647;display:flex;flex-direction:column;gap:0.5rem;max-width:min(22rem,92vw);pointer-events:none';
        document.body.appendChild(box);
      }
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
    if (!form.__drFpV21Submit) {
      form.__drFpV21Submit = 1;
      form.addEventListener('submit', function (ev) { onPendingAttempt(ev); }, true);
    }
    var btns = form.querySelectorAll('button, input[type="submit"]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.__drFpV21Btn) continue;
      b.__drFpV21Btn = 1;
      b.addEventListener('mousedown', function (ev) {
        if (ev.button !== 0) return;
        onPendingAttempt(ev);
      }, true);
      b.addEventListener('pointerdown', function (ev) { onPendingAttempt(ev); }, true);
      b.addEventListener('click', function (ev) { onPendingAttempt(ev); }, true);
    }
    if (!form.__drFpV21Key) {
      form.__drFpV21Key = 1;
      form.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Enter' && ev.keyCode !== 13) return;
        if (ev.target && ev.target.tagName === 'TEXTAREA') return;
        onPendingAttempt(ev);
      }, true);
    }
    if (!form.__drFpV21Input) {
      form.__drFpV21Input = 1;
      form.addEventListener('input', function () { syncIdentityUI(); }, true);
      form.addEventListener('change', function () { syncIdentityUI(); }, true);
    }
  }
  if (!window.__drFpV21Doc) {
    window.__drFpV21Doc = 1;
    document.addEventListener('submit', function (ev) {
      if (ev.target && ev.target.id === 'login-agent') onPendingAttempt(ev);
    }, true);
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      if (!t.closest('#login-agent')) return;
      if (!t.closest('button, input[type="submit"]')) return;
      onPendingAttempt(ev);
    }, true);
  }
  function wrapGates() {
    try {
      if (typeof window.loadFullAppThen === 'function' && !window.loadFullAppThen.__drFpV21) {
        var lfa = window.loadFullAppThen;
        window.loadFullAppThen = function (role) {
          var r = String(role || '').toLowerCase();
          clearPendingUI();
          if (r && r !== 'customer' && r !== 'user' && r !== 'employee' && isPendingIdentity()) {
            blockNow();
            return Promise.resolve();
          }
          unlockPortal();
          return lfa.apply(this, arguments);
        };
        window.loadFullAppThen.__drFpV21 = 1;
      }
    } catch (e) {}
    try {
      if (typeof window.applyPortalForRole === 'function' && !window.applyPortalForRole.__drFpV21) {
        var apr = window.applyPortalForRole;
        window.applyPortalForRole = function (role) {
          var r = String(role || '').toLowerCase();
          if ((r === 'admin' || r === 'agent' || r === 'developer') && isPendingIdentity()) {
            blockNow();
            return;
          }
          clearPendingUI();
          unlockPortal();
          return apr.apply(this, arguments);
        };
        window.applyPortalForRole.__drFpV21 = 1;
      }
    } catch (e2) {}
    try {
      if (typeof window.showApp === 'function' && !window.showApp.__drFpV21) {
        var sa = window.showApp;
        window.showApp = function (p) {
          clearPendingUI();
          unlockPortal();
          return sa.apply(this, arguments);
        };
        window.showApp.__drFpV21 = 1;
      }
    } catch (e3) {}
  }

  ensureCss();
  wireForm();
  wrapGates();
  syncIdentityUI();
  setInterval(function () {
    wireForm();
    wrapGates();
    syncIdentityUI();
  }, 500);
  setTimeout(wireForm, 50);
  setTimeout(wireForm, 200);
  setTimeout(wireForm, 800);
  setTimeout(wireForm, 2000);

  window.DRForcePending = {
    showPendingUI: showPendingUI,
    clearPendingUI: clearPendingUI,
    blockNow: blockNow,
    isPendingIdentity: isPendingIdentity,
    unlockPortal: unlockPortal,
    v: 21
  };
})();
