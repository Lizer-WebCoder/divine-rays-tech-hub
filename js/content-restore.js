/**
 * Divine Rays — ensure ticket views stay visible
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CONTENT_RESTORE) return;
  window.__DR_CONTENT_RESTORE = 1;

  function restore() {
    var pa = document.getElementById('portal-agent');
    if (!pa || !pa.classList.contains('active')) return;

    var dash = document.getElementById('view-dashboard');
    var detail = document.getElementById('view-detail');
    var admin = document.getElementById('view-admin');
    var onDetail = detail && detail.classList.contains('active');
    var onAdmin = admin && admin.classList.contains('active');

    if (!onDetail && !onAdmin && dash && !dash.classList.contains('active')) {
      dash.classList.add('active');
    }

    var login = document.getElementById('login-screen');
    if (login) {
      login.hidden = true;
      login.classList.add('is-hidden');
      try {
        login.style.setProperty('display', 'none', 'important');
        login.style.setProperty('pointer-events', 'none', 'important');
      } catch (e) {}
    }

    ['.tickets-list', '.ticket-list', '#tickets-list', '#view-dashboard'].forEach(function (sel) {
      pa.querySelectorAll(sel).forEach(function (el) {
        if (el.style.display === 'none') el.style.removeProperty('display');
        if (el.style.visibility === 'hidden') el.style.removeProperty('visibility');
        if (el.style.opacity === '0') el.style.removeProperty('opacity');
      });
    });
  }

  restore();
  setTimeout(restore, 400);
  setTimeout(restore, 1500);
  setTimeout(restore, 3000);
  setInterval(restore, 8000);
  window.DRContentRestore = { refresh: restore };
})();
