/**
 * Divine Rays — Inline ECG v7 — always visible on login
 * Independent of heartbeat-draw / CDN pin issues
 * Credit: Boyz at the Back LRK
 */
(function () {
  'use strict';
  if (window.__DR_ECG_INLINE >= 7) return;
  window.__DR_ECG_INLINE = 7;

  var BOX = 'dr-lifeline';
  var CSS = 'dr-ecg-inline-css';
  var patterns = [
    'M0 50 H40 L50 50 L58 42 L65 50 L78 5 L95 95 L112 50 H170 L180 50 L188 42 L195 50 L208 8 L225 92 L242 50 H300 L310 50 L318 42 L325 50 L338 4 L355 96 L372 50 H430 L440 50 L448 42 L455 50 L468 10 L485 90 L502 50 H560 L570 50 L578 42 L585 50 L598 6 L615 94 L632 50 H690 L700 50 L708 42 L715 50 H720',
    'M0 50 H30 L38 46 L45 50 L52 38 L60 50 L72 3 L92 97 L110 50 H160 L168 46 L175 50 L182 38 L190 50 L202 5 L222 95 L240 50 H290 L298 46 L305 50 L312 38 L320 50 L332 4 L352 96 L370 50 H420 L428 46 L435 50 L442 38 L450 50 L462 6 L482 94 L500 50 H550 L558 46 L565 50 L572 38 L580 50 L592 3 L612 97 L630 50 H680 L688 46 L695 50 L702 38 L710 50 H720'
  ];
  var idx = 0;
  var timer = null;
  var busy = false;

  function isLight() {
    try {
      return (document.documentElement.getAttribute('data-theme') || localStorage.getItem('dr_theme') || 'dark') === 'light';
    } catch (e) {
      return false;
    }
  }

  function loginOn() {
    var el = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!el || el.hidden) return false;
    try {
      var st = window.getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
    } catch (e) {}
    return true;
  }

  function injectCss() {
    if (document.getElementById(CSS)) return;
    var s = document.createElement('style');
    s.id = CSS;
    s.textContent = [
      '#' + BOX + '{display:block!important;position:fixed!important;left:0!important;right:0!important;',
      'width:100vw!important;top:50%!important;height:240px!important;margin-top:-120px!important;',
      'z-index:9998!important;pointer-events:none!important;opacity:1!important;visibility:visible!important;',
      'background:transparent!important;overflow:visible!important}',
      '#' + BOX + ' svg{width:100%!important;height:100%!important;display:block!important}',
      '.login-card,#login-screen .login-card{position:relative!important;z-index:10000!important}',
      '@keyframes drInlineEcg{0%{stroke-dashoffset:var(--len)}100%{stroke-dashoffset:0}}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function run() {
    if (busy) return;
    if (!loginOn()) {
      var old = document.getElementById(BOX);
      if (old) old.style.display = 'none';
      return;
    }
    busy = true;
    injectCss();
    var box = document.getElementById(BOX);
    if (!box) {
      box = document.createElement('div');
      box.id = BOX;
      box.setAttribute('aria-hidden', 'true');
      document.body.appendChild(box);
    }
    box.style.cssText =
      'display:block!important;position:fixed!important;left:0!important;right:0!important;' +
      'width:100vw!important;top:50%!important;height:240px!important;margin-top:-120px!important;' +
      'z-index:9998!important;pointer-events:none!important;opacity:1!important;visibility:visible!important;' +
      'background:transparent!important;overflow:visible!important';

    var core = isLight() ? '#5b21b6' : '#f5f3ff';
    var glow = isLight() ? '#7c3aed' : '#e9d5ff';
    var d = patterns[idx % patterns.length];
    box.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 100" preserveAspectRatio="none" width="100%" height="100%">' +
      '<path fill="none" stroke="' + glow + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.75" d="' + d + '"/>' +
      '<path fill="none" stroke="' + core + '" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" d="' + d + '"/>' +
      '</svg>';

    var paths = box.querySelectorAll('path');
    var len = 1600;
    try {
      len = paths[paths.length - 1].getTotalLength() || 1600;
    } catch (e) {}
    var w = window.innerWidth || 1200;
    var sec = Math.max(3, Math.min(12, w / 160));
    for (var i = 0; i < paths.length; i++) {
      paths[i].style.setProperty('--len', len);
      paths[i].style.strokeDasharray = String(len);
      paths[i].style.strokeDashoffset = String(len);
      paths[i].style.animation = 'drInlineEcg ' + sec.toFixed(2) + 's linear forwards';
    }
    busy = false;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      idx = (idx + 1) % patterns.length;
      run();
    }, Math.round(sec * 1000) + 50);
  }

  function tick() {
    try {
      run();
    } catch (e) {}
  }

  tick();
  [100, 400, 1000, 2000, 4000].forEach(function (ms) {
    setTimeout(tick, ms);
  });
  setInterval(tick, 5000);

  window.DREcgInline = { force: tick, refresh: tick };
})();
