/**
 * Divine Rays — ECG v43
 * Mount lifeline INSIDE #login-screen (absolute, centered) so it paints
 * above honeycomb ambient and behind the login card.
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW >= 43) return;
  try {
    if (window.__DR_ECG_TIMER) clearTimeout(window.__DR_ECG_TIMER);
    if (window.__DR_ECG_INTERVAL) clearInterval(window.__DR_ECG_INTERVAL);
  } catch (e0) {}
  window.__DR_HEARTBEAT_DRAW = 43;
  window.__DR_ECG_OK = true;
  try { document.documentElement.setAttribute('data-ecg', 'on'); } catch (e) {}

  var BOX_ID = 'dr-lifeline';
  var CSS_ID = 'dr-heartbeat-css';
  var __ecgReady = false;

  var ECG_D =
    'M0 50 H40 L50 50 L58 42 L65 50 L78 5 L95 95 L112 50 H170 L180 50 L188 42 L195 50 L208 8 L225 92 L242 50 H300 L310 50 L318 42 L325 50 L338 4 L355 96 L372 50 H430 L440 50 L448 42 L455 50 L468 10 L485 90 L502 50 H560 L570 50 L578 42 L585 50 L598 6 L615 94 L632 50 H690 L700 50 L708 42 L715 50 L720 50';

  function isBooting() {
    try {
      if (window.__DR_BOOT_DONE === true) return false;
      var b = document.getElementById('boot');
      var p = document.getElementById('dr-phase-boot');
      if (b && !b.classList.contains('is-done') && !b.classList.contains('dr-skip')) {
        var st = getComputedStyle(b);
        if (st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity || '1') > 0.05) return true;
      }
      if (p && !p.classList.contains('is-done')) {
        var st2 = getComputedStyle(p);
        if (st2.display !== 'none' && st2.visibility !== 'hidden' && parseFloat(st2.opacity || '1') > 0.05) return true;
      }
    } catch (e) {}
    return false;
  }

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (ls && !ls.hidden) {
        var st = window.getComputedStyle ? getComputedStyle(ls) : null;
        if (!st || (st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity || '1') > 0.05)) return true;
      }
      if (document.body && document.body.classList.contains('is-login') &&
          !document.body.classList.contains('dr-portal-ok') &&
          !document.body.classList.contains('is-portal')) return true;
    } catch (e) {}
    return false;
  }

  function portalActive() {
    try {
      if (loginVisible()) return false;
      if (document.body &&
        (document.body.classList.contains('dr-portal-ok') ||
          document.body.classList.contains('is-portal') ||
          document.body.classList.contains('is-portal-employee') ||
          document.body.classList.contains('is-portal-admin'))) return true;
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (pc && pc.classList.contains('active')) return true;
      if (pa && pa.classList.contains('active')) return true;
    } catch (e) {}
    return false;
  }

  function sealBoot() {
    try {
      ['boot', 'dr-phase-boot'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.add('is-done', 'dr-skip');
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        try { if (el.parentNode) el.parentNode.removeChild(el); } catch (eR) {}
      });
      window.__DR_BOOT_DONE = true;
    } catch (e) {}
  }

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#login-screen, .login-screen { position: relative !important; }',
      '#' + BOX_ID + '{pointer-events:none!important;overflow:visible!important;background:transparent!important}',
      '#dr-lifeline svg{width:100%;height:100%;display:block;overflow:visible}',
      '@keyframes drEcgTravel{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-1600}}',
      '@keyframes drEcgGlowPulse{0%,100%{opacity:0.4}50%{opacity:0.65}}',
      '@keyframes drEcgBasePulse{0%,100%{opacity:0.8}50%{opacity:1}}',
      'body.dr-portal-ok #dr-lifeline,body.is-portal #dr-lifeline,body.is-portal-employee #dr-lifeline,body.is-portal-admin #dr-lifeline{display:none!important}',
      'body.is-login .login-card,body.is-login #login-card,body.is-login .auth-card{position:relative!important;z-index:6!important}',
      'body.is-login #boot,body.is-login #dr-phase-boot,#boot.is-done,#dr-phase-boot.is-done{display:none!important;opacity:0!important;visibility:hidden!important}',
      'body.dr-portal-ok #login-screen,body.is-portal #login-screen,body.is-portal-employee #login-screen,body.is-portal-admin #login-screen,',
      'body.dr-portal-ok .login-screen,body.is-portal .login-screen{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}'
    ].join('');
  }

  function ensureBox() {
    var host = document.getElementById('login-screen') || document.querySelector('.login-screen') || document.body;
    var box = document.getElementById(BOX_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = BOX_ID;
      box.setAttribute('aria-hidden', 'true');
      if (host.firstChild) host.insertBefore(box, host.firstChild);
      else host.appendChild(box);
    } else if (box.parentNode !== host) {
      try { host.insertBefore(box, host.firstChild); } catch (e) {}
    }
    return box;
  }

  function startContinuousEcg() {
    if (portalActive() || !loginVisible()) {
      try {
        var boxH = document.getElementById(BOX_ID);
        if (boxH) { boxH.innerHTML = ''; boxH.style.display = 'none'; }
      } catch (eH) {}
      return;
    }
    if (isBooting()) return;

    sealBoot();
    injectCss();
    try {
      document.body.classList.add('is-login');
      document.body.classList.remove('dr-portal-ok', 'is-portal', 'is-portal-employee', 'is-portal-admin');
    } catch (e) {}

    var box = ensureBox();
    if (!box) return;

    box.style.cssText =
      'position:absolute!important;left:0!important;right:0!important;width:100%!important;' +
      'top:50%!important;height:180px!important;margin-top:-90px!important;' +
      'z-index:1!important;pointer-events:none!important;opacity:1!important;visibility:visible!important;' +
      'background:transparent!important;overflow:visible!important;display:block!important';

    if (box.querySelector('.dr-ecg-base') && __ecgReady) return;

    var core = '#f5f3ff';
    var glow = 'rgba(233,213,255,0.7)';
    var head = '#ffffff';
    var fid = 'drEcgBlurV43';

    box.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 100" preserveAspectRatio="none" width="100%" height="100%" style="display:block;overflow:visible">' +
      '<defs><filter id="' + fid + '" x="-20%" y="-50%" width="140%" height="200%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<path class="dr-ecg-glow" fill="none" stroke="' + glow + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#' + fid + ')" d="' + ECG_D + '"/>' +
      '<path class="dr-ecg-base" fill="none" stroke="' + core + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="' + ECG_D + '"/>' +
      '<path class="dr-ecg-head" fill="none" stroke="' + head + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" d="' + ECG_D + '"/>' +
      '</svg>';

    var len = 1600;
    try {
      var baseP = box.querySelector('.dr-ecg-base');
      if (baseP) { var L = baseP.getTotalLength(); if (L && L > 700) len = L; }
    } catch (eL) {}

    var base = box.querySelector('.dr-ecg-base');
    var glowP = box.querySelector('.dr-ecg-glow');
    var headP = box.querySelector('.dr-ecg-head');
    if (base) {
      base.style.strokeDasharray = 'none';
      base.style.animation = 'drEcgBasePulse 2.8s ease-in-out infinite';
      base.style.opacity = '0.9';
    }
    if (glowP) {
      glowP.style.strokeDasharray = 'none';
      glowP.style.animation = 'drEcgGlowPulse 2.8s ease-in-out infinite';
    }
    if (headP) {
      var seg = Math.max(90, Math.round(len * 0.12));
      headP.style.strokeDasharray = seg + ' ' + Math.max(1, Math.round(len - seg));
      headP.style.animation = 'drEcgTravel 10s linear infinite';
      headP.style.filter = 'drop-shadow(0 0 10px #fff)';
      headP.style.opacity = '1';
    }
    __ecgReady = true;
    window.__DR_ECG_DRAWN = 1;
  }

  function tick() {
    injectCss();
    try {
      if (portalActive()) {
        __ecgReady = false;
        var box = document.getElementById(BOX_ID);
        if (box) { box.innerHTML = ''; box.style.display = 'none'; }
        try { if (window.DRPortalShell && window.DRPortalShell.ensureAmbient) window.DRPortalShell.ensureAmbient(true); } catch (e3) {}
      } else if (!isBooting()) {
        sealBoot();
        startContinuousEcg();
      }
    } catch (e) {}
  }

  injectCss();
  setTimeout(tick, 50);
  setTimeout(tick, 200);
  setTimeout(tick, 500);
  setTimeout(tick, 1000);
  setTimeout(tick, 2000);
  setInterval(function () {
    if (!portalActive() && !isBooting()) {
      sealBoot();
      if (!document.querySelector('#dr-lifeline .dr-ecg-base')) {
        __ecgReady = false;
        startContinuousEcg();
      }
    }
  }, 4000);

  window.DRHeartbeatDraw = {
    force: function () { __ecgReady = false; tick(); },
    kickGears: function () {
      try { if (window.DRPortalShell && window.DRPortalShell.ensureAmbient) window.DRPortalShell.ensureAmbient(true); } catch (e) {}
    },
    refresh: tick,
    v: 43
  };
})();
