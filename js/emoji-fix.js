/**
 * Messenger-style emoji picker fix for Divine Rays
 */
(function () {
  'use strict';
  var EMOJIS = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','💩','🤡','👻','👽','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','👍','👎','👏','🙌','🤝','🙏','💪','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️','💕','💞','💓','💗','💖','💘','💝','🔥','⭐','✨','🎉','💯','✅','👀'];
  var mode = 'insert', slots = [];

  function tw(em) {
    try {
      var cps = [];
      for (var i = 0; i < em.length; ) {
        var cp = em.codePointAt(i);
        if (cp !== 0xfe0f) cps.push(cp.toString(16));
        i += cp > 0xffff ? 2 : 1;
      }
      return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/' + cps.join('-') + '.png';
    } catch (e) { return ''; }
  }
  function img(em, sz) {
    return '<img src="' + tw(em) + '" alt="' + em + '" width="' + (sz||28) + '" height="' + (sz||28) + '" loading="lazy"/>';
  }
  function css() {
    if (document.getElementById('dr-emoji-fix-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-emoji-fix-css';
    s.textContent = [
      '#dr-emoji-pop.dr-ms{display:none;position:absolute;bottom:calc(100% + 8px);left:.35rem;width:min(300px,calc(100% - .7rem));height:280px;background:#f0f2f5;border:none;border-radius:16px;box-shadow:0 8px 28px rgba(0,0,0,.35);z-index:50;flex-direction:column;overflow:hidden}',
      '#dr-emoji-pop.dr-ms.open{display:flex!important}',
      '#dr-emoji-pop.dr-ms .ep-hd{padding:10px 12px 6px;background:#fff;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e4e6eb}',
      '#dr-emoji-pop.dr-ms .ep-hd span{font-size:12px;font-weight:700;color:#65676b}',
      '#dr-emoji-pop.dr-ms .ep-hd button{background:0;border:0;font-size:18px;color:#65676b;cursor:pointer}',
      '#dr-emoji-pop.dr-ms .ep-slots{display:flex;gap:6px;padding:8px 12px;background:#fff;border-bottom:1px solid #e4e6eb}',
      '#dr-emoji-pop.dr-ms .ep-slots .sl{width:28px;height:28px;border-radius:50%;border:2px dashed #ccd0d5;display:grid;place-items:center;background:#f0f2f5;cursor:pointer;padding:0}',
      '#dr-emoji-pop.dr-ms .ep-slots .sl.on{border-style:solid;border-color:#0866ff}',
      '#dr-emoji-pop.dr-ms .ep-slots img{width:20px;height:20px}',
      '#dr-emoji-pop.dr-ms .ep-bd{flex:1;overflow-y:auto;padding:8px}',
      '#dr-emoji-pop.dr-ms .ep-g{display:grid;grid-template-columns:repeat(8,1fr);gap:2px}',
      '#dr-emoji-pop.dr-ms .ep-g button{background:0;border:0;border-radius:8px;cursor:pointer;padding:4px;display:grid;place-items:center}',
      '#dr-emoji-pop.dr-ms .ep-g button:hover{background:rgba(0,0,0,.06)}',
      '#dr-emoji-pop.dr-ms .ep-g img{width:28px;height:28px;display:block;pointer-events:none}',
      '#dr-emoji-pop.dr-ms .ep-ft{padding:8px 12px;background:#fff;border-top:1px solid #e4e6eb}',
      '#dr-emoji-pop.dr-ms .ep-ft button{width:100%;background:#0866ff;color:#fff;border:0;border-radius:8px;padding:8px;font-weight:700;font-size:13px;cursor:pointer}',
      'html[data-theme="dark"] #dr-emoji-pop.dr-ms{background:#242526}',
      'html[data-theme="dark"] #dr-emoji-pop.dr-ms .ep-hd,html[data-theme="dark"] #dr-emoji-pop.dr-ms .ep-slots,html[data-theme="dark"] #dr-emoji-pop.dr-ms .ep-ft{background:#3a3b3c;border-color:#4e4f50}',
      'html[data-theme="dark"] #dr-emoji-pop.dr-ms .ep-hd span{color:#b0b3b8}',
      'html[data-theme="dark"] #dr-emoji-pop.dr-ms .ep-g button:hover{background:rgba(255,255,255,.08)}'
    ].join('');
    document.head.appendChild(s);
  }
  function getReacts() {
    try {
      var a = JSON.parse(localStorage.getItem('dr_react_emojis') || 'null');
      if (Array.isArray(a) && a.length) return a.slice(0, 5);
    } catch (e) {}
    return ['❤️','😊','😢','😠','👍'];
  }
  function setReacts(arr) {
    try { localStorage.setItem('dr_react_emojis', JSON.stringify(arr)); } catch (e) {}
  }
  function paint(pop) {
    var title = mode === 'react-pick' ? 'Choose 5 reactions' : 'Emojis';
    var slotsHtml = '';
    if (mode === 'react-pick') {
      slotsHtml = '<div class="ep-slots">' + [0,1,2,3,4].map(function (i) {
        var em = slots[i] || '';
        return '<button type="button" class="sl' + (em ? ' on' : '') + '" data-sl="' + i + '">' + (em ? img(em, 20) : '') + '</button>';
      }).join('') + '</div>';
    }
    var grid = '<div class="ep-g">' + EMOJIS.map(function (em) {
      return '<button type="button" data-em="' + em + '">' + img(em, 28) + '</button>';
    }).join('') + '</div>';
    var save = mode === 'react-pick' ? '<div class="ep-ft"><button type="button" id="dr-ep-save">Save reactions</button></div>' : '';
    pop.innerHTML = '<div class="ep-hd"><span>' + title + '</span><button type="button" id="dr-ep-x">&times;</button></div>' + slotsHtml + '<div class="ep-bd">' + grid + '</div>' + save;
    pop.querySelector('#dr-ep-x').onclick = function (e) { e.stopPropagation(); pop.classList.remove('open'); };
    pop.querySelectorAll('[data-em]').forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var em = b.getAttribute('data-em');
        if (mode === 'insert') {
          var inp = document.getElementById('dr-ch-input');
          if (inp) { inp.value += em; inp.focus(); }
          pop.classList.remove('open');
        } else {
          var idx = slots.findIndex(function (s) { return !s; });
          if (idx < 0) idx = 4;
          slots = slots.map(function (s) { return s === em ? '' : s; });
          slots[idx] = em;
          paint(pop);
          pop.classList.add('open');
        }
      };
    });
    pop.querySelectorAll('[data-sl]').forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        slots[+b.getAttribute('data-sl')] = '';
        paint(pop);
        pop.classList.add('open');
      };
    });
    var sv = pop.querySelector('#dr-ep-save');
    if (sv) {
      sv.onclick = function (e) {
        e.stopPropagation();
        var f = slots.filter(Boolean).slice(0, 5);
        var d = ['❤️','😊','😢','😠','👍'];
        while (f.length < 5) f.push(d[f.length]);
        setReacts(f);
        if (window.DR && DR.toast) DR.toast('Reactions updated', 'success');
        pop.classList.remove('open');
      };
    }
  }
  function openPicker(m) {
    css();
    mode = m || 'insert';
    if (mode === 'react-pick') {
      slots = getReacts().slice(0, 5);
      while (slots.length < 5) slots.push('');
    }
    var cp = document.querySelector('#dr-chat-panel .cp');
    if (!cp) return;
    var pop = document.getElementById('dr-emoji-pop');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'dr-emoji-pop';
      cp.appendChild(pop);
    }
    pop.className = 'emoji-pop dr-ms';
    paint(pop);
    pop.classList.add('open');
  }

  function wire() {
    var btn = document.getElementById('dr-ch-emoji');
    if (btn && !btn.dataset.msWired) {
      btn.dataset.msWired = '1';
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openPicker('insert');
      };
    }
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.getAttribute && t.getAttribute('data-act') === 'cfg-react') {
        e.preventDefault();
        e.stopPropagation();
        openPicker('react-pick');
      }
    }, true);
  }

  function boot() {
    wire();
    setTimeout(wire, 1000);
    setTimeout(wire, 3000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(wire, 4000);
  window.DREmojiFix = { open: openPicker };
})();
