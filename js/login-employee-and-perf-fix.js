/**
 * Divine Rays — Employee login fix + typing freeze reduce
 * 1) Admin fast-fix must not steal Employee Sign in
 * 2) Developer can enter Employee portal from Employee tab
 * 3) Soften main-thread work while typing (particles freeze fix)
 */
(function () {
  'use strict';
  if (window.__DR_EMP_PERF_FIX >= 1) return;
  window.__DR_EMP_PERF_FIX = 1;

  var DEVS = {
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1,
    'kirzhianquijano': 1,
    'iiyasora2002': 1
  };
  function norm(v) { return String(v || '').toLowerCase().trim(); }
  function isDev(v) { return !!DEVS[norm(v)]; }

  function isEye(btn) {
    if (!btn) return false;
    try {
      if (btn.classList && btn.classList.contains('dr-pw-toggle')) return true;
      if (btn.closest && btn.closest('.dr-pw-wrap')) return true;
    } catch (e) {}
    return false;
  }

  document.addEventListener(
    'click',
    function (ev) {
      var btn = ev.target && (ev.target.closest ? ev.target.closest('button, [type="submit"]') : null);
      if (!btn || isEye(btn)) return;
      var form = btn.closest && btn.closest('#login-customer');
      if (!form) return;
      window.__drEmployeeLoginClick = 1;
      setTimeout(function () { window.__drEmployeeLoginClick = 0; }, 0);
    },
    true
  );

  function resetSubmit(form) {
    if (!form) return;
    form.querySelectorAll('button[type="submit"], button.btn-primary, button.btn-full').forEach(function (b) {
      if (isEye(b)) return;
      try {
        b.disabled = false;
        b.style.opacity = '';
        b.style.pointerEvents = '';
        var prev = b.getAttribute('data-dr-prev-label');
        if (prev) b.textContent = prev;
        else if (/signing/i.test(b.textContent || '')) b.textContent = 'Sign In';
      } catch (e) {}
    });
  }

  function setSubmitSigning(form) {
    var btn = null;
    form.querySelectorAll('button[type="submit"], button.btn-primary, button.btn-full').forEach(function (b) {
      if (!isEye(b) && !btn) btn = b;
    });
    if (!btn) return null;
    if (!btn.getAttribute('data-dr-prev-label')) {
      btn.setAttribute('data-dr-prev-label', (btn.textContent || 'Sign In').trim());
    }
    btn.textContent = 'Signing in…';
    btn.disabled = true;
    btn.style.opacity = '0.85';
    return btn;
  }

  function getSb() {
    try {
      if (window.__drSb) return window.__drSb;
      if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb();
      if (window.supabaseClient) return window.supabaseClient;
    } catch (e) {}
    return null;
  }

  function showEmployeePortal() {
    try {
      sessionStorage.setItem('dr_login_tab', 'customer');
      sessionStorage.setItem('dr_dev_portal_pref', 'employee');
    } catch (e) {}
    var ls = document.getElementById('login-screen');
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    try {
      document.body.classList.add('dr-portal-ok', 'is-portal');
      document.body.classList.remove('dr-pending-blocked', 'is-login');
    } catch (e2) {}
    if (ls) {
      ls.hidden = true;
      ls.style.cssText = 'display:none!important';
    }
    if (pa) {
      pa.classList.remove('active');
      try { pa.style.display = 'none'; } catch (e3) {}
    }
    if (pc) {
      pc.classList.add('active');
      try {
        pc.style.removeProperty('display');
        pc.style.display = '';
      } catch (e4) {}
    }
    if (window.DR && window.DR.toast) window.DR.toast('Successfully logged in', 'success');
    if (window.DRDevPortal && typeof window.DRDevPortal.apply === 'function') {
      try { window.DRDevPortal.apply(window.__drProfile); } catch (e5) {}
    }
  }

  async function doEmployeeLogin(form) {
    var emailEl = document.getElementById('cust-email') || (form && form.querySelector('input[type="email"]'));
    var passEl = document.getElementById('cust-password') || (form && form.querySelector('input[type="password"]'));
    var email = emailEl ? String(emailEl.value || '').trim() : '';
    var password = passEl ? passEl.value : '';
    if (!email || !password) {
      if (window.showError) window.showError('login-customer', !email ? 'Enter your email' : 'Enter your password');
      else alert(!email ? 'Enter your email' : 'Enter your password');
      return;
    }

    setSubmitSigning(form);
    var client = getSb();
    if (!client) {
      resetSubmit(form);
      if (window.DR && window.DR.toast) window.DR.toast('Connection not ready — try again', 'error');
      return;
    }

    try {
      var r = await client.auth.signInWithPassword({ email: email, password: password });
      if (r.error) throw r.error;
      var user = r.data && r.data.user;
      window.__drUser = user;
      var em = norm(email);
      if (isDev(em)) window.__drIsDeveloper = true;
      try {
        sessionStorage.setItem('dr_session_email', em);
        sessionStorage.setItem('dr_login_tab', 'customer');
        sessionStorage.setItem('dr_dev_portal_pref', 'employee');
      } catch (e0) {}

      try {
        var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (pr && pr.data) window.__drProfile = pr.data;
        else window.__drProfile = { id: user.id, email: email, role: 'customer' };
      } catch (e1) {
        window.__drProfile = { id: user.id, email: email, role: 'customer' };
      }

      if (isDev(em) || window.__drIsDeveloper) {
        showEmployeePortal();
        resetSubmit(form);
        return;
      }

      var role = String((window.__drProfile && window.__drProfile.role) || 'customer').toLowerCase();
      if (role === 'agent' || role === 'admin') {
        if (window.DR && window.DR.toast) {
          window.DR.toast('This account belongs to Admin portal — use the Admin tab', 'error');
        }
        try { await client.auth.signOut({ scope: 'local' }); } catch (e2) {}
        resetSubmit(form);
        return;
      }
      showEmployeePortal();
      resetSubmit(form);
    } catch (err) {
      resetSubmit(form);
      var msg = (err && err.message) || 'Login failed';
      if (window.showError) window.showError('login-customer', msg);
      else if (window.DR && window.DR.toast) window.DR.toast(msg, 'error');
      else alert(msg);
    }
  }

  function wireEmployeeForm() {
    var form = document.getElementById('login-customer');
    if (!form || form.__drEmpFixBound) return;
    form.__drEmpFixBound = 1;
    form.addEventListener(
      'submit',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        doEmployeeLogin(form);
      },
      true
    );
    form.addEventListener(
      'click',
      function (e) {
        var btn = e.target && (e.target.closest ? e.target.closest('button[type="submit"], button.btn-primary') : null);
        if (!btn || isEye(btn)) return;
        if (!form.contains(btn)) return;
        e.preventDefault();
        e.stopPropagation();
        doEmployeeLogin(form);
      },
      true
    );
  }

  function softenTyping() {
    document.addEventListener(
      'focusin',
      function (ev) {
        var t = ev.target;
        if (!t || !t.closest) return;
        if (!t.closest('#login-screen, .login-card, .dr-reg-card')) return;
        if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA' && t.tagName !== 'SELECT') return;
        window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
        window.__DR_TYPING = 1;
      },
      true
    );
    document.addEventListener(
      'focusout',
      function () {
        setTimeout(function () {
          var a = document.activeElement;
          if (a && a.closest && a.closest('#login-screen input, #login-screen textarea, .dr-reg-card input')) return;
          window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
          window.__DR_TYPING = 0;
        }, 200);
      },
      true
    );
  }

  function boot() {
    wireEmployeeForm();
    softenTyping();
  }
  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);

  window.DREmpPerfFix = { v: 1, login: doEmployeeLogin };
})();
