/**
 * Divine Rays — single theme toggle in mode-bar (never covers logout)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  var KEY = 'dr_theme';

  function current() {
    try {
      return document.documentElement.getAttribute('data-theme') || localStorage.getItem(KEY) || 'dark';
    } catch (e) {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    }
  }

  function apply(theme) {
    theme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    updateButtons(theme);
    if (window.DRForceLightBg && window.DRForceLightBg.refresh) try { window.DRForceLightBg.refresh(); } catch (e) {}
    if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.refresh) try { window.DRHeartbeatDraw.refresh(); } catch (e) {}
  }

  function updateButtons(theme) {
    theme = theme || current();
    document.querySelectorAll('#btn-theme').forEach(function (btn) {
      btn.textContent = theme === 'light' ? 'Dark' : 'Light';
      btn.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    });
  }

  function ensureButton() {
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if ((pa && pa.classList.contains('active')) || (pc && pc.classList.contains('active'))) {
      var loginBtn = document.getElementById('dr-login-theme');
      if (loginBtn && loginBtn.parentNode) loginBtn.parentNode.removeChild(loginBtn);
    }

    var info = document.querySelector('.mode-bar .user-info') || document.querySelector('.user-info');
    if (!info) return null;

    var all = info.querySelectorAll('#btn-theme, .btn-theme');
    var keep = null;
    all.forEach(function (b) {
      if (b.id === 'dr-login-theme') return;
      if (!keep) keep = b;
      else if (b.parentNode) b.parentNode.removeChild(b);
    });

    var btn = document.getElementById('btn-theme');
    if (!btn || (btn.parentNode && btn.parentNode !== info)) {
      if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-theme';
      btn.className = 'btn btn-ghost btn-sm btn-theme';
    }

    var logout = document.getElementById('btn-logout');
    if (btn.parentNode !== info) {
      if (logout && logout.parentNode === info) {
        info.insertBefore(btn, logout);
      } else {
        info.appendChild(btn);
      }
    } else if (logout && logout.parentNode === info) {
      if (btn.nextSibling !== logout) {
        info.insertBefore(btn, logout);
      }
    }

    if (!btn.__drThemeBound) {
      btn.__drThemeBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        apply(current() === 'dark' ? 'light' : 'dark');
        if (window.DR && DR.toast) {
          DR.toast(current() === 'light' ? 'Light mode' : 'Dark mode', 'info');
        }
      });
    }

    updateButtons();
    return btn;
  }

  try {
    apply(localStorage.getItem(KEY) || 'dark');
  } catch (e) {
    apply('dark');
  }

  function boot() {
    ensureButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setTimeout(boot, 4000);
  setInterval(boot, 8000);

  window.DRTheme = { apply: apply, current: current, ensure: ensureButton };
})();
