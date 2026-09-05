/**
 * Divine Rays Tech Hub — Admin module v6.6
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  async function fetchAllProfiles() {
    var DR = window.DR;
    if (!DR || !DR.sb()) return [];
    var r = await DR.sb().from('profiles').select('id,full_name,role,username,created_at').order('created_at', { ascending: false });
    return r.error ? [] : (r.data || []);
  }
  async function updateUserRole(userId, role) {
    var r = await window.DR.sb().from('profiles').update({ role: role }).eq('id', userId).select().single();
    return r.error ? { error: r.error.message } : { profile: r.data };
  }
  async function renderAdminUsers() {
    var DR = window.DR;
    var profile = DR && DR.getProfile();
    if (!profile || profile.role !== 'admin') {
      if (DR) DR.toast('Admin only', 'error');
      return;
    }
    var box = document.getElementById('admin-users-list');
    if (!box) return;
    box.innerHTML = '<div class="empty-state"><p>Loading users…</p></div>';
    var users = await fetchAllProfiles();
    var qEl = document.getElementById('admin-search');
    var q = (qEl && qEl.value || '').toLowerCase().trim();
    var roleFilter = (document.getElementById('admin-filter-role') || {}).value || '';
    var filtered = users.filter(function (u) {
      if (roleFilter && u.role !== roleFilter) return false;
      if (!q) return true;
      return ((u.full_name || '') + ' ' + (u.username || '') + ' ' + (u.role || '')).toLowerCase().indexOf(q) !== -1;
    });
    var counts = { customer: 0, agent: 0, admin: 0 };
    users.forEach(function (u) { if (counts[u.role] !== undefined) counts[u.role]++; });
    var el;
    el = document.getElementById('admin-stat-users'); if (el) el.textContent = users.length;
    el = document.getElementById('admin-stat-customers'); if (el) el.textContent = counts.customer;
    el = document.getElementById('admin-stat-agents'); if (el) el.textContent = counts.agent;
    el = document.getElementById('admin-stat-admins'); if (el) el.textContent = counts.admin;
    if (!filtered.length) {
      box.innerHTML = '<p class="empty-state" style="padding:1rem">No users found.</p>';
      return;
    }
    var esc = DR.esc, fmt = DR.fmt;
    box.innerHTML = '<table class="perf-table admin-table"><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead><tbody>' +
      filtered.map(function (u) {
        var mine = profile && u.id === profile.id;
        var roleSelect = '<select class="admin-role-select" data-id="' + u.id + '"' + (mine ? ' disabled' : '') + '>' +
          ['customer', 'agent', 'admin'].map(function (r) {
            return '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + r + '</option>';
          }).join('') + '</select>';
        return '<tr' + (mine ? ' class="mine"' : '') + '>' +
          '<td>' + esc(u.full_name || 'User') + (mine ? ' <span class="you-tag">you</span>' : '') + '</td>' +
          '<td>' + esc(u.username || '—') + '</td>' +
          '<td><span class="badge badge-role-' + esc(u.role) + '">' + esc(u.role) + '</span></td>' +
          '<td>' + fmt(u.created_at) + '</td>' +
          '<td>' + roleSelect + '</td></tr>';
      }).join('') + '</tbody></table>';
    box.querySelectorAll('.admin-role-select').forEach(function (sel) {
      sel.addEventListener('change', async function () {
        var id = sel.getAttribute('data-id');
        var role = sel.value;
        if (!id || !role) return;
        if (!confirm('Change this user to ' + role + '?')) { renderAdminUsers(); return; }
        var r = await updateUserRole(id, role);
        if (r.error) { DR.toast(r.error, 'error'); renderAdminUsers(); return; }
        DR.toast('Role updated to ' + role, 'success');
        renderAdminUsers();
      });
    });
  }
  window.renderAdminUsers = renderAdminUsers;
  document.addEventListener('DOMContentLoaded', function () {
    var ar = document.getElementById('btn-admin-refresh');
    if (ar) ar.addEventListener('click', function () { renderAdminUsers(); });
    var as = document.getElementById('admin-search');
    if (as) as.addEventListener('input', function () { renderAdminUsers(); });
    var afr = document.getElementById('admin-filter-role');
    if (afr) afr.addEventListener('change', function () { renderAdminUsers(); });
  });
})();
