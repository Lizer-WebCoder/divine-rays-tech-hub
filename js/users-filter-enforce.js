/**
 * Divine Rays — enforce Users list filters
 * End-Users view: only end-user accounts
 * Admin view: only admin / agent / developer accounts
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_USERS_FILTER_ENFORCE >= 1) return;
  window.__DR_USERS_FILTER_ENFORCE = 1;

  function mode() {
    if (document.body.classList.contains('dr-view-endusers') || window.__DR_USERS_LIST_MODE === 'endusers') {
      return 'endusers';
    }
    if (document.body.classList.contains('dr-view-admin-staff') || window.__DR_USERS_LIST_MODE === 'staff') {
      return 'staff';
    }
    return window.__DR_USERS_LIST_MODE || '';
  }

  function isEndUserText(s) {
    s = String(s || '').toLowerCase();
    return /end[-_]?user|customer|\buser\b/.test(s) && !/admin|agent|developer|staff|tech support/.test(s);
  }

  function isStaffText(s) {
    s = String(s || '').toLowerCase();
    return /admin|agent|developer|staff|tech support|it tech/.test(s);
  }

  function apply() {
    var m = mode();
    if (!m) return;
    var box =
      document.getElementById('admin-users-list') ||
      document.getElementById('staff-admin-list');
    if (!box) return;
    var rows = box.querySelectorAll('tbody tr');
    if (!rows.length) return;

    rows.forEach(function (row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 3) return;
      var roleCell = cells[2] ? (cells[2].textContent || '') : '';
      var roleSelect = row.querySelector('select');
      var selectVal = roleSelect ? String(roleSelect.value || '') : '';
      var combined = roleCell + ' ' + selectVal;

      var endUser = isEndUserText(combined) || selectVal === 'customer';
      var staff = isStaffText(combined) || /^(admin|agent|developer)$/i.test(selectVal);

      if (m === 'endusers') {
        // Only end-users
        if (staff && !endUser) {
          row.style.display = 'none';
          row.setAttribute('data-dr-filtered', '1');
        } else if (endUser || selectVal === 'customer' || /end-user|customer/i.test(roleCell)) {
          row.style.display = '';
          row.removeAttribute('data-dr-filtered');
        } else if (!endUser && !staff) {
          // unknown — hide from end-users if looks staff-ish
          row.style.display = /admin|agent|dev/i.test(combined) ? 'none' : '';
        } else {
          row.style.display = '';
          row.removeAttribute('data-dr-filtered');
        }
      } else if (m === 'staff') {
        // Only admin / agent / developer
        if (endUser && !staff) {
          row.style.display = 'none';
          row.setAttribute('data-dr-filtered', '1');
        } else {
          row.style.display = '';
          row.removeAttribute('data-dr-filtered');
        }
      }
    });
  }

  // Also patch renderAdminUsers if present
  function patch() {
    if (typeof window.renderAdminUsers !== 'function') return;
    if (window.renderAdminUsers.__drFilterEnforce) return;
    var orig = window.renderAdminUsers;
    window.renderAdminUsers = async function (modeArg) {
      if (modeArg === 'endusers' || modeArg === 'staff') {
        window.__DR_USERS_LIST_MODE = modeArg;
      }
      var r = await orig.apply(this, arguments);
      setTimeout(apply, 50);
      setTimeout(apply, 250);
      setTimeout(apply, 600);
      return r;
    };
    window.renderAdminUsers.__drFilterEnforce = 1;
  }

  function tick() {
    patch();
    apply();
  }

  tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setInterval(apply, 1500);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t) return;
      if (
        t.id === 'dr-users-endusers' ||
        t.id === 'dr-users-admin' ||
        (t.closest && (t.closest('#dr-users-endusers') || t.closest('#dr-users-admin')))
      ) {
        setTimeout(apply, 100);
        setTimeout(apply, 400);
        setTimeout(apply, 900);
      }
    },
    true
  );

  window.DRUsersFilterEnforce = { refresh: apply };
})();
