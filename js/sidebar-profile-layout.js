/**
 * Divine Rays — Sidebar profile layout
 * [AVATAR]  Name · Online
 *           ROLE
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SIDEBAR_PROFILE_LAYOUT >= 1) return;
  window.__DR_SIDEBAR_PROFILE_LAYOUT = 1;

  var DEVS = { kirzhian: 1, kirzhianquijano: 1, kirzhianthegreat: 1, jamesjerlow123: 1, liya: 1, iiya: 1 };

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function profile() {
    try {
      if (window.__drProfile) return window.__drProfile;
      if (window.DR && typeof DR.getProfile === 'function') {
        var p = DR.getProfile();
        if (p) return p;
      }
      if (window.DR && window.DR.profile) return window.DR.profile;
      if (window.currentProfile) return window.currentProfile;
    } catch (e) {}
    return null;
  }

  function isDev(s) {
    s = String(s || '').toLowerCase().trim();
    return !!DEVS[s] || s.indexOf('kirzhian') === 0;
  }

  function roleOf(p, nameHint) {
    var un = '';
    if (p) un = String(p.username || p.name || p.display_name || '').toLowerCase().trim();
    if (!un && nameHint) un = String(nameHint).toLowerCase().trim();
    var r = p ? String(p.role || p.staff_role || '').toLowerCase().trim() : '';
    if (isDev(un) || r === 'developer' || r === 'dev') return { label: 'Developer', cls: 'developer' };
    if (r === 'owner') return { label: 'Owner', cls: 'owner' };
    if (r === 'it tech support' || r.indexOf('tech support') !== -1 || r === 'agent' || r === 'it_tech_support') {
      return { label: 'IT Tech Support', cls: 'agent' };
    }
    if (r === 'admin') return { label: 'Admin', cls: 'admin' };
    return { label: 'Admin', cls: 'admin' };
  }

  function nameOf(p) {
    if (p) {
      var n = String(p.username || p.name || p.display_name || p.full_name || '').trim();
      if (n) return n.split(/\s+/)[0];
    }
    return 'Agent';
  }

  function avatarUrl(p) {
    if (p && p.avatar_url) return p.avatar_url;
    try {
      var raw = localStorage.getItem('dr_avatar_cache_v3');
      if (raw) {
        var c = JSON.parse(raw);
        if (c && c.avatar_url) return c.avatar_url;
      }
    } catch (e) {}
    return null;
  }

  function injectCss() {
    var id = 'dr-sidebar-profile-layout-css';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#portal-agent .sidebar .dr-profile-row,',
      '#portal-agent .sidebar .agent-badge.dr-profile-row{',
      '  display:flex!important;',
      '  flex-direction:row!important;',
      '  align-items:center!important;',
      '  gap:0.75rem!important;',
      '  width:100%!important;',
      '  box-sizing:border-box!important;',
      '  padding:0.55rem 0.65rem!important;',
      '  margin:0.15rem 0 0.55rem!important;',
      '  background:linear-gradient(145deg,rgba(124,106,240,.1),rgba(124,106,240,.03))!important;',
      '  border:1px solid rgba(124,106,240,.2)!important;',
      '  border-radius:14px!important;',
      '  box-shadow:0 2px 12px rgba(0,0,0,.15)!important',
      '}',
      '#portal-agent .sidebar .dr-profile-av{',
      '  width:48px!important;height:48px!important;min-width:48px!important;',
      '  border-radius:14px!important;overflow:hidden!important;',
      '  display:grid!important;place-items:center!important;',
      '  background:linear-gradient(145deg,rgba(124,106,240,.45),rgba(91,70,200,.3))!important;',
      '  border:1px solid rgba(167,139,250,.5)!important;',
      '  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 2px 8px rgba(91,70,200,.25)!important;',
      '  color:#ede9fe!important;font-weight:700!important;font-size:0.95rem!important;',
      '  flex-shrink:0!important',
      '}',
      '#portal-agent .sidebar .dr-profile-av img{',
      '  width:100%!important;height:100%!important;object-fit:cover!important;',
      '  display:block!important;border-radius:13px!important',
      '}',
      '#portal-agent .sidebar .dr-profile-meta{',
      '  display:flex!important;flex-direction:column!important;',
      '  align-items:flex-start!important;justify-content:center!important;',
      '  gap:0.15rem!important;min-width:0!important;flex:1!important',
      '}',
      '#portal-agent .sidebar .dr-profile-line1{',
      '  display:flex!important;align-items:center!important;flex-wrap:wrap!important;',
      '  gap:0.3rem!important;line-height:1.25!important;max-width:100%!important',
      '}',
      '#portal-agent .sidebar .dr-profile-line1 .dr-side-name{',
      '  font-size:0.88rem!important;font-weight:700!important;',
      '  color:#f0eefc!important;letter-spacing:-0.01em!important;',
      '  white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important',
      '}',
      '#portal-agent .sidebar .dr-profile-line1 .dr-status-dot{',
      '  width:7px!important;height:7px!important;border-radius:50%!important;flex-shrink:0!important;',
      '  background:#34d399!important;box-shadow:0 0 0 3px rgba(52,211,153,.2)!important',
      '}',
      '#portal-agent .sidebar .dr-profile-line1 .dr-online{',
      '  color:#34d399!important;font-weight:600!important;font-size:0.72rem!important;white-space:nowrap!important',
      '}',
      '#portal-agent .sidebar .dr-profile-line2{',
      '  display:flex!important;align-items:center!important',
      '}',
      '#portal-agent .sidebar .dr-profile-line2 .dr-side-role{',
      '  font-size:0.72rem!important;font-weight:700!important;',
      '  letter-spacing:0.02em!important;padding:0.1rem 0.45rem!important;',
      '  border-radius:999px!important;line-height:1.3!important',
      '}',
      '#portal-agent .sidebar .dr-side-role.developer{background:rgba(234,179,8,.2)!important;color:#fbbf24!important;border:1px solid rgba(234,179,8,.4)!important}',
      '#portal-agent .sidebar .dr-side-role.admin{background:rgba(45,212,191,.15)!important;color:#2dd4bf!important;border:1px solid rgba(45,212,191,.4)!important}',
      '#portal-agent .sidebar .dr-side-role.owner{background:rgba(168,85,247,.18)!important;color:#c084fc!important;border:1px solid rgba(168,85,247,.4)!important}',
      '#portal-agent .sidebar .dr-side-role.agent{background:rgba(96,165,250,.15)!important;color:#60a5fa!important;border:1px solid rgba(96,165,250,.4)!important}',
      '#sidebar-avatar-chip{display:none!important}',
      '#agent-name-display:not(.dr-profile-built){opacity:0!important}',
      '#agent-name-display.dr-profile-built{opacity:1!important}',
      '#portal-agent .sidebar .dr-profile-row + .nav,',
      '#portal-agent .sidebar .agent-badge.dr-profile-row + .nav{',
      '  border-top:1px solid rgba(167,139,250,.18)!important;',
      '  padding-top:0.45rem!important;margin-top:0.15rem!important',
      '}',
      'html[data-theme="light"] #portal-agent .sidebar .dr-profile-row{',
      '  background:rgba(255,255,255,.7)!important;border-color:rgba(109,40,217,.12)!important',
      '}',
      'html[data-theme="light"] #portal-agent .sidebar .dr-profile-line1 .dr-side-name{color:#1a1625!important}',
      'html[data-theme="light"] #portal-agent .sidebar .dr-profile-av{',
      '  background:linear-gradient(145deg,#ede9fe,#ddd6fe)!important;color:#5b21b6!important',
      '}'
    ].join('');
  }

  function ensureRow() {
    var badge = document.querySelector('#portal-agent .agent-badge');
    var nameEl = document.getElementById('agent-name-display');
    if (!badge && !nameEl) return null;
    if (badge) {
      badge.classList.add('dr-profile-row');
      return badge;
    }
    if (nameEl && !nameEl.closest('.dr-profile-row')) {
      var wrap = document.createElement('div');
      wrap.className = 'agent-badge dr-profile-row';
      nameEl.parentNode.insertBefore(wrap, nameEl);
      wrap.appendChild(nameEl);
      return wrap;
    }
    return nameEl ? nameEl.closest('.dr-profile-row') : null;
  }

  function build() {
    injectCss();
    var row = ensureRow();
    if (!row) return;

    var p = profile();
    var name = nameOf(p);
    var role = roleOf(p, name);
    if (isDev(name)) role = { label: 'Developer', cls: 'developer' };
    var url = avatarUrl(p);
    var letter = (name || 'A').charAt(0).toUpperCase();

    var key = name + '|' + role.label + '|' + (url || '') + '|v1';
    if (row.getAttribute('data-dr-profile-key') === key && row.querySelector('.dr-profile-av')) return;
    row.setAttribute('data-dr-profile-key', key);

    var avHtml;
    if (url) {
      avHtml =
        '<div class="dr-profile-av" aria-hidden="true">' +
        '<img src="' +
        esc(url) +
        '" alt="" decoding="async" loading="eager" onerror="this.style.display=\'none\';this.parentNode.textContent=\'' +
        esc(letter) +
        '\'" />' +
        '</div>';
    } else {
      avHtml = '<div class="dr-profile-av" aria-hidden="true">' + esc(letter) + '</div>';
    }

    var metaHtml =
      '<div class="dr-profile-meta">' +
      '<div class="dr-profile-line1">' +
      '<span class="dr-status-dot" aria-hidden="true"></span>' +
      '<span class="dr-side-name">' +
      esc(name) +
      '</span>' +
      '<span class="dr-online">· Online</span>' +
      '</div>' +
      '<div class="dr-profile-line2">' +
      '<span class="dr-side-role ' +
      esc(role.cls) +
      '" data-role="' +
      esc(role.cls) +
      '">' +
      esc(role.label) +
      '</span>' +
      '</div>' +
      '</div>';

    var nameEl = document.getElementById('agent-name-display');
    if (nameEl && nameEl.parentNode === row) {
      nameEl.classList.add('dr-profile-built', 'dr-presence-ready');
      nameEl.style.display = 'contents';
      nameEl.innerHTML = avHtml + metaHtml;
    } else {
      row.innerHTML = avHtml + metaHtml;
      var meta = row.querySelector('.dr-profile-meta');
      if (meta && !document.getElementById('agent-name-display')) {
        meta.id = 'agent-name-display';
        meta.classList.add('dr-profile-built', 'dr-presence-ready');
      }
    }
  }

  function boot() {
    try {
      if (window.DR && typeof DR.getProfile === 'function') {
        var gp = DR.getProfile();
        if (gp) window.__drProfile = gp;
      }
    } catch (e) {}
    build();
  }

  injectCss();
  boot();
  [200, 600, 1200, 2500, 4000].forEach(function (ms) {
    setTimeout(boot, ms);
  });
  setInterval(boot, 8000);

  try {
    new MutationObserver(function () {
      if (!document.querySelector('#portal-agent .dr-profile-av')) boot();
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  window.DRSidebarProfileLayout = { refresh: boot, v: 1 };
})();
