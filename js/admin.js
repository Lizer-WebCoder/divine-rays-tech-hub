/**
 * Divine Rays Tech Hub — Admin module
 * Manage roles, edit name/username, delete users, send password reset
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function DR() { return window.DR || {}; }
  function sb() { return DR().sb && DR().sb(); }
  function toast(m, t) { if (DR().toast) DR().toast(m, t); }
  function esc(s) { return DR().esc ? DR().esc(s) : String(s || ''); }
  function fmt(d) { return DR().fmt ? DR().fmt(d) : (d || ''); }

  async function fetchAllProfiles() {
    var client = sb();
    if (!client) return [];
    var r = await client
      .from('profiles')
      .select('id,full_name,role,username,email,created_at')
      .order('created_at', { ascending: false });
    if (r.error) {
      var r2 = await client
        .from('profiles')
        .select('id,full_name,role,username,created_at')
        .order('created_at', { ascending: false });
      return r2.error ? [] : (r2.data || []);
    }
    return r.data || [];
  }

  async function updateUserRole(userId, role) {
    var r = await sb().from('profiles').update({ role: role }).eq('id', userId).select().single();
    return r.error ? { error: r.error.message } : { profile: r.data };
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
    if (!email) return { error: 'No email on file for this user' };
    var r = await sb().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + window.location.pathname
    });
    return r.error ? { error: r.error.message } : { ok: true };
  }

  function ensureModal() {
    if (document.getElementById('admin-edit-modal')) return;
    var wrap = document.createElement('div');
    wrap.id = 'admin-edit-modal';
    wrap.className = 'admin-modal-overlay is-hidden';
    wrap.innerHTML =
      '<div class="admin-modal" role="dialog" aria-labelledby="admin-modal-title">' +
      '<h3 id="admin-modal-title">Edit user</h3>' +
      '<input type="hidden" id="admin-edit-id" />' +
      '<div class="form-group"><label for="admin-edit-name">Full name</label>' +
      '<input type="text" id="admin-edit-name" autocomplete="off" /></div>' +
      '<div class="form-group"><label for="admin-edit-username">Username</label>' +
      '<input type="text" id="admin-edit-username" autocomplete="off" placeholder="optional" /></div>' +
      '<div class="form-group"><label for="admin-edit-email">Email (for password reset)</label>' +
      '<input type="email" id="admin-edit-email" autocomplete="off" /></div>' +
      '<p class="admin-modal-hint">Password cannot be set directly here. Use <strong>Send reset email</strong> so the user chooses a new password.</p>' +
      '<div class="admin-modal-actions">' +
      '<button type="button" class="btn btn-ghost" id="admin-edit-cancel">Cancel</button>' +
      '<button type="button" class="btn btn-secondary" id="admin-edit-reset">Send reset email</button>' +
      '<button type="button" class="btn btn-primary" id="admin-edit-save">Save</button>' +
      '</div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) closeModal(); });
    document.getElementById('admin-edit-cancel').addEventListener('click', closeModal);
    document.getElementById('admin-edit-save').addEventListener('click', saveEdit);
    document.getElementById('admin-edit-reset').addEventListener('click', doResetPassword);
  }

  function openModal(user) {
    ensureModal();
    document.getElementById('admin-edit-modal').classList.remove('is-hidden');
    document.getElementById('admin-edit-id').value = user.id;
    document.getElementById('admin-edit-name').value = user.full_name || '';
    document.getElementById('admin-edit-username').value = user.username || '';
    document.getElementById('admin-edit-email').value = user.email || '';
  }

  function closeModal() {
    var m = document.getElementById('admin-edit-modal');
    if (m) m.classList.add('is-hidden');
  }

  async function saveEdit() {
    var id = document.getElementById('admin-edit-id').value;
    var full_name = document.getElementById('admin-edit-name').value.trim();
    var username = document.getElementById('admin-edit-username').value.trim();
    var email = document.getElementById('admin-edit-email').value.trim();
    if (!id) return;
    if (!full_name) { toast('Name is required', 'error'); return; }
    var r = await updateUserProfile(id, { full_name: full_name, username: username, email: email });
    if (r.error) { toast(r.error, 'error'); return; }
    toast('User updated', 'success');
    closeModal();
    renderAdminUsers();
  }

  async function doResetPassword() {
    var email = document.getElementById('admin-edit-email').value.trim();
    if (!email) { toast('Add an email first, then save or send reset', 'error'); return; }
    if (!confirm('Send password reset email to ' + email + '?')) return;
    var r = await sendPasswordReset(email);
    if (r.error) { toast(r.error, 'error'); return; }
    toast('Password reset email sent to ' + email, 'success');
  }

  async function renderAdminUsers() {
    var profile = DR().getProfile && DR().getProfile();
    if (!profile || profile.role !== 'admin') {
      toast('Admin only', 'error');
      return;
    }
    ensureModal();
    var box = document.getElementById('admin-users-list');
    if (!box) return;
    box.innerHTML = '<div class="empty-state"><p>Loading users…</p></div>';

    var users = await fetchAllProfiles();
    var qEl = document.getElementById('admin-search');
    var q = ((qEl && qEl.value) || '').toLowerCase().trim();
    var roleFilter = (document.getElementById('admin-filter-role') || {}).value || '';

    var filtered = users.filter(function (u) {
      if (roleFilter && u.role !== roleFilter) return false;
      if (!q) return true;
      var hay = ((u.full_name || '') + ' ' + (u.username || '') + ' ' + (u.email || '') + ' ' + (u.role || '')).toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var counts = { customer: 0, agent: 0, admin: 0 };
    users.forEach(function (u) {
      if (counts[u.role] !== undefined) counts[u.role]++;
    });
    var el;
    el = document.getElementById('admin-stat-users'); if (el) el.textContent = users.length;
    el = document.getElementById('admin-stat-customers'); if (el) el.textContent = counts.customer;
    el = document.getElementById('admin-stat-agents'); if (el) el.textContent = counts.agent;
    el = document.getElementById('admin-stat-admins'); if (el) el.textContent = counts.admin;

    if (!filtered.length) {
      box.innerHTML = '<p class="empty-state" style="padding:1rem">No users found.</p>';
      return;
    }

    box.innerHTML =
      '<table class="perf-table admin-table"><thead><tr>' +
      '<th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Actions</th>' +
      '</tr></thead><tbody>' +
      filtered
        .map(function (u) {
          var mine = profile && u.id === profile.id;
          var roleSelect =
            '<select class="admin-role-select" data-id="' + u.id + '"' + (mine ? ' disabled' : '') + '>' +
            ['customer', 'agent', 'admin']
              .map(function (r) {
                return '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + r + '</option>';
              })
              .join('') +
            '</select>';
          var actions =
            '<div class="admin-actions">' +
            roleSelect +
            '<button type="button" class="btn btn-ghost btn-sm admin-btn-edit" data-id="' + u.id + '">Edit</button>' +
            (mine
              ? ''
              : '<button type="button" class="btn btn-danger btn-sm admin-btn-del" data-id="' +
                u.id +
                '" data-name="' +
                esc(u.full_name || u.username || 'user') +
                '">Delete</button>') +
            '</div>';
          return (
            '<tr' + (mine ? ' class="mine"' : '') + ' data-user-id="' + u.id + '">' +
            '<td>' + esc(u.full_name || 'User') + (mine ? ' <span class="you-tag">you</span>' : '') + '</td>' +
            '<td>' + esc(u.username || '—') + '</td>' +
            '<td><span class="badge badge-role-' + esc(u.role) + '">' + esc(u.role) + '</span></td>' +
            '<td>' + fmt(u.created_at) + '</td>' +
            '<td>' + actions + '</td></tr>'
          );
        })
        .join('') +
      '</tbody></table>' +
      '<p class="admin-hint" style="margin-top:0.75rem">Delete removes the profile from the app. To fully remove login access, also delete the user under Supabase → Authentication → Users.</p>';

    window.__adminUsersCache = users;

    box.querySelectorAll('.admin-role-select').forEach(function (sel) {
      sel.addEventListener('change', async function () {
        var id = sel.getAttribute('data-id');
        var role = sel.value;
        if (!id || !role) return;
        if (!confirm('Change this user to ' + role + '?')) { renderAdminUsers(); return; }
        var r = await updateUserRole(id, role);
        if (r.error) { toast(r.error, 'error'); renderAdminUsers(); return; }
        toast('Role updated to ' + role, 'success');
        renderAdminUsers();
      });
    });

    box.querySelectorAll('.admin-btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var u = (window.__adminUsersCache || []).find(function (x) { return x.id === id; });
        if (u) openModal(u);
      });
    });

    box.querySelectorAll('.admin-btn-del').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name') || 'this user';
        if (!confirm('Delete ' + name + '?\n\nThis removes their profile from the app. You cannot undo this.')) return;
        if (!confirm('Really delete ' + name + '?')) return;
        btn.disabled = true;
        var r = await deleteUserProfile(id);
        if (r.error) { toast(r.error, 'error'); btn.disabled = false; return; }
        toast('User profile deleted', 'success');
        renderAdminUsers();
      });
    });
  }

  window.renderAdminUsers = renderAdminUsers;

  function bindAdminChrome() {
    var ar = document.getElementById('btn-admin-refresh');
    if (ar && !ar.__adminBound) {
      ar.__adminBound = true;
      ar.addEventListener('click', function () { renderAdminUsers(); });
    }
    var as = document.getElementById('admin-search');
    if (as && !as.__adminBound) {
      as.__adminBound = true;
      as.addEventListener('input', function () { renderAdminUsers(); });
    }
    var afr = document.getElementById('admin-filter-role');
    if (afr && !afr.__adminBound) {
      afr.__adminBound = true;
      afr.addEventListener('change', function () { renderAdminUsers(); });
    }
  }

  function boot() {
    bindAdminChrome();
    var obs = new MutationObserver(function () {
      var v = document.getElementById('view-admin');
      if (v && v.classList.contains('active')) bindAdminChrome();
    });
    var shell = document.getElementById('app-shell') || document.body;
    obs.observe(shell, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
