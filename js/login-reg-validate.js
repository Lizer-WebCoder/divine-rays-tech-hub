/**
 * Divine Rays — registration validation v1
 * Red card glow for duplicate email / password mismatch; live password match.
 */
(function () {
  'use strict';
  if (window.__DR_REG_VALIDATE >= 1) return;
  window.__DR_REG_VALIDATE = 1;

  var CSS =
    '.dr-reg-card.dr-reg-error{' +
    'border-color:rgba(248,113,113,.7)!important;' +
    'box-shadow:0 0 0 1px rgba(239,68,68,.5),0 0 22px rgba(239,68,68,.55),' +
    '0 0 52px rgba(185,28,28,.4),0 0 88px rgba(127,29,29,.28)!important;' +
    'transition:box-shadow .18s ease,border-color .18s ease}' +
    '.dr-reg-card:not(.dr-reg-error){transition:box-shadow .18s ease,border-color .18s ease}' +
    '.dr-reg-card .form-group input.dr-field-bad,' +
    '.dr-reg-card .form-group select.dr-field-bad{' +
    'border-color:rgba(248,113,113,.75)!important;box-shadow:0 0 0 3px rgba(239,68,68,.18)!important}' +
    '.dr-reg-card .dr-reg-err.is-on{color:#fecaca;background:rgba(127,29,29,.28);' +
    'border:1px solid rgba(248,113,113,.35)}';

  function injectCss() {
    if (document.getElementById('dr-reg-validate-css')) return;
    var st = document.createElement('style');
    st.id = 'dr-reg-validate-css';
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function cardOf(form) {
    return form && form.closest ? form.closest('.dr-reg-card') : null;
  }

  function setError(form, msg, fieldIds) {
    var card = cardOf(form);
    if (card) card.classList.add('dr-reg-error');
    var e = form && form.querySelector('.dr-reg-err');
    if (e) {
      e.textContent = msg || '';
      e.classList.add('is-on');
    }
    (fieldIds || []).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('dr-field-bad');
    });
  }

  function clearError(form) {
    var card = cardOf(form);
    if (card) card.classList.remove('dr-reg-error');
    if (!form) return;
    var e = form.querySelector('.dr-reg-err');
    if (e) {
      e.textContent = '';
      e.classList.remove('is-on');
    }
    form.querySelectorAll('.dr-field-bad').forEach(function (el) {
      el.classList.remove('dr-field-bad');
    });
  }

  function isDupEmail(msg) {
    var m = String(msg || '').toLowerCase();
    return (
      m.indexOf('already') !== -1 ||
      m.indexOf('registered') !== -1 ||
      m.indexOf('exists') !== -1 ||
      m.indexOf('duplicate') !== -1 ||
      m.indexOf('user already') !== -1
    );
  }

  function friendlyErr(msg) {
    if (isDupEmail(msg)) return 'This email is already registered. Please use a different email.';
    return msg || 'Could not create account';
  }

  function ensureEmpConfirm() {
    var pass = document.getElementById('dr-emp-password');
    if (!pass) return;
    if (document.getElementById('dr-emp-password2')) return;
    var group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML =
      '<label for="dr-emp-password2">Confirm Password</label>' +
      '<input type="password" id="dr-emp-password2" required minlength="4" placeholder="••••••••" autocomplete="new-password"/>';
    var passGroup = pass.closest ? pass.closest('.form-group') : pass.parentNode;
    if (passGroup && passGroup.parentNode) {
      passGroup.parentNode.insertBefore(group, passGroup.nextSibling);
    }
  }

  function checkPasswords(form, p1id, p2id, live) {
    var p1 = document.getElementById(p1id);
    var p2 = document.getElementById(p2id);
    if (!p1 || !p2) return true;
    var a = p1.value || '';
    var b = p2.value || '';
    if (live && (!a || !b)) {
      p1.classList.remove('dr-field-bad');
      p2.classList.remove('dr-field-bad');
      if (form && form.__drPwMismatch) {
        form.__drPwMismatch = false;
        clearError(form);
      }
      return true;
    }
    if (a !== b) {
      form.__drPwMismatch = true;
      setError(form, 'Passwords do not match.', [p1id, p2id]);
      return false;
    }
    p1.classList.remove('dr-field-bad');
    p2.classList.remove('dr-field-bad');
    if (form.__drPwMismatch) {
      form.__drPwMismatch = false;
      clearError(form);
    } else {
      var card = cardOf(form);
      if (card && !form.querySelector('.dr-reg-err.is-on')) card.classList.remove('dr-reg-error');
    }
    return true;
  }

  function wireLivePasswords() {
    ensureEmpConfirm();
    var pairs = [
      ['dr-emp-password', 'dr-emp-password2', '#dr-reg-card-employee form'],
      ['dr-adm-password', 'dr-adm-password2', '#dr-reg-card-admin form']
    ];
    pairs.forEach(function (pair) {
      var p1 = document.getElementById(pair[0]);
      var p2 = document.getElementById(pair[1]);
      if (!p1 || !p2) return;
      if (p1.__drPwLive) return;
      p1.__drPwLive = 1;
      p2.__drPwLive = 1;
      var handler = function () {
        var form = document.querySelector(pair[2]);
        if (!form) form = p1.closest('form');
        checkPasswords(form, pair[0], pair[1], true);
      };
      p1.addEventListener('input', handler);
      p2.addEventListener('input', handler);
      p1.addEventListener('keyup', handler);
      p2.addEventListener('keyup', handler);
    });
  }

  function enhanceSubmit() {
    document.addEventListener(
      'submit',
      function (e) {
        var form = e.target;
        if (!form || !form.closest) return;
        if (!form.closest('.dr-reg-card')) return;

        var isEmp = !!form.closest('#dr-reg-card-employee');
        var isAdm = !!form.closest('#dr-reg-card-admin');
        if (!isEmp && !isAdm) return;

        clearError(form);

        var p1id = isEmp ? 'dr-emp-password' : 'dr-adm-password';
        var p2id = isEmp ? 'dr-emp-password2' : 'dr-adm-password2';
        ensureEmpConfirm();

        if (!checkPasswords(form, p1id, p2id, false)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
        }

        setTimeout(function () {
          var err = form.querySelector('.dr-reg-err');
          var msg = err && err.classList.contains('is-on') ? err.textContent || '' : '';
          if (msg) {
            if (isDupEmail(msg)) {
              setError(form, friendlyErr(msg), [isEmp ? 'dr-emp-email' : 'dr-adm-email']);
            } else if (/password.*match|do not match/i.test(msg)) {
              setError(form, msg, [p1id, p2id]);
            } else {
              setError(form, friendlyErr(msg), []);
            }
          }
        }, 50);
        setTimeout(function () {
          var err = form.querySelector('.dr-reg-err');
          var msg = err && err.classList.contains('is-on') ? err.textContent || '' : '';
          if (msg && isDupEmail(msg)) {
            setError(form, friendlyErr(msg), [isEmp ? 'dr-emp-email' : 'dr-adm-email']);
          }
        }, 400);
        setTimeout(function () {
          var err = form.querySelector('.dr-reg-err');
          var msg = err && err.classList.contains('is-on') ? err.textContent || '' : '';
          if (msg && isDupEmail(msg)) {
            setError(form, friendlyErr(msg), [isEmp ? 'dr-emp-email' : 'dr-adm-email']);
          }
        }, 1200);
      },
      true
    );
  }

  document.addEventListener(
    'input',
    function (e) {
      var t = e.target;
      if (!t || !t.id) return;
      if (t.id !== 'dr-emp-email' && t.id !== 'dr-adm-email') return;
      var form = t.closest('form');
      if (!form) return;
      var err = form.querySelector('.dr-reg-err');
      var msg = err ? err.textContent || '' : '';
      if (isDupEmail(msg) || form.__drEmailDup) {
        form.__drEmailDup = false;
        clearError(form);
      }
    },
    true
  );

  function boot() {
    injectCss();
    ensureEmpConfirm();
    wireLivePasswords();
  }

  enhanceSubmit();
  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);

  document.addEventListener(
    'click',
    function () {
      setTimeout(boot, 50);
    },
    true
  );

  window.DRRegValidate = { v: 1, setError: setError, clearError: clearError };
})();
