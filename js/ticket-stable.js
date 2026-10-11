/**
 * Divine Rays — Ticket + avatar stable paint
 * No format flash on ticket list; avatar from cache first frame.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_STABLE >= 1) return;
  window.__DR_TICKET_STABLE = 1;

  var CSS_ID = 'dr-ticket-stable-css';
  var CSS = [
    '#portal-agent #ticket-list{',
    '  display:flex!important;flex-direction:column!important;gap:0.65rem!important;',
    '  min-height:4rem!important',
    '}',
    '#portal-agent .ticket-card{',
    '  display:grid!important;',
    '  grid-template-columns:44px 1fr auto!important;',
    '  gap:0.75rem 0.85rem!important;',
    '  align-items:center!important;',
    '  padding:0.85rem 1rem!important;',
    '  border-radius:14px!important;',
    '  box-sizing:border-box!important',
    '}',
    '#portal-agent .ticket-av{',
    '  width:40px!important;height:40px!important;min-width:40px!important;',
    '  border-radius:12px!important;display:grid!important;place-items:center!important;',
    '  font-size:0.72rem!important;font-weight:700!important;',
    '  background:linear-gradient(145deg,rgba(124,106,240,0.35),rgba(91,70,200,0.25))!important;',
    '  color:#ddd6fe!important;border:1px solid rgba(167,139,250,0.45)!important',
    '}',
    '#portal-agent .ticket-av img{',
    '  width:100%!important;height:100%!important;object-fit:cover!important;border-radius:11px!important',
    '}',
    '#portal-agent .ticket-body{min-width:0!important}',
    '#portal-agent .ticket-card h4{',
    '  margin:0 0 0.28rem!important;font-size:0.95rem!important;font-weight:650!important;',
    '  line-height:1.3!important;color:inherit!important',
    '}',
    '#portal-agent .ticket-meta{',
    '  display:flex!important;flex-wrap:wrap!important;align-items:center!important;',
    '  gap:0!important;font-size:0.78rem!important;line-height:1.45!important;',
    '  color:#8b8ba3!important',
    '}',
    '#portal-agent .ticket-meta .ticket-id{',
    '  font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;',
    '  color:#a78bfa!important;font-weight:650!important',
    '}',
    '#portal-agent .ticket-meta .meta-sep{',
    '  display:inline!important;opacity:0.45!important;margin:0 0.4rem!important;',
    '  user-select:none!important',
    '}',
    '#portal-agent .ticket-card .badges{',
    '  display:flex!important;flex-direction:column!important;align-items:flex-end!important;gap:0.35rem!important',
    '}',
    '#sidebar-avatar-chip, .sidebar-avatar-chip, #header-avatar-chip, .header-avatar-chip{',
    '  display:inline-flex!important;align-items:center!important;justify-content:center!important;',
    '  flex-shrink:0!important',
    '}',
    '#sidebar-avatar-chip, .sidebar-avatar-chip{',
    '  width:42px!important;height:42px!important;min-width:42px!important;border-radius:12px!important;overflow:hidden!important',
    '}',
    '#header-avatar-chip, .header-avatar-chip{',
    '  width:28px!important;height:28px!important;min-width:28px!important;border-radius:8px!important;overflow:hidden!important',
    '}',
    '#sidebar-avatar-chip img, .sidebar-avatar-chip img, #header-avatar-chip img, .header-avatar-chip img{',
    '  width:100%!important;height:100%!important;object-fit:cover!important;display:block!important',
    '}',
    '#sidebar-avatar-chip .avatar-fallback, .sidebar-avatar-chip .avatar-fallback,',
    '#header-avatar-chip .avatar-fallback, .header-avatar-chip .avatar-fallback{',
    '  width:100%!important;height:100%!important;display:grid!important;place-items:center!important;',
    '  font-weight:700!important;font-size:0.75rem!important',
    '}',
    'html[data-theme="light"] #portal-agent .ticket-meta{color:#6b6b80!important}',
    'html[data-theme="light"] #portal-agent .ticket-meta .ticket-id{color:#6d28d9!important}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
  }

  function readAvatarCache() {
    try {
      var raw = localStorage.getItem('dr_avatar_cache_v3');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function paintAvatarNow() {
    var cached = readAvatarCache();
    if (!cached || !cached.avatar_url) return;
    var url = cached.avatar_url;
    var name = cached.full_name || 'User';
    var letter = String(name).trim().charAt(0).toUpperCase() || '?';

    function chip(id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.querySelector('img.avatar-img[src="' + url + '"]')) return;
      el.innerHTML =
        '<img class="avatar-img" src="' +
        url +
        '" alt="" decoding="async" loading="eager" ' +
        'onerror="this.style.display=\'none\';var n=this.nextElementSibling;if(n)n.style.display=\'grid\'" />' +
        '<div class="avatar-fallback" style="display:none">' +
        letter +
        '</div>';
    }
    chip('sidebar-avatar-chip');
    chip('header-avatar-chip');
    try {
      var img = new Image();
      img.src = url;
    } catch (e2) {}
  }

  function hasTicketCache() {
    try {
      if (window.DR && typeof DR.getAllTickets === 'function') {
        var t = DR.getAllTickets();
        if (Array.isArray(t) && t.length) return true;
      }
    } catch (e) {}
    if (Array.isArray(window.allTicketsCache) && window.allTicketsCache.length) return true;
    return false;
  }

  function safeApply() {
    if (typeof window.applyTicketFilters === 'function') {
      try { window.applyTicketFilters(false); } catch (e) {}
    }
  }

  function guardTicketList() {
    var list = document.getElementById('ticket-list');
    if (!list || list.__drStableGuard) return;
    list.__drStableGuard = 1;

    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if (!desc || !desc.set) return;

    var origSet = desc.set;
    var origGet = desc.get;

    Object.defineProperty(list, 'innerHTML', {
      configurable: true,
      enumerable: true,
      get: function () { return origGet.call(this); },
      set: function (html) {
        var s = String(html || '');
        if (/Loading/i.test(s) && hasTicketCache()) {
          safeApply();
          return;
        }
        if (
          s.indexOf('ticket-card') !== -1 &&
          s.indexOf('ticket-av') === -1 &&
          typeof window.applyTicketFilters === 'function' &&
          hasTicketCache()
        ) {
          safeApply();
          return;
        }
        origSet.call(this, html);
      }
    });
  }

  function fixMetaSeps(root) {
    root = root || document.getElementById('ticket-list');
    if (!root) return;
    root.querySelectorAll('.ticket-meta').forEach(function (meta) {
      if (meta.getAttribute('data-dr-spaced') === '1') return;
      if (meta.querySelector('.meta-sep')) {
        meta.setAttribute('data-dr-spaced', '1');
        return;
      }
      var kids = Array.prototype.slice.call(meta.children);
      if (kids.length < 2) return;
      meta.innerHTML = '';
      kids.forEach(function (k, i) {
        if (i) {
          var sep = document.createElement('span');
          sep.className = 'meta-sep';
          sep.textContent = '·';
          meta.appendChild(sep);
        }
        meta.appendChild(k);
      });
      meta.setAttribute('data-dr-spaced', '1');
    });
  }

  function boot() {
    injectCss();
    paintAvatarNow();
    guardTicketList();
    fixMetaSeps();
  }

  injectCss();
  paintAvatarNow();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  setTimeout(boot, 100);
  setTimeout(boot, 500);
  setTimeout(function () {
    boot();
    if (hasTicketCache()) safeApply();
  }, 1200);

  try {
    new MutationObserver(function () {
      paintAvatarNow();
      guardTicketList();
      fixMetaSeps();
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (eObs) {}

  document.addEventListener(
    'click',
    function (e) {
      if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
        setTimeout(function () {
          injectCss();
          guardTicketList();
          if (hasTicketCache()) safeApply();
        }, 50);
      }
    },
    true
  );

  window.DRTicketStable = { refresh: boot, v: 1 };
})();
