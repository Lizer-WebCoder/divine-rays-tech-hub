/**
 * Divine Rays — custom confirm / alert / prompt v2
 * Polished purple glass dialogs — spacing, centering, hierarchy fixed.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_DIALOG_V2) return;
  window.__DR_DIALOG_V2 = 1;

  var CSS = [
    '#dr-dialog-root{',
    'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;',
    'padding:1.5rem;box-sizing:border-box}',
    '#dr-dialog-root[hidden]{display:none!important}',
    '#dr-dialog-backdrop{',
    'position:absolute;inset:0;background:rgba(6,4,16,.78);',
    'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}',
    '#dr-dialog-card{',
    'position:relative;z-index:1;width:100%;max-width:380px;',
    'display:flex;flex-direction:column;align-items:stretch;',
    'border-radius:20px;padding:0;overflow:hidden;',
    'background:linear-gradient(165deg,rgba(36,30,58,.98),rgba(20,16,36,.99));',
    'border:1px solid rgba(167,139,250,.36);',
    'box-shadow:0 28px 72px rgba(0,0,0,.6),0 0 0 1px rgba(109,94,245,.1),inset 0 1px 0 rgba(255,255,255,.07);',
    'color:#eeeef6;font-family:Inter,system-ui,-apple-system,sans-serif;',
    'animation:drDlgIn .2s cubic-bezier(.22,1,.36,1)}',
    'html[data-theme="light"] #dr-dialog-card{',
    'background:linear-gradient(165deg,#ffffff,#f6f4ff);',
    'border-color:rgba(109,94,245,.28);color:#1a1625;',
    'box-shadow:0 28px 72px rgba(80,60,160,.16),0 0 0 1px rgba(109,94,245,.06)}',
    '@keyframes drDlgIn{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}',
    '#dr-dialog-card .dr-dlg-head{',
    'display:flex;flex-direction:column;align-items:center;text-align:center;',
    'padding:1.5rem 1.5rem 0}',
    '#dr-dialog-card .dr-dlg-icon{',
    'width:48px;height:48px;border-radius:14px;flex-shrink:0;',
    'display:flex;align-items:center;justify-content:center;',
    'margin:0 0 .9rem;font-size:1.35rem;line-height:1;',
    'background:rgba(109,94,245,.2);border:1px solid rgba(167,139,250,.4);',
    'box-shadow:0 4px 16px rgba(109,94,245,.15)}',
    'html[data-theme="light"] #dr-dialog-card .dr-dlg-icon{',
    'background:rgba(109,94,245,.1);border-color:rgba(109,94,245,.3)}',
    '#dr-dialog-card.dr-dlg-danger .dr-dlg-icon{',
    'background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.4);',
    'box-shadow:0 4px 16px rgba(239,68,68,.12)}',
    'html[data-theme="light"] #dr-dialog-card.dr-dlg-danger .dr-dlg-icon{',
    'background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.3)}',
    '#dr-dialog-card .dr-dlg-title{',
    'margin:0;padding:0;font-size:1.1rem;font-weight:700;letter-spacing:-.02em;',
    'line-height:1.3;color:inherit;text-align:center}',
    '#dr-dialog-card .dr-dlg-body{',
    'margin:0;padding:.65rem 1.5rem 0;font-size:.9rem;line-height:1.55;',
    'color:#a8a4c0;white-space:pre-wrap;word-break:break-word;text-align:center}',
    'html[data-theme="light"] #dr-dialog-card .dr-dlg-body{color:#5c5678}',
    '#dr-dialog-card .dr-dlg-body .dr-dlg-primary{',
    'display:block;color:#e4e0f4;font-weight:500;margin-bottom:.35rem}',
    'html[data-theme="light"] #dr-dialog-card .dr-dlg-body .dr-dlg-primary{color:#2a2540}',
    '#dr-dialog-card .dr-dlg-body .dr-dlg-hint{',
    'display:block;font-size:.82rem;color:#8b87a8;font-weight:400}',
    'html[data-theme="light"] #dr-dialog-card .dr-dlg-body .dr-dlg-hint{color:#7a7490}',
    '#dr-dialog-card .dr-dlg-input-wrap{padding:.85rem 1.5rem 0}',
    '#dr-dialog-card .dr-dlg-input{',
    'width:100%;box-sizing:border-box;margin:0;padding:.6rem .8rem;border-radius:12px;',
    'border:1px solid rgba(139,124,247,.32);background:rgba(12,12,20,.55);',
    'color:#eeeef6;font:inherit;font-size:.9rem;outline:none;text-align:left}',
    '#dr-dialog-card .dr-dlg-input:focus{',
    'border-color:rgba(167,139,250,.65);box-shadow:0 0 0 3px rgba(109,94,245,.18)}',
    'html[data-theme="light"] #dr-dialog-card .dr-dlg-input{',
    'background:#fff;color:#1a1625;border-color:rgba(109,94,245,.25)}',
    '#dr-dialog-card .dr-dlg-actions{',
    'display:flex;justify-content:center;align-items:center;gap:.65rem;',
    'padding:1.25rem 1.5rem 1.4rem;margin-top:.15rem}',
    '#dr-dialog-card .dr-dlg-btn{',
    'flex:1;max-width:140px;min-width:100px;',
    'border-radius:12px;padding:.62rem 1rem;font-size:.875rem;font-weight:600;',
    'cursor:pointer;border:none;font-family:inherit;line-height:1.2;',
    'transition:transform .12s ease,filter .12s ease,background .12s ease;',
    'text-align:center}',
    '#dr-dialog-card .dr-dlg-btn:active{transform:scale(.97)}',
    '#dr-dialog-card .dr-dlg-btn.cancel{',
    'background:rgba(255,255,255,.04);border:1px solid rgba(167,139,250,.35);color:#c4b5fd}',
    'html[data-theme="light"] #dr-dialog-card .dr-dlg-btn.cancel{',
    'background:rgba(109,94,245,.06);color:#5b4fd4;border-color:rgba(109,94,245,.3)}',
    '#dr-dialog-card .dr-dlg-btn.cancel:hover{background:rgba(109,94,245,.14)}',
    '#dr-dialog-card .dr-dlg-btn.ok{',
    'background:linear-gradient(135deg,#7c6af0,#5b4ce0);color:#fff;',
    'box-shadow:0 4px 16px rgba(91,76,224,.4)}',
    '#dr-dialog-card .dr-dlg-btn.ok:hover{filter:brightness(1.08)}',
    '#dr-dialog-card .dr-dlg-btn.danger{',
    'background:linear-gradient(135deg,#f04343,#dc2626);color:#fff;',
    'box-shadow:0 4px 16px rgba(220,38,38,.38)}',
    '#dr-dialog-card .dr-dlg-btn.danger:hover{filter:brightness(1.08)}',
    '#dr-dialog-card .dr-dlg-actions.single .dr-dlg-btn{flex:0 0 auto;min-width:120px;max-width:160px}'
  ].join('');

  function injectCss() {
    var el = document.getElementById('dr-dialog-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-dialog-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
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
      '<div class="dr-dlg-head">' +
      '<div class="dr-dlg-icon" id="dr-dialog-icon">⚡</div>' +
      '<h3 class="dr-dlg-title" id="dr-dialog-title">Confirm</h3>' +
      '</div>' +
      '<div class="dr-dlg-body" id="dr-dialog-body"></div>' +
      '<div class="dr-dlg-input-wrap" id="dr-dialog-input-wrap" hidden>' +
      '<input type="text" class="dr-dlg-input" id="dr-dialog-input" />' +
      '</div>' +
      '<div class="dr-dlg-actions" id="dr-dialog-actions"></div>' +
      '</div>';
    document.body.appendChild(root);
    return root;
  }

  function formatBody(message) {
    var raw = String(message || '');
    var parts = raw.split(/\n\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (parts.length >= 2) {
      return (
        '<span class="dr-dlg-primary">' + escapeHtml(parts[0]) + '</span>' +
        '<span class="dr-dlg-hint">' + escapeHtml(parts.slice(1).join(' ')) + '</span>'
      );
    }
    return escapeHtml(raw);
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
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
    var inputWrap = document.getElementById('dr-dialog-input-wrap');
    var input = document.getElementById('dr-dialog-input');
    var actions = document.getElementById('dr-dialog-actions');

    card.className = opts.danger ? 'dr-dlg-danger' : '';
    icon.textContent = opts.icon || (opts.danger ? '⚠' : opts.type === 'alert' ? 'ℹ' : '⚡');
    title.textContent = opts.title || (opts.type === 'alert' ? 'Notice' : opts.type === 'prompt' ? 'Input' : 'Confirm');
    body.innerHTML = formatBody(opts.message);

    if (opts.type === 'prompt') {
      inputWrap.hidden = false;
      input.value = opts.defaultValue != null ? String(opts.defaultValue) : '';
      input.placeholder = opts.placeholder || '';
    } else {
      inputWrap.hidden = true;
      input.value = '';
    }

    actions.innerHTML = '';
    actions.className = 'dr-dlg-actions' + (opts.type === 'alert' ? ' single' : '');
    var resolved = false;

    function finish(val) {
      if (resolved) return;
      resolved = true;
      document.removeEventListener('keydown', onKey);
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
      confirmBtn.textContent = opts.okText || 'OK';
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
