/**
 * Divine Rays — show ticket-owner profile photos on list chips
 * Matches by full_name / username; re-applies after list polish
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_AVATARS) return;
  window.__DR_TICKET_AVATARS = 1;

  var byName = {};
  var byId = {};
  var lastFetch = 0;
  var busy = false;

  function injectCss() {
    if (document.getElementById('dr-ticket-avatars-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-ticket-avatars-css';
    s.textContent = [
      '.ticket-av{overflow:hidden!important;padding:0!important;position:relative}',
      '.ticket-av img.dr-av-img{width:100%!important;height:100%!important;object-fit:cover!important;',
      'border-radius:50%!important;display:block!important;position:absolute;inset:0}',
      '.ticket-av.has-photo{color:transparent!important;font-size:0!important}'
    ].join('');
    document.head.appendChild(s);
  }

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[·•⋅⋯]/g, ' ')
      .replace(/\s*[—–-]\s*/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
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
    if (now - lastFetch < 20000 && Object.keys(byName).length) return;
    lastFetch = now;
    try {
      var r = await client.from('profiles').select('id,full_name,username,avatar_url').limit(1000);
      if (r.error) {
        console.warn('[ticket-avatars] profiles', r.error.message);
        return;
      }
      byName = {};
      byId = {};
      (r.data || []).forEach(function (p) {
        if (!p) return;
        byId[p.id] = p;
        var names = [p.full_name, p.username].filter(Boolean);
        names.forEach(function (n) {
          var k = norm(n);
          if (k) byName[k] = p;
          var parts = k.split(' ').filter(Boolean);
          if (parts.length >= 2) {
            byName[parts[0] + ' ' + parts[parts.length - 1]] = p;
          }
        });
      });
    } catch (e) {
      console.warn('[ticket-avatars]', e);
    }
  }

  function extractRequester(card) {
    var uid =
      card.getAttribute('data-user-id') ||
      card.getAttribute('data-requester-id') ||
      card.getAttribute('data-created-by') ||
      card.getAttribute('data-owner');
    if (uid && byId[uid]) return byId[uid];

    var meta = card.querySelector('.ticket-meta');
    if (!meta) return null;
    var text = (meta.textContent || '').replace(/\s+/g, ' ');
    var m = text.match(/DR-\d+\s*(.+?)(?:\s*(?:Hardware|Software|Network|Account|Other|\d+[smhd]\s*ago|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}:\d{2})|$)/i);
    var chunk = m ? m[1] : text;
    chunk = chunk.replace(/DR-\d+/gi, '');
    chunk = chunk.split(/\b(?:Hardware|Software|Network|Account|Other)\b/i)[0];
    var namePart = chunk.split(/\s*[—–-]\s*/)[0];
    namePart = namePart.replace(/[·•⋅⋯]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!namePart) return null;

    var key = norm(namePart);
    if (byName[key]) return byName[key];

    var tokens = key.split(' ').filter(Boolean);
    for (var len = tokens.length; len >= 2; len--) {
      var sub = tokens.slice(0, len).join(' ');
      if (byName[sub]) return byName[sub];
    }
    if (tokens.length === 1 && byName[tokens[0]]) return byName[tokens[0]];

    var keys = Object.keys(byName);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.length < 3) continue;
      if (key.indexOf(k) !== -1 || k.indexOf(key) !== -1) return byName[k];
    }
    return null;
  }

  function applyPhoto(chip, profile) {
    if (!chip || !profile || !profile.avatar_url) return false;
    var url = profile.avatar_url;
    var existing = chip.querySelector('img.dr-av-img');
    if (existing && existing.getAttribute('src') === url) {
      chip.classList.add('has-photo');
      chip.setAttribute('data-dr-photo', '1');
      return true;
    }
    var letter = (chip.textContent || '').trim().slice(0, 2) || '?';
    chip.innerHTML =
      '<img class="dr-av-img" src="' + esc(url) + '" alt="" ' +
      'onerror="this.remove();this.parentElement.classList.remove(\'has-photo\');" />' +
      '<span style="position:relative;z-index:0">' + esc(letter) + '</span>';
    chip.classList.add('has-photo');
    chip.setAttribute('data-dr-photo', '1');
    chip.setAttribute('data-dr-av-url', url);
    return true;
  }

  function enhance() {
    if (busy) return;
    busy = true;
    try {
      document.querySelectorAll('.ticket-card').forEach(function (card) {
        var chip = card.querySelector('.ticket-av');
        if (!chip) return;
        var profile = extractRequester(card);
        if (profile && profile.avatar_url) {
          applyPhoto(chip, profile);
        }
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
  setTimeout(tick, 600);
  setTimeout(tick, 2000);
  setTimeout(tick, 5000);
  setInterval(tick, 4000);

  window.DRTicketAvatars = { refresh: tick };
})();
