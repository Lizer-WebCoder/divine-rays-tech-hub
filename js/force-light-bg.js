/**
 * Divine Rays — full-screen symmetrical medical-tech login ambient
 * Continuous dash animation (no rebuild pause) · Credit: Boyz at the Back
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
    var netOp = light ? '0.72' : '0.62';
    var particle = light ? 'rgba(91,33,182,0.6)' : 'rgba(233,213,255,0.6)';
    var vignette = light
      ? 'radial-gradient(ellipse 50% 45% at 50% 48%, transparent 25%, rgba(228,220,248,0.5) 100%)'
      : 'radial-gradient(ellipse 50% 45% at 50% 48%, transparent 25%, rgba(10,5,24,0.55) 100%)';

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
      return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 3) + '"/>';
    }
    function line(d, pulse) {
      return '<path ' + (pulse ? 'class="dr-pulse" ' : '') + 'd="' + d + '"/>';
    }
    return (
      '<svg class="dr-network" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">' +
      '<defs><filter id="drG" x="-15%" y="-15%" width="130%" height="130%">' +
      '<feGaussianBlur stdDeviation="1.8" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="1.25" filter="url(#drG)" opacity="0.95">' +
      line('M40 160 H200 L260 110 H400 L460 160 H600 L660 110 H800 L860 160 H1160', true) +
      line('M260 110 V70 M400 110 V70 M660 110 V70 M800 110 V70') +
      line('M200 160 V210 M460 160 V210 M860 160 V210') +
      line('M40 400 H180 L240 340 H380 L440 400 H600 L660 340 H800 L860 400 H1160', true) +
      line('M240 340 V300 M380 340 V300 M660 340 V300 M800 340 V300') +
      line('M180 400 V460 M440 400 V460 M860 400 V460') +
      line('M40 640 H200 L260 590 H400 L460 640 H600 L660 590 H800 L860 640 H1160', true) +
      line('M260 590 V550 M400 590 V550 M660 590 V550 M800 590 V550') +
      line('M200 640 V690 M460 640 V690 M860 640 V690') +
      line('M600 160 V400 M600 400 V640', false) +
      line('M300 210 V340 M900 210 V340 M300 460 V590 M900 460 V590', false) +
      '</g>' +
      '<g fill="' + fill + '">' +
      node(200, 160) + node(260, 110) + node(400, 110) + node(460, 160) +
      node(600, 160) + node(660, 110) + node(800, 110) + node(860, 160) +
      node(260, 70) + node(400, 70) + node(660, 70) + node(800, 70) +
      node(200, 210) + node(460, 210) + node(860, 210) +
      node(180, 400) + node(240, 340) + node(380, 340) + node(440, 400) +
      node(600, 400) + node(660, 340) + node(800, 340) + node(860, 400) +
      node(240, 300) + node(380, 300) + node(660, 300) + node(800, 300) +
      node(180, 460) + node(440, 460) + node(860, 460) +
      node(200, 640) + node(260, 590) + node(400, 590) + node(460, 640) +
      node(600, 640) + node(660, 590) + node(800, 590) + node(860, 640) +
      node(260, 550) + node(400, 550) + node(660, 550) + node(800, 550) +
      node(200, 690) + node(460, 690) + node(860, 690) +
      node(300, 210, 2.5) + node(900, 210, 2.5) + node(300, 460, 2.5) + node(900, 460, 2.5) +
      '</g>' +
      '<g fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.3" opacity="0.95">' +
      '<path d="M80 160 H105 L112 140 L119 180 L126 160 H150" fill="none" stroke-linecap="round" stroke-width="1.8"/>' +
      '<circle cx="330" cy="55" r="10" fill="none"/><path d="M316 74 C316 64 344 64 344 74 V82 H316 Z" fill="none"/>' +
      '<path d="M326 46 H334 M330 42 V50" stroke-width="1.5"/>' +
      '<path d="M520 45 C535 58 535 82 520 95 M545 45 C530 58 530 82 545 95" fill="none" stroke-width="1.5"/>' +
      '<path d="M523 60 H542 M523 80 H542" fill="none" stroke-width="1"/>' +
      '<path d="M700 58 C700 46 686 40 678 50 C670 40 656 46 656 58 C656 74 678 90 678 90 C678 90 700 74 700 58 Z" fill="' + fill + '" stroke="none" opacity="0.9"/>' +
      '<path d="M666 62 H672 L676 52 L680 72 L684 62 H690" fill="none" stroke="' + accent + '" stroke-width="1.2"/>' +
      '<circle cx="1050" cy="50" r="8" fill="none"/><circle cx="1072" cy="53" r="7" fill="none"/><circle cx="1094" cy="50" r="8" fill="none"/>' +
      '<path d="M1038 68 C1038 60 1062 60 1062 68 V76 H1038 Z" fill="none"/>' +
      '<path d="M1060 70 C1060 63 1084 63 1084 70 V76 H1060 Z" fill="none"/>' +
      '<path d="M1082 68 C1082 60 1106 60 1106 68 V76 H1082 Z" fill="none"/>' +
      '<path d="M90 385 H112 V400 H126 V418 H112 V433 H90 V418 H76 V400 H90 Z" fill="' + fill + '" stroke="none" opacity="0.88"/>' +
      '<path d="M300 445 H350 V460 H300 Z" fill="none"/><path d="M350 452.5 H365"/><path d="M365 447 L375 452.5 L365 458" fill="none"/>' +
      '<rect x="1000" y="440" width="24" height="36" rx="4" fill="none"/><path d="M1006 440 V430 H1018 V440" fill="none"/><path d="M1000 458 H1024" fill="none"/>' +
      '<path d="M1080 400 H1100 L1106 385 L1112 415 L1118 400 H1140" fill="none" stroke-width="1.6"/>' +
      '<path d="M100 620 C115 635 115 660 100 675 M125 620 C110 635 110 660 125 675" fill="none" stroke-width="1.5"/>' +
      '<path d="M600 620 C600 608 586 602 578 612 C570 602 556 608 556 620 C556 636 578 652 578 652 C578 652 600 636 600 620 Z" fill="' + fill + '" stroke="none" opacity="0.9"/>' +
      '<path d="M1050 615 H1072 V630 H1086 V648 H1072 V663 H1050 V648 H1036 V630 H1050 Z" fill="' + fill + '" stroke="none" opacity="0.88"/>' +
      '<path d="M1120 680 H1165 V693 H1120 Z" fill="none"/><path d="M1165 686.5 H1178"/>' +
      '</g></svg>'
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
