/**
 * Divine Rays — compact status card + fit-at-100% sidebar layout
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  if (!document.getElementById('dr-status-card-css')) {
    var st = document.createElement('style');
    st.id = 'dr-status-card-css';
    st.textContent = [
      '#portal-agent.active{min-height:0!important;height:calc(100vh - 49px)!important;overflow:hidden}',
      '#portal-agent .sidebar{height:100%!important;max-height:calc(100vh - 49px)!important;overflow-y:auto;overflow-x:hidden;padding:0.75rem 0.7rem 0.5rem!important;display:flex;flex-direction:column}',
      '#portal-agent .sidebar .brand{margin-bottom:0.5rem!important;padding:0.2rem 0.35rem!important}',
      '#portal-agent .sidebar .brand h1{font-size:0.95rem!important}',
      '#portal-agent .sidebar .brand p{font-size:0.68rem!important}',
      '#portal-agent .sidebar .logo.logo-gear{width:34px!important;height:34px!important;border-radius:9px!important}',
      '#portal-agent .sidebar-avatar-chip{margin:0.2rem 0 0.15rem!important}',
      '#portal-agent .sidebar-avatar-chip .avatar-img,#portal-agent .sidebar-avatar-chip .avatar-fallback,#portal-agent .sidebar-avatar-chip img{width:40px!important;height:40px!important}',
      '#portal-agent .agent-badge{margin-bottom:0.55rem!important;padding:0.4rem 0.6rem!important;font-size:0.8rem!important;border-radius:8px!important}',
      '#portal-agent .nav{flex:1 1 auto;min-height:0;gap:0.15rem!important}',
      '#portal-agent .nav-btn{padding:0.45rem 0.7rem!important;font-size:0.84rem!important;border-radius:8px!important}',
      '#portal-agent .nav-admin:not(.is-hidden){margin-top:0.35rem!important;padding-top:0.45rem!important}',
      '#portal-agent .sidebar-footer{flex-shrink:0;margin-top:0.35rem;padding:0.55rem 0.35rem 0.25rem!important;border-top:1px solid var(--border,#2a2a3a)}',
      '#portal-agent .sidebar-footer .btn{font-size:0.75rem!important;padding:0.28rem 0.55rem!important}',
      '#portal-agent .sidebar-footer .kbd-hint{font-size:0.6rem;color:#7a7a90;margin:0.3rem 0 0.1rem;opacity:0.9;line-height:1.3}',
      '#portal-agent .sidebar-footer .version{font-size:0.68rem;color:#9a9ab0;margin:0.1rem 0;font-weight:600}',
      '#portal-agent .sidebar-footer .credit-side{font-size:0.58rem;color:#8b8ba3;text-transform:uppercase;letter-spacing:0.05em;opacity:0.9;margin:0.15rem 0 0.1rem}',
      '#portal-agent .main{overflow-y:auto;max-height:calc(100vh - 49px);padding:0.85rem 1.1rem 1.25rem!important}',
      '#portal-agent .topbar{padding:0.65rem 0 0.75rem!important}',
      '#portal-agent .topbar h2{font-size:1.2rem!important}',
      '#portal-agent .stats{gap:0.5rem!important}',
      '#portal-agent .stat-card{padding:0.7rem 0.8rem!important}',
      '#portal-agent .stat-value{font-size:1.25rem!important}',
      '#portal-agent .stats-section{margin-bottom:1rem!important}',
      '.dr-status-card{margin:0.45rem 0.15rem 0.35rem;padding:0.55rem 0.6rem;background:linear-gradient(180deg,rgba(124,106,240,.1),rgba(124,106,240,.04));border:1px solid rgba(124,106,240,.22);border-radius:10px;flex-shrink:0}',
      '.dr-status-row{display:flex;align-items:center;gap:.4rem;margin-bottom:.45rem;font-size:.75rem;color:var(--text-muted,#8b8ba3)}',
      '.dr-status-you-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dr-status-name{color:var(--text,#f0f0f8);font-weight:600}',
      '.dr-status-dot{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 0 2px rgba(52,211,153,.2);flex-shrink:0}',
      '.dr-status-metrics{display:grid;grid-template-columns:1fr 1fr;gap:.35rem}',
      '.dr-status-metric{background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:.35rem .4rem;cursor:pointer;text-align:center}',
      '.dr-status-metric:hover{border-color:rgba(124,106,240,.4);background:rgba(124,106,240,.1)}',
      '.dr-status-metric-value{display:block;font-size:1.05rem;font-weight:700;letter-spacing:-.03em;color:var(--text,#f0f0f8);line-height:1.15}',
      '.dr-status-metric-label{display:block;font-size:.58rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--text-muted,#8b8ba3);margin-top:.05rem}',
      '.dr-status-critical.is-hot{border-color:rgba(248,113,113,.45);background:rgba(248,113,113,.1)}',
      '.dr-status-critical.is-hot .dr-status-metric-value{color:#fca5a5}',
      'html[data-theme="light"] .dr-status-card{background:linear-gradient(180deg,rgba(109,94,245,.08),rgba(109,94,245,.03));border-color:rgba(109,94,245,.2)}',
      'html[data-theme="light"] .dr-status-metric{background:rgba(15,15,30,.04);border-color:rgba(15,15,30,.08)}',
      'html[data-theme="light"] .dr-status-name,html[data-theme="light"] .dr-status-metric-value{color:var(--text,#1a1a2e)}',
      '.mode-bar{padding:0.45rem 1rem!important}',
      '#view-admin .admin-toolbar input{min-width:120px;max-width:200px}',
      '#portal-agent .perf-table{font-size:0.82rem}',
      '#portal-agent .perf-table th,#portal-agent .perf-table td{padding:0.5rem 0.65rem}'
    ].join('');
    document.head.appendChild(st);
  }

  var CARD_ID = 'dr-status-card';

  function textOf(id) {
    var el = document.getElementById(id);
    if (!el) return '0';
    return ((el.textContent || '0').trim()) || '0';
  }

  function agentLabel() {
    var n = document.getElementById('agent-name-display');
    if (n && n.textContent) return n.textContent.trim().split('\u00b7')[0].trim() || 'You';
    var lb = document.getElementById('logged-user-label');
    if (lb && lb.textContent) return lb.textContent.replace(/\s*\(.*\)\s*$/, '').trim() || 'You';
    return 'You';
  }

  function ensureFooterCredits() {
    var footer = document.querySelector('#portal-agent .sidebar-footer');
    if (!footer) return;
    if (!footer.querySelector('.kbd-hint')) {
      var k = document.createElement('p');
      k.className = 'kbd-hint';
      k.textContent = '/ search \u00b7 Esc back \u00b7 C claim';
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
      c.textContent = 'Lizzz \u00b7 All Rights Reserved';
      footer.appendChild(c);
    }
  }

  function ensureCard() {
    var sidebar = document.querySelector('#portal-agent .sidebar') || document.querySelector('.sidebar');
    if (!sidebar) return null;
    ensureFooterCredits();
    var existing = document.getElementById(CARD_ID);
    if (existing) return existing;

    var footer = sidebar.querySelector('.sidebar-footer');
    var card = document.createElement('div');
    card.id = CARD_ID;
    card.className = 'dr-status-card';
    card.innerHTML =
      '<div class="dr-status-row">' +
        '<span class="dr-status-dot" aria-hidden="true"></span>' +
        '<span class="dr-status-you-label"><strong class="dr-status-name">You</strong> \u00b7 Online</span>' +
      '</div>' +
      '<div class="dr-status-metrics">' +
        '<div class="dr-status-metric" data-jump="unassigned" title="View unassigned">' +
          '<span class="dr-status-metric-value" id="dr-stat-unassigned">0</span>' +
          '<span class="dr-status-metric-label">Unassigned</span>' +
        '</div>' +
        '<div class="dr-status-metric dr-status-critical" data-jump="critical" title="Filter critical">' +
          '<span class="dr-status-metric-value" id="dr-stat-critical">0</span>' +
          '<span class="dr-status-metric-label">Critical</span>' +
        '</div>' +
      '</div>';

    if (footer) sidebar.insertBefore(card, footer);
    else sidebar.appendChild(card);

    card.querySelectorAll('[data-jump]').forEach(function (el) {
      el.addEventListener('click', function () {
        var jump = el.getAttribute('data-jump');
        if (jump === 'unassigned') {
          var btn = document.querySelector('#portal-agent .nav-btn[data-view="unassigned"]');
          if (btn) btn.click();
        } else if (jump === 'critical') {
          var dash = document.querySelector('#portal-agent .nav-btn[data-view="dashboard"]');
          if (dash) dash.click();
          var fp = document.getElementById('filter-priority');
          if (fp) {
            fp.value = 'Critical';
            fp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    });
    return card;
  }

  function refresh() {
    var card = ensureCard();
    ensureFooterCredits();
    if (!card) return;
    var nameEl = card.querySelector('.dr-status-name');
    if (nameEl) nameEl.textContent = agentLabel();
    var u = textOf('stat-unassigned');
    var c = textOf('stat-critical');
    var uEl = document.getElementById('dr-stat-unassigned');
    var cEl = document.getElementById('dr-stat-critical');
    if (uEl) uEl.textContent = u;
    if (cEl) cEl.textContent = c;
    var crit = card.querySelector('.dr-status-critical');
    if (crit) crit.classList.toggle('is-hot', parseInt(c, 10) > 0);
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
