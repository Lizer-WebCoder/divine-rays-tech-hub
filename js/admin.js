/**
 * Divine Rays — Admin V6 loader
 * End-Users: customer only | Admin: admin/agent/developer only
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_V6_LOADER >= 2) return;
  window.__DR_ADMIN_V6_LOADER = 2;

  var SRC =
    'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@4aae81525261cbee2a3cd15a9894b548df748e86/js/admin.js';
  var s = document.createElement('script');
  s.src = SRC + '?v6=' + Date.now();
  s.async = false;
  s.onload = function () {
    try {
      if (window.__DR_ADMIN_V6_PATCH >= 2) return;
      window.__DR_ADMIN_V6_PATCH = 2;
    } catch (e0) {}

    var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
    var KEY = 'dr_staff_approval';

    function esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"');
    }
    function mapGet() {
      try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
      catch (e) { return {}; }
    }
    function mapSet(m) {
      try { localStorage.setItem(KEY, JSON.stringify(m || {})); } catch (e) {}
    }
    function isDev(name) {
      return !!DEVS[String(name || '').toLowerCase().trim()];
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
    function profile() {
      try { return window.DR && window.DR.getProfile && window.DR.getProfile(); }
      catch (e) { return null; }
    }
    function isEndUserMode() {
      if (window.__DR_USERS_LIST_MODE === 'endusers') return true;
      if (window.__DR_USERS_LIST_MODE === 'staff') return false;
      if (document.body.classList.contains('dr-view-endusers')) return true;
      if (document.body.classList.contains('dr-view-admin-staff')) return false;
      var pt = document.getElementById('page-title');
      var t = pt ? (pt.textContent || '') : '';
      if (/end-user/i.test(t)) return true;
      return false;
    }
    function isEndUserRecord(u, badgeTxt) {
      var r = String((u && u.role) || '').toLowerCase().trim();
      if (r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'end_user') return true;
      if (/end[-_]?user|customer/i.test(badgeTxt || '')) return true;
      return false;
    }
    function isStaffRecord(u, badgeTxt) {
      if (isEndUserRecord(u, badgeTxt)) return false;
      var r = String((u && u.role) || '').toLowerCase().trim();
      if (r === 'admin' || r === 'agent' || r === 'developer' || r === 'staff') return true;
      if (isDev(u && u.username)) return true;
      if (/admin|agent|developer|it tech|staff/i.test(badgeTxt || '')) return true;
      return !!r;
    }

    function polishTable() {
      var box = document.getElementById('admin-users-list');
      if (!box) return;
      var endMode = isEndUserMode();
      var cache = window.__adminUsersCache || [];
      var me = profile();
      var vDev = me && isDev(me.username);

      box.querySelectorAll('tbody tr').forEach(function (row) {
        var cells = row.querySelectorAll('td');
        if (cells.length < 3) return;

        var uid = row.getAttribute('data-id') || '';
        var uname = cells[1] ? (cells[1].textContent || '').trim() : '';
        var badgeTxt = '';
        if (cells[2]) {
          var b = cells[2].querySelector('.badge');
          badgeTxt = b ? (b.textContent || '').trim() : (cells[2].textContent || '').trim();
        }
        var selectVal = '';
        var sel = row.querySelector('select');
        if (sel) selectVal = String(sel.value || '');

        var u = null;
        for (var i = 0; i < cache.length; i++) {
          if (cache[i] && (cache[i].id === uid || cache[i].username === uname)) {
            u = cache[i];
            break;
          }
        }
        if (!u) {
          u = {
            id: uid,
            username: uname,
            full_name: cells[0] ? (cells[0].textContent || '').trim() : '',
            role: selectVal || (/end-user|customer/i.test(badgeTxt) ? 'customer' : 'agent'),
            email: ''
          };
        }

        var endUser = isEndUserRecord(u, badgeTxt) || selectVal === 'customer';
        var staff = isStaffRecord(u, badgeTxt) || /^(admin|agent|developer)$/i.test(selectVal);

        /* FILTER */
        if (endMode) {
          if (!endUser || (staff && !endUser)) {
            row.style.display = 'none';
            return;
          }
          row.style.display = '';
          var badge = cells[2].querySelector('.badge');
          if (badge) {
            badge.textContent = 'End-User';
            badge.className = 'badge badge-role-customer';
          }
          return;
        }

        /* Staff / Admin mode */
        if (endUser && !staff) {
          row.style.display = 'none';
          return;
        }
        row.style.display = '';

        /* Ensure 6 columns for Status + Actions */
        while (cells.length < 6) {
          var extra = document.createElement('td');
          row.appendChild(extra);
          cells = row.querySelectorAll('td');
        }

        var thead = box.querySelector('thead tr');
        if (thead) {
          var ths = thead.querySelectorAll('th');
          if (ths.length === 5) {
            ths[4].textContent = 'Status';
            var thA = document.createElement('th');
            thA.textContent = 'Actions';
            thead.appendChild(thA);
          } else if (ths.length >= 6) {
            ths[4].textContent = 'Status';
            ths[5].textContent = 'Actions';
          }
        }

        var label = roleLabel(u);
        var badge2 = cells[2].querySelector('.badge');
        if (!badge2) {
          cells[2].innerHTML = '<span class="badge"></span>';
          badge2 = cells[2].querySelector('.badge');
        }
        if (badge2) {
          badge2.textContent = label;
          if (isDev(u.username)) badge2.className = 'badge badge-role-developer';
          else if (/admin/i.test(label) && !/it tech/i.test(label)) badge2.className = 'badge badge-role-admin';
          else badge2.className = 'badge badge-role-agent';
        }

        var st = getStatus(u);
        var statusHtml;
        var actionHtml;
        if (isDev(u.username)) {
          statusHtml = '<span class="badge badge-role-developer">Developer</span>';
          actionHtml = '';
        } else if (st === 'approved') {
          statusHtml =
            '<span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399">Approved</span>';
          actionHtml = '';
        } else {
          statusHtml =
            '<span class="badge" style="background:rgba(251,146,60,0.2);color:#fb923c">Pending</span>';
          actionHtml = vDev
            ? '<button type="button" class="btn btn-sm btn-primary dr-v6-approve" data-id="' +
              esc(u.id) +
              '" data-username="' +
              esc(u.username || '') +
              '" data-email="' +
              esc(u.email || '') +
              '">Approve</button>' +
              '<button type="button" class="btn btn-danger btn-sm dr-v6-deny" data-id="' +
              esc(u.id) +
              '" data-username="' +
              esc(u.username || '') +
              '" data-email="' +
              esc(u.email || '') +
              '" data-name="' +
              esc(u.full_name || u.username || 'user') +
              '">Deny</button>'
            : '<span style="opacity:0.65;font-size:0.8rem">Developer only</span>';
        }

        cells[4].className = 'admin-status-cell';
        cells[4].innerHTML = statusHtml;
        cells[5].className = 'admin-actions-cell';
        cells[5].innerHTML =
          '<div class="admin-actions" style="display:inline-flex;gap:0.35rem;justify-content:center;flex-wrap:wrap">' +
          actionHtml +
          '</div>';
      });

      box.querySelectorAll('.dr-v6-approve').forEach(function (btn) {
        if (btn.__v6) return;
        btn.__v6 = 1;
        btn.addEventListener('click', function () {
          if (!confirm('Approve this account? They can sign in to the agent portal.')) return;
          setStatus(
            btn.getAttribute('data-id'),
            'approved',
            btn.getAttribute('data-username'),
            btn.getAttribute('data-email')
          );
          if (window.DR && window.DR.toast) window.DR.toast('Account approved', 'success');
          if (typeof window.renderAdminUsers === 'function') window.renderAdminUsers('staff');
          setTimeout(polishTable, 200);
        });
      });
      box.querySelectorAll('.dr-v6-deny').forEach(function (btn) {
        if (btn.__v6) return;
        btn.__v6 = 1;
        btn.addEventListener('click', async function () {
          var name = btn.getAttribute('data-name') || 'this account';
          if (!confirm('Deny and permanently remove ' + name + '?')) return;
          var id = btn.getAttribute('data-id');
          setStatus(
            id,
            'disapproved',
            btn.getAttribute('data-username'),
            btn.getAttribute('data-email')
          );
          try {
            var client = window.DR && window.DR.sb && window.DR.sb();
            if (client) await client.from('profiles').delete().eq('id', id);
          } catch (e) {}
          if (window.DR && window.DR.toast) window.DR.toast('Account denied and removed', 'success');
          if (typeof window.renderAdminUsers === 'function') window.renderAdminUsers('staff');
          setTimeout(polishTable, 200);
        });
      });
    }

    if (typeof window.renderAdminUsers === 'function' && !window.renderAdminUsers.__v6patch2) {
      var orig = window.renderAdminUsers;
      window.renderAdminUsers = async function (mode) {
        if (mode === 'endusers' || mode === 'staff') window.__DR_USERS_LIST_MODE = mode;
        var r = await orig.apply(this, arguments);
        setTimeout(polishTable, 60);
        setTimeout(polishTable, 250);
        setTimeout(polishTable, 600);
        return r;
      };
      window.renderAdminUsers.__v6patch2 = 1;
    }

    setInterval(polishTable, 1500);
    setTimeout(polishTable, 400);
    setTimeout(polishTable, 1200);
  };
  (document.body || document.documentElement).appendChild(s);
})();
