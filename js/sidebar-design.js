/**
 * Divine Rays — premium agent sidebar redesign
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SIDEBAR_DESIGN_V1) return;
  window.__DR_SIDEBAR_DESIGN_V1 = 1;

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

  var CSS = [
    /* ===== Shell ===== */
    '#portal-agent .sidebar{',
    'position:relative!important;',
    'width:268px!important;min-width:268px!important;',
    'display:flex!important;flex-direction:column!important;',
    'padding:1rem 0.85rem 0.85rem!important;',
    'background:linear-gradient(180deg,rgba(18,16,32,0.97) 0%,rgba(12,10,24,0.98) 100%)!important;',
    'border-right:1px solid rgba(139,124,247,0.16)!important;',
    'box-shadow:4px 0 32px rgba(0,0,0,0.35)!important;',
    'overflow-y:auto!important;overflow-x:hidden!important;',
    'z-index:20!important}',

    '#portal-agent .sidebar::before{',
    'content:"";position:absolute;inset:0;pointer-events:none;',
    'background:radial-gradient(ellipse 80% 40% at 20% -10%,rgba(124,106,240,0.18),transparent 60%),',
    'radial-gradient(ellipse 60% 30% at 100% 100%,rgba(91,76,224,0.12),transparent 50%);',
    'z-index:0}',

    '#portal-agent .sidebar > *{position:relative;z-index:1}',

    /* ===== Brand ===== */
    '#portal-agent .sidebar .brand{',
    'display:flex!important;align-items:center!important;gap:0.75rem!important;',
    'padding:0.35rem 0.5rem 1rem!important;margin:0!important;',
    'border-bottom:1px solid rgba(139,124,247,0.12)!important}',

    '#portal-agent .sidebar .logo.logo-gear,',
    '#portal-agent .sidebar .brand .logo{',
    'width:42px!important;height:42px!important;border-radius:12px!important;',
    'background:linear-gradient(145deg,#7c6af8,#5b4ce0)!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'box-shadow:0 4px 16px rgba(91,76,224,0.45),inset 0 1px 0 rgba(255,255,255,0.15)!important;',
    'flex-shrink:0!important;color:#fff!important}',

    '#portal-agent .sidebar .logo svg,',
    '#portal-agent .sidebar .gear-icon{width:22px!important;height:22px!important;color:#fff!important}',

    '#portal-agent .sidebar .brand-text h1{',
    'margin:0!important;font-size:1.05rem!important;font-weight:700!important;',
    'letter-spacing:-0.02em!important;color:#f5f3ff!important;line-height:1.2!important}',

    '#portal-agent .sidebar .brand-text p{',
    'margin:0.1rem 0 0!important;font-size:0.7rem!important;font-weight:500!important;',
    'color:#a78bfa!important;letter-spacing:0.04em!important;text-transform:uppercase!important}',

    /* ===== Profile card ===== */
    '#portal-agent .sidebar .agent-badge,',
    '#portal-agent .sidebar .sidebar-profile,',
    '#portal-agent .sidebar .profile-chip{',
    'display:flex!important;flex-direction:column!important;align-items:center!important;',
    'gap:0.55rem!important;margin:1rem 0.25rem 1.1rem!important;',
    'padding:1rem 0.75rem!important;',
    'background:linear-gradient(160deg,rgba(139,124,247,0.14),rgba(26,24,42,0.6))!important;',
    'border:1px solid rgba(139,124,247,0.28)!important;',
    'border-radius:16px!important;',
    'box-shadow:0 6px 20px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.04)!important}',

    '#portal-agent .sidebar .agent-badge img,',
    '#portal-agent .sidebar .sidebar-profile img,',
    '#portal-agent .sidebar .profile-chip img,',
    '#portal-agent .sidebar .avatar-ring img{',
    'width:64px!important;height:64px!important;border-radius:50%!important;',
    'object-fit:cover!important;',
    'border:2.5px solid rgba(167,139,250,0.65)!important;',
    'box-shadow:0 0 0 4px rgba(124,106,240,0.15),0 4px 14px rgba(0,0,0,0.35)!important}',

    '#portal-agent .sidebar #agent-name-display,',
    '#portal-agent .sidebar .agent-badge span,',
    '#portal-agent .sidebar .profile-name{',
    'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
    'gap:0.35rem!important;',
    'padding:0.35rem 0.85rem!important;',
    'background:rgba(12,10,24,0.55)!important;',
    'border:1px solid rgba(139,124,247,0.25)!important;',
    'border-radius:999px!important;',
    'font-size:0.82rem!important;font-weight:600!important;',
    'color:#e9e5ff!important;max-width:100%!important;',
    'white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}',

    /* ===== Nav ===== */
    '#portal-agent .sidebar .nav{',
    'display:flex!important;flex-direction:column!important;',
    'gap:0.28rem!important;flex:1!important;',
    'padding:0.15rem 0.15rem 0.5rem!important;margin:0!important}',

    '#portal-agent .sidebar .nav-section-label{',
    'font-size:0.62rem!important;font-weight:700!important;',
    'letter-spacing:0.08em!important;text-transform:uppercase!important;',
    'color:rgba(167,139,250,0.55)!important;',
    'padding:0.75rem 0.75rem 0.3rem!important;margin:0!important}',

    '#portal-agent .sidebar .nav-btn{',
    'position:relative!important;',
    'display:flex!important;align-items:center!important;gap:0.7rem!important;',
    'width:100%!important;text-align:left!important;',
    'padding:0.62rem 0.85rem!important;',
    'border:none!important;border-radius:11px!important;',
    'background:transparent!important;',
    'color:#b4b0cc!important;',
    'font-size:0.88rem!important;font-weight:550!important;',
    'cursor:pointer!important;',
    'transition:background 0.15s ease,color 0.15s ease,box-shadow 0.15s ease,transform 0.12s ease!important}',

    '#portal-agent .sidebar .nav-btn .dr-nav-ico{',
    'width:18px!important;height:18px!important;flex-shrink:0!important;',
    'opacity:0.7!important;display:inline-flex!important}',

    '#portal-agent .sidebar .nav-btn .dr-nav-ico svg{width:18px!important;height:18px!important}',

    '#portal-agent .sidebar .nav-btn:hover{',
    'background:rgba(139,124,247,0.12)!important;',
    'color:#ede9fe!important;',
    'transform:translateX(2px)!important}',

    '#portal-agent .sidebar .nav-btn:hover .dr-nav-ico{opacity:1!important}',

    '#portal-agent .sidebar .nav-btn.active{',
    'background:linear-gradient(135deg,rgba(124,106,240,0.32),rgba(91,76,224,0.18))!important;',
    'color:#fff!important;',
    'box-shadow:0 2px 12px rgba(91,76,224,0.25),inset 0 0 0 1px rgba(167,139,250,0.25)!important;',
    'font-weight:650!important}',

    '#portal-agent .sidebar .nav-btn.active .dr-nav-ico{opacity:1!important;color:#c4b5fd!important}',

    '#portal-agent .sidebar .nav-btn.active::before{',
    'content:"";position:absolute;left:0;top:20%;bottom:20%;',
    'width:3px;border-radius:0 4px 4px 0;',
    'background:linear-gradient(180deg,#a78bfa,#7c6af8);',
    'box-shadow:0 0 8px rgba(167,139,250,0.6)}',

    /* Submenu (Users) */
    '#portal-agent .sidebar .nav-btn[aria-expanded],',
    '#portal-agent .sidebar .nav-group-toggle{',
    'justify-content:space-between!important}',

    '#portal-agent .sidebar .nav-sub{',
    'display:flex!important;flex-direction:column!important;',
    'gap:0.15rem!important;padding:0.15rem 0 0.25rem 0.5rem!important;',
    'margin-left:0.85rem!important;',
    'border-left:1px solid rgba(139,124,247,0.18)!important}',

    '#portal-agent .sidebar .nav-sub .nav-btn{',
    'padding:0.5rem 0.75rem!important;font-size:0.82rem!important;',
    'border-radius:9px!important}',

    /* ===== Footer / presence ===== */
    '#portal-agent .sidebar .sidebar-footer{',
    'margin-top:auto!important;padding-top:0.75rem!important;',
    'border-top:1px solid rgba(139,124,247,0.12)!important;',
    'display:flex!important;flex-direction:column!important;gap:0.55rem!important}',

    '#portal-agent .sidebar .sidebar-user-card,',
    '#portal-agent .sidebar .presence-card{',
    'display:flex!important;flex-direction:column!important;gap:0.55rem!important;',
    'padding:0.7rem 0.75rem!important;',
    'background:rgba(26,24,42,0.65)!important;',
    'border:1px solid rgba(139,124,247,0.2)!important;',
    'border-radius:12px!important}',

    '#portal-agent .sidebar .presence-row{',
    'display:flex!important;align-items:center!important;gap:0.4rem!important;',
    'font-size:0.8rem!important;font-weight:600!important;color:#ddd6fe!important}',

    '#portal-agent .sidebar .presence-dot{',
    'width:8px!important;height:8px!important;border-radius:50%!important;',
    'background:#34d399!important;',
    'box-shadow:0 0 0 3px rgba(52,211,153,0.2)!important;',
    'flex-shrink:0!important}',

    '#portal-agent .sidebar .stat-pills{',
    'display:grid!important;grid-template-columns:1fr 1fr!important;gap:0.4rem!important}',

    '#portal-agent .sidebar .stat-pill{',
    'display:flex!important;flex-direction:column!important;align-items:center!important;',
    'padding:0.45rem 0.3rem!important;',
    'background:rgba(12,10,24,0.5)!important;',
    'border:1px solid rgba(139,124,247,0.15)!important;',
    'border-radius:9px!important}',

    '#portal-agent .sidebar .stat-pill .n{',
    'font-size:1.05rem!important;font-weight:700!important;line-height:1.15!important;',
    'color:#e9e5ff!important}',

    '#portal-agent .sidebar .stat-pill .l{',
    'font-size:0.58rem!important;font-weight:600!important;letter-spacing:0.04em!important;',
    'text-transform:uppercase!important;color:#9494ae!important}',

    '#portal-agent .sidebar .stat-pill.critical .n{color:#f87171!important}',
    '#portal-agent .sidebar .stat-pill.critical{',
    'border-color:rgba(248,113,113,0.3)!important;',
    'background:rgba(248,113,113,0.08)!important}',

    '#portal-agent .sidebar #btn-export,',
    '#portal-agent .sidebar .btn-export{',
    'width:100%!important;',
    'padding:0.55rem 0.75rem!important;',
    'border-radius:10px!important;',
    'border:1px solid rgba(139,124,247,0.3)!important;',
    'background:linear-gradient(135deg,rgba(124,106,240,0.25),rgba(91,76,224,0.15))!important;',
    'color:#e9e5ff!important;',
    'font-size:0.8rem!important;font-weight:600!important;',
    'cursor:pointer!important;',
    'transition:background 0.15s,box-shadow 0.15s,transform 0.12s!important}',

    '#portal-agent .sidebar #btn-export:hover{',
    'background:linear-gradient(135deg,rgba(124,106,240,0.4),rgba(91,76,224,0.25))!important;',
    'box-shadow:0 4px 14px rgba(91,76,224,0.3)!important;',
    'transform:translateY(-1px)!important}',

    '#portal-agent .sidebar .kbd-hint{',
    'font-size:0.62rem!important;color:rgba(148,148,174,0.75)!important;',
    'text-align:center!important;margin:0.15rem 0 0!important;',
    'letter-spacing:0.02em!important}',

    '#portal-agent .sidebar .version,',
    '#portal-agent .sidebar .credit-side{',
    'font-size:0.58rem!important;color:rgba(148,148,174,0.5)!important;',
    'text-align:center!important;margin:0!important}',

    /* ===== Light mode ===== */
    'html[data-theme="light"] #portal-agent .sidebar{',
    'background:linear-gradient(180deg,#f8f6ff 0%,#f0ecfa 100%)!important;',
    'border-right-color:rgba(109,94,245,0.15)!important;',
    'box-shadow:4px 0 24px rgba(30,30,60,0.06)!important}',

    'html[data-theme="light"] #portal-agent .sidebar::before{',
    'background:radial-gradient(ellipse 80% 40% at 20% -10%,rgba(124,106,240,0.1),transparent 60%)}',

    'html[data-theme="light"] #portal-agent .sidebar .brand{',
    'border-bottom-color:rgba(109,94,245,0.12)!important}',

    'html[data-theme="light"] #portal-agent .sidebar .brand-text h1{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .sidebar .brand-text p{color:#6d5ef5!important}',

    'html[data-theme="light"] #portal-agent .sidebar .agent-badge,',
    'html[data-theme="light"] #portal-agent .sidebar .sidebar-profile{',
    'background:linear-gradient(160deg,rgba(124,106,240,0.1),#fff)!important;',
    'border-color:rgba(109,94,245,0.2)!important;',
    'box-shadow:0 4px 16px rgba(30,30,60,0.06)!important}',

    'html[data-theme="light"] #portal-agent .sidebar #agent-name-display,',
    'html[data-theme="light"] #portal-agent .sidebar .agent-badge span{',
    'background:#fff!important;color:#1e1b4b!important;',
    'border-color:rgba(109,94,245,0.2)!important}',

    'html[data-theme="light"] #portal-agent .sidebar .nav-btn{color:#4b5563!important}',
    'html[data-theme="light"] #portal-agent .sidebar .nav-btn:hover{',
    'background:rgba(124,106,240,0.1)!important;color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .sidebar .nav-btn.active{',
    'background:linear-gradient(135deg,rgba(124,106,240,0.2),rgba(91,76,224,0.1))!important;',
    'color:#4c1d95!important;',
    'box-shadow:0 2px 10px rgba(91,76,224,0.12),inset 0 0 0 1px rgba(124,106,240,0.25)!important}',

    'html[data-theme="light"] #portal-agent .sidebar .sidebar-footer{',
    'border-top-color:rgba(109,94,245,0.12)!important}',

    'html[data-theme="light"] #portal-agent .sidebar .sidebar-user-card{',
    'background:#fff!important;border-color:rgba(109,94,245,0.18)!important}',

    'html[data-theme="light"] #portal-agent .sidebar .presence-row{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .sidebar .stat-pill{',
    'background:#f8f6ff!important;border-color:rgba(109,94,245,0.15)!important}',
    'html[data-theme="light"] #portal-agent .sidebar .stat-pill .n{color:#1e1b4b!important}',

    'html[data-theme="light"] #portal-agent .sidebar #btn-export{',
    'background:linear-gradient(135deg,#7c6af8,#5b4ce0)!important;',
    'color:#fff!important;border:none!important}'
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
      // Put icon before text, preserve existing chevrons/labels
      var label = document.createElement('span');
      label.className = 'dr-nav-label';
      // move text nodes into label if simple
      var texts = [];
      Array.prototype.slice.call(btn.childNodes).forEach(function (n) {
        if (n.nodeType === 3) texts.push(n);
      });
      btn.insertBefore(span, btn.firstChild);
    });
  }

  function polishFooter() {
    var foot = document.querySelector('#portal-agent .sidebar-footer');
    if (!foot || foot.getAttribute('data-dr-polished')) return;
    foot.setAttribute('data-dr-polished', '1');

    // Wrap export if present
    var exp = foot.querySelector('#btn-export');
    if (exp) exp.classList.add('btn-export');
  }

  function boot() {
    if (!document.getElementById('portal-agent')) return;
    injectCss();
    decorateNav();
    polishFooter();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 600);
  setTimeout(boot, 1500);
  setTimeout(boot, 3000);

  // Re-decorate when Users menu injects items
  document.addEventListener(
    'click',
    function () {
      setTimeout(decorateNav, 50);
      setTimeout(decorateNav, 300);
    },
    true
  );

  window.DRSidebarDesign = { refresh: boot };
})();
