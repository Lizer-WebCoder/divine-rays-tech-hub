/**
 * Divine Rays — Customer portal professional UI/UX
 * Senior polish: hierarchy, spacing, form UX, tabs, empty states
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUSTOMER_PRO_UI_V1) return;
  window.__DR_CUSTOMER_PRO_UI_V1 = 1;

  var STYLE_ID = 'dr-customer-pro-ui-css';

  var CSS = [
    '#portal-customer.active{',
    '  --dr-c-radius:16px;',
    '  --dr-c-radius-sm:10px;',
    '  --dr-c-gap:1rem;',
    '  --dr-c-accent:#8b7cf7;',
    '  --dr-c-accent-2:#6d5ef5;',
    '  --dr-c-surface:rgba(22,22,34,0.78);',
    '  --dr-c-border:rgba(139,124,247,0.22);',
    '  --dr-c-muted:#9898b0;',
    '  --dr-c-text:#eeeef6;',
    '  font-feature-settings:"ss01" on,"kern" on',
    '}',
    'html[data-theme="light"] #portal-customer.active{',
    '  --dr-c-surface:rgba(255,255,255,0.92);',
    '  --dr-c-border:rgba(109,94,245,0.2);',
    '  --dr-c-muted:#6b6b80;',
    '  --dr-c-text:#1a1a28',
    '}',
    '#portal-customer.active .customer-main,',
    '#portal-customer.active main.customer-main{',
    '  max-width:640px!important;',
    '  margin-left:auto!important;',
    '  margin-right:auto!important;',
    '  padding:0.5rem 1rem 5.5rem!important',
    '}',
    '#portal-customer.active .customer-hero,',
    '#portal-customer.active .welcome-block,',
    '#portal-customer.active h1{',
    '  text-align:center!important;',
    '  margin:0.75rem 0 0.35rem!important;',
    '  font-size:clamp(1.45rem,3.5vw,1.85rem)!important;',
    '  font-weight:700!important;',
    '  letter-spacing:-0.02em!important;',
    '  color:var(--dr-c-text)!important;',
    '  line-height:1.25!important',
    '}',
    '#portal-customer.active .customer-sub,',
    '#portal-customer.active .welcome-sub,',
    '#portal-customer.active h1 + p{',
    '  text-align:center!important;',
    '  color:var(--dr-c-muted)!important;',
    '  font-size:0.92rem!important;',
    '  margin:0 auto 1.35rem!important;',
    '  max-width:28rem!important;',
    '  line-height:1.5!important',
    '}',
    '#portal-customer.active .customer-tabs{',
    '  display:flex!important;',
    '  gap:0.35rem!important;',
    '  padding:0.35rem!important;',
    '  margin:0 auto 1.35rem!important;',
    '  width:100%!important;',
    '  max-width:640px!important;',
    '  background:rgba(0,0,0,0.28)!important;',
    '  border:1px solid var(--dr-c-border)!important;',
    '  border-radius:999px!important;',
    '  box-shadow:inset 0 1px 0 rgba(255,255,255,0.04)!important;',
    '  overflow-x:auto!important;',
    '  -webkit-overflow-scrolling:touch!important;',
    '  scrollbar-width:none!important',
    '}',
    '#portal-customer.active .customer-tabs::-webkit-scrollbar{display:none!important}',
    'html[data-theme="light"] #portal-customer.active .customer-tabs{',
    '  background:rgba(109,94,245,0.08)!important',
    '}',
    '#portal-customer.active .customer-tabs .ctab{',
    '  flex:1 1 auto!important;',
    '  min-width:max-content!important;',
    '  border:none!important;',
    '  background:transparent!important;',
    '  color:var(--dr-c-muted)!important;',
    '  font-size:0.82rem!important;',
    '  font-weight:600!important;',
    '  padding:0.55rem 0.9rem!important;',
    '  border-radius:999px!important;',
    '  cursor:pointer!important;',
    '  transition:background .15s,color .15s,box-shadow .15s!important;',
    '  white-space:nowrap!important',
    '}',
    '#portal-customer.active .customer-tabs .ctab:hover{',
    '  color:var(--dr-c-text)!important;',
    '  background:rgba(139,124,247,0.12)!important',
    '}',
    '#portal-customer.active .customer-tabs .ctab.active{',
    '  background:linear-gradient(135deg,var(--dr-c-accent),var(--dr-c-accent-2))!important;',
    '  color:#fff!important;',
    '  box-shadow:0 4px 14px rgba(109,94,245,0.35)!important',
    '}',
    '#portal-customer.active #customer-form,',
    '#portal-customer.active .ticket-form,',
    '#portal-customer.active .ctab-panel{',
    '  background:var(--dr-c-surface)!important;',
    '  border:1px solid var(--dr-c-border)!important;',
    '  border-radius:var(--dr-c-radius)!important;',
    '  padding:1.35rem 1.4rem 1.5rem!important;',
    '  box-shadow:0 12px 40px rgba(0,0,0,0.28)!important;',
    '  backdrop-filter:blur(12px)!important;',
    '  -webkit-backdrop-filter:blur(12px)!important',
    '}',
    '#portal-customer.active .ctab-panel:not(.active){display:none!important}',
    '#portal-customer.active label,',
    '#portal-customer.active .form-group label{',
    '  display:block!important;',
    '  font-size:0.78rem!important;',
    '  font-weight:600!important;',
    '  letter-spacing:0.02em!important;',
    '  color:var(--dr-c-muted)!important;',
    '  margin-bottom:0.4rem!important',
    '}',
    '#portal-customer.active .form-group{margin-bottom:1.05rem!important}',
    '#portal-customer.active input[type="text"],',
    '#portal-customer.active input[type="search"],',
    '#portal-customer.active textarea,',
    '#portal-customer.active select{',
    '  width:100%!important;',
    '  box-sizing:border-box!important;',
    '  border-radius:var(--dr-c-radius-sm)!important;',
    '  border:1px solid rgba(139,124,247,0.28)!important;',
    '  background:rgba(0,0,0,0.28)!important;',
    '  color:var(--dr-c-text)!important;',
    '  padding:0.7rem 0.9rem!important;',
    '  font-size:0.92rem!important;',
    '  line-height:1.4!important;',
    '  transition:border-color .15s,box-shadow .15s!important;',
    '  outline:none!important',
    '}',
    'html[data-theme="light"] #portal-customer.active input[type="text"],',
    'html[data-theme="light"] #portal-customer.active input[type="search"],',
    'html[data-theme="light"] #portal-customer.active textarea,',
    'html[data-theme="light"] #portal-customer.active select{',
    '  background:#fff!important;',
    '  border-color:rgba(109,94,245,0.22)!important',
    '}',
    '#portal-customer.active input:focus,',
    '#portal-customer.active textarea:focus,',
    '#portal-customer.active select:focus{',
    '  border-color:var(--dr-c-accent)!important;',
    '  box-shadow:0 0 0 3px rgba(139,124,247,0.22)!important',
    '}',
    '#portal-customer.active textarea{min-height:110px!important;resize:vertical!important}',
    '#portal-customer.active .form-row,',
    '#portal-customer.active .ticket-form .row{',
    '  display:grid!important;',
    '  grid-template-columns:1fr 1fr!important;',
    '  gap:0.85rem!important',
    '}',
    '@media (max-width:520px){',
    '  #portal-customer.active .form-row,',
    '  #portal-customer.active .ticket-form .row{grid-template-columns:1fr!important}',
    '}',
    '#portal-customer.active #customer-form button[type="submit"],',
    '#portal-customer.active .ticket-form button[type="submit"],',
    '#portal-customer.active .btn-submit-ticket{',
    '  width:100%!important;',
    '  margin-top:0.35rem!important;',
    '  padding:0.85rem 1.25rem!important;',
    '  border:none!important;',
    '  border-radius:12px!important;',
    '  font-size:0.95rem!important;',
    '  font-weight:700!important;',
    '  letter-spacing:0.01em!important;',
    '  color:#fff!important;',
    '  background:linear-gradient(135deg,var(--dr-c-accent),var(--dr-c-accent-2))!important;',
    '  box-shadow:0 8px 24px rgba(109,94,245,0.38)!important;',
    '  cursor:pointer!important;',
    '  transition:transform .12s,box-shadow .12s,filter .12s!important',
    '}',
    '#portal-customer.active #customer-form button[type="submit"]:hover,',
    '#portal-customer.active .ticket-form button[type="submit"]:hover{',
    '  filter:brightness(1.06)!important;',
    '  box-shadow:0 10px 28px rgba(109,94,245,0.45)!important;',
    '  transform:translateY(-1px)!important',
    '}',
    '#portal-customer.active #customer-form button[type="submit"]:active{',
    '  transform:translateY(0)!important',
    '}',
    '#portal-customer.active .dr-field-hint{',
    '  font-size:0.72rem!important;',
    '  color:var(--dr-c-muted)!important;',
    '  margin:-0.35rem 0 0.85rem!important;',
    '  line-height:1.35!important',
    '}',
    '#portal-customer.active .dr-feature-strip{',
    '  display:grid!important;',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:0.65rem!important;',
    '  margin-top:1.15rem!important',
    '}',
    '@media (max-width:560px){',
    '  #portal-customer.active .dr-feature-strip{grid-template-columns:1fr!important}',
    '}',
    '#portal-customer.active .dr-feature-card{',
    '  background:rgba(0,0,0,0.22)!important;',
    '  border:1px solid var(--dr-c-border)!important;',
    '  border-radius:12px!important;',
    '  padding:0.85rem 0.95rem!important;',
    '  text-align:left!important',
    '}',
    'html[data-theme="light"] #portal-customer.active .dr-feature-card{',
    '  background:rgba(109,94,245,0.05)!important',
    '}',
    '#portal-customer.active .dr-feature-card .ico{',
    '  font-size:1.1rem!important;margin-bottom:0.35rem!important',
    '}',
    '#portal-customer.active .dr-feature-card h4{',
    '  margin:0 0 0.25rem!important;',
    '  font-size:0.82rem!important;',
    '  font-weight:700!important;',
    '  color:var(--dr-c-text)!important',
    '}',
    '#portal-customer.active .dr-feature-card p{',
    '  margin:0!important;',
    '  font-size:0.75rem!important;',
    '  line-height:1.4!important;',
    '  color:var(--dr-c-muted)!important',
    '}',
    '#portal-customer.active .ticket-card,',
    '#portal-customer.active .cust-ticket-row,',
    '#portal-customer.active .my-tickets-list > *{',
    '  border-radius:12px!important;',
    '  border:1px solid var(--dr-c-border)!important;',
    '  background:rgba(0,0,0,0.2)!important;',
    '  transition:border-color .15s,background .15s!important',
    '}',
    '#portal-customer.active .ticket-card:hover,',
    '#portal-customer.active .cust-ticket-row:hover{',
    '  border-color:rgba(139,124,247,0.45)!important;',
    '  background:rgba(139,124,247,0.08)!important',
    '}',
    '#portal-customer.active .dr-empty-state{',
    '  text-align:center!important;',
    '  padding:2rem 1rem!important;',
    '  color:var(--dr-c-muted)!important',
    '}',
    '#portal-customer.active .dr-empty-state .dr-empty-ico{',
    '  font-size:2rem!important;',
    '  margin-bottom:0.5rem!important;',
    '  opacity:0.85!important',
    '}',
    '#portal-customer.active .dr-empty-state h3{',
    '  margin:0 0 0.35rem!important;',
    '  font-size:1rem!important;',
    '  color:var(--dr-c-text)!important',
    '}',
    '#portal-customer.active .dr-empty-state p{',
    '  margin:0!important;',
    '  font-size:0.85rem!important;',
    '  line-height:1.45!important',
    '}',
    '#portal-customer.active #track-form,',
    '#portal-customer.active .track-form{',
    '  display:flex!important;',
    '  gap:0.55rem!important;',
    '  flex-wrap:wrap!important',
    '}',
    '#portal-customer.active #track-form input,',
    '#portal-customer.active .track-form input{flex:1 1 180px!important}',
    '#portal-customer.active #track-form button,',
    '#portal-customer.active .track-form button{',
    '  border-radius:10px!important;',
    '  padding:0.7rem 1.1rem!important;',
    '  font-weight:600!important;',
    '  border:none!important;',
    '  background:linear-gradient(135deg,var(--dr-c-accent),var(--dr-c-accent-2))!important;',
    '  color:#fff!important;',
    '  cursor:pointer!important',
    '}',
    '#dr-tour-help{',
    '  background:rgba(22,22,34,0.85)!important;',
    '  border:1px solid var(--dr-c-border)!important;',
    '  color:#c4b5fd!important;',
    '  font-size:0.78rem!important;',
    '  font-weight:600!important;',
    '  padding:0.5rem 0.9rem!important;',
    '  box-shadow:0 6px 20px rgba(0,0,0,0.35)!important',
    '}',
    '#portal-customer.active .badge,',
    '#portal-customer.active .status-badge{',
    '  border-radius:6px!important;',
    '  font-size:0.7rem!important;',
    '  font-weight:700!important;',
    '  letter-spacing:0.03em!important;',
    '  text-transform:uppercase!important;',
    '  padding:0.2rem 0.45rem!important',
    '}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function isCustomer() {
    var pc = document.getElementById('portal-customer');
    return !!(pc && pc.classList.contains('active'));
  }

  function polishHero() {
    if (!isCustomer()) return;
    var h1 = document.querySelector('#portal-customer h1, #portal-customer .welcome-title');
    if (!h1) return;
    var next = h1.nextElementSibling;
    if (next && next.tagName === 'P' && !next.classList.contains('dr-hero-sub')) {
      next.classList.add('dr-hero-sub', 'welcome-sub');
      if (!(next.textContent || '').trim()) {
        next.textContent = 'Submit a request or manage your tickets.';
      }
    }
  }

  function polishFormHints() {
    if (!isCustomer()) return;
    var form = document.getElementById('customer-form') || document.querySelector('#portal-customer .ticket-form');
    if (!form) return;

    var titleInput = form.querySelector('#c-title, input[name="title"], input[type="text"]');
    if (titleInput && !form.querySelector('.dr-field-hint-title')) {
      var hint = document.createElement('div');
      hint.className = 'dr-field-hint dr-field-hint-title';
      hint.textContent = 'Short and clear works best — e.g. “Printer offline in Baybay branch”.';
      var group = titleInput.closest('.form-group') || titleInput.parentNode;
      if (group && group.parentNode) {
        if (titleInput.nextSibling) group.insertBefore(hint, titleInput.nextSibling);
        else group.appendChild(hint);
      }
    }

    var btn = form.querySelector('button[type="submit"]');
    if (btn && /submit ticket/i.test(btn.textContent || '')) {
      btn.textContent = 'Submit ticket';
    }
  }

  function refineFeatureCards() {
    if (!isCustomer()) return;
    document.querySelectorAll('#portal-customer .dr-feature-card h4').forEach(function (h) {
      var t = (h.textContent || '').trim();
      if (t === 'Live updates') h.textContent = 'Live status';
      if (t === 'Remote help') h.textContent = 'Remote assist';
    });
  }

  function tick() {
    injectCss();
    if (!isCustomer()) return;
    polishHero();
    polishFormHints();
    refineFeatureCards();
  }

  setTimeout(tick, 500);
  setTimeout(tick, 1500);
  setTimeout(tick, 3500);
  setInterval(function () {
    if (isCustomer()) tick();
  }, 4000);

  window.DRCustomerProUi = { refresh: tick };
})();
