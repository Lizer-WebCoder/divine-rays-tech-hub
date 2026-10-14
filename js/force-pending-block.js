/**
 * Divine Rays — force-pending-block v17
 * ONLY Admin / IT Tech Support need approval.
 * Developers (2 only): kirzhianquijano@gmail.com, iiyasora2002@gmail.com
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_BLOCK >= 17) return;
  window.__DR_FORCE_PENDING_BLOCK = 17;

  var KEY = 'dr_staff_approval';
  /* Only these two Developer accounts */
  var DEVS = {
    kirzhianquijano: 1,
    iiyasora2002: 1
  };
  var DEV_EMAILS = {
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1
  };
  var FADE_MS = 10000;
  var MSG = 'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var ERR_MSG = 'Account needs approval.';
  var ORANGE_SHADOW = '0 0 22px rgba(251,146,60,0.9),0 0 52px rgba(249,115,22,0.6),0 0 80px rgba(234,88,12,0.35)';
  var ORANGE_BORDER = 'rgba(251,146,60,0.95)';
  var _timer = null;
  var _toastEl = null;
  var _uiOn = false;
  var _blocking = false;
  var _checkBusy = false;
  var _portalOk = false;

  function map() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function save(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  }
  function isDev(n) {
    var s = String(n || '').toLowerCase().trim();
    if (s && DEVS[s]) return true;
    if (s && DEV_EMAILS[s]) return true;
    return false;
  }
  function isDevEmail(em) {
    em = String(em || '').toLowerCase().trim();
    return !!(em && DEV_EMAILS[em]);
  }
  function getApprovalStatus(id, un, em) {
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (isDev(un) || isDevEmail(em)) return 'approved';
    var m = map();
    if (id && m[id] === 'approved') return 'approved';
    if (un && m['u:' + un] === 'approved') return 'approved';
    if (em && m['e:' + em] === 'approved') return 'approved';
    if (id && m[id] === 'pending') return 'pending';
    if (un && (m['pending:' + un] === 'pending' || m['u:' + un] === 'pending')) return 'pending';
    if (em && (m['pending:' + em] === 'pending' || m['e:' + em] === 'pending')) return 'pending';
    return 'pending';
  }
  function markPending(id, un, em) {
    var m = map();
    if (id) m[id] = 'pending';
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (un) {
      m['pending:' + un] = 'pending';
      delete m['u:' + un];
    }
    if (em) {
      m['pending:' + em] = 'pending';
      delete m['e:' + em];
    }
    save(m);
  }
  function isCustomer(r) {
    r = String(r || '').toLowerCase().trim();
    return (
      r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' ||
      r === 'client' || r === 'employee' || r === 'end user'
    );
  }
  function isStaffRole(r) {
    r = String(r || '').toLowerCase().trim();
    if (!r || isCustomer(r)) return false;
    return (
      r === 'agent' || r === 'admin' || r === 'administrator' || r === 'owner' ||
      r === 'developer' || r === 'dev' || r === 'tech' || r === 'tech support' ||
      r === 'techsupport' || r === 'it' || r === 'it tech support' || r === 'staff' ||
      r === 'support' || r.indexOf('admin') !== -1 || r.indexOf('agent') !== -1 ||
      r.indexOf('developer') !== -1 || r.indexOf('tech') !== -1
    );
  }
  function sb() {
    try {
      if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb();
    } catch (e) {}
    try { if (window.__drSb) return window.__drSb; } catch (e2) {}
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
      'body:not(.dr-portal-ok) #portal-agent,body:not(.dr-portal-ok) .portal-agent{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}',
      'body.dr-pending-blocked #portal-agent,body.dr-pending-blocked .portal-agent{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}',
      'body.dr-pending-blocked #app-shell{display:none!important}',
      'body.dr-pending-blocked #login-screen,body.dr-pending-blocked .login-screen{display:flex!important;visibility:visible!important;opacity:1!important}',
      'body.dr-pending-blocked{overflow:auto!important}',
      '.login-card.login-pending-glow,.login-card.dr-login-pending,',
      '#login-screen .login-card.login-pending-glow,#login-screen .login-card.dr-login-pending{',
      'box-shadow:' + ORANGE_SHADOW + '!important;border-color:' + ORANGE_BORDER + '!important}',
      '@keyframes dr-fp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}',
      '.login-card.login-pending-shake{animation:dr-fp-shake 0.4s ease!important}',
      '.toast[data-dr-force-pending]{pointer-events:auto!important;padding:0.9rem 1.15rem!important;border-radius:14px!important;',
      'background:rgba(30,20,10,0.95)!important;color:#fdba74!important;border:1px solid rgba(251,146,60,0.5)!important;',
      'box-shadow:0 8px 28px rgba(0,0,0,0.35)!important;font-size:0.9rem!important;line-height:1.4!important}',
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
    _portalOk = false;
    try {
      document.body.classList.remove('dr-portal-ok');
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
  function unlockPortal() {
    _portalOk = true;
    try {
      document.body.classList.add('dr-portal-ok');
      document.body.classList.remove('dr-pending-blocked');
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
    if (!c) return;
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
    if (_blocking) return;
    _blocking = true;
    try {
      showPending();
      quietSignOut();
      lockPortal();
      setApprovalError();
    } finally {
      setTimeout(function () { _blocking = false; }, 500);
    }
  }
  function shouldBlockUser(id, un, em, role) {
    un = String(un || '').toLowerCase().trim();
    em = String(em || '').toLowerCase().trim();
    role = String(role || '').toLowerCase().trim();
    if (isDev(un) || isDevEmail(em)) return false;
    if (isCustomer(role)) return false;
    var st = getApprovalStatus(id, un, em);
    if (st === 'approved') return false;
    if (isStaffRole(role) || !role) {
      markPending(id, un, em);
      return true;
    }
    return false;
  }
  function gateProfile(p) {
    if (!p) return false;
    if (isCustomer(p.role || p.staff_role)) return false;
    var un = String(p.username || '').toLowerCase().trim();
    var em = String(p.email || '').toLowerCase();
    return shouldBlockUser(p.id, un, em, p.role || p.staff_role || '');
  }

  function wrapGates() {
    try {
      if (typeof window.showApp === 'function' && !window.showApp.__drFpWrapV17) {
        var sa = window.showApp;
        window.showApp = function (p) {
          if (gateProfile(p)) { blockNow(); return; }
          unlockPortal();
          return sa.apply(this, arguments);
        };
        window.showApp.__drFpWrapV17 = 1;
      }
    } catch (e) {}
    try {
      if (window.DR && typeof window.DR.showApp === 'function' && !window.DR.showApp.__drFpWrapV17) {
        var d0 = window.DR.showApp;
        window.DR.showApp = function (p) {
          if (gateProfile(p)) { blockNow(); return; }
          unlockPortal();
          return d0.apply(this, arguments);
        };
        window.DR.showApp.__drFpWrapV17 = 1;
      }
    } catch (e2) {}
    try {
      if (typeof window.applyPortalForRole === 'function' && !window.applyPortalForRole.__drFpWrapV17) {
        var apr = window.applyPortalForRole;
        window.applyPortalForRole = function (role) {
          try {
            var r = String(role || '').toLowerCase();
            if (!isCustomer(r) && isStaffRole(r)) {
              var u = readUserEmail();
              if (getApprovalStatus(null, u.un, u.em) !== 'approved' && !isDev(u.un) && !isDevEmail(u.em)) {
                blockNow();
                return;
              }
            }
          } catch (e) {}
          unlockPortal();
          return apr.apply(this, arguments);
        };
        window.applyPortalForRole.__drFpWrapV17 = 1;
      }
    } catch (e3) {}
    try {
      if (typeof window.loadFullAppThen === 'function' && !window.loadFullAppThen.__drFpWrapV17) {
        var lfa = window.loadFullAppThen;
        window.loadFullAppThen = function (role) {
          try {
            var r = String(role || '').toLowerCase();
            if (!isCustomer(r) && isStaffRole(r) && isPendingIdentity()) {
              blockNow();
              return Promise.resolve();
            }
          } catch (e) {}
          return lfa.apply(this, arguments);
        };
        window.loadFullAppThen.__drFpWrapV17 = 1;
      }
    } catch (e4) {}
  }

  async function checkSession() {
    if (_checkBusy || _blocking) return;
    _checkBusy = true;
    try {
      wrapGates();
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
      var role = (profile && (profile.role || profile.staff_role)) || meta.role || '';
      if (isCustomer(role)) { unlockPortal(); return; }
      var un = String(meta.username || (profile && profile.username) || '').toLowerCase().trim();
      var em = String(user.email || (profile && profile.email) || '').toLowerCase();
      if (shouldBlockUser(user.id, un, em, role)) blockNow();
      else unlockPortal();
    } catch (e) {
    } finally {
      _checkBusy = false;
    }
  }

  function isPendingIdentity() {
    var u = readUserEmail();
    if (!u.raw) return false;
    if (isDev(u.un) || isDevEmail(u.em)) return false;
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
    var btn = t.closest('#login-agent button[type="submit"], #login-agent .btn-primary');
    if (!btn) return;
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
    }
  }

  if (!window.__drForcePendingSubmitV17) {
    window.__drForcePendingSubmitV17 = 1;
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('click', onAgentButtonClick, true);
    document.addEventListener('keydown', onEnterKey, true);
  }

  ensureCss();
  wrapGates();
  setTimeout(checkSession, 200);
  setTimeout(checkSession, 1000);
  setTimeout(checkSession, 2200);
  setInterval(function () {
    if (_uiOn || document.body.classList.contains('dr-pending-blocked')) {
      lockPortal();
      applyOrangeGlow(card());
      setApprovalError();
    } else {
      wrapGates();
    }
  }, 2000);
  setInterval(function () {
    if (!_blocking && !_checkBusy) checkSession();
  }, 5000);

  window.DRForcePending = { showPendingUI: showPending, blockNow: blockNow, unlockPortal: unlockPortal, v: 17 };
})();
