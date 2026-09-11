/**
 * Divine Rays — keep avatars + version stable across refresh
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  var CACHE_KEY = 'dr_avatar_cache_v1';
  var VER = 'v8.0.3';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') || {};
    } catch (e) {
      return {};
    }
  }

  function writeCache(data) {
    try {
      var cur = readCache();
      if (data.avatar_url != null) cur.avatar_url = data.avatar_url;
      if (data.full_name != null) cur.full_name = data.full_name;
      if (data.user_id != null) cur.user_id = data.user_id;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cur));
    } catch (e) {}
  }

  function avatarHtml(url, name, sizeClass) {
    sizeClass = sizeClass || 'md';
    var letter = (name || 'U').charAt(0).toUpperCase();
    if (url) {
      return (
        '<img class="avatar-img ' + sizeClass + '" src="' + esc(url) + '" alt="" ' +
        'onerror="this.style.display=\'none\';var n=this.nextElementSibling;if(n)n.style.display=\'grid\'" />' +
        '<div class="avatar-fallback ' + sizeClass + '" style="display:none">' + esc(letter) + '</div>'
      );
    }
    return '<div class="avatar-fallback ' + sizeClass + '">' + esc(letter) + '</div>';
  }

  function ensureSidebarChip() {
    var badge = document.querySelector('#portal-agent .agent-badge');
    if (!badge) return null;
    var side = document.getElementById('sidebar-avatar-chip');
    if (!side) {
      side = document.createElement('div');
      side.id = 'sidebar-avatar-chip';
      side.className = 'sidebar-avatar-chip';
      badge.parentNode.insertBefore(side, badge);
    }
    return side;
  }

  function ensureHeaderChip() {
    var info = document.querySelector('.mode-bar .user-info') || document.querySelector('.user-info');
    if (!info) return null;
    var chip = document.getElementById('header-avatar-chip');
    if (!chip) {
      chip = document.createElement('span');
      chip.id = 'header-avatar-chip';
      chip.className = 'header-avatar-chip';
      var theme = document.getElementById('btn-theme');
      if (theme && theme.parentNode === info) {
        if (theme.nextSibling) info.insertBefore(chip, theme.nextSibling);
        else info.appendChild(chip);
      } else {
        info.insertBefore(chip, info.firstChild);
      }
    }
    return chip;
  }

  function applyAvatar(url, name) {
    var side = ensureSidebarChip();
    var head = ensureHeaderChip();
    if (side) side.innerHTML = avatarHtml(url, name, 'md');
    if (head) head.innerHTML = avatarHtml(url, name, 'sm');
  }

  function forceVersion() {
    document.querySelectorAll('.version').forEach(function (el) {
      if (el.textContent !== VER) el.textContent = VER;
    });
  }

  function getProfileQuick() {
    try {
      if (window.DR && typeof DR.getProfile === 'function') {
        var p = DR.getProfile();
        if (p && p.id) return p;
      }
    } catch (e) {}
    return null;
  }

  async function fetchProfile() {
    var p = getProfileQuick();
    if (p && p.avatar_url) return p;
    try {
      if (window.DR_PROFILE && typeof DR_PROFILE.fetch === 'function') {
        var me = await DR_PROFILE.fetch();
        if (me) return me;
      }
    } catch (e) {}
    try {
      if (window.DR && typeof DR.sb === 'function') {
        var client = DR.sb();
        if (!client) return p;
        var sess = await client.auth.getSession();
        var uid = sess && sess.data && sess.data.session && sess.data.session.user && sess.data.session.user.id;
        if (!uid && p && p.id) uid = p.id;
        if (!uid) return p;
        var r = await client.from('profiles').select('id,full_name,avatar_url,role,username').eq('id', uid).maybeSingle();
        if (!r.error && r.data) return r.data;
      }
    } catch (e) {}
    return p;
  }

  function paintFromCache() {
    var c = readCache();
    if (c.avatar_url || c.full_name) {
      applyAvatar(c.avatar_url || null, c.full_name || 'User');
    }
  }

  async function syncAvatar() {
    forceVersion();
    paintFromCache();
    var me = await fetchProfile();
    if (!me) return;
    writeCache({
      user_id: me.id,
      avatar_url: me.avatar_url || '',
      full_name: me.full_name || me.username || 'User'
    });
    applyAvatar(me.avatar_url || null, me.full_name || me.username || 'User');
    forceVersion();
  }

  forceVersion();
  if (document.getElementById('portal-agent') || document.querySelector('.agent-badge') || document.querySelector('.user-info')) {
    paintFromCache();
  }

  function boot() {
    forceVersion();
    paintFromCache();
    syncAvatar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 200); });
  } else {
    setTimeout(boot, 200);
  }

  setTimeout(boot, 800);
  setTimeout(boot, 2000);
  setTimeout(boot, 4500);

  setInterval(function () {
    forceVersion();
    var side = document.getElementById('sidebar-avatar-chip');
    var head = document.getElementById('header-avatar-chip');
    var c = readCache();
    if (!c.avatar_url) return;
    var needs = false;
    if (document.querySelector('#portal-agent .agent-badge') && (!side || !side.querySelector('img.avatar-img'))) needs = true;
    if (document.querySelector('.user-info') && (!head || !head.querySelector('img.avatar-img'))) needs = true;
    if (needs) applyAvatar(c.avatar_url, c.full_name || 'User');
  }, 2500);

  window.DRAvatarFix = { sync: syncAvatar, apply: applyAvatar, forceVersion: forceVersion };
})();
