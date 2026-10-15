/**
 * Divine Rays — tab session v3
 * - Multiple tabs share the same login (localStorage auth).
 * - Closing one tab while others stay open keeps the session.
 * - Closing the LAST tab (or whole window) ends the session.
 * - Refresh of a single tab keeps the session (sessionStorage backup).
 * - Approval maps (dr_approval_map / dr_staff_approval) are never cleared.
 */
(function () {
  'use strict';
  if (window.__DR_TAB_SESSION >= 3) return;
  window.__DR_TAB_SESSION = 3;

  var TAB_KEY = 'dr_open_tabs';
  var BACKUP_KEY = 'dr_auth_tab_backup';
  var tabId = 't_' + Math.random().toString(36).slice(2) + '_' + Date.now();
  var STALE_MS = 15000;
  var _unloading = false;

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

  function isAuthKey(k) {
    return (
      k.indexOf('sb-') === 0 ||
      k.indexOf('supabase.auth') !== -1 ||
      k === 'supabase.auth.token'
    );
  }

  function backupAuthToSession() {
    try {
      var pack = {};
      Object.keys(localStorage).forEach(function (k) {
        if (isAuthKey(k)) pack[k] = localStorage.getItem(k);
      });
      if (Object.keys(pack).length) {
        sessionStorage.setItem(BACKUP_KEY, JSON.stringify(pack));
      }
    } catch (e) {}
  }

  function restoreAuthFromSession() {
    try {
      var raw = sessionStorage.getItem(BACKUP_KEY);
      if (!raw) return false;
      var pack = JSON.parse(raw);
      Object.keys(pack || {}).forEach(function (k) {
        if (pack[k] != null) localStorage.setItem(k, pack[k]);
      });
      sessionStorage.removeItem(BACKUP_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  function clearAuthStorage() {
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (isAuthKey(k)) localStorage.removeItem(k);
      });
    } catch (e) {}
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
    if (_unloading) return;
    var now = Date.now();
    var t = aliveTabs(getTabs(), now);
    t[tabId] = now;
    saveTabs(t);
  }

  function unregisterAndMaybeLogout() {
    _unloading = true;
    var now = Date.now();
    var t = getTabs();
    delete t[tabId];
    t = aliveTabs(t, now);
    saveTabs(t);
    if (Object.keys(t).length === 0) {
      backupAuthToSession();
      signOutLocal();
    }
  }

  restoreAuthFromSession();
  beat();
  setInterval(beat, 3000);

  window.addEventListener('pagehide', unregisterAndMaybeLogout);
  window.addEventListener('beforeunload', function () {
    _unloading = true;
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      _unloading = false;
      beat();
    }
  });

  window.addEventListener('storage', function (ev) {
    if (ev.key === TAB_KEY) beat();
  });

  function patchCreateClient() {
    try {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') return false;
      if (window.supabase.createClient.__drTabSessionV3) return true;
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
      window.supabase.createClient.__drTabSessionV3 = 1;
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
    logoutIfLast: unregisterAndMaybeLogout,
    v: 3
  };
})();
