/**
 * Divine Rays — Agent approval gate + staff role label
 * - Newly registered Agent/Admin cannot enter portal until approved
 * - Roles column shows chosen label (Owner / Admin / IT Tech Support)
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_APPROVAL_GATE) return;
  window.__DR_AGENT_APPROVAL_GATE = 1;

  var APPROVAL_KEY = 'dr_staff_approval';

  function getApprovalMap() {
    try {
      return JSON.parse(localStorage.getItem(APPROVAL_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function setApprovalMap(map) {
    try {
      localStorage.setItem(APPROVAL_KEY, JSON.stringify(map || {}));
    } catch (e) {}
  }

  function markPending(userId, username, email) {
    var map = getApprovalMap();
    if (userId) map[userId] = 'pending';
    if (username) map['pending:' + String(username).toLowerCase().trim()] = 'pending';
    if (email) map['pending:' + String(email).toLowerCase().trim()] = 'pending';
    setApprovalMap(map);
  }

  function isMarkedPending(userId, username, email) {
    var map = getApprovalMap();
    if (userId && map[userId] === 'pending') return true;
    if (username && map['pending:' + String(username).toLowerCase().trim()] === 'pending') return true;
    if (email && map['pending:' + String(email).toLowerCase().trim()] === 'pending') return true;
    return false;
  }

  function isApproved(userId, username, email) {
    var map = getApprovalMap();
    if (userId && map[userId] === 'approved') return true;
    if (username && map['u:' + String(username).toLowerCase().trim()] === 'approved') return true;
    if (email && map['e:' + String(email).toLowerCase().trim()] === 'approved') return true;
    return false;
  }

  function sb() {
    try {
      if (window.DR && typeof window.DR.sb === 'function') {
        var c = window.DR.sb();
        if (c) return c;
      }
    } catch (e) {}
    return window.__drSb || window.__drAgentSb || null;
  }

  function showAgentError(msg) {
    try {
      var box = document.getElementById('error-login-agent');
      if (box) {
        box.textContent = msg;
        box.style.display = '';
      }
    } catch (e) {}
    if (window.DR && window.DR.toast) window.DR.toast(msg, 'error');
    else if (window.DRDialog && window.DRDialog.alert) window.DRDialog.alert(msg, { title: 'Notice' });
  }

  async function checkPendingAndBlock(user, profile, loginHint) {
    if (!user) return false;
    var meta = user.user_metadata || {};
    var uid = user.id;
    var email = (user.email || (profile && profile.email) || '').toLowerCase();
    var username =
      (meta.username || (profile && profile.username) || loginHint || '').toString().toLowerCase().trim();

    /* Explicitly approved */
    if (meta.approval_status === 'approved' || meta.approved === true) return false;
    if (isApproved(uid, username, email)) return false;

    /* Explicitly pending */
    if (meta.approval_status === 'pending' || meta.approved === false) return true;
    if (isMarkedPending(uid, username, email)) return true;

    /* No marker = legacy account → allow */
    return false;
  }

  async function forceSignOut() {
    try {
      var client = sb();
      if (client && client.auth) await client.auth.signOut({ scope: 'local' });
    } catch (e) {}
    try {
      window.__drFullLoaded = false;
      window.__drBooting = false;
    } catch (e2) {}
  }

  /* Intercept agent login after auth succeeds (capture phase on submit is too early).
     Patch loadFullAppThen / listen to auth state. */
  function wireLoginGate() {
    var form = document.getElementById('login-agent');
    if (!form || form.__drApprovalGate) return;
    form.__drApprovalGate = 1;

    form.addEventListener(
      'submit',
      function () {
        /* After a short delay, session should exist — check approval */
        var tries = 0;
        var t = setInterval(async function () {
          tries++;
          try {
            var client = sb();
            if (!client) {
              if (tries > 30) clearInterval(t);
              return;
            }
            var sess = await client.auth.getSession();
            var session = sess && sess.data && sess.data.session;
            if (!session || !session.user) {
              if (tries > 30) clearInterval(t);
              return;
            }
            var user = session.user;
            var loginHint = '';
            try {
              var inp =
                document.getElementById('agent-username') ||
                document.getElementById('agent-user');
              loginHint = inp ? (inp.value || '').trim() : '';
            } catch (e0) {}

            var profile = null;
            try {
              var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
              profile = pr && pr.data;
            } catch (e1) {}

            var pending = await checkPendingAndBlock(user, profile, loginHint);
            if (pending) {
              clearInterval(t);
              await forceSignOut();
              /* hide portals if shown */
              try {
                var pc = document.getElementById('portal-customer');
                var pa = document.getElementById('portal-agent');
                if (pc) pc.classList.remove('active');
                if (pa) pa.classList.remove('active');
                var ls = document.getElementById('login-screen');
                if (ls) ls.style.display = '';
              } catch (e2) {}
              showAgentError(
                'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.'
              );
              return;
            }
            clearInterval(t);
          } catch (err) {
            if (tries > 30) clearInterval(t);
          }
        }, 150);
      },
      true
    );
  }

  /* Admin table: show staff_role / job_title when present */
  function polishRoleCells() {
    var box = document.getElementById('admin-users-list');
    if (!box) return;
    box.querySelectorAll('tbody tr, .admin-user-row, tr').forEach(function (row) {
      if (row.__drRolePolished) return;
      var badge = row.querySelector('[class*="badge-role"], .badge');
      if (!badge) return;
      var uid = row.getAttribute('data-id') || '';
      var cache = window.__adminUsersCache || [];
      var user = null;
      if (uid) {
        for (var i = 0; i < cache.length; i++) {
          if (cache[i] && cache[i].id === uid) {
            user = cache[i];
            break;
          }
        }
      }
      /* Also try matching by username cell */
      if (!user && cache.length) {
        var cells = row.querySelectorAll('td');
        var uname = cells[1] ? (cells[1].textContent || '').trim() : '';
        for (var j = 0; j < cache.length; j++) {
          if (cache[j] && (cache[j].username === uname || cache[j].full_name === uname)) {
            user = cache[j];
            break;
          }
        }
      }
      if (!user) return;
      var label =
        user.staff_role ||
        user.job_title ||
        (user.meta && user.meta.staff_role) ||
        '';
      /* recover from local pending map notes */
      if (!label) {
        try {
          var map = getApprovalMap();
          var k = 'role:' + (user.username || '').toLowerCase();
          if (map[k]) label = map[k];
        } catch (e) {}
      }
      if (label) {
        badge.textContent = label;
        row.__drRolePolished = 1;
      }
    });
  }

  /* Patch renderAdminUsers if available */
  function patchAdminRender() {
    if (typeof window.renderAdminUsers !== 'function' || window.renderAdminUsers.__drRolePatch) return;
    var orig = window.renderAdminUsers;
    window.renderAdminUsers = async function () {
      var r = await orig.apply(this, arguments);
      setTimeout(polishRoleCells, 50);
      setTimeout(polishRoleCells, 300);
      return r;
    };
    window.renderAdminUsers.__drRolePatch = 1;
  }

  /* Expose helpers for register script */
  window.DRAgentApproval = {
    markPending: markPending,
    isMarkedPending: isMarkedPending,
    getApprovalMap: getApprovalMap,
    setApprovalMap: setApprovalMap,
    saveRoleLabel: function (username, label) {
      if (!username || !label) return;
      var map = getApprovalMap();
      map['role:' + String(username).toLowerCase().trim()] = label;
      setApprovalMap(map);
    }
  };

  function tick() {
    wireLoginGate();
    patchAdminRender();
    polishRoleCells();
  }

  tick();
  setInterval(tick, 2000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
})();
