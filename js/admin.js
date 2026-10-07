/**
 * Divine Rays — Admin V13 — centered pager, no range text
 * End-Users: customers only | Admin: staff Status/Approve/Deny (deny deletes)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_V13) return;
  window.__DR_ADMIN_V13 = 1;
  window.__DR_ADMIN_V12 = 1;
  window.__DR_ADMIN_V10 = 1;

  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
  var KEY = 'dr_staff_approval';

  function DR() { return window.DR || {}; }
  function sb() { return DR().sb && DR().sb(); }
  function toast(m, t) { if (DR().toast) DR().toast(m, t); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
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
    var lab = String(label || '').toLowerCase();
    if (r === 'customer' || /end-user/i.test(lab)) return 'badge badge-role-customer';
    if (/owner/i.test(lab)) return 'badge badge-role-owner';
    if (/admin/i.test(lab) && !/it tech/i.test(lab)) return 'badge badge-role-admin';
    if (/developer/i.test(lab)) return 'badge badge-role-developer';
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
      '<div class="admin-modal" role="dialog"><h3>Edit user</h3>' +
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
  function ensureRoleFilterOptions() {
    var sel = document.getElementById('admin-filter-role');
    if (!sel) return;
    var want = [
      { v: '', t: 'All roles' }, { v: 'admin', t: 'Admin' },
      { v: 'it_tech_support', t: 'IT Tech Support' }, { v: 'owner', t: 'Owner' },
      { v: 'developer', t: 'Developer' }
    ];
    var cur = sel.value;
    sel.innerHTML = want.map(function (x) {
      return '<option value="' + x.v + '">' + x.t + '</option>';
    }).join('');
    sel.value = want.some(function (x) { return x.v === cur; }) ? cur : '';
  }
  function injectCss() {
    var el = document.getElementById('dr-admin-v10-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-admin-v10-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent =
      '#view-admin > .admin-hint{display:none!important}' +
      'body.dr-view-admin-staff #filter-hint,body.dr-view-endusers #filter-hint{display:none!important}' +
      'body.dr-view-admin-staff #dr-ticket-pager,body.dr-view-endusers #dr-ticket-pager{display:none!important}' +
      'body.dr-view-admin-staff .dr-users-pager,body.dr-view-endusers .dr-users-pager{display:flex!important;justify-content:center!important;width:100%!important}' +
      'body.dr-view-admin-staff #search-input,body.dr-view-endusers #search-input,' +
      'body.dr-view-admin-staff #filter-status,body.dr-view-endusers #filter-status,' +
      'body.dr-view-admin-staff #filter-priority,body.dr-view-endusers #filter-priority,' +
      'body.dr-view-admin-staff #filter-sort,body.dr-view-endusers #filter-sort,' +
      'body.dr-view-admin-staff #btn-clear-filters,body.dr-view-endusers #btn-clear-filters{display:none!important}' +
      'body.dr-view-admin-staff .admin-stats .stat-card{display:none!important}' +
      'body.dr-view-admin-staff .admin-stats .stat-card.dr-stat-admins,' +
      'body.dr-view-admin-staff .admin-stats .stat-card.me{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;min-width:10rem!important}' +
      'body.dr-view-admin-staff .admin-stats{display:flex!important;gap:0.75rem!important;max-width:14rem!important}' +
      'body.dr-view-endusers .admin-stats .stat-card{display:none!important}' +
      'body.dr-view-endusers .admin-stats .stat-card:nth-child(2),' +
      'body.dr-view-endusers .admin-stats .stat-card.dr-stat-endusers{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;min-width:10rem!important}' +
      '.admin-table{width:100%;border-collapse:collapse}' +
      'body.dr-view-admin-staff .admin-table th:nth-child(3),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(3),' +
      'body.dr-view-admin-staff .admin-table th:nth-child(4),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(4),' +
      'body.dr-view-admin-staff .admin-table th:nth-child(5),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(5),' +
      'body.dr-view-admin-staff .admin-table th:nth-child(6),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(6){text-align:center!important}' +
      '.admin-table .admin-actions{display:inline-flex!important;align-items:center;justify-content:center;gap:0.35rem;flex-wrap:wrap}' +
      '.badge-role-admin{background:rgba(45,212,191,0.22)!important;color:#2dd4bf!important}' +
      '.badge-role-developer{background:rgba(251,191,36,0.2)!important;color:#fbbf24!important}' +
      '.badge-role-owner{background:rgba(244,114,182,0.22)!important;color:#f472b6!important}' +
      'body.dr-view-admin-staff .admin-role-select,' +
      'body.dr-view-admin-staff .admin-btn-edit,' +
      'body.dr-view-admin-staff .admin-btn-del{display:none!important}';
  }
  function hideShowingMeta() {
    try {
      var fh = document.getElementById('filter-hint');
      if (fh && (document.body.classList.contains('dr-view-admin-staff') || document.body.classList.contains('dr-view-endusers'))) {
        fh.style.display = 'none'; fh.textContent = '';
      }
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
    ensureRoleFilterOptions();
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
      if (roleFilter) {
        var lab = roleLabel(u).toLowerCase();
        var staff = String(u.staff_role || u.job_title || '').toLowerCase().trim();
        if (roleFilter === 'admin') {
          if (!(r === 'admin' || lab === 'admin') || /it tech/i.test(lab) || isDev(u.username)) return false;
        } else if (roleFilter === 'developer') {
          if (!isDev(u.username) && lab !== 'developer' && staff !== 'developer' && r !== 'developer') return false;
        } else if (roleFilter === 'it_tech_support') {
          if (!(/it tech/i.test(lab) || staff === 'it tech support' || (r === 'agent' && !isDev(u.username) && lab !== 'admin'))) return false;
        } else if (roleFilter === 'owner') {
          if (!(lab === 'owner' || staff === 'owner' || /owner/i.test(staff))) return false;
        } else if (u.role !== roleFilter && lab !== roleFilter) return false;
      }
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
    var PAGE_SIZE = 10;
    if (window.__drUsersPage == null || typeof window.__drUsersPage !== 'number') window.__drUsersPage = 0;
    if (window.__drUsersPageMode !== listMode) { window.__drUsersPage = 0; window.__drUsersPageMode = listMode; }
    var totalUsers = filtered.length;
    var totalPages = totalUsers > PAGE_SIZE ? Math.ceil(totalUsers / PAGE_SIZE) : 1;
    if (totalPages < 1) totalPages = 1;
    if (window.__drUsersPage > totalPages - 1) window.__drUsersPage = totalPages - 1;
    if (window.__drUsersPage < 0) window.__drUsersPage = 0;
    var pageStart = window.__drUsersPage * PAGE_SIZE;
    var pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);
    var pagerHtml =
      '<div class="dr-users-pager" id="dr-users-pager" style="display:flex!important;align-items:center;justify-content:center;gap:0.5rem;margin:0.85rem 0 0.35rem;flex-wrap:wrap;width:100%">' +
      '<button type="button" class="dr-page-btn" id="dr-users-page-prev" aria-label="Previous page"' +
      (window.__drUsersPage <= 0 || totalPages <= 1 ? ' disabled' : '') + '>← Prev</button>' +
      '<span class="dr-page-info" id="dr-users-page-info">Page ' + (window.__drUsersPage + 1) + ' of ' + totalPages + '</span>' +
      '<button type="button" class="dr-page-btn" id="dr-users-page-next" aria-label="Next page"' +
      (window.__drUsersPage >= totalPages - 1 || totalPages <= 1 ? ' disabled' : '') + '>Next →</button>' +
      '</div>';
    if (listMode === 'endusers') {
      box.innerHTML =
        '<table class="perf-table admin-table"><thead><tr>' +
        '<th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Actions</th>' +
        '</tr></thead><tbody>' +
        pageRows.map(function (u) {
          var mine = profile && u.id === profile.id;
          var label = roleLabel(u);
          var actions = '<div class="admin-actions">' +
            '<button type="button" class="btn btn-ghost btn-sm admin-btn-edit" data-id="' + u.id + '">Edit</button>' +
            '<button type="button" class="btn btn-danger btn-sm admin-btn-del" data-id="' + u.id +
            '" data-name="' + esc(u.full_name || u.username || 'user') + '">Delete</button></div>';
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
        pageRows.map(function (u) {
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
              ? '<button type="button" class="btn btn-sm btn-primary dr-v10-approve" data-id="' + esc(u.id) +
                '" data-username="' + esc(u.username || '') + '" data-email="' + esc(u.email || '') + '">Approve</button>' +
                '<button type="button" class="btn btn-danger btn-sm dr-v10-deny" data-id="' + esc(u.id) +
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
    if (pagerHtml) {
      box.insertAdjacentHTML('beforeend', pagerHtml);
      var prevB = document.getElementById('dr-users-page-prev');
      var nextB = document.getElementById('dr-users-page-next');
      if (prevB && !prevB.__drBound) {
        prevB.__drBound = true;
        prevB.addEventListener('click', function () {
          if (window.__drUsersPage > 0) {
            window.__drUsersPage -= 1;
            renderAdminUsers(window.__DR_USERS_LIST_MODE || listMode);
          }
        });
      }
      if (nextB && !nextB.__drBound) {
        nextB.__drBound = true;
        nextB.addEventListener('click', function () {
          window.__drUsersPage = (window.__drUsersPage || 0) + 1;
          renderAdminUsers(window.__DR_USERS_LIST_MODE || listMode);
        });
      }
    }
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
        if (!(await ask('Delete ' + name + '? This cannot be undone.'))) return;
        var r = await deleteUserProfile(id);
        if (r.error) { toast(r.error, 'error'); return; }
        toast('User deleted', 'success');
        renderAdminUsers(listMode);
      });
    });
    box.querySelectorAll('.dr-v10-approve').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setStatus(btn.getAttribute('data-id'), 'approved', btn.getAttribute('data-username'), btn.getAttribute('data-email'));
        toast('Account approved', 'success');
        renderAdminUsers('staff');
      });
    });
    box.querySelectorAll('.dr-v10-deny').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name') || 'this user';
        if (!(await ask('Deny and delete ' + name + '?'))) return;
        setStatus(id, 'denied', btn.getAttribute('data-username'), btn.getAttribute('data-email'));
        var r = await deleteUserProfile(id);
        if (r.error) { toast(r.error, 'error'); return; }
        toast('Account denied and removed', 'success');
        renderAdminUsers('staff');
      });
    });
  }
  window.renderAdminUsers = renderAdminUsers;
  window.renderAdminUsers.__drV10 = 1;
  function wire() {
    var ar = document.getElementById('admin-refresh');
    if (ar && !ar.__v10) { ar.__v10 = 1; ar.addEventListener('click', function () { renderAdminUsers(); }); }
    var as = document.getElementById('admin-search');
    if (as && !as.__v10) { as.__v10 = 1; as.addEventListener('input', function () { window.__drUsersPage = 0; renderAdminUsers(); }); }
    var afr = document.getElementById('admin-filter-role');
    if (afr && !afr.__v10) { afr.__v10 = 1; afr.addEventListener('change', function () { window.__drUsersPage = 0; renderAdminUsers(); }); }
  }
  function boot() { wire(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
})();
