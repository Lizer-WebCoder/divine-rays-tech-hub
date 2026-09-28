/**
 * Divine Rays — medical-tech login ambient (dense hex network + icons)
 * Login only · Portal keeps gear field
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG) {
    try { delete window.__DR_FORCE_LIGHT_BG; } catch (e) {}
  }
  window.__DR_FORCE_LIGHT_BG = 1;

  var CSS_ID = 'dr-login-ambient-css';
  var LAYER_ID = 'dr-login-ambient';

  var LOGIN_DARK =
    'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(139,92,246,0.4), transparent 55%),' +
    'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(76,29,149,0.35), transparent 50%),' +
    'linear-gradient(180deg, #3b1a6e 0%, #2a1060 25%, #1a0a40 55%, #120830 80%, #0c0620 100%)';

  var LOGIN_LIGHT =
    'radial-gradient(ellipse 100% 55% at 50% -5%, rgba(124,106,240,0.28), transparent 55%),' +
    'radial-gradient(ellipse 70% 45% at 50% 100%, rgba(167,139,250,0.2), transparent 50%),' +
    'linear-gradient(180deg, #efe8ff 0%, #e4dcf8 40%, #d9d0f0 100%)';

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
    var particle = light ? 'rgba(109,40,217,0.55)' : 'rgba(233,213,255,0.65)';
    var hexOp = light ? '0.22' : '0.28';
    var netOp = light ? '0.55' : '0.7';

    return [
      '#' + LAYER_ID + '{',
      'position:absolute!important;inset:0!important;z-index:0!important;',
      'pointer-events:none!important;overflow:hidden!important;display:none',
      '}',
      'body.is-login #' + LAYER_ID + '{display:block!important}',
      'body.is-portal #' + LAYER_ID + '{display:none!important}',
      '#' + LAYER_ID + ' .dr-honeycomb{',
      'position:absolute;left:-5%;right:-5%;top:28%;height:44%;',
      'opacity:' + hexOp + ';',
      '}',
      '#' + LAYER_ID + ' .dr-honeycomb svg{width:100%;height:100%;display:block}',
      '#' + LAYER_ID + ' .dr-network{',
      'position:absolute;left:0;right:0;top:32%;height:36%;',
      'opacity:' + netOp + ';',
      '}',
      '#' + LAYER_ID + ' .dr-network svg{width:100%;height:100%;display:block}',
      '#' + LAYER_ID + ' .dr-vignette{',
      'position:absolute;inset:0;',
      'background:radial-gradient(ellipse 55% 50% at 50% 48%, transparent 30%, ' +
        (light ? 'rgba(228,220,248,0.55)' : 'rgba(12,6,32,0.55)') +
        ' 100%);',
      '}',
      '#' + LAYER_ID + ' .dr-particles span{',
      'position:absolute;border-radius:50%;',
      'background:' + particle + ';',
      'box-shadow:0 0 8px ' + particle + ',0 0 14px ' + particle + ';',
      'animation:drParticle 7s ease-in-out infinite',
      '}',
      '@keyframes drParticle{',
      '0%{transform:translate(0,0) scale(1);opacity:0.2}',
      '35%{opacity:0.85}',
      '100%{transform:translate(6px,-32px) scale(0.7);opacity:0.1}',
      '}',
      '#' + LAYER_ID + ' .dr-network .dr-pulse-line{',
      'stroke-dasharray:8 14;',
      'animation:drTrace 18s linear infinite',
      '}',
      '@keyframes drTrace{to{stroke-dashoffset:-200}}',
      '@media (prefers-reduced-motion:reduce){',
      '#' + LAYER_ID + ' .dr-particles span,#' + LAYER_ID + ' .dr-network .dr-pulse-line{animation:none!important}',
      '}'
    ].join('');
  }

  function honeycombSvg(stroke) {
    var cells = [];
    var rows = 5;
    var cols = 14;
    var w = 70;
    var h = 40;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var ox = c * w + (r % 2 ? w / 2 : 0) - 20;
        var oy = r * h * 0.85 + 10;
        cells.push(
          'M' + (ox + 28) + ' ' + oy +
          ' L' + (ox + 52) + ' ' + (oy + 14) +
          ' L' + (ox + 52) + ' ' + (oy + 34) +
          ' L' + (ox + 28) + ' ' + (oy + 48) +
          ' L' + (ox + 4) + ' ' + (oy + 34) +
          ' L' + (ox + 4) + ' ' + (oy + 14) + ' Z'
        );
      }
    }
    return (
      '<svg class="dr-honeycomb" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 220" preserveAspectRatio="xMidYMid slice">' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="1.1">' +
      cells.map(function (d) { return '<path d="' + d + '"/>'; }).join('') +
      '</g></svg>'
    );
  }

  function networkSvg(stroke, fill) {
    return (
      '<svg class="dr-network" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 240" preserveAspectRatio="xMidYMid meet">' +
      '<defs>' +
      '<filter id="drNetGlow" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feGaussianBlur stdDeviation="2.2" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '</defs>' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="1.35" filter="url(#drNetGlow)" opacity="0.9">' +
      '<path class="dr-pulse-line" d="M20 120 H100 L140 80 H220 L260 120 H340 L380 70 H480 L520 120 H600 L640 75 H720 L760 120 H860 L900 80 H980 L1020 120 H1180"/>' +
      '<path d="M140 80 L140 50 M220 80 L220 50 M380 70 L380 40 M480 70 L480 40 M640 75 L640 45 M900 80 L900 50"/>' +
      '<path d="M260 120 L260 170 M340 120 L340 175 M520 120 L520 175 M760 120 L760 170 M1020 120 L1020 175"/>' +
      '<path d="M100 120 L80 160 M600 120 L580 165 M860 120 L840 165"/>' +
      '<path d="M220 50 H300 M480 40 H560 M900 50 H970" opacity="0.7"/>' +
      '<path d="M260 170 H320 M520 175 H600 M760 170 H830" opacity="0.7"/>' +
      '</g>' +
      '<g fill="' + fill + '">' +
      '<circle cx="100" cy="120" r="3.2"/><circle cx="140" cy="80" r="3.2"/><circle cx="220" cy="80" r="3.2"/>' +
      '<circle cx="260" cy="120" r="3.2"/><circle cx="340" cy="120" r="3.2"/><circle cx="380" cy="70" r="3.2"/>' +
      '<circle cx="480" cy="70" r="3.2"/><circle cx="520" cy="120" r="3.2"/><circle cx="600" cy="120" r="3.2"/>' +
      '<circle cx="640" cy="75" r="3.2"/><circle cx="760" cy="120" r="3.2"/><circle cx="860" cy="120" r="3.2"/>' +
      '<circle cx="900" cy="80" r="3.2"/><circle cx="980" cy="80" r="3.2"/><circle cx="1020" cy="120" r="3.2"/>' +
      '<circle cx="80" cy="160" r="2.5"/><circle cx="580" cy="165" r="2.5"/><circle cx="840" cy="165" r="2.5"/>' +
      '<circle cx="300" cy="50" r="2.2"/><circle cx="560" cy="40" r="2.2"/><circle cx="970" cy="50" r="2.2"/>' +
      '<circle cx="320" cy="170" r="2.2"/><circle cx="600" cy="175" r="2.2"/><circle cx="830" cy="170" r="2.2"/>' +
      '</g>' +
      '<g fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.2" opacity="0.95">' +
      '<path d="M45 120 H70 L76 105 L82 135 L88 120 H110" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/>' +
      '<circle cx="180" cy="55" r="9" fill="none"/><path d="M168 72 C168 64 192 64 192 72 V78 H168 Z" fill="none"/>' +
      '<path d="M176 48 H184 M180 44 V52" stroke-width="1.6"/>' +
      '<path d="M300 155 H318 V167 H330 V179 H318 V191 H300 V179 H288 V167 H300 Z" fill="' + fill + '" stroke="none" opacity="0.9"/>' +
      '<path d="M430 45 C442 55 442 75 430 85 M450 45 C438 55 438 75 450 85" fill="none" stroke-width="1.6"/>' +
      '<path d="M432 55 H448 M432 75 H448" fill="none" stroke-width="1"/>' +
      '<path d="M580 58 C580 48 568 42 560 50 C552 42 540 48 540 58 C540 72 560 86 560 86 C560 86 580 72 580 58 Z" fill="' + fill + '" stroke="none" opacity="0.88"/>' +
      '<path d="M548 62 H554 L558 54 L562 70 L566 62 H572" fill="none" stroke="' + (stroke === '#6d28d9' ? '#4c1d95' : '#2e1065') + '" stroke-width="1.3" opacity="0.9"/>' +
      '<path d="M700 155 H745 V168 H700 Z" fill="none"/><path d="M745 161.5 H758" fill="none"/><path d="M758 157 L766 161.5 L758 166" fill="none"/>' +
      '<path d="M708 155 V148 H720 V155" fill="none"/>' +
      '<rect x="880" y="150" width="22" height="32" rx="4" fill="none"/><path d="M886 150 V142 H896 V150" fill="none"/>' +
      '<path d="M880 166 H902" fill="none"/>' +
      '<circle cx="1085" cy="52" r="7" fill="none"/><circle cx="1105" cy="55" r="6" fill="none"/><circle cx="1125" cy="52" r="7" fill="none"/>' +
      '<path d="M1074 68 C1074 62 1096 62 1096 68 V74 H1074 Z" fill="none"/>' +
      '<path d="M1095 70 C1095 65 1115 65 1115 70 V75 H1095 Z" fill="none"/>' +
      '<path d="M1114 68 C1114 62 1136 62 1136 68 V74 H1114 Z" fill="none"/>' +
      '</g></svg>'
    );
  }

  function particlesHtml() {
    var html = '<div class="dr-particles">';
    var spots = [
      [4, 8], [10, 18], [16, 6], [22, 25], [30, 10], [38, 4], [48, 12],
      [58, 7], [68, 15], [78, 5], [86, 20], [94, 9], [7, 75], [14, 88],
      [25, 80], [35, 92], [55, 85], [70, 78], [82, 90], [92, 72],
      [3, 45], [97, 40], [12, 55], [88, 50], [45, 3], [55, 96]
    ];
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i];
      var size = 2 + (i % 4);
      var dur = 5 + (i % 6) * 0.9;
      var delay = (i * 0.31) % 6;
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
    var stroke = light ? '#6d28d9' : '#e9d5ff';
    var fill = light ? '#7c3aed' : '#f5f3ff';

    layer.innerHTML =
      honeycombSvg(stroke) +
      networkSvg(stroke, fill) +
      '<div class="dr-vignette"></div>' +
      particlesHtml();
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
    var solid = onLogin ? (light ? '#e4dcf8' : '#120830') : light ? '#ebe8f6' : '#0c0c14';

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

    [
      '#portal-agent', '#portal-agent.active', '#portal-customer', '#portal-customer.active',
      '#portal-agent .main', '#portal-agent main.main', '#portal-customer .main', '.app-shell'
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
  setInterval(apply, 3000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (
        t &&
        (t.id === 'btn-theme' || t.id === 'dr-login-theme' ||
          (t.classList && t.classList.contains('btn-theme')) ||
          (t.closest && (t.closest('form.login-form') || t.closest('#login-screen'))))
      ) {
        setTimeout(apply, 30);
        setTimeout(apply, 250);
        setTimeout(apply, 700);
      }
    },
    true
  );

  window.DRForceLightBg = { refresh: apply };
})();
