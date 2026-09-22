/**
 * Divine Rays — CSAT light mode + avatars (crash-safe, no tight loops)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CSAT_AV_LIGHT) return;
  window.__DR_CSAT_AV_LIGHT = 1;

  var CSS = [
    'html[data-theme="light"] #csat-panel{background:#fff!important;background-image:none!important;',
    'border:1px solid #d0d3e4!important;color:#1a1a2e!important;box-shadow:0 2px 12px rgba(30,30,60,.06)!important}',
    'html[data-theme="light"] #csat-panel h4{color:#1a1a2e!important}',
    'html[data-theme="light"] #csat-panel p{color:#4a4a66!important}',
    'html[data-theme="light"] #csat-panel .csat-thanks{color:#047857!important}',
    'html[data-theme="light"] .csat-star{background:#eef0f7!important;border:1px solid #c8cad8!important;color:#5b4ce0!important}',
    'html[data-theme="light"] .csat-star.on,html[data-theme="light"] .csat-star:hover{background:#6d5ef5!important;color:#fff!important;border-color:#6d5ef5!important}',
    'html[data-theme="light"] #csat-panel textarea{background:#eef0f7!important;color:#1a1a2e!important;border:1px solid #c8cad8!important}',
    'html[data-theme="light"] #csat-agent-box{background:#f5f3ff!important;border-color:#c4b5fd!important}',
    'html[data-theme="light"] #csat-agent-box .csat-score{color:#4c3fd4!important}',
    'html[data-theme="light"] #csat-agent-box .csat-cmt{color:#4a4a66!important}',
    '.ticket-av{overflow:hidden!important;padding:0!important}',
    '.ticket-av img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;display:block!important}'
  ].join('');

  var myProfile = null;
  var allProfiles = {};
  var lastLoad = 0;
  var busy = false;
  var timer = null;

  function injectCss() {
    if (document.getElementById('dr-csat-av-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-csat-av-css';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  async function loadMe() {
    var client = sb();
    if (!client) return;
    try {
      var sess = await client.auth.getSession();
      var uid = sess && sess.data && sess.data.session && sess.data.session.user && sess.data.session.user.id;
      if (!uid) return;
      var r = await client.from('profiles').select('id,full_name,username,avatar_url').eq('id', uid).maybeSingle();
      if (r.data) myProfile = r.data;
    } catch (e) {}
  }

  async function loadAll() {
    var client = sb();
    if (!client) return;
    var now = Date.now();
    if (now - lastLoad < 30000 && Object.keys(allProfiles).length) return;
    lastLoad = now;
    try {
      var r = await client.from('profiles').select('id,full_name,username,avatar_url').limit(500);
      (r.data || []).forEach(function (p) {
        allProfiles['id:' + p.id] = p;
        if (p.full_name) allProfiles[String(p.full_name).toLowerCase()] = p;
        if (p.username) allProfiles[String(p.username).toLowerCase()] = p;
      });
    } catch (e) {}
  }

  function setPhoto(chip, url, name) {
    if (!chip || !url) return;
    if (chip.getAttribute('data-dr-photo') === '1') return;
    chip.setAttribute('data-dr-photo', '1');
    chip.innerHTML = '<img src="' + esc(url) + '" alt="" onerror="this.style.display=\'none\'" />';
  }

  function enhance() {
    if (busy) return;
    busy = true;
    try {
      if (myProfile && myProfile.avatar_url) {
        document.querySelectorAll('#portal-customer .ticket-av').forEach(function (chip) {
          setPhoto(chip, myProfile.avatar_url, myProfile.full_name);
        });
      }
      document.querySelectorAll('#portal-agent .ticket-card').forEach(function (card) {
        var chip = card.querySelector('.ticket-av');
        if (!chip || chip.getAttribute('data-dr-photo') === '1') return;
        var meta = card.querySelector('.ticket-meta');
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
        var p = name ? allProfiles[name.toLowerCase()] : null;
        if (p && p.avatar_url) setPhoto(chip, p.avatar_url, p.full_name);
      });
    } finally {
      busy = false;
    }
  }

  async function run() {
    injectCss();
    await loadMe();
    await loadAll();
    enhance();
  }

  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      run();
    }, 400);
  }

  injectCss();
  setTimeout(run, 800);
  setTimeout(run, 2500);
  setInterval(run, 8000);

  window.DRCsatAvLight = { refresh: schedule };
})();
