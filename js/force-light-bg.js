/**
 * Divine Rays — symmetrical medical-tech ambient (login + portal)
 * Upper band at card-top · lower at card-bottom · ECG centered between
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG) {
    try { delete window.__DR_FORCE_LIGHT_BG; } catch (e) {}
  }
  window.__DR_FORCE_LIGHT_BG = 1;

  var CSS_ID = 'dr-login-ambient-css';
  var LAYER_ID = 'dr-login-ambient';
  var lastAmbientKey = '';

  var LOGIN_DARK =
    'radial-gradient(ellipse 120% 80% at 50% 50%, rgba(139,92,246,0.28), transparent 60%),' +
    'radial-gradient(ellipse 70% 50% at 20% 20%, rgba(167,139,250,0.2), transparent 50%),' +
    'radial-gradient(ellipse 70% 50% at 80% 80%, rgba(91,33,182,0.25), transparent 50%),' +
    'linear-gradient(180deg, #2e1260 0%, #1c0a45 40%, #120830 70%, #0a0518 100%)';

  var LOGIN_LIGHT =
    'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(139,92,246,0.38), transparent 55%),' +
    'radial-gradient(ellipse 80% 55% at 15% 85%, rgba(124,58,237,0.28), transparent 50%),' +
    'radial-gradient(ellipse 75% 50% at 90% 20%, rgba(167,139,250,0.32), transparent 48%),' +
    'radial-gradient(ellipse 60% 45% at 50% 100%, rgba(91,33,182,0.2), transparent 55%),' +
    'linear-gradient(165deg, #e8deff 0%, #d9ccf7 28%, #cbb8f0 55%, #bba6e8 78%, #ae96e0 100%)';

  var PORTAL_DARK =
    'radial-gradient(ellipse 80% 50% at 70% 20%, rgba(109,94,245,0.18), transparent 55%),' +
    'radial-gradient(ellipse 60% 40% at 10% 80%, rgba(91,76,224,0.12), transparent 50%),' +
    'linear-gradient(165deg, #0c0c14 0%, #12121c 45%, #0e0e18 100%)';

  var PORTAL_LIGHT =
    'radial-gradient(ellipse 80% 50% at 70% 15%, rgba(109,94,245,0.14), transparent 55%),' +
    'radial-gradient(ellipse 50% 40% at 0% 90%, rgba(167,139,250,0.1), transparent 50%),' +
    'linear-gradient(165deg, #f4f2fb 0%, #ebe8f6 50%, #e4e0f2 100%)';

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

  function loginVisible() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!login) return false;
    if (login.hidden || login.classList.contains('is-hidden')) return false;
    try {
      var st = window.getComputedStyle(login);
      if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
    } catch (e) {}
    return true;
  }

  function ambientCss() {
    var light = isLight();
    var hexOp = light ? '0.48' : '0.22';
    var netOp = light ? '0.85' : '0.52';
    var particle = light ? 'rgba(91,33,182,0.75)' : 'rgba(233,213,255,0.6)';
    var vignette = light
      ? 'radial-gradient(ellipse 40% 38% at 50% 48%, transparent 22%, rgba(200,185,240,0.35) 100%)'
      : 'radial-gradient(ellipse 42% 40% at 50% 48%, transparent 20%, rgba(10,5,24,0.55) 100%)';

    return [
      '#' + LAYER_ID + '{',
      'position:absolute!important;inset:0!important;z-index:0!important;',
      'pointer-events:none!important;overflow:hidden!important;display:none',
      '}',
      'body.is-login #' + LAYER_ID + '{display:block!important;position:absolute!important}',
      'body.is-portal #' + LAYER_ID + '{display:block!important;position:fixed!important;inset:0!important;z-index:0!important}',
      '#' + LAYER_ID + ' .dr-honeycomb{position:absolute;inset:-2%;opacity:' + hexOp + '}',
      '#' + LAYER_ID + ' .dr-honeycomb svg{width:100%;height:100%;display:block}',
      '#' + LAYER_ID + ' .dr-network{position:absolute;inset:0;opacity:' + netOp + '}',
      '#' + LAYER_ID + ' .dr-network svg{width:100%;height:100%;display:block}',
      '#' + LAYER_ID + ' .dr-vignette{position:absolute;inset:0;background:' + vignette + '}',
      '#' + LAYER_ID + ' .dr-particles span{',
      'position:absolute;border-radius:50%;background:' + particle + ';',
      'box-shadow:0 0 8px ' + particle + ',0 0 16px ' + particle + ';',
      'animation:drParticle 8s ease-in-out infinite',
      '}',
      '@keyframes drParticle{0%{transform:translate(0,0) scale(1);opacity:0.25}40%{opacity:0.9}100%{transform:translate(8px,-36px) scale(0.65);opacity:0.08}}',
      '#' + LAYER_ID + ' .dr-pulse{stroke-dasharray:4 10;animation:drTrace 14s linear infinite}',
      '@keyframes drTrace{from{stroke-dashoffset:0}to{stroke-dashoffset:-280}}',
      '@media (prefers-reduced-motion:reduce){#' + LAYER_ID + ' .dr-particles span,#' + LAYER_ID + ' .dr-pulse{animation:none!important}}'
    ].join('');
  }

  function honeycombSvg(stroke) {
    var cells = [];
    var r = 28;
    var dx = r * 1.75;
    var dy = r * 1.52;
    for (var row = -1; row < 18; row++) {
      for (var col = -1; col < 24; col++) {
        var x = col * dx + (row % 2 ? dx / 2 : 0);
        var y = row * dy;
        var pts = [];
        for (var i = 0; i < 6; i++) {
          var a = (Math.PI / 180) * (60 * i - 30);
          pts.push((x + r * Math.cos(a)).toFixed(1) + ',' + (y + r * Math.sin(a)).toFixed(1));
        }
        cells.push('M' + pts.join('L') + 'Z');
      }
    }
    return (
      '<div class="dr-honeycomb"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" fill="none" stroke="' +
      stroke +
      '" stroke-width="1.1">' +
      cells.map(function (d) { return '<path d="' + d + '"/>'; }).join('') +
      '</svg></div>'
    );
  }

  function networkSvg(stroke, fill, accent) {
    function node(x, y, r) {
      return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.2"/>';
    }
    function line(d, pulse) {
      return '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="1.15" class="' + (pulse ? 'dr-pulse' : '') + '" opacity="0.55"/>';
    }
    function iconCross(x, y, s) {
      var h = s / 2;
      return (
        '<g transform="translate(' + x + ',' + y + ')">' +
        '<rect x="' + (-h * 0.22) + '" y="' + (-h) + '" width="' + h * 0.44 + '" height="' + s + '" rx="1" fill="' + accent + '" opacity="0.55"/>' +
        '<rect x="' + (-h) + '" y="' + (-h * 0.22) + '" width="' + s + '" height="' + h * 0.44 + '" rx="1" fill="' + accent + '" opacity="0.55"/>' +
        '</g>'
      );
    }
    function iconHeart(x, y, s) {
      return (
        '<path transform="translate(' + x + ',' + y + ') scale(' + s / 24 + ')" d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12C19 16.5 12 21 12 21z" fill="' +
        accent +
        '" opacity="0.45"/>'
      );
    }
    function iconEcg(x, y, w) {
      var h = w * 0.35;
      return (
        '<path d="M' + (x - w / 2) + ' ' + y + ' L' + (x - w * 0.2) + ' ' + y +
        ' L' + (x - w * 0.1) + ' ' + (y - h) + ' L' + (x + w * 0.05) + ' ' + (y + h * 0.9) +
        ' L' + (x + w * 0.18) + ' ' + (y - h * 0.35) + ' L' + (x + w * 0.28) + ' ' + y +
        ' L' + (x + w / 2) + ' ' + y + '" fill="none" stroke="' + stroke + '" stroke-width="1.6" opacity="0.7"/>'
      );
    }
    function iconDna(x, y, h) {
      return (
        '<g opacity="0.5" stroke="' + stroke + '" fill="none" stroke-width="1.2">' +
        '<path d="M' + (x - 6) + ' ' + (y - h / 2) + ' C' + (x + 10) + ' ' + (y - h / 4) + ',' + (x - 10) + ' ' + (y + h / 4) + ',' + (x + 6) + ' ' + (y + h / 2) + '"/>' +
        '<path d="M' + (x + 6) + ' ' + (y - h / 2) + ' C' + (x - 10) + ' ' + (y - h / 4) + ',' + (x + 10) + ' ' + (y + h / 4) + ',' + (x - 6) + ' ' + (y + h / 2) + '"/>' +
        '</g>'
      );
    }
    function iconHex(x, y, r) {
      var pts = [];
      for (var i = 0; i < 6; i++) {
        var a = (Math.PI / 180) * (60 * i - 30);
        pts.push((x + r * Math.cos(a)).toFixed(1) + ',' + (y + r * Math.sin(a)).toFixed(1));
      }
      return '<path d="M' + pts.join('L') + 'Z" fill="none" stroke="' + stroke + '" stroke-width="1.2" opacity="0.55"/>';
    }
    return (
      '<svg class="dr-network" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">' +
      line('M80 120 L220 180 L360 140 L520 200', true) +
      line('M520 200 L680 160 L820 220 L1040 170', true) +
      line('M100 400 L260 360 L420 420 L600 380', false) +
      line('M600 380 L780 440 L940 400 L1100 460', true) +
      line('M140 650 L300 600 L480 660 L700 610', false) +
      line('M700 610 L880 670 L1040 620', true) +
      line('M220 180 L260 360 L300 600', false) +
      line('M680 160 L600 380 L700 610', true) +
      line('M820 220 L780 440 L880 670', false) +
      node(80, 120, 4) + node(220, 180, 5) + node(360, 140, 4) + node(520, 200, 6) +
      node(680, 160, 4) + node(820, 220, 5) + node(1040, 170, 4) +
      node(100, 400, 4) + node(260, 360, 5) + node(420, 420, 4) + node(600, 380, 6) +
      node(780, 440, 5) + node(940, 400, 4) + node(1100, 460, 4) +
      node(140, 650, 4) + node(300, 600, 5) + node(480, 660, 4) + node(700, 610, 5) +
      node(880, 670, 4) + node(1040, 620, 4) +
      iconEcg(110, 220, 40) + iconEcg(1090, 220, 40) +
      iconCross(60, 520, 18) + iconCross(1140, 520, 18) +
      iconHeart(180, 740, 14) + iconHeart(1020, 740, 14) +
      iconDna(50, 300, 40) + iconDna(1150, 300, 40) +
      iconHex(400, 80, 14) + iconHex(800, 720, 14) +
      '</svg>'
    );
  }

  function particlesHtml() {
    var left = [
      [8, 12], [14, 28], [6, 45], [18, 62], [10, 78],
      [22, 18], [4, 55], [16, 88]
    ];
    var spots = left.slice();
    left.forEach(function (p) { spots.push([100 - p[0], p[1]]); });
    var html = '<div class="dr-particles">';
    spots.forEach(function (p, i) {
      var size = 2 + (i % 3);
      html +=
        '<span style="left:' + p[0] + '%;top:' + p[1] + '%;width:' + size + 'px;height:' + size +
        'px;animation-delay:' + (i * 0.45) + 's"></span>';
    });
    html += '</div>';
    return html;
  }

  function ensureAmbient() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    var layer = document.getElementById(LAYER_ID);
    var onLogin = loginVisible();
    if (!layer) {
      layer = document.createElement('div');
      layer.id = LAYER_ID;
      layer.setAttribute('aria-hidden', 'true');
    }
    var host = onLogin && login ? login : document.body;
    if (layer.parentNode !== host) {
      if (onLogin && login) login.insertBefore(layer, login.firstChild);
      else document.body.insertBefore(layer, document.body.firstChild);
    }
    var light = isLight();
    var key = (light ? 'L' : 'D') + (onLogin ? '-login-v3' : '-portal-v3');
    if (key === lastAmbientKey && layer.childNodes.length) {
      layer.style.display = 'block';
      return;
    }
    lastAmbientKey = key;
    var stroke = light ? '#4c1d95' : '#e9d5ff';
    var fill = light ? '#5b21b6' : '#f5f3ff';
    var accent = light ? '#3b0764' : '#2e1065';
    layer.innerHTML =
      honeycombSvg(stroke) + networkSvg(stroke, fill, accent) +
      '<div class="dr-vignette"></div>' + particlesHtml();
    if (!onLogin) {
      var honey = layer.querySelector('.dr-honeycomb');
      var net = layer.querySelector('.dr-network');
      if (honey) honey.style.opacity = light ? '0.32' : '0.18';
      if (net) net.style.opacity = light ? '0.55' : '0.38';
    }
    layer.style.display = 'block';
  }

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      document.head.appendChild(el);
    }
    el.textContent = ambientCss();
  }

  function apply() {
    var body = document.body;
    if (!body) return;
    var light = isLight();
    var onLogin = loginVisible();
    var grad = onLogin ? (light ? LOGIN_LIGHT : LOGIN_DARK) : light ? PORTAL_LIGHT : PORTAL_DARK;
    var solid = onLogin ? (light ? '#cbb8f0' : '#120830') : light ? '#ebe8f6' : '#0c0c14';
    try {
      body.classList.toggle('is-login', onLogin);
      body.classList.toggle('is-portal', !onLogin);
    } catch (e) {}
    body.style.setProperty('background-color', solid, 'important');
    body.style.setProperty('background-image', grad, 'important');
    body.style.setProperty('background-attachment', 'fixed', 'important');
    body.style.setProperty('background-size', 'cover', 'important');
    document.documentElement.style.setProperty('background-color', solid, 'important');
    document.documentElement.style.setProperty('background-image', grad, 'important');
    ['#portal-agent','#portal-agent.active','#portal-customer','#portal-customer.active',
     '#portal-agent .main','#portal-agent main.main','#portal-customer .main','.app-shell'
    ].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('background-image', 'none', 'important');
      });
    });
    document.querySelectorAll('#login-screen, .login-screen').forEach(function (el) {
      if (onLogin) {
        el.style.setProperty('background-color', solid, 'important');
        el.style.setProperty('background-image', grad, 'important');
        el.style.setProperty('background-attachment', 'fixed', 'important');
        el.style.setProperty('background-size', 'cover', 'important');
        el.style.setProperty('position', 'relative', 'important');
        el.style.setProperty('overflow', 'hidden', 'important');
      } else {
        el.style.setProperty('background', 'transparent', 'important');
      }
    });
    injectCss();
    ensureAmbient();
  }

  apply();
  setTimeout(apply, 200);
  setTimeout(apply, 800);
  setTimeout(apply, 2000);
  setInterval(apply, 5000);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.id === 'btn-theme' || t.id === 'dr-login-theme' ||
        (t.classList && t.classList.contains('btn-theme')) ||
        (t.closest && (t.closest('form.login-form') || t.closest('#login-screen'))))) {
      setTimeout(apply, 30);
      setTimeout(apply, 250);
      setTimeout(apply, 700);
    }
  }, true);

  window.DRForceLightBg = { refresh: apply };
})();
