/**
 * Divine Rays — Ticket card design v2
 * Larger cards, header title, labeled specs with color emphasis.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_CARD_CSS >= 2) return;
  window.__DR_TICKET_CARD_CSS = 2;

  var ID = 'dr-ticket-card-css-v2';
  var CSS = [
    '#portal-agent #ticket-list{',
    '  display:flex!important;flex-direction:column!important;gap:0.85rem!important',
    '}',
    '#portal-agent .ticket-card{',
    '  display:grid!important;',
    '  grid-template-columns:52px minmax(0,1fr) auto!important;',
    '  gap:0.85rem 1rem!important;',
    '  align-items:start!important;',
    '  padding:1.05rem 1.15rem!important;',
    '  border-radius:16px!important;',
    '  min-height:5.5rem!important;',
    '  box-sizing:border-box!important;',
    '  background:rgba(22,20,38,0.72)!important;',
    '  border:1px solid rgba(167,139,250,0.18)!important;',
    '  box-shadow:0 4px 20px rgba(0,0,0,0.18)!important;',
    '  transition:border-color .15s ease, box-shadow .15s ease, transform .15s ease!important',
    '}',
    '#portal-agent .ticket-card:hover{',
    '  border-color:rgba(167,139,250,0.4)!important;',
    '  box-shadow:0 8px 28px rgba(91,70,200,0.18)!important;',
    '  transform:translateY(-1px)!important',
    '}',
    '#portal-agent .ticket-av{',
    '  width:48px!important;height:48px!important;min-width:48px!important;',
    '  border-radius:14px!important;display:grid!important;place-items:center!important;',
    '  font-size:0.82rem!important;font-weight:700!important;letter-spacing:0.02em!important;',
    '  background:linear-gradient(145deg,rgba(124,106,240,0.45),rgba(91,70,200,0.3))!important;',
    '  color:#ede9fe!important;',
    '  border:1px solid rgba(167,139,250,0.5)!important;',
    '  box-shadow:inset 0 1px 0 rgba(255,255,255,0.1),0 2px 8px rgba(91,70,200,0.25)!important;',
    '  margin-top:0.15rem!important',
    '}',
    '#portal-agent .ticket-av img{',
    '  width:100%!important;height:100%!important;object-fit:cover!important;border-radius:13px!important',
    '}',
    '#portal-agent .ticket-card .ticket-title,',
    '#portal-agent .ticket-card h3.ticket-title,',
    '#portal-agent .ticket-card h4{',
    '  margin:0 0 0.55rem!important;',
    '  font-size:1.08rem!important;',
    '  font-weight:700!important;',
    '  line-height:1.3!important;',
    '  letter-spacing:-0.015em!important;',
    '  color:#f5f3ff!important',
    '}',
    '#portal-agent .ticket-specs{',
    '  display:grid!important;',
    '  grid-template-columns:repeat(auto-fill,minmax(140px,1fr))!important;',
    '  gap:0.35rem 0.85rem!important',
    '}',
    '#portal-agent .ticket-specs .spec{',
    '  display:flex!important;flex-direction:column!important;gap:0.1rem!important;min-width:0!important',
    '}',
    '#portal-agent .ticket-specs .spec-k{',
    '  font-size:0.62rem!important;',
    '  font-weight:650!important;',
    '  letter-spacing:0.06em!important;',
    '  text-transform:uppercase!important;',
    '  color:#7c7c96!important',
    '}',
    '#portal-agent .ticket-specs .spec-v{',
    '  font-size:0.8rem!important;',
    '  font-weight:600!important;',
    '  color:#c4c4d8!important;',
    '  white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important',
    '}',
    '#portal-agent .ticket-specs .spec-code{',
    '  font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;',
    '  color:#c4b5fd!important;font-weight:700!important',
    '}',
    '#portal-agent .ticket-specs .spec-cat{color:#7dd3fc!important;font-weight:700!important}',
    '#portal-agent .ticket-specs .spec-name{color:#f0abfc!important;font-weight:700!important}',
    '#portal-agent .ticket-specs .spec-role{color:#86efac!important;font-weight:700!important}',
    '#portal-agent .ticket-specs .spec-branch{color:#fcd34d!important;font-weight:700!important}',
    '#portal-agent .ticket-specs .spec-date{color:#a5b4fc!important;font-weight:600!important}',
    '#portal-agent .ticket-card .badges{',
    '  display:flex!important;flex-direction:column!important;align-items:flex-end!important;',
    '  gap:0.4rem!important;padding-top:0.15rem!important',
    '}',
    '#portal-agent .ticket-card .badge{',
    '  border-radius:999px!important;padding:0.28rem 0.7rem!important;',
    '  font-size:0.68rem!important;font-weight:700!important;letter-spacing:0.04em!important;',
    '  text-transform:uppercase!important;white-space:nowrap!important',
    '}',
    'html[data-theme="light"] #portal-agent .ticket-card{',
    '  background:rgba(255,255,255,0.92)!important;',
    '  border-color:rgba(109,40,217,0.14)!important;',
    '  box-shadow:0 2px 12px rgba(15,10,40,0.06)!important',
    '}',
    'html[data-theme="light"] #portal-agent .ticket-card .ticket-title,',
    'html[data-theme="light"] #portal-agent .ticket-card h3.ticket-title,',
    'html[data-theme="light"] #portal-agent .ticket-card h4{color:#1e1b2e!important}',
    'html[data-theme="light"] #portal-agent .ticket-specs .spec-k{color:#8b8ba0!important}',
    'html[data-theme="light"] #portal-agent .ticket-specs .spec-code{color:#6d28d9!important}',
    'html[data-theme="light"] #portal-agent .ticket-specs .spec-cat{color:#0369a1!important}',
    'html[data-theme="light"] #portal-agent .ticket-specs .spec-name{color:#a21caf!important}',
    'html[data-theme="light"] #portal-agent .ticket-specs .spec-role{color:#15803d!important}',
    'html[data-theme="light"] #portal-agent .ticket-specs .spec-branch{color:#b45309!important}',
    'html[data-theme="light"] #portal-agent .ticket-specs .spec-date{color:#4338ca!important}',
    'html[data-theme="light"] #portal-agent .ticket-av{',
    '  background:linear-gradient(145deg,#ede9fe,#ddd6fe)!important;color:#5b21b6!important;',
    '  border-color:rgba(109,40,217,0.25)!important',
    '}'
  ].join('');

  function inject() {
    var el = document.getElementById(ID);
    if (!el) {
      el = document.createElement('style');
      el.id = ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
  }

  inject();
  setTimeout(inject, 400);
  setTimeout(inject, 1500);

  window.DRTicketCardCss = { refresh: inject, v: 2 };
})();
