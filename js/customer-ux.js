/**
 * Divine Rays — customer UX (tour only for customers)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUSTOMER_UX_V4) return;
  window.__DR_CUSTOMER_UX_V4 = 1;
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
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isCustomerPortalActive() {
    var pc = document.getElementById('portal-customer');
    if (!pc || pc.hidden) return false;
    var pa = document.getElementById('portal-agent');
    if (pa && pa.classList.contains('active')) return false;
    try {
      var p = profile();
      if (p && p.role && p.role !== 'customer') return false;
    } catch (e) {}
    if (pc.classList.contains('active')) return true;
    var st = window.getComputedStyle(pc);
    return st.display !== 'none' && pc.offsetHeight > 40;
  }

  var CSS = [
    '#btn-cust-profile{display:none!important}',
    '#cust-notifications,.cust-notifications,.notif-banner{display:none!important}',
    'body:has(#portal-agent.active) #dr-tour-help,body:has(#portal-agent.active) #dr-tour-bd,body:has(#portal-agent.active) #dr-tour-card{display:none!important}',
    '.mode-bar .user-info .btn-profile-dup{display:none!important}',
    '#dr-notif-fab{position:fixed;right:1.15rem;bottom:5.1rem;z-index:12005;width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#7c6af0,#9b8afb);color:#fff;box-shadow:0 8px 28px rgba(124,106,240,.45);display:flex;align-items:center;justify-content:center}',
    '#dr-notif-fab svg{width:22px;height:22px;fill:currentColor}',
    '#dr-notif-fab .b{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center}',
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
    '#pf-branch{width:100%;padding:.55rem .7rem;border-radius:8px;border:1px solid var(--border,#2e2e42);background:var(--bg,#0c0c12);color:var(--text,#eeeef6)}',
    '#dr-tour-bd{position:fixed;inset:0;z-index:13000;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .2s}',
    '#dr-tour-bd.open{opacity:1;pointer-events:auto}',
    '#dr-tour-card{position:fixed;z-index:13010;width:min(360px,calc(100vw - 2rem));background:var(--surface,#1a1a24);border:1px solid rgba(124,106,240,.4);border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.55);padding:1.1rem 1.2rem;color:var(--text,#eeeef6);opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s}',
    '#dr-tour-card.open{opacity:1;transform:none}',
    '#dr-tour-card h3{margin:0 0 .4rem;font-size:1.05rem;color:#c4b5fd}',
    '#dr-tour-card p{margin:0 0 .85rem;font-size:.9rem;line-height:1.45;color:#b8b8cc}',
    '#dr-tour-card .tour-actions{display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap}',
    '#dr-tour-card .tour-step{font-size:.75rem;color:#9898b0;margin-bottom:.35rem}',
    '.dr-tour-hl{outline:2px solid #a78bfa!important;outline-offset:3px!important;box-shadow:0 0 0 6px rgba(124,106,240,.25)!important;border-radius:10px!important;z-index:13005}',
    '#dr-tour-help{position:fixed;left:1rem;bottom:1.15rem;z-index:12000;border:none;border-radius:999px;padding:.55rem 1rem;cursor:pointer;background:rgba(124,106,240,.2);color:#c4b5fd;border:1px solid rgba(124,106,240,.4);font-size:.82rem;font-weight:600}'
  ].join('');

  function injectCss() {
    var s = document.getElementById('dr-customer-ux-css');
    if (!s) { s = document.createElement('style'); s.id = 'dr-customer-ux-css'; document.head.appendChild(s); }
    s.textContent = CSS;
  }

  function stripEditProfile() {
    var btn = document.getElementById('btn-cust-profile');
    if (btn) btn.remove();
    document.querySelectorAll('#cust-notifications, .cust-notifications, .notif-banner').forEach(function (el) { el.remove(); });
  }

  function fixHeader() {
    var info = document.querySelector('.mode-bar .user-info') || document.querySelector('.user-info');
    if (!info) return;
    var profiles = [];
    info.querySelectorAll('button, a').forEach(function (el) {
      if ((el.textContent || '').trim().toLowerCase() === 'profile') profiles.push(el);
    });
    profiles.forEach(function (el, i) {
      if (i === 0) { el.id = el.id || 'btn-header-profile'; el.classList.remove('btn-profile-dup'); }
      else el.classList.add('btn-profile-dup');
    });
    info.querySelectorAll('#header-avatar-chip, .header-avatar-chip').forEach(function (c, i) { if (i > 0) c.style.display = 'none'; });
    info.querySelectorAll('#btn-theme, .btn-theme').forEach(function (t, i) { if (i > 0) t.style.display = 'none'; });
    if (!profiles.length) {
      var b = document.createElement('button');
      b.type = 'button'; b.id = 'btn-header-profile'; b.className = 'btn btn-ghost btn-sm'; b.textContent = 'Profile';
      b.addEventListener('click', function () {
        if (window.DRProfile && window.DRProfile.open) window.DRProfile.open({ readOnly: false });
      });
      var logout = document.getElementById('btn-logout');
      if (logout && logout.parentNode === info) info.insertBefore(b, logout); else info.appendChild(b);
    }
  }

  function injectBranchField() {
    var body = document.getElementById('profile-body');
    if (!body || document.getElementById('pf-branch')) return;
    var grid = body.querySelector('.profile-grid');
    if (!grid) return;
    var current = '';
    try { var p = profile(); if (p && p.branch) current = p.branch; } catch (e) {}
    var wrap = document.createElement('div');
    wrap.className = 'form-group'; wrap.id = 'pf-branch-wrap';
    wrap.innerHTML = '<label for="pf-branch">Branch</label><select id="pf-branch"><option value="">Select branch…</option>' +
      BRANCHES.map(function (b) { return '<option value="' + esc(b) + '"' + (b === current ? ' selected' : '') + '>' + esc(b) + '</option>'; }).join('') + '</select>';
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
    var client = sb(); var p = profile();
    if (!sel || !client || !p || !p.id) return;
    try {
      var r = await client.from('profiles').select('branch').eq('id', p.id).maybeSingle();
      if (r.data && r.data.branch) sel.value = r.data.branch;
    } catch (e) {}
  }

  async function saveBranch() {
    var sel = document.getElementById('pf-branch');
    var client = sb(); var p = profile();
    if (!sel || !client || !p || !p.id) return;
    try {
      await client.from('profiles').update({ branch: sel.value || null }).eq('id', p.id);
      if (p) p.branch = sel.value || null;
    } catch (e) {}
  }

  function ensureNotifFab() {
    if (!isCustomerPortalActive()) return;
    if (document.getElementById('dr-notif-fab')) return;
    var fab = document.createElement('button');
    fab.type = 'button'; fab.id = 'dr-notif-fab'; fab.title = 'Notifications';
    fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/></svg><span class="b" id="dr-notif-count">0</span>';
    document.body.appendChild(fab);
    var bd = document.createElement('div'); bd.id = 'dr-notif-panel-bd'; document.body.appendChild(bd);
    var panel = document.createElement('div'); panel.id = 'dr-notif-panel';
    panel.innerHTML = '<div class="hd"><span>Notifications</span><button type="button" id="dr-notif-close">&times;</button></div><div class="bd" id="dr-notif-body"><div class="empty">Loading…</div></div>';
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
    var client = sb(); var p = profile();
    if (!client || !p || !p.id) { body.innerHTML = '<div class="empty">Sign in to see notifications</div>'; return; }
    try {
      var r = await client.from('notifications').select('*').eq('user_id', p.id).order('created_at', { ascending: false }).limit(40);
      if (r.error || !r.data || !r.data.length) { body.innerHTML = '<div class="empty">No notifications yet</div>'; setBadge(0); return; }
      var rows = r.data;
      setBadge(rows.filter(function (x) { return !x.read; }).length);
      body.innerHTML = rows.map(function (n) {
        var title = n.title || n.type || 'Update';
        var msg = n.body || n.message || '';
        var when = '';
        try { when = new Date(n.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
        return '<div class="row' + (n.read ? '' : ' unread') + '" data-id="' + esc(n.id) + '"><div class="t">' + esc(title) + '</div>' + (msg ? '<div class="m">' + esc(msg) + '</div>' : '') + '<div class="row-foot"><span class="m">' + esc(when) + '</span><button type="button" class="del-btn" data-del="' + esc(n.id) + '">Delete</button></div></div>';
      }).join('');
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
          if (!body.querySelector('.row')) { body.innerHTML = '<div class="empty">No notifications yet</div>'; setBadge(0); }
          else setBadge(body.querySelectorAll('.row.unread').length);
        };
      });
    } catch (e) {
      body.innerHTML = '<div class="empty">Could not load notifications</div>';
    }
  }

  async function refreshBadge() {
    if (!isCustomerPortalActive()) return;
    var client = sb(); var p = profile();
    if (!client || !p || !p.id) return;
    try {
      var r = await client.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', p.id).eq('read', false);
      setBadge(r.count || 0);
    } catch (e) {}
  }

  var tourSteps = [
    { title: 'Welcome to Divine Rays Support', body: 'This short guide shows how to submit a support ticket. Reopen anytime with the Help tour button at the bottom left.', target: null },
    { title: '1. Open Submit Ticket', body: 'Click the purple “Submit Ticket” tab. This is where you describe your problem so our team can help.', target: '.customer-tabs .ctab[data-ctab="submit"], .customer-tabs button.ctab:first-child' },
    { title: '2. Write a short title', body: 'In “What do you need help with?” type a clear title, e.g. “Printer not working”.', target: '#c-title, #customer-form input[type="text"]' },
    { title: '3. Choose urgency & category', body: 'Pick how urgent it is and a category. This helps agents prioritize your request.', target: '#c-priority, #c-category, .ticket-form select' },
    { title: '4. Describe the problem', body: 'Explain what happened, when it started, and any error messages.', target: '#c-description, .ticket-form textarea' },
    { title: '5. Submit', body: 'Click the purple “Submit Ticket” button. You’ll get a ticket ID (like DR-1025) to track progress.', target: '#customer-form button[type="submit"]' },
    { title: 'Other tabs', body: 'My Tickets — your requests. Track by ID — look up a number. Profile (top right) — name, photo, branch.', target: '.customer-tabs' },
    { title: 'Notifications & chat', body: 'The bell shows alerts. The chat bubble is for messaging support when available.', target: null }
  ];

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
    var pad = 12, vw = window.innerWidth, vh = window.innerHeight;
    card.style.left = ''; card.style.top = ''; card.style.transform = '';
    if (!target) { card.style.left = '50%'; card.style.top = '50%'; card.style.transform = 'translate(-50%, -50%)'; return; }
    var r = target.getBoundingClientRect();
    var cardW = Math.min(360, vw - 24);
    var left = Math.min(Math.max(pad, r.left), vw - cardW - pad);
    var top = r.bottom + 12;
    if (top + 220 > vh) top = Math.max(pad, r.top - 230);
    card.style.left = left + 'px'; card.style.top = top + 'px';
  }

  function showTourStep(i) {
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
    }
    card.innerHTML =
      '<div class="tour-step">Step ' + (i + 1) + ' of ' + tourSteps.length + '</div>' +
      '<h3>' + esc(step.title) + '</h3><p style="white-space:pre-line">' + esc(step.body) + '</p>' +
      '<div class="tour-actions">' +
      (i > 0 ? '<button type="button" class="btn btn-ghost btn-sm" id="dr-tour-back">Back</button>' : '') +
      '<button type="button" class="btn btn-ghost btn-sm" id="dr-tour-skip">Skip</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="dr-tour-next">' + (i === tourSteps.length - 1 ? 'Finish' : 'Next') + '</button></div>';
    bd.classList.add('open'); card.classList.add('open');
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
    if (!isCustomerPortalActive()) {
      var h = document.getElementById('dr-tour-help');
      if (h) h.style.setProperty('display', 'none', 'important');
      return;
    }
    if (!document.getElementById('dr-tour-bd')) {
      var bd = document.createElement('div'); bd.id = 'dr-tour-bd'; document.body.appendChild(bd);
      bd.addEventListener('click', function () { endTour(true); });
    }
    if (!document.getElementById('dr-tour-card')) {
      var card = document.createElement('div'); card.id = 'dr-tour-card'; document.body.appendChild(card);
      card.addEventListener('click', function (e) { e.stopPropagation(); });
    }
    if (!document.getElementById('dr-tour-help')) {
      var help = document.createElement('button');
      help.type = 'button'; help.id = 'dr-tour-help'; help.textContent = '? Help tour';
      help.onclick = function () { startTour(); };
      document.body.appendChild(help);
    } else {
      document.getElementById('dr-tour-help').style.removeProperty('display');
    }
  }

  function startTour() {
    if (!isCustomerPortalActive()) return;
    ensureTourUI();
    showTourStep(0);
  }

  function maybeAutoTour() {
    if (!isCustomerPortalActive()) return;
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
  setInterval(tick, 2500);
  setInterval(refreshBadge, 10000);
  setTimeout(refreshBadge, 1500);
  setTimeout(maybeAutoTour, 1800);

  window.DRCustomerUx = { refresh: tick, branches: BRANCHES, startTour: startTour };
})();
