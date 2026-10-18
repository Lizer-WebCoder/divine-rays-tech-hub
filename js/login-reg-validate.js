/**
 * Divine Rays — registration validation v3
 * Visible error messages; success confirm cards with check animation.
 */
(function () {
  'use strict';
  if (window.__DR_REG_VALIDATE >= 3) return;
  window.__DR_REG_VALIDATE = 3;

  var DUP_MSG = 'This email is already registered. Please use a different email.';

  var CSS =
    '.dr-reg-card.dr-reg-error{' +
    'border-color:rgba(248,113,113,.7)!important;' +
    'box-shadow:0 0 0 1px rgba(239,68,68,.5),0 0 22px rgba(239,68,68,.55),' +
    '0 0 52px rgba(185,28,28,.4),0 0 88px rgba(127,29,29,.28)!important;' +
    'transition:box-shadow .18s ease,border-color .18s ease}' +
    '.dr-reg-card:not(.dr-reg-error){transition:box-shadow .18s ease,border-color .18s ease}' +
    '.dr-reg-card .form-group input.dr-field-bad{' +
    'border-color:rgba(248,113,113,.75)!important;box-shadow:0 0 0 3px rgba(239,68,68,.18)!important}' +
    '.dr-reg-card .dr-reg-err{display:none!important;margin:0 0 0.85rem;padding:0.6rem 0.8rem;border-radius:10px;' +
    'font-size:0.84rem;line-height:1.4;text-align:center;font-weight:500}' +
    '.dr-reg-card .dr-reg-err.is-on{display:block!important;color:#fecaca;background:rgba(127,29,29,.35);' +
    'border:1px solid rgba(248,113,113,.45)}' +
    '#dr-reg-success{position:fixed;inset:0;z-index:100060;display:none;align-items:center;justify-content:center;' +
    'padding:1.25rem;background:rgba(8,5,18,.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}' +
    '#dr-reg-success.is-on{display:flex}' +
    '#dr-reg-success .dr-rs-card{width:min(360px,100%);border-radius:18px;padding:1.75rem 1.5rem 1.35rem;' +
    'background:radial-gradient(ellipse at 50% 0%,rgba(109,90,154,.35),transparent 55%),rgba(22,16,38,.96);' +
    'border:1px solid rgba(167,139,250,.4);box-shadow:0 20px 50px rgba(0,0,0,.5),0 0 32px rgba(139,92,246,.28);' +
    'text-align:center;color:#eeeef6;font-family:Inter,system-ui,sans-serif}' +
    '#dr-reg-success .dr-rs-check{width:64px;height:64px;margin:0 auto 1rem;border-radius:50%;' +
    'background:rgba(34,197,94,.15);border:2px solid rgba(74,222,128,.55);display:flex;align-items:center;justify-content:center;' +
    'animation:drRsPop .45s ease}' +
    '#dr-reg-success .dr-rs-check svg{width:34px;height:34px;stroke:#4ade80;stroke-width:2.6;fill:none;' +
    'stroke-linecap:round;stroke-linejoin:round}' +
    '#dr-reg-success .dr-rs-check .dr-rs-path{stroke-dasharray:48;stroke-dashoffset:48;animation:drRsDraw .55s ease .15s forwards}' +
    '@keyframes drRsPop{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}' +
    '@keyframes drRsDraw{to{stroke-dashoffset:0}}' +
    '#dr-reg-success .dr-rs-title{margin:0 0 .45rem;font-size:1.12rem;font-weight:650}' +
    '#dr-reg-success .dr-rs-msg{margin:0 0 1.25rem;font-size:.88rem;line-height:1.45;color:#b4b4c8}' +
    '#dr-reg-success .dr-rs-ok{border:0;border-radius:11px;padding:.65rem 1.4rem;font-size:.9rem;font-weight:600;' +
    'cursor:pointer;background:linear-gradient(135deg,#8b5cf6,#6d5a9a);color:#fff;' +
    'box-shadow:0 6px 18px rgba(139,92,246,.35)}' +
    '#dr-reg-success .dr-rs-ok:hover{filter:brightness(1.06)}';

  function injectCss() {
    var el = document.getElementById('dr-reg-validate-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-reg-validate-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
  }

  function getSb() {
    try {
      if (window.__drSb) return window.__drSb;
      if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb();
      if (window.supabaseClient) return window.supabaseClient;
    } catch (e) {}
    return null;
  }

  function cardOf(form) {
    return form && form.closest ? form.closest('.dr-reg-card') : null;
  }

  function errEl(form) {
    var card = cardOf(form);
    if (card) {
      var e = card.querySelector('.dr-reg-err');
      if (e) return e;
    }
    return form ? form.querySelector('.dr-reg-err') : null;
  }

  function setError(form, msg, fieldIds) {
    var card = cardOf(form);
    if (card) card.classList.add('dr-reg-error');
    var e = errEl(form);
    if (e) {
      e.textContent = msg || '';
      e.classList.add('is-on');
      e.style.display = 'block';
    }
    (fieldIds || []).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('dr-field-bad');
    });
  }

  function clearError(form) {
    var card = cardOf(form);
    if (card) card.classList.remove('dr-reg-error');
    var e = errEl(form);
    if (e) {
      e.textContent = '';
      e.classList.remove('is-on');
      e.style.display = 'none';
    }
    if (form) {
      form.querySelectorAll('.dr-field-bad').forEach(function (el) {
        el.classList.remove('dr-field-bad');
      });
    }
  }

  function isDupMsg(msg) {
    var m = String(msg || '').toLowerCase();
    return (
      m.indexOf('already') !== -1 ||
      m.indexOf('registered') !== -1 ||
      m.indexOf('exists') !== -1 ||
      m.indexOf('duplicate') !== -1
    );
  }

  function isDuplicateSignup(r, err) {
    if (isDupMsg(err && (err.message || err.error_description))) return true;
    try {
      var user = r && r.data && r.data.user;
      if (!user) return false;
      var ids = user.identities;
      if (Array.isArray(ids) && ids.length === 0) return true;
    } catch (e) {}
    return false;
  }

  async function emailTaken(client, email) {
    email = String(email || '').trim().toLowerCase();
    if (!email || !client) return false;
    try {
      var pr = await client.from('profiles').select('id,email').ilike('email', email).limit(1);
      if (pr && !pr.error && pr.data && pr.data.length) return true;
    } catch (e) {}
    try {
      var pr2 = await client.from('profiles').select('id,email').eq('email', email).limit(1);
      if (pr2 && !pr2.error && pr2.data && pr2.data.length) return true;
    } catch (e2) {}
    return false;
  }

  function ensureEmpConfirm() {
    var pass = document.getElementById('dr-emp-password');
    if (!pass || document.getElementById('dr-emp-password2')) return;
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
    }
    return true;
  }

  function wireLivePasswords() {
    ensureEmpConfirm();
    [
      ['dr-emp-password', 'dr-emp-password2'],
      ['dr-adm-password', 'dr-adm-password2']
    ].forEach(function (pair) {
      var p1 = document.getElementById(pair[0]);
      var p2 = document.getElementById(pair[1]);
      if (!p1 || !p2 || p1.__drPwLive3) return;
      p1.__drPwLive3 = 1;
      p2.__drPwLive3 = 1;
      var h = function () {
        checkPasswords(p1.closest('form'), pair[0], pair[1], true);
      };
      p1.addEventListener('input', h);
      p2.addEventListener('input', h);
    });
  }

  function goLogin(tab) {
    try {
      if (window.DRRegCards && window.DRRegCards.showLogin) window.DRRegCards.showLogin();
    } catch (e) {}
    try {
      if (typeof window.showForm === 'function') {
        window.showForm(tab === 'agent' ? 'login-agent' : 'login-customer');
      }
    } catch (e2) {}
    try {
      if (typeof window.switchLoginTab === 'function') window.switchLoginTab(tab);
    } catch (e3) {}
    try {
      sessionStorage.setItem('dr_login_tab', tab === 'agent' ? 'agent' : 'customer');
    } catch (e4) {}
  }

  function showSuccess(kind) {
    injectCss();
    var el = document.getElementById('dr-reg-success');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dr-reg-success';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      document.body.appendChild(el);
    }
    var isAdmin = kind === 'admin';
    var title = 'Successfully created an account';
    var msg = isAdmin
      ? 'Your staff account has been submitted and is pending Developer approval. You will be able to sign in once it has been approved.'
      : 'Your employee account is ready. You can now sign in with your email and password.';
    el.innerHTML =
      '<div class="dr-rs-card">' +
      '<div class="dr-rs-check" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24"><path class="dr-rs-path" d="M5 13l4 4L19 7"/></svg>' +
      '</div>' +
      '<h2 class="dr-rs-title">' +
      title +
      '</h2>' +
      '<p class="dr-rs-msg">' +
      msg +
      '</p>' +
      '<button type="button" class="dr-rs-ok">OK</button>' +
      '</div>';
    el.classList.add('is-on');
    el.style.display = 'flex';
    var ok = el.querySelector('.dr-rs-ok');
    function close() {
      el.classList.remove('is-on');
      el.style.display = 'none';
      goLogin(isAdmin ? 'agent' : 'customer');
    }
    if (ok) ok.addEventListener('click', close);
    el.onclick = function (e) {
      if (e.target === el) close();
    };
  }

  async function handleEmployee(form) {
    ensureEmpConfirm();
    clearError(form);
    var name = (document.getElementById('dr-emp-name').value || '').trim();
    var email = (document.getElementById('dr-emp-email').value || '').trim();
    var branch = document.getElementById('dr-emp-branch').value;
    var role = document.getElementById('dr-emp-role').value;
    var password = document.getElementById('dr-emp-password').value;
    if (!name || !email || !branch || !role || !password) {
      setError(form, 'Please fill in all fields.', []);
      return;
    }
    if (!checkPasswords(form, 'dr-emp-password', 'dr-emp-password2', false)) return;

    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Creating…';
    }
    var client = getSb();
    if (!client) {
      setError(form, 'Connection not ready. Refresh and try again.', []);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Create Employee Account';
      }
      return;
    }

    try {
      if (await emailTaken(client, email)) {
        setError(form, DUP_MSG, ['dr-emp-email']);
        return;
      }
      var r = await client.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            role: 'customer',
            branch: branch,
            staff_role: role,
            job_title: role
          }
        }
      });
      if (r.error) {
        if (isDuplicateSignup(r, r.error) || isDupMsg(r.error.message)) {
          setError(form, DUP_MSG, ['dr-emp-email']);
          return;
        }
        throw r.error;
      }
      if (isDuplicateSignup(r, null)) {
        setError(form, DUP_MSG, ['dr-emp-email']);
        return;
      }
      try {
        var uid = r.data && r.data.user && r.data.user.id;
        if (uid) {
          await client.from('profiles').upsert({
            id: uid,
            email: email,
            full_name: name,
            role: 'customer',
            branch: branch,
            staff_role: role
          });
        }
      } catch (e3) {}
      form.reset();
      clearError(form);
      showSuccess('employee');
    } catch (err) {
      var msg = (err && err.message) || 'Could not create account';
      if (isDupMsg(msg)) setError(form, DUP_MSG, ['dr-emp-email']);
      else setError(form, msg, []);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Create Employee Account';
      }
    }
  }

  async function handleAdmin(form) {
    clearError(form);
    var name = (document.getElementById('dr-adm-name').value || '').trim();
    var email = (document.getElementById('dr-adm-email').value || '').trim();
    var username = (document.getElementById('dr-adm-username').value || '').trim();
    var role = document.getElementById('dr-adm-role').value;
    var password = document.getElementById('dr-adm-password').value;
    if (!name || !email || !username || !role || !password) {
      setError(form, 'Please fill in all fields.', []);
      return;
    }
    if (!checkPasswords(form, 'dr-adm-password', 'dr-adm-password2', false)) return;
    if (password.length < 6) {
      setError(form, 'Password must be at least 6 characters.', ['dr-adm-password']);
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Creating…';
    }
    var client = getSb();
    if (!client) {
      setError(form, 'Connection not ready. Refresh and try again.', []);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Create Admin Account';
      }
      return;
    }

    try {
      if (await emailTaken(client, email)) {
        setError(form, DUP_MSG, ['dr-adm-email']);
        return;
      }
      var staffRole = role || 'IT Tech Support';
      var rLow = staffRole.toLowerCase();
      var dbRole = rLow === 'admin' || rLow === 'owner' ? 'admin' : 'agent';
      var r = await client.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            username: username,
            role: dbRole,
            staff_role: staffRole
          }
        }
      });
      if (r.error) {
        if (isDuplicateSignup(r, r.error) || isDupMsg(r.error.message)) {
          setError(form, DUP_MSG, ['dr-adm-email']);
          return;
        }
        throw r.error;
      }
      if (isDuplicateSignup(r, null)) {
        setError(form, DUP_MSG, ['dr-adm-email']);
        return;
      }
      var uid = r.data && r.data.user && r.data.user.id;
      if (uid) {
        try {
          await client.from('profiles').upsert({
            id: uid,
            email: email,
            full_name: name,
            username: username,
            role: dbRole,
            staff_role: staffRole,
            approval_status: 'pending'
          });
        } catch (e2) {}
        try {
          var m = JSON.parse(localStorage.getItem('dr_staff_approval') || '{}') || {};
          m[uid] = 'pending';
          m['pending:' + username.toLowerCase()] = 'pending';
          m['pending:' + email.toLowerCase()] = 'pending';
          m['role:' + username.toLowerCase()] = staffRole;
          localStorage.setItem('dr_staff_approval', JSON.stringify(m));
        } catch (e3) {}
      }
      form.reset();
      clearError(form);
      showSuccess('admin');
    } catch (err) {
      var msg = (err && err.message) || 'Could not create account';
      if (isDupMsg(msg)) setError(form, DUP_MSG, ['dr-adm-email']);
      else setError(form, msg, []);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Create Admin Account';
      }
    }
  }

  document.addEventListener(
    'submit',
    function (e) {
      var form = e.target;
      if (!form || !form.closest) return;
      if (!form.closest('.dr-reg-card')) return;
      var isEmp = !!form.closest('#dr-reg-card-employee');
      var isAdm = !!form.closest('#dr-reg-card-admin');
      if (!isEmp && !isAdm) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (isEmp) handleEmployee(form);
      else handleAdmin(form);
    },
    true
  );

  document.addEventListener(
    'input',
    function (e) {
      var t = e.target;
      if (!t || !t.id) return;
      if (t.id === 'dr-emp-email' || t.id === 'dr-adm-email') {
        var form = t.closest('form');
        if (form) {
          var err = errEl(form);
          if (err && isDupMsg(err.textContent)) clearError(form);
        }
      }
    },
    true
  );

  function boot() {
    injectCss();
    ensureEmpConfirm();
    wireLivePasswords();
  }
  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);
  document.addEventListener(
    'click',
    function () {
      setTimeout(boot, 40);
    },
    true
  );

  window.DRRegValidate = { v: 3, setError: setError, clearError: clearError, showSuccess: showSuccess };
})();
