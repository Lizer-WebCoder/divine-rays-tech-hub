/**
 * Divine Rays — tab session v2
 * - Multiple open tabs share the same login (localStorage auth).
 * - Closing one tab while others stay open keeps the session.
 * - Closing the LAST tab ends the session → next visit needs login.
 * Approval (dr_staff_approval) is never cleared.
 */
(function () {
  'use strict';
  if (window.__DR_TAB_SESSION >= 2) return;
  window.__DR_TAB_SESSION = 2;

  var TAB_KEY = 'dr_open_tabs';
  var tabId = 't_' + Math.random().toString(36).slice(2) + '_' + Date.now();
  var STALE_MS = 12000;

  function getTabs() {
    try {
      return JSON.parse(localStorage.getItem(TAB_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }
  function saveTabs(t) {
    try {
      localStorage.setItem(TAB_KEY, JSON.stringify(t));
    } catch (e) {}
  }
  function aliveTabs(map, now) {
    now = now || Date.now();
    var out = {};
    Object.keys(map || {}).forEach(function (id) {
      if (now - map[id] < STALE_MS) out[id] = map[id];
    });
    return out;
  }
  function clearAuthStorage() {
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (
          k.indexOf('sb-') === 0 ||
          k.indexOf('supabase.auth') !== -1 ||
          k === 'supabase.auth.token'
        ) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {}
    try {
      Object.keys(sessionStorage).forEach(function (k) {
        if (k.indexOf('sb-') === 0 || k.indexOf('supabase.auth') !== -1) {
          sessionStorage.removeItem(k);
        }
      });
    } catch (e2) {}
  }
  function signOutLocal() {
    clearAuthStorage();
    try {
      if (window.__drSb && window.__drSb.auth) {
        window.__drSb.auth.signOut({ scope: 'local' }).catch(function () {});
      }
    } catch (e) {}
    try {
      if (window.DR && typeof window.DR.sb === 'function') {
        var c = window.DR.sb();
        if (c && c.auth) c.auth.signOut({ scope: 'local' }).catch(function () {});
      }
    } catch (e2) {}
  }

  function beat() {
    var now = Date.now();
    var t = aliveTabs(getTabs(), now);
    t[tabId] = now;
    saveTabs(t);
  }

  function unregisterAndMaybeLogout() {
    var now = Date.now();
    var t = getTabs();
    delete t[tabId];
    t = aliveTabs(t, now);
    saveTabs(t);
    if (Object.keys(t).length === 0) {
      /* Last tab closed → end session */
      signOutLocal();
    }
  }

  /* Register this tab */
  beat();
  setInterval(beat, 3000);

  window.addEventListener('pagehide', unregisterAndMaybeLogout);
  window.addEventListener('beforeunload', unregisterAndMaybeLogout);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') beat();
  });

  /* Other tabs closed → keep our heartbeat accurate */
  window.addEventListener('storage', function (ev) {
    if (ev.key === TAB_KEY) beat();
  });

  /* Ensure Supabase uses localStorage so tabs share the session */
  function patchCreateClient() {
    try {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') return false;
      if (window.supabase.createClient.__drTabSessionV2) return true;
      var orig = window.supabase.createClient;
      window.supabase.createClient = function (url, key, opts) {
        opts = opts || {};
        opts.auth = opts.auth || {};
        opts.auth.storage = window.localStorage;
        opts.auth.persistSession = true;
        opts.auth.autoRefreshToken = true;
        opts.auth.detectSessionInUrl = opts.auth.detectSessionInUrl !== false;
        return orig.call(this, url, key, opts);
      };
      window.supabase.createClient.__drTabSessionV2 = 1;
      return true;
    } catch (e) {
      return false;
    }
  }
  if (!patchCreateClient()) {
    var n = 0;
    var iv = setInterval(function () {
      n++;
      if (patchCreateClient() || n > 200) clearInterval(iv);
    }, 25);
  }

  window.DRTabSession = {
    tabId: tabId,
    beat: beat,
    logoutIfLast: unregisterAndMaybeLogout
  };
})();
