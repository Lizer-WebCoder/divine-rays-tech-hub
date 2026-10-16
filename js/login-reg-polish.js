/**
 * Divine Rays — registration polish
 * Gear logo on reg cards, Employee confirm password, Admin "Create an admin account"
 */
(function () {
  'use strict';
  if (window.__DR_REG_POLISH >= 1) return;
  window.__DR_REG_POLISH = 1;

  var GEAR =
    '<svg class="gear-icon" viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">' +
    '<g transform="translate(32,32)" fill="#e9d5ff">' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(45)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(90)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(135)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(180)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(225)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(270)"/>' +
    '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(315)"/>' +
    '<circle r="17"/><circle r="9" fill="#1a1625"/><circle r="5"/><circle r="2.2" fill="#1a1625"/>' +
    '</g></svg>';

  function styleLogos() {
    var el = document.getElementById('dr-reg-polish-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-reg-polish-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '.dr-reg-card .dr-reg-logo{width:44px;height:44px;border-radius:12px;margin:0 auto 0.75rem;',
      'display:grid;place-items:center;background:linear-gradient(135deg,#6d5a9a,#2a1f3d);',
      'box-shadow:0 4px 16px rgba(109,90,154,0.35);color:#e9d5ff}',
      '.dr-reg-card .dr-reg-logo .gear-icon{width:70%;height:70%;display:block}'
    ].join('');
  }

  function putGear() {
    document.querySelectorAll('.dr-reg-card .dr-reg-logo').forEach(function (logo) {
      if (!logo.querySelector('.gear-icon')) logo.innerHTML = GEAR;
    });
  }

  function ensureEmpConfirm() {
    var form = document.getElementById('dr-form-reg-employee');
    if (!form || form.querySelector('#dr-emp-password2')) return;
    var pass = form.querySelector('#dr-emp-password');
    if (!pass) return;
    var group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML =
      '<label for="dr-emp-password2">Confirm Password</label>' +
      '<input type="password" id="dr-emp-password2" required minlength="4" placeholder="••••••••" autocomplete="new-password"/>';
    var pg = pass.closest ? pass.closest('.form-group') : pass.parentNode;
    if (pg && pg.parentNode) {
      if (pg.nextSibling) pg.parentNode.insertBefore(group, pg.nextSibling);
      else pg.parentNode.appendChild(group);
    }
    if (!form.__drConfirmWired) {
      form.__drConfirmWired = 1;
      form.addEventListener(
        'submit',
        function (e) {
          var p1 = document.getElementById('dr-emp-password');
          var p2 = document.getElementById('dr-emp-password2');
          if (p1 && p2 && p1.value !== p2.value) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            var err = form.querySelector('.dr-reg-err');
            if (err) {
              err.textContent = 'Passwords do not match.';
              err.classList.add('is-on');
            } else {
              alert('Passwords do not match.');
            }
          }
        },
        true
      );
    }
  }

  function polishAdminLink() {
    var la = document.getElementById('login-agent');
    if (!la) return;
    la.querySelectorAll('.login-switch').forEach(function (p) {
      var a = p.querySelector('a');
      if (!a) return;
      while (p.firstChild) p.removeChild(p.firstChild);
      a.textContent = 'Create an admin account';
      p.appendChild(a);
    });
  }

  function apply() {
    styleLogos();
    putGear();
    ensureEmpConfirm();
    polishAdminLink();
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  setTimeout(apply, 3200);

  document.addEventListener(
    'click',
    function () {
      setTimeout(apply, 50);
      setTimeout(apply, 200);
    },
    true
  );

  window.DRRegPolish = { v: 1, refresh: apply };
})();
