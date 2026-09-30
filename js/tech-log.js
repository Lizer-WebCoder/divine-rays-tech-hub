/**
 * Divine Rays Tech Log — Phase 1: mode switch + empty shell
 * Borrow & Return (UI only — no DB yet)
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TECH_LOG_V1) return;
  window.__DR_TECH_LOG_V1 = 1;

  var MODE_KEY = 'dr_app_mode';
  var MODE_SUPPORT = 'support';
  var MODE_TECHLOG = 'techlog';

  var CSS = [
    '#dr-tech-log-root{display:none;min-height:calc(100vh - 49px);padding:1.25rem 1.5rem 2rem;box-sizing:border-box;position:relative;z-index:5}',
    'body.dr-mode-techlog #dr-tech-log-root{display:block!important}',
    'body.dr-mode-techlog #portal-agent,',
    'body.dr-mode-techlog #portal-customer{',
    'display:none!important;visibility:hidden!important;pointer-events:none!important;',
    'height:0!important;overflow:hidden!important}',
    'body.dr-mode-techlog .mode-brand strong{letter-spacing:0.01em}',
    '#btn-switch-techlog,#btn-switch-support{',
    'border-radius:999px!important;font-weight:600!important;font-size:0.78rem!important;',
    'padding:0.35rem 0.85rem!important;white-space:nowrap!important;cursor:pointer!important}',
    '#btn-switch-techlog{',
    'background:linear-gradient(135deg,#7c6af0,#5b4ce0)!important;color:#fff!important;',
    'border:none!important}',
    '#btn-switch-support{',
    'background:rgba(109,94,245,0.15)!important;color:#c4b5fd!important;',
    'border:1px solid rgba(167,139,250,0.35)!important}',
    'html[data-theme="light"] #btn-switch-support{color:#5b4ce0!important;background:rgba(109,94,245,0.1)!important}',
    '.dr-tl-shell{max-width:960px;margin:0 auto}',
    '.dr-tl-hero{',
    'background:rgba(26,26,36,0.72);border:1px solid rgba(139,124,247,0.22);',
    'border-radius:16px;padding:1.5rem 1.35rem;margin-bottom:1.25rem;',
    'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}',
    'html[data-theme="light"] .dr-tl-hero{background:rgba(255,255,255,0.85);border-color:rgba(109,94,245,0.2)}',
    '.dr-tl-hero h1{margin:0 0 0.35rem;font-size:1.45rem;font-weight:700;color:#eeeef6}',
    'html[data-theme="light"] .dr-tl-hero h1{color:#1a1a2e}',
    '.dr-tl-hero p{margin:0;color:#9494ae;font-size:0.92rem;line-height:1.45}',
    'html[data-theme="light"] .dr-tl-hero p{color:#5a5a78}',
    '.dr-tl-badge{',
    'display:inline-block;margin-bottom:0.65rem;padding:0.2rem 0.55rem;',
    'border-radius:6px;font-size:0.7rem;font-weight:700;letter-spacing:0.04em;',
    'text-transform:uppercase;background:rgba(109,94,245,0.2);color:#c4b5fd}',
    '.dr-tl-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.85rem}',
    '.dr-tl-card{',
    'background:rgba(26,26,36,0.65);border:1px solid rgba(139,124,247,0.18);',
    'border-radius:14px;padding:1.1rem 1rem;min-height:110px}',
    'html[data-theme="light"] .dr-tl-card{background:rgba(255,255,255,0.9);border-color:rgba(109,94,245,0.15)}',
    '.dr-tl-card h3{margin:0 0 0.4rem;font-size:0.95rem;color:#e8e8f0}',
    'html[data-theme="light"] .dr-tl-card h3{color:#1a1a2e}',
    '.dr-tl-card p{margin:0;font-size:0.82rem;color:#8b8ba3;line-height:1.4}',
    'html[data-theme="light"] .dr-tl-card p{color:#5a5a78}',
    '.dr-tl-soon{',
    'margin-top:1.25rem;padding:0.9rem 1rem;border-radius:12px;',
    'border:1px dashed rgba(167,139,250,0.35);color:#a78bfa;font-size:0.85rem;',
    'text-align:center;background:rgba(109,94,245,0.06)}',
    'html[data-theme="light"] .dr-tl-soon{color:#5b4ce0;border-color:rgba(109,94,245,0.3)}',
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

  function getMode() {
    try {
      return sessionStorage.getItem(MODE_KEY) || MODE_SUPPORT;
    } catch (e) {
      return MODE_SUPPORT;
    }
  }

  function setMode(mode) {
    try {
      sessionStorage.setItem(MODE_KEY, mode);
    } catch (e) {}
  }

  function isLoggedInShell() {
    var shell = document.getElementById('app-shell');
    if (!shell) return false;
    if (shell.hidden || shell.classList.contains('is-hidden')) return false;
    if (document.body.classList.contains('dr-logged-out')) return false;
    return true;
  }

  function ensureRoot() {
    var root = document.getElementById('dr-tech-log-root');
    if (root) return root;
    var shell = document.getElementById('app-shell');
    if (!shell) return null;
    root = document.createElement('div');
    root.id = 'dr-tech-log-root';
    root.innerHTML =
      '<div class="dr-tl-shell">' +
      '<div class="dr-tl-hero">' +
      '<span class="dr-tl-badge">Divine Rays Tech Log</span>' +
      '<h1>Borrow & Return</h1>' +
      '<p>Track equipment check-out and return across branches. This is the Tech Log shell — asset lists and borrow records come next.</p>' +
      '</div>' +
      '<div class="dr-tl-grid">' +
      '<div class="dr-tl-card"><h3>My borrows</h3><p>Items you currently have checked out. Coming in the next phase.</p></div>' +
      '<div class="dr-tl-card"><h3>Open loans</h3><p>Staff view of all active borrows. Coming soon.</p></div>' +
      '<div class="dr-tl-card"><h3>Asset inventory</h3><p>Catalog of devices and tools available to borrow. Coming soon.</p></div>' +
      '</div>' +
      '<div class="dr-tl-soon">Phase 1 — UI shell only. Database tables will be added next.</div>' +
      '</div>';
    var bar = shell.querySelector('.mode-bar');
    if (bar && bar.nextSibling) {
      shell.insertBefore(root, bar.nextSibling);
    } else {
      shell.appendChild(root);
    }
    return root;
  }

  function ensureButtons() {
    var bar = document.querySelector('#app-shell .mode-bar .user-info') ||
      document.querySelector('.mode-bar .user-info');
    if (!bar) return;

    if (!document.getElementById('btn-switch-techlog')) {
      var b1 = document.createElement('button');
      b1.type = 'button';
      b1.id = 'btn-switch-techlog';
      b1.textContent = 'Switch to Tech Log';
      b1.title = 'Divine Rays Tech Log — Borrow & Return';
      b1.addEventListener('click', function (e) {
        e.preventDefault();
        applyMode(MODE_TECHLOG);
      });
      bar.insertBefore(b1, bar.firstChild);
    }

    if (!document.getElementById('btn-switch-support')) {
      var b2 = document.createElement('button');
      b2.type = 'button';
      b2.id = 'btn-switch-support';
      b2.textContent = 'Back to Support';
      b2.title = 'Divine Rays Tech Hub — Support tickets';
      b2.addEventListener('click', function (e) {
        e.preventDefault();
        applyMode(MODE_SUPPORT);
      });
      bar.insertBefore(b2, bar.firstChild);
    }
  }

  function updateBrand(mode) {
    var strong = document.querySelector('.mode-bar .mode-brand strong');
    if (!strong) return;
    if (mode === MODE_TECHLOG) {
      strong.textContent = 'Divine Rays Tech Log';
    } else {
      strong.textContent = 'Divine Rays Tech Hub';
    }
  }

  function updateButtons(mode) {
    var toLog = document.getElementById('btn-switch-techlog');
    var toSup = document.getElementById('btn-switch-support');
    if (toLog) toLog.style.display = mode === MODE_TECHLOG ? 'none' : '';
    if (toSup) toSup.style.display = mode === MODE_TECHLOG ? '' : 'none';
  }

  function applyMode(mode) {
    if (mode !== MODE_TECHLOG) mode = MODE_SUPPORT;
    setMode(mode);
    injectCss();
    ensureRoot();
    ensureButtons();

    if (mode === MODE_TECHLOG) {
      document.body.classList.add('dr-mode-techlog');
      document.body.classList.remove('dr-mode-support');
    } else {
      document.body.classList.add('dr-mode-support');
      document.body.classList.remove('dr-mode-techlog');
    }

    updateBrand(mode);
    updateButtons(mode);

    if (mode === MODE_SUPPORT) {
      var root = document.getElementById('dr-tech-log-root');
      if (root) root.style.display = 'none';
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      if (pa) pa.style.removeProperty('display');
      if (pc) pc.style.removeProperty('display');
      if (window.DRPortalGuard && window.DRPortalGuard.sync) {
        try { window.DRPortalGuard.sync(); } catch (e) {}
      }
    } else {
      var root2 = document.getElementById('dr-tech-log-root');
      if (root2) root2.style.display = 'block';
    }

    window.DRTechLog = window.DRTechLog || {};
    window.DRTechLog.mode = mode;
  }

  function tick() {
    injectCss();
    if (!isLoggedInShell()) {
      document.body.classList.remove('dr-mode-techlog');
      return;
    }
    ensureRoot();
    ensureButtons();
    applyMode(getMode());
  }

  injectCss();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 3000);
  setInterval(function () {
    if (!isLoggedInShell()) return;
    ensureButtons();
    if (!document.getElementById('btn-switch-techlog')) ensureButtons();
    if (getMode() === MODE_TECHLOG && !document.body.classList.contains('dr-mode-techlog')) {
      applyMode(MODE_TECHLOG);
    }
  }, 2500);

  window.DRTechLog = {
    mode: getMode(),
    goTechLog: function () { applyMode(MODE_TECHLOG); },
    goSupport: function () { applyMode(MODE_SUPPORT); },
    refresh: tick
  };
})();
