/**
 * Divine Rays — Admin V21 — Developer gold badges; Roles match sidebar
 * End-Users: customers only | Admin: staff Status/Approve/Deny (deny deletes)
 * Pending stays listed until Approve or Deny; Deny deletes profile.
 * Approve writes profiles.approval_status (source of truth across devices).
 * Developers (2 only): kirzhianquijano@gmail.com, iiyasora2002@gmail.com
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_V21) return;
  window.__DR_ADMIN_V21 = 1;

  var DEVS = { kirzhianquijano: 1, iiyasora2002: 1 };
  var DEV_EMAILS = { 'kirzhianquijano@gmail.com': 1, 'iiyasora2002@gmail.com': 1 };
  var KEY = 'dr_staff_approval';

  function DR() { return window.DR || {}; }
  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return null;
  }
  function toast(m, t) { try { if (window.DR && window.DR.toast) window.DR.toast(m, t || 'info'); } catch (e) {} }
  function ask(msg) {
    try { return Promise.resolve(window.confirm(msg)); } catch (e) { return Promise.resolve(false); }
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
  }
  function fmt(d) { return DR().fmt ? DR().fmt(d) : (d || ''); }
  function isDev(name) {
    var s = String(name || '').toLowerCase().trim();
    if (s && DEVS[s]) return true;
    if (s && DEV_EMAILS[s]) return true;
    return false;
  }
  function isDevProfile(p) {
    if (!p) return false;
    if (isDev(p.username)) return true;
    var em = String(p.email || '').toLowerCase().trim();
    return !!(em && DEV_EMAILS[em]);
  }
  function canManage(profile) {
    if (!profile) return false;
    if (String(profile.role || '').toLowerCase() === 'admin') return true;
    return isDevProfile(profile);
  }
  function mapGet() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function mapSet(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m || {})); } catch (e) {}
  }
  function setStatus(id, status, username, email) {
    var m = mapGet();
    if (id) m[id] = status;
    var un = String(username || '').toLowerCase().trim();
    var em = String(email || '').toLowerCase().trim();
    if (un) {
      if (status === 'approved') { m['u:' + un] = 'approved'; delete m['pending:' + un]; }
      else { delete m['u:' + un]; delete m['pending:' + un]; }
    }
    if (em) {
      if (status === 'approved') { m['e:' + em] = 'approved'; delete m['pending:' + em]; }
      else { delete m['e:' + em]; delete m['pending:' + em]; }
    }
    mapSet(m);
  }
  async function setStatusServer(id, status, username, email) {
    setStatus(id, status, username, email);
    if (!id) return { ok: true };
    var client = sb();
    if (!client) return { ok: true };
    try {
      var payload = { approval_status: status };
      if (status === 'approved') {
        try { payload.approved_at = new Date().toISOString(); } catch (e) {}
      }
      var r = await client.from('profiles').update(payload).eq('id', id);
      if (r && r.error) {
        var r2 = await client.from('profiles').update({ status: status }).eq('id', id);
        if (r2 && r2.error) return { ok: false, error: r.error.message || r2.error.message };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e && e.message || e) };
    }
  }
  function getStatus(u) {
    if (!u) return 'pending';
    if (isDev(u.username) || isDev(u.email)) return 'approved';
    var server = String(u.approval_status || u.status || '').toLowerCase().trim();
    if (server === 'approved' || server === 'active') return 'approved';
    if (server === 'denied' || server === 'disapproved' || server === 'rejected') return 'denied';
    var m = mapGet();
    if (u.id && m[u.id] === 'approved') return 'approved';
    if (u.id && (m[u.id] === 'denied' || m[u.id] === 'disapproved')) return 'denied';
    var un = String(u.username || '').toLowerCase().trim();
    var em = String(u.email || '').toLowerCase().trim();
    if (un && m['u:' + un] === 'approved') return 'approved';
    if (em && m['e:' + em] === 'approved') return 'approved';
    if (un && m['pending:' + un] === 'pending') return 'pending';
    if (em && m['pending:' + em] === 'pending') return 'pending';
    return 'pending';
  }
  function statusBadgeClass(st) {
    if (st === 'pending') return 'badge badge-role-pending';
    if (st === 'approved') return 'badge badge-role-approved';
    if (st === 'denied') return 'badge badge-role-denied';
    return 'badge';
  }
  function roleLabel(u) {
    if (isDevProfile(u)) return 'Developer';
    var r = String(u.role || '').toLowerCase();
    if (r === 'admin' || r === 'administrator') return 'Admin';
    if (r === 'agent' || r === 'staff') return 'Agent';
    return 'End-User';
  }
  async function deleteUserProfile(userId) {
    var client = sb();
    if (!client || !userId) return { error: 'No client' };
    try {
      var r = await client.from('profiles').delete().eq('id', userId);
      if (r.error) return { error: r.error.message };
      return { ok: true };
    } catch (e) {
      return { error: String(e && e.message || e) };
    }
  }
  function injectCss() {
    if (document.getElementById('dr-admin-v21-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-admin-v21-css';
    s.textContent = [
      '.badge-role-pending{background:rgba(251,146,60,0.2)!important;color:#fb923c!important}',
      '.badge-role-approved{background:rgba(34,197,94,0.2)!important;color:#4ade80!important}',
      '.badge-role-denied{background:rgba(239,68,68,0.2)!important;color:#f87171!important}',
      '.badge-role-developer{background:rgba(234,179,8,0.25)!important;color:#fbbf24!important}',
      '#admin-users-list .dr-v10-approve,#admin-users-list .dr-v10-deny{margin-right:0.35rem}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }
  function currentProfile() {
    try {
      if (window.DR && window.DR.currentProfile) return window.DR.currentProfile;
      if (window.__drProfile) return window.__drProfile;
    } catch (e) {}
    return null;
  }
  function adminBox() {
    return document.getElementById('staff-admin-list') || document.getElementById('admin-users-list') || document.getElementById('admin-users');
  }
  async function fetchUsers() {
    var client = sb();
    if (!client) return [];
    try {
      var r = await client.from('profiles').select('*').order('created_at', { ascending: false });
      return (r && r.data) || [];
    } catch (e) {
      return [];
    }
  }
  function isStaffUser(u) {
    var r = String(u.role || '').toLowerCase();
    return r === 'admin' || r === 'agent' || r === 'staff' || r === 'developer' || r === 'owner' || isDevProfile(u);
  }
  function isEndUser(u) {
    return !isStaffUser(u);
  }
  async function renderAdminUsers(listMode) {
    listMode = listMode || window.__DR_USERS_LIST_MODE || 'endusers';
    window.__DR_USERS_LIST_MODE = listMode;
    injectCss();
    var box = adminBox();
    if (!box) return;
    box.innerHTML = '<p class="empty-state">Loading…</p>';
    var users = await fetchUsers();
    var searchEl = document.getElementById('admin-search');
    var q = searchEl ? String(searchEl.value || '').toLowerCase().trim() : '';
    var roleFilterEl = document.getElementById('admin-filter-role');
    var roleFilter = roleFilterEl ? String(roleFilterEl.value || '').toLowerCase() : '';
    var filtered = users.filter(function (u) {
      if (listMode === 'staff' && !isStaffUser(u)) return false;
      if (listMode === 'endusers' && !isEndUser(u)) return false;
      if (q) {
        var blob = ((u.full_name || u.name || '') + ' ' + (u.email || '') + ' ' + (u.username || '')).toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      if (roleFilter && roleFilter !== 'all') {
        if (roleFilter === 'pending' && getStatus(u) !== 'pending') return false;
        else if (roleFilter === 'approved' && getStatus(u) !== 'approved') return false;
        else if (roleFilter === 'developer' && !isDevProfile(u)) return false;
        else if (roleFilter === 'admin' && String(u.role || '').toLowerCase() !== 'admin' && !isDevProfile(u)) return false;
      }
      return true;
    });
    if (!filtered.length) {
      box.innerHTML = '<p class="empty-state">No users found.</p>';
      return;
    }
    var html = filtered.map(function (u) {
      var st = getStatus(u);
      var name = esc(u.full_name || u.name || u.username || 'User');
      var em = esc(u.email || '');
      var un = esc(u.username || '');
      var role = isDevProfile(u) ? '<span class="badge badge-role-developer">Developer</span>' : '<span class="badge">' + esc(roleLabel(u)) + '</span>';
      var status = '<span class="' + statusBadgeClass(st) + '">' + esc(st) + '</span>';
      var actions = '';
      if (listMode === 'staff' && !isDevProfile(u)) {
        if (st === 'pending') {
          actions = '<button type="button" class="btn btn-sm dr-v10-approve" data-id="' + esc(u.id) + '" data-username="' + un + '" data-email="' + em + '">Approve</button>' +
            '<button type="button" class="btn btn-sm dr-v10-deny" data-id="' + esc(u.id) + '" data-name="' + name + '" data-username="' + un + '" data-email="' + em + '">Deny</button>';
        } else if (st === 'approved') {
          actions = '<button type="button" class="btn btn-sm dr-v10-deny" data-id="' + esc(u.id) + '" data-name="' + name + '" data-username="' + un + '" data-email="' + em + '">Deny</button>';
        }
      }
      if (listMode === 'endusers') {
        actions = '<button type="button" class="btn btn-sm dr-v10-delete" data-id="' + esc(u.id) + '" data-name="' + name + '">Delete</button>';
      }
      return '<div class="admin-user-row" data-id="' + esc(u.id) + '">' +
        '<div class="admin-user-main"><strong>' + name + '</strong> ' + role + ' ' + status +
        '<div class="muted">' + em + (un ? ' · @' + un : '') + '</div></div>' +
        '<div class="admin-user-actions">' + actions + '</div></div>';
    }).join('');
    box.innerHTML = html;
    box.querySelectorAll('.dr-v10-delete').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name') || 'this user';
        if (!(await ask('Delete ' + name + '? This cannot be undone.'))) return;
        var r = await deleteUserProfile(id);
        if (r.error) { toast(r.error, 'error'); return; }
        toast('User deleted', 'success');
        renderAdminUsers(listMode);
      });
    });
    box.querySelectorAll('.dr-v10-approve').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        if (!isDevProfile(currentProfile())) {
          toast('Only Developers can approve accounts', 'error');
          return;
        }
        var id = btn.getAttribute('data-id');
        var r = await setStatusServer(id, 'approved', btn.getAttribute('data-username'), btn.getAttribute('data-email'));
        if (r && r.error) {
          toast('Approved locally, but server save failed: ' + r.error, 'error');
        } else {
          toast('Account approved — can sign in from any device', 'success');
        }
        renderAdminUsers('staff');
      });
    });
    box.querySelectorAll('.dr-v10-deny').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        if (!isDevProfile(currentProfile())) {
          toast('Only Developers can deny accounts', 'error');
          return;
        }
        var id = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name') || 'this user';
        if (!(await ask('Deny and delete ' + name + '? This removes the account permanently.'))) return;
        await setStatusServer(id, 'denied', btn.getAttribute('data-username'), btn.getAttribute('data-email'));
        var r = await deleteUserProfile(id);
        if (r.error) { toast(r.error, 'error'); return; }
        toast('Account denied and removed', 'success');
        renderAdminUsers('staff');
      });
    });
  }

  window.renderAdminUsers = renderAdminUsers;
  window.DRAdmin = window.DRAdmin || {};
  window.DRAdmin.renderUsers = renderAdminUsers;
  window.DRAdmin.refresh = function () { renderAdminUsers(window.__DR_USERS_LIST_MODE || 'endusers'); };

  function wireRoleFilter() {}
  function hideShowingMeta() {}
  function boot() {
    injectCss();
    wireRoleFilter();
    var ar = document.getElementById('admin-refresh');
    if (ar && !ar.__v21) { ar.__v21 = 1; ar.addEventListener('click', function () { renderAdminUsers(); }); }
    var as = document.getElementById('admin-search');
    if (as && !as.__v21) { as.__v21 = 1; as.addEventListener('input', function () { window.__drUsersPage = 0; renderAdminUsers(); }); }
    var afr = document.getElementById('admin-filter-role');
    if (afr && !afr.__v21) { afr.__v21 = 1; afr.addEventListener('change', function () { window.__drUsersPage = 0; renderAdminUsers(); }); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 800);
})();
