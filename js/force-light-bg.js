/**
 * Divine Rays — split backgrounds + medical-tech login ambient
 * Login: purple field, hex grid, circuit traces, soft med icons
 * Portal: quieter field for spinning gears
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
    'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(139,92,246,0.35), transparent 55%),' +
    'radial-gradient(ellipse 70% 45% at 100% 100%, rgba(91,33,182,0.28), transparent 50%),' +
    'radial-gradient(ellipse 50% 40% at 0% 85%, rgba(167,139,250,0.18), transparent 45%),' +
    'linear-gradient(180deg, #2a1060 0%, #1a0a40 40%, #120830 70%, #0c0620 100%)';

  var LOGIN_LIGHT =
    'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124,106,240,0.2), transparent 55%),' +
    'radial-gradient(ellipse 70% 50% at 100% 100%, rgba(167,139,250,0.12), transparent 50%),' +
    'linear-gradient(165deg, #f0ebff 0%, #ebe6f8 40%, #e4dff2 100%)';

  var PORTAL_DARK =
    'radial-gradient(ellipse 80% 50% at 70% 20%, rgba(109,94,245,0.18), transparent 55%),' +
    'radial-gradient(ellipse 60% 40% at 10% 80%, rgba(91,76,224,0.12), transparent 50%),' +
    'linear-gradient(165deg, #0c0c14 0%, #12121c 45%, #0e0e18 100%)';

  var PORTAL_LIGHT =
    'radial-gradient(ellipse 80% 50% at 70% 15%, rgba(109,94,245,0.14), transparent 55%),' +
    'radial-gradient(ellipse 50% 40% at 0% 90%, rgba(167,139,250,0.1), transparent 50%),' +
    'linear-gradient(165deg, #f4f2fb 0%, #ebe8f6 50%, #e4e0f2 100%)';

  var HEX_SVG =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath fill='none' stroke='%23c4b5fd' stroke-width='0.6' opacity='0.35' d='M28 2 L52 16 L52 44 L28 58 L4 44 L4 16 Z M28 58 L52 72 L52 100'/%3E%3C/svg%3E\")";

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
    var hexOp = light ? '0.08' : '0.12';
    var circuitOp = light ? '0.07' : '0.09';
    var particleC = light ? 'rgba(91,33,182,0.45)' : 'rgba(196,181,253,0.55)';

    return [
      '#' + LAYER_ID + '{',
      'position:absolute!important;inset:0!important;z-index:0!important;',
      'pointer-events:none!important;overflow:hidden!important;',
      'display:none',
      '}',
      'body.is-login #' + LAYER_ID + '{display:block!important}',
      'body.is-portal #' + LAYER_ID + '{display:none!important}',
      '#' + LAYER_ID + ' .dr-hex{',
      'position:absolute;inset:0;',
      'background-image:' + HEX_SVG + ';',
      'background-size:56px 100px;',
      'opacity:' + hexOp + ';',
      'animation:drHexDrift 48s linear infinite',
      '}',
      '@keyframes drHexDrift{from{background-position:0 0}to{background-position:56px 100px}}',
      '#' + LAYER_ID + ' .dr-circuits{',
      'position:absolute;inset:0;opacity:' + circuitOp + ';',
      '}',
      '#' + LAYER_ID + ' .dr-circuits path{',
      'fill:none;stroke:' + (light ? '#7c3aed' : '#c4b5fd') + ';stroke-width:1.2;',
      'stroke-linecap:round;stroke-linejoin:round',
      '}',
      '#' + LAYER_ID + ' .dr-circuits circle{fill:' + (light ? '#7c3aed' : '#e9d5ff') + '}',
      '#' + LAYER_ID + ' .dr-med-band{',
      'position:absolute;left:0;right:0;top:42%;height:22%;',
      'opacity:' + (light ? '0.35' : '0.45') + ';',
      '}',
      '#' + LAYER_ID + ' .dr-med-band svg{width:100%;height:100%;display:block}',
      '#' + LAYER_ID + ' .dr-particles span{',
      'position:absolute;border-radius:50%;',
      'background:' + particleC + ';',
      'box-shadow:0 0 6px ' + particleC + ';',
      'animation:drParticle 6s ease-in-out infinite;opacity:0.5',
      '}',
      '@keyframes drParticle{',
      '0%{transform:translateY(0) scale(1);opacity:0.15}',
      '40%{opacity:0.7}',
      '100%{transform:translateY(-28px) scale(0.85);opacity:0.1}',
      '}',
      '@media (prefers-reduced-motion:reduce){',
      '#' + LAYER_ID + ' .dr-hex{animation:none}',
      '#' + LAYER_ID + ' .dr-particles span{animation:none}',
      '}'
    ].join('');
  }

  function circuitSvg() {
    return (
      '<svg class="dr-circuits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="none">' +
      '<path d="M40 80 H180 V160 H320"/>' +
      '<circle cx="40" cy="80" r="2.5"/><circle cx="180" cy="80" r="2"/><circle cx="320" cy="160" r="2.5"/>' +
      '<path d="M900 90 H1060 V200 H1160"/>' +
      '<circle cx="900" cy="90" r="2"/><circle cx="1160" cy="200" r="2.5"/>' +
      '<path d="M60 580 H200 V640 H380"/>' +
      '<circle cx="60" cy="580" r="2"/><circle cx="380" cy="640" r="2.5"/>' +
      '<path d="M820 560 H980 V640 H1140"/>' +
      '<circle cx="820" cy="560" r="2"/><circle cx="1140" cy="640" r="2"/>' +
      '<path d="M50 320 H120 V400 H60"/>' +
      '<circle cx="50" cy="320" r="2"/><circle cx="60" cy="400" r="2"/>' +
      '<path d="M1080 360 H1150 V440"/>' +
      '<circle cx="1080" cy="360" r="2"/><circle cx="1150" cy="440" r="2"/>' +
      '</svg>'
    );
  }

  function medBandSvg() {
    return (
      '<svg class="dr-med-band" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid meet">' +
      '<defs>' +
      '<filter id="drGlow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>' +
      '<g fill="none" stroke="#c4b5fd" stroke-width="1" opacity="0.55" filter="url(#drGlow)">' +
      '<path d="M40 100 H160 M160 100 L220 60 M160 100 L220 140 M220 60 H300 M220 140 H300 M300 60 L360 100 M300 140 L360 100 M360 100 H460 M460 100 L520 55 M460 100 L520 145 M520 55 H620 M520 145 H620 M620 55 L680 100 M620 145 L680 100 M680 100 H780 M780 100 L840 60 M780 100 L840 140 M840 60 H940 M840 140 H940 M940 60 L1000 100 M940 140 L1000 100 M1000 100 H1160"/>' +
      '<circle cx="160" cy="100" r="3" fill="#e9d5ff" stroke="none"/>' +
      '<circle cx="360" cy="100" r="3" fill="#e9d5ff" stroke="none"/>' +
      '<circle cx="680" cy="100" r="3" fill="#e9d5ff" stroke="none"/>' +
      '<circle cx="1000" cy="100" r="3" fill="#e9d5ff" stroke="none"/>' +
      '</g>' +
      '<g fill="#e9d5ff" opacity="0.7">' +
      '<path d="M70 100 H90 L96 88 L102 112 L108 100 H128" fill="none" stroke="#e9d5ff" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M250 88 H268 V100 H280 V112 H268 V124 H250 V112 H238 V100 H250 Z" opacity="0.85"/>' +
      '<path d="M560 108 C560 98 548 92 540 100 C532 92 520 98 520 108 C520 120 540 132 540 132 C540 132 560 120 560 108 Z" opacity="0.8"/>' +
      '<path d="M420 80 C430 90 430 110 420 120 M440 80 C430 90 430 110 440 120" fill="none" stroke="#e9d5ff" stroke-width="1.4"/>' +
      '<path d="M760 95 H800 V105 H760 Z M800 100 H812" fill="none" stroke="#e9d5ff" stroke-width="1.4"/>' +
      '<rect x="900" y="88" width="16" height="24" rx="2" fill="none" stroke="#e9d5ff" stroke-width="1.4"/>' +
      '<path d="M904 88 V82 H912 V88" fill="none" stroke="#e9d5ff" stroke-width="1.2"/>' +
      '<circle cx="1040" cy="92" r="5"/><circle cx="1055" cy="94" r="4"/><circle cx="1070" cy="92" r="5"/>' +
      '</g>' +
      '</svg>'
    );
  }

  function particlesHtml() {
    var html = '<div class="dr-particles">';
    var spots = [
      [8, 12], [18, 28], [28, 8], [72, 15], [88, 22], [12, 70], [22, 85],
      [78, 78], [92, 68], [45, 6], [55, 90], [35, 18], [65, 12], [5, 45],
      [95, 50], [40, 88], [60, 5], [15, 55], [85, 40], [50, 95]
    ];
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i];
      var size = 2 + (i % 3);
      var dur = 4 + (i % 5) * 1.2;
      var delay = (i * 0.37) % 5;
      html +=
        '<span style="left:' +
        s[0] +
        '%;top:' +
        s[1] +
        '%;width:' +
        size +
        'px;height:' +
        size +
        'px;animation-duration:' +
        dur +
        's;animation-delay:' +
        delay +
        's"></span>';
    }
    html += '</div>';
    return html;
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

    layer.innerHTML =
      '<div class="dr-hex"></div>' + circuitSvg() + medBandSvg() + particlesHtml();
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
    var solid = onLogin ? (light ? '#ebe6f8' : '#120830') : light ? '#ebe8f6' : '#0c0c14';

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
      '#portal-agent',
      '#portal-agent.active',
      '#portal-customer',
      '#portal-customer.active',
      '#portal-agent .main',
      '#portal-agent main.main',
      '#portal-customer .main',
      '.app-shell'
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
        (t.id === 'btn-theme' ||
          t.id === 'dr-login-theme' ||
          (t.classList && t.classList.contains('btn-theme')) ||
          (t.closest && (t.closest('form.login-form') || t.closest('#login-screen'))))
      ) {
        setTimeout(apply, 30);
        setTimeout(apply, 200);
        setTimeout(apply, 600);
      }
    },
    true
  );

  window.DRForceLightBg = { refresh: apply };
})();
