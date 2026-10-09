/**
 * Divine Rays — compact sidebar + presence (no metrics pills)
 * Status lives with Name · Role at the top; Unassigned/Critical removed
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';

  if (!document.getElementById('dr-status-card-css')) {
    var st = document.createElement('style');
    st.id = 'dr-status-card-css';
    st.textContent = [
      '#portal-agent .sidebar::-webkit-scrollbar,#portal-agent .main::-webkit-scrollbar{width:8px}',
      '#portal-agent .sidebar::-webkit-scrollbar-track,#portal-agent .main::-webkit-scrollbar-track{background:transparent}',
      '#portal-agent .sidebar::-webkit-scrollbar-thumb,#portal-agent .main::-webkit-scrollbar-thumb{background:rgba(124,106,240,.35);border-radius:8px}',
      '#portal-agent .sidebar,#portal-agent .main{scrollbar-width:thin;scrollbar-color:rgba(124,106,240,.4) transparent}',
      '#portal-agent.active{display:flex!important;width:100%;max-width:100%}',
      '#portal-agent .main{flex:1 1 auto!important;max-width:none!important;width:100%!important;margin:0!important;padding:1rem 1.5rem 1.75rem!important}',
      '#portal-agent .topbar{max-width:none}',
      '#portal-agent .stats{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(110px,1fr))!important;gap:.65rem!important}',
      '#view-admin .admin-stats,.admin-stats{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:.75rem!important;margin-bottom:1rem!important}',
      '#view-admin .admin-stats .stat-card,.admin-stats .stat-card{min-height:0!important;padding:.85rem 1rem!important}',
      '#view-admin .perf-table,#view-admin table{width:100%!important}',
      '#portal-agent .sidebar{width:240px;flex-shrink:0;display:flex;flex-direction:column;overflow:hidden!important;padding:.7rem .7rem .4rem!important;height:calc(100vh - 49px)!important;max-height:calc(100vh - 49px)!important}',
      '#portal-agent .sidebar .brand{margin-bottom:.35rem!important;padding:.1rem .25rem!important}',
      '#portal-agent .sidebar .brand h1{font-size:.9rem!important}',
      '#portal-agent .sidebar .brand p{font-size:.62rem!important}',
      '#portal-agent .sidebar .logo{width:32px!important;height:32px!important}',
      '#portal-agent .agent-badge{margin-bottom:.35rem!important;padding:.32rem .5rem!important;font-size:.75rem!important}',
      '#portal-agent .nav{flex:0 0 auto;gap:.08rem!important}',
      '#portal-agent .nav-btn{padding:.38rem .6rem!important;font-size:.8rem!important}',
      '#portal-agent .nav-admin:not(.is-hidden){margin-top:.15rem!important}',
      '#portal-agent .sidebar-footer{margin-top:auto;padding-top:.35rem!important;flex-shrink:0}',
      '#portal-agent .sidebar-footer .kbd-hint,#portal-agent .sidebar-footer .version,#portal-agent .sidebar-footer .credit-side{font-size:.58rem!important;opacity:.55;margin:.1rem 0!important;line-height:1.25}',
      '#portal-agent .sidebar-avatar-chip{display:flex!important;justify-content:center!important;margin:.45rem 0 .2rem!important}',
      '#portal-agent .sidebar-avatar-chip .avatar-img,#portal-agent .sidebar-avatar-chip .avatar-fallback,#portal-agent .sidebar-avatar-chip img{width:64px!important;height:64px!important;border-radius:50%!important;object-fit:cover!important;display:block;border:2.5px solid rgba(124,106,240,.6);box-shadow:0 0 0 3px rgba(124,106,240,.16),0 4px 14px rgba(0,0,0,.35)}',
      '#portal-agent .sidebar-avatar-chip .avatar-fallback{font-size:1.4rem!important;font-weight:700}',

      /* ── Presence only (no Unassigned / Critical metrics) ── */
      '.dr-status-card{',
      'margin:.2rem .05rem .45rem!important;',
      'padding:.55rem .65rem;',
      'background:linear-gradient(145deg,rgba(124,106,240,.12),rgba(124,106,240,.04));',
      'border:1px solid rgba(124,106,240,.22);',
      'border-radius:12px;',
      'flex-shrink:0;',
      'position:relative;',
      'z-index:1;',
      'box-shadow:0 2px 10px rgba(0,0,0,.18)',
      '}',
      '.dr-status-row{',
      'display:flex;',
      'align-items:center;',
      'gap:.45rem;',
      'margin:0;',
      'font-size:.78rem;',
      'line-height:1.35;',
      'color:var(--text-muted,#8b8ba3)',
      '}',
      '.dr-status-you-label{',
      'min-width:0;',
      'overflow:hidden;',
      'text-overflow:ellipsis;',
      'white-space:nowrap;',
      'display:flex;',
      'align-items:center;',
      'gap:.3rem;',
      'flex-wrap:nowrap',
      '}',
      '.dr-status-name{',
      'color:var(--text,#f0f0f8);',
      'font-weight:650;',
      'letter-spacing:-0.01em',
      '}',
      '.dr-status-role{',
      'font-size:.68rem;',
      'font-weight:600;',
      'padding:.12rem .4rem;',
      'border-radius:999px;',
      'letter-spacing:.02em;',
      'white-space:nowrap',
      '}',
      '.dr-status-role.developer{',
      'color:#fbbf24;',
      'background:rgba(234,179,8,.18);',
      'border:1px solid rgba(234,179,8,.4)',
      '}',
      '.dr-status-role.admin{',
      'color:#2dd4bf;',
      'background:rgba(45,212,191,.14);',
      'border:1px solid rgba(45,212,191,.35)',
      '}',
      '.dr-status-role.owner{',
      'color:#c084fc;',
      'background:rgba(192,132,252,.14);',
      'border:1px solid rgba(192,132,252,.35)',
      '}',
      '.dr-status-role.agent{',
      'color:#60a5fa;',
      'background:rgba(96,165,250,.14);',
      'border:1px solid rgba(96,165,250,.35)',
      '}',
      '.dr-status-online{',
      'color:#34d399;',
      'font-weight:550;',
      'font-size:.72rem;',
      'opacity:.95',
      '}',
      '.dr-status-dot{',
      'width:8px;',
      'height:8px;',
      'border-radius:50%;',
      'background:#34d399;',
      'box-shadow:0 0 0 3px rgba(52,211,153,.22);',
      'flex-shrink:0;',
      'animation:dr-pulse-online 2.4s ease-in-out infinite',
      '}',
      '@keyframes dr-pulse-online{',
      '0%,100%{box-shadow:0 0 0 3px rgba(52,211,153,.22)}',
      '50%{box-shadow:0 0 0 5px rgba(52,211,153,.12)}',
      '}',

      /* Hide any leftover metric pills if injected elsewhere */
      '.dr-status-metrics,',
      '#portal-agent .sidebar .stat-pills,',
      '#portal-agent .sidebar .stat-pill{display:none!important}',

      'html[data-theme="light"] .dr-status-card{',
      'background:linear-gradient(145deg,rgba(109,94,245,.1),rgba(109,94,245,.03));',
      'border-color:rgba(109,94,245,.2);',
      'box-shadow:0 2px 8px rgba(109,94,245,.08)',
      '}',
      'html[data-theme="light"] .dr-status-name{color:var(--text,#1a1a2e)}',
      'html[data-theme="light"] .dr-status-online{color:#059669}',
      'html[data-theme="light"] .dr-status-dot{background:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.2)}',
      '#btn-theme.btn-theme{min-width:3.2rem}',
      '.mode-bar .user-info{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}'
    ].join('');
    document.head.appendChild(st);
  }

  var CARD_ID = 'dr-status-card';

  var DEVS = { kirzhian: 1, kirzhianquijano: 1, kirzhianthegreat: 1, jamesjerlow123: 1, liya: 1, iiya: 1 };

  function isDev(s) {
    s = String(s || '').toLowerCase().trim();
    return !!DEVS[s] || s.indexOf('kirzhian') === 0;
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

  function agentName() {
    var p = profile();
    if (p) {
      var n = String(p.username || p.name || p.display_name || p.full_name || '').trim();
      if (n) return n.split(/\s+/)[0];
    }
    var el = document.getElementById('agent-name-display');
    if (el) {
      var span = el.querySelector('.dr-side-name');
      if (span && span.textContent) return span.textContent.trim();
      var t = (el.textContent || '').replace(/[·\u00b7\-].*$/, '').trim();
      if (t && t !== 'Agent' && t !== 'Admin') return t.split(/\s+/)[0];
    }
    var lb = document.getElementById('logged-user-label');
    if (lb && lb.textContent) return lb.textContent.replace(/\s*\(.*\)\s*$/, '').trim().split(/\s+/)[0] || 'You';
    return 'You';
  }

  function ensureFooterCredits() {
    var footer = document.querySelector('#portal-agent .sidebar-footer');
    if (!footer) return;
    if (!footer.querySelector('.kbd-hint')) {
      var k = document.createElement('p');
      k.className = 'kbd-hint';
      k.textContent = '/ search · Esc back · C claim';
      footer.appendChild(k);
    }
    if (!footer.querySelector('.version')) {
      var v = document.createElement('p');
      v.className = 'version';
      v.textContent = 'v8.0.3';
      footer.appendChild(v);
    } else {
      var verEl = footer.querySelector('.version');
      if (verEl && verEl.textContent.indexOf('8.0.3') === -1) verEl.textContent = 'v8.0.3';
    }
    if (!footer.querySelector('.credit-side')) {
      var c = document.createElement('p');
      c.className = 'credit-side';
      c.textContent = 'Boyz at the Back · All Rights Reserved';
      footer.appendChild(c);
    }
  }

  function ensureCard() {
    var sidebar = document.querySelector('#portal-agent .sidebar') || document.querySelector('.sidebar');
    if (!sidebar) return null;
    ensureFooterCredits();

    /* Remove any leftover metric nodes from older builds */
    sidebar.querySelectorAll('.dr-status-metrics, .stat-pills').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });

    var existing = document.getElementById(CARD_ID);
    if (existing) {
      var metrics = existing.querySelector('.dr-status-metrics');
      if (metrics) metrics.remove();
      return existing;
    }

    var footer = sidebar.querySelector('.sidebar-footer');
    var card = document.createElement('div');
    card.id = CARD_ID;
    card.className = 'dr-status-card';
    card.innerHTML =
      '<div class="dr-status-row">' +
        '<span class="dr-status-dot" aria-hidden="true"></span>' +
        '<span class="dr-status-you-label">' +
          '<strong class="dr-status-name">You</strong>' +
          '<span class="dr-status-role admin">Admin</span>' +
          '<span class="dr-status-online">· Online</span>' +
        '</span>' +
      '</div>';

    if (footer) sidebar.insertBefore(card, footer);
    else sidebar.appendChild(card);

    return card;
  }

  function refresh() {
    var card = ensureCard();
    ensureFooterCredits();
    if (!card) return;

    var name = agentName();
    var p = profile();
    var role = roleOf(p, name);
    if (isDev(name)) role = { label: 'Developer', cls: 'developer' };

    var nameEl = card.querySelector('.dr-status-name');
    if (nameEl) nameEl.textContent = name;

    var roleEl = card.querySelector('.dr-status-role');
    if (roleEl) {
      roleEl.textContent = role.label;
      roleEl.className = 'dr-status-role ' + role.cls;
    }

    var onlineEl = card.querySelector('.dr-status-online');
    if (onlineEl) onlineEl.textContent = '· Online';
  }

  function boot() {
    if (!document.querySelector('#portal-agent')) return;
    refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  setTimeout(boot, 600);
  setTimeout(boot, 2000);
  setTimeout(boot, 5000);

  setInterval(function () {
    var pa = document.getElementById('portal-agent');
    if (pa && pa.classList.contains('active')) refresh();
  }, 8000);

  window.DRStatusCard = { refresh: refresh, ensure: ensureCard };
})();
