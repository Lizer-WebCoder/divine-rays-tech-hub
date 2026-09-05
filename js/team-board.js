/**
 * Divine Rays — team performance with charts
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

  async function buildTeamRows() {
    var tickets = (dr().getAllTickets && dr().getAllTickets()) || [];
    if (!tickets.length && dr().fetchTickets) {
      tickets = (await dr().fetchTickets({})) || [];
      if (dr().setAllTickets) dr().setAllTickets(tickets);
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
        profiles = r.data || [];
      }
    } catch (e) {}

    var me = dr().getProfile && dr().getProfile();
    var meId = me && me.id;
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
      var ids = Object.keys(byAgent);
      var names = {};
      if (dr().fetchProfileNames) names = await dr().fetchProfileNames(ids);
      ids.forEach(function (id) {
        var s = byAgent[id];
        rows.push({
          id: id,
          name: names[id] || 'Agent',
          role: 'agent',
          working: s.working,
          solved: s.solved
        });
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
    var label = total ? Math.round(pct * 100) + '%' : '—';
    var sub = total ? 'solved' : 'no data';
    return (
      '<svg class="donut" width="' + size + '" height="' + size + '" viewBox="0 0 100 100">' +
      '<circle class="donut-track" cx="50" cy="50" r="' + r + '" fill="none" stroke-width="10"/>' +
      '<circle class="donut-fill" cx="50" cy="50" r="' + r + '" fill="none" stroke-width="10"' +
      ' stroke-dasharray="' + dash.toFixed(2) + ' ' + gap.toFixed(2) + '"' +
      ' stroke-dashoffset="' + (c / 4).toFixed(2) + '" transform="rotate(-90 50 50)"/>' +
      '<text class="donut-pct" x="50" y="48" text-anchor="middle">' + label + '</text>' +
      '<text class="donut-sub" x="50" y="60" text-anchor="middle">' + sub + '</text>' +
      '</svg>'
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
      '</text>' +
      '</svg>'
    );
  }

  function barsHtml(rows) {
    if (!rows.length) return '';
    var max = Math.max.apply(
      null,
      rows.map(function (r) {
        return Math.max(r.solved + r.working, 1);
      })
    );
    return (
      '<div class="tower-chart">' +
      rows
        .map(function (r) {
          var total = r.solved + r.working;
          var hSolved = total ? Math.round((r.solved / max) * 100) : 0;
          var hWork = total ? Math.round((r.working / max) * 100) : 0;
          var short = (r.name || 'A').split(' ')[0];
          return (
            '<div class="tower-col" title="' +
            escapeHtml(r.name) +
            ': ' +
            r.working +
            ' working, ' +
            r.solved +
            ' solved">' +
            '<div class="tower-stack">' +
            '<div class="tower-seg working" style="height:' +
            hWork +
            '%"></div>' +
            '<div class="tower-seg solved" style="height:' +
            hSolved +
            '%"></div>' +
            '</div>' +
            '<span class="tower-name">' +
            escapeHtml(short) +
            '</span>' +
            '<span class="tower-n">' +
            total +
            '</span>' +
            '</div>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="tower-legend">' +
      '<span><i class="lg solved"></i> Solved</span>' +
      '<span><i class="lg working"></i> Working on</span>' +
      '</div>'
    );
  }

  function renderTeamBoard(targetId) {
    var box = document.getElementById(targetId || 'agent-perf-list');
    if (!box) return;
    box.classList.add('team-board');
    box.innerHTML = '<p class="team-loading">Loading team…</p>';

    buildTeamRows()
      .then(function (data) {
        var rows = data.rows;
        var meId = data.meId;

        if (!rows.length) {
          box.innerHTML =
            '<p class="team-empty">No tech support agents yet. When agents claim tickets, they will show up here.</p>';
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

        var html = '';
        html += '<div class="chart-row">';
        html +=
          '<div class="chart-panel">' +
          '<h4 class="chart-title">Team overall</h4>' +
          '<p class="chart-desc">Share of assigned tickets that are finished</p>' +
          '<div class="chart-donut-wrap">' +
          donutSvg(teamSolved, teamWorking, 130) +
          '<div class="chart-side-stats">' +
          '<div><strong>' +
          teamWorking +
          '</strong><span>Working on</span></div>' +
          '<div><strong>' +
          teamSolved +
          '</strong><span>Solved</span></div>' +
          '</div></div></div>';

        if (meRow) {
          html +=
            '<div class="chart-panel">' +
            '<h4 class="chart-title">Your performance</h4>' +
            '<p class="chart-desc">Your finished vs open tickets</p>' +
            '<div class="chart-donut-wrap">' +
            donutSvg(meRow.solved, meRow.working, 130) +
            '<div class="chart-side-stats">' +
            '<div><strong>' +
            meRow.working +
            '</strong><span>Working on</span></div>' +
            '<div><strong>' +
            meRow.solved +
            '</strong><span>Solved</span></div>' +
            '</div></div></div>';
        }

        html +=
          '<div class="chart-panel chart-panel-wide">' +
          '<h4 class="chart-title">Team comparison</h4>' +
          '<p class="chart-desc">Taller bars = more tickets handled</p>' +
          barsHtml(rows) +
          '</div>';

        html += '</div>';

        html += '<p class="team-help" style="margin-top:1.1rem">Each person</p>';
        html += '<div class="team-cards">';
        html += rows
          .map(function (r) {
            var isYou = meId && r.id === meId;
            var badge =
              (isYou ? '<span class="team-badge you">You</span>' : '') +
              (r.role === 'admin' ? '<span class="team-badge admin">Admin</span>' : '');
            return (
              '<div class="team-card' +
              (isYou ? ' is-you' : '') +
              '">' +
              '<div class="team-card-top">' +
              miniRing(r.solved, r.working) +
              '<div class="team-card-name">' +
              escapeHtml(r.name) +
              badge +
              '</div></div>' +
              '<div class="team-card-stats">' +
              '<div class="team-stat"><span class="team-stat-num">' +
              r.working +
              '</span><span class="team-stat-label">Working on</span></div>' +
              '<div class="team-stat"><span class="team-stat-num">' +
              r.solved +
              '</span><span class="team-stat-label">Solved</span></div>' +
              '</div></div>'
            );
          })
          .join('');
        html += '</div>';

        box.innerHTML = html;
      })
      .catch(function (e) {
        console.error(e);
        box.innerHTML = '<p class="team-empty">Could not load team stats.</p>';
      });
  }

  function enhanceDashboardHeading() {
    document.querySelectorAll('.stats-heading').forEach(function (h) {
      var t = (h.textContent || '').toLowerCase();
      if (t.indexOf('all agents') !== -1 || t.indexOf('team performance') !== -1) {
        h.textContent = 'Team performance';
      }
    });
  }

  function hookRenderStats() {
    if (!window.DR || !window.DR.renderStats || window.DR.renderStats.__teamPatched) return;
    var prev = window.DR.renderStats;
    var wrapped = function () {
      var r = prev.apply(this, arguments);
      setTimeout(function () {
        enhanceDashboardHeading();
        renderTeamBoard('agent-perf-list');
      }, 80);
      return r;
    };
    wrapped.__teamPatched = true;
    window.DR.renderStats = wrapped;
  }

  function boot() {
    enhanceDashboardHeading();
    hookRenderStats();
    setTimeout(function () {
      if (document.getElementById('agent-perf-list')) renderTeamBoard('agent-perf-list');
    }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 400);

  window.DR_TEAM = {
    render: renderTeamBoard,
    refresh: function () {
      renderTeamBoard('agent-perf-list');
    }
  };
})();
