/**
 * Divine Rays — End-User UI polish v3.3
 * Inject CSS once (no thrash). Customer portal only.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ENDUSER_UI_V33) return;
  window.__DR_ENDUSER_UI_V33 = 1;

  var STYLE_ID = 'dr-enduser-ui-css';
  var cssInjected = false;

  var CSS = [
    '#portal-customer{',
    '  --eu-border:rgba(139,124,247,0.24);',
    '  --eu-surface:rgba(20,18,34,0.92);',
    '  --eu-surface-2:rgba(32,28,52,0.95);',
    '  --eu-text:#f0eef8;',
    '  --eu-muted:#9b9bb3;',
    '  --eu-accent:#a78bfa;',
    '  box-sizing:border-box;padding:1.1rem 1.25rem 2rem;max-width:920px;margin:0 auto;width:100%',
    '}',
    '#portal-customer *,#portal-customer *::before,#portal-customer *::after{box-sizing:border-box}',
    '#portal-customer .customer-tabs{display:flex;flex-wrap:wrap;gap:0.35rem;margin:0 0 1.25rem;padding:0.3rem;',
    '  background:rgba(0,0,0,0.32);border:1px solid var(--eu-border);border-radius:12px}',
    '#portal-customer .customer-tabs .ctab,#portal-customer .customer-tabs button,',
    '#portal-customer .customer-tabs .ctab.btn,#portal-customer .customer-tabs .ctab.btn-primary{',
    '  flex:1;min-width:6.5rem;border:none!important;cursor:pointer;font-family:inherit;',
    '  padding:0.55rem 0.85rem;border-radius:9px;font-size:0.86rem;font-weight:600;',
    '  background:transparent!important;color:var(--eu-muted)!important;box-shadow:none!important',
    '}',
    '#portal-customer .customer-tabs .ctab:hover{color:var(--eu-text)!important;background:rgba(139,124,247,0.12)!important}',
    '#portal-customer .customer-tabs .ctab.active,#portal-customer .customer-tabs button.active,',
    '#portal-customer .customer-tabs .ctab.active.btn-primary{',
    '  background:linear-gradient(135deg,#7c6af0,#9b8afb)!important;color:#fff!important;',
    '  box-shadow:0 4px 14px rgba(124,106,240,0.35)!important',
    '}',
    '#portal-customer .ticket-form,#portal-customer .comments-section,#portal-customer .ticket-detail,',
    '#portal-customer #cust-ticket-detail,#portal-customer .track-box,#portal-customer .success-box,',
    '#portal-customer .dr-eu-faq,#portal-customer .dr-eu-csat{',
    '  background:var(--eu-surface)!important;border:1px solid var(--eu-border)!important;',
    '  border-radius:14px!important;padding:1.1rem 1.2rem!important;margin-bottom:1rem!important;',
    '  box-shadow:0 8px 28px rgba(0,0,0,0.22)',
    '}',
    '#portal-customer #my-tickets-list{display:flex!important;flex-direction:column!important;gap:0.75rem!important}',
    '#portal-customer #my-tickets-list .ticket-card,#portal-customer .ticket-card{',
    '  display:grid!important;grid-template-columns:1fr auto!important;grid-template-areas:"main badges"!important;',
    '  gap:0.75rem 1rem!important;align-items:center!important;padding:1rem 1.15rem!important;',
    '  background:var(--eu-surface)!important;border:1px solid var(--eu-border)!important;',
    '  border-radius:14px!important;box-shadow:0 4px 18px rgba(0,0,0,0.2)!important;',
    '  cursor:pointer!important;text-align:left!important',
    '}',
    '#portal-customer #my-tickets-list .ticket-av{display:none!important}',
    '#portal-customer #my-tickets-list .ticket-card h4{margin:0 0 0.35rem!important;font-size:0.98rem!important;',
    '  font-weight:650!important;color:var(--eu-text)!important;text-align:left!important}',
    '#portal-customer #my-tickets-list .ticket-meta{display:flex!important;flex-wrap:wrap!important;gap:0.25rem!important;',
    '  font-size:0.78rem!important;color:var(--eu-muted)!important;text-align:left!important}',
    '#portal-customer #my-tickets-list .ticket-meta .ticket-id{color:var(--eu-accent)!important;font-weight:650!important}',
    '#portal-customer #my-tickets-list .ticket-card .badges{grid-area:badges;display:flex!important;flex-direction:column!important;',
    '  align-items:flex-end!important;gap:0.35rem!important}',
    '#portal-customer #my-tickets-list .badge{display:inline-flex!important;padding:0.22rem 0.6rem!important;',
    '  border-radius:999px!important;font-size:0.7rem!important;font-weight:700!important}',
    '#portal-customer #cust-comments-list,#portal-customer #cust-comments-list.dr-eu-chat{',
    '  display:flex!important;flex-direction:column!important;gap:0.7rem!important;',
    '  padding:0.35rem 0.15rem 0.5rem!important;margin-bottom:0.85rem!important;',
    '  max-height:min(52vh,480px);overflow-y:auto}',
    '#portal-customer #cust-comments-list .comment{max-width:min(88%,26rem)!important;padding:0.7rem 0.9rem!important;',
    '  border-radius:14px!important;border:1px solid rgba(139,124,247,0.22)!important;',
    '  background:rgba(26,24,42,0.88)!important;box-shadow:0 4px 14px rgba(0,0,0,0.18)!important;',
    '  align-self:flex-start!important;margin-left:0!important;margin-right:auto!important}',
    '#portal-customer #cust-comments-list .comment.dr-eu-mine{align-self:flex-end!important;margin-left:auto!important;',
    '  margin-right:0!important;background:rgba(109,94,245,0.28)!important;border-color:rgba(167,139,250,0.45)!important}',
    '#portal-customer #cust-comments-list .comment.dr-eu-theirs{align-self:flex-start!important;margin-left:0!important;margin-right:auto!important}',
    '#portal-customer #cust-comments-list .comment-header{display:flex!important;justify-content:space-between!important;',
    '  gap:0.75rem!important;font-size:0.75rem!important;opacity:0.9!important;margin-bottom:0.3rem!important}',
    '#portal-customer #cust-comments-list .comment-body{font-size:0.9rem!important;line-height:1.45!important;',
    '  white-space:pre-wrap!important;word-break:break-word!important}',
    '#portal-customer #dr-cust-ticket-toolbar select{width:auto!important;min-width:7.5rem!important;max-width:12rem!important;',
    '  -webkit-appearance:none!important;-moz-appearance:none!important;appearance:none!important;',
    '  font-size:0.8rem!important;font-weight:600!important;line-height:1.2!important}',
    '#portal-customer #dr-cust-ticket-toolbar select::-ms-expand{display:none!important}',
    '#portal-customer #kb-filter-cat{-webkit-appearance:none!important;appearance:none!important;',
    '  background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23c4b5fd\' d=\'M1 1l5 5 5-5\'/%3E%3C/svg%3E")!important;',
    '  background-repeat:no-repeat!important;background-position:right 0.65rem center!important;background-size:10px 7px!important;',
    '  padding-right:1.85rem!important;width:auto!important;max-width:16rem!important}',
    '#portal-customer #kb-filter-cat::-ms-expand{display:none!important}',
    '#portal-customer .form-group{margin-bottom:0.9rem}',
    '#portal-customer label{display:block;margin-bottom:0.3rem;font-size:0.78rem;font-weight:600;color:var(--eu-muted)}',
    '#portal-customer input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),',
    '#portal-customer select:not(#dr-ct-cat):not(#dr-ct-size):not(#kb-filter-cat),',
    '#portal-customer textarea{width:100%;padding:0.62rem 0.85rem;border-radius:10px;border:1px solid var(--eu-border);',
    '  background:rgba(0,0,0,0.3);color:var(--eu-text);font:inherit;font-size:0.9rem;outline:none}',
    '#portal-customer input:focus,#portal-customer select:not(#dr-ct-cat):not(#dr-ct-size):not(#kb-filter-cat):focus,',
    '#portal-customer textarea:focus{border-color:rgba(167,139,250,0.65);box-shadow:0 0 0 3px rgba(124,106,240,0.2)}',
    '#portal-customer textarea{min-height:5.25rem;resize:vertical;line-height:1.45}',
    '#portal-customer select:not(#dr-ct-cat):not(#dr-ct-size):not(#kb-filter-cat){appearance:none;-webkit-appearance:none;',
    '  background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23a78bfa\' d=\'M1 1l5 5 5-5\'/%3E%3C/svg%3E");',
    '  background-repeat:no-repeat;background-position:right 0.75rem center;background-size:11px 7px;padding-right:2rem}',
    '#portal-customer .btn,#portal-customer button.btn,#portal-customer button[type="submit"],',
    '#portal-customer #cust-reply-form button{appearance:none;border:none;cursor:pointer;font-family:inherit;',
    '  display:inline-flex;align-items:center;justify-content:center;padding:0.62rem 1.15rem;border-radius:10px;',
    '  font-size:0.88rem;font-weight:650}',
    '#portal-customer .btn-primary,#portal-customer button.btn-primary,',
    '#portal-customer #cust-reply-form button[type="submit"],#portal-customer #customer-form button[type="submit"]{',
    '  background:linear-gradient(135deg,#7c6af0,#9b8afb)!important;color:#fff!important;',
    '  box-shadow:0 4px 16px rgba(124,106,240,0.35)}',
    '#portal-customer .btn-secondary{background:var(--eu-surface-2)!important;color:var(--eu-text)!important;',
    '  border:1px solid var(--eu-border)!important}',
    '#portal-customer #cust-reply-form{margin-top:0.5rem;padding-top:0.85rem;border-top:1px solid rgba(139,124,247,0.15)}',
    '#portal-customer .meta-chip{display:inline-flex;padding:0.28rem 0.6rem;margin:0.15rem 0.3rem 0.15rem 0;',
    '  border-radius:8px;font-size:0.74rem;background:rgba(0,0,0,0.28);border:1px solid var(--eu-border);color:var(--eu-muted)}',
    '#portal-customer .detail-description{margin:0.8rem 0;padding:0.8rem 1rem;border-radius:10px;',
    '  background:rgba(0,0,0,0.24);border:1px solid rgba(139,124,247,0.12);color:var(--eu-text);line-height:1.5;font-size:0.9rem}',
    '#portal-customer .empty-state{text-align:center;padding:2.1rem 1.4rem!important;border-radius:14px!important;',
    '  border:1px dashed rgba(139,124,247,0.35)!important;background:rgba(20,18,34,0.6)!important}',
    'html[data-theme="light"] #portal-customer{--eu-border:rgba(109,94,245,0.22);--eu-surface:#fff;--eu-surface-2:#f5f3ff;',
    '  --eu-text:#1e1b4b;--eu-muted:#5b5675;--eu-accent:#6d5ef5}',
    '@media (max-width:640px){#portal-customer{padding:0.8rem 0.85rem 1.6rem}',
    '  #portal-customer #my-tickets-list .ticket-card{grid-template-columns:1fr!important;grid-template-areas:"main" "badges"!important}',
    '  #portal-customer #my-tickets-list .ticket-card .badges{flex-direction:row!important}}',
  ].join('');

  function inject() {
    if (cssInjected && document.getElementById(STYLE_ID)) return;
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
    cssInjected = true;
  }

  function profile() {
    try {
      if (window.DR && DR.getProfile) return DR.getProfile();
      if (window.__drProfile) return window.__drProfile;
      if (window.currentProfile) return window.currentProfile;
    } catch (e) {}
    return null;
  }

  function myNames() {
    var names = [];
    var p = profile();
    if (p) {
      if (p.id) names.push(String(p.id).toLowerCase());
      if (p.full_name) names.push(String(p.full_name).toLowerCase().trim());
      if (p.username) names.push(String(p.username).toLowerCase().trim());
      if (p.email) names.push(String(p.email).toLowerCase().trim());
      if (p.email) names.push(String(p.email).split('@')[0].toLowerCase());
    }
    return names.filter(Boolean);
  }

  function alignChat() {
    var list = document.getElementById('cust-comments-list');
    if (!list) return;
    list.classList.add('dr-eu-chat');
    var names = myNames();
    list.querySelectorAll('.comment').forEach(function (c) {
      var author = (c.getAttribute('data-author') || '').toLowerCase();
      var labelEl = c.querySelector('.comment-header .dr-author, .comment-header span:first-child');
      var label = labelEl ? (labelEl.textContent || '').replace(/\s*·.*$/, '').trim().toLowerCase() : '';
      var isMine = false;
      if (author && names.indexOf(author) !== -1) isMine = true;
      if (label && names.indexOf(label) !== -1) isMine = true;
      if (!isMine && label) {
        for (var i = 0; i < names.length; i++) {
          if (names[i] && (label === names[i] || names[i].indexOf(label) === 0 || label.indexOf(names[i]) === 0)) {
            isMine = true; break;
          }
        }
      }
      c.classList.remove('dr-eu-mine', 'dr-eu-theirs');
      c.classList.add(isMine ? 'dr-eu-mine' : 'dr-eu-theirs');
    });
  }

  function normalizeCards() {
    var list = document.getElementById('my-tickets-list');
    if (!list) return;
    list.querySelectorAll('.ticket-card').forEach(function (card) {
      card.querySelectorAll('.ticket-av').forEach(function (av) {
        try { av.remove(); } catch (e) {}
      });
    });
  }

  function fixFilterSelects() {}

  function fixTabs() {
    var panels = document.querySelectorAll('#portal-customer .ctab-panel.active, #portal-customer [id^="ctab-"].active');
    var activeName = null;
    panels.forEach(function (p) {
      var id = p.id || '';
      if (id.indexOf('ctab-') === 0) activeName = id.replace('ctab-', '');
    });
    document.querySelectorAll('#portal-customer .ctab, #portal-customer [data-ctab]').forEach(function (t) {
      var name = t.getAttribute('data-ctab') || '';
      if (activeName && name === activeName) t.classList.add('active');
      else if (activeName) t.classList.remove('active');
      if (!t.classList.contains('active')) t.classList.remove('btn-primary');
    });
  }

  function run() {
    inject();
    normalizeCards();
    alignChat();
    fixTabs();
  }

  run();
  setTimeout(run, 500);
  setTimeout(run, 1500);
  setInterval(function () {
    var pc = document.getElementById('portal-customer');
    if (pc && pc.classList.contains('active')) {
      normalizeCards();
      alignChat();
      fixTabs();
    }
  }, 8000);

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
