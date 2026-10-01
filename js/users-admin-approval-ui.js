/**
 * Divine Rays — Users > Admin approval UI
 * - Exact Developer usernames only (kirzhian, jamesjerlow123)
 * - New staff default Pending
 * - Actions: Pending badge + Approve / Denied (Developer only)
 * - Role column shows chosen staff_role
 * - Denied deletes profile row
 * Performance: debounced polish, no body-wide MutationObserver loop
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_USERS_ADMIN_APPROVAL_UI_V2) return;
  window.__DR_USERS_ADMIN_APPROVAL_UI_V2 = 1;
  window.__DR_USERS_ADMIN_APPROVAL_UI = 1;

  var DEVS = { kirzhian: 1, jamesjerlow123: 1 };
  var KEY = 'dr_staff_approval';
  var _polishing = false;
  var _polishTimer = null;
  var _lastFp = '';
  var _obs = null;

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

  function adminBox() {
    return (
      document.getElementById('staff-admin-list') ||
      document.getElementById('admin-users-list')
    );
  }

  function isAdminViewVisible() {
    var box = adminBox();
    if (!box) return false;
    var view = document.getElementById('view-admin');
    if (view && !view.classList.contains('active') && view.style.display === 'none') return false;
    return true;
  }

  function actionsHtml(u, viewerDev) {
    var st = getStatus(u);
    var dev = isDev(u);
    if (dev) {
      return '<span class="badge badge-role-developer">Developer</span>';
    }
    if (st === 'approved') {
      return (
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
          : '')
      );
    }
    return (
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
        : '<span style="opacity:0.65;font-size:0.8rem">Developer only</span>')
    );
  }

  function findUserForRow(row, cells, cache) {
    var u = null;
    var uid = row.getAttribute('data-id') || '';
    if (uid) {
      for (var i = 0; i < cache.length; i++) {
        if (cache[i] && cache[i].id === uid) {
          u = cache[i];
          break;
        }
      }
    }
    if (!u) {
      var uname = cells[1] ? (cells[1].textContent || '').trim() : '';
      for (var j = 0; j < cache.length; j++) {
        if (cache[j] && String(cache[j].username || '') === uname) {
          u = cache[j];
          break;
        }
      }
    }
    if (!u) {
      var uname2 = cells[1] ? (cells[1].textContent || '').trim() : '';
      u = {
        id: uid || '',
        username: uname2,
        full_name: cells[0]
          ? (cells[0].textContent || '').replace(/\byou\b|\bsuper\b/gi, '').trim()
          : '',
        role: 'agent'
      };
      var anyBtn = row.querySelector('[data-id]');
      if (anyBtn) u.id = anyBtn.getAttribute('data-id') || u.id;
    }
    return u;
  }

  function tableFingerprint(box) {
    var rows = box.querySelectorAll('tbody tr');
    var parts = [];
    rows.forEach(function (row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 3) return;
      parts.push(
        (row.getAttribute('data-id') || '') +
          '|' +
          (cells[1].textContent || '').trim() +
          '|' +
          (cells[2].textContent || '').trim() +
          '|' +
          (cells[4] ? (cells[4].textContent || '').trim() : '')
      );
    });
    return parts.join(';;');
  }

  function polishTable() {
    if (_polishing) return;
    var box = adminBox();
    if (!box || !isAdminViewVisible()) return;

    var rows = box.querySelectorAll('tbody tr');
    if (!rows.length) return;

    _polishing = true;
    try {
      var viewerDev = isDev(profile());
      var cache = window.__adminUsersCache || [];

      rows.forEach(function (row) {
        var cells = row.querySelectorAll('td');
        if (cells.length < 5) return;
        var u = findUserForRow(row, cells, cache);

        var roleBadge = cells[2].querySelector('.badge');
        var label = roleLabel(u);
        if (roleBadge) {
          if (roleBadge.textContent !== label) roleBadge.textContent = label;
          var cls;
          if (isDev(u)) cls = 'badge badge-role-developer';
          else if (getStatus(u) === 'pending') cls = 'badge badge-role-pending';
          else if (/admin/i.test(label)) cls = 'badge badge-role-admin';
          else cls = 'badge badge-role-agent';
          if (roleBadge.className !== cls) roleBadge.className = cls;
        }

        cells[0].querySelectorAll('.you-tag').forEach(function (t) {
          if (/super/i.test(t.textContent || '')) t.remove();
        });

        var desired = actionsHtml(u, viewerDev);
        var wrap = cells[4].querySelector('.admin-actions');
        var current = wrap ? wrap.innerHTML : '';
        if (!wrap || current.replace(/\s+/g, ' ') !== desired.replace(/\s+/g, ' ')) {
          cells[4].innerHTML =
            '<div class="admin-actions" style="display:flex;align-items:center;gap:0.35rem;flex-wrap:wrap;justify-content:center">' +
            desired +
            '</div>';
        }
      });

      wireButtons(box);
      _lastFp = tableFingerprint(box);
    } finally {
      setTimeout(function () {
        _polishing = false;
      }, 80);
    }
  }

  function schedulePolish(delay) {
    if (_polishTimer) clearTimeout(_polishTimer);
    _polishTimer = setTimeout(function () {
      _polishTimer = null;
      polishTable();
    }, delay == null ? 120 : delay);
  }

  function wireButtons(box) {
    box.querySelectorAll('.dr-staff-approve').forEach(function (btn) {
      if (btn.__drWired) return;
      btn.__drWired = 1;
      btn.addEventListener('click', function () {
        if (!isDev(profile())) {
          if (window.DR && window.DR.toast)
            window.DR.toast('Only Developers can approve accounts', 'error');
          return;
        }
        var id = btn.getAttribute('data-id');
        var un = btn.getAttribute('data-username') || '';
        var em = btn.getAttribute('data-email') || '';
        if (!confirm('Approve this Admin account? They will be able to sign in.')) return;
        setStatus(id, 'approved', un, em);
        if (window.DR && window.DR.toast)
          window.DR.toast('Account approved — can sign in', 'success');
        schedulePolish(50);
      });
    });

    box.querySelectorAll('.dr-staff-deny').forEach(function (btn) {
      if (btn.__drWired) return;
      btn.__drWired = 1;
      btn.addEventListener('click', async function () {
        if (!isDev(profile())) {
          if (window.DR && window.DR.toast)
            window.DR.toast('Only Developers can deny accounts', 'error');
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
        var tr = btn.closest('tr');
        if (tr) tr.remove();
        schedulePolish(50);
      });
    });
  }

  function observeAdminList() {
    var box = adminBox();
    if (!box) return;
    if (box.__drApprovalObs) return;
    box.__drApprovalObs = 1;
    try {
      _obs = new MutationObserver(function () {
        if (_polishing) return;
        if (!isAdminViewVisible()) return;
        schedulePolish(150);
      });
      _obs.observe(box, { childList: true, subtree: false });
    } catch (e) {}
  }

  function patchRender() {
    if (typeof window.renderAdminUsers !== 'function') return;
    if (window.renderAdminUsers.__drApprovalPatch) return;
    var orig = window.renderAdminUsers;
    window.renderAdminUsers = async function () {
      var r = await orig.apply(this, arguments);
      observeAdminList();
      schedulePolish(100);
      schedulePolish(400);
      return r;
    };
    window.renderAdminUsers.__drApprovalPatch = 1;
  }

  function tick() {
    patchRender();
    observeAdminList();
    if (isAdminViewVisible()) schedulePolish(50);
  }

  tick();
  setInterval(function () {
    if (!isAdminViewVisible()) return;
    patchRender();
    observeAdminList();
    var box = adminBox();
    if (!box) return;
    var fp = tableFingerprint(box);
    if (fp !== _lastFp) schedulePolish(80);
  }, 4000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t) return;
      if (t.id === 'dr-users-admin' || (t.closest && t.closest('#dr-users-admin'))) {
        schedulePolish(200);
        schedulePolish(600);
      }
    },
    true
  );
})();
