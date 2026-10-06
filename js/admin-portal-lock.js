/**
 * Divine Rays — Admin Portal lock
 * Ensures Admin-only UI scripts stay loaded even when index.html is rewritten
 * for End-User/customer portal changes. Does not change End-User portal.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_PORTAL_LOCK >= 1) return;
  window.__DR_ADMIN_PORTAL_LOCK = 1;

  var CDN = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@';
  var PINS = {
    'users-nav.js': 'f87daa9cf712394f08b7c3150b834322e54f1265',
    'sidebar-role-label.js': '44b94a0ad4abfd721e4b09d03a1eda83670d7a87',
    'theme.js': '7ee0f900415b2bb33aaa4e9b212250814b7068eb',
    'topbar-brand-role.js': '7ee0f900415b2bb33aaa4e9b212250814b7068eb',
    'dashboard-no-tickets.js': '9cd76a3ce81dad052eb98af306130ca5c8b70032',
    'pending-approved-fix.js': '94a5aeaaa38fafaaa1ac94872341ce3bf992dfd1',
    'force-pending-block.js': 'f3988b77a2f35efc5cd53a040d78a56becb58261',
    'agent-approval-gate.js': '95399ebc6bf10275331a35b96b9b589bf25b6d7b',
    'login-tab-labels.js': '9beff1f929318ca08d9a71a1d4718ec4afebf539'
  };

  var FLAGS = {
    'users-nav.js': '__DR_USERS_NAV_V13',
    'sidebar-role-label.js': '__DR_SIDEBAR_ROLE_LABEL',
    'theme.js': 'DRTheme',
    'topbar-brand-role.js': '__DR_TOPBAR_BRAND_ROLE',
    'dashboard-no-tickets.js': '__DR_DASHBOARD_NO_TICKETS',
    'pending-approved-fix.js': '__DR_PENDING_APPROVED_FIX',
    'force-pending-block.js': '__DR_FORCE_PENDING_BLOCK',
    'agent-approval-gate.js': '__DR_AGENT_APPROVAL_GATE',
    'login-tab-labels.js': '__DR_LOGIN_TAB_LABELS'
  };

  var loaded = {};
  function need(name) {
    var flag = FLAGS[name];
    if (!flag) return true;
    try {
      if (flag.indexOf('__') === 0) return !window[flag];
      return !window[flag];
    } catch (e) {
      return true;
    }
  }

  function load(name) {
    if (loaded[name] || !PINS[name]) return;
    if (!need(name)) {
      loaded[name] = 1;
      return;
    }
    loaded[name] = 1;
    var s = document.createElement('script');
    s.src = CDN + PINS[name] + '/js/' + name + '?b=' + Date.now();
    s.async = false;
    (document.body || document.documentElement).appendChild(s);
  }

  function ensureAll() {
    var hasAgent =
      document.getElementById('portal-agent') ||
      document.getElementById('login-agent') ||
      document.getElementById('login-screen');
    if (!hasAgent) return;
    Object.keys(PINS).forEach(load);
  }

  ensureAll();
  setTimeout(ensureAll, 800);
  setTimeout(ensureAll, 2000);
  setTimeout(ensureAll, 4500);
  setInterval(ensureAll, 12000);
})();
