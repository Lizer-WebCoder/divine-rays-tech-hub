/**
 * Divine Rays — daily ticket quota
 * - Pre-check on submit
 * - Centered modal (not corner toast)
 * - Watches #toast-container for leaked TICKET_QUOTA messages
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_TICKET_QUOTA = 1;

  var DEFAULT_LIMIT = 5;
  var submitting = false;
  var submitLockUntil = 0;
  var lastModalAt = 0;

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

  function isQuotaText(txt) {
    return /TICKET_QUOTA_EXCEEDED|quota_exceeded|Daily limit of \d+|daily ticket limit/i.test(String(txt || ''));
  }

  function parseLimit(txt) {
    var m = String(txt || '').match(/Daily limit of (\d+)/i);
    return m ? Number(m[1]) : DEFAULT_LIMIT;
  }

  function injectStyles() {
    if (document.getElementById('dr-quota-styles')) return;
    var s = document.createElement('style');
    s.id = 'dr-quota-styles';
    s.textContent =
      '#dr-quota-overlay{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(8,6,18,0.75);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:1.25rem;' +
      'animation:drQuotaFadeIn .2s ease-out}' +
      '@keyframes drQuotaFadeIn{from{opacity:0}to{opacity:1}}' +
      '@keyframes drQuotaPop{from{opacity:0;transform:translateY(14px) scale(.95)}to{opacity:1;transform:none}}' +
      '#dr-quota-modal{width:min(440px,100%);border-radius:18px;padding:1.6rem 1.45rem 1.3rem;text-align:center;' +
      'background:linear-gradient(165deg,rgba(42,28,72,.98),rgba(22,16,40,.99));' +
      'border:1px solid rgba(167,139,250,.5);box-shadow:0 0 0 1px rgba(139,92,246,.2),0 28px 56px rgba(0,0,0,.6),0 0 48px rgba(124,58,237,.25);' +
      'animation:drQuotaPop .28s cubic-bezier(.2,.9,.2,1);color:#eeeef6;font-family:Inter,system-ui,sans-serif}' +
      '#dr-quota-modal .dr-q-icon{width:58px;height:58px;margin:0 auto .95rem;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;font-size:1.6rem;' +
      'background:rgba(239,68,68,.18);border:1px solid rgba(248,113,113,.45);box-shadow:0 0 28px rgba(239,68,68,.3)}' +
      '#dr-quota-modal h3{margin:0 0 .55rem;font-size:1.2rem;font-weight:800;color:#fff}' +
      '#dr-quota-modal p{margin:0 0 .4rem;font-size:.94rem;line-height:1.5;color:#c4b5fd}' +
      '#dr-quota-modal .dr-q-meta{margin:.9rem 0 1.15rem;padding:.7rem .9rem;border-radius:12px;' +
      'background:rgba(15,10,30,.6);border:1px solid rgba(139,92,246,.3);font-size:.84rem;color:#a78bfa;font-weight:600}' +
      '#dr-quota-modal .dr-q-actions{display:flex;gap:.65rem;flex-wrap:wrap;justify-content:center}' +
      '#dr-quota-modal .dr-q-btn{flex:1;min-width:120px;border:none;border-radius:12px;padding:.75rem 1rem;' +
      'font-weight:700;font-size:.9rem;cursor:pointer}' +
      '#dr-quota-modal .dr-q-btn-primary{background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;' +
      'box-shadow:0 4px 18px rgba(124,58,237,.45)}' +
      '#dr-quota-modal .dr-q-btn-ghost{background:rgba(255,255,255,.07);color:#ddd6fe;border:1px solid rgba(167,139,250,.35)}' +
      '#dr-quota-banner{margin:0 0 .9rem;padding:.9rem 1rem;border-radius:14px;font-size:.9rem;font-weight:600;line-height:1.45;' +
      'display:flex;align-items:flex-start;gap:.7rem;' +
      'background:rgba(239,68,68,.14);border:1px solid rgba(248,113,113,.45);color:#fecaca}' +
      '#dr-quota-banner .dr-q-bicon{flex-shrink:0;font-size:1.2rem}' +
      '#toast-container .toast.dr-quota-hide,[data-dr-quota-hide="1"]{display:none!important;opacity:0!important;pointer-events:none!important}' +
      '[data-theme="light"] #dr-quota-modal{background:linear-gradient(165deg,#faf5ff,#f3e8ff);color:#1e1b4b;border-color:rgba(124,58,237,.35)}' +
      '[data-theme="light"] #dr-quota-modal h3{color:#1e1b4b}' +
      '[data-theme="light"] #dr-quota-modal p{color:#5b21b6}' +
      '[data-theme="light"] #dr-quota-modal .dr-q-meta{background:rgba(124,58,237,.08);color:#6d28d9}' +
      '[data-theme="light"] #dr-quota-banner{background:#fee2e2;border-color:#f87171;color:#991b1b}' +
      '[data-theme="light"] #dr-quota-overlay{background:rgba(30,20,50,.5)}';
    document.head.appendChild(s);
  }

  function closeQuotaModal() {
    var ov = document.getElementById('dr-quota-overlay');
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
  }

  function showQuotaModal(limit) {
    injectStyles();
    if (Date.now() - lastModalAt < 800 && document.getElementById('dr-quota-overlay')) return;
    lastModalAt = Date.now();
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
  }

  function showBanner(text) {
    injectStyles();
    var form = document.getElementById('customer-form');
    if (!form) return;
    var el = document.getElementById('dr-quota-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dr-quota-banner';
      form.insertBefore(el, form.firstChild);
    }
    el.innerHTML =
      '<span class="dr-q-bicon" aria-hidden="true">⛔</span><span>' + text + '</span>';
  }

  function scrubQuotaToasts() {
    injectStyles();
    var nodes = document.querySelectorAll(
      '#toast-container .toast, #toast-container > *, .toast, [class*="toast"]'
    );
    nodes.forEach(function (t) {
      var txt = t.textContent || '';
      if (isQuotaText(txt)) {
        t.setAttribute('data-dr-quota-hide', '1');
        t.classList.add('dr-quota-hide');
        t.style.display = 'none';
        try {
          if (t.parentNode) t.parentNode.removeChild(t);
        } catch (e) {}
        showQuotaModal(parseLimit(txt));
        showBanner(
          'You have reached your daily ticket limit (' +
            parseLimit(txt) +
            ' / day). Resets at 00:00 UTC.'
        );
      }
    });
  }

  function watchToasts() {
    if (window.__drQuotaToastWatch) return;
    window.__drQuotaToastWatch = true;

    function attach(root) {
      if (!root || root.__drQuotaMo) return;
      try {
        var mo = new MutationObserver(function () {
          scrubQuotaToasts();
        });
        mo.observe(root, { childList: true, subtree: true, characterData: true });
        root.__drQuotaMo = mo;
      } catch (e) {}
    }

    var c = document.getElementById('toast-container');
    if (c) attach(c);
    attach(document.body);
    setInterval(scrubQuotaToasts, 400);
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
    if (!success || success.querySelector('#btn-submit-another')) return;
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

  function handleQuotaHit(limitOrMsg) {
    var limit =
      typeof limitOrMsg === 'number' ? limitOrMsg : parseLimit(limitOrMsg);
    showQuotaModal(limit);
    showBanner(
      'You have reached your daily ticket limit of ' +
        limit +
        '. The limit resets at 00:00 UTC.'
    );
    scrubQuotaToasts();
    setTimeout(scrubQuotaToasts, 50);
    setTimeout(scrubQuotaToasts, 200);
    setTimeout(scrubQuotaToasts, 500);
  }

  function wireForm() {
    var form = document.getElementById('customer-form');
    if (!form) return;

    if (form.getAttribute('data-dr-quota') !== '1') {
      form.setAttribute('data-dr-quota', '1');

      form.addEventListener(
        'submit',
        function (e) {
          setTimeout(scrubQuotaToasts, 30);
          setTimeout(scrubQuotaToasts, 150);
          setTimeout(scrubQuotaToasts, 400);

          if (isLocked()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }

          if (form.getAttribute('data-dr-quota-pass') === '1') {
            form.removeAttribute('data-dr-quota-pass');
            lockBriefly(1500);
            return;
          }

          e.preventDefault();
          e.stopImmediatePropagation();

          lockBriefly(1500);
          var btn = form.querySelector('button[type="submit"], .btn-primary');
          if (btn) {
            btn.disabled = true;
            setTimeout(function () {
              btn.disabled = false;
            }, 1600);
          }

          (async function () {
            try {
              var q = await fetchQuota();
              if (q && !q.exempt && typeof q.remaining === 'number' && q.remaining <= 0) {
                handleQuotaHit(q.limit || DEFAULT_LIMIT);
                unlock();
                return;
              }
            } catch (err) {}

            form.setAttribute('data-dr-quota-pass', '1');
            try {
              if (typeof form.requestSubmit === 'function') form.requestSubmit();
              else {
                var ev = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(ev);
              }
            } catch (err2) {
              form.removeAttribute('data-dr-quota-pass');
            }
          })();
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
  }

  function apply() {
    injectStyles();
    wireForm();
    wireTabs();
    watchToasts();
    ensureSubmitAnotherBtn();
    refreshHint();
    scrubQuotaToasts();
  }

  apply();
  setTimeout(apply, 500);
  setTimeout(apply, 1500);
  setTimeout(apply, 3500);
  setInterval(function () {
    wireForm();
    wireTabs();
    watchToasts();
    scrubQuotaToasts();
  }, 8000);

  window.DRTicketQuota = {
    refresh: apply,
    resetForm: resetSubmitForm,
    showModal: showQuotaModal,
    fetch: fetchQuota,
    scrub: scrubQuotaToasts
  };
})();
