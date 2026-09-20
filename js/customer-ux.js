/**
 * Divine Rays — customer UX:
 * - Branch dropdown on profile
 * - Remove center "Edit profile"
 * - Floating notifications button above chat FAB
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUSTOMER_UX) return;
  window.__DR_CUSTOMER_UX = 1;

  var BRANCHES = [
    'Abucay', 'Avenida', 'Pawing', 'Palo', 'Abuyog', 'Baybay', 'Sogod', 'Maasin',
    'Kananga', 'Ormoc', 'Calbayog', 'Catbalogan', 'Catarman', 'Dongon'
  ];

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
    '#dr-notif-fab{position:fixed;right:1.15rem;bottom:5.1rem;z-index:12005;width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;',
    'background:linear-gradient(135deg,#7c6af0,#9b8afb);color:#fff;box-shadow:0 8px 28px rgba(124,106,240,.45);',
    'display:flex;align-items:center;justify-content:center}',
    '#dr-notif-fab svg{width:22px;height:22px;fill:currentColor}',
    '#dr-notif-fab .b{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;',
    'background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;line-height:1}',
    '#dr-notif-fab .b.on{display:flex}',
    '#dr-notif-panel-bd{position:fixed;inset:0;z-index:12010;background:rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .18s}',
    '#dr-notif-panel-bd.open{opacity:1;pointer-events:auto}',
    '#dr-notif-panel{position:fixed;right:1.15rem;bottom:9rem;z-index:12020;width:min(360px,calc(100vw - 2rem));max-height:min(420px,60vh);',
    'background:var(--surface,#1a1a24);border:1px solid rgba(124,106,240,.3);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.5);',
    'display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(10px) scale(.97);pointer-events:none;transition:opacity .18s,transform .18s}',
    '#dr-notif-panel.open{opacity:1;transform:none;pointer-events:auto}',
    '#dr-notif-panel .hd{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;border-bottom:1px solid rgba(255,255,255,.08);font-weight:600}',
    '#dr-notif-panel .hd button{background:0;border:0;color:#9898b0;cursor:pointer;font-size:1.1rem}',
    '#dr-notif-panel .bd{overflow:auto;padding:.5rem;flex:1}',
    '#dr-notif-panel .row{padding:.65rem .75rem;border-radius:10px;margin-bottom:.35rem;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.06);cursor:pointer}',
    '#dr-notif-panel .row.unread{border-color:rgba(124,106,240,.35);background:rgba(124,106,240,.1)}',
    '#dr-notif-panel .row .t{font-size:.88rem;color:var(--text,#eeeef6);margin-bottom:.2rem}',
    '#dr-notif-panel .row .m{font-size:.75rem;color:#9898b0}',
    '#dr-notif-panel .empty{padding:1.25rem;text-align:center;color:#9898b0;font-size:.88rem}',
    '#pf-branch{width:100%;padding:.55rem .7rem;border-radius:8px;border:1px solid var(--border,#2e2e42);background:var(--bg,#0c0c12);color:var(--text,#eeeef6)}'
  ].join('');

  function injectCss() {
    if (document.getElementById('dr-customer-ux-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-customer-ux-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function stripEditProfile() {
    var btn = document.getElementById('btn-cust-profile');
    if (btn) btn.remove();
    document.querySelectorAll('#portal-customer .customer-header button, #portal-customer .customer-header a').forEach(function (el) {
      var t = (el.textContent || '').trim().toLowerCase();
      if (t === 'edit profile') el.remove();
    });
  }

  function ensureHeaderProfile() {
    var info = document.querySelector('.mode-bar .user-info') || document.querySelector('.user-info');
    if (!info) return;
    if (document.getElementById('btn-header-profile')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'btn-header-profile';
    b.className = 'btn btn-ghost btn-sm';
    b.textContent = 'Profile';
    b.addEventListener('click', function () {
      if (window.DRProfile && window.DRProfile.open) {
        window.DRProfile.open({ readOnly: false });
      } else {
        var x = document.getElementById('btn-profile');
        if (x) x.click();
      }
    });
    var logout = document.getElementById('btn-logout');
    if (logout && logout.parentNode === info) info.insertBefore(b, logout);
    else info.appendChild(b);
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
      '<label for="pf-branch">Branch</label>' +
      '<select id="pf-branch">' +
      '<option value="">Select branch…</option>' +
      BRANCHES.map(function (b) {
        return '<option value="' + esc(b) + '"' + (b === current ? ' selected' : '') + '>' + esc(b) + '</option>';
      }).join('') +
      '</select>';
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
    } catch (e) {
      console.warn('[branch]', e);
    }
  }

  function ensureNotifFab() {
    if (document.getElementById('dr-notif-fab')) return;
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'dr-notif-fab';
    fab.title = 'Notifications';
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>' +
      '<span class="b" id="dr-notif-count">0</span>';
    document.body.appendChild(fab);

    var bd = document.createElement('div');
    bd.id = 'dr-notif-panel-bd';
    document.body.appendChild(bd);

    var panel = document.createElement('div');
    panel.id = 'dr-notif-panel';
    panel.innerHTML =
      '<div class="hd"><span>Notifications</span><button type="button" id="dr-notif-close" aria-label="Close">&times;</button></div>' +
      '<div class="bd" id="dr-notif-body"><div class="empty">Loading…</div></div>';
    document.body.appendChild(panel);

    function close() {
      panel.classList.remove('open');
      bd.classList.remove('open');
    }
    function open() {
      panel.classList.add('open');
      bd.classList.add('open');
      loadNotifications();
    }
    fab.onclick = function () {
      if (panel.classList.contains('open')) close();
      else open();
    };
    bd.onclick = close;
    document.getElementById('dr-notif-close').onclick = close;
  }

  function setBadge(n) {
    var el = document.getElementById('dr-notif-count');
    if (!el) return;
    if (n > 0) {
      el.textContent = n > 99 ? '99+' : String(n);
      el.classList.add('on');
    } else {
      el.classList.remove('on');
    }
  }

  async function loadNotifications() {
    var body = document.getElementById('dr-notif-body');
    if (!body) return;
    var client = sb();
    var p = profile();
    if (!client || !p || !p.id) {
      body.innerHTML = '<div class="empty">Sign in to see notifications</div>';
      return;
    }
    try {
      var r = await client
        .from('notifications')
        .select('*')
        .eq('user_id', p.id)
        .order('created_at', { ascending: false })
        .limit(40);
      if (r.error) {
        body.innerHTML = '<div class="empty">No notifications yet</div>';
        setBadge(0);
        return;
      }
      var rows = r.data || [];
      var unread = rows.filter(function (x) { return !x.read; }).length;
      setBadge(unread);
      if (!rows.length) {
        body.innerHTML = '<div class="empty">No notifications yet</div>';
        return;
      }
      body.innerHTML = rows
        .map(function (n) {
          var title = n.title || n.type || 'Update';
          var msg = n.body || n.message || '';
          var when = '';
          try {
            when = new Date(n.created_at).toLocaleString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
          } catch (e) {}
          return (
            '<div class="row' + (n.read ? '' : ' unread') + '" data-id="' + esc(n.id) + '">' +
            '<div class="t">' + esc(title) + '</div>' +
            (msg ? '<div class="m">' + esc(msg) + '</div>' : '') +
            '<div class="m">' + esc(when) + '</div></div>'
          );
        })
        .join('');

      body.querySelectorAll('.row').forEach(function (row) {
        row.onclick = async function () {
          var id = row.getAttribute('data-id');
          if (!id) return;
          try {
            await client.from('notifications').update({ read: true }).eq('id', id);
          } catch (e) {}
          row.classList.remove('unread');
          setBadge(body.querySelectorAll('.row.unread').length);
        };
      });
    } catch (e) {
      body.innerHTML = '<div class="empty">Could not load notifications</div>';
    }
  }

  async function refreshBadge() {
    var client = sb();
    var p = profile();
    if (!client || !p || !p.id) return;
    try {
      var r = await client
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', p.id)
        .eq('read', false);
      setBadge(r.count || 0);
    } catch (e) {}
  }

  function tick() {
    injectCss();
    stripEditProfile();
    ensureHeaderProfile();
    injectBranchField();
    ensureNotifFab();
  }

  injectCss();
  tick();
  setInterval(tick, 2000);
  setInterval(refreshBadge, 8000);
  setTimeout(refreshBadge, 1500);

  try {
    var pb = document.getElementById('profile-body');
    if (pb) {
      new MutationObserver(function () { injectBranchField(); }).observe(pb, { childList: true, subtree: true });
    }
  } catch (e) {}

  window.DRCustomerUx = {
    refresh: tick,
    branches: BRANCHES,
    openNotifs: function () {
      var fab = document.getElementById('dr-notif-fab');
      if (fab) fab.click();
    }
  };
})();
