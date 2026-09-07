/**
 * Divine Rays — Profile page (phone, address, avatar, etc.)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function DR() { return window.DR || {}; }
  function sb() { return DR().sb && DR().sb(); }
  function toast(m, t) { if (DR().toast) DR().toast(m, t); else console.log(m); }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var PROFILE_FIELDS = [
    'full_name', 'username', 'email', 'phone', 'address', 'city',
    'department', 'bio', 'avatar_url'
  ];

  async function fetchMyProfile() {
    var client = sb();
    var p = DR().getProfile && DR().getProfile();
    if (!client || !p || !p.id) return null;
    var r = await client.from('profiles').select('*').eq('id', p.id).maybeSingle();
    return r.error ? null : r.data;
  }

  async function fetchProfileById(id) {
    var client = sb();
    if (!client || !id) return null;
    var r = await client.from('profiles').select('*').eq('id', id).maybeSingle();
    return r.error ? null : r.data;
  }

  async function saveProfile(id, fields) {
    var client = sb();
    if (!client || !id) return { error: 'Not signed in' };
    var patch = {};
    PROFILE_FIELDS.forEach(function (k) {
      if (fields[k] !== undefined) patch[k] = fields[k] === '' ? null : fields[k];
    });
    var r = await client.from('profiles').update(patch).eq('id', id).select('*').maybeSingle();
    return r.error ? { error: r.error.message } : { profile: r.data };
  }

  function avatarHtml(url, name, sizeClass) {
    sizeClass = sizeClass || '';
    var letter = (name || 'U').charAt(0).toUpperCase();
    if (url) {
      return '<img class="avatar-img ' + sizeClass + '" src="' + esc(url) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling&&(this.nextElementSibling.style.display=\'grid\')" />' +
        '<div class="avatar-fallback ' + sizeClass + '" style="display:none">' + esc(letter) + '</div>';
    }
    return '<div class="avatar-fallback ' + sizeClass + '">' + esc(letter) + '</div>';
  }

  function ensureProfileUI() {
    if (document.getElementById('profile-overlay')) return;
    var overlay = document.createElement('div');
    overlay.id = 'profile-overlay';
    overlay.className = 'profile-overlay is-hidden';
    overlay.innerHTML =
      '<div class="profile-panel" role="dialog" aria-labelledby="profile-title">' +
      '<div class="profile-panel-head">' +
      '<h2 id="profile-title">My profile</h2>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="profile-close">Close</button>' +
      '</div>' +
      '<div id="profile-body" class="profile-body">' +
      '<p class="empty-state">Loading…</p>' +
      '</div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeProfile();
    });
    document.getElementById('profile-close').addEventListener('click', closeProfile);
  }

  function openProfile(opts) {
    opts = opts || {};
    ensureProfileUI();
    var overlay = document.getElementById('profile-overlay');
    overlay.classList.remove('is-hidden');
    document.getElementById('profile-title').textContent = opts.readOnly
      ? (opts.title || 'User profile')
      : 'My profile';
    renderProfileForm(opts);
  }

  function closeProfile() {
    var o = document.getElementById('profile-overlay');
    if (o) o.classList.add('is-hidden');
  }

  async function renderProfileForm(opts) {
    opts = opts || {};
    var body = document.getElementById('profile-body');
    if (!body) return;
    body.innerHTML = '<p class="empty-state">Loading…</p>';

    var me = DR().getProfile && DR().getProfile();
    var id = opts.userId || (me && me.id);
    if (!id) {
      body.innerHTML = '<p class="empty-state">Not signed in.</p>';
      return;
    }

    var data = await fetchProfileById(id);
    if (!data) {
      body.innerHTML = '<p class="empty-state">Could not load profile. Run the profile SQL in Supabase if columns are missing.</p>';
      return;
    }

    var readOnly = !!opts.readOnly;
    var isSelf = me && me.id === id;

    if (readOnly) {
      body.innerHTML = viewHtml(data);
      var closeBtn = document.getElementById('pf-close-view');
      if (closeBtn) closeBtn.onclick = closeProfile;
      return;
    }

    body.innerHTML =
      '<div class="profile-avatar-row">' +
      '<div class="profile-avatar-preview" id="profile-avatar-preview">' +
      avatarHtml(data.avatar_url, data.full_name, 'lg') +
      '</div>' +
      '<div class="profile-avatar-fields">' +
      '<label class="form-group"><span>Photo URL</span>' +
      '<input type="url" id="pf-avatar_url" value="' + esc(data.avatar_url || '') + '" placeholder="https://…" /></label>' +
      '<p class="profile-hint">Paste an image link (Imgur, Google Drive public link, etc.)</p>' +
      '</div></div>' +
      '<div class="profile-grid">' +
      field('Full name', 'pf-full_name', data.full_name, false) +
      field('Username', 'pf-username', data.username, false) +
      field('Email', 'pf-email', data.email, false) +
      field('Phone', 'pf-phone', data.phone, false, 'tel') +
      field('Address', 'pf-address', data.address, false) +
      field('City', 'pf-city', data.city, false) +
      field('Department', 'pf-department', data.department, false) +
      '</div>' +
      '<div class="form-group"><label for="pf-bio">About / notes</label>' +
      '<textarea id="pf-bio" rows="3" placeholder="Optional">' + esc(data.bio || '') + '</textarea></div>' +
      '<div class="profile-actions">' +
      '<button type="button" class="btn btn-ghost" id="pf-cancel">Cancel</button>' +
      '<button type="button" class="btn btn-primary" id="pf-save">Save profile</button>' +
      '</div>';

    document.getElementById('pf-cancel').onclick = closeProfile;
    document.getElementById('pf-avatar_url').addEventListener('input', function () {
      var url = this.value.trim();
      var prev = document.getElementById('profile-avatar-preview');
      if (prev) prev.innerHTML = avatarHtml(url, data.full_name, 'lg');
    });
    document.getElementById('pf-save').onclick = async function () {
      var btn = document.getElementById('pf-save');
      btn.disabled = true;
      btn.textContent = 'Saving…';
      var fields = {
        full_name: val('pf-full_name'),
        username: val('pf-username'),
        email: val('pf-email'),
        phone: val('pf-phone'),
        address: val('pf-address'),
        city: val('pf-city'),
        department: val('pf-department'),
        bio: val('pf-bio'),
        avatar_url: val('pf-avatar_url')
      };
      if (!fields.full_name) {
        toast('Name is required', 'error');
        btn.disabled = false;
        btn.textContent = 'Save profile';
        return;
      }
      var r = await saveProfile(id, fields);
      if (r.error) {
        toast(r.error, 'error');
        btn.disabled = false;
        btn.textContent = 'Save profile';
        return;
      }
      toast('Profile saved', 'success');
      applyHeaderAvatar(r.profile || fields);
      if (me && isSelf) {
        me.name = fields.full_name;
        me.full_name = fields.full_name;
      }
      var lb = document.getElementById('logged-user-label');
      if (lb && isSelf) {
        var role = (me && me.role) || data.role || '';
        var tag = role === 'admin' ? ' (Admin)' : role === 'agent' ? ' (Agent)' : ' (Customer)';
        lb.textContent = fields.full_name + tag;
      }
      var an = document.getElementById('agent-name-display');
      if (an && isSelf) an.textContent = fields.full_name + (data.role === 'admin' ? ' · Admin' : '');
      closeProfile();
    };
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function field(label, id, value, ro, type) {
    type = type || 'text';
    return (
      '<div class="form-group"><label for="' + id + '">' + esc(label) + '</label>' +
      '<input type="' + type + '" id="' + id + '" value="' + esc(value || '') + '"' +
      (ro ? ' readonly' : '') + ' /></div>'
    );
  }

  function viewHtml(data) {
    var rows = [
      ['Name', data.full_name],
      ['Username', data.username],
      ['Email', data.email],
      ['Phone', data.phone],
      ['Address', data.address],
      ['City', data.city],
      ['Department', data.department],
      ['Role', data.role],
      ['About', data.bio]
    ];
    return (
      '<div class="profile-view">' +
      '<div class="profile-avatar-row">' +
      '<div class="profile-avatar-preview">' + avatarHtml(data.avatar_url, data.full_name, 'lg') + '</div>' +
      '<div><h3 class="profile-view-name">' + esc(data.full_name || 'User') + '</h3>' +
      '<span class="badge badge-role-' + esc(data.role || '') + '">' + esc(data.role || '') + '</span></div></div>' +
      '<dl class="profile-dl">' +
      rows.map(function (r) {
        return '<div class="profile-dl-row"><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1] || '—') + '</dd></div>';
      }).join('') +
      '</dl>' +
      '<div class="profile-actions"><button type="button" class="btn btn-primary" id="pf-close-view">Close</button></div>' +
      '</div>'
    );
  }

  function applyHeaderAvatar(data) {
    if (!data) return;
    ensureHeaderButtons();
    var chip = document.getElementById('header-avatar-chip');
    if (chip) chip.innerHTML = avatarHtml(data.avatar_url, data.full_name || data.name, 'sm');
    var side = document.getElementById('sidebar-avatar-chip');
    if (side) side.innerHTML = avatarHtml(data.avatar_url, data.full_name || data.name, 'md');
  }

  function ensureHeaderButtons() {
    var userInfo = document.querySelector('.mode-bar .user-info');
    if (userInfo && !document.getElementById('btn-my-profile')) {
      var chip = document.createElement('span');
      chip.id = 'header-avatar-chip';
      chip.className = 'header-avatar-chip';
      chip.innerHTML = avatarHtml(null, 'U', 'sm');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-my-profile';
      btn.className = 'btn btn-ghost btn-sm';
      btn.textContent = 'Profile';
      btn.addEventListener('click', function () { openProfile({ readOnly: false }); });

      userInfo.insertBefore(btn, userInfo.firstChild);
      userInfo.insertBefore(chip, userInfo.firstChild);
    }

    var badge = document.querySelector('#portal-agent .agent-badge');
    if (badge && !document.getElementById('sidebar-avatar-chip')) {
      var wrap = document.createElement('div');
      wrap.id = 'sidebar-avatar-chip';
      wrap.className = 'sidebar-avatar-chip';
      wrap.innerHTML = avatarHtml(null, 'A', 'md');
      badge.parentNode.insertBefore(wrap, badge);
    }

    var custHeader = document.querySelector('#portal-customer .customer-header');
    if (custHeader && !document.getElementById('btn-cust-profile')) {
      var cbtn = document.createElement('button');
      cbtn.type = 'button';
      cbtn.id = 'btn-cust-profile';
      cbtn.className = 'btn btn-ghost btn-sm';
      cbtn.textContent = 'Edit profile';
      cbtn.style.marginTop = '0.5rem';
      cbtn.addEventListener('click', function () { openProfile({ readOnly: false }); });
      custHeader.appendChild(cbtn);
    }
  }

  function enhanceAdminTable() {
    var box = document.getElementById('admin-users-list');
    if (!box) return;
    box.querySelectorAll('.admin-actions').forEach(function (actions) {
      if (actions.querySelector('.admin-btn-view')) return;
      var edit = actions.querySelector('.admin-btn-edit');
      var id = edit && edit.getAttribute('data-id');
      if (!id) {
        var sel = actions.querySelector('.admin-role-select');
        id = sel && sel.getAttribute('data-id');
      }
      if (!id) return;
      var v = document.createElement('button');
      v.type = 'button';
      v.className = 'btn btn-ghost btn-sm admin-btn-view';
      v.textContent = 'View';
      v.setAttribute('data-id', id);
      v.addEventListener('click', function () {
        openProfile({ userId: id, readOnly: true, title: 'User profile' });
      });
      actions.insertBefore(v, actions.firstChild);
    });
  }

  function hookAdminRender() {
    if (!window.renderAdminUsers || window.renderAdminUsers.__profileHooked) return;
    var prev = window.renderAdminUsers;
    window.renderAdminUsers = async function () {
      var r = await prev.apply(this, arguments);
      setTimeout(enhanceAdminTable, 50);
      return r;
    };
    window.renderAdminUsers.__profileHooked = true;
  }

  async function boot() {
    ensureProfileUI();
    ensureHeaderButtons();
    hookAdminRender();
    var me = await fetchMyProfile();
    if (me) applyHeaderAvatar(me);
    var shell = document.getElementById('app-shell') || document.body;
    new MutationObserver(function () {
      ensureHeaderButtons();
      hookAdminRender();
      enhanceAdminTable();
    }).observe(shell, { attributes: true, childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 600);

  window.DR_PROFILE = {
    open: openProfile,
    close: closeProfile,
    fetch: fetchMyProfile,
    viewUser: function (id) {
      openProfile({ userId: id, readOnly: true, title: 'User profile' });
    }
  };
})();
