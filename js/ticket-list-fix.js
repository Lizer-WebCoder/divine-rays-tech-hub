/**
 * Divine Rays — ticket list spacing + avatar chip (stable, no flicker)
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_LIST_FIX_V2) return;
  window.__DR_TICKET_LIST_FIX_V2 = 1;

  var CSS = [
    '.ticket-list{display:flex!important;flex-direction:column!important;gap:0.6rem!important}',
    '.ticket-card{display:grid!important;grid-template-columns:40px 1fr auto!important;gap:0.65rem 0.85rem!important;align-items:start!important;padding:0.9rem 1.1rem!important}',
    '.ticket-card h4{margin:0 0 0.25rem!important;font-size:0.95rem!important;font-weight:600!important;line-height:1.3!important}',
    '.ticket-meta{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:0.25rem 0!important;margin-top:0.2rem!important;font-size:0.8rem!important;color:var(--text-muted,#9898b0)!important;line-height:1.4!important}',
    '.ticket-meta > span{display:inline!important;margin:0!important;padding:0!important}',
    '.ticket-meta .ticket-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;color:var(--accent,#a78bfa)!important;font-weight:600!important}',
    '.ticket-card .badges{display:flex!important;flex-wrap:wrap!important;gap:0.35rem!important;justify-content:flex-end!important}',
    '.ticket-av{width:36px!important;height:36px!important;min-width:36px!important;border-radius:50%!important;display:grid!important;place-items:center!important;font-size:0.7rem!important;font-weight:700!important;background:rgba(124,106,240,0.22)!important;color:#c4b5fd!important;border:1px solid rgba(124,106,240,0.4)!important;margin-top:0.1rem!important}',
    'html[data-theme="light"] .ticket-av{background:rgba(124,106,240,0.12)!important;color:#5b4fd6!important}',
    'html[data-theme="light"] .ticket-meta .ticket-id{color:#6d5ce7!important}'
  ].join('\n');

  function injectCss() {
    var id = 'dr-ticket-list-fix-css';
    var s = document.getElementById(id);
    if (!s) {
      s = document.createElement('style');
      s.id = id;
      document.head.appendChild(s);
    }
    s.textContent = CSS;
  }

  function initialsFrom(name) {
    name = String(name || '').trim();
    if (!name) return '?';
    var parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function ensureChip(card, initials) {
    if (card.querySelector('.ticket-av')) return;
    var av = document.createElement('div');
    av.className = 'ticket-av';
    av.textContent = initials || '?';
    card.insertBefore(av, card.firstChild);
  }

  function spaceMeta(meta) {
    if (meta.getAttribute('data-dr-spaced') === '1') return;
    var spans = Array.prototype.slice.call(meta.querySelectorAll(':scope > span'));
    if (spans.length < 2) return;
    var parts = spans.map(function (sp) {
      return { text: (sp.textContent || '').trim(), cls: sp.className };
    }).filter(function (p) { return p.text; });
    if (!parts.length) return;
    meta.innerHTML = '';
    parts.forEach(function (p, i) {
      if (i) {
        var sep = document.createElement('span');
        sep.className = 'meta-sep';
        sep.style.cssText = 'opacity:0.45;margin:0 0.4rem;font-weight:700;user-select:none';
        sep.textContent = '\u00b7';
        meta.appendChild(sep);
      }
      var el = document.createElement('span');
      if (p.cls) el.className = p.cls;
      el.textContent = p.text;
      meta.appendChild(el);
    });
    meta.setAttribute('data-dr-spaced', '1');
  }

  function polishCard(card) {
    if (card.getAttribute('data-dr-polished') === '1') return;
    var meta = card.querySelector('.ticket-meta');
    var requester = '';
    if (meta) {
      var spans = meta.querySelectorAll('span');
      for (var i = 0; i < spans.length; i++) {
        var tx = (spans[i].textContent || '').trim();
        if (tx && !/^DR-/i.test(tx) && !spans[i].classList.contains('ticket-id') && !spans[i].classList.contains('meta-sep')) {
          requester = tx;
          break;
        }
      }
    }
    if (!card.querySelector('.ticket-av') && requester) {
      ensureChip(card, initialsFrom(requester));
    }
    if (meta) spaceMeta(meta);
    card.setAttribute('data-dr-polished', '1');
  }

  var _timer = null;
  function polish() {
    injectCss();
    document.querySelectorAll('.ticket-card').forEach(polishCard);
  }

  function schedule() {
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(polish, 80);
  }

  injectCss();
  polish();
  var list = document.getElementById('ticket-list');
  if (list) {
    try {
      new MutationObserver(function () { schedule(); }).observe(list, { childList: true });
    } catch (e) {}
  }
  setInterval(polish, 8000);
  window.DRTicketListFix = { refresh: polish };
})();
