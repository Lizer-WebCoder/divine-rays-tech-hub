/**
 * Divine Rays — show branch on profile view + ticket cards
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_BRANCH_UI) return;
  window.__DR_BRANCH_UI = 1;

  var BRANCHES = [
    'Abucay','Avenida','Pawing','Palo','Abuyog','Baybay','Sogod','Maasin',
    'Kananga','Ormoc','Calbayog','Catbalogan','Catarman','Dongon'
  ];
  var branchCache = {};
  var lastFetch = 0;

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function loadProfiles() {
    var client = sb();
    if (!client) return;
    var now = Date.now();
    if (now - lastFetch < 12000 && Object.keys(branchCache).length) return;
    lastFetch = now;
    try {
      var r = await client.from('profiles').select('id,full_name,username,branch').limit(500);
      (r.data || []).forEach(function (p) {
        var info = { name: p.full_name || p.username || 'User', branch: p.branch || '' };
        if (p.full_name) branchCache[String(p.full_name).toLowerCase()] = info;
        if (p.username) branchCache[String(p.username).toLowerCase()] = info;
        branchCache['id:' + p.id] = info;
      });
    } catch (e) {}
  }

  function enhanceProfileView() {
    var body = document.getElementById('profile-body');
    if (!body) return;
    var dl = body.querySelector('.profile-dl');
    if (!dl || dl.querySelector('[data-dr-branch-row]')) return;

    var name = '';
    var nameEl = body.querySelector('.profile-view-name');
    if (nameEl) name = (nameEl.textContent || '').trim();

    var info = name ? branchCache[name.toLowerCase()] : null;
    var branchVal = info && info.branch ? info.branch : '—';

    var row = document.createElement('div');
    row.className = 'profile-dl-row';
    row.setAttribute('data-dr-branch-row', '1');
    row.innerHTML = '<dt>Branch</dt><dd>' + esc(branchVal) + '</dd>';

    var rows = dl.querySelectorAll('.profile-dl-row');
    var placed = false;
    for (var i = 0; i < rows.length; i++) {
      var dt = rows[i].querySelector('dt');
      if (dt && /city/i.test(dt.textContent || '')) {
        rows[i].parentNode.insertBefore(row, rows[i].nextSibling);
        placed = true;
        break;
      }
    }
    if (!placed) dl.appendChild(row);
  }

  function enhanceProfileEdit() {
    var grid = document.querySelector('#profile-body .profile-grid');
    if (!grid || document.getElementById('pf-branch')) return;

    var me = null;
    try { me = window.DR && window.DR.getProfile && window.DR.getProfile(); } catch (e) {}
    var current = '';
    if (me && me.branch) current = me.branch;
    if (!current && me && me.full_name && branchCache[String(me.full_name).toLowerCase()]) {
      current = branchCache[String(me.full_name).toLowerCase()].branch || '';
    }

    var wrap = document.createElement('div');
    wrap.className = 'form-group';
    wrap.innerHTML =
      '<label for="pf-branch">Branch</label>' +
      '<select id="pf-branch">' +
      '<option value="">— Select branch —</option>' +
      BRANCHES.map(function (b) {
        return '<option value="' + esc(b) + '"' + (current === b ? ' selected' : '') + '>' + esc(b) + '</option>';
      }).join('') +
      '</select>';

    var dept = document.getElementById('pf-department');
    if (dept && dept.closest('.form-group')) {
      dept.closest('.form-group').parentNode.insertBefore(wrap, dept.closest('.form-group').nextSibling);
    } else {
      grid.appendChild(wrap);
    }

    var save = document.getElementById('pf-save');
    if (save && !save.__drBranchHook) {
      save.__drBranchHook = true;
      save.addEventListener(
        'click',
        function () {
          var sel = document.getElementById('pf-branch');
          var branch = sel ? sel.value : '';
          setTimeout(async function () {
            var client = sb();
            var p = me;
            try { p = window.DR && window.DR.getProfile && window.DR.getProfile(); } catch (e) {}
            if (!client || !p || !p.id) return;
            try {
              await client.from('profiles').update({ branch: branch || null }).eq('id', p.id);
              if (p) p.branch = branch;
              lastFetch = 0;
              await loadProfiles();
            } catch (e) {}
          }, 800);
        },
        true
      );
    }
  }

  function applyTicketBranches() {
    document.querySelectorAll('.ticket-card').forEach(function (card) {
      var meta = card.querySelector('.ticket-meta');
      if (!meta) return;
      var spans = meta.querySelectorAll('span');
      var nameSpan = null;
      var name = '';
      for (var i = 0; i < spans.length; i++) {
        var t = (spans[i].textContent || '').trim();
        if (/^DR-\d+/i.test(t)) continue;
        if (spans[i].classList.contains('meta-sep')) continue;
        if (!nameSpan && t && !/^(Hardware|Software|Network|Account|Other|\d+[smhd] ago)$/i.test(t)) {
          nameSpan = spans[i];
          name = t;
          if (t.indexOf(' — ') !== -1) return;
          break;
        }
      }
      if (!nameSpan || !name) return;
      var baseName = name.split(/[—-]/)[0].trim();
      var info = branchCache[baseName.toLowerCase()];
      if (!info) {
        var keys = Object.keys(branchCache);
        for (var k = 0; k < keys.length; k++) {
          if (keys[k].indexOf('id:') === 0) continue;
          if (baseName.toLowerCase() === keys[k] || keys[k].indexOf(baseName.toLowerCase()) === 0) {
            info = branchCache[keys[k]];
            break;
          }
        }
      }
      if (!info || !info.branch) return;
      nameSpan.textContent = (info.name || baseName) + ' — ' + info.branch;
      meta.removeAttribute('data-dr-spaced');
    });
  }

  async function tick() {
    await loadProfiles();
    enhanceProfileView();
    enhanceProfileEdit();
    applyTicketBranches();
  }

  setTimeout(tick, 600);
  setInterval(tick, 2500);
  window.DRBranchUi = { refresh: tick };
})();
