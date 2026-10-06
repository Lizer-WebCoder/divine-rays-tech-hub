/**
 * Divine Rays — Priority display as P1–P4
 * Keeps DB values (Critical/High/Medium/Low); shows P1–P4 on badges & filters.
 * Safe: text rewrite only, throttled. Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_PRIORITY_P1_DISPLAY_V1) return;
  window.__DR_PRIORITY_P1_DISPLAY_V1 = 1;

  var STYLE_ID = 'dr-priority-p1-css';
  var lastRun = 0;

  /* Stored value → display label */
  var TO_LABEL = {
    critical: 'P1',
    high: 'P2',
    medium: 'P3',
    low: 'P4',
    p1: 'P1',
    p2: 'P2',
    p3: 'P3',
    p4: 'P4'
  };

  var TO_FULL = {
    critical: 'P1 · Critical',
    high: 'P2 · High',
    medium: 'P3 · Medium',
    low: 'P4 · Low'
  };

  /* Status words — never rewrite these as priority */
  var STATUS_WORDS = {
    open: 1,
    closed: 1,
    resolved: 1,
    waiting: 1,
    claimed: 1,
    'in progress': 1,
    in_progress: 1,
    'in-progress': 1,
    pending: 1,
    approved: 1,
    rejected: 1,
    reopened: 1
  };

  var CSS = [
    '.badge-critical,.badge-p1,.priority-critical{',
    '  background:rgba(239,68,68,0.2)!important;color:#fca5a5!important;',
    '  border-color:rgba(239,68,68,0.4)!important',
    '}',
    '.badge-high,.badge-p2,.priority-high{',
    '  background:rgba(249,115,22,0.2)!important;color:#fdba74!important;',
    '  border-color:rgba(249,115,22,0.4)!important',
    '}',
    '.badge-medium,.badge-p3,.priority-medium{',
    '  background:rgba(234,179,8,0.18)!important;color:#fde047!important;',
    '  border-color:rgba(234,179,8,0.35)!important',
    '}',
    '.badge-low,.badge-p4,.priority-low{',
    '  background:rgba(34,197,94,0.16)!important;color:#86efac!important;',
    '  border-color:rgba(34,197,94,0.32)!important',
    '}',
    'html[data-theme="light"] .badge-critical,html[data-theme="light"] .badge-p1{',
    '  background:rgba(239,68,68,0.12)!important;color:#b91c1c!important',
    '}',
    'html[data-theme="light"] .badge-high,html[data-theme="light"] .badge-p2{',
    '  background:rgba(249,115,22,0.12)!important;color:#c2410c!important',
    '}',
    'html[data-theme="light"] .badge-medium,html[data-theme="light"] .badge-p3{',
    '  background:rgba(202,138,4,0.12)!important;color:#a16207!important',
    '}',
    'html[data-theme="light"] .badge-low,html[data-theme="light"] .badge-p4{',
    '  background:rgba(22,163,74,0.12)!important;color:#15803d!important',
    '}'
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

  function norm(s) {
    return String(s || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');
  }

  function shortLabel(raw) {
    var n = norm(raw);
    /* already P1 etc */
    if (/^p[1-4]\b/.test(n)) return n.toUpperCase().slice(0, 2);
    if (TO_LABEL[n]) return TO_LABEL[n];
    /* "critical priority" etc */
    if (n.indexOf('critical') !== -1) return 'P1';
    if (n.indexOf('high') !== -1) return 'P2';
    if (n.indexOf('medium') !== -1) return 'P3';
    if (n.indexOf('low') !== -1) return 'P4';
    return null;
  }

  function isStatus(raw) {
    return !!STATUS_WORDS[norm(raw)];
  }

  function rewriteBadge(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.getAttribute('data-dr-p1') === '1') return;
    var text = (el.textContent || '').trim();
    if (!text || isStatus(text)) return;
    var label = shortLabel(text);
    if (!label) return;
    el.textContent = label;
    el.setAttribute('title', TO_FULL[norm(text)] || label);
    el.setAttribute('data-dr-p1', '1');
    el.setAttribute('data-dr-p1-src', text);
    /* keep color class from original text */
    var cls = el.className || '';
    if (!/\bbadge-p[1-4]\b/.test(cls)) {
      el.className = cls + ' badge-' + label.toLowerCase();
    }
  }

  function rewriteSelect(sel) {
    if (!sel || sel.tagName !== 'SELECT') return;
    Array.prototype.forEach.call(sel.options, function (opt) {
      if (opt.getAttribute('data-dr-p1') === '1') return;
      var v = opt.value;
      var t = opt.textContent;
      if (isStatus(v) || isStatus(t)) return;
      var label = shortLabel(v) || shortLabel(t);
      if (!label) return;
      var full = TO_FULL[norm(v)] || TO_FULL[norm(t)] || label;
      /* keep stored value for form submit */
      opt.textContent = full;
      opt.setAttribute('data-dr-p1', '1');
    });
  }

  function polish() {
    injectCss();
    /* ticket card badges */
    document.querySelectorAll('.ticket-card .badges .badge, .ticket-card .badge, .badges span.badge').forEach(rewriteBadge);
    /* detail header badges */
    document.querySelectorAll('#ticket-detail .badge, #cust-ticket-detail .badge, .ticket-detail .badge').forEach(rewriteBadge);
    /* filter dropdowns */
    ['filter-priority', 'c-priority', 'a-priority', 'priority'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) rewriteSelect(el);
    });
    document.querySelectorAll('select[name="priority"], select[id*="priority"]').forEach(rewriteSelect);
  }

  function tick() {
    var now = Date.now();
    if (now - lastRun < 700) return;
    lastRun = now;
    try {
      polish();
    } catch (e) {}
  }

  injectCss();
  setTimeout(tick, 600);
  setTimeout(tick, 1800);
  setTimeout(tick, 4000);
  setInterval(tick, 3500);

  document.addEventListener(
    'click',
    function () {
      setTimeout(tick, 200);
    },
    true
  );

  window.DRPriorityP1Display = {
    refresh: polish,
    v: 1,
    label: shortLabel,
    map: TO_LABEL
  };
})();
