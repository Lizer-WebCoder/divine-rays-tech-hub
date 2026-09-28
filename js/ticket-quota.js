/**
 * Divine Rays — daily ticket quota + anti double-submit + form reset + notice modal
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
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
    var limit = m ? Number(m[1]) : DEFAULT_LIMIT;
    return {
      code: 429,
      error: 'Too Many Requests',
      message:
        'You have reached your daily ticket limit of ' +
        limit +
        '. The limit resets at 00:00 UTC.',
      limit: limit
    };
  }

  function injectStyles() {
    if (document.getElementById('dr-quota-styles')) return;
    var s = document.createElement('style');
    s.id = 'dr-quota-styles';
    s.textContent =
      '#dr-quota-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(8,6,18,0.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:1.25rem;' +
      'animation:drQuotaFadeIn .22s ease-out}' +
      '@keyframes drQuotaFadeIn{from{opacity:0}to{opacity:1}}' +
      '@keyframes drQuotaPop{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}' +
      '#dr-quota-modal{width:min(420px,100%);border-radius:18px;padding:1.5rem 1.4rem 1.25rem;text-align:center;' +
      'background:linear-gradient(165deg,rgba(42,28,72,.97),rgba(22,16,40,.98));' +
      'border:1px solid rgba(167,139,250,.45);box-shadow:0 0 0 1px rgba(139,92,246,.15),0 24px 48px rgba(0,0,0,.55),0 0 40px rgba(124,58,237,.2);' +
      'animation:drQuotaPop .28s cubic-bezier(.2,.9,.2,1);color:#eeeef6;font-family:Inter,system-ui,sans-serif}' +
      '#dr-quota-modal .dr-q-icon{width:56px;height:56px;margin:0 auto .9rem;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;font-size:1.55rem;' +
      'background:rgba(239,68,68,.15);border:1px solid rgba(248,113,113,.4);box-shadow:0 0 24px rgba(239,68,68,.25)}' +
      '#dr-quota-modal h3{margin:0 0 .5rem;font-size:1.15rem;font-weight:800;letter-spacing:.01em;color:#fff}' +
      '#dr-quota-modal p{margin:0 0 .35rem;font-size:.92rem;line-height:1.5;color:#c4b5fd}' +
      '#dr-quota-modal .dr-q-meta{margin:.85rem 0 1.1rem;padding:.65rem .85rem;border-radius:12px;' +
      'background:rgba(15,10,30,.55);border:1px solid rgba(139,92,246,.25);font-size:.82rem;color:#a78bfa;font-weight:600}' +
      '#dr-quota-modal .dr-q-actions{display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center}' +
      '#dr-quota-modal .dr-q-btn{flex:1;min-width:120px;border:none;border-radius:12px;padding:.7rem 1rem;' +
      'font-weight:700;font-size:.9rem;cursor:pointer;transition:transform .15s,opacity .15s}' +
      '#dr-quota-modal .dr-q-btn:active{transform:scale(.98)}' +
      '#dr-quota-modal .dr-q-btn-primary{background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;' +
      'box-shadow:0 4px 16px rgba(124,58,237,.4)}' +
      '#dr-quota-modal .dr-q-btn-ghost{background:rgba(255,255,255,.06);color:#ddd6fe;border:1px solid rgba(167,139,250,.3)}' +
      '#dr-quota-banner{margin:0 0 .85rem;padding:.85rem 1rem;border-radius:14px;font-size:.88rem;font-weight:600;line-height:1.45;' +
      'display:flex;align-items:flex-start;gap:.65rem;' +
      'background:rgba(239,68,68,.12);border:1px solid rgba(248,113,113,.4);color:#fecaca}' +
      '#dr-quota-banner .dr-q-bicon{flex-shrink:0;font-size:1.15rem;line-height:1.2}' +
      '[data-theme="light"] #dr-quota-modal{background:linear-gradient(165deg,#faf5ff,#f3e8ff);color:#1e1b4b;' +
      'border-color:rgba(124,58,237,.35);box-shadow:0 24px 48px rgba(91,33,182,.18)}' +
      '[data-theme="light"] #dr-quota-modal h3{color:#1e1b4b}' +
      '[data-theme="light"] #dr-quota-modal p{color:#5b21b6}' +
      '[data-theme="light"] #dr-quota-modal .dr-q-meta{background:rgba(124,58,237,.08);color:#6d28d9;border-color:rgba(124,58,237,.2)}' +
      '[data-theme="light"] #dr-quota-banner{background:rgba(254,226,226,.9);border-color:#f87171;color:#991b1b}' +
      '[data-theme="light"] #dr-quota-overlay{background:rgba(30,20,50,.45)}';
    document.head.appendChild(s);
  }

  function closeQuotaModal() {
    var ov = document.getElementById('dr-quota-overlay');
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
  }

  function showQuotaModal(limit) {
    injectStyles();
    closeQuotaModal();
    limit = limit || DEFAULT_LIMIT;
    var ov = document.createElement('div');
    ov.id = 'dr-quota-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.innerHTML =
      '<div id="dr-quota-modal">' +
      '<div class="dr-q-icon" aria-hidden="true">⛔</div>' +
      '<h3>Daily ticket limit reached</h3>' +
      '<p>You have already submitted the maximum number of tickets allowed for today.</p>' +
      '<div class="dr-q-meta">Limit: <strong>' +
      limit +
      ' tickets / day</strong> · Resets at <strong>00:00 UTC</strong></div>' +
      '<div class="dr-q-actions">' +
      '<button type="button" class="dr-q-btn dr-q-btn-ghost" id="dr-q-close">Close</button>' +
      '<button type="button" class="dr-q-btn dr-q-btn-primary" id="dr-q-mytickets">View my tickets</button>' +
      '</div></div>';
    document.body.appendChild(ov);

    function onClose() {
      closeQuotaModal();
    }
    ov.addEventListener('click', function (e) {
      if (e.target === ov) onClose();
    });
    var closeBtn = document.getElementById('dr-q-close');
    if (closeBtn) closeBtn.addEventListener('click', onClose);
    var myBtn = document.getElementById('dr-q-mytickets');
    if (myBtn) {
      myBtn.addEventListener('click', function () {
        onClose();
        var tab = document.querySelector('.ctab[data-ctab="mytickets"]');
        if (tab) tab.click();
        else if (typeof window.showCustomerTab === 'function') {
          try {
            window.showCustomerTab('mytickets');
          } catch (e) {}
        }
      });
    }
    document.addEventListener(
      'keydown',
      function esc(e) {
        if (e.key === 'Escape') {
          onClose();
          document.removeEventListener('keydown', esc);
        }
      },
      { once: true }
    );
  }

  function showBanner(text) {
    injectStyles();
    var form = document.getElementById('customer-form');
    if (!form) return;
    var id = 'dr-quota-banner';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      form.insertBefore(el, form.firstChild);
    }
    el.innerHTML =
      '<span class="dr-q-bicon" aria-hidden="true">⛔</span><span>' + text + '</span>';
  }

  function hideToastLikeQuota() {
    try {
      document.querySelectorAll('.toast, .toast-error, [class*="toast"]').forEach(function (t) {
        var txt = (t.textContent || '');
        if (/TICKET_QUOTA|Daily limit of/i.test(txt)) {
          t.style.display = 'none';
          if (t.parentNode) t.parentNode.removeChild(t);
        }
      });
    } catch (e) {}
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
        'Daily limit reached (' +
          q.limit +
          ' tickets / day). You can submit again after 00:00 UTC.'
      );
    } else if (rem <= 2) {
      showBanner(
        'You can submit ' + rem + ' more ticket(s) today (limit ' + q.limit + ').'
      );
    }
  }

  function handleQuotaHit(err) {
    var p = parseQuotaMessage(err || {});
    showBanner(p.message);
    showQuotaModal(p.limit);
    hideToastLikeQuota();
    setTimeout(hideToastLikeQuota, 80);
    setTimeout(hideToastLikeQuota, 300);
    return p;
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
              handleQuotaHit({ message: 'Daily limit of ' + q.limit });
              unlock();
              return { error: parseQuotaMessage({ message: 'Daily limit of ' + q.limit }).message };
            }
            var res = await orig.apply(this, arguments);
            if (res && res.error) {
              if (isQuotaError(res.error)) {
                handleQuotaHit({ message: String(res.error) });
                unlock();
                return { error: parseQuotaMessage({ message: String(res.error) }).message };
              }
              var msg = mapCreateError({ message: String(res.error) });
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
            if (isQuotaError(err)) handleQuotaHit(err);
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

  function patchToast() {
    if (window.__drQuotaToastPatched) return;
    window.__drQuotaToastPatched = true;
    var names = ['toast', 'showToast', 'notify'];
    names.forEach(function (n) {
      if (typeof window[n] !== 'function') return;
      var orig = window[n];
      window[n] = function (msg, type) {
        if (isQuotaError(msg)) {
          handleQuotaHit({ message: String(msg) });
          return;
        }
        return orig.apply(this, arguments);
      };
    });
  }

  var _alert = window.alert;
  window.alert = function (msg) {
    if (isQuotaError(msg)) {
      handleQuotaHit({ message: String(msg) });
      return;
    }
    return _alert.apply(this, arguments);
  };

  function apply() {
    injectStyles();
    wireForm();
    wireTabs();
    wrapCreateTicket();
    patchToast();
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
    patchToast();
    ensureSubmitAnotherBtn();
  }, 10000);

  window.DRTicketQuota = {
    refresh: apply,
    resetForm: resetSubmitForm,
    showModal: showQuotaModal,
    fetch: fetchQuota,
    isQuotaError: isQuotaError,
    parse: parseQuotaMessage
  };
})();
