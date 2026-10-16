/**
 * Divine Rays — portal shell fix v2 (no freeze)
 * Hide inactive portal; light honeycomb bg. No subtree MutationObserver.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_SHELL >= 2) return;
  window.__DR_PORTAL_SHELL = 2;

  var CSS_ID = 'dr-portal-shell-css';
  var BG_ID = 'dr-portal-ambient';
  var _busy = false;

  function honeycombSvg(stroke) {
    var R = 48, SQ3 = Math.sqrt(3), horiz = SQ3 * R, vert = 1.5 * R;
    var cols = 14, rows = 10, paths = [];
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
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + vbW + ' ' + vbH + '" ' +
      'preserveAspectRatio="xMidYMid slice" width="100%" height="100%">' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="1.4">' +
      '<path d="' + paths.join(' ') + '"/>' +
      '</g></svg>'
    );
  }

  function injectCss() {
    if (document.getElementById(CSS_ID)) return;
    var el = document.createElement('style');
    el.id = CSS_ID;
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
      '#dr-portal-ambient{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;opacity:0.2}',
      'body:not(.dr-portal-ok):not(.is-portal) #dr-portal-ambient{display:none!important}',
      '#dr-portal-ambient .dr-hc{position:absolute;inset:0}',
      '#dr-portal-ambient .dr-hc svg{width:100%;height:100%}',
      '#portal-customer.active,#portal-agent.active,.mode-bar{position:relative;z-index:1}',
      '#dr-dev-portal-switch{z-index:9000!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function ensureAmbient() {
    var on =
      document.body &&
      (document.body.classList.contains('dr-portal-ok') ||
        document.body.classList.contains('is-portal'));
    var el = document.getElementById(BG_ID);
    if (!on) {
      if (el) el.style.display = 'none';
      return;
    }
    if (!el) {
      el = document.createElement('div');
      el.id = BG_ID;
      el.innerHTML = '<div class="dr-hc">' + honeycombSvg('rgba(167,139,250,0.32)') + '</div>';
      document.body.insertBefore(el, document.body.firstChild);
    }
    el.style.display = 'block';
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
          pref = sessionStorage.getItem('dr_dev_portal_pref') || sessionStorage.getItem('dr_login_tab') || '';
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
      ensureAmbient();
      enforce();
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(tick, 0); });
  } else {
    setTimeout(tick, 0);
  }
  setTimeout(tick, 800);
  setTimeout(tick, 2000);
  setInterval(tick, 4000);

  document.addEventListener(
    'click',
    function (e) {
      var b = e.target && e.target.closest && e.target.closest('#dr-dev-portal-switch button');
      if (b) setTimeout(tick, 50);
    },
    true
  );

  window.DRPortalShell = { v: 2, refresh: tick };
})();
