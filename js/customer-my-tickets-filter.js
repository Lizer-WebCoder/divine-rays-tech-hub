/**
 * Divine Rays — customer My Tickets filter v5
 * Category/Show on top; Showing + Prev/Next under list.
 * Force-rebuild toolbar; event delegation for Prev/Next.
 * Single chevron. Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUST_MY_TICKETS_FILTER_V5) return;
  window.__DR_CUST_MY_TICKETS_FILTER_V5 = 1;

  var BAR_ID = 'dr-cust-ticket-toolbar';
  var FOOT_ID = 'dr-cust-ticket-footer';
  var STYLE_ID = 'dr-cust-ticket-toolbar-css';
  var VER = '5';
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
    '  border-radius:12px;background:rgba(0,0,0,0.28);',
    '  border:1px solid rgba(139,124,247,0.22)',
    '}',
    'html[data-theme="light"] #' + BAR_ID + '{background:rgba(109,94,245,0.08);border-color:rgba(109,94,245,0.2)}',
    '#' + BAR_ID + ' label{font-size:0.72rem;font-weight:600;color:#a5a5bd;margin:0;white-space:nowrap}',
    'html[data-theme="light"] #' + BAR_ID + ' label{color:#5b5b72}',
    '#' + BAR_ID + ' select{',
    '  width:auto!important;min-width:8rem;max-width:11rem;',
    '  border-radius:8px;border:1px solid rgba(167,139,250,0.4);',
    '  background-color:#1a1a28!important;',
    '  background-image:' + CHEV + '!important;',
    '  background-repeat:no-repeat!important;',
    '  background-position:right 0.55rem center!important;',
    '  background-size:10px 7px!important;',
    '  color:#f3f0ff;padding:0.4rem 1.75rem 0.4rem 0.6rem;',
    '  font-size:0.8rem;font-weight:600;outline:none;cursor:pointer;',
    '  -webkit-appearance:none!important;-moz-appearance:none!important;appearance:none!important;',
    '  color-scheme:dark',
    '}',
    '#' + BAR_ID + ' select::-ms-expand{display:none!important}',
    'html[data-theme="light"] #' + BAR_ID + ' select{',
    '  background-color:#fff!important;background-image:' + CHEV_L + '!important;',
    '  color:#1a1a28;border-color:rgba(109,94,245,0.35);color-scheme:light',
    '}',
    '#' + FOOT_ID + '{',
    '  display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;',
    '  gap:0.55rem;margin:0.85rem 0 0.25rem;padding:0.55rem 0.75rem;',
    '  border-radius:12px;background:rgba(0,0,0,0.22);',
    '  border:1px solid rgba(139,124,247,0.18)',
    '}',
    'html[data-theme="light"] #' + FOOT_ID + '{background:rgba(109,94,245,0.06);border-color:rgba(109,94,245,0.18)}',
    '#' + FOOT_ID + ' .dr-ct-count{font-size:0.78rem;color:#9898b0;white-space:nowrap}',
    '#' + FOOT_ID + ' .dr-ct-count strong{color:#c4b5fd;font-weight:700}',
    '#' + FOOT_ID + ' .dr-ct-nav{display:flex;align-items:center;gap:0.4rem}',
    '#' + FOOT_ID + ' .dr-ct-nav button{',
    '  appearance:none;border:1px solid rgba(139,124,247,0.3);',
    '  background:rgba(124,106,240,0.18);color:#e9e5ff;',
    '  border-radius:8px;padding:0.4rem 0.75rem;',
    '  font-size:0.78rem;font-weight:600;cursor:pointer;font-family:inherit',
    '}',
    '#' + FOOT_ID + ' .dr-ct-nav button:hover:not(:disabled){background:rgba(124,106,240,0.35)}',
    '#' + FOOT_ID + ' .dr-ct-nav button:disabled{opacity:0.4;cursor:not-allowed;pointer-events:none}',
    '#' + FOOT_ID + ' .dr-ct-page{font-size:0.8rem;font-weight:700;color:#c4b5fd;min-width:2.75rem;text-align:center}',
    '#portal-customer .ticket-card.dr-ct-hidden{display:none!important}',
    '#portal-customer #kb-filter-cat,',
    '#portal-customer .kb-toolbar select{',
    '  -webkit-appearance:none!important;-moz-appearance:none!important;appearance:none!important;',
    '  background-image:' + CHEV + '!important;',
    '  background-repeat:no-repeat!important;',
    '  background-position:right 0.65rem center!important;',
    '  background-size:10px 7px!important;',
    '  padding-right:1.85rem!important;',
    '  background-color:rgba(0,0,0,0.35)!important;',
    '  border:1px solid rgba(139,124,247,0.3)!important;',
    '  border-radius:10px!important;color:#eeeef6!important',
    '}',
    '#portal-customer #kb-filter-cat::-ms-expand,',
    '#portal-customer .kb-toolbar select::-ms-expand{display:none!important}',
    'html[data-theme="light"] #portal-customer #kb-filter-cat,',
    'html[data-theme="light"] #portal-customer .kb-toolbar select{',
    '  background-color:#fff!important;background-image:' + CHEV_L + '!important;color:#1a1a28!important',
    '}',
  ].join('');

  function injectCss() {
    var s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(s);
    }
    s.textContent = CSS;
    if (s.parentNode) s.parentNode.appendChild(s);
  }

  function isCustomerMyTickets() {
    var pc = document.getElementById('portal-customer');
    if (!pc || !pc.classList.contains('active')) return false;
    var panel = document.getElementById('ctab-mytickets');
    if (panel && panel.classList.contains('active')) return true;
    var tab = document.querySelector('.ctab[data-ctab="mytickets"]');
    if (tab && tab.classList.contains('active')) return true;
    var list = document.getElementById('my-tickets-list');
    if (!list || list.offsetParent === null) return false;
    var kb = document.getElementById('ctab-kb');
    if (kb && kb.classList.contains('active')) return false;
    return true;
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

  function ensureBar() {
    var list = document.getElementById('my-tickets-list');
    if (!list || !list.parentNode) return null;

    var bar = document.getElementById(BAR_ID);
    if (bar && bar.getAttribute('data-ver') === VER) {
      var cat = bar.querySelector('#dr-ct-cat');
      var size = bar.querySelector('#dr-ct-size');
      if (cat && cat.value !== category) cat.value = category;
      if (size) {
        var v = String(pageSize >= 100 ? 100 : pageSize);
        if (size.value !== v) size.value = v;
      }
      return bar;
    }
    if (bar) { try { bar.remove(); } catch (e) {} }

    bar = document.createElement('div');
    bar.id = BAR_ID;
    bar.setAttribute('data-ver', VER);
    bar.innerHTML =
      '<label for="dr-ct-cat">Category</label>' +
      '<select id="dr-ct-cat" aria-label="Filter by category"></select>' +
      '<label for="dr-ct-size">Show</label>' +
      '<select id="dr-ct-size" aria-label="Tickets to show">' +
      '<option value="5">5</option>' +
      '<option value="10">10</option>' +
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

    list.parentNode.insertBefore(bar, list);
    return bar;
  }

  function ensureFooter() {
    var list = document.getElementById('my-tickets-list');
    if (!list || !list.parentNode) return null;

    var foot = document.getElementById(FOOT_ID);
    if (foot && foot.getAttribute('data-ver') === VER) return foot;
    if (foot) { try { foot.remove(); } catch (e) {} }

    foot = document.createElement('div');
    foot.id = FOOT_ID;
    foot.setAttribute('data-ver', VER);
    foot.innerHTML =
      '<div class="dr-ct-count" id="dr-ct-count">Showing <strong>0</strong> of <strong>0</strong></div>' +
      '<div class="dr-ct-nav">' +
      '<button type="button" id="dr-ct-prev">← Prev</button>' +
      '<span class="dr-ct-page" id="dr-ct-page">1 / 1</span>' +
      '<button type="button" id="dr-ct-next">Next →</button>' +
      '</div>';

    if (list.nextSibling) list.parentNode.insertBefore(foot, list.nextSibling);
    else list.parentNode.appendChild(foot);
    return foot;
  }

  function applyFilter() {
    injectCss();

    if (!isCustomerMyTickets()) {
      var b = document.getElementById(BAR_ID);
      var f = document.getElementById(FOOT_ID);
      if (b) b.style.display = 'none';
      if (f) f.style.display = 'none';
      return;
    }

    var list = document.getElementById('my-tickets-list');
    if (!list) return;

    var bar = ensureBar();
    var foot = ensureFooter();
    if (bar) bar.style.display = '';
    if (foot) foot.style.display = '';

    var cards = Array.prototype.slice.call(list.querySelectorAll('.ticket-card'));
    var matched = [];
    cards.forEach(function (card) {
      var ok = category === 'all' || cardCategory(card) === category;
      if (ok) matched.push(card);
      else card.classList.add('dr-ct-hidden');
    });

    var total = matched.length;
    var size = pageSize >= 100 ? Math.max(total, 1) : pageSize;
    var pages = Math.max(1, Math.ceil(total / size) || 1);
    if (pageIndex >= pages) pageIndex = pages - 1;
    if (pageIndex < 0) pageIndex = 0;
    var start = pageIndex * size;
    var end = start + size;

    var shown = 0;
    matched.forEach(function (card, i) {
      if (i >= start && i < end) {
        card.classList.remove('dr-ct-hidden');
        shown += 1;
      } else {
        card.classList.add('dr-ct-hidden');
      }
    });

    var countEl = document.getElementById('dr-ct-count');
    if (countEl) {
      countEl.innerHTML =
        'Showing <strong>' + shown + '</strong> of <strong>' + total + '</strong>';
    }
    var pageEl = document.getElementById('dr-ct-page');
    if (pageEl) pageEl.textContent = pageIndex + 1 + ' / ' + pages;

    var prev = document.getElementById('dr-ct-prev');
    var next = document.getElementById('dr-ct-next');
    if (prev) prev.disabled = pageIndex <= 0;
    if (next) next.disabled = pageIndex >= pages - 1 || total === 0;
  }

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('#dr-ct-prev')) {
        e.preventDefault();
        if (pageIndex > 0) {
          pageIndex -= 1;
          applyFilter();
        }
        return;
      }
      if (t.closest('#dr-ct-next')) {
        e.preventDefault();
        pageIndex += 1;
        applyFilter();
        return;
      }
      if (t.closest('.ctab') || t.closest('[data-ctab]')) {
        setTimeout(applyFilter, 100);
      }
    },
    true
  );

  function tick() {
    var now = Date.now();
    if (now - lastRun < 80) return;
    lastRun = now;
    applyFilter();
  }

  injectCss();
  setTimeout(tick, 500);
  setTimeout(tick, 1200);
  setTimeout(tick, 2500);
  setInterval(tick, 2000);

  var pc = document.getElementById('portal-customer');
  if (pc) {
    try {
      new MutationObserver(function () {
        clearTimeout(window.__drCtMo);
        window.__drCtMo = setTimeout(tick, 80);
      }).observe(pc, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
  }

  window.DRCustomerMyTicketsFilter = { refresh: applyFilter, v: 5 };
})();
