/**
 * Divine Rays — Users nav: parent "Users" with End-Users + Admin submenus
 * End-Users = existing Admin user-management UI
 * Admin = separate staff interface
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_USERS_NAV) return;
  window.__DR_USERS_NAV = 1;

  var CSS = [
    '#portal-agent .nav-users-wrap{display:flex;flex-direction:column;gap:0.25rem;width:100%}',
    '#portal-agent .nav-users-wrap.is-hidden{display:none!important}',
    '#portal-agent .nav-users-toggle{',
    'width:100%;text-align:left;position:relative}',
    '#portal-agent .nav-users-toggle .dr-users-caret{',
    'float:right;opacity:0.7;font-size:0.75em;transition:transform .2s ease}',
    '#portal-agent .nav-users-wrap.is-open .nav-users-toggle .dr-users-caret{',
    'transform:rotate(90deg)}',
    '#portal-agent .nav-users-sub{',
    'display:none;flex-direction:column;gap:0.2rem;padding:0.15rem 0 0.35rem 0.65rem}',
    '#portal-agent .nav-users-wrap.is-open .nav-users-sub{display:flex}',
    '#portal-agent .nav-users-sub .nav-btn{',
    'font-size:0.92em;padding:0.45rem 0.75rem;opacity:0.92}',
    '#portal-agent .nav-users-sub .nav-btn.active{opacity:1}',
    '#view-staff-admin .staff-admin-hero{',
    'margin:0 0 1.25rem;padding:1.1rem 1.25rem;border-radius:14px;',
    'border:1px solid rgba(167,139,250,0.35);',
    'background:linear-gradient(135deg,rgba(109,94,245,0.12),rgba(139,92,246,0.06))}',
    '#view-staff-admin .staff-admin-hero h3{margin:0 0 0.35rem;font-size:1.15rem}',
    '#view-staff-admin .staff-admin-hero p{margin:0;opacity:0.8;font-size:0.9rem;line-height:1.45}',
    '#view-staff-admin .staff-grid{',
    'display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.85rem}',
    '#view-staff-admin .staff-card{',
    'padding:1rem;border-radius:12px;border:1px solid rgba(167,139,250,0.28);',
    'background:rgba(26,22,40,0.45)}',
    'html[data-theme="light"] #view-staff-admin .staff-card{',
    'background:rgba(255,255,255,0.9);border-color:rgba(109,94,245,0.25)}',
    '#view-staff-admin .staff-card .role-pill{',
    'display:inline-block;margin-top:0.45rem;padding:0.15rem 0.55rem;border-radius:999px;',
    'font-size:0.75rem;font-weight:600;background:rgba(109,94,245,0.2);color:#c4b5fd}',
    'html[data-theme="light"] #view-staff-admin .staff-card .role-pill{color:#5b4fd4}'
  ].join('');

  function injectCss() {
    var el = document.getElementById('dr-users-nav-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-users-nav-css';
      document.head.appendChild(el);
    }
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
    if (v) {
      v.classList.add('active');
      try { v.style.display = ''; } catch (e) {}
    }
  }

  function setPageTitle(t) {
    var pt = document.getElementById('page-title');
    if (pt) pt.textContent = t;
  }

  function clearNavActive() {
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (b) {
      b.classList.remove('active');
    });
  }

  function ensureStaffView() {
    var main = document.querySelector('#portal-agent main') || document.getElementById('portal-agent');
    if (!main) return null;
    var sec = document.getElementById('view-staff-admin');
    if (sec) return sec;
    sec = document.createElement('section');
    sec.id = 'view-staff-admin';
    sec.className = 'view';
    sec.innerHTML =
      '<div class="staff-admin-hero">' +
      '<h3>Admin · Staff control</h3>' +
      '<p>Manage agents and administrators. End-user accounts are handled under <strong>Users → End-Users</strong>.</p>' +
      '</div>' +
      '<div class="admin-stats" id="staff-admin-stats">' +
      '<div class="stat-card"><span class="stat-label">Agents</span><span class="stat-value" id="staff-stat-agents">0</span></div>' +
      '<div class="stat-card me"><span class="stat-label">Admins</span><span class="stat-value" id="staff-stat-admins">0</span></div>' +
      '</div>' +
      '<div class="admin-toolbar" style="margin-top:1rem">' +
      '<input type="search" id="staff-admin-search" placeholder="Search staff by name or username..." />' +
      '<button type="button" class="btn btn-secondary" id="btn-staff-refresh">Refresh</button>' +
      '</div>' +
      '<div id="staff-admin-list" class="staff-grid" style="margin-top:1rem"></div>';
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

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  async function renderStaffAdmin() {
    ensureStaffView();
    var box = document.getElementById('staff-admin-list');
    if (!box) return;
    var users = [];
    try {
      if (window.__adminUsersCache && window.__adminUsersCache.length) {
        users = window.__adminUsersCache.slice();
      } else if (window.renderAdminUsers) {
        await window.renderAdminUsers();
        users = (window.__adminUsersCache || []).slice();
      }
    } catch (e) {}
    if (!users.length) {
      try {
        var client = window.DR && window.DR.sb && window.DR.sb();
        if (client) {
          var r = await client.from('profiles').select('id,full_name,role,username,email,created_at').order('created_at', { ascending: false });
          if (r && !r.error && r.data) users = r.data;
        }
      } catch (e2) {}
    }
    var q = ((document.getElementById('staff-admin-search') || {}).value || '').trim().toLowerCase();
    var staff = users.filter(function (u) {
      return u.role === 'agent' || u.role === 'admin';
    });
    if (q) {
      staff = staff.filter(function (u) {
        return ((u.full_name || '') + ' ' + (u.username || '') + ' ' + (u.email || '') + ' ' + (u.role || '')).toLowerCase().indexOf(q) !== -1;
      });
    }
    var agents = 0, admins = 0;
    users.forEach(function (u) {
      if (u.role === 'agent') agents++;
      if (u.role === 'admin') admins++;
    });
    var sa = document.getElementById('staff-stat-agents');
    var sd = document.getElementById('staff-stat-admins');
    if (sa) sa.textContent = String(agents);
    if (sd) sd.textContent = String(admins);

    if (!staff.length) {
      box.innerHTML = '<p class="muted">No staff accounts found.</p>';
      return;
    }
    box.innerHTML = staff.map(function (u) {
      return (
        '<div class="staff-card">' +
        '<div style="font-weight:700">' + esc(u.full_name || u.username || 'User') + '</div>' +
        '<div class="muted" style="font-size:0.85rem;margin-top:0.2rem">' + esc(u.username || u.email || '—') + '</div>' +
        '<span class="role-pill">' + esc(u.role) + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function openEndUsers() {
    clearNavActive();
    var sub = document.getElementById('nav-users-endusers');
    var parent = document.getElementById('nav-users-toggle');
    if (sub) sub.classList.add('active');
    if (parent) parent.classList.add('active');
    showView('view-admin');
    setPageTitle('End-Users');
    if (typeof window.renderAdminUsers === 'function') {
      try { window.renderAdminUsers(); } catch (e) {}
    }
  }

  function openAdminStaff() {
    clearNavActive();
    var sub = document.getElementById('nav-users-admin');
    var parent = document.getElementById('nav-users-toggle');
    if (sub) sub.classList.add('active');
    if (parent) parent.classList.add('active');
    ensureStaffView();
    showView('view-staff-admin');
    setPageTitle('Admin');
    renderStaffAdmin();
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
      '<button type="button" class="nav-btn nav-users-toggle" id="nav-users-toggle" data-view="users">' +
      'Users <span class="dr-users-caret">›</span></button>' +
      '<div class="nav-users-sub" id="nav-users-sub">' +
      '<button type="button" class="nav-btn" id="nav-users-endusers" data-view="end-users">End-Users</button>' +
      '<button type="button" class="nav-btn" id="nav-users-admin" data-view="users-admin">Admin</button>' +
      '</div>';

    navAdmin.style.display = 'none';
    navAdmin.setAttribute('aria-hidden', 'true');
    nav.insertBefore(wrap, navAdmin.nextSibling);

    var toggle = document.getElementById('nav-users-toggle');
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      wrap.classList.toggle('is-open');
    });

    document.getElementById('nav-users-endusers').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      wrap.classList.add('is-open');
      openEndUsers();
    });

    document.getElementById('nav-users-admin').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      wrap.classList.add('is-open');
      openAdminStaff();
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
    }, true);
  }

  function syncVisibility() {
    var navAdmin = document.getElementById('nav-admin');
    var wrap = document.getElementById('nav-users-wrap');
    if (!navAdmin || !wrap) return;
    if (navAdmin.classList.contains('is-hidden')) wrap.classList.add('is-hidden');
    else wrap.classList.remove('is-hidden');
  }

  function tick() {
    injectCss();
    transformNav();
    syncVisibility();
    ensureStaffView();
  }

  tick();
  setInterval(tick, 2000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }

  window.DRUsersNav = {
    refresh: tick,
    openEndUsers: openEndUsers,
    openAdmin: openAdminStaff
  };
})();
