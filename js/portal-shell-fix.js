/**
 * Divine Rays — portal-shell-fix v6
 * Full-screen zoomed-out honeycomb, lighter visibility, smooth fade-in.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_SHELL >= 6) return;
  window.__DR_PORTAL_SHELL = 6;

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
      (stroke || 'rgba(196,181,253,0.48)') +
      '" stroke-width="1.15">' +
      '<path d="' +
      paths.join(' ') +
      '"/>' +
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
      '#' + BG_ID + '{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:hidden;',
      'opacity:0;transition:opacity 0.9s ease}',
      'body:not(.dr-portal-ok):not(.is-portal) #' + BG_ID + '{display:none!important;opacity:0}',
      '#' + BG_ID + ' .dr-hc{position:absolute;inset:0;width:100%;height:100%}',
      '#' + BG_ID + ' .dr-hc svg{width:100%;height:100%;display:block}',
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
      el.style.opacity = '0';
      el.innerHTML =
        '<div class="dr-hc">' + honeycombSvg('rgba(196,181,253,0.48)') + '</div>';
      document.body.insertBefore(el, document.body.firstChild);
    }
    if (on) {
      el.style.display = 'block';
      el.style.visibility = 'visible';
      if (el.getAttribute('data-dr-faded') !== '1') {
        el.style.opacity = '0';
        el.setAttribute('data-dr-faded', '1');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.transition = 'opacity 0.9s ease';
            el.style.opacity = '0.38';
          });
        });
      } else {
        el.style.opacity = '0.38';
      }
      return true;
    }
    el.style.display = 'none';
    el.style.opacity = '0';
    el.removeAttribute('data-dr-faded');
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
  setInterval(tick, 5000);

  document.addEventListener(
    'click',
    function (e) {
      if (
        e.target &&
        e.target.closest &&
        e.target.closest('#dr-dev-portal-switch, .mode-bar, .nav-btn')
      ) {
        setTimeout(tick, 40);
      }
    },
    true
  );

  window.DRPortalShell = { v: 6, refresh: tick, ensureAmbient: ensureAmbient };
})();
