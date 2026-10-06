/**
 * Divine Rays — Light mode polish + fixed mode-bar (v5)
 * Moves .mode-bar under body so position:fixed sticks to the viewport while scrolling.
 * Does not remove the top bar — keeps it on screen.
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LIGHT_MODE_POLISH_V5) return;
  window.__DR_LIGHT_MODE_POLISH_V5 = 1;

  var STYLE_ID = 'dr-light-mode-polish-css';
  var BAR_H = 52;

  var CSS = [
    '.mode-bar,body .mode-bar,#app-shell .mode-bar,body.is-portal .mode-bar{',
    '  position:fixed!important;top:0!important;left:0!important;right:0!important;',
    '  width:100%!important;max-width:100vw!important;',
    '  z-index:2147483000!important;pointer-events:auto!important;',
    '  box-sizing:border-box!important;transform:none!important;margin:0!important',
    '}',
    'body.is-portal #app-shell,#app-shell.portal-ready,#app-shell:not([hidden]){',
    '  padding-top:' + BAR_H + 'px!important',
    '}',

    'html[data-theme="light"] .mode-bar{',
    '  background:rgba(255,255,255,0.96)!important;',
    '  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    '  border-bottom:1px solid rgba(109,94,245,0.22)!important;',
    '  box-shadow:0 2px 14px rgba(91,33,182,0.1)',
    '}',
    'html[data-theme="dark"] .mode-bar,html:not([data-theme="light"]) .mode-bar{',
    '  background:rgba(18,16,28,0.96)!important;',
    '  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    '  border-bottom:1px solid rgba(139,124,247,0.25)!important',
    '}',
    'html[data-theme="light"] .mode-bar,html[data-theme="light"] .mode-bar .user-info,',
    'html[data-theme="light"] .mode-bar span,html[data-theme="light"] .mode-bar a{color:#1e1b4b!important}',
    'html[data-theme="light"] .mode-bar .brand,html[data-theme="light"] .mode-bar .logo-text{color:#4c1d95!important;font-weight:700}',

    'html[data-theme="light"] #portal-customer .customer-tabs{',
    '  background:rgba(255,255,255,0.75)!important;',
    '  border:1px solid rgba(109,94,245,0.2)!important;border-radius:14px!important;',
    '  padding:0.35rem!important;gap:0.4rem!important',
    '}',
    'html[data-theme="light"] #portal-customer .customer-tabs .ctab,',
    'html[data-theme="light"] #portal-customer .customer-tabs button{',
    '  background:transparent!important;color:#5b21b6!important;',
    '  border:none!important;box-shadow:none!important',
    '}',
    'html[data-theme="light"] #portal-customer .customer-tabs .ctab:hover{',
    '  background:#f3f0ff!important;color:#4c1d95!important',
    '}',
    'html[data-theme="light"] #portal-customer .customer-tabs .ctab.active,',
    'html[data-theme="light"] #portal-customer .customer-tabs button.active{',
    '  background:linear-gradient(135deg,#7c6af0,#9b8afb)!important;color:#fff!important;',
    '  box-shadow:0 4px 14px rgba(124,106,240,0.3)!important',
    '}',

    'html[data-theme="light"] #portal-customer .dr-eu-faq{',
    '  background:#fff!important;border:1px solid rgba(109,94,245,0.22)!important;',
    '  box-shadow:0 4px 16px rgba(91,33,182,0.06)!important',
    '}',
    'html[data-theme="light"] #portal-customer .dr-eu-faq summary{color:#4c1d95!important;font-weight:700!important}',
    'html[data-theme="light"] #portal-customer .dr-eu-faq .dr-eu-faq-item{',
    '  background:#f5f3ff!important;border:1px solid rgba(109,94,245,0.18)!important;',
    '  color:#3b3560!important;border-radius:10px!important;',
    '  padding:0.7rem 0.9rem!important;margin:0.4rem 0!important',
    '}',
    'html[data-theme="light"] #portal-customer .dr-eu-faq .dr-eu-faq-item strong{color:#5b21b6!important}',

    'html[data-theme="light"] #portal-customer .track-box,',
    'html[data-theme="light"] #portal-customer .ticket-form,',
    'html[data-theme="light"] #portal-customer .ticket-detail,',
    'html[data-theme="light"] #portal-customer #cust-ticket-detail,',
    'html[data-theme="light"] #portal-customer .success-box{',
    '  background:#fff!important;border:1px solid rgba(109,94,245,0.2)!important;',
    '  box-shadow:0 4px 18px rgba(91,33,182,0.07)!important',
    '}',
    'html[data-theme="light"] #portal-customer label,',
    'html[data-theme="light"] #portal-customer .form-group label{color:#4c1d95!important;font-weight:600!important}',
    'html[data-theme="light"] #portal-customer input,',
    'html[data-theme="light"] #portal-customer select,',
    'html[data-theme="light"] #portal-customer textarea{',
    '  background:#f8f6ff!important;color:#1e1b4b!important;border:1px solid rgba(109,94,245,0.28)!important',
    '}',
    'html[data-theme="light"] #portal-customer .meta-chip{',
    '  background:#f3f0ff!important;border:1px solid rgba(109,94,245,0.25)!important;color:#4c1d95!important',
    '}',
    'html[data-theme="light"] #portal-customer .detail-description{',
    '  background:#f5f3ff!important;border:1px solid rgba(109,94,245,0.18)!important;color:#1e1b4b!important',
    '}',
    'html[data-theme="light"] #portal-customer #track-result,',
    'html[data-theme="light"] #portal-customer .track-result{',
    '  background:#fff!important;border:1px solid rgba(109,94,245,0.2)!important;',
    '  border-radius:14px!important;padding:1rem 1.15rem!important;color:#1e1b4b!important',
    '}',
    'html[data-theme="light"] #portal-customer #track-result h3,',
    'html[data-theme="light"] #portal-customer #track-result h4{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-customer .customer-header h2{color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-customer .customer-header p{color:#5b5675!important}',

    'html[data-theme="light"] #dr-cust-ticket-footer{',
    '  background:rgba(255,255,255,0.95)!important;border:1px solid rgba(109,94,245,0.28)!important',
    '}',
    'html[data-theme="light"] #dr-cust-ticket-footer .dr-ct-count{color:#5b5675!important}',
    'html[data-theme="light"] #dr-cust-ticket-footer .dr-ct-count strong{color:#5b21b6!important}',
    'html[data-theme="light"] #dr-cust-ticket-footer .dr-ct-page{color:#5b21b6!important}',
    'html[data-theme="light"] #dr-cust-ticket-footer .dr-ct-nav button{',
    '  background:#f3f0ff!important;color:#4c1d95!important;border:1px solid rgba(109,94,245,0.35)!important',
    '}',
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

  function pinBarToViewport() {
    var bars = document.querySelectorAll('.mode-bar');
    if (!bars.length) return;
    bars.forEach(function (bar) {
      if (bar.parentElement !== document.body) {
        try { document.body.appendChild(bar); } catch (e) {}
      }
      bar.style.setProperty('position', 'fixed', 'important');
      bar.style.setProperty('top', '0', 'important');
      bar.style.setProperty('left', '0', 'important');
      bar.style.setProperty('right', '0', 'important');
      bar.style.setProperty('width', '100%', 'important');
      bar.style.setProperty('z-index', '2147483000', 'important');
      bar.style.setProperty('pointer-events', 'auto', 'important');
      bar.style.setProperty('transform', 'none', 'important');
      bar.style.setProperty('margin', '0', 'important');
      var h = Math.max(bar.offsetHeight || BAR_H, 44);
      var shell = document.getElementById('app-shell');
      if (shell) shell.style.setProperty('padding-top', h + 'px', 'important');
    });
  }

  function run() {
    inject();
    pinBarToViewport();
  }

  run();
  setTimeout(run, 200);
  setTimeout(run, 800);
  setTimeout(run, 2000);
  setInterval(run, 3500);

  try {
    new MutationObserver(function () {
      clearTimeout(window.__drLmpT);
      window.__drLmpT = setTimeout(run, 60);
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });
    var shell = document.getElementById('app-shell');
    if (shell) {
      new MutationObserver(function () {
        clearTimeout(window.__drLmpT2);
        window.__drLmpT2 = setTimeout(run, 80);
      }).observe(shell, { childList: true, subtree: false, attributes: true });
    }
  } catch (e) {}

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#btn-theme') || t.id === 'btn-theme') {
      setTimeout(run, 40);
      setTimeout(run, 250);
    }
  }, true);

  window.addEventListener('resize', function () {
    clearTimeout(window.__drLmpR);
    window.__drLmpR = setTimeout(pinBarToViewport, 100);
  });

  window.DRLightModePolish = { refresh: run, v: 5 };
})();
