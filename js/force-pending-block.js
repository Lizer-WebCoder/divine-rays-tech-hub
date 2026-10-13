/**
 * Divine Rays — force-pending-block v10
 * Block first login (not only 2nd). Force orange glow + shake every attempt. Right toast.
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_BLOCK >= 10) return;
  window.__DR_FORCE_PENDING_BLOCK = 10;

  var KEY = 'dr_staff_approval';
  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
  var FADE_MS = 10000;
  var MSG = 'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var ERR_MSG = 'Account needs approval.';
  var ORANGE_SHADOW = '0 0 22px rgba(251,146,60,0.9),0 0 52px rgba(249,115,22,0.6),0 0 80px rgba(234,88,12,0.35)';
  var ORANGE_BORDER = 'rgba(251,146,60,0.95)';
  var _timer = null;
  var _toastEl = null;
  var _uiOn = false;
  var _shakeLock = false;
  var _blocking = false;

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
    return (
      document.querySelector('#login-screen .login-card') ||
      document.querySelector('.login-card') ||
      document.querySelector('#login-screen .card') ||
      document.querySelector('#login-agent') && document.querySelector('#login-agent').closest('.login-card')
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
      'body.dr-pending-blocked #login-screen,body.dr-pending-blocked .login-screen{display:flex!important;visibility:visible!important;opacity:1!important}',
      'body.dr-pending-blocked{overflow:auto!important}',
      '.login-card.login-pending-glow,.login-card.dr-login-pending,',
      '#login-screen .login-card.login-pending-glow,#login-screen .login-card.dr-login-pending{',
      'border-color:' + ORANGE_BORDER + '!important;',
      'box-shadow:' + ORANGE_SHADOW + '!important;',
      'outline:2px solid rgba(251,146,60,0.7)!important;',
      'transition:box-shadow .2s ease,border-color .2s ease!important}',
      '.login-card.login-pending-shake{animation:dr-fp-shake 0.4s ease!important}',
      '@keyframes dr-fp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}',
      '#toast-container.dr-fp-toast-box{position:fixed!important;top:1rem!important;right:1rem!important;z-index:2147483647!important;',
      'display:flex!important;flex-direction:column!important;gap:0.5rem!important;max-width:min(22rem,92vw)!important;pointer-events:none!important}',
      '.toast[data-dr-force-pending]{pointer-events:auto!important;padding:0.9rem 1.15rem!important;border-radius:14px!important;',
      'background:rgba(28,22,42,0.98)!important;border:1px solid rgba(251,146,60,0.65)!important;color:#fde68a!important;',
      'font-size:0.88rem!important;line-height:1.45!important;display:block!important;opacity:1!important;',
      'box-shadow:0 8px 28px rgba(0,0,0,0.4),0 0 20px rgba(249,115,22,0.3)!important}',
      '.toast.dr-pending-toast-shake{animation:dr-fp-shake 0.4s ease}',
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
      document.body.classList.add('dr-pending-blocked');
      document.body.classList.remove('is-portal');
      document.body.classList.add('is-login');
      var pa = document.getElementById('portal-agent');
      if (pa) {
        pa.classList.remove('active');
        pa.style.setProperty('display', 'none', 'important');
        pa.style.setProperty('visibility', 'hidden', 'important');
      }
      var shell = document.getElementById('app-shell');
      if (shell) {
        shell.style.setProperty('display', 'none', 'important');
      }
      var ls = document.getElementById('login-screen');
      if (ls) {
        ls.hidden = false;
        ls.style.removeProperty('display');
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
  function rewriteInvalidError() {
    try {
      document.querySelectorAll('.login-error').forEach(function (el) {
        var t = String(el.textContent || '').toLowerCase();
        if (
          t.indexOf('invalid') !== -1 ||
          t.indexOf('credential') !== -1 ||
          t.indexOf('wrong') !== -1 ||
          t.indexOf('incorrect') !== -1
        ) {
          el.textContent = ERR_MSG;
          el.classList.add('dr-pending-err');
        }
      });
    } catch (e) {}
  }
  function shake() {
    _shakeLock = false;
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
    var c = card();
    applyOrangeGlow(c);
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
    requestAnimationFrame(function () {
      shake();
    });
    _uiOn = true;
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(function () {
      try {
        if (_toastEl) _toastEl.style.opacity = '0.9';
      } catch (e) {}
    }, FADE_MS);
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
  function blockNow() {
    if (_blocking) {
      showPending();
      return;
    }
    _blocking = true;
    showPending();
    quietSignOut();
    lockPortal();
    setApprovalError();
    setTimeout(function () {
      _blocking = false;
      lockPortal();
      applyOrangeGlow(card());
    }, 50);
    setTimeout(function () {
      lockPortal();
      applyOrangeGlow(card());
      shake();
    }, 200);
  }
  function gateProfile(p) {
    if (!p) return false;
    var un = String(p.username || '').toLowerCase().trim();
    var em = String(p.email || '').toLowerCase();
    var id = p.id;
    if (isDev(un)) return false;
    if (isApproved(id, un, em)) return false;
    if (p.approval_status === 'approved' || p.approved === true) return false;
    if (
      isMarkedPending(id, un, em) ||
      p.approval_status === 'pending' ||
      p.approved === false ||
      isStaffRole(p.role)
    ) {
      markPending(id, un, em);
      return true;
    }
    return false;
  }
  function wrapShowApp() {
    function wrap(fn) {
      if (!fn || fn.__drFpWrapV10) return fn;
      var w = function (p) {
        try {
          if (gateProfile(p)) {
            blockNow();
            return;
          }
        } catch (e) {}
        return fn.apply(this, arguments);
      };
      w.__drFpWrapV10 = 1;
      return w;
    }
    try {
      if (typeof window.showApp === 'function') window.showApp = wrap(window.showApp);
      if (window.DR && typeof window.DR.showApp === 'function') window.DR.showApp = wrap(window.DR.showApp);
    } catch (e) {}
  }
  /* Catch showApp even if assigned later */
  try {
    var _sa;
    Object.defineProperty(window, 'showApp', {
      configurable: true,
      enumerable: true,
      get: function () { return _sa; },
      set: function (fn) {
        _sa = typeof fn === 'function' ? (function wrapSet(f) {
          if (f.__drFpWrapV10) return f;
          var w = function (p) {
            try {
              if (gateProfile(p)) { blockNow(); return; }
            } catch (e) {}
            return f.apply(this, arguments);
          };
          w.__drFpWrapV10 = 1;
          return w;
        })(fn) : fn;
      }
    });
  } catch (eDef) {}
  try {
    if (!window.DR) window.DR = {};
    var _drSa;
    Object.defineProperty(window.DR, 'showApp', {
      configurable: true,
      enumerable: true,
      get: function () { return _drSa; },
      set: function (fn) {
        _drSa = typeof fn === 'function' ? (function wrapSet(f) {
          if (f.__drFpWrapV10) return f;
          var w = function (p) {
            try {
              if (gateProfile(p)) { blockNow(); return; }
            } catch (e) {}
            return f.apply(this, arguments);
          };
          w.__drFpWrapV10 = 1;
          return w;
        })(fn) : fn;
      }
    });
  } catch (eDef2) {}

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
        blockNow();
      }
    } catch (e) {}
  }
  function isPendingIdentity() {
    var u = readUserEmail();
    if (!u.raw) return false;
    if (isDev(u.un)) return false;
    if (isApproved(null, u.un, u.em)) return false;
    return isMarkedPending(null, u.un, u.em);
  }
  function onSubmit(ev) {
    var form = ev.target;
    if (!form || form.id !== 'login-agent') return;
    if (isPendingIdentity()) {
      try {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      } catch (e) {}
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
      try {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      } catch (e) {}
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
      try {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      } catch (e) {}
      blockNow();
      return;
    }
    var b = form.querySelector('button[type="submit"]');
    if (b && !b.disabled && t.tagName !== 'BUTTON') {
      try {
        ev.preventDefault();
        if (form.requestSubmit) form.requestSubmit(b);
        else b.click();
      } catch (e2) {
        try { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); } catch (e3) {}
      }
    }
  }
  /* If portal appears while pending identity → yank back */
  try {
    new MutationObserver(function () {
      if (!isPendingIdentity() && !_uiOn) return;
      if (document.body.classList.contains('is-portal') || document.getElementById('portal-agent')) {
        var pa = document.getElementById('portal-agent');
        if (pa && pa.classList.contains('active')) blockNow();
        if (document.body.classList.contains('is-portal') && isPendingIdentity()) blockNow();
      }
    }).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['class'] });
  } catch (eObs) {}

  setInterval(function () {
    if (_uiOn || document.body.classList.contains('dr-pending-blocked')) {
      rewriteInvalidError();
      setApprovalError();
      applyOrangeGlow(card());
      lockPortal();
    }
  }, 500);

  if (!window.__drForcePendingSubmitV10) {
    window.__drForcePendingSubmitV10 = 1;
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('click', onAgentButtonClick, true);
    document.addEventListener('keydown', onEnterKey, true);
  }
  ensureCss();
  wrapShowApp();
  checkSession();
  setTimeout(checkSession, 300);
  setTimeout(checkSession, 800);
  setTimeout(checkSession, 1600);
  setInterval(function () {
    wrapShowApp();
    checkSession();
  }, 1200);
  window.DRForcePending = {
    showPendingUI: showPending,
    shouldBlock: shouldBlock,
    blockNow: blockNow
  };
})();
