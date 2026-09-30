/**
 * Divine Rays Tech Log v5 — single mode toggle button
 * Support: "Switch to Tech Log"
 * Tech Log: "Switch to Tech Support"
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TECH_LOG_V5) return;
  window.__DR_TECH_LOG_V5 = 1;

  var MODE_KEY = 'dr_app_mode';
  var onTechLog = false;

  var CSS = [
    '#dr-tech-log-root{display:none;padding:1.25rem 1.5rem 2.5rem;box-sizing:border-box;position:relative;z-index:30;min-height:calc(100vh - 52px);background:transparent}',
    'body.dr-tl-on #dr-tech-log-root{display:block!important}',

    'body.dr-tl-on #portal-agent,',
    'body.dr-tl-on #portal-agent.active,',
    'body.dr-tl-on #portal-customer,',
    'body.dr-tl-on #portal-customer.active,',
    'body.dr-tl-on .customer-main,',
    'body.dr-tl-on .customer-header,',
    'body.dr-tl-on .main,',
    'body.dr-tl-on aside.sidebar,',
    'body.dr-tl-on .sidebar,',
    'body.dr-tl-on #dr-notif-fab,',
    'body.dr-tl-on #dr-notif-panel,',
    'body.dr-tl-on #dr-notif-panel-bd,',
    'body.dr-tl-on #dr-chat-fab,',
    'body.dr-tl-on #dr-chat-panel,',
    'body.dr-tl-on #dr-tour-fab,',
    'body.dr-tl-on #dr-tour-bd,',
    'body.dr-tl-on .help-tour-btn,',
    'body.dr-tl-on #btn-help-tour,',
    'body.dr-tl-on [id*="help-tour"],',
    'body.dr-tl-on .floating-chat,',
    'body.dr-tl-on .chat-fab{',
    'display:none!important;visibility:hidden!important;pointer-events:none!important;',
    'opacity:0!important;height:0!important;max-height:0!important;overflow:hidden!important}',

    '#btn-mode-toggle{',
    'border-radius:999px;font-weight:600;font-size:0.78rem;padding:0.35rem 0.9rem;cursor:pointer;border:none;',
    'background:linear-gradient(135deg,#7c6af0,#5b4ce0);color:#fff}',
    'body.dr-tl-on #btn-mode-toggle{',
    'background:rgba(109,94,245,0.18);color:#c4b5fd;border:1px solid rgba(167,139,250,0.4)}',
    '.dr-tl-shell{max-width:960px;margin:0 auto}',
    '.dr-tl-hero{background:rgba(26,26,36,0.88);border:1px solid rgba(139,124,247,0.28);border-radius:16px;padding:1.5rem;margin-bottom:1.25rem}',
    '.dr-tl-hero h1{margin:0 0 0.35rem;font-size:1.45rem;color:#eeeef6}',
    '.dr-tl-hero p{margin:0;color:#9494ae;font-size:0.92rem}',
    '.dr-tl-badge{display:inline-block;margin-bottom:0.6rem;padding:0.2rem 0.55rem;border-radius:6px;font-size:0.7rem;font-weight:700;text-transform:uppercase;background:rgba(109,94,245,0.28);color:#c4b5fd}',
    '.dr-tl-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.85rem}',
    '.dr-tl-card{background:rgba(26,26,36,0.8);border:1px solid rgba(139,124,247,0.22);border-radius:14px;padding:1.1rem;min-height:100px}',
    '.dr-tl-card h3{margin:0 0 0.4rem;font-size:0.95rem;color:#e8e8f0}',
    '.dr-tl-card p{margin:0;font-size:0.82rem;color:#8b8ba3}',
    '.dr-tl-soon{margin-top:1.25rem;padding:0.9rem;border-radius:12px;border:1px dashed rgba(167,139,250,0.4);color:#a78bfa;font-size:0.85rem;text-align:center}',
    '.mode-bar .user-info{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap}'
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
    var shell = document.getElementById('app-shell');
    return !!(shell && !shell.hidden && !shell.classList.contains('is-hidden'));
  }

  function hideSupportDeep() {
    var shell = document.getElementById('app-shell');
    if (shell) {
      Array.prototype.forEach.call(shell.children, function (child) {
        if (!child) return;
        if (child.id === 'dr-tech-log-root') return;
        if (child.classList && child.classList.contains('mode-bar')) return;
        child.style.setProperty('display', 'none', 'important');
        child.style.setProperty('visibility', 'hidden', 'important');
        child.setAttribute('data-dr-tl-hid', '1');
      });
    }
    ['portal-agent', 'portal-customer'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.setAttribute('data-dr-tl-hid', '1');
      }
    });
    [
      'dr-notif-fab', 'dr-notif-panel', 'dr-notif-panel-bd',
      'dr-chat-fab', 'dr-chat-panel', 'dr-tour-fab', 'dr-tour-bd',
      'btn-help-tour'
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.setProperty('display', 'none', 'important');
        el.setAttribute('data-dr-tl-hid', '1');
      }
    });
    document.querySelectorAll('.help-tour-btn, [class*="help-tour"]').forEach(function (el) {
      el.style.setProperty('display', 'none', 'important');
      el.setAttribute('data-dr-tl-hid', '1');
    });
  }

  function showSupportDeep() {
    document.querySelectorAll('[data-dr-tl-hid]').forEach(function (el) {
      el.style.removeProperty('display');
      el.style.removeProperty('visibility');
      el.removeAttribute('data-dr-tl-hid');
    });
  }

  function ensureRoot() {
    if (document.getElementById('dr-tech-log-root')) return;
    var shell = document.getElementById('app-shell');
    if (!shell) return;
    var root = document.createElement('div');
    root.id = 'dr-tech-log-root';
    root.innerHTML =
      '<div class="dr-tl-shell">' +
      '<div class="dr-tl-hero">' +
      '<span class="dr-tl-badge">Divine Rays Tech Log</span>' +
      '<h1>Borrow & Return</h1>' +
      '<p>Equipment check-out and return across branches.</p>' +
      '</div>' +
      '<div class="dr-tl-grid">' +
      '<div class="dr-tl-card"><h3>My borrows</h3><p>Your active check-outs.</p></div>' +
      '<div class="dr-tl-card"><h3>Open loans</h3><p>Staff overview of active borrows.</p></div>' +
      '<div class="dr-tl-card"><h3>Asset inventory</h3><p>Devices and tools available to borrow.</p></div>' +
      '</div>' +
      '<div class="dr-tl-soon">Support is fully hidden in this mode. Use the button above to switch back to Tech Support.</div>' +
      '</div>';
    var bar = shell.querySelector('.mode-bar');
    if (bar && bar.nextSibling) shell.insertBefore(root, bar.nextSibling);
    else shell.appendChild(root);
  }

  function syncToggleLabel() {
    var btn = document.getElementById('btn-mode-toggle');
    if (!btn) return;
    btn.textContent = onTechLog ? 'Switch to Tech Support' : 'Switch to Tech Log';
  }

  function ensureButton() {
    if (!shellReady()) return;
    var bar =
      document.querySelector('#app-shell .mode-bar .user-info') ||
      document.querySelector('.mode-bar .user-info');
    if (!bar) return;

    ['btn-switch-techlog', 'btn-switch-support'].forEach(function (id) {
      var old = document.getElementById(id);
      if (old && old.parentNode) old.parentNode.removeChild(old);
    });

    if (!document.getElementById('btn-mode-toggle')) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-mode-toggle';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (onTechLog) goSupport();
        else goTechLog();
      });
      bar.insertBefore(btn, bar.firstChild);
    }
    syncToggleLabel();
  }

  function goTechLog() {
    if (!shellReady()) return;
    try { sessionStorage.setItem(MODE_KEY, 'techlog'); } catch (e) {}
    onTechLog = true;
    injectCss();
    ensureRoot();
    ensureButton();
    document.body.classList.add('dr-tl-on');
    hideSupportDeep();
    var root = document.getElementById('dr-tech-log-root');
    if (root) {
      root.style.setProperty('display', 'block', 'important');
      root.style.setProperty('visibility', 'visible', 'important');
    }
    var brand = document.querySelector('.mode-bar .mode-brand strong');
    if (brand) brand.textContent = 'Divine Rays Tech Log';
    syncToggleLabel();
  }

  function goSupport() {
    try { sessionStorage.setItem(MODE_KEY, 'support'); } catch (e) {}
    onTechLog = false;
    document.body.classList.remove('dr-tl-on');
    showSupportDeep();
    var root = document.getElementById('dr-tech-log-root');
    if (root) root.style.display = 'none';
    var brand = document.querySelector('.mode-bar .mode-brand strong');
    if (brand) brand.textContent = 'Divine Rays Tech Hub';
    ensureButton();
    syncToggleLabel();
  }

  function init() {
    injectCss();
    if (!shellReady()) return;
    ensureButton();
    try { sessionStorage.setItem(MODE_KEY, 'support'); } catch (e) {}
    goSupport();
  }

  setTimeout(init, 800);
  setTimeout(init, 2500);
  setInterval(function () {
    if (!shellReady()) return;
    ensureButton();
    if (onTechLog) hideSupportDeep();
  }, 4000);

  window.DRTechLog = { goTechLog: goTechLog, goSupport: goSupport };
})();
