/**
 * Divine Rays Tech Log v6.5 — separate interface + live UI mount
 * Support is hidden via inline !important; Tech Log fills the shell.
 * Does NOT remove portal .active (login-shell needs it).
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TECH_LOG_V65) return;
  window.__DR_TECH_LOG_V65 = 1;

  var MODE_KEY = 'dr_app_mode';
  var onTechLog = false;

  var CSS = [
    '#dr-tech-log-root{display:none;box-sizing:border-box;position:relative;z-index:80;min-height:calc(100vh - 52px);padding:1rem 1.25rem 2.5rem;background:transparent}',
    'body.dr-tl-on #dr-tech-log-root{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;position:relative!important;left:auto!important;top:auto!important;width:auto!important;height:auto!important;max-height:none!important;overflow:visible!important;z-index:80!important}',
    'body.dr-tl-on .mode-bar{display:flex!important;visibility:visible!important;opacity:1!important;z-index:90!important;pointer-events:auto!important}',
    'html body.dr-tl-on #portal-agent,',
    'html body.dr-tl-on #portal-agent.active,',
    'html body.dr-tl-on #portal-customer,',
    'html body.dr-tl-on #portal-customer.active,',
    'html body.dr-tl-on .portal.active{',
    'display:none!important;visibility:hidden!important;opacity:0!important;',
    'pointer-events:none!important;height:0!important;max-height:0!important;',
    'min-height:0!important;overflow:hidden!important;position:fixed!important;',
    'left:-10000px!important;top:-10000px!important;width:0!important;z-index:-1!important}',
    'html body.dr-tl-on #portal-agent .sidebar,',
    'html body.dr-tl-on #portal-agent .main,',
    'html body.dr-tl-on #portal-agent aside,',
    'html body.dr-tl-on #portal-customer .customer-main{display:none!important;visibility:hidden!important}',
    'html body.dr-tl-on #dr-notif-fab,html body.dr-tl-on #dr-chat-fab,html body.dr-tl-on #dr-staff-fab,',
    'html body.dr-tl-on #dr-tour-fab,html body.dr-tl-on .help-tour-btn,html body.dr-tl-on #btn-help-tour,',
    'html body.dr-tl-on #dr-notif-panel,html body.dr-tl-on #dr-chat-panel{display:none!important;visibility:hidden!important;pointer-events:none!important}',
    '#btn-mode-toggle{border-radius:999px;font-weight:600;font-size:.78rem;padding:.35rem .9rem;cursor:pointer;border:none;background:linear-gradient(135deg,#7c6af0,#5b4ce0);color:#fff}',
    'body.dr-tl-on #btn-mode-toggle{background:rgba(109,94,245,.25);color:#e9e5ff;border:1px solid rgba(167,139,250,.5)}',
    '.tl-wrap{max-width:1100px;margin:0 auto}',
    '.tl-hero{background:rgba(26,26,36,.95);border:1px solid rgba(139,124,247,.3);border-radius:16px;padding:1.15rem 1.35rem;margin-bottom:1rem}',
    '.tl-hero h1{margin:0 0 .3rem;font-size:1.35rem;color:#eeeef6}',
    '.tl-hero p{margin:0;color:#9494ae;font-size:.88rem}',
    '.tl-badge-top{display:inline-block;margin-bottom:.4rem;padding:.15rem .55rem;border-radius:6px;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;background:rgba(109,94,245,.3);color:#c4b5fd}',
    '.tl-tabs{display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:1rem}',
    '.tl-tab{border-radius:999px;padding:.42rem .95rem;font-size:.8rem;font-weight:600;cursor:pointer;border:1px solid rgba(139,124,247,.28);background:rgba(26,26,36,.88);color:#c4b5fd}',
    '.tl-tab.on{background:linear-gradient(135deg,#7c6af0,#5b4ce0);color:#fff;border-color:transparent}',
    '.tl-panel{background:rgba(26,26,36,.95);border:1px solid rgba(139,124,247,.24);border-radius:14px;padding:1.1rem;margin-bottom:1rem;color:#d8d4f0}',
    '.tl-panel h2{margin:0 0 .75rem;font-size:1rem;color:#e8e8f0}',
    '.tl-empty{padding:1.5rem;text-align:center;color:#8b8ba3;font-size:.9rem}',
    '.mode-bar .user-info{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}'
  ].join('');

  function injectCss() {
    var el = document.getElementById('dr-tech-log-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-tech-log-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
  }

  function shellReady() {
    var s = document.getElementById('app-shell');
    return !!(s && !s.hidden && !s.classList.contains('is-hidden'));
  }

  function hidePortalInline() {
    ['portal-agent', 'portal-customer'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      el.setAttribute('data-dr-tl-hidden', '1');
    });
    document.querySelectorAll('#portal-agent .sidebar, #portal-agent .main, #portal-customer .customer-main').forEach(function (el) {
      el.style.setProperty('display', 'none', 'important');
    });
    ['dr-notif-fab', 'dr-chat-fab', 'dr-staff-fab', 'dr-tour-fab', 'btn-help-tour'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.setProperty('display', 'none', 'important');
    });
  }

  function restorePortalInline() {
    document.querySelectorAll('[data-dr-tl-hidden]').forEach(function (el) {
      el.style.removeProperty('display');
      el.style.removeProperty('visibility');
      el.style.removeProperty('pointer-events');
      el.removeAttribute('data-dr-tl-hidden');
    });
    document.querySelectorAll('#portal-agent .sidebar, #portal-agent .main, #portal-customer .customer-main').forEach(function (el) {
      el.style.removeProperty('display');
    });
    ['dr-notif-fab', 'dr-chat-fab', 'dr-staff-fab', 'dr-tour-fab', 'btn-help-tour'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.removeProperty('display');
    });
  }

  function forceChrome() {
    document.body.classList.add('dr-in');
    document.body.classList.remove('dr-out');
    var shell = document.getElementById('app-shell');
    if (shell) {
      shell.hidden = false;
      shell.classList.remove('is-hidden');
      shell.style.removeProperty('display');
    }
    var login = document.getElementById('login-screen');
    if (login) {
      login.hidden = true;
      login.classList.add('is-hidden');
    }
    var bar = document.querySelector('#app-shell .mode-bar') || document.querySelector('.mode-bar');
    if (bar) {
      bar.style.setProperty('display', 'flex', 'important');
      bar.style.setProperty('visibility', 'visible', 'important');
    }
    var root = document.getElementById('dr-tech-log-root');
    if (root && onTechLog) {
      root.style.setProperty('display', 'block', 'important');
      root.style.setProperty('visibility', 'visible', 'important');
      root.style.setProperty('opacity', '1', 'important');
      root.style.setProperty('z-index', '80', 'important');
    }
    if (window.DRLoginShellSep && window.DRLoginShellSep.sync) {
      try { window.DRLoginShellSep.sync(); } catch (e) {}
    }
  }

  function enterTechLogMode() {
    document.body.classList.add('dr-tl-on');
    hidePortalInline();
    forceChrome();
  }

  function leaveTechLogMode() {
    document.body.classList.remove('dr-tl-on');
    restorePortalInline();
    forceChrome();
  }

  function renderShell() {
    var root = document.getElementById('dr-tech-log-root');
    if (!root) return;
    root.innerHTML =
      '<div class="tl-wrap">' +
      '<div class="tl-hero">' +
      '<span class="tl-badge-top">Divine Rays Tech Log</span>' +
      '<h1>Borrow &amp; Return</h1>' +
      '<p>Laptops, mouse, keyboard, camera, USB — request, approve, return.</p>' +
      '</div>' +
      '<div class="tl-panel" id="tl-live-mount"><div class="tl-empty">Loading inventory…</div></div></div>';
    if (window.DRTechLogUI && typeof window.DRTechLogUI.mount === 'function') {
      try { window.DRTechLogUI.mount(); } catch (e) { console.warn('[TL]', e); }
    }
  }

  function ensureRoot() {
    if (document.getElementById('dr-tech-log-root')) return;
    var shell = document.getElementById('app-shell');
    if (!shell) return;
    var root = document.createElement('div');
    root.id = 'dr-tech-log-root';
    var bar = shell.querySelector('.mode-bar');
    if (bar && bar.nextSibling) shell.insertBefore(root, bar.nextSibling);
    else shell.appendChild(root);
  }

  function setBrand(techLog) {
    var brand = document.querySelector('.mode-bar .mode-brand strong');
    if (brand) brand.textContent = techLog ? 'Divine Rays Tech Log' : 'Divine Rays Tech Hub';
  }

  function syncLabel() {
    var b = document.getElementById('btn-mode-toggle');
    if (b) b.textContent = onTechLog ? 'Switch to Tech Support' : 'Switch to Tech Log';
  }

  function ensureButton() {
    if (!shellReady()) return;
    var bar =
      document.querySelector('#app-shell .mode-bar .user-info') ||
      document.querySelector('.mode-bar .user-info');
    if (!bar) return;
    if (!document.getElementById('btn-mode-toggle')) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-mode-toggle';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (onTechLog) goSupport();
        else goTechLog();
      });
      bar.insertBefore(btn, bar.firstChild);
    }
    syncLabel();
  }

  function goTechLog() {
    if (!shellReady()) return;
    try { sessionStorage.setItem(MODE_KEY, 'techlog'); } catch (e) {}
    onTechLog = true;
    injectCss();
    ensureRoot();
    ensureButton();
    enterTechLogMode();
    setBrand(true);
    syncLabel();
    renderShell();
    enterTechLogMode();
    setTimeout(enterTechLogMode, 50);
    setTimeout(enterTechLogMode, 250);
    setTimeout(enterTechLogMode, 800);
  }

  function goSupport() {
    try { sessionStorage.setItem(MODE_KEY, 'support'); } catch (e) {}
    onTechLog = false;
    leaveTechLogMode();
    var root = document.getElementById('dr-tech-log-root');
    if (root) {
      root.style.setProperty('display', 'none', 'important');
      root.innerHTML = '';
    }
    setBrand(false);
    ensureButton();
    syncLabel();
    forceChrome();
  }

  function init() {
    injectCss();
    if (!shellReady()) return;
    ensureButton();
    var mode = '';
    try { mode = sessionStorage.getItem(MODE_KEY) || ''; } catch (e) {}
    if (mode === 'techlog' || onTechLog) {
      goTechLog();
      return;
    }
  }

  setTimeout(init, 700);
  setTimeout(init, 2000);
  setInterval(function () {
    if (!shellReady()) return;
    ensureButton();
    if (onTechLog) enterTechLogMode();
  }, 2500);

  window.DRTechLog = { goTechLog: goTechLog, goSupport: goSupport };
})();
