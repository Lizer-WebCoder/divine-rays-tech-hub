/**
 * Divine Rays — Employee login + single post-login transition v4
 * One loading UI only (rings) → portal; never flash boot gear after sign-in
 */
(function () {
  'use strict';
  if (window.__DR_EMP_PERF_FIX >= 4) return;
  window.__DR_EMP_PERF_FIX = 4;

  var DEVS = {
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1,
    'kirzhianquijano': 1,
    'iiyasora2002': 1
  };
  function norm(v) {
    return String(v || '').toLowerCase().trim();
  }
  function isDev(v) {
    return !!DEVS[norm(v)];
  }

  function isEye(btn) {
    if (!btn) return false;
    try {
      if (btn.classList && btn.classList.contains('dr-pw-toggle')) return true;
      if (btn.closest && btn.closest('.dr-pw-wrap')) return true;
    } catch (e) {}
    return false;
  }

  function getSb() {
    try {
      if (window.__drSb) return window.__drSb;
      if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb();
      if (window.supabaseClient) return window.supabaseClient;
    } catch (e) {}
    return null;
  }

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

  function showPortalLoader(msg) {
    try {
      ['dr-phase-boot', 'boot'].forEach(function (id) {
        var b = document.getElementById(id);
        if (b) {
          b.classList.add('is-done');
          b.style.cssText = 'display:none!important;opacity:0;pointer-events:none';
        }
      });
    } catch (e0) {}

    var existing = document.getElementById('dr-post-login-boot');
    if (existing) {
      existing.classList.add('is-on');
      existing.style.display = 'flex';
      existing.style.opacity = '1';
      var sub0 = existing.querySelector('.pl-sub');
      if (sub0) sub0.textContent = msg || 'Preparing your workspace';
      try {
        var ls0 = document.getElementById('login-screen');
        if (ls0) ls0.style.cssText = 'display:none!important';
      } catch (e1) {}
      return;
    }

    var el = document.getElementById('dr-portal-loader');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dr-portal-loader';
      el.innerHTML =
        '<style id="dr-portal-loader-css">' +
        '#dr-portal-loader{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;' +
        'flex-direction:column;gap:1.35rem;background:radial-gradient(ellipse at 50% 40%,#1e1240 0%,#0c0618 70%);' +
        'transition:opacity .4s ease}' +
        '#dr-portal-loader.is-done{opacity:0;pointer-events:none}' +
        '#dr-portal-loader .pl-rings{position:relative;width:72px;height:72px}' +
        '#dr-portal-loader .pl-ring{position:absolute;inset:0;border-radius:50%;border:2px solid transparent;' +
        'border-top-color:#a78bfa;border-right-color:rgba(167,139,250,.35);animation:drPlSpin 1s linear infinite}' +
        '#dr-portal-loader .pl-ring:nth-child(2){inset:10px;border-top-color:#c4b5fd;animation-duration:1.4s;animation-direction:reverse}' +
        '#dr-portal-loader .pl-ring:nth-child(3){inset:20px;border-top-color:#8b5cf6;animation-duration:.85s}' +
        '#dr-portal-loader .pl-core{position:absolute;inset:26px;border-radius:50%;' +
        'background:radial-gradient(circle,#c4b5fd 0%,#7c6af0 70%);box-shadow:0 0 20px rgba(139,92,246,.55);' +
        'animation:drPlPulse 1.2s ease-in-out infinite}' +
        '@keyframes drPlSpin{to{transform:rotate(360deg)}}' +
        '@keyframes drPlPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.85);opacity:.7}}' +
        '#dr-portal-loader .pl-title{color:#eeeef6;font-weight:650;font-size:1.1rem;margin:0;letter-spacing:.02em}' +
        '#dr-portal-loader .pl-sub{color:#9494ae;font-size:.82rem;margin:0}' +
        '#dr-portal-loader .pl-bar{width:160px;height:4px;border-radius:99px;background:rgba(139,92,246,.2);overflow:hidden}' +
        '#dr-portal-loader .pl-bar>i{display:block;height:100%;width:40%;border-radius:99px;' +
        'background:linear-gradient(90deg,#7c6af0,#c4b5fd,#7c6af0);background-size:200% 100%;' +
        'animation:drPlBar 1.1s ease-in-out infinite}' +
        '@keyframes drPlBar{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}' +
        '</style>' +
        '<div class="pl-rings" aria-hidden="true">' +
        '<div class="pl-ring"></div><div class="pl-ring"></div><div class="pl-ring"></div>' +
        '<div class="pl-core"></div></div>' +
        '<p class="pl-title">Opening portal…</p>' +
        '<p class="pl-sub" id="dr-portal-loader-sub">Preparing your workspace</p>' +
        '<div class="pl-bar"><i></i></div>';
      document.body.appendChild(el);
    }
    el.classList.remove('is-done');
    el.style.display = 'flex';
    var sub = document.getElementById('dr-portal-loader-sub');
    if (sub) sub.textContent = msg || 'Preparing your workspace';
    try {
      var ls = document.getElementById('login-screen');
      if (ls) ls.style.cssText = 'display:none!important';
    } catch (e) {}
  }

  function hidePortalLoader() {
    ['dr-portal-loader', 'dr-post-login-boot'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      try {
        el.classList.add('is-done');
        el.classList.remove('is-on');
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        setTimeout(function () {
          try {
            if (el.parentNode) el.parentNode.removeChild(el);
          } catch (e) {}
        }, 400);
      } catch (e2) {}
    });
  }

  function portalLooksReady() {
    try {
      if (window.__drFullLoaded) return true;
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (pc && pc.classList.contains('active')) {
        if ((pc.innerHTML || '').length > 800) return true;
        if (pc.querySelector('.mode-brand, .topbar, nav, .sidebar, header, main')) return true;
      }
      if (pa && pa.classList.contains('active')) {
        if ((pa.innerHTML || '').length > 800) return true;
        if (pa.querySelector('.mode-brand, .topbar, nav, .sidebar, header, main, .view')) return true;
      }
    } catch (e) {}
    return false;
  }

  async function bootWorkspace(roleHint) {
    showPortalLoader('Opening portal…');
    try {
      sessionStorage.setItem(
        'dr_login_tab',
        roleHint === 'agent' || roleHint === 'admin' ? 'agent' : 'customer'
      );
      if (roleHint === 'customer' || roleHint === 'employee') {
        sessionStorage.setItem('dr_dev_portal_pref', 'employee');
      } else {
        sessionStorage.setItem('dr_dev_portal_pref', 'admin');
      }
      sessionStorage.removeItem('dr_force_emp_once');
      sessionStorage.setItem('dr_post_login_boot', '1');
      sessionStorage.setItem('dr_skip_boot_gear', '1');
    } catch (e) {}
    await new Promise(function (r) {
      setTimeout(r, 400);
    });
    location.reload();
  }

  async function doEmployeeLogin(form) {
    var emailEl =
      document.getElementById('cust-email') || (form && form.querySelector('input[type="email"]'));
    var passEl =
      document.getElementById('cust-password') ||
      (form && form.querySelector('input[type="password"]'));
    var email = emailEl ? String(emailEl.value || '').trim() : '';
    var password = passEl ? passEl.value : '';
    if (!email || !password) {
      if (window.showError)
        window.showError('login-customer', !email ? 'Enter your email' : 'Enter your password');
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
        sessionStorage.removeItem('dr_force_emp_once');
      } catch (e0) {}

      try {
        var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (pr && pr.data) window.__drProfile = pr.data;
        else
          window.__drProfile = {
            id: user.id,
            email: email,
            role: isDev(em) ? 'developer' : 'customer'
          };
      } catch (e1) {
        window.__drProfile = {
          id: user.id,
          email: email,
          role: isDev(em) ? 'developer' : 'customer'
        };
      }

      var role = String((window.__drProfile && window.__drProfile.role) || '').toLowerCase();
      if (!isDev(em) && (role === 'agent' || role === 'admin' || role === 'staff')) {
        if (window.DR && window.DR.toast) {
          window.DR.toast('Admin accounts must sign in from the Admin tab', 'error');
        }
        try {
          await client.auth.signOut({ scope: 'local' });
        } catch (e2) {}
        resetSubmit(form);
        return;
      }

      if (window.DR && window.DR.toast) window.DR.toast('Successfully logged in', 'success');
      await bootWorkspace('customer');
    } catch (err) {
      resetSubmit(form);
      var msg = (err && err.message) || 'Login failed';
      if (window.showError) window.showError('login-customer', msg);
      else if (window.DR && window.DR.toast) window.DR.toast(msg, 'error');
    }
  }

  function wireEmployeeForm() {
    var form = document.getElementById('login-customer');
    if (!form || form.__drEmpFixBound3) return;
    form.__drEmpFixBound3 = 1;
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
        var btn =
          e.target &&
          (e.target.closest ? e.target.closest('button[type="submit"], button.btn-primary') : null);
        if (!btn || isEye(btn)) return;
        if (!form.contains(btn)) return;
        e.preventDefault();
        e.stopPropagation();
        doEmployeeLogin(form);
      },
      true
    );
  }

  try {
    if (sessionStorage.getItem('dr_post_login_boot') === '1') {
      sessionStorage.removeItem('dr_post_login_boot');
      showPortalLoader('Opening portal…');
      var n = 0;
      var t = setInterval(function () {
        n++;
        try {
          ['dr-phase-boot', 'boot', 'dr-post-login-boot'].forEach(function (id) {
            var b = document.getElementById(id);
            if (b && id !== 'dr-post-login-boot') {
              b.classList.add('is-done');
              b.style.cssText = 'display:none!important;opacity:0;pointer-events:none';
            }
          });
          if (window.DRDevPortal && window.DRDevPortal.apply) {
            window.DRDevPortal.apply(window.__drProfile);
          }
        } catch (e) {}
        if (portalLooksReady() || n > 25) {
          clearInterval(t);
          hidePortalLoader();
          try {
            sessionStorage.removeItem('dr_skip_boot_gear');
          } catch (e2) {}
        }
      }, 200);
    }
  } catch (e) {}

  try {
    if (sessionStorage.getItem('dr_skip_boot_gear') === '1') {
      var kill = function () {
        ['dr-phase-boot', 'boot'].forEach(function (id) {
          var b = document.getElementById(id);
          if (b) {
            b.classList.add('is-done');
            b.style.cssText = 'display:none!important;opacity:0;pointer-events:none';
          }
        });
      };
      kill();
      setTimeout(kill, 50);
      setTimeout(kill, 300);
      setTimeout(kill, 900);
    }
  } catch (e) {}

  document.addEventListener(
    'focusin',
    function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      if (!t.closest('#login-screen, .login-card')) return;
      if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') return;
      window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
    },
    true
  );
  document.addEventListener(
    'focusout',
    function () {
      setTimeout(function () {
        window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
      }, 200);
    },
    true
  );

  function boot() {
    wireEmployeeForm();
  }
  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);

  window.DREmpPerfFix = { v: 4, login: doEmployeeLogin, bootWorkspace: bootWorkspace };
})();
