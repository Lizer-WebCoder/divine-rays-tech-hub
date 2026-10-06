/**
 * Divine Rays — End-User UI polish v2
 * Fixes My Tickets card layout (broken by global ticket-list-fix).
 * Spacing, buttons, cards, forms. Scoped to #portal-customer only.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ENDUSER_UI_V2) return;
  window.__DR_ENDUSER_UI_V2 = 1;

  var STYLE_ID = 'dr-enduser-ui-css';

  var CSS = [
    '#portal-customer{',
    '  --eu-border:rgba(139,124,247,0.24);',
    '  --eu-surface:rgba(20,18,34,0.92);',
    '  --eu-surface-2:rgba(32,28,52,0.95);',
    '  --eu-text:#f0eef8;',
    '  --eu-muted:#9b9bb3;',
    '  --eu-accent:#a78bfa;',
    '  box-sizing:border-box;',
    '  padding:1.1rem 1.25rem 2rem;',
    '  max-width:920px;',
    '  margin:0 auto;',
    '  width:100%',
    '}',
    '#portal-customer *,#portal-customer *::before,#portal-customer *::after{box-sizing:border-box}',

    '#portal-customer .customer-tabs{',
    '  display:flex;flex-wrap:wrap;gap:0.35rem;',
    '  margin:0 0 1.25rem;padding:0.3rem;',
    '  background:rgba(0,0,0,0.32);',
    '  border:1px solid var(--eu-border);',
    '  border-radius:12px',
    '}',
    '#portal-customer .customer-tabs .ctab,',
    '#portal-customer .customer-tabs button{',
    '  flex:1;min-width:6.5rem;',
    '  border:none;cursor:pointer;font-family:inherit;',
    '  padding:0.55rem 0.85rem;border-radius:9px;',
    '  font-size:0.86rem;font-weight:600;',
    '  background:transparent;color:var(--eu-muted);',
    '  transition:background .15s,color .15s,box-shadow .15s',
    '}',
    '#portal-customer .customer-tabs .ctab:hover,',
    '#portal-customer .customer-tabs button:hover{',
    '  color:var(--eu-text);background:rgba(139,124,247,0.12)',
    '}',
    '#portal-customer .customer-tabs .ctab.active,',
    '#portal-customer .customer-tabs button.active{',
    '  background:linear-gradient(135deg,#7c6af0,#9b8afb);',
    '  color:#fff;box-shadow:0 4px 14px rgba(124,106,240,0.35)',
    '}',

    '#portal-customer h2,#portal-customer h3{margin:0 0 0.7rem;font-weight:700;color:var(--eu-text)}',
    '#portal-customer h2{font-size:1.2rem}',
    '#portal-customer h3{font-size:1.02rem}',
    '#portal-customer p{margin:0 0 0.7rem;color:var(--eu-muted);line-height:1.5;font-size:0.88rem}',

    '#portal-customer .ticket-form,',
    '#portal-customer .comments-section,',
    '#portal-customer .ticket-detail,',
    '#portal-customer #cust-ticket-detail,',
    '#portal-customer .track-box,',
    '#portal-customer .success-box,',
    '#portal-customer .dr-eu-faq,',
    '#portal-customer .dr-eu-csat{',
    '  background:var(--eu-surface)!important;',
    '  border:1px solid var(--eu-border)!important;',
    '  border-radius:14px!important;',
    '  padding:1.1rem 1.2rem!important;',
    '  margin-bottom:1rem!important;',
    '  box-shadow:0 8px 28px rgba(0,0,0,0.22)',
    '}',

    '#portal-customer #my-tickets-list{',
    '  display:flex!important;',
    '  flex-direction:column!important;',
    '  gap:0.75rem!important',
    '}',

    '#portal-customer #my-tickets-list .ticket-card,',
    '#portal-customer .ticket-card{',
    '  display:grid!important;',
    '  grid-template-columns:1fr auto!important;',
    '  grid-template-areas:"main badges"!important;',
    '  gap:0.75rem 1rem!important;',
    '  align-items:center!important;',
    '  padding:1rem 1.15rem!important;',
    '  margin:0!important;',
    '  background:var(--eu-surface)!important;',
    '  border:1px solid var(--eu-border)!important;',
    '  border-radius:14px!important;',
    '  box-shadow:0 4px 18px rgba(0,0,0,0.2)!important;',
    '  cursor:pointer!important;',
    '  transition:border-color .15s,box-shadow .15s,transform .12s!important;',
    '  text-align:left!important',
    '}',
    '#portal-customer #my-tickets-list .ticket-card:hover,',
    '#portal-customer .ticket-card:hover{',
    '  border-color:rgba(167,139,250,0.5)!important;',
    '  box-shadow:0 8px 24px rgba(124,106,240,0.18)!important;',
    '  transform:translateY(-1px)!important',
    '}',

    '#portal-customer #my-tickets-list .ticket-av,',
    '#portal-customer #my-tickets-list .ticket-card > img,',
    '#portal-customer #my-tickets-list .ticket-card > .avatar,',
    '#portal-customer #my-tickets-list .ticket-card > .ticket-avatar{',
    '  display:none!important',
    '}',

    '#portal-customer #my-tickets-list .ticket-card > div:not(.badges):not(.ticket-av){',
    '  grid-area:main;',
    '  min-width:0;',
    '  text-align:left!important',
    '}',
    '#portal-customer #my-tickets-list .ticket-card h4,',
    '#portal-customer #my-tickets-list .ticket-card .ticket-title{',
    '  margin:0 0 0.35rem!important;',
    '  font-size:0.98rem!important;',
    '  font-weight:650!important;',
    '  line-height:1.3!important;',
    '  color:var(--eu-text)!important;',
    '  text-align:left!important;',
    '  display:flex!important;',
    '  align-items:center!important;',
    '  flex-wrap:wrap!important;',
    '  gap:0.35rem!important',
    '}',
    '#portal-customer #my-tickets-list .ticket-meta{',
    '  display:flex!important;',
    '  flex-wrap:wrap!important;',
    '  align-items:center!important;',
    '  gap:0.25rem 0.15rem!important;',
    '  font-size:0.78rem!important;',
    '  color:var(--eu-muted)!important;',
    '  text-align:left!important',
    '}',
    '#portal-customer #my-tickets-list .ticket-meta .ticket-id{',
    '  color:var(--eu-accent)!important;',
    '  font-weight:650!important',
    '}',
    '#portal-customer #my-tickets-list .ticket-meta .meta-sep{',
    '  opacity:0.5;margin:0 0.35rem!important',
    '}',

    '#portal-customer #my-tickets-list .ticket-card .badges,',
    '#portal-customer .ticket-card .badges{',
    '  grid-area:badges;',
    '  display:flex!important;',
    '  flex-direction:column!important;',
    '  align-items:flex-end!important;',
    '  justify-content:center!important;',
    '  gap:0.35rem!important;',
    '  flex-shrink:0',
    '}',
    '#portal-customer #my-tickets-list .badge,',
    '#portal-customer .ticket-card .badge{',
    '  display:inline-flex!important;',
    '  align-items:center!important;',
    '  justify-content:center!important;',
    '  padding:0.22rem 0.6rem!important;',
    '  border-radius:999px!important;',
    '  font-size:0.7rem!important;',
    '  font-weight:700!important;',
    '  letter-spacing:0.02em!important;',
    '  text-transform:capitalize!important;',
    '  white-space:nowrap!important',
    '}',

    '#portal-customer .dr-eu-unread{',
    '  display:inline-flex!important;align-items:center!important;',
    '  padding:0.12rem 0.45rem!important;border-radius:999px!important;',
    '  background:#a78bfa!important;color:#0c0c14!important;',
    '  font-size:0.65rem!important;font-weight:800!important;margin-left:0.25rem',
    '}',

    '#portal-customer .btn,',
    '#portal-customer button.btn,',
    '#portal-customer button[type="submit"],',
    '#portal-customer #cust-reply-form button,',
    '#portal-customer #customer-form button[type="submit"]{',
    '  appearance:none;border:none;cursor:pointer;font-family:inherit;',
    '  display:inline-flex;align-items:center;justify-content:center;gap:0.4rem;',
    '  padding:0.62rem 1.15rem;border-radius:10px;',
    '  font-size:0.88rem;font-weight:650;line-height:1.2;',
    '  transition:background .15s,box-shadow .15s,transform .1s,opacity .15s',
    '}',
    '#portal-customer .btn-primary,',
    '#portal-customer button.btn-primary,',
    '#portal-customer #cust-reply-form button[type="submit"],',
    '#portal-customer #customer-form button[type="submit"]{',
    '  background:linear-gradient(135deg,#7c6af0 0%,#9b8afb 100%)!important;',
    '  color:#fff!important;',
    '  box-shadow:0 4px 16px rgba(124,106,240,0.35)',
    '}',
    '#portal-customer .btn-primary:hover{',
    '  background:linear-gradient(135deg,#8b7af5 0%,#a99aff 100%)!important',
    '}',
    '#portal-customer .btn-secondary{',
    '  background:var(--eu-surface-2)!important;',
    '  color:var(--eu-text)!important;',
    '  border:1px solid var(--eu-border)!important',
    '}',
    '#portal-customer .btn:disabled{opacity:0.55;cursor:not-allowed}',

    '#portal-customer .form-group{margin-bottom:0.9rem}',
    '#portal-customer label{display:block;margin-bottom:0.3rem;font-size:0.78rem;font-weight:600;color:var(--eu-muted)}',
    '#portal-customer input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),',
    '#portal-customer select,',
    '#portal-customer textarea{',
    '  width:100%;padding:0.62rem 0.85rem;border-radius:10px;',
    '  border:1px solid var(--eu-border);background:rgba(0,0,0,0.3);',
    '  color:var(--eu-text);font:inherit;font-size:0.9rem;outline:none',
    '}',
    '#portal-customer input:focus,#portal-customer select:focus,#portal-customer textarea:focus{',
    '  border-color:rgba(167,139,250,0.65);box-shadow:0 0 0 3px rgba(124,106,240,0.2)',
    '}',
    '#portal-customer textarea{min-height:5.25rem;resize:vertical;line-height:1.45}',
    '#portal-customer select{',
    '  appearance:none;',
    '  background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23a78bfa\' d=\'M1 1l5 5 5-5\'/%3E%3C/svg%3E");',
    '  background-repeat:no-repeat;background-position:right 0.75rem center;background-size:11px 7px;',
    '  padding-right:2rem',
    '}',
    '#portal-customer #cust-reply-form{margin-top:0.5rem;padding-top:0.85rem;border-top:1px solid rgba(139,124,247,0.15)}',
    '#portal-customer #cust-comments-list{margin-bottom:0.85rem;max-height:min(52vh,480px);overflow-y:auto}',
    '#portal-customer .meta-chip{',
    '  display:inline-flex;align-items:center;gap:0.3rem;',
    '  padding:0.28rem 0.6rem;margin:0.15rem 0.3rem 0.15rem 0;',
    '  border-radius:8px;font-size:0.74rem;',
    '  background:rgba(0,0,0,0.28);border:1px solid var(--eu-border);color:var(--eu-muted)',
    '}',
    '#portal-customer .meta-chip .meta-k{font-weight:600;color:var(--eu-accent)}',
    '#portal-customer .detail-description{',
    '  margin:0.8rem 0;padding:0.8rem 1rem;border-radius:10px;',
    '  background:rgba(0,0,0,0.24);border:1px solid rgba(139,124,247,0.12);',
    '  color:var(--eu-text);line-height:1.5;font-size:0.9rem',
    '}',
    '#portal-customer table{',
    '  width:100%;border-collapse:separate;border-spacing:0;font-size:0.86rem;',
    '  margin:0.5rem 0 1rem;border:1px solid var(--eu-border);border-radius:12px;overflow:hidden',
    '}',
    '#portal-customer th,#portal-customer td{padding:0.6rem 0.8rem;text-align:left;border-bottom:1px solid var(--eu-border)}',
    '#portal-customer th{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--eu-muted);background:rgba(0,0,0,0.22)}',
    '#portal-customer #dr-cust-ticket-toolbar{margin-bottom:1rem!important;border-radius:12px!important}',
    '#portal-customer .empty-state,#portal-customer .dr-eu-empty{',
    '  text-align:center;padding:2.1rem 1.4rem!important;border-radius:14px!important;',
    '  border:1px dashed rgba(139,124,247,0.35)!important;background:rgba(20,18,34,0.6)!important',
    '}',

    'html[data-theme="light"] #portal-customer{',
    '  --eu-border:rgba(109,94,245,0.22);--eu-surface:#ffffff;--eu-surface-2:#f5f3ff;',
    '  --eu-text:#1e1b4b;--eu-muted:#5b5675;--eu-accent:#6d5ef5',
    '}',
    'html[data-theme="light"] #portal-customer .customer-tabs{background:rgba(109,94,245,0.08)}',
    'html[data-theme="light"] #portal-customer input,',
    'html[data-theme="light"] #portal-customer select,',
    'html[data-theme="light"] #portal-customer textarea{background:#fff;color:#1e1b4b;border-color:rgba(109,94,245,0.28)}',

    '@media (max-width:640px){',
    '  #portal-customer{padding:0.8rem 0.85rem 1.6rem}',
    '  #portal-customer #my-tickets-list .ticket-card{',
    '    grid-template-columns:1fr!important;grid-template-areas:"main" "badges"!important',
    '  }',
    '  #portal-customer #my-tickets-list .ticket-card .badges{flex-direction:row!important;justify-content:flex-start!important}',
    '  #portal-customer .customer-tabs .ctab{min-width:0;padding:0.5rem 0.35rem;font-size:0.78rem}',
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

  function normalizeCards() {
    var list = document.getElementById('my-tickets-list');
    if (!list) return;
    list.querySelectorAll('.ticket-card').forEach(function (card) {
      card.querySelectorAll('.ticket-av').forEach(function (av) {
        try { av.remove(); } catch (e) {}
      });
      var badges = card.querySelector('.badges');
      Array.prototype.slice.call(card.children).forEach(function (kid) {
        if (kid === badges) return;
        if (kid.classList && kid.classList.contains('ticket-av')) return;
        kid.style.textAlign = 'left';
        kid.style.gridArea = 'main';
      });
      if (badges) badges.style.gridArea = 'badges';
    });
  }

  function run() {
    inject();
    normalizeCards();
  }

  run();
  setTimeout(run, 400);
  setTimeout(run, 1200);
  setTimeout(run, 2800);
  setInterval(function () {
    var pc = document.getElementById('portal-customer');
    if (pc && pc.classList.contains('active')) run();
  }, 4000);

  var pc = document.getElementById('portal-customer');
  if (pc) {
    try {
      new MutationObserver(function () {
        clearTimeout(window.__drEuUiT);
        window.__drEuUiT = setTimeout(run, 150);
      }).observe(pc, { childList: true, subtree: true });
    } catch (e) {}
  }

  window.DREndUserUI = { refresh: run };
})();
