/**
 * Divine Rays — daily ticket quota (client)
 * Enforced in Postgres; this pre-checks + maps errors to a clean UI message.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_QUOTA) return;
  window.__DR_TICKET_QUOTA = 1;

  var DEFAULT_LIMIT = 5;
  var lastQuota = null;

  function client() {
    try {
      if (window.supabaseClient) return window.supabaseClient;
      if (window.sb) return window.sb;
      if (window.DR && window.DR.sb) return window.DR.sb;
    } catch (e) {}
    return null;
  }

  function isQuotaError(err) {
    var msg = (err && (err.message || err.error_description || err.details || String(err))) || '';
    return /TICKET_QUOTA_EXCEEDED|quota_exceeded|Daily limit/i.test(msg);
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

  async function fetchQuota() {
    var sb = client();
    if (!sb || !sb.rpc) return null;
    try {
      var r = await sb.rpc('get_my_ticket_quota');
      if (r.error) return null;
      lastQuota = r.data;
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
        'Daily ticket limit reached (' +
          q.limit +
          ' / day). Resets at 00:00 UTC.',
        'err'
      );
    } else if (rem <= 2) {
      showBanner(
        'You can submit ' + rem + ' more ticket(s) today (limit ' + q.limit + ').',
        'err'
      );
    }
  }

  async function guardSubmit(e) {
    var q = await fetchQuota();
    if (q && !q.exempt && typeof q.remaining === 'number' && q.remaining <= 0) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
      var payload = {
        code: 429,
        error: 'Too Many Requests',
        message:
          'You have reached the daily ticket limit (' +
          q.limit +
          ' per day). Please try again after 00:00 UTC.',
        limit: q.limit,
        used: q.used,
        remaining: 0
      };
      showBanner(payload.message, 'err');
      try {
        window.dispatchEvent(new CustomEvent('dr:quota-exceeded', { detail: payload }));
      } catch (err) {}
      return false;
    }
    return true;
  }

  function wrapCreateTicket() {
    var names = ['createTicket', 'submitTicket', 'newTicket'];
    names.forEach(function (n) {
      var root = window.DR || window;
      if (typeof root[n] !== 'function') return;
      var orig = root[n];
      root[n] = async function () {
        var ok = await guardSubmit();
        if (!ok) return { error: parseQuotaMessage({ message: 'TICKET_QUOTA_EXCEEDED' }) };
        var res = await orig.apply(this, arguments);
        if (res && res.error && isQuotaError(res.error)) {
          var p = parseQuotaMessage({ message: String(res.error) });
          showBanner(p.message, 'err');
          return { error: p.message, quota: p };
        }
        refreshHint();
        return res;
      };
    });
  }

  function wireForm() {
    var form = document.getElementById('customer-form');
    if (!form || form.getAttribute('data-dr-quota') === '1') return;
    form.setAttribute('data-dr-quota', '1');
    form.addEventListener(
      'submit',
      function (e) {
        guardSubmit(e);
      },
      true
    );
  }

  var _alert = window.alert;
  window.alert = function (msg) {
    if (isQuotaError(msg)) {
      var p = parseQuotaMessage({ message: String(msg) });
      showBanner(p.message, 'err');
      return;
    }
    return _alert.apply(this, arguments);
  };

  function apply() {
    wireForm();
    wrapCreateTicket();
    refreshHint();
  }

  apply();
  setTimeout(apply, 800);
  setTimeout(apply, 2500);
  setInterval(apply, 12000);

  window.DRTicketQuota = {
    refresh: apply,
    fetch: fetchQuota,
    isQuotaError: isQuotaError,
    parse: parseQuotaMessage,
    exampleError: {
      code: 429,
      error: 'Too Many Requests',
      message:
        'You have reached the daily ticket limit (5 per day). Please try again after 00:00 UTC.'
    }
  };
})();
