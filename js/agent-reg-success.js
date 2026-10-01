/**
 * Divine Rays — Agent register success message (approval pending)
 * Does not touch End-User registration success copy.
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_REG_SUCCESS) return;
  window.__DR_AGENT_REG_SUCCESS = 1;

  var AGENT_MSG =
    'Your account has been successfully created. A request has been sent to the Administrator for approval. Please wait for your account to be approved.';

  function isAgentRegisterForm(form) {
    if (!form) return false;
    if (form.id === 'dr-register-form-agent' || form.id === 'register-agent') return true;
    if (form.closest && form.closest('#dr-register-card-agent')) return true;
    return false;
  }

  function markPending(form) {
    try {
      var key = 'dr_staff_approval';
      var map = {};
      try {
        map = JSON.parse(localStorage.getItem(key) || '{}') || {};
      } catch (e0) {}
      var un = ((form && form.querySelector('#reg-agent-username')) || {}).value || '';
      var em = ((form && form.querySelector('input[type="email"]')) || {}).value || '';
      var pendingKey = 'pending:' + String(un || em).toLowerCase().trim();
      if (pendingKey && pendingKey !== 'pending:') map[pendingKey] = 'pending';
      localStorage.setItem(key, JSON.stringify(map));
    } catch (e1) {}
  }

  function applyAgentMessage() {
    var m = document.getElementById('dr-success-modal');
    if (!m) return;
    m.setAttribute('data-reg-kind', 'agent');
    var msg = m.querySelector('#dr-success-msg') || m.querySelector('.dr-success-box p');
    if (msg) msg.textContent = AGENT_MSG;
    /* Ok / backdrop → agent login */
    if (!m.__drAgentOkWired) {
      m.__drAgentOkWired = 1;
      var ok = m.querySelector('.dr-success-ok');
      if (ok) {
        ok.addEventListener(
          'click',
          function () {
            if ((m.getAttribute('data-reg-kind') || '') !== 'agent') return;
            try {
              if (window.DRLoginTheme && window.DRLoginTheme.showLogin) {
                window.DRLoginTheme.showLogin('login-agent');
              } else if (typeof window.showForm === 'function') {
                window.showForm('login-agent');
              }
            } catch (e) {}
          },
          true
        );
      }
    }
  }

  /* Intercept success modal when agent form just submitted */
  document.addEventListener(
    'submit',
    function (e) {
      var form = e.target;
      if (!isAgentRegisterForm(form)) return;
      markPending(form);
      /* Watch for success modal open shortly after submit */
      var tries = 0;
      var t = setInterval(function () {
        tries++;
        var m = document.getElementById('dr-success-modal');
        if (m && m.classList.contains('is-open')) {
          applyAgentMessage();
          clearInterval(t);
        }
        if (tries > 40) clearInterval(t);
      }, 50);
    },
    true
  );

  /* Also observe modal opens */
  var obs = new MutationObserver(function () {
    var m = document.getElementById('dr-success-modal');
    if (!m || !m.classList.contains('is-open')) return;
    /* Only rewrite if we recently marked agent pending via submit */
    var form = document.getElementById('dr-register-form-agent');
    var card = document.getElementById('dr-register-card-agent');
    if ((card && card.classList.contains('is-open')) || (form && form.offsetParent !== null)) {
      applyAgentMessage();
    }
  });
  try {
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  } catch (e) {}
})();
