/**
 * Divine Rays — staff (agent/admin) in-app notifications
 * New customer tickets + customer replies on tickets
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_STAFF_TICKET_NOTIFS_V1) return;
  window.__DR_STAFF_TICKET_NOTIFS_V1 = 1;

  function dr() { return window.DR || {}; }
  function sb() {
    try {
      if (window.DR && typeof DR.sb === 'function') return DR.sb();
      if (window.__drSb) return window.__drSb;
      if (window.sb) return window.sb;
    } catch (e) {}
    return null;
  }
  function profile() {
    try {
      return (dr().getProfile && dr().getProfile()) || window.__drProfile || null;
    } catch (e) {
      return null;
    }
  }
  function isStaff() {
    var p = profile();
    var role = String((p && p.role) || '').toLowerCase();
    return role === 'agent' || role === 'admin';
  }
  function agentPortalActive() {
    var pa = document.getElementById('portal-agent');
    return !!(pa && pa.classList.contains('active'));
  }
  function toast(msg, type) {
    try {
      if (dr().toast) return dr().toast(msg, type || 'info');
    } catch (e) {}
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:99999;display:flex;flex-direction:column;gap:.5rem';
      document.body.appendChild(c);
    }
    var e = document.createElement('div');
    e.className = 'toast ' + (type || 'info');
    e.style.cssText =
      'background:#1a1a24;border:1px solid rgba(124,106,240,.45);color:#e8e8f0;padding:.65rem 1rem;border-radius:10px;max-width:320px;font-size:.88rem;box-shadow:0 8px 24px rgba(0,0,0,.4)';
    e.textContent = msg;
    c.appendChild(e);
    setTimeout(function () { e.remove(); }, 4500);
  }

  var CSS = [
    '#dr-staff-notif-fab{position:fixed;right:1.15rem;bottom:1.25rem;z-index:12005;width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#7c6af0,#9b8afb);color:#fff;box-shadow:0 8px 28px rgba(124,106,240,.45);display:none;align-items:center;justify-content:center}',
    'body:has(#portal-agent.active) #dr-staff-notif-fab{display:flex}',
    '#dr-staff-notif-fab svg{width:22px;height:22px;fill:currentColor}',
    '#dr-staff-notif-fab .b{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center}',
    '#dr-staff-notif-fab .b.on{display:flex}',
    '#dr-staff-notif-bd{position:fixed;inset:0;z-index:12010;background:rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .18s}',
    '#dr-staff-notif-bd.open{opacity:1;pointer-events:auto}',
    '#dr-staff-notif-panel{position:fixed;right:1.15rem;bottom:5rem;z-index:12020;width:min(380px,calc(100vw - 2rem));max-height:min(440px,62vh);background:var(--surface,#1a1a24);border:1px solid rgba(124,106,240,.3);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(10px) scale(.97);pointer-events:none;transition:opacity .18s,transform .18s}',
    '#dr-staff-notif-panel.open{opacity:1;transform:none;pointer-events:auto}',
    '#dr-staff-notif-panel .hd{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.75rem 1rem;border-bottom:1px solid rgba(255,255,255,.08);font-weight:600;color:var(--text,#e8e8f0)}',
    '#dr-staff-notif-panel .hd-actions{display:flex;align-items:center;gap:.4rem}',
    '#dr-staff-notif-panel .hd button{background:0;border:0;color:#9898b0;cursor:pointer;font-size:1.05rem;padding:.15rem .35rem}',
    '#dr-staff-notif-clear{border:1px solid rgba(239,68,68,.35)!important;border-radius:8px!important;padding:.25rem .5rem!important;font-size:.72rem!important;color:#f87171!important}',
    '#dr-staff-notif-body{overflow:auto;padding:.5rem;flex:1}',
    '#dr-staff-notif-body .row{padding:.65rem .75rem;border-radius:10px;margin-bottom:.35rem;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.06);cursor:pointer}',
    '#dr-staff-notif-body .row.unread{border-color:rgba(124,106,240,.4);background:rgba(124,106,240,.12)}',
    '#dr-staff-notif-body .row .t{font-size:.88rem;color:var(--text,#eeeef6);margin-bottom:.2rem;font-weight:600}',
    '#dr-staff-notif-body .row .m{font-size:.78rem;color:#9898b0;line-height:1.35}',
    '#dr-staff-notif-body .row .when{font-size:.7rem;color:#6b6b80;margin-top:.3rem}',
    '#dr-staff-notif-body .empty{padding:1.25rem;text-align:center;color:#9898b0;font-size:.88rem}',
    'html[data-theme="light"] #dr-staff-notif-panel{background:#fff;border-color:rgba(124,106,240,.25)}',
    'html[data-theme="light"] #dr-staff-notif-body .row{background:#f8f7fc;border-color:rgba(0,0,0,.06)}',
    'html[data-theme="light"] #dr-staff-notif-body .row.unread{background:#f3f0ff;border-color:rgba(124,106,240,.35)}'
  ].join('');

  function injectCss() {
    if (document.getElementById('dr-staff-notif-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-staff-notif-css';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function setBadge(n) {
    var el = document.getElementById('dr-staff-notif-count');
    if (!el) return;
    if (n > 0) {
      el.textContent = n > 99 ? '99+' : String(n);
      el.classList.add('on');
    } else {
      el.textContent = '0';
      el.classList.remove('on');
    }
  }

  function timeAgo(iso) {
    try {
      var d = new Date(iso).getTime();
      var s = Math.max(0, (Date.now() - d) / 1000);
      if (s < 60) return 'just now';
      if (s < 3600) return Math.floor(s / 60) + 'm ago';
      if (s < 86400) return Math.floor(s / 3600) + 'h ago';
      return Math.floor(s / 86400) + 'd ago';
    } catch (e) {
      return '';
    }
  }

  function openTicketFromNotif(n) {
    var num = n.ticket_number || (n.meta && (n.meta.ticket_number || n.meta.ticket_id));
    try {
      if (num && dr().openTicketByNumber) return dr().openTicketByNumber(num);
      if (n.meta && n.meta.ticket_id && dr().openTicket) return dr().openTicket(n.meta.ticket_id);
    } catch (e) {}
    try {
      var btn = document.querySelector('#portal-agent .nav-btn[data-view="unassigned"], #portal-agent .nav-btn[data-view="all-tickets"]');
      if (btn) btn.click();
    } catch (e2) {}
  }

  async function markRead(id) {
    var client = sb();
    var p = profile();
    if (!client || !p || !id) return;
    try {
      await client.from('notifications').update({ read: true }).eq('id', id).eq('user_id', p.id);
    } catch (e) {}
  }

  async function loadList() {
    var body = document.getElementById('dr-staff-notif-body');
    if (!body) return;
    var client = sb();
    var p = profile();
    if (!client || !p || !p.id) {
      body.innerHTML = '<div class="empty">Sign in as agent to see alerts</div>';
      setBadge(0);
      return;
    }
    try {
      var r = await client
        .from('notifications')
        .select('*')
        .eq('user_id', p.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (r.error || !r.data || !r.data.length) {
        body.innerHTML = '<div class="empty">No notifications yet</div>';
        setBadge(0);
        return;
      }
      var unread = 0;
      var html = '';
      r.data.forEach(function (n) {
        if (!n.read) unread++;
        html +=
          '<div class="row' + (n.read ? '' : ' unread') + '" data-id="' + n.id + '" data-ticket="' + (n.ticket_number || '') + '">' +
          '<div class="t">' + escapeHtml(n.title || n.type || 'Update') + '</div>' +
          '<div class="m">' + escapeHtml(n.body || '') + '</div>' +
          '<div class="when">' + timeAgo(n.created_at) + (n.ticket_number ? ' · ' + escapeHtml(n.ticket_number) : '') + '</div>' +
          '</div>';
      });
      body.innerHTML = html;
      setBadge(unread);
      body.querySelectorAll('.row').forEach(function (row) {
        row.addEventListener('click', async function () {
          var id = row.getAttribute('data-id');
          await markRead(id);
          row.classList.remove('unread');
          var still = body.querySelectorAll('.row.unread').length;
          setBadge(still);
          var n = r.data.find(function (x) { return x.id === id; });
          if (n) openTicketFromNotif(n);
          closePanel();
        });
      });
    } catch (e) {
      body.innerHTML = '<div class="empty">Could not load notifications</div>';
    }
  }

  async function refreshBadge() {
    var client = sb();
    var p = profile();
    if (!client || !p || !p.id) return setBadge(0);
    try {
      var r = await client
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', p.id)
        .eq('read', false);
      setBadge(r.count || 0);
    } catch (e) {
      setBadge(0);
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function openPanel() {
    var bd = document.getElementById('dr-staff-notif-bd');
    var panel = document.getElementById('dr-staff-notif-panel');
    if (bd) bd.classList.add('open');
    if (panel) panel.classList.add('open');
    loadList();
  }
  function closePanel() {
    var bd = document.getElementById('dr-staff-notif-bd');
    var panel = document.getElementById('dr-staff-notif-panel');
    if (bd) bd.classList.remove('open');
    if (panel) panel.classList.remove('open');
  }

  function ensureUi() {
    injectCss();
    if (document.getElementById('dr-staff-notif-fab')) return;
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'dr-staff-notif-fab';
    fab.title = 'Ticket notifications';
    fab.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>' +
      '<span class="b" id="dr-staff-notif-count">0</span>';
    document.body.appendChild(fab);

    var bd = document.createElement('div');
    bd.id = 'dr-staff-notif-bd';
    document.body.appendChild(bd);

    var panel = document.createElement('div');
    panel.id = 'dr-staff-notif-panel';
    panel.innerHTML =
      '<div class="hd"><span>Ticket alerts</span>' +
      '<div class="hd-actions">' +
      '<button type="button" id="dr-staff-notif-clear" title="Clear all">Clear</button>' +
      '<button type="button" id="dr-staff-notif-close">&times;</button>' +
      '</div></div>' +
      '<div id="dr-staff-notif-body"><div class="empty">Loading…</div></div>';
    document.body.appendChild(panel);

    fab.addEventListener('click', function () {
      var panelEl = document.getElementById('dr-staff-notif-panel');
      if (panelEl && panelEl.classList.contains('open')) closePanel();
      else openPanel();
    });
    bd.addEventListener('click', closePanel);
    document.getElementById('dr-staff-notif-close').addEventListener('click', closePanel);
    document.getElementById('dr-staff-notif-clear').addEventListener('click', async function () {
      if (!window.confirm('Clear all ticket notifications?')) return;
      var client = sb();
      var p = profile();
      if (client && p) {
        try {
          var del = await client.from('notifications').delete().eq('user_id', p.id);
          if (del.error) await client.from('notifications').update({ read: true }).eq('user_id', p.id);
        } catch (e) {}
      }
      setBadge(0);
      var body = document.getElementById('dr-staff-notif-body');
      if (body) body.innerHTML = '<div class="empty">No notifications yet</div>';
    });
  }

  var channel = null;
  function subscribeRealtime() {
    var client = sb();
    var p = profile();
    if (!client || !p || !p.id || channel) return;
    try {
      channel = client
        .channel('staff-notifs-' + p.id)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + p.id },
          function (payload) {
            var n = payload.new;
            if (!n) return;
            toast(n.title || n.body || 'New ticket update', 'info');
            refreshBadge();
            var panel = document.getElementById('dr-staff-notif-panel');
            if (panel && panel.classList.contains('open')) loadList();
            try {
              if (window.Notification && Notification.permission === 'granted') {
                new Notification(n.title || 'Tech Hub', { body: n.body || '', silent: false });
              }
            } catch (e) {}
          }
        )
        .subscribe();
    } catch (e) {}
  }

  function requestDesktopPermission() {
    try {
      if (window.Notification && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (e) {}
  }

  function boot() {
    if (!isStaff() && !agentPortalActive()) {
      return;
    }
    ensureUi();
    refreshBadge();
    subscribeRealtime();
    requestDesktopPermission();
  }

  setInterval(function () {
    if (agentPortalActive() && isStaff()) {
      ensureUi();
      if (!channel) subscribeRealtime();
    }
  }, 4000);

  setTimeout(boot, 1200);
  setTimeout(boot, 3500);
  setTimeout(refreshBadge, 5000);

  window.DRStaffNotifs = {
    refresh: function () {
      refreshBadge();
      return loadList();
    },
    open: openPanel
  };
})();
