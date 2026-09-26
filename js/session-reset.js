/**
 * Divine Rays — full session reset on logout / account switch
 * Prevents user profile/avatar leaking into admin/agent (and reverse)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SESSION_RESET) {
    try { delete window.__DR_SESSION_RESET; } catch (e) {}
  }
  window.__DR_SESSION_RESET = 1;

  var USER_KEYS = [
    'dr_avatar_cache_v1',
    'dr_avatar_cache_v2',
    'dr_last_ticket',
    'dr_profile_cache',
    'dr_staff_presence',
    'dr_csat_cache',
    'dr_ticket_avatars',
    'dr_kb_avatars'
  ];

  function clearUserStorage() {
    try {
      USER_KEYS.forEach(function (k) {
        try { localStorage.removeItem(k); } catch (e) {}
        try { sessionStorage.removeItem(k); } catch (e) {}
      });
      Object.keys(localStorage).forEach(function (k) {
        if (k === 'dr_theme') return;
        if (k.indexOf('dr_') === 0 || k.indexOf('DR_') === 0) {
          try { localStorage.removeItem(k); } catch (e) {}
        }
      });
      Object.keys(sessionStorage).forEach(function (k) {
        if (k.indexOf('dr_') === 0 || k.indexOf('DR_') === 0) {
          try { sessionStorage.removeItem(k); } catch (e) {}
        }
      });
    } catch (e) {}
  }

  function clearAvatarDom() {
    try {
      ['sidebar-avatar-chip', 'header-avatar-chip'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = '';
      });
      document.querySelectorAll('.sidebar-avatar-chip img, .header-avatar-chip img, #sidebar-avatar-chip img, #header-avatar-chip img').forEach(function (img) {
        if (img.parentNode) img.parentNode.removeChild(img);
      });
      var label = document.getElementById('logged-user-label');
      if (label) label.textContent = '';
    } catch (e) {}
  }

  function resetInMemory() {
    try {
      if (window.DR) {
        if ('currentProfile' in window.DR) window.DR.currentProfile = null;
        if (typeof window.DR.setProfile === 'function') {
          try { window.DR.setProfile(null); } catch (e) {}
        }
      }
      window.currentProfile = null;
      window.__drFullLoaded = false;
      window.__drBooting = false;
    } catch (e) {}
  }

  function fullReset() {
    clearUserStorage();
    clearAvatarDom();
    resetInMemory();
    if (window.DRAvatarFix && window.DRAvatarFix.clear) {
      try { window.DRAvatarFix.clear(); } catch (e) {}
    }
  }

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t) return;
      if (t.id === 'btn-logout' || (t.closest && t.closest('#btn-logout'))) {
        fullReset();
        setTimeout(fullReset, 50);
        setTimeout(fullReset, 300);
        setTimeout(fullReset, 1000);
      }
    },
    true
  );

  function wireAuth() {
    try {
      var client = (window.DR && DR.supabase) || window.sb;
      if (!client || !client.auth || !client.auth.onAuthStateChange) return false;
      if (window.__DR_AUTH_WIRED) return true;
      window.__DR_AUTH_WIRED = 1;
      client.auth.onAuthStateChange(function (event, session) {
        if (event === 'SIGNED_OUT' || !session) {
          fullReset();
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          clearUserStorage();
          setTimeout(function () {
            if (window.DRAvatarFix && window.DRAvatarFix.sync) {
              try { window.DRAvatarFix.sync(); } catch (e) {}
            }
          }, 400);
          setTimeout(function () {
            if (window.DRAvatarFix && window.DRAvatarFix.sync) {
              try { window.DRAvatarFix.sync(); } catch (e) {}
            }
          }, 1500);
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  wireAuth();
  setTimeout(wireAuth, 800);
  setTimeout(wireAuth, 2500);
  setTimeout(wireAuth, 6000);

  setInterval(function () {
    try {
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      var login = document.getElementById('login-screen');
      var agentOn = pa && pa.classList.contains('active');
      var custOn = pc && pc.classList.contains('active');
      var loginVisible = login && !login.hidden && !login.classList.contains('is-hidden');
      if (loginVisible && !agentOn && !custOn) {
        clearAvatarDom();
      }
    } catch (e) {}
  }, 3000);

  window.DRSessionReset = { reset: fullReset, clearUserStorage: clearUserStorage };
})();
