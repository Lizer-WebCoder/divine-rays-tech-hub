/**
 * Divine Rays — ticket list spacing (force) + initials chip
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_LIST_FIX) {
    try { delete window.__DR_TICKET_LIST_FIX; } catch (e) {}
  }
  window.__DR_TICKET_LIST_FIX = 1;

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
    var parts = name.split(/[\s@._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function ensureChip(card, label) {
    var chip = card.querySelector('.ticket-av');
    if (!chip) {
      chip = document.createElement('div');
      chip.className = 'ticket-av';
      card.insertBefore(chip, card.firstChild);
    }
    chip.textContent = label;
    return chip;
  }

  function spaceMeta(meta) {
    if (!meta || meta.getAttribute('data-dr-spaced') === '1') return;
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

  function polish() {
    injectCss();
    document.querySelectorAll('.ticket-card').forEach(function (card) {
      var meta = card.querySelector('.ticket-meta');
      if (meta && !meta.querySelector('.meta-sep')) {
        meta.removeAttribute('data-dr-spaced');
      }

      var requester = '';
      if (meta) {
        var spans = meta.querySelectorAll('span');
        if (spans.length >= 2 && !(spans[1].textContent || '').match(/^DR-/i)) {
          requester = (spans[1].textContent || '').trim();
        }
      }

      Array.prototype.slice.call(card.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          var t = (node.textContent || '').trim();
          if (/^[A-Za-z]{1,3}$/.test(t)) {
            ensureChip(card, t.toUpperCase());
            node.textContent = '';
          }
        }
      });
      var first = card.firstElementChild;
      if (first && first.children.length === 0 && !first.classList.contains('ticket-av') && !first.classList.contains('badges')) {
        var only = (first.textContent || '').trim();
        if (/^[A-Za-z]{1,3}$/.test(only)) {
          first.className = 'ticket-av';
          first.textContent = only.toUpperCase();
        }
      }
      if (!card.querySelector('.ticket-av') && requester) {
        ensureChip(card, initialsFrom(requester));
      }

      if (meta) spaceMeta(meta);
    });
  }

  injectCss();
  polish();
  setInterval(polish, 1500);
  var list = document.getElementById('ticket-list');
  if (list) {
    try {
      new MutationObserver(function () { polish(); }).observe(list, { childList: true, subtree: true });
    } catch (e) {}
  }
  window.DRTicketListFix = { refresh: polish };
})();
