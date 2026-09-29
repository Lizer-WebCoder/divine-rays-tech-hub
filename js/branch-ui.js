/**
 * Divine Rays — Branch + Position (register, profile, tickets)
 * Positions: Admin Staff, MedTech, RadTech
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_BRANCH_POS_V1) return;
  window.__DR_BRANCH_POS_V1 = 1;

  var BRANCHES = [
    'Abucay', 'Avenida', 'Pawing', 'Palo', 'Abuyog', 'Baybay', 'Sogod', 'Maasin',
    'Kananga', 'Ormoc', 'Calbayog', 'Catbalogan', 'Catarman', 'Dongon'
  ];
  var POSITIONS = [
    { value: 'Admin Staff', label: 'Admin Staff' },
    { value: 'MedTech', label: 'MedTech' },
    { value: 'RadTech', label: 'RadTech' }
  ];

  var profileCache = {};
  var lastFetch = 0;
  var pendingReg = { branch: '', position: '' };

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function branchOptions(selected) {
    selected = selected || '';
    return (
      '<option value="">— Select branch —</option>' +
      BRANCHES.map(function (b) {
        return '<option value="' + esc(b) + '"' + (b === selected ? ' selected' : '') + '>' + esc(b) + '</option>';
      }).join('')
    );
  }

  function positionOptions(selected) {
    selected = selected || '';
    return (
      '<option value="">— Select position —</option>' +
      POSITIONS.map(function (p) {
        return (
          '<option value="' + esc(p.value) + '"' +
          (p.value === selected ? ' selected' : '') +
          '>' + esc(p.label) + '</option>'
        );
      }).join('')
    );
  }

  async function loadProfiles() {
    var client = sb();
    if (!client) return;
    var now = Date.now();
    if (now - lastFetch < 10000 && Object.keys(profileCache).length) return;
    lastFetch = now;
    try {
      var r = await client
        .from('profiles')
        .select('id,full_name,username,branch,position')
        .limit(500);
      if (r.error) {
        r = await client.from('profiles').select('id,full_name,username,branch').limit(500);
      }
      (r.data || []).forEach(function (p) {
        var info = {
          id: p.id,
          name: p.full_name || p.username || 'User',
          branch: p.branch || '',
          position: p.position || ''
        };
        if (p.full_name) profileCache[String(p.full_name).toLowerCase()] = info;
        if (p.username) profileCache[String(p.username).toLowerCase()] = info;
        profileCache['id:' + p.id] = info;
      });
    } catch (e) {}
  }

  function injectRegisterFields() {
    var form = document.getElementById('register-customer');
    if (!form || form.querySelector('#reg-cust-branch')) return;

    var pwdGroup = form.querySelector('#reg-cust-password');
    var anchor = pwdGroup ? pwdGroup.closest('.form-group') : null;

    var branchGroup = document.createElement('div');
    branchGroup.className = 'form-group';
    branchGroup.innerHTML =
      '<label for="reg-cust-branch">Branch</label>' +
      '<select id="reg-cust-branch" required>' + branchOptions('') + '</select>';

    var posGroup = document.createElement('div');
    posGroup.className = 'form-group';
    posGroup.innerHTML =
      '<label for="reg-cust-position">Position</label>' +
      '<select id="reg-cust-position" required>' + positionOptions('') + '</select>';

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(branchGroup, anchor);
      anchor.parentNode.insertBefore(posGroup, anchor);
    } else {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        form.insertBefore(branchGroup, btn);
        form.insertBefore(posGroup, btn);
      } else {
        form.appendChild(branchGroup);
        form.appendChild(posGroup);
      }
    }
  }

  async function saveProfileFields(userId, branch, position) {
    var client = sb();
    if (!client || !userId) return { error: 'No client' };
    var payload = {};
    if (branch !== undefined && branch !== null) payload.branch = branch || null;
    if (position !== undefined && position !== null) payload.position = position || null;
    if (!Object.keys(payload).length) return {};

    try {
      var r = await client.from('profiles').update(payload).eq('id', userId);
      if (r.error) {
        if (position && /position/i.test(r.error.message || '')) {
          var r2 = await client.from('profiles').update({ branch: branch || null }).eq('id', userId);
          if (r2.error) return { error: r2.error.message };
          try {
            await client.auth.updateUser({ data: { position: position, branch: branch } });
          } catch (e) {}
          return { warning: 'Add column profiles.position (text) in Supabase for positions to save' };
        }
        return { error: r.error.message };
      }
      return {};
    } catch (e) {
      return { error: String(e.message || e) };
    }
  }

  function bindRegisterCapture() {
    var form = document.getElementById('register-customer');
    if (!form || form.__drBranchBound) return;
    form.__drBranchBound = true;

    form.addEventListener(
      'submit',
      function () {
        var b = document.getElementById('reg-cust-branch');
        var p = document.getElementById('reg-cust-position');
        pendingReg.branch = b ? b.value : '';
        pendingReg.position = p ? p.value : '';
        var tries = 0;
        var timer = setInterval(async function () {
          tries++;
          if (tries > 25) {
            clearInterval(timer);
            return;
          }
          try {
            var prof = window.DR && DR.getProfile && DR.getProfile();
            if (prof && prof.id && (pendingReg.branch || pendingReg.position)) {
              clearInterval(timer);
              var res = await saveProfileFields(prof.id, pendingReg.branch, pendingReg.position);
              if (pendingReg.branch) prof.branch = pendingReg.branch;
              if (pendingReg.position) prof.position = pendingReg.position;
              profileCache['id:' + prof.id] = {
                id: prof.id,
                name: prof.full_name || 'User',
                branch: pendingReg.branch || '',
                position: pendingReg.position || ''
              };
              if (prof.full_name) {
                profileCache[String(prof.full_name).toLowerCase()] = profileCache['id:' + prof.id];
              }
              pendingReg.branch = '';
              pendingReg.position = '';
              if (res.warning && window.DR && DR.toast) DR.toast(res.warning, 'info');
              enhanceAll();
            }
          } catch (e) {}
        }, 400);
      },
      true
    );
  }

  function enhanceProfileView() {
    var body = document.getElementById('profile-body');
    if (!body) return;
    var dl = body.querySelector('.profile-dl');
    if (!dl) return;

    var name = '';
    var nameEl = body.querySelector('.profile-view-name');
    if (nameEl) name = (nameEl.textContent || '').trim();
    var info = name ? profileCache[name.toLowerCase()] : null;
    if (!info) {
      try {
        var me = window.DR && DR.getProfile && DR.getProfile();
        if (me) {
          info = profileCache['id:' + me.id] || {
            branch: me.branch || '',
            position: me.position || ''
          };
        }
      } catch (e) {}
    }

    function ensureRow(key, label, value) {
      var existing = dl.querySelector('[data-dr-' + key + '-row]');
      if (existing) {
        var dd = existing.querySelector('dd');
        if (dd) dd.textContent = value || '—';
        return;
      }
      var row = document.createElement('div');
      row.className = 'profile-dl-row';
      row.setAttribute('data-dr-' + key + '-row', '1');
      row.innerHTML = '<dt>' + esc(label) + '</dt><dd>' + esc(value || '—') + '</dd>';
      dl.appendChild(row);
    }

    ensureRow('branch', 'Branch', info && info.branch);
    ensureRow('position', 'Position', info && info.position);
  }

  function enhanceProfileEdit() {
    var grid = document.querySelector('#profile-body .profile-grid');
    if (!grid) grid = document.querySelector('#profile-edit .form-grid, #profile-edit, .profile-edit-form');
    if (!grid) return;

    var me = null;
    try { me = window.DR && DR.getProfile && DR.getProfile(); } catch (e) {}
    var currentBranch = (me && me.branch) || '';
    var currentPos = (me && me.position) || '';
    if (me && me.full_name && profileCache[String(me.full_name).toLowerCase()]) {
      var cached = profileCache[String(me.full_name).toLowerCase()];
      if (!currentBranch) currentBranch = cached.branch || '';
      if (!currentPos) currentPos = cached.position || '';
    }

    if (!document.getElementById('pf-branch')) {
      var branchWrap = document.createElement('div');
      branchWrap.className = 'form-group';
      branchWrap.innerHTML =
        '<label for="pf-branch">Branch</label>' +
        '<select id="pf-branch">' + branchOptions(currentBranch) + '</select>';
      var dept = document.getElementById('pf-department');
      if (dept && dept.closest('.form-group')) {
        dept.closest('.form-group').parentNode.insertBefore(branchWrap, dept.closest('.form-group').nextSibling);
      } else {
        grid.appendChild(branchWrap);
      }
    }

    if (!document.getElementById('pf-position')) {
      var posWrap = document.createElement('div');
      posWrap.className = 'form-group';
      posWrap.innerHTML =
        '<label for="pf-position">Position</label>' +
        '<select id="pf-position">' + positionOptions(currentPos) + '</select>';
      var branchEl = document.getElementById('pf-branch');
      if (branchEl && branchEl.closest('.form-group')) {
        branchEl.closest('.form-group').parentNode.insertBefore(posWrap, branchEl.closest('.form-group').nextSibling);
      } else {
        grid.appendChild(posWrap);
      }
    }

    var save = document.getElementById('pf-save');
    if (save && !save.__drBranchSave) {
      save.__drBranchSave = true;
      save.addEventListener(
        'click',
        function () {
          setTimeout(async function () {
            try {
              var p = window.DR && DR.getProfile && DR.getProfile();
              if (!p || !p.id) return;
              var b = document.getElementById('pf-branch');
              var pos = document.getElementById('pf-position');
              var branch = b ? b.value : '';
              var position = pos ? pos.value : '';
              var res = await saveProfileFields(p.id, branch, position);
              p.branch = branch;
              p.position = position;
              profileCache['id:' + p.id] = {
                id: p.id,
                name: p.full_name || 'User',
                branch: branch,
                position: position
              };
              if (p.full_name) profileCache[String(p.full_name).toLowerCase()] = profileCache['id:' + p.id];
              lastFetch = 0;
              await loadProfiles();
              if (res.warning && window.DR && DR.toast) DR.toast(res.warning, 'info');
              else if (window.DR && DR.toast) DR.toast('Branch & position saved', 'success');
              enhanceAll();
            } catch (e) {}
          }, 500);
        },
        true
      );
    }
  }

  function formatMeta(branch, position) {
    var parts = [];
    if (position) parts.push(position);
    if (branch) parts.push(branch);
    return parts.join(' · ');
  }

  function enhanceTicketCards() {
    document.querySelectorAll('.ticket-card').forEach(function (card) {
      var meta = card.querySelector('.ticket-meta');
      if (!meta) return;
      var spans = meta.querySelectorAll('span');
      var nameSpan = null;
      for (var i = 0; i < spans.length; i++) {
        var sp = spans[i];
        if (sp.classList.contains('ticket-id') || sp.classList.contains('meta-sep')) continue;
        var tx = (sp.textContent || '').trim();
        if (!tx || /^DR-/i.test(tx) || /ago$/i.test(tx)) continue;
        if (/^(Hardware|Software|Network|Account|Other)$/i.test(tx)) continue;
        nameSpan = sp;
        break;
      }
      if (!nameSpan) return;

      var raw = (nameSpan.textContent || '').trim();
      var baseName = raw.split('—')[0].split('·')[0].trim();
      if (!baseName) return;

      var info = profileCache[baseName.toLowerCase()];
      if (!info) {
        var keys = Object.keys(profileCache);
        for (var k = 0; k < keys.length; k++) {
          if (keys[k].indexOf('id:') === 0) continue;
          if (baseName.toLowerCase() === keys[k] || keys[k].indexOf(baseName.toLowerCase()) === 0) {
            info = profileCache[keys[k]];
            break;
          }
        }
      }
      if (!info || (!info.branch && !info.position)) return;

      var extra = formatMeta(info.branch, info.position);
      if (!extra) return;
      nameSpan.textContent = baseName + ' · ' + extra;
      meta.removeAttribute('data-dr-spaced');
    });
  }

  function enhanceTicketDetail() {
    var detail = document.querySelector('.ticket-detail') || document.getElementById('ticket-detail');
    if (!detail) return;
    var meta = detail.querySelector('.detail-meta');
    if (!meta || meta.querySelector('[data-dr-bp-chip]')) return;

    var tid = null;
    try { if (window.currentTicketId) tid = window.currentTicketId; } catch (e) {}
    var tickets = [];
    try { if (window.DR && DR.getAllTickets) tickets = DR.getAllTickets() || []; } catch (e) {}
    var ticket = null;
    for (var t = 0; t < tickets.length; t++) {
      if (String(tickets[t].id) === String(tid)) { ticket = tickets[t]; break; }
    }
    var info = null;
    if (ticket && ticket.requester_id) info = profileCache['id:' + ticket.requester_id];
    if (!info) return;

    if (info.position) {
      var c1 = document.createElement('span');
      c1.className = 'meta-chip';
      c1.setAttribute('data-dr-bp-chip', '1');
      c1.innerHTML = '<span class="meta-k">Position</span> ' + esc(info.position);
      meta.appendChild(c1);
    }
    if (info.branch) {
      var c2 = document.createElement('span');
      c2.className = 'meta-chip';
      c2.setAttribute('data-dr-bp-chip', '1');
      c2.innerHTML = '<span class="meta-k">Branch</span> ' + esc(info.branch);
      meta.appendChild(c2);
    }
  }

  function enhanceAll() {
    injectRegisterFields();
    bindRegisterCapture();
    enhanceProfileView();
    enhanceProfileEdit();
    enhanceTicketCards();
    enhanceTicketDetail();
  }

  async function tick() {
    await loadProfiles();
    enhanceAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(tick, 400); });
  } else {
    setTimeout(tick, 400);
  }
  setTimeout(tick, 1200);
  setTimeout(tick, 3000);
  setInterval(tick, 4000);

  document.addEventListener('click', function () {
    setTimeout(enhanceAll, 200);
    setTimeout(enhanceAll, 600);
  }, true);

  window.DRBranchUi = { refresh: tick, BRANCHES: BRANCHES, POSITIONS: POSITIONS };
})();
