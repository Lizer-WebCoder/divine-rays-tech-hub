/**
 * Divine Rays — Sidebar profile v6
 * Name + role plain text (no pill), divider under profile, glowing avatar
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SIDEBAR_ROLE_LABEL >= 6) return;
  window.__DR_SIDEBAR_ROLE_LABEL = 6;

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
    if (document.getElementById('dr-sidebar-role-css')) {
      document.getElementById('dr-sidebar-role-css').remove();
    }
    var el = document.createElement('style');
    el.id = 'dr-sidebar-role-css';
    el.textContent = [
      '#portal-agent .sidebar .brand-text p, #portal-agent .brand-text p { display:none!important; }',

      '#portal-agent .sidebar #agent-name-display,',
      '#portal-agent #agent-name-display,',
      '#agent-name-display{',
      'display:flex!important;align-items:baseline!important;justify-content:center!important;',
      'flex-wrap:wrap!important;gap:0.2rem 0.4rem!important;',
      'background:transparent!important;border:none!important;box-shadow:none!important;',
      'padding:0.15rem 0!important;border-radius:0!important;max-width:100%!important}',

      '#agent-name-display .dr-side-name{',
      'font-weight:600!important;font-size:0.9rem!important;color:inherit!important}',

      '#agent-name-display .dr-side-role, #agent-name-display .dr-role-pill{',
      'display:inline!important;margin:0!important;padding:0!important;',
      'border:none!important;border-radius:0!important;background:transparent!important;',
      'box-shadow:none!important;font-size:0.78rem!important;font-weight:600!important;',
      'letter-spacing:0.01em!important}',

      '#agent-name-display .dr-side-role.developer, #agent-name-display .dr-role-pill[data-role="developer"]{color:#fbbf24!important}',
      '#agent-name-display .dr-side-role.admin, #agent-name-display .dr-role-pill[data-role="admin"]{color:#2dd4bf!important}',
      '#agent-name-display .dr-side-role.owner, #agent-name-display .dr-role-pill[data-role="owner"]{color:#c084fc!important}',
      '#agent-name-display .dr-side-role.agent, #agent-name-display .dr-role-pill[data-role="agent"]{color:#60a5fa!important}',

      '#portal-agent .sidebar .agent-badge{',
      'padding-bottom:0.9rem!important;margin-bottom:0.5rem!important;',
      'border-bottom:1px solid rgba(148,148,174,0.3)!important;',
      'background:transparent!important;border-radius:0!important;box-shadow:none!important}',

      '#portal-agent #sidebar-avatar-chip,',
      '#portal-agent .sidebar-avatar-chip{',
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
      'border-radius:50%!important;padding:3px!important;',
      'background:linear-gradient(135deg,#a78bfa,#7c6af0 40%,#60a5fa)!important;',
      'box-shadow:0 0 0 2px rgba(124,106,240,0.35),0 0 14px 3px rgba(124,106,240,0.55),0 0 28px 6px rgba(96,165,250,0.25)!important;',
      'animation:dr-avatar-glow 2.8s ease-in-out infinite!important}',

      '#portal-agent #sidebar-avatar-chip img,',
      '#portal-agent #sidebar-avatar-chip .avatar-img,',
      '#portal-agent .sidebar-avatar-chip img,',
      '#portal-agent .sidebar-avatar-chip .avatar-img{',
      'border-radius:50%!important;display:block!important;',
      'box-shadow:0 0 0 2px #1a1625!important}',

      '#portal-agent .agent-badge .avatar-img,',
      '#portal-agent .agent-badge img.avatar{',
      'border-radius:50%!important;',
      'box-shadow:0 0 0 2px rgba(124,106,240,0.5),0 0 12px 2px rgba(124,106,240,0.45)!important}',

      '@keyframes dr-avatar-glow{',
      '0%,100%{box-shadow:0 0 0 2px rgba(124,106,240,0.35),0 0 12px 3px rgba(124,106,240,0.45),0 0 22px 5px rgba(96,165,250,0.2)}',
      '50%{box-shadow:0 0 0 2px rgba(167,139,250,0.55),0 0 18px 5px rgba(124,106,240,0.7),0 0 32px 8px rgba(96,165,250,0.35)}}',

      'html[data-theme="light"] #portal-agent .sidebar .agent-badge{',
      'border-bottom-color:rgba(90,90,120,0.22)!important;background:transparent!important}'
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
    var key = name + '|' + role.label + '|plain6';
    if (el.getAttribute('data-dr-role-key') === key && el.querySelector('.dr-side-role')) return;
    el.setAttribute('data-dr-role-key', key);
    el.innerHTML =
      '<span class="dr-side-name">' + esc(name) + '</span>' +
      '<span class="dr-side-role ' + esc(role.cls) + '" data-role="' + esc(role.cls) + '">' + esc(role.label) + '</span>';
  }

  function tick() {
    css();
    applyBrand();
    applyRole();
  }

  tick();
  setTimeout(tick, 500);
  setTimeout(tick, 1500);
  setTimeout(tick, 3500);
  setInterval(tick, 20000);

  document.addEventListener(
    'click',
    function (e) {
      if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
        setTimeout(tick, 100);
      }
    },
    true
  );

  window.DRSidebarRole = { refresh: tick, v: 6 };
})();
