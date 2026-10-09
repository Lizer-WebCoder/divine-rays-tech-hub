/**
 * Divine Rays — compact sidebar layout + clean footer credits
 * Presence under avatar via sidebar-role-label; no kbd hints
 * Credit: Boyz at the Back LRK · All Rights Reserved
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
      '#portal-agent .sidebar-footer{margin-top:auto;padding-top:.45rem!important;flex-shrink:0;text-align:center!important}',
      '#portal-agent .sidebar-footer .kbd-hint{display:none!important}',
      '#portal-agent .sidebar-footer .version{',
      'display:block!important;font-size:.68rem!important;font-weight:650!important;',
      'color:#c8c4e0!important;opacity:1!important;margin:.2rem 0 .1rem!important;',
      'letter-spacing:.02em;text-align:center!important;line-height:1.35}',
      '#portal-agent .sidebar-footer .credit-side{',
      'display:block!important;font-size:.58rem!important;font-weight:500!important;',
      'color:#a8a4c0!important;opacity:.95!important;margin:.1rem 0 .25rem!important;',
      'text-align:center!important;line-height:1.4;letter-spacing:.01em}',
      'html[data-theme="light"] #portal-agent .sidebar-footer .version{color:#3d3a55!important}',
      'html[data-theme="light"] #portal-agent .sidebar-footer .credit-side{color:#5a5678!important}',
      '#portal-agent .sidebar-avatar-chip{display:flex!important;justify-content:center!important;margin:.45rem 0 .2rem!important}',
      '#portal-agent .sidebar-avatar-chip .avatar-img,#portal-agent .sidebar-avatar-chip .avatar-fallback,#portal-agent .sidebar-avatar-chip img{width:64px!important;height:64px!important;border-radius:50%!important;object-fit:cover!important;display:block;border:2.5px solid rgba(124,106,240,.6);box-shadow:0 0 0 3px rgba(124,106,240,.16),0 4px 14px rgba(0,0,0,.35)}',
      '#portal-agent .sidebar-avatar-chip .avatar-fallback{font-size:1.4rem!important;font-weight:700}',
      '#dr-status-card,.dr-status-card,.dr-status-metrics,',
      '#portal-agent .sidebar .stat-pills,#portal-agent .sidebar .stat-pill{display:none!important}',
      '#btn-theme.btn-theme{min-width:3.2rem}',
      '.mode-bar .user-info{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}'
    ].join('');
    document.head.appendChild(st);
  }

  function ensureFooterCredits() {
    var footer = document.querySelector('#portal-agent .sidebar-footer');
    if (!footer) return;

    footer.querySelectorAll('.kbd-hint').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    footer.querySelectorAll('p, span, div').forEach(function (n) {
      var tx = (n.textContent || '').trim();
      if (/search|Esc back|C claim|\/\s*search/i.test(tx) && !/v\d|Boyz|Rights|Reserved|LRK/i.test(tx)) {
        try { n.remove(); } catch (e) {}
      }
    });

    var ver = footer.querySelector('.version');
    if (!ver) {
      ver = document.createElement('p');
      ver.className = 'version';
      footer.appendChild(ver);
    }
    ver.textContent = 'v8.0.3';
    ver.style.cssText = 'display:block;text-align:center;margin:.2rem 0 .1rem';

    var credit = footer.querySelector('.credit-side');
    if (!credit) {
      credit = document.createElement('p');
      credit.className = 'credit-side';
      footer.appendChild(credit);
    }
    credit.textContent = 'Boyz at the Back LRK · All Rights Reserved';
    credit.style.cssText = 'display:block;text-align:center;margin:.1rem 0 .25rem';
  }

  function scrub() {
    ensureFooterCredits();
    var sidebar = document.querySelector('#portal-agent .sidebar');
    if (!sidebar) return;
    sidebar.querySelectorAll('#dr-status-card, .dr-status-card, .dr-status-metrics, .stat-pills').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
  }

  function boot() {
    if (!document.querySelector('#portal-agent')) return;
    scrub();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setTimeout(boot, 4000);
  setInterval(function () {
    var pa = document.getElementById('portal-agent');
    if (pa && pa.classList.contains('active')) scrub();
  }, 6000);

  window.DRStatusCard = { refresh: scrub, ensure: scrub };
})();
