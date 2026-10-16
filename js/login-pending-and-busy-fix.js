/**
 * Divine Rays — pending glow/shake restore + busy-button fix
 * 1) Eye toggle must never get "Signing in…"
 * 2) Pending login: orange glow + shake (CSS was missing)
 */
(function () {
  'use strict';
  if (window.__DR_PENDING_BUSY_FIX >= 1) return;
  window.__DR_PENDING_BUSY_FIX = 1;

  var CSS_ID = 'dr-pending-busy-css';

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '.login-card.login-pending-glow{',
      'border-color:rgba(251,146,60,0.95)!important;',
      'box-shadow:0 0 0 1px rgba(251,146,60,0.55),0 0 22px rgba(251,146,60,0.9),0 0 52px rgba(249,115,22,0.55),0 0 90px rgba(234,88,12,0.3)!important;',
      'transition:box-shadow .25s ease,border-color .25s ease!important}',
      '.login-card.dr-shake{animation:drPendingShake .55s ease-in-out}',
      '@keyframes drPendingShake{',
      '0%,100%{transform:translateX(0)}',
      '15%{transform:translateX(-8px)}',
      '30%{transform:translateX(8px)}',
      '45%{transform:translateX(-6px)}',
      '60%{transform:translateX(6px)}',
      '75%{transform:translateX(-3px)}',
      '90%{transform:translateX(3px)}}',
      '.dr-pw-toggle{font-size:0!important;line-height:0!important}',
      '.dr-pw-toggle svg{font-size:initial}'
    ].join('');
  }

  function isEyeBtn(btn) {
    if (!btn) return false;
    try {
      if (btn.classList && btn.classList.contains('dr-pw-toggle')) return true;
      if (btn.closest && btn.closest('.dr-pw-wrap')) return true;
      if (btn.getAttribute('aria-label') && /password/i.test(btn.getAttribute('aria-label'))) return true;
    } catch (e) {}
    return false;
  }

  function realSubmitBtn(form) {
    if (!form) return null;
    var list = form.querySelectorAll('button[type="submit"], button.btn-primary, button.btn-full');
    for (var i = 0; i < list.length; i++) {
      if (!isEyeBtn(list[i])) return list[i];
    }
    return null;
  }

  function guardBusyLabels() {
    document.querySelectorAll('.dr-pw-toggle').forEach(function (btn) {
      try {
        var t = (btn.textContent || '').replace(/\s+/g, ' ').trim();
        if (/sign/i.test(t) || /signing/i.test(t)) {
          var svg = btn.querySelector('svg');
          if (svg) {
            btn.textContent = '';
            btn.appendChild(svg);
          } else {
            btn.innerHTML =
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
          }
          btn.disabled = false;
          btn.style.opacity = '';
          btn.style.pointerEvents = '';
        }
      } catch (e) {}
    });
  }

  function showPendingVisual() {
    injectCss();
    try {
      var card = document.querySelector('#login-screen .login-card, .login-card');
      if (card) {
        card.classList.add('login-pending-glow');
        card.classList.remove('dr-shake');
        void card.offsetWidth;
        card.classList.add('dr-shake');
        card.style.setProperty(
          'box-shadow',
          '0 0 0 1px rgba(251,146,60,0.55),0 0 22px rgba(251,146,60,0.9),0 0 52px rgba(249,115,22,0.55)',
          'important'
        );
        card.style.setProperty('border-color', 'rgba(251,146,60,0.95)', 'important');
      }
    } catch (e) {}
  }

  function clearPendingVisual() {
    try {
      var card = document.querySelector('#login-screen .login-card, .login-card');
      if (card) {
        card.classList.remove('login-pending-glow', 'dr-shake');
        card.style.removeProperty('box-shadow');
        card.style.removeProperty('border-color');
      }
    } catch (e) {}
  }

  function patchForcePending() {
    if (!window.DRForcePending) return;
    if (window.DRForcePending.__drBusyPatch) return;
    window.DRForcePending.__drBusyPatch = 1;
    var origBlock = window.DRForcePending.blockNow;
    var origClear = window.DRForcePending.clearPendingUI;
    window.DRForcePending.blockNow = function () {
      try {
        if (typeof origBlock === 'function') origBlock();
      } catch (e) {}
      showPendingVisual();
      guardBusyLabels();
      try {
        ['login-agent', 'login-customer'].forEach(function (id) {
          var f = document.getElementById(id);
          var b = realSubmitBtn(f);
          if (b) {
            b.disabled = false;
            b.style.opacity = '';
            b.style.pointerEvents = '';
            var prev = b.getAttribute('data-dr-prev-label');
            if (prev) b.textContent = prev;
          }
        });
      } catch (e2) {}
    };
    window.DRForcePending.clearPendingUI = function () {
      try {
        if (typeof origClear === 'function') origClear();
      } catch (e) {}
      clearPendingVisual();
    };
  }

  function tick() {
    injectCss();
    guardBusyLabels();
    patchForcePending();
  }
  tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 2500);
  setInterval(guardBusyLabels, 800);

  try {
    var mo = new MutationObserver(function () {
      var t = document.querySelector('.toast[data-dr-force-pending], .toast');
      if (t && /pending/i.test(t.textContent || '')) {
        showPendingVisual();
        guardBusyLabels();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch (e) {}

  window.DRPendingBusyFix = {
    v: 1,
    showPendingVisual: showPendingVisual,
    clearPendingVisual: clearPendingVisual,
    guardBusyLabels: guardBusyLabels
  };
})();
