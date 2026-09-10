/**
 * Divine Rays — team charts (Dashboard only)
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
  var _timer = null;

  function isDashboard() {
    var nav = document.querySelector('#portal-agent .nav-btn[data-view="dashboard"]');
    return !!(nav && nav.classList.contains('active'));
  }

  function teamSection() {
    var box = document.getElementById('agent-perf-list');
    if (!box) return null;
    return box.closest('.stats-section') || box.parentElement || box;
  }

  function hideTeamSection() {
    var sec = teamSection();
    if (sec) sec.style.display = 'none';
  }

  function showTeamSection() {
    var sec = teamSection();
    if (sec) sec.style.display = '';
  }

  async function buildTeamRows() {
    var tickets = [];
    try {
      var client = dr().sb && dr().sb();
      if (client) {
        var tr = await client.from('tickets').select('*');
        if (!tr.error && tr.data) tickets = tr.data;
      }
      if (!tickets.length) {
        tickets = (dr().getAllTickets && dr().getAllTickets()) || [];
      }
      if (!tickets.length && dr().fetchTickets) {
        tickets = (await dr().fetchTickets({})) || [];
        if (dr().setAllTickets) dr().setAllTickets(tickets);
      }
    } catch (e) {
      tickets = (dr().getAllTickets && dr().getAllTickets()) || [];
    }

    function isSolvedStatus(st) {
      st = String(st || '').trim().toLowerCase();
      return (
        st === 'resolved' ||
        st === 'closed' ||
        st === 'done' ||
        st === 'complete' ||
        st === 'completed' ||
        st === 'solved'
      );
    }

    var byAgent = {};
    tickets.forEach(function (t) {
      var aid = t.assignee_id || t.assigned_to;
      if (!aid) return;
      if (!byAgent[aid]) byAgent[aid] = { working: 0, solved: 0, csatSum: 0, csatN: 0 };
      if (isSolvedStatus(t.status)) byAgent[aid].solved++;
      else byAgent[aid].working++;
      var sc = parseInt(t.csat_score, 10);
      if (sc >= 1 && sc <= 5) {
        byAgent[aid].csatSum += sc;
        byAgent[aid].csatN++;
      }
    });

    var profiles = [];
    try {
      var client2 = dr().sb && dr().sb();
      if (client2) {
        var r = await client2
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
      if (!profiles.some(function (p) { return p.id === me.id; })) {
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
        var s = byAgent[p.id] || { working: 0, solved: 0, csatSum: 0, csatN: 0 };
        rows.push({
          id: p.id,
          name: p.full_name || p.username || 'Agent',
          role: p.role,
          working: s.working,
          solved: s.solved,
          csatAvg: s.csatN ? (s.csatSum / s.csatN) : null,
          csatN: s.csatN || 0
        });
      });
    } else if (me && (me.role === 'agent' || me.role === 'admin')) {
      rows.push({
        id: me.id,
        name: me.full_name || me.name || 'You',
        role: me.role,
        working: 0,
        solved: 0,
        csatAvg: null,
        csatN: 0
      });
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
    return (
      '<svg class="donut" width="' + size + '" height="' + size + '" viewBox="0 0 100 100">' +
      '<circle class="donut-track" cx="50" cy="50" r="' + r + '" fill="none" stroke-width="10"/>' +
      '<circle class="donut-fill" cx="50" cy="50" r="' + r + '" fill="none" stroke-width="10"' +
      ' stroke-dasharray="' + dash.toFixed(2) + ' ' + gap.toFixed(2) + '"' +
      ' stroke-dashoffset="' + (c / 4).toFixed(2) + '" transform="rotate(-90 50 50)"/>' +
      '<text class="donut-pct" x="50" y="48" text-anchor="middle">' +
      (total ? Math.round(pct * 100) + '%' : '0%') +
      '</text>' +
      '<text class="donut-sub" x="50" y="60" text-anchor="middle">' +
      (total ? 'solved' : 'no data') +
      '</text></svg>'
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
      '<circle class="donut-fill mini" cx="22" cy="22" r="' + r + '" fill="none" stroke-width="5"' +
      ' stroke-dasharray="' + dash.toFixed(2) + ' ' + gap.toFixed(2) + '"' +
      ' stroke-dashoffset="' + (c / 4).toFixed(2) + '" transform="rotate(-90 22 22)"/>' +
      '<text class="mini-ring-text" x="22" y="25" text-anchor="middle">' +
      (total ? Math.round(pct * 100) : 0) +
      '</text></svg>'
    );
  }

  function barsHtml(rows) {
    if (!rows.length) return '';
    var max = Math.max.apply(null, rows.map(function (r) {
      return Math.max(r.solved + r.working, 1);
    }));
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
          '<div class="tower-name">' + escapeHtml(short) + '</div>' +
          '<div class="tower-n">' + total + '</div></div>'
        );
      }).join('') +
      '</div>' +
      '<div class="tower-legend"><span><i class="lg solved"></i>Solved</span><span><i class="lg working"></i>Working on</span></div>'
    );
  }

  function hasCharts(box) {
    return !!(box && box.querySelector('.chart-row, .tower-chart, .donut-fill, .team-cards'));
  }

  async function renderTeamBoard() {
    var box = document.getElementById('agent-perf-list');
    if (!box) return;
    if (!isDashboard()) {
      hideTeamSection();
      return;
    }
    showTeamSection();
    if (_busy) return;

    var token = ++_token;
    _busy = true;
    try {
      var data = await buildTeamRows();
      if (token !== _token) return;
      if (!isDashboard()) {
        hideTeamSection();
        return;
      }

      var rows = data.rows;
      var meId = data.meId;
      if (!rows.length) {
        if (_lastHtml) {
          box.innerHTML = _lastHtml;
          return;
        }
        box.innerHTML = '<p class="team-empty">Team charts will appear once agents are loaded.</p>';
        return;
      }

      var teamWorking = 0;
      var teamSolved = 0;
      rows.forEach(function (r) {
        teamWorking += r.working;
        teamSolved += r.solved;
      });
      var meRow = rows.find(function (r) {
        return meId && r.id === meId;
      });

      var html = '<div class="chart-row">';
      html +=
        '<div class="chart-panel"><h4 class="chart-title">Team overall</h4>' +
        '<p class="chart-desc">Share of assigned tickets that are finished</p>' +
        '<div class="chart-donut-wrap">' +
        donutSvg(teamSolved, teamWorking, 130) +
        '<div class="chart-side-stats"><div><strong>' +
        teamWorking +
        '</strong><span>Working on</span></div><div><strong>' +
        teamSolved +
        '</strong><span>Solved</span></div></div></div></div>';

      if (meRow) {
        html +=
          '<div class="chart-panel"><h4 class="chart-title">Your performance</h4>' +
          '<p class="chart-desc">Your finished vs open tickets</p>' +
          '<div class="chart-donut-wrap">' +
          donutSvg(meRow.solved, meRow.working, 130) +
          '<div class="chart-side-stats"><div><strong>' +
          meRow.working +
          '</strong><span>Working on</span></div><div><strong>' +
          meRow.solved +
          '</strong><span>Solved</span></div>' +
          (meRow.csatAvg != null
            ? '<div><strong>' + meRow.csatAvg.toFixed(1) + '★</strong><span>CSAT</span></div>'
            : '') +
          '</div></div></div>';
      }
      html += '</div>';
      html +=
        '<div class="chart-panel full"><h4 class="chart-title">Team comparison</h4>' +
        '<p class="chart-desc">Taller bars = more tickets handled</p>' +
        barsHtml(rows) +
        '</div>';
      html += '<h4 class="chart-title" style="margin-top:1.25rem">Each person</h4>';
      html += '<div class="team-cards">';
      rows.forEach(function (r) {
        var isMe = meId && r.id === meId;
        var badges = '';
        if (isMe) badges += '<span class="team-badge you">You</span>';
        if (r.role === 'admin') badges += '<span class="team-badge admin">Admin</span>';
        html +=
          '<div class="team-card' + (isMe ? ' is-you' : '') + '">' +
          '<div class="team-card-top">' +
          miniRing(r.solved, r.working) +
          '<div class="team-card-name">' + escapeHtml(r.name) + badges + '</div>' +
          '</div>' +
          '<div class="team-card-stats">' +
          '<div class="team-stat"><span class="team-stat-num">' + r.working + '</span>' +
          '<span class="team-stat-label">Working on</span></div>' +
          '<div class="team-stat"><span class="team-stat-num">' + r.solved + '</span>' +
          '<span class="team-stat-label">Solved</span></div>' +
          '</div>' +
          (r.csatAvg != null
            ? '<div class="team-csat">Avg rating: <strong>' + r.csatAvg.toFixed(1) + ' ★</strong> (' + r.csatN + ')</div>'
            : '<div class="team-csat">No ratings yet</div>') +
          '</div>';
      });
      html += '</div>';

      if (token !== _token || !isDashboard()) return;
      box.classList.add('team-board');
      box.innerHTML = html;
      _lastHtml = html;
    } catch (e) {
      console.warn('[team-board]', e);
    } finally {
      _busy = false;
    }
  }

  function applyView() {
    if (isDashboard()) {
      showTeamSection();
      renderTeamBoard();
    } else {
      hideTeamSection();
    }
  }

  function boot() {
    var nav = document.querySelector('#portal-agent .nav');
    if (nav) {
      new MutationObserver(function () {
        applyView();
      }).observe(nav, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }

    var box = document.getElementById('agent-perf-list');
    if (box) {
      new MutationObserver(function () {
        if (_busy || !isDashboard()) return;
        if (!hasCharts(box)) {
          if (_timer) clearTimeout(_timer);
          _timer = setTimeout(renderTeamBoard, 150);
        }
      }).observe(box, { childList: true });
    }

    setTimeout(applyView, 800);
    setTimeout(applyView, 2000);
  }

  window.addEventListener('dr-status-saved', function () {
    setTimeout(renderTeamBoard, 400);
  });
  window.addEventListener('dr-csat-saved', function () {
    setTimeout(renderTeamBoard, 400);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 300);

  window.DR_TEAM = {
    render: renderTeamBoard,
    refresh: renderTeamBoard
  };
})();
