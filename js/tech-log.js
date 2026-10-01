/**
 * Divine Rays Tech Log v6.3 — mode switch without logout
 * Keeps portal .active so login-shell stays "in"
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TECH_LOG_V63) return;
  window.__DR_TECH_LOG_V63 = 1;

  var MODE_KEY = 'dr_app_mode';
  var onTechLog = false;

  var CSS = [
    '#dr-tech-log-root{display:none;padding:1rem 1.25rem 2.5rem;box-sizing:border-box;position:relative;z-index:50;min-height:calc(100vh - 52px)}',
    'body.dr-tl-on #dr-tech-log-root{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;position:relative!important;left:auto!important;width:auto!important;height:auto!important;max-height:none!important;overflow:visible!important}',
    'body.dr-tl-on .mode-bar{display:flex!important;visibility:visible!important;opacity:1!important;z-index:60;pointer-events:auto!important}',
    'body.dr-tl-on #portal-agent,',
    'body.dr-tl-on #portal-agent.active,',
    'body.dr-tl-on #portal-customer,',
    'body.dr-tl-on #portal-customer.active{',
    'display:none!important;visibility:hidden!important;opacity:0!important;',
    'pointer-events:none!important;height:0!important;max-height:0!important;',
    'overflow:hidden!important;position:absolute!important;left:-9999px!important;width:0!important}',
    'body.dr-tl-on #portal-agent .sidebar,body.dr-tl-on #portal-agent .main,',
    'body.dr-tl-on #portal-customer .customer-main{display:none!important}',
    'body.dr-tl-on #dr-notif-fab,body.dr-tl-on #dr-chat-fab,body.dr-tl-on #dr-staff-fab,',
    'body.dr-tl-on #dr-tour-fab,body.dr-tl-on .help-tour-btn,body.dr-tl-on #btn-help-tour{display:none!important}',
    '#btn-mode-toggle{border-radius:999px;font-weight:600;font-size:.78rem;padding:.35rem .9rem;cursor:pointer;border:none;background:linear-gradient(135deg,#7c6af0,#5b4ce0);color:#fff}',
    'body.dr-tl-on #btn-mode-toggle{background:rgba(109,94,245,.22);color:#c4b5fd;border:1px solid rgba(167,139,250,.45)}',
    '.tl-wrap{max-width:1100px;margin:0 auto}',
    '.tl-hero{background:rgba(26,26,36,.94);border:1px solid rgba(139,124,247,.28);border-radius:16px;padding:1.1rem 1.3rem;margin-bottom:1rem}',
    '.tl-hero h1{margin:0 0 .25rem;font-size:1.3rem;color:#eeeef6}',
    '.tl-hero p{margin:0;color:#9494ae;font-size:.88rem}',
    '.tl-badge-top{display:inline-block;margin-bottom:.4rem;padding:.15rem .5rem;border-radius:6px;font-size:.68rem;font-weight:700;text-transform:uppercase;background:rgba(109,94,245,.28);color:#c4b5fd}',
    '.tl-panel{background:rgba(26,26,36,.94);border:1px solid rgba(139,124,247,.22);border-radius:14px;padding:1rem;margin-bottom:1rem;color:#c4b5fd}',
    '.tl-tabs{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem}',
    '.tl-tab{border-radius:999px;padding:.4rem .9rem;font-size:.8rem;font-weight:600;border:1px solid rgba(139,124,247,.25);background:rgba(26,26,36,.85);color:#c4b5fd}',
    '.tl-tab.on{background:linear-gradient(135deg,#7c6af0,#5b4ce0);color:#fff;border-color:transparent}',
    '.mode-bar .user-info{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}'
  ].join('');

  function injectCss() {
    var el = document.getElementById('dr-tech-log-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-tech-log-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function shellReady() {
    var s = document.getElementById('app-shell');
    return !!(s && !s.hidden && !s.classList.contains('is-hidden'));
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
    if (root) {
      root.style.setProperty('display', 'block', 'important');
      root.style.setProperty('visibility', 'visible', 'important');
      root.style.setProperty('opacity', '1', 'important');
    }
    if (window.DRLoginShellSep && window.DRLoginShellSep.sync) {
      try { window.DRLoginShellSep.sync(); } catch (e) {}
    }
  }

  function hideSupportCssOnly() {
    document.body.classList.add('dr-tl-on');
    forceChrome();
  }

  function showSupport() {
    document.body.classList.remove('dr-tl-on');
    forceChrome();
  }

  function renderShell() {
    var root = document.getElementById('dr-tech-log-root');
    if (!root) return;
    forceChrome();
    root.innerHTML =
      '<div class="tl-wrap">' +
      '<div class="tl-hero">' +
      '<span class="tl-badge-top">Divine Rays Tech Log</span>' +
      '<h1>Borrow &amp; Return</h1>' +
      '<p>Laptops, mouse, keyboard, camera, USB — request, approve, return.</p>' +
      '</div>' +
      '<div class="tl-tabs">' +
      '<span class="tl-tab on">Available</span>' +
      '<span class="tl-tab">My borrows</span>' +
      '<span class="tl-tab">Open loans</span>' +
      '<span class="tl-tab">Inventory</span>' +
      '</div>' +
      '<div class="tl-panel" id="tl-live-mount">' +
      '<p style="margin:0;color:#8b8ba3">Tech Log is active. You stayed signed in.</p>' +
      '<p style="margin:.5rem 0 0;color:#8b8ba3;font-size:.85rem">Full inventory wiring loads next. Use the top button to return to Tech Support anytime.</p>' +
      '</div></div>';
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
    try {
      sessionStorage.setItem(MODE_KEY, 'techlog');
    } catch (e) {}
    onTechLog = true;
    injectCss();
    ensureRoot();
    ensureButton();
    hideSupportCssOnly();
    forceChrome();
    var brand = document.querySelector('.mode-bar .mode-brand strong');
    if (brand) brand.textContent = 'Divine Rays Tech Log';
    syncLabel();
    renderShell();
    forceChrome();
    setTimeout(forceChrome, 100);
    setTimeout(forceChrome, 400);
  }

  function goSupport() {
    try {
      sessionStorage.setItem(MODE_KEY, 'support');
    } catch (e) {}
    onTechLog = false;
    showSupport();
    var root = document.getElementById('dr-tech-log-root');
    if (root) root.style.setProperty('display', 'none', 'important');
    var brand = document.querySelector('.mode-bar .mode-brand strong');
    if (brand) brand.textContent = 'Divine Rays Tech Hub';
    ensureButton();
    syncLabel();
    forceChrome();
  }

  function init() {
    injectCss();
    if (!shellReady()) return;
    ensureButton();
    if (onTechLog) {
      hideSupportCssOnly();
      forceChrome();
      return;
    }
    try {
      sessionStorage.setItem(MODE_KEY, 'support');
    } catch (e) {}
  }

  setTimeout(init, 700);
  setTimeout(init, 2200);
  setInterval(function () {
    if (!shellReady()) return;
    ensureButton();
    if (onTechLog) {
      hideSupportCssOnly();
      forceChrome();
    }
  }, 4000);

  window.DRTechLog = { goTechLog: goTechLog, goSupport: goSupport };
})();
