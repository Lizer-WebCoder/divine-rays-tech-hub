/**
 * Divine Rays — avatars bound to current user only (no cross-login leak)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_AVATAR_FIX) {
    try { delete window.__DR_AVATAR_FIX; } catch (e) {}
  }
  window.__DR_AVATAR_FIX = 1;

  var CACHE_KEY = 'dr_avatar_cache_v2';
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
      if (data.user_id != null) cur.user_id = data.user_id;
      if (data.avatar_url != null) cur.avatar_url = data.avatar_url;
      if (data.full_name != null) cur.full_name = data.full_name;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cur));
    } catch (e) {}
  }

  function clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem('dr_avatar_cache_v1');
    } catch (e) {}
  }

  function avatarHtml(url, name, sizeClass) {
    sizeClass = sizeClass || 'md';
    var letter = (name || 'U').charAt(0).toUpperCase();
    if (url) {
      return (
        '<img class="avatar-img ' +
        sizeClass +
        '" src="' +
        esc(url) +
        '" alt="" ' +
        'onerror="this.style.display=\'none\';var n=this.nextElementSibling;if(n)n.style.display=\'grid\'" />' +
        '<div class="avatar-fallback ' +
        sizeClass +
        '" style="display:none">' +
        esc(letter) +
        '</div>'
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

  function clearAvatarDom() {
    ['sidebar-avatar-chip', 'header-avatar-chip'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = avatarHtml(null, 'U', id.indexOf('header') !== -1 ? 'sm' : 'md');
    });
  }

  function getClient() {
    try {
      if (window.DR && DR.supabase) return DR.supabase;
      if (window.sb) return window.sb;
    } catch (e) {}
    return null;
  }

  async function currentUserId() {
    try {
      if (window.DR && DR.getProfile) {
        var p = DR.getProfile();
        if (p && p.id) return p.id;
      }
      var client = getClient();
      if (!client || !client.auth) return null;
      var s = await client.auth.getSession();
      return s && s.data && s.data.session && s.data.session.user && s.data.session.user.id;
    } catch (e) {
      return null;
    }
  }

  function getProfileQuick() {
    try {
      if (window.DR && typeof DR.getProfile === 'function') {
        var p = DR.getProfile();
        if (p) return p;
      }
    } catch (e) {}
    return null;
  }

  async function fetchProfile() {
    var p = getProfileQuick();
    if (p && (p.avatar_url || p.id)) return p;
    var client = getClient();
    if (!client) return null;
    try {
      var s = await client.auth.getSession();
      var uid = s && s.data && s.data.session && s.data.session.user && s.data.session.user.id;
      if (!uid) return null;
      var r = await client.from('profiles').select('id,full_name,username,avatar_url,role').eq('id', uid).maybeSingle();
      return r.data || null;
    } catch (e) {
      return null;
    }
  }

  async function syncAvatar() {
    var uid = await currentUserId();
    if (!uid) {
      clearCache();
      clearAvatarDom();
      return;
    }

    var cached = readCache();
    if (cached.user_id && cached.user_id !== uid) {
      clearCache();
      cached = {};
    }

    var prof = await fetchProfile();
    if (prof && prof.id && prof.id !== uid) {
      prof = null;
    }

    var url = (prof && prof.avatar_url) || null;
    var name = (prof && (prof.full_name || prof.username)) || 'User';

    if (url) {
      writeCache({ user_id: uid, avatar_url: url, full_name: name });
      applyAvatar(url, name);
      return;
    }

    if (cached.user_id === uid && cached.avatar_url) {
      applyAvatar(cached.avatar_url, cached.full_name || name);
      return;
    }

    applyAvatar(null, name);
  }

  function forceVersion() {
    document.querySelectorAll('.version').forEach(function (el) {
      if (el.textContent.indexOf('8.0.3') === -1) el.textContent = VER;
    });
  }

  function tick() {
    forceVersion();
    syncAvatar();
  }

  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setTimeout(tick, 600);
  setTimeout(tick, 2000);
  setTimeout(tick, 5000);
  setInterval(function () {
    forceVersion();
    currentUserId().then(function (uid) {
      if (!uid) {
        clearCache();
        clearAvatarDom();
        return;
      }
      var c = readCache();
      if (c.user_id && c.user_id !== uid) {
        clearCache();
        syncAvatar();
      }
    });
  }, 8000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-logout' || (t.closest && t.closest('#btn-logout')))) {
        clearCache();
        clearAvatarDom();
        setTimeout(clearAvatarDom, 100);
        setTimeout(clearAvatarDom, 500);
      }
    },
    true
  );

  window.DRAvatarFix = {
    sync: syncAvatar,
    apply: applyAvatar,
    forceVersion: forceVersion,
    clear: function () {
      clearCache();
      clearAvatarDom();
    }
  };
})();
