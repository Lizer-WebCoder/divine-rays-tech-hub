/**
 * Divine Rays — force-pending-block v19
 * Pending login: card glow + shake + toast ONLY.
 * Never restyle page background / login-screen layout.
 * Developers (2): kirzhianquijano@gmail.com, iiyasora2002@gmail.com
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_BLOCK >= 19) return;
  window.__DR_FORCE_PENDING_BLOCK = 19;

  var KEY = 'dr_staff_approval';
  var DEVS = { kirzhianquijano: 1, iiyasora2002: 1 };
  var DEV_EMAILS = { 'kirzhianquijano@gmail.com': 1, 'iiyasora2002@gmail.com': 1 };
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
  var _signedOut = false;

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
    return 'pending';
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
    r = String(r || '').toLowerCase().trim();
    return r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'client' || r === 'employee' || r === 'end user';
  }
  function isStaffRole(r) {
    r = String(r || '').toLowerCase().trim();
    if (!r || isCustomer(r)) return false;
    return r === 'agent' || r === 'admin' || r === 'administrator' || r === 'owner' || r === 'developer' || r === 'dev' || r === 'tech' || r === 'staff' || r.indexOf('admin') !== -1 || r.indexOf('agent') !== -1 || r.indexOf('tech') !== -1;
  }
  function sb() {
    try { if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb(); } catch (e) {}
    try { if (window.__drSb) return window.__drSb; } catch (e2) {}
    return null;
  }
  function card() {
    return document.querySelector('#login-screen .login-card') || document.querySelector('.login-card');
  }
  function agentForm() { return document.getElementById('login-agent'); }
  function readUserEmail() {
    var form = agentForm();
    var inp = document.getElementById('agent-username') || document.getElementById('agent-user') || (form && form.querySelector('input[type="email"], input[name="email"], input[name="username"], input[type="text"]'));
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
      'body.dr-pending-blocked #app-shell{display:none!important;visibility:hidden!important}',
      '.login-card.login-pending-glow,.login-card.dr-login-pending{box-shadow:' + ORANGE_SHADOW + '!important;border-color:' + ORANGE_BORDER + '!important}',
      '@keyframes dr-fp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}',
      '.login-card.login-pending-shake{animation:dr-fp-shake 0.4s ease!important}',
      '.toast[data-dr-force-pending]{pointer-events:auto!important;padding:0.9rem 1.15rem!important;border-radius:14px!important;background:rgba(30,20,10,0.95)!important;color:#fdba74!important;border:1px solid rgba(251,146,60,0.5)!important;box-shadow:0 8px 28px rgba(0,0,0,0.35)!important;font-size:0.9rem!important;line-height:1.4!important;z-index:2147483647!important}',
      '.login-error.dr-pending-err{color:#f97316!important;background:rgba(249,115,22,0.12)!important;border:1px solid rgba(249,115,22,0.35)!important;border-radius:10px!important;padding:0.55rem 0.75rem!important}'
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
    } catch (e) {}
  }
  function hidePortalOnly() {
    ensureCss();
    try {
      document.body.classList.remove('dr-portal-ok');
      document.body.classList.add('dr-pending-blocked');
      var pa = document.getElementById('portal-agent');
      if (pa) {
        pa.classList.remove('active');
        pa.style.setProperty('display', 'none', 'important');
        pa.style.setProperty('visibility', 'hidden', 'important');
      }
      var shell = document.getElementById('app-shell');
      if (shell) {
        shell.style.setProperty('display', 'none', 'important');
        shell.style.setProperty('visibility', 'hidden', 'important');
      }
    } catch (e) {}
  }
  function unlockPortal() {
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
  function showPendingUI() {
    ensureCss();
    applyOrangeGlow(card());
    requestAnimationFrame(shake);
    setApprovalError();
    var box = document.getElementById('toast-container');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast-container';
      document.body.appendChild(box);
    }
    box.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:2147483647;display:flex;flex-direction:column;gap:0.5rem;max-width:min(22rem,92vw);pointer-events:none';
    if (!_toastEl || !_toastEl.parentNode) {
      _toastEl = document.createElement('div');
      _toastEl.className = 'toast';
      _toastEl.setAttribute('data-dr-force-pending', '1');
      box.appendChild(_toastEl);
    }
    _toastEl.textContent = MSG;
    _toastEl.style.display = 'block';
    _toastEl.style.opacity = '1';
    _uiOn = true;
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(function () {
      try { if (_toastEl) _toastEl.style.opacity = '0.9'; } catch (e) {}
    }, FADE_MS);
  }
  async function quietSignOutIfNeeded() {
    try {
      var client = sb();
      if (!client || !client.auth) return;
      var s = await client.auth.getSession();
      var session = s && s.data && s.data.session;
      if (!session) return;
      if (_signedOut) return;
      _signedOut = true;
      await client.auth.signOut({ scope: 'local' });
      try {
        window.__drFullLoaded = false;
        window.__drBooting = false;
        window.__drProfile = null;
      } catch (e2) {}
      setTimeout(function () { _signedOut = false; }, 800);
    } catch (e) {}
  }
  function blockNow() {
    showPendingUI();
    hidePortalOnly();
    if (_blocking) return;
    _blocking = true;
    try { quietSignOutIfNeeded(); } finally {
      setTimeout(function () { _blocking = false; }, 250);
    }
  }
  function shouldBlockUser(id, un, em, role) {
    un = String(un || '').toLowerCase().trim();
    em = String(em || '').toLowerCase().trim();
    role = String(role || '').toLowerCase().trim();
    if (isDev(un) || isDevEmail(em)) return false;
    if (isCustomer(role)) return false;
    if (getApprovalStatus(id, un, em) === 'approved') return false;
    if (isStaffRole(role) || !role) {
      markPending(id, un, em);
      return true;
    }
    return false;
  }
  function gateProfile(p) {
    if (!p) return false;
    if (isCustomer(p.role || p.staff_role)) return false;
    return shouldBlockUser(p.id, p.username, p.email, p.role || p.staff_role || '');
  }
  function isPendingIdentity() {
    var u = readUserEmail();
    if (!u.raw) return false;
    if (isDev(u.un) || isDevEmail(u.em)) return false;
    return getApprovalStatus(null, u.un, u.em) !== 'approved';
  }
  function wrapGates() {
    try {
      if (typeof window.showApp === 'function' && !window.showApp.__drFpWrapV19) {
        var sa = window.showApp;
        window.showApp = function (p) {
          if (gateProfile(p)) { blockNow(); return; }
          unlockPortal();
          return sa.apply(this, arguments);
        };
        window.showApp.__drFpWrapV19 = 1;
      }
    } catch (e) {}
    try {
      if (typeof window.applyPortalForRole === 'function' && !window.applyPortalForRole.__drFpWrapV19) {
        var apr = window.applyPortalForRole;
        window.applyPortalForRole = function (role) {
          try {
            var r = String(role || '').toLowerCase();
            if (!isCustomer(r) && isStaffRole(r) && isPendingIdentity()) { blockNow(); return; }
          } catch (e) {}
          unlockPortal();
          return apr.apply(this, arguments);
        };
        window.applyPortalForRole.__drFpWrapV19 = 1;
      }
    } catch (e2) {}
    try {
      if (typeof window.loadFullAppThen === 'function' && !window.loadFullAppThen.__drFpWrapV19) {
        var lfa = window.loadFullAppThen;
        window.loadFullAppThen = function (role) {
          try {
            var r = String(role || '').toLowerCase();
            if (!isCustomer(r) && isStaffRole(r) && isPendingIdentity()) { blockNow(); return Promise.resolve(); }
          } catch (e) {}
          return lfa.apply(this, arguments);
        };
        window.loadFullAppThen.__drFpWrapV19 = 1;
      }
    } catch (e3) {}
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
  function stopEvent(ev) {
    try { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); } catch (e) {}
  }
  function onSubmit(ev) {
    if (!ev.target || ev.target.id !== 'login-agent') return;
    if (isPendingIdentity()) { stopEvent(ev); blockNow(); }
  }
  function onAgentButton(ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var btn = t.closest('#login-agent button[type="submit"], #login-agent .btn-primary, #login-agent button.btn');
    if (!btn) return;
    if (isPendingIdentity()) { stopEvent(ev); blockNow(); }
  }
  function onEnterKey(ev) {
    if (ev.key !== 'Enter' && ev.keyCode !== 13) return;
    var t = ev.target;
    if (!t || !t.closest) return;
    if (!t.closest('#login-agent')) return;
    if (t.tagName === 'TEXTAREA') return;
    if (isPendingIdentity()) { stopEvent(ev); blockNow(); }
  }

  if (!window.__drForcePendingSubmitV19) {
    window.__drForcePendingSubmitV19 = 1;
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('click', onAgentButton, true);
    document.addEventListener('pointerdown', onAgentButton, true);
    document.addEventListener('keydown', onEnterKey, true);
  }

  try {
    if (!window.__drFpPortalObs) {
      window.__drFpPortalObs = 1;
      var _obs = new MutationObserver(function () {
        try {
          if (document.body.classList.contains('dr-portal-ok')) return;
          var pa = document.getElementById('portal-agent');
          if (pa && pa.classList.contains('active') && (isPendingIdentity() || document.body.classList.contains('dr-pending-blocked'))) {
            hidePortalOnly();
            showPendingUI();
          }
        } catch (e) {}
      });
      function arm() {
        var pa0 = document.getElementById('portal-agent');
        if (pa0) _obs.observe(pa0, { attributes: true, attributeFilter: ['class', 'style'] });
      }
      arm();
      setTimeout(arm, 600);
    }
  } catch (eObs) {}

  ensureCss();
  wrapGates();
  setTimeout(checkSession, 300);
  setTimeout(checkSession, 1200);
  setInterval(function () {
    if (_uiOn || document.body.classList.contains('dr-pending-blocked')) {
      applyOrangeGlow(card());
      setApprovalError();
      hidePortalOnly();
    } else {
      wrapGates();
    }
  }, 2000);

  window.DRForcePending = { showPendingUI: showPendingUI, blockNow: blockNow, unlockPortal: unlockPortal, v: 19 };
})();
