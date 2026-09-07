/**
 * Divine Rays — team performance charts (calm, no fetch spam)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function dr() { return window.DR || {}; }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var _token = 0;
  var _busy = false;
  var _lastHtml = '';
  var _lastOkAt = 0;
  var _restoreTimer = null;
  var _lastRestoreAt = 0;

  async function buildTeamRows() {
    var tickets = [];
    try {
      tickets = (dr().getAllTickets && dr().getAllTickets()) || [];
      if (!tickets.length && dr().fetchTickets) {
        tickets = (await dr().fetchTickets({})) || [];
        if (dr().setAllTickets) dr().setAllTickets(tickets);
      }
    } catch (e) {
      tickets = (dr().getAllTickets && dr().getAllTickets()) || [];
    }

    var byAgent = {};
    tickets.forEach(function (t) {
      var aid = t.assignee_id || t.assigned_to;
      if (!aid) return;
      if (!byAgent[aid]) byAgent[aid] = { working: 0, solved: 0 };
      var st = t.status || '';
      if (st === 'Resolved' || st === 'Closed') byAgent[aid].solved++;
      else byAgent[aid].working++;
    });

    var profiles = [];
    try {
      var client = dr().sb && dr().sb();
      if (client) {
        var r = await client
          .from('profiles')
          .select('id,full_name,role,username')
          .in('role', ['agent', 'admin'])
          .order('full_name');
        if (!r.error) profiles = r.data || [];
      }
    } catch (e) {}

    var me = dr().getProfile && dr().getProfile();
    var meId = me && me.id;

    if (me && (me.role === 'agent' || me.role === 'admin')) {
      var found = profiles.some(function (p) { return p.id === me.id; });
      if (!found) {
        profiles.unshift({
          id: me.id,
          full_name: me.full_name || me.name || 'You',
          role: me.role,
          username: me.username
        });
      }
    }

    var rows = [];
    if (profiles.length) {
      profiles.forEach(function (p) {
        var s = byAgent[p.id] || { working: 0, solved: 0 };
        rows.push({
          id: p.id,
          name: p.full_name || p.username || 'Agent',
          role: p.role,
          working: s.working,
          solved: s.solved
        });
      });
    } else {
      Object.keys(byAgent).forEach(function (id) {
        var s = byAgent[id];
        rows.push({
          id: id,
          name: meId === id ? ((me && me.full_name) || 'You') : 'Agent',
          role: 'agent',
          working: s.working,
          solved: s.solved
        });
      });
      if (!rows.length && me && (me.role === 'agent' || me.role === 'admin')) {
        rows.push({
          id: me.id,
          name: me.full_name || me.name || 'You',
          role: me.role,
          working: 0,
          solved: 0
        });
      }
    }

    rows.sort(function (a, b) {
      return b.solved - a.solved || b.working - a.working;
    });
    return { rows: rows, meId: meId };
  }

  function donutSvg(solved, working, size) {
    size = size || 120;
    var total = solved + working;
    var pct = total ? solved / total : 0;
    var r = 42;
    var c = 2 * Math.PI * r;
    var dash = pct * c;
    var gap = c - dash;
    var label = total ? Math.round(pct * 100) + '%' : '0%';
    var sub = total ? 'solved' : 'no data';
    return (
      '<svg class="donut" width="' + size + '" height="' + size + '" viewBox="0 0 100 100">' +
      '<circle class="donut-track" cx="50" cy="50" r="' + r + '" fill="none" stroke-width="10"/>' +
      '<circle class="donut-fill" cx="50" cy="50" r="' + r + '" fill="none" stroke-width="10" stroke-dasharray="' +
      dash.toFixed(2) + ' ' + gap.toFixed(2) + '" stroke-dashoffset="' + (c / 4).toFixed(2) +
      '" transform="rotate(-90 50 50)"/>' +
      '<text class="donut-pct" x="50" y="48" text-anchor="middle">' + label + '</text>' +
      '<text class="donut-sub" x="50" y="60" text-anchor="middle">' + sub + '</text></svg>'
    );
  }

  function miniRing(solved, working) {
    var total = solved + working;
    var pct = total ? solved / total : 0;
    var r = 18;
    var c = 2 * Math.PI * r;
    var dash = pct * c;
    var gap = c - dash;
    return (
      '<svg class="mini-ring" width="48" height="48" viewBox="0 0 44 44">' +
      '<circle class="donut-track" cx="22" cy="22" r="' + r + '" fill="none" stroke-width="5"/>' +
      '<circle class="donut-fill mini" cx="22" cy="22" r="' + r + '" fill="none" stroke-width="5" stroke-dasharray="' +
      dash.toFixed(2) + ' ' + gap.toFixed(2) + '" stroke-dashoffset="' + (c / 4).toFixed(2) +
      '" transform="rotate(-90 22 22)"/>' +
      '<text class="mini-ring-text" x="22" y="25" text-anchor="middle">' +
      (total ? Math.round(pct * 100) : 0) + '</text></svg>'
    );
  }

  function barsHtml(rows) {
    if (!rows.length) return '';
    var max = Math.max.apply(null, rows.map(function (r) { return Math.max(r.solved + r.working, 1); }));
    return (
      '<div class="tower-chart">' +
      rows.map(function (r) {
        var total = r.solved + r.working;
        var hSolved = total ? Math.round((r.solved / max) * 100) : 0;
        var hWork = total ? Math.round((r.working / max) * 100) : 0;
        var short = (r.name || 'A').split(' ')[0];
        return (
          '<div class="tower-col" title="' + escapeHtml(r.name) + '">' +
          '<div class="tower-stack">' +
          '<div class="tower-seg working" style="height:' + hWork + '%"></div>' +
          '<div class="tower-seg solved" style="height:' + hSolved + '%"></div></div>' +
          '<div class="tower-label">' + escapeHtml(short) + '</div>' +
          '<div class="tower-nums">' + total + '</div></div>'
        );
      }).join('') +
      '</div>' +
      '<div class="tower-legend"><span class="leg solved"></span> Solved <span class="leg working"></span> Working on</div>'
    );
  }

  function hasCharts(box) {
    return !!(box && box.querySelector && box.querySelector('.chart-row, .tower-chart, .donut-fill, .person-grid'));
  }

  function needsCharts(box) {
    if (!box) return false;
    if (hasCharts(box)) return false;
    var t = (box.textContent || '').trim();
    if (t.indexOf('No claimed tickets') !== -1) return true;
    if (box.querySelector('table.perf-table')) return true;
    if (!t || t === 'Loading…' || t.indexOf('Loading team') !== -1) return true;
    if (t.indexOf('No tech support agents') !== -1) return true;
    return true;
  }

  async function renderTeamBoard(force) {
    var box = document.getElementById('agent-perf-list');
    if (!box) return;
    if (_busy && !force) return;
    if (!force && hasCharts(box) && Date.now() - _lastOkAt < 5000) return;

    var token = ++_token;
    _busy = true;

    try {
      var data = await buildTeamRows();
      if (token !== _token) return;
      var rows = data.rows;
      var meId = data.meId;

      if (!rows.length) {
        if (_lastHtml) { box.innerHTML = _lastHtml; return; }
        box.innerHTML = '<p class="team-empty">Team charts will appear once agent profiles load.</p>';
        return;
      }

      var teamWorking = 0, teamSolved = 0;
      rows.forEach(function (r) { teamWorking += r.working; teamSolved += r.solved; });
      var meRow = rows.find(function (r) { return meId && r.id === meId; });

      var html = '<div class="chart-row">';
      html += '<div class="chart-panel"><h4 class="chart-title">Team overall</h4>' +
        '<p class="chart-desc">Share of assigned tickets that are finished</p>' +
        '<div class="chart-donut-wrap">' + donutSvg(teamSolved, teamWorking, 130) +
        '<div class="chart-side-stats"><div><strong>' + teamWorking +
        '</strong><span>Working on</span></div><div><strong>' + teamSolved +
        '</strong><span>Solved</span></div></div></div></div>';

      if (meRow) {
        html += '<div class="chart-panel"><h4 class="chart-title">Your performance</h4>' +
          '<p class="chart-desc">Your finished vs open tickets</p>' +
          '<div class="chart-donut-wrap">' + donutSvg(meRow.solved, meRow.working, 130) +
          '<div class="chart-side-stats"><div><strong>' + meRow.working +
          '</strong><span>Working on</span></div><div><strong>' + meRow.solved +
          '</strong><span>Solved</span></div></div></div></div>';
      }
      html += '</div>';
      html += '<div class="chart-panel full"><h4 class="chart-title">Team comparison</h4>' +
        '<p class="chart-desc">Taller bars = more tickets handled</p>' + barsHtml(rows) + '</div>';
      html += '<h4 class="chart-title" style="margin-top:1.25rem">Each person</h4><div class="person-grid">';
      rows.forEach(function (r) {
        var isMe = meId && r.id === meId;
        html += '<div class="person-card' + (isMe ? ' me' : '') + '">' + miniRing(r.solved, r.working) +
          '<div class="person-meta"><div class="person-name">' + escapeHtml(r.name) +
          (isMe ? ' <span class="you-tag">you</span>' : '') +
          (r.role === 'admin' ? ' <span class="you-tag">admin</span>' : '') +
          '</div><div class="person-stats"><span>' + r.working +
          ' working</span><span>' + r.solved + ' solved</span></div></div></div>';
      });
      html += '</div>';

      if (token !== _token) return;
      box.classList.add('team-board');
      box.innerHTML = html;
      _lastHtml = html;
      _lastOkAt = Date.now();
    } catch (err) {
      console.warn('team board', err);
      if (_lastHtml && box) box.innerHTML = _lastHtml;
    } finally {
      if (token === _token) _busy = false;
    }
  }

  function isListView() {
    return !!document.querySelector(
      '#portal-agent .nav-btn[data-view="dashboard"].active, #portal-agent .nav-btn[data-view="my-tickets"].active, #portal-agent .nav-btn[data-view="unassigned"].active, #portal-agent .nav-btn[data-view="all-tickets"].active'
    );
  }

  function scheduleRestore(force) {
    if (_restoreTimer) clearTimeout(_restoreTimer);
    _restoreTimer = setTimeout(function () {
      _restoreTimer = null;
      if (!document.getElementById('agent-perf-list')) return;
      if (!isListView()) return;
      var box = document.getElementById('agent-perf-list');
      if (!force && !needsCharts(box)) return;
      if (!force && Date.now() - _lastRestoreAt < 800) return;
      _lastRestoreAt = Date.now();
      renderTeamBoard(!!force);
    }, force ? 80 : 250);
  }

  function hookRenderStats() {
    if (!window.DR || typeof window.DR.renderStats !== 'function') return;
    if (window.DR.renderStats.__teamPatched) return;
    var prev = window.DR.renderStats;
    var wrapped = function () {
      var result = prev.apply(this, arguments);
      Promise.resolve(result).catch(function () {}).then(function () { scheduleRestore(true); });
      scheduleRestore(true);
      return result;
    };
    wrapped.__teamPatched = true;
    window.DR.renderStats = wrapped;
  }

  function boot() {
    hookRenderStats();
    setTimeout(hookRenderStats, 2000);

    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn');
      if (!t) return;
      var view = t.getAttribute('data-view') || '';
      if (view === 'dashboard' || view === 'my-tickets' || view === 'unassigned' || view === 'all-tickets') {
        scheduleRestore(true);
      }
    }, true);

    function watch() {
      var box = document.getElementById('agent-perf-list');
      if (!box || box.__teamCalmWatch) return;
      box.__teamCalmWatch = true;
      new MutationObserver(function () {
        if (_busy) return;
        if (!isListView()) return;
        if (needsCharts(box)) scheduleRestore(false);
      }).observe(box, { childList: true, subtree: true });
    }

    watch();
    new MutationObserver(function () {
      hookRenderStats();
      watch();
    }).observe(document.body, { childList: true, subtree: true });

    setTimeout(function () { scheduleRestore(true); }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 300);

  window.DR_TEAM = {
    render: function () { renderTeamBoard(true); },
    refresh: function () { renderTeamBoard(true); }
  };
})();
