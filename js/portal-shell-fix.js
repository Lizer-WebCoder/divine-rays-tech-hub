/**
 * Divine Rays — portal-shell-fix v10 — never paint on login — honeycomb + baked SMIL gears
 * Static honeycomb (no glow/reaction on click).
 * Pre-paint under boot; exposes isReady for boot wait.
 * Gears live inside ambient so hard-refresh always shows them.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_SHELL >= 10) return;
  window.__DR_PORTAL_SHELL = 10;

  var CSS_ID = 'dr-portal-shell-css';
  var BG_ID = 'dr-portal-ambient';
  var _busy = false;

  function honeycombSvg(stroke) {
    var R = 28,
      SQ3 = Math.sqrt(3),
      horiz = SQ3 * R,
      vert = 1.5 * R;
    var cols = 28,
      rows = 18;
    var parts = [];
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var x = col * horiz + (row % 2 ? horiz / 2 : 0);
        var y = row * vert;
        var pts = [];
        for (var i = 0; i < 6; i++) {
          var a = (Math.PI / 180) * (60 * i - 30);
          pts.push((x + R * Math.cos(a)).toFixed(1) + ',' + (y + R * Math.sin(a)).toFixed(1));
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
    var parts = [];
    var step = (Math.PI * 2) / teeth;
    for (var i = 0; i < teeth; i++) {
      var a0 = i * step;
      var a1 = a0 + step * 0.35;
      var a2 = a0 + step * 0.5;
      var a3 = a0 + step * 0.85;
      function p(r, a) {
        return (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1);
      }
      parts.push(p(outer, a0), p(outer, a1), p(inner, a2), p(inner, a3));
    }
    return (
      'M' +
      parts[0] +
      ' L' +
      parts.slice(1).join(' L') +
      ' Z M' +
      (cx + hole) +
      ',' +
      cy +
      ' A' +
      hole +
      ',' +
      hole +
      ' 0 1,0 ' +
      (cx - hole) +
      ',' +
      cy +
      ' A' +
      hole +
      ',' +
      hole +
      ' 0 1,0 ' +
      (cx + hole) +
      ',' +
      cy +
      ' Z'
    );
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
      one('dr-spin-cw', a, 12, 48, 32, 12, 180, 160, 1.2, 30, 0) +
      one('dr-spin-ccw', b, 10, 40, 26, 10, 320, 280, 1, 24, 1) +
      one('dr-spin-cw', c, 14, 56, 36, 14, 520, 140, 1.35, 36, 0) +
      one('dr-spin-ccw', a, 9, 34, 22, 8, 700, 300, 0.95, 20, 1) +
      one('dr-spin-cw', b, 11, 44, 28, 11, 900, 180, 1.15, 28, 0) +
      one('dr-spin-ccw', c, 13, 50, 32, 12, 1050, 320, 1.1, 32, 1) +
      one('dr-spin-cw-fast', a, 8, 28, 18, 7, 240, 480, 0.85, 16, 0) +
      one('dr-spin-ccw-slow', b, 12, 42, 28, 10, 800, 500, 1, 40, 1) +
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
      '#portal-customer:not(.active),#portal-agent:not(.active),.portal:not(.active){',
      'display:none!important;visibility:hidden!important;pointer-events:none!important;',
      'height:0!important;max-height:0!important;overflow:hidden!important;',
      'position:absolute!important;left:-9999px!important;opacity:0!important}',
      '#portal-customer.active{display:block!important;visibility:visible!important;',
      'pointer-events:auto!important;height:auto!important;max-height:none!important;',
      'overflow:visible!important;position:relative!important;left:auto!important;',
      'opacity:1!important;min-height:100vh!important}',
      '#portal-agent.active{display:flex!important;visibility:visible!important;',
      'pointer-events:auto!important;height:auto!important;max-height:none!important;',
      'overflow:visible!important;position:relative!important;left:auto!important;',
      'opacity:1!important;min-height:calc(100vh - 49px)!important}',
      'body.dr-portal-ok,body.is-portal{',
      'background:radial-gradient(ellipse at top,#1a1530 0%,#0c0618 55%,#06040e 100%)!important;',
      'background-attachment:fixed!important}',
      '#' + BG_ID + '{position:fixed;inset:0;width:100%;height:100%;z-index:0;',
      'pointer-events:none!important;overflow:hidden;opacity:1;',
      'transition:none!important;animation:none!important;filter:none!important;',
      'box-shadow:none!important;outline:none!important;user-select:none;',
      'contain:strict;-webkit-tap-highlight-color:transparent}',
      '#' + BG_ID + ' *{pointer-events:none!important;}',
      '#' + BG_ID + ' .dr-hc{position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:0.40}',
      '#' + BG_ID + ' .dr-hc svg{width:100%;height:100%;display:block}',
      '#' + BG_ID + ' .dr-gears{position:absolute;inset:0;width:100%;height:100%;z-index:1;',
      'pointer-events:none!important;opacity:1}',
      '#' + BG_ID + ' .dr-gears svg{width:100%;height:100%;display:block}',
      '#portal-customer.active,#portal-agent.active,.mode-bar{position:relative;z-index:1}',
      '#dr-dev-portal-switch{z-index:9000!important}'
    ].join('');
  }

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (ls && !ls.hidden) {
        var st = window.getComputedStyle ? getComputedStyle(ls) : null;
        if (!st || (st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity || '1') > 0.05))
          return true;
      }
      if (document.body && document.body.classList.contains('is-login') && !document.body.classList.contains('dr-portal-ok'))
        return true;
    } catch (e) {}
    return false;
  }

  function ensureAmbient(forceShow) {
    injectCss();
    if (!document.body) return false;
    if (loginVisible()) {
      var hideEl = document.getElementById(BG_ID);
      if (hideEl) {
        hideEl.style.display = 'none';
        hideEl.style.visibility = 'hidden';
        hideEl.style.opacity = '0';
        hideEl.removeAttribute('data-dr-ready');
      }
      return false;
    }
    var on =
      document.body.classList.contains('dr-portal-ok') ||
      document.body.classList.contains('is-portal') ||
      document.body.classList.contains('is-portal-employee') ||
      document.body.classList.contains('is-portal-admin') ||
      (forceShow &&
        (document.documentElement.getAttribute('data-dr-portal-pref') === 'employee' ||
          document.documentElement.getAttribute('data-dr-portal-pref') === 'admin'));

    var el = document.getElementById(BG_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = BG_ID;
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML =
        '<div class="dr-hc">' +
        honeycombSvg('rgba(196,181,253,0.50)') +
        '</div>' +
        '<div class="dr-gears" aria-hidden="true">' +
        gearsSvg() +
        '</div>';
      document.body.insertBefore(el, document.body.firstChild);
    } else if (!el.querySelector('.dr-gears .dr-spin-cw') || !el.querySelector('animateTransform')) {
      el.innerHTML =
        '<div class="dr-hc">' +
        honeycombSvg('rgba(196,181,253,0.50)') +
        '</div>' +
        '<div class="dr-gears" aria-hidden="true">' +
        gearsSvg() +
        '</div>';
    }
    if (on) {
      el.style.display = 'block';
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      el.style.pointerEvents = 'none';
      el.style.filter = 'none';
      el.setAttribute('data-dr-ready', '1');
      document.documentElement.setAttribute('data-dr-ambient-ready', '1');
      return true;
    }
    el.style.display = 'none';
    document.documentElement.removeAttribute('data-dr-ambient-ready');
    return false;
  }

  function enforce() {
    if (_busy) return;
    _busy = true;
    try {
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (!pc && !pa) return;
      var emp = pc && pc.classList.contains('active');
      var adm = pa && pa.classList.contains('active');
      if (emp && adm) {
        var pref = '';
        try {
          pref =
            sessionStorage.getItem('dr_dev_portal_pref') ||
            sessionStorage.getItem('dr_login_tab') ||
            '';
        } catch (e) {}
        if (pref === 'employee' || pref === 'customer') {
          pa.classList.remove('active');
          adm = false;
        } else {
          pc.classList.remove('active');
          emp = false;
        }
      }
      if (pc) {
        if (emp) pc.style.setProperty('display', 'block', 'important');
        else {
          pc.classList.remove('active');
          pc.style.setProperty('display', 'none', 'important');
        }
      }
      if (pa) {
        if (adm) pa.style.setProperty('display', 'flex', 'important');
        else {
          pa.classList.remove('active');
          pa.style.setProperty('display', 'none', 'important');
        }
      }
    } finally {
      _busy = false;
    }
  }

  function tick() {
    try {
      injectCss();
      ensureAmbient(false);
      enforce();
    } catch (e) {}
  }

  function earlyWarm() {
    try {
      ensureAmbient(false);
    } catch (e) {}
    tick();
  }

  earlyWarm();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      earlyWarm();
      setTimeout(earlyWarm, 0);
      setTimeout(tick, 40);
      setTimeout(tick, 120);
    });
  } else {
    setTimeout(earlyWarm, 0);
    setTimeout(tick, 40);
  }
  setTimeout(tick, 150);
  setTimeout(tick, 400);
  setTimeout(tick, 900);
  setTimeout(tick, 1800);
  setInterval(tick, 4000);

  window.DRPortalShell = {
    v: 10,
    refresh: tick,
    ensureAmbient: ensureAmbient,
    isReady: function () {
      var el = document.getElementById(BG_ID);
      return !!(el && el.getAttribute('data-dr-ready') === '1' && el.style.display !== 'none');
    }
  };
})();
