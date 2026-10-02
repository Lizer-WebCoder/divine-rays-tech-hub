/**
 * Divine Rays — profile panel scroll + centered actions
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_PROFILE_SCROLL_FIX) return;
  window.__DR_PROFILE_SCROLL_FIX = 1;

  var CSS = [
    /* Overlay: allow panel to scroll inside viewport */
    '.profile-overlay{',
    '  position:fixed!important;inset:0!important;z-index:10050!important;',
    '  display:flex!important;align-items:center!important;justify-content:center!important;',
    '  padding:1rem!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;',
    '  overscroll-behavior:contain}',
    '.profile-overlay.is-hidden{display:none!important}',
    /* Panel: height limit + internal scroll */
    '.profile-panel{',
    '  width:100%!important;max-width:520px!important;',
    '  max-height:min(90vh,880px)!important;',
    '  overflow-x:hidden!important;overflow-y:auto!important;',
    '  -webkit-overflow-scrolling:touch!important;',
    '  overscroll-behavior:contain!important;',
    '  pointer-events:auto!important;',
    '  margin:auto!important}',
    '.profile-body{',
    '  overflow:visible!important;max-height:none!important;',
    '  pointer-events:auto!important}',
    /* Center Cancel + Save profile */
    '.profile-actions{',
    '  display:flex!important;justify-content:center!important;align-items:center!important;',
    '  gap:0.65rem!important;flex-wrap:wrap!important;',
    '  margin-top:1.15rem!important;padding-top:0.35rem}',
    '.profile-actions .btn{min-width:7.5rem}',
    /* Center Update username / password */
    '#dr-acct-sec{text-align:center}',
    '#dr-acct-sec h4,#dr-acct-sec p.hint{text-align:left}',
    '#dr-acct-sec .form-group,#dr-acct-sec .form-row{text-align:left}',
    '#dr-acct-sec #dr-acct-update{',
    '  display:inline-flex!important;margin:0.85rem auto 0!important;',
    '  justify-content:center;align-items:center}',
    '#dr-acct-msg{text-align:center}',
    /* Customer portal: don't trap wheel on parent */
    '#portal-customer.active .profile-overlay,',
    '#portal-customer .profile-overlay{',
    '  pointer-events:auto!important}',
    'body.profile-open{overflow:hidden!important}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-profile-scroll-fix-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-profile-scroll-fix-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function isOpen() {
    var o = document.getElementById('profile-overlay');
    return !!(o && !o.classList.contains('is-hidden'));
  }

  function polish() {
    inject();
    var open = isOpen();
    document.body.classList.toggle('profile-open', open);

    var panel = document.querySelector('.profile-panel');
    if (panel) {
      panel.style.maxHeight = 'min(90vh, 880px)';
      panel.style.overflowY = 'auto';
      panel.style.webkitOverflowScrolling = 'touch';
    }
    var body = document.getElementById('profile-body');
    if (body) {
      body.style.overflow = 'visible';
      body.style.pointerEvents = 'auto';
    }

    // Center action row
    var actions = document.querySelector('.profile-actions');
    if (actions) {
      actions.style.justifyContent = 'center';
      actions.style.display = 'flex';
    }

    // Center security update button
    var upd = document.getElementById('dr-acct-update');
    if (upd) {
      upd.style.display = 'inline-flex';
      upd.style.marginLeft = 'auto';
      upd.style.marginRight = 'auto';
      var wrap = upd.parentElement;
      if (wrap && wrap.id === 'dr-acct-sec') {
        // ensure button is on its own centered line
        upd.style.marginTop = '0.85rem';
      }
    }
  }

  // Keep wheel scrolling on the panel
  function bindWheel() {
    var overlay = document.getElementById('profile-overlay');
    if (!overlay || overlay.__drScrollBound) return;
    overlay.__drScrollBound = 1;
    overlay.addEventListener(
      'wheel',
      function (e) {
        var panel = overlay.querySelector('.profile-panel');
        if (!panel) return;
        // Always allow the panel to receive scroll
        e.stopPropagation();
      },
      { passive: true }
    );
  }

  function tick() {
    polish();
    bindWheel();
  }

  tick();
  setInterval(tick, 1200);
  setTimeout(tick, 400);
  setTimeout(tick, 1500);

  // Observe open/close
  try {
    var obs = new MutationObserver(function () {
      tick();
    });
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  } catch (e) {}

  window.DRProfileScrollFix = { refresh: tick };
})();
