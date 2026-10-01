/**
 * Divine Rays — Users nav V4 loader
 * Forces the full End-Users / Admin split UI (Role column + approval on Admin tab)
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_USERS_NAV_V4_LOADER) return;
  window.__DR_USERS_NAV_V4_LOADER = 1;

  /* Allow the full nav script to run even if an older users-nav already ran */
  try {
    delete window.__DR_USERS_NAV;
    delete window.__DR_USERS_NAV_V2;
    delete window.__DR_USERS_NAV_V3;
    delete window.__DR_USERS_NAV_V4;
  } catch (e) {
    window.__DR_USERS_NAV = 0;
    window.__DR_USERS_NAV_V2 = 0;
    window.__DR_USERS_NAV_V3 = 0;
    window.__DR_USERS_NAV_V4 = 0;
  }

  var SRC =
    'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@2a3c434aeef8cbb03bcb25cefc1a886a4b2f5feb/js/users-nav.js';
  var s = document.createElement('script');
  s.src = SRC + '?v4=' + Date.now();
  s.async = false;
  s.onload = function () {
    try {
      if (window.DRUsersNav && window.DRUsersNav.refresh) window.DRUsersNav.refresh();
    } catch (e2) {}
    /* After load, strengthen End-Users filter: hide non-customers by profile role */
    function hardenEndUserFilter() {
      if (document.body.classList.contains('dr-view-endusers')) {
        var box = document.getElementById('admin-users-list');
        if (!box) return;
        var cache = window.__adminUsersCache || [];
        box.querySelectorAll('tbody tr').forEach(function (tr) {
          var uid = tr.getAttribute('data-id') || '';
          var role = '';
          for (var i = 0; i < cache.length; i++) {
            if (cache[i] && cache[i].id === uid) {
              role = String(cache[i].role || '').toLowerCase();
              break;
            }
          }
          if (!role) {
            var badge = tr.querySelector('.badge');
            var rs = tr.querySelector('.admin-role-select');
            role = (rs && rs.value) || (badge && badge.textContent) || '';
            role = String(role).toLowerCase();
          }
          var keep = role === 'customer' || role.indexOf('end-user') !== -1 || role.indexOf('enduser') !== -1;
          if (role === 'agent' || role === 'admin') keep = false;
          tr.style.display = keep ? '' : 'none';
        });
      }
    }
    setInterval(hardenEndUserFilter, 800);
    /* Ensure Admin tab uses staff view */
    var adminBtn = document.getElementById('nav-users-admin') || document.getElementById('dr-users-admin');
    if (adminBtn && !adminBtn.__drV4Bound) {
      adminBtn.__drV4Bound = 1;
      adminBtn.addEventListener('click', function () {
        setTimeout(function () {
          try {
            if (window.DRUsersNav && window.DRUsersNav.openAdmin) window.DRUsersNav.openAdmin();
          } catch (e3) {}
        }, 50);
      });
    }
  };
  (document.body || document.documentElement).appendChild(s);
})();
