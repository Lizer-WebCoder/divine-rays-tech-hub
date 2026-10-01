/**
 * Tech Log fail-safe v1 — prevent blank screen on switch
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TL_FIX1) return;
  window.__DR_TL_FIX1 = 1;

  function forceShow() {
    document.body.classList.add('dr-tl-on');
    var bar = document.querySelector('#app-shell .mode-bar') || document.querySelector('.mode-bar');
    if (bar) {
      bar.style.setProperty('display', 'flex', 'important');
      bar.style.setProperty('visibility', 'visible', 'important');
      bar.style.setProperty('opacity', '1', 'important');
    }
    var root = document.getElementById('dr-tech-log-root');
    if (root) {
      root.style.setProperty('display', 'block', 'important');
      root.style.setProperty('visibility', 'visible', 'important');
      root.style.setProperty('opacity', '1', 'important');
      root.style.setProperty('pointer-events', 'auto', 'important');
      root.style.setProperty('z-index', '50', 'important');
      if (!root.innerHTML || root.innerHTML.length < 20) {
        root.innerHTML =
          '<div style="max-width:1100px;margin:0 auto;padding:1rem">' +
          '<div style="background:rgba(26,26,36,.94);border:1px solid rgba(139,124,247,.28);border-radius:16px;padding:1.2rem">' +
          '<div style="font-size:.7rem;font-weight:700;color:#c4b5fd;text-transform:uppercase;margin-bottom:.4rem">Divine Rays Tech Log</div>' +
          '<h1 style="margin:0 0 .35rem;font-size:1.3rem;color:#eeeef6">Borrow &amp; Return</h1>' +
          '<p style="margin:0;color:#9494ae;font-size:.88rem">Loading interface… If this stays, hard-refresh (Ctrl+Shift+R).</p>' +
          '</div></div>';
      }
    }
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pa) {
      pa.classList.remove('active');
      pa.style.setProperty('display', 'none', 'important');
    }
    if (pc) {
      pc.classList.remove('active');
      pc.style.setProperty('display', 'none', 'important');
    }
  }

  function wrap() {
    if (!window.DRTechLog) return false;
    var origGo = window.DRTechLog.goTechLog;
    var origBack = window.DRTechLog.goSupport;
    if (typeof origGo !== 'function') return false;

    window.DRTechLog.goTechLog = async function () {
      try {
        forceShow();
        var r = origGo.apply(this, arguments);
        if (r && typeof r.then === 'function') await r;
      } catch (e) {
        console.warn('[TL fix]', e);
      }
      forceShow();
      setTimeout(forceShow, 100);
      setTimeout(forceShow, 500);
    };

    window.DRTechLog.goSupport = function () {
      try {
        if (typeof origBack === 'function') origBack.apply(this, arguments);
      } catch (e) {
        console.warn('[TL fix back]', e);
      }
      document.body.classList.remove('dr-tl-on');
      var root = document.getElementById('dr-tech-log-root');
      if (root) {
        root.style.setProperty('display', 'none', 'important');
      }
    };

    var btn = document.getElementById('btn-mode-toggle');
    if (btn && !btn.__tlFix) {
      btn.__tlFix = 1;
      btn.addEventListener(
        'click',
        function () {
          setTimeout(function () {
            if (document.body.classList.contains('dr-tl-on')) forceShow();
          }, 50);
          setTimeout(function () {
            if (document.body.classList.contains('dr-tl-on')) forceShow();
          }, 300);
        },
        true
      );
    }
    return true;
  }

  var n = 0;
  var t = setInterval(function () {
    n++;
    if (wrap() || n > 40) clearInterval(t);
  }, 250);
})();
