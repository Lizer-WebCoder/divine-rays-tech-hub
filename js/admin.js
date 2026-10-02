/**
 * Divine Rays — Admin module (no-flicker V7)
 * End-Users: customers only | Admin: staff Status/Approve/Deny
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_V7) return;
  window.__DR_ADMIN_V7 = 1;
  window.__DR_ADMIN_V6_LOADER = 99;
  window.__DR_ADMIN_V6_PATCH = 99;

  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };
  var KEY = 'dr_staff_approval';

  function DR() { return window.DR || {}; }
  function sb() { return DR().sb && DR().sb(); }
  function toast(m, t) { if (DR().toast) DR().toast(m, t); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function fmt(d) { return DR().fmt ? DR().fmt(d) : (d || ''); }
  function isDev(name) { return !!DEVS[String(name || '').toLowerCase().trim()]; }
  function canManage(profile) {
    if (!profile) return false;
    if (String(profile.role || '').toLowerCase() === 'admin') return true;
    return isDev(profile.username);
  }
  function mapGet() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function mapSet(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m || {})); } catch (e) {}
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
  function roleLabel(u) {
    if (isDev(u.username)) return 'Developer';
    var r = String(u.role || '').toLowerCase();
    if (r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser') return 'End-User';
    var staff = (u.staff_role || u.job_title || '').trim();
    if (staff && !/^agent$/i.test(staff) && !/^developer$/i.test(staff)) return staff;
    if (r === 'admin') return 'Admin';
    if (r === 'agent') return 'IT Tech Support';
    return u.role || '\u2014';
  }
  function roleCls(u, label) {
    if (isDev(u.username)) return 'badge badge-role-developer';
    var r = String(u.role || '').toLowerCase();
    if (r === 'customer' || /end-user/i.test(label)) return 'badge badge-role-customer';
    if (/admin/i.test(label) && !/it tech/i.test(label)) return 'badge badge-role-admin';
    return 'badge badge-role-agent';
  }
  async function ask(msg) {
    try {
      if (window.DRDialog && DRDialog.confirm) return !!(await DRDialog.confirm(msg));
    } catch (e) {}
    return window.confirm(msg);
  }
  async function fetchAllProfiles() {
    var client = sb();
    if (!client) return [];
    var r = await client.from('profiles').select('id,full_name,role,username,email,created_at,staff_role').order('created_at', { ascending: false });
    if (r.error) {
      var r2 = await client.from('profiles').select('id,full_name,role,username,email,created_at').order('created_at', { ascending: false });
      if (r2.error) {
        var r3 = await client.from('profiles').select('id,full_name,role,username,created_at').order('created_at', { ascending: false });
        return r3.error ? [] : (r3.data || []);
      }
      return r2.data || [];
    }
    return r.data || [];
  }
  async function updateUserProfile(userId, fields) {
    var patch = {};
    if (fields.full_name !== undefined) patch.full_name = fields.full_name;
    if (fields.username !== undefined) patch.username = fields.username || null;
    if (fields.email !== undefined) patch.email = fields.email || null;
    var r = await sb().from('profiles').update(patch).eq('id', userId).select().single();
    return r.error ? { error: r.error.message } : { profile: r.data };
  }
  async function deleteUserProfile(userId) {
    var client = sb();
    try { await client.from('notifications').delete().eq('user_id', userId); } catch (e) {}
    try { await client.from('tickets').update({ assigned_to: null }).eq('assigned_to', userId); } catch (e) {}
    try { await client.from('tickets').update({ assignee_id: null }).eq('assignee_id', userId); } catch (e) {}
    var r = await client.from('profiles').delete().eq('id', userId);
    return r.error ? { error: r.error.message } : { ok: true };
  }
  async function sendPasswordReset(email) {
    var client = sb();
    if (!client || !email) return { error: 'Missing email' };
    var r = await client.auth.resetPasswordForEmail(email);
    return r.error ? { error: r.error.message } : { ok: true };
  }
  function injectCss() {
    try { var o = document.getElementById('dr-admin-v7-css'); if (o) o.remove(); } catch (e0) {}
    var el = document.getElementById('dr-admin-v8-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-admin-v8-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent =
      '#view-admin > .admin-hint{display:none!important}' +
      'body.dr-view-admin-staff #search-input,body.dr-view-endusers #search-input,' +
      'body.dr-view-admin-staff #filter-status,body.dr-view-endusers #filter-status,' +
      'body.dr-view-admin-staff #filter-priority,body.dr-view-endusers #filter-priority,' +
      'body.dr-view-admin-staff #filter-sort,body.dr-view-endusers #filter-sort,' +
      'body.dr-view-admin-staff #btn-clear-filters,body.dr-view-endusers #btn-clear-filters{display:none!important}' +
      'body.dr-view-admin-staff .admin-stats{display:flex!important;flex-wrap:wrap!important;gap:0.85rem!important;max-width:none!important;width:auto!important}' +
      'body.dr-view-admin-staff .admin-stats .stat-card{display:flex!important;flex-direction:column!important;min-width:9.5rem!important;padding:0.9rem 1.15rem!important;opacity:1!important;visibility:visible!important}' +
      'body.dr-view-admin-staff .admin-stats .stat-card:nth-child(2){display:none!important}' +
      'body.dr-view-admin-staff #admin-stat-users,body.dr-view-admin-staff #admin-stat-agents,body.dr-view-admin-staff #admin-stat-admins{display:block!important}' +
      'body.dr-view-endusers .admin-stats .stat-card{display:none!important}' +
      'body.dr-view-endusers .admin-stats .stat-card:nth-child(2){display:flex!important;flex-direction:column!important;min-width:10rem!important}' +
      'body.dr-view-endusers #admin-stat-customers{display:block!important}' +
      '.admin-table{width:100%;border-collapse:collapse}' +
      'body.dr-view-admin-staff .admin-table th:nth-child(3),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(3),' +
      'body.dr-view-admin-staff .admin-table th:nth-child(4),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(4),' +
      'body.dr-view-admin-staff .admin-table th:nth-child(5),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(5),' +
      'body.dr-view-admin-staff .admin-table th:nth-child(6),' +
      'body.dr-view-admin-staff .admin-table td:nth-child(6){text-align:center!important;vertical-align:middle!important}' +
      '.admin-table .admin-actions{display:inline-flex!important;align-items:center;justify-content:center;gap:0.35rem;flex-wrap:wrap}' +
      '.badge-role-customer{background:rgba(96,165,250,0.2)!important;color:#60a5fa!important}' +
      '.badge-role-developer{background:rgba(251,191,36,0.2)!important;color:#fbbf24!important}' +
      '.badge-role-admin{background:rgba(167,139,250,0.2)!important;color:#a78bfa!important}' +
      '.badge-role-agent{background:rgba(96,165,250,0.2)!important;color:#60a5fa!important}' +
      'body.dr-view-admin-staff .admin-role-select,' +
      'body.dr-view-admin-staff .admin-btn-edit,' +
      'body.dr-view-admin-staff .admin-btn-del{display:none!important}';
  }
  function hideShowingMeta() {
    try {
      document.querySelectorAll('.topbar, header.topbar, .main > header').forEach(function (bar) {
        bar.querySelectorAll('p, span, div, small').forEach(function (n) {
          if (n.id === 'page-title' || n.closest('#page-title') || n.closest('.topbar-actions')) return;
          var t = (n.textContent || '').trim();
          if (/^Showing\s+\d+/i.test(t) || /^Page\s+\d+/i.test(t)) {
            n.style.display = 'none';
          }
        });
      });
    } catch (e) {}
  }
  function isEndUser(u) {
    var r = String(u.role || '').toLowerCase();
    return r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser';
  }
  function isStaffUser(u) {
    return !isEndUser(u);
  }
  window.renderAdminUsers = async function (mode) {
    injectCss();
    hideShowingMeta();
    mode = mode || window.__DR_USERS_LIST_MODE || 'endusers';
    window.__DR_USERS_LIST_MODE = mode;
    if (mode === 'endusers') {
      document.body.classList.add('dr-view-endusers');
      document.body.classList.remove('dr-view-admin-staff');
    } else {
      document.body.classList.add('dr-view-admin-staff');
      document.body.classList.remove('dr-view-endusers');
    }
    var list = document.getElementById('admin-users-list');
    if (!list) return;
    list.innerHTML = '<p class="empty-state">Loading\u2026</p>';
    var users = await fetchAllProfiles();
    var filtered = users.filter(function (u) {
      return mode === 'endusers' ? isEndUser(u) : isStaffUser(u);
    });
    var counts = { customer: 0, agent: 0, admin: 0 };
    users.forEach(function (u) {
      if (isEndUser(u)) counts.customer++;
      else {
        var r = String(u.role || '').toLowerCase();
        if (r === 'agent') counts.agent++;
        else counts.admin++;
      }
    });
    var el;
    el = document.getElementById('admin-stat-users'); if (el) el.textContent = String(counts.agent + counts.admin);
    el = document.getElementById('admin-stat-customers'); if (el) el.textContent = String(counts.customer);
    el = document.getElementById('admin-stat-agents'); if (el) el.textContent = String(counts.agent);
    el = document.getElementById('admin-stat-admins'); if (el) el.textContent = String(counts.admin);

    if (!filtered.length) {
      list.innerHTML = '<p class="empty-state">No users found.</p>';
      return;
    }

    var profile = (DR().getProfile && DR().getProfile()) || null;
    var manage = canManage(profile);

    var rows = filtered.map(function (u) {
      var label = roleLabel(u);
      var cls = roleCls(u, label);
      var status = getStatus(u);
      var statusHtml = status === 'approved'
        ? '<span class="badge" style="background:rgba(34,197,94,.2);color:#86efac">Approved</span>'
        : '<span class="badge" style="background:rgba(251,146,60,.2);color:#fb923c">Pending</span>';
      var actions = '';
      if (mode === 'staff' && manage) {
        if (status !== 'approved') {
          actions += '<button type="button" class="btn btn-primary btn-sm admin-btn-approve" data-id="' + esc(u.id) + '">Approve</button>';
        }
        actions += '<button type="button" class="btn btn-secondary btn-sm admin-btn-deny" data-id="' + esc(u.id) + '">Deny</button>';
      }
      if (mode === 'endusers' && manage) {
        actions +=
          '<button type="button" class="btn btn-primary btn-sm admin-btn-view" data-id="' + esc(u.id) + '">View</button>' +
          '<button type="button" class="btn btn-secondary btn-sm admin-btn-edit" data-id="' + esc(u.id) + '">Edit</button>' +
          '<button type="button" class="btn btn-danger btn-sm admin-btn-del" data-id="' + esc(u.id) + '">Delete</button>';
      }
      return (
        '<tr data-id="' + esc(u.id) + '">' +
        '<td>' + esc(u.full_name || u.email || '\u2014') + '</td>' +
        '<td>' + esc(u.username || '\u2014') + '</td>' +
        '<td><span class="' + cls + '">' + esc(label) + '</span></td>' +
        '<td>' + esc(fmt(u.created_at)) + '</td>' +
        (mode === 'staff' ? '<td class="admin-status-cell">' + statusHtml + '</td>' : '') +
        '<td class="admin-actions">' + actions + '</td>' +
        '</tr>'
      );
    }).join('');

    var head =
      '<table class="admin-table"><thead><tr>' +
      '<th>NAME</th><th>USERNAME</th><th>ROLE</th><th>JOINED</th>' +
      (mode === 'staff' ? '<th>STATUS</th>' : '') +
      '<th>ACTIONS</th></tr></thead><tbody>' +
      rows +
      '</tbody></table>';
    list.innerHTML = head;

    list.querySelectorAll('.admin-btn-approve').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-id');
        var u = filtered.find(function (x) { return x.id === id; });
        if (!u) return;
        setStatus(id, 'approved', u.username, u.email);
        toast('Approved', 'success');
        window.renderAdminUsers(mode);
      };
    });
    list.querySelectorAll('.admin-btn-deny').forEach(function (btn) {
      btn.onclick = async function () {
        var id = btn.getAttribute('data-id');
        if (!(await ask('Deny / revoke this staff account?'))) return;
        var u = filtered.find(function (x) { return x.id === id; });
        setStatus(id, 'pending', u && u.username, u && u.email);
        toast('Set to pending', 'success');
        window.renderAdminUsers(mode);
      };
    });
    list.querySelectorAll('.admin-btn-del').forEach(function (btn) {
      btn.onclick = async function () {
        var id = btn.getAttribute('data-id');
        if (!(await ask('Delete this profile? Login may still exist in Supabase Auth.'))) return;
        var r = await deleteUserProfile(id);
        if (r.error) { toast(r.error, 'error'); return; }
        toast('Profile deleted', 'success');
        window.renderAdminUsers(mode);
      };
    });
  };

  function boot() {
    injectCss();
    setInterval(injectCss, 3000);
    setInterval(hideShowingMeta, 2000);
    setTimeout(function () {
      if (typeof window.renderAdminUsers === 'function') {
        window.renderAdminUsers.__drV7 = 1;
      }
    }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
