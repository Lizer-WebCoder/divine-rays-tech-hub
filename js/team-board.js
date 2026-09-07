/**
 * Divine Rays — team performance charts (survives nav + async renderStats)
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

  var _renderToken = 0;
  var _rendering = false;

  async function buildTeamRows() {
    var tickets = (dr().getAllTickets && dr().getAllTickets()) || [];
    if (!tickets.length && dr().fetchTickets) {
      try {
        tickets = (await dr().fetchTickets({})) || [];
        if (dr().setAllTickets) dr().setAllTickets(tickets);
      } catch (e) {}
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
      Object.keys(byAgent).forEach(function (id) {
        var s = byAgent[id];
        rows.push({
          id: id,
          name: 'Agent',
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
    var label = total ? Math.round(pct * 100) + '%' : '0%';
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
      '</text></svg>'
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
            '%"></div></div>' +
            '<div class="tower-label">' +
            escapeHtml(short) +
            '</div>' +
            '<div class="tower-nums">' +
            total +
            '</div></div>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="tower-legend"><span class="leg solved"></span> Solved <span class="leg working"></span> Working on</div>'
    );
  }

  function hasCharts(box) {
    return !!(box && box.querySelector && box.querySelector('.chart-row, .tower-chart, .donut-fill, .person-grid'));
  }

  function isPlainEmptyMessage(box) {
    if (!box) return false;
    var t = (box.textContent || '').trim();
    return (
      t.indexOf('No claimed tickets') !== -1 ||
      (t.indexOf('Loading team') === -1 && !hasCharts(box) && box.querySelector('table.perf-table') != null)
    );
  }

  async function renderTeamBoard(targetId) {
    var box = document.getElementById(targetId || 'agent-perf-list');
    if (!box) return;
    var token = ++_renderToken;
    _rendering = true;
    box.classList.add('team-board');
    box.setAttribute('data-team-charts', '1');

    try {
      var data = await buildTeamRows();
      if (token !== _renderToken) return;
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
      html += '</div>';

      html +=
        '<div class="chart-panel full">' +
        '<h4 class="chart-title">Team comparison</h4>' +
        '<p class="chart-desc">Taller bars = more tickets handled</p>' +
        barsHtml(rows) +
        '</div>';

      html += '<h4 class="chart-title" style="margin-top:1.25rem">Each person</h4>';
      html += '<div class="person-grid">';
      rows.forEach(function (r) {
        var isMe = meId && r.id === meId;
        html +=
          '<div class="person-card' +
          (isMe ? ' me' : '') +
          '">' +
          miniRing(r.solved, r.working) +
          '<div class="person-meta">' +
          '<div class="person-name">' +
          escapeHtml(r.name) +
          (isMe ? ' <span class="you-tag">you</span>' : '') +
          (r.role === 'admin' ? ' <span class="you-tag">admin</span>' : '') +
          '</div>' +
          '<div class="person-stats"><span>' +
          r.working +
          ' working</span><span>' +
          r.solved +
          ' solved</span></div></div></div>';
      });
      html += '</div>';

      if (token !== _renderToken) return;
      box.innerHTML = html;
      box.setAttribute('data-team-charts', '1');
    } catch (err) {
      console.warn('team board', err);
      if (token === _renderToken) {
        box.innerHTML = '<p class="team-empty">Could not load team performance.</p>';
      }
    } finally {
      if (token === _renderToken) _rendering = false;
    }
  }

  function isDashboardVisible() {
    var dash = document.getElementById('view-dashboard');
    if (dash && dash.classList.contains('active')) return true;
    var nav = document.querySelector('#portal-agent .nav-btn[data-view="dashboard"]');
    if (nav && nav.classList.contains('active')) return true;
    var any = document.querySelector(
      '#portal-agent .nav-btn[data-view="my-tickets"].active, #portal-agent .nav-btn[data-view="unassigned"].active, #portal-agent .nav-btn[data-view="all-tickets"].active, #portal-agent .nav-btn[data-view="dashboard"].active'
    );
    return !!any && !!document.getElementById('agent-perf-list');
  }

  function scheduleChartRestore() {
    [0, 50, 150, 350, 700, 1200].forEach(function (ms) {
      setTimeout(function () {
        if (!document.getElementById('agent-perf-list')) return;
        if (!isDashboardVisible()) return;
        var box = document.getElementById('agent-perf-list');
        if (hasCharts(box) && !isPlainEmptyMessage(box)) return;
        renderTeamBoard('agent-perf-list');
      }, ms);
    });
  }

  function hookRenderStats() {
    if (!window.DR || typeof window.DR.renderStats !== 'function') return false;
    var current = window.DR.renderStats;
    if (current.__teamPatched) return true;

    var prev = current;
    var wrapped = function () {
      var result = prev.apply(this, arguments);
      Promise.resolve(result)
        .catch(function () {})
        .then(function () {
          scheduleChartRestore();
        });
      scheduleChartRestore();
      return result;
    };
    wrapped.__teamPatched = true;
    window.DR.renderStats = wrapped;
    return true;
  }

  function keepHookAlive() {
    hookRenderStats();
  }

  function observePerfBox() {
    if (document.__teamBoxObs) return;
    document.__teamBoxObs = true;

    function watchBox(box) {
      if (!box || box.__teamWatched) return;
      box.__teamWatched = true;
      new MutationObserver(function () {
        if (_rendering) return;
        if (!isDashboardVisible()) return;
        if (hasCharts(box) && !isPlainEmptyMessage(box)) return;
        scheduleChartRestore();
      }).observe(box, { childList: true, characterData: true, subtree: true });
    }

    var existing = document.getElementById('agent-perf-list');
    if (existing) watchBox(existing);

    new MutationObserver(function () {
      keepHookAlive();
      var box = document.getElementById('agent-perf-list');
      if (box) watchBox(box);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function bindNav() {
    if (document.__teamNavBound) return;
    document.__teamNavBound = true;
    document.addEventListener(
      'click',
      function (e) {
        var t = e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn');
        if (!t) return;
        var view = t.getAttribute('data-view') || '';
        if (
          view === 'dashboard' ||
          view === 'my-tickets' ||
          view === 'unassigned' ||
          view === 'all-tickets'
        ) {
          scheduleChartRestore();
        }
      },
      true
    );
  }

  function boot() {
    keepHookAlive();
    bindNav();
    observePerfBox();
    scheduleChartRestore();
    setTimeout(keepHookAlive, 1500);
    setTimeout(keepHookAlive, 4000);
    setTimeout(scheduleChartRestore, 1500);
    setTimeout(scheduleChartRestore, 4000);
    setInterval(function () {
      keepHookAlive();
      if (!isDashboardVisible()) return;
      var box = document.getElementById('agent-perf-list');
      if (!box) return;
      if (!hasCharts(box) || isPlainEmptyMessage(box)) {
        renderTeamBoard('agent-perf-list');
      }
    }, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 300);

  window.DR_TEAM = {
    render: renderTeamBoard,
    refresh: function () {
      renderTeamBoard('agent-perf-list');
    }
  };
})();
