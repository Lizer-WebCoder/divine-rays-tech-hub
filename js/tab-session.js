/**
 * Divine Rays — tab session only
 * Session lives in sessionStorage: survives refresh, dies when tab/window closes.
 * All users (Admin + End-User) must log in again after closing the tab.
 * Approval status (dr_staff_approval) stays in localStorage — approved Admins remain approved.
 */
(function () {
  'use strict';
  if (window.__DR_TAB_SESSION >= 1) return;
  window.__DR_TAB_SESSION = 1;

  /* Drop any persisted Supabase auth in localStorage (old long-lived sessions) */
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

  function patchCreateClient() {
    try {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') return false;
      if (window.supabase.createClient.__drTabSession) return true;
      var orig = window.supabase.createClient;
      window.supabase.createClient = function (url, key, opts) {
        opts = opts || {};
        opts.auth = opts.auth || {};
        opts.auth.storage = window.sessionStorage;
        opts.auth.persistSession = true;
        opts.auth.autoRefreshToken = true;
        opts.auth.detectSessionInUrl = opts.auth.detectSessionInUrl !== false;
        return orig.call(this, url, key, opts);
      };
      window.supabase.createClient.__drTabSession = 1;
      return true;
    } catch (e) {
      return false;
    }
  }

  if (!patchCreateClient()) {
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (patchCreateClient() || n > 200) clearInterval(t);
    }, 25);
  }

  /* If a client was already created against localStorage, force sign-out once */
  function scrubExisting() {
    try {
      if (window.__drSb && window.__drSb.auth) {
        window.__drSb.auth.signOut({ scope: 'local' }).catch(function () {});
      }
    } catch (e) {}
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('sb-') === 0 || k.indexOf('supabase.auth') !== -1) localStorage.removeItem(k);
      });
    } catch (e2) {}
  }
  setTimeout(scrubExisting, 0);
})();
