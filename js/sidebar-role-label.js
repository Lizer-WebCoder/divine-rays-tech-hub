/**
 * Divine Rays — Sidebar role label v6 (name + role + Online under avatar)
 * Presence status lives under profile — not a separate bottom card
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
      if (window.DR && typeof window.DR.getProfile === 'function') {
        var gp = window.DR.getProfile();
        if (gp) return gp;
      }
      if (window.DR && window.DR.profile) return window.DR.profile;
      if (window.DR && window.DR.user) return window.DR.user;
      if (window.currentProfile) return window.currentProfile;
    } catch (e) {}
    return null;
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
    if (isDev(un)) return { label: 'Developer', cls: 'developer' };
    return { label: 'Admin', cls: 'admin' };
  }

  function nameOf(p) {
    if (p) {
      var n = String(p.username || p.name || p.display_name || p.full_name || '').trim();
      if (n) return n.split(/\s+/)[0];
    }
    var el = document.getElementById('agent-name-display');
    if (el) {
      var span = el.querySelector('.dr-side-name');
      if (span) return span.textContent.trim();
      var t = (el.textContent || '').replace(/[·\u00b7\-].*$/, '').trim();
      if (t && t !== 'Agent' && t !== 'Admin') return t.split(/\s+/)[0];
    }
    return 'You';
  }

  function css() {
    if (document.getElementById('dr-sidebar-role-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-sidebar-role-css';
    el.textContent = [
      '#portal-agent .sidebar .brand-text p, #portal-agent .brand-text p { display:none!important; }',

      /* Name + Role + Online chip under avatar */
      '#agent-name-display{',
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
      'flex-wrap:wrap!important;gap:0.3rem 0.4rem!important;',
      'max-width:100%!important;margin:0.15rem auto 0!important;',
      'padding:0.4rem 0.65rem!important;',
      'background:linear-gradient(145deg,rgba(124,106,240,.12),rgba(124,106,240,.04))!important;',
      'border:1px solid rgba(124,106,240,.22)!important;',
      'border-radius:12px!important;',
      'box-shadow:0 2px 10px rgba(0,0,0,.18)!important;',
      'line-height:1.35!important;font-size:0.78rem!important;',
      'white-space:normal!important;overflow:visible!important',
      '}',
      '#agent-name-display .dr-status-dot{',
      'width:8px;height:8px;border-radius:50%;flex-shrink:0;',
      'background:#34d399;box-shadow:0 0 0 3px rgba(52,211,153,.22);',
      'animation:dr-pulse-online 2.4s ease-in-out infinite',
      '}',
      '@keyframes dr-pulse-online{',
      '0%,100%{box-shadow:0 0 0 3px rgba(52,211,153,.22)}',
      '50%{box-shadow:0 0 0 5px rgba(52,211,153,.12)}',
      '}',
      '#agent-name-display .dr-side-name{',
      'color:var(--text,#f0f0f8);font-weight:650;letter-spacing:-0.01em;margin:0',
      '}',
      '#agent-name-display .dr-role-pill, #agent-name-display .dr-side-role{',
      'display:inline-block;padding:.12rem .45rem;border-radius:999px;',
      'font-size:.68rem;font-weight:700;letter-spacing:.02em;vertical-align:middle;margin:0',
      '}',
      '#agent-name-display .dr-side-role.developer, #agent-name-display .dr-role-pill[data-role="developer"]{',
      'background:rgba(234,179,8,.2);color:#fbbf24;border:1px solid rgba(234,179,8,.45)}',
      '#agent-name-display .dr-side-role.admin, #agent-name-display .dr-role-pill[data-role="admin"]{',
      'background:rgba(45,212,191,.15);color:#2dd4bf;border:1px solid rgba(45,212,191,.4)}',
      '#agent-name-display .dr-side-role.owner, #agent-name-display .dr-role-pill[data-role="owner"]{',
      'background:rgba(168,85,247,.18);color:#c084fc;border:1px solid rgba(168,85,247,.4)}',
      '#agent-name-display .dr-side-role.agent, #agent-name-display .dr-role-pill[data-role="agent"]{',
      'background:rgba(96,165,250,.15);color:#60a5fa;border:1px solid rgba(96,165,250,.4)}',
      '#agent-name-display .dr-online{',
      'color:#34d399;font-weight:550;font-size:.72rem;opacity:.95;white-space:nowrap',
      '}',

      /* Hide separate bottom status card — presence is under avatar now */
      '#dr-status-card,.dr-status-card{display:none!important}',
      '#portal-agent .sidebar .stat-pills,#portal-agent .sidebar .stat-pill{display:none!important}',

      'html[data-theme="light"] #agent-name-display{',
      'background:linear-gradient(145deg,rgba(109,94,245,.1),rgba(109,94,245,.03))!important;',
      'border-color:rgba(109,94,245,.2)!important;',
      'box-shadow:0 2px 8px rgba(109,94,245,.08)!important',
      '}',
      'html[data-theme="light"] #agent-name-display .dr-side-name{color:var(--text,#1a1a2e)}',
      'html[data-theme="light"] #agent-name-display .dr-online{color:#059669}',
      'html[data-theme="light"] #agent-name-display .dr-status-dot{background:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.2)}',

      '.presence-row .dr-side-role, .sidebar-footer .dr-side-role, #agent-presence .dr-side-role {',
      'display:inline-block;margin-left:.3rem;padding:.08rem .45rem;border-radius:999px;',
      'font-size:.65rem;font-weight:700;vertical-align:middle}',
      '.presence-row .dr-side-role.developer, .sidebar-footer .dr-side-role.developer{background:rgba(234,179,8,.2);color:#fbbf24;border:1px solid rgba(234,179,8,.45)}',
      '.presence-row .dr-side-role.admin, .sidebar-footer .dr-side-role.admin{background:rgba(45,212,191,.15);color:#2dd4bf;border:1px solid rgba(45,212,191,.4)}',
      '.presence-row .dr-side-role.agent, .sidebar-footer .dr-side-role.agent{background:rgba(96,165,250,.15);color:#60a5fa;border:1px solid rgba(96,165,250,.4)}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function applyBrand() {
    var h1 = document.querySelector('#portal-agent .sidebar .brand-text h1, #portal-agent .brand-text h1');
    if (h1 && h1.textContent.trim() !== 'Divine Rays Tech Hub') {
      h1.textContent = 'Divine Rays Tech Hub';
    }
  }

  function applyRole() {
    var el = document.getElementById('agent-name-display');
    if (!el) return;
    var p = profile();
    var name = nameOf(p);
    var role = roleOf(p, name);
    if (isDev(name)) role = { label: 'Developer', cls: 'developer' };
    var key = name + '|' + role.label + '|online';
    if (el.getAttribute('data-dr-role-key') === key && el.querySelector('.dr-online')) return;
    el.setAttribute('data-dr-role-key', key);
    el.innerHTML =
      '<span class="dr-status-dot" aria-hidden="true"></span>' +
      '<span class="dr-side-name">' + esc(name) + '</span>' +
      '<span class="dr-role-pill dr-side-role ' + esc(role.cls) + '" data-role="' + esc(role.cls) + '">' + esc(role.label) + '</span>' +
      '<span class="dr-online">\u00b7 Online</span>';
  }

  function applyPresence() {
    try {
      var p = profile();
      var name = nameOf(p);
      var role = roleOf(p, name);
      if (isDev(name)) role = { label: 'Developer', cls: 'developer' };
      var nodes = document.querySelectorAll(
        '.presence-row, .sidebar-footer .presence, #agent-presence, .sidebar .status-row, .sidebar-footer .user-chip'
      );
      nodes.forEach(function (row) {
        if (!row || row.querySelector('.dr-side-role')) return;
        var tx = (row.textContent || '').trim();
        if (!tx || !/Online|Offline|·|•/.test(tx)) return;
        if (row.children.length > 2) return;
        var online = /Online/i.test(tx) ? 'Online' : (/Offline/i.test(tx) ? 'Offline' : '');
        var nm = name;
        var m = tx.match(/^([A-Za-z0-9_]+)/);
        if (m) nm = m[1];
        if (isDev(nm)) role = { label: 'Developer', cls: 'developer' };
        row.setAttribute('data-dr-presence-key', nm + '|' + role.label);
        row.innerHTML =
          '<span class="dr-side-name">' + esc(nm) + '</span> ' +
          '<span class="dr-side-role ' + esc(role.cls) + '">' + esc(role.label) + '</span>' +
          (online ? ' <span class="dr-online-dot">· ' + online + '</span>' : '');
      });
    } catch (e) {}
  }

  function hideBottomCard() {
    try {
      var card = document.getElementById('dr-status-card');
      if (card) card.style.setProperty('display', 'none', 'important');
      document.querySelectorAll('.dr-status-card, .dr-status-metrics, .stat-pills').forEach(function (n) {
        try { n.style.setProperty('display', 'none', 'important'); } catch (e) {}
      });
    } catch (e) {}
  }

  function capture() {
    try {
      if (window.DR && typeof window.DR.getProfile === 'function') {
        var gp = window.DR.getProfile();
        if (gp) window.__drProfile = gp;
      }
      if (window.DR && window.DR.profile) window.__drProfile = window.DR.profile;
      if (window.currentProfile) window.__drProfile = window.currentProfile;
    } catch (e) {}
  }

  function tick() {
    css();
    capture();
    applyBrand();
    applyRole();
    applyPresence();
    hideBottomCard();
  }

  tick();
  var n = 0;
  var fast = setInterval(function () {
    tick();
    n += 1;
    if (n > 40) clearInterval(fast);
  }, 200);
  setInterval(tick, 3000);
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#portal-agent')) {
      setTimeout(tick, 50);
    }
  }, true);
  window.DRSidebarRole = { refresh: tick, v: 6 };
})();
