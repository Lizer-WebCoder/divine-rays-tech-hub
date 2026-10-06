/**
 * Divine Rays — customer My Tickets filter v4
 * Category/Show on top; Showing + Prev/Next under the list.
 * Single chevron only. Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUST_MY_TICKETS_FILTER_V4) return;
  window.__DR_CUST_MY_TICKETS_FILTER_V4 = 1;

  var BAR_ID = 'dr-cust-ticket-toolbar';
  var FOOT_ID = 'dr-cust-ticket-footer';
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

  var CHEV =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23c4b5fd' d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")";
  var CHEV_L =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%235b21b6' d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")";

  var CSS = [
    '#' + BAR_ID + '{',
    '  display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem 0.75rem;',
    '  margin:0 0 0.85rem;padding:0.55rem 0.75rem;',
    '  border-radius:12px;',
    '  background:rgba(0,0,0,0.28);',
    '  border:1px solid rgba(139,124,247,0.22)',
    '}',
    'html[data-theme="light"] #' + BAR_ID + '{',
    '  background:rgba(109,94,245,0.08);border-color:rgba(109,94,245,0.2)',
    '}',
    '#' + BAR_ID + ' label{',
    '  font-size:0.72rem;font-weight:600;color:#a5a5bd;margin:0;white-space:nowrap',
    '}',
    'html[data-theme="light"] #' + BAR_ID + ' label{color:#5b5b72}',
    '#' + BAR_ID + ' select{',
    '  width:auto!important;min-width:8rem;max-width:11rem;',
    '  border-radius:8px;',
    '  border:1px solid rgba(167,139,250,0.4);',
    '  background-color:#1a1a28;',
    '  background-image:' + CHEV + ';',
    '  background-repeat:no-repeat;',
    '  background-position:right 0.55rem center;',
    '  background-size:10px 7px;',
    '  color:#f3f0ff;',
    '  padding:0.4rem 1.75rem 0.4rem 0.6rem;',
    '  font-size:0.8rem;font-weight:600;',
    '  outline:none;cursor:pointer;',
    '  -webkit-appearance:none!important;',
    '  -moz-appearance:none!important;',
    '  appearance:none!important;',
    '  color-scheme:dark',
    '}',
    '#' + BAR_ID + ' select::-ms-expand{display:none!important}',
    '#' + BAR_ID + ' select:focus{border-color:#a78bfa;box-shadow:0 0 0 3px rgba(139,124,247,0.25)}',
    '#' + BAR_ID + ' select option{background-color:#1a1a28;color:#f3f0ff}',
    'html[data-theme="light"] #' + BAR_ID + ' select{',
    '  background-color:#fff;',
    '  background-image:' + CHEV_L + ';',
    '  color:#1a1a28;border-color:rgba(109,94,245,0.35);color-scheme:light',
    '}',
    'html[data-theme="light"] #' + BAR_ID + ' select option{background-color:#fff;color:#1a1a28}',

    '#' + FOOT_ID + '{',
    '  display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;',
    '  gap:0.55rem;margin:0.85rem 0 0.25rem;padding:0.55rem 0.75rem;',
    '  border-radius:12px;',
    '  background:rgba(0,0,0,0.22);',
    '  border:1px solid rgba(139,124,247,0.18)',
    '}',
    'html[data-theme="light"] #' + FOOT_ID + '{',
    '  background:rgba(109,94,245,0.06);border-color:rgba(109,94,245,0.18)',
    '}',
    '#' + FOOT_ID + ' .dr-ct-count{font-size:0.78rem;color:#9898b0;white-space:nowrap}',
    'html[data-theme="light"] #' + FOOT_ID + ' .dr-ct-count{color:#6b6b80}',
    '#' + FOOT_ID + ' .dr-ct-count strong{color:#c4b5fd;font-weight:700}',
    'html[data-theme="light"] #' + FOOT_ID + ' .dr-ct-count strong{color:#6d28d9}',
    '#' + FOOT_ID + ' .dr-ct-nav{display:flex;align-items:center;gap:0.4rem}',
    '#' + FOOT_ID + ' .dr-ct-nav button{',
    '  appearance:none;border:1px solid rgba(139,124,247,0.3);',
    '  background:rgba(124,106,240,0.15);color:#e9e5ff;',
    '  border-radius:8px;padding:0.35rem 0.7rem;',
    '  font-size:0.78rem;font-weight:600;cursor:pointer;font-family:inherit',
    '}',
    '#' + FOOT_ID + ' .dr-ct-nav button:hover:not(:disabled){background:rgba(124,106,240,0.32)}',
    '#' + FOOT_ID + ' .dr-ct-nav button:disabled{opacity:0.4;cursor:not-allowed}',
    'html[data-theme="light"] #' + FOOT_ID + ' .dr-ct-nav button{',
    '  background:#f5f3ff;color:#4c1d95;border-color:rgba(109,94,245,0.3)',
    '}',
    '#' + FOOT_ID + ' .dr-ct-page{font-size:0.8rem;font-weight:700;color:#c4b5fd;min-width:2.5rem;text-align:center}',
    'html[data-theme="light"] #' + FOOT_ID + ' .dr-ct-page{color:#6d28d9}',
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

  function isCustomerMyTickets() {
    var pc = document.getElementById('portal-customer');
    if (!pc || !pc.classList.contains('active')) return false;
    var panel = document.getElementById('ctab-mytickets');
    if (panel && panel.classList.contains('active')) return true;
    var tab = document.querySelector('.ctab[data-ctab="mytickets"]');
    if (tab && tab.classList.contains('active')) return true;
    var list = document.getElementById('my-tickets-list');
    return !!(list && list.offsetParent !== null);
  }

  function findListRoot() {
    var list = document.getElementById('my-tickets-list');
    if (!list) return null;
    return list.parentElement || list;
  }

  function cardCategory(card) {
    var meta = card.querySelector('.ticket-meta');
    if (!meta) return 'other';
    var text = (meta.textContent || '').toLowerCase();
    if (text.indexOf('hardware') !== -1) return 'hardware';
    if (text.indexOf('software') !== -1) return 'software';
    if (text.indexOf('network') !== -1) return 'network';
    if (text.indexOf('account') !== -1) return 'account';
    return 'other';
  }

  function ensureBar(root) {
    var bar = document.getElementById(BAR_ID);
    if (bar) return bar;

    bar = document.createElement('div');
    bar.id = BAR_ID;
    bar.innerHTML =
      '<label for="dr-ct-cat">Category</label>' +
      '<select id="dr-ct-cat" aria-label="Filter by category"></select>' +
      '<label for="dr-ct-size">Show</label>' +
      '<select id="dr-ct-size" aria-label="Tickets to show">' +
      '<option value="5">5</option>' +
      '<option value="10" selected>10</option>' +
      '<option value="20">20</option>' +
      '<option value="50">50</option>' +
      '<option value="100">All</option>' +
      '</select>';

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

    var list = document.getElementById('my-tickets-list');
    if (list && list.parentNode) {
      list.parentNode.insertBefore(bar, list);
    } else {
      root.insertBefore(bar, root.firstChild);
    }
    return bar;
  }

  function ensureFooter(list) {
    var foot = document.getElementById(FOOT_ID);
    if (foot) return foot;

    foot = document.createElement('div');
    foot.id = FOOT_ID;
    foot.innerHTML =
      '<div class="dr-ct-count" id="dr-ct-count"></div>' +
      '<div class="dr-ct-nav">' +
      '<button type="button" id="dr-ct-prev" aria-label="Previous page">← Prev</button>' +
      '<span class="dr-ct-page" id="dr-ct-page">1 / 1</span>' +
      '<button type="button" id="dr-ct-next" aria-label="Next page">Next →</button>' +
      '</div>';

    foot.querySelector('#dr-ct-prev').addEventListener('click', function () {
      if (pageIndex > 0) {
        pageIndex -= 1;
        applyFilter();
      }
    });
    foot.querySelector('#dr-ct-next').addEventListener('click', function () {
      pageIndex += 1;
      applyFilter();
    });

    if (list && list.parentNode) {
      if (list.nextSibling) list.parentNode.insertBefore(foot, list.nextSibling);
      else list.parentNode.appendChild(foot);
    }
    return foot;
  }

  function applyFilter() {
    if (!isCustomerMyTickets()) {
      var b = document.getElementById(BAR_ID);
      var f = document.getElementById(FOOT_ID);
      if (b) b.style.display = 'none';
      if (f) f.style.display = 'none';
      return;
    }

    var list = document.getElementById('my-tickets-list');
    if (!list) return;
    var root = findListRoot();
    if (!root) return;

    injectCss();
    var bar = ensureBar(root);
    var foot = ensureFooter(list);
    bar.style.display = '';
    foot.style.display = '';

    var cards = Array.prototype.slice.call(list.querySelectorAll('.ticket-card'));
    var matched = [];
    cards.forEach(function (card) {
      var ok = category === 'all' || cardCategory(card) === category;
      if (ok) matched.push(card);
      else card.classList.add('dr-ct-hidden');
    });

    var total = matched.length;
    var pages = Math.max(1, Math.ceil(total / pageSize) || 1);
    if (pageIndex >= pages) pageIndex = pages - 1;
    if (pageIndex < 0) pageIndex = 0;
    var start = pageIndex * pageSize;
    var end = start + pageSize;

    matched.forEach(function (card, i) {
      if (i >= start && i < end) card.classList.remove('dr-ct-hidden');
      else card.classList.add('dr-ct-hidden');
    });

    var countEl = document.getElementById('dr-ct-count');
    if (countEl) {
      var shown = Math.min(pageSize, Math.max(0, total - start));
      if (pageSize >= 100) shown = total;
      countEl.innerHTML =
        'Showing <strong>' + shown + '</strong> of <strong>' + total + '</strong>';
    }
    var pageEl = document.getElementById('dr-ct-page');
    if (pageEl) pageEl.textContent = pages ? pageIndex + 1 + ' / ' + pages : '1 / 1';

    var prev = document.getElementById('dr-ct-prev');
    var next = document.getElementById('dr-ct-next');
    if (prev) prev.disabled = pageIndex <= 0;
    if (next) next.disabled = pageIndex >= pages - 1 || total === 0;
  }

  function tick() {
    var now = Date.now();
    if (now - lastRun < 120) return;
    lastRun = now;
    if (isCustomerMyTickets()) applyFilter();
  }

  injectCss();
  setTimeout(tick, 600);
  setTimeout(tick, 1500);
  setTimeout(tick, 3000);
  setInterval(tick, 2500);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('.ctab') || t.closest('[data-ctab]')) setTimeout(tick, 80);
    },
    true
  );

  var pc = document.getElementById('portal-customer');
  if (pc) {
    try {
      new MutationObserver(function () {
        clearTimeout(window.__drCtMo);
        window.__drCtMo = setTimeout(tick, 100);
      }).observe(pc, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
  }

  window.DRCustomerMyTicketsFilter = { refresh: applyFilter, v: 4 };
})();
