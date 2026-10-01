/**
 * Message popup — auto-open chat when someone messages you
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_MSG_POPUP_V1) return;
  window.__DR_MSG_POPUP_V1 = 1;

  var ch = null;
  var lastOpened = 0;

  function sb() {
    try { if (window.DR && DR.sb) return DR.sb(); } catch (e) {}
    return window.sb || null;
  }
  function me() {
    try { if (window.DR && DR.getProfile) { var p = DR.getProfile(); if (p && p.id) return p; } } catch (e) {}
    return null;
  }
  function toast(m, t) {
    if (window.DR && DR.toast) DR.toast(m, t);
  }

  async function resolvePerson(client, id) {
    try {
      var r = await client.from('profiles').select('id,full_name,username,email,role,avatar_url').eq('id', id).maybeSingle();
      if (r.data) return r.data;
    } catch (e) {}
    return { id: id, full_name: 'Someone', role: 'user' };
  }

  function openChat(person) {
    if (!person || !person.id) return;
    if (window.DRStaffPresence && typeof window.DRStaffPresence.openChat === 'function') {
      try { window.DRStaffPresence.openChat(person); return; } catch (e) {}
    }
    if (window.DRStaffPresence && typeof window.DRStaffPresence.open === 'function') {
      try { window.DRStaffPresence.open(); } catch (e2) {}
    }
  }

  function subscribe() {
    var client = sb();
    var profile = me();
    if (!client || !profile || !profile.id) return false;
    if (ch) return true;
    try {
      ch = client
        .channel('dr-msg-popup-' + profile.id)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: 'recipient_id=eq.' + profile.id
          },
          function (payload) {
            var row = payload.new;
            if (!row || !row.sender_id) return;
            var now = Date.now();
            if (now - lastOpened < 800) return;
            lastOpened = now;

            var preview = String(row.body || '').replace(/\s+/g, ' ').trim().slice(0, 70);
            if (!preview && row.media_url) preview = 'Sent an attachment';
            if (!preview) preview = 'New message';

            resolvePerson(client, row.sender_id).then(function (person) {
              var who = (person && (person.full_name || person.username)) || 'Someone';
              toast(who + ': ' + preview, 'info');
              openChat(person);
            });
          }
        )
        .subscribe();
      return true;
    } catch (e) {
      console.warn('[msg-popup]', e);
      return false;
    }
  }

  var tries = 0;
  var t = setInterval(function () {
    tries++;
    if (subscribe() || tries > 40) clearInterval(t);
  }, 500);

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) subscribe();
  });

  window.DRMsgPopup = { refresh: subscribe };
})();
