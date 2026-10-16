/**
 * Divine Rays — Employee login + post-login portal loader v2
 * After sign-in: loading UI → soft reload with session (loads full portal)
 */
(function () {
  'use strict';
  if (window.__DR_EMP_PERF_FIX >= 2) return;
  window.__DR_EMP_PERF_FIX = 2;

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
    var el = document.getElementById('dr-portal-loader');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dr-portal-loader';
      el.innerHTML =
        '<style id="dr-portal-loader-css">' +
        '#dr-portal-loader{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;' +
        'flex-direction:column;gap:1.1rem;background:linear-gradient(180deg,#1a0c38 0%,#0c0618 100%);' +
        'transition:opacity .4s ease}' +
        '#dr-portal-loader.is-done{opacity:0;pointer-events:none}' +
        '#dr-portal-loader .pl-gear{width:64px;height:64px;border-radius:14px;box-shadow:0 8px 28px rgba(109,90,154,.4)}' +
        '#dr-portal-loader .pl-spin{transform-origin:32px 32px;animation:drPLSpin 1.35s linear infinite}' +
        '@keyframes drPLSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}' +
        '#dr-portal-loader .pl-title{color:#eeeef6;font-weight:650;font-size:1.15rem;margin:0}' +
        '#dr-portal-loader .pl-sub{color:#9494ae;font-size:.85rem;margin:0}' +
        '</style>' +
        '<svg class="pl-gear" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">' +
        '<defs><linearGradient id="drPlBg" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#6d5a9a"/><stop offset="100%" stop-color="#2a1f3d"/></linearGradient>' +
        '<linearGradient id="drPlMetal" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#f3e8ff"/><stop offset="100%" stop-color="#c4b5fd"/></linearGradient></defs>' +
        '<rect width="64" height="64" rx="14" fill="url(#drPlBg)"/>' +
        '<g class="pl-spin" fill="url(#drPlMetal)">' +
        '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="translate(32 32)"/>' +
        '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="translate(32 32) rotate(45)"/>' +
        '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="translate(32 32) rotate(90)"/>' +
        '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="translate(32 32) rotate(135)"/>' +
        '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="translate(32 32) rotate(180)"/>' +
        '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="translate(32 32) rotate(225)"/>' +
        '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="translate(32 32) rotate(270)"/>' +
        '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="translate(32 32) rotate(315)"/>' +
        '<circle cx="32" cy="32" r="17"/><circle cx="32" cy="32" r="9" fill="#2a1f3d"/>' +
        '<circle cx="32" cy="32" r="5"/><circle cx="32" cy="32" r="2.2" fill="#1a1625"/>' +
        '</g></svg>' +
        '<p class="pl-title">Loading portal…</p>' +
        '<p class="pl-sub" id="dr-portal-loader-sub">Preparing workspace</p>';
      document.body.appendChild(el);
    }
    el.classList.remove('is-done');
    el.style.display = 'flex';
    var sub = document.getElementById('dr-portal-loader-sub');
    if (sub) sub.textContent = msg || 'Preparing workspace';
    try {
      var ls = document.getElementById('login-screen');
      if (ls) ls.style.cssText = 'display:none!important';
    } catch (e) {}
  }

  function hidePortalLoader() {
    var el = document.getElementById('dr-portal-loader');
    if (!el) return;
    el.classList.add('is-done');
    setTimeout(function () {
      try { if (el.parentNode) el.parentNode.removeChild(el); } catch (e) {}
    }, 500);
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
    showPortalLoader('Loading portal…');
    try {
      sessionStorage.setItem('dr_login_tab', roleHint === 'agent' || roleHint === 'admin' ? 'agent' : 'customer');
      if (roleHint === 'customer' || roleHint === 'employee') {
        sessionStorage.setItem('dr_dev_portal_pref', 'employee');
      } else {
        sessionStorage.setItem('dr_dev_portal_pref', 'admin');
      }
      sessionStorage.removeItem('dr_force_emp_once');
      sessionStorage.setItem('dr_post_login_boot', '1');
    } catch (e) {}
    await new Promise(function (r) { setTimeout(r, 450); });
    location.reload();
  }

  async function doEmployeeLogin(form) {
    var emailEl = document.getElementById('cust-email') || (form && form.querySelector('input[type="email"]'));
    var passEl = document.getElementById('cust-password') || (form && form.querySelector('input[type="password"]'));
    var email = emailEl ? String(emailEl.value || '').trim() : '';
    var password = passEl ? passEl.value : '';
    if (!email || !password) {
      if (window.showError) window.showError('login-customer', !email ? 'Enter your email' : 'Enter your password');
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
        else window.__drProfile = { id: user.id, email: email, role: isDev(em) ? 'developer' : 'customer' };
      } catch (e1) {
        window.__drProfile = { id: user.id, email: email, role: isDev(em) ? 'developer' : 'customer' };
      }

      var role = String((window.__drProfile && window.__drProfile.role) || '').toLowerCase();
      if (!isDev(em) && (role === 'agent' || role === 'admin' || role === 'staff')) {
        if (window.DR && window.DR.toast) {
          window.DR.toast('Admin accounts must sign in from the Admin tab', 'error');
        }
        try { await client.auth.signOut({ scope: 'local' }); } catch (e2) {}
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
    if (!form || form.__drEmpFixBound2) return;
    form.__drEmpFixBound2 = 1;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();
      doEmployeeLogin(form);
    }, true);
    form.addEventListener('click', function (e) {
      var btn = e.target && (e.target.closest ? e.target.closest('button[type="submit"], button.btn-primary') : null);
      if (!btn || isEye(btn)) return;
      if (!form.contains(btn)) return;
      e.preventDefault();
      e.stopPropagation();
      doEmployeeLogin(form);
    }, true);
  }

  // After reload from post-login boot: apply preferred portal + dismiss loader
  try {
    if (sessionStorage.getItem('dr_post_login_boot') === '1') {
      sessionStorage.removeItem('dr_post_login_boot');
      showPortalLoader('Opening portal…');
      var n = 0;
      var t = setInterval(function () {
        n++;
        try {
          if (window.DRDevPortal && window.DRDevPortal.apply) {
            window.DRDevPortal.apply(window.__drProfile);
          }
        } catch (e) {}
        if (portalLooksReady() || n > 30) {
          clearInterval(t);
          hidePortalLoader();
        }
      }, 200);
    }
  } catch (e) {}

  document.addEventListener('focusin', function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    if (!t.closest('#login-screen, .login-card')) return;
    if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') return;
    window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
  }, true);
  document.addEventListener('focusout', function () {
    setTimeout(function () { window.__DR_PAUSE_LOGIN_SCRIPTS = 0; }, 200);
  }, true);

  function boot() { wireEmployeeForm(); }
  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);

  window.DREmpPerfFix = { v: 2, login: doEmployeeLogin, bootWorkspace: bootWorkspace };
})();
