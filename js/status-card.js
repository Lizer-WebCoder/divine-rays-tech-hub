/**
 * Divine Rays — sidebar mini status card
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  var CARD_ID = 'dr-status-card';

  function textOf(id) {
    var el = document.getElementById(id);
    if (!el) return '0';
    var t = (el.textContent || '0').trim();
    return t || '0';
  }

  function agentLabel() {
    var n = document.getElementById('agent-name-display');
    if (n && n.textContent) return n.textContent.trim().split('·')[0].trim() || 'You';
    var lb = document.getElementById('logged-user-label');
    if (lb && lb.textContent) {
      return lb.textContent.replace(/\s*\(.*\)\s*$/, '').trim() || 'You';
    }
    return 'You';
  }

  function ensureCard() {
    var sidebar = document.querySelector('#portal-agent .sidebar') || document.querySelector('.sidebar');
    if (!sidebar) return null;

    var existing = document.getElementById(CARD_ID);
    if (existing) return existing;

    var footer = sidebar.querySelector('.sidebar-footer');
    var card = document.createElement('div');
    card.id = CARD_ID;
    card.className = 'dr-status-card';
    card.innerHTML =
      '<div class="dr-status-row dr-status-you">' +
        '<span class="dr-status-dot" aria-hidden="true"></span>' +
        '<span class="dr-status-you-label"><strong class="dr-status-name">You</strong> · Online</span>' +
      '</div>' +
      '<div class="dr-status-metrics">' +
        '<div class="dr-status-metric" data-jump="unassigned" title="Unassigned tickets">' +
          '<span class="dr-status-metric-value" id="dr-stat-unassigned">0</span>' +
          '<span class="dr-status-metric-label">Unassigned</span>' +
        '</div>' +
        '<div class="dr-status-metric dr-status-critical" data-jump="critical" title="Critical open">' +
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
          var fp = document.getElementById('filter-priority');
          var dash = document.querySelector('#portal-agent .nav-btn[data-view="dashboard"]');
          if (dash) dash.click();
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
    if (!card) return;

    var nameEl = card.querySelector('.dr-status-name');
    if (nameEl) nameEl.textContent = agentLabel();

    var u = textOf('stat-unassigned');
    var c = textOf('stat-critical');
    var uEl = document.getElementById('dr-stat-unassigned');
    var cEl = document.getElementById('dr-stat-critical');
    if (uEl) uEl.textContent = u;
    if (cEl) cEl.textContent = c;

    var critMetric = card.querySelector('.dr-status-critical');
    if (critMetric) {
      critMetric.classList.toggle('is-hot', parseInt(c, 10) > 0);
    }
  }

  function boot() {
    if (!document.querySelector('#portal-agent')) return;
    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  setTimeout(boot, 600);
  setTimeout(boot, 2000);
  setTimeout(boot, 5000);

  setInterval(function () {
    if (document.getElementById('portal-agent') &&
        document.getElementById('portal-agent').classList.contains('active')) {
      refresh();
    }
  }, 8000);

  window.DRStatusCard = { refresh: refresh, ensure: ensureCard };
})();
