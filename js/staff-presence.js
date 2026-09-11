/**
 * Divine Rays — floating staff online/offline panel
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  var CHANNEL = 'dr-staff-presence';
  var FAB_ID = 'dr-staff-fab';
  var PANEL_ID = 'dr-staff-panel';
  var channel = null;
  var me = null;
  var staffCache = [];
  var onlineMap = {};

  function sb() {
    try {
      if (window.DR && typeof DR.sb === 'function') return DR.sb();
    } catch (e) {}
    return null;
  }

  function getMe() {
    try {
      if (window.DR && typeof DR.getProfile === 'function') {
        var p = DR.getProfile();
        if (p && p.id) return p;
      }
    } catch (e) {}
    return me;
  }

  function injectStyles() {
    if (document.getElementById('dr-staff-presence-css')) return;
    var st = document.createElement('style');
    st.id = 'dr-staff-presence-css';
    st.textContent = [
      '#' + FAB_ID + '{',
      'position:fixed;right:1.25rem;bottom:1.25rem;z-index:12000;',
      'width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;',
      'background:linear-gradient(135deg,#7c6af0,#9b8afb);color:#fff;',
      'box-shadow:0 8px 28px rgba(124,106,240,.45),0 2px 8px rgba(0,0,0,.35);',
      'display:flex;align-items:center;justify-content:center;',
      'transition:transform .15s ease,box-shadow .15s ease',
      '}',
      '#' + FAB_ID + ':hover{transform:scale(1.06);box-shadow:0 10px 32px rgba(124,106,240,.55)}',
      '#' + FAB_ID + ' svg{width:22px;height:22px;fill:currentColor}',
      '#' + FAB_ID + ' .dr-fab-badge{',
      'position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 5px;',
      'border-radius:9px;background:#34d399;color:#0a1f16;font-size:10px;font-weight:700;',
      'display:flex;align-items:center;justify-content:center;border:2px solid #0c0c12',
      '}',
      '#' + PANEL_ID + '-backdrop{',
      'position:fixed;inset:0;z-index:12010;background:rgba(0,0,0,.45);',
      'opacity:0;pointer-events:none;transition:opacity .18s ease',
      '}',
      '#' + PANEL_ID + '-backdrop.open{opacity:1;pointer-events:auto}',
      '#' + PANEL_ID + '{',
      'position:fixed;right:1.25rem;bottom:5rem;z-index:12020;',
      'width:min(340px,calc(100vw - 2rem));max-height:min(420px,70vh);',
      'background:var(--surface,#1a1a24);border:1px solid rgba(124,106,240,.28);',
      'border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.5);',
      'display:flex;flex-direction:column;overflow:hidden;',
      'opacity:0;transform:translateY(12px) scale(.96);pointer-events:none;',
      'transition:opacity .18s ease,transform .18s ease',
      '}',
      '#' + PANEL_ID + '.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}',
      '#' + PANEL_ID + ' .dr-sp-head{',
      'display:flex;align-items:center;justify-content:space-between;',
      'padding:.85rem 1rem;border-bottom:1px solid rgba(255,255,255,.06)',
      '}',
      '#' + PANEL_ID + ' .dr-sp-head h3{margin:0;font-size:.95rem;font-weight:650;color:var(--text,#f0f0f8)}',
      '#' + PANEL_ID + ' .dr-sp-close{',
      'background:transparent;border:none;color:var(--text-muted,#8b8ba3);',
      'font-size:1.25rem;cursor:pointer;line-height:1;padding:.15rem .35rem',
      '}',
      '#' + PANEL_ID + ' .dr-sp-body{overflow-y:auto;padding:.65rem .75rem .85rem;flex:1}',
      '#' + PANEL_ID + ' .dr-sp-section{margin-bottom:.75rem}',
      '#' + PANEL_ID + ' .dr-sp-label{',
      'font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;',
      'color:var(--text-muted,#8b8ba3);margin:0 0 .4rem .15rem',
      '}',
      '#' + PANEL_ID + ' .dr-sp-row{',
      'display:flex;align-items:center;gap:.55rem;padding:.45rem .5rem;',
      'border-radius:9px;margin-bottom:.2rem',
      '}',
      '#' + PANEL_ID + ' .dr-sp-row:hover{background:rgba(124,106,240,.08)}',
      '#' + PANEL_ID + ' .dr-sp-av{',
      'width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;',
      'background:linear-gradient(135deg,#7c6af0,#a78bfa);color:#fff;',
      'display:grid;place-items:center;font-size:.75rem;font-weight:700',
      '}',
      '#' + PANEL_ID + ' .dr-sp-meta{min-width:0;flex:1}',
      '#' + PANEL_ID + ' .dr-sp-name{font-size:.85rem;font-weight:600;color:var(--text,#f0f0f8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '#' + PANEL_ID + ' .dr-sp-role{font-size:.68rem;color:var(--text-muted,#8b8ba3);text-transform:capitalize}',
      '#' + PANEL_ID + ' .dr-sp-status{',
      'font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;',
      'padding:.2rem .45rem;border-radius:6px;flex-shrink:0',
      '}',
      '#' + PANEL_ID + ' .dr-sp-status.on{background:rgba(52,211,153,.15);color:#34d399}',
      '#' + PANEL_ID + ' .dr-sp-status.off{background:rgba(148,148,174,.12);color:#9494ae}',
      '#' + PANEL_ID + ' .dr-sp-empty{font-size:.8rem;color:var(--text-muted,#8b8ba3);padding:.5rem;text-align:center}',
      '#' + PANEL_ID + ' .dr-sp-foot{',
      'padding:.45rem .85rem;border-top:1px solid rgba(255,255,255,.06);',
      'font-size:.65rem;color:var(--text-muted,#8b8ba3);text-align:center',
      '}',
      'html[data-theme="light"] #' + PANEL_ID + '{background:#fff;border-color:rgba(109,94,245,.22)}',
      'html[data-theme="light"] #' + PANEL_ID + ' .dr-sp-name{color:#1a1a2e}',
      'html[data-theme="light"] #' + FAB_ID + ' .dr-fab-badge{border-color:#fff}'
    ].join('');
    document.head.appendChild(st);
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initial(name) {
    var n = (name || '?').trim();
    return n ? n.charAt(0).toUpperCase() : '?';
  }

  function avatarHtml(person) {
    if (person.avatar_url) {
      return '<img class="dr-sp-av" src="' + esc(person.avatar_url) + '" alt="" />';
    }
    return '<div class="dr-sp-av">' + esc(initial(person.full_name || person.username)) + '</div>';
  }

  function ensureUI() {
    injectStyles();
    if (!document.getElementById(FAB_ID)) {
      var fab = document.createElement('button');
      fab.type = 'button';
      fab.id = FAB_ID;
      fab.title = 'Staff online status';
      fab.setAttribute('aria-label', 'Staff online status');
      fab.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>' +
        '<span class="dr-fab-badge" id="dr-fab-online-count">0</span>';
      fab.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
      });
      document.body.appendChild(fab);
    }
    if (!document.getElementById(PANEL_ID)) {
      var bd = document.createElement('div');
      bd.id = PANEL_ID + '-backdrop';
      bd.addEventListener('click', closePanel);
      document.body.appendChild(bd);

      var panel = document.createElement('div');
      panel.id = PANEL_ID;
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Staff online status');
      panel.innerHTML =
        '<div class="dr-sp-head"><h3>Staff status</h3><button type="button" class="dr-sp-close" aria-label="Close">&times;</button></div>' +
        '<div class="dr-sp-body" id="dr-sp-body"><div class="dr-sp-empty">Loading…</div></div>' +
        '<div class="dr-sp-foot">Live presence · agents &amp; admins</div>';
      panel.querySelector('.dr-sp-close').addEventListener('click', closePanel);
      document.body.appendChild(panel);
    }
  }

  function openPanel() {
    ensureUI();
    document.getElementById(PANEL_ID + '-backdrop').classList.add('open');
    document.getElementById(PANEL_ID).classList.add('open');
    renderPanel();
    refreshStaffList().then(renderPanel);
  }

  function closePanel() {
    var bd = document.getElementById(PANEL_ID + '-backdrop');
    var p = document.getElementById(PANEL_ID);
    if (bd) bd.classList.remove('open');
    if (p) p.classList.remove('open');
  }

  function togglePanel() {
    var p = document.getElementById(PANEL_ID);
    if (p && p.classList.contains('open')) closePanel();
    else openPanel();
  }

  function isOnline(id) {
    return !!(onlineMap && onlineMap[id]);
  }

  function renderPanel() {
    var body = document.getElementById('dr-sp-body');
    if (!body) return;

    var online = [];
    var offline = [];
    staffCache.forEach(function (p) {
      if (isOnline(p.id)) online.push(p);
      else offline.push(p);
    });

    Object.keys(onlineMap).forEach(function (id) {
      if (staffCache.some(function (p) { return p.id === id; })) return;
      var meta = onlineMap[id];
      online.push({
        id: id,
        full_name: meta.name || 'Staff',
        role: meta.role || 'agent',
        avatar_url: meta.avatar_url || null
      });
    });

    online.sort(function (a, b) {
      return String(a.full_name || '').localeCompare(String(b.full_name || ''));
    });
    offline.sort(function (a, b) {
      return String(a.full_name || '').localeCompare(String(b.full_name || ''));
    });

    function rows(list, on) {
      if (!list.length) return '<div class="dr-sp-empty">None</div>';
      return list.map(function (p) {
        var role = (p.role || 'agent').toLowerCase();
        return (
          '<div class="dr-sp-row">' +
            avatarHtml(p) +
            '<div class="dr-sp-meta">' +
              '<div class="dr-sp-name">' + esc(p.full_name || p.username || 'User') + '</div>' +
              '<div class="dr-sp-role">' + esc(role) + '</div>' +
            '</div>' +
            '<span class="dr-sp-status ' + (on ? 'on' : 'off') + '">' + (on ? 'Online' : 'Offline') + '</span>' +
          '</div>'
        );
      }).join('');
    }

    body.innerHTML =
      '<div class="dr-sp-section"><div class="dr-sp-label">Online · ' + online.length + '</div>' + rows(online, true) + '</div>' +
      '<div class="dr-sp-section"><div class="dr-sp-label">Offline · ' + offline.length + '</div>' + rows(offline, false) + '</div>';

    var badge = document.getElementById('dr-fab-online-count');
    if (badge) badge.textContent = String(online.length);
  }

  async function refreshStaffList() {
    var client = sb();
    if (!client) return;
    try {
      var r = await client
        .from('profiles')
        .select('id,full_name,username,role,avatar_url')
        .in('role', ['agent', 'admin']);
      if (r.error) {
        console.warn('staff list', r.error.message);
        return;
      }
      staffCache = (r.data || []).filter(function (p) {
        var role = (p.role || '').toLowerCase();
        return role === 'agent' || role === 'admin';
      });
    } catch (e) {
      console.warn('staff list fail', e);
    }
  }

  function syncPresenceFromChannel() {
    if (!channel) return;
    var state = channel.presenceState() || {};
    var map = {};
    Object.keys(state).forEach(function (key) {
      var metas = state[key] || [];
      metas.forEach(function (m) {
        if (!m || !m.user_id) return;
        map[m.user_id] = {
          name: m.name || 'Staff',
          role: m.role || 'agent',
          avatar_url: m.avatar_url || null,
          at: m.online_at || 0
        };
      });
    });
    onlineMap = map;
    var badge = document.getElementById('dr-fab-online-count');
    if (badge) badge.textContent = String(Object.keys(onlineMap).length);
    var p = document.getElementById(PANEL_ID);
    if (p && p.classList.contains('open')) renderPanel();
  }

  async function startPresence() {
    var client = sb();
    var profile = getMe();
    if (!client || !profile || !profile.id) return;

    me = profile;
    var role = (profile.role || '').toLowerCase();
    var isStaff = role === 'agent' || role === 'admin';

    ensureUI();
    await refreshStaffList();
    renderPanel();

    if (channel) {
      try { await client.removeChannel(channel); } catch (e) {}
      channel = null;
    }

    channel = client.channel(CHANNEL, {
      config: { presence: { key: profile.id } }
    });

    channel.on('presence', { event: 'sync' }, syncPresenceFromChannel);
    channel.on('presence', { event: 'join' }, syncPresenceFromChannel);
    channel.on('presence', { event: 'leave' }, syncPresenceFromChannel);

    channel.subscribe(async function (status) {
      if (status !== 'SUBSCRIBED') return;
      if (isStaff) {
        try {
          await channel.track({
            user_id: profile.id,
            name: profile.full_name || profile.username || 'Staff',
            role: role,
            avatar_url: profile.avatar_url || null,
            online_at: Date.now()
          });
        } catch (e) {
          console.warn('presence track', e);
        }
      }
      syncPresenceFromChannel();
    });
  }

  function shouldShow() {
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pa && pa.classList.contains('active')) return true;
    if (pc && pc.classList.contains('active')) return true;
    return false;
  }

  function boot() {
    if (!shouldShow()) {
      var fab = document.getElementById(FAB_ID);
      if (fab) fab.style.display = 'none';
      return;
    }
    ensureUI();
    var fab = document.getElementById(FAB_ID);
    if (fab) fab.style.display = 'flex';
    startPresence();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 800);
    });
  } else {
    setTimeout(boot, 800);
  }

  setTimeout(boot, 2000);
  setTimeout(boot, 5000);

  setInterval(function () {
    if (shouldShow()) {
      var fab = document.getElementById(FAB_ID);
      if (fab) fab.style.display = 'flex';
      if (!channel) startPresence();
    } else {
      var fab2 = document.getElementById(FAB_ID);
      if (fab2) fab2.style.display = 'none';
      closePanel();
    }
  }, 4000);

  window.DRStaffPresence = { refresh: startPresence, open: openPanel, close: closePanel };
})();
