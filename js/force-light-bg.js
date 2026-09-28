/**
 * Divine Rays — symmetrical medical-tech login ambient (centered on login card)
 * Clean geometric icons · continuous dash · Credit: Boyz at the Back
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
    'radial-gradient(ellipse 120% 80% at 50% 50%, rgba(124,106,240,0.22), transparent 60%),' +
    'radial-gradient(ellipse 70% 50% at 20% 20%, rgba(139,92,246,0.16), transparent 50%),' +
    'radial-gradient(ellipse 70% 50% at 80% 80%, rgba(109,40,217,0.14), transparent 50%),' +
    'linear-gradient(180deg, #f0ebff 0%, #e6def8 35%, #ddd4f2 70%, #d4cbee 100%)';

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
      if (st.display === 'none' || st.visibility === 'hidden') return false;
    } catch (e) {}
    return true;
  }

  function ambientCss() {
    var light = isLight();
    var hexOp = light ? '0.32' : '0.22';
    var netOp = light ? '0.58' : '0.52';
    var particle = light ? 'rgba(91,33,182,0.6)' : 'rgba(233,213,255,0.6)';
    var vignette = light
      ? 'radial-gradient(ellipse 42% 40% at 50% 48%, transparent 20%, rgba(228,220,248,0.5) 100%)'
      : 'radial-gradient(ellipse 42% 40% at 50% 48%, transparent 20%, rgba(10,5,24,0.55) 100%)';

    return [
      '#' + LAYER_ID + '{',
      'position:absolute!important;inset:0!important;z-index:0!important;',
      'pointer-events:none!important;overflow:hidden!important;display:none',
      '}',
      'body.is-login #' + LAYER_ID + '{display:block!important}',
      'body.is-portal #' + LAYER_ID + '{display:none!important}',
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
    var rows = 12, cols = 16, w = 72, h = 42;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var ox = c * w + (r % 2 ? w / 2 : 0) - 30;
        var oy = r * h * 0.78 - 10;
        cells.push(
          'M' + (ox + 30) + ' ' + oy +
          ' L' + (ox + 56) + ' ' + (oy + 15) +
          ' L' + (ox + 56) + ' ' + (oy + 36) +
          ' L' + (ox + 30) + ' ' + (oy + 51) +
          ' L' + (ox + 4) + ' ' + (oy + 36) +
          ' L' + (ox + 4) + ' ' + (oy + 15) + ' Z'
        );
      }
    }
    return (
      '<svg class="dr-honeycomb" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 400" preserveAspectRatio="xMidYMid slice">' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="1">' +
      cells.map(function (d) { return '<path d="' + d + '"/>'; }).join('') +
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
        ' M' + (x - t) + ' ' + (y - h) +
        ' H' + (x + t) + ' V' + (y - t) +
        ' H' + (x - t) + ' Z"/>'
      );
    }
    function iconHeart(x, y, s) {
      return (
        '<path fill="' + fill + '" stroke="none" opacity="0.85" d="' +
        'M' + x + ' ' + (y + s * 0.55) +
        ' C' + x + ' ' + (y + s * 0.15) + ' ' + (x - s * 0.7) + ' ' + (y - s * 0.15) + ' ' + (x - s * 0.55) + ' ' + (y - s * 0.35) +
        ' C' + (x - s * 0.35) + ' ' + (y - s * 0.6) + ' ' + x + ' ' + (y - s * 0.35) + ' ' + x + ' ' + (y - s * 0.1) +
        ' C' + x + ' ' + (y - s * 0.35) + ' ' + (x + s * 0.35) + ' ' + (y - s * 0.6) + ' ' + (x + s * 0.55) + ' ' + (y - s * 0.35) +
        ' C' + (x + s * 0.7) + ' ' + (y - s * 0.15) + ' ' + x + ' ' + (y + s * 0.15) + ' ' + x + ' ' + (y + s * 0.55) + ' Z"/>'
      );
    }
    function iconEcg(x, y, w) {
      var h = 14;
      return (
        '<path fill="none" stroke="' + stroke + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="' +
        'M' + (x - w) + ' ' + y +
        ' H' + (x - w * 0.45) +
        ' L' + (x - w * 0.3) + ' ' + (y - h) +
        ' L' + (x - w * 0.1) + ' ' + (y + h * 1.1) +
        ' L' + (x + w * 0.05) + ' ' + y +
        ' H' + (x + w) + '"/>'
      );
    }
    function iconDna(x, y, h) {
      return (
        '<g fill="none" stroke="' + stroke + '" stroke-width="1.35" stroke-linecap="round">' +
        '<path d="M' + (x - 7) + ' ' + (y - h) + ' C' + (x + 8) + ' ' + (y - h * 0.5) + ' ' + (x + 8) + ' ' + (y + h * 0.5) + ' ' + (x - 7) + ' ' + (y + h) + '"/>' +
        '<path d="M' + (x + 7) + ' ' + (y - h) + ' C' + (x - 8) + ' ' + (y - h * 0.5) + ' ' + (x - 8) + ' ' + (y + h * 0.5) + ' ' + (x + 7) + ' ' + (y + h) + '"/>' +
        '<path d="M' + (x - 5) + ' ' + (y - h * 0.35) + ' H' + (x + 5) + '"/>' +
        '<path d="M' + (x - 5) + ' ' + (y + h * 0.35) + ' H' + (x + 5) + '"/>' +
        '</g>'
      );
    }
    function iconHex(x, y, r) {
      var pts = [];
      for (var i = 0; i < 6; i++) {
        var a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push((x + Math.cos(a) * r).toFixed(1) + ' ' + (y + Math.sin(a) * r).toFixed(1));
      }
      return '<path fill="none" stroke="' + stroke + '" stroke-width="1.2" d="M' + pts.join(' L') + ' Z"/>';
    }

    return (
      '<svg class="dr-network" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">' +
      '<defs>' +
      '<filter id="drG" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feGaussianBlur stdDeviation="1.4" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '</defs>' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="1.15" filter="url(#drG)" opacity="0.9">' +
      line('M60 150 H220 L280 100 H420 L480 150 H600', true) +
      line('M1140 150 H980 L920 100 H780 L720 150 H600', true) +
      line('M280 100 V65 M420 100 V65') +
      line('M920 100 V65 M780 100 V65') +
      line('M220 150 V195 M480 150 V195') +
      line('M980 150 V195 M720 150 V195') +
      line('M60 400 H200 L260 350 H400 L460 400 H600', true) +
      line('M1140 400 H1000 L940 350 H800 L740 400 H600', true) +
      line('M260 350 V310 M400 350 V310') +
      line('M940 350 V310 M800 350 V310') +
      line('M200 400 V450 M460 400 V450') +
      line('M1000 400 V450 M740 400 V450') +
      line('M60 650 H220 L280 600 H420 L480 650 H600', true) +
      line('M1140 650 H980 L920 600 H780 L720 650 H600', true) +
      line('M280 600 V565 M420 600 V565') +
      line('M920 600 V565 M780 600 V565') +
      line('M220 650 V695 M480 650 V695') +
      line('M980 650 V695 M720 650 V695') +
      line('M600 150 V400 M600 400 V650', false) +
      '</g>' +
      '<g fill="' + fill + '">' +
      node(220, 150) + node(280, 100) + node(420, 100) + node(480, 150) + node(600, 150) +
      node(980, 150) + node(920, 100) + node(780, 100) + node(720, 150) +
      node(280, 65) + node(420, 65) + node(920, 65) + node(780, 65) +
      node(220, 195) + node(480, 195) + node(980, 195) + node(720, 195) +
      node(200, 400) + node(260, 350) + node(400, 350) + node(460, 400) + node(600, 400) +
      node(1000, 400) + node(940, 350) + node(800, 350) + node(740, 400) +
      node(260, 310) + node(400, 310) + node(940, 310) + node(800, 310) +
      node(200, 450) + node(460, 450) + node(1000, 450) + node(740, 450) +
      node(220, 650) + node(280, 600) + node(420, 600) + node(480, 650) + node(600, 650) +
      node(980, 650) + node(920, 600) + node(780, 600) + node(720, 650) +
      node(280, 565) + node(420, 565) + node(920, 565) + node(780, 565) +
      node(220, 695) + node(480, 695) + node(980, 695) + node(720, 695) +
      '</g>' +
      '<g opacity="0.9">' +
      iconEcg(120, 150, 42) + iconEcg(1080, 150, 42) +
      iconHex(350, 55, 14) + iconHex(850, 55, 14) +
      iconCross(120, 400, 16) + iconCross(1080, 400, 16) +
      iconDna(330, 320, 22) + iconDna(870, 320, 22) +
      iconHeart(500, 460, 12) + iconHeart(700, 460, 12) +
      iconHeart(120, 650, 14) + iconHeart(1080, 650, 14) +
      iconCross(350, 680, 13) + iconCross(850, 680, 13) +
      iconEcg(500, 650, 36) + iconEcg(700, 650, 36) +
      '</g>' +
      '</svg>'
    );
  }

  function particlesHtml() {
    var html = '<div class="dr-particles">';
    var left = [
      [3, 6], [8, 15], [5, 28], [12, 40], [4, 55], [10, 68], [6, 82], [14, 90],
      [18, 10], [22, 72], [16, 48]
    ];
    var spots = left.slice();
    left.forEach(function (p) { spots.push([100 - p[0], p[1]]); });
    spots.push([50, 4], [50, 96], [40, 8], [60, 8], [40, 92], [60, 92]);
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i];
      var size = 2 + (i % 4);
      var dur = 5.5 + (i % 5) * 1.1;
      var delay = (i * 0.28) % 6;
      html +=
        '<span style="left:' + s[0] + '%;top:' + s[1] + '%;width:' + size +
        'px;height:' + size + 'px;animation-duration:' + dur +
        's;animation-delay:' + delay + 's"></span>';
    }
    return html + '</div>';
  }

  function ensureAmbient() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    var layer = document.getElementById(LAYER_ID);
    if (!loginVisible() || !login) {
      if (layer) layer.style.display = 'none';
      lastAmbientKey = '';
      return;
    }
    if (!layer) {
      layer = document.createElement('div');
      layer.id = LAYER_ID;
      layer.setAttribute('aria-hidden', 'true');
    }
    if (layer.parentNode !== login) {
      login.insertBefore(layer, login.firstChild);
    }
    var light = isLight();
    var key = (light ? 'L' : 'D') + '-login';
    if (key === lastAmbientKey && layer.childNodes.length) {
      layer.style.display = 'block';
      return;
    }
    lastAmbientKey = key;
    var stroke = light ? '#5b21b6' : '#e9d5ff';
    var fill = light ? '#6d28d9' : '#f5f3ff';
    var accent = light ? '#4c1d95' : '#2e1065';
    layer.innerHTML =
      honeycombSvg(stroke) + networkSvg(stroke, fill, accent) +
      '<div class="dr-vignette"></div>' + particlesHtml();
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
    var solid = onLogin ? (light ? '#ddd4f2' : '#120830') : light ? '#ebe8f6' : '#0c0c14';
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
