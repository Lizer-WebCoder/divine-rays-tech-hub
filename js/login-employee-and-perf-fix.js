/**
 * Divine Rays — login-employee-and-perf-fix v12
 * Once-only portal open; fade/gear spin owned by post-login-transition.
 */
(function () {
  'use strict';
  if (window.__DR_EMP_PERF_FIX >= 12) return;
  window.__DR_EMP_PERF_FIX = 12;

  function getSb() {
    try {
      if (window.__drSb) return window.__drSb;
      if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb();
      if (window.supabaseClient) return window.supabaseClient;
      var cfg = window.DR_CONFIG || {};
      if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase) {
        window.__drSb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        return window.__drSb;
      }
    } catch (e) {}
    return null;
  }

  function isEye(btn) {
    if (!btn) return false;
    try {
      if (btn.classList && btn.classList.contains('dr-pw-toggle')) return true;
      if (btn.closest && btn.closest('.dr-pw-wrap')) return true;
    } catch (e) {}
    return false;
  }

  function setSubmitSigning(form) {
    try {
      var btn = null;
      (form || document)
        .querySelectorAll('button[type="submit"], button.btn-primary, button.btn-full')
        .forEach(function (b) {
          if (!isEye(b) && !btn) btn = b;
        });
      if (!btn) return;
      if (!btn.getAttribute('data-dr-prev-label')) {
        btn.setAttribute('data-dr-prev-label', (btn.textContent || 'Sign in').trim());
      }
      btn.disabled = true;
      btn.textContent = 'Signing in…';
      btn.style.opacity = '0.85';
    } catch (e) {}
  }

  function resetSubmit(form) {
    try {
      (form || document)
        .querySelectorAll('button[type="submit"], button.btn-primary, button.btn-full')
        .forEach(function (b) {
          if (isEye(b)) return;
          b.disabled = false;
          b.style.opacity = '';
          b.style.pointerEvents = '';
          var prev = b.getAttribute('data-dr-prev-label');
          if (prev) b.textContent = prev;
          else if (/signing/i.test(b.textContent || '')) b.textContent = 'Sign in';
        });
    } catch (e) {}
  }

  function removeGearNodes() {
    ['dr-phase-boot', 'boot'].forEach(function (id) {
      try {
        var b = document.getElementById(id);
        if (!b) return;
        b.classList.add('is-done');
        try {
          if (b.parentNode) b.parentNode.removeChild(b);
        } catch (e) {
          b.style.cssText = 'display:none!important;opacity:0;pointer-events:none';
        }
      } catch (e2) {}
    });
  }

  function clearResidualGates() {
    try {
      window.__DR_TAB_GATE_LOCK = 0;
      window.__DR_TAB_GATE_MSG = '';
      sessionStorage.removeItem('dr_tab_gate_err');
      document.body.classList.remove('dr-tab-blocked', 'dr-pending-blocked', 'is-login');
      document.documentElement.classList.remove('dr-tab-blocked');
    } catch (e) {}
    try {
      if (window.DRForcePending && window.DRForcePending.clearPendingUI)
        window.DRForcePending.clearPendingUI(true);
      if (window.DRForcePending && window.DRForcePending.unlockPortal)
        window.DRForcePending.unlockPortal();
    } catch (e2) {}
  }

  function showPortalLoader(subText) {
    clearResidualGates();
    removeGearNodes();
    var existing = document.getElementById('dr-post-login-boot');
    if (existing) {
      try {
        existing.classList.add('is-on');
        existing.classList.remove('is-done', 'is-fading', 'is-gone');
        existing.style.display = 'flex';
        existing.style.opacity = '1';
        existing.style.visibility = 'visible';
      } catch (e) {}
    }
    var el = document.getElementById('dr-portal-loader');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dr-portal-loader';
      el.innerHTML =
        '<style id="dr-portal-loader-css">' +
        '#dr-portal-loader{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;' +
        'flex-direction:column;gap:1.35rem;background:radial-gradient(ellipse at 50% 40%,#1e1240 0%,#0c0618 70%);' +
        'transition:opacity 0.85s ease,visibility 0.85s ease;opacity:1}' +
        '#dr-portal-loader.is-done,#dr-portal-loader.is-fading{opacity:0;visibility:hidden;pointer-events:none}' +
        '#dr-portal-loader .pl-rings{position:relative;width:76px;height:76px}' +
        '#dr-portal-loader .pl-ring{position:absolute;inset:0;border-radius:50%;border:2.5px solid rgba(167,139,250,0.15);' +
        'border-top-color:#c4b5fd;animation:drPlSpin 1.25s linear infinite}' +
        '#dr-portal-loader .pl-ring:nth-child(2),#dr-portal-loader .pl-ring:nth-child(3){display:none}' +
        '#dr-portal-loader .pl-core{position:absolute;inset:18px;border-radius:50%;' +
        'background:radial-gradient(circle,#ddd6fe 0%,#7c6af0 70%);box-shadow:0 0 28px rgba(139,92,246,.55)}' +
        '@keyframes drPlSpin{to{transform:rotate(360deg)}}' +
        '#dr-portal-loader .pl-title{color:#eeeef6;font-weight:650;font-size:1.1rem;margin:0}' +
        '#dr-portal-loader .pl-sub{color:#9494ae;font-size:.82rem;margin:0}' +
        '#dr-portal-loader .pl-bar{width:160px;height:4px;border-radius:99px;background:rgba(139,92,246,.2);overflow:hidden}' +
        '#dr-portal-loader .pl-bar>i{display:block;height:100%;width:40%;border-radius:99px;' +
        'background:linear-gradient(90deg,#7c6af0,#c4b5fd,#7c6af0);animation:drPlBar 1.4s ease-in-out infinite}' +
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
    var sub = document.getElementById('dr-portal-loader-sub');
    if (sub && subText) sub.textContent = subText;
    el.classList.remove('is-done', 'is-fading', 'is-gone');
    el.style.display = 'flex';
    el.style.opacity = '1';
    el.style.visibility = 'visible';
  }

  function hidePortalLoader() {
    try {
      if (window.DRPostLoginTx && window.DRPostLoginTx.run) {
        window.DRPostLoginTx.run();
        return;
      }
    } catch (e0) {}
    ['dr-portal-loader', 'dr-post-login-boot'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      try {
        el.style.transition = 'opacity 0.85s ease, visibility 0.85s ease';
        el.style.display = 'flex';
        el.style.opacity = '1';
        void el.offsetWidth;
        el.classList.add('is-done', 'is-fading');
        el.classList.remove('is-on');
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
        setTimeout(function () {
          try {
            el.style.display = 'none';
          } catch (e2) {}
        }, 900);
      } catch (e) {
        el.style.display = 'none';
      }
    });
  }

  async function bootWorkspace(roleHint) {
    var existingTab = '';
    try {
      existingTab = sessionStorage.getItem('dr_login_tab') || '';
    } catch (e0) {}
    if ((roleHint === 'customer' || roleHint === 'employee') && existingTab !== 'agent') {
      clearResidualGates();
    }
    if ((roleHint === 'customer' || roleHint === 'employee') && existingTab === 'agent') {
      try {
        sessionStorage.setItem(
          'dr_tab_gate_err',
          'Employee accounts must sign in on the Employee tab.'
        );
        sessionStorage.removeItem('dr_skip_boot_gear');
        sessionStorage.removeItem('dr_post_login_boot');
      } catch (e1) {}
      if (window.DRDevPortal && typeof window.DRDevPortal.apply === 'function') {
        try {
          window.__drProfile = window.__drProfile || { role: 'customer' };
          window.DRDevPortal.apply(window.__drProfile);
        } catch (e2) {}
      }
      return;
    }
    showPortalLoader('Opening portal…');
    try {
      if (existingTab !== 'agent' && existingTab !== 'customer') {
        sessionStorage.setItem(
          'dr_login_tab',
          roleHint === 'agent' || roleHint === 'admin' ? 'agent' : 'customer'
        );
      }
      if (roleHint === 'customer' || roleHint === 'employee') {
        sessionStorage.setItem('dr_dev_portal_pref', 'employee');
        sessionStorage.setItem('dr_login_tab', 'customer');
      } else {
        sessionStorage.setItem('dr_dev_portal_pref', 'admin');
        sessionStorage.setItem('dr_login_tab', 'agent');
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
    clearResidualGates();
    setSubmitSigning(form);
    try {
      sessionStorage.setItem('dr_login_tab', 'customer');
      sessionStorage.setItem('dr_dev_portal_pref', 'employee');
    } catch (e) {}
    var client = getSb();
    if (!client) {
      resetSubmit(form);
      if (window.showError) window.showError('login-customer', 'Connection not ready');
      return;
    }
    try {
      var r = await client.auth.signInWithPassword({ email: email, password: password });
      if (r.error) throw r.error;
      var user = r.data && r.data.user;
      window.__drUser = user;
      var profile = { email: email, role: 'customer' };
      try {
        if (user && user.id) {
          var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
          if (pr && pr.data) profile = pr.data;
        }
      } catch (e3) {}
      window.__drProfile = profile;
      await bootWorkspace('customer');
    } catch (err) {
      resetSubmit(form);
      if (window.showError)
        window.showError('login-customer', (err && err.message) || 'Login failed');
    }
  }

  var __drFinishOnce = false;
  function finishPostLoginBoot() {
    if (__drFinishOnce) return;
    var skip = false;
    try {
      skip =
        sessionStorage.getItem('dr_skip_boot_gear') === '1' ||
        sessionStorage.getItem('dr_post_login_boot') === '1';
    } catch (e) {}
    if (!skip) return;
    __drFinishOnce = true;

    clearResidualGates();

    var tab = '';
    try {
      tab = sessionStorage.getItem('dr_login_tab') || '';
    } catch (e2) {}
    var pref = '';
    try {
      pref = sessionStorage.getItem('dr_dev_portal_pref') || '';
    } catch (e3) {}

    var which = 'employee';
    if (tab === 'agent' || pref === 'admin') which = 'admin';
    if (tab === 'customer' || pref === 'employee') which = 'employee';

    try {
      document.documentElement.removeAttribute('data-dr-hold-portal');
      if (window.DRPortalReadyGate && typeof window.DRPortalReadyGate.release === 'function') {
        window.DRPortalReadyGate.release();
      }
      if (window.DRPortalReadyGate && typeof window.DRPortalReadyGate.setPref === 'function') {
        window.DRPortalReadyGate.setPref(which);
      }
    } catch (eHold) {}

    try {
      document.body.classList.add('dr-portal-ok', 'is-portal');
      document.body.classList.remove('is-login', 'dr-tab-blocked', 'dr-pending-blocked');
      document.documentElement.classList.remove('dr-tab-blocked');
      document.documentElement.setAttribute('data-dr-portal-pref', which);
      if (which === 'employee') {
        document.body.classList.add('is-portal-employee');
        document.body.classList.remove('is-portal-admin');
      } else {
        document.body.classList.add('is-portal-admin');
        document.body.classList.remove('is-portal-employee');
      }
      var ls = document.getElementById('login-screen');
      if (ls) {
        ls.hidden = true;
        ls.style.cssText = 'display:none!important';
      }
    } catch (e4) {}

    try {
      if (window.DRDevPortal && typeof window.DRDevPortal.showPortal === 'function') {
        window.DRDevPortal.showPortal(which);
      } else if (window.DRDevPortal && typeof window.DRDevPortal.apply === 'function') {
        window.DRDevPortal.apply(
          window.__drProfile || { role: which === 'admin' ? 'agent' : 'customer' }
        );
      } else if (typeof window.showApp === 'function') {
        window.showApp(window.__drProfile || { role: which === 'admin' ? 'agent' : 'customer' });
      }
    } catch (e5) {}

    try {
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (which === 'employee') {
        if (pa) {
          pa.classList.remove('active');
          pa.style.setProperty('display', 'none', 'important');
        }
        if (pc) {
          pc.hidden = false;
          pc.removeAttribute('hidden');
          pc.classList.add('active');
          pc.style.setProperty('display', 'block', 'important');
          pc.style.setProperty('visibility', 'visible', 'important');
          pc.style.setProperty('opacity', '1', 'important');
        }
      } else {
        if (pc) {
          pc.classList.remove('active');
          pc.style.setProperty('display', 'none', 'important');
        }
        if (pa) {
          pa.hidden = false;
          pa.removeAttribute('hidden');
          pa.classList.add('active');
          pa.style.setProperty('display', 'flex', 'important');
          pa.style.setProperty('visibility', 'visible', 'important');
          pa.style.setProperty('opacity', '1', 'important');
        }
      }
    } catch (e6) {}

    try {
      if (window.DRPortalShell && window.DRPortalShell.ensureAmbient)
        window.DRPortalShell.ensureAmbient(true);
      if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.ensureGears)
        window.DRHeartbeatDraw.ensureGears(false);
      if (window.DRTopbarLayout && window.DRTopbarLayout.refresh) window.DRTopbarLayout.refresh();
    } catch (eAmb) {}

    try {
      var boot = document.getElementById('boot');
      if (boot) {
        boot.classList.add('is-done', 'dr-skip');
        boot.style.display = 'none';
      }
      var phase = document.getElementById('dr-phase-boot');
      if (phase) {
        phase.classList.add('is-done');
        phase.style.display = 'none';
      }
    } catch (e7) {}

    setTimeout(function () {
      try {
        if (window.DRPostLoginTx && window.DRPostLoginTx.run) window.DRPostLoginTx.run();
      } catch (eTx) {}
      function kick() {
        try {
          if (window.DRPostLoginTx && window.DRPostLoginTx.kick) window.DRPostLoginTx.kick();
          else if (window.DRGearsStable && window.DRGearsStable.kick) window.DRGearsStable.kick();
          else if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.kickGears)
            window.DRHeartbeatDraw.kickGears();
        } catch (eK) {}
      }
      setTimeout(kick, 200);
      setTimeout(kick, 600);
      setTimeout(kick, 1200);
    }, 80);
  }

  function wire() {
    document.addEventListener(
      'submit',
      function (e) {
        var form = e.target;
        if (!form || !form.closest) return;
        if (!form.closest('#login-customer')) return;
        e.preventDefault();
        e.stopPropagation();
        doEmployeeLogin(form);
      },
      true
    );
  }

  setTimeout(finishPostLoginBoot, 700);
  setTimeout(finishPostLoginBoot, 1500);
  setTimeout(finishPostLoginBoot, 2800);
  setTimeout(function () {
    try {
      document.documentElement.removeAttribute('data-dr-hold-portal');
      finishPostLoginBoot();
    } catch (e) {}
  }, 3500);

  wire();
  window.DREmpPerfFix = { v: 12, login: doEmployeeLogin, bootWorkspace: bootWorkspace };
  window.showPortalLoader = showPortalLoader;
  window.hidePortalLoader = hidePortalLoader;
  window.bootWorkspace = bootWorkspace;
})();
