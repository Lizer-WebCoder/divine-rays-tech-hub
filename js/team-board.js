/**
 * Divine Rays — team charts (Dashboard only)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function dr() { return window.DR || {}; }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
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
        var r = await client2.from('profiles').select('id,full_name,name,role');
        if (!r.error && r.data) profiles = r.data;
      }
    } catch (e) {}

    var me = (dr().getProfile && dr().getProfile()) || null;
    var meId = me && me.id;
    var rows = [];
    var seen = {};

    profiles.forEach(function (p) {
      if (!p || !p.id) return;
      if (p.role !== 'agent' && p.role !== 'admin') return;
      seen[p.id] = true;
      var s = byAgent[p.id] || { working: 0, solved: 0, csatSum: 0, csatN: 0 };
      rows.push({
        id: p.id,
        name: p.full_name || p.name || 'Agent',
        role: p.role,
        working: s.working,
        solved: s.solved,
        csatAvg: s.csatN ? s.csatSum / s.csatN : null,
        csatN: s.csatN
      });
    });

    Object.keys(byAgent).forEach(function (aid) {
      if (seen[aid]) return;
      var s = byAgent[aid];
      rows.push({
        id: aid,
        name: 'Agent',
        role: 'agent',
        working: s.working,
        solved: s.solved,
        csatAvg: s.csatN ? s.csatSum / s.csatN : null,
        csatN: s.csatN
      });
    });

    rows.sort(function (a, b) {
      return b.solved - a.solved || b.working - a.working;
    });

    return { rows: rows, meId: meId };
  }

  function donutSvg(solved, working, size) {
    size = size || 120;
    var total = solved + working;
    var pct = total ? solved / total : 0;
    var r = size * 0.38;
    var c = 2 * Math.PI * r;
    var dash = (pct * c).toFixed(1);
    var gap = (c - pct * c).toFixed(1);
    return (
      '<svg class="donut" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 ' +
      size +
      ' ' +
      size +
      '">' +
      '<circle cx="' +
      size / 2 +
      '" cy="' +
      size / 2 +
      '" r="' +
      r +
      '" fill="none" stroke="rgba(139,124,247,.2)" stroke-width="12"/>' +
      '<circle cx="' +
      size / 2 +
      '" cy="' +
      size / 2 +
      '" r="' +
      r +
      '" fill="none" stroke="#7c6af0" stroke-width="12" stroke-dasharray="' +
      dash +
      ' ' +
      gap +
      '" stroke-linecap="round" transform="rotate(-90 ' +
      size / 2 +
      ' ' +
      size / 2 +
      ')"/>' +
      '<text class="donut-center-text" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" font-weight="700" fill="#eeeef6">' +
      (total ? Math.round(pct * 100) + '%' : '—') +
      '</text></svg>'
    );
  }

  function miniRing(solved, working) {
    var total = solved + working;
    var pct = total ? solved / total : 0;
    var r = 16;
    var c = 2 * Math.PI * r;
    var dash = (pct * c).toFixed(1);
    var gap = (c - pct * c).toFixed(1);
    return (
      '<svg width="40" height="40" viewBox="0 0 40 40">' +
      '<circle cx="20" cy="20" r="' +
      r +
      '" fill="none" stroke="rgba(139,124,247,.25)" stroke-width="4"/>' +
      '<circle cx="20" cy="20" r="' +
      r +
      '" fill="none" stroke="#7c6af0" stroke-width="4" stroke-dasharray="' +
      dash +
      ' ' +
      gap +
      '" transform="rotate(-90 20 20)"/>' +
      '<text class="mini-ring-text" x="20" y="21" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="700" fill="#eeeef6">' +
      (total || 0) +
      '</text></svg>'
    );
  }

  function barsHtml(rows) {
    var max = 1;
    rows.forEach(function (r) {
      max = Math.max(max, r.solved + r.working, 1);
    });
    var html = '<div class="tower-chart">';
    rows.forEach(function (r) {
      var total = r.solved + r.working;
      var hSolved = total ? Math.round((r.solved / max) * 100) : 0;
      var hWorking = total ? Math.round((r.working / max) * 100) : 0;
      html +=
        '<div class="tower-col">' +
        '<div class="tower-stack">' +
        '<div class="tower-seg solved" style="height:' +
        hSolved +
        '%"></div>' +
        '<div class="tower-seg working" style="height:' +
        hWorking +
        '%"></div></div>' +
        '<div class="tower-name">' +
        escapeHtml(r.name.split(' ')[0] || r.name) +
        '</div>' +
        '<div class="tower-n">' +
        total +
        '</div></div>';
    });
    html += '</div>';
    html +=
      '<div class="tower-legend"><span><i class="lg solved"></i>Solved</span>' +
      '<span><i class="lg working"></i>Working on</span></div>';
    return html;
  }

  function hasCharts(box) {
    return !!(box && box.querySelector('.chart-panel, .tower-chart, .team-card'));
  }

  async function renderTeamBoard() {
    if (_busy) return;
    if (!isDashboard()) {
      hideTeamSection();
      return;
    }
    var box = document.getElementById('agent-perf-list');
    if (!box) return;
    showTeamSection();
    _busy = true;
    var token = ++_token;
    try {
      var data = await buildTeamRows();
      if (token !== _token) return;
      var rows = data.rows || [];
      var meId = data.meId;
      if (!rows.length) {
        box.innerHTML = '<p class="team-empty">No agent data yet.</p>';
        box.classList.add('team-board');
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
