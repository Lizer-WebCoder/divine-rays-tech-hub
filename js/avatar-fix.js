/**
 * Divine Rays — avatars v3
 * Paint into existing sidebar profile avatar (no layout drag).
 * Cache-first; header chip optional.
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_AVATAR_FIX_V3) return;
  window.__DR_AVATAR_FIX_V3 = 1;
  window.__DR_AVATAR_FIX_V2 = 1;
  window.__DR_AVATAR_FIX = 1;

  var CACHE_KEY = 'dr_avatar_cache_v3';
  var VER = 'v8.0.3';
  var lastUid = null;

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function clearAllCaches() {
    try {
      ['dr_avatar_cache_v1', 'dr_avatar_cache_v2', 'dr_avatar_cache_v3'].forEach(function (k) {
        localStorage.removeItem(k);
      });
    } catch (e) {}
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
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          user_id: data.user_id || null,
          avatar_url: data.avatar_url || null,
          full_name: data.full_name || null
        })
      );
    } catch (e) {}
  }

  function injectCss() {
    var id = 'dr-avatar-fix-css';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#portal-agent .sidebar .avatar,',
      '#portal-agent .sidebar .profile-avatar,',
      '#portal-agent .sidebar .avatar-ring,',
      '#portal-agent .sidebar .sidebar-profile,',
      '#portal-agent .sidebar .profile-chip{',
      '  position:relative!important;overflow:hidden!important;flex-shrink:0!important',
      '}',
      '#portal-agent .sidebar .avatar img,',
      '#portal-agent .sidebar .profile-avatar img,',
      '#portal-agent .sidebar .avatar-ring img,',
      '#portal-agent .sidebar .sidebar-profile img,',
      '#portal-agent .sidebar .profile-chip img,',
      '#portal-agent .sidebar img.dr-side-av{',
      '  width:100%!important;height:100%!important;object-fit:cover!important;',
      '  display:block!important;border-radius:inherit!important',
      '}',
      '#sidebar-avatar-chip.sidebar-avatar-chip{',
      '  display:none!important;width:0!important;height:0!important;overflow:hidden!important;',
      '  margin:0!important;padding:0!important;border:none!important',
      '}',
      '#header-avatar-chip, .header-avatar-chip{',
      '  display:inline-flex!important;align-items:center!important;justify-content:center!important;',
      '  width:28px!important;height:28px!important;min-width:28px!important;',
      '  border-radius:8px!important;overflow:hidden!important;flex-shrink:0!important',
      '}',
      '#header-avatar-chip img, .header-avatar-chip img{',
      '  width:100%!important;height:100%!important;object-fit:cover!important;display:block!important',
      '}',
      '#header-avatar-chip .avatar-fallback, .header-avatar-chip .avatar-fallback{',
      '  width:100%!important;height:100%!important;display:grid!important;place-items:center!important;',
      '  font-weight:700!important;font-size:0.72rem!important',
      '}'
    ].join('');
  }

  function findSidebarAvatarHost() {
    var sels = [
      '#portal-agent .sidebar .avatar-ring',
      '#portal-agent .sidebar .profile-avatar',
      '#portal-agent .sidebar .sidebar-profile',
      '#portal-agent .sidebar .profile-chip',
      '#portal-agent .sidebar .avatar',
      '#portal-agent .sidebar .profile .avatar',
      '#portal-agent .agent-badge .avatar'
    ];
    for (var i = 0; i < sels.length; i++) {
      var el = document.querySelector(sels[i]);
      if (el) return el;
    }
    return null;
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

  function paintHost(host, url, name) {
    if (!host) return;
    var letter = (name || 'U').charAt(0).toUpperCase();
    var existing = host.querySelector('img.dr-side-av, img.avatar-img, img');
    if (url) {
      if (existing) {
        if (existing.getAttribute('src') !== url) existing.setAttribute('src', url);
        existing.style.display = 'block';
        existing.classList.add('dr-side-av');
        existing.setAttribute('alt', '');
        existing.onerror = function () { this.style.display = 'none'; };
      } else {
        host.innerHTML =
          '<img class="dr-side-av avatar-img" src="' +
          esc(url) +
          '" alt="" decoding="async" loading="eager" onerror="this.style.display=\'none\'" />';
      }
    } else if (!existing) {
      if (!(host.textContent || '').trim()) host.textContent = letter;
    }
  }

  function applyAvatar(url, name) {
    injectCss();
    try {
      var legacy = document.getElementById('sidebar-avatar-chip');
      if (legacy) legacy.classList.add('sidebar-avatar-chip');
    } catch (e) {}
    paintHost(findSidebarAvatarHost(), url, name);
    var head = ensureHeaderChip();
    if (head) {
      var letter = (name || 'U').charAt(0).toUpperCase();
      if (url) {
        head.innerHTML =
          '<img class="avatar-img" src="' +
          esc(url) +
          '" alt="" decoding="async" loading="eager" onerror="this.style.display=\'none\';var n=this.nextElementSibling;if(n)n.style.display=\'grid\'" />' +
          '<div class="avatar-fallback" style="display:none">' +
          esc(letter) +
          '</div>';
      } else {
        head.innerHTML = '<div class="avatar-fallback">' + esc(letter) + '</div>';
      }
    }
  }

  function clearAvatarDom() {
    try {
      var host = findSidebarAvatarHost();
      if (host) {
        var img = host.querySelector('img.dr-side-av, img.avatar-img');
        if (img) img.removeAttribute('src');
      }
    } catch (e) {}
    var head = document.getElementById('header-avatar-chip');
    if (head) head.innerHTML = '';
  }

  function getClient() {
    try {
      if (window.DR && typeof DR.sb === 'function') return DR.sb();
      if (window.DR && DR.supabase) return DR.supabase;
      if (window.sb) return window.sb;
    } catch (e) {}
    return null;
  }

  async function currentUserId() {
    try {
      var client = getClient();
      if (client && client.auth) {
        var s = await client.auth.getSession();
        var uid = s && s.data && s.data.session && s.data.session.user && s.data.session.user.id;
        if (uid) return uid;
      }
      if (window.DR && typeof DR.getProfile === 'function') {
        var p = DR.getProfile();
        if (p && p.id) return p.id;
      }
    } catch (e) {}
    return null;
  }

  async function fetchMyProfile(uid) {
    var client = getClient();
    if (!client || !uid) return null;
    try {
      var r = await client.from('profiles').select('id,full_name,username,avatar_url,role').eq('id', uid).maybeSingle();
      return r.data || null;
    } catch (e) {
      return null;
    }
  }

  async function syncAvatar() {
    var uid = await currentUserId();
    if (!uid) {
      lastUid = null;
      clearAllCaches();
      clearAvatarDom();
      return;
    }
    if (lastUid && lastUid !== uid) {
      clearAllCaches();
      clearAvatarDom();
    }
    lastUid = uid;
    var cached = readCache();
    if (cached.user_id && cached.user_id !== uid) {
      clearAllCaches();
      cached = {};
    }
    if (cached.user_id === uid && cached.avatar_url) {
      applyAvatar(cached.avatar_url, cached.full_name || 'User');
    }
    var prof = await fetchMyProfile(uid);
    var url = (prof && prof.avatar_url) || null;
    var name = (prof && (prof.full_name || prof.username)) || (cached.full_name || 'User');
    if (url && url.indexOf(uid) === -1 && /\/avatars\//.test(url) && /[0-9a-f]{8}-[0-9a-f]{4}/i.test(url)) {
      url = null;
    }
    if (url) {
      writeCache({ user_id: uid, avatar_url: url, full_name: name });
      applyAvatar(url, name);
      return;
    }
    if (cached.user_id === uid && cached.avatar_url) return;
    applyAvatar(null, name);
  }

  function forceVersion() {
    document.querySelectorAll('.version').forEach(function (el) {
      if (el.textContent.indexOf('8.0.3') === -1) el.textContent = VER;
    });
  }

  function tick() {
    injectCss();
    forceVersion();
    syncAvatar();
  }

  injectCss();
  try {
    var _c = readCache();
    if (_c && _c.avatar_url) applyAvatar(_c.avatar_url, _c.full_name || 'User');
  } catch (eBoot) {}

  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 3000);
  setInterval(tick, 10000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-logout' || (t.closest && t.closest('#btn-logout')))) {
        lastUid = null;
        clearAllCaches();
        clearAvatarDom();
        setTimeout(clearAvatarDom, 100);
      }
    },
    true
  );

  window.DRAvatarFix = {
    sync: syncAvatar,
    apply: applyAvatar,
    forceVersion: forceVersion,
    clear: function () {
      lastUid = null;
      clearAllCaches();
      clearAvatarDom();
    },
    v: 3
  };
})();
