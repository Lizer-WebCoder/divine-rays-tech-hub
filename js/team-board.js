/**
 * Divine Rays — simple team performance
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

        box.innerHTML =
          '<p class="team-help">Who is handling tickets right now, and how many they have finished.</p>' +
          '<div class="team-cards">' +
          rows
            .map(function (r) {
              var isYou = meId && r.id === meId;
              var badge =
                (isYou ? '<span class="team-badge you">You</span>' : '') +
                (r.role === 'admin' ? '<span class="team-badge admin">Admin</span>' : '');
              return (
                '<div class="team-card' + (isYou ? ' is-you' : '') + '">' +
                '<div class="team-card-name">' +
                escapeHtml(r.name) +
                badge +
                '</div>' +
                '<div class="team-card-stats">' +
                '<div class="team-stat">' +
                '<span class="team-stat-num">' +
                r.working +
                '</span>' +
                '<span class="team-stat-label">Working on</span>' +
                '</div>' +
                '<div class="team-stat">' +
                '<span class="team-stat-num">' +
                r.solved +
                '</span>' +
                '<span class="team-stat-label">Solved</span>' +
                '</div>' +
                '</div>' +
                '</div>'
              );
            })
            .join('') +
          '</div>';
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
