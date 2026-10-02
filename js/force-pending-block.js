/**
 * Divine Rays — force pending staff block V1 (companion to approval gate)
 * Blocks portal for unapproved staff including IT Tech Support roles.
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_PENDING_BLOCK) return;
  window.__DR_FORCE_PENDING_BLOCK = 1;

  var KEY = 'dr_staff_approval';
  var MSG = 'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };

  function map() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function isDev(n) { return !!DEVS[String(n || '').toLowerCase().trim()]; }
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
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  }
  function isCustomer(r) {
    r = String(r || '').toLowerCase();
    return r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'end_user';
  }
  function isStaff(r) {
    r = String(r || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
    if (!r) return false;
    if (isCustomer(r)) return false;
    if (r === 'agent' || r === 'admin' || r === 'owner' || r === 'developer' || r === 'dev') return true;
    if (r.indexOf('tech support') !== -1 || r.indexOf('it tech') !== -1) return true;
    if (r.indexOf('admin') !== -1 || r.indexOf('agent') !== -1 || r === 'staff' || r === 'support') return true;
    return false;
  }
  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || window.__drAgentSb || null;
  }
  function css() {
    if (document.getElementById('dr-force-pending-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-force-pending-css';
    s.textContent =
      'body.dr-pending-blocked #portal-agent{display:none!important;visibility:hidden!important;opacity:0!important}' +
      'body.dr-pending-blocked #login-screen{display:flex!important;visibility:visible!important;opacity:1!important;z-index:60!important}' +
      'body.dr-pending-blocked .login-card,.login-card.dr-login-pending{' +
      'border-color:rgba(251,146,60,0.95)!important;' +
      'box-shadow:0 0 0 1px rgba(251,146,60,0.55),0 0 36px 10px rgba(251,146,60,0.55)!important}' +
      'body.dr-pending-blocked .toast.success{display:none!important}';
    (document.head || document.documentElement).appendChild(s);
  }
  function lock() {
    css();
    try {
      document.body.classList.add('dr-pending-blocked');
      document.querySelectorAll('.login-card').forEach(function (c) { c.classList.add('dr-login-pending'); });
      var pa = document.getElementById('portal-agent');
      if (pa) { pa.classList.remove('active'); pa.style.setProperty('display', 'none', 'important'); }
      var ls = document.getElementById('login-screen');
      if (ls) { ls.hidden = false; ls.style.display = ''; ls.classList.add('active'); }
    } catch (e) {}
  }
  function toast() {
    css();
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:2147483646;display:flex;flex-direction:column;gap:0.5rem;max-width:min(22rem,92vw)';
      document.body.appendChild(c);
    }
    var old = c.querySelector('[data-dr-force-pending]');
    if (old) try { old.parentNode.removeChild(old); } catch (e) {}
    var el = document.createElement('div');
    el.className = 'toast error';
    el.setAttribute('data-dr-force-pending', '1');
    el.style.cssText = 'padding:0.9rem 1.15rem;border-radius:14px;background:rgba(28,22,42,0.98);border:1px solid rgba(167,139,250,0.45);color:#eeeef6;font-size:0.9rem;line-height:1.45;box-shadow:0 12px 32px rgba(0,0,0,0.5)';
    el.textContent = MSG;
    c.appendChild(el);
    setTimeout(function () { try { if (el.parentNode) el.parentNode.removeChild(el); } catch (e) {} }, 5000);
  }
  function shouldBlock(user, profile) {
    if (!user) return false;
    var meta = user.user_metadata || {};
    var uid = user.id;
    var email = (user.email || (profile && profile.email) || '').toLowerCase();
    var un = String(meta.username || (profile && profile.username) || '').toLowerCase().trim();
    if (isDev(un)) return false;
    if (meta.approval_status === 'approved' || meta.approved === true) return false;
    if (isApproved(uid, un, email)) return false;
    var role = String((profile && profile.role) || meta.role || (profile && profile.staff_role) || meta.staff_role || '').toLowerCase();
    if (isCustomer(role) || isCustomer((profile && profile.role) || meta.role)) return false;
    if (meta.approval_status === 'pending' || meta.approved === false) { markPending(uid, un, email); return true; }
    var m = map();
    if ((uid && m[uid] === 'pending') || (un && m['pending:' + un] === 'pending') || (email && m['pending:' + email] === 'pending')) return true;
    if (isStaff(role) || isStaff((profile && profile.role) || '') || isStaff((profile && profile.staff_role) || '')) {
      markPending(uid, un, email);
      return true;
    }
    if (profile && !isCustomer(profile.role)) {
      markPending(uid, un, email);
      return true;
    }
    return false;
  }
  async function kick() {
    try {
      var client = sb();
      if (client && client.auth) await client.auth.signOut({ scope: 'local' });
    } catch (e) {}
    try { window.__drFullLoaded = false; window.__drBooting = false; window.__drProfile = null; } catch (e2) {}
  }
  function wrapShowApp() {
    function wrap(fn) {
      if (!fn || fn.__drForcePendingWrap) return fn;
      var w = function (p) {
        try {
          var role = p && p.role;
          var un = (p && p.username) || '';
          var em = (p && p.email) || '';
          var id = p && p.id;
          if (!isDev(un) && !isApproved(id, un, em) && !isCustomer(role) && (isStaff(role) || isStaff(p && p.staff_role) || (p && !isCustomer(role)))) {
            markPending(id, un, em);
            lock();
            toast();
            kick();
            return;
          }
        } catch (e) {}
        return fn.apply(this, arguments);
      };
      w.__drForcePendingWrap = 1;
      return w;
    }
    try {
      if (typeof window.showApp === 'function') window.showApp = wrap(window.showApp);
      if (window.DR && typeof window.DR.showApp === 'function') window.DR.showApp = wrap(window.DR.showApp);
    } catch (e) {}
  }
  var busy = false;
  async function checkSession() {
    if (busy) return;
    busy = true;
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
      if (shouldBlock(user, profile)) {
        lock();
        toast();
        await kick();
        lock();
      }
    } catch (e) {
    } finally {
      busy = false;
    }
  }
  wrapShowApp();
  checkSession();
  setInterval(function () { wrapShowApp(); checkSession(); }, 800);
})();
