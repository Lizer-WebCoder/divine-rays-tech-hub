/**
 * Divine Rays — customer My Tickets: page size + category filter
 * Client-side only; does not change backend or ticket data
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUST_MY_TICKETS_FILTER_V1) return;
  window.__DR_CUST_MY_TICKETS_FILTER_V1 = 1;

  var BAR_ID = 'dr-cust-ticket-toolbar';
  var STYLE_ID = 'dr-cust-ticket-toolbar-css';
  var pageSize = 10;
  var category = 'all';
  var lastRun = 0;

  var CATEGORIES = [
    { value: 'all', label: 'All categories' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'software', label: 'Software' },
    { value: 'network', label: 'Network' },
    { value: 'account', label: 'Account' },
    { value: 'other', label: 'Other' }
  ];

  var CSS = [
    '#' + BAR_ID + '{',
    '  display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.65rem;',
    '  margin:0 0 0.85rem;padding:0.7rem 0.9rem;',
    '  border-radius:12px;',
    '  background:rgba(0,0,0,0.28);',
    '  border:1px solid rgba(139,124,247,0.22)',
    '}',
    'html[data-theme="light"] #' + BAR_ID + '{background:rgba(109,94,245,0.07);border-color:rgba(109,94,245,0.18)}',
    '#' + BAR_ID + ' .dr-ct-left{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center}',
    '#' + BAR_ID + ' label{font-size:0.72rem;font-weight:600;color:#9898b0;margin:0 0.15rem 0 0}',
    '#' + BAR_ID + ' select{',
    '  border-radius:8px;border:1px solid rgba(139,124,247,0.3);',
    '  background:rgba(0,0,0,0.35);color:#eeeef6;',
    '  padding:0.4rem 0.55rem;font-size:0.8rem;font-weight:600;outline:none;cursor:pointer',
    '}',
    'html[data-theme="light"] #' + BAR_ID + ' select{background:#fff;color:#1a1a28;border-color:rgba(109,94,245,0.25)}',
    '#' + BAR_ID + ' .dr-ct-count{font-size:0.75rem;color:#9898b0;white-space:nowrap}',
    '#' + BAR_ID + ' .dr-ct-count strong{color:#c4b5fd;font-weight:700}',
    '#portal-customer .ticket-card.dr-ct-hidden{display:none!important}'
  ].join('');

  function injectCss() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function isCustomerMyTickets() {
    var pc = document.getElementById('portal-customer');
    if (!pc) return false;
    var pa = document.getElementById('portal-agent');
    if (pa && pa.classList.contains('active')) return false;
    if (!(pc.classList.contains('active') || pc.offsetHeight > 40)) return false;
    var tab = document.querySelector('#portal-customer .customer-tabs .ctab.active');
    if (tab) {
      var t = (tab.getAttribute('data-ctab') || tab.textContent || '').toLowerCase();
      if (t.indexOf('my') !== -1 || t === 'tickets') return true;
    }
    // visible ticket cards under customer portal without submit form focus
    var cards = document.querySelectorAll('#portal-customer .ticket-card');
    return cards.length > 0;
  }

  function findListRoot() {
    var cards = document.querySelectorAll('#portal-customer .ticket-card');
    if (!cards.length) return null;
    return cards[0].parentElement;
  }

  function cardCategory(card) {
    var meta = card.querySelector('.ticket-meta');
    var text = ((meta && meta.textContent) || card.textContent || '').toLowerCase();
    for (var i = 1; i < CATEGORIES.length; i++) {
      if (text.indexOf(CATEGORIES[i].value) !== -1) return CATEGORIES[i].value;
    }
    return 'other';
  }

  function ensureBar(root) {
    var bar = document.getElementById(BAR_ID);
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = BAR_ID;
    bar.innerHTML =
      '<div class="dr-ct-left">' +
      '<label for="dr-ct-cat">Category</label>' +
      '<select id="dr-ct-cat" aria-label="Filter by category"></select>' +
      '<label for="dr-ct-size">Show</label>' +
      '<select id="dr-ct-size" aria-label="Tickets to show">' +
      '<option value="5">5</option>' +
      '<option value="10" selected>10</option>' +
      '<option value="20">20</option>' +
      '<option value="50">50</option>' +
      '<option value="100">All</option>' +
      '</select></div>' +
      '<div class="dr-ct-count" id="dr-ct-count"></div>';
    var cat = bar.querySelector('#dr-ct-cat');
    CATEGORIES.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.value;
      o.textContent = c.label;
      cat.appendChild(o);
    });
    cat.value = category;
    bar.querySelector('#dr-ct-size').value = String(pageSize === 100 ? 100 : pageSize);

    cat.addEventListener('change', function () {
      category = cat.value || 'all';
      applyFilter();
    });
    bar.querySelector('#dr-ct-size').addEventListener('change', function (e) {
      pageSize = parseInt(e.target.value, 10) || 10;
      applyFilter();
    });

    root.insertBefore(bar, root.firstChild);
    return bar;
  }

  function applyFilter() {
    injectCss();
    if (!isCustomerMyTickets()) {
      var b = document.getElementById(BAR_ID);
      if (b) b.style.display = 'none';
      return;
    }
    var root = findListRoot();
    if (!root) return;
    var bar = ensureBar(root);
    bar.style.display = 'flex';

    var cards = Array.prototype.slice.call(root.querySelectorAll('.ticket-card'));
    var matched = [];
    cards.forEach(function (card) {
      var cat = cardCategory(card);
      var ok = category === 'all' || cat === category;
      if (ok) matched.push(card);
      else card.classList.add('dr-ct-hidden');
    });

    matched.forEach(function (card, i) {
      if (i < pageSize) card.classList.remove('dr-ct-hidden');
      else card.classList.add('dr-ct-hidden');
    });

    var countEl = document.getElementById('dr-ct-count');
    if (countEl) {
      var shown = matched.filter(function (c) {
        return !c.classList.contains('dr-ct-hidden');
      }).length;
      countEl.innerHTML =
        'Showing <strong>' +
        shown +
        '</strong> of <strong>' +
        matched.length +
        '</strong>' +
        (category !== 'all' ? ' · ' + category : '');
    }
  }

  function tick() {
    var now = Date.now();
    if (now - lastRun < 600) return;
    lastRun = now;
    try {
      applyFilter();
    } catch (e) {}
  }

  injectCss();
  setTimeout(tick, 800);
  setTimeout(tick, 2000);
  setTimeout(tick, 4000);
  setInterval(tick, 4000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target && e.target.closest && e.target.closest('#portal-customer .ctab');
      if (t) setTimeout(tick, 120);
    },
    true
  );

  window.DRCustomerMyTicketsFilter = { refresh: applyFilter, v: 1 };
})();
