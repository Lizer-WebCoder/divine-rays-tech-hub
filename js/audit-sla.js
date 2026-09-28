/**
 * Divine Rays — Ticket audit log panel + idle escalation UI
 * Requires: private-notes-audit-sla.sql in Supabase
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_AUDIT_SLA) return;
  window.__DR_AUDIT_SLA = 1;

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }
  function profile() {
    try { if (window.DR && window.DR.getProfile) return window.DR.getProfile(); } catch (e) {}
    return window.__drProfile || null;
  }
  function isStaff() {
    var p = profile();
    return !!(p && (p.role === 'agent' || p.role === 'admin'));
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function toast(m, t) {
    try {
      if (window.DR && window.DR.toast) return window.DR.toast(m, t);
    } catch (e) {}
    var c = document.getElementById('toast-container');
    if (!c) return;
    var e = document.createElement('div');
    e.className = 'toast ' + (t || 'info');
    e.textContent = m;
    c.appendChild(e);
    setTimeout(function () { try { e.remove(); } catch (x) {} }, 4000);
  }

  function injectCss() {
    if (document.getElementById('dr-audit-sla-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-audit-sla-css';
    s.textContent = [
      '#dr-audit-panel{margin:1rem 0;padding:0.9rem 1rem;border-radius:12px;border:1px solid rgba(139,124,247,0.25);background:rgba(20,18,36,0.55)}',
      'html[data-theme="light"] #dr-audit-panel{background:rgba(255,255,255,0.92);border-color:rgba(109,94,245,0.2)}',
      '#dr-audit-panel h4{margin:0 0 0.65rem;font-size:0.95rem;color:#c4b5fd;display:flex;align-items:center;justify-content:space-between;gap:0.5rem}',
      'html[data-theme="light"] #dr-audit-panel h4{color:#5b21b6}',
      '#dr-audit-list{max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:0.45rem}',
      '.dr-audit-row{font-size:0.82rem;line-height:1.4;padding:0.4rem 0.55rem;border-radius:8px;background:rgba(0,0,0,0.18);border-left:3px solid #7c6af0}',
      'html[data-theme="light"] .dr-audit-row{background:#f5f3ff;color:#1e1b4b}',
      '.dr-audit-row .act{font-weight:700;color:#c4b5fd;text-transform:capitalize}',
      'html[data-theme="light"] .dr-audit-row .act{color:#5b21b6}',
      '.dr-audit-row .meta{color:#9898b0;font-size:0.75rem}',
      'html[data-theme="light"] .dr-audit-row .meta{color:#4b5563}',
      '#dr-idle-bar{display:none;margin:0.75rem 0;padding:0.65rem 0.9rem;border-radius:10px;border:1px solid rgba(245,158,11,0.45);background:rgba(245,158,11,0.12);color:#fbbf24;font-size:0.88rem;font-weight:600}',
      'html[data-theme="light"] #dr-idle-bar{background:#fffbeb;color:#92400e;border-color:#f59e0b}',
      '#dr-idle-bar button{margin-left:0.65rem;padding:0.3rem 0.65rem;border-radius:8px;border:none;background:#f59e0b;color:#1a1a2e;font-weight:700;cursor:pointer;font-size:0.8rem}',
      '.comment.internal{border-left:3px solid #f59e0b!important;background:rgba(245,158,11,0.08)!important}',
      'html[data-theme="light"] .comment.internal{background:rgba(245,158,11,0.12)!important}',
      '.sla-chip.sla-overdue{border-color:#ef4444!important;color:#fca5a5!important}',
      '.sla-chip.sla-soon{border-color:#f59e0b!important;color:#fbbf24!important}'
    ].join('');
    document.head.appendChild(s);
  }

  function currentTicketId() {
    if (window.__drOpenTicketId) return window.__drOpenTicketId;
    var d = document.getElementById('ticket-detail');
    if (d && d.getAttribute('data-ticket-id')) return d.getAttribute('data-ticket-id');
    var c = document.getElementById('cust-ticket-detail');
    if (c && c.getAttribute('data-ticket-id')) return c.getAttribute('data-ticket-id');
    return null;
  }

  function ensureAuditPanel() {
    if (!isStaff()) return null;
    var detail = document.getElementById('ticket-detail') || document.getElementById('view-detail');
    if (!detail || !(detail.offsetParent || detail.getClientRects().length)) return null;
    var panel = document.getElementById('dr-audit-panel');
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'dr-audit-panel';
    panel.innerHTML =
      '<h4>Activity history <button type="button" class="btn btn-secondary btn-sm" id="dr-audit-refresh" style="font-size:0.75rem;padding:0.2rem 0.5rem">Refresh</button></h4>' +
      '<div id="dr-audit-list"><span class="meta">Loading…</span></div>';
    var comments = detail.querySelector('.comments-section');
    if (comments) detail.insertBefore(panel, comments);
    else detail.appendChild(panel);
    var btn = document.getElementById('dr-audit-refresh');
    if (btn) btn.addEventListener('click', function () { loadAudit(); });
    return panel;
  }

  function ensureIdleBar() {
    if (!isStaff()) return null;
    var detail = document.getElementById('ticket-detail') || document.getElementById('view-detail');
    if (!detail) return null;
    var bar = document.getElementById('dr-idle-bar');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'dr-idle-bar';
    bar.innerHTML = '<span id="dr-idle-msg"></span><button type="button" id="dr-idle-escalate">Escalate idle tickets</button>';
    var meta = detail.querySelector('.detail-meta') || detail.firstChild;
    if (meta && meta.parentNode) meta.parentNode.insertBefore(bar, meta.nextSibling);
    else detail.insertBefore(bar, detail.firstChild);
    var btn = document.getElementById('dr-idle-escalate');
    if (btn) {
      btn.addEventListener('click', async function () {
        var client = sb();
        if (!client) return;
        btn.disabled = true;
        btn.textContent = '…';
        try {
          var r = await client.rpc('escalate_idle_tickets', { p_idle_hours: 24 });
          if (r.error) throw r.error;
          toast('Escalated ' + (r.data || 0) + ' idle ticket(s)', 'success');
          loadIdleHint();
          loadAudit();
        } catch (e) {
          toast((e && e.message) || 'Escalation failed — run private-notes-audit-sla.sql', 'error');
        }
        btn.disabled = false;
        btn.textContent = 'Escalate idle tickets';
      });
    }
    return bar;
  }

  async function loadAudit() {
    if (!isStaff()) return;
    ensureAuditPanel();
    var list = document.getElementById('dr-audit-list');
    if (!list) return;
    var tid = currentTicketId();
    if (!tid) {
      list.innerHTML = '<span class="meta">Open a ticket to see history</span>';
      return;
    }
    var client = sb();
    if (!client) return;
    try {
      var r = await client
        .from('ticket_activity')
        .select('id,action,detail,created_at,actor_id,meta')
        .eq('ticket_id', tid)
        .order('created_at', { ascending: false })
        .limit(40);
      if (r.error) {
        list.innerHTML = '<span class="meta">Activity log not ready — run private-notes-audit-sla.sql in Supabase</span>';
        return;
      }
      var rows = r.data || [];
      if (!rows.length) {
        list.innerHTML = '<span class="meta">No activity recorded yet</span>';
        return;
      }
      var ids = [];
      rows.forEach(function (row) {
        if (row.actor_id && ids.indexOf(row.actor_id) === -1) ids.push(row.actor_id);
      });
      var names = {};
      if (ids.length) {
        try {
          var pr = await client.from('profiles').select('id,full_name,username').in('id', ids);
          (pr.data || []).forEach(function (p) {
            names[p.id] = p.full_name || p.username || 'Staff';
          });
        } catch (e) {}
      }
      list.innerHTML = rows.map(function (row) {
        var when = '';
        try {
          when = new Date(row.created_at).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          });
        } catch (e) {}
        var who = names[row.actor_id] || 'System';
        return (
          '<div class="dr-audit-row">' +
          '<span class="act">' + esc((row.action || '').replace(/_/g, ' ')) + '</span>' +
          ' — ' + esc(row.detail || '') +
          '<div class="meta">' + esc(who) + ' · ' + esc(when) + '</div>' +
          '</div>'
        );
      }).join('');
    } catch (e) {
      list.innerHTML = '<span class="meta">Could not load activity</span>';
    }
  }

  async function loadIdleHint() {
    if (!isStaff()) return;
    ensureIdleBar();
    var bar = document.getElementById('dr-idle-bar');
    var msg = document.getElementById('dr-idle-msg');
    if (!bar || !msg) return;
    var client = sb();
    if (!client) return;
    try {
      var r = await client.rpc('list_idle_tickets', { p_idle_hours: 24 });
      if (r.error) {
        bar.style.display = 'none';
        return;
      }
      var rows = r.data || [];
      if (!rows.length) {
        bar.style.display = 'none';
        return;
      }
      bar.style.display = 'block';
      msg.textContent = rows.length + ' idle ticket(s) with no agent activity ≥ 24h';
    } catch (e) {
      bar.style.display = 'none';
    }
  }

  function sync() {
    injectCss();
    if (!isStaff()) return;
    ensureAuditPanel();
    ensureIdleBar();
    loadAudit();
    loadIdleHint();
  }

  injectCss();
  setTimeout(sync, 800);
  setTimeout(sync, 2500);
  setInterval(function () {
    if (isStaff() && document.getElementById('ticket-detail')) {
      loadAudit();
      loadIdleHint();
    }
  }, 12000);

  try {
    var mo = new MutationObserver(function () { sync(); });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  window.DRAuditSla = { refresh: sync, loadAudit: loadAudit };
})();
