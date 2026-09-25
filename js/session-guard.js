/**
 * Divine Rays — no login flash on refresh
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SESSION_GUARD) return;
  window.__DR_SESSION_GUARD = 1;

  var ROLE_KEY = 'dr_last_role';
  var CSS_ID = 'dr-session-guard-css';
  var OVERLAY_ID = 'dr-session-restore';

  function hasStoredSession() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || '';
        if (k.indexOf('sb-') === 0 && k.indexOf('auth-token') !== -1) {
          var raw = localStorage.getItem(k);
          if (!raw) continue;
          try {
            var j = JSON.parse(raw);
            if (j && (j.access_token || (j.currentSession && j.currentSession.access_token))) return true;
          } catch (e) {
            if (raw.length > 40) return true;
          }
        }
      }
    } catch (e) {}
    return false;
  }

  function lastRole() {
    try { return localStorage.getItem(ROLE_KEY) || ''; } catch (e) { return ''; }
  }

  function saveRole(role) {
    if (!role) return;
    try { localStorage.setItem(ROLE_KEY, role); } catch (e) {}
  }

  function injectCss() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = [
      'html.dr-restoring #login-screen{display:none!important;visibility:hidden!important;pointer-events:none!important}',
      'html.dr-restoring #app-shell{display:block!important;visibility:visible!important}',
      'html.dr-restoring #app-shell.is-hidden,html.dr-restoring #app-shell[hidden]{display:block!important;visibility:visible!important;height:auto!important;overflow:visible!important;pointer-events:auto!important}',
      '#' + OVERLAY_ID + '{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;',
      'background:rgba(12,12,20,.88);color:#c4b5fd;font-family:Inter,system-ui,sans-serif;font-size:0.95rem;',
      'backdrop-filter:blur(6px);transition:opacity .25s}',
      'html[data-theme="light"] #' + OVERLAY_ID + '{background:rgba(255,255,255,.9);color:#5b4ce0}',
      '#' + OVERLAY_ID + '.hide{opacity:0;pointer-events:none}',
      '#' + OVERLAY_ID + ' .dr-spin{width:28px;height:28px;border:3px solid rgba(124,106,240,.25);border-top-color:#7c6af0;',
      'border-radius:50%;animation:drSpin .7s linear infinite;margin:0 auto 12px}',
      '@keyframes drSpin{to{transform:rotate(360deg)}}'
    ].join('');
    document.head.appendChild(s);
  }

  function showOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;
    var d = document.createElement('div');
    d.id = OVERLAY_ID;
    d.innerHTML = '<div style="text-align:center"><div class="dr-spin"></div>Restoring session…</div>';
    document.body.appendChild(d);
  }

  function hideOverlay() {
    var d = document.getElementById(OVERLAY_ID);
    if (!d) return;
    d.classList.add('hide');
    setTimeout(function () { try { d.remove(); } catch (e) {} }, 280);
    document.documentElement.classList.remove('dr-restoring');
  }

  function hideLoginShowShell() {
    var login = document.getElementById('login-screen');
    var shell = document.getElementById('app-shell');
    if (login) {
      login.hidden = true;
      login.classList.add('is-hidden');
      login.style.display = 'none';
    }
    if (shell) {
      shell.hidden = false;
      shell.classList.remove('is-hidden');
      shell.style.display = '';
      shell.style.visibility = 'visible';
    }
  }

  function applyPortal(role) {
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (!pc && !pa) return;
    if (pc) pc.classList.remove('active');
    if (pa) pa.classList.remove('active');
    if (role === 'customer') { if (pc) pc.classList.add('active'); }
    else if (role === 'agent' || role === 'admin') { if (pa) pa.classList.add('active'); }
  }

  function startRestore() {
    if (!hasStoredSession()) {
      hideOverlay();
      document.documentElement.classList.remove('dr-restoring');
      return;
    }
    injectCss();
    document.documentElement.classList.add('dr-restoring');
    hideLoginShowShell();
    showOverlay();
    var role = lastRole();
    if (role) applyPortal(role);
  }

  function watchPortal() {
    var tries = 0;
    var t = setInterval(function () {
      tries++;
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      var login = document.getElementById('login-screen');
      var active = (pc && pc.classList.contains('active')) || (pa && pa.classList.contains('active'));
      if (active) {
        if (pc && pc.classList.contains('active')) saveRole('customer');
        else saveRole('agent');
        hideLoginShowShell();
        hideOverlay();
        clearInterval(t);
        return;
      }
      if (tries > 40 && !hasStoredSession()) {
        document.documentElement.classList.remove('dr-restoring');
        hideOverlay();
        if (login) {
          login.hidden = false;
          login.classList.remove('is-hidden');
          login.style.display = '';
        }
        clearInterval(t);
      }
      if (tries > 60) { hideOverlay(); clearInterval(t); }
    }, 150);
  }

  function observeRole() {
    if (!document.body) return;
    try {
      new MutationObserver(function () {
        var pc = document.getElementById('portal-customer');
        var pa = document.getElementById('portal-agent');
        if (pc && pc.classList.contains('active')) saveRole('customer');
        else if (pa && pa.classList.contains('active')) {
          var label = document.getElementById('logged-user-label');
          var txt = (label && label.textContent) || '';
          saveRole(/admin/i.test(txt) ? 'admin' : 'agent');
        }
      }).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
    } catch (e) {}
  }

  injectCss();
  if (hasStoredSession()) {
    document.documentElement.classList.add('dr-restoring');
    if (document.body) {
      startRestore();
      watchPortal();
      observeRole();
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        startRestore();
        watchPortal();
        observeRole();
      });
    }
  }

  setTimeout(function () {
    if (hasStoredSession()) { startRestore(); watchPortal(); observeRole(); }
  }, 200);
  setTimeout(function () {
    if (hasStoredSession()) { startRestore(); watchPortal(); }
  }, 800);
  setTimeout(function () {
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if ((pc && pc.classList.contains('active')) || (pa && pa.classList.contains('active'))) hideOverlay();
  }, 2000);

  window.DRSessionGuard = { saveRole: saveRole, hideOverlay: hideOverlay, refresh: function () { if (hasStoredSession()) startRestore(); } };
})();
