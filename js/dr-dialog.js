/**
 * Divine Rays — custom confirm / alert / prompt
 * Purple glass dialogs matching the Tech Hub UI.
 * Replaces native browser dialogs app-wide.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_DIALOG_V1) return;
  window.__DR_DIALOG_V1 = 1;

  var CSS = [
    '#dr-dialog-root{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:1.25rem;box-sizing:border-box}',
    '#dr-dialog-root[hidden]{display:none!important}',
    '#dr-dialog-backdrop{position:absolute;inset:0;background:rgba(8,6,18,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
    '#dr-dialog-card{position:relative;z-index:1;width:100%;max-width:400px;border-radius:18px;padding:1.35rem 1.4rem 1.2rem;',
    'background:linear-gradient(165deg,rgba(32,28,52,.97),rgba(22,18,40,.98));',
    'border:1px solid rgba(167,139,250,.38);',
    'box-shadow:0 24px 64px rgba(0,0,0,.55),0 0 0 1px rgba(109,94,245,.12),inset 0 1px 0 rgba(255,255,255,.06);',
    'color:#eeeef6;font-family:Inter,system-ui,sans-serif;animation:drDlgIn .18s ease-out}',
    'html[data-theme="light"] #dr-dialog-card{',
    'background:linear-gradient(165deg,rgba(255,255,255,.97),rgba(245,243,255,.98));',
    'border-color:rgba(109,94,245,.32);color:#1a1625;',
    'box-shadow:0 24px 64px rgba(80,60,160,.18),0 0 0 1px rgba(109,94,245,.08)}',
    '@keyframes drDlgIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}',
    '#dr-dialog-card .dr-dlg-icon{',
    'width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;',
    'background:rgba(109,94,245,.22);border:1px solid rgba(167,139,250,.35);margin-bottom:.85rem;font-size:1.15rem}',
    'html[data-theme="light"] #dr-dialog-card .dr-dlg-icon{background:rgba(109,94,245,.12);border-color:rgba(109,94,245,.28)}',
    '#dr-dialog-card .dr-dlg-title{margin:0 0 .4rem;font-size:1.05rem;font-weight:700;letter-spacing:-.01em;color:inherit}',
    '#dr-dialog-card .dr-dlg-body{margin:0 0 1.2rem;font-size:.9rem;line-height:1.5;color:#b8b4d0;white-space:pre-wrap;word-break:break-word}',
    'html[data-theme="light"] #dr-dialog-card .dr-dlg-body{color:#5a5570}',
    '#dr-dialog-card .dr-dlg-input{',
    'width:100%;box-sizing:border-box;margin:0 0 1.1rem;padding:.55rem .75rem;border-radius:10px;',
    'border:1px solid rgba(139,124,247,.35);background:rgba(12,12,20,.55);color:#eeeef6;font:inherit;font-size:.9rem;outline:none}',
    '#dr-dialog-card .dr-dlg-input:focus{border-color:rgba(167,139,250,.7);box-shadow:0 0 0 3px rgba(109,94,245,.2)}',
    'html[data-theme="light"] #dr-dialog-card .dr-dlg-input{background:#fff;color:#1a1625;border-color:rgba(109,94,245,.28)}',
    '#dr-dialog-card .dr-dlg-actions{display:flex;justify-content:flex-end;gap:.5rem;flex-wrap:wrap}',
    '#dr-dialog-card .dr-dlg-btn{',
    'border-radius:999px;padding:.48rem 1.15rem;font-size:.82rem;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:transform .12s,opacity .12s}',
    '#dr-dialog-card .dr-dlg-btn:active{transform:scale(.97)}',
    '#dr-dialog-card .dr-dlg-btn.cancel{',
    'background:transparent;border:1px solid rgba(167,139,250,.4);color:#c4b5fd}',
    'html[data-theme="light"] #dr-dialog-card .dr-dlg-btn.cancel{color:#5b4fd4;border-color:rgba(109,94,245,.35)}',
    '#dr-dialog-card .dr-dlg-btn.cancel:hover{background:rgba(109,94,245,.12)}',
    '#dr-dialog-card .dr-dlg-btn.ok{',
    'background:linear-gradient(135deg,#7c6af0,#5b4ce0);color:#fff;',
    'box-shadow:0 4px 14px rgba(91,76,224,.4)}',
    '#dr-dialog-card .dr-dlg-btn.ok:hover{filter:brightness(1.08)}',
    '#dr-dialog-card .dr-dlg-btn.danger{',
    'background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;',
    'box-shadow:0 4px 14px rgba(220,38,38,.35)}',
    '#dr-dialog-card.dr-dlg-danger .dr-dlg-icon{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.4)}'
  ].join('');

  function injectCss() {
    if (document.getElementById('dr-dialog-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-dialog-css';
    el.textContent = CSS;
    (document.head || document.documentElement).appendChild(el);
  }

  var queue = [];
  var busy = false;

  function ensureRoot() {
    var root = document.getElementById('dr-dialog-root');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'dr-dialog-root';
    root.setAttribute('hidden', '');
    root.innerHTML =
      '<div id="dr-dialog-backdrop"></div>' +
      '<div id="dr-dialog-card" role="dialog" aria-modal="true">' +
      '<div class="dr-dlg-icon" id="dr-dialog-icon">⚡</div>' +
      '<h3 class="dr-dlg-title" id="dr-dialog-title">Confirm</h3>' +
      '<p class="dr-dlg-body" id="dr-dialog-body"></p>' +
      '<input type="text" class="dr-dlg-input" id="dr-dialog-input" hidden />' +
      '<div class="dr-dlg-actions" id="dr-dialog-actions"></div>' +
      '</div>';
    document.body.appendChild(root);
    return root;
  }

  function close() {
    var root = document.getElementById('dr-dialog-root');
    if (root) root.setAttribute('hidden', '');
    busy = false;
    if (queue.length) {
      var next = queue.shift();
      setTimeout(function () { show(next); }, 40);
    }
  }

  function show(opts) {
    injectCss();
    var root = ensureRoot();
    busy = true;

    var card = document.getElementById('dr-dialog-card');
    var icon = document.getElementById('dr-dialog-icon');
    var title = document.getElementById('dr-dialog-title');
    var body = document.getElementById('dr-dialog-body');
    var input = document.getElementById('dr-dialog-input');
    var actions = document.getElementById('dr-dialog-actions');

    card.className = opts.danger ? 'dr-dlg-danger' : '';
    icon.textContent = opts.icon || (opts.danger ? '⚠' : opts.type === 'alert' ? 'ℹ' : '⚡');
    title.textContent = opts.title || (opts.type === 'alert' ? 'Notice' : opts.type === 'prompt' ? 'Input' : 'Confirm');
    body.textContent = opts.message || '';

    if (opts.type === 'prompt') {
      input.hidden = false;
      input.value = opts.defaultValue != null ? String(opts.defaultValue) : '';
      input.placeholder = opts.placeholder || '';
    } else {
      input.hidden = true;
      input.value = '';
    }

    actions.innerHTML = '';
    var resolved = false;

    function finish(val) {
      if (resolved) return;
      resolved = true;
      close();
      if (opts.resolve) opts.resolve(val);
    }

    if (opts.type === 'alert') {
      var ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'dr-dlg-btn ok';
      ok.textContent = opts.okText || 'OK';
      ok.onclick = function () { finish(true); };
      actions.appendChild(ok);
    } else {
      var cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'dr-dlg-btn cancel';
      cancel.textContent = opts.cancelText || 'Cancel';
      cancel.onclick = function () { finish(opts.type === 'prompt' ? null : false); };
      actions.appendChild(cancel);

      var confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.className = 'dr-dlg-btn ' + (opts.danger ? 'danger' : 'ok');
      confirmBtn.textContent = opts.okText || (opts.type === 'prompt' ? 'OK' : 'OK');
      confirmBtn.onclick = function () {
        if (opts.type === 'prompt') finish(input.value);
        else finish(true);
      };
      actions.appendChild(confirmBtn);
    }

    root.removeAttribute('hidden');

    setTimeout(function () {
      if (opts.type === 'prompt') {
        try { input.focus(); input.select(); } catch (e) {}
      } else {
        var focusBtn = actions.querySelector('.dr-dlg-btn.ok, .dr-dlg-btn.danger');
        if (focusBtn) try { focusBtn.focus(); } catch (e2) {}
      }
    }, 30);

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish(opts.type === 'prompt' ? null : false);
      } else if (e.key === 'Enter' && opts.type !== 'alert') {
        if (document.activeElement === input || opts.type === 'confirm') {
          e.preventDefault();
          if (opts.type === 'prompt') finish(input.value);
          else finish(true);
        }
      }
    }
    document.addEventListener('keydown', onKey);

    var origFinish = finish;
    finish = function (val) {
      document.removeEventListener('keydown', onKey);
      origFinish(val);
    };
  }

  function enqueue(opts) {
    return new Promise(function (resolve) {
      opts.resolve = resolve;
      if (busy) queue.push(opts);
      else show(opts);
    });
  }

  function isDangerMessage(msg) {
    var s = String(msg || '').toLowerCase();
    return (
      s.indexOf('delete') !== -1 ||
      s.indexOf('remove') !== -1 ||
      s.indexOf('cannot undo') !== -1 ||
      s.indexOf('really ') !== -1 ||
      s.indexOf('permanently') !== -1
    );
  }

  function confirmAsync(message, options) {
    options = options || {};
    return enqueue({
      type: 'confirm',
      message: message,
      title: options.title || 'Confirm',
      okText: options.okText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      danger: options.danger != null ? options.danger : isDangerMessage(message),
      icon: options.icon
    });
  }

  function alertAsync(message, options) {
    options = options || {};
    return enqueue({
      type: 'alert',
      message: message,
      title: options.title || 'Notice',
      okText: options.okText || 'OK',
      icon: options.icon || 'ℹ'
    });
  }

  function promptAsync(message, defaultValue, options) {
    options = options || {};
    return enqueue({
      type: 'prompt',
      message: message,
      defaultValue: defaultValue,
      title: options.title || 'Input',
      okText: options.okText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      placeholder: options.placeholder || '',
      icon: options.icon || '✎'
    });
  }

  window.DRDialog = {
    confirm: confirmAsync,
    alert: alertAsync,
    prompt: promptAsync
  };

  var nativeConfirm = window.confirm.bind(window);
  var nativeAlert = window.alert.bind(window);
  var nativePrompt = window.prompt.bind(window);

  window.confirm = function (message) {
    var p = confirmAsync(message);
    p._drIsDialog = true;
    return p;
  };

  window.alert = function (message) {
    return alertAsync(message);
  };

  window.prompt = function (message, defaultValue) {
    return promptAsync(message, defaultValue);
  };

  window.DRDialog._native = {
    confirm: nativeConfirm,
    alert: nativeAlert,
    prompt: nativePrompt
  };
})();
