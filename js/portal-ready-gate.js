/**
 * Divine Rays — portal-ready-gate v3
 * Loading UI only after successful Sign in (dr_skip_boot_gear).
 * Portal hard refresh uses Booting UI (spinning gear).
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_READY_GATE >= 3) return;
  window.__DR_PORTAL_READY_GATE = 3;

  var CSS_ID = 'dr-portal-ready-gate-css';
  var LOADER_ID = 'dr-post-login-boot';
  var started = Date.now();
  var released = false;
  var armed = false;

  function preferred() {
    try {
      var tab = sessionStorage.getItem('dr_login_tab') || '';
      var pref = sessionStorage.getItem('dr_dev_portal_pref') || '';
      if (tab === 'customer' || pref === 'employee') return 'employee';
      if (tab === 'agent' || pref === 'admin') return 'admin';
    } catch (e) {}
    return '';
  }

  function hasAuthHint() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || '';
        if (/supabase|sb-|auth-token/i.test(k)) {
          var v = localStorage.getItem(k);
          if (v && v.length > 20) return true;
        }
      }
    } catch (e) {}
    try {
      return (
        sessionStorage.getItem('dr_skip_boot_gear') === '1' ||
        sessionStorage.getItem('dr_post_login_boot') === '1' ||
        !!preferred()
      );
    } catch (e2) {}
    return false;
  }

  function injectCss(want) {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent =
      'html[data-dr-hold-portal="1"] #portal-customer,' +
      'html[data-dr-hold-portal="1"] #portal-agent,' +
      'html[data-dr-hold-portal="1"] #mode-bar-employee,' +
      'html[data-dr-hold-portal="1"] #mode-bar-admin,' +
      'html[data-dr-hold-portal="1"] .mode-bar{' +
      'opacity:0!important;pointer-events:none!important;transition:none!important}' +
      'html[data-dr-portal-pref="employee"] #portal-agent,' +
      'html[data-dr-portal-pref="employee"] #mode-bar-admin,' +
      'html[data-dr-portal-pref="employee"] .mode-bar-admin{' +
      'display:none!important;visibility:hidden!important;pointer-events:none!important}' +
      'html[data-dr-portal-pref="employee"] #portal-customer{display:block!important;visibility:visible!important}' +
      'html[data-dr-portal-pref="employee"] #mode-bar-employee,' +
      'html[data-dr-portal-pref="employee"] .mode-bar-employee{display:flex!important}' +
      'html[data-dr-portal-pref="admin"] #portal-customer,' +
      'html[data-dr-portal-pref="admin"] #mode-bar-employee,' +
      'html[data-dr-portal-pref="admin"] .mode-bar-employee{' +
      'display:none!important;visibility:hidden!important;pointer-events:none!important}' +
      'html[data-dr-portal-pref="admin"] #portal-agent{display:flex!important;visibility:visible!important}' +
      'html[data-dr-portal-pref="admin"] #mode-bar-admin,' +
      'html[data-dr-portal-pref="admin"] .mode-bar-admin{display:flex!important}';
    if (want) document.documentElement.setAttribute('data-dr-portal-pref', want);
  }

  function showLoader() {
    var el = document.getElementById(LOADER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = LOADER_ID;
      el.setAttribute('aria-live', 'polite');
      el.innerHTML =
        '<div class="pl-rings" aria-hidden="true">' +
        '<div class="pl-ring"></div><div class="pl-ring"></div><div class="pl-ring"></div>' +
        '<div class="pl-core"></div></div>' +
        '<p class="pl-title">Opening portal…</p>' +
        '<p class="pl-sub">Preparing your workspace</p>' +
        '<div class="pl-bar"><i></i></div>';
      if (!document.getElementById('dr-portal-ready-loader-css')) {
        var st = document.createElement('style');
        st.id = 'dr-portal-ready-loader-css';
        st.textContent =
          '#' + LOADER_ID + '{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;' +
          'justify-content:center;flex-direction:column;gap:1.35rem;' +
          'background:radial-gradient(ellipse at 50% 40%,#1e1240 0%,#0c0618 70%)}' +
          '#' + LOADER_ID + '.is-done{display:none!important;opacity:0;pointer-events:none}' +
          '#' + LOADER_ID + ' .pl-rings{position:relative;width:72px;height:72px}' +
          '#' + LOADER_ID + ' .pl-ring{position:absolute;inset:0;border-radius:50%;border:2px solid transparent;' +
          'border-top-color:#a78bfa;border-right-color:rgba(167,139,250,.35);animation:drPlSpin 1s linear infinite}' +
          '#' + LOADER_ID + ' .pl-ring:nth-child(2){inset:10px;border-top-color:#c4b5fd;animation-duration:1.4s;animation-direction:reverse}' +
          '#' + LOADER_ID + ' .pl-ring:nth-child(3){inset:20px;border-top-color:#8b5cf6;animation-duration:.85s}' +
          '#' + LOADER_ID + ' .pl-core{position:absolute;inset:26px;border-radius:50%;' +
          'background:radial-gradient(circle,#c4b5fd 0%,#7c6af0 70%);box-shadow:0 0 20px rgba(139,92,246,.55);' +
          'animation:drPlPulse 1.2s ease-in-out infinite}' +
          '@keyframes drPlSpin{to{transform:rotate(360deg)}}' +
          '@keyframes drPlPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.85);opacity:.7}}' +
          '#' + LOADER_ID + ' .pl-title{color:#eeeef6;font-weight:650;font-size:1.1rem;margin:0}' +
          '#' + LOADER_ID + ' .pl-sub{color:#9494ae;font-size:.82rem;margin:0}' +
          '#' + LOADER_ID + ' .pl-bar{width:160px;height:4px;border-radius:99px;background:rgba(139,92,246,.2);overflow:hidden}' +
          '#' + LOADER_ID + ' .pl-bar>i{display:block;height:100%;width:40%;border-radius:99px;' +
          'background:linear-gradient(90deg,#7c6af0,#c4b5fd,#7c6af0);animation:drPlBar 1.1s ease-in-out infinite}' +
          '@keyframes drPlBar{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}';
        (document.head || document.documentElement).appendChild(st);
      }
      document.body.appendChild(el);
    }
    el.classList.add('is-on');
    el.classList.remove('is-done');
    el.style.display = 'flex';
    document.documentElement.setAttribute('data-dr-hold-portal', '1');
  }

  function hideLoader() {
    var el = document.getElementById(LOADER_ID);
    if (el) {
      el.classList.remove('is-on');
      el.classList.add('is-done');
      el.style.display = 'none';
    }
    var extra = document.getElementById('dr-portal-loader');
    if (extra) {
      extra.classList.add('is-done');
      extra.style.display = 'none';
    }
    document.documentElement.removeAttribute('data-dr-hold-portal');
  }

  function forcePortal(want) {
    if (!want) return;
    try {
      document.body.classList.add('dr-portal-ok', 'is-portal');
      document.body.classList.remove('is-login');
      document.documentElement.setAttribute('data-dr-portal-pref', want);
      if (want === 'employee') {
        document.body.classList.add('is-portal-employee');
        document.body.classList.remove('is-portal-admin');
      } else {
        document.body.classList.add('is-portal-admin');
        document.body.classList.remove('is-portal-employee');
      }
    } catch (e) {}

    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (want === 'employee') {
      if (pa) {
        pa.classList.remove('active');
        pa.style.setProperty('display', 'none', 'important');
        pa.hidden = true;
      }
      if (pc) {
        pc.hidden = false;
        pc.removeAttribute('hidden');
        pc.classList.add('active');
        pc.style.setProperty('display', 'block', 'important');
        pc.style.visibility = 'visible';
        pc.style.opacity = '1';
      }
    } else {
      if (pc) {
        pc.classList.remove('active');
        pc.style.setProperty('display', 'none', 'important');
        pc.hidden = true;
      }
      if (pa) {
        pa.hidden = false;
        pa.removeAttribute('hidden');
        pa.classList.add('active');
        pa.style.setProperty('display', 'flex', 'important');
        pa.style.visibility = 'visible';
        pa.style.opacity = '1';
      }
    }
    try {
      if (window.DRPortalShell && typeof window.DRPortalShell.refresh === 'function') {
        window.DRPortalShell.refresh();
      }
    } catch (e4) {}
  }

  function portalReady(want) {
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (want === 'employee') {
      if (!pc || !pc.classList.contains('active')) return false;
      return !!(
        pc.querySelector('.customer-main, .topbar, nav, header, main, .view, .mode-brand') ||
        pc.childNodes.length > 0
      );
    }
    if (want === 'admin') {
      if (!pa || !pa.classList.contains('active')) return false;
      return !!(
        pa.querySelector('.sidebar, .main, .topbar, nav, .view, .mode-brand') ||
        pa.childNodes.length > 0
      );
    }
    return false;
  }

  function ambientReady() {
    var bg = document.getElementById('dr-portal-ambient');
    return !!(bg && bg.style.display !== 'none');
  }

  function tryRelease() {
    if (released) return;
    if (!armed) return;
    var want = preferred();
    if (!want) {
      released = true;
      document.documentElement.removeAttribute('data-dr-hold-portal');
      return;
    }
    forcePortal(want);
    injectCss(want);
    var elapsed = Date.now() - started;
    var ready = portalReady(want);
    try {
      if (window.DRPortalShell && window.DRPortalShell.refresh) window.DRPortalShell.refresh();
    } catch (e) {}
    if (ready && elapsed >= 900) {
      if (ambientReady() || elapsed >= 1600) {
        released = true;
        hideLoader();
        forcePortal(want);
        try {
          if (window.DRTopbarLayout && window.DRTopbarLayout.refresh) window.DRTopbarLayout.refresh();
        } catch (e2) {}
        try {
          sessionStorage.removeItem('dr_skip_boot_gear');
        } catch (e3) {}
        return;
      }
    }
    if (elapsed >= 4500) {
      released = true;
      hideLoader();
      forcePortal(want);
      try {
        sessionStorage.removeItem('dr_skip_boot_gear');
      } catch (e4) {}
    }
  }

  var want0 = preferred();
  var auth = hasAuthHint();
  var postLogin = false;
  try {
    postLogin = sessionStorage.getItem('dr_skip_boot_gear') === '1';
  } catch (e0) {}

  injectCss(want0);
  if (want0) {
    document.documentElement.setAttribute('data-dr-portal-pref', want0);
  }

  if (postLogin && auth && want0) {
    armed = true;
    document.documentElement.setAttribute('data-dr-hold-portal', '1');
    function arm() {
      if (!document.body) return;
      showLoader();
      forcePortal(want0);
    }
    if (document.body) arm();
    else document.addEventListener('DOMContentLoaded', arm);

    var n = 0;
    var iv = setInterval(function () {
      n++;
      tryRelease();
      if (released || n > 60) clearInterval(iv);
    }, 80);
    setTimeout(tryRelease, 200);
    setTimeout(tryRelease, 500);
    setTimeout(tryRelease, 1000);
    setTimeout(tryRelease, 1800);
    setTimeout(tryRelease, 2800);
  } else {
    released = true;
    document.documentElement.removeAttribute('data-dr-hold-portal');
    function softForce() {
      var w = preferred();
      if (!w) return;
      injectCss(w);
      try {
        if (
          document.body &&
          (document.body.classList.contains('dr-portal-ok') ||
            document.body.classList.contains('is-portal'))
        ) {
          forcePortal(w);
        }
      } catch (e) {}
    }
    setTimeout(softForce, 300);
    setTimeout(softForce, 900);
    setTimeout(softForce, 1800);
  }

  window.DRPortalReadyGate = {
    v: 3,
    preferred: preferred,
    release: function () {
      released = true;
      hideLoader();
    },
    setPref: function (which) {
      if (which !== 'employee' && which !== 'admin') return;
      document.documentElement.setAttribute('data-dr-portal-pref', which);
      document.documentElement.removeAttribute('data-dr-hold-portal');
      injectCss(which);
      forcePortal(which);
    }
  };
})();
