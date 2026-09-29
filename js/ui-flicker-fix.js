/**
 * Divine Rays — fix flickering comment Delete + single FAQ chevron
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_UI_FLICKER_FIX) return;
  window.__DR_UI_FLICKER_FIX = 1;

  var CSS = [
    '.comment{position:relative!important}',
    '.comment .dr-cdel,',
    '.comment button.dr-cdel,',
    'button.dr-cdel{',
    'position:absolute!important;',
    'top:0.55rem!important;',
    'right:0.55rem!important;',
    'left:auto!important;',
    'display:inline-flex!important;',
    'align-items:center!important;',
    'justify-content:center!important;',
    'margin:0!important;',
    'appearance:none!important;',
    '-webkit-appearance:none!important;',
    'background:transparent!important;',
    'border:1px solid rgba(239,68,68,0.4)!important;',
    'color:#f87171!important;',
    'border-radius:8px!important;',
    'padding:0.2rem 0.55rem!important;',
    'font-size:0.72rem!important;',
    'font-weight:600!important;',
    'line-height:1.2!important;',
    'cursor:pointer!important;',
    'opacity:0.9!important;',
    'box-shadow:none!important;',
    'transform:none!important;',
    'transition:background .15s,border-color .15s,opacity .15s!important;',
    'z-index:2!important}',
    '.comment .dr-cdel:hover,button.dr-cdel:hover{',
    'background:rgba(239,68,68,0.14)!important;',
    'border-color:rgba(239,68,68,0.65)!important;',
    'opacity:1!important}',
    'html[data-theme="light"] .comment .dr-cdel,',
    'html[data-theme="light"] button.dr-cdel{',
    'color:#dc2626!important;',
    'border-color:rgba(220,38,38,0.4)!important;',
    'background:#fff!important}',
    'html[data-theme="light"] .comment .dr-cdel:hover{',
    'background:rgba(254,226,226,0.9)!important}',
    '.comment .comment-header{padding-right:4.75rem!important}',
    '.comment button.delete-comment:not(.dr-cdel),',
    '.comment .comment-delete:not(.dr-cdel),',
    '.comment .btn-del-comment:not(.dr-cdel){display:none!important}',

    'details.kb-item > summary,',
    '#kb-faq-list details > summary,',
    '#portal-customer details.kb-item > summary,',
    '.kb-item > summary{',
    'list-style:none!important;',
    'cursor:pointer!important;',
    'position:relative!important;',
    'padding-right:1.75rem!important}',
    'details.kb-item > summary::-webkit-details-marker,',
    '#kb-faq-list details > summary::-webkit-details-marker,',
    '.kb-item > summary::-webkit-details-marker{',
    'display:none!important}',
    'details.kb-item > summary::marker,',
    '#kb-faq-list details > summary::marker,',
    '.kb-item > summary::marker{',
    'content:none!important;',
    'display:none!important;',
    'font-size:0!important}',
    'details.kb-item > summary::after,',
    '#kb-faq-list details > summary::after,',
    '.kb-item > summary::after{',
    'content:"▾"!important;',
    'position:absolute!important;',
    'right:0.85rem!important;',
    'top:50%!important;',
    'transform:translateY(-50%)!important;',
    'color:#a78bfa!important;',
    'font-size:0.95rem!important;',
    'line-height:1!important;',
    'pointer-events:none!important;',
    'opacity:0.95!important}',
    'details.kb-item[open] > summary::after,',
    '#kb-faq-list details[open] > summary::after,',
    '.kb-item[open] > summary::after{',
    'content:"▴"!important}',
    'details.kb-item > summary::before,',
    '#kb-faq-list details > summary::before,',
    '.kb-item > summary::before{',
    'content:none!important;',
    'display:none!important}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-ui-flicker-fix');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-ui-flicker-fix';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  inject();
  setTimeout(inject, 500);
  setTimeout(inject, 2000);
})();
