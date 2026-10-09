/**
 * Divine Rays — Admin V15 — restore Users chrome; hide manage-hint; center End-Users cols
 * End-Users: customers only | Admin: staff Status/Approve/Deny (deny deletes)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_V15) return;
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
      .replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
      .replace(/"/g, '"').replace(/'/g, '&#39;');
  }
  function fmt(d) {
    if (!d) return '—';
    try {
      var x = new Date(d);
      if (isNaN(x.getTime())) return '—';
      return x.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return '—'; }
  }
  function canManage(profile) {
    var p = profile || {};
    var r = String(p.role || '').toLowerCase();
    var u = String(p.username || '').toLowerCase();
    return r === 'admin' || r === 'developer' || !!DEVS[u];
  }
  function isDeveloperUser(p) {
    var u = String((p && p.username) || '').toLowerCase();
    var r = String((p && p.role) || '').toLowerCase();
    return !!DEVS[u] || r === 'developer';
  }
  function setStatus(id, status, username, email) {
    try {
      var map = JSON.parse(localStorage.getItem(KEY) || '{}');
      map[id] = { status: status, username: username || '', email: email || '', at: Date.now() };
      localStorage.setItem(KEY, JSON.stringify(map));
    } catch (e) {}
  }
  function getStatus(u) {
    try {
      var map = JSON.parse(localStorage.getItem(KEY) || '{}');
      var e = map[u.id];
      if (e && e.status) return e.status;
    } catch (e) {}
    if (u.approved === true || u.status === 'approved') return 'approved';
    if (u.approved === false || u.status === 'pending') return 'pending';
    return 'pending';
  }
  function roleLabel(u) {
    var r = String(u.role || '').toLowerCase();
    if (r === 'end_user' || r === 'end-user' || r === 'customer' || r === 'user') return 'End-User';
    if (r === 'developer') return 'Developer';
    if (r === 'owner') return 'Owner';
    if (r === 'it_tech_support' || r === 'tech_support') return 'IT Tech Support';
    if (r === 'agent') return 'IT Tech Support';
    if (r === 'admin') return 'Admin';
    return u.role || 'User';
  }
  function roleCls(u, label) {
    var l = String(label || '').toLowerCase();
    if (l.indexOf('developer') >= 0) return 'badge badge-developer';
    if (l.indexOf('owner') >= 0) return 'badge badge-owner';
    if (l.indexOf('admin') >= 0) return 'badge badge-admin';
    if (l.indexOf('tech') >= 0 || l.indexOf('support') >= 0) return 'badge badge-agent';
    return 'badge badge-enduser';
  }
  function isEndUser(u) {
    var r = String(u.role || '').toLowerCase();
    return r === 'end_user' || r === 'end-user' || r === 'customer' || r === 'user' || r === '';
  }
  function isStaff(u) {
    var r = String(u.role || '').toLowerCase();
    return r === 'admin' || r === 'agent' || r === 'developer' || r === 'owner' || r === 'it_tech_support' || r === 'tech_support';
  }
  function ensureModal() {}
  function ask(msg) {
    return Promise.resolve(window.confirm(msg));
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
    var el = document.getElementById('dr-admin-v15-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-admin-v15-css';
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
      'background:transparent!important;border:none!important;box-shadow:none!important;' +
      'backdrop-filter:none!important;-webkit-backdrop-filter:none!important}' +
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
      '.badge-admin{background:rgba(45,212,191,0.22)!important;color:#2dd4bf!important}' +
      '.badge-developer{background:rgba(167,139,250,0.25)!important;color:#c4b5fd!important}' +
      '.badge-owner{background:rgba(251,191,36,0.22)!important;color:#fbbf24!important}' +
      '.badge-agent{background:rgba(96,165,250,0.22)!important;color:#60a5fa!important}' +
      '.badge-enduser{background:rgba(244,114,182,0.22)!important;color:#f472b6!important}' +
      'body.dr-view-admin-staff .admin-role-select,' +
      'body.dr-view-admin-staff .admin-btn-edit,' +
      'body.dr-view-admin-staff .admin-btn-del{display:none!important}' +
      'html[data-theme="light"] #admin-users-list,' +
      'html[data-theme="light"] #view-admin #admin-users-list,' +
      'html[data-theme="light"] body.dr-view-endusers #admin-users-list,' +
      'html[data-theme="light"] body.dr-view-admin-staff #admin-users-list{' +
      'background:rgba(255,255,255,0.42)!important;' +
      'backdrop-filter:blur(14px) saturate(1.15)!important;' +
      '-webkit-backdrop-filter:blur(14px) saturate(1.15)!important;' +
      'border:1px solid rgba(255,255,255,0.55)!important;' +
      'box-shadow:0 8px 28px rgba(80,60,140,0.08)!important;' +
      'border-radius:1rem!important}' +
      'html[data-theme="light"] #admin-users-list .admin-table,' +
      'html[data-theme="light"] #admin-users-list .perf-table{background:transparent!important}' +
      'html[data-theme="light"] #admin-users-list .admin-table thead,' +
      'html[data-theme="light"] #admin-users-list .admin-table th{background:rgba(255,255,255,0.35)!important}' +
      'html[data-theme="light"] #admin-users-list .admin-table tbody tr{background:transparent!important}' +
      'html[data-theme="light"] #admin-users-list .admin-table tbody tr:nth-child(even){background:rgba(255,255,255,0.18)!important}' +
      'html[data-theme="light"] #view-admin .card,' +
      'html[data-theme="light"] #view-admin .panel,' +
      'html[data-theme="light"] #view-admin .table-wrap{' +
      'background:rgba(255,255,255,0.4)!important;' +
      'backdrop-filter:blur(12px)!important;' +
      '-webkit-backdrop-filter:blur(12px)!important}';
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
    injectCss();
    var box = document.getElementById('admin-users-list');
    if (!box) return;
    var client = sb();
    if (!client) { box.innerHTML = '<p class="muted">Not connected</p>'; return; }
    var token = ++_renderToken;
    box.innerHTML = '<p class="muted">Loading…</p>';
    var q = client.from('profiles').select('*').order('created_at', { ascending: false });
    var res = await q;
    if (token !== _renderToken) return;
    if (res.error) { box.innerHTML = '<p class="muted">' + esc(res.error.message) + '</p>'; return; }
    var rows = res.data || [];
    var roleFilter = (document.getElementById('admin-filter-role') || {}).value || '';
    var searchEl = document.getElementById('admin-search') || document.getElementById('users-search');
    var search = searchEl ? String(searchEl.value || '').toLowerCase().trim() : '';
    var filtered = rows.filter(function (u) {
      if (listMode === 'endusers') {
        if (!isEndUser(u)) return false;
      } else {
        if (!isStaff(u)) return false;
      }
      if (roleFilter) {
        var r = String(u.role || '').toLowerCase();
        if (roleFilter === 'it_tech_support') {
          if (r !== 'it_tech_support' && r !== 'agent' && r !== 'tech_support') return false;
        } else if (r !== roleFilter) return false;
      }
      if (search) {
        var blob = ((u.full_name || '') + ' ' + (u.username || '') + ' ' + (u.email || '')).toLowerCase();
        if (blob.indexOf(search) < 0) return false;
      }
      return true;
    });
    window.__drUsersPage = window.__drUsersPage || 0;
    var per = 20;
    var totalPages = Math.max(1, Math.ceil(filtered.length / per));
    if (window.__drUsersPage >= totalPages) window.__drUsersPage = totalPages - 1;
    if (window.__drUsersPage < 0) window.__drUsersPage = 0;
    var pageRows = filtered.slice(window.__drUsersPage * per, window.__drUsersPage * per + per);
    var viewerDev = isDeveloperUser(profile);
    var pagerHtml = totalPages > 1
      ? '<div class="dr-users-pager" id="dr-users-pager">' +
        '<button type="button" class="dr-page-btn" id="dr-users-page-prev" aria-label="Previous page"' +
        (window.__drUsersPage <= 0 ? ' disabled' : '') + '>Prev</button>' +
        '<span class="dr-page-info" id="dr-users-page-info">Page ' + (window.__drUsersPage + 1) + ' of ' + totalPages + '</span>' +
        '<button type="button" class="dr-page-btn" id="dr-users-page-next" aria-label="Next page"' +
        (window.__drUsersPage >= totalPages - 1 ? ' disabled' : '') + '>Next</button></div>'
      : '';
    if (listMode === 'endusers') {
      box.innerHTML =
        '<table class="admin-table"><thead><tr>' +
        '<th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Actions</th>' +
        '</tr></thead><tbody>' +
        pageRows.map(function (u) {
          var label = roleLabel(u);
          var mine = profile && profile.id && u.id === profile.id;
          return '<tr data-id="' + esc(u.id) + '">' +
            '<td>' + esc(u.full_name || 'User') + (mine ? ' <span class="you-tag">you</span>' : '') + '</td>' +
            '<td>' + esc(u.username || '—') + '</td>' +
            '<td><span class="' + roleCls(u, label) + '">' + esc(label) + '</span></td>' +
            '<td>' + fmt(u.created_at) + '</td>' +
            '<td class="admin-actions-cell"><div class="admin-actions">' +
            '<button type="button" class="btn btn-sm admin-btn-edit" data-id="' + esc(u.id) + '">Edit</button>' +
            '<button type="button" class="btn btn-danger btn-sm admin-btn-del" data-id="' + esc(u.id) + '">Delete</button>' +
            '</div></td></tr>';
        }).join('') + '</tbody></table>';
    } else {
      box.innerHTML =
        '<table class="admin-table"><thead><tr>' +
        '<th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>' +
        '</tr></thead><tbody>' +
        pageRows.map(function (u) {
          var label = roleLabel(u);
          var mine = profile && profile.id && u.id === profile.id;
          var st = getStatus(u);
          var statusHtml = '';
          var actionHtml = '';
          if (st === 'approved') {
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
    if (pagerHtml) {
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
    }
    box.querySelectorAll('.admin-btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        toast('Edit from profile settings', 'info');
      });
    });
    box.querySelectorAll('.admin-btn-del').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-id');
        if (!(await ask('Delete this end-user profile?'))) return;
        var client2 = sb();
        if (!client2) return;
        var del = await client2.from('profiles').delete().eq('id', id);
        if (del.error) toast(del.error.message, 'error');
        else { toast('Deleted', 'ok'); renderAdminUsers(listMode); }
      });
    });
    box.querySelectorAll('.dr-v10-approve').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setStatus(btn.getAttribute('data-id'), 'approved', btn.getAttribute('data-username'), btn.getAttribute('data-email'));
        toast('Approved', 'ok');
        renderAdminUsers('staff');
      });
    });
    box.querySelectorAll('.dr-v10-deny').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name') || 'user';
        if (!(await ask('Deny and delete ' + name + '?'))) return;
        setStatus(id, 'denied', btn.getAttribute('data-username'), btn.getAttribute('data-email'));
        var client3 = sb();
        if (client3) {
          try { await client3.from('profiles').delete().eq('id', id); } catch (e) {}
        }
        toast('Denied and removed', 'ok');
        renderAdminUsers('staff');
      });
    });
    hideShowingMeta();
    try {
      var n = filtered.length;
      var endCard = document.querySelector('.admin-stats .stat-card.dr-stat-endusers, .admin-stats .stat-card:nth-child(2)');
      if (endCard && listMode === 'endusers') {
        var num = endCard.querySelector('.stat-value, .num, strong, b') || endCard;
        if (num && num !== endCard) num.textContent = String(n);
      }
      var admCard = document.querySelector('.admin-stats .stat-card.dr-stat-admins, .admin-stats .stat-card.me');
      if (admCard && listMode === 'staff') {
        var num2 = admCard.querySelector('.stat-value, .num, strong, b') || admCard;
        if (num2 && num2 !== admCard) num2.textContent = String(n);
      }
    } catch (eC) {}
  }
  window.renderAdminUsers = renderAdminUsers;
  window.DRAdmin = window.DRAdmin || {};
  window.DRAdmin.renderUsers = renderAdminUsers;
  window.DRAdmin.refresh = function () { renderAdminUsers(window.__DR_USERS_LIST_MODE || 'endusers'); };

  function boot() {
    injectCss();
    wireRoleFilter();
    var afr = document.getElementById('admin-filter-role');
    if (afr && !afr.__drBound) {
      afr.__drBound = true;
      afr.addEventListener('change', function () {
        window.__drUsersPage = 0;
        renderAdminUsers(window.__DR_USERS_LIST_MODE || 'endusers');
      });
    }
    setInterval(function () {
      if (document.body.classList.contains('dr-view-admin-staff') || document.body.classList.contains('dr-view-endusers')) {
        hideShowingMeta();
      }
    }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
})();
