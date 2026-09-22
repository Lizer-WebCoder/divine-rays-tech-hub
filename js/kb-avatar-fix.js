/**
 * Divine Rays — full-width Knowledge Base + photo avatars on ticket chips
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_KB_AVATAR_FIX) return;
  window.__DR_KB_AVATAR_FIX = 1;

  var CSS = [
    '#portal-agent.active #view-kb,',
    '#portal-agent.active .view-kb,',
    '#portal-agent.active [data-view="kb"],',
    '#portal-agent.active .kb-manage,',
    '#portal-agent.active #kb-manage-list,',
    '#portal-agent.active .kb-table {',
    '  width:100%!important;max-width:none!important;box-sizing:border-box!important;',
    '}',
    '#portal-agent.active main.main:has(#view-kb:not([hidden])),',
    '#portal-agent.active main.main:has(.view-kb.active),',
    '#portal-agent.active #view-kb:not([hidden]),',
    '#portal-agent.active #view-kb.active {',
    '  width:auto!important;max-width:none!important;flex:1 1 auto!important;',
    '}',
    '#portal-agent.active .kb-table,',
    '#portal-agent.active table.perf-table.kb-table {',
    '  width:100%!important;min-width:100%!important;table-layout:auto!important;',
    '}',
    '#portal-agent.active .kb-table th,',
    '#portal-agent.active .kb-table td {',
    '  white-space:nowrap;',
    '}',
    '#portal-agent.active .kb-table td:first-child {',
    '  white-space:normal;width:40%;',
    '}',
    '#portal-agent.active #kb-manage-search,',
    '#portal-agent.active input[placeholder*="Search articles"] {',
    '  width:100%!important;max-width:none!important;box-sizing:border-box!important;',
    '}',
    '.ticket-av{overflow:hidden!important;padding:0!important}',
    '.ticket-av img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;display:block!important}',
    '.ticket-av .av-letter{display:grid;place-items:center;width:100%;height:100%;font-size:0.7rem;font-weight:700}'
  ].join('\n');

  var profileCache = {};
  var lastFetch = 0;

  function injectCss() {
    var id = 'dr-kb-avatar-css';
    var s = document.getElementById(id);
    if (!s) {
      s = document.createElement('style');
      s.id = id;
      document.head.appendChild(s);
    }
    s.textContent = CSS;
  }

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
    if (now - lastFetch < 20000 && Object.keys(profileCache).length) return;
    lastFetch = now;
    try {
      var r = await client.from('profiles').select('id,full_name,username,avatar_url').limit(800);
      (r.data || []).forEach(function (p) {
        var info = {
          avatar_url: p.avatar_url || '',
          full_name: p.full_name || p.username || 'User',
          id: p.id
        };
        if (p.full_name) profileCache[String(p.full_name).toLowerCase()] = info;
        if (p.username) profileCache[String(p.username).toLowerCase()] = info;
        profileCache['id:' + p.id] = info;
      });
    } catch (e) {}
  }

  function lookup(name) {
    if (!name) return null;
    var key = String(name).toLowerCase().trim();
    if (profileCache[key]) return profileCache[key];
    var base = key.split(/\s*[—-]\s*/)[0].trim();
    if (profileCache[base]) return profileCache[base];
    var keys = Object.keys(profileCache);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('id:') === 0) continue;
      if (base === keys[i] || keys[i].indexOf(base) === 0 || base.indexOf(keys[i]) === 0) {
        return profileCache[keys[i]];
      }
    }
    return null;
  }

  function initials(name) {
    name = String(name || '').trim();
    if (!name) return '?';
    var parts = name.split(/[\s@._-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function setChipPhoto(chip, info, fallbackName) {
    if (!chip) return;
    if (chip.getAttribute('data-dr-photo') === '1' && chip.querySelector('img')) return;
    var url = info && info.avatar_url;
    var name = (info && info.full_name) || fallbackName || '';
    if (url) {
      chip.innerHTML =
        '<img src="' + esc(url) + '" alt="" onerror="this.style.display=\'none\';var n=this.nextElementSibling;if(n)n.style.display=\'grid\'" />' +
        '<span class="av-letter" style="display:none">' + esc(initials(name)) + '</span>';
      chip.setAttribute('data-dr-photo', '1');
    } else if (!chip.querySelector('img') && !chip.querySelector('.av-letter')) {
      if (!(chip.textContent || '').trim()) {
        chip.textContent = initials(name);
      }
    }
  }

  function enhanceTicketAvatars() {
    document.querySelectorAll('.ticket-card').forEach(function (card) {
      var chip = card.querySelector('.ticket-av');
      var meta = card.querySelector('.ticket-meta');
      var name = '';
      if (meta) {
        var spans = meta.querySelectorAll('span');
        for (var i = 0; i < spans.length; i++) {
          var t = (spans[i].textContent || '').trim();
          if (/^DR-\d+/i.test(t)) continue;
          if (spans[i].classList.contains('meta-sep')) continue;
          if (t && !/^(Hardware|Software|Network|Account|Other|\d+[smhd] ago)$/i.test(t)) {
            name = t.split(/\s*[—-]\s*/)[0].trim();
            break;
          }
        }
      }
      if (!name && chip) name = (chip.textContent || '').trim();
      var info = lookup(name);
      if (!chip && name) {
        chip = document.createElement('div');
        chip.className = 'ticket-av';
        card.insertBefore(chip, card.firstChild);
      }
      if (chip) setChipPhoto(chip, info, name);
    });
  }

  function forceKbWidth() {
    var views = document.querySelectorAll(
      '#view-kb, .view-kb, [id*="kb-manage"], #kb-manage-list'
    );
    views.forEach(function (el) {
      if (!el) return;
      el.style.setProperty('width', '100%', 'important');
      el.style.setProperty('max-width', 'none', 'important');
      el.style.setProperty('box-sizing', 'border-box', 'important');
    });
    var main = document.querySelector('#portal-agent main.main, #portal-agent .main');
    if (main) {
      main.style.setProperty('max-width', 'none', 'important');
      main.style.setProperty('width', 'auto', 'important');
    }
    document.querySelectorAll('.kb-table, table.perf-table').forEach(function (t) {
      t.style.setProperty('width', '100%', 'important');
    });
  }

  async function tick() {
    injectCss();
    forceKbWidth();
    await loadProfiles();
    enhanceTicketAvatars();
  }

  injectCss();
  setTimeout(tick, 500);
  setTimeout(tick, 1500);
  setInterval(tick, 3000);

  var list = document.getElementById('ticket-list');
  if (list) {
    try {
      new MutationObserver(function () { enhanceTicketAvatars(); }).observe(list, {
        childList: true,
        subtree: true
      });
    } catch (e) {}
  }

  window.DRKbAvatarFix = { refresh: tick };
})();
