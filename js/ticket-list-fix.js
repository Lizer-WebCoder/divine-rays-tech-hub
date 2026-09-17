/**
 * Divine Rays — ticket list meta spacing + avatar chip polish
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_LIST_FIX) return;
  window.__DR_TICKET_LIST_FIX = 1;

  var CSS = [
    '.ticket-meta{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:0.35rem 0.55rem!important;margin-top:0.3rem!important;font-size:0.8rem!important;color:var(--text-muted,#9898b0)!important;line-height:1.35!important}',
    '.ticket-meta > span{display:inline-flex!important;align-items:center!important;max-width:100%;word-break:break-word}',
    '.ticket-meta > span:not(:last-child)::after{content:"·";margin-left:0.55rem;opacity:0.45;font-weight:700}',
    '.ticket-meta .ticket-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;color:var(--accent,#a78bfa)!important;font-weight:600!important}',
    '.ticket-meta .ticket-id::after{content:none!important}',
    '.ticket-card{display:grid!important;grid-template-columns:auto 1fr auto!important;gap:0.75rem 0.9rem!important;align-items:start!important;padding:0.9rem 1.1rem!important}',
    '.ticket-card h4{margin:0 0 0.15rem!important;font-size:0.95rem!important;font-weight:600!important;line-height:1.3!important}',
    '.ticket-card .badges{display:flex!important;flex-direction:column!important;gap:0.35rem!important;align-items:flex-end!important}',
    '.ticket-card .ticket-av,.ticket-card .req-av,.ticket-card > .avatar-fallback,.ticket-card > .av,.ticket-card .list-avatar{width:36px!important;height:36px!important;min-width:36px!important;border-radius:50%!important;display:grid!important;place-items:center!important;font-size:0.72rem!important;font-weight:700!important;background:rgba(124,106,240,0.2)!important;color:#c4b5fd!important;border:1px solid rgba(124,106,240,0.35)!important;letter-spacing:0.02em;flex-shrink:0;margin-top:0.15rem}',
    '.ticket-list{display:flex!important;flex-direction:column!important;gap:0.55rem!important}',
    'html[data-theme="light"] .ticket-meta{color:#6b6b80!important}',
    'html[data-theme="light"] .ticket-meta .ticket-id{color:#6d5ce7!important}',
    'html[data-theme="light"] .ticket-card .ticket-av,html[data-theme="light"] .ticket-card .avatar-fallback{background:rgba(124,106,240,0.12)!important;color:#5b4fd6!important}'
  ].join('\n');

  function inject() {
    var id = 'dr-ticket-list-fix-css';
    var s = document.getElementById(id);
    if (!s) {
      s = document.createElement('style');
      s.id = id;
      document.head.appendChild(s);
    }
    s.textContent = CSS;
  }

  function polishCards() {
    document.querySelectorAll('.ticket-card').forEach(function (card) {
      Array.prototype.slice.call(card.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          var txt = (node.textContent || '').trim();
          if (/^[A-Za-z]{1,2}$/.test(txt)) {
            var chip = document.createElement('div');
            chip.className = 'ticket-av';
            chip.textContent = txt.toUpperCase();
            card.insertBefore(chip, card.firstChild);
            node.textContent = '';
          }
        }
      });
      var first = card.firstElementChild;
      if (
        first &&
        !first.classList.contains('ticket-av') &&
        !first.classList.contains('badges') &&
        first.children.length === 0
      ) {
        var only = (first.textContent || '').trim();
        if (/^[A-Za-z]{1,2}$/.test(only)) {
          first.className = 'ticket-av';
          first.textContent = only.toUpperCase();
        }
      }
    });
  }

  inject();
  polishCards();
  setInterval(function () {
    inject();
    polishCards();
  }, 2000);
  window.DRTicketListFix = { refresh: polishCards };
})();
