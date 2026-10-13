/**
 * Divine Rays — force-pending-block v8
 * Staff default-deny until explicitly approved. Orange glow + shake + toast. No Admin access when pending.
 * Credit: Boyz at the Back LRK
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_BLOCK >= 8) return;
  window.__DR_FORCE_PENDING_BLOCK = 8;

  var KEY = 'dr_staff_approval';
  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
  var FADE_MS = 5000;
  var MSG = 'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var _timer = null;
  var _toastEl = null;
  var _uiOn = false;
  var _shakeLock = false;

  function map() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function save(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
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
    return r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'client';
  }
  function isStaffRole(r) {
    r = String(r || '').toLowerCase().trim();
    if (!r || isCustomer(r)) return false;
    return (
      r === 'agent' || r === 'admin' || r === 'developer' || r === 'dev' ||
      r === 'tech' || r === 'tech support' || r === 'techsupport' ||
      r === 'staff' || r === 'support' || r.indexOf('admin') !== -1 ||
      r.indexOf('agent') !== -1 || r.indexOf('dev') !== -1
    );
  }
  function isExplicitlyApproved(user, profile) {
    var meta = (user && user.user_metadata) || {};
    if (meta.approval_status === 'approved' || meta.approved === true) return true;
    if (profile && (profile.approval_status === 'approved' || profile.approved === true)) return true;
    var st = String((profile && (profile.approval_status || profile.status)) || meta.approval_status || '').toLowerCase().trim();
    return st === 'approved' || st === 'active';
  }
  function sb() {
    try {
      if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb();
    } catch (e) {}
    return null;
  }
  function card() {
    return document.querySelector('#login-screen .login-card') || document.querySelector('.login-card');
  }
  function ensureCss() {
    if (document.getElementById('dr-force-pending-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-force-pending-css';
    s.textContent = [
      'body.dr-pending-blocked #portal-agent,body.dr-pending-blocked .portal-agent{display:none!important;visibility:hidden!important}',
      'body.dr-pending-blocked #login-screen,body.dr-pending-blocked .login-screen{display:flex!important;visibility:visible!important}',
      '.login-card.login-pending-glow,#login-screen .login-card.login-pending-glow,',
      '.login-card.dr-login-pending,#login-screen .login-card.dr-login-pending{',
      'border-color:rgba(251,146,60,0.95)!important;',
      'box-shadow:0 0 22px rgba(251,146,60,0.85),0 0 52px rgba(249,115,22,0.55),0 0 80px rgba(234,88,12,0.3),0 12px 40px rgba(0,0,0,0.3)!important;',
      'transition:box-shadow .25s ease,border-color .25s ease!important}',
      '.login-card.login-pending-shake{animation:dr-fp-shake 0.35s ease}',
      '@keyframes dr-fp-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-3px)}}',
      '.toast.dr-pending-toast-shake{animation:dr-fp-shake 0.35s ease}',
      '.toast[data-dr-force-pending]{pointer-events:auto;padding:0.9rem 1.15rem;border-radius:14px;max-width:min(22rem,92vw);',
      'background:rgba(28,22,42,0.98);border:1px solid rgba(251,146,60,0.55);color:#fde68a;font-size:0.88rem;line-height:1.4;',
      'box-shadow:0 8px 28px rgba(0,0,0,0.35),0 0 20px rgba(249,115,22,0.25)}'
    ].join('');
    document.head.appendChild(s);
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
    if (_timer) { clearTimeout(_timer); _timer = null; }
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
      try { shake(); } catch (eSh) {}
    }
    var box = document.getElementById('toast-container');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast-container';
      box.style.cssText =
        'position:fixed;top:1rem;right:1rem;z-index:2147483646;display:flex;flex-direction:column;gap:0.5rem;max-width:min(22rem,92vw);pointer-events:none';
      document.body.appendChild(box);
    }
    if (!_toastEl) {
      _toastEl = document.createElement('div');
      _toastEl.className = 'toast';
      _toastEl.setAttribute('data-dr-force-pending', '1');
      box.appendChild(_toastEl);
    }
    _toastEl.textContent = MSG;
    _toastEl.style.display = 'block';
    _toastEl.style.opacity = '1';
    if (isRepeat) shake();
    _uiOn = true;
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(clearUI, FADE_MS);
  }
  function shouldBlock(user, profile, hint) {
    if (!user) return false;
    var meta = user.user_metadata || {};
    var uid = user.id;
    var email = (user.email || (profile && profile.email) || '').toLowerCase();
    var un = String(meta.username || (profile && profile.username) || hint || '').toLowerCase().trim();
    if (isDev(un)) return false;
    if (isExplicitlyApproved(user, profile)) return false;
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
    /* SECURITY: staff without explicit approval → block */
    if (isStaffRole(role) || isStaffRole(meta.role) || isStaffRole(meta.staff_role)) {
      markPending(uid, un, email);
      return true;
    }
    if (!role && !isCustomer(meta.role)) {
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
  function wrapShowApp() {
    function wrap(fn) {
      if (!fn || fn.__drFpWrapV8) return fn;
      var w = function (p) {
        try {
          var un = (p && p.username) || '';
          var em = (p && p.email) || '';
          var id = p && p.id;
          if (isDev(un)) return fn.apply(this, arguments);
          if (isApproved(id, un, em)) return fn.apply(this, arguments);
          if (p && (p.approval_status === 'approved' || p.approved === true)) return fn.apply(this, arguments);
          if (isMarkedPending(id, un, em) || (p && (p.approval_status === 'pending' || p.approved === false)) || isStaffRole(p && p.role)) {
            if (p && (p.approval_status === 'pending' || p.approved === false || isStaffRole(p.role))) markPending(id, un, em);
            showPending(false);
            quietSignOut();
            lockPortal();
            return;
          }
        } catch (e) {}
        return fn.apply(this, arguments);
      };
      w.__drFpWrapV8 = 1;
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
  function onSubmit(ev) {
    var form = ev.target;
    if (!form || form.id !== 'login-agent') return;
    var inp = document.getElementById('agent-username') || document.getElementById('agent-user');
    var userOrEmail = inp ? (inp.value || '').trim() : '';
    var un = userOrEmail.indexOf('@') === -1 ? userOrEmail.toLowerCase() : '';
    var em = userOrEmail.indexOf('@') !== -1 ? userOrEmail.toLowerCase() : '';
    if (isMarkedPending(null, un, em) && !isApproved(null, un, em) && !isDev(un)) {
      try { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); } catch (e) {}
      showPending(_uiOn);
      quietSignOut();
      lockPortal();
      return;
    }
  }
  function onEnterKey(ev) {
    if (ev.key !== 'Enter' && ev.keyCode !== 13) return;
    var t = ev.target;
    if (!t || !t.closest) return;
    var form = t.closest('#login-agent');
    if (!form) return;
    if (t.tagName === 'TEXTAREA' || t.tagName === 'BUTTON' || t.tagName === 'A') return;
    try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
    var b = form.querySelector('button[type="submit"]');
    if (b && !b.disabled) {
      try { b.click(); } catch (e2) {
        try {
          if (form.requestSubmit) form.requestSubmit(b);
          else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        } catch (e3) {}
      }
    }
  }
  if (!window.__drForcePendingSubmitV8) {
    window.__drForcePendingSubmitV8 = 1;
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('keydown', onEnterKey, true);
  }
  ensureCss();
  wrapShowApp();
  checkSession();
  setInterval(function () { wrapShowApp(); checkSession(); }, 1500);
  window.DRForcePending = {
    showPendingUI: showPending,
    clearPendingVisuals: clearUI,
    shouldBlock: shouldBlock
  };
})();
