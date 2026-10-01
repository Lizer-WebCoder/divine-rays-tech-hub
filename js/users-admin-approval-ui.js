/**
 * Divine Rays — Users > Admin approval UI
 * - Exact Developer usernames only (kirzhian, jamesjerlow123)
 * - New staff default Pending
 * - Actions: Pending badge + Approve / Denied (Developer only)
 * - Denied deletes profile row
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_USERS_ADMIN_APPROVAL_UI) return;
  window.__DR_USERS_ADMIN_APPROVAL_UI = 1;

  var DEVS = { kirzhian: 1, jamesjerlow123: 1 };
  var KEY = 'dr_staff_approval';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function isDev(u) {
    if (!u) return false;
    return !!DEVS[String(u.username || '').toLowerCase().trim()];
  }

  function mapGet() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function mapSet(m) {
    try {
      localStorage.setItem(KEY, JSON.stringify(m || {}));
    } catch (e) {}
  }

  function setStatus(id, status, username, email) {
    var m = mapGet();
    if (id) m[id] = status;
    var un = String(username || '').toLowerCase().trim();
    var em = String(email || '').toLowerCase().trim();
    if (un) {
      if (status === 'approved') {
        m['u:' + un] = 'approved';
        delete m['pending:' + un];
      } else if (status === 'pending') {
        m['pending:' + un] = 'pending';
        delete m['u:' + un];
      } else {
        delete m['pending:' + un];
        delete m['u:' + un];
      }
    }
    if (em) {
      if (status === 'approved') {
        m['e:' + em] = 'approved';
        delete m['pending:' + em];
      } else if (status === 'pending') {
        m['pending:' + em] = 'pending';
        delete m['e:' + em];
      } else {
        delete m['pending:' + em];
        delete m['e:' + em];
      }
    }
    mapSet(m);
  }

  function getStatus(u) {
    if (isDev(u)) return 'approved';
    var m = mapGet();
    if (u && u.id && m[u.id]) return m[u.id];
    var un = String((u && u.username) || '').toLowerCase().trim();
    var em = String((u && u.email) || '').toLowerCase().trim();
    if (un && m['u:' + un] === 'approved') return 'approved';
    if (em && m['e:' + em] === 'approved') return 'approved';
    if (un && m['pending:' + un] === 'pending') return 'pending';
    if (em && m['pending:' + em] === 'pending') return 'pending';
    if (u && (u.role === 'admin' || u.role === 'agent')) return 'pending';
    return 'pending';
  }

  function roleLabel(u) {
    if (isDev(u)) return 'Developer';
    var staff = (u && (u.staff_role || u.job_title)) || '';
    if (!staff) {
      var m = mapGet();
      var k = 'role:' + String((u && u.username) || '').toLowerCase().trim();
      if (m[k]) staff = m[k];
    }
    if (staff) return staff;
    if (u && u.role === 'admin') return 'Admin';
    if (u && u.role === 'agent') return 'IT Tech Support';
    return (u && u.role) || '—';
  }

  function profile() {
    try {
      return window.DR && window.DR.getProfile && window.DR.getProfile();
    } catch (e) {
      return null;
    }
  }

  function sb() {
    try {
      if (window.DR && window.DR.sb) return window.DR.sb();
    } catch (e) {}
    return null;
  }

  async function deleteProfile(id) {
    var client = sb();
    if (!client) return { error: 'Not connected' };
    try {
      var r = await client.from('profiles').delete().eq('id', id);
      if (r && r.error) return { error: r.error.message || 'Delete failed' };
      return { ok: true };
    } catch (e) {
      return { error: e.message || 'Delete failed' };
    }
  }

  function rebuildActionsCell(td, u, viewerDev) {
    if (!td || !u) return;
    var st = getStatus(u);
    var dev = isDev(u);
    var html;
    if (dev) {
      html = '<span class="badge badge-role-developer">Developer</span>';
    } else if (st === 'approved') {
      html =
        '<span class="badge badge-role-admin" style="margin-right:0.35rem">Approved</span>' +
        (viewerDev
          ? '<button type="button" class="btn btn-ghost btn-sm dr-staff-deny" data-id="' +
            esc(u.id) +
            '" data-username="' +
            esc(u.username || '') +
            '" data-email="' +
            esc(u.email || '') +
            '" data-name="' +
            esc(u.full_name || u.username || 'user') +
            '">Denied</button>'
          : '');
    } else {
      html =
        '<span class="badge badge-role-pending" style="margin-right:0.35rem">Pending</span>' +
        (viewerDev
          ? '<button type="button" class="btn btn-sm dr-staff-approve" data-id="' +
            esc(u.id) +
            '" data-username="' +
            esc(u.username || '') +
            '" data-email="' +
            esc(u.email || '') +
            '" style="margin-right:0.25rem">Approve</button>' +
            '<button type="button" class="btn btn-danger btn-sm dr-staff-deny" data-id="' +
            esc(u.id) +
            '" data-username="' +
            esc(u.username || '') +
            '" data-email="' +
            esc(u.email || '') +
            '" data-name="' +
            esc(u.full_name || u.username || 'user') +
            '">Denied</button>'
          : '<span style="opacity:0.65;font-size:0.8rem">Developer only</span>');
    }
    td.innerHTML =
      '<div class="admin-actions" style="display:flex;align-items:center;gap:0.35rem;flex-wrap:wrap;justify-content:center">' +
      html +
      '</div>';
  }

  function polishTable() {
    var box =
      document.getElementById('staff-admin-list') ||
      document.getElementById('admin-users-list');
    if (!box) return;
    var viewerDev = isDev(profile());
    var cache = window.__adminUsersCache || [];
    var rows = box.querySelectorAll('tbody tr');
    rows.forEach(function (row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 5) return;
      var uname = (cells[1].textContent || '').trim();
      var u = null;
      for (var i = 0; i < cache.length; i++) {
        if (cache[i] && String(cache[i].username || '') === uname) {
          u = cache[i];
          break;
        }
      }
      if (!u) {
        /* synthesize from row for pending display */
        u = {
          id: row.getAttribute('data-id') || '',
          username: uname,
          full_name: (cells[0].textContent || '').replace(/\byou\b|\bsuper\b/gi, '').trim(),
          role: 'agent'
        };
        /* try data-id from buttons */
        var anyBtn = row.querySelector('[data-id]');
        if (anyBtn) u.id = anyBtn.getAttribute('data-id') || u.id;
      }

      /* Fix wrong Developer badge from username substring matches */
      if (!isDev(u)) {
        var roleBadge = cells[2].querySelector('.badge');
        if (roleBadge && /developer/i.test(roleBadge.textContent || '')) {
          roleBadge.textContent = roleLabel(u);
          roleBadge.className = 'badge badge-role-pending';
        } else if (roleBadge) {
          roleBadge.textContent = roleLabel(u);
        }
        /* remove super tag */
        cells[0].querySelectorAll('.you-tag').forEach(function (t) {
          if (/super/i.test(t.textContent || '')) t.remove();
        });
      }

      rebuildActionsCell(cells[4], u, viewerDev);
    });

    wireButtons(box);
  }

  function wireButtons(box) {
    box.querySelectorAll('.dr-staff-approve').forEach(function (btn) {
      if (btn.__drWired) return;
      btn.__drWired = 1;
      btn.addEventListener('click', function () {
        if (!isDev(profile())) {
          if (window.DR && window.DR.toast) window.DR.toast('Only Developers can approve accounts', 'error');
          return;
        }
        var id = btn.getAttribute('data-id');
        var un = btn.getAttribute('data-username') || '';
        var em = btn.getAttribute('data-email') || '';
        if (!confirm('Approve this Admin account? They will be able to sign in.')) return;
        setStatus(id, 'approved', un, em);
        if (window.DR && window.DR.toast) window.DR.toast('Account approved — can sign in', 'success');
        polishTable();
        if (window.DRUsersNav && window.DRUsersNav.openAdmin) {
          try { window.DRUsersNav.openAdmin(); } catch (e) {}
        }
      });
    });

    box.querySelectorAll('.dr-staff-deny').forEach(function (btn) {
      if (btn.__drWired) return;
      btn.__drWired = 1;
      btn.addEventListener('click', async function () {
        if (!isDev(profile())) {
          if (window.DR && window.DR.toast) window.DR.toast('Only Developers can deny accounts', 'error');
          return;
        }
        var id = btn.getAttribute('data-id');
        var un = btn.getAttribute('data-username') || '';
        var em = btn.getAttribute('data-email') || '';
        var name = btn.getAttribute('data-name') || 'this account';
        if (!confirm('Deny and remove ' + name + '? This deletes the account.')) return;
        setStatus(id, 'disapproved', un, em);
        var res = await deleteProfile(id);
        if (res.error) {
          if (window.DR && window.DR.toast)
            window.DR.toast('Denied locally, but delete failed: ' + res.error, 'error');
        } else if (window.DR && window.DR.toast) {
          window.DR.toast('Account denied and removed', 'success');
        }
        /* remove row immediately */
        var tr = btn.closest('tr');
        if (tr) tr.remove();
        polishTable();
      });
    });
  }

  /* Also fix isDeveloperUser on window if users-nav exposed internals — patch DOM periodically */
  function tick() {
    polishTable();
  }

  tick();
  setInterval(tick, 1500);
  try {
    new MutationObserver(function () {
      polishTable();
    }).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
})();
