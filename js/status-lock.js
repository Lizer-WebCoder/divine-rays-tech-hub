/**
 * Divine Rays — hard lock status dropdown (stops snap-back to In Progress)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  var lockedStatus = null;
  var lockedUntil = 0;
  var lastTicket = '';

  function currentTicketNum() {
    var el = document.querySelector('#ticket-detail .ticket-id, #ticket-detail .ticket-number');
    if (el) return el.textContent.trim();
    var pt = document.getElementById('page-title');
    if (pt && /^DR-/i.test((pt.textContent || '').trim())) return pt.textContent.trim();
    return '';
  }

  function lock(status) {
    lockedStatus = status;
    lockedUntil = Date.now() + 120000;
  }

  function unlock() {
    lockedStatus = null;
    lockedUntil = 0;
  }

  function enforce() {
    var se = document.getElementById('quick-status');
    if (!se) return;

    var num = currentTicketNum();
    if (num && num !== lastTicket) {
      lastTicket = num;
      unlock();
      return;
    }

    if (lockedStatus && Date.now() < lockedUntil) {
      if (se.value !== lockedStatus) {
        se.value = lockedStatus;
      }
    }
  }

  document.addEventListener(
    'change',
    function (e) {
      if (e.target && e.target.id === 'quick-status') {
        lock(e.target.value);
      }
    },
    true
  );

  document.addEventListener(
    'input',
    function (e) {
      if (e.target && e.target.id === 'quick-status') {
        lock(e.target.value);
      }
    },
    true
  );

  function protectSelect() {
    var se = document.getElementById('quick-status');
    if (!se || se._statusLocked) return;
    se._statusLocked = true;

    var desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    if (!desc || !desc.set) return;

    Object.defineProperty(se, 'value', {
      configurable: true,
      enumerable: true,
      get: function () {
        return desc.get.call(this);
      },
      set: function (v) {
        if (lockedStatus && Date.now() < lockedUntil && String(v) !== String(lockedStatus)) {
          desc.set.call(this, lockedStatus);
          return;
        }
        desc.set.call(this, v);
      }
    });
  }

  window.addEventListener('dr-status-saved', function () {
    unlock();
  });

  setInterval(function () {
    protectSelect();
    enforce();
  }, 150);

  setTimeout(protectSelect, 1000);
  setTimeout(protectSelect, 3000);

  window.DR_STATUS_LOCK = { lock: lock, unlock: unlock, enforce: enforce };
})();
