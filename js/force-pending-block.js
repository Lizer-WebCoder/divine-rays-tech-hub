/**
 * Divine Rays — force-pending-block v11
 * Same rule as Users Admin list: staff default PENDING until Approve.
 * Blocks first login. Orange glow + shake + right toast every attempt.
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_BLOCK >= 11) return;
  window.__DR_FORCE_PENDING_BLOCK = 11;

  var KEY = 'dr_staff_approval';
  /* Exact DEVs only — same as admin Users list */
  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
  var FADE_MS = 10000;
  var MSG = 'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var ERR_MSG = 'Account needs approval.';
  var ORANGE_SHADOW = '0 0 22px rgba(251,146,60,0.9),0 0 52px rgba(249,115,22,0.6),0 0 80px rgba(234,88,12,0.35)';
  var ORANGE_BORDER = 'rgba(251,146,60,0.95)';
  var _timer = null;
  var _toastEl = null;
  var _uiOn = false;

  function map() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function save(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  }
  function isDev(n) {
    return !!DEVS[String(n || '').toLowerCase().trim()];
  }
  /* Mirrors admin.js getStatus: approved only if DEVS or localStorage approved */
  function getApprovalStatus(id, un, em) {
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (isDev(un)) return 'approved';
    var m = map();
    if (id && m[id]) return m[id];
    if (un && m['u:' + un] === 'approved') return 'approved';
    if (em && m['e:' + em] === 'approved') return 'approved';
    if (id && m[id] === 'pending') return 'pending';
    if (un && m['pending:' + un] === 'pending') return 'pending';
    if (em && m['pending:' + em] === 'pending') return 'pending';
    return 'pending'; /* default — matches Users list */
  }
  function markPending(id, un, em) {
    var m = map();
    if (id) m[id] = 'pending';
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (un) { m['pending:' + un] = 'pending'; delete m['u:' + un]; }
    if (em) { m['pending:' + em] = 'pending'; delete m['e:' + em]; }
    save(m);
  }
  function isCustomer(r) {
    r = String(r || '').toLowerCase();
    return r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'client';
  }
  function sb() {
    try {
      if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb();
    } catch (e) {}
    return null;
  }
  function card() {
    return (
      document.querySelector('#login-screen .login-card') ||
      document.querySelector('.login-card') ||
      document.querySelector('#login-screen [class*="card"]')
    );
  }
  function agentForm() {
    return document.getElementById('login-agent');
  }
  function readUserEmail() {
    var form = agentForm();
    var inp =
      document.getElementById('agent-username') ||
      document.getElementById('agent-user') ||
      (form && form.querySelector('input[type="email"], input[name="email"], input[name="username"], input[type="text"]'));
    var v = inp ? String(inp.value || '').trim() : '';
    var un = v.indexOf('@') === -1 ? v.toLowerCase() : '';
    var em = v.indexOf('@') !== -1 ? v.toLowerCase() : '';
    return { un: un, em: em, raw: v };
  }
  function ensureCss() {
    if (document.getElementById('dr-force-pending-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-force-pending-css';
    s.textContent = [
      'body.dr-pending-blocked #portal-agent,body.dr-pending-blocked .portal-agent{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}',
      'body.dr-pending-blocked #app-shell{display:none!important}',
      'body.dr-pending-blocked #login-screen,body.dr-pending-blocked .login-screen{display:flex!important;visibility:visible!important;opacity:1!important}',
      'body.dr-pending-blocked{overflow:auto!important}',
      '.login-card.login-pending-glow,.login-card.dr-login-pending,',
      '#login-screen .login-card.login-pending-glow,#login-screen .login-card.dr-login-pending{',
      'border-color:' + ORANGE_BORDER + '!important;',
      'box-shadow:' + ORANGE_SHADOW + '!important;',
      'outline:2px solid rgba(251,146,60,0.7)!important}',
      '.login-card.login-pending-shake{animation:dr-fp-shake 0.4s ease!important}',
      '@keyframes dr-fp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}',
      '#toast-container.dr-fp-toast-box{position:fixed!important;top:1rem!important;right:1rem!important;z-index:2147483647!important;',
      'display:flex!important;flex-direction:column!important;gap:0.5rem!important;max-width:min(22rem,92vw)!important;pointer-events:none!important}',
      '.toast[data-dr-force-pending]{pointer-events:auto!important;padding:0.9rem 1.15rem!important;border-radius:14px!important;',
      'background:rgba(28,22,42,0.98)!important;border:1px solid rgba(251,146,60,0.65)!important;color:#fde68a!important;',
      'font-size:0.88rem!important;line-height:1.45!important;display:block!important;opacity:1!important;',
      'box-shadow:0 8px 28px rgba(0,0,0,0.4),0 0 20px rgba(249,115,22,0.3)!important}',
      '.login-error.dr-pending-err{color:#f97316!important;background:rgba(249,115,22,0.12)!important;',
      'border:1px solid rgba(249,115,22,0.35)!important;border-radius:10px!important;padding:0.55rem 0.75rem!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }
  function applyOrangeGlow(c) {
    if (!c) return;
    c.classList.remove('login-fail-glow', 'login-pass-ok');
    c.classList.add('login-pending-glow', 'dr-login-pending');
    try {
      c.style.setProperty('box-shadow', ORANGE_SHADOW, 'important');
      c.style.setProperty('border-color', ORANGE_BORDER, 'important');
      c.style.setProperty('outline', '2px solid rgba(251,146,60,0.7)', 'important');
    } catch (e) {}
  }
  function lockPortal() {
    ensureCss();
    try {
      document.body.classList.add('dr-pending-blocked', 'is-login');
      document.body.classList.remove('is-portal');
      var pa = document.getElementById('portal-agent');
      if (pa) {
        pa.classList.remove('active');
        pa.style.setProperty('display', 'none', 'important');
      }
      var shell = document.getElementById('app-shell');
      if (shell) shell.style.setProperty('display', 'none', 'important');
      var ls = document.getElementById('login-screen');
      if (ls) {
        ls.hidden = false;
        ls.style.setProperty('display', 'flex', 'important');
        ls.classList.add('active');
      }
    } catch (e) {}
  }
  function setApprovalError() {
    try {
      var f = agentForm();
      if (!f) return;
      var e = f.querySelector('.login-error');
      if (!e) {
        e = document.createElement('div');
        e.className = 'login-error';
        f.insertBefore(e, f.firstChild);
      }
      e.classList.add('dr-pending-err');
      e.textContent = ERR_MSG;
      e.style.display = 'block';
    } catch (err) {}
  }
  function shake() {
    var c = card();
    if (c) {
      c.classList.remove('login-pending-shake');
      void c.offsetWidth;
      c.classList.add('login-pending-shake');
      try {
        c.style.setProperty('animation', 'dr-fp-shake 0.4s ease', 'important');
        setTimeout(function () {
          try { c.style.removeProperty('animation'); } catch (e) {}
          c.classList.remove('login-pending-shake');
        }, 420);
      } catch (e2) {}
    }
    if (_toastEl) {
      _toastEl.classList.remove('dr-pending-toast-shake');
      void _toastEl.offsetWidth;
      _toastEl.classList.add('dr-pending-toast-shake');
    }
  }
  function showPending() {
    ensureCss();
    lockPortal();
    applyOrangeGlow(card());
    var box = document.getElementById('toast-container');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast-container';
      document.body.appendChild(box);
    }
    box.classList.add('dr-fp-toast-box');
    box.style.cssText =
      'position:fixed;top:1rem;right:1rem;z-index:2147483647;display:flex;flex-direction:column;gap:0.5rem;max-width:min(22rem,92vw);pointer-events:none';
    if (!_toastEl || !_toastEl.parentNode) {
      _toastEl = document.createElement('div');
      _toastEl.className = 'toast';
      _toastEl.setAttribute('data-dr-force-pending', '1');
      box.appendChild(_toastEl);
    }
    _toastEl.textContent = MSG;
    _toastEl.style.display = 'block';
    _toastEl.style.opacity = '1';
    setApprovalError();
    requestAnimationFrame(shake);
    _uiOn = true;
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(function () {
      try { if (_toastEl) _toastEl.style.opacity = '0.9'; } catch (e) {}
    }, FADE_MS);
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
  function blockNow() {
    showPending();
    quietSignOut();
    lockPortal();
    setApprovalError();
    setTimeout(function () {
      lockPortal();
      applyOrangeGlow(card());
      shake();
    }, 80);
    setTimeout(function () {
      lockPortal();
      applyOrangeGlow(card());
    }, 250);
  }
  /* true = BLOCK */
  function shouldBlockUser(id, un, em, role) {
    un = String(un || '').toLowerCase().trim();
    em = String(em || '').toLowerCase().trim();
    role = String(role || '').toLowerCase().trim();
    if (isDev(un)) return false;
    if (isCustomer(role)) return false;
    var st = getApprovalStatus(id, un, em);
    if (st === 'approved') return false;
    markPending(id, un, em);
    return true;
  }
  function gateProfile(p) {
    if (!p) return true;
    var un = String(p.username || '').toLowerCase().trim();
    var em = String(p.email || '').toLowerCase();
    var id = p.id;
    var role = p.role || p.staff_role || '';
    return shouldBlockUser(id, un, em, role);
  }
  function wrapShowApp() {
    function wrap(fn) {
      if (!fn || fn.__drFpWrapV11) return fn;
      var w = function (p) {
        try {
          if (gateProfile(p)) {
            blockNow();
            return;
          }
        } catch (e) {}
        return fn.apply(this, arguments);
      };
      w.__drFpWrapV11 = 1;
      return w;
    }
    try {
      if (typeof window.showApp === 'function' && !window.showApp.__drFpWrapV11) {
        window.showApp = wrap(window.showApp);
      }
      if (window.DR && typeof window.DR.showApp === 'function' && !window.DR.showApp.__drFpWrapV11) {
        window.DR.showApp = wrap(window.DR.showApp);
      }
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
      var meta = user.user_metadata || {};
      var profile = null;
      try {
        var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
        profile = pr && pr.data;
      } catch (e) {}
      var un = String(meta.username || (profile && profile.username) || '').toLowerCase().trim();
      var em = String(user.email || (profile && profile.email) || '').toLowerCase();
      var role = (profile && (profile.role || profile.staff_role)) || meta.role || '';
      if (shouldBlockUser(user.id, un, em, role)) blockNow();
    } catch (e) {}
  }
  function isPendingIdentity() {
    var u = readUserEmail();
    if (!u.raw) return false;
    if (isDev(u.un)) return false;
    return getApprovalStatus(null, u.un, u.em) !== 'approved';
  }
  function onSubmit(ev) {
    var form = ev.target;
    if (!form || form.id !== 'login-agent') return;
    if (isPendingIdentity()) {
      try { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); } catch (e) {}
      blockNow();
    }
  }
  function onAgentButtonClick(ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var form = agentForm();
    if (!form) return;
    var btn = t.closest('button[type="submit"]');
    if (!btn || !form.contains(btn)) return;
    if (isPendingIdentity()) {
      try { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); } catch (e) {}
      blockNow();
    }
  }
  function onEnterKey(ev) {
    if (ev.key !== 'Enter' && ev.keyCode !== 13) return;
    var t = ev.target;
    if (!t || !t.closest) return;
    var form = t.closest('#login-agent');
    if (!form) return;
    if (t.tagName === 'TEXTAREA') return;
    if (isPendingIdentity()) {
      try { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); } catch (e) {}
      blockNow();
      return;
    }
    var b = form.querySelector('button[type="submit"]');
    if (b && !b.disabled && t.tagName !== 'BUTTON') {
      try {
        ev.preventDefault();
        if (form.requestSubmit) form.requestSubmit(b);
        else b.click();
      } catch (e2) {}
    }
  }
  try {
    new MutationObserver(function () {
      if (!isPendingIdentity() && !_uiOn) return;
      if (document.body.classList.contains('is-portal')) blockNow();
      var pa = document.getElementById('portal-agent');
      if (pa && pa.classList.contains('active') && isPendingIdentity()) blockNow();
    }).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['class'] });
  } catch (eObs) {}

  setInterval(function () {
    if (_uiOn || document.body.classList.contains('dr-pending-blocked')) {
      setApprovalError();
      applyOrangeGlow(card());
      lockPortal();
    }
  }, 400);

  if (!window.__drForcePendingSubmitV11) {
    window.__drForcePendingSubmitV11 = 1;
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('click', onAgentButtonClick, true);
    document.addEventListener('keydown', onEnterKey, true);
  }
  ensureCss();
  wrapShowApp();
  checkSession();
  setTimeout(checkSession, 200);
  setTimeout(checkSession, 600);
  setTimeout(checkSession, 1200);
  setInterval(function () { wrapShowApp(); checkSession(); }, 1000);
  window.DRForcePending = { showPendingUI: showPending, blockNow: blockNow };
})();
