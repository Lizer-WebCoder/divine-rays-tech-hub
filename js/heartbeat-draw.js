/**
 * Divine Rays — continuous spinning steam gears (no animation reset)
 * Purple interface · Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW) {
    try { delete window.__DR_HEARTBEAT_DRAW; } catch (e) {}
  }
  window.__DR_HEARTBEAT_DRAW = 1;

  var CSS_ID = 'dr-gears-bg';
  var BOX_ID = 'dr-lifeline';
  var lastTheme = null;

  function isLight() {
    try {
      return (
        document.documentElement.getAttribute('data-theme') === 'light' ||
        localStorage.getItem('dr_theme') === 'light'
      );
    } catch (e) {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }
  }

  function themeKey() {
    return isLight() ? 'light' : 'dark';
  }

  function colors() {
    if (isLight()) {
      return { a: '#7c6af0', b: '#9b8af5', c: '#b8a9fc', hub: '#5b4ce0', opacity: '0.28' };
    }
    return { a: '#a78bfa', b: '#8b7cf0', c: '#6d5ef5', hub: '#c4b5fd', opacity: '0.34' };
  }

  function gearPath(teeth, outerR, innerR, holeR) {
    var pts = [];
    var step = (Math.PI * 2) / teeth;
    for (var i = 0; i < teeth; i++) {
      var a0 = i * step - step * 0.5;
      var a2 = a0 + step * 0.32;
      var a3 = a0 + step * 0.68;
      var a4 = a0 + step * 0.85;
      pts.push(
        [Math.cos(a0 + step * 0.18) * outerR, Math.sin(a0 + step * 0.18) * outerR],
        [Math.cos(a2) * outerR, Math.sin(a2) * outerR],
        [Math.cos(a2) * innerR, Math.sin(a2) * innerR],
        [Math.cos(a3) * innerR, Math.sin(a3) * innerR],
        [Math.cos(a3) * outerR, Math.sin(a3) * outerR],
        [Math.cos(a4) * outerR, Math.sin(a4) * outerR]
      );
    }
    var d = 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2);
    for (var j = 1; j < pts.length; j++) {
      d += ' L' + pts[j][0].toFixed(2) + ' ' + pts[j][1].toFixed(2);
    }
    d += ' Z';
    d +=
      ' M' +
      holeR +
      ' 0 A' +
      holeR +
      ' ' +
      holeR +
      ' 0 1 0 ' +
      -holeR +
      ' 0 A' +
      holeR +
      ' ' +
      holeR +
      ' 0 1 0 ' +
      holeR +
      ' 0 Z';
    return d;
  }

  function oneGear(cls, fill, teeth, outer, inner, hole, cx, cy, scale) {
    var d = gearPath(teeth, outer, inner, hole);
    var s = scale || 1;
    return (
      '<g transform="translate(' +
      cx +
      ' ' +
      cy +
      ') scale(' +
      s +
      ')">' +
      '<g class="' +
      cls +
      '">' +
      '<path fill="' +
      fill +
      '" fill-rule="evenodd" d="' +
      d +
      '"/>' +
      '<circle cx="0" cy="0" r="' +
      (hole * 0.55).toFixed(1) +
      '" fill="' +
      fill +
      '" opacity="0.85"/>' +
      '</g></g>'
    );
  }

  function svgMarkup() {
    var c = colors();
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" ' +
      'width="100%" height="100%" style="display:block;opacity:' +
      c.opacity +
      '">' +
      oneGear('dr-spin-cw', c.a, 12, 90, 62, 22, 180, 200, 1.15) +
      oneGear('dr-spin-ccw', c.b, 10, 70, 48, 18, 340, 280, 1) +
      oneGear('dr-spin-cw-fast', c.c, 14, 110, 76, 26, 620, 180, 1.25) +
      oneGear('dr-spin-ccw-slow', c.a, 9, 55, 38, 14, 900, 320, 0.95) +
      oneGear('dr-spin-cw', c.b, 11, 80, 55, 20, 1050, 160, 1.1) +
      oneGear('dr-spin-ccw', c.c, 13, 95, 66, 24, 480, 480, 1.05) +
      oneGear('dr-spin-cw-fast', c.a, 8, 48, 32, 12, 200, 520, 0.9) +
      oneGear('dr-spin-ccw-slow', c.b, 12, 88, 60, 20, 780, 520, 1) +
      '</svg>'
    );
  }

  var CSS = [
    '#' + BOX_ID + '{',
    'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;',
    'z-index:0!important;pointer-events:none!important;overflow:hidden!important;',
    'background:transparent!important',
    '}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline svg{width:100%;height:100%;display:block}',
    '#dr-lifeline .dr-spin-cw{transform-origin:0 0;animation:drGearCW 30s linear infinite}',
    '#dr-lifeline .dr-spin-ccw{transform-origin:0 0;animation:drGearCCW 24s linear infinite}',
    '#dr-lifeline .dr-spin-cw-fast{transform-origin:0 0;animation:drGearCW 18s linear infinite}',
    '#dr-lifeline .dr-spin-ccw-slow{transform-origin:0 0;animation:drGearCCW 36s linear infinite}',
    '@keyframes drGearCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes drGearCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}',
    '#login-screen,.login-screen{',
    'background:transparent!important;',
    'position:relative!important;z-index:2!important',
    '}',
    'html[data-theme="dark"] #login-screen,html[data-theme="dark"] .login-screen,',
    'html:not([data-theme="light"]) #login-screen,html:not([data-theme="light"]) .login-screen{',
    'background:radial-gradient(ellipse 90% 70% at 50% -5%,rgba(109,94,245,0.18),transparent 55%),',
    'radial-gradient(ellipse 60% 40% at 80% 90%,rgba(124,106,240,0.08),transparent 50%)!important',
    '}',
    'html[data-theme="light"] #login-screen,html[data-theme="light"] .login-screen{',
    'background:radial-gradient(ellipse 90% 70% at 50% -5%,rgba(109,94,245,0.14),transparent 55%),',
    'radial-gradient(ellipse 60% 40% at 80% 90%,rgba(124,106,240,0.06),transparent 50%)!important',
    '}',
    '#login-screen .login-card,.login-card{position:relative!important;z-index:3!important}',
    'body,.app-shell,#portal-customer,#portal-agent{position:relative;z-index:1}',
    '@media (prefers-reduced-motion:reduce){',
    '#dr-lifeline .dr-spin-cw,#dr-lifeline .dr-spin-ccw,#dr-lifeline .dr-spin-cw-fast,#dr-lifeline .dr-spin-ccw-slow{animation:none!important}',
    '}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      document.head.appendChild(el);
      el.textContent = CSS;
    } else if (!el.textContent) {
      el.textContent = CSS;
    }
  }

  function ensureGears(force) {
    var box = document.getElementById(BOX_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = BOX_ID;
      box.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(box, document.body.firstChild);
    }

    var theme = themeKey();
    var hasSvg = !!box.querySelector('svg');

    if (force || !hasSvg || lastTheme !== theme) {
      box.innerHTML = svgMarkup();
      lastTheme = theme;
    }
  }

  function tick(force) {
    injectCss();
    ensureGears(!!force);
  }

  tick(true);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      tick(false);
    });
  }
  setTimeout(function () {
    tick(false);
  }, 800);
  setTimeout(function () {
    tick(false);
  }, 2000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-theme' || t.id === 'dr-login-theme' || (t.classList && t.classList.contains('btn-theme')))) {
        setTimeout(function () {
          tick(true);
        }, 60);
      }
    },
    true
  );

  setInterval(function () {
    if (!document.getElementById(BOX_ID) || !document.getElementById(BOX_ID).querySelector('svg')) {
      tick(true);
    } else if (themeKey() !== lastTheme) {
      tick(true);
    }
  }, 12000);

  window.DRHeartbeatDraw = {
    refresh: function () {
      tick(false);
    },
    force: function () {
      tick(true);
    }
  };
  window.DRGearsBg = window.DRHeartbeatDraw;
})();
