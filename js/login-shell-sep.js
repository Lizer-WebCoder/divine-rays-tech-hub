/**
 * Divine Rays — login helper (passive)
 * Does NOT hide/show portals on a timer. Only assists explicit Logout.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_SHELL_SEP_PASSIVE) return;
  window.__DR_LOGIN_SHELL_SEP_PASSIVE = 1;

  function showLoginOnly() {
    try {
      var shell = document.getElementById('app-shell');
      if (shell) {
        shell.hidden = true;
        shell.classList.add('is-hidden');
      }
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      if (pa) pa.classList.remove('active');
      if (pc) pc.classList.remove('active');
      document.body.classList.remove('dr-logged-in', 'dr-mode-techlog', 'dr-mode-support', 'dr-tl-on');
      document.body.classList.add('dr-logged-out');
      try { sessionStorage.removeItem('dr_app_mode'); } catch (e) {}
      var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (login) {
        login.hidden = false;
        login.classList.remove('is-hidden');
        login.style.display = 'flex';
        login.style.visibility = 'visible';
        login.style.opacity = '1';
        login.style.zIndex = '5000';
      }
      var root = document.getElementById('dr-tech-log-root');
      if (root) root.style.display = 'none';
      document.querySelectorAll('#btn-switch-techlog, #btn-switch-support').forEach(function (b) {
        b.style.display = 'none';
      });
    } catch (e) {}
  }

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('#btn-logout');
      var txt = (t.textContent || '').toLowerCase();
      if (btn || (txt.indexOf('logout') !== -1 && t.tagName === 'BUTTON')) {
        setTimeout(showLoginOnly, 0);
        setTimeout(showLoginOnly, 300);
        setTimeout(showLoginOnly, 1000);
      }
    },
    true
  );

  try {
    var client = (window.DR && window.DR.supabase) || window.sb;
    if (client && client.auth && client.auth.onAuthStateChange) {
      client.auth.onAuthStateChange(function (event) {
        if (event === 'SIGNED_OUT') showLoginOnly();
      });
    }
  } catch (e) {}

  window.DRLoginShellSep = { sync: function () {}, forceLogout: showLoginOnly };
})();
