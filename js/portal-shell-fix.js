/**
 * Divine Rays — portal-shell-fix v9 — honeycomb + baked SMIL gears
 * Static honeycomb (no glow/reaction on click).
 * Pre-paint under boot; exposes isReady for boot wait.
 * Gears live inside ambient so hard-refresh always shows them.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_SHELL >= 9) return;
  window.__DR_PORTAL_SHELL = 9;

  var CSS_ID = 'dr-portal-shell-css';
  var BG_ID = 'dr-portal-ambient';
  var _busy = false;

  function honeycombSvg(stroke) {
    var R = 28,
      SQ3 = Math.sqrt(3),
      horiz = SQ3 * R,
      vert = 1.5 * R;
    var cols = 28,
      rows = 18,
      paths = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cx = c * horiz + (r % 2 ? horiz * 0.5 : 0);
        var cy = r * vert + R;
        var pts = [];
        for (var i = 0; i < 6; i++) {
          var a = (Math.PI / 180) * (60 * i - 30);
          pts.push((cx + R * Math.cos(a)).toFixed(1) + ' ' + (cy + R * Math.sin(a)).toFixed(1));
        }
        paths.push('M' + pts.join('L') + 'Z');
      }
    }
    var vbW = Math.ceil(cols * horiz + horiz);
    var vbH = Math.ceil(rows * vert + 2 * R);
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      vbW +
      ' ' +
      vbH +
      '" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">' +
      '<g fill="none" stroke="' +
      (stroke || 'rgba(196,181,253,0.50)') +
      '" stroke-width="1.15">' +
      '<path d="' +
      paths.join(' ') +
      '"/>' +
      '</g></svg>'
    );
  }

  function gearsSvg() {
    function gearPath(teeth, outer, inner, hole) {
      var pts = [],
        step = (Math.PI * 2) / teeth;
      for (var i = 0; i < teeth; i++) {
        var a0 = i * step,
          a1 = a0 + step * 0.35,
          a2 = a0 + step * 0.5,
          a3 = a0 + step * 0.85;
        pts.push([Math.cos(a0) * outer, Math.sin(a0) * outer]);
        pts.push([Math.cos(a1) * outer, Math.sin(a1) * outer]);
        pts.push([Math.cos(a2) * inner, Math.sin(a2) * inner]);
        pts.push([Math.cos(a3) * inner, Math.sin(a3) * inner]);
      }
      var d = 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2);
      for (var j = 1; j < pts.length; j++) d += 'L' + pts[j][0].toFixed(2) + ' ' + pts[j][1].toFixed(2);
      d += 'Z';
      d +=
        'M' +
        hole +
        ' 0A' +
        hole +
        ' ' +
        hole +
        ' 0 1 0 ' +
        -hole +
        ' 0A' +
        hole +
        ' ' +
        hole +
        ' 0 1 0 ' +
        hole +
        ' 0Z';
      return d;
    }
    function one(cls, fill, teeth, outer, inner, hole, cx, cy, scale, dur, ccw) {
      var d = gearPath(teeth, outer, inner, hole);
      var to = ccw ? '-360' : '360';
      return (
        '<g transform="translate(' +
        cx +
        ' ' +
        cy +
        ') scale(' +
        (scale || 1) +
        ')">' +
        '<g class="' +
        cls +
        '">' +
        '<animateTransform attributeName="transform" type="rotate" from="0 0 0" to="' +
        to +
        ' 0 0" dur="' +
        (dur || 30) +
        's" repeatCount="indefinite"/>' +
        '<path fill="' +
        fill +
        '" fill-rule="evenodd" d="' +
        d +
        '"/>' +
        '<circle cx="0" cy="0" r="' +
        (hole * 0.55).toFixed(1) +
        '" fill="' +
        fill +
        '" opacity="0.85"/>' +
        '</g></g>'
      );
    }
    var a = 'rgba(139,92,246,0.28)',
      b = 'rgba(167,139,250,0.22)',
      c = 'rgba(109,90,154,0.26)';
    return (
      '<svg class="dr-gears-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style="display:block;opacity:0.95">' +
      one('dr-spin-cw', a, 12, 90, 62, 22, 180, 200, 1.15, 30, 0) +
      one('dr-spin-ccw', b, 10, 70, 48, 18, 340, 280, 1, 24, 1) +
      one('dr-spin-cw-fast', c, 14, 110, 76, 26, 620, 180, 1.25, 18, 0) +
      one('dr-spin-ccw-slow', a, 9, 55, 38, 14, 900, 320, 0.95, 36, 1) +
      one('dr-spin-cw', b, 11, 80, 55, 20, 1050, 160, 1.1, 28, 0) +
      one('dr-spin-ccw', c, 13, 95, 66, 24, 480, 480, 1.05, 22, 1) +
      one('dr-spin-cw-fast', a, 8, 48, 32, 12, 200, 520, 0.9, 16, 0) +
      one('dr-spin-ccw-slow', b, 12, 88, 60, 20, 780, 520, 1, 34, 1) +
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

  function ensureAmbient(forceShow) {
    injectCss();
    if (!document.body) return false;
    var on =
      forceShow ||
      document.body.classList.contains('dr-portal-ok') ||
      document.body.classList.contains('is-portal') ||
      document.documentElement.getAttribute('data-dr-portal-pref') === 'employee' ||
      document.documentElement.getAttribute('data-dr-portal-pref') === 'admin';

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
      ensureAmbient(true);
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
    v: 9,
    refresh: tick,
    ensureAmbient: ensureAmbient,
    isReady: function () {
      var el = document.getElementById(BG_ID);
      return !!(el && el.getAttribute('data-dr-ready') === '1' && el.style.display !== 'none');
    }
  };
})();
