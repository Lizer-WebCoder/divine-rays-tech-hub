/**
 * Divine Rays Tech Hub v7.0 — extras (SLA, canned replies, reports, realtime, etc.)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  var SLA_HOURS = { Critical: 1, High: 4, Medium: 24, Low: 72 };
  var CANNED = [
    { id: 'ack', label: 'Acknowledgement', body: 'Thanks for reaching out. We have received your request and are looking into it.' },
    { id: 'more', label: 'Need more info', body: 'Could you please provide more details (screenshots, error messages, and steps to reproduce) so we can assist faster?' },
    { id: 'vpn', label: 'VPN checklist', body: 'Please try: 1) Restart the VPN client 2) Check your internet connection 3) Confirm you are using the correct credentials 4) Reply with any error message you see.' },
    { id: 'pwd', label: 'Password reset', body: 'We have initiated a password reset. Please check your email (and spam folder) for the reset link. It expires in 24 hours.' },
    { id: 'resolved', label: 'Resolved follow-up', body: 'This issue should now be resolved. Please confirm everything is working on your end. Feel free to reopen if the problem continues.' },
    { id: 'waiting', label: 'Waiting on customer', body: 'We are waiting on additional information from you to proceed. Please reply when you can.' }
  ];

  function dr() { return window.DR || {}; }
  function toast(m, t) { if (dr().toast) dr().toast(m, t); }
  function esc(s) { return dr().esc ? dr().esc(s) : String(s || ''); }
  function fmt(i) { return dr().fmt ? dr().fmt(i) : i; }
  function sc(s) { return dr().sc ? dr().sc(s) : ('badge-' + String(s || '').toLowerCase().replace(/\s+/g, '-')); }
  function sb() { return dr().sb ? dr().sb() : null; }

  function hoursSince(iso) {
    try { return (Date.now() - new Date(iso).getTime()) / 36e5; } catch (e) { return 0; }
  }

  function slaInfo(t) {
    if (!t || t.status === 'Resolved' || t.status === 'Closed') return null;
    var limit = SLA_HOURS[t.priority] || 24;
    var age = hoursSince(t.created_at);
    var remaining = limit - age;
    if (remaining <= 0) return { state: 'overdue', label: 'Overdue', hours: Math.abs(remaining) };
    if (remaining <= limit * 0.25) return { state: 'soon', label: 'Due soon', hours: remaining };
    return { state: 'ok', label: 'Within SLA', hours: remaining };
  }

  function slaBadgeHtml(t) {
    var s = slaInfo(t);
    if (!s || s.state === 'ok') return '';
    var cls = s.state === 'overdue' ? 'badge-sla-overdue' : 'badge-sla-soon';
    return '<span class="badge ' + cls + '">' + s.label + '</span>';
  }

  function injectCannedUI() {
    var form = document.getElementById('comment-form');
    if (!form || document.getElementById('canned-select')) return;
    var row = document.createElement('div');
    row.className = 'canned-row';
    row.innerHTML =
      '<label class="canned-label">Canned reply</label>' +
      '<select id="canned-select"><option value="">— Insert template —</option>' +
      CANNED.map(function (c) { return '<option value="' + c.id + '">' + esc(c.label) + '</option>'; }).join('') +
      '</select>';
    form.insertBefore(row, form.firstChild);
    document.getElementById('canned-select').addEventListener('change', function () {
      var id = this.value;
      if (!id) return;
      var item = CANNED.filter(function (c) { return c.id === id; })[0];
      if (!item) return;
      var ta = document.getElementById('comment-text');
      if (ta) {
        ta.value = (ta.value ? ta.value + '\n\n' : '') + item.body;
        ta.focus();
      }
      this.value = '';
    });
  }

  function satisfactionKey(tid) { return 'dr_sat_' + tid; }

  async function saveSatisfaction(ticketId, value) {
    try { localStorage.setItem(satisfactionKey(ticketId), value); } catch (e) {}
    var client = sb();
    if (client) {
      try {
        await client.from('tickets').update({ satisfaction: value }).eq('id', ticketId);
      } catch (e) {}
    }
  }

  function getLocalSat(tid) {
    try { return localStorage.getItem(satisfactionKey(tid)); } catch (e) { return null; }
  }

  function renderSatisfaction(ticket) {
    var host = document.getElementById('cust-satisfaction');
    if (!host) return;
    if (!ticket || (ticket.status !== 'Resolved' && ticket.status !== 'Closed')) {
      host.innerHTML = '';
      host.hidden = true;
      return;
    }
    host.hidden = false;
    var current = ticket.satisfaction || getLocalSat(ticket.id);
    if (current === 'up' || current === 'down') {
      host.innerHTML = '<p class="sat-thanks">Thanks for your feedback ' + (current === 'up' ? '👍' : '👎') + '</p>';
      return;
    }
    host.innerHTML =
      '<p class="sat-ask">Was this resolved to your satisfaction?</p>' +
      '<div class="sat-btns">' +
      '<button type="button" class="btn btn-secondary" data-sat="up">👍 Yes</button>' +
      '<button type="button" class="btn btn-secondary" data-sat="down">👎 No</button>' +
      '</div>';
    host.querySelectorAll('[data-sat]').forEach(function (b) {
      b.addEventListener('click', async function () {
        var v = b.getAttribute('data-sat');
        await saveSatisfaction(ticket.id, v);
        toast('Thanks for your feedback', 'success');
        renderSatisfaction(Object.assign({}, ticket, { satisfaction: v }));
      });
    });
  }

  function buildReports(tickets) {
    var byStatus = {}, byPriority = {}, byCat = {}, overdue = 0, openAge = 0, openN = 0, satUp = 0, satDown = 0;
    (tickets || []).forEach(function (t) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      byCat[t.category || 'Other'] = (byCat[t.category || 'Other'] || 0) + 1;
      var s = slaInfo(t);
      if (s && s.state === 'overdue') overdue++;
      if (t.status !== 'Resolved' && t.status !== 'Closed') {
        openAge += hoursSince(t.created_at);
        openN++;
      }
      var sat = t.satisfaction || getLocalSat(t.id);
      if (sat === 'up') satUp++;
      if (sat === 'down') satDown++;
    });
    return { byStatus: byStatus, byPriority: byPriority, byCat: byCat, overdue: overdue, avgOpenHours: openN ? openAge / openN : 0, satUp: satUp, satDown: satDown, total: (tickets || []).length };
  }

  function barsHtml(map, colorClass) {
    var keys = Object.keys(map);
    if (!keys.length) return '<p class="empty-state" style="padding:0.5rem">No data</p>';
    var max = Math.max.apply(null, keys.map(function (k) { return map[k]; })) || 1;
    return '<div class="report-bars">' + keys.sort().map(function (k) {
      var pct = Math.round((map[k] / max) * 100);
      return '<div class="report-row"><span class="report-label">' + esc(k) + '</span><div class="report-bar-track"><div class="report-bar-fill ' + (colorClass || '') + '" style="width:' + pct + '%"></div></div><span class="report-n">' + map[k] + '</span></div>';
    }).join('') + '</div>';
  }

  async function renderReports() {
    var box = document.getElementById('reports-body');
    if (!box || !dr().fetchTickets) return;
    box.innerHTML = '<p class="empty-state">Loading reports…</p>';
    var tickets = await dr().fetchTickets({});
    var r = buildReports(tickets);
    box.innerHTML =
      '<div class="stats" style="margin-bottom:1.25rem">' +
      '<div class="stat-card"><span class="stat-label">Total tickets</span><span class="stat-value">' + r.total + '</span></div>' +
      '<div class="stat-card critical"><span class="stat-label">Overdue (SLA)</span><span class="stat-value">' + r.overdue + '</span></div>' +
      '<div class="stat-card"><span class="stat-label">Avg open age</span><span class="stat-value">' + (r.avgOpenHours ? r.avgOpenHours.toFixed(1) + 'h' : '—') + '</span></div>' +
      '<div class="stat-card me"><span class="stat-label">👍 / 👎</span><span class="stat-value">' + r.satUp + ' / ' + r.satDown + '</span></div>' +
      '</div>' +
      '<div class="report-grid">' +
      '<div class="report-card"><h3 class="stats-heading">By status</h3>' + barsHtml(r.byStatus) + '</div>' +
      '<div class="report-card"><h3 class="stats-heading">By priority</h3>' + barsHtml(r.byPriority, 'bar-priority') + '</div>' +
      '<div class="report-card"><h3 class="stats-heading">By category</h3>' + barsHtml(r.byCat, 'bar-cat') + '</div>' +
      '</div>' +
      '<p class="admin-hint" style="margin-top:1rem">SLA targets: Critical 1h · High 4h · Medium 24h · Low 72h (from created time, open tickets only).</p>';
  }

  function enhanceListWithSla() {
    var cards = document.querySelectorAll('#ticket-list .ticket-card');
    var all = (dr().getAllTickets && dr().getAllTickets()) || [];
    var byId = {};
    all.forEach(function (t) { byId[t.id] = t; });
    cards.forEach(function (card) {
      var id = card.getAttribute('data-id');
      var t = byId[id];
      if (!t) return;
      var badges = card.querySelector('.badges');
      if (!badges) return;
      if (badges.querySelector('.badge-sla-overdue, .badge-sla-soon')) return;
      var html = slaBadgeHtml(t);
      if (html) badges.insertAdjacentHTML('afterbegin', html);
    });
  }

  function enhanceDetailSla(ticket) {
    var d = document.getElementById('ticket-detail');
    if (!d || !ticket) return;
    var meta = d.querySelector('.detail-meta');
    if (!meta) return;
    if (meta.querySelector('.sla-chip')) return;
    var s = slaInfo(ticket);
    if (!s) return;
    var cls = s.state === 'overdue' ? 'sla-overdue' : (s.state === 'soon' ? 'sla-soon' : 'sla-ok');
    var txt = s.state === 'overdue'
      ? ('Overdue by ' + s.hours.toFixed(1) + 'h')
      : (s.state === 'soon' ? ('Due in ' + s.hours.toFixed(1) + 'h') : ('SLA OK · ' + s.hours.toFixed(1) + 'h left'));
    meta.insertAdjacentHTML('beforeend',
      '<span class="meta-chip sla-chip ' + cls + '"><span class="meta-k">SLA</span> ' + txt + '</span>');
  }

  function injectRelatedUI() {
    var actions = document.querySelector('.agent-actions');
    if (!actions || document.getElementById('related-ticket-input')) return;
    var wrap = document.createElement('div');
    wrap.className = 'related-row';
    wrap.innerHTML =
      '<div class="form-group" style="margin-bottom:0;flex:1">' +
      '<label for="related-ticket-input">Related ticket ID</label>' +
      '<input type="text" id="related-ticket-input" placeholder="e.g. DR-1001" />' +
      '</div>' +
      '<button type="button" class="btn btn-secondary" id="btn-link-related">Add note</button>';
    actions.appendChild(wrap);
    document.getElementById('btn-link-related').addEventListener('click', async function () {
      var num = (document.getElementById('related-ticket-input').value || '').trim().toUpperCase();
      if (!num) { toast('Enter a ticket ID', 'error'); return; }
      var ta = document.getElementById('comment-text');
      if (ta) {
        ta.value = (ta.value ? ta.value + '\n' : '') + 'Related ticket: ' + num;
        document.getElementById('comment-internal').checked = true;
        toast('Related note ready — click Add Update', 'info');
      }
    });
  }

  function injectAttachmentUI() {
    var form = document.getElementById('customer-form');
    if (!form || document.getElementById('c-attachment')) return;
    var g = document.createElement('div');
    g.className = 'form-group';
    g.innerHTML = '<label for="c-attachment">Screenshot / link (optional)</label>' +
      '<input type="url" id="c-attachment" placeholder="https://… or paste image link" />';
    var desc = document.getElementById('c-description');
    if (desc && desc.parentNode) desc.parentNode.parentNode.insertBefore(g, desc.parentNode.nextSibling);
  }

  function bindKeys() {
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      var typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        var si = document.getElementById('search-input');
        if (si) { si.focus(); si.select(); }
      }
      if (e.key === 'Escape') {
        if (document.getElementById('view-detail') && document.getElementById('view-detail').classList.contains('active')) {
          var bb = document.getElementById('btn-back');
          if (bb) bb.click();
        }
      }
      if ((e.key === 'c' || e.key === 'C') && !typing && !e.ctrlKey && !e.metaKey) {
        var detail = document.getElementById('view-detail');
        if (detail && detail.classList.contains('active')) {
          var claim = document.getElementById('btn-claim');
          if (claim) claim.click();
        }
      }
    });
  }

  var channel = null;
  function startRealtime() {
    var client = sb();
    if (!client || channel) return;
    try {
      channel = client.channel('tickets-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, function () {
          if (window.applyTicketFilters) window.applyTicketFilters(true);
          if (dr().renderStats) dr().renderStats();
          var reports = document.getElementById('view-reports');
          if (reports && reports.classList.contains('active')) renderReports();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, function () {})
        .subscribe(function (status) {
          var el = document.getElementById('live-indicator');
          if (el) {
            el.classList.toggle('live-on', status === 'SUBSCRIBED');
            el.title = status === 'SUBSCRIBED' ? 'Live updates on' : 'Connecting…';
          }
        });
    } catch (e) { console.warn('Realtime unavailable', e); }
  }

  async function beatPresence() {
    var client = sb();
    var p = dr().getProfile && dr().getProfile();
    if (!client || !p || (p.role !== 'agent' && p.role !== 'admin')) return;
    try {
      await client.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', p.id);
    } catch (e) {}
  }

  function bindTheme() {
    var btn = document.getElementById('btn-theme');
    if (!btn) return;
    var saved = localStorage.getItem('dr_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'dark';
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('dr_theme', next);
      toast(next === 'light' ? 'Light mode' : 'Dark mode', 'info');
    });
  }

  function patchCustomerOpen() {
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (!window.DR) { if (n > 80) clearInterval(t); return; }
      clearInterval(t);
      var detail = document.getElementById('cust-ticket-detail');
      if (!detail) return;
      var mo = new MutationObserver(function () {
        var idEl = detail.querySelector('.ticket-id');
        if (!idEl) return;
        var num = idEl.textContent.trim();
        var statusBadge = detail.querySelector('.badge-resolved, .badge-closed');
        if (!statusBadge) {
          var host = document.getElementById('cust-satisfaction');
          if (host) { host.hidden = true; host.innerHTML = ''; }
          return;
        }
        var client = sb();
        if (!client) return;
        client.from('tickets').select('*').eq('ticket_number', num).maybeSingle().then(function (r) {
          if (r.data) renderSatisfaction(r.data);
        });
      });
      mo.observe(detail, { childList: true, subtree: true });
    }, 100);
  }

  function patchAgentDetail() {
    var detail = document.getElementById('ticket-detail');
    if (!detail) return;
    var mo = new MutationObserver(function () {
      var idEl = detail.querySelector('.ticket-id');
      if (!idEl) return;
      var num = idEl.textContent.trim();
      var all = (dr().getAllTickets && dr().getAllTickets()) || [];
      var t = all.filter(function (x) { return x.ticket_number === num; })[0];
      if (t) enhanceDetailSla(t);
      else if (sb()) {
        sb().from('tickets').select('*').eq('ticket_number', num).maybeSingle().then(function (r) {
          if (r.data) enhanceDetailSla(r.data);
        });
      }
      injectCannedUI();
      injectRelatedUI();
    });
    mo.observe(detail, { childList: true, subtree: true });
  }

  function patchListObserver() {
    var list = document.getElementById('ticket-list');
    if (!list) return;
    var mo = new MutationObserver(function () { enhanceListWithSla(); });
    mo.observe(list, { childList: true, subtree: true });
  }

  function injectNavReports() {
    var nav = document.querySelector('#portal-agent .nav');
    if (!nav || document.querySelector('[data-view="reports"]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-btn';
    btn.setAttribute('data-view', 'reports');
    btn.textContent = 'Reports';
    var admin = document.getElementById('nav-admin');
    if (admin) nav.insertBefore(btn, admin);
    else nav.appendChild(btn);
    btn.addEventListener('click', function () {
      document.querySelectorAll('#portal-agent .view').forEach(function (v) { v.classList.remove('active'); });
      document.querySelectorAll('#portal-agent .nav-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var rv = document.getElementById('view-reports');
      if (rv) rv.classList.add('active');
      var pt = document.getElementById('page-title');
      if (pt) pt.textContent = 'Reports';
      var ta = document.querySelector('.topbar-actions');
      if (ta) ta.style.display = 'none';
      var fh = document.getElementById('filter-hint');
      if (fh) fh.textContent = '';
      renderReports();
    });
  }

  function ensureReportsView() {
    if (document.getElementById('view-reports')) return;
    var main = document.querySelector('#portal-agent .main');
    if (!main) return;
    var sec = document.createElement('section');
    sec.id = 'view-reports';
    sec.className = 'view';
    sec.innerHTML = '<div id="reports-body"></div>';
    main.appendChild(sec);
  }

  function ensureSatHost() {
    var detail = document.getElementById('ctab-detail');
    if (!detail || document.getElementById('cust-satisfaction')) return;
    var host = document.createElement('div');
    host.id = 'cust-satisfaction';
    host.className = 'sat-box';
    host.hidden = true;
    var comments = detail.querySelector('.comments-section');
    if (comments) detail.insertBefore(host, comments);
    else detail.appendChild(host);
  }

  function ensureLiveIndicator() {
    var brand = document.querySelector('.mode-brand');
    if (!brand || document.getElementById('live-indicator')) return;
    var el = document.createElement('span');
    el.id = 'live-indicator';
    el.className = 'live-indicator';
    el.title = 'Live updates';
    brand.appendChild(el);
  }

  function ensureThemeBtn() {
    var info = document.querySelector('.user-info');
    if (!info || document.getElementById('btn-theme')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-ghost btn-sm';
    b.id = 'btn-theme';
    b.textContent = 'Theme';
    info.insertBefore(b, info.firstChild);
  }

  function boot() {
    ensureReportsView();
    injectNavReports();
    ensureSatHost();
    ensureLiveIndicator();
    ensureThemeBtn();
    injectAttachmentUI();
    injectCannedUI();
    bindKeys();
    bindTheme();
    patchListObserver();
    patchAgentDetail();
    patchCustomerOpen();
    startRealtime();
    beatPresence();
    setInterval(beatPresence, 60000);

    var cf = document.getElementById('customer-form');
    if (cf && !cf._drAttachHook) {
      cf._drAttachHook = true;
      cf.addEventListener('submit', function () {
        var att = document.getElementById('c-attachment');
        var desc = document.getElementById('c-description');
        if (att && desc && att.value.trim()) {
          desc.value = desc.value.trim() + '\n\nAttachment: ' + att.value.trim();
        }
      }, true);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (window.DR && document.getElementById('portal-agent')) {
        clearInterval(t);
        boot();
      }
      if (n > 80) clearInterval(t);
    }, 100);
  });
})();
