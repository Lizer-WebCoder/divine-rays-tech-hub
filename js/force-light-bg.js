/**
 * Divine Rays — larger nearer honeycomb (pointy-top regular mesh)
 * Login + agent/admin + end-user portal · Credit: Boyz at the Back LRK
 * mode-bar is fixed so Profile/theme/actions stay on screen while scrolling
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG_FIXED) return;
  window.__DR_FORCE_LIGHT_BG_FIXED = 1;

  var LAYER_ID = 'dr-ambient-layer';
  var STYLE_ID = 'dr-force-light-bg-css';
  var STYLE_THEME_ID = 'dr-force-light-theme-css';

  var LOGIN_DARK =
    'radial-gradient(ellipse 120% 80% at 50% -10%, #3d2a7a 0%, #1a0f3a 45%, #0c0618 100%)';
  var LOGIN_LIGHT =
    'radial-gradient(ellipse 120% 80% at 50% -10%, #e8dfff 0%, #d4c4f0 40%, #c4b0ea 100%)';
  var PORTAL_DARK =
    'radial-gradient(ellipse 100% 70% at 50% 0%, #1e1538 0%, #120a22 50%, #0c0c14 100%)';
  var PORTAL_LIGHT =
    'radial-gradient(ellipse 100% 70% at 50% 0%, #f5f2fc 0%, #ebe8f6 50%, #e4e0f2 100%)';

  function isLight() {
    try {
      return document.documentElement.getAttribute('data-theme') === 'light';
    } catch (e) {
      return false;
    }
  }

  function loginVisible() {
    var login = document.getElementById('login-screen');
    if (!login) return false;
    if (login.classList.contains('hidden')) return false;
    if (login.style.display === 'none') return false;
    return true;
  }

  function injectAmbientCss(light) {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    var hexOp = light ? '0.18' : '0.22';
    var netOp = light ? '0.12' : '0.16';
    var vignette = light
      ? 'radial-gradient(ellipse at center, transparent 40%, rgba(200,180,240,0.25) 100%)'
      : 'radial-gradient(ellipse at center, transparent 35%, rgba(8,4,20,0.55) 100%)';
    var particle = light ? 'rgba(109,94,245,0.35)' : 'rgba(167,139,250,0.4)';
    el.textContent = [
      '#' + LAYER_ID + '{',
      'position:absolute!important;inset:0!important;z-index:0!important;',
      'pointer-events:none!important;overflow:hidden!important;display:none',
      '}',
      'body.is-login #' + LAYER_ID + '{display:block!important;position:absolute!important}',
      'body.is-portal #' + LAYER_ID + '{',
      'display:block!important;position:fixed!important;inset:0!important;z-index:0!important',
      '}',
      '#' + LAYER_ID + ' .dr-honeycomb{position:absolute;inset:-5%;width:110%;height:110%;opacity:' + hexOp + '}',
      '#' + LAYER_ID + ' .dr-network{position:absolute;inset:0;opacity:' + netOp + '}',
      '#' + LAYER_ID + ' .dr-vignette{position:absolute;inset:0;background:' + vignette + '}',
      '#' + LAYER_ID + ' .dr-particles span{',
      'position:absolute;border-radius:50%;background:' + particle + ';',
      'animation:drParticle 12s ease-in-out infinite',
      '}',
      '@keyframes drParticle{0%{transform:translate(0,0) scale(1);opacity:0.2}50%{opacity:0.45}100%{transform:translate(6px,-24px) scale(0.75);opacity:0.15}}',
      '#' + LAYER_ID + ' .dr-pulse{stroke-dasharray:4 10;animation:drTrace 14s linear infinite}',
      '@keyframes drTrace{from{stroke-dashoffset:0}to{stroke-dashoffset:-280}}',
      '@media (prefers-reduced-motion:reduce){#' + LAYER_ID + ' .dr-particles span,#' + LAYER_ID + ' .dr-pulse{animation:none!important}}',
      'body.is-portal #portal-agent .sidebar,',
      'body.is-portal #portal-agent .mode-bar,',
      'body.is-portal .mode-bar{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;z-index:1000!important}',
      'body.is-portal #app-shell,#app-shell{padding-top:52px!important}',
      'body.is-portal #portal-agent .main,',
      'body.is-portal #portal-agent main.main,',
      'body.is-portal #portal-customer .main,',
      'body.is-portal #portal-customer main.customer-main,',
      'body.is-portal #portal-customer .customer-main{position:relative;z-index:1;background:transparent!important;background-image:none!important}',
      'body.is-portal #portal-agent,',
      'body.is-portal #portal-customer,',
      'body.is-portal #portal-customer.active,',
      'body.is-portal .app-shell{background:transparent!important;background-image:none!important}'
    ].join('');
  }

  function honeycombSvg(stroke) {
    var R = 48;
    var paths = [];
    var i, j, cx, cy;
    for (i = -2; i < 18; i++) {
      for (j = -2; j < 14; j++) {
        cx = i * R * 1.5;
        cy = j * R * 1.732 + (i % 2 ? R * 0.866 : 0);
        paths.push(
          'M' +
            (cx + R) +
            ',' +
            cy +
            ' L' +
            (cx + R * 0.5) +
            ',' +
            (cy + R * 0.866) +
            ' L' +
            (cx - R * 0.5) +
            ',' +
            (cy + R * 0.866) +
            ' L' +
            (cx - R) +
            ',' +
            cy +
            ' L' +
            (cx - R * 0.5) +
            ',' +
            (cy - R * 0.866) +
            ' L' +
            (cx + R * 0.5) +
            ',' +
            (cy - R * 0.866) +
            ' Z'
        );
      }
    }
    return (
      '<svg class="dr-honeycomb" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">' +
      '<g fill="none" stroke="' +
      stroke +
      '" stroke-width="1.2">' +
      paths
        .map(function (d) {
          return '<path d="' + d + '"/>';
        })
        .join('') +
      '</g></svg>'
    );
  }

  function networkSvg(stroke) {
    return (
      '<svg class="dr-network" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">' +
      '<g fill="none" stroke="' +
      stroke +
      '" stroke-width="0.8" class="dr-pulse">' +
      '<path d="M40 80 L180 120 L320 60 L480 140 L620 90 L760 160"/>' +
      '<path d="M60 300 L200 260 L360 340 L520 280 L680 360 L780 300"/>' +
      '<path d="M80 500 L220 460 L400 520 L560 440 L720 500"/>' +
      '<path d="M120 100 L140 280 L100 480"/>' +
      '<path d="M400 50 L380 300 L420 550"/>' +
      '<path d="M680 80 L660 300 L700 520"/>' +
      '</g></svg>'
    );
  }

  function particlesHtml() {
    var html = '<div class="dr-particles">';
    var n = 18;
    var i;
    for (i = 0; i < n; i++) {
      var left = (i * 37) % 100;
      var top = (i * 53) % 100;
      var size = 2 + (i % 4);
      var delay = (i % 8) * 0.7;
      html +=
        '<span style="left:' +
        left +
        '%;top:' +
        top +
        '%;width:' +
        size +
        'px;height:' +
        size +
        'px;animation-delay:' +
        delay +
        's"></span>';
    }
    return html + '</div>';
  }

  function ensureAmbient() {
    var light = isLight();
    var onLogin = loginVisible();
    injectAmbientCss(light);
    var layer = document.getElementById(LAYER_ID);
    var stroke = light ? 'rgba(109,94,245,0.45)' : 'rgba(167,139,250,0.35)';
    if (!layer) {
      layer = document.createElement('div');
      layer.id = LAYER_ID;
      try {
        document.body.insertBefore(layer, document.body.firstChild);
      } catch (e) {
        document.body.appendChild(layer);
      }
    }
    layer.innerHTML =
      honeycombSvg(stroke) + networkSvg(stroke) + '<div class="dr-vignette"></div>' + particlesHtml();
    if (onLogin) {
      var login = document.getElementById('login-screen');
      if (login && layer.parentNode !== login) {
        try {
          login.insertBefore(layer, login.firstChild);
        } catch (e2) {}
      }
    } else if (layer.parentNode !== document.body) {
      try {
        document.body.insertBefore(layer, document.body.firstChild);
      } catch (e3) {}
    }
  }

  function injectThemeCss() {
    var el = document.getElementById(STYLE_THEME_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_THEME_ID;
      document.head.appendChild(el);
    }
    var light = isLight();
    var onLogin = loginVisible();
    var grad = onLogin ? (light ? LOGIN_LIGHT : LOGIN_DARK) : light ? PORTAL_LIGHT : PORTAL_DARK;
    var solid = onLogin ? (light ? '#c4b0ea' : '#120830') : light ? '#ebe8f6' : '#0c0c14';
    var css;
    if (onLogin) {
      css = [
        'html,body,#login-screen,.login-screen{',
        'background-color:' + solid + '!important;',
        'background-image:' + grad + '!important;',
        'background-attachment:fixed!important;',
        'background-size:cover!important',
        '}'
      ].join('');
    } else {
      css = [
        'html,body{',
        'background-color:' + solid + '!important;',
        'background-image:' + grad + '!important;',
        'background-attachment:fixed!important;',
        'background-size:cover!important',
        '}',
        '#login-screen,.login-screen{background:transparent!important}'
      ].join('');
    }
    if (el.textContent !== css) el.textContent = css;
  }

  function apply() {
    var body = document.body;
    if (!body) return;
    var light = isLight();
    var onLogin = loginVisible();
    var grad = onLogin ? (light ? LOGIN_LIGHT : LOGIN_DARK) : light ? PORTAL_LIGHT : PORTAL_DARK;
    var solid = onLogin ? (light ? '#c4b0ea' : '#120830') : light ? '#ebe8f6' : '#0c0c14';
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
      '#portal-customer main.customer-main',
      '#portal-customer .customer-main',
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
    injectThemeCss();
    injectAmbientCss(light);
    ensureAmbient();
    document.querySelectorAll('.mode-bar').forEach(function (bar) {
      bar.style.setProperty('position', 'fixed', 'important');
      bar.style.setProperty('top', '0', 'important');
      bar.style.setProperty('left', '0', 'important');
      bar.style.setProperty('right', '0', 'important');
      bar.style.setProperty('width', '100%', 'important');
      bar.style.setProperty('z-index', '1000', 'important');
      var shell = document.getElementById('app-shell');
      if (shell) {
        shell.style.setProperty('padding-top', Math.max(bar.offsetHeight || 52, 44) + 'px', 'important');
      }
    });
  }

  apply();
  setTimeout(apply, 200);
  setTimeout(apply, 800);
  setTimeout(apply, 2000);
  setInterval(apply, 5000);

  try {
    new MutationObserver(function () {
      clearTimeout(window.__drFlbT);
      window.__drFlbT = setTimeout(apply, 80);
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });
  } catch (e) {}

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('#btn-theme') || t.id === 'btn-theme') {
        setTimeout(apply, 40);
        setTimeout(apply, 250);
      }
    },
    true
  );

  window.DRForceLightBg = { refresh: apply };
})();
