/**
 * Divine Rays — portal shell fix
 * 1) Inactive portal fully hidden (no Admin UI below Employee)
 * 2) Shared purple + honeycomb background for both portals
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_SHELL >= 1) return;
  window.__DR_PORTAL_SHELL = 1;

  var CSS_ID = 'dr-portal-shell-css';
  var BG_ID = 'dr-portal-ambient';

  function honeycombSvg(stroke) {
    var R = 42, SQ3 = Math.sqrt(3), horiz = SQ3 * R, vert = 1.5 * R;
    var cols = 26, rows = 20, paths = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cx = c * horiz + (r % 2 ? horiz * 0.5 : 0);
        var cy = r * vert + R;
        var pts = [];
        for (var i = 0; i < 6; i++) {
          var a = (Math.PI / 180) * (60 * i - 30);
          pts.push((cx + R * Math.cos(a)).toFixed(2) + ' ' + (cy + R * Math.sin(a)).toFixed(2));
        }
        paths.push('M' + pts.join(' L') + ' Z');
      }
    }
    var vbW = Math.ceil(cols * horiz + horiz);
    var vbH = Math.ceil(rows * vert + 2 * R);
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + vbW + ' ' + vbH + '" ' +
      'preserveAspectRatio="xMidYMid slice" width="100%" height="100%">' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="1.5" stroke-linejoin="round">' +
      paths.map(function (d) { return '<path d="' + d + '"/>'; }).join('') +
      '</g></svg>'
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
      '#portal-customer:not(.active),',
      '#portal-agent:not(.active),',
      '.portal:not(.active){',
      'display:none!important;',
      'visibility:hidden!important;',
      'pointer-events:none!important;',
      'height:0!important;',
      'max-height:0!important;',
      'overflow:hidden!important;',
      'margin:0!important;',
      'padding:0!important;',
      'position:absolute!important;',
      'left:-9999px!important;',
      'opacity:0!important',
      '}',
      '#portal-customer.active{',
      'display:block!important;',
      'visibility:visible!important;',
      'pointer-events:auto!important;',
      'height:auto!important;',
      'max-height:none!important;',
      'overflow:visible!important;',
      'position:relative!important;',
      'left:auto!important;',
      'opacity:1!important;',
      'min-height:100vh!important',
      '}',
      '#portal-agent.active{',
      'display:flex!important;',
      'visibility:visible!important;',
      'pointer-events:auto!important;',
      'height:auto!important;',
      'max-height:none!important;',
      'overflow:visible!important;',
      'position:relative!important;',
      'left:auto!important;',
      'opacity:1!important;',
      'min-height:calc(100vh - 49px)!important',
      '}',
      'body.dr-portal-ok, body.is-portal{',
      'background:radial-gradient(ellipse at top,#1a1530 0%,#0c0618 55%,#06040e 100%)!important;',
      'background-attachment:fixed!important',
      '}',
      '#dr-portal-ambient{',
      'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;opacity:0.22',
      '}',
      'body.dr-portal-ok #dr-portal-ambient, body.is-portal #dr-portal-ambient{display:block}',
      'body:not(.dr-portal-ok):not(.is-portal) #dr-portal-ambient{display:none!important}',
      '#dr-portal-ambient .dr-hc{position:absolute;inset:0;opacity:0.55}',
      '#dr-portal-ambient .dr-hc svg{width:100%;height:100%}',
      '#portal-customer.active, #portal-agent.active, .mode-bar{position:relative;z-index:1}',
      '#dr-dev-portal-switch{z-index:9000!important}'
    ].join('');
  }

  function ensureAmbient() {
    if (!document.body) return;
    var onPortal =
      document.body.classList.contains('dr-portal-ok') ||
      document.body.classList.contains('is-portal');
    var el = document.getElementById(BG_ID);
    if (!onPortal) {
      if (el) el.style.display = 'none';
      return;
    }
    if (!el) {
      el = document.createElement('div');
      el.id = BG_ID;
      el.innerHTML = '<div class="dr-hc">' + honeycombSvg('rgba(167,139,250,0.35)') + '</div>';
      document.body.insertBefore(el, document.body.firstChild);
    }
    el.style.display = 'block';
  }

  function enforcePortalExclusive() {
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (!pc && !pa) return;

    var empOn = pc && pc.classList.contains('active');
    var admOn = pa && pa.classList.contains('active');

    if (empOn && admOn) {
      try {
        var pref = sessionStorage.getItem('dr_dev_portal_pref') || sessionStorage.getItem('dr_login_tab');
        if (pref === 'employee' || pref === 'customer') {
          pa.classList.remove('active');
          admOn = false;
        } else {
          pc.classList.remove('active');
          empOn = false;
        }
      } catch (e) {
        pa.classList.remove('active');
        admOn = false;
      }
    }

    if (pc) {
      if (empOn) {
        pc.style.setProperty('display', 'block', 'important');
        pc.style.removeProperty('height');
        pc.style.removeProperty('position');
        pc.style.removeProperty('left');
      } else {
        pc.classList.remove('active');
        pc.style.setProperty('display', 'none', 'important');
      }
    }
    if (pa) {
      if (admOn) {
        pa.style.setProperty('display', 'flex', 'important');
        pa.style.removeProperty('height');
        pa.style.removeProperty('position');
        pa.style.removeProperty('left');
      } else {
        pa.classList.remove('active');
        pa.style.setProperty('display', 'none', 'important');
      }
    }
  }

  function tick() {
    injectCss();
    ensureAmbient();
    enforcePortalExclusive();
  }

  tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 2500);
  setInterval(tick, 2000);

  document.addEventListener(
    'click',
    function (e) {
      var b = e.target && (e.target.closest ? e.target.closest('#dr-dev-portal-switch button') : null);
      if (b) {
        setTimeout(tick, 30);
        setTimeout(tick, 200);
      }
    },
    true
  );

  try {
    var mo = new MutationObserver(function () { enforcePortalExclusive(); });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
  } catch (e) {}

  window.DRPortalShell = { v: 1, refresh: tick };
})();
