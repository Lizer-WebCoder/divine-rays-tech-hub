/**
 * Divine Rays — daily ticket quota + anti double-submit + RLS error mapping
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_QUOTA) return;
  window.__DR_TICKET_QUOTA = 1;

  var DEFAULT_LIMIT = 5;
  var submitting = false;
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
      return 'Could not create ticket (permission). If a ticket still appeared in My Tickets, it was saved — do not submit again.';
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
          if (submitting) {
            return { error: 'Please wait — ticket is still being created.' };
          }
          submitting = true;
          try {
            var q = await fetchQuota();
            if (q && !q.exempt && typeof q.remaining === 'number' && q.remaining <= 0) {
              var p = parseQuotaMessage({ message: 'Daily limit of ' + q.limit });
              showBanner(p.message, 'err');
              return { error: p.message, quota: p };
            }
            var res = await orig.apply(this, arguments);
            if (res && res.error) {
              var msg = mapCreateError({ message: String(res.error) });
              if (isQuotaError(res.error) || isRlsError(res.error)) {
                showBanner(msg, 'err');
              }
              return { error: msg, quota: isQuotaError(res.error) ? parseQuotaMessage({ message: String(res.error) }) : undefined };
            }
            refreshHint();
            return res;
          } finally {
            setTimeout(function () {
              submitting = false;
            }, 2000);
          }
        };
        wrapped.__drQuotaWrapped = true;
        root[n] = wrapped;
      });
    });
  }

  function wireForm() {
    var form = document.getElementById('customer-form');
    if (!form || form.getAttribute('data-dr-quota') === '1') return;
    form.setAttribute('data-dr-quota', '1');

    form.addEventListener(
      'submit',
      function (e) {
        if (submitting) {
          e.preventDefault();
          e.stopImmediatePropagation();
          showBanner('Please wait — ticket is still being created.', 'err');
          return;
        }
        submitting = true;
        setTimeout(function () {
          submitting = false;
        }, 2500);
      },
      true
    );

    var btn = form.querySelector('button[type="submit"], .btn-primary');
    if (btn && !btn.getAttribute('data-dr-quota-btn')) {
      btn.setAttribute('data-dr-quota-btn', '1');
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        var prev = btn.textContent;
        btn.disabled = true;
        setTimeout(function () {
          btn.disabled = false;
          if (prev) btn.textContent = prev;
        }, 2500);
      });
    }
  }

  var _alert = window.alert;
  window.alert = function (msg) {
    if (isQuotaError(msg) || isRlsError(msg)) {
      showBanner(mapCreateError({ message: String(msg) }), 'err');
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
  setTimeout(apply, 5000);
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
