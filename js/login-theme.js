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
    'transition:box-shadow .5s ease,border-color .5s ease,opacity .3s ease,transform .3s ease!important}',

    '.login-card.login-fail-glow,#login-screen .login-card.login-fail-glow{',
    'border-color:rgba(248,113,113,0.9)!important;',
    'box-shadow:0 0 22px rgba(239,68,68,0.8),0 0 52px rgba(220,38,38,0.55),0 12px 40px rgba(0,0,0,0.3)!important}',

    '.login-card.login-fail-shake,#login-screen .login-card.login-fail-shake{',
    'animation:drCardShake .5s ease-out}',

    '.login-card.login-fail-healing,#login-screen .login-card.login-fail-healing{',
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
    'background:radial-gradient(ellipse 90% 60% at 50% -10%,rgba(109,94,245,0.16),transparent 55%),',
    'radial-gradient(ellipse 50% 40% at 100% 100%,rgba(167,139,250,0.12),transparent 50%),',
    'linear-gradient(165deg,#f6f4fc 0%,#efeaf8 45%,#e8e2f5 100%)!important}',

    'html[data-theme="light"] .login-card,html[data-theme="light"] #login-screen .login-card,',
    'html[data-theme="light"] .login-card-register,html[data-theme="light"] #login-screen .login-card-register{',
    'background:rgba(255,255,255,0.22)!important;',
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
    'html[data-theme="light"] .login-form select,',
    'html[data-theme="light"] #login-screen input,',
    'html[data-theme="light"] #login-screen select{',
    'background:#fff!important;color:#1a1a2e!important;',
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

  function triggerFail(card, withShake) {
    if (!card) return;
    card.classList.remove('login-fail-healing');
    card.classList.add('login-fail-glow');
    if (withShake) {
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
      '</div></div>';
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
    var formId = isAgent ? 'register-agent' : 'register-customer';
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
      body += fieldInput('reg-cust-name', 'Full Name', 'text', 'required');
      body += fieldInput('reg-cust-email', 'Email', 'email', 'required autocomplete="email"');
      body += fieldInput('reg-cust-username', 'Username', 'text', 'required autocomplete="username"');
      body += fieldPassword('reg-cust-password', 'Password', 'required minlength="4" autocomplete="new-password"');
      body += fieldPasswordConfirm('reg-cust-password', 'reg-cust-password-confirm', 'Confirm Password', 'required minlength="4" autocomplete="new-password"');
      body += '<div class="form-row">';
      body += fieldSelect('reg-cust-gender', 'Gender', [
        { v: '', t: 'Select...' }, 'Male', 'Female', 'Non-binary', 'Prefer not to say'
      ], true);
      body += fieldSelect('reg-cust-role', 'Role', [
        { v: 'customer', t: 'End-User', s: true }
      ], true);
      body += '</div>';
      body += fieldSelect('reg-cust-branch', 'Branch', [
        { v: '', t: 'Select branch...' },
        'Head Office', 'North Branch', 'South Branch', 'East Branch', 'West Branch', 'Remote / WFH'
      ], true);
      body += '<button type="submit" class="btn btn-primary btn-full">Create End-User Account</button>';
      body += '<p class="login-switch">Already have an account? <a href="javascript:void(0)" data-dr-show="login-customer">Sign in</a></p>';
    }

    var card = document.createElement('div');
    card.id = cardId;
    card.className = 'login-card login-card-register';
    card.innerHTML =
      '<div class="reg-title">' + title + '</div>' +
      '<p class="reg-sub">' + sub + '</p>' +
      '<form id="' + formId + '" class="login-form active">' + body + '</form>';
    return card;
  }

  function wirePasswordFeatures(root) {
    root = root || document;
    root.querySelectorAll('.dr-pass-toggle').forEach(function (btn) {
      if (btn.__drPassBound) return;
      btn.__drPassBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = btn.getAttribute('data-dr-pass-target');
        var inp = id ? document.getElementById(id) : null;
        if (!inp) return;
        var show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        btn.textContent = show ? '🙈' : '👁';
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        btn.setAttribute('title', show ? 'Hide password' : 'Show password');
      });
    });

    function checkMatch(confirmEl) {
      if (!confirmEl) return true;
      var passId = confirmEl.getAttribute('data-dr-match-for');
      var passEl = passId ? document.getElementById(passId) : null;
      var hint = document.querySelector('[data-dr-match-hint="' + confirmEl.id + '"]');
      var card = confirmEl.closest ? confirmEl.closest('.login-card') : null;
      var pv = passEl ? (passEl.value || '') : '';
      var cv = confirmEl.value || '';
      confirmEl.classList.remove('dr-pass-mismatch', 'dr-pass-match-ok');
      if (hint) {
        hint.classList.remove('is-ok', 'is-bad');
        hint.textContent = '';
      }
      if (!cv) {
        if (card) card.classList.remove('login-fail-glow', 'login-fail-shake');
        return !pv ? true : false;
      }
      if (pv === cv) {
        confirmEl.classList.add('dr-pass-match-ok');
        if (hint) {
          hint.textContent = 'Passwords match';
          hint.classList.add('is-ok');
        }
        if (card) card.classList.remove('login-fail-glow', 'login-fail-shake');
        return true;
      }
      confirmEl.classList.add('dr-pass-mismatch');
      if (hint) {
        hint.textContent = 'Passwords do not match';
        hint.classList.add('is-bad');
      }
      if (card) {
        card.classList.remove('login-fail-healing');
        card.classList.add('login-fail-glow');
      }
      return false;
    }

    root.querySelectorAll('input[data-dr-match-for]').forEach(function (confirmEl) {
      if (confirmEl.__drMatchBound) return;
      confirmEl.__drMatchBound = true;
      var passId = confirmEl.getAttribute('data-dr-match-for');
      var passEl = passId ? document.getElementById(passId) : null;
      var onInput = function () { checkMatch(confirmEl); };
      confirmEl.addEventListener('input', onInput);
      confirmEl.addEventListener('blur', onInput);
      if (passEl) {
        passEl.addEventListener('input', onInput);
        passEl.addEventListener('blur', onInput);
      }
      var form = confirmEl.closest('form');
      if (form && !form.__drMatchSubmitBound) {
        form.__drMatchSubmitBound = true;
        form.addEventListener('submit', function (ev) {
          if (!checkMatch(confirmEl)) {
            ev.preventDefault();
            ev.stopPropagation();
            try { confirmEl.focus(); } catch (e) {}
          }
        }, true);
      }
    });
  }

  function ensureRegisterCards() {
    var screen = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!screen) return;
    var mainCard = screen.querySelector('.login-card:not(.login-card-register)');
    if (!mainCard) return;

    ['register-customer', 'register-agent'].forEach(function (id) {
      var f = document.getElementById(id);
      if (f && mainCard.contains(f)) {
        try { f.remove(); } catch (e) {}
      }
    });

    function needsRebuild(cardId, confirmId) {
      var c = document.getElementById(cardId);
      if (!c) return true;
      if (!document.getElementById(confirmId)) return true;
      return false;
    }
    if (needsRebuild('dr-register-card-customer', 'reg-cust-password-confirm')) {
      var oldC = document.getElementById('dr-register-card-customer');
      if (oldC) try { oldC.remove(); } catch (e) {}
      screen.appendChild(buildRegisterCard('customer'));
    }
    if (needsRebuild('dr-register-card-agent', 'reg-agent-password-confirm')) {
      var oldA = document.getElementById('dr-register-card-agent');
      if (oldA) try { oldA.remove(); } catch (e) {}
      screen.appendChild(buildRegisterCard('agent'));
    }

    screen.querySelectorAll('[data-dr-show]').forEach(function (a) {
      if (a.__drBound) return;
      a.__drBound = true;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        showFormPanel(a.getAttribute('data-dr-show'));
      });
    });

    wirePasswordFeatures(screen);
  }

  function showFormPanel(id) {
    ensureRegisterCards();
    var isRegCust = id === 'register-customer';
    var isRegAgent = id === 'register-agent';
    var isReg = isRegCust || isRegAgent;
    var mainCard = document.querySelector('#login-screen .login-card:not(.login-card-register), .login-card:not(.login-card-register)');
    var regCust = document.getElementById('dr-register-card-customer');
    var regAgent = document.getElementById('dr-register-card-agent');
    if (mainCard) mainCard.classList.toggle('is-hidden-for-reg', isReg);
    if (regCust) regCust.classList.toggle('is-open', isRegCust);
    if (regAgent) regAgent.classList.toggle('is-open', isRegAgent);
    document.querySelectorAll('form.login-form').forEach(function (f) {
      if (f.id === 'login-customer' || f.id === 'login-agent') {
        f.classList.toggle('active', f.id === id);
      }
    });
    var tab = (id || '').indexOf('agent') !== -1 ? 'agent' : 'customer';
    document.querySelectorAll('.ltab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-ltab') === tab);
    });
  }

  function overrideShowForm() {
    window.showForm = function (id) {
      showFormPanel(id);
    };
    window.switchLoginTab = function (tab) {
      showFormPanel(tab === 'agent' ? 'login-agent' : 'login-customer');
    };
  }

  function watchLoginErrors() {
    var root = document.body;
    if (!root || root.__drFailGlowBound) return;
    root.__drFailGlowBound = true;

    document.addEventListener('submit', function (ev) {
      var form = ev.target;
      if (!form) return;
      if (!(form.classList && form.classList.contains('login-form')) &&
          !(form.closest && form.closest('.login-card'))) return;
      pendingSubmit = true;
      [80, 350, 900].forEach(function (ms, i) {
        setTimeout(function () {
          if (pendingSubmit && hasLoginError()) {
            onPossibleFail(true);
            pendingSubmit = false;
          } else if (i === 2) {
            pendingSubmit = false;
          }
        }, ms);
      });
    }, true);

    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t) return;
      var btn = t.closest ? t.closest('button[type="submit"], .btn-primary, button.btn') : null;
      if (!btn || !btn.closest || !btn.closest('.login-card, #login-screen')) return;
      pendingSubmit = true;
      [100, 400, 1000].forEach(function (ms, i) {
        setTimeout(function () {
          if (pendingSubmit && hasLoginError()) {
            onPossibleFail(true);
            pendingSubmit = false;
          } else if (i === 2) {
            pendingSubmit = false;
          }
        }, ms);
      });
    }, true);

    try {
      var obs = new MutationObserver(function () {
        if (hasLoginError()) {
          var card = document.querySelector('.login-card-register.is-open') || getCard();
          if (card && !card.classList.contains('login-fail-glow')) {
            if (pendingSubmit) {
              onPossibleFail(true);
              pendingSubmit = false;
            } else {
              triggerFail(card, false);
            }
          }
        }
      });
      obs.observe(root, { childList: true, subtree: true, characterData: true });
      root.__drFailGlowObs = obs;
    } catch (e) {}

    removeCrackOverlays();
  }

  function refresh() {
    injectCss();
    ensureLoginToggle();
    removeCrackOverlays();
    ensureRegisterCards();
    overrideShowForm();
    wirePasswordFeatures(document);
  }

  injectCss();
  ensureLoginToggle();
  ensureRegisterCards();
  overrideShowForm();
  watchLoginErrors();
  setTimeout(refresh, 200);
  setTimeout(refresh, 800);
  setTimeout(refresh, 2000);
  setInterval(function () {
    if (isLoginVisible()) ensureLoginToggle();
    else removeLoginToggle();
    removeCrackOverlays();
    ensureRegisterCards();
    overrideShowForm();
  }, 3000);

  window.DRLoginTheme = {
    refresh: refresh,
    removeLoginToggle: removeLoginToggle,
    showForm: showFormPanel
  };
})();
