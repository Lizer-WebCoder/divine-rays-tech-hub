/**
 * Divine Rays — CSAT on agent cards + dashboard
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CSAT_DASH) return;
  window.__DR_CSAT_DASH = 1;

  var STYLE = [
    '#csat-dash-card{padding:1rem 1.15rem;border-radius:14px;border:1px solid rgba(124,106,240,.35);background:linear-gradient(145deg,rgba(124,106,240,.14),#1a1a24);min-width:140px}',
    '#csat-dash-card .stat-label{display:block;font-size:.78rem;color:#9898b0;margin-bottom:.35rem}',
    '#csat-dash-card .csat-big{font-size:1.75rem;font-weight:700;color:#c4b5fd;line-height:1.1}',
    '#csat-dash-card .csat-stars-row{letter-spacing:2px;color:#a78bfa;font-size:1.1rem;margin:.25rem 0}',
    '#csat-dash-card .csat-meta{font-size:.78rem;color:#9494ae}',
    '.team-stat.csat-stat .team-stat-num{color:#c4b5fd;font-size:1rem;letter-spacing:1px}',
    '.team-stat.csat-stat .team-stat-label{color:#a78bfa}',
    '.team-card .csat-inline{margin-top:.55rem;padding-top:.5rem;border-top:1px solid rgba(46,46,66,.8);display:flex;align-items:center;justify-content:space-between;gap:.5rem}',
    '.team-card .csat-inline .stars{color:#a78bfa;letter-spacing:1px;font-size:.95rem}',
    '.team-card .csat-inline .csat-avg{font-weight:700;color:#c4b5fd;font-size:.95rem}',
    '.team-card .csat-inline .csat-n{font-size:.75rem;color:#9494ae}',
    '#csat-agent-list{display:none!important}'
  ].join('');

  function css() {
    if (document.getElementById('csat-dash-css')) return;
    var s = document.createElement('style');
    s.id = 'csat-dash-css';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }

  function starsStr(n) {
    n = Math.round(Number(n) || 0);
    var s = '';
    for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆';
    return s;
  }

  function ensureCard() {
    css();
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

  var cache = { byId: {}, byName: {}, avg: 0, n: 0, ts: 0 };

  async function fetchCsat() {
    var client = sb();
    if (!client) return cache;
    if (Date.now() - cache.ts < 5000 && cache.n >= 0) return cache;
    try {
      var r = await client.from('tickets')
        .select('csat_score,assigned_to')
        .not('csat_score', 'is', null);
      if (r.error) return cache;
      var rows = r.data || [];
      var sum = 0;
      var byId = {};
      rows.forEach(function (t) {
        var sc = Number(t.csat_score) || 0;
        sum += sc;
        var aid = t.assigned_to;
        if (!aid) return;
        if (!byId[aid]) byId[aid] = { sum: 0, n: 0 };
        byId[aid].sum += sc;
        byId[aid].n++;
      });
      var names = {};
      var ids = Object.keys(byId);
      if (ids.length) {
        try {
          var pr = await client.from('profiles')
            .select('id,full_name,display_name,email,username')
            .in('id', ids);
          (pr.data || []).forEach(function (p) {
            names[p.id] = p.full_name || p.display_name || p.username || p.email || '';
          });
        } catch (e) {}
      }
      var byName = {};
      ids.forEach(function (id) {
        var av = byId[id].sum / byId[id].n;
        var entry = { avg: av, n: byId[id].n, id: id };
        byId[id] = entry;
        var nm = (names[id] || '').trim().toLowerCase();
        if (nm) byName[nm] = entry;
        var first = nm.split(/\s+/)[0];
        if (first) byName[first] = entry;
      });
      cache = {
        byId: byId,
        byName: byName,
        avg: rows.length ? sum / rows.length : 0,
        n: rows.length,
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
    cards.forEach(function (card) {
      if (card.querySelector('.csat-inline')) return;
      var nameEl = card.querySelector('.team-card-name');
      if (!nameEl) return;
      var raw = (nameEl.childNodes[0] && nameEl.childNodes[0].textContent) || nameEl.textContent || '';
      raw = raw.replace(/\s*(YOU|ADMIN|AGENT)\s*/gi, '').trim().toLowerCase();
      var entry = data.byName[raw] || data.byName[raw.split(/\s+/)[0]];
      if (!entry) {
        Object.keys(data.byName).forEach(function (k) {
          if (entry) return;
          if (raw.indexOf(k) !== -1 || k.indexOf(raw) !== -1) entry = data.byName[k];
        });
      }
      var stats = card.querySelector('.team-card-stats');
      var box = document.createElement('div');
      box.className = 'csat-inline';
      if (entry && entry.n) {
        box.innerHTML =
          '<span class="stars">' + starsStr(entry.avg) + '</span>' +
          '<span><span class="csat-avg">' + entry.avg.toFixed(1) + '</span> ' +
          '<span class="csat-n">(' + entry.n + ')</span></span>';
      } else {
        box.innerHTML = '<span class="stars">☆☆☆☆☆</span><span class="csat-n">No ratings</span>';
      }
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

  setInterval(tick, 2500);
  setTimeout(tick, 1000);
  setTimeout(tick, 3000);
  setTimeout(tick, 6000);
  window.DRCsatDash = { refresh: load };
})();
