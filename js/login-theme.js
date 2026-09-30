/**
 * Divine Rays - login glass + shake; separate register cards
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_THEME) {
    try { delete window.__DR_LOGIN_THEME; } catch (e) {}
  }
  window.__DR_LOGIN_THEME = 1;

  var CSS = [
    '.login-card,#login-screen .login-card{',
    'position:relative!important;overflow:hidden!important;',
    'background:rgba(26,22,40,0.20)!important;',
    'backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;',
    'border:1px solid rgba(167,139,250,0.45)!important;',
    'box-shadow:0 0 24px rgba(139,92,246,0.55),0 0 48px rgba(124,58,237,0.35),0 12px 40px rgba(0,0,0,0.25)!important;',
    'transition:box-shadow .25s ease,border-color .25s ease,opacity .3s ease,transform .3s ease!important}',

    '.login-card.login-fail-glow,#login-screen .login-card.login-fail-glow{',
    'border-color:rgba(248,113,113,0.9)!important;',
    'box-shadow:0 0 22px rgba(239,68,68,0.8),0 0 52px rgba(220,38,38,0.55),0 12px 40px rgba(0,0,0,0.3)!important}',

    '.login-card.login-fail-shake,#login-screen .login-card.login-fail-shake{',
    'animation:drCardShake .5s ease-out}',

    '.login-card.login-fail-healing,#login-screen .login-card.login-fail-healing{',
    'border-color:rgba(167,139,250,0.45)!important;',
    'box-shadow:0 0 24px rgba(139,92,246,0.55),0 0 48px rgba(124,58,237,0.35),0 12px 40px rgba(0,0,0,0.25)!important}',

    '.login-card.login-pass-ok,#login-screen .login-card.login-pass-ok,',
    '.login-card-register.login-pass-ok,#login-screen .login-card-register.login-pass-ok{',
    'border-color:rgba(167,139,250,0.45)!important;',
    'box-shadow:0 0 24px rgba(139,92,246,0.55),0 0 48px rgba(124,58,237,0.35),0 12px 40px rgba(0,0,0,0.25)!important}',

    '@keyframes drCardShake{',
    '0%{transform:translate(0,0) rotate(0deg)}',
    '12%{transform:translate(-5px,1px) rotate(-0.6deg)}',
    '24%{transform:translate(5px,-1px) rotate(0.6deg)}',
    '36%{transform:translate(-4px,0) rotate(-0.4deg)}',
    '48%{transform:translate(3px,1px) rotate(0.3deg)}',
    '60%{transform:translate(-2px,0) rotate(-0.2deg)}',
    '72%{transform:translate(1px,0) rotate(0.1deg)}',
    '100%{transform:translate(0,0) rotate(0deg)}}',

    '#login-screen .login-card-register, .login-card-register{',
    'width:100%!important;max-width:560px!important;padding:2.25rem 2rem!important;',
    'display:none!important}',
    '#login-screen .login-card-register.is-open, .login-card-register.is-open{',
    'display:block!important}',
    '#login-screen .login-card.is-hidden-for-reg, .login-card.is-hidden-for-reg{',
    'display:none!important}',
    '#login-screen .login-card-register .reg-title{',
    'margin:0 0 .25rem;font-size:1.35rem;font-weight:700;text-align:center}',
    '#login-screen .login-card-register .reg-sub{',
    'margin:0 0 1.25rem;font-size:.9rem;text-align:center;opacity:.75}',
    '#login-screen .login-card-register .form-row{',
    'display:grid;grid-template-columns:1fr 1fr;gap:.75rem}',
    '@media (max-width:520px){#login-screen .login-card-register .form-row{grid-template-columns:1fr}}',
    '#login-screen .login-card-register form.login-form{display:block!important}',

    'html[data-theme="light"] .login-screen,html[data-theme="light"] #login-screen{',
    'background:transparent!important;background-image:none!important}',

    'html[data-theme="light"] .login-card,html[data-theme="light"] #login-screen .login-card,',
    'html[data-theme="light"] .login-card-register,html[data-theme="light"] #login-screen .login-card-register{',
    'background:rgba(255,255,255,0.88)!important;',
    'backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;',
    'border:1px solid rgba(109,94,245,0.55)!important;',
    'box-shadow:0 0 28px rgba(109,94,245,0.7),0 0 56px rgba(139,92,246,0.45),0 0 80px rgba(124,58,237,0.25),0 10px 32px rgba(30,30,60,0.08)!important;',
    'color:#1a1a2e!important}',

    'html[data-theme="light"] .login-card.login-fail-glow,html[data-theme="light"] #login-screen .login-card.login-fail-glow{',
    'border-color:rgba(239,68,68,0.9)!important;',
    'box-shadow:0 0 26px rgba(239,68,68,0.8),0 0 56px rgba(220,38,38,0.55),0 10px 32px rgba(185,28,28,0.15)!important}',

    'html[data-theme="light"] .login-card.login-fail-healing,html[data-theme="light"] #login-screen .login-card.login-fail-healing{',
    'border-color:rgba(109,94,245,0.55)!important;',
    'box-shadow:0 0 28px rgba(109,94,245,0.7),0 0 56px rgba(139,92,246,0.45),0 0 80px rgba(124,58,237,0.25),0 10px 32px rgba(30,30,60,0.08)!important}',

    'html[data-theme="light"] .login-card.login-pass-ok,html[data-theme="light"] #login-screen .login-card.login-pass-ok,',
    'html[data-theme="light"] .login-card-register.login-pass-ok,html[data-theme="light"] #login-screen .login-card-register.login-pass-ok{',
    'border-color:rgba(109,94,245,0.55)!important;',
    'box-shadow:0 0 28px rgba(109,94,245,0.7),0 0 56px rgba(139,92,246,0.45),0 0 80px rgba(124,58,237,0.25),0 10px 32px rgba(30,30,60,0.08)!important}',

    'html[data-theme="light"] .login-brand h1{color:#1a1a2e!important}',
    'html[data-theme="light"] .login-brand p,',
    'html[data-theme="light"] .login-footer,',
    'html[data-theme="light"] .login-card .muted,',
    'html[data-theme="light"] .login-card-register .reg-sub{color:#5a5a78!important}',

    'html[data-theme="light"] .login-tabs{',
    'background:rgba(240,236,255,0.9)!important;',
    'border:1px solid rgba(124,106,240,0.18)!important;',
    'border-radius:999px!important;padding:3px!important}',
    'html[data-theme="light"] .ltab{',
    'color:#4a4a66!important;background:transparent!important;border:none!important;',
    'border-radius:999px!important;font-weight:600!important}',
    'html[data-theme="light"] .ltab.active{',
    'background:#6d5ef5!important;color:#fff!important;',
    'box-shadow:0 4px 14px rgba(109,94,245,0.35)!important}',

    'html[data-theme="light"] .login-form label,',
    'html[data-theme="light"] #login-screen .form-group label{',
    'color:#3d3d55!important;font-weight:600!important}',
    'html[data-theme="light"] .login-form input,',
    'html[data-theme="light"] #login-screen input{',
    'background:#fff!important;color:#1a1a2e!important;',
    'border:1px solid rgba(124,106,240,0.28)!important;',
    'box-shadow:0 1px 2px rgba(30,30,60,0.04)!important}',
    'html[data-theme="light"] .login-form select,',
    'html[data-theme="light"] #login-screen select{',
    'background-color:#fff!important;color:#1a1a2e!important;',
    'border:1px solid rgba(124,106,240,0.28)!important;',
    'box-shadow:0 1px 2px rgba(30,30,60,0.04)!important}',
    'html[data-theme="light"] .login-form input:focus,',
    'html[data-theme="light"] #login-screen input:focus,',
    'html[data-theme="light"] .login-form select:focus,',
    'html[data-theme="light"] #login-screen select:focus{',
    'border-color:#6d5ef5!important;',
    'box-shadow:0 0 0 3px rgba(109,94,245,0.22)!important;outline:none!important}',

    'html[data-theme="light"] .btn-primary,',
    'html[data-theme="light"] #login-screen .btn-primary,',
    'html[data-theme="light"] button[type="submit"]{',
    'background:linear-gradient(135deg,#6d5ef5,#8b7cf8)!important;',
    'color:#fff!important;border:none!important;',
    'box-shadow:0 6px 18px rgba(91,76,224,0.35)!important;',
    'font-weight:600!important}',

    'html[data-theme="light"] .login-switch{color:#4a4a66!important}',
    'html[data-theme="light"] .login-switch a{color:#5b4fd4!important}',
    'html[data-theme="light"] .login-error{',
    'background:rgba(248,113,113,0.12)!important;border-color:rgba(248,113,113,0.35)!important}',
    'html[data-theme="light"] hr,html[data-theme="light"] .login-card hr{',
    'border-color:rgba(124,106,240,0.18)!important}',

    '#dr-login-theme{',
    'position:fixed;top:1rem;right:1rem;z-index:9999;',
    'background:#1a1628;color:#c4b5fd;border:1px solid #5b4fd4;border-radius:999px;',
    'padding:.5rem 1rem;font-size:.85rem;font-weight:600;cursor:pointer;',
    'font-family:inherit;box-shadow:0 4px 16px rgba(0,0,0,.25)}',
    'html[data-theme="light"] #dr-login-theme{',
    'background:#fff;color:#4c3fd4;border-color:#c4b5fd;',
    'box-shadow:0 4px 16px rgba(30,30,60,.1)}',

    '.login-switch{color:#9898b0!important}',
    '.login-switch a{color:#c4b5fd!important}',
    '#login-screen,.login-screen{position:relative;z-index:2}',
    '#login-screen .login-card,.login-card{position:relative;z-index:3}',
    '#login-screen .login-card-register{position:relative;z-index:3}',

    '#login-screen .dr-pass-wrap, .dr-pass-wrap{position:relative!important}',
    '#login-screen .dr-pass-wrap input, .dr-pass-wrap input{padding-right:2.75rem!important;width:100%!important;box-sizing:border-box!important}',
    '#login-screen .dr-pass-toggle, .dr-pass-toggle{',
    'position:absolute!important;right:10px!important;top:50%!important;transform:translateY(-50%)!important;',
    'background:transparent!important;border:0!important;padding:4px!important;cursor:pointer!important;',
    'color:rgba(196,181,253,0.9)!important;font-size:1.05rem!important;line-height:1!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'z-index:2!important;opacity:.85!important}',
    '#login-screen .dr-pass-toggle:hover, .dr-pass-toggle:hover{opacity:1!important;color:#ddd6fe!important}',
    'html[data-theme="light"] #login-screen .dr-pass-toggle{color:rgba(91,33,182,0.85)!important}',
    'html[data-theme="light"] #login-screen .dr-pass-toggle:hover{color:#5b21b6!important}',
    '#login-screen .dr-pass-match, .dr-pass-match{',
    'font-size:0.78rem!important;margin:0.25rem 0 0!important;min-height:1.1em!important}',
    '#login-screen .dr-pass-match.is-ok, .dr-pass-match.is-ok{color:#4ade80!important}',
    '#login-screen .dr-pass-match.is-bad, .dr-pass-match.is-bad{color:#f87171!important}',
    '#login-screen .dr-pass-wrap input.dr-pass-mismatch, .dr-pass-wrap input.dr-pass-mismatch{',
    'border-color:rgba(248,113,113,0.85)!important;box-shadow:0 0 0 1px rgba(239,68,68,0.35)!important}',
    '#login-screen .dr-pass-wrap input.dr-pass-match-ok, .dr-pass-wrap input.dr-pass-match-ok{',
    'border-color:rgba(74,222,128,0.7)!important}',

    '#login-screen form#register-customer,',
    '#login-screen form#register-agent,',
    '.login-card form#register-customer,',
    '.login-card form#register-agent{display:none!important}',

    '#login-screen select,.login-form select,.login-card-register select{',
    '-webkit-appearance:none!important;appearance:none!important;',
    'background-repeat:no-repeat!important;',
    'background-position:right 0.85rem center!important;',
    'background-size:12px 12px!important;',
    'padding-right:2.35rem!important;',
    'cursor:pointer!important;',
    "background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 4.5L6 8l3.5-3.5' fill='none' stroke='%23c4b5fd' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")!important}",

    'html[data-theme="light"] #login-screen select,',
    'html[data-theme="light"] .login-form select,',
    'html[data-theme="light"] .login-card-register select{',
    "background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 4.5L6 8l3.5-3.5' fill='none' stroke='%236d5ef5' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")!important}",

    '#dr-success-modal{',
    'position:fixed!important;inset:0!important;z-index:100000!important;',
    'display:none!important;align-items:center!important;justify-content:center!important;',
    'background:rgba(12,10,24,0.55)!important;backdrop-filter:blur(6px)!important}',
    '#dr-success-modal.is-open{display:flex!important}',
    '#dr-success-modal .dr-success-box{',
    'background:rgba(26,22,40,0.95)!important;border:1px solid rgba(167,139,250,0.5)!important;',
    'border-radius:16px!important;padding:1.75rem 1.5rem!important;max-width:320px!important;width:90%!important;',
    'text-align:center!important;box-shadow:0 0 32px rgba(139,92,246,0.45)!important;color:#eeeef6!important}',
    '#dr-success-modal .dr-success-check{',
    'width:64px!important;height:64px!important;margin:0 auto 1rem!important;border-radius:50%!important;',
    'background:rgba(34,197,94,0.18)!important;border:2.5px solid #22c55e!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'animation:drCheckPop .45s cubic-bezier(.22,1.2,.36,1) both!important}',
    '#dr-success-modal .dr-success-check .dr-check-mark{',
    'color:#22c55e!important;font-size:2rem!important;font-weight:800!important;line-height:1!important;',
    'display:block!important;animation:drCheckMarkIn .4s ease-out .15s both!important}',
    '@keyframes drCheckPop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.12);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes drCheckMarkIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:1}}',
    '#dr-success-modal .dr-success-box h3{margin:0 0 .5rem!important;font-size:1.2rem!important;font-weight:700!important;color:#c4b5fd!important}',
    '#dr-success-modal .dr-success-box p{margin:0 0 1.25rem!important;font-size:.9rem!important;opacity:.85!important}',
    'html[data-theme="light"] #dr-success-modal .dr-success-check{background:rgba(34,197,94,0.12)!important}',
    '#dr-success-modal .dr-success-ok{',
    'display:inline-block!important;min-width:110px!important;padding:.55rem 1.25rem!important;',
    'border:none!important;border-radius:10px!important;cursor:pointer!important;font-weight:600!important;',
    'background:linear-gradient(135deg,#6d5ef5,#8b7cf8)!important;color:#fff!important;',
    'box-shadow:0 6px 18px rgba(91,76,224,0.35)!important;font-family:inherit!important}',
    'html[data-theme="light"] #dr-success-modal .dr-success-box{',
    'background:rgba(255,255,255,0.96)!important;color:#1a1a2e!important;',
    'border-color:rgba(109,94,245,0.4)!important}',
    'html[data-theme="light"] #dr-success-modal .dr-success-box h3{color:#5b4fd4!important}',
  ].join('');

  var healTimer = null;
  var pendingSubmit = false;

  function injectCss() {
    var el = document.getElementById('dr-login-theme-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-login-theme-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function getCard() {
    return document.querySelector('#login-screen .login-card:not(.login-card-register), .login-card:not(.login-card-register)');
  }

  function isLoginVisible() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!login) return false;
    if (login.hidden || login.classList.contains('is-hidden')) return false;
    try {
      var st = window.getComputedStyle(login);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
    } catch (e) {}
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pa && pa.classList.contains('active')) return false;
    if (pc && pc.classList.contains('active')) return false;
    return true;
  }

  function removeLoginToggle() {
    var lt = document.getElementById('dr-login-theme');
    if (lt && lt.parentNode) lt.parentNode.removeChild(lt);
  }

  function ensureLoginToggle() {
    if (!isLoginVisible()) {
      removeLoginToggle();
      return;
    }
    var btn = document.getElementById('dr-login-theme');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'dr-login-theme';
      btn.type = 'button';
      btn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = cur === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('dr_theme', next); } catch (e) {}
        btn.textContent = next === 'light' ? 'Dark' : 'Light';
        if (window.DRForceLightBg && window.DRForceLightBg.refresh) try { window.DRForceLightBg.refresh(); } catch (e) {}
        if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.refresh) try { window.DRHeartbeatDraw.refresh(); } catch (e) {}
      });
      document.body.appendChild(btn);
    }
    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    btn.textContent = theme === 'light' ? 'Dark' : 'Light';
  }

  function clearErrorMessages() {
    document.querySelectorAll('#login-screen .login-error, .login-form .login-error, .login-card .login-error')
      .forEach(function (e) {
        try { e.remove(); } catch (err) {}
      });
  }

  function removeCrackOverlays() {
    document.querySelectorAll('.dr-crack-overlay').forEach(function (el) {
      try { el.remove(); } catch (e) {}
    });
  }

  function healCard(card) {
    if (!card) return;
    card.classList.remove('login-fail-glow', 'login-fail-shake');
    card.classList.add('login-fail-healing');
    clearErrorMessages();
    setTimeout(function () {
      card.classList.remove('login-fail-healing');
    }, 400);
  }

  function triggerFail(card) {
    if (!card) return;
    card.classList.remove('login-fail-healing', 'login-pass-ok');
    card.classList.add('login-fail-glow');
    if (arguments.length > 1 && arguments[1]) {
      card.classList.remove('login-fail-shake');
      void card.offsetWidth;
      card.classList.add('login-fail-shake');
    }
    if (healTimer) clearTimeout(healTimer);
    healTimer = setTimeout(function () {
      healCard(card);
    }, 2200);
  }

  function hasLoginError() {
    var els = document.querySelectorAll('#login-screen .login-error, .login-form .error, .login-card .error, [data-login-error]');
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].textContent || '').trim();
      if (t.length > 0) return true;
    }
    return false;
  }

  function onPossibleFail(withShake) {
    var card = document.querySelector('.login-card-register.is-open') || getCard();
    if (card) triggerFail(card, !!withShake);
  }

  function fieldSelect(id, label, options, required) {
    var opts = options.map(function (o) {
      if (typeof o === 'string') return '<option value="' + o + '">' + o + '</option>';
      return '<option value="' + o.v + '"' + (o.s ? ' selected' : '') + '>' + o.t + '</option>';
    }).join('');
    return '<div class="form-group"><label for="' + id + '">' + label + '</label>' +
      '<select id="' + id + '"' + (required ? ' required' : '') + '>' + opts + '</select></div>';
  }

  function fieldInput(id, label, type, attrs) {
    return '<div class="form-group"><label for="' + id + '">' + label + '</label>' +
      '<input type="' + (type || 'text') + '" id="' + id + '" ' + (attrs || '') + ' /></div>';
  }

  function fieldPassword(id, label, attrs) {
    return '<div class="form-group"><label for="' + id + '">' + label + '</label>' +
      '<div class="dr-pass-wrap">' +
      '<input type="password" id="' + id + '" ' + (attrs || '') + ' />' +
      '<button type="button" class="dr-pass-toggle" data-dr-pass-target="' + id + '" aria-label="Show password" title="Show password">👁</button>' +
      '</div>' +
      '<p class="dr-pass-match" data-dr-len-hint="' + id + '" aria-live="polite"></p>' +
      '</div>';
  }

  function fieldPasswordConfirm(passId, confirmId, label, attrs) {
    return '<div class="form-group"><label for="' + confirmId + '">' + label + '</label>' +
      '<div class="dr-pass-wrap">' +
      '<input type="password" id="' + confirmId + '" ' + (attrs || '') + ' data-dr-match-for="' + passId + '" />' +
      '<button type="button" class="dr-pass-toggle" data-dr-pass-target="' + confirmId + '" aria-label="Show password" title="Show password">👁</button>' +
      '</div>' +
      '<p class="dr-pass-match" data-dr-match-hint="' + confirmId + '" aria-live="polite"></p>' +
      '</div>';
  }

  function buildRegisterCard(kind) {
    var isAgent = kind === 'agent';
    var cardId = isAgent ? 'dr-register-card-agent' : 'dr-register-card-customer';
    var formId = isAgent ? 'dr-register-form-agent' : 'dr-register-form-customer';
    var title = isAgent ? 'Create Agent Account' : 'Create End-User Account';
    var sub = isAgent ? 'Tech Support registration' : 'End-User registration';

    var body = '';
    if (isAgent) {
      body += fieldInput('reg-agent-name', 'Full Name', 'text', 'required');
      body += fieldInput('reg-agent-email', 'Work Email', 'email', 'required');
      body += fieldInput('reg-agent-username', 'Username', 'text', 'required autocomplete="username"');
      body += fieldPassword('reg-agent-password', 'Password', 'required minlength="6" autocomplete="new-password"');
      body += fieldPasswordConfirm('reg-agent-password', 'reg-agent-password-confirm', 'Confirm Password', 'required minlength="6" autocomplete="new-password"');
      body += '<div class="form-row">';
      body += fieldSelect('reg-agent-gender', 'Gender', [
        { v: '', t: 'Select...' }, 'Male', 'Female', 'Non-binary', 'Prefer not to say'
      ], true);
      body += fieldSelect('reg-agent-role', 'Role', [
        { v: 'agent', t: 'Agent', s: true }, { v: 'admin', t: 'Admin' }
      ], true);
      body += '</div>';
      body += fieldSelect('reg-agent-branch', 'Branch', [
        { v: '', t: 'Select branch...' },
        'Head Office', 'North Branch', 'South Branch', 'East Branch', 'West Branch', 'Remote / WFH'
      ], true);
      body += '<button type="submit" class="btn btn-primary btn-full">Create Agent Account</button>';
      body += '<p class="login-switch">Already have an account? <a href="javascript:void(0)" data-dr-show="login-agent">Sign in</a></p>';
    } else {
      body += '<div class="form-row">';
      body += fieldInput('reg-cust-firstname', 'First Name', 'text', 'required autocomplete="given-name"');
      body += fieldInput('reg-cust-lastname', 'Last Name', 'text', 'required autocomplete="family-name"');
      body += '</div>';
      body += fieldInput('reg-cust-email', 'Email', 'email', 'required autocomplete="email"');
      body += fieldPassword('reg-cust-password', 'Password', 'required minlength="4" autocomplete="new-password"');
      body += fieldPasswordConfirm('reg-cust-password', 'reg-cust-password-confirm', 'Confirm Password', 'required minlength="4" autocomplete="new-password"');
      body += '<div class="form-row">';
      body += fieldSelect('reg-cust-gender', 'Gender', [
        { v: '', t: '', s: true }, 'Male', 'Female', 'Prefer not to say'
      ], true);
      body += fieldSelect('reg-cust-role', 'Role', [
        { v: '', t: '', s: true },
        'Admin Staff', 'Medtech', 'Radtech', 'Nurse', 'Doctor', 'Cashier', 'Medical Staff'
      ], true);
      body += '</div>';
      body += fieldSelect('reg-cust-branch', 'Branch', [
        { v: '', t: '', s: true },
        'Abucay', 'Avenida', 'Palo - Pawing', 'Palo - Naga-naga', 'Burauen', 'Carigara', 'Kananga', 'Ormoc',
        'Abuyog', 'Baybay', 'Sogod', 'Maasin', 'Catbalogan', 'Calbayog', 'Catarman'
      ], true);
      body += '<button type="submit" class="btn btn-primary btn-full">Create End-User Account</button>';
      body += '<p class="login-switch">Already have an account? <a href="javascript:void(0)" data-dr-show="login-customer">Sign in</a></p>';
    }

    var card = document.createElement('div');
    card.id = cardId;
    card.className = 'login-card login-card-register';
    card.setAttribute('data-dr-ver', 'v4');
    card.innerHTML =
      '<div class="reg-title">' + title + '</div>' +
      '<p class="reg-sub">' + sub + '</p>' +
      '<form id="' + formId + '" class="login-form">' + body + '</form>';
    return card;
  }

  function neutralizeShellRegisterForms() {
    ['register-customer', 'register-agent'].forEach(function (id) {
      var f = document.getElementById(id);
      if (!f) return;
      f.classList.remove('active');
      f.style.setProperty('display', 'none', 'important');
      f.querySelectorAll('[id]').forEach(function (el) {
        if (!el.getAttribute('data-dr-old-id')) {
          el.setAttribute('data-dr-old-id', el.id);
        }
        el.removeAttribute('id');
        try { el.disabled = true; } catch (e) {}
      });
    });
  }

  function ensureRegisterCards() {
    neutralizeShellRegisterForms();
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!login) return;
    var host = login.querySelector('.login-inner') || login;
    ['dr-register-card-agent', 'dr-register-card-customer'].forEach(function (cid) {
      var el = document.getElementById(cid);
      if (el && el.getAttribute('data-dr-ver') !== 'v4') {
        try { el.parentNode.removeChild(el); } catch (e) {}
      }
    });
    if (!document.getElementById('dr-register-card-agent')) {
      host.appendChild(buildRegisterCard('agent'));
    }
    if (!document.getElementById('dr-register-card-customer')) {
      host.appendChild(buildRegisterCard('customer'));
    }
  }

  function showRegister(kind) {
    ensureRegisterCards();
    var loginCard = getCard();
    if (loginCard) {
      loginCard.classList.add('is-hidden-for-reg');
      loginCard.style.setProperty('display', 'none', 'important');
    }
    document.querySelectorAll('.login-card-register').forEach(function (c) {
      c.classList.remove('is-open');
      c.style.removeProperty('display');
    });
    var id = kind === 'agent' ? 'dr-register-card-agent' : 'dr-register-card-customer';
    var card = document.getElementById(id);
    if (card) {
      card.classList.add('is-open');
      card.style.setProperty('display', 'block', 'important');
    }
    ['register-customer', 'register-agent'].forEach(function (fid) {
      var f = document.getElementById(fid);
      if (f) {
        f.classList.remove('active');
        f.style.setProperty('display', 'none', 'important');
      }
    });
  }

  function showLogin(formId) {
    document.querySelectorAll('.login-card-register').forEach(function (c) {
      c.classList.remove('is-open');
      c.style.setProperty('display', 'none', 'important');
    });
    var loginCard = getCard();
    if (loginCard) {
      loginCard.classList.remove('is-hidden-for-reg');
      loginCard.style.removeProperty('display');
    }
    var target = formId || 'login-customer';
    if (target.indexOf('register') !== -1) {
      target = target.indexOf('agent') !== -1 ? 'login-agent' : 'login-customer';
    }
    document.querySelectorAll('form.login-form').forEach(function (f) {
      f.classList.remove('active');
      if (f.id === 'register-customer' || f.id === 'register-agent') {
        f.style.setProperty('display', 'none', 'important');
      }
    });
    var f = document.getElementById(target);
    if (f) {
      f.classList.add('active');
      f.style.removeProperty('display');
    }
    var tab = target.indexOf('agent') !== -1 ? 'agent' : 'customer';
    document.querySelectorAll('.ltab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-ltab') === tab);
    });
  }

  function patchShowForm() {
    window.showForm = function (id) {
      id = id || '';
      if (id.indexOf('register-customer') !== -1 || id === 'register-customer') {
        showRegister('customer');
        return;
      }
      if (id.indexOf('register-agent') !== -1 || id === 'register-agent') {
        showRegister('agent');
        return;
      }
      showLogin(id);
    };
  }

  function wireRegisterLinks() {
    document.querySelectorAll('[data-dr-show]').forEach(function (a) {
      if (a.__drShowWired) return;
      a.__drShowWired = 1;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var t = a.getAttribute('data-dr-show') || '';
        if (t.indexOf('register') !== -1) {
          showRegister(t.indexOf('agent') !== -1 ? 'agent' : 'customer');
        } else {
          showLogin(t);
        }
      });
    });
  }

  function wireFailDetection() {
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || !form.classList || !form.classList.contains('login-form')) return;
      pendingSubmit = true;
      setTimeout(function () {
        if (pendingSubmit && hasLoginError()) onPossibleFail(true);
        pendingSubmit = false;
      }, 80);
      setTimeout(function () {
        if (hasLoginError()) onPossibleFail(true);
      }, 300);
      setTimeout(function () {
        if (hasLoginError()) onPossibleFail(false);
      }, 800);
    }, true);

    var obs = new MutationObserver(function () {
      if (hasLoginError()) {
        var card = document.querySelector('.login-card-register.is-open') || getCard();
        if (card && !card.classList.contains('login-fail-glow')) {
          triggerFail(card, false);
        }
      }
    });
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (login) obs.observe(login, { childList: true, subtree: true, characterData: true });
  }

  function wirePasswordToggles() {
    document.querySelectorAll('.dr-pass-toggle').forEach(function (btn) {
      if (btn.__drPassWired) return;
      btn.__drPassWired = 1;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var wrap = btn.closest ? btn.closest('.dr-pass-wrap') : null;
        var input = wrap ? wrap.querySelector('input') : null;
        if (!input) {
          var id = btn.getAttribute('data-dr-pass-target');
          input = id ? document.getElementById(id) : null;
        }
        if (!input) return;
        if (input.type === 'password') {
          input.type = 'text';
          btn.setAttribute('aria-label', 'Hide password');
          btn.title = 'Hide password';
        } else {
          input.type = 'password';
          btn.setAttribute('aria-label', 'Show password');
          btn.title = 'Show password';
        }
      });
    });
  }

  function wirePasswordMatch() {
    document.querySelectorAll('.login-card-register input[data-dr-match-for], form.login-form input[data-dr-match-for]').forEach(function (confirm) {
      if (confirm.__drMatchWiredV2) return;
      confirm.__drMatchWiredV2 = 1;
      var passId = confirm.getAttribute('data-dr-match-for');
      var scope = (confirm.closest && (confirm.closest('form') || confirm.closest('.login-card-register') || confirm.closest('.login-card'))) || document;
      var hint = scope.querySelector
        ? scope.querySelector('[data-dr-match-hint="' + confirm.id + '"]')
        : document.querySelector('[data-dr-match-hint="' + confirm.id + '"]');
      function cardFor(el) {
        return el.closest ? el.closest('.login-card-register, .login-card') : null;
      }
      function setCardMatchGlow(state) {
        var card = cardFor(confirm);
        if (!card) return;
        if (healTimer) { clearTimeout(healTimer); healTimer = null; }
        card.classList.remove('login-fail-glow', 'login-fail-shake', 'login-fail-healing', 'login-pass-ok');
        if (state === 'bad') {
          card.classList.add('login-fail-glow');
        } else if (state === 'ok') {
          card.classList.add('login-pass-ok');
        }
      }
      function resolvePass() {
        var s = (confirm.closest && (confirm.closest('form') || confirm.closest('.login-card-register') || confirm.closest('.login-card'))) || document;
        if (passId && s.querySelector) {
          var p = s.querySelector('input[id="' + passId + '"]');
          if (p) return p;
        }
        return passId ? document.getElementById(passId) : null;
      }
      function check() {
        var p = resolvePass();
        if (!p || !confirm.value) {
          if (hint) { hint.textContent = ''; hint.className = 'dr-pass-match'; }
          confirm.classList.remove('dr-pass-mismatch', 'dr-pass-match-ok');
          setCardMatchGlow('clear');
          return;
        }
        if (confirm.value === p.value) {
          if (hint) { hint.textContent = 'Passwords match'; hint.className = 'dr-pass-match is-ok'; }
          confirm.classList.remove('dr-pass-mismatch');
          confirm.classList.add('dr-pass-match-ok');
          setCardMatchGlow('ok');
        } else {
          if (hint) { hint.textContent = 'Passwords do not match'; hint.className = 'dr-pass-match is-bad'; }
          confirm.classList.add('dr-pass-mismatch');
          confirm.classList.remove('dr-pass-match-ok');
          setCardMatchGlow('bad');
        }
      }
      confirm.addEventListener('input', check);
      confirm.addEventListener('keyup', check);
      confirm.addEventListener('change', check);
      var form = confirm.closest ? confirm.closest('form') : null;
      if (form && !form.__drPassMatchDelegated) {
        form.__drPassMatchDelegated = 1;
        form.addEventListener('input', function (ev) {
          var t = ev.target;
          if (!t || !t.getAttribute) return;
          if (t.id === passId || t.getAttribute('data-dr-match-for')) {
            check();
          }
        });
      }
    });
  }

  function ensureSuccessModal() {
    var m = document.getElementById('dr-success-modal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'dr-success-modal';
    m.innerHTML =
      '<div class="dr-success-box" role="dialog" aria-modal="true" aria-labelledby="dr-success-title">' +
      '<div class="dr-success-check" aria-hidden="true">' +
      '<span class="dr-check-mark">\u2713</span></div>' +
      '<h3 id="dr-success-title">Successfully created!</h3>' +
      '<p>Your account has been created. Click Ok to sign in.</p>' +
      '<button type="button" class="dr-success-ok">Ok</button>' +
      '</div>';
    document.body.appendChild(m);
    m.querySelector('.dr-success-ok').addEventListener('click', function () {
      m.classList.remove('is-open');
      showLogin('login-customer');
    });
    m.addEventListener('click', function (e) {
      if (e.target === m) {
        m.classList.remove('is-open');
        showLogin('login-customer');
      }
    });
    return m;
  }

  function showSuccessModal() {
    var m = ensureSuccessModal();
    var check = m.querySelector('.dr-success-check');
    var mark = m.querySelector('.dr-check-mark');
    if (check) {
      check.style.animation = 'none';
      void check.offsetWidth;
      check.style.animation = '';
    }
    if (mark) {
      mark.style.animation = 'none';
      void mark.offsetWidth;
      mark.style.animation = '';
    }
    m.classList.add('is-open');
  }

  function wireRegisterSubmit() {
    ['dr-register-form-customer', 'dr-register-form-agent'].forEach(function (fid) {
      var form = document.getElementById(fid);
      if (!form || form.__drRegSubmitWired) return;
      form.__drRegSubmitWired = 1;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
        var mismatch = form.querySelector('.dr-pass-mismatch');
        if (mismatch) {
          var card = form.closest('.login-card-register') || form.closest('.login-card');
          if (card) triggerFail(card, true);
          return;
        }
        var pass = form.querySelector('input[type="password"]');
        var confirm = form.querySelector('input[data-dr-match-for]');
        if (pass && confirm && pass.value && confirm.value && pass.value !== confirm.value) {
          var card2 = form.closest('.login-card-register') || form.closest('.login-card');
          if (card2) triggerFail(card2, true);
          return;
        }
        showSuccessModal();
      });
    });
  }

  function refresh() {
    injectCss();
    ensureLoginToggle();
    ensureRegisterCards();
    wireRegisterLinks();
    wirePasswordToggles();
    wirePasswordMatch();
    wireRegisterSubmit();
    removeCrackOverlays();
    patchShowForm();
  }

  injectCss();
  patchShowForm();
  setTimeout(refresh, 50);
  setTimeout(refresh, 300);
  setTimeout(refresh, 1000);
  setInterval(function () {
    ensureLoginToggle();
    ensureRegisterCards();
    wireRegisterLinks();
    wirePasswordToggles();
    wirePasswordMatch();
    wireRegisterSubmit();
    patchShowForm();
  }, 2000);
  wireFailDetection();

  window.DRLoginTheme = { refresh: refresh, showRegister: showRegister, showLogin: showLogin };
})();
