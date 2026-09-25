/**
 * Divine Rays — spinning steam gears (replaces ECG lifeline)
 * Purple interface · professional · Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_HEARTBEAT_DRAW) {
    try { delete window.__DR_HEARTBEAT_DRAW; } catch (e) {}
  }
  window.__DR_HEARTBEAT_DRAW = 1;

  var CSS_ID = 'dr-gears-bg';
  var BOX_ID = 'dr-lifeline';

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

  function colors() {
    if (isLight()) {
      return { a: '#7c6af0', b: '#9b8af5', c: '#b8a9fc', hub: '#5b4ce0', opacity: '0.2' };
    }
    return { a: '#a78bfa', b: '#8b7cf0', c: '#6d5ef5', hub: '#c4b5fd', opacity: '0.26' };
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
      '" fill="rgba(255,255,255,0.15)"/>' +
      '</g></g>'
    );
  }

  function svgMarkup() {
    var c = colors();
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" preserveAspectRatio="xMidYMid slice" ' +
      'width="100%" height="100%" style="display:block;opacity:' +
      c.opacity +
      '">' +
      oneGear('dr-spin-cw', c.a, 12, 54, 41, 13, 580, 150, 1.15) +
      oneGear('dr-spin-ccw', c.b, 10, 40, 30, 10, 300, 300, 1) +
      oneGear('dr-spin-cw-fast', c.c, 14, 32, 24, 8, 680, 360, 0.95) +
      oneGear('dr-spin-ccw-slow', c.b, 10, 40, 30, 10, 140, 130, 0.65) +
      '</svg>'
    );
  }

  var CSS = [
    '#dr-lifeline{',
    'display:block!important;position:fixed!important;inset:0!important;',
    'width:100%!important;height:100%!important;margin:0!important;',
    'z-index:0!important;pointer-events:none!important;overflow:hidden!important}',
    '#dr-lifeline,#dr-lifeline *{pointer-events:none!important}',
    '#dr-lifeline svg{width:100%;height:100%;display:block}',
    '#dr-lifeline .dr-spin-cw{transform-origin:0 0;animation:drGearCW 30s linear infinite}',
    '#dr-lifeline .dr-spin-ccw{transform-origin:0 0;animation:drGearCCW 24s linear infinite}',
    '#dr-lifeline .dr-spin-cw-fast{transform-origin:0 0;animation:drGearCW 18s linear infinite}',
    '#dr-lifeline .dr-spin-ccw-slow{transform-origin:0 0;animation:drGearCCW 36s linear infinite}',
    '@keyframes drGearCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes drGearCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}',
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
    }
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function ensureGears() {
    var box = document.getElementById(BOX_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = BOX_ID;
      box.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(box, document.body.firstChild);
    }
    box.innerHTML = svgMarkup();
  }

  function tick() {
    injectCss();
    ensureGears();
  }

  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setTimeout(tick, 400);
  setTimeout(tick, 1500);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) {
        setTimeout(tick, 40);
      }
    },
    true
  );

  window.DRHeartbeatDraw = { refresh: tick };
  window.DRGearsBg = { refresh: tick };
})();
