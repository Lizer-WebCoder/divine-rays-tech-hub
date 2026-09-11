/**
 * Divine Rays — presence + messaging FAB
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  var CH = 'dr-staff-presence', FAB = 'dr-staff-fab', PN = 'dr-staff-panel', CT = 'dr-chat-panel';
  var channel = null, me = null, people = [], online = {}, active = null, msgCh = null;

  function sb() { try { return window.DR && DR.sb && DR.sb(); } catch (e) { return null; } }
  function toast(m, t) { if (window.DR && DR.toast) DR.toast(m, t); }
  function getMe() {
    try { if (window.DR && DR.getProfile) { var p = DR.getProfile(); if (p && p.id) return p; } } catch (e) {}
    return me;
  }
  function esc(s) {
    return String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
  }
  function init(n) { n = (n || '?').trim(); return n ? n.charAt(0).toUpperCase() : '?'; }

  function css() {
    if (document.getElementById('dr-staff-presence-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-staff-presence-css';
    s.textContent = [
      '#'+FAB+'{position:fixed;right:1.15rem;bottom:1.15rem;z-index:12000;width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#7c6af0,#9b8afb);color:#fff;box-shadow:0 8px 28px rgba(124,106,240,.45);display:flex;align-items:center;justify-content:center}',
      '#'+FAB+':hover{transform:scale(1.06)}',
      '#'+FAB+' svg{width:22px;height:22px;fill:currentColor}',
      '#'+FAB+' .b{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#34d399;color:#0a1f16;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #0c0c12}',
      '#'+FAB+' .b.m{background:#f472b6;color:#1a0a14;top:auto;bottom:-2px}',
      '#'+PN+'-bd,#'+CT+'-bd{position:fixed;inset:0;z-index:12010;background:rgba(0,0,0,.45);opacity:0;pointer-events:none;transition:opacity .18s}',
      '#'+PN+'-bd.open,#'+CT+'-bd.open{opacity:1;pointer-events:auto}',
      '#'+PN+'{position:fixed;right:1.15rem;bottom:5rem;z-index:12020;width:min(360px,calc(100vw - 2rem));max-height:min(480px,72vh);background:var(--surface,#1a1a24);border:1px solid rgba(124,106,240,.28);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(12px) scale(.96);pointer-events:none;transition:opacity .18s,transform .18s}',
      '#'+PN+'.open{opacity:1;transform:none;pointer-events:auto}',
      '#'+PN+' .hd{display:flex;align-items:center;justify-content:space-between;padding:.8rem 1rem;border-bottom:1px solid rgba(255,255,255,.06)}',
      '#'+PN+' .hd h3{margin:0;font-size:.95rem;color:var(--text,#f0f0f8)}',
      '#'+PN+' .x{background:0;border:0;color:#8b8ba3;font-size:1.25rem;cursor:pointer}',
      '#'+PN+' .bd{overflow-y:auto;padding:.55rem .7rem .75rem;flex:1}',
      '#'+PN+' .sec{margin-bottom:.65rem}',
      '#'+PN+' .lb{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8b8ba3;margin:0 0 .35rem .15rem}',
      '#'+PN+' .row{display:flex;align-items:center;gap:.5rem;padding:.42rem .45rem;border-radius:9px;margin-bottom:.15rem;cursor:pointer;border:0;background:0;width:100%;text-align:left;font:inherit;color:inherit}',
      '#'+PN+' .row:hover{background:rgba(124,106,240,.1)}',
      '#'+PN+' .av{width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;background:linear-gradient(135deg,#7c6af0,#a78bfa);color:#fff;display:grid;place-items:center;font-size:.75rem;font-weight:700}',
      '#'+PN+' .meta{min-width:0;flex:1}',
      '#'+PN+' .nm{font-size:.84rem;font-weight:600;color:var(--text,#f0f0f8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '#'+PN+' .rl{font-size:.66rem;color:#8b8ba3;text-transform:capitalize}',
      '#'+PN+' .st{font-size:.62rem;font-weight:700;text-transform:uppercase;padding:.18rem .4rem;border-radius:6px}',
      '#'+PN+' .st.on{background:rgba(52,211,153,.15);color:#34d399}',
      '#'+PN+' .st.off{background:rgba(148,148,174,.12);color:#9494ae}',
      '#'+PN+' .em{font-size:.8rem;color:#8b8ba3;padding:.45rem;text-align:center}',
      '#'+PN+' .ft{padding:.4rem .85rem;border-top:1px solid rgba(255,255,255,.06);font-size:.62rem;color:#8b8ba3;text-align:center}',
      '#'+CT+'{position:fixed;right:1.15rem;bottom:5rem;z-index:12030;width:min(380px,calc(100vw - 2rem));height:min(460px,70vh);background:var(--surface,#1a1a24);border:1px solid rgba(124,106,240,.3);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.55);display:none;flex-direction:column;overflow:hidden}',
      '#'+CT+'.open{display:flex}',
      '#'+CT+' .hd{display:flex;align-items:center;gap:.55rem;padding:.7rem .85rem;border-bottom:1px solid rgba(255,255,255,.06)}',
      '#'+CT+' .bk{background:0;border:0;color:#8b8ba3;cursor:pointer;font-size:1.1rem}',
      '#'+CT+' .tt{flex:1;min-width:0}',
      '#'+CT+' .tt strong{display:block;font-size:.9rem;color:var(--text,#f0f0f8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '#'+CT+' .tt span{font-size:.68rem;color:#8b8ba3;text-transform:capitalize}',
      '#'+CT+' .ms{flex:1;overflow-y:auto;padding:.75rem;display:flex;flex-direction:column;gap:.45rem}',
      '#'+CT+' .bb{max-width:82%;padding:.45rem .65rem;border-radius:12px;font-size:.84rem;line-height:1.4;word-break:break-word}',
      '#'+CT+' .bb.me{align-self:flex-end;background:rgba(124,106,240,.35);color:#f0f0f8;border-bottom-right-radius:4px}',
      '#'+CT+' .bb.them{align-self:flex-start;background:rgba(255,255,255,.06);color:var(--text,#f0f0f8);border-bottom-left-radius:4px}',
      '#'+CT+' .tm{font-size:.6rem;opacity:.65;margin-top:.15rem}',
      '#'+CT+' .cp{display:flex;gap:.4rem;padding:.55rem .65rem;border-top:1px solid rgba(255,255,255,.06)}',
      '#'+CT+' .cp input{flex:1;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:.55rem .7rem;color:var(--text,#f0f0f8);font:inherit;font-size:.85rem}',
      '#'+CT+' .cp button{background:linear-gradient(135deg,#7c6af0,#9b8afb);border:0;border-radius:10px;color:#fff;padding:.55rem .85rem;font-weight:600;cursor:pointer;font:inherit;font-size:.82rem}',
      '#'+CT+' .hn{padding:.75rem;text-align:center;font-size:.8rem;color:#8b8ba3}',
      'html[data-theme="light"] #'+PN+',html[data-theme="light"] #'+CT+'{background:#fff;border-color:rgba(109,94,245,.22)}',
      'html[data-theme="light"] #'+PN+' .nm,html[data-theme="light"] #'+CT+' .tt strong{color:#1a1a2e}',
      'html[data-theme="light"] #'+CT+' .bb.them{background:rgba(15,15,30,.06);color:#1a1a2e}',
      'html[data-theme="light"] #'+CT+' .cp input{background:#f4f4f8;color:#1a1a2e}'
    ].join('');
    document.head.appendChild(s);
  }

  function av(p) {
    if (p.avatar_url) return '<img class="av" src="'+esc(p.avatar_url)+'" alt=""/>';
    return '<div class="av">'+esc(init(p.full_name||p.username))+'</div>';
  }

  function ui() {
    css();
    if (!document.getElementById(FAB)) {
      var f = document.createElement('button');
      f.type = 'button'; f.id = FAB; f.title = 'Messages & online';
      f.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg><span class="b" id="dr-fab-online-count">0</span><span class="b m" id="dr-fab-msg-count" style="display:none">0</span>';
      f.onclick = function (e) { e.preventDefault(); tog(); };
      document.body.appendChild(f);
    }
    if (!document.getElementById(PN)) {
      var bd = document.createElement('div'); bd.id = PN+'-bd'; bd.onclick = closeP; document.body.appendChild(bd);
      var p = document.createElement('div'); p.id = PN;
      p.innerHTML = '<div class="hd"><h3>People & messages</h3><button type="button" class="x">&times;</button></div><div class="bd" id="dr-sp-body"><div class="em">Loading…</div></div><div class="ft">Click someone to message</div>';
      p.querySelector('.x').onclick = closeP; document.body.appendChild(p);
    }
    if (!document.getElementById(CT)) {
      var cbd = document.createElement('div'); cbd.id = CT+'-bd'; cbd.onclick = closeC; document.body.appendChild(cbd);
      var c = document.createElement('div'); c.id = CT;
      c.innerHTML = '<div class="hd"><button type="button" class="bk" id="dr-ch-back">←</button><div class="tt"><strong id="dr-ch-name">Chat</strong><span id="dr-ch-role">—</span></div><button type="button" class="x" id="dr-ch-close">&times;</button></div><div class="ms" id="dr-ch-msgs"></div><div class="cp"><input id="dr-ch-input" placeholder="Type a message…" maxlength="2000"/><button type="button" id="dr-ch-send">Send</button></div>';
      document.body.appendChild(c);
      document.getElementById('dr-ch-back').onclick = function () { closeC(); openP(); };
      document.getElementById('dr-ch-close').onclick = closeC;
      document.getElementById('dr-ch-send').onclick = send;
      document.getElementById('dr-ch-input').onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); send(); } };
    }
  }

  function openP() { ui(); closeC(); document.getElementById(PN+'-bd').classList.add('open'); document.getElementById(PN).classList.add('open'); render(); refresh().then(render); }
  function closeP() { var a = document.getElementById(PN+'-bd'), b = document.getElementById(PN); if (a) a.classList.remove('open'); if (b) b.classList.remove('open'); }
  function tog() { var p = document.getElementById(PN); if (p && p.classList.contains('open')) closeP(); else openP(); }
  function on(id) { return !!(online[id]); }
  function role() { var p = getMe(); return ((p && p.role) || '').toLowerCase(); }
  function staffOnly() { var r = role(); return r !== 'agent' && r !== 'admin'; }

  function render() {
    var body = document.getElementById('dr-sp-body'); if (!body) return;
    var my = getMe() && getMe().id;
    var staff = [], users = [];
    people.forEach(function (p) {
      if (my && p.id === my) return;
      var r = (p.role || '').toLowerCase();
      if (r === 'agent' || r === 'admin') staff.push(p); else if (r === 'customer') users.push(p);
    });
    Object.keys(online).forEach(function (id) {
      if (my && id === my) return;
      if (people.some(function (p) { return p.id === id; })) return;
      var m = online[id], r = (m.role || 'customer').toLowerCase();
      var row = { id: id, full_name: m.name || 'User', role: r, avatar_url: m.avatar_url || null };
      if (r === 'agent' || r === 'admin') staff.push(row); else users.push(row);
    });
    function sort(a) { a.sort(function (x, y) { var xo = on(x.id) ? 0 : 1, yo = on(y.id) ? 0 : 1; return xo !== yo ? xo - yo : String(x.full_name || '').localeCompare(String(y.full_name || '')); }); }
    sort(staff); sort(users);
    function rows(list) {
      if (!list.length) return '<div class="em">None</div>';
      return list.map(function (p) {
        var o = on(p.id);
        return '<button type="button" class="row" data-id="'+esc(p.id)+'">'+av(p)+'<div class="meta"><div class="nm">'+esc(p.full_name||p.username||'User')+'</div><div class="rl">'+esc((p.role||'user'))+' · Message</div></div><span class="st '+(o?'on':'off')+'">'+(o?'Online':'Offline')+'</span></button>';
      }).join('');
    }
    var html = '<div class="sec"><div class="lb">Staff · '+staff.length+'</div>'+rows(staff)+'</div>';
    if (!staffOnly()) html += '<div class="sec"><div class="lb">Users · '+users.length+'</div>'+rows(users)+'</div>';
    else html += '<div class="sec"><div class="lb">Tip</div><div class="em">Message an agent or admin for help.</div></div>';
    body.innerHTML = html;
    body.querySelectorAll('.row[data-id]').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-id');
        var person = people.concat(staff, users).find(function (p) { return p.id === id; });
        if (person) openC(person);
      };
    });
    var badge = document.getElementById('dr-fab-online-count');
    if (badge) badge.textContent = String(Object.keys(online).length);
  }

  async function refresh() {
    var c = sb(); if (!c) return;
    try {
      var q = c.from('profiles').select('id,full_name,username,role,avatar_url');
      if (staffOnly()) q = q.in('role', ['agent', 'admin']);
      var r = await q;
      if (r.error) {
        var r2 = await c.from('profiles').select('id,full_name,username,role,avatar_url').in('role', ['agent', 'admin']);
        people = r2.error ? [] : (r2.data || []);
      } else people = r.data || [];
    } catch (e) {}
  }

  function sync() {
    if (!channel) return;
    var st = channel.presenceState() || {}, map = {};
    Object.keys(st).forEach(function (k) {
      (st[k] || []).forEach(function (m) {
        if (!m || !m.user_id) return;
        map[m.user_id] = { name: m.name || 'User', role: m.role || 'customer', avatar_url: m.avatar_url || null };
      });
    });
    online = map;
    var badge = document.getElementById('dr-fab-online-count');
    if (badge) badge.textContent = String(Object.keys(online).length);
    var p = document.getElementById(PN);
    if (p && p.classList.contains('open')) render();
  }

  async function start() {
    var c = sb(), p = getMe();
    if (!c || !p || !p.id) return;
    me = p; ui(); await refresh(); render();
    if (channel) { try { await c.removeChannel(channel); } catch (e) {} channel = null; }
    channel = c.channel(CH, { config: { presence: { key: p.id } } });
    channel.on('presence', { event: 'sync' }, sync);
    channel.on('presence', { event: 'join' }, sync);
    channel.on('presence', { event: 'leave' }, sync);
    channel.subscribe(async function (status) {
      if (status !== 'SUBSCRIBED') return;
      try {
        await channel.track({ user_id: p.id, name: p.full_name || p.username || 'User', role: (p.role || 'customer').toLowerCase(), avatar_url: p.avatar_url || null, online_at: Date.now() });
      } catch (e) {}
      sync();
    });
    subMsg();
  }

  function openC(person) {
    if (!person || !person.id) return;
    active = person; closeP(); ui();
    document.getElementById(CT+'-bd').classList.add('open');
    document.getElementById(CT).classList.add('open');
    document.getElementById('dr-ch-name').textContent = person.full_name || person.username || 'User';
    document.getElementById('dr-ch-role').textContent = (person.role || '') + (on(person.id) ? ' · Online' : ' · Offline');
    document.getElementById('dr-ch-msgs').innerHTML = '<div class="hn">Loading…</div>';
    document.getElementById('dr-ch-input').value = '';
    loadMsg(person.id);
  }
  function closeC() {
    active = null;
    var a = document.getElementById(CT+'-bd'), b = document.getElementById(CT);
    if (a) a.classList.remove('open'); if (b) b.classList.remove('open');
  }

  function fmt(iso) {
    try { return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; }
  }

  function draw(rows) {
    var box = document.getElementById('dr-ch-msgs'); if (!box) return;
    var my = getMe() && getMe().id;
    if (!rows || !rows.length) { box.innerHTML = '<div class="hn">No messages yet. Say hello.</div>'; return; }
    box.innerHTML = rows.map(function (m) {
      var mine = m.sender_id === my;
      return '<div class="bb '+(mine?'me':'them')+'">'+esc(m.body)+'<div class="tm">'+esc(fmt(m.created_at))+'</div></div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  async function loadMsg(oid) {
    var c = sb(), my = getMe() && getMe().id;
    if (!c || !my || !oid) return;
    try {
      var r = await c.from('messages').select('id,sender_id,recipient_id,body,created_at,read_at')
        .or('and(sender_id.eq.'+my+',recipient_id.eq.'+oid+'),and(sender_id.eq.'+oid+',recipient_id.eq.'+my+')')
        .order('created_at', { ascending: true }).limit(200);
      if (r.error) {
        document.getElementById('dr-ch-msgs').innerHTML = '<div class="hn">Run <code>sql/messages.sql</code> in Supabase once.<br/><small>'+esc(r.error.message)+'</small></div>';
        return;
      }
      draw(r.data || []);
      try { await c.from('messages').update({ read_at: new Date().toISOString() }).eq('recipient_id', my).eq('sender_id', oid).is('read_at', null); } catch (e) {}
      unread();
    } catch (e) {
      document.getElementById('dr-ch-msgs').innerHTML = '<div class="hn">Could not load messages.</div>';
    }
  }

  async function send() {
    var input = document.getElementById('dr-ch-input');
    if (!input || !active) return;
    var body = (input.value || '').trim(); if (!body) return;
    var c = sb(), my = getMe() && getMe().id; if (!c || !my) return;
    input.value = '';
    try {
      var pair = [my, active.id].sort();
      var channelId = pair[0] + '_' + pair[1];
      var payload = { sender_id: my, recipient_id: active.id, body: body, channel_id: channelId };
      var r = await c.from('messages').insert(payload).select('*').maybeSingle();
      if (r.error && /channel_id|null value/i.test(String(r.error.message || ''))) {
        delete payload.channel_id;
        r = await c.from('messages').insert(payload).select('*').maybeSingle();
      }
      if (r.error) { toast(r.error.message || 'Send failed — run sql/messages.sql', 'error'); input.value = body; return; }
      var box = document.getElementById('dr-ch-msgs');
      if (box && box.querySelector('.hn')) box.innerHTML = '';
      if (box && r.data) {
        var d = document.createElement('div'); d.className = 'bb me';
        d.innerHTML = esc(r.data.body)+'<div class="tm">'+esc(fmt(r.data.created_at))+'</div>';
        box.appendChild(d); box.scrollTop = box.scrollHeight;
      } else loadMsg(active.id);
    } catch (e) { toast('Send failed', 'error'); input.value = body; }
  }

  function subMsg() {
    var c = sb(), my = getMe() && getMe().id; if (!c || !my) return;
    try {
      if (msgCh) { try { c.removeChannel(msgCh); } catch (e) {} msgCh = null; }
      msgCh = c.channel('dr-messages-'+my).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'recipient_id=eq.'+my }, function (payload) {
        var row = payload.new;
        if (active && row.sender_id === active.id) loadMsg(active.id);
        else { unread(); toast('New message', 'info'); }
      }).subscribe();
    } catch (e) {}
    unread();
  }

  async function unread() {
    var c = sb(), my = getMe() && getMe().id; if (!c || !my) return;
    try {
      var r = await c.from('messages').select('id', { count: 'exact', head: true }).eq('recipient_id', my).is('read_at', null);
      var n = r.count || 0;
      var b = document.getElementById('dr-fab-msg-count');
      if (b) { if (n > 0) { b.style.display = 'flex'; b.textContent = String(n > 9 ? '9+' : n); } else b.style.display = 'none'; }
    } catch (e) {}
  }

  function show() {
    var pa = document.getElementById('portal-agent'), pc = document.getElementById('portal-customer');
    return (pa && pa.classList.contains('active')) || (pc && pc.classList.contains('active'));
  }

  function boot() {
    if (!show()) { var f = document.getElementById(FAB); if (f) f.style.display = 'none'; return; }
    ui(); var f = document.getElementById(FAB); if (f) f.style.display = 'flex'; start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 800); });
  else setTimeout(boot, 800);
  setTimeout(boot, 2000); setTimeout(boot, 5000);
  setInterval(function () {
    if (show()) { var f = document.getElementById(FAB); if (f) f.style.display = 'flex'; if (!channel) start(); }
    else { var f2 = document.getElementById(FAB); if (f2) f2.style.display = 'none'; closeP(); closeC(); }
  }, 4000);

  window.DRStaffPresence = { refresh: start, open: openP, close: closeP, openChat: openC };
})();
