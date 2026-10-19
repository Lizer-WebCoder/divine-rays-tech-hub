/**
 * Divine Rays — post-login-transition v1
 * Single smooth loader → fade → portal; force gear spin after reveal.
 */
(function () {
  'use strict';
  if (window.__DR_POST_LOGIN_TX >= 1) return;
  window.__DR_POST_LOGIN_TX = 1;

  var DONE = false;
  var CSS_ID = 'dr-post-login-tx-css';

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#dr-post-login-boot, #dr-portal-loader {',
      '  position:fixed!important;inset:0!important;z-index:100001!important;',
      '  display:flex!important;align-items:center;justify-content:center;',
      '  flex-direction:column;gap:1.4rem;',
      '  background:radial-gradient(ellipse at 50% 42%,#24124a 0%,#0c0618 72%)!important;',
      '  opacity:1;visibility:visible;',
      '  transition:opacity 0.85s ease, visibility 0.85s ease!important;',
      '  pointer-events:auto}',
      '#dr-post-login-boot.is-fading, #dr-portal-loader.is-fading {',
      '  opacity:0!important;visibility:hidden!important;pointer-events:none!important}',
      '#dr-post-login-boot.is-gone, #dr-portal-loader.is-gone {',
      '  display:none!important}',
      '#dr-post-login-boot .pl-rings, #dr-portal-loader .pl-rings {',
      '  position:relative;width:76px;height:76px}',
      '#dr-post-login-boot .pl-ring, #dr-portal-loader .pl-ring {',
      '  position:absolute;inset:0;border-radius:50%;',
      '  border:2.5px solid rgba(167,139,250,0.15);',
      '  border-top-color:#c4b5fd;',
      '  animation:drPlSpinSmooth 1.25s linear infinite}',
      '#dr-post-login-boot .pl-ring:nth-child(2), #dr-portal-loader .pl-ring:nth-child(2),',
      '#dr-post-login-boot .pl-ring:nth-child(3), #dr-portal-loader .pl-ring:nth-child(3) {',
      '  display:none!important}',
      '#dr-post-login-boot .pl-core, #dr-portal-loader .pl-core {',
      '  position:absolute;inset:18px;border-radius:50%;',
      '  background:radial-gradient(circle,#ddd6fe 0%,#7c6af0 70%);',
      '  box-shadow:0 0 28px rgba(139,92,246,0.55);',
      '  animation:none!important}',
      '@keyframes drPlSpinSmooth{to{transform:rotate(360deg)}}',
      '#dr-post-login-boot .pl-bar>i, #dr-portal-loader .pl-bar>i {',
      '  animation:drPlBarSmooth 1.4s ease-in-out infinite}',
      '@keyframes drPlBarSmooth{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}',
      'body.dr-portal-ok #dr-lifeline .dr-spin-cw,body.is-portal #dr-lifeline .dr-spin-cw{',
      '  animation:drGearCW 30s linear infinite!important;animation-play-state:running!important}',
      'body.dr-portal-ok #dr-lifeline .dr-spin-ccw,body.is-portal #dr-lifeline .dr-spin-ccw{',
      '  animation:drGearCCW 24s linear infinite!important;animation-play-state:running!important}',
      'body.dr-portal-ok #dr-lifeline .dr-spin-cw-fast,body.is-portal #dr-lifeline .dr-spin-cw-fast{',
      '  animation:drGearCW 18s linear infinite!important;animation-play-state:running!important}',
      'body.dr-portal-ok #dr-lifeline .dr-spin-ccw-slow,body.is-portal #dr-lifeline .dr-spin-ccw-slow{',
      '  animation:drGearCCW 36s linear infinite!important;animation-play-state:running!important}',
      '@keyframes drGearCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
      '@keyframes drGearCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}'
    ].join('');
  }

  function isPostLogin() {
    try {
      return (
        sessionStorage.getItem('dr_skip_boot_gear') === '1' ||
        sessionStorage.getItem('dr_post_login_boot') === '1' ||
        document.documentElement.classList.contains('dr-post-login')
      );
    } catch (e) {
      return false;
    }
  }

  function clearEarlyHold() {
    try {
      document.querySelectorAll('style').forEach(function (s) {
        var t = s.textContent || '';
        if (
          t.indexOf('#portal-customer') !== -1 &&
          t.indexOf('opacity:0') !== -1 &&
          t.indexOf('dr-post-login-boot') !== -1
        ) {
          s.textContent = t.replace(
            /#portal-customer,#portal-agent,\.mode-bar,#mode-bar-employee,#mode-bar-admin\{opacity:0!important;pointer-events:none!important\}/g,
            ''
          );
        }
      });
      document.documentElement.removeAttribute('data-dr-hold-portal');
      ['portal-customer', 'portal-agent'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (el.classList.contains('active')) {
          el.style.setProperty('opacity', '1', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('pointer-events', 'auto', 'important');
        }
      });
      document
        .querySelectorAll('#mode-bar-employee, #mode-bar-admin, .mode-bar-employee, .mode-bar-admin')
        .forEach(function (b) {
          b.style.setProperty('opacity', '1', 'important');
          b.style.setProperty('visibility', 'visible', 'important');
        });
    } catch (e) {}
  }

  function ensureGearsPainted() {
    try {
      if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.refresh) window.DRHeartbeatDraw.refresh();
      if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.ensureGears) {
        try {
          window.__DR_GEARS_FORCE_PAINT = 1;
        } catch (e) {}
        window.DRHeartbeatDraw.ensureGears(false);
      }
      if (window.DRPortalShell && window.DRPortalShell.ensureAmbient) {
        window.DRPortalShell.ensureAmbient(true);
      }
    } catch (e) {}
  }

  function kickGearsHard() {
    try {
      injectCss();
      var box = document.getElementById('dr-lifeline');
      if (!box || !box.querySelector('.dr-spin-cw')) {
        ensureGearsPainted();
        box = document.getElementById('dr-lifeline');
      }
      if (!box) return;
      box.style.cssText =
        'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;' +
        'z-index:0!important;pointer-events:none!important;overflow:hidden!important;' +
        'opacity:1!important;display:block!important;visibility:visible!important;filter:none!important';
      var nodes = box.querySelectorAll('.dr-spin-cw, .dr-spin-ccw, .dr-spin-cw-fast, .dr-spin-ccw-slow');
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.animation = 'none';
      }
      void box.offsetWidth;
      for (var j = 0; j < nodes.length; j++) {
        var g = nodes[j];
        var anim = 'drGearCW 30s linear infinite';
        if (g.classList.contains('dr-spin-cw-fast')) anim = 'drGearCW 18s linear infinite';
        else if (g.classList.contains('dr-spin-ccw-slow')) anim = 'drGearCCW 36s linear infinite';
        else if (g.classList.contains('dr-spin-ccw')) anim = 'drGearCCW 24s linear infinite';
        g.style.animation = anim;
        g.style.animationPlayState = 'running';
        g.style.display = '';
        g.style.visibility = 'visible';
      }
      document.documentElement.setAttribute('data-dr-gears-ready', '1');
    } catch (e) {}
  }

  function fadeOutLoaders() {
    ['dr-post-login-boot', 'dr-portal-loader'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      try {
        el.classList.add('is-on');
        el.style.display = 'flex';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        void el.offsetWidth;
        el.classList.add('is-fading');
        el.classList.add('is-done');
        el.classList.remove('is-on');
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
        setTimeout(function () {
          try {
            el.classList.add('is-gone');
            el.style.display = 'none';
          } catch (e2) {}
        }, 900);
      } catch (e) {}
    });
  }

  function runOnce() {
    if (DONE) return;
    if (!isPostLogin()) return;
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (!pc && !pa) return;

    DONE = true;
    injectCss();
    clearEarlyHold();
    ensureGearsPainted();

    setTimeout(function () {
      clearEarlyHold();
      ensureGearsPainted();
      kickGearsHard();
      fadeOutLoaders();
      setTimeout(kickGearsHard, 200);
      setTimeout(kickGearsHard, 500);
      setTimeout(kickGearsHard, 1000);
      try {
        sessionStorage.removeItem('dr_post_login_boot');
        setTimeout(function () {
          try {
            sessionStorage.removeItem('dr_skip_boot_gear');
          } catch (e) {}
        }, 2000);
      } catch (e2) {}
    }, 450);
  }

  injectCss();
  if (isPostLogin()) {
    setTimeout(runOnce, 800);
    setTimeout(runOnce, 1400);
    setTimeout(runOnce, 2200);
    setTimeout(function () {
      if (!DONE) {
        DONE = true;
        injectCss();
        clearEarlyHold();
        kickGearsHard();
        fadeOutLoaders();
      }
    }, 4000);
  }

  window.DRPostLoginTx = { v: 1, run: runOnce, kick: kickGearsHard };
})();
