/**
 * Divine Rays — customer UX
 * - Branch dropdown, hide Edit profile + main notif banner
 * - Floating notifications with Delete
 * - Fix cut-off / duplicate header
 * - Guided tutorial for creating a ticket
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUSTOMER_UX_V2) return;
  window.__DR_CUSTOMER_UX_V2 = 1;
  window.__DR_CUSTOMER_UX = 1;

  var BRANCHES = [
    'Abucay', 'Avenida', 'Pawing', 'Palo', 'Abuyog', 'Baybay', 'Sogod', 'Maasin',
    'Kananga', 'Ormoc', 'Calbayog', 'Catbalogan', 'Catarman', 'Dongon'
  ];
  var TOUR_KEY = 'dr_customer_tour_done_v1';

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }
  function profile() {
    try { if (window.DR && window.DR.getProfile) return window.DR.getProfile(); } catch (e) {}
    return window.__drProfile || null;
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  var CSS = [
    '#btn-cust-profile{display:none!important}',
    '.customer-header a[href*="profile"],.customer-header .edit-profile-link{display:none!important}',
    '#notif-inline,#notifications-panel.inline,.mode-bar .notif-list,#header-notifications-list{display:none!important}',
    '#cust-notifications,.cust-notifications,.notif-banner{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:none!important}',
    '.mode-bar{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:.75rem!important;flex-wrap:nowrap!important;overflow:visible!important;min-height:48px!important;padding:.5rem 1rem!important}',
    '.mode-bar .mode-brand{flex-shrink:0;min-width:0}',
    '.mode-bar .user-info{display:flex!important;align-items:center!important;gap:.45rem!important;flex-wrap:nowrap!important;min-width:0;max-width:min(70vw,520px);overflow:hidden}',
    '.mode-bar .user-info #logged-user-label{max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.82rem}',
    '.mode-bar .user-info .btn{flex-shrink:0;white-space:nowrap}',
    '.mode-bar .header-avatar-chip,.mode-bar #header-avatar-chip{width:28px;height:28px;min-width:28px;border-radius:50%;overflow:hidden;display:grid;place-items:center;flex-shrink:0}',
    '.mode-bar .header-avatar-chip img,.mode-bar #header-avatar-chip img{width:100%;height:100%;object-fit:cover}',
    '.mode-bar .user-info .btn-profile-dup{display:none!important}',
    '#dr-notif-fab{position:fixed;right:1.15rem;bottom:5.1rem;z-index:12005;width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#7c6af0,#9b8afb);color:#fff;box-shadow:0 8px 28px rgba(124,106,240,.45);display:flex;align-items:center;justify-content:center}',
    '#dr-notif-fab svg{width:22px;height:22px;fill:currentColor}',
    '#dr-notif-fab .b{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;line-height:1}',
    '#dr-notif-fab .b.on{display:flex}',
    '#dr-notif-panel-bd{position:fixed;inset:0;z-index:12010;background:rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .18s}',
    '#dr-notif-panel-bd.open{opacity:1;pointer-events:auto}',
    '#dr-notif-panel{position:fixed;right:1.15rem;bottom:9rem;z-index:12020;width:min(360px,calc(100vw - 2rem));max-height:min(420px,60vh);background:var(--surface,#1a1a24);border:1px solid rgba(124,106,240,.3);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(10px) scale(.97);pointer-events:none;transition:opacity .18s,transform .18s}',
    '#dr-notif-panel.open{opacity:1;transform:none;pointer-events:auto}',
    '#dr-notif-panel .hd{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;border-bottom:1px solid rgba(255,255,255,.08);font-weight:600}',
    '#dr-notif-panel .hd button{background:0;border:0;color:#9898b0;cursor:pointer;font-size:1.1rem}',
    '#dr-notif-panel .bd{overflow:auto;padding:.5rem;flex:1}',
    '#dr-notif-panel .row{padding:.65rem .75rem;border-radius:10px;margin-bottom:.35rem;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.06);cursor:pointer}',
    '#dr-notif-panel .row.unread{border-color:rgba(124,106,240,.35);background:rgba(124,106,240,.1)}',
    '#dr-notif-panel .row .t{font-size:.88rem;color:var(--text,#eeeef6);margin-bottom:.2rem}',
    '#dr-notif-panel .row .m{font-size:.75rem;color:#9898b0}',
    '#dr-notif-panel .empty{padding:1.25rem;text-align:center;color:#9898b0;font-size:.88rem}',
    '#dr-notif-panel .row-foot{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-top:.35rem}',
    '#dr-notif-panel .del-btn{background:transparent;border:1px solid rgba(239,68,68,.4);color:#f87171;border-radius:6px;padding:.2rem .55rem;font-size:.75rem;cursor:pointer}',
    '#dr-notif-panel .del-btn:hover{background:rgba(239,68,68,.15)}',
    '#pf-branch{width:100%;padding:.55rem .7rem;border-radius:8px;border:1px solid var(--border,#2e2e42);background:var(--bg,#0c0c12);color:var(--text,#eeeef6)}',
    '#dr-tour-bd{position:fixed;inset:0;z-index:13000;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .2s}',
    '#dr-tour-bd.open{opacity:1;pointer-events:auto}',
    '#dr-tour-card{position:fixed;z-index:13010;width:min(360px,calc(100vw - 2rem));background:var(--surface,#1a1a24);border:1px solid rgba(124,106,240,.4);border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.55);padding:1.1rem 1.2rem;color:var(--text,#eeeef6);opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s}',
    '#dr-tour-card.open{opacity:1;transform:none}',
    '#dr-tour-card h3{margin:0 0 .4rem;font-size:1.05rem;color:#c4b5fd}',
    '#dr-tour-card p{margin:0 0 .85rem;font-size:.9rem;line-height:1.45;color:#b8b8cc}',
    '#dr-tour-card .tour-actions{display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap}',
    '#dr-tour-card .tour-step{font-size:.75rem;color:#9898b0;margin-bottom:.35rem}',
    '.dr-tour-hl{outline:2px solid #a78bfa!important;outline-offset:3px!important;box-shadow:0 0 0 6px rgba(124,106,240,.25)!important;border-radius:10px!important;position:relative;z-index:13005}',
    '#dr-tour-help{position:fixed;left:1rem;bottom:1.15rem;z-index:12000;border:none;border-radius:999px;padding:.55rem 1rem;cursor:pointer;background:rgba(124,106,240,.2);color:#c4b5fd;border:1px solid rgba(124,106,240,.4);font-size:.82rem;font-weight:600}',
    '#dr-tour-help:hover{background:rgba(124,106,240,.32)}',
    '#portal-customer .customer-header{padding-top:.25rem}'
  ].join('');

  function injectCss() {
    var s = document.getElementById('dr-customer-ux-css');
    if (!s) {
      s = document.createElement('style');
      s.id = 'dr-customer-ux-css';
      document.head.appendChild(s);
    }
    s.textContent = CSS;
  }

  function stripEditProfile() {
    var btn = document.getElementById('btn-cust-profile');
    if (btn) btn.remove();
    document.querySelectorAll('#portal-customer .customer-header button, #portal-customer .customer-header a').forEach(function (el) {
      if ((el.textContent || '').trim().toLowerCase() === 'edit profile') el.remove();
    });
    document.querySelectorAll('#cust-notifications, .cust-notifications, .notif-banner').forEach(function (el) {
      el.remove();
    });
  }

  function fixHeader() {
    var info = document.querySelector('.mode-bar .user-info') || document.querySelector('.user-info');
    if (!info) return;
    var profiles = [];
    info.querySelectorAll('button, a').forEach(function (el) {
      if ((el.textContent || '').trim().toLowerCase() === 'profile') profiles.push(el);
    });
    profiles.forEach(function (el, i) {
      if (i === 0) {
        el.id = el.id || 'btn-header-profile';
        el.classList.remove('btn-profile-dup');
      } else el.classList.add('btn-profile-dup');
    });
    info.querySelectorAll('#header-avatar-chip, .header-avatar-chip').forEach(function (c, i) {
      if (i > 0) c.style.display = 'none';
    });
    info.querySelectorAll('#btn-theme, .btn-theme').forEach(function (t, i) {
      if (i > 0) t.style.display = 'none';
    });
    if (!profiles.length) {
      var b = document.createElement('button');
      b.type = 'button';
      b.id = 'btn-header-profile';
      b.className = 'btn btn-ghost btn-sm';
      b.textContent = 'Profile';
      b.addEventListener('click', function () {
        if (window.DRProfile && window.DRProfile.open) window.DRProfile.open({ readOnly: false });
      });
      var logout = document.getElementById('btn-logout');
      if (logout && logout.parentNode === info) info.insertBefore(b, logout);
      else info.appendChild(b);
    }
    var label = document.getElementById('logged-user-label');
    if (label) {
      var txt = (label.textContent || '').trim();
      if (txt.length > 28) {
        label.title = txt;
        var m = txt.match(/^([^(]+)/);
        if (m) label.textContent = m[1].trim();
      }
    }
  }

  function injectBranchField() {
    var body = document.getElementById('profile-body');
    if (!body || document.getElementById('pf-branch')) return;
    var grid = body.querySelector('.profile-grid');
    if (!grid) return;
    var current = '';
    try {
      var p = profile();
      if (p && p.branch) current = p.branch;
    } catch (e) {}
    var wrap = document.createElement('div');
    wrap.className = 'form-group';
    wrap.id = 'pf-branch-wrap';
    wrap.innerHTML =
      '<label for="pf-branch">Branch</label><select id="pf-branch"><option value="">Select branch…</option>' +
      BRANCHES.map(function (b) {
        return '<option value="' + esc(b) + '"' + (b === current ? ' selected' : '') + '>' + esc(b) + '</option>';
      }).join('') + '</select>';
    grid.appendChild(wrap);
    loadBranchIntoSelect();
    var save = document.getElementById('pf-save');
    if (save && !save._drBranchHook) {
      save._drBranchHook = true;
      save.addEventListener('click', function () { setTimeout(saveBranch, 50); }, true);
    }
  }

  async function loadBranchIntoSelect() {
    var sel = document.getElementById('pf-branch');
    var client = sb();
    var p = profile();
    if (!sel || !client || !p || !p.id) return;
    try {
      var r = await client.from('profiles').select('branch').eq('id', p.id).maybeSingle();
      if (r.data && r.data.branch) sel.value = r.data.branch;
    } catch (e) {}
  }

  async function saveBranch() {
    var sel = document.getElementById('pf-branch');
    var client = sb();
    var p = profile();
    if (!sel || !client || !p || !p.id) return;
    try {
      await client.from('profiles').update({ branch: sel.value || null }).eq('id', p.id);
      if (p) p.branch = sel.value || null;
    } catch (e) {}
  }

  function ensureNotifFab() {
    if (document.getElementById('dr-notif-fab')) return;
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'dr-notif-fab';
    fab.title = 'Notifications';
    fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg><span class="b" id="dr-notif-count">0</span>';
    document.body.appendChild(fab);
    var bd = document.createElement('div');
    bd.id = 'dr-notif-panel-bd';
    document.body.appendChild(bd);
    var panel = document.createElement('div');
    panel.id = 'dr-notif-panel';
    panel.innerHTML = '<div class="hd"><span>Notifications</span><button type="button" id="dr-notif-close" aria-label="Close">&times;</button></div><div class="bd" id="dr-notif-body"><div class="empty">Loading…</div></div>';
    document.body.appendChild(panel);
    function close() { panel.classList.remove('open'); bd.classList.remove('open'); }
    function open() { panel.classList.add('open'); bd.classList.add('open'); loadNotifications(); }
    fab.onclick = function () { if (panel.classList.contains('open')) close(); else open(); };
    bd.onclick = close;
    document.getElementById('dr-notif-close').onclick = close;
  }

  function setBadge(n) {
    var el = document.getElementById('dr-notif-count');
    if (!el) return;
    if (n > 0) { el.textContent = n > 99 ? '99+' : String(n); el.classList.add('on'); }
    else el.classList.remove('on');
  }

  async function loadNotifications() {
    var body = document.getElementById('dr-notif-body');
    if (!body) return;
    var client = sb();
    var p = profile();
    if (!client || !p || !p.id) { body.innerHTML = '<div class="empty">Sign in to see notifications</div>'; return; }
    try {
      var r = await client.from('notifications').select('*').eq('user_id', p.id).order('created_at', { ascending: false }).limit(40);
      if (r.error) { body.innerHTML = '<div class="empty">No notifications yet</div>'; setBadge(0); return; }
      var rows = r.data || [];
      setBadge(rows.filter(function (x) { return !x.read; }).length);
      if (!rows.length) { body.innerHTML = '<div class="empty">No notifications yet</div>'; return; }
      body.innerHTML = rows.map(function (n) {
        var title = n.title || n.type || 'Update';
        var msg = n.body || n.message || '';
        var when = '';
        try { when = new Date(n.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
        return '<div class="row' + (n.read ? '' : ' unread') + '" data-id="' + esc(n.id) + '"><div class="t">' + esc(title) + '</div>' + (msg ? '<div class="m">' + esc(msg) + '</div>' : '') + '<div class="row-foot"><span class="m">' + esc(when) + '</span><button type="button" class="del-btn" data-del="' + esc(n.id) + '">Delete</button></div></div>';
      }).join('');
      body.querySelectorAll('.row').forEach(function (row) {
        row.onclick = async function (ev) {
          if (ev.target && ev.target.classList && ev.target.classList.contains('del-btn')) return;
          var id = row.getAttribute('data-id');
          if (!id) return;
          try { await client.from('notifications').update({ read: true }).eq('id', id); } catch (e) {}
          row.classList.remove('unread');
          setBadge(body.querySelectorAll('.row.unread').length);
        };
      });
      body.querySelectorAll('.del-btn').forEach(function (btn) {
        btn.onclick = async function (ev) {
          ev.stopPropagation();
          var id = btn.getAttribute('data-del');
          var row = btn.closest('.row');
          if (!id) return;
          try {
            var del = await client.from('notifications').delete().eq('id', id);
            if (del.error) await client.from('notifications').update({ read: true }).eq('id', id);
          } catch (e) {}
          if (row) row.remove();
          setBadge(body.querySelectorAll('.row.unread').length);
          if (!body.querySelector('.row')) { body.innerHTML = '<div class="empty">No notifications yet</div>'; setBadge(0); }
        };
      });
      if (rows.length) {
        var hd = document.querySelector('#dr-notif-panel .hd');
        if (hd && !hd.querySelector('#dr-notif-clear')) {
          var clr = document.createElement('button');
          clr.type = 'button';
          clr.id = 'dr-notif-clear';
          clr.textContent = 'Clear all';
          clr.style.cssText = 'background:0;border:0;color:#a78bfa;cursor:pointer;font-size:.8rem;margin-right:.5rem';
          clr.onclick = async function () {
            try { await client.from('notifications').delete().eq('user_id', p.id); }
            catch (e) { try { await client.from('notifications').update({ read: true }).eq('user_id', p.id); } catch (e2) {} }
            body.innerHTML = '<div class="empty">No notifications yet</div>';
            setBadge(0);
          };
          var close = document.getElementById('dr-notif-close');
          if (close) hd.insertBefore(clr, close); else hd.appendChild(clr);
        }
      }
    } catch (e) {
      body.innerHTML = '<div class="empty">Could not load notifications</div>';
    }
  }

  async function refreshBadge() {
    var client = sb();
    var p = profile();
    if (!client || !p || !p.id) return;
    try {
      var r = await client.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', p.id).eq('read', false);
      setBadge(r.count || 0);
    } catch (e) {}
  }

  var tourSteps = [
    { title: 'Welcome to Divine Rays Support', body: 'This short guide shows how to submit a support ticket. Reopen anytime with the Help tour button at the bottom left.', target: null },
    { title: '1. Open Submit Ticket', body: 'Click the purple “Submit Ticket” tab. This is where you describe your problem so our team can help.', target: '.customer-tabs .ctab[data-ctab="submit"], .customer-tabs button.ctab:first-child, .ctab.active' },
    { title: '2. Write a short title', body: 'In “What do you need help with?” type a clear title, e.g. “Printer not working” or “Cannot connect to Wi‑Fi”.', target: '#c-title, #customer-form input[type="text"], .ticket-form input:first-of-type' },
    { title: '3. Choose urgency & category', body: 'Pick how urgent it is (Low → Critical) and a category (Hardware, Software, Network…). This helps agents prioritize and route your request.', target: '#c-priority, #c-category, .ticket-form select' },
    { title: '4. Describe the problem', body: 'In the description box, explain what happened, when it started, and any error messages. More detail = faster resolution.', target: '#c-description, .ticket-form textarea' },
    { title: '5. Submit', body: 'Click the purple “Submit Ticket” button at the bottom. You’ll get a ticket ID (like DR-1025) to track progress.', target: '#customer-form button[type="submit"], .ticket-form .btn-primary' },
    { title: 'Other tabs', body: '• My Tickets — list of your requests\n• Track by ID — look up a ticket number\n• Help / FAQ — common answers\n\nProfile (top right) lets you set your name, photo, and branch.', target: '.customer-tabs' },
    { title: 'Notifications & chat', body: 'The bell button (above the chat bubble) shows alerts — e.g. when a ticket is updated or deleted. The chat bubble is for messaging support staff when available.', target: null }
  ];
  var tourIndex = 0;

  function clearTourHighlight() {
    document.querySelectorAll('.dr-tour-hl').forEach(function (el) { el.classList.remove('dr-tour-hl'); });
  }

  function findTarget(sel) {
    if (!sel) return null;
    var parts = sel.split(',');
    for (var i = 0; i < parts.length; i++) {
      var el = document.querySelector(parts[i].trim());
      if (el && el.offsetParent !== null) return el;
    }
    return document.querySelector(parts[0].trim());
  }

  function placeTourCard(card, target) {
    var pad = 12;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    card.style.left = ''; card.style.top = ''; card.style.right = ''; card.style.bottom = '';
    if (!target) {
      card.style.left = '50%'; card.style.top = '50%'; card.style.transform = 'translate(-50%, -50%)';
      return;
    }
    card.style.transform = '';
    var r = target.getBoundingClientRect();
    var cardW = Math.min(360, vw - 24);
    var left = Math.min(Math.max(pad, r.left), vw - cardW - pad);
    var top = r.bottom + 12;
    if (top + 220 > vh) top = Math.max(pad, r.top - 230);
    card.style.left = left + 'px';
    card.style.top = top + 'px';
  }

  function showTourStep(i) {
    tourIndex = i;
    var step = tourSteps[i];
    if (!step) return endTour(true);
    var bd = document.getElementById('dr-tour-bd');
    var card = document.getElementById('dr-tour-card');
    if (!bd || !card) return;
    clearTourHighlight();
    var target = findTarget(step.target);
    if (target) {
      target.classList.add('dr-tour-hl');
      try { target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
      if (i >= 1 && i <= 5) {
        var sub = document.querySelector('.customer-tabs .ctab[data-ctab="submit"], .customer-tabs .ctab');
        if (sub) sub.click();
      }
    }
    card.innerHTML =
      '<div class="tour-step">Step ' + (i + 1) + ' of ' + tourSteps.length + '</div>' +
      '<h3>' + esc(step.title) + '</h3>' +
      '<p style="white-space:pre-line">' + esc(step.body) + '</p>' +
      '<div class="tour-actions">' +
      (i > 0 ? '<button type="button" class="btn btn-ghost btn-sm" id="dr-tour-back">Back</button>' : '') +
      '<button type="button" class="btn btn-ghost btn-sm" id="dr-tour-skip">Skip</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="dr-tour-next">' +
      (i === tourSteps.length - 1 ? 'Finish' : 'Next') +
      '</button></div>';
    bd.classList.add('open');
    card.classList.add('open');
    placeTourCard(card, target);
    var next = document.getElementById('dr-tour-next');
    var back = document.getElementById('dr-tour-back');
    var skip = document.getElementById('dr-tour-skip');
    if (next) next.onclick = function () { showTourStep(i + 1); };
    if (back) back.onclick = function () { showTourStep(i - 1); };
    if (skip) skip.onclick = function () { endTour(true); };
  }

  function endTour(save) {
    clearTourHighlight();
    var bd = document.getElementById('dr-tour-bd');
    var card = document.getElementById('dr-tour-card');
    if (bd) bd.classList.remove('open');
    if (card) { card.classList.remove('open'); card.style.transform = ''; }
    if (save) { try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) {} }
  }

  function ensureTourUI() {
    if (!document.getElementById('portal-customer')) return;
    if (!document.getElementById('dr-tour-bd')) {
      var bd = document.createElement('div');
      bd.id = 'dr-tour-bd';
      document.body.appendChild(bd);
      bd.addEventListener('click', function () { endTour(true); });
    }
    if (!document.getElementById('dr-tour-card')) {
      var card = document.createElement('div');
      card.id = 'dr-tour-card';
      document.body.appendChild(card);
      card.addEventListener('click', function (e) { e.stopPropagation(); });
    }
    if (!document.getElementById('dr-tour-help')) {
      var help = document.createElement('button');
      help.type = 'button';
      help.id = 'dr-tour-help';
      help.textContent = '? Help tour';
      help.title = 'How to create a ticket';
      help.onclick = function () { startTour(); };
      document.body.appendChild(help);
    }
  }

  function startTour() {
    ensureTourUI();
    showTourStep(0);
  }

  function maybeAutoTour() {
    if (!document.getElementById('portal-customer')) return;
    try { if (localStorage.getItem(TOUR_KEY) === '1') return; } catch (e) {}
    setTimeout(function () { startTour(); }, 1200);
  }

  function tick() {
    injectCss();
    stripEditProfile();
    fixHeader();
    injectBranchField();
    ensureNotifFab();
    ensureTourUI();
  }

  injectCss();
  tick();
  setInterval(tick, 2000);
  setInterval(refreshBadge, 8000);
  setTimeout(refreshBadge, 1500);
  setTimeout(maybeAutoTour, 1800);

  try {
    var pb = document.getElementById('profile-body');
    if (pb) new MutationObserver(function () { injectBranchField(); }).observe(pb, { childList: true, subtree: true });
  } catch (e) {}

  window.DRCustomerUx = {
    refresh: tick,
    branches: BRANCHES,
    startTour: startTour,
    openNotifs: function () {
      var fab = document.getElementById('dr-notif-fab');
      if (fab) fab.click();
    }
  };
})();
