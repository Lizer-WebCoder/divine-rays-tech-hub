/**
 * Divine Rays — track/my-tickets assignee, notif Delete All,
 * strong light-mode readability, centered credit
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_TRACK_NOTIF_UX = 1;

  var nameCache = {};

  function client() {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (window.sb) return window.sb;
      if (window.DR && window.DR.sb)
        return typeof window.DR.sb === 'function' ? window.DR.sb() : window.DR.sb;
    } catch (e) {}
    return null;
  }

  function injectStyles() {
    var prev = document.getElementById('dr-track-notif-css');
    if (prev) prev.remove();
    var s = document.createElement('style');
    s.id = 'dr-track-notif-css';
    s.textContent =
      '.credit,.credit-footer,.credit-side,p.credit,small.credit,[class*="credit"]{' +
      'text-align:center!important;display:block!important;width:100%!important;' +
      'margin-left:auto!important;margin-right:auto!important}' +
      'html[data-theme="light"] #portal-customer h1,' +
      'html[data-theme="light"] #portal-customer h2,' +
      'html[data-theme="light"] #portal-customer .welcome-title,' +
      'html[data-theme="light"] #portal-customer .customer-hero h1{' +
      'color:#1e1b4b!important}' +
      'html[data-theme="light"] #portal-customer .portal-subtitle,' +
      'html[data-theme="light"] #portal-customer .panel-lead,' +
      'html[data-theme="light"] #portal-customer .customer-hero p,' +
      'html[data-theme="light"] #portal-customer p:not(.empty-state){' +
      'color:#4c1d95!important;opacity:1!important}' +
      'html[data-theme="light"] .ctab,' +
      'html[data-theme="light"] .ctabs button,' +
      'html[data-theme="light"] button.ctab{' +
      'color:#4c1d95!important;opacity:1!important;' +
      'background:rgba(255,255,255,0.85)!important;' +
      'border:1px solid rgba(124,58,237,0.35)!important;' +
      'box-shadow:0 1px 4px rgba(91,33,182,0.08)!important}' +
      'html[data-theme="light"] .ctab:hover,' +
      'html[data-theme="light"] .ctabs button:hover{' +
      'color:#1e1b4b!important;background:#fff!important;' +
      'border-color:rgba(124,58,237,0.55)!important}' +
      'html[data-theme="light"] .ctab.active,' +
      'html[data-theme="light"] .ctabs button.active,' +
      'html[data-theme="light"] button.ctab.active{' +
      'color:#fff!important;font-weight:700!important;' +
      'background:linear-gradient(135deg,#7c3aed,#5b21b6)!important;' +
      'border-color:transparent!important;' +
      'box-shadow:0 4px 14px rgba(124,58,237,0.35)!important}' +
      'html[data-theme="light"] .feature-card,' +
      'html[data-theme="light"] .feature-grid > div{' +
      'background:rgba(255,255,255,0.92)!important;' +
      'border:1px solid rgba(124,58,237,0.2)!important}' +
      'html[data-theme="light"] .feature-card h3,' +
      'html[data-theme="light"] .feature-card .feature-title,' +
      'html[data-theme="light"] .feature-grid h3,' +
      'html[data-theme="light"] .feature-grid strong{' +
      'color:#1e1b4b!important}' +
      'html[data-theme="light"] .feature-card p,' +
      'html[data-theme="light"] .feature-card .feature-desc,' +
      'html[data-theme="light"] .feature-grid p{' +
      'color:#5b21b6!important}' +
      'html[data-theme="light"] .ticket-card h4,' +
      'html[data-theme="light"] .ticket-card .ticket-id,' +
      'html[data-theme="light"] .ticket-meta{' +
      'color:#1e1b4b!important}' +
      'html[data-theme="light"] .ticket-card .ticket-meta span{' +
      'color:#5b21b6!important}' +
      'html[data-theme="light"] .credit,' +
      'html[data-theme="light"] .credit-footer,' +
      'html[data-theme="light"] .credit-side{' +
      'color:#6d28d9!important;opacity:0.95!important}' +
      'html[data-theme="light"] #track-result,' +
      'html[data-theme="light"] #track-result h3,' +
      'html[data-theme="light"] #track-result .meta-chip,' +
      'html[data-theme="light"] #track-result .detail-description{' +
      'color:#1e1b4b!important}' +
      '.dr-assigned-chip,.dr-claimed-line{' +
      'display:inline-flex;align-items:center;gap:0.3rem;margin-top:0.4rem;' +
      'padding:0.28rem 0.55rem;border-radius:8px;font-size:0.75rem;font-weight:600;' +
      'background:rgba(124,58,237,0.15);border:1px solid rgba(167,139,250,0.35);color:#ddd6fe}' +
      'html[data-theme="light"] .dr-assigned-chip,' +
      'html[data-theme="light"] .dr-claimed-line{' +
      'background:rgba(124,58,237,0.12);color:#4c1d95;border-color:rgba(124,58,237,0.3)}' +
      '.ticket-card .dr-claimed-line{display:block;width:fit-content;margin-top:0.35rem}' +
      '#dr-notif-panel .hd{display:flex;align-items:center;justify-content:space-between;gap:0.5rem}' +
      '#dr-notif-panel .hd .hd-actions{display:flex;align-items:center;gap:0.4rem;margin-left:auto}' +
      '#dr-notif-clear-all{border:none;border-radius:8px;padding:0.3rem 0.55rem;font-size:0.72rem;' +
      'font-weight:700;cursor:pointer;background:rgba(239,68,68,0.15);color:#fca5a5;' +
      'border:1px solid rgba(248,113,113,0.35)}' +
      'html[data-theme="light"] #dr-notif-clear-all{background:#fee2e2;color:#b91c1c;border-color:#f87171}' +
      '#dr-notif-panel .row .m.agent-line{color:#c4b5fd;font-weight:600;margin-top:0.2rem}' +
      'html[data-theme="light"] #dr-notif-panel .row .m.agent-line{color:#6d28d9}';
    document.head.appendChild(s);
  }

  function centerCredits() {
    document.querySelectorAll('.credit, .credit-footer, .credit-side, [class*="credit"]').forEach(function (el) {
      el.style.textAlign = 'center';
      el.style.display = 'block';
      el.style.width = '100%';
      el.style.marginLeft = 'auto';
      el.style.marginRight = 'auto';
    });
  }

  async function resolveAgentName(userId) {
    if (!userId) return null;
    if (nameCache[userId]) return nameCache[userId];
    var sb = client();
    if (!sb) return null;
    try {
      var r = await sb
        .from('profiles')
        .select('full_name, username, email')
        .eq('id', userId)
        .maybeSingle();
      if (r.data) {
        var n =
          r.data.full_name ||
          r.data.username ||
          (r.data.email || '').split('@')[0] ||
          null;
        if (n) nameCache[userId] = n;
        return n;
      }
    } catch (e) {}
    return null;
  }

  async function enhanceTrackResult() {
    var box = document.getElementById('track-result');
    if (!box || box.hidden || box.getAttribute('data-dr-assigned') === '1') return;
    var idEl = box.querySelector('.ticket-id');
    if (!idEl) return;
    var num = (idEl.textContent || '').trim();
    if (!num) return;
    var sb = client();
    if (!sb) return;
    try {
      var r = await sb
        .from('tickets')
        .select('assigned_to, status, ticket_number')
        .eq('ticket_number', num)
        .maybeSingle();
      if (r.error || !r.data) return;
      box.setAttribute('data-dr-assigned', '1');
      var agentId = r.data.assigned_to;
      var label = agentId
        ? 'Claimed by ' + ((await resolveAgentName(agentId)) || 'an agent')
        : 'Not yet claimed by an agent';
      if (box.querySelector('.dr-assigned-chip')) return;
      var chip = document.createElement('div');
      chip.className = 'dr-assigned-chip';
      chip.textContent = '👤 ' + label;
      var meta = box.querySelector('.detail-meta, .meta-row') || box.querySelector('h3');
      if (meta && meta.parentNode) {
        if (meta.nextSibling) meta.parentNode.insertBefore(chip, meta.nextSibling);
        else meta.parentNode.appendChild(chip);
      } else box.appendChild(chip);
    } catch (e) {}
  }

  function wireTrackButton() {
    var bt = document.getElementById('btn-track');
    if (!bt || bt.getAttribute('data-dr-track-ux') === '1') return;
    bt.setAttribute('data-dr-track-ux', '1');
    bt.addEventListener('click', function () {
      setTimeout(enhanceTrackResult, 400);
      setTimeout(enhanceTrackResult, 900);
      setTimeout(enhanceTrackResult, 1600);
    });
  }

  async function enhanceMyTickets() {
    var list = document.getElementById('my-tickets-list');
    if (!list) return;
    var cards = list.querySelectorAll('.ticket-card[data-id]');
    if (!cards.length) return;
    var sb = client();
    if (!sb) return;

    var ids = [];
    cards.forEach(function (card) {
      if (card.getAttribute('data-dr-claimed') === '1') return;
      var id = card.getAttribute('data-id');
      if (id) ids.push(id);
    });
    if (!ids.length) return;

    try {
      var r = await sb.from('tickets').select('id, assigned_to, ticket_number').in('id', ids);
      if (r.error || !r.data) return;
      var byId = {};
      r.data.forEach(function (t) {
        byId[t.id] = t;
      });

      var agentIds = [];
      r.data.forEach(function (t) {
        if (t.assigned_to && agentIds.indexOf(t.assigned_to) === -1) agentIds.push(t.assigned_to);
      });
      for (var i = 0; i < agentIds.length; i++) {
        await resolveAgentName(agentIds[i]);
      }

      cards.forEach(function (card) {
        if (card.getAttribute('data-dr-claimed') === '1') return;
        var id = card.getAttribute('data-id');
        var t = byId[id];
        if (!t) return;
        card.setAttribute('data-dr-claimed', '1');
        var label = t.assigned_to
          ? 'Claimed by ' + (nameCache[t.assigned_to] || 'an agent')
          : 'Not yet claimed';
        if (card.querySelector('.dr-claimed-line')) return;
        var line = document.createElement('div');
        line.className = 'dr-claimed-line';
        line.textContent = '👤 ' + label;
        var meta = card.querySelector('.ticket-meta') || card.querySelector('h4');
        if (meta && meta.parentNode) {
          if (meta.nextSibling) meta.parentNode.insertBefore(line, meta.nextSibling);
          else meta.parentNode.appendChild(line);
        } else card.appendChild(line);
      });
    } catch (e) {}
  }

  function wireMyTicketsTab() {
    document.querySelectorAll('.ctab[data-ctab="mytickets"]').forEach(function (tab) {
      if (tab.getAttribute('data-dr-my-ux') === '1') return;
      tab.setAttribute('data-dr-my-ux', '1');
      tab.addEventListener('click', function () {
        setTimeout(enhanceMyTickets, 500);
        setTimeout(enhanceMyTickets, 1200);
        setTimeout(enhanceMyTickets, 2500);
      });
    });
    var list = document.getElementById('my-tickets-list');
    if (list && !list.__drClaimedMo) {
      try {
        var mo = new MutationObserver(function () {
          setTimeout(enhanceMyTickets, 200);
        });
        mo.observe(list, { childList: true, subtree: true });
        list.__drClaimedMo = mo;
      } catch (e) {}
    }
  }

  function ensureDeleteAll() {
    var panel = document.getElementById('dr-notif-panel');
    if (!panel) return;
    var hd = panel.querySelector('.hd');
    if (!hd || document.getElementById('dr-notif-clear-all')) return;
    var actions = document.createElement('div');
    actions.className = 'hd-actions';
    var clear = document.createElement('button');
    clear.type = 'button';
    clear.id = 'dr-notif-clear-all';
    clear.textContent = 'Delete all';
    clear.title = 'Remove all notifications';
    clear.onclick = async function (e) {
      e.stopPropagation();
      if (!window.confirm('Delete all notifications?')) return;
      var sb = client();
      var p =
        (window.DR && window.DR.getProfile && window.DR.getProfile()) ||
        window.currentProfile ||
        null;
      if (!sb || !p || !p.id) return;
      try {
        var del = await sb.from('notifications').delete().eq('user_id', p.id);
        if (del.error) await sb.from('notifications').update({ read: true }).eq('user_id', p.id);
      } catch (err) {}
      var body = document.getElementById('dr-notif-body');
      if (body) body.innerHTML = '<div class="empty">No notifications yet</div>';
      var badge = document.getElementById('dr-notif-count');
      if (badge) {
        badge.textContent = '0';
        badge.classList.remove('on');
      }
    };
    var closeBtn = document.getElementById('dr-notif-close');
    actions.appendChild(clear);
    if (closeBtn) hd.insertBefore(actions, closeBtn);
    else hd.appendChild(actions);
  }

  function enhanceNotifRows() {
    var body = document.getElementById('dr-notif-body');
    if (!body) return;
    body.querySelectorAll('.row').forEach(function (row) {
      if (row.getAttribute('data-dr-enhanced') === '1') return;
      row.setAttribute('data-dr-enhanced', '1');
      var t = row.querySelector('.t');
      var m = row.querySelector('.m');
      if (!t) return;
      var title = t.textContent || '';
      var msg = m ? m.textContent || '' : '';
      if (/ticket deleted|ticket_deleted/i.test(title + ' ' + msg)) {
        var agentMatch = msg.match(/deleted by\s+([^.(]+)/i);
        if (agentMatch && !row.querySelector('.agent-line')) {
          var line = document.createElement('div');
          line.className = 'm agent-line';
          line.textContent = 'Deleted by: ' + agentMatch[1].trim();
          if (m && m.parentNode) m.parentNode.insertBefore(line, m.nextSibling);
          else row.appendChild(line);
        }
      }
    });
  }

  function watchNotifPanel() {
    var body = document.getElementById('dr-notif-body');
    if (body && !body.__drMo) {
      try {
        var mo = new MutationObserver(function () {
          enhanceNotifRows();
          ensureDeleteAll();
        });
        mo.observe(body, { childList: true, subtree: true });
        body.__drMo = mo;
      } catch (e) {}
    }
    ensureDeleteAll();
    enhanceNotifRows();
  }

  function apply() {
    injectStyles();
    centerCredits();
    wireTrackButton();
    enhanceTrackResult();
    wireMyTicketsTab();
    enhanceMyTickets();
    watchNotifPanel();
  }

  apply();
  setTimeout(apply, 600);
  setTimeout(apply, 2000);
  setTimeout(apply, 5000);
  setInterval(function () {
    injectStyles();
    centerCredits();
    wireTrackButton();
    wireMyTicketsTab();
    enhanceMyTickets();
    enhanceTrackResult();
    watchNotifPanel();
  }, 8000);

  window.DRTrackNotifUx = { refresh: apply };
})();
