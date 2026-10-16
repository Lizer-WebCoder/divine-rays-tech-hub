/**
 * Divine Rays — Phase B/C/D bootstrap
 * B: single Supabase client (__drSb only)
 * B: ensure Users approval UI loaded for Developers
 * C: soft-guard classList null errors
 * D: phase flags for diagnostics
 */
(function () {
  'use strict';
  if (window.__DR_PHASE_BCD >= 1) return;
  window.__DR_PHASE_BCD = 1;

  function safeClass(el, action, name) {
    try {
      if (!el || !el.classList) return;
      if (action === 'add') el.classList.add(name);
      else if (action === 'remove') el.classList.remove(name);
      else if (action === 'toggle') el.classList.toggle(name);
    } catch (e) {}
  }
  window.__drSafeClass = safeClass;

  window.addEventListener(
    'error',
    function (ev) {
      try {
        var msg = String((ev && ev.message) || '');
        if (msg.indexOf('classList') !== -1 && msg.indexOf('null') !== -1) {
          ev.preventDefault();
          return true;
        }
      } catch (e) {}
    },
    true
  );

  function ensureSingleSb() {
    try {
      var cfg = window.DR_CONFIG || {};
      if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || !window.supabase) return null;
      if (window.__drSb) {
        try {
          window.__drAgentSb = window.__drSb;
        } catch (eA) {}
        return window.__drSb;
      }
      window.__drSb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      try {
        window.__drAgentSb = window.__drSb;
      } catch (eB) {}
      return window.__drSb;
    } catch (e) {
      return null;
    }
  }
  ensureSingleSb();
  setTimeout(ensureSingleSb, 500);
  setTimeout(ensureSingleSb, 1500);

  function loadApprovalUi() {
    if (window.__DR_USERS_ADMIN_APPROVAL_UI) return;
    try {
      var s = document.createElement('script');
      s.src =
        'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@main/js/users-admin-approval-ui.js?b=' +
        Date.now();
      s.async = true;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }
  setTimeout(loadApprovalUi, 2000);
  setTimeout(loadApprovalUi, 5000);

  window.DRPhaseBCD = {
    v: 1,
    ensureSingleSb: ensureSingleSb,
    safeClass: safeClass
  };
})();
