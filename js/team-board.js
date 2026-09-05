/**
 * Divine Rays — team performance board (all agents)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function dr() { return window.DR || {}; }

  async function buildTeamRows() {
    var tickets = (dr().getAllTickets && dr().getAllTickets()) || [];
    if (!tickets.length && dr().fetchTickets) {
      tickets = await dr().fetchTickets({}) || [];
      if (dr().setAllTickets) dr().setAllTickets(tickets);
    }

    var byAgent = {};
    tickets.forEach(function (t) {
      var aid = t.assignee_id;
      if (!aid) return;
      if (!byAgent[aid]) byAgent[aid] = { claimed: 0, resolved: 0, open: 0, waiting: 0, critical: 0 };
      var a = byAgent[aid];
      var st = t.status || '';
      if (st === 'Resolved' || st === 'Closed') a.resolved++;
      else {
        a.claimed++;
        a.open++;
        if (st === 'Waiting') a.waiting++;
        if (t.priority === 'Critical') a.critical++;
      }
    });

    var profiles = [];
    try {
      var sb = dr().sb && dr().sb();
      if (sb) {
        var r = await sb.from('profiles').select('id,full_name,role,username').in('role', ['agent', 'admin']).order('full_name');
        profiles = r.data || [];
      }
    } catch (e) {}

    var me = dr().getProfile && dr().getProfile();
    var meId = me && me.id;
    var rows = [];

    if (profiles.length) {
      profiles.forEach(function (p) {
        var s = byAgent[p.id] || { claimed: 0, resolved: 0, open: 0, waiting: 0, critical: 0 };
        rows.push({
          id: p.id,
          name: p.full_name || p.username || 'Agent',
          role: p.role,
          claimed: s.claimed,
          resolved: s.resolved,
          open: s.open,
          waiting: s.waiting,
          critical: s.critical,
          total: s.claimed + s.resolved
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
          claimed: s.claimed,
          resolved: s.resolved,
          open: s.open,
          waiting: s.waiting,
          critical: s.critical,
          total: s.claimed + s.resolved
        });
      });
    }

    rows.sort(function (a, b) {
      return (b.resolved * 2 + b.claimed) - (a.resolved * 2 + a.claimed);
    });
    return { rows: rows, meId: meId };
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderTeamBoard(targetId) {
    var box = document.getElementById(targetId || 'agent-perf-list');
    if (!box) return;
    box.classList.add('team-board');
    box.innerHTML = '<p class="empty-state" style="padding:1rem">Loading team…</p>';
    buildTeamRows().then(function (data) {
      var rows = data.rows;
      var meId = data.meId;
      if (!rows.length) {
        box.innerHTML = '<p class="empty-state" style="padding:1rem">No agents found yet.</p>';
        return;
      }
      box.innerHTML =
        '<table class="perf-table"><thead><tr>' +
        '<th>Agent</th><th>Active</th><th>Resolved</th><th>Waiting</th><th>Critical</th><th>Total</th>' +
        '</tr></thead><tbody>' +
        rows.map(function (r) {
          var mine = meId && r.id === meId ? ' class="mine"' : '';
          var you = mine ? ' <span class="you-tag">you</span>' : '';
          var role = r.role === 'admin' ? ' <span class="you-tag">admin</span>' : '';
          return '<tr' + mine + '>' +
            '<td>' + escapeHtml(r.name) + you + role + '</td>' +
            '<td>' + r.claimed + '</td>' +
            '<td>' + r.resolved + '</td>' +
            '<td>' + r.waiting + '</td>' +
            '<td>' + r.critical + '</td>' +
            '<td>' + r.total + '</td>' +
            '</tr>';
        }).join('') +
        '</tbody></table>';
    }).catch(function (e) {
      console.error(e);
      box.innerHTML = '<p class="empty-state" style="padding:1rem">Could not load team stats.</p>';
    });
  }

  function enhanceDashboardHeading() {
    document.querySelectorAll('.stats-heading').forEach(function (h) {
      if ((h.textContent || '').toLowerCase().indexOf('all agents') !== -1) {
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

  window.DR_TEAM = { render: renderTeamBoard, refresh: function () { renderTeamBoard('agent-perf-list'); } };
})();
