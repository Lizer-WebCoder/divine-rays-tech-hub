/**
 * Divine Rays — portal-shell-fix v11 — larger gears restored — never paint on login — honeycomb + baked SMIL gears
 * Static honeycomb (no glow/reaction on click).
 * Gears live inside ambient so hard-refresh always shows them.
 * v11: restore larger gear radii (v9-scale); force rebuild via data-gears-v.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_SHELL >= 11) return;
  window.__DR_PORTAL_SHELL = 11;

  var BG_ID = 'dr-portal-ambient';
  var CSS_ID = 'dr-portal-shell-css';

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (!ls || ls.hidden) return false;
      var st = window.getComputedStyle ? getComputedStyle(ls) : null;
      if (st && (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity || '1') < 0.05))
        return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function portalActive() {
    try {
      if (loginVisible()) return false;
      if (
        document.body &&
        (document.body.classList.contains('dr-portal-ok') ||
          document.body.classList.contains('is-portal') ||
          document.body.classList.contains('is-portal-employee') ||
          document.body.classList.contains('is-portal-admin'))
      )
        return true;
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (pc && pc.classList.contains('active')) return true;
      if (pa && pa.classList.contains('active')) return true;
    } catch (e) {}
    return false;
  }

  function honeycombSvg() {
    var stroke = 'rgba(167,139,250,0.18)';
    var R = 28;
    var horiz = 1.5 * R * Math.sqrt(3);
    var vert = 1.5 * R;
    var rows = 18;
    var cols = 28;
    var parts = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cx = c * horiz + ((r % 2) * horiz) / 2;
        var cy = r * vert;
        var pts = [];
        for (var i = 0; i < 6; i++) {
          var a = (Math.PI / 3) * i + Math.PI / 6;
          pts.push((cx + R * Math.cos(a)).toFixed(1) + ',' + (cy + R * Math.sin(a)).toFixed(1));
        }
        parts.push('<polygon points="' + pts.join(' ') + '" fill="none" stroke="' + stroke + '" stroke-width="1"/>');
      }
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">' +
      parts.join('') +
      '</svg>'
    );
  }

  function gearPath(cx, cy, teeth, outer, inner, hole) {
    var pts = [];
    for (var i = 0; i < teeth; i++) {
      var a0 = (Math.PI * 2 * i) / teeth;
      var a1 = a0 + Math.PI / teeth / 2;
      var a2 = a0 + Math.PI / teeth;
      var a3 = a0 + (Math.PI * 3) / teeth / 2;
      pts.push([Math.cos(a0) * outer, Math.sin(a0) * outer]);
      pts.push([Math.cos(a1) * outer, Math.sin(a1) * outer]);
      pts.push([Math.cos(a2) * inner, Math.sin(a2) * inner]);
      pts.push([Math.cos(a3) * inner, Math.sin(a3) * inner]);
    }
    var d = 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2);
    for (var j = 1; j < pts.length; j++) d += ' L' + pts[j][0].toFixed(2) + ' ' + pts[j][1].toFixed(2);
    d += ' Z';
    d += ' M' + hole + ' 0 A' + hole + ' ' + hole + ' 0 1 0 ' + (-hole) + ' 0 A' + hole + ' ' + hole + ' 0 1 0 ' + hole + ' 0';
    return d;
  }

  function one(cls, fill, teeth, outer, inner, hole, x, y, scale, dur, reverse) {
    var path = gearPath(0, 0, teeth, outer, inner, hole);
    return (
      '<g class="' +
      cls +
      '" transform="translate(' +
      x +
      ' ' +
      y +
      ') scale(' +
      scale +
      ')">' +
      '<path fill="' +
      fill +
      '" opacity="0.85" d="' +
      path +
      '"/>' +
      '<animateTransform attributeName="transform" type="rotate" from="0" to="' +
      (reverse ? -360 : 360) +
      '" dur="' +
      dur +
      's" repeatCount="indefinite" additive="sum"/>' +
      '</g>'
    );
  }

  function gearsSvg() {
    var a = 'rgba(167,139,250,0.55)';
    var b = 'rgba(196,181,253,0.4)';
    var c = 'rgba(139,92,246,0.45)';
    return (
      '<svg class="dr-gears-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style="display:block;opacity:0.95">' +
      one('dr-spin-cw', a, 12, 88, 60, 20, 180, 180, 1.15, 30, 0) +
      one('dr-spin-ccw', b, 10, 72, 48, 16, 340, 300, 1.05, 24, 1) +
      one('dr-spin-cw', c, 14, 102, 70, 24, 560, 150, 1.2, 36, 0) +
      one('dr-spin-ccw', a, 9, 62, 42, 14, 720, 320, 1, 20, 1) +
      one('dr-spin-cw', b, 11, 80, 54, 18, 920, 190, 1.1, 28, 0) +
      one('dr-spin-ccw', c, 13, 92, 62, 22, 1060, 340, 1.05, 32, 1) +
      one('dr-spin-cw-fast', a, 8, 52, 34, 12, 250, 500, 0.95, 16, 0) +
      one('dr-spin-ccw-slow', b, 12, 76, 52, 18, 820, 520, 1, 40, 1) +
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
      'body.is-login #' + BG_ID + ',body:not(.dr-portal-ok):not(.is-portal) #' + BG_ID + '{',
      'display:none!important;visibility:hidden!important;opacity:0!important;',
      'height:0!important;max-height:0!important;overflow:hidden!important;',
      'pointer-events:none!important}',
      'body.dr-portal-ok #' + BG_ID + ',body.is-portal #' + BG_ID + '{',
      'display:block!important;visibility:visible!important;',
      'pointer-events:auto!important;height:auto!important;max-height:none!important;',
      'opacity:1!important;min-height:100vh!important}',
      'body.dr-portal-ok #portal-customer.active,body.dr-portal-ok #portal-agent.active{',
      'pointer-events:auto!important;height:auto!important;max-height:none!important;',
      'opacity:1!important;min-height:calc(100vh - 49px)!important}',
      '#' + BG_ID + '{position:fixed;inset:0;width:100%;height:100%;z-index:0;',
      'pointer-events:none!important;overflow:hidden}',
      '#' + BG_ID + ' .dr-hc{position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:0.40}',
      '#' + BG_ID + ' .dr-hc svg{width:100%;height:100%;display:block}',
      '#' + BG_ID + ' .dr-gears{position:absolute;inset:0;width:100%;height:100%;z-index:1;',
      'pointer-events:none}',
      '#' + BG_ID + ' .dr-gears svg{width:100%;height:100%;display:block}'
    ].join('');
  }

  function hideAmbient() {
    try {
      var el = document.getElementById(BG_ID);
      if (el) {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
      }
      document.documentElement.removeAttribute('data-dr-ambient-ready');
    } catch (e) {}
  }

  function ensureAmbient(forceShow) {
    injectCss();
    if (loginVisible() && !forceShow) {
      hideAmbient();
      return;
    }
    if (!portalActive() && !forceShow) {
      hideAmbient();
      return;
    }
    var el = document.getElementById(BG_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = BG_ID;
      el.setAttribute('aria-hidden', 'true');
      if (document.body) document.body.insertBefore(el, document.body.firstChild);
    }
    if (!el.querySelector('.dr-hc')) {
      el.innerHTML =
        '<div class="dr-hc" aria-hidden="true">' +
        honeycombSvg() +
        '</div>' +
        '<div class="dr-gears" aria-hidden="true">' +
        gearsSvg() +
        '</div>';
      el.setAttribute('data-gears-v', '11');
    } else if (!el.querySelector('.dr-gears .dr-spin-cw') || !el.querySelector('animateTransform') || el.getAttribute('data-gears-v') !== '11') {
      var gears = el.querySelector('.dr-gears');
      if (gears) {
        gears.innerHTML = gearsSvg();
      } else {
        el.insertAdjacentHTML(
          'beforeend',
          '<div class="dr-gears" aria-hidden="true">' +
            gearsSvg() +
            '</div>'
        );
      }
      el.setAttribute('data-gears-v', '11');
    }
    el.style.setProperty('display', 'block', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('height', '100%', 'important');
    try {
      document.documentElement.setAttribute('data-dr-ambient-ready', '1');
    } catch (e2) {}
  }

  function earlyWarm() {
    if (loginVisible()) return;
    ensureAmbient(true);
  }

  injectCss();
  setTimeout(function () {
    if (!loginVisible()) earlyWarm();
  }, 100);
  setTimeout(function () {
    if (!loginVisible()) ensureAmbient(false);
  }, 500);

  window.DRPortalShell = {
    ensureAmbient: ensureAmbient,
    hideAmbient: hideAmbient,
    v: 11
  };
})();
