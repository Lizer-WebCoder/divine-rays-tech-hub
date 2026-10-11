/**
 * Divine Rays — Priority force v1
 * Normalize all ticket priorities in memory to P1–P4.
 * Rebuild filter dropdown; strip Critical/High/Medium/Low from UI instantly.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_PRIORITY_FORCE >= 1) return;
  window.__DR_PRIORITY_FORCE = 1;

  var MAP = {
    critical: 'P1', high: 'P2', medium: 'P3', low: 'P4',
    p1: 'P1', p2: 'P2', p3: 'P3', p4: 'P4',
    '1': 'P1', '2': 'P2', '3': 'P3', '4': 'P4'
  };

  function norm(s) {
    return String(s || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  }

  function toP(raw) {
    var n = norm(raw);
    if (!n) return '';
    if (MAP[n]) return MAP[n];
    if (/^p\s*[1-4]\b/.test(n)) return 'P' + n.replace(/\D/g, '').charAt(0);
    if (n.indexOf('critical') !== -1) return 'P1';
    if (/(^|\s)high(\s|$)/.test(n)) return 'P2';
    if (n.indexOf('medium') !== -1) return 'P3';
    if (/(^|\s)low(\s|$)/.test(n)) return 'P4';
    return String(raw || '').trim();
  }

  function normalizeTicket(t) {
    if (!t || typeof t !== 'object') return t;
    if (t.priority != null && t.priority !== '') {
      var p = toP(t.priority);
      if (p) t.priority = p;
    }
    return t;
  }

  function normalizeList(list) {
    if (!Array.isArray(list)) return list;
    for (var i = 0; i < list.length; i++) normalizeTicket(list[i]);
    return list;
  }

  function normalizeCaches() {
    try {
      if (window.DR && typeof DR.getAllTickets === 'function') {
        var t = DR.getAllTickets();
        if (Array.isArray(t) && t.length) {
          normalizeList(t);
          if (typeof DR.setAllTickets === 'function') DR.setAllTickets(t);
        }
      }
    } catch (e) {}
    try { if (Array.isArray(window.allTicketsCache)) normalizeList(window.allTicketsCache); } catch (e2) {}
    try { if (window.DR && Array.isArray(window.DR.tickets)) normalizeList(window.DR.tickets); } catch (e3) {}
    try { if (Array.isArray(window.__drTickets)) normalizeList(window.__drTickets); } catch (e4) {}
  }

  function patchDR() {
    try {
      if (!window.DR || typeof DR.setAllTickets !== 'function') return;
      if (DR.setAllTickets.__drPrioNorm) return;
      var prev = DR.setAllTickets;
      DR.setAllTickets = function (list) {
        normalizeList(list);
        return prev.apply(this, arguments);
      };
      DR.setAllTickets.__drPrioNorm = 1;
    } catch (e) {}
  }

  function rebuildFilterSelect() {
    var sel = document.getElementById('filter-priority');
    if (!sel) return;
    var cur = toP(sel.value) || toP(sel.options[sel.selectedIndex] && sel.options[sel.selectedIndex].text);
    if (sel.__drForcePrio === 1 && sel.options.length >= 5) {
      var ok = true;
      for (var i = 1; i < sel.options.length; i++) {
        var v = String(sel.options[i].value || '').toUpperCase();
        if (!/^P[1-4]$/.test(v)) { ok = false; break; }
      }
      if (ok) {
        if (cur && /^P[1-4]$/.test(cur)) sel.value = cur;
        return;
      }
    }
    sel.innerHTML =
      '<option value="">All Priorities</option>' +
      '<option value="P1">P1</option>' +
      '<option value="P2">P2</option>' +
      '<option value="P3">P3</option>' +
      '<option value="P4">P4</option>';
    sel.__drForcePrio = 1;
    sel.__drPrioOpts = 1;
    if (cur === 'P1' || cur === 'P2' || cur === 'P3' || cur === 'P4') sel.value = cur;
    else sel.value = '';
  }

  function stripOldPriorityText(root) {
    root = root || document;
    var nodes = root.querySelectorAll
      ? root.querySelectorAll('.badge, .badges span, [class*="priority"], .stat-label, option, .ticket-meta span')
      : [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
      if (el.id === 'filter-priority') continue;
      var text = (el.textContent || '').trim();
      if (!text || text.length > 40) continue;
      var n = norm(text);
      if (
        n === 'critical' || n === 'high' || n === 'medium' || n === 'low' ||
        /^critical\b/.test(n) || /^high\b/.test(n) || /^medium\b/.test(n) || /^low\b/.test(n) ||
        /p1\s*[·•\-]\s*critical/i.test(text) || /p2\s*[·•\-]\s*high/i.test(text) ||
        /p3\s*[·•\-]\s*medium/i.test(text) || /p4\s*[·•\-]\s*low/i.test(text)
      ) {
        var p = toP(text);
        if (p && p !== text) {
          el.textContent = p;
          el.setAttribute('data-dr-p1', '1');
          var cls = el.className || '';
          if (/\bbadge\b/.test(cls) && !new RegExp('\\bbadge-' + p.toLowerCase() + '\\b').test(cls)) {
            el.className = cls.replace(/\bbadge-(critical|high|medium|low|p[1-4])\b/gi, '').trim() +
              ' badge-' + p.toLowerCase();
          }
        }
      }
    }
  }

  function equals(a, b) {
    if (!b) return true;
    return toP(a) === toP(b);
  }

  window.__drPriorityEquals = equals;
  window.__drPriorityLabel = toP;
  window.__drPriorityToP = toP;

  function forceApply() {
    normalizeCaches();
    rebuildFilterSelect();
    stripOldPriorityText(document.getElementById('ticket-list') || document);
    if (typeof window.applyTicketFilters === 'function') {
      try { window.applyTicketFilters(false); } catch (e) {}
    }
    stripOldPriorityText(document.getElementById('ticket-list') || document);
  }

  function bindPriorityFilter() {
    var sel = document.getElementById('filter-priority');
    if (!sel || sel.__drForceBound) return;
    sel.__drForceBound = true;
    sel.addEventListener('change', function () {
      rebuildFilterSelect();
      var lf = null;
      try {
        if (window.DR && typeof DR.getListFilter === 'function') lf = DR.getListFilter();
      } catch (e) {}
      if (!lf) lf = window.__drListFilter || (window.__drListFilter = {});
      lf.priority = sel.value || '';
      lf.page = 0;
      normalizeCaches();
      if (typeof window.applyTicketFilters === 'function') {
        try { window.applyTicketFilters(false); } catch (e2) {}
      }
      setTimeout(function () { stripOldPriorityText(document.getElementById('ticket-list') || document); }, 0);
      setTimeout(function () { stripOldPriorityText(document.getElementById('ticket-list') || document); }, 50);
    }, true);
  }

  var scrubScheduled = false;
  function scheduleScrub() {
    if (scrubScheduled) return;
    scrubScheduled = true;
    requestAnimationFrame(function () {
      scrubScheduled = false;
      stripOldPriorityText(document);
      rebuildFilterSelect();
    });
  }

  try {
    new MutationObserver(function (mutations) {
      var need = false;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.addedNodes && m.addedNodes.length) need = true;
        if (m.type === 'characterData') need = true;
      }
      if (need) scheduleScrub();
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  } catch (eObs) {}

  function boot() {
    patchDR();
    normalizeCaches();
    rebuildFilterSelect();
    bindPriorityFilter();
    stripOldPriorityText(document);
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(function () { boot(); forceApply(); }, 2000);
  setInterval(function () {
    patchDR();
    normalizeCaches();
    rebuildFilterSelect();
    bindPriorityFilter();
  }, 4000);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
      setTimeout(function () { boot(); forceApply(); }, 200);
      setTimeout(forceApply, 600);
    }
  }, true);

  window.DRPriorityForce = { refresh: forceApply, toP: toP, normalize: normalizeCaches, v: 1 };
})();
