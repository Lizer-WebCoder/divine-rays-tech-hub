/**
 * Divine Rays — ticket claim lock v2
 * Only the assigned agent can edit a claimed ticket.
 * Debounced observers — no main-thread freeze.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CLAIM_LOCK_V2) return;
  window.__DR_CLAIM_LOCK_V2 = 1;

  var nameCache = {};
  var lastTicketId = null;
  var lastAssigneeId = null;
  var lastAssigneeName = '';
  var locked = false;
  var applying = false;
  var refreshTimer = null;
  var bindTimer = null;
  var lastRefreshAt = 0;

  function sb() {
    try {
      if (window.DR && DR.sb) return DR.sb();
    } catch (e) {}
    return window.sb || null;
  }

  function me() {
    try {
      if (window.DR && DR.getProfile) return DR.getProfile();
    } catch (e) {}
    return null;
  }

  function toast(m, t) {
    if (window.DR && DR.toast) DR.toast(m, t);
  }

  async function alertDlg(msg, opts) {
    try {
      if (window.DRDialog && DRDialog.alert) return await DRDialog.alert(msg, opts || {});
    } catch (e) {}
    toast(msg, 'error');
  }

  function isStaff() {
    var p = me();
    if (!p || !p.role) return false;
    var r = String(p.role).toLowerCase();
    return r === 'admin' || r === 'agent';
  }

  async function resolveName(uid) {
    if (!uid) return 'another agent';
    if (nameCache[uid]) return nameCache[uid];
    var client = sb();
    if (!client) return 'another agent';
    try {
      var r = await client
        .from('profiles')
        .select('id,full_name,username,email,role')
        .eq('id', uid)
        .maybeSingle();
      if (r.data) {
        var n =
          r.data.full_name ||
          r.data.username ||
          (r.data.email || '').split('@')[0] ||
          'another agent';
        nameCache[uid] = n;
        return n;
      }
    } catch (e) {}
    return 'another agent';
  }

  function getTicketFromCache() {
    try {
      var raw = sessionStorage.getItem('dr_last_ticket');
      if (raw) {
        var t = JSON.parse(raw);
        if (t && t.id) return t;
      }
    } catch (e) {}
    try {
      if (window.DR && DR.getAllTickets && window.DR.getCurrentTicketId) {
        var id = DR.getCurrentTicketId();
        var list = DR.getAllTickets() || [];
        return list.find(function (x) { return x.id === id; }) || null;
      }
    } catch (e2) {}
    return null;
  }

  async function loadTicketState() {
    if (!isStaff()) {
      locked = false;
      return null;
    }
    var t = getTicketFromCache();
    var client = sb();
    if (!t || !t.id) {
      var pt = document.getElementById('page-title');
      var num = pt && pt.textContent ? pt.textContent.trim() : '';
      if (client && num && num.indexOf('DR-') === 0) {
        try {
          var r0 = await client
            .from('tickets')
            .select('id,assigned_to,assignee_id,ticket_number,status,title')
            .eq('ticket_number', num)
            .maybeSingle();
          if (r0.data) t = r0.data;
        } catch (e) {}
      }
    }
    if (!t || !t.id) {
      locked = false;
      lastTicketId = null;
      lastAssigneeId = null;
      lastAssigneeName = '';
      return null;
    }

    var assigneeId = t.assigned_to || t.assignee_id || null;
    if (!assigneeId && client) {
      try {
        var r = await client
          .from('tickets')
          .select('id,assigned_to,assignee_id,ticket_number,status')
          .eq('id', t.id)
          .maybeSingle();
        if (r.data) {
          t = Object.assign({}, t, r.data);
          assigneeId = r.data.assigned_to || r.data.assignee_id || null;
        }
      } catch (e2) {}
    }

    lastTicketId = t.id;
    lastAssigneeId = assigneeId;
    lastAssigneeName = assigneeId ? await resolveName(assigneeId) : '';

    var p = me();
    var myId = p && p.id;
    locked = !!(assigneeId && myId && assigneeId !== myId);

    return {
      ticket: t,
      assigneeId: assigneeId,
      assigneeName: lastAssigneeName,
      locked: locked,
      mine: !!(assigneeId && myId && assigneeId === myId),
      unassigned: !assigneeId
    };
  }

  function setDisabled(el, on) {
    if (!el) return;
    if (on) {
      if (el.getAttribute('data-dr-claim-lock') === '1') return;
      el.setAttribute('disabled', 'disabled');
      el.style.setProperty('opacity', '0.55', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      el.setAttribute('data-dr-claim-lock', '1');
    } else if (el.getAttribute('data-dr-claim-lock') === '1') {
      el.removeAttribute('disabled');
      el.style.removeProperty('opacity');
      el.style.removeProperty('pointer-events');
      el.removeAttribute('data-dr-claim-lock');
    }
  }

  function ensureBanner(state) {
    var actions =
      document.querySelector('#portal-agent .agent-actions') ||
      document.querySelector('#view-detail .agent-actions');
    if (!actions) return;
    var existing = document.getElementById('dr-claim-lock-banner');
    if (!state || !state.locked) {
      if (existing) existing.remove();
      return;
    }
    var msg =
      'This ticket is claimed by ' +
      (state.assigneeName || 'another agent') +
      '. Only they can edit status, assignment, or comments.';
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'dr-claim-lock-banner';
      existing.setAttribute('role', 'status');
      actions.insertBefore(existing, actions.firstChild);
    }
    existing.style.cssText =
      'display:flex;align-items:flex-start;gap:.65rem;margin:0 0 .9rem;padding:.75rem .95rem;' +
      'border-radius:12px;border:1px solid rgba(251,191,36,.4);' +
      'background:rgba(251,191,36,.1);color:#fde68a;font-size:.85rem;line-height:1.45';
    existing.innerHTML =
      '<span style="font-size:1.1rem;line-height:1;flex-shrink:0">⚠</span>' +
      '<span><strong style="display:block;margin-bottom:.15rem;color:#fef3c7">Ticket locked</strong>' +
      msg +
      '</span>';
  }

  function applyLockUi(state) {
    if (applying) return;
    applying = true;
    try {
      var on = !!(state && state.locked);
      setDisabled(document.getElementById('assign-agent'), on);
      setDisabled(document.getElementById('quick-status'), on);
      setDisabled(document.getElementById('btn-claim'), on);
      setDisabled(document.getElementById('btn-save-meta'), on);
      setDisabled(document.getElementById('btn-delete-ticket'), on);
      setDisabled(document.getElementById('btn-remote-session'), on);
      setDisabled(document.querySelector('#comment-form button[type="submit"]'), on);
      setDisabled(document.getElementById('comment-text'), on);
      setDisabled(document.getElementById('comment-internal'), on);
      setDisabled(document.querySelector('#view-detail input[type="file"]'), on);
      ensureBanner(state);
    } finally {
      applying = false;
    }
  }

  async function refresh() {
    var detail = document.getElementById('view-detail');
    if (!detail || !detail.classList.contains('active')) {
      locked = false;
      var b = document.getElementById('dr-claim-lock-banner');
      if (b) b.remove();
      return;
    }
    var now = Date.now();
    if (now - lastRefreshAt < 400) return;
    lastRefreshAt = now;
    var state = await loadTicketState();
    applyLockUi(state);
  }

  function scheduleRefresh() {
    if (refreshTimer) return;
    refreshTimer = setTimeout(function () {
      refreshTimer = null;
      refresh();
    }, 350);
  }

  function bindClaimGuard() {
    var btn = document.getElementById('btn-claim');
    if (!btn || btn.__drClaimLock) return;
    btn.__drClaimLock = 1;
    btn.addEventListener(
      'click',
      async function (e) {
        var state = await loadTicketState();
        if (!state) return;
        var p = me();
        if (!p) return;
        if (state.assigneeId && state.assigneeId !== p.id) {
          e.preventDefault();
          e.stopImmediatePropagation();
          await alertDlg(
            'This ticket is already claimed by ' +
              (state.assigneeName || 'another agent') +
              '.\n\nOnly ' +
              (state.assigneeName || 'they') +
              ' can edit it. You cannot claim it while it is assigned to them.',
            { title: 'Already claimed', icon: '⚠' }
          );
          applyLockUi(state);
        }
      },
      true
    );
  }

  function bindSaveGuard() {
    var btn = document.getElementById('btn-save-meta');
    if (!btn || btn.__drClaimLock) return;
    btn.__drClaimLock = 1;
    btn.addEventListener(
      'click',
      async function (e) {
        var state = await loadTicketState();
        if (state && state.locked) {
          e.preventDefault();
          e.stopImmediatePropagation();
          await alertDlg(
            'This ticket is claimed by ' +
              (state.assigneeName || 'another agent') +
              '.\n\nYou cannot change status or assignment on their ticket.',
            { title: 'Ticket locked', icon: '⚠' }
          );
        }
      },
      true
    );
  }

  function bindAssignGuard() {
    var sel = document.getElementById('assign-agent');
    if (!sel || sel.__drClaimLock) return;
    sel.__drClaimLock = 1;
    sel.addEventListener(
      'change',
      async function (e) {
        var state = await loadTicketState();
        if (state && state.locked) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (state.assigneeId) sel.value = state.assigneeId;
          await alertDlg(
            'This ticket is claimed by ' +
              (state.assigneeName || 'another agent') +
              '.\n\nOnly they can reassign it.',
            { title: 'Ticket locked', icon: '⚠' }
          );
        }
      },
      true
    );
  }

  function bindStatusGuard() {
    var sel = document.getElementById('quick-status');
    if (!sel || sel.__drClaimLock) return;
    sel.__drClaimLock = 1;
    sel.addEventListener(
      'change',
      async function (e) {
        var state = await loadTicketState();
        if (state && state.locked) {
          e.preventDefault();
          e.stopImmediatePropagation();
          await alertDlg(
            'This ticket is claimed by ' +
              (state.assigneeName || 'another agent') +
              '.\n\nOnly they can change the status.',
            { title: 'Ticket locked', icon: '⚠' }
          );
          scheduleRefresh();
        }
      },
      true
    );
  }

  function bindGuardsOnly() {
    if (!isStaff()) return;
    bindClaimGuard();
    bindSaveGuard();
    bindAssignGuard();
    bindStatusGuard();
  }

  function scheduleBind() {
    if (bindTimer) return;
    bindTimer = setTimeout(function () {
      bindTimer = null;
      if (applying) return;
      bindGuardsOnly();
      scheduleRefresh();
    }, 300);
  }

  function boot() {
    var target =
      document.getElementById('view-detail') ||
      document.getElementById('portal-agent') ||
      document.getElementById('app-shell') ||
      document.body;

    var mo = new MutationObserver(function (mutations) {
      if (applying) return;
      var relevant = false;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'childList') {
          var skip = false;
          if (m.addedNodes) {
            for (var j = 0; j < m.addedNodes.length; j++) {
              var n = m.addedNodes[j];
              if (n && n.id === 'dr-claim-lock-banner') skip = true;
            }
          }
          if (!skip) relevant = true;
        } else if (m.type === 'attributes' && m.attributeName === 'class') {
          relevant = true;
        }
      }
      if (relevant) scheduleBind();
    });

    mo.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    setInterval(function () {
      if (applying) return;
      var detail = document.getElementById('view-detail');
      if (detail && detail.classList.contains('active')) {
        bindGuardsOnly();
        scheduleRefresh();
      }
    }, 4000);

    setTimeout(scheduleBind, 1000);
    setTimeout(scheduleBind, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 500);

  window.DRClaimLock = { refresh: refresh, loadTicketState: loadTicketState };
})();
