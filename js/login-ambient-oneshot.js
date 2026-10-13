/**
 * Divine Rays — login ambient one-shot v16 (honeycomb + dashed lines)
 * Paints once. Never rebuilds on type/click/login. Freeze-safe.
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_V16) return;
  window.__DR_AMBIENT_V16 = 1;

  var LAYER = 'dr-login-ambient';
  var CSS = 'dr-login-ambient-css';

  function css() {
    return [
      '#' + LAYER + '{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}',
      '#' + LAYER + ' .dr-honeycomb{position:absolute;inset:-5%;width:110%;height:110%;opacity:0.22}',
      '#' + LAYER + ' .dr-honeycomb svg{width:100%;height:100%;display:block}',
      '#' + LAYER + ' .dr-network{position:absolute;inset:0;opacity:0.55}',
      '#' + LAYER + ' .dr-network svg{width:100%;height:100%;display:block}',
      '#' + LAYER + ' .dr-pulse{stroke-dasharray:4 10;animation:drTrace 14s linear infinite}',
      '@keyframes drTrace{from{stroke-dashoffset:0}to{stroke-dashoffset:-280}}',
      '#login-screen,.login-screen{background:transparent!important;background-image:none!important}',
      'body.is-login,html{background:' +
        'radial-gradient(ellipse 100% 70% at 50% 45%,rgba(124,58,237,0.35),transparent 55%),' +
        'radial-gradient(ellipse 70% 50% at 15% 20%,rgba(139,92,246,0.22),transparent 50%),' +
        'radial-gradient(ellipse 70% 50% at 85% 80%,rgba(91,33,182,0.28),transparent 50%),' +
        'linear-gradient(180deg,#2a1058 0%,#1a0a3e 35%,#120830 65%,#0a0518 100%)!important;background-attachment:fixed!important}'
    ].join('');
  }

  function honeycomb() {
    var size = 28, h = size * Math.sqrt(3), paths = [], W = 1400, H = 900, row = 0;
    for (var y = -h; y < H + h; y += h * 0.75) {
      var xOff = (row % 2) * (size * 1.5);
      for (var x = -size * 2 + xOff; x < W + size * 2; x += size * 3) {
        var pts = [];
        for (var i = 0; i < 6; i++) {
          var a = (Math.PI / 180) * (60 * i - 30);
          pts.push((x + size * Math.cos(a)).toFixed(1) + ' ' + (y + size * Math.sin(a)).toFixed(1));
        }
        paths.push('<path d="M' + pts.join('L') + 'Z"/>');
      }
      row++;
    }
    return '<div class="dr-honeycomb"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#a78bfa" stroke-width="1.1">' + paths.join('') + '</g></svg></div>';
  }

  function network() {
    function line(d, pulse) {
      return '<path class="' + (pulse ? 'dr-pulse' : '') + '" d="' + d + '" fill="none" stroke="#e9d5ff" stroke-width="1.15"/>';
    }
    function node(x, y) {
      return '<circle cx="' + x + '" cy="' + y + '" r="2.2" fill="#f5f3ff"/>';
    }
    return '<div class="dr-network"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="none" width="100%" height="100%">' +
      line('M40 250 H200 L260 200 H420 L480 250 H600', true) +
      line('M1160 250 H1000 L940 200 H780 L720 250 H600', true) +
      line('M40 550 H200 L260 500 H420 L480 550 H600', true) +
      line('M1160 550 H1000 L940 500 H780 L720 550 H600', true) +
      line('M600 250 V550', false) +
      node(200,250)+node(260,200)+node(420,200)+node(480,250)+node(600,250) +
      node(1000,250)+node(940,200)+node(780,200)+node(720,250) +
      node(200,550)+node(260,500)+node(420,500)+node(480,550)+node(600,550) +
      node(1000,550)+node(940,500)+node(780,500)+node(720,550) +
      '</svg></div>';
  }

  function paint() {
    if (document.getElementById(LAYER)) return;
    var st = document.getElementById(CSS);
    if (!st) {
      st = document.createElement('style');
      st.id = CSS;
      document.head.appendChild(st);
    }
    st.textContent = css();
    var layer = document.createElement('div');
    layer.id = LAYER;
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = honeycomb() + network();
    document.body.insertBefore(layer, document.body.firstChild);
    try {
      document.body.classList.add('is-login');
      document.querySelectorAll('#login-screen,.login-screen').forEach(function (el) {
        el.style.setProperty('background', 'transparent', 'important');
      });
    } catch (e) {}
  }

  function ready() {
    if (document.body) paint();
    else setTimeout(ready, 50);
  }
  ready();
  setTimeout(paint, 400);
  setTimeout(paint, 1200);

  window.DRLoginAmbient = { refresh: function () { /* no-op — one-shot only */ } };
})();
