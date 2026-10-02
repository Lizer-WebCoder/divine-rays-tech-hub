/**
 * Divine Rays — customer My Tickets filter v3
 * Category + page size + Prev/Next; single chevron on selects
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUST_MY_TICKETS_FILTER_V3) return;
  window.__DR_CUST_MY_TICKETS_FILTER_V3 = 1;

  var BAR_ID = 'dr-cust-ticket-toolbar';
  var STYLE_ID = 'dr-cust-ticket-toolbar-css';
  var pageSize = 10;
  var pageIndex = 0;
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

  var CHEV_DARK =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23c4b5fd' d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")";
  var CHEV_LIGHT =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%235b21b6' d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")";

  var CSS = [
    '#' + BAR_ID + '{',
    '  display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.65rem;',
    '  margin:0 0 0.85rem;padding:0.7rem 0.9rem;',
    '  border-radius:12px;',
    '  background:rgba(0,0,0,0.28);',
    '  border:1px solid rgba(139,124,247,0.22)',
    '}',
    'html[data-theme="light"] #' + BAR_ID + '{',
    '  background:rgba(109,94,245,0.08);border-color:rgba(109,94,245,0.2)',
    '}',
    '#' + BAR_ID + ' .dr-ct-left{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center}',
    '#' + BAR_ID + ' .dr-ct-right{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center}',
    '#' + BAR_ID + ' label{font-size:0.72rem;font-weight:600;color:#a5a5bd;margin:0 0.15rem 0 0}',
    'html[data-theme="light"] #' + BAR_ID + ' label{color:#5b5b72}',

    /* Single custom chevron — kill native arrows */
    '#' + BAR_ID + ' select{',
    '  border-radius:8px;',
    '  border:1px solid rgba(167,139,250,0.4);',
    '  background-color:#1a1a28;',
    '  background-image:' + CHEV_DARK + ';',
    '  background-repeat:no-repeat;',
    '  background-position:right 0.55rem center;',
    '  background-size:10px 7px;',
    '  color:#f3f0ff;',
    '  padding:0.42rem 1.85rem 0.42rem 0.6rem;',
    '  font-size:0.8rem;font-weight:600;',
    '  outline:none;cursor:pointer;',
    '  color-scheme:dark;',
    '  -webkit-appearance:none;',
    '  -moz-appearance:none;',
    '  appearance:none',
    '}',
    '#' + BAR_ID + ' select::-ms-expand{display:none}',
    '#' + BAR_ID + ' select:focus{',
    '  border-color:#a78bfa;box-shadow:0 0 0 3px rgba(139,124,247,0.25)',
    '}',
    '#' + BAR_ID + ' select option{background-color:#1a1a28;color:#f3f0ff}',

    'html[data-theme="light"] #' + BAR_ID + ' select{',
    '  background-color:#ffffff;',
    '  background-image:' + CHEV_LIGHT + ';',
    '  background-repeat:no-repeat;',
    '  background-position:right 0.55rem center;',
    '  background-size:10px 7px;',
    '  color:#1a1a28;',
    '  border-color:rgba(109,94,245,0.35);',
    '  color-scheme:light',
    '}',
    'html[data-theme="light"] #' + BAR_ID + ' select option{background-color:#fff;color:#1a1a28}',

    '#' + BAR_ID + ' .dr-ct-count{font-size:0.75rem;color:#9898b0;white-space:nowrap}',
    'html[data-theme="light"] #' + BAR_ID + ' .dr-ct-count{color:#6b6b80}',
    '#' + BAR_ID + ' .dr-ct-count strong{color:#c4b5fd;font-weight:700}',
    'html[data-theme="light"] #' + BAR_ID + ' .dr-ct-count strong{color:#6d28d9}',

    '#' + BAR_ID + ' .dr-ct-nav{display:flex;align-items:center;gap:0.35rem}',
    '#' + BAR_ID + ' .dr-ct-nav button{',
    '  border:1px solid rgba(167,139,250,0.4);',
    '  background:rgba(124,106,240,0.18);',
    '  color:#e9e5ff;',
    '  border-radius:8px;',
    '  padding:0.38rem 0.7rem;',
    '  font-size:0.75rem;font-weight:700;',
    '  cursor:pointer',
    '}',
    '#' + BAR_ID + ' .dr-ct-nav button:hover:not(:disabled){background:rgba(124,106,240,0.32)}',
    '#' + BAR_ID + ' .dr-ct-nav button:disabled{opacity:0.4;cursor:not-allowed}',
    'html[data-theme="light"] #' + BAR_ID + ' .dr-ct-nav button{',
    '  background:#ede9fe;color:#4c1d95;border-color:rgba(109,94,245,0.3)',
    '}',
    '#' + BAR_ID + ' .dr-ct-page{',
    '  font-size:0.75rem;font-weight:600;color:#c4b5fd;min-width:4.5rem;text-align:center',
    '}',
    'html[data-theme="light"] #' + BAR_ID + ' .dr-ct-page{color:#6d28d9}',

    '#portal-customer .ticket-card.dr-ct-hidden{display:none!important}'
  ].join('');

  function injectCss() {
    var s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(s);
    }
    s.textContent = CSS;
  }

  function isLight() {
    try {
      return document.documentElement.getAttribute('data-theme') === 'light';
    } catch (e) {
      return false;
    }
  }

  function syncSelectTheme() {
    var light = isLight();
    document.querySelectorAll('#' + BAR_ID + ' select').forEach(function (sel) {
      sel.style.colorScheme = light ? 'light' : 'dark';
    });
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
    return document.querySelectorAll('#portal-customer .ticket-card').length > 0;
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
    if (bar) {
      syncSelectTheme();
      return bar;
    }
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
      '<div class="dr-ct-right">' +
      '<div class="dr-ct-count" id="dr-ct-count"></div>' +
      '<div class="dr-ct-nav">' +
      '<button type="button" id="dr-ct-prev" aria-label="Previous page">← Prev</button>' +
      '<span class="dr-ct-page" id="dr-ct-page">1 / 1</span>' +
      '<button type="button" id="dr-ct-next" aria-label="Next page">Next →</button>' +
      '</div></div>';

    var cat = bar.querySelector('#dr-ct-cat');
    CATEGORIES.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.value;
      o.textContent = c.label;
      cat.appendChild(o);
    });
    cat.value = category;
    bar.querySelector('#dr-ct-size').value = String(pageSize >= 100 ? 100 : pageSize);

    cat.addEventListener('change', function () {
      category = cat.value || 'all';
      pageIndex = 0;
      applyFilter();
    });
    bar.querySelector('#dr-ct-size').addEventListener('change', function (e) {
      pageSize = parseInt(e.target.value, 10) || 10;
      pageIndex = 0;
      applyFilter();
    });
    bar.querySelector('#dr-ct-prev').addEventListener('click', function () {
      if (pageIndex > 0) {
        pageIndex -= 1;
        applyFilter();
      }
    });
    bar.querySelector('#dr-ct-next').addEventListener('click', function () {
      pageIndex += 1;
      applyFilter();
    });

    root.insertBefore(bar, root.firstChild);
    syncSelectTheme();
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
    syncSelectTheme();

    var cards = Array.prototype.slice.call(root.querySelectorAll('.ticket-card'));
    var matched = [];
    cards.forEach(function (card) {
      var cat = cardCategory(card);
      if (category === 'all' || cat === category) matched.push(card);
      else card.classList.add('dr-ct-hidden');
    });

    var size = pageSize >= 100 ? matched.length || 1 : pageSize;
    var totalPages = Math.max(1, Math.ceil(matched.length / size));
    if (pageIndex >= totalPages) pageIndex = totalPages - 1;
    if (pageIndex < 0) pageIndex = 0;
    var start = pageIndex * size;
    var end = start + size;

    matched.forEach(function (card, i) {
      if (i >= start && i < end) card.classList.remove('dr-ct-hidden');
      else card.classList.add('dr-ct-hidden');
    });

    var shown = Math.min(size, Math.max(0, matched.length - start));
    var countEl = document.getElementById('dr-ct-count');
    if (countEl) {
      countEl.innerHTML =
        'Showing <strong>' +
        shown +
        '</strong> of <strong>' +
        matched.length +
        '</strong>' +
        (category !== 'all' ? ' · ' + category : '');
    }

    var pageEl = document.getElementById('dr-ct-page');
    if (pageEl) pageEl.textContent = pageIndex + 1 + ' / ' + totalPages;

    var prev = document.getElementById('dr-ct-prev');
    var next = document.getElementById('dr-ct-next');
    if (prev) prev.disabled = pageIndex <= 0;
    if (next) next.disabled = pageIndex >= totalPages - 1;

    var nav = bar.querySelector('.dr-ct-nav');
    if (nav) nav.style.display = totalPages > 1 ? 'flex' : 'none';
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
      var t = e.target && e.target.closest && e.target.closest('#portal-customer .ctab, #btn-theme, .btn-theme');
      if (t) setTimeout(tick, 150);
    },
    true
  );

  try {
    new MutationObserver(function () {
      syncSelectTheme();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (e) {}

  window.DRCustomerMyTicketsFilter = { refresh: applyFilter, v: 3 };
})();
