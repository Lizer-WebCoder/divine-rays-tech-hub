/**
 * Divine Rays — login ambient galaxy v1
 * Stronger honeycomb, star particles, clean network (no filled "cards")
 * Dash lines + ECG left alone
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_GALAXY >= 1) return;
  window.__DR_AMBIENT_GALAXY = 1;

  var LAYER_ID = 'dr-login-ambient';
  var CSS_ID = 'dr-ambient-galaxy-css';

  function honeycombSvg(stroke) {
    var R = 42;
    var SQ3 = Math.sqrt(3);
    var horiz = SQ3 * R;
    var vert = 1.5 * R;
    var cols = 26;
    var rows = 20;
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
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + vbW + ' ' + vbH + '" ' +
      'preserveAspectRatio="xMidYMid slice" width="100%" height="100%">' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="1.5" stroke-linejoin="round">' +
      paths.map(function (d) { return '<path d="' + d + '"/>'; }).join('') +
      '</g></svg>'
    );
  }

  function starsSvg() {
    var parts = [];
    var seeds = [
      [80,60,1.2],[180,140,0.8],[320,40,1.5],[450,90,0.7],[580,30,1.1],
      [720,110,0.9],[880,50,1.4],[1020,130,0.8],[1120,70,1.2],[150,220,0.6],
      [280,300,1.0],[400,180,0.7],[540,260,1.3],[660,200,0.8],[800,280,1.1],
      [950,220,0.7],[1080,300,1.0],[60,400,0.9],[200,480,1.2],[360,420,0.6],
      [500,500,1.4],[640,460,0.8],[780,520,1.0],[920,440,0.7],[1100,500,1.1],
      [120,600,0.8],[300,680,1.2],[480,620,0.7],[620,700,1.0],[760,640,0.9],
      [900,720,1.3],[1040,660,0.6],[40,750,0.8],[220,780,1.0],[1100,780,0.9],
      [160,100,0.5],[420,340,0.5],[700,80,0.5],[850,380,0.6],[990,600,0.5],
      [50,280,0.7],[380,560,0.8],[550,140,0.6],[830,160,0.9],[1150,400,0.7]
    ];
    seeds.forEach(function (s, i) {
      var delay = ((i * 0.37) % 4).toFixed(2);
      parts.push(
        '<circle class="dr-star-twinkle" cx="' + s[0] + '" cy="' + s[1] + '" r="' + s[2] + '" ' +
        'style="animation-delay:' + delay + 's"/>'
      );
      if (s[2] >= 1.1) {
        parts.push(
          '<circle class="dr-star-glow" cx="' + s[0] + '" cy="' + s[1] + '" r="' + (s[2] * 3) + '" ' +
          'style="animation-delay:' + delay + 's"/>'
        );
      }
    });
    return (
      '<svg class="dr-stars" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" ' +
      'preserveAspectRatio="none" width="100%" height="100%">' +
      '<g fill="#e9d5ff">' + parts.join('') + '</g></svg>'
    );
  }

  function networkSvg(stroke, nodeFill) {
    function node(x, y, r) {
      r = r || 3.2;
      return (
        '<circle class="dr-net-node" cx="' + x + '" cy="' + y + '" r="' + (r * 2.4) + '" fill="' + nodeFill + '" opacity="0.25"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + nodeFill + '" stroke="' + stroke + '" stroke-width="1"/>'
      );
    }
    function line(d, pulse) {
      return '<path fill="none" ' + (pulse ? 'class="dr-pulse" ' : '') + 'stroke="' + stroke + '" stroke-width="1.2" d="' + d + '"/>';
    }
    function iconChip(x, y, s) {
      var h = s * 0.55;
      return (
        '<g fill="none" stroke="' + nodeFill + '" stroke-width="1.15" opacity="0.85">' +
        '<rect x="' + (x - h) + '" y="' + (y - h) + '" width="' + (h * 2) + '" height="' + (h * 2) + '" rx="2"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + (s * 0.18) + '" fill="' + nodeFill + '" stroke="none"/>' +
        '<line x1="' + (x - h) + '" y1="' + y + '" x2="' + (x - h - s * 0.25) + '" y2="' + y + '"/>' +
        '<line x1="' + (x + h) + '" y1="' + y + '" x2="' + (x + h + s * 0.25) + '" y2="' + y + '"/>' +
        '<line x1="' + x + '" y1="' + (y - h) + '" x2="' + x + '" y2="' + (y - h - s * 0.25) + '"/>' +
        '<line x1="' + x + '" y1="' + (y + h) + '" x2="' + x + '" y2="' + (y + h + s * 0.25) + '"/>' +
        '</g>'
      );
    }
    function iconPulse(x, y, s) {
      return (
        '<g fill="none" stroke="' + nodeFill + '" stroke-width="1.2" opacity="0.8">' +
        '<path d="M' + (x - s) + ' ' + y + ' L' + (x - s * 0.4) + ' ' + y +
        ' L' + (x - s * 0.15) + ' ' + (y - s * 0.7) +
        ' L' + (x + s * 0.15) + ' ' + (y + s * 0.7) +
        ' L' + (x + s * 0.4) + ' ' + y +
        ' L' + (x + s) + ' ' + y + '"/>' +
        '</g>'
      );
    }
    function iconOrbit(x, y, s) {
      return (
        '<g fill="none" stroke="' + nodeFill + '" stroke-width="1.1" opacity="0.8">' +
        '<ellipse cx="' + x + '" cy="' + y + '" rx="' + s + '" ry="' + (s * 0.4) + '"/>' +
        '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (s * 0.4) + '" ry="' + s + '"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="2" fill="' + nodeFill + '" stroke="none"/>' +
        '</g>'
      );
    }
    return (
      '<svg class="dr-network" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" ' +
      'preserveAspectRatio="none" width="100%" height="100%">' +
      '<g fill="none">' +
      line('M40 250 H200 L260 200 H420 L480 250 H600', true) +
      line('M1160 250 H1000 L940 200 H780 L720 250 H600', true) +
      line('M40 550 H200 L260 500 H420 L480 550 H600', true) +
      line('M1160 550 H1000 L940 500 H780 L720 550 H600', true) +
      line('M600 250 V550', false) +
      line('M200 250 V400', false) +
      line('M1000 250 V400', false) +
      line('M420 200 V500', false) +
      line('M780 200 V500', false) +
      node(200, 250) + node(260, 200) + node(420, 200) + node(480, 250) + node(600, 250) +
      node(1000, 250) + node(940, 200) + node(780, 200) + node(720, 250) +
      node(200, 550) + node(260, 500) + node(420, 500) + node(480, 550) + node(600, 550) +
      node(1000, 550) + node(940, 500) + node(780, 500) + node(720, 550) +
      node(200, 400) + node(1000, 400) +
      '</g>' +
      iconChip(340, 120, 14) + iconChip(860, 120, 14) +
      iconChip(340, 680, 14) + iconChip(860, 680, 14) +
      iconOrbit(110, 400, 16) + iconOrbit(1090, 400, 16) +
      iconPulse(500, 400, 18) + iconPulse(700, 400, 18) +
      iconPulse(500, 120, 12) + iconPulse(700, 120, 12) +
      iconOrbit(110, 120, 12) + iconOrbit(1090, 120, 12) +
      iconChip(500, 680, 12) + iconChip(700, 680, 12) +
      '</svg>'
    );
  }

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#' + LAYER_ID + '{position:fixed!important;inset:0!important;z-index:0!important;pointer-events:none!important;overflow:hidden!important}',
      '#' + LAYER_ID + ' .dr-honeycomb{position:absolute;inset:-6%;width:112%;height:112%;opacity:0.42!important}',
      '#' + LAYER_ID + ' .dr-network{position:absolute;inset:0;opacity:0.7!important}',
      '#' + LAYER_ID + ' .dr-stars{position:absolute;inset:0;opacity:0.9!important;z-index:1}',
      '#' + LAYER_ID + ' .dr-pulse{stroke-dasharray:5 12;animation:drTrace 16s linear infinite}',
      '@keyframes drTrace{from{stroke-dashoffset:0}to{stroke-dashoffset:-300}}',
      '#' + LAYER_ID + ' .dr-star-twinkle{animation:drTwinkle 3.2s ease-in-out infinite;opacity:0.85}',
      '#' + LAYER_ID + ' .dr-star-glow{animation:drTwinkle 3.2s ease-in-out infinite;opacity:0.2;fill:#c4b5fd}',
      '@keyframes drTwinkle{0%,100%{opacity:0.35}50%{opacity:1}}'
    ].join('');
  }

  function paint() {
    injectCss();
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    var layer = document.getElementById(LAYER_ID);
    if (!layer) {
      layer = document.createElement('div');
      layer.id = LAYER_ID;
      layer.setAttribute('aria-hidden', 'true');
    }
    var parent = login || document.body;
    if (layer.parentNode !== parent) {
      try { parent.insertBefore(layer, parent.firstChild); }
      catch (e) { document.body.insertBefore(layer, document.body.firstChild); }
    }
    window.__DR_AMBIENT_LOCKED = false;
    var stroke = 'rgba(196,181,253,0.55)';
    var nodeFill = '#e9d5ff';
    layer.innerHTML =
      '<div class="dr-honeycomb">' + honeycombSvg('rgba(167,139,250,0.55)') + '</div>' +
      '<div class="dr-stars">' + starsSvg() + '</div>' +
      '<div class="dr-network">' + networkSvg(stroke, nodeFill) + '</div>';
    layer.style.display = 'block';
    window.__DR_AMBIENT_LOCKED = true;
  }

  function run() { try { paint(); } catch (e) {} }
  run();
  setTimeout(run, 300);
  setTimeout(run, 900);
  setTimeout(run, 1800);

  window.DRAmbientGalaxy = { v: 1, refresh: run };
})();
