/**
 * Divine Rays — status card + clean layout fixes (no broken overflow)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  if (!document.getElementById('dr-status-card-css')) {
    var st = document.createElement('style');
    st.id = 'dr-status-card-css';
    st.textContent = [
      '#portal-agent .sidebar::-webkit-scrollbar,#portal-agent .main::-webkit-scrollbar{width:8px;height:8px}',
      '#portal-agent .sidebar::-webkit-scrollbar-track,#portal-agent .main::-webkit-scrollbar-track{background:transparent}',
      '#portal-agent .sidebar::-webkit-scrollbar-thumb,#portal-agent .main::-webkit-scrollbar-thumb{background:rgba(124,106,240,0.35);border-radius:8px}',
      '#portal-agent .sidebar::-webkit-scrollbar-thumb:hover,#portal-agent .main::-webkit-scrollbar-thumb:hover{background:rgba(124,106,240,0.55)}',
      '#portal-agent .sidebar,#portal-agent .main{scrollbar-width:thin;scrollbar-color:rgba(124,106,240,0.4) transparent}',
      '#portal-agent .sidebar{display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;padding:1rem 0.85rem 0.6rem!important}',
      '#portal-agent .sidebar .brand{margin-bottom:0.65rem!important}',
      '#portal-agent .agent-badge{margin-bottom:0.7rem!important}',
      '#portal-agent .nav{flex:1 1 auto;min-height:0;gap:0.2rem}',
      '#portal-agent .sidebar-footer{flex-shrink:0;margin-top:0.5rem;padding:0.65rem 0.35rem 0.35rem!important;border-top:1px solid var(--border,#2a2a3a)}',
      '#portal-agent .sidebar-footer .kbd-hint{font-size:0.62rem;color:#7a7a90;margin:0.35rem 0 0.1rem;line-height:1.35}',
      '#portal-agent .sidebar-footer .version{font-size:0.7rem;color:#9a9ab0;margin:0.1rem 0;font-weight:600}',
      '#portal-agent .sidebar-footer .credit-side{font-size:0.6rem;color:#8b8ba3;text-transform:uppercase;letter-spacing:0.05em;opacity:0.9;margin:0.15rem 0 0.1rem}',
      '#portal-agent .sidebar-avatar-chip{display:flex;justify-content:center;align-items:center;margin:0.35rem 0 0.35rem!important}',
      '#portal-agent .sidebar-avatar-chip .avatar-img,#portal-agent .sidebar-avatar-chip .avatar-fallback{width:52px!important;height:52px!important;border-radius:50%!important;object-fit:cover!important;border:2px solid rgba(124,106,240,0.55);box-shadow:0 0 0 3px rgba(124,106,240,0.15),0 4px 14px rgba(0,0,0,0.35)}',
      '#portal-agent .sidebar-avatar-chip img{width:52px!important;height:52px!important;border-radius:50%!important;object-fit:cover!important;display:block}',
      '.dr-status-card{margin:0.55rem 0.15rem 0.45rem;padding:0.6rem 0.65rem;background:linear-gradient(180deg,rgba(124,106,240,.1),rgba(124,106,240,.04));border:1px solid rgba(124,106,240,.22);border-radius:11px;flex-shrink:0}',
      '.dr-status-row{display:flex;align-items:center;gap:.4rem;margin-bottom:.5rem;font-size:.78rem;color:var(--text-muted,#8b8ba3)}',
      '.dr-status-you-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dr-status-name{color:var(--text,#f0f0f8);font-weight:600}',
      '.dr-status-dot{width:8px;height:8px;border-radius:50%;background:#34d399;box-shadow:0 0 0 3px rgba(52,211,153,.2);flex-shrink:0}',
      '.dr-status-metrics{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}',
      '.dr-status-metric{background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:.4rem .45rem;cursor:pointer;text-align:center;transition:border-color .15s,background .15s}',
      '.dr-status-metric:hover{border-color:rgba(124,106,240,.4);background:rgba(124,106,240,.1)}',
      '.dr-status-metric-value{display:block;font-size:1.1rem;font-weight:700;letter-spacing:-.03em;color:var(--text,#f0f0f8);line-height:1.15}',
      '.dr-status-metric-label{display:block;font-size:.6rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--text-muted,#8b8ba3);margin-top:.05rem}',
      '.dr-status-critical.is-hot{border-color:rgba(248,113,113,.45);background:rgba(248,113,113,.1)}',
      '.dr-status-critical.is-hot .dr-status-metric-value{color:#fca5a5}',
      'html[data-theme="light"] .dr-status-card{background:linear-gradient(180deg,rgba(109,94,245,.08),rgba(109,94,245,.03));border-color:rgba(109,94,245,.2)}',
      'html[data-theme="light"] .dr-status-metric{background:rgba(15,15,30,.04);border-color:rgba(15,15,30,.08)}',
      'html[data-theme="light"] .dr-status-name,html[data-theme="light"] .dr-status-metric-value{color:var(--text,#1a1a2e)}',
      '#btn-theme.btn-theme{min-width:3.2rem}',
      '.mode-bar .user-info{display:flex;align-items:center;gap:0.45rem;flex-wrap:wrap}'
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
