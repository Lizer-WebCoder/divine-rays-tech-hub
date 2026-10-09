/**
 * Divine Rays — Admin V16 — pager always; Actions restored; Approve/Deny gate keys
 * End-Users: customers only | Admin: staff Status/Approve/Deny (deny deletes)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_V16) return;
  window.__DR_ADMIN_V16 = 1;
  window.__DR_ADMIN_V15 = 1;
  window.__DR_ADMIN_V14 = 1;
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
    try { await client.from('tickets').update({ assignee_id: null }).eq('assignee_id', userId); } catch (e) {}
    var r = await client.from('profiles').delete().eq('id', userId);
    return r.error ? { error: r.error.message } : { ok: true };
  }
  function ensureModal() {
    if (document.getElementById('admin-edit-modal')) return;
    var wrap = document.createElement('div');
    wrap.id = 'admin-edit-modal';
    wrap.className = 'admin-modal-backdrop is-hidden';
    wrap.innerHTML =
      '<div class="admin-modal" role="dialog"><h3>Edit user</h3>' +
      '<label>Full name<input type="text" id="admin-edit-name" /></label>' +
      '<label>Username<input type="text" id="admin-edit-username" /></label>' +
      '<label>Email<input type="email" id="admin-edit-email" /></label>' +
      '<div class="admin-modal-actions">' +
      '<button type="button" class="btn btn-ghost" id="admin-edit-cancel">Cancel</button>' +
      '<button type="button" class="btn btn-primary" id="admin-edit-save">Save</button></div></div>';
    document.body.appendChild(wrap);
    document.getElementById('admin-edit-cancel').onclick = closeModal;
    document.getElementById('admin-edit-save').onclick = saveEdit;
  }
  var _editId = null;
  function openModal(u) {
    ensureModal();
    _editId = u.id;
    document.getElementById('admin-edit-name').value = u.full_name || '';
    document.getElementById('admin-edit-username').value = u.username || '';
    document.getElementById('admin-edit-email').value = u.email || '';
    document.getElementById('admin-edit-modal').classList.remove('is-hidden');
  }
  function closeModal() {
    var m = document.getElementById('admin-edit-modal');
    if (m) m.classList.add('is-hidden');
    _editId = null;
  }
  async function saveEdit() {
    if (!_editId) return;
    var r = await updateUserProfile(_editId, {
      full_name: document.getElementById('admin-edit-name').value.trim(),
      username: document.getElementById('admin-edit-username').value.trim(),
      email: document.getElementById('admin-edit-email').value.trim()
    });
    if (r.error) { toast(r.error, 'error'); return; }
    toast('Saved', 'success');
    closeModal();
    renderAdminUsers(window.__DR_USERS_LIST_MODE || 'endusers');
  }
  function wireRoleFilter() {
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
    var el = document.getElementById('dr-admin-v16-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-admin-v16-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent =
      '#view-admin .admin-hint,#view-admin > .admin-hint,#view-admin .page-sub,' +
      '#view-admin .view-sub,#view-admin .section-desc,#view-admin p.muted,' +
      '#view-admin .admin-desc{display:none!important}' +
      'body.dr-view-admin-staff .page-title + p,body.dr-view-endusers .page-title + p,' +
      'body.dr-view-admin-staff h1 + p,body.dr-view-endusers h1 + p,' +
      'body.dr-view-admin-staff h2 + p,body.dr-view-endusers h2 + p{display:none!important}' +
      'body.dr-view-admin-staff #filter-hint,body.dr-view-endusers #filter-hint{display:none!important}' +
      'body.dr-view-admin-staff #dr-ticket-pager,body.dr-view-endusers #dr-ticket-pager{display:none!important}' +
      'body.dr-view-admin-staff .dr-users-pager,body.dr-view-endusers .dr-users-pager{' +
      'display:flex!important;justify-content:center!important;align-items:center!important;' +
      'width:100%!important;margin:1.1rem 0 0.25rem!important;padding:0.35rem 0!important;' +
      'background:transparent!important;border:none!important;box-shadow:none!important}' +
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
      'body.dr-view-endusers .admin-table th:nth-child(3),' +
      'body.dr-view-endusers .admin-table td:nth-child(3),' +
      'body.dr-view-endusers .admin-table th:nth-child(4),' +
      'body.dr-view-endusers .admin-table td:nth-child(4),' +
      'body.dr-view-endusers .admin-table th:nth-child(5),' +
      'body.dr-view-endusers .admin-table td:nth-child(5){text-align:center!important}' +
      '.admin-table .admin-actions{display:inline-flex!important;align-items:center;justify-content:center;gap:0.35rem;flex-wrap:wrap}' +
      'body.dr-view-admin-staff .admin-role-select,' +
      'body.dr-view-admin-staff .admin-btn-edit,' +
      'body.dr-view-admin-staff .admin-btn-del{display:none!important}' +
      '.admin-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center}' +
      '.admin-modal-backdrop.is-hidden{display:none}' +
      '.admin-modal{background:#1a1530;padding:1.25rem;border-radius:12px;min-width:280px;max-width:90vw;display:flex;flex-direction:column;gap:.75rem}' +
      '.admin-modal label{display:flex;flex-direction:column;gap:.25rem;font-size:.85rem}' +
      '.admin-modal-actions{display:flex;gap:.5rem;justify-content:flex-end}';
  }
  function hideShowingMeta() {
    try {
      var onUsers = document.body.classList.contains('dr-view-admin-staff') || document.body.classList.contains('dr-view-endusers');
      if (!onUsers) return;
      var fh = document.getElementById('filter-hint');
      if (fh) { fh.style.display = 'none'; fh.textContent = ''; }
      var root = document.getElementById('view-admin') || document.body;
      var nodes = root.querySelectorAll('p, .admin-hint, .page-sub, .view-sub, .section-desc, .muted, .hint, .meta');
      for (var i = 0; i < nodes.length; i++) {
        var tx = (nodes[i].textContent || '').trim();
        if (/Manage users and roles/i.test(tx) || /^Showing\s+\d/i.test(tx) || /Only admins can change roles/i.test(tx)) {
          nodes[i].style.display = 'none';
          nodes[i].textContent = '';
        }
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
    wireRoleFilter();
    var profile = (DR().getProfile && DR().getProfile()) || {};
    if (!canManage(profile)) { toast('Admin only', 'error'); return; }
    var listMode = mode || window.__DR_USERS_LIST_MODE || 'endusers';
    window.__DR_USERS_LIST_MODE = listMode;
    if (listMode === 'endusers') {
      document.body.classList.add('dr-view-endusers');
      document.body.classList.remove('dr-view-admin-staff');
    } else {
      document.body.classList.add('dr-view-admin-staff');
      document.body.classList.remove('dr-view-endusers');
    }
    ensureModal();
    showAdminView();
    hideShowingMeta();
    var box = document.getElementById('admin-users-list');
    if (!box) return;
    var token = ++_renderToken;
    box.innerHTML = '<p class="muted">Loading…</p>';
    var users = await fetchAllProfiles();
    if (token !== _renderToken) return;
    var roleFilter = (document.getElementById('admin-filter-role') || {}).value || '';
    var searchEl = document.getElementById('admin-search');
    var search = searchEl ? String(searchEl.value || '').toLowerCase().trim() : '';
    var filtered = users.filter(function (u) {
      var r = String(u.role || '').toLowerCase();
      var isEnd = r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === '';
      var isStaff = r === 'admin' || r === 'agent' || r === 'developer' || r === 'owner' || r === 'it_tech_support';
      if (listMode === 'endusers') { if (!isEnd) return false; }
      else { if (!isStaff && !isDev(u.username)) return false; }
      if (roleFilter) {
        var rr = r;
        if (roleFilter === 'it_tech_support') {
          if (rr !== 'it_tech_support' && rr !== 'agent') return false;
        } else if (rr !== roleFilter && !(roleFilter === 'developer' && isDev(u.username))) return false;
      }
      if (search) {
        var blob = ((u.full_name || '') + ' ' + (u.username || '') + ' ' + (u.email || '')).toLowerCase();
        if (blob.indexOf(search) < 0) return false;
      }
      return true;
    });
    if (window.__drUsersPage == null || typeof window.__drUsersPage !== 'number') window.__drUsersPage = 0;
    if (window.__drUsersPageMode !== listMode) { window.__drUsersPage = 0; window.__drUsersPageMode = listMode; }
    var PAGE_SIZE = 10;
    var totalUsers = filtered.length;
    var totalPages = totalUsers > PAGE_SIZE ? Math.ceil(totalUsers / PAGE_SIZE) : 1;
    if (totalPages < 1) totalPages = 1;
    if (window.__drUsersPage > totalPages - 1) window.__drUsersPage = totalPages - 1;
    if (window.__drUsersPage < 0) window.__drUsersPage = 0;
    var pageRows = filtered.slice(window.__drUsersPage * PAGE_SIZE, window.__drUsersPage * PAGE_SIZE + PAGE_SIZE);
    var viewerDev = isDev(profile.username);
    window.__adminUsersCache = users;
    var pagerHtml =
      '<div class="dr-users-pager" id="dr-users-pager">' +
      '<button type="button" class="dr-page-btn" id="dr-users-page-prev" aria-label="Previous page"' +
      (window.__drUsersPage <= 0 || totalPages <= 1 ? ' disabled' : '') + '>← Prev</button>' +
      '<span class="dr-page-info" id="dr-users-page-info">Page ' + (window.__drUsersPage + 1) + ' of ' + totalPages + '</span>' +
      '<button type="button" class="dr-page-btn" id="dr-users-page-next" aria-label="Next page"' +
      (window.__drUsersPage >= totalPages - 1 || totalPages <= 1 ? ' disabled' : '') + '>Next →</button></div>';
    if (!filtered.length) {
      box.innerHTML = '<p class="empty-state" style="padding:1rem">' +
        (listMode === 'endusers' ? 'No end-users found.' : 'No staff accounts found.') + '</p>';
    } else if (listMode === 'endusers') {
      box.innerHTML =
        '<table class="perf-table admin-table"><thead><tr>' +
        '<th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Actions</th>' +
        '</tr></thead><tbody>' +
        pageRows.map(function (u) {
          var mine = profile && u.id === profile.id;
          var label = roleLabel(u);
          return '<tr data-id="' + esc(u.id) + '">' +
            '<td>' + esc(u.full_name || 'User') + (mine ? ' <span class="you-tag">you</span>' : '') + '</td>' +
            '<td>' + esc(u.username || '—') + '</td>' +
            '<td><span class="' + roleCls(u, label) + '">' + esc(label) + '</span></td>' +
            '<td>' + fmt(u.created_at) + '</td>' +
            '<td class="admin-actions-cell"><div class="admin-actions">' +
            '<button type="button" class="btn btn-ghost btn-sm admin-btn-edit" data-id="' + esc(u.id) + '">Edit</button>' +
            '<button type="button" class="btn btn-danger btn-sm admin-btn-del" data-id="' + esc(u.id) +
            '" data-name="' + esc(u.full_name || u.username || 'user') + '">Delete</button></div></td></tr>';
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
    try {
      var oldPager = document.getElementById('dr-users-pager');
      if (oldPager) oldPager.remove();
    } catch (eP) {}
    if (box.parentNode) box.insertAdjacentHTML('afterend', pagerHtml);
    else box.insertAdjacentHTML('beforeend', pagerHtml);
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
    if (ar && !ar.__v16) { ar.__v16 = 1; ar.addEventListener('click', function () { renderAdminUsers(); }); }
    var as = document.getElementById('admin-search');
    if (as && !as.__v16) { as.__v16 = 1; as.addEventListener('input', function () { window.__drUsersPage = 0; renderAdminUsers(); }); }
    var afr = document.getElementById('admin-filter-role');
    if (afr && !afr.__v16) { afr.__v16 = 1; afr.addEventListener('change', function () { window.__drUsersPage = 0; renderAdminUsers(); }); }
    setInterval(function () {
      if (document.body.classList.contains('dr-view-admin-staff') || document.body.classList.contains('dr-view-endusers')) hideShowingMeta();
    }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
})();
