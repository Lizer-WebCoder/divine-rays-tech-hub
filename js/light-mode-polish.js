/**
 * Divine Rays — Light mode polish + sticky mode-bar
 * Restores sticky top bar (broken by force-light-bg position:relative).
 * Improves contrast for filter footer, toolbar, cards in light theme.
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LIGHT_MODE_POLISH_V1) return;
  window.__DR_LIGHT_MODE_POLISH_V1 = 1;

  var STYLE_ID = 'dr-light-mode-polish-css';

  var CSS = [
    'body.is-portal .mode-bar,body .mode-bar,.mode-bar{',
    '  position:sticky!important;top:0!important;z-index:500!important;pointer-events:auto!important',
    '}',
    'html[data-theme="light"] body.is-portal .mode-bar,html[data-theme="light"] .mode-bar{',
    '  position:sticky!important;top:0!important;z-index:500!important;',
    '  background:rgba(255,255,255,0.92)!important;',
    '  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    '  border-bottom:1px solid rgba(109,94,245,0.2)!important;',
    '  box-shadow:0 2px 12px rgba(91,33,182,0.08)',
    '}',
    'html[data-theme="dark"] .mode-bar,html:not([data-theme="light"]) .mode-bar{',
    '  background:rgba(18,16,28,0.92)!important;',
    '  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)',
    '}',
    'html[data-theme="light"] .mode-bar,html[data-theme="light"] .mode-bar .user-info,',
    'html[data-theme="light"] .mode-bar span,html[data-theme="light"] .mode-bar a{color:#1e1b4b!important}',
    'html[data-theme="light"] .mode-bar .brand,html[data-theme="light"] .mode-bar .logo-text{color:#4c1d95!important;font-weight:700}',

    'html[data-theme="light"] #dr-cust-ticket-footer{',
    '  background:rgba(255,255,255,0.95)!important;border:1px solid rgba(109,94,245,0.28)!important;',
    '  box-shadow:0 2px 10px rgba(91,33,182,0.06)',
    '}',
    'html[data-theme="light"] #dr-cust-ticket-footer .dr-ct-count{color:#5b5675!important}',
    'html[data-theme="light"] #dr-cust-ticket-footer .dr-ct-count strong{color:#5b21b6!important}',
    'html[data-theme="light"] #dr-cust-ticket-footer .dr-ct-page{color:#5b21b6!important}',
    'html[data-theme="light"] #dr-cust-ticket-footer .dr-ct-nav button{',
    '  background:#f3f0ff!important;color:#4c1d95!important;border:1px solid rgba(109,94,245,0.35)!important',
    '}',
    'html[data-theme="light"] #dr-cust-ticket-footer .dr-ct-nav button:hover:not(:disabled){background:#e9e5ff!important}',
    'html[data-theme="light"] #dr-cust-ticket-footer .dr-ct-nav button:disabled{opacity:0.45;color:#7c6f9a!important}',

    'html[data-theme="light"] #dr-cust-ticket-toolbar{',
    '  background:rgba(255,255,255,0.9)!important;border:1px solid rgba(109,94,245,0.25)!important',
    '}',
    'html[data-theme="light"] #dr-cust-ticket-toolbar label{color:#5b5675!important}',
    'html[data-theme="light"] #dr-cust-ticket-toolbar select{',
    '  background-color:#fff!important;color:#1e1b4b!important;border-color:rgba(109,94,245,0.35)!important',
    '}',

    'html[data-theme="light"] #portal-customer #my-tickets-list .ticket-card{',
    '  background:#fff!important;border:1px solid rgba(109,94,245,0.2)!important;',
    '  box-shadow:0 2px 12px rgba(91,33,182,0.06)!important',
    '}',
    'html[data-theme="light"] #portal-customer #my-tickets-list .ticket-card h4{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-customer #my-tickets-list .ticket-meta{color:#5b5675!important}',
    'html[data-theme="light"] #portal-customer #my-tickets-list .ticket-meta .ticket-id{color:#6d28d9!important}',

    'html[data-theme="light"] #portal-customer{',
    '  --eu-text:#1e1b4b;--eu-muted:#5b5675;--eu-accent:#6d28d9;--eu-surface:#ffffff;',
    '  --eu-border:rgba(109,94,245,0.22)',
    '}',
    'html[data-theme="light"] #portal-customer .empty-state{',
    '  color:#5b5675!important;background:rgba(255,255,255,0.7)!important;border-color:rgba(109,94,245,0.3)!important',
    '}',
    'html[data-theme="light"] .credit-side,html[data-theme="light"] .credit-footer{color:#7c6f9a!important}',

    'html[data-theme="light"] .comments-section{background:#fff!important;border-color:rgba(109,94,245,0.22)!important}',
    'html[data-theme="light"] .comment{background:#f7f5ff!important;border-color:rgba(109,94,245,0.2)!important}',
    'html[data-theme="light"] .comment-body{color:#1e1b4b!important}',
    'html[data-theme="light"] .comment-header strong,html[data-theme="light"] .comment-header .dr-author{color:#5b21b6!important}',
    'html[data-theme="light"] #comment-text,html[data-theme="light"] #cust-reply-text,html[data-theme="light"] .comment-form textarea{',
    '  background:#f5f3ff!important;color:#1e1b4b!important;border-color:rgba(109,94,245,0.3)!important',
    '}',

    'html[data-theme="light"] #portal-agent .ticket-card{',
    '  background:#fff!important;border-color:rgba(109,94,245,0.18)!important;color:#1e1b4b',
    '}',
    'html[data-theme="light"] #portal-agent .ticket-card h4{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-agent .ticket-meta{color:#5b5675!important}',
    'html[data-theme="light"] #portal-agent .sidebar{',
    '  background:rgba(255,255,255,0.96)!important;border-right:1px solid rgba(109,94,245,0.18)!important',
    '}',
    'html[data-theme="light"] #portal-agent .nav-btn{color:#4c1d95!important}',
    'html[data-theme="light"] #portal-agent .nav-btn.active{',
    '  background:rgba(109,94,245,0.12)!important;color:#4c1d95!important',
    '}',
  ].join('');

  function inject() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
    if (el.parentNode) el.parentNode.appendChild(el);
  }

  function enforceSticky() {
    var bar = document.querySelector('.mode-bar');
    if (!bar) return;
    bar.style.setProperty('position', 'sticky', 'important');
    bar.style.setProperty('top', '0', 'important');
    bar.style.setProperty('z-index', '500', 'important');
  }

  function run() {
    inject();
    enforceSticky();
  }

  run();
  setTimeout(run, 400);
  setTimeout(run, 1200);
  setTimeout(run, 2800);
  setInterval(run, 4000);

  try {
    new MutationObserver(function () {
      clearTimeout(window.__drLmpT);
      window.__drLmpT = setTimeout(run, 100);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  } catch (e) {}

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#btn-theme') || t.id === 'btn-theme' || (t.textContent && /light|dark/i.test(t.textContent) && t.closest('.mode-bar'))) {
      setTimeout(run, 50);
      setTimeout(run, 300);
    }
  }, true);

  window.DRLightModePolish = { refresh: run, v: 1 };
})();
