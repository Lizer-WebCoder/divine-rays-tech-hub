/**
 * Divine Rays — Users nav
 * Restored base; approval UI is in users-admin-approval-ui.js
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_USERS_NAV) return;
  window.__DR_USERS_NAV = 1;

  var DEVELOPER_USERNAMES = { kirzhian: 1, jamesjerlow123: 1 };

  function isDeveloperUser(u) {
    if (!u) return false;
    return !!DEVELOPER_USERNAMES[String(u.username || '').toLowerCase().trim()];
  }

  function injectCss() {
    if (document.getElementById('dr-users-nav-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-users-nav-css';
    el.textContent =
      '#portal-agent .nav-btn[data-dr-users-root]{position:relative}' +
      '#dr-users-sub{display:none;padding:0.25rem 0 0.5rem 1.25rem}' +
      '#dr-users-sub.open{display:block}' +
      '#dr-users-sub .nav-btn{width:100%;text-align:left;margin:0.15rem 0}' +
      'body.dr-view-endusers #filter-status,body.dr-view-endusers #filter-priority,body.dr-view-endusers #filter-sort,body.dr-view-endusers #btn-clear-filters{display:none!important}' +
      'body.dr-view-admin-staff #filter-status,body.dr-view-admin-staff #filter-priority,body.dr-view-admin-staff #filter-sort,body.dr-view-admin-staff #btn-clear-filters{display:none!important}' +
      '.badge-role-developer{background:rgba(251,191,36,0.2)!important;color:#fbbf24!important}' +
      '.badge-role-pending{background:rgba(251,146,60,0.2)!important;color:#fb923c!important}';
    document.head.appendChild(el);
  }

  function findAdminNavBtn() {
    var btns = document.querySelectorAll('#portal-agent .nav-btn');
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || '').trim().toLowerCase();
      if (t === 'admin' || t === 'users' || t.indexOf('admin') === 0) return btns[i];
    }
    return null;
  }

  function ensureSubmenu(rootBtn) {
    if (!rootBtn) return null;
    var sub = document.getElementById('dr-users-sub');
    if (sub) return sub;
    sub = document.createElement('div');
    sub.id = 'dr-users-sub';
    sub.innerHTML =
      '<button type="button" class="nav-btn" id="dr-users-endusers">End-Users</button>' +
      '<button type="button" class="nav-btn" id="dr-users-admin">Admin</button>';
    if (rootBtn.parentNode) {
      if (rootBtn.nextSibling) rootBtn.parentNode.insertBefore(sub, rootBtn.nextSibling);
      else rootBtn.parentNode.appendChild(sub);
    }
    return sub;
  }

  function openEndUsers() {
    document.body.classList.add('dr-view-endusers');
    document.body.classList.remove('dr-view-admin-staff');
    var sub = document.getElementById('dr-users-sub');
    if (sub) sub.classList.add('open');
    try {
      if (typeof window.showView === 'function') window.showView('view-admin');
      else {
        var v = document.getElementById('view-admin');
        if (v) {
          document.querySelectorAll('#portal-agent .view').forEach(function (x) {
            x.classList.remove('active');
            x.style.display = 'none';
          });
          v.classList.add('active');
          v.style.display = '';
        }
      }
    } catch (e) {}
    var pt = document.getElementById('page-title');
    if (pt) pt.textContent = 'Users · End-Users';
    if (typeof window.renderAdminUsers === 'function') {
      try { window.renderAdminUsers(); } catch (e2) {}
    }
  }

  function openAdminStaff() {
    document.body.classList.add('dr-view-admin-staff');
    document.body.classList.remove('dr-view-endusers');
    var sub = document.getElementById('dr-users-sub');
    if (sub) sub.classList.add('open');
    try {
      if (typeof window.showView === 'function') window.showView('view-admin');
      else {
        var v = document.getElementById('view-admin');
        if (v) {
          document.querySelectorAll('#portal-agent .view').forEach(function (x) {
            x.classList.remove('active');
            x.style.display = 'none';
          });
          v.classList.add('active');
          v.style.display = '';
        }
      }
    } catch (e) {}
    var pt = document.getElementById('page-title');
    if (pt) pt.textContent = 'Users · Admin';
    if (typeof window.renderAdminUsers === 'function') {
      try { window.renderAdminUsers(); } catch (e2) {}
    }
  }

  function wire() {
    injectCss();
    var root = findAdminNavBtn();
    if (!root) return;
    root.setAttribute('data-dr-users-root', '1');
    var label = root.querySelector('span') || root;
    if ((root.textContent || '').indexOf('Users') === -1) {
      try {
        var icon = root.querySelector('svg,i');
        root.textContent = '';
        if (icon) root.appendChild(icon);
        var sp = document.createElement('span');
        sp.textContent = 'Users';
        root.appendChild(sp);
      } catch (e) {
        root.textContent = 'Users';
      }
    }
    var sub = ensureSubmenu(root);
    if (root.__drUsersWired) return;
    root.__drUsersWired = 1;
    root.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (sub) sub.classList.toggle('open');
    });
    var eu = document.getElementById('dr-users-endusers');
    var ad = document.getElementById('dr-users-admin');
    if (eu && !eu.__drWired) {
      eu.__drWired = 1;
      eu.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openEndUsers();
      });
    }
    if (ad && !ad.__drWired) {
      ad.__drWired = 1;
      ad.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openAdminStaff();
      });
    }
  }

  function tick() {
    wire();
  }

  tick();
  setInterval(tick, 2000);
  window.DRUsersNav = {
    refresh: tick,
    openEndUsers: openEndUsers,
    openAdmin: openAdminStaff,
    isDeveloperUser: isDeveloperUser
  };
})();
