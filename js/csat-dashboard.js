/**
 * Divine Rays — CSAT on agent dashboard
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
    '#csat-agent-list{margin-top:.75rem;display:flex;flex-direction:column;gap:.4rem}',
    '#csat-agent-list .csat-agent-row{display:flex;justify-content:space-between;align-items:center;padding:.4rem .65rem;border-radius:8px;background:rgba(0,0,0,.2);border:1px solid #2e2e42;font-size:.85rem}',
    '#csat-agent-list .csat-agent-row .stars{color:#a78bfa;letter-spacing:1px}'
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

    var team = document.getElementById('agent-perf-list');
    if (team && !document.getElementById('csat-agent-list')) {
      var wrap = document.createElement('div');
      wrap.id = 'csat-agent-list';
      wrap.innerHTML = '<div class="kb-sub" style="margin-bottom:.35rem">CSAT by agent (from assigned tickets)</div>';
      team.parentNode.insertBefore(wrap, team.nextSibling);
    }
    return card;
  }

  async function load() {
    ensureCard();
    var client = sb();
    if (!client) return;

    try {
      var r = await client.from('tickets')
        .select('csat_score,csat_comment,csat_at,assigned_to,status')
        .not('csat_score', 'is', null);
      var rows = r.data || [];
      if (r.error) {
        var el = document.getElementById('csat-avg-meta');
        if (el) el.textContent = 'Run csat.sql in Supabase';
        return;
      }

      var sum = 0;
      rows.forEach(function (t) { sum += Number(t.csat_score) || 0; });
      var avg = rows.length ? (sum / rows.length) : 0;
      var num = document.getElementById('csat-avg-num');
      var st = document.getElementById('csat-avg-stars');
      var meta = document.getElementById('csat-avg-meta');
      if (num) num.textContent = rows.length ? avg.toFixed(1) : '—';
      if (st) st.textContent = rows.length ? starsStr(avg) : '☆☆☆☆☆';
      if (meta) meta.textContent = rows.length ? (rows.length + ' rating' + (rows.length === 1 ? '' : 's')) : 'No ratings yet';

      var byAgent = {};
      rows.forEach(function (t) {
        var aid = t.assigned_to;
        if (!aid) return;
        if (!byAgent[aid]) byAgent[aid] = { sum: 0, n: 0 };
        byAgent[aid].sum += Number(t.csat_score) || 0;
        byAgent[aid].n++;
      });
      var ids = Object.keys(byAgent);
      var list = document.getElementById('csat-agent-list');
      if (!list) return;
      if (!ids.length) {
        list.innerHTML = '<div class="kb-sub">CSAT by agent — assign tickets then get ratings to see this</div>';
        return;
      }

      var names = {};
      try {
        var pr = await client.from('profiles').select('id,full_name,display_name,email').in('id', ids);
        (pr.data || []).forEach(function (p) {
          names[p.id] = p.full_name || p.display_name || p.email || p.id.slice(0, 8);
        });
      } catch (e) {}

      var html = '<div class="kb-sub" style="margin-bottom:.35rem">CSAT by agent</div>';
      ids.sort(function (a, b) {
        return (byAgent[b].sum / byAgent[b].n) - (byAgent[a].sum / byAgent[a].n);
      });
      ids.forEach(function (id) {
        var a = byAgent[id];
        var av = a.sum / a.n;
        html += '<div class="csat-agent-row"><span>' + (names[id] || id.slice(0, 8)) +
          '</span><span class="stars">' + starsStr(av) + ' ' + av.toFixed(1) +
          ' <span class="kb-sub">(' + a.n + ')</span></span></div>';
      });
      list.innerHTML = html;
    } catch (e) {
      console.warn('[csat-dash]', e);
    }
  }

  function tick() {
    if (document.getElementById('view-dashboard')) load();
  }

  setInterval(tick, 8000);
  setTimeout(tick, 1200);
  setTimeout(tick, 3500);
  window.DRCsatDash = { refresh: load };
})();
