/**
 * Divine Rays — track assignee, notif Delete All, light-mode readability, centered credit
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TRACK_NOTIF_UX) return;
  window.__DR_TRACK_NOTIF_UX = 1;

  function client() {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (window.sb) return window.sb;
      if (window.DR && window.DR.sb) return typeof window.DR.sb === 'function' ? window.DR.sb() : window.DR.sb;
    } catch (e) {}
    return null;
  }

  function injectStyles() {
    if (document.getElementById('dr-track-notif-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-track-notif-css';
    s.textContent =
      '.credit,.credit-footer,.credit-side,' +
      'p.credit,small.credit,[class*="credit"]{' +
      'text-align:center!important;display:block!important;width:100%!important;' +
      'margin-left:auto!important;margin-right:auto!important;' +
      'letter-spacing:0.06em!important}' +
      'html[data-theme="light"] .feature-card h3,' +
      'html[data-theme="light"] .feature-card .feature-title,' +
      'html[data-theme="light"] .feature-grid h3,' +
      'html[data-theme="light"] .feature-grid strong{' +
      'color:#1e1b4b!important}' +
      'html[data-theme="light"] .feature-card p,' +
      'html[data-theme="light"] .feature-card .feature-desc,' +
      'html[data-theme="light"] .feature-grid p{' +
      'color:#4338ca!important}' +
      'html[data-theme="light"] .ctab,' +
      'html[data-theme="light"] .ctabs button{' +
      'color:#4c1d95!important;opacity:1!important}' +
      'html[data-theme="light"] .ctab.active,' +
      'html[data-theme="light"] .ctabs button.active{' +
      'color:#1e1b4b!important;font-weight:700!important}' +
      'html[data-theme="light"] .portal-subtitle,' +
      'html[data-theme="light"] .panel-lead,' +
      'html[data-theme="light"] #portal-customer .muted,' +
      'html[data-theme="light"] #portal-customer .empty-state{' +
      'color:#5b21b6!important}' +
      'html[data-theme="light"] #track-result,' +
      'html[data-theme="light"] #track-result h3,' +
      'html[data-theme="light"] #track-result .meta-chip,' +
      'html[data-theme="light"] #track-result .meta-k,' +
      'html[data-theme="light"] #track-result .detail-description{' +
      'color:#1e1b4b!important}' +
      'html[data-theme="light"] #track-result .meta-chip{' +
      'background:rgba(124,58,237,0.1)!important;border-color:rgba(124,58,237,0.25)!important}' +
      'html[data-theme="light"] .credit,' +
      'html[data-theme="light"] .credit-footer,' +
      'html[data-theme="light"] .credit-side{' +
      'color:#6d28d9!important;opacity:0.9!important}' +
      '.dr-assigned-chip{display:inline-flex;align-items:center;gap:0.35rem;margin-top:0.55rem;' +
      'padding:0.4rem 0.7rem;border-radius:10px;font-size:0.82rem;font-weight:600;' +
      'background:rgba(124,58,237,0.15);border:1px solid rgba(167,139,250,0.35);color:#ddd6fe}' +
      'html[data-theme="light"] .dr-assigned-chip{background:rgba(124,58,237,0.12);color:#4c1d95;border-color:rgba(124,58,237,0.3)}' +
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
    var sb = client();
    if (!sb) return null;
    try {
      var r = await sb
        .from('profiles')
        .select('full_name, username, email')
        .eq('id', userId)
        .maybeSingle();
      if (r.data) {
        return r.data.full_name || r.data.username || (r.data.email || '').split('@')[0] || null;
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
      var label = 'Unassigned';
      if (agentId) {
        var name = await resolveAgentName(agentId);
        label = name ? 'Claimed by ' + name : 'Claimed by an agent';
      } else {
        label = 'Not yet claimed by an agent';
      }
      if (box.querySelector('.dr-assigned-chip')) return;
      var chip = document.createElement('div');
      chip.className = 'dr-assigned-chip';
      chip.textContent = '👤 ' + label;
      var meta = box.querySelector('.detail-meta, .meta-row') || box.querySelector('h3');
      if (meta && meta.parentNode) {
        if (meta.nextSibling) meta.parentNode.insertBefore(chip, meta.nextSibling);
        else meta.parentNode.appendChild(chip);
      } else {
        box.appendChild(chip);
      }
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
        if (del.error) {
          await sb.from('notifications').update({ read: true }).eq('user_id', p.id);
        }
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
    if (closeBtn) {
      hd.insertBefore(actions, closeBtn);
    } else {
      hd.appendChild(actions);
    }
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
    watchNotifPanel();
  }

  apply();
  setTimeout(apply, 600);
  setTimeout(apply, 2000);
  setTimeout(apply, 5000);
  setInterval(function () {
    centerCredits();
    wireTrackButton();
    enhanceTrackResult();
    watchNotifPanel();
  }, 8000);

  window.DRTrackNotifUx = { refresh: apply };
})();
