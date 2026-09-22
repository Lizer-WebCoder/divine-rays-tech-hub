/**
 * Divine Rays — KB full width + ticket avatars (crash-safe)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_KB_AVATAR_FIX) return;
  window.__DR_KB_AVATAR_FIX = 1;

  var CSS = [
    '#portal-agent.active #view-kb,#portal-agent.active .view-kb,#portal-agent.active #kb-manage-list,#portal-agent.active .kb-table{',
    'width:100%!important;max-width:none!important;box-sizing:border-box!important}',
    '#portal-agent.active .kb-table,table.perf-table.kb-table{width:100%!important;min-width:100%!important}',
    '#portal-agent.active input[placeholder*="Search articles"]{width:100%!important;max-width:none!important}',
    '.ticket-av{overflow:hidden!important;padding:0!important}',
    '.ticket-av img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;display:block!important}'
  ].join('');

  var profileCache = {};
  var lastFetch = 0;
  var busy = false;

  function injectCss() {
    if (document.getElementById('dr-kb-avatar-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-kb-avatar-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  async function loadProfiles() {
    var client = sb();
    if (!client) return;
    var now = Date.now();
    if (now - lastFetch < 30000 && Object.keys(profileCache).length) return;
    lastFetch = now;
    try {
      var r = await client.from('profiles').select('id,full_name,username,avatar_url').limit(500);
      (r.data || []).forEach(function (p) {
        var info = { avatar_url: p.avatar_url || '', full_name: p.full_name || p.username || 'User', id: p.id };
        if (p.full_name) profileCache[String(p.full_name).toLowerCase()] = info;
        if (p.username) profileCache[String(p.username).toLowerCase()] = info;
      });
    } catch (e) {}
  }

  function enhance() {
    if (busy) return;
    busy = true;
    try {
      document.querySelectorAll('.ticket-card .ticket-av').forEach(function (chip) {
        if (chip.getAttribute('data-dr-photo') === '1') return;
        var card = chip.closest('.ticket-card');
        var meta = card && card.querySelector('.ticket-meta');
        var name = '';
        if (meta) {
          var spans = meta.querySelectorAll('span');
          for (var i = 0; i < spans.length; i++) {
            var t = (spans[i].textContent || '').trim();
            if (/^DR-\d+/i.test(t)) continue;
            if (t && !/^(Hardware|Software|Network|Account|Other|\d+[smhd] ago)$/i.test(t)) {
              name = t.split(/\s*[—-]\s*/)[0].trim();
              break;
            }
          }
        }
        var info = name ? profileCache[name.toLowerCase()] : null;
        if (info && info.avatar_url) {
          chip.setAttribute('data-dr-photo', '1');
          chip.innerHTML = '<img src="' + esc(info.avatar_url) + '" alt="" onerror="this.style.display=\'none\'" />';
        }
      });
      document.querySelectorAll('#view-kb, .view-kb, #kb-manage-list').forEach(function (el) {
        el.style.setProperty('width', '100%', 'important');
        el.style.setProperty('max-width', 'none', 'important');
      });
    } finally {
      busy = false;
    }
  }

  async function tick() {
    injectCss();
    await loadProfiles();
    enhance();
  }

  injectCss();
  setTimeout(tick, 1000);
  setTimeout(tick, 3000);
  setInterval(tick, 10000);

  window.DRKbAvatarFix = { refresh: tick };
})();
