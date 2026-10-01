/**
 * Divine Rays — CSAT on agent cards + dashboard (accurate attribution)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CSAT_DASH_V2) return;
  window.__DR_CSAT_DASH_V2 = 1;

  function sb() {
    try {
      if (window.DR && typeof DR.sb === 'function') return DR.sb();
      if (window.DR && DR.supabase) return DR.supabase;
      if (window.__drSb) return window.__drSb;
      if (window.sb) return window.sb;
    } catch (e) {}
    return null;
  }

  var CSS = [
    '#csat-dash-card .csat-big{font-size:1.75rem;font-weight:700;color:#c4b5fd;line-height:1.1}',
    '#csat-dash-card .csat-stars-row{color:#a78bfa;letter-spacing:2px;font-size:1.05rem;margin-top:.25rem}',
    '#csat-dash-card .csat-meta{font-size:.78rem;color:#9494ae;margin-top:.2rem}',
    'html[data-theme="light"] #csat-dash-card .csat-big,html[data-theme="light"] #csat-dash-card .csat-stars-row{color:#7c6af0}',
    '.team-card .csat-inline{margin-top:.55rem;padding-top:.5rem;border-top:1px solid rgba(46,46,66,.8);display:flex;align-items:center;justify-content:space-between;gap:.5rem}',
    '.team-card .csat-inline .stars{color:#a78bfa;letter-spacing:1px;font-size:.95rem}',
    '.team-card .csat-inline .csat-avg{font-weight:700;color:#c4b5fd;font-size:.95rem}',
    '.team-card .csat-inline .csat-n{font-size:.75rem;color:#9494ae}',
    'html[data-theme="light"] .team-card .csat-inline{border-top-color:rgba(0,0,0,.08)}',
    'html[data-theme="light"] .team-card .csat-inline .stars,html[data-theme="light"] .team-card .csat-inline .csat-avg{color:#7c6af0}'
  ].join('');

  function injectCss() {
    var el = document.getElementById('dr-csat-dash-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-csat-dash-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function starsStr(avg) {
    var n = Math.round(Number(avg) || 0);
    if (n < 0) n = 0;
    if (n > 5) n = 5;
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function ensureCard() {
    injectCss();
    var card = document.getElementById('csat-dash-card');
    if (card) return card;
    var dash = document.getElementById('view-dashboard');
    if (!dash) return null;
    var meSection = null;
    dash.querySelectorAll('.stats-section').forEach(function (sec) {
      var h = sec.querySelector('.stats-heading');
      if (h && /performance|my /i.test(h.textContent || '')) meSection = sec;
    });
    var stats = (meSection && meSection.querySelector('.stats')) || dash.querySelector('.stats');
    if (!stats) return null;
    card = document.createElement('div');
    card.id = 'csat-dash-card';
    card.className = 'stat-card';
    card.innerHTML =
      '<span class="stat-label">CSAT average</span>' +
      '<div class="csat-big" id="csat-avg-num">—</div>' +
      '<div class="csat-stars-row" id="csat-avg-stars">☆☆☆☆☆</div>' +
      '<div class="csat-meta" id="csat-avg-meta">No ratings yet</div>';
    stats.appendChild(card);
    return card;
  }

  var cache = { byId: {}, byName: {}, avg: 0, n: 0, unassigned: null, ts: 0 };

  function agentIdOf(t) {
    return t.assigned_to || t.assignee_id || t.claimed_by || t.agent_id || null;
  }

  async function fetchCsat() {
    var client = sb();
    if (!client) return cache;
    if (Date.now() - cache.ts < 12000 && cache.n >= 0) return cache;
    try {
      var r = await client.from('tickets')
        .select('csat_score,assigned_to,assignee_id,claimed_by')
        .not('csat_score', 'is', null);
      if (r.error) {
        r = await client.from('tickets')
          .select('csat_score,assigned_to')
          .not('csat_score', 'is', null);
      }
      if (r.error) return cache;
      var rows = r.data || [];
      var sum = 0;
      var byId = {};
      var unSum = 0, unN = 0;
      rows.forEach(function (t) {
        var sc = Number(t.csat_score) || 0;
        sum += sc;
        var aid = agentIdOf(t);
        if (!aid) {
          unSum += sc;
          unN++;
          return;
        }
        if (!byId[aid]) byId[aid] = { sum: 0, n: 0 };
        byId[aid].sum += sc;
        byId[aid].n++;
      });

      var names = {};
      var ids = Object.keys(byId);
      if (ids.length) {
        try {
          var pr = await client.from('profiles')
            .select('id,full_name,username,email')
            .in('id', ids);
          (pr.data || []).forEach(function (p) {
            names[p.id] = p.full_name || p.display_name || p.username || p.email || '';
          });
        } catch (e) {}
      }

      var me = null;
      try {
        if (window.DR && DR.getProfile) me = DR.getProfile();
        else if (window.__drProfile) me = window.__drProfile;
      } catch (e) {}

      var byName = {};
      Object.keys(byId).forEach(function (id) {
        var e = byId[id];
        e.avg = e.n ? e.sum / e.n : 0;
        var nm = (names[id] || '').trim().toLowerCase();
        if (nm) byName[nm] = e;
        if (nm) byName[nm.split(/\s+/)[0]] = e;
      });

      cache = {
        byId: byId,
        byName: byName,
        avg: rows.length ? sum / rows.length : 0,
        n: rows.length,
        unassigned: unN ? { avg: unSum / unN, n: unN } : null,
        meId: me && me.id,
        ts: Date.now()
      };
    } catch (e) {
      console.warn('[csat-dash]', e);
    }
    return cache;
  }

  function injectIntoTeamCards(data) {
    var cards = document.querySelectorAll('.team-card');
    if (!cards.length) return;
    var onlyOne = cards.length === 1;

    cards.forEach(function (card) {
      var nameEl = card.querySelector('.team-card-name');
      if (!nameEl) return;
      var raw = '';
      for (var i = 0; i < nameEl.childNodes.length; i++) {
        if (nameEl.childNodes[i].nodeType === 3) {
          raw += nameEl.childNodes[i].textContent;
        }
      }
      if (!raw.trim()) raw = nameEl.textContent || '';
      raw = raw.replace(/\s*(YOU|ADMIN|AGENT)\s*/gi, '').trim().toLowerCase();

      var entry = data.byName[raw] || data.byName[raw.split(/\s+/)[0]] || null;
      if (!entry) {
        Object.keys(data.byName).forEach(function (k) {
          if (entry) return;
          if (raw && (raw.indexOf(k) !== -1 || k.indexOf(raw) !== -1)) entry = data.byName[k];
        });
      }

      var isYou = card.classList.contains('is-you');
      if (!entry && isYou && data.meId && data.byId[data.meId]) {
        entry = data.byId[data.meId];
      }

      if (!entry && onlyOne && data.n > 0) {
        entry = { avg: data.avg, n: data.n };
      }

      if (!entry && isYou && data.unassigned && data.unassigned.n && Object.keys(data.byId).length === 0) {
        entry = data.unassigned;
      }

      var nextHtml;
      if (entry && entry.n) {
        nextHtml =
          '<span class="stars">' + starsStr(entry.avg) + '</span>' +
          '<span><span class="csat-avg">' + entry.avg.toFixed(1) + '</span> ' +
          '<span class="csat-n">(' + entry.n + ')</span></span>';
      } else {
        nextHtml = '<span class="stars">☆☆☆☆☆</span><span class="csat-n">No ratings</span>';
      }

      var box = card.querySelector('.csat-inline');
      if (box) {
        if (box.getAttribute('data-sig') === nextHtml) return;
        box.setAttribute('data-sig', nextHtml);
        box.innerHTML = nextHtml;
        return;
      }

      box = document.createElement('div');
      box.className = 'csat-inline';
      box.setAttribute('data-sig', nextHtml);
      box.innerHTML = nextHtml;
      var stats = card.querySelector('.team-card-stats');
      if (stats) stats.parentNode.appendChild(box);
      else card.appendChild(box);
    });
  }

  async function load() {
    ensureCard();
    var data = await fetchCsat();
    var num = document.getElementById('csat-avg-num');
    var st = document.getElementById('csat-avg-stars');
    var meta = document.getElementById('csat-avg-meta');
    if (num) num.textContent = data.n ? data.avg.toFixed(1) : '—';
    if (st) st.textContent = data.n ? starsStr(data.avg) : '☆☆☆☆☆';
    if (meta) meta.textContent = data.n ? (data.n + ' rating' + (data.n === 1 ? '' : 's')) : 'No ratings yet';
    injectIntoTeamCards(data);
  }

  function tick() {
    if (document.getElementById('view-dashboard')) load();
  }

  setInterval(tick, 15000);
  setTimeout(tick, 1200);
  setTimeout(tick, 6000);
  window.DRCsatDash = { refresh: load };
})();
