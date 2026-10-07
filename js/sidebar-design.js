/**
 * Divine Rays — premium agent sidebar redesign v2
 * Sidebar background forced to 20% opacity (dark + light)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SIDEBAR_DESIGN_V2 >= 5) return;
  window.__DR_SIDEBAR_DESIGN_V2 = 5;

  var STYLE_ID = 'dr-sidebar-design-css';

  var CSS = [
    '#portal-agent .sidebar{',
    'display:flex!important;flex-direction:column!important;',
    'width:250px!important;min-width:250px!important;',
    'padding:1rem 0.75rem!important;',
    'background:rgba(18,16,28,0.20)!important;',
    'backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;',
    'border-right:1px solid rgba(139,124,247,0.12)!important;',
    'box-shadow:4px 0 20px rgba(0,0,0,0.25)!important}',

    '#portal-agent .sidebar .brand{',
    'display:flex!important;align-items:center!important;gap:0.65rem!important;',
    'padding:0.25rem 0.35rem 0.85rem!important;',
    'border-bottom:1px solid rgba(139,124,247,0.12)!important;',
    'margin-bottom:0.15rem!important}',

    '#portal-agent .sidebar .logo.logo-gear,',
    '#portal-agent .sidebar .brand .logo{',
    'width:38px!important;height:38px!important;flex-shrink:0!important;',
    'display:grid!important;place-items:center!important;',
    'border-radius:11px!important;',
    'background:rgba(124,106,240,0.12)!important;',
    'border:1px solid rgba(139,124,247,0.28)!important;',
    'color:#a78bfa!important}',

    '#portal-agent .sidebar .gear-icon{width:22px!important;height:22px!important;color:inherit!important}',

    '#portal-agent .sidebar .brand-text h1{',
    'margin:0!important;font-size:0.92rem!important;font-weight:700!important;',
    'letter-spacing:-0.01em!important;color:#eeeef6!important;line-height:1.2!important}',

    '#portal-agent .sidebar .brand-text p{',
    'margin:0.12rem 0 0!important;font-size:0.62rem!important;font-weight:600!important;',
    'color:#8b7cf7!important;letter-spacing:0.06em!important;text-transform:uppercase!important}',

    '#portal-agent .sidebar .agent-badge,',
    '#portal-agent .sidebar .sidebar-profile,',
    '#portal-agent .sidebar .profile-chip{',
    'display:flex!important;flex-direction:column!important;align-items:center!important;',
    'gap:0.4rem!important;margin:0.75rem 0.15rem 0.5rem!important;',
    'padding:0.75rem 0.55rem 0.9rem!important;',
    'background:transparent!important;',
    'border:none!important;border-radius:0!important;',
    'border-bottom:1px solid rgba(148,148,174,0.3)!important;',
    'box-shadow:none!important}',

    '#portal-agent .sidebar .agent-badge img,',
    '#portal-agent .sidebar .sidebar-profile img,',
    '#portal-agent .sidebar .profile-chip img,',
    '#portal-agent .sidebar .avatar-ring img{',
    'width:52px!important;height:52px!important;border-radius:50%!important;',
    'object-fit:cover!important;',
    'border:2px solid rgba(167,139,250,0.55)!important;',
    'box-shadow:0 0 0 3px rgba(124,106,240,0.12),0 3px 10px rgba(0,0,0,0.3)!important}',

    '#portal-agent .sidebar #agent-name-display,',
    '#portal-agent .sidebar .agent-badge > span:not(.dr-nav-ico),',
    '#portal-agent .sidebar .profile-name{',
    'display:flex!important;align-items:baseline!important;justify-content:center!important;',
    'flex-wrap:wrap!important;gap:0.2rem 0.4rem!important;',
    'padding:0.15rem 0!important;max-width:100%!important;',
    'background:transparent!important;border:none!important;border-radius:0!important;',
    'box-shadow:none!important;',
    'font-size:0.82rem!important;font-weight:600!important;',
    'line-height:1.3!important;color:#d4d0ef!important;',
    'white-space:normal!important;overflow:visible!important}',

    '#portal-agent .sidebar .nav{',
    'display:flex!important;flex-direction:column!important;',
    'gap:0.18rem!important;flex:1!important;',
    'padding:0.35rem 0.1rem 0.4rem!important;margin:0!important}',

    '#portal-agent .sidebar .nav-section-label{',
    'font-size:0.58rem!important;font-weight:700!important;',
    'letter-spacing:0.09em!important;text-transform:uppercase!important;',
    'color:rgba(167,139,250,0.55)!important;',
    'padding:0.55rem 0.55rem 0.25rem!important;margin:0!important}',

    '#portal-agent .sidebar .nav-btn{',
    'display:flex!important;align-items:center!important;gap:0.6rem!important;',
    'width:100%!important;text-align:left!important;',
    'padding:0.52rem 0.7rem!important;',
    'border:none!important;border-radius:10px!important;',
    'background:transparent!important;',
    'color:#a8a4c0!important;font-size:0.84rem!important;font-weight:550!important;',
    'cursor:pointer!important;transition:background .15s,color .15s!important}',

    '#portal-agent .sidebar .nav-btn:hover{',
    'background:rgba(124,106,240,0.1)!important;color:#eeeef6!important}',

    '#portal-agent .sidebar .nav-btn.active{',
    'background:rgba(124,106,240,0.18)!important;color:#e9e5ff!important;',
    'box-shadow:inset 3px 0 0 #7c6af0!important}',

    '#portal-agent .sidebar .nav-btn .dr-nav-ico{',
    'width:18px!important;height:18px!important;opacity:0.85!important;flex-shrink:0!important}',

    '#portal-agent .sidebar .sidebar-footer{',
    'padding:0.75rem 0.25rem 0.25rem!important;',
    'border-top:1px solid rgba(139,124,247,0.12)!important;',
    'margin-top:auto!important}',

    '#portal-agent .sidebar .stat-pills{',
    'display:flex!important;flex-wrap:wrap!important;gap:0.35rem!important;',
    'padding:0.35rem 0.15rem!important}',

    '#portal-agent .sidebar .stat-pill{',
    'display:inline-flex!important;align-items:center!important;gap:0.25rem!important;',
    'padding:0.2rem 0.45rem!important;border-radius:8px!important;',
    'background:rgba(26,24,42,0.7)!important;',
    'border:1px solid rgba(139,124,247,0.15)!important;',
    'font-size:0.65rem!important}',

    '#portal-agent .sidebar .stat-pill .n{font-weight:700!important;color:#c4b5fd!important}',
    '#portal-agent .sidebar .stat-pill .l{color:#8b869e!important}',
    '#portal-agent .sidebar .stat-pill.critical .n{color:#f87171!important}',
    '#portal-agent .sidebar .stat-pill.critical{border-color:rgba(248,113,113,0.25)!important}',

    '#portal-agent .sidebar #btn-export{',
    'width:100%!important;margin-top:0.35rem!important;',
    'padding:0.45rem 0.65rem!important;border-radius:9px!important;',
    'background:#7c6af8!important;color:#fff!important;border:none!important;',
    'font-weight:600!important;font-size:0.78rem!important;cursor:pointer!important}',

    'html[data-theme="light"] #portal-agent .sidebar{',
    'background:rgba(255,255,255,0.20)!important;',
    'backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;',
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
    'background:transparent!important;border:none!important;',
    'border-bottom:1px solid rgba(90,90,120,0.22)!important;box-shadow:none!important}',

    'html[data-theme="light"] #portal-agent .sidebar #agent-name-display{',
    'background:transparent!important;color:#3b3660!important;',
    'border:none!important;box-shadow:none!important}',

    'html[data-theme="light"] #portal-agent .sidebar .nav-btn{color:#5b5778!important}',
    'html[data-theme="light"] #portal-agent .sidebar .nav-btn:hover{',
    'background:rgba(124,106,240,0.08)!important;color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .sidebar .nav-btn.active{',
    'background:rgba(124,106,240,0.14)!important;color:#4c1d95!important}',

    'html[data-theme="light"] #portal-agent .sidebar .sidebar-user-card{',
    'background:rgba(255,255,255,0.55)!important;border-color:rgba(109,94,245,0.15)!important}',
    'html[data-theme="light"] #portal-agent .sidebar .presence-row{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .sidebar .stat-pill{',
    'background:rgba(247,245,252,0.7)!important}',
    'html[data-theme="light"] #portal-agent .sidebar .stat-pill .n{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .sidebar #btn-export{',
    'background:#7c6af8!important;color:#fff!important;border:none!important}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
  }

  function forceSidebarBg() {
    var side = document.querySelector('#portal-agent .sidebar');
    if (!side) return;
    var theme = 'dark';
    try {
      theme = document.documentElement.getAttribute('data-theme') || 'dark';
    } catch (e) {}
    if (theme === 'light') {
      side.style.setProperty('background', 'rgba(255,255,255,0.20)', 'important');
    } else {
      side.style.setProperty('background', 'rgba(18,16,28,0.20)', 'important');
    }
    side.style.setProperty('backdrop-filter', 'blur(12px)', 'important');
    side.style.setProperty('-webkit-backdrop-filter', 'blur(12px)', 'important');
  }

  function boot() {
    injectCss();
    forceSidebarBg();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setInterval(forceSidebarBg, 1500);
  try {
    new MutationObserver(function () { forceSidebarBg(); }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  } catch (e) {}

  window.DRSidebarDesign = { refresh: boot, v: 5 };
})();
