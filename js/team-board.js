/**
 * Divine Rays — team charts (Dashboard only) — stable, real names
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  // Allow reload so name fix always applies after older pin
  window.__DR_TEAM_BOARD_STABLE = 1;

  function dr() { return window.DR || {}; }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function displayName(p) {
    if (!p) return 'Agent';
    var n =
      p.full_name ||
      p.name ||
      p.display_name ||
      p.username ||
      (p.email ? String(p.email).split('@')[0] : '') ||
      '';
    n = String(n).trim();
    if (!n || /^agent$/i.test(n) || /^user$/i.test(n)) {
      if (p.username) n = String(p.username).trim();
      else if (p.email) n = String(p.email).split('@')[0];
    }
    return n || 'Agent';
  }

  function normalizeRole(role) {
    role = String(role || '').trim().toLowerCase();
    if (role === 'admin' || role === 'administrator') return 'admin';
    if (role === 'agent' || role === 'staff' || role === 'tech' || role === 'support') return 'agent';
    return role;
  }

  var _token = 0;
  var _busy = false;
  var _lastFp = '';
  var _lastHtml = '';
  var _timer = null;
  var _ignoreMutUntil = 0;

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

  async function fetchProfiles(client) {
    var profiles = [];
    if (!client) return profiles;
    var tries = [
      'id,full_name,username,email,role,avatar_url,created_at',
      'id,full_name,username,email,role',
      'id,full_name,role',
      '*'
    ];
    for (var i = 0; i < tries.length; i++) {
      try {
        var r = await client.from('profiles').select(tries[i]);
        if (!r.error && r.data && r.data.length) {
          profiles = r.data;
          break;
        }
      } catch (e) {}
    }
    return profiles;
  }

  async function fetchProfilesByIds(client, ids) {
    if (!client || !ids || !ids.length) return [];
    try {
      var r = await client.from('profiles').select('id,full_name,username,email,role,avatar_url').in('id', ids);
      if (!r.error && r.data) return r.data;
    } catch (e) {}
    try {
      var r2 = await client.from('profiles').select('*').in('id', ids);
      if (!r2.error && r2.data) return r2.data;
    } catch (e2) {}
    return [];
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

    var client2 = dr().sb && dr().sb();
    var profiles = await fetchProfiles(client2);

    var missing = Object.keys(byAgent).filter(function (id) {
      return !profiles.some(function (p) { return p && p.id === id; });
    });
    if (missing.length) {
      var extra = await fetchProfilesByIds(client2, missing);
      profiles = profiles.concat(extra);
    }

    var me = (dr().getProfile && dr().getProfile()) || null;
    var meId = me && me.id;
    var rows = [];
    var seen = {};
    var byId = {};
    profiles.forEach(function (p) {
      if (p && p.id) byId[p.id] = p;
    });

    profiles.forEach(function (p) {
      if (!p || !p.id) return;
      var role = normalizeRole(p.role);
      var hasWork = !!byAgent[p.id];
      if (role !== 'agent' && role !== 'admin' && !hasWork) return;
      if (role !== 'agent' && role !== 'admin') role = 'agent';
      seen[p.id] = true;
      var s = byAgent[p.id] || { working: 0, solved: 0, csatSum: 0, csatN: 0 };
      rows.push({
        id: p.id,
        name: displayName(p),
        role: role,
        working: s.working,
        solved: s.solved,
        csatAvg: s.csatN ? s.csatSum / s.csatN : null,
        csatN: s.csatN
      });
    });

    Object.keys(byAgent).forEach(function (aid) {
      if (seen[aid]) return;
      var s = byAgent[aid];
      var p = byId[aid];
      var name = displayName(p);
      if (name === 'Agent') {
        for (var ti = 0; ti < tickets.length; ti++) {
          var t = tickets[ti];
          var tid = t.assignee_id || t.assigned_to;
          if (tid !== aid) continue;
          var tn = t.assignee_name || t.assigned_name || t.agent_name || t.assignee;
          if (tn && typeof tn === 'string' && tn.trim() && tn.indexOf('@') === -1) {
            name = tn.trim();
            break;
          }
          if (tn && typeof tn === 'string' && tn.indexOf('@') !== -1) {
            name = tn.split('@')[0];
            break;
          }
        }
      }
      if (name === 'Agent' && meId && aid === meId) {
        name = displayName(me);
      }
      rows.push({
        id: aid,
        name: name,
        role: 'agent',
        working: s.working,
        solved: s.solved,
        csatAvg: s.csatN ? s.csatSum / s.csatN : null,
        csatN: s.csatN
      });
    });

    if (meId && !seen[meId] && !rows.some(function (r) { return r.id === meId; })) {
      var myRole = normalizeRole(me && me.role) || 'agent';
      if (myRole === 'admin' || myRole === 'agent') {
        rows.push({
          id: meId,
          name: displayName(me),
          role: myRole,
          working: 0,
          solved: 0,
          csatAvg: null,
          csatN: 0
        });
      }
    }

    rows.sort(function (a, b) {
      return b.solved - a.solved || b.working - a.working || a.name.localeCompare(b.name);
    });

    return { rows: rows, meId: meId };
  }

  function fingerprint(rows, meId) {
    return rows
      .map(function (r) {
        return [
          r.id,
          r.name,
          r.role,
          r.working,
          r.solved,
          r.csatAvg != null ? r.csatAvg.toFixed(2) : '-',
          r.csatN || 0,
          meId && r.id === meId ? '1' : '0'
        ].join(':');
      })
      .join('|');
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
      '<text class="donut-center-text" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">' +
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
      '<svg class="team-mini-ring" width="40" height="40" viewBox="0 0 40 40">' +
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
      '<text class="mini-ring-text" x="20" y="21" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="700" fill="currentColor">' +
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
        escapeHtml((r.name || '').split(' ')[0] || r.name) +
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

  function buildHtml(rows, meId) {
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

    html +=
      '<div class="chart-panel full" data-dr-each-person="1">' +
      '<h4 class="chart-title">Each person</h4>' +
      '<p class="chart-desc">Individual workload and ratings</p>' +
      '<div class="team-cards">';

    rows.forEach(function (r) {
      var isMe = meId && r.id === meId;
      var badges = '';
      if (isMe) badges += '<span class="team-badge you">YOU</span>';
      if (r.role === 'admin') badges += '<span class="team-badge admin">ADMIN</span>';
      else if (r.role === 'agent') badges += '<span class="team-badge agent">AGENT</span>';

      html +=
        '<div class="team-card' +
        (isMe ? ' is-you' : '') +
        '" data-agent-id="' +
        escapeHtml(r.id) +
        '">' +
        '<div class="team-card-top">' +
        miniRing(r.solved, r.working) +
        '<div class="team-card-name">' +
        escapeHtml(r.name) +
        badges +
        '</div></div>' +
        '<div class="team-card-stats">' +
        '<div class="team-stat"><span class="team-stat-num">' +
        r.working +
        '</span><span class="team-stat-label">Working on</span></div>' +
        '<div class="team-stat"><span class="team-stat-num">' +
        r.solved +
        '</span><span class="team-stat-label">Solved</span></div>' +
        '</div></div>';
    });

    html += '</div></div>';
    return html;
  }

  async function renderTeamBoard(force) {
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
        var empty = '<p class="team-empty">No agent data yet.</p>';
        if (box.innerHTML !== empty) {
          _ignoreMutUntil = Date.now() + 800;
          box.classList.add('team-board');
          box.setAttribute('data-dr-team-stable', '1');
          box.innerHTML = empty;
        }
        _lastFp = 'empty';
        return;
      }

      var fp = fingerprint(rows, meId);
      if (!force && fp === _lastFp && hasCharts(box)) {
        return;
      }

      var html = buildHtml(rows, meId);
      if (token !== _token || !isDashboard()) return;

      _ignoreMutUntil = Date.now() + 1200;
      box.classList.add('team-board');
      box.setAttribute('data-dr-team-stable', '1');
      box.innerHTML = html;
      _lastHtml = html;
      _lastFp = fp;
    } catch (e) {
      console.warn('[team-board]', e);
      if (_lastHtml && isDashboard() && !hasCharts(box)) {
        _ignoreMutUntil = Date.now() + 800;
        box.innerHTML = _lastHtml;
      }
    } finally {
      if (token === _token) _busy = false;
    }
  }

  function scheduleRender(delay) {
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(function () {
      renderTeamBoard(false);
    }, delay || 300);
  }

  function applyView() {
    if (isDashboard()) {
      showTeamSection();
      scheduleRender(200);
    } else {
      hideTeamSection();
    }
  }

  function boot() {
    var nav = document.querySelector('#portal-agent .nav');
    if (nav && !nav.__drTeamObs) {
      nav.__drTeamObs = true;
      new MutationObserver(function () {
        applyView();
      }).observe(nav, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }

    var box = document.getElementById('agent-perf-list');
    if (box && !box.__drTeamObs) {
      box.__drTeamObs = true;
      new MutationObserver(function () {
        if (_busy || !isDashboard()) return;
        if (Date.now() < _ignoreMutUntil) return;
        if (!hasCharts(box)) {
          scheduleRender(250);
        }
      }).observe(box, { childList: true });
    }

    setTimeout(function () {
      renderTeamBoard(true);
    }, 900);
    setTimeout(function () {
      renderTeamBoard(true);
    }, 2500);
  }

  window.addEventListener('dr-status-saved', function () {
    scheduleRender(400);
  });
  window.addEventListener('dr-csat-saved', function () {
    scheduleRender(400);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 300);

  window.DR_TEAM = {
    render: function () {
      return renderTeamBoard(true);
    },
    refresh: function () {
      return renderTeamBoard(true);
    }
  };
})();
