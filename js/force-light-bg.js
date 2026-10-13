/**
 * Divine Rays — ORIGINAL login ambient (one-shot, freeze-safe)
 * Honeycomb + network icons from production. Paints once. Never rebuilds.
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG >= 20) return;
  window.__DR_FORCE_LIGHT_BG = 20;
  window.__DR_AMBIENT_LOCKED = false;

  var LAYER_ID = 'dr-login-ambient';
  var CSS_ID = 'dr-login-ambient-css';
  var LOGIN_DARK =
    'radial-gradient(ellipse 100% 70% at 50% 45%, rgba(124,58,237,0.35), transparent 55%),' +
    'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(139,92,246,0.22), transparent 50%),' +
    'radial-gradient(ellipse 70% 50% at 85% 80%, rgba(91,33,182,0.28), transparent 50%),' +
    'linear-gradient(180deg, #2a1058 0%, #1a0a3e 35%, #120830 65%, #0a0518 100%)';

function honeycombSvg(stroke) {
    var R = 48;
    var SQ3 = Math.sqrt(3);
    var horiz = SQ3 * R;
    var vert = 1.5 * R;
    var cols = 22;
    var rows = 18;
    var paths = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cx = c * horiz + (r % 2 ? horiz * 0.5 : 0);
        var cy = r * vert + R;
        var pts = [];
        for (var i = 0; i < 6; i++) {
          var a = (Math.PI / 180) * (60 * i - 30);
          pts.push((cx + R * Math.cos(a)).toFixed(2) + ' ' + (cy + R * Math.sin(a)).toFixed(2));
        }
        paths.push('M' + pts.join(' L') + ' Z');
      }
    }
    var vbW = Math.ceil(cols * horiz + horiz);
    var vbH = Math.ceil(rows * vert + 2 * R);
    return (
      '<svg class="dr-honeycomb" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + vbW + ' ' + vbH + '" ' +
      'preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style="display:block">' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">' +
      paths.map(function (d) { return '<path d="' + d + '"/>'; }).join('') +
      '</g></svg>'
    );
  }

function networkSvg(stroke, fill, accent) {
    function node(x, y, r) {
      return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 2.8) + '"/>';
    }
    function line(d, pulse) {
      return '<path ' + (pulse ? 'class="dr-pulse" ' : '') + 'd="' + d + '"/>';
    }
    function iconCross(x, y, s) {
      var w = s * 0.35, h = s * 0.9, t = s * 0.28;
      return (
        '<path fill="' + fill + '" stroke="none" opacity="0.85" d="' +
        'M' + (x - w) + ' ' + (y - t) +
        ' H' + (x + w) + ' V' + (y + t) +
        ' H' + (x + t) + ' V' + (y + h) +
        ' H' + (x - t) + ' V' + (y + t) +
        ' H' + (x - w) + ' Z' +
        'M' + (x - t) + ' ' + (y - h) +
        ' H' + (x + t) + ' V' + (y - t) +
        ' H' + (x - t) + ' Z"/>'
      );
    }
    function iconDna(x, y, s) {
      var a = s * 0.55;
      return (
        '<g fill="none" stroke="' + fill + '" stroke-width="1.2" opacity="0.9">' +
        '<path d="M' + (x - a) + ' ' + (y - s) + ' Q' + x + ' ' + y + ' ' + (x + a) + ' ' + (y + s) + '"/>' +
        '<path d="M' + (x + a) + ' ' + (y - s) + ' Q' + x + ' ' + y + ' ' + (x - a) + ' ' + (y + s) + '"/>' +
        '<line x1="' + (x - a * 0.6) + '" y1="' + (y - s * 0.3) + '" x2="' + (x + a * 0.6) + '" y2="' + (y - s * 0.3) + '"/>' +
        '<line x1="' + (x - a * 0.6) + '" y1="' + (y + s * 0.3) + '" x2="' + (x + a * 0.6) + '" y2="' + (y + s * 0.3) + '"/>' +
        '</g>'
      );
    }
    function iconHeart(x, y, s) {
      return (
        '<path fill="' + fill + '" stroke="none" opacity="0.8" d="' +
        'M' + x + ' ' + (y + s * 0.35) +
        ' C' + x + ' ' + (y + s * 0.1) + ' ' + (x - s) + ' ' + (y - s * 0.5) + ' ' + (x - s * 0.5) + ' ' + (y - s * 0.5) +
        ' C' + (x - s * 0.15) + ' ' + (y - s * 0.5) + ' ' + x + ' ' + (y - s * 0.15) + ' ' + x + ' ' + (y + s * 0.05) +
        ' C' + x + ' ' + (y - s * 0.15) + ' ' + (x + s * 0.15) + ' ' + (y - s * 0.5) + ' ' + (x + s * 0.5) + ' ' + (y - s * 0.5) +
        ' C' + (x + s) + ' ' + (y - s * 0.5) + ' ' + x + ' ' + (y + s * 0.1) + ' ' + x + ' ' + (y + s * 0.35) + ' Z"/>'
      );
    }
    return (
      '<svg class="dr-network" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="none" width="100%" height="100%">' +
      '<g fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">' +
      line('M40 250 H200 L260 200 H420 L480 250 H600', true) +
      line('M1160 250 H1000 L940 200 H780 L720 250 H600', true) +
      line('M40 550 H200 L260 500 H420 L480 550 H600', true) +
      line('M1160 550 H1000 L940 500 H780 L720 550 H600', true) +
      line('M600 250 V550', false) +
      line('M200 250 V400', false) +
      line('M1000 250 V400', false) +
      node(200, 250) + node(260, 200) + node(420, 200) + node(480, 250) + node(600, 250) +
      node(1000, 250) + node(940, 200) + node(780, 200) + node(720, 250) +
      node(200, 550) + node(260, 500) + node(420, 500) + node(480, 550) + node(600, 550) +
      node(1000, 550) + node(940, 500) + node(780, 500) + node(720, 550) +
      node(200, 400) + node(1000, 400) +
      '</g>' +
      '<g fill="none" stroke="' + accent + '">' +
      iconCross(340, 120, 14) + iconCross(860, 120, 14) +
      iconCross(340, 680, 14) + iconCross(860, 680, 14) +
      iconDna(110, 400, 18) + iconDna(1090, 400, 18) +
      iconDna(500, 400, 16) + iconDna(700, 400, 16) +
      iconHeart(500, 120, 11) + iconHeart(700, 120, 11) +
      iconHeart(110, 120, 12) + iconHeart(1090, 120, 12) +
      iconHeart(500, 680, 11) + iconHeart(700, 680, 11) +
      iconHeart(110, 680, 12) + iconHeart(1090, 680, 12) +
      '</g>' +
      '</svg>'
    );
  }

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      document.head.appendChild(el);
    }
    el.textContent = [
      '#' + LAYER_ID + '{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}',
      '#' + LAYER_ID + ' .dr-honeycomb{position:absolute;inset:-8%;width:116%;height:116%;opacity:0.2}',
      '#' + LAYER_ID + ' .dr-honeycomb svg{width:100%;height:100%;display:block}',
      '#' + LAYER_ID + ' .dr-network{position:absolute;inset:0;opacity:0.55}',
      '#' + LAYER_ID + ' .dr-network svg{width:100%;height:100%;display:block}',
      '#' + LAYER_ID + ' .dr-pulse{stroke-dasharray:4 10;animation:drTrace 14s linear infinite}',
      '@keyframes drTrace{from{stroke-dashoffset:0}to{stroke-dashoffset:-280}}',
      'html,body{background:' + LOGIN_DARK + '!important;background-attachment:fixed!important}',
      '#login-screen,.login-screen{background:transparent!important;background-image:none!important;position:relative!important;overflow:hidden!important}'
    ].join('');
  }

  function paint() {
    if (window.__DR_AMBIENT_LOCKED) return;
    if (document.getElementById(LAYER_ID)) {
      window.__DR_AMBIENT_LOCKED = true;
      return;
    }
    injectCss();
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    var layer = document.createElement('div');
    layer.id = LAYER_ID;
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML =
      '<div class="dr-honeycomb">' + honeycombSvg('#a78bfa') + '</div>' +
      '<div class="dr-network">' + networkSvg('#e9d5ff', '#c4b5fd', '#ddd6fe') + '</div>';
    var parent = login || document.body;
    parent.insertBefore(layer, parent.firstChild);
    try {
      document.body.classList.add('is-login');
      document.querySelectorAll('#login-screen,.login-screen').forEach(function (el) {
        el.style.setProperty('background', 'transparent', 'important');
      });
    } catch (e) {}
    window.__DR_AMBIENT_LOCKED = true;
  }

  function tryPaint() {
    if (document.body) paint();
    else setTimeout(tryPaint, 40);
  }
  tryPaint();
  setTimeout(tryPaint, 500);
  setTimeout(tryPaint, 1500);

  window.DRForceLightBg = { refresh: function () { /* one-shot: never rebuild */ } };
})();
