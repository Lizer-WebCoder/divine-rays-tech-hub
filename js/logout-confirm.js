/**
 * Divine Rays — logout confirmation v1
 * Centered confirm card; no logout toast; switcher hidden on login after logout.
 */
(function () {
  'use strict';
  if (window.__DR_LOGOUT_CONFIRM >= 1) return;
  window.__DR_LOGOUT_CONFIRM = 1;

  var CSS =
    '#dr-logout-modal{position:fixed;inset:0;z-index:100050;display:none;align-items:center;justify-content:center;' +
    'padding:1.25rem;background:rgba(8,5,18,.62);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}' +
    '#dr-logout-modal.is-on{display:flex}' +
    '#dr-logout-modal .dr-lo-card{width:min(380px,100%);border-radius:18px;padding:1.5rem 1.4rem 1.25rem;' +
    'background:radial-gradient(ellipse at 50% 0%,rgba(109,90,154,.35),transparent 55%),rgba(22,16,38,.94);' +
    'border:1px solid rgba(167,139,250,.4);box-shadow:0 20px 50px rgba(0,0,0,.5),0 0 32px rgba(139,92,246,.25);' +
    'text-align:center;color:#eeeef6;font-family:Inter,system-ui,sans-serif}' +
    '#dr-logout-modal .dr-lo-title{margin:0 0 .45rem;font-size:1.15rem;font-weight:650;letter-spacing:.01em}' +
    '#dr-logout-modal .dr-lo-msg{margin:0 0 1.25rem;font-size:.9rem;line-height:1.45;color:#b4b4c8}' +
    '#dr-logout-modal .dr-lo-actions{display:flex;gap:.65rem;justify-content:center;flex-wrap:wrap}' +
    '#dr-logout-modal .dr-lo-btn{border:0;border-radius:11px;padding:.6rem 1.15rem;font-size:.88rem;font-weight:600;cursor:pointer}' +
    '#dr-logout-modal .dr-lo-cancel{background:rgba(255,255,255,.08);color:#d4d4e0;border:1px solid rgba(255,255,255,.12)}' +
    '#dr-logout-modal .dr-lo-cancel:hover{background:rgba(255,255,255,.12)}' +
    '#dr-logout-modal .dr-lo-confirm{background:linear-gradient(135deg,#8b5cf6,#6d5a9a);color:#fff;' +
    'box-shadow:0 6px 18px rgba(139,92,246,.35)}' +
    '#dr-logout-modal .dr-lo-confirm:hover{filter:brightness(1.06)}' +
    'body.is-login #dr-dev-portal-switch,body:not(.dr-portal-ok):not(.is-portal) #dr-dev-portal-switch,' +
    '#login-screen:not([hidden]) ~ #dr-dev-portal-switch,#dr-dev-portal-switch.dr-hide-login{display:none!important}';

  function injectCss() {
    if (document.getElementById('dr-logout-confirm-css')) return;
    var st = document.createElement('style');
    st.id = 'dr-logout-confirm-css';
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function hideSwitcher() {
    try {
      var el = document.getElementById('dr-dev-portal-switch');
      if (el) {
        el.classList.remove('is-on');
        el.classList.add('dr-hide-login');
        el.style.display = 'none';
      }
      document.body.classList.remove('dr-portal-ok', 'is-portal');
      document.body.classList.add('is-login');
    } catch (e) {}
  }

  function suppressLogoutToasts() {
    try {
      if (window.DR && typeof window.DR.toast === 'function' && !window.DR.toast.__drLoWrap) {
        var orig = window.DR.toast;
        window.DR.toast = function (msg, kind) {
          var m = String(msg || '');
          if (/signed\s*out|logged\s*out|log\s*out|session\s*ended/i.test(m)) return;
          return orig.apply(this, arguments);
        };
        window.DR.toast.__drLoWrap = 1;
      }
      document.querySelectorAll('.toast').forEach(function (t) {
        var tx = (t.textContent || '').toLowerCase();
        if (/signed out|logged out|log out/.test(tx)) {
          try {
            t.remove();
          } catch (e) {
            t.style.display = 'none';
          }
        }
      });
    } catch (e) {}
  }

  function ensureModal() {
    injectCss();
    var el = document.getElementById('dr-logout-modal');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'dr-logout-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'dr-lo-title');
    el.innerHTML =
      '<div class="dr-lo-card">' +
      '<h2 class="dr-lo-title" id="dr-lo-title">Sign out?</h2>' +
      '<p class="dr-lo-msg">Are you sure you want to quit and return to the login page?</p>' +
      '<div class="dr-lo-actions">' +
      '<button type="button" class="dr-lo-btn dr-lo-cancel" data-dr-lo="cancel">Cancel</button>' +
      '<button type="button" class="dr-lo-btn dr-lo-confirm" data-dr-lo="confirm">Yes, sign out</button>' +
      '</div></div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      if (e.target === el) closeModal();
      var b = e.target && (e.target.closest ? e.target.closest('[data-dr-lo]') : null);
      if (!b) return;
      var act = b.getAttribute('data-dr-lo');
      if (act === 'cancel') closeModal();
      if (act === 'confirm') doLogout();
    });
    return el;
  }

  function openModal() {
    var el = ensureModal();
    el.classList.add('is-on');
    el.style.display = 'flex';
    try {
      var c = el.querySelector('.dr-lo-confirm');
      if (c) c.focus();
    } catch (e) {}
  }

  function closeModal() {
    var el = document.getElementById('dr-logout-modal');
    if (!el) return;
    el.classList.remove('is-on');
    el.style.display = 'none';
  }

  async function doLogout() {
    closeModal();
    hideSwitcher();
    suppressLogoutToasts();
    window.__DR_LOGGING_OUT = 1;
    try {
      sessionStorage.removeItem('dr_skip_boot_gear');
      sessionStorage.removeItem('dr_post_login_boot');
      sessionStorage.removeItem('dr_dev_portal_pref');
      sessionStorage.removeItem('dr_login_tab');
      sessionStorage.setItem('dr_session_ended', '1');
    } catch (e) {}

    try {
      if (window.__drSb && window.__drSb.auth) {
        await window.__drSb.auth.signOut({ scope: 'local' });
      } else if (window.DR && typeof window.DR.sb === 'function') {
        var c = window.DR.sb();
        if (c && c.auth) await c.auth.signOut({ scope: 'local' });
      }
    } catch (e2) {}

    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('supabase') !== -1 || k.indexOf('sb-') === 0) localStorage.removeItem(k);
      });
    } catch (e3) {}

    suppressLogoutToasts();
    hideSwitcher();
    window.__drFullLoaded = false;
    window.__drBooting = false;
    location.reload();
  }

  function isLogoutControl(el) {
    if (!el || !el.closest) return false;
    if (el.closest('#btn-logout, [data-action="logout"], .btn-logout')) return true;
    var btn = el.closest('button, a');
    if (!btn) return false;
    var id = (btn.id || '').toLowerCase();
    var cls = (btn.className && String(btn.className)) || '';
    var tx = (btn.textContent || '').trim().toLowerCase();
    if (id.indexOf('logout') !== -1 || id.indexOf('signout') !== -1) return true;
    if (/\blogout\b|\bsign\s*out\b/.test(cls)) return true;
    if (tx === 'logout' || tx === 'log out' || tx === 'sign out') return true;
    return false;
  }

  document.addEventListener(
    'click',
    function (e) {
      if (window.__DR_LOGGING_OUT) return;
      if (!isLogoutControl(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openModal();
    },
    true
  );

  function wrapSignOut() {
    try {
      var current = window.signOut;
      if (current && current.__drLoConfirm) return;
      window.signOut = function () {
        if (window.__DR_LOGGING_OUT) {
          return current ? current.apply(this, arguments) : doLogout();
        }
        openModal();
      };
      window.signOut.__drLoConfirm = 1;
    } catch (e) {}
  }

  function guardSwitcher() {
    try {
      var ls = document.getElementById('login-screen');
      var onLogin =
        document.body.classList.contains('is-login') ||
        (!document.body.classList.contains('dr-portal-ok') &&
          !document.body.classList.contains('is-portal'));
      if (ls && !ls.hidden) onLogin = true;
      if (onLogin) hideSwitcher();
    } catch (e) {}
  }

  wrapSignOut();
  setTimeout(wrapSignOut, 400);
  setTimeout(wrapSignOut, 1200);
  setTimeout(wrapSignOut, 2500);
  injectCss();
  guardSwitcher();
  setInterval(guardSwitcher, 1500);
  setInterval(suppressLogoutToasts, 800);

  window.DRLogoutConfirm = { open: openModal, confirm: doLogout, cancel: closeModal, v: 1 };
})();
