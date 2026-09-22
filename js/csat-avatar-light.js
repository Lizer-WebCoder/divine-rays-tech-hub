/**
 * Divine Rays — CSAT light mode + customer ticket avatars from profile
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CSAT_AV_LIGHT) return;
  window.__DR_CSAT_AV_LIGHT = 1;

  var CSS = [
    'html[data-theme="light"] #csat-panel{',
    '  background:#ffffff!important;',
    '  background-image:none!important;',
    '  border:1px solid #d0d3e4!important;',
    '  color:#1a1a2e!important;',
    '  box-shadow:0 2px 12px rgba(30,30,60,.06)!important;',
    '}',
    'html[data-theme="light"] #csat-panel h4{color:#1a1a2e!important}',
    'html[data-theme="light"] #csat-panel p{color:#4a4a66!important}',
    'html[data-theme="light"] #csat-panel .csat-thanks{color:#047857!important}',
    'html[data-theme="light"] .csat-star{',
    '  background:#eef0f7!important;',
    '  border:1px solid #c8cad8!important;',
    '  color:#5b4ce0!important;',
    '}',
    'html[data-theme="light"] .csat-star.on,',
    'html[data-theme="light"] .csat-star:hover{',
    '  background:#6d5ef5!important;',
    '  color:#fff!important;',
    '  border-color:#6d5ef5!important;',
    '}',
    'html[data-theme="light"] #csat-panel textarea{',
    '  background:#eef0f7!important;',
    '  color:#1a1a2e!important;',
    '  border:1px solid #c8cad8!important;',
    '}',
    'html[data-theme="light"] #csat-agent-box{',
    '  background:#f5f3ff!important;',
    '  border-color:#c4b5fd!important;',
    '}',
    'html[data-theme="light"] #csat-agent-box .csat-score{color:#4c3fd4!important}',
    'html[data-theme="light"] #csat-agent-box .csat-cmt{color:#4a4a66!important}',
    'html[data-theme="light"] #portal-customer .ticket-card{',
    '  background:#fff!important;border-color:#d0d3e4!important;color:#1a1a2e!important',
    '}',
    'html[data-theme="light"] #portal-customer .ticket-card h4{color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-customer .ticket-meta{color:#4a4a66!important}',
    '.ticket-av{overflow:hidden!important;padding:0!important;flex-shrink:0}',
    '.ticket-av img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;display:block!important}',
    '#portal-customer .ticket-av{width:40px;height:40px;border-radius:50%;background:#e8e4ff;display:grid;place-items:center;font-weight:700;font-size:.75rem;color:#5b4ce0}'
  ].join('\n');

  var myProfile = null;
  var allProfiles = {};
  var lastLoad = 0;

  function injectCss() {
    var id = 'dr-csat-av-css';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
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

  function initials(name) {
    name = String(name || '').trim();
    if (!name) return '?';
    var parts = name.split(/[\s@._-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  async function loadMe() {
    var client = sb();
    if (!client) return;
    try {
      var sess = await client.auth.getSession();
      var uid = sess && sess.data && sess.data.session && sess.data.session.user && sess.data.session.user.id;
      if (!uid) return;
      var r = await client.from('profiles').select('id,full_name,username,avatar_url').eq('id', uid).maybeSingle();
      if (r.data) {
        myProfile = r.data;
        try {
          localStorage.setItem('dr_avatar_cache_v1', JSON.stringify({
            avatar_url: r.data.avatar_url || '',
            full_name: r.data.full_name || r.data.username || '',
            user_id: r.data.id
          }));
        } catch (e) {}
      }
    } catch (e) {}
  }

  async function loadAll() {
    var client = sb();
    if (!client) return;
    var now = Date.now();
    if (now - lastLoad < 15000 && Object.keys(allProfiles).length) return;
    lastLoad = now;
    try {
      var r = await client.from('profiles').select('id,full_name,username,avatar_url').limit(800);
      (r.data || []).forEach(function (p) {
        allProfiles['id:' + p.id] = p;
        if (p.full_name) allProfiles[String(p.full_name).toLowerCase()] = p;
        if (p.username) allProfiles[String(p.username).toLowerCase()] = p;
      });
    } catch (e) {}
  }

  function setPhoto(chip, url, name) {
    if (!chip) return;
    if (url) {
      if (chip.getAttribute('data-dr-photo') === '1' && chip.querySelector('img[src="' + url + '"]')) return;
      chip.innerHTML =
        '<img src="' + esc(url) + '" alt="" onerror="this.style.display=\'none\';var n=this.nextElementSibling;if(n)n.style.display=\'grid\'" />' +
        '<span class="av-letter" style="display:none">' + esc(initials(name)) + '</span>';
      chip.setAttribute('data-dr-photo', '1');
    }
  }

  function enhanceCustomerList() {
    var customerCards = document.querySelectorAll('#portal-customer .ticket-card, #ctab-my .ticket-card, #customer-tickets .ticket-card');
    if (customerCards.length && myProfile && myProfile.avatar_url) {
      customerCards.forEach(function (card) {
        var chip = card.querySelector('.ticket-av');
        if (!chip) {
          chip = document.createElement('div');
          chip.className = 'ticket-av';
          card.insertBefore(chip, card.firstChild);
        }
        setPhoto(chip, myProfile.avatar_url, myProfile.full_name || myProfile.username || 'User');
      });
    }

    document.querySelectorAll('#portal-agent .ticket-card').forEach(function (card) {
      var chip = card.querySelector('.ticket-av');
      var meta = card.querySelector('.ticket-meta');
      var name = '';
      if (meta) {
        var spans = meta.querySelectorAll('span');
        for (var i = 0; i < spans.length; i++) {
          var t = (spans[i].textContent || '').trim();
          if (/^DR-\d+/i.test(t)) continue;
          if (spans[i].classList.contains('meta-sep')) continue;
          if (t && !/^(Hardware|Software|Network|Account|Other|\d+[smhd] ago|[\d/]+|[\d:]+\s*(AM|PM))$/i.test(t)) {
            name = t.split(/\s*[—-]\s*/)[0].trim();
            break;
          }
        }
      }
      var p = null;
      if (name) {
        p = allProfiles[name.toLowerCase()] || allProfiles[name.toLowerCase().split(/\s+/)[0]];
      }
      var uid = card.getAttribute('data-user-id') || card.getAttribute('data-requester');
      if (!p && uid) p = allProfiles['id:' + uid];
      if (chip && p && p.avatar_url) {
        setPhoto(chip, p.avatar_url, p.full_name || name);
      }
    });
  }

  function restyleCsat() {
    var panel = document.getElementById('csat-panel');
    if (!panel) return;
    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (theme === 'light') {
      panel.style.setProperty('background', '#ffffff', 'important');
      panel.style.setProperty('color', '#1a1a2e', 'important');
      panel.style.setProperty('border-color', '#d0d3e4', 'important');
    }
  }

  async function tick() {
    injectCss();
    await loadMe();
    await loadAll();
    enhanceCustomerList();
    restyleCsat();
  }

  injectCss();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 2500);
  setInterval(tick, 4000);

  try {
    new MutationObserver(function () {
      enhanceCustomerList();
      restyleCsat();
    }).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  window.DRCsatAvLight = { refresh: tick };
})();
