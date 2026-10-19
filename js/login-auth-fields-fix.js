/**
 * Divine Rays - login-auth-fields-fix v1
 * After logout, Admin form can leave empty password nodes; read the filled one.
 * Wraps __drDoAgentLogin without replacing auth success path.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_AUTH_FIELDS >= 1) return;
  window.__DR_LOGIN_AUTH_FIELDS = 1;

  function fillFromForm() {
    try {
      var la = document.getElementById('login-agent');
      if (!la) return;
      var au = document.getElementById('agent-username') || document.getElementById('agent-user');
      var pass = document.getElementById('agent-password');
      if (pass && !String(pass.value || '').length) {
        var list = la.querySelectorAll('input[type="password"]');
        for (var i = 0; i < list.length; i++) {
          if (String(list[i].value || '').length) {
            if (pass && pass !== list[i]) pass.value = list[i].value;
            break;
          }
        }
      }
      if (au && !String(au.value || '').trim()) {
        var em = la.querySelector('input[type="email"], input[autocomplete="username"]');
        if (em && String(em.value || '').trim()) au.value = String(em.value).trim();
      }
    } catch (e) {}
  }

  function wrap() {
    try {
      var fn = window.__drDoAgentLogin;
      if (!fn || fn.__drFieldsWrap) return;
      var wrapped = function (triggerEl) {
        fillFromForm();
        return fn(triggerEl);
      };
      wrapped.__drFieldsWrap = 1;
      wrapped.__drAuthV12 = fn.__drAuthV12;
      wrapped.__drAuthV13 = fn.__drAuthV13;
      window.__drDoAgentLogin = wrapped;
    } catch (e) {}
  }

  wrap();
  setTimeout(wrap, 300);
  setTimeout(wrap, 1000);
  setTimeout(wrap, 2500);
  setInterval(wrap, 5000);
})();
