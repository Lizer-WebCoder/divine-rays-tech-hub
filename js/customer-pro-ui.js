/**
 * Divine Rays — Customer portal professional UI/UX v3
 * Safe: no MutationObserver, throttled refresh only
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUSTOMER_PRO_UI_V3) return;
  window.__DR_CUSTOMER_PRO_UI_V3 = 1;

  var STYLE_ID = 'dr-customer-pro-ui-css';
  var lastSync = 0;

  var CSS = [
    'body.dr-is-customer #portal-customer,',
    '#portal-customer.active{',
    '  --dr-c-radius:16px;',
    '  --dr-c-accent:#8b7cf7;',
    '  --dr-c-accent-2:#6d5ef5;',
    '  --dr-c-surface:rgba(22,22,34,0.88);',
    '  --dr-c-border:rgba(139,124,247,0.28);',
    '  --dr-c-muted:#9898b0;',
    '  --dr-c-text:#eeeef6',
    '}',
    'html[data-theme="light"] body.dr-is-customer #portal-customer,',
    'html[data-theme="light"] #portal-customer.active{',
    '  --dr-c-surface:rgba(255,255,255,0.95);',
    '  --dr-c-border:rgba(109,94,245,0.22);',
    '  --dr-c-muted:#6b6b80;',
    '  --dr-c-text:#1a1a28',
    '}',
    'body.dr-is-customer #portal-customer,',
    '#portal-customer.active{',
    '  display:block!important;',
    '  width:100%!important;',
    '  max-width:100%!important;',
    '  margin:0!important;',
    '  padding:4.5rem 1rem 5.5rem!important;',
    '  box-sizing:border-box!important',
    '}',
    'body.dr-is-customer #portal-customer .customer-main,',
    'body.dr-is-customer #portal-customer main,',
    '#portal-customer.active .customer-main{',
    '  display:block!important;',
    '  width:100%!important;',
    '  max-width:640px!important;',
    '  margin:0 auto!important;',
    '  padding:0 0.25rem 2rem!important;',
    '  box-sizing:border-box!important',
    '}',
    'body.dr-is-customer #portal-customer h1,',
    '#portal-customer.active h1{',
    '  text-align:center!important;',
    '  margin:0.5rem 0 0.35rem!important;',
    '  font-size:clamp(1.5rem,4vw,1.9rem)!important;',
    '  font-weight:700!important;',
    '  letter-spacing:-0.025em!important;',
    '  color:var(--dr-c-text)!important',
    '}',
    'body.dr-is-customer #portal-customer h1 + p,',
    '#portal-customer.active h1 + p{',
    '  text-align:center!important;',
    '  color:var(--dr-c-muted)!important;',
    '  font-size:0.92rem!important;',
    '  margin:0 auto 1.4rem!important;',
    '  max-width:28rem!important',
    '}',
    'body.dr-is-customer #portal-customer .customer-tabs,',
    '#portal-customer.active .customer-tabs{',
    '  display:flex!important;',
    '  gap:0.3rem!important;',
    '  padding:0.3rem!important;',
    '  margin:0 auto 1.35rem!important;',
    '  width:100%!important;',
    '  max-width:640px!important;',
    '  background:rgba(0,0,0,0.32)!important;',
    '  border:1px solid var(--dr-c-border)!important;',
    '  border-radius:999px!important;',
    '  box-sizing:border-box!important;',
    '  overflow-x:auto!important',
    '}',
    'body.dr-is-customer #portal-customer .customer-tabs .ctab,',
    '#portal-customer.active .customer-tabs .ctab{',
    '  flex:1 1 auto!important;',
    '  min-width:max-content!important;',
    '  border:none!important;',
    '  background:transparent!important;',
    '  color:var(--dr-c-muted)!important;',
    '  font-size:0.8rem!important;',
    '  font-weight:600!important;',
    '  padding:0.55rem 0.85rem!important;',
    '  border-radius:999px!important;',
    '  cursor:pointer!important;',
    '  white-space:nowrap!important',
    '}',
    'body.dr-is-customer #portal-customer .customer-tabs .ctab.active,',
    '#portal-customer.active .customer-tabs .ctab.active{',
    '  background:linear-gradient(135deg,#8b7cf7,#6d5ef5)!important;',
    '  color:#fff!important;',
    '  box-shadow:0 4px 16px rgba(109,94,245,0.4)!important',
    '}',
    'body.dr-is-customer #portal-customer #customer-form,',
    'body.dr-is-customer #portal-customer .ticket-form,',
    '#portal-customer.active #customer-form,',
    '#portal-customer.active .ticket-form{',
    '  background:var(--dr-c-surface)!important;',
    '  border:1px solid var(--dr-c-border)!important;',
    '  border-radius:16px!important;',
    '  padding:1.35rem!important;',
    '  box-shadow:0 16px 48px rgba(0,0,0,0.35)!important;',
    '  width:100%!important;',
    '  box-sizing:border-box!important',
    '}',
    'body.dr-is-customer #portal-customer label,',
    '#portal-customer.active label{',
    '  display:block!important;',
    '  font-size:0.76rem!important;',
    '  font-weight:600!important;',
    '  color:var(--dr-c-muted)!important;',
    '  margin-bottom:0.4rem!important',
    '}',
    'body.dr-is-customer #portal-customer input[type="text"],',
    'body.dr-is-customer #portal-customer textarea,',
    'body.dr-is-customer #portal-customer select,',
    '#portal-customer.active input[type="text"],',
    '#portal-customer.active textarea,',
    '#portal-customer.active select{',
    '  width:100%!important;',
    '  box-sizing:border-box!important;',
    '  border-radius:10px!important;',
    '  border:1px solid rgba(139,124,247,0.32)!important;',
    '  background:rgba(0,0,0,0.32)!important;',
    '  color:var(--dr-c-text)!important;',
    '  padding:0.72rem 0.9rem!important;',
    '  font-size:0.92rem!important;',
    '  outline:none!important',
    '}',
    'html[data-theme="light"] body.dr-is-customer #portal-customer input[type="text"],',
    'html[data-theme="light"] body.dr-is-customer #portal-customer textarea,',
    'html[data-theme="light"] body.dr-is-customer #portal-customer select{',
    '  background:#fff!important',
    '}',
    'body.dr-is-customer #portal-customer input:focus,',
    'body.dr-is-customer #portal-customer textarea:focus,',
    'body.dr-is-customer #portal-customer select:focus{',
    '  border-color:#8b7cf7!important;',
    '  box-shadow:0 0 0 3px rgba(139,124,247,0.25)!important',
    '}',
    'body.dr-is-customer #portal-customer textarea{min-height:110px!important}',
    'body.dr-is-customer #portal-customer .form-row{',
    '  display:grid!important;',
    '  grid-template-columns:1fr 1fr!important;',
    '  gap:0.85rem!important',
    '}',
    '@media (max-width:520px){',
    '  body.dr-is-customer #portal-customer .form-row{grid-template-columns:1fr!important}',
    '}',
    'body.dr-is-customer #portal-customer button[type="submit"],',
    '#portal-customer.active button[type="submit"]{',
    '  width:100%!important;',
    '  margin-top:0.4rem!important;',
    '  padding:0.88rem 1.2rem!important;',
    '  border:none!important;',
    '  border-radius:12px!important;',
    '  font-size:0.95rem!important;',
    '  font-weight:700!important;',
    '  color:#fff!important;',
    '  background:linear-gradient(135deg,#8b7cf7,#6d5ef5)!important;',
    '  box-shadow:0 8px 28px rgba(109,94,245,0.42)!important;',
    '  cursor:pointer!important',
    '}',
    'body.dr-is-customer #portal-customer .dr-field-hint{',
    '  font-size:0.72rem!important;',
    '  color:var(--dr-c-muted)!important;',
    '  margin:0.35rem 0 0.85rem!important',
    '}',
    'body.dr-is-customer #portal-customer .dr-feature-strip{',
    '  display:grid!important;',
    '  grid-template-columns:repeat(3,1fr)!important;',
    '  gap:0.6rem!important;',
    '  margin-top:1.1rem!important',
    '}',
    '@media (max-width:560px){',
    '  body.dr-is-customer #portal-customer .dr-feature-strip{grid-template-columns:1fr!important}',
    '}',
    'body.dr-is-customer #portal-customer .dr-feature-card{',
    '  background:rgba(0,0,0,0.25)!important;',
    '  border:1px solid var(--dr-c-border)!important;',
    '  border-radius:12px!important;',
    '  padding:0.85rem!important',
    '}',
    'body.dr-is-customer #portal-customer .dr-feature-card h4{',
    '  margin:0 0 0.25rem!important;font-size:0.82rem!important;font-weight:700!important;color:var(--dr-c-text)!important',
    '}',
    'body.dr-is-customer #portal-customer .dr-feature-card p{',
    '  margin:0!important;font-size:0.74rem!important;color:var(--dr-c-muted)!important',
    '}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    if (el.textContent !== CSS) el.textContent = CSS;
  }

  function isCustomerView() {
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (!pc) return false;
    if (pa && pa.classList.contains('active')) return false;
    if (pc.classList.contains('active')) return true;
    try {
      var st = window.getComputedStyle(pc);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      if (pc.offsetHeight > 30) return true;
    } catch (e) {}
    return !!document.getElementById('customer-form');
  }

  function syncBodyClass() {
    try {
      var on = isCustomerView();
      if (on) document.body.classList.add('dr-is-customer');
      else document.body.classList.remove('dr-is-customer');
    } catch (e) {}
  }

  function polishForm() {
    if (!isCustomerView()) return;
    var form = document.getElementById('customer-form');
    if (!form || form.querySelector('.dr-field-hint-title')) return;
    var titleInput = form.querySelector('#c-title') || form.querySelector('input[type="text"]');
    if (!titleInput || !titleInput.parentNode) return;
    var hint = document.createElement('div');
    hint.className = 'dr-field-hint dr-field-hint-title';
    hint.textContent = 'Keep it short — e.g. “Printer offline at Baybay branch”.';
    if (titleInput.nextSibling) titleInput.parentNode.insertBefore(hint, titleInput.nextSibling);
    else titleInput.parentNode.appendChild(hint);
  }

  function tick() {
    var now = Date.now();
    if (now - lastSync < 800) return;
    lastSync = now;
    injectCss();
    syncBodyClass();
    polishForm();
  }

  injectCss();
  setTimeout(tick, 500);
  setTimeout(tick, 2000);
  setTimeout(tick, 5000);
  setInterval(tick, 5000);

  window.DRCustomerProUi = { refresh: tick, v: 3 };
})();
