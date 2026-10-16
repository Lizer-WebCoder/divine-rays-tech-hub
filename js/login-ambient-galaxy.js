/**
 * Divine Rays — login ambient galaxy v3
 * Honeycomb + dash network (no mid vertical nodes)
 * Stars only (no soft glow blobs); smooth drifting particles
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_GALAXY >= 3) return;
  window.__DR_AMBIENT_GALAXY = 3;

  var LAYER_ID = 'dr-login-ambient';
  var CSS_ID = 'dr-ambient-galaxy-css';

  function honeycombSvg(stroke) {
    var R = 42, SQ3 = Math.sqrt(3), horiz = SQ3 * R, vert = 1.5 * R;
    var cols = 26, rows = 20, paths = [];
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
      [80,60,1.1],[180,140,0.7],[320,40,1.3],[450,90,0.6],[580,30,1.0],
      [720,110,0.8],[880,50,1.2],[1020,130,0.7],[1120,70,1.1],[150,220,0.55],
      [280,300,0.9],[400,180,0.65],[540,260,1.15],[660,200,0.7],[800,280,1.0],
      [950,220,0.65],[1080,300,0.9],[60,400,0.8],[200,480,1.05],[360,420,0.55],
      [500,500,1.2],[640,460,0.7],[780,520,0.9],[920,440,0.65],[1100,500,1.0],
      [120,600,0.7],[300,680,1.05],[480,620,0.65],[620,700,0.9],[760,640,0.8],
      [900,720,1.15],[1040,660,0.55],[40,750,0.7],[220,780,0.9],[1100,780,0.8],
      [160,100,0.45],[420,340,0.45],[700,80,0.5],[850,380,0.55],[990,600,0.45],
      [50,280,0.6],[380,560,0.7],[550,140,0.55],[830,160,0.8],[1150,400,0.65],
      [250,50,0.5],[510,380,0.6],[690,560,0.5],[870,300,0.7],[1050,180,0.55],
      [130,520,0.6],[340,740,0.5],[470,40,0.7],[610,300,0.55],[940,100,0.65],
      [70,180,0.5],[290,440,0.6],[430,640,0.45],[750,40,0.7],[980,480,0.55]
    ];
    seeds.forEach(function (s, i) {
      var delay = ((i * 0.41) % 5).toFixed(2);
      var dur = (4.5 + (i % 5) * 0.6).toFixed(2);
      parts.push(
        '<circle class="dr-star-twinkle" cx="' + s[0] + '" cy="' + s[1] + '" r="' + s[2] + '" ' +
        'style="animation-delay:' + delay + 's;animation-duration:' + dur + 's"/>'
      );
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
        '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + nodeFill + '" ' +
        'stroke="' + stroke + '" stroke-width="1"/>'
      );
    }
    function line(d, pulse) {
      return '<path fill="none" ' + (pulse ? 'class="dr-pulse" ' : '') +
        'stroke="' + stroke + '" stroke-width="1.25" d="' + d + '"/>';
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
      line('M200 250 V550', false) +
      line('M1000 250 V550', false) +
      line('M420 200 V500', false) +
      line('M780 200 V500', false) +
      node(200, 250) + node(260, 200) + node(420, 200) + node(480, 250) + node(600, 250) +
      node(1000, 250) + node(940, 200) + node(780, 200) + node(720, 250) +
      node(200, 550) + node(260, 500) + node(420, 500) + node(480, 550) + node(600, 550) +
      node(1000, 550) + node(940, 500) + node(780, 500) + node(720, 550) +
      '</g></svg>'
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
      '#' + LAYER_ID + ' .dr-honeycomb{position:absolute;inset:-6%;width:112%;height:112%;opacity:0.38!important}',
      '#' + LAYER_ID + ' .dr-network{position:absolute;inset:0;opacity:0.75!important}',
      '#' + LAYER_ID + ' .dr-stars{position:absolute;inset:0;opacity:0.9!important;z-index:1}',
      '#' + LAYER_ID + ' .dr-particles{position:absolute;inset:0;z-index:1;pointer-events:none}',
      '#' + LAYER_ID + ' .dr-pulse{stroke-dasharray:5 12;animation:drTrace 16s linear infinite}',
      '@keyframes drTrace{from{stroke-dashoffset:0}to{stroke-dashoffset:-300}}',
      '#' + LAYER_ID + ' .dr-star-twinkle{animation:drTwinkle ease-in-out infinite;opacity:0.7}',
      '@keyframes drTwinkle{0%,100%{opacity:0.25;transform:scale(0.85)}50%{opacity:1;transform:scale(1.15)}}',
      '#' + LAYER_ID + ' .dr-dot{position:absolute;border-radius:50%;background:#e9d5ff;',
      'box-shadow:0 0 4px rgba(196,181,253,0.7);animation:drDrift linear infinite;opacity:0.55}',
      '@keyframes drDrift{',
      '0%{transform:translate3d(0,0,0);opacity:0}',
      '12%{opacity:0.7}',
      '88%{opacity:0.55}',
      '100%{transform:translate3d(var(--dx),var(--dy),0);opacity:0}',
      '}'
    ].join('');
  }

  function buildParticles(layer) {
    var old = layer.querySelector('.dr-particles');
    if (old) old.remove();
    var wrap = document.createElement('div');
    wrap.className = 'dr-particles';
    var n = 36;
    for (var i = 0; i < n; i++) {
      var d = document.createElement('span');
      d.className = 'dr-dot';
      var size = 1.5 + Math.random() * 2.5;
      var x = Math.random() * 100;
      var y = Math.random() * 100;
      var dx = (Math.random() * 40 - 20).toFixed(1) + 'vw';
      var dy = (-15 - Math.random() * 35).toFixed(1) + 'vh';
      var dur = (18 + Math.random() * 22).toFixed(1) + 's';
      var delay = (-Math.random() * 20).toFixed(1) + 's';
      d.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + x + '%;top:' + y + '%;' +
        '--dx:' + dx + ';--dy:' + dy + ';' +
        'animation-duration:' + dur + ';' +
        'animation-delay:' + delay + ';';
      wrap.appendChild(d);
    }
    layer.appendChild(wrap);
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
    layer.innerHTML =
      '<div class="dr-honeycomb">' + honeycombSvg('rgba(167,139,250,0.5)') + '</div>' +
      '<div class="dr-stars">' + starsSvg() + '</div>' +
      '<div class="dr-network">' + networkSvg('rgba(196,181,253,0.6)', '#e9d5ff') + '</div>';
    buildParticles(layer);
    layer.style.display = 'block';
    window.__DR_AMBIENT_LOCKED = true;
  }

  function run() { try { paint(); } catch (e) {} }
  run();
  setTimeout(run, 300);
  setTimeout(run, 900);
  setTimeout(run, 1800);
  window.DRAmbientGalaxy = { v: 3, refresh: run };
})();
