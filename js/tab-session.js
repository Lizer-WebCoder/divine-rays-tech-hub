/**
 * Divine Rays — tab session v4
 * Last tab/window close → end session.
 * Multi-tab → keep session.
 * Refresh → keep session (sessionStorage backup).
 * Hard flag dr_session_ended so reopen cannot auto sign-in.
 */
(function () {
  'use strict';
  if (window.__DR_TAB_SESSION >= 4) return;
  window.__DR_TAB_SESSION = 4;

  var TAB_KEY = 'dr_open_tabs';
  var BACKUP_KEY = 'dr_auth_tab_backup';
  var ENDED_KEY = 'dr_session_ended';
  var tabId = 't_' + Math.random().toString(36).slice(2) + '_' + Date.now();
  var STALE_MS = 10000;
  var _done = false;

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
    if (!k) return false;
    k = String(k);
    return (
      k.indexOf('sb-') === 0 ||
      k.indexOf('supabase.auth') !== -1 ||
      k === 'supabase.auth.token' ||
      /auth-token/i.test(k)
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
      try {
        localStorage.removeItem(ENDED_KEY);
      } catch (e) {}
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
    try {
      Object.keys(sessionStorage).forEach(function (k) {
        if (isAuthKey(k) && k !== BACKUP_KEY) sessionStorage.removeItem(k);
      });
    } catch (e2) {}
  }

  function signOutLocal() {
    clearAuthStorage();
    try {
      localStorage.setItem(ENDED_KEY, String(Date.now()));
    } catch (e) {}
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

  (function bootGuard() {
    var restored = restoreAuthFromSession();
    if (restored) return;
    try {
      var ended = localStorage.getItem(ENDED_KEY);
      if (ended) {
        clearAuthStorage();
        localStorage.removeItem(ENDED_KEY);
        localStorage.removeItem(TAB_KEY);
      }
    } catch (e) {}
  })();

  function beat() {
    if (_done) return;
    var now = Date.now();
    var t = aliveTabs(getTabs(), now);
    t[tabId] = now;
    saveTabs(t);
  }

  function unregisterAndMaybeLogout() {
    if (_done) return;
    _done = true;
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

  beat();
  setInterval(beat, 2500);

  window.addEventListener('pagehide', unregisterAndMaybeLogout);
  window.addEventListener('beforeunload', unregisterAndMaybeLogout);
  window.addEventListener('unload', unregisterAndMaybeLogout);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      _done = false;
      beat();
    }
  });

  window.addEventListener('storage', function (ev) {
    if (ev.key === TAB_KEY) beat();
  });

  function patchCreateClient() {
    try {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') return false;
      if (window.supabase.createClient.__drTabSessionV4) return true;
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
      window.supabase.createClient.__drTabSessionV4 = 1;
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
    v: 4
  };
})();
