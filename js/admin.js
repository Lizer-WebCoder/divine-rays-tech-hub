/**
 * Divine Rays — Admin V19 — Developer gold badges; Roles match sidebar
 * End-Users: customers only | Admin: staff Status/Approve/Deny (deny deletes)
 * Pending stays listed until Approve or Deny; Deny deletes profile.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_V19) return;
  window.__DR_ADMIN_V19 = 1;

  var DEVS = { kirzhian: 1, kirzhianquijano: 1, jamesjerlow123: 1, liya: 1 };
  var DEV_EMAILS = { 'kirzhianquijano@gmail.com': 1 };
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
  function getStatus(u) {
    if (!u) return 'pending';
    if (isDev(u.username) || isDev(u.email)) return 'approved';
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
  function roleLabel(u) {
    if (isDev(u.username) || isDev(u.email)) return 'Developer';
    var staff = (u && (u.staff_role || u.job_title)) || '';
    if (staff) return staff;
    if (u && u.role === 'admin') return 'Admin';
    if (u && u.role === 'agent') return 'IT Tech Support';
    return (u && u.role) || '—';
  }
  function roleBadgeClass(u) {
    if (isDev(u.username) || isDev(u.email)) return 'badge badge-role-developer';
    var st = getStatus(u);
    if (st === 'pending') return 'badge badge-role-pending';
    if (/admin/i.test(roleLabel(u))) return 'badge badge-role-admin';
    return 'badge badge-role-agent';
  }
  function isStaffUser(u) {
    if (!u) return false;
    if (isDev(u.username) || isDev(u.email)) return true;
    var r = String(u.role || '').toLowerCase();
    return r === 'admin' || r === 'agent' || r === 'developer' || r === 'owner' || r === 'staff';
  }
  function isCustomerUser(u) {
    if (!u) return true;
    if (isStaffUser(u)) return false;
    var r = String(u.role || '').toLowerCase();
    return r === 'customer' || r === 'user' || r === 'end-user' || r === 'employee' || !r;
  }
  async function deleteUserProfile(userId) {
    var client = sb();
    if (!client) return { error: 'Not connected' };
    try { await client.from('notifications').delete().eq('user_id', userId); } catch (e) {}
    try {
      var r = await client.from('profiles').delete().eq('id', userId);
      if (r && r.error) return { error: r.error.message || 'Delete failed' };
      return { ok: true };
    } catch (e) {
      return { error: e.message || 'Delete failed' };
    }
  }
  function injectCss() {
    if (document.getElementById('dr-admin-v19-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-admin-v19-css';
    s.textContent = [
      '.badge-role-developer{background:rgba(251,191,36,0.2)!important;color:#fbbf24!important;border:1px solid rgba(251,191,36,0.35)}',
      '.badge-role-pending{background:rgba(251,146,60,0.2)!important;color:#fb923c!important}',
      '.badge-role-admin{background:rgba(167,139,250,0.2)!important;color:#a78bfa!important}',
      '.badge-role-agent{background:rgba(96,165,250,0.2)!important;color:#60a5fa!important}',
      '#staff-admin-list .dr-v10-approve,#admin-users-list .dr-v10-approve{margin-right:0.35rem}'
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
    return document.getElementById('staff-admin-list') || document.getElementById('admin-users-list');
  }
  function hideShowingMeta() {
    try {
      var meta = document.querySelector('#view-admin .showing-meta, #view-admin .list-meta');
      if (meta) meta.style.display = 'none';
    } catch (e) {}
  }
  function wireRoleFilter() {
    var afr = document.getElementById('admin-filter-role');
    if (!afr || afr.__v19) return;
    afr.__v19 = 1;
  }

  async function loadProfiles() {
    var client = sb();
    if (!client) return [];
    try {
      var r = await client.from('profiles').select('*').order('created_at', { ascending: false });
      if (r.error) { console.warn(r.error); return []; }
      return r.data || [];
    } catch (e) {
      console.warn(e);
      return [];
    }
  }

  async function renderAdminUsers(mode) {
    injectCss();
    var listMode = mode || window.__DR_USERS_LIST_MODE || 'endusers';
    window.__DR_USERS_LIST_MODE = listMode;
    var profile = currentProfile();
    if (!canManage(profile)) { toast('Admin only', 'error'); return; }
    var box = adminBox();
    if (!box) return;

    var users = await loadProfiles();
    var q = '';
    try {
      var search = document.getElementById('admin-search');
      if (search) q = String(search.value || '').toLowerCase().trim();
    } catch (e) {}
    var roleFilter = '';
    try {
      var afr = document.getElementById('admin-filter-role');
      if (afr) roleFilter = String(afr.value || '').toLowerCase().trim();
    } catch (e2) {}

    users = users.filter(function (u) {
      var isStaff = isStaffUser(u);
      var isCust = isCustomerUser(u);
      if (listMode === 'endusers' || listMode === 'customers') {
        if (!isCust) return false;
      } else {
        if (!isStaff && !isDev(u.username) && !isDev(u.email)) return false;
      }
      if (q) {
        var hay = ((u.full_name || '') + ' ' + (u.username || '') + ' ' + (u.email || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      if (roleFilter) {
        var r = String(roleLabel(u) || '').toLowerCase();
        if (roleFilter === 'pending' && getStatus(u) !== 'pending') return false;
        else if (roleFilter === 'approved' && getStatus(u) !== 'approved') return false;
        else if (r !== roleFilter && !(roleFilter === 'developer' && (isDev(u.username) || isDev(u.email)))) return false;
      }
      return true;
    });

    var pageSize = 20;
    var page = window.__drUsersPage || 0;
    var total = users.length;
    var pages = Math.max(1, Math.ceil(total / pageSize));
    if (page >= pages) page = pages - 1;
    if (page < 0) page = 0;
    window.__drUsersPage = page;
    var slice = users.slice(page * pageSize, page * pageSize + pageSize);
    var viewerDev = isDevProfile(profile);

    var rows = slice.map(function (u) {
      var st = getStatus(u);
      var dev = isDev(u.username) || isDev(u.email);
      var statusHtml = '';
      var actionHtml = '';
      if (listMode === 'staff' || listMode === 'admin') {
        if (dev) {
          statusHtml = '<span class="badge badge-role-developer">Developer</span>';
          actionHtml = '';
        } else if (st === 'approved') {
          statusHtml = '<span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399">Approved</span>';
          actionHtml = viewerDev
            ? '<button type="button" class="btn btn-ghost btn-sm dr-v10-deny" data-id="' + esc(u.id) + '" data-username="' + esc(u.username || '') + '" data-email="' + esc(u.email || '') + '" data-name="' + esc(u.full_name || u.username || 'user') + '">Deny</button>'
            : '';
        } else {
          statusHtml = '<span class="badge" style="background:rgba(251,146,60,0.2);color:#fb923c">Pending</span>';
          actionHtml = viewerDev
            ? '<button type="button" class="btn btn-sm btn-primary dr-v10-approve" data-id="' + esc(u.id) + '" data-username="' + esc(u.username || '') + '" data-email="' + esc(u.email || '') + '">Approve</button><button type="button" class="btn btn-danger btn-sm dr-v10-deny" data-id="' + esc(u.id) + '" data-username="' + esc(u.username || '') + '" data-email="' + esc(u.email || '') + '" data-name="' + esc(u.full_name || u.username || 'user') + '">Deny</button>'
            : '<span style="opacity:0.65;font-size:0.8rem">Developer only</span>';
        }
      } else {
        statusHtml = '<span class="badge">Active</span>';
        actionHtml = viewerDev
          ? '<button type="button" class="btn btn-danger btn-sm dr-v10-del" data-id="' + esc(u.id) + '" data-name="' + esc(u.full_name || u.username || 'user') + '">Delete</button>'
          : '';
      }
      return (
        '<tr data-user-id="' + esc(u.id) + '">' +
        '<td>' + esc(u.full_name || u.username || '—') + '</td>' +
        '<td>' + esc(u.email || u.username || '—') + '</td>' +
        '<td><span class="' + roleBadgeClass(u) + '">' + esc(roleLabel(u)) + '</span></td>' +
        '<td>' + statusHtml + '</td>' +
        '<td>' + actionHtml + '</td>' +
        '</tr>'
      );
    }).join('');

    box.innerHTML =
      '<div class="table-wrap"><table class="data-table"><thead><tr>' +
      '<th>Name</th><th>Email / Username</th><th>Role</th><th>Status</th><th>Actions</th>' +
      '</tr></thead><tbody>' +
      (rows || '<tr><td colspan="5" style="opacity:0.7">No users found</td></tr>') +
      '</tbody></table></div>' +
      '<div class="pager" style="display:flex;gap:0.5rem;align-items:center;margin-top:0.75rem">' +
      '<button type="button" class="btn btn-ghost btn-sm" id="dr-users-prev">Prev</button>' +
      '<span style="opacity:0.8;font-size:0.85rem">Page ' + (page + 1) + ' / ' + pages + ' · ' + total + ' users</span>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="dr-users-next">Next</button></div>';

    var prev = document.getElementById('dr-users-prev');
    var next = document.getElementById('dr-users-next');
    if (prev) {
      prev.onclick = function () {
        if (window.__drUsersPage > 0) { window.__drUsersPage -= 1; renderAdminUsers(window.__DR_USERS_LIST_MODE || listMode); }
      };
    }
    if (next) {
      next.onclick = function () {
        window.__drUsersPage = (window.__drUsersPage || 0) + 1;
        renderAdminUsers(window.__DR_USERS_LIST_MODE || listMode);
      };
    }

    box.querySelectorAll('.dr-v10-del').forEach(function (btn) {
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
      btn.addEventListener('click', function () {
        if (!isDevProfile(currentProfile())) {
          toast('Only Developers can approve accounts', 'error');
          return;
        }
        setStatus(btn.getAttribute('data-id'), 'approved', btn.getAttribute('data-username'), btn.getAttribute('data-email'));
        toast('Account approved — can sign in', 'success');
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
        setStatus(id, 'denied', btn.getAttribute('data-username'), btn.getAttribute('data-email'));
        var r = await deleteUserProfile(id);
        if (r.error) { toast(r.error, 'error'); return; }
        toast('Account denied and removed', 'success');
        renderAdminUsers('staff');
      });
    });
    hideShowingMeta();
  }

  window.renderAdminUsers = renderAdminUsers;
  window.DRAdmin = window.DRAdmin || {};
  window.DRAdmin.renderUsers = renderAdminUsers;
  window.DRAdmin.refresh = function () { renderAdminUsers(window.__DR_USERS_LIST_MODE || 'endusers'); };

  function boot() {
    injectCss();
    wireRoleFilter();
    var ar = document.getElementById('admin-refresh');
    if (ar && !ar.__v19) { ar.__v19 = 1; ar.addEventListener('click', function () { renderAdminUsers(); }); }
    var as = document.getElementById('admin-search');
    if (as && !as.__v19) { as.__v19 = 1; as.addEventListener('input', function () { window.__drUsersPage = 0; renderAdminUsers(); }); }
    var afr = document.getElementById('admin-filter-role');
    if (afr && !afr.__v19) { afr.__v19 = 1; afr.addEventListener('change', function () { window.__drUsersPage = 0; renderAdminUsers(); }); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
  setInterval(function () {
    try {
      if (window.renderAdminUsers !== renderAdminUsers) window.renderAdminUsers = renderAdminUsers;
      var view = document.getElementById('view-admin');
      if (view && view.classList.contains('active')) {
        /* keep bindings */
      }
    } catch (e) {}
  }, 1500);
})();
