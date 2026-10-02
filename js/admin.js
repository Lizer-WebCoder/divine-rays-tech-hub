/**
 * Divine Rays — Admin module (no-flicker V7)
 * End-Users: customers only | Admin: staff Status/Approve/Deny
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_V7) return;
  window.__DR_ADMIN_V7 = 1;
  window.__DR_ADMIN_V6_LOADER = 99;
  window.__DR_ADMIN_V6_PATCH = 99;

  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
  var KEY = 'dr_staff_approval';

  function DR() { return window.DR || {}; }
  function sb() { return DR().sb && DR().sb(); }
  function toast(m, t) { if (DR().toast) DR().toast(m, t); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }
  function fmt(d) { return DR().fmt ? DR().fmt(d) : (d || ''); }
  function isDev(name) { return !!DEVS[String(name || '').toLowerCase().trim()]; }
  function canManage(profile) {
    if (!profile) return false;
    if (String(profile.role || '').toLowerCase() === 'admin') return true;
    return isDev(profile.username);
  }
  function mapGet() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
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
    if (isDev(u.username)) return 'approved';
    var m = mapGet();
    if (u.id && m[u.id]) return m[u.id];
    var un = String(u.username || '').toLowerCase().trim();
    var em = String(u.email || '').toLowerCase().trim();
    if (un && m['u:' + un] === 'approved') return 'approved';
    if (em && m['e:' + em] === 'approved') return 'approved';
    return 'pending';
  }
  function roleLabel(u) {
    if (isDev(u.username)) return 'Developer';
    var r = String(u.role || '').toLowerCase();
    if (r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser') return 'End-User';
    var staff = (u.staff_role || u.job_title || '').trim();
    if (staff && !/^agent$/i.test(staff) && !/^developer$/i.test(staff)) return staff;
    if (r === 'admin') return 'Admin';
    if (r === 'agent') return 'IT Tech Support';
    return u.role || '—';
  }
  function roleCls(u, label) {
    if (isDev(u.username)) return 'badge badge-role-developer';
    var r = String(u.role || '').toLowerCase();
    if (r === 'customer' || /end-user/i.test(label)) return 'badge badge-role-customer';
    if (/admin/i.test(label) && !/it tech/i.test(label)) return 'badge badge-role-admin';
    return 'badge badge-role-agent';
  }
  async function ask(msg) {
    try {
      if (window.DRDialog && DRDialog.confirm) return !!(await DRDialog.confirm(msg));
    } catch (e) {}
    return window.confirm(msg);
  }
  async function fetchAllProfiles() {
    var client = sb();
    if (!client) return [];
    var r = await client.from('profiles').select('id,full_name,role,username,email,created_at,staff_role').order('created_at', { ascending: false });
    if (r.error) {
      var r2 = await client.from('profiles').select('id,full_name,role,username,email,created_at').order('created_at', { ascending: false });
      if (r2.error) {
        var r3 = await client.from('profiles').select('id,full_name,role,username,created_at').order('created_at', { ascending: false });
        return r3.error ? [] : (r3.data || []);
      }
      return r2.data || [];
    }
    return r.data || [];
  }
  async function updateUserProfile(userId, fields) {
    var patch = {};
    if (fields.full_name !== undefined) patch.full_name = fields.full_name;
    if (fields.username !== undefined) patch.username = fields.username || null;
    if (fields.email !== undefined) patch.email = fields.email || null;
    var r = await sb().from('profiles').update(patch).eq('id', userId).select().single();
    return r.error ? { error: r.error.message } : { profile: r.data };
  }
  async function deleteUserProfile(userId) {
    var client = sb();
    try { await client.from('notifications').delete().eq('user_id', userId); } catch (e) {}
    try { await client.from('tickets').update({ assigned_to: null }).eq('assigned_to', userId); } catch (e) {}
    try { await client.from('tickets').update({ assignee_id: null }).eq('assignee_id', userId); } catch (e) {}
    var r = await client.from('profiles').delete().eq('id', userId);
    return r.error ? { error: r.error.message } : { ok: true };
  }
  async function sendPasswordReset(email) {
    if (!email) return { error: 'No email on file' };
    var r = await sb().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + window.location.pathname
    });
    return r.error ? { error: r.error.message } : { ok: true };
  }
  function ensureModal() {
    if (document.getElementById('admin-edit-modal')) return;
    var wrap = document.createElement('div');
    wrap.id = 'admin-edit-modal';
    wrap.className = 'admin-modal-overlay is-hidden';
    wrap.innerHTML =
      '<div class="admin-modal" role="dialog">' +
      '<h3>Edit user</h3>' +
      '<input type="hidden" id="admin-edit-id" />' +
      '<div class="form-group"><label>Full name</label><input type="text" id="admin-edit-name" /></div>' +
      '<div class="form-group"><label>Username</label><input type="text" id="admin-edit-username" /></div>' +
      '<div class="form-group"><label>Email</label><input type="email" id="admin-edit-email" /></div>' +
      '<div class="admin-modal-actions">' +
      '<button type="button" class="btn btn-ghost" id="admin-edit-cancel">Cancel</button>' +
      '<button type="button" class="btn btn-secondary" id="admin-edit-reset">Send reset email</button>' +
      '<button type="button" class="btn btn-primary" id="admin-edit-save">Save</button>' +
      '</div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) closeModal(); });
    document.getElementById('admin-edit-cancel').onclick = closeModal;
    document.getElementById('admin-edit-save').onclick = saveEdit;
    document.getElementById('admin-edit-reset').onclick = doResetPassword;
  }
  function openModal(user) {
    ensureModal();
    document.getElementById('admin-edit-modal').classList.remove('is-hidden');
    document.getElementById('admin-edit-id').value = user.id;
    document.getElementById('admin-edit-name').value = user.full_name || '';
    document.getElementById('admin-edit-username').value = user.username || '';
    document.getElementById('admin-edit-email').value = user.email || '';
  }
  function closeModal() {
    var m = document.getElementById('admin-edit-modal');
    if (m) m.classList.add('is-hidden');
  }
  async function saveEdit() {
    var id = document.getElementById('admin-edit-id').value;
    var full_name = document.getElementById('admin-edit-name').value.trim();
    var username = document.getElementById('admin-edit-username').value.trim();
    var email = document.getElementById('admin-edit-email').value.trim();
    if (!id || !full_name) { toast('Name is required', 'error'); return; }
    var r = await updateUserProfile(id, { full_name: full_name, username: username, email: email });
    if (r.error) { toast(r.error, 'error'); return; }
    toast('User updated', 'success');
    closeModal();
    renderAdminUsers();
  }
  async function doResetPassword() {
    var email = document.getElementById('admin-edit-email').value.trim();
    if (!email) { toast('Add an email first', 'error'); return; }
    if (!(await ask('Send password reset to ' + email + '?'))) return;
    var r = await sendPasswordReset(email);
    if (r.error) { toast(r.error, 'error'); return; }
    toast('Password reset email sent', 'success');
  }
  function injectCss() {
    if (document.getElementById('dr-admin-v7-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-admin-v7-css';
    el.textContent =
      '#view-admin > .admin-hint{display:none!important}' +
      'body.dr-view-admin-staff #search-input,body.dr-view-endusers #search-input,' +
      'body.dr-view-admin-staff #filter-status,body.dr-view-endusers #filter-status,' +
      'body.dr-view-admin-staff #filter-priority,body.dr-view-endusers #filter-priority,' +
      'body.dr-view-admin-staff #filter-sort,body.dr-view-endusers #filter-sort,' +
      'body.dr-view-admin-staff #btn-clear-filters,body.dr-view-endusers #btn-clear-filters{display:none!important}' +
      'body.dr-view-admin-staff #admin-stat-users,body.dr-view-admin-staff #admin-stat-customers,' +
      'body.dr-view-admin-staff #admin-stat-agents,body.dr-view-admin-staff .admin-stats .stat-card:not(.me){display:none!important}' +
      'body.dr-view-admin-staff .admin-stats{display:flex;gap:0.75rem;max-width:14rem}' +
      'body.dr-view-admin-staff .admin-stats .stat-card.me{flex:1;min-width:10rem}' +
      'body.dr-view-endusers #admin-stat-users,body.dr-view-endusers #admin-stat-agents,' +
      'body.dr-view-endusers #admin-stat-admins,body.dr-view-endusers .admin-stats .stat-card.me{display:none!important}' +
      '.admin-table{width:100%;border-collapse:collapse}' +
      'body.dr-view-admin-staff .admin-table th:nth-child(3),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(3),' +
      'body.dr-view-admin-staff .admin-table th:nth-child(4),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(4),' +
      'body.dr-view-admin-staff .admin-table th:nth-child(5),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(5),' +
      'body.dr-view-admin-staff .admin-table th:nth-child(6),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(6){text-align:center!important;vertical-align:middle!important}' +
      '.admin-table .admin-actions{display:inline-flex!important;align-items:center;justify-content:center;gap:0.35rem;flex-wrap:wrap}' +
      '.badge-role-customer{background:rgba(96,165,250,0.2)!important;color:#60a5fa!important}' +
      '.badge-role-developer{background:rgba(251,191,36,0.2)!important;color:#fbbf24!important}' +
      '.badge-role-admin{background:rgba(167,139,250,0.2)!important;color:#a78bfa!important}' +
      '.badge-role-agent{background:rgba(96,165,250,0.2)!important;color:#60a5fa!important}' +
      'body.dr-view-admin-staff .admin-role-select,' +
      'body.dr-view-admin-staff .admin-btn-edit,' +
      'body.dr-view-admin-staff .admin-btn-del{display:none!important}';
    (document.head || document.documentElement).appendChild(el);
  }
  function hideShowingMeta() {
    try {
      document.querySelectorAll('.topbar, header.topbar, .main > header').forEach(function (bar) {
        bar.querySelectorAll('p, span, div, small').forEach(function (n) {
          if (n.id === 'page-title' || n.closest('#page-title') || n.closest('.topbar-actions')) return;
          var tx = (n.textContent || '').replace(/\s+/g, ' ').trim();
          if (/^Showing\s+\d/i.test(tx) || (/Page\s+\d/i.test(tx) && /of|\//i.test(tx) && tx.length < 60)) {
            n.style.display = 'none';
          }
        });
      });
      document.querySelectorAll('#view-admin > .admin-hint, .admin-hint').forEach(function (h) {
        if (/Manage users and roles/i.test(h.textContent || '')) h.style.display = 'none';
      });
    } catch (e) {}
  }
  function showAdminView() {
    try {
      var v = document.getElementById('view-admin');
      if (!v) return;
      document.querySelectorAll('#portal-agent .view').forEach(function (x) {
        x.classList.remove('active');
        try { x.style.display = 'none'; } catch (e) {}
      });
      v.classList.add('active');
      v.style.display = '';
    } catch (e) {}
  }

  var _renderToken = 0;

  async function renderAdminUsers(mode) {
    injectCss();
    hideShowingMeta();
    var profile = (DR().getProfile && DR().getProfile()) || window.__drProfile || null;
    if (!canManage(profile)) { toast('Admin only', 'error'); return; }
    if (mode === 'endusers' || mode === 'staff') window.__DR_USERS_LIST_MODE = mode;
    var listMode = window.__DR_USERS_LIST_MODE || 'staff';
    if (listMode === 'endusers') {
      document.body.classList.add('dr-view-endusers');
      document.body.classList.remove('dr-view-admin-staff');
    } else {
      document.body.classList.add('dr-view-admin-staff');
      document.body.classList.remove('dr-view-endusers');
    }
    ensureModal();
    showAdminView();
    var box = document.getElementById('admin-users-list');
    if (!box) return;

    var token = ++_renderToken;
    box.innerHTML = '<div class="empty-state"><p>Loading users…</p></div>';

    var users = await fetchAllProfiles();
    if (token !== _renderToken) return;

    var q = ((document.getElementById('admin-search') || {}).value || '').toLowerCase().trim();
    var roleFilter = (document.getElementById('admin-filter-role') || {}).value || '';
    var filtered = users.filter(function (u) {
      var r = String(u.role || '').toLowerCase();
      if (listMode === 'endusers') {
        if (r !== 'customer' && r !== 'user' && r !== 'end-user' && r !== 'enduser') return false;
      } else {
        if (r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser') return false;
        if (r !== 'admin' && r !== 'agent' && r !== 'developer' && !isDev(u.username)) return false;
      }
      if (roleFilter && u.role !== roleFilter) return false;
      if (!q) return true;
      return ((u.full_name || '') + ' ' + (u.username || '') + ' ' + (u.email || '') + ' ' + (u.role || '') + ' ' + (u.staff_role || '')).toLowerCase().indexOf(q) !== -1;
    });

    var counts = { customer: 0, agent: 0, admin: 0 };
    users.forEach(function (u) {
      var r = String(u.role || '').toLowerCase();
      if (r === 'customer' || r === 'user') counts.customer++;
      else if (r === 'agent') counts.agent++;
      else if (r === 'admin') counts.admin++;
    });
    var el;
    el = document.getElementById('admin-stat-users'); if (el) el.textContent = users.length;
    el = document.getElementById('admin-stat-customers'); if (el) el.textContent = counts.customer;
    el = document.getElementById('admin-stat-agents'); if (el) el.textContent = counts.agent;
    el = document.getElementById('admin-stat-admins'); if (el) el.textContent = counts.admin;

    if (!filtered.length) {
      box.innerHTML = '<p class="empty-state" style="padding:1rem">' +
        (listMode === 'endusers' ? 'No end-users found.' : 'No staff accounts found.') + '</p>';
      return;
    }

    var viewerDev = profile && isDev(profile.username);
    window.__adminUsersCache = users;
    window.__adminUsersListMode = listMode;

    if (listMode === 'endusers') {
      box.innerHTML =
        '<table class="perf-table admin-table"><thead><tr>' +
        '<th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Actions</th>' +
        '</tr></thead><tbody>' +
        filtered.map(function (u) {
          var mine = profile && u.id === profile.id;
          var label = roleLabel(u);
          var actions = '<div class="admin-actions">' +
            '<button type="button" class="btn btn-ghost btn-sm admin-btn-edit" data-id="' + u.id + '">Edit</button>' +
            (mine ? '' : '<button type="button" class="btn btn-danger btn-sm admin-btn-del" data-id="' + u.id +
              '" data-name="' + esc(u.full_name || u.username || 'user') + '">Delete</button>') +
            '</div>';
          return '<tr data-id="' + esc(u.id) + '">' +
            '<td>' + esc(u.full_name || 'User') + (mine ? ' <span class="you-tag">you</span>' : '') + '</td>' +
            '<td>' + esc(u.username || '—') + '</td>' +
            '<td><span class="' + roleCls(u, label) + '">' + esc(label) + '</span></td>' +
            '<td>' + fmt(u.created_at) + '</td>' +
            '<td class="admin-actions-cell">' + actions + '</td></tr>';
        }).join('') + '</tbody></table>';
    } else {
      box.innerHTML =
        '<table class="perf-table admin-table"><thead><tr>' +
        '<th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>' +
        '</tr></thead><tbody>' +
        filtered.map(function (u) {
          var mine = profile && u.id === profile.id;
          var dev = isDev(u.username);
          var st = getStatus(u);
          var label = roleLabel(u);
          var statusHtml, actionHtml;
          if (dev) {
            statusHtml = '<span class="badge badge-role-developer">Developer</span>';
            actionHtml = '';
          } else if (st === 'approved') {
            statusHtml = '<span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399">Approved</span>';
            actionHtml = '';
          } else {
            statusHtml = '<span class="badge" style="background:rgba(251,146,60,0.2);color:#fb923c">Pending</span>';
            actionHtml = viewerDev
              ? '<button type="button" class="btn btn-sm btn-primary dr-v7-approve" data-id="' + esc(u.id) +
                '" data-username="' + esc(u.username || '') + '" data-email="' + esc(u.email || '') + '">Approve</button>' +
                '<button type="button" class="btn btn-danger btn-sm dr-v7-deny" data-id="' + esc(u.id) +
                '" data-username="' + esc(u.username || '') + '" data-email="' + esc(u.email || '') +
                '" data-name="' + esc(u.full_name || u.username || 'user') + '">Deny</button>'
              : '<span style="opacity:0.65;font-size:0.8rem">Developer only</span>';
          }
          return '<tr data-id="' + esc(u.id) + '">' +
            '<td>' + esc(u.full_name || 'User') + (mine ? ' <span class="you-tag">you</span>' : '') + '</td>' +
            '<td>' + esc(u.username || '—') + '</td>' +
            '<td><span class="' + roleCls(u, label) + '">' + esc(label) + '</span></td>' +
            '<td>' + fmt(u.created_at) + '</td>' +
            '<td class="admin-status-cell">' + statusHtml + '</td>' +
            '<td class="admin-actions-cell"><div class="admin-actions">' + actionHtml + '</div></td></tr>';
        }).join('') + '</tbody></table>';
    }

    if (token !== _renderToken) return;

    box.querySelectorAll('.admin-btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var u = (window.__adminUsersCache || []).find(function (x) { return x.id === btn.getAttribute('data-id'); });
        if (u) openModal(u);
      });
    });
    box.querySelectorAll('.admin-btn-del').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name') || 'this user';
        if (!(await ask('Delete ' + name + '?'))) return;
        btn.disabled = true;
        var r = await deleteUserProfile(id);
        if (r.error) { toast(r.error, 'error'); btn.disabled = false; return; }
        toast('User profile deleted', 'success');
        renderAdminUsers();
      });
    });
    box.querySelectorAll('.dr-v7-approve').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        if (!viewerDev) return;
        if (!(await ask('Approve this account? They can sign in to the agent portal.'))) return;
        setStatus(btn.getAttribute('data-id'), 'approved', btn.getAttribute('data-username'), btn.getAttribute('data-email'));
        toast('Account approved', 'success');
        renderAdminUsers('staff');
      });
    });
    box.querySelectorAll('.dr-v7-deny').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        if (!viewerDev) return;
        var name = btn.getAttribute('data-name') || 'this account';
        if (!(await ask('Deny and permanently remove ' + name + '?'))) return;
        var id = btn.getAttribute('data-id');
        setStatus(id, 'disapproved', btn.getAttribute('data-username'), btn.getAttribute('data-email'));
        btn.disabled = true;
        var r = await deleteUserProfile(id);
        if (r.error) { toast('Denied locally, delete failed: ' + r.error, 'error'); btn.disabled = false; return; }
        toast('Account denied and removed', 'success');
        renderAdminUsers('staff');
      });
    });
  }

  window.renderAdminUsers = renderAdminUsers;
  window.renderAdminUsers.__drV7 = 1;

  function bindChrome() {
    var ar = document.getElementById('btn-admin-refresh');
    if (ar && !ar.__v7) { ar.__v7 = 1; ar.addEventListener('click', function () { renderAdminUsers(); }); }
    var as = document.getElementById('admin-search');
    if (as && !as.__v7) { as.__v7 = 1; as.addEventListener('input', function () { renderAdminUsers(); }); }
    var afr = document.getElementById('admin-filter-role');
    if (afr && !afr.__v7) { afr.__v7 = 1; afr.addEventListener('change', function () { renderAdminUsers(); }); }
  }

  function boot() {
    injectCss();
    hideShowingMeta();
    bindChrome();
    setInterval(function () {
      injectCss();
      hideShowingMeta();
      bindChrome();
      if (typeof window.renderAdminUsers === 'function' && !window.renderAdminUsers.__drV7) {
        window.renderAdminUsers = renderAdminUsers;
        window.renderAdminUsers.__drV7 = 1;
      }
    }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
