/**
 * Divine Rays — premium agent sidebar redesign v2
 * Restores original gear logo, compact name chip, refined density
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_SIDEBAR_DESIGN_V2 = 1;

  var STYLE_ID = 'dr-sidebar-design-css';

  var ICONS = {
    dashboard:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    'my-tickets':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>',
    unassigned:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2.5"/></svg>',
    'all-tickets':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    kb:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    users:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    admin:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    endusers:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  };

  // Original gear SVG (same as app shell) — do not replace with flat icon
  var GEAR_SVG =
    '<svg class="gear-icon" viewBox="0 0 64 64" aria-hidden="true">' +
    '<g transform="translate(32,32)" fill="currentColor">' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(45)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(90)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(135)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(180)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(225)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(270)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(315)"/>' +
    '<circle r="17"/>' +
    '<circle r="9" fill="#1a1625"/>' +
    '<circle r="5"/>' +
    '<circle r="2.2" fill="#1a1625"/>' +
    '</g></svg>';

  var CSS = [
    /* ===== Shell ===== */
    '#portal-agent .sidebar{',
    'position:relative!important;',
    'width:256px!important;min-width:256px!important;',
    'display:flex!important;flex-direction:column!important;',
    'padding:0.85rem 0.7rem 0.7rem!important;',
    'background:linear-gradient(175deg,#14121f 0%,#0e0c18 55%,#0c0a14 100%)!important;',
    'border-right:1px solid rgba(139,124,247,0.14)!important;',
    'box-shadow:6px 0 28px rgba(0,0,0,0.4)!important;',
    'overflow-y:auto!important;overflow-x:hidden!important;',
    'scrollbar-width:thin!important;',
    'scrollbar-color:rgba(139,124,247,0.25) transparent!important;',
    'z-index:20!important}',

    '#portal-agent .sidebar::-webkit-scrollbar{width:5px}',
    '#portal-agent .sidebar::-webkit-scrollbar-thumb{',
    'background:rgba(139,124,247,0.3);border-radius:8px}',

    '#portal-agent .sidebar::before{',
    'content:"";position:absolute;inset:0;pointer-events:none;z-index:0;',
    'background:',
    'radial-gradient(ellipse 90% 35% at 15% 0%,rgba(124,106,240,0.16),transparent 55%),',
    'linear-gradient(180deg,transparent 70%,rgba(91,76,224,0.06) 100%)}',

    '#portal-agent .sidebar > *{position:relative;z-index:1}',

    /* ===== Brand — original gear, not flat purple tile ===== */
    '#portal-agent .sidebar .brand{',
    'display:flex!important;align-items:center!important;gap:0.65rem!important;',
    'padding:0.25rem 0.4rem 0.85rem!important;margin:0!important;',
    'border-bottom:1px solid rgba(139,124,247,0.1)!important}',

    '#portal-agent .sidebar .logo.logo-gear,',
    '#portal-agent .sidebar .brand .logo{',
    'width:38px!important;height:38px!important;border-radius:11px!important;',
    'background:rgba(26,24,42,0.9)!important;',
    'border:1px solid rgba(139,124,247,0.35)!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'box-shadow:0 2px 10px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.04)!important;',
    'flex-shrink:0!important;color:#a78bfa!important;',
    'padding:0!important}',

    '#portal-agent .sidebar .logo svg,',
    '#portal-agent .sidebar .gear-icon{',
    'width:26px!important;height:26px!important;',
    'color:#c4b5fd!important;display:block!important}',

    '#portal-agent .sidebar .brand-text h1{',
    'margin:0!important;font-size:0.98rem!important;font-weight:700!important;',
    'letter-spacing:-0.02em!important;color:#f3f0ff!important;line-height:1.15!important}',

    '#portal-agent .sidebar .brand-text p{',
    'margin:0.12rem 0 0!important;font-size:0.62rem!important;font-weight:600!important;',
    'color:#8b7cf7!important;letter-spacing:0.06em!important;text-transform:uppercase!important}',

    /* ===== Profile — compact ===== */
    '#portal-agent .sidebar .agent-badge,',
    '#portal-agent .sidebar .sidebar-profile,',
    '#portal-agent .sidebar .profile-chip{',
    'display:flex!important;flex-direction:column!important;align-items:center!important;',
    'gap:0.4rem!important;margin:0.75rem 0.15rem 0.85rem!important;',
    'padding:0.75rem 0.55rem!important;',
    'background:rgba(26,24,42,0.55)!important;',
    'border:1px solid rgba(139,124,247,0.2)!important;',
    'border-radius:14px!important;',
    'box-shadow:0 4px 14px rgba(0,0,0,0.2)!important}',

    '#portal-agent .sidebar .agent-badge img,',
    '#portal-agent .sidebar .sidebar-profile img,',
    '#portal-agent .sidebar .profile-chip img,',
    '#portal-agent .sidebar .avatar-ring img{',
    'width:52px!important;height:52px!important;border-radius:50%!important;',
    'object-fit:cover!important;',
    'border:2px solid rgba(167,139,250,0.55)!important;',
    'box-shadow:0 0 0 3px rgba(124,106,240,0.12),0 3px 10px rgba(0,0,0,0.3)!important}',

    /* Name chip — smaller */
    '#portal-agent .sidebar #agent-name-display,',
    '#portal-agent .sidebar .agent-badge > span:not(.dr-nav-ico),',
    '#portal-agent .sidebar .profile-name{',
    'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
    'gap:0.25rem!important;',
    'padding:0.18rem 0.55rem!important;',
    'max-width:11.5rem!important;',
    'background:rgba(12,10,24,0.65)!important;',
    'border:1px solid rgba(139,124,247,0.22)!important;',
    'border-radius:999px!important;',
    'font-size:0.7rem!important;font-weight:600!important;',
    'line-height:1.25!important;',
    'color:#d4d0ef!important;',
    'white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}',

    /* ===== Nav ===== */
    '#portal-agent .sidebar .nav{',
    'display:flex!important;flex-direction:column!important;',
    'gap:0.18rem!important;flex:1!important;',
    'padding:0.1rem 0.1rem 0.4rem!important;margin:0!important}',

    '#portal-agent .sidebar .nav-section-label{',
    'font-size:0.58rem!important;font-weight:700!important;',
    'letter-spacing:0.09em!important;text-transform:uppercase!important;',
    'color:rgba(167,139,250,0.5)!important;',
    'padding:0.65rem 0.7rem 0.25rem!important;margin:0!important}',

    '#portal-agent .sidebar .nav-btn{',
    'position:relative!important;',
    'display:flex!important;align-items:center!important;gap:0.6rem!important;',
    'width:100%!important;text-align:left!important;',
    'padding:0.52rem 0.7rem!important;',
    'border:none!important;border-radius:10px!important;',
    'background:transparent!important;',
    'color:#a8a4c0!important;',
    'font-size:0.84rem!important;font-weight:500!important;',
    'cursor:pointer!important;',
    'transition:background 0.14s ease,color 0.14s ease,box-shadow 0.14s ease!important}',

    '#portal-agent .sidebar .nav-btn .dr-nav-ico{',
    'width:17px!important;height:17px!important;flex-shrink:0!important;',
    'opacity:0.65!important;display:inline-flex!important}',

    '#portal-agent .sidebar .nav-btn .dr-nav-ico svg{width:17px!important;height:17px!important}',

    '#portal-agent .sidebar .nav-btn:hover{',
    'background:rgba(139,124,247,0.1)!important;',
    'color:#ebe7ff!important}',

    '#portal-agent .sidebar .nav-btn:hover .dr-nav-ico{opacity:1!important}',

    '#portal-agent .sidebar .nav-btn.active{',
    'background:linear-gradient(135deg,rgba(124,106,240,0.28),rgba(91,76,224,0.14))!important;',
    'color:#fff!important;',
    'box-shadow:inset 0 0 0 1px rgba(167,139,250,0.22)!important;',
    'font-weight:600!important}',

    '#portal-agent .sidebar .nav-btn.active .dr-nav-ico{opacity:1!important;color:#c4b5fd!important}',

    '#portal-agent .sidebar .nav-btn.active::before{',
    'content:"";position:absolute;left:0;top:22%;bottom:22%;',
    'width:3px;border-radius:0 3px 3px 0;',
    'background:linear-gradient(180deg,#c4b5fd,#7c6af8);',
    'box-shadow:0 0 10px rgba(167,139,250,0.55)}',

    '#portal-agent .sidebar .nav-btn[aria-expanded],',
    '#portal-agent .sidebar .nav-group-toggle{',
    'justify-content:flex-start!important}',

    '#portal-agent .sidebar .nav-sub{',
    'display:flex!important;flex-direction:column!important;',
    'gap:0.12rem!important;padding:0.12rem 0 0.2rem 0.35rem!important;',
    'margin-left:0.7rem!important;',
    'border-left:1px solid rgba(139,124,247,0.16)!important}',

    '#portal-agent .sidebar .nav-sub .nav-btn{',
    'padding:0.42rem 0.65rem!important;font-size:0.78rem!important;',
    'border-radius:8px!important}',

    /* ===== Footer ===== */
    '#portal-agent .sidebar .sidebar-footer{',
    'margin-top:auto!important;padding-top:0.65rem!important;',
    'border-top:1px solid rgba(139,124,247,0.1)!important;',
    'display:flex!important;flex-direction:column!important;gap:0.45rem!important}',

    '#portal-agent .sidebar .sidebar-user-card,',
    '#portal-agent .sidebar .presence-card{',
    'display:flex!important;flex-direction:column!important;gap:0.45rem!important;',
    'padding:0.6rem 0.65rem!important;',
    'background:rgba(22,20,36,0.75)!important;',
    'border:1px solid rgba(139,124,247,0.18)!important;',
    'border-radius:11px!important}',

    '#portal-agent .sidebar .presence-row{',
    'display:flex!important;align-items:center!important;gap:0.35rem!important;',
    'font-size:0.75rem!important;font-weight:600!important;color:#d8d4f0!important}',

    '#portal-agent .sidebar .presence-dot{',
    'width:7px!important;height:7px!important;border-radius:50%!important;',
    'background:#34d399!important;',
    'box-shadow:0 0 0 2.5px rgba(52,211,153,0.2)!important;',
    'flex-shrink:0!important}',

    '#portal-agent .sidebar .stat-pills{',
    'display:grid!important;grid-template-columns:1fr 1fr!important;gap:0.35rem!important}',

    '#portal-agent .sidebar .stat-pill{',
    'display:flex!important;flex-direction:column!important;align-items:center!important;',
    'padding:0.38rem 0.25rem!important;',
    'background:rgba(12,10,24,0.55)!important;',
    'border:1px solid rgba(139,124,247,0.12)!important;',
    'border-radius:8px!important}',

    '#portal-agent .sidebar .stat-pill .n{',
    'font-size:0.95rem!important;font-weight:700!important;line-height:1.1!important;',
    'color:#ebe7ff!important}',

    '#portal-agent .sidebar .stat-pill .l{',
    'font-size:0.52rem!important;font-weight:600!important;letter-spacing:0.04em!important;',
    'text-transform:uppercase!important;color:#8e8ea8!important}',

    '#portal-agent .sidebar .stat-pill.critical .n{color:#f87171!important}',
    '#portal-agent .sidebar .stat-pill.critical{',
    'border-color:rgba(248,113,113,0.28)!important;',
    'background:rgba(248,113,113,0.07)!important}',

    '#portal-agent .sidebar #btn-export,',
    '#portal-agent .sidebar .btn-export{',
    'width:100%!important;',
    'padding:0.48rem 0.65rem!important;',
    'border-radius:9px!important;',
    'border:1px solid rgba(139,124,247,0.28)!important;',
    'background:rgba(124,106,240,0.18)!important;',
    'color:#e4e0ff!important;',
    'font-size:0.75rem!important;font-weight:600!important;',
    'cursor:pointer!important;',
    'transition:background 0.14s,border-color 0.14s!important}',

    '#portal-agent .sidebar #btn-export:hover{',
    'background:rgba(124,106,240,0.32)!important;',
    'border-color:rgba(167,139,250,0.45)!important}',

    '#portal-agent .sidebar .kbd-hint{',
    'font-size:0.58rem!important;color:rgba(148,148,174,0.65)!important;',
    'text-align:center!important;margin:0.1rem 0 0!important}',

    '#portal-agent .sidebar .version,',
    '#portal-agent .sidebar .credit-side{',
    'font-size:0.55rem!important;color:rgba(148,148,174,0.4)!important;',
    'text-align:center!important;margin:0!important}',

    /* Light mode */
    'html[data-theme="light"] #portal-agent .sidebar{',
    'background:linear-gradient(175deg,#faf9ff 0%,#f3f0fa 100%)!important;',
    'border-right-color:rgba(109,94,245,0.12)!important;',
    'box-shadow:4px 0 20px rgba(30,30,60,0.05)!important}',

    'html[data-theme="light"] #portal-agent .sidebar .logo.logo-gear,',
    'html[data-theme="light"] #portal-agent .sidebar .brand .logo{',
    'background:#fff!important;border-color:rgba(109,94,245,0.25)!important;',
    'color:#6d5ef5!important}',

    'html[data-theme="light"] #portal-agent .sidebar .gear-icon{color:#6d5ef5!important}',
    'html[data-theme="light"] #portal-agent .sidebar .brand-text h1{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .sidebar .brand-text p{color:#6d5ef5!important}',

    'html[data-theme="light"] #portal-agent .sidebar .agent-badge{',
    'background:#fff!important;border-color:rgba(109,94,245,0.18)!important}',

    'html[data-theme="light"] #portal-agent .sidebar #agent-name-display{',
    'background:#f5f3ff!important;color:#3b3660!important;',
    'border-color:rgba(109,94,245,0.18)!important}',

    'html[data-theme="light"] #portal-agent .sidebar .nav-btn{color:#5b5778!important}',
    'html[data-theme="light"] #portal-agent .sidebar .nav-btn:hover{',
    'background:rgba(124,106,240,0.08)!important;color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .sidebar .nav-btn.active{',
    'background:rgba(124,106,240,0.14)!important;color:#4c1d95!important}',

    'html[data-theme="light"] #portal-agent .sidebar .sidebar-user-card{',
    'background:#fff!important;border-color:rgba(109,94,245,0.15)!important}',
    'html[data-theme="light"] #portal-agent .sidebar .presence-row{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .sidebar .stat-pill{',
    'background:#f7f5fc!important}',
    'html[data-theme="light"] #portal-agent .sidebar .stat-pill .n{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .sidebar #btn-export{',
    'background:#7c6af8!important;color:#fff!important;border:none!important}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function restoreGearLogo() {
    var logo = document.querySelector('#portal-agent .sidebar .logo.logo-gear, #portal-agent .sidebar .brand .logo');
    if (!logo) return;
    // If logo was replaced with a simple settings icon, restore original gear
    var svg = logo.querySelector('svg');
    var isSimple =
      !svg ||
      (svg.innerHTML || '').indexOf('translate(32,32)') === -1;
    if (isSimple) {
      logo.innerHTML = GEAR_SVG;
      logo.classList.add('logo-gear');
    }
  }

  function viewKey(btn) {
    var v = (btn.getAttribute('data-view') || '').toLowerCase();
    var t = (btn.textContent || '').trim().toLowerCase();
    if (v === 'dashboard' || t === 'dashboard') return 'dashboard';
    if (v === 'my-tickets' || t.indexOf('my ticket') !== -1) return 'my-tickets';
    if (v === 'unassigned' || t === 'unassigned') return 'unassigned';
    if (v === 'all-tickets' || t.indexOf('all ticket') !== -1) return 'all-tickets';
    if (v === 'kb' || t.indexOf('knowledge') !== -1) return 'kb';
    if (v === 'admin' || t === 'admin') return 'admin';
    if (t.indexOf('end-user') !== -1 || t.indexOf('enduser') !== -1) return 'endusers';
    if (t === 'users' || v === 'users') return 'users';
    return v || t;
  }

  function decorateNav() {
    var nav = document.querySelector('#portal-agent .nav');
    if (!nav) return;
    nav.querySelectorAll('.nav-btn').forEach(function (btn) {
      if (btn.querySelector('.dr-nav-ico')) return;
      var key = viewKey(btn);
      var ico = ICONS[key];
      if (!ico) return;
      var span = document.createElement('span');
      span.className = 'dr-nav-ico';
      span.setAttribute('aria-hidden', 'true');
      span.innerHTML = ico;
      btn.insertBefore(span, btn.firstChild);
    });
  }

  function polishFooter() {
    var foot = document.querySelector('#portal-agent .sidebar-footer');
    if (!foot || foot.getAttribute('data-dr-polished')) return;
    foot.setAttribute('data-dr-polished', '1');
    var exp = foot.querySelector('#btn-export');
    if (exp) exp.classList.add('btn-export');
  }

  function boot() {
    if (!document.getElementById('portal-agent')) return;
    injectCss();
    restoreGearLogo();
    decorateNav();
    polishFooter();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1400);
  setTimeout(boot, 2800);

  document.addEventListener(
    'click',
    function () {
      setTimeout(decorateNav, 40);
      setTimeout(decorateNav, 250);
    },
    true
  );

  window.DRSidebarDesign = { refresh: boot };
})();
