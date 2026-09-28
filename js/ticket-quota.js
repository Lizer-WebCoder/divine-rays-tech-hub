/**
 * Divine Rays — daily ticket quota + anti double-submit + form reset after success
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_QUOTA) {
    try { delete window.__DR_TICKET_QUOTA; } catch (e) {}
  }
  window.__DR_TICKET_QUOTA = 1;

  var DEFAULT_LIMIT = 5;
  var submitting = false;
  var submitLockUntil = 0;

  function client() {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (window.sb) return window.sb;
      if (window.DR && window.DR.sb) return window.DR.sb;
    } catch (e) {}
    return null;
  }

  function isLocked() {
    return submitting || Date.now() < submitLockUntil;
  }

  function lockBriefly(ms) {
    submitting = true;
    submitLockUntil = Date.now() + (ms || 1200);
    setTimeout(function () {
      submitting = false;
    }, ms || 1200);
  }

  function unlock() {
    submitting = false;
    submitLockUntil = 0;
    var form = document.getElementById('customer-form');
    if (!form) return;
    var btn = form.querySelector('button[type="submit"], .btn-primary');
    if (btn) {
      btn.disabled = false;
      btn.removeAttribute('disabled');
    }
  }

  function isQuotaError(err) {
    var msg = (err && (err.message || err.error_description || err.details || String(err))) || '';
    return /TICKET_QUOTA_EXCEEDED|quota_exceeded|Daily limit/i.test(msg);
  }

  function isRlsError(err) {
    var msg = (err && (err.message || String(err))) || '';
    return /row-level security|violates row-level|RLS/i.test(msg);
  }

  function parseQuotaMessage(err) {
    var msg = (err && err.message) || String(err || '');
    var m = msg.match(/Daily limit of (\d+)/i);
    var limit = m ? m[1] : String(DEFAULT_LIMIT);
    return {
      code: 429,
      error: 'Too Many Requests',
      message:
        'You have reached the daily ticket limit (' +
        limit +
        ' per day). Please try again after 00:00 UTC.',
      limit: Number(limit)
    };
  }

  function showBanner(text, kind) {
    var form = document.getElementById('customer-form');
    if (!form) return;
    var id = 'dr-quota-banner';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      form.insertBefore(el, form.firstChild);
    }
    el.setAttribute(
      'style',
      'margin:0 0 0.85rem;padding:0.75rem 1rem;border-radius:12px;font-size:0.88rem;font-weight:600;line-height:1.4;' +
        (kind === 'ok'
          ? 'background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.35);color:#86efac;'
          : 'background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.4);color:#fca5a5;')
    );
    el.textContent = text;
  }

  function resetSubmitForm(clearFields) {
    var form = document.getElementById('customer-form');
    var success = document.getElementById('submit-success');
    if (success) {
      success.hidden = true;
      success.style.display = 'none';
    }
    if (form) {
      form.hidden = false;
      form.style.display = '';
      form.removeAttribute('hidden');
      if (clearFields) {
        try {
          form.reset();
        } catch (e) {}
      }
    }
    unlock();
  }

  function ensureSubmitAnotherBtn() {
    var success = document.getElementById('submit-success');
    if (!success) return;
    if (success.querySelector('#btn-submit-another')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btn-submit-another';
    btn.className = 'btn btn-primary';
    btn.textContent = 'Submit another ticket';
    btn.setAttribute(
      'style',
      'margin-top:0.75rem;width:100%;border-radius:12px;padding:0.75rem 1rem;font-weight:700;cursor:pointer;'
    );
    btn.addEventListener('click', function () {
      resetSubmitForm(true);
      var tab = document.querySelector('.ctab[data-ctab="submit"]');
      if (tab) tab.click();
    });
    success.appendChild(btn);
  }

  async function fetchQuota() {
    var sb = client();
    if (!sb || !sb.rpc) return null;
    try {
      var r = await sb.rpc('get_my_ticket_quota');
      if (r.error) return null;
      return r.data;
    } catch (e) {
      return null;
    }
  }

  async function refreshHint() {
    var q = await fetchQuota();
    if (!q || q.exempt) return;
    var rem = typeof q.remaining === 'number' ? q.remaining : null;
    if (rem === null) return;
    if (rem <= 0) {
      showBanner(
        'Daily ticket limit reached (' + q.limit + ' / day). Resets at 00:00 UTC.',
        'err'
      );
    } else if (rem <= 2) {
      showBanner(
        'You can submit ' + rem + ' more ticket(s) today (limit ' + q.limit + ').',
        'err'
      );
    }
  }

  function mapCreateError(err) {
    if (isQuotaError(err)) return parseQuotaMessage(err).message;
    if (isRlsError(err)) {
      return 'Could not create ticket (permission). Check My Tickets — it may already be saved.';
    }
    return (err && err.message) || String(err || 'Create failed');
  }

  function wrapCreateTicket() {
    var roots = [window, window.DR].filter(Boolean);
    var names = ['createTicket', 'submitTicket', 'newTicket'];
    roots.forEach(function (root) {
      names.forEach(function (n) {
        if (!root || typeof root[n] !== 'function') return;
        if (root[n].__drQuotaWrapped) return;
        var orig = root[n];
        var wrapped = async function () {
          if (isLocked()) {
            return { error: 'Please wait — ticket is still being created.' };
          }
          lockBriefly(1500);
          try {
            var q = await fetchQuota();
            if (q && !q.exempt && typeof q.remaining === 'number' && q.remaining <= 0) {
              var p = parseQuotaMessage({ message: 'Daily limit of ' + q.limit });
              showBanner(p.message, 'err');
              unlock();
              return { error: p.message, quota: p };
            }
            var res = await orig.apply(this, arguments);
            if (res && res.error) {
              var msg = mapCreateError({ message: String(res.error) });
              if (isQuotaError(res.error) || isRlsError(res.error)) {
                showBanner(msg, 'err');
              }
              unlock();
              return { error: msg };
            }
            setTimeout(function () {
              ensureSubmitAnotherBtn();
              unlock();
              refreshHint();
            }, 400);
            return res;
          } catch (err) {
            unlock();
            throw err;
          }
        };
        wrapped.__drQuotaWrapped = true;
        root[n] = wrapped;
      });
    });
  }

  function wireForm() {
    var form = document.getElementById('customer-form');
    if (!form) return;

    if (form.getAttribute('data-dr-quota') !== '1') {
      form.setAttribute('data-dr-quota', '1');
      form.addEventListener(
        'submit',
        function (e) {
          if (isLocked()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }
          lockBriefly(1500);
          var btn = form.querySelector('button[type="submit"], .btn-primary');
          if (btn) {
            btn.disabled = true;
            setTimeout(function () {
              btn.disabled = false;
            }, 1500);
          }
        },
        true
      );
    }

    ensureSubmitAnotherBtn();
  }

  function wireTabs() {
    document.querySelectorAll('.ctab[data-ctab="submit"]').forEach(function (tab) {
      if (tab.getAttribute('data-dr-quota-tab') === '1') return;
      tab.setAttribute('data-dr-quota-tab', '1');
      tab.addEventListener('click', function () {
        resetSubmitForm(false);
      });
    });

    var panel = document.getElementById('ctab-submit');
    if (panel && panel.getAttribute('data-dr-quota-panel') !== '1') {
      panel.setAttribute('data-dr-quota-panel', '1');
      try {
        var mo = new MutationObserver(function () {
          if (panel.classList.contains('active')) {
            var success = document.getElementById('submit-success');
            if (success && !success.hidden && success.style.display !== 'none') {
              ensureSubmitAnotherBtn();
            } else {
              resetSubmitForm(false);
            }
          }
        });
        mo.observe(panel, { attributes: true, attributeFilter: ['class'] });
      } catch (e) {}
    }
  }

  function apply() {
    wireForm();
    wireTabs();
    wrapCreateTicket();
    ensureSubmitAnotherBtn();
    refreshHint();
  }

  apply();
  setTimeout(apply, 600);
  setTimeout(apply, 2000);
  setTimeout(apply, 5000);
  setInterval(function () {
    wireForm();
    wireTabs();
    wrapCreateTicket();
    ensureSubmitAnotherBtn();
  }, 10000);

  window.DRTicketQuota = {
    refresh: apply,
    resetForm: resetSubmitForm,
    fetch: fetchQuota,
    isQuotaError: isQuotaError,
    parse: parseQuotaMessage
  };
})();
