/**
 * Divine Rays — Users nav
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_USERS_NAV) return;
  window.__DR_USERS_NAV = 1;

  var CSS = [
    '#portal-agent .nav-users-wrap{display:flex;flex-direction:column;gap:0.25rem;width:100%}',
    '#portal-agent .nav-users-wrap.is-hidden{display:none!important}',
    '#portal-agent .nav-users-toggle{width:100%;text-align:left;position:relative}',
    '#portal-agent .nav-users-toggle .dr-users-caret{float:right;opacity:0.7;font-size:0.75em;transition:transform .2s ease}',
    '#portal-agent .nav-users-wrap.is-open .nav-users-toggle .dr-users-caret{transform:rotate(90deg)}',
    '#portal-agent .nav-users-sub{display:none;flex-direction:column;gap:0.2rem;padding:0.15rem 0 0.35rem 0.65rem}',
    '#portal-agent .nav-users-wrap.is-open .nav-users-sub{display:flex}',
    '#portal-agent .nav-users-sub .nav-btn{font-size:0.92em;padding:0.45rem 0.75rem;opacity:0.92}',
    '#portal-agent .nav-users-sub .nav-btn.active{opacity:1}',
    'body.dr-view-endusers .dr-list-toolbar-right,body.dr-view-endusers #dr-list-toolbar-right,body.dr-view-endusers .dr-list-toolbar-left p{display:none!important}',
    'body.dr-view-endusers #filter-status,body.dr-view-endusers #filter-priority,body.dr-view-endusers #filter-sort,body.dr-view-endusers #btn-clear-filters,body.dr-view-endusers #filter-limit,body.dr-view-endusers .dr-limit-wrap,body.dr-view-endusers #search-input,body.dr-view-endusers #admin-filter-role{display:none!important}',
    '#view-admin .admin-stats .stat-card:has(#admin-stat-users),#view-admin .admin-stats .stat-card:has(#admin-stat-agents),#view-admin .admin-stats .stat-card:has(#admin-stat-admins){display:none!important}',
    '#view-admin .admin-stats{grid-template-columns:minmax(180px,320px)!important;max-width:320px}',
    'body.dr-view-staff-admin #filter-status,body.dr-view-staff-admin #filter-priority,body.dr-view-staff-admin #filter-sort,body.dr-view-staff-admin #btn-clear-filters,body.dr-view-staff-admin #filter-limit,body.dr-view-staff-admin .dr-limit-wrap,body.dr-view-staff-admin #search-input{display:none!important}',
    'body.dr-view-staff-admin .dr-list-toolbar-right,body.dr-view-staff-admin #dr-list-toolbar-right,body.dr-view-staff-admin .dr-list-toolbar-left p{display:none!important}',
    '#view-staff-admin .staff-admin-hero{display:none!important}',
    '#view-staff-admin #staff-stat-agents,#view-staff-admin .admin-stats .stat-card:has(#staff-stat-agents){display:none!important}',
    '#view-staff-admin .admin-stats{grid-template-columns:minmax(180px,320px)!important;max-width:320px;margin-bottom:1rem}',
    '#view-staff-admin .admin-table{width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0}',
    '#view-staff-admin .admin-table th,#view-staff-admin .admin-table td{padding:0.75rem 0.85rem;vertical-align:middle}',
    '#view-staff-admin .admin-table th:nth-child(1),#view-staff-admin .admin-table td:nth-child(1){width:22%;text-align:left}',
    '#view-staff-admin .admin-table th:nth-child(2),#view-staff-admin .admin-table td:nth-child(2){width:16%;text-align:center}',
    '#view-staff-admin .admin-table th:nth-child(3),#view-staff-admin .admin-table td:nth-child(3){width:16%;text-align:center}',
    '#view-staff-admin .admin-table th:nth-child(4),#view-staff-admin .admin-table td:nth-child(4){width:16%;text-align:center}',
    '#view-staff-admin .admin-table th:nth-child(5),#view-staff-admin .admin-table td:nth-child(5){width:30%;text-align:center}',
    '#view-staff-admin .admin-table .admin-actions{display:inline-flex;align-items:center;justify-content:center;gap:0.4rem;flex-wrap:wrap}',
    '#view-staff-admin .badge-role-developer{background:rgba(234,179,8,0.22)!important;color:#fbbf24!important;border:1px solid rgba(234,179,8,0.45)}',
    '#view-staff-admin .badge-role-pending{background:rgba(251,146,60,0.2)!important;color:#fb923c!important}',
    '#view-staff-admin .badge-role-disapproved{background:rgba(239,68,68,0.18)!important;color:#f87171!important}',
    '#view-staff-admin select.staff-approve-select{min-width:7.5rem;text-align:center}'
  ].join('');

  var DEVELOPER_USERNAMES = { kirzhian: 1, jamesjerlow123: 1 };

  function injectCss() {
    var el = document.getElementById('dr-users-nav-css');
    if (!el) { el = document.createElement('style'); el.id = 'dr-users-nav-css'; document.head.appendChild(el); }
    el.textContent = CSS;
  }

  function hideAllViews() {
    document.querySelectorAll('#portal-agent .view, #portal-agent section.view').forEach(function (v) {
      v.classList.remove('active');
      try { v.style.display = 'none'; } catch (e) {}
    });
  }

  function showView(id) {
    hideAllViews();
    var v = document.getElementById(id);
    if (v) { v.classList.add('active'); try { v.style.display = ''; } catch (e) {} }
  }

  function setPageTitle(t) {
    var pt = document.getElementById('page-title');
    if (pt) pt.textContent = t;
  }

  function clearNavActive() {
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (b) { b.classList.remove('active'); });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
  }

  function isDeveloperUser(u) {
    if (!u) return false;
    var un = String(u.username || '').toLowerCase().trim();
    if (DEVELOPER_USERNAMES[un]) return true;
    var em = String(u.email || '').toLowerCase();
    return em.indexOf('kirzhian') !== -1 || em.indexOf('jamesjerlow') !== -1;
  }

  function getApprovalMap() {
    try { return JSON.parse(localStorage.getItem('dr_staff_approval') || '{}') || {}; } catch (e) { return {}; }
  }

  function setApproval(userId, status) {
    var map = getApprovalMap();
    map[userId] = status;
    try { localStorage.setItem('dr_staff_approval', JSON.stringify(map)); } catch (e) {}
  }

  function getApprovalStatus(u) {
    if (isDeveloperUser(u)) return 'approved';
    var map = getApprovalMap();
    if (map[u.id]) return map[u.id];
    if (u.role === 'admin' || u.role === 'agent') return 'approved';
    return 'pending';
  }

  function displayRoleLabel(u) {
    if (isDeveloperUser(u)) return 'Developer';
    var st = getApprovalStatus(u);
    if (st === 'pending') return (u.role || 'staff') + ' · Pending';
    if (st === 'disapproved') return (u.role || 'staff') + ' · Disapproved';
    if (u.role === 'admin') return 'Admin';
    if (u.role === 'agent') return 'Agent';
    return u.role || '—';
  }

  function displayRoleClass(u) {
    if (isDeveloperUser(u)) return 'developer';
    var st = getApprovalStatus(u);
    if (st === 'pending') return 'pending';
    if (st === 'disapproved') return 'disapproved';
    return u.role || 'staff';
  }

  function isStaffLoginAllowed(profile) {
    if (!profile) return false;
    if (profile.role !== 'agent' && profile.role !== 'admin') return true;
    if (isDeveloperUser(profile)) return true;
    return getApprovalStatus(profile) === 'approved';
  }

  function fmtDate(d) {
    if (!d) return '—';
    try { if (window.DR && window.DR.fmt) return window.DR.fmt(d); } catch (e) {}
    try {
      var dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      return dt.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e2) { return String(d); }
  }

  function ensureStaffView() {
    var main = document.querySelector('#portal-agent main') || document.getElementById('portal-agent');
    if (!main) return null;
    var sec = document.getElementById('view-staff-admin');
    if (sec) {
      var hero = sec.querySelector('.staff-admin-hero');
      if (hero) hero.remove();
      var agentsCard = document.getElementById('staff-stat-agents');
      if (agentsCard) {
        var ac = agentsCard.closest ? agentsCard.closest('.stat-card') : agentsCard.parentNode;
        if (ac) ac.style.display = 'none';
      }
      return sec;
    }
    sec = document.createElement('section');
    sec.id = 'view-staff-admin';
    sec.className = 'view';
    sec.innerHTML =
      '<p class="admin-hint">Manage admin accounts, roles and access. New Agent/Admin accounts require approval.</p>' +
      '<div class="admin-stats" id="staff-admin-stats">' +
      '<div class="stat-card me"><span class="stat-label">Admins</span><span class="stat-value" id="staff-stat-admins">0</span></div>' +
      '</div>' +
      '<div class="admin-toolbar" style="margin-top:1rem">' +
      '<input type="search" id="staff-admin-search" placeholder="Search by name or username..." />' +
      '<button type="button" class="btn btn-secondary" id="btn-staff-refresh">Refresh</button>' +
      '</div>' +
      '<div id="staff-admin-list" class="agent-perf" style="margin-top:1rem"></div>';
    main.appendChild(sec);
    var btn = document.getElementById('btn-staff-refresh');
    if (btn && !btn.__drStaff) {
      btn.__drStaff = 1;
      btn.addEventListener('click', function () { renderStaffAdmin(); });
    }
    var search = document.getElementById('staff-admin-search');
    if (search && !search.__drStaff) {
      search.__drStaff = 1;
      search.addEventListener('input', function () { renderStaffAdmin(); });
    }
    return sec;
  }

  async function fetchProfilesForStaff() {
    try {
      if (window.__adminUsersCache && window.__adminUsersCache.length) return window.__adminUsersCache.slice();
    } catch (e) {}
    try {
      var client = window.DR && window.DR.sb && window.DR.sb();
      if (client) {
        var r = await client.from('profiles').select('id,full_name,role,username,email,created_at').order('created_at', { ascending: false });
        if (r && !r.error && r.data) {
          window.__adminUsersCache = r.data.slice();
          return r.data;
        }
      }
    } catch (e2) {}
    if (typeof window.renderAdminUsers === 'function') {
      try {
        await window.renderAdminUsers();
        return (window.__adminUsersCache || []).slice();
      } catch (e3) {}
    }
    return [];
  }

  async function renderStaffAdmin() {
    ensureStaffView();
    polishStaffAdminChrome();
    var box = document.getElementById('staff-admin-list');
    if (!box) return;
    box.innerHTML = '<div class="empty-state"><p>Loading…</p></div>';
    var users = await fetchProfilesForStaff();
    var q = ((document.getElementById('staff-admin-search') || {}).value || '').trim().toLowerCase();
    var staff = users.filter(function (u) { return u.role === 'agent' || u.role === 'admin'; });
    if (q) {
      staff = staff.filter(function (u) {
        return ((u.full_name || '') + ' ' + (u.username || '') + ' ' + (u.email || '') + ' ' + (u.role || '')).toLowerCase().indexOf(q) !== -1;
      });
    }
    var admins = 0;
    users.forEach(function (u) { if (u.role === 'admin' || isDeveloperUser(u)) admins++; });
    var sd = document.getElementById('staff-stat-admins');
    if (sd) sd.textContent = String(admins);

    if (!staff.length) {
      box.innerHTML = '<p class="empty-state" style="padding:1rem">No admin or agent accounts found.</p>';
      return;
    }

    var profile = null;
    try { profile = window.DR && window.DR.getProfile && window.DR.getProfile(); } catch (e) {}

    box.innerHTML =
      '<table class="perf-table admin-table"><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead><tbody>' +
      staff.map(function (u) {
        var mine = profile && u.id === profile.id;
        var dev = isDeveloperUser(u);
        var st = getApprovalStatus(u);
        var roleLabel = displayRoleLabel(u);
        var roleClass = displayRoleClass(u);
        var approveSelect;
        if (dev) {
          approveSelect = '<span class="badge badge-role-developer" title="Super Admin · highest access">Developer</span>';
        } else {
          approveSelect =
            '<select class="staff-approve-select" data-id="' + u.id + '"' + (mine ? ' disabled' : '') + '>' +
            '<option value="pending"' + (st === 'pending' ? ' selected' : '') + '>Pending</option>' +
            '<option value="approved"' + (st === 'approved' ? ' selected' : '') + '>Approve</option>' +
            '<option value="disapproved"' + (st === 'disapproved' ? ' selected' : '') + '>Disapprove</option>' +
            '</select>';
        }
        var actions =
          '<div class="admin-actions">' + approveSelect +
          (dev ? '' : '<button type="button" class="btn btn-ghost btn-sm admin-btn-edit" data-id="' + u.id + '">Edit</button>') +
          (mine || dev ? '' : '<button type="button" class="btn btn-danger btn-sm admin-btn-del" data-id="' + u.id + '" data-name="' + esc(u.full_name || u.username || 'user') + '">Delete</button>') +
          '</div>';
        return '<tr' + (mine ? ' class="mine"' : '') + '><td>' + esc(u.full_name || 'User') +
          (mine ? ' <span class="you-tag">you</span>' : '') +
          (dev ? ' <span class="you-tag" style="opacity:0.85">super</span>' : '') +
          '</td><td>' + esc(u.username || '—') +
          '</td><td><span class="badge badge-role-' + esc(roleClass) + '">' + esc(roleLabel) + '</span></td><td>' +
          fmtDate(u.created_at) + '</td><td>' + actions + '</td></tr>';
      }).join('') +
      '</tbody></table>' +
      '<p class="admin-hint" style="margin-top:0.75rem">New Agent/Admin accounts stay <strong>Pending</strong> until a Developer, Owner, or existing Admin approves them. Disapproved accounts cannot sign in to the agent portal.</p>';

    box.querySelectorAll('.staff-approve-select').forEach(function (sel) {
      if (sel.__drStaffBound) return;
      sel.__drStaffBound = 1;
      sel.addEventListener('change', function () {
        var id = sel.getAttribute('data-id');
        var status = sel.value;
        var label = status === 'approved' ? 'Approve' : status === 'disapproved' ? 'Disapprove' : 'set to Pending';
        if (!confirm(label + ' this account?')) { renderStaffAdmin(); return; }
        setApproval(id, status);
        if (window.DR && window.DR.toast) {
          if (status === 'approved') window.DR.toast('Account approved — can sign in as Agent/Admin', 'success');
          else if (status === 'disapproved') window.DR.toast('Account disapproved — agent login blocked', 'info');
          else window.DR.toast('Account set to pending approval', 'info');
        }
        renderStaffAdmin();
      });
    });

    box.querySelectorAll('.admin-btn-edit').forEach(function (btn) {
      if (btn.__drStaffBound) return;
      btn.__drStaffBound = 1;
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var temp = document.querySelector('#admin-users-list .admin-btn-edit[data-id="' + id + '"]');
        if (temp) { temp.click(); return; }
        if (window.DR && window.DR.toast) window.DR.toast('Open End-Users once, then edit from Admin', 'info');
      });
    });

    box.querySelectorAll('.admin-btn-del').forEach(function (btn) {
      if (btn.__drStaffBound) return;
      btn.__drStaffBound = 1;
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name') || 'this user';
        if (!confirm('Delete ' + name + '?\n\nRemoves their profile. Cannot undo.')) return;
        if (!confirm('Really delete ' + name + '?')) return;
        btn.disabled = true;
        try {
          var client = window.DR && window.DR.sb && window.DR.sb();
          if (client) {
            var r = await client.from('profiles').delete().eq('id', id);
            if (r.error) {
              if (window.DR && window.DR.toast) window.DR.toast(r.error.message || 'Delete failed', 'error');
              btn.disabled = false;
              return;
            }
            if (window.DR && window.DR.toast) window.DR.toast('User profile deleted', 'success');
            window.__adminUsersCache = null;
            renderStaffAdmin();
          }
        } catch (err) { btn.disabled = false; }
      });
    });
  }

  function polishEndUsersChrome() {
    try { document.body.classList.add('dr-view-endusers'); } catch (e) {}
    try { document.body.classList.remove('dr-view-list', 'dr-view-dashboard', 'dr-view-staff-admin'); } catch (e) {}
    var hint = document.querySelector('#view-admin .admin-hint');
    if (hint) hint.textContent = 'Manage users, roles and badge.';
    ['filter-status', 'filter-priority', 'filter-sort', 'btn-clear-filters', 'filter-limit', 'search-input'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.style.setProperty('display', 'none', 'important'); el.setAttribute('data-dr-eu-hide', '1'); }
    });
    document.querySelectorAll('.dr-limit-wrap').forEach(function (w) { w.style.setProperty('display', 'none', 'important'); });
    var cust = document.getElementById('admin-stat-customers');
    if (cust) {
      var card = cust.closest ? cust.closest('.stat-card') : null;
      if (card) { var lab = card.querySelector('.stat-label'); if (lab) lab.textContent = 'End-Users'; }
    }
    ['admin-stat-users', 'admin-stat-agents', 'admin-stat-admins'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var card2 = el.closest ? el.closest('.stat-card') : el.parentNode;
      if (card2 && card2.style) card2.style.display = 'none';
    });
    if (cust) {
      var keep = cust.closest ? cust.closest('.stat-card') : cust.parentNode;
      if (keep && keep.style) keep.style.display = '';
    }
    var roleSel = document.getElementById('admin-filter-role');
    if (roleSel) roleSel.style.setProperty('display', 'none', 'important');
  }

  function polishStaffAdminChrome() {
    try { document.body.classList.add('dr-view-staff-admin'); } catch (e) {}
    try { document.body.classList.remove('dr-view-endusers', 'dr-view-list', 'dr-view-dashboard'); } catch (e) {}
    ['filter-status', 'filter-priority', 'filter-sort', 'btn-clear-filters', 'filter-limit', 'search-input'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.style.setProperty('display', 'none', 'important'); el.setAttribute('data-dr-eu-hide', '1'); }
    });
    document.querySelectorAll('.dr-limit-wrap').forEach(function (w) { w.style.setProperty('display', 'none', 'important'); });
  }

  function restoreTopbarFilters() {
    ['filter-status', 'filter-priority', 'filter-sort', 'btn-clear-filters', 'filter-limit', 'search-input'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getAttribute('data-dr-eu-hide') === '1') {
        el.style.removeProperty('display');
        el.removeAttribute('data-dr-eu-hide');
      }
    });
    document.querySelectorAll('.dr-limit-wrap').forEach(function (w) { w.style.removeProperty('display'); });
  }

  function isEndUserRole(role) {
    role = String(role || '').toLowerCase().trim();
    return role === 'customer' || role === 'end-user' || role === 'enduser' || role === 'end user';
  }

  function filterEndUsersList() {
    var box = document.getElementById('admin-users-list');
    if (!box) return;
    var sel = document.getElementById('admin-filter-role');
    if (sel) { sel.value = 'customer'; sel.style.setProperty('display', 'none', 'important'); }
    var rows = box.querySelectorAll('tbody tr');
    var shown = 0;
    rows.forEach(function (tr) {
      var badge = tr.querySelector('.badge');
      var roleTxt = badge ? (badge.textContent || '') : '';
      var rs = tr.querySelector('.admin-role-select');
      var roleVal = rs ? (rs.value || '') : roleTxt;
      var keep = isEndUserRole(roleVal) || isEndUserRole(roleTxt);
      tr.style.display = keep ? '' : 'none';
      if (keep) shown++;
    });
    var cust = document.getElementById('admin-stat-customers');
    if (cust) {
      var n = shown;
      try {
        var cache = window.__adminUsersCache || [];
        if (cache.length) n = cache.filter(function (u) { return isEndUserRole(u.role); }).length;
      } catch (e) {}
      cust.textContent = String(n);
    }
  }

  function renderEndUsersOnly() {
    polishEndUsersChrome();
    var sel = document.getElementById('admin-filter-role');
    if (sel) { sel.value = 'customer'; sel.style.setProperty('display', 'none', 'important'); }
    function after() { polishEndUsersChrome(); filterEndUsersList(); }
    if (typeof window.renderAdminUsers === 'function') {
      try {
        var r = window.renderAdminUsers();
        if (r && typeof r.then === 'function') r.then(after).catch(after);
        else { setTimeout(after, 80); setTimeout(after, 400); }
      } catch (e) { setTimeout(after, 80); }
    } else after();
  }

  function openEndUsers() {
    try { document.body.classList.remove('dr-view-staff-admin'); } catch (e) {}
    clearNavActive();
    var sub = document.getElementById('nav-users-endusers');
    var parent = document.getElementById('nav-users-toggle');
    if (sub) sub.classList.add('active');
    if (parent) parent.classList.add('active');
    showView('view-admin');
    setPageTitle('End-Users');
    renderEndUsersOnly();
    setTimeout(renderEndUsersOnly, 100);
    setTimeout(filterEndUsersList, 500);
  }

  function openAdminStaff() {
    try { document.body.classList.remove('dr-view-endusers'); } catch (e) {}
    try {
      (window.__adminUsersCache || []).forEach(function (u) {
        if (isDeveloperUser(u)) setApproval(u.id, 'approved');
      });
    } catch (e0) {}
    clearNavActive();
    var sub = document.getElementById('nav-users-admin');
    var parent = document.getElementById('nav-users-toggle');
    if (sub) sub.classList.add('active');
    if (parent) parent.classList.add('active');
    ensureStaffView();
    showView('view-staff-admin');
    setPageTitle('Admin');
    polishStaffAdminChrome();
    renderStaffAdmin();
    setTimeout(polishStaffAdminChrome, 50);
    setTimeout(polishStaffAdminChrome, 300);
  }

  function transformNav() {
    var navAdmin = document.getElementById('nav-admin');
    if (!navAdmin) return;
    var nav = navAdmin.parentNode;
    if (!nav) return;
    var wrap = document.getElementById('nav-users-wrap');
    if (wrap) {
      if (navAdmin.classList.contains('is-hidden')) wrap.classList.add('is-hidden');
      else wrap.classList.remove('is-hidden');
      return;
    }
    wrap = document.createElement('div');
    wrap.id = 'nav-users-wrap';
    wrap.className = 'nav-users-wrap';
    if (navAdmin.classList.contains('is-hidden')) wrap.classList.add('is-hidden');
    wrap.innerHTML =
      '<button type="button" class="nav-btn nav-users-toggle" id="nav-users-toggle" data-view="users">Users <span class="dr-users-caret">›</span></button>' +
      '<div class="nav-users-sub" id="nav-users-sub">' +
      '<button type="button" class="nav-btn" id="nav-users-endusers" data-view="end-users">End-Users</button>' +
      '<button type="button" class="nav-btn" id="nav-users-admin" data-view="users-admin">Admin</button>' +
      '</div>';
    navAdmin.style.display = 'none';
    navAdmin.setAttribute('aria-hidden', 'true');
    nav.insertBefore(wrap, navAdmin.nextSibling);
    var toggle = document.getElementById('nav-users-toggle');
    toggle.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); wrap.classList.toggle('is-open'); });
    document.getElementById('nav-users-endusers').addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation(); wrap.classList.add('is-open'); openEndUsers();
    });
    document.getElementById('nav-users-admin').addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation(); wrap.classList.add('is-open'); openAdminStaff();
    });
    nav.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.classList || !t.classList.contains('nav-btn')) return;
      if (t.id === 'nav-users-toggle' || t.id === 'nav-users-endusers' || t.id === 'nav-users-admin') return;
      if (t.closest && t.closest('#nav-users-wrap')) return;
      wrap.classList.remove('is-open');
      toggle.classList.remove('active');
      var eu = document.getElementById('nav-users-endusers');
      var ad = document.getElementById('nav-users-admin');
      if (eu) eu.classList.remove('active');
      if (ad) ad.classList.remove('active');
      try { document.body.classList.remove('dr-view-endusers', 'dr-view-staff-admin'); } catch (err) {}
      restoreTopbarFilters();
    }, true);
  }

  function syncVisibility() {
    var navAdmin = document.getElementById('nav-admin');
    var wrap = document.getElementById('nav-users-wrap');
    if (!navAdmin || !wrap) return;
    if (navAdmin.classList.contains('is-hidden')) wrap.classList.add('is-hidden');
    else wrap.classList.remove('is-hidden');
  }

  function wrapRenderAdminUsers() {
    if (window.__drEuRenderWrapped) return;
    if (typeof window.renderAdminUsers !== 'function') return;
    window.__drEuRenderWrapped = 1;
    var orig = window.renderAdminUsers;
    window.renderAdminUsers = function () {
      var ret = orig.apply(this, arguments);
      var finish = function () {
        var va = document.getElementById('view-admin');
        if (va && va.classList.contains('active') && document.body.classList.contains('dr-view-endusers')) {
          polishEndUsersChrome();
          filterEndUsersList();
        }
      };
      if (ret && typeof ret.then === 'function') {
        return ret.then(function (v) { finish(); return v; }).catch(function (e) { finish(); throw e; });
      }
      setTimeout(finish, 30);
      setTimeout(finish, 200);
      return ret;
    };
  }

  function installStaffLoginGuard() {
    if (window.__drStaffLoginGuard) return;
    window.__drStaffLoginGuard = 1;
    var pa = document.getElementById('portal-agent');
    if (pa && !pa.__drApproveObs) {
      pa.__drApproveObs = 1;
      new MutationObserver(function () {
        if (!pa.classList.contains('active')) return;
        try {
          var profile = window.DR && window.DR.getProfile && window.DR.getProfile();
          if (!profile) return;
          if (profile.role !== 'agent' && profile.role !== 'admin') return;
          if (isStaffLoginAllowed(profile)) return;
          pa.classList.remove('active');
          try { if (window.DR && window.DR.signOut) window.DR.signOut(); } catch (e) {}
          var err =
            getApprovalStatus(profile) === 'disapproved'
              ? 'Your Agent/Admin account was disapproved. Contact a Developer or Owner.'
              : 'Your Agent/Admin account is pending approval. Contact a Developer or existing Admin.';
          if (window.DR && window.DR.toast) window.DR.toast(err, 'error');
          else alert(err);
        } catch (err2) {}
      }).observe(pa, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function tick() {
    injectCss();
    transformNav();
    syncVisibility();
    ensureStaffView();
    wrapRenderAdminUsers();
    installStaffLoginGuard();
    var va = document.getElementById('view-admin');
    if (va && va.classList.contains('active') && document.body.classList.contains('dr-view-endusers')) {
      polishEndUsersChrome();
      filterEndUsersList();
    }
    var vs = document.getElementById('view-staff-admin');
    if (vs && vs.classList.contains('active')) polishStaffAdminChrome();
  }

  tick();
  setInterval(tick, 2000);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);

  window.DRUsersNav = { refresh: tick, openEndUsers: openEndUsers, openAdmin: openAdminStaff };
})();
