/**
 * Divine Rays — Sidebar role label + brand v4 (no flicker)
 * Force Developer role, Divine Rays Tech Hub brand, hide TECH SUPPORT
 * MutationObserver removed — it caused innerHTML rewrite loops.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SIDEBAR_ROLE_LABEL >= 4) return;
  window.__DR_SIDEBAR_ROLE_LABEL = 4;

  var DEVS = { kirzhian: 1, kirzhianquijano: 1, kirzhianthegreat: 1, jamesjerlow123: 1, liya: 1, iiya: 1 };

  function isDev(s) {
    s = String(s || '').toLowerCase().trim();
    return !!DEVS[s] || s.indexOf('kirzhian') === 0;
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function profile() {
    try {
      if (window.__drProfile) return window.__drProfile;
      if (window.DR && window.DR.profile) return window.DR.profile;
      if (window.DR && window.DR.user) return window.DR.user;
      if (window.currentProfile) return window.currentProfile;
    } catch (e) {}
    return null;
  }

  function roleOf(p) {
    if (!p) return { label: 'Admin', cls: 'admin' };
    var r = String(p.role || p.staff_role || '').toLowerCase().trim();
    var un = String(p.username || p.name || '').toLowerCase().trim();
    if (isDev(un) || r === 'developer' || r === 'dev') return { label: 'Developer', cls: 'developer' };
    if (r === 'owner') return { label: 'Owner', cls: 'owner' };
    if (r === 'it tech support' || r.indexOf('tech support') !== -1) return { label: 'IT Tech Support', cls: 'agent' };
    if (r === 'agent') return { label: 'IT Tech Support', cls: 'agent' };
    return { label: 'Admin', cls: 'admin' };
  }

  function nameOf(p) {
    if (p) {
      var n = String(p.username || p.name || p.display_name || '').trim();
      if (n) return n.split(/\s+/)[0];
    }
    var el = document.getElementById('agent-name-display');
    if (el) {
      var span = el.querySelector('.dr-side-name');
      if (span) return span.textContent.trim();
      var t = (el.textContent || '').replace(/[·\u00b7\-].*$/, '').trim();
      if (t && t !== 'Agent') return t.split(/\s+/)[0];
    }
    return 'User';
  }

  function css() {
    if (document.getElementById('dr-sidebar-role-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-sidebar-role-css';
    el.textContent = [
      '#portal-agent .sidebar .brand-text p, #portal-agent .brand-text p { display:none!important; }',
      '#agent-name-display .dr-side-name { margin-right:0.25rem; }',
      '#agent-name-display .dr-role-pill, #agent-name-display .dr-side-role {',
      'display:inline-block;margin-left:.35rem;padding:.12rem .55rem;border-radius:999px;',
      'font-size:.68rem;font-weight:700;letter-spacing:.02em;vertical-align:middle}',
      '#agent-name-display .dr-side-role.developer, #agent-name-display .dr-role-pill[data-role="developer"]{background:rgba(234,179,8,.2);color:#fbbf24;border:1px solid rgba(234,179,8,.45)}',
      '#agent-name-display .dr-side-role.admin, #agent-name-display .dr-role-pill[data-role="admin"]{background:rgba(45,212,191,.15);color:#2dd4bf;border:1px solid rgba(45,212,191,.4)}',
      '#agent-name-display .dr-side-role.owner, #agent-name-display .dr-role-pill[data-role="owner"]{background:rgba(168,85,247,.18);color:#c084fc;border:1px solid rgba(168,85,247,.4)}',
      '#agent-name-display .dr-side-role.agent, #agent-name-display .dr-role-pill[data-role="agent"]{background:rgba(96,165,250,.15);color:#60a5fa;border:1px solid rgba(96,165,250,.4)}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function applyBrand() {
    var h1 = document.querySelector('#portal-agent .sidebar .brand-text h1, #portal-agent .brand-text h1');
    if (h1 && h1.textContent.trim() !== 'Divine Rays Tech Hub') {
      h1.textContent = 'Divine Rays Tech Hub';
    }
    document.querySelectorAll('#portal-agent .sidebar .brand-text p, #portal-agent .brand-text p').forEach(function (p) {
      if (p.style.display !== 'none') {
        p.style.setProperty('display', 'none', 'important');
      }
    });
  }

  function applyRole() {
    var el = document.getElementById('agent-name-display');
    if (!el) return;
    var p = profile();
    var role = roleOf(p);
    var name = nameOf(p);
    if (isDev(name)) role = { label: 'Developer', cls: 'developer' };
    var key = name + '|' + role.label;
    if (el.getAttribute('data-dr-role-key') === key) {
      if (el.querySelector('.dr-side-role') || el.querySelector('.dr-role-pill')) return;
    }
    el.setAttribute('data-dr-role-key', key);
    el.innerHTML =
      '<span class="dr-side-name">' + esc(name) + '</span> ' +
      '<span class="dr-role-pill dr-side-role ' + esc(role.cls) + '" data-role="' + esc(role.cls) + '">' + esc(role.label) + '</span>';
  }

  function capture() {
    try {
      if (window.DR && window.DR.profile) window.__drProfile = window.DR.profile;
      if (window.currentProfile) window.__drProfile = window.currentProfile;
    } catch (e) {}
  }

  function tick() {
    css();
    capture();
    applyBrand();
    applyRole();
  }

  tick();
  setTimeout(tick, 1500);
  setInterval(tick, 15000);
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
      setTimeout(tick, 100);
    }
  }, true);
})();
