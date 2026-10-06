/**
 * Divine Rays - Users nav v9 - force Users views over Dashboard
 * End-Users + Admin subnav; keeps tables via renderAdminUsers
 * Credit: Boyz at the Back - All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_USERS_NAV_V9 >= 2) return;
  window.__DR_USERS_NAV_V9 = 2;
  window.__DR_USERS_NAV_V8 = 2;
  window.__DR_USERS_NAV = 1;

  var DEVELOPER_USERNAMES = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };

  function isDeveloperUser(u) {
    if (!u) return false;
    return !!DEVELOPER_USERNAMES[String(u.username || '').toLowerCase().trim()];
  }

  function sb() {
    try {
      if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb();
      if (window.__drSb) return window.__drSb;
    } catch (e) {}
    return null;
  }

  function injectCss() {
    var el = document.getElementById('dr-users-nav-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-users-nav-css';
      document.head.appendChild(el);
    }
    el.textContent = [
      '#portal-agent .nav-btn[data-dr-users-root]{position:relative;display:flex!important;align-items:center;gap:0.5rem;width:100%;box-sizing:border-box}',
      '#portal-agent .nav-btn[data-dr-users-root] .dr-users-chevron{margin-left:auto;width:16px;height:16px;flex-shrink:0;opacity:0.75;transition:transform .18s ease;display:inline-flex;align-items:center;justify-content:center}',
      '#portal-agent .nav-btn[data-dr-users-root].dr-users-open .dr-users-chevron{transform:rotate(180deg);opacity:1}',
      '#portal-agent .nav-btn[data-dr-users-root].dr-users-open,#portal-agent .nav-btn[data-dr-users-root].active{background:rgba(124,106,240,0.18)!important;color:#c4b5fd!important}',
      '#dr-users-sub{display:none;padding:0.35rem 0 0.55rem 0.85rem}',
      '#dr-users-sub.open{display:block}',
      '#dr-users-sub .nav-btn{width:100%;text-align:left;margin:0.2rem 0;border-radius:10px;padding:0.45rem 0.75rem;font-size:0.88rem}',
      '#dr-users-sub .nav-btn.dr-users-active,#dr-users-sub .nav-btn.active{background:linear-gradient(90deg,rgba(124,106,240,0.35),rgba(124,106,240,0.12))!important;color:#e9e5ff!important;font-weight:600!important;box-shadow:inset 3px 0 0 #7c6af0}',
      '#portal-agent .nav-btn.nav-admin:not([data-dr-users-root]),#portal-agent .nav-btn[data-view="admin"]:not([data-dr-users-root]){display:none!important}',
      'body.dr-view-endusers #filter-status,body.dr-view-endusers #filter-priority,body.dr-view-endusers #filter-sort,body.dr-view-endusers #btn-clear-filters,body.dr-view-endusers #search-input{display:none!important}',
      'body.dr-view-admin-staff #filter-status,body.dr-view-admin-staff #filter-priority,body.dr-view-admin-staff #filter-sort,body.dr-view-admin-staff #btn-clear-filters,body.dr-view-admin-staff #search-input{display:none!important}',
      'body.dr-view-endusers #filter-hint,body.dr-view-admin-staff #filter-hint,body.dr-view-endusers .dr-ticket-pager,body.dr-view-admin-staff .dr-ticket-pager{display:none!important}',
      'body.dr-view-endusers #view-dashboard,body.dr-view-admin-staff #view-dashboard,body.dr-view-endusers #view-tickets,body.dr-view-admin-staff #view-tickets,body.dr-view-endusers #view-kb,body.dr-view-admin-staff #view-kb,body.dr-view-endusers #view-detail,body.dr-view-admin-staff #view-detail,body.dr-view-endusers #view-my,body.dr-view-admin-staff #view-my,body.dr-view-endusers #view-unassigned,body.dr-view-admin-staff #view-unassigned,body.dr-view-endusers #view-all,body.dr-view-admin-staff #view-all{display:none!important;visibility:hidden!important;opacity:0!important}',
      'body.dr-view-endusers #view-admin,body.dr-view-admin-staff #view-admin{display:block!important;visibility:visible!important;opacity:1!important}',
      '#view-admin.active{display:block!important;visibility:visible!important;opacity:1!important}',
      'body.dr-view-endusers .admin-stats .stat-card{display:none!important}',
      'body.dr-view-endusers .admin-stats .stat-card.dr-stat-endusers{display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important}',
      'body.dr-view-admin-staff .admin-stats .stat-card{display:none!important}',
      'body.dr-view-admin-staff .admin-stats .stat-card.dr-stat-admins,body.dr-view-admin-staff .admin-stats .stat-card.me{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;min-width:10rem!important}'
    ].join('');
  }

  function isEndUserRole(role) {
    var r = String(role || '').toLowerCase().trim();
    return r === 'customer' || r === 'end-user' || r === 'enduser' || r === 'end_user' || r === 'user';
  }

  function isStaffRole(role) {
    var r = String(role || '').toLowerCase().trim();
    if (isEndUserRole(r)) return false;
    return (
      r === 'admin' ||
      r === 'agent' ||
      r === 'developer' ||
      r === 'owner' ||
      r === 'staff' ||
      r === 'administrator' ||
      r === 'it tech support' ||
      r.indexOf('tech support') !== -1
    );
  }

  async function refreshStatCounts() {
    try {
      var client = sb();
      if (!client) return;
      var res = await client.from('profiles').select('id,role,username,staff_role');
      var rows = (res && res.data) || [];
      var endUsers = 0;
      var admins = 0;
      rows.forEach(function (u) {
        var role = u.role || u.staff_role || '';
        if (isEndUserRole(role)) endUsers++;
        else if (isStaffRole(role) || isDeveloperUser(u)) admins++;
      });
      var eu = document.getElementById('admin-stat-customers') || document.getElementById('admin-stat-endusers');
      if (eu) eu.textContent = String(endUsers);
      var ad = document.getElementById('admin-stat-admins') || document.getElementById('admin-stat-users');
      if (ad) ad.textContent = String(admins);
      document.querySelectorAll('.admin-stats .stat-card').forEach(function (card) {
        var lab = (card.textContent || '').toLowerCase();
        if (/end-?user|customer/.test(lab)) card.classList.add('dr-stat-endusers');
        if (/admin/.test(lab) && !/end/.test(lab)) card.classList.add('dr-stat-admins');
      });
    } catch (e) {}
  }

  function findAdminNavBtn() {
    var portal = document.getElementById('portal-agent');
    if (!portal) return null;
    var root = portal.querySelector('.nav-btn[data-dr-users-root]');
    if (root) return root;
    var btns = portal.querySelectorAll('.nav-btn');
    for (var j = 0; j < btns.length; j++) {
      var v = (btns[j].getAttribute('data-view') || '').toLowerCase();
      var tx = (btns[j].textContent || '').toLowerCase();
      if (v === 'admin' || v === 'users' || /users/.test(tx)) return btns[j];
    }
    return null;
  }

  function chevronSvg() {
    return '<span class="dr-users-chevron" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg></span>';
  }

  function setUsersLabel(root) {
    if (!root) return;
    root.setAttribute('data-dr-users-root', '1');
    if (root.getAttribute('data-view') === 'admin') root.setAttribute('data-view', 'users');
    var hasChev = root.querySelector('.dr-users-chevron');
    var kids = Array.prototype.slice.call(root.childNodes);
    var textSet = false;
    kids.forEach(function (n) {
      if (n.nodeType === 3 && (n.textContent || '').trim()) {
        if (!textSet) {
          n.textContent = ' Users';
          textSet = true;
        } else n.textContent = '';
      }
    });
    if (!textSet) {
      var span = document.createElement('span');
      span.textContent = 'Users';
      root.appendChild(span);
    }
    if (!hasChev) root.insertAdjacentHTML('beforeend', chevronSvg());
  }

  function hideDuplicateAdminTabs(root) {
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (btn) {
      if (btn === root || btn.closest('#dr-users-sub')) return;
      var v = (btn.getAttribute('data-view') || '').toLowerCase();
      if (v === 'admin' || btn.classList.contains('nav-admin')) btn.style.display = 'none';
    });
  }

  function ensureSubmenu(rootBtn) {
    var sub = document.getElementById('dr-users-sub');
    if (!sub) {
      sub = document.createElement('div');
      sub.id = 'dr-users-sub';
      sub.innerHTML =
        '<button type="button" class="nav-btn" id="dr-users-endusers">End-Users</button>' +
        '<button type="button" class="nav-btn" id="dr-users-admin">Admin</button>';
      rootBtn.insertAdjacentElement('afterend', sub);
    }
    return sub;
  }

  function forceAdminView() {
    var v = document.getElementById('view-admin');
    if (!v) return false;
    document.querySelectorAll('#portal-agent .view, .app-shell .view, section.view').forEach(function (x) {
      if (x.id === 'view-admin') return;
      x.classList.remove('active');
      try {
        x.style.setProperty('display', 'none', 'important');
        x.style.setProperty('visibility', 'hidden', 'important');
      } catch (e) {}
    });
    v.classList.add('active');
    try {
      v.hidden = false;
      v.style.setProperty('display', 'block', 'important');
      v.style.setProperty('visibility', 'visible', 'important');
      v.style.setProperty('opacity', '1', 'important');
    } catch (e2) {}
    var dash = document.getElementById('view-dashboard');
    if (dash) {
      dash.classList.remove('active');
      try { dash.style.setProperty('display', 'none', 'important'); } catch (e3) {}
    }
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (b) {
      if (b.closest('#dr-users-sub')) return;
      if (b.getAttribute('data-dr-users-root')) b.classList.add('active');
      else b.classList.remove('active');
    });
    return true;
  }

  function loadUsersList(mode) {
    function go() {
      if (typeof window.renderAdminUsers === 'function') {
        try {
          window.renderAdminUsers(mode);
          setTimeout(refreshStatCounts, 200);
          setTimeout(refreshStatCounts, 800);
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
    if (!go()) {
      setTimeout(go, 300);
      setTimeout(go, 900);
      setTimeout(go, 1800);
    }
  }

  function openEndUsers() {
    document.body.classList.add('dr-view-endusers');
    document.body.classList.remove('dr-view-admin-staff');
    window.__DR_USERS_LIST_MODE = 'endusers';
    var sub = document.getElementById('dr-users-sub');
    if (sub) sub.classList.add('open');
    forceAdminView();
    var pt = document.getElementById('page-title');
    if (pt) pt.textContent = 'Users · End-Users';
    var fh = document.getElementById('filter-hint');
    if (fh) { fh.style.display = 'none'; fh.textContent = ''; }
    loadUsersList('endusers');
    syncActiveHighlight();
    refreshStatCounts();
  }

  function openAdminStaff() {
    document.body.classList.add('dr-view-admin-staff');
    document.body.classList.remove('dr-view-endusers');
    window.__DR_USERS_LIST_MODE = 'staff';
    var sub = document.getElementById('dr-users-sub');
    if (sub) sub.classList.add('open');
    forceAdminView();
    var pt = document.getElementById('page-title');
    if (pt) pt.textContent = 'Users · Admin';
    var fh = document.getElementById('filter-hint');
    if (fh) { fh.style.display = 'none'; fh.textContent = ''; }
    loadUsersList('staff');
    syncActiveHighlight();
    refreshStatCounts();
  }

  function syncActiveHighlight() {
    var mode = window.__DR_USERS_LIST_MODE || '';
    var eu = document.getElementById('dr-users-endusers');
    var ad = document.getElementById('dr-users-admin');
    var onUsers =
      document.body.classList.contains('dr-view-endusers') ||
      document.body.classList.contains('dr-view-admin-staff') ||
      mode === 'endusers' ||
      mode === 'staff';
    if (eu) {
      var euOn = mode === 'endusers' || document.body.classList.contains('dr-view-endusers');
      eu.classList.toggle('dr-users-active', euOn);
      eu.classList.toggle('active', euOn);
    }
    if (ad) {
      var adOn = mode === 'staff' || document.body.classList.contains('dr-view-admin-staff');
      ad.classList.toggle('dr-users-active', adOn);
      ad.classList.toggle('active', adOn);
    }
    var root = document.querySelector('#portal-agent .nav-btn[data-dr-users-root]');
    if (root) root.classList.toggle('active', onUsers);
  }

  function wire() {
    injectCss();
    var root = findAdminNavBtn();
    if (!root) return;
    setUsersLabel(root);
    hideDuplicateAdminTabs(root);
    var sub = ensureSubmenu(root);
    if (!root.__drUsersWired) {
      root.__drUsersWired = 1;
      root.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (sub) {
          sub.classList.toggle('open');
          root.classList.toggle('dr-users-open', sub.classList.contains('open'));
          root.setAttribute('aria-expanded', sub.classList.contains('open') ? 'true' : 'false');
        }
      });
    }
  }

  function tick() {
    wire();
    if (
      document.body.classList.contains('dr-view-endusers') ||
      document.body.classList.contains('dr-view-admin-staff')
    ) {
      forceAdminView();
      refreshStatCounts();
      var list = document.getElementById('admin-users-list') || document.getElementById('staff-admin-list');
      var empty = !list || !list.querySelector('tbody tr');
      var mode =
        window.__DR_USERS_LIST_MODE ||
        (document.body.classList.contains('dr-view-endusers') ? 'endusers' : 'staff');
      if (empty && typeof window.renderAdminUsers === 'function') {
        try { window.renderAdminUsers(mode); } catch (e) {}
      }
    }
  }

  if (!window.__drUsersNavClickV9) {
    window.__drUsersNavClickV9 = 1;
    document.addEventListener(
      'click',
      function (e) {
        var eu = e.target && e.target.closest && e.target.closest('#dr-users-endusers');
        var ad = e.target && e.target.closest && e.target.closest('#dr-users-admin');
        if (eu) {
          e.preventDefault();
          e.stopPropagation();
          openEndUsers();
          return;
        }
        if (ad) {
          e.preventDefault();
          e.stopPropagation();
          openAdminStaff();
        }
      },
      true
    );
  }

  tick();
  setInterval(tick, 1200);

  window.DRUsersNav = {
    refresh: tick,
    openEndUsers: openEndUsers,
    openAdmin: openAdminStaff,
    isDeveloperUser: isDeveloperUser,
    refreshStats: refreshStatCounts
  };
})();
