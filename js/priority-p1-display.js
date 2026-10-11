/**
 * Divine Rays — Priority P1–P4 v3
 * Pure P1–P4 labels; leaves #filter-priority to filters.js; faster badge polish.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_PRIORITY_P1_DISPLAY_V3) return;
  window.__DR_PRIORITY_P1_DISPLAY_V3 = 1;
  window.__DR_PRIORITY_P1_DISPLAY_V2 = 1;
  window.__DR_PRIORITY_P1_DISPLAY_V1 = 1;

  var STYLE_ID = 'dr-priority-p1-css';
  var lastRun = 0;

  var TO_P = {
    critical: 'P1', high: 'P2', medium: 'P3', low: 'P4',
    p1: 'P1', p2: 'P2', p3: 'P3', p4: 'P4',
    '1': 'P1', '2': 'P2', '3': 'P3', '4': 'P4'
  };

  var STATUS_WORDS = {
    open: 1, closed: 1, resolved: 1, waiting: 1, claimed: 1,
    'in progress': 1, in_progress: 1, 'in-progress': 1,
    pending: 1, approved: 1, rejected: 1, reopened: 1
  };

  var CSS = [
    '.badge-critical,.badge-p1,.priority-critical,.priority-p1{',
    '  background:rgba(239,68,68,0.2)!important;color:#fca5a5!important;',
    '  border-color:rgba(239,68,68,0.4)!important}',
    '.badge-high,.badge-p2,.priority-high,.priority-p2{',
    '  background:rgba(249,115,22,0.2)!important;color:#fdba74!important;',
    '  border-color:rgba(249,115,22,0.4)!important}',
    '.badge-medium,.badge-p3,.priority-medium,.priority-p3{',
    '  background:rgba(234,179,8,0.18)!important;color:#fde047!important;',
    '  border-color:rgba(234,179,8,0.35)!important}',
    '.badge-low,.badge-p4,.priority-low,.priority-p4{',
    '  background:rgba(34,197,94,0.16)!important;color:#86efac!important;',
    '  border-color:rgba(34,197,94,0.32)!important}',
    'html[data-theme="light"] .badge-critical,html[data-theme="light"] .badge-p1{',
    '  background:rgba(239,68,68,0.12)!important;color:#b91c1c!important}',
    'html[data-theme="light"] .badge-high,html[data-theme="light"] .badge-p2{',
    '  background:rgba(249,115,22,0.12)!important;color:#c2410c!important}',
    'html[data-theme="light"] .badge-medium,html[data-theme="light"] .badge-p3{',
    '  background:rgba(202,138,4,0.12)!important;color:#a16207!important}',
    'html[data-theme="light"] .badge-low,html[data-theme="light"] .badge-p4{',
    '  background:rgba(22,163,74,0.12)!important;color:#15803d!important}',
    '.stat-card.critical .stat-label{font-size:0!important}',
    '.stat-card.critical .stat-label::after{content:"P1 (open)";font-size:0.75rem}',
    '.stat-card.high .stat-label{font-size:0!important}',
    '.stat-card.high .stat-label::after{content:"P2 (open)";font-size:0.75rem}'
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
    return String(s || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  }

  function toP(raw) {
    var n = norm(raw);
    if (!n) return null;
    if (TO_P[n]) return TO_P[n];
    if (/^p[1-4]\b/.test(n)) return n.toUpperCase().slice(0, 2);
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
    var text = (el.textContent || '').trim();
    if (!text || isStatus(text)) return;
    var label = toP(text);
    if (!label) return;
    if (el.getAttribute('data-dr-p1') === '1' && el.textContent.trim() === label) return;
    el.textContent = label;
    el.setAttribute('title', label);
    el.setAttribute('data-dr-p1', '1');
    var cls = (el.className || '').replace(/\bbadge-(critical|high|medium|low)\b/gi, '').replace(/\s+/g, ' ').trim();
    if (!new RegExp('\\bbadge-' + label.toLowerCase() + '\\b').test(cls)) {
      cls = (cls + ' badge-' + label.toLowerCase()).trim();
    }
    el.className = cls;
  }

  function rewriteSelect(sel) {
    if (!sel || sel.tagName !== 'SELECT') return;
    if (sel.id === 'filter-priority') return;
    Array.prototype.forEach.call(sel.options, function (opt) {
      var v = opt.value;
      var t = (opt.textContent || '').trim();
      if (!v && !t) return;
      if (isStatus(v) || isStatus(t)) return;
      if (/^all priorit/i.test(t) || v === '') {
        opt.textContent = 'All Priorities';
        return;
      }
      var label = toP(v) || toP(t);
      if (!label) return;
      opt.value = label;
      opt.textContent = label;
      opt.setAttribute('data-dr-p1', '1');
    });
  }

  function polish() {
    injectCss();
    document.querySelectorAll(
      '#ticket-detail .badge, #cust-ticket-detail .badge, .ticket-detail .badge, ' +
      '.ticket-card .badge, .badges .badge, [data-priority], .priority-badge'
    ).forEach(rewriteBadge);
    document.querySelectorAll('.stat-card .stat-label').forEach(function (el) {
      var t = (el.textContent || '').trim();
      if (/critical/i.test(t)) el.textContent = t.replace(/Critical/gi, 'P1').replace(/critical/gi, 'P1');
      else if (/\bHigh\b/i.test(t)) el.textContent = t.replace(/High/gi, 'P2');
      else if (/Medium/i.test(t) && /open|priority/i.test(t)) el.textContent = t.replace(/Medium/gi, 'P3');
      else if (/\bLow\b/i.test(t)) el.textContent = t.replace(/Low/gi, 'P4');
    });
    ['c-priority', 'a-priority', 'priority', 'meta-priority'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) rewriteSelect(el);
    });
  }

  function tick() {
    var now = Date.now();
    if (now - lastRun < 100) return;
    lastRun = now;
    try { polish(); } catch (e) {}
  }

  window.__drPriorityEquals = function (ticketPri, filterPri) {
    if (!filterPri) return true;
    var a = toP(ticketPri);
    var b = toP(filterPri);
    if (!a || !b) return norm(ticketPri) === norm(filterPri);
    return a === b;
  };
  window.__drPriorityLabel = function (raw) {
    return toP(raw) || String(raw || '');
  };

  injectCss();
  setTimeout(tick, 200);
  setTimeout(tick, 800);
  setInterval(tick, 2000);
  document.addEventListener('click', function () { setTimeout(tick, 60); }, true);
  try {
    var root = document.getElementById('ticket-list') || document.body;
    if (root) {
      new MutationObserver(function () { setTimeout(tick, 40); }).observe(root, { childList: true, subtree: true });
    }
  } catch (e2) {}

  window.DRPriorityP1Display = { refresh: polish, v: 3, label: toP, equals: window.__drPriorityEquals };
})();
