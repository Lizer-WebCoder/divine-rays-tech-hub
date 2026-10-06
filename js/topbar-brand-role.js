/**
 * Divine Rays — Top bar brand + role (portal-aware, no flicker)
 * Admin: "Divine Rays Tech Hub • Admin Portal"
 * End-User: "Divine Rays Tech Hub • Employees"
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TOPBAR_BRAND_ROLE >= 3) return;
  window.__DR_TOPBAR_BRAND_ROLE = 3;

  var DEVS = { kirzhian: 1, kirzhianquijano: 1, kirzhianthegreat: 1, jamesjerlow123: 1, liya: 1, iiya: 1 };
  function isDev(s) {
    s = String(s || '').toLowerCase().trim();
    return !!DEVS[s] || s.indexOf('kirzhian') === 0;
  }

  function setText(el, next) {
    if (!el) return;
    if ((el.textContent || '').trim() !== next) el.textContent = next;
  }

  function whichPortal() {
    var agent = document.getElementById('portal-agent');
    var cust = document.getElementById('portal-customer');
    var agentOn = agent && (agent.classList.contains('active') || agent.style.display === 'block' ||
      (agent.offsetParent !== null && (!cust || cust.offsetParent === null)));
    var custOn = cust && (cust.classList.contains('active') ||
      (cust.offsetParent !== null && (!agent || !agent.classList.contains('active'))));
    if (document.body && document.body.classList.contains('is-login')) return 'login';
    if (agentOn && !custOn) return 'admin';
    if (custOn) return 'enduser';
    if (agent && document.getElementById('portal-agent')) {
      if (agent.classList.contains('active')) return 'admin';
    }
    return 'unknown';
  }

  function tick() {
    var portal = whichPortal();
    if (portal === 'login' || portal === 'unknown') return;

    var brand = portal === 'enduser'
      ? 'Divine Rays Tech Hub \u2022 Employees'
      : 'Divine Rays Tech Hub \u2022 Admin Portal';

    var strong = document.querySelector('.mode-brand strong');
    if (strong) setText(strong, brand);
    else {
      var mb = document.querySelector('.mode-brand');
      if (mb) {
        Array.prototype.forEach.call(mb.childNodes, function (n) {
          if (n.nodeType === 3 && n.textContent.trim() && n.textContent.trim() !== brand) {
            n.textContent = brand;
          }
        });
      }
    }

    if (portal === 'admin') {
      var lb = document.getElementById('logged-user-label');
      if (lb) {
        var raw = (lb.textContent || '').trim();
        var name = raw.replace(/\s*\(.*$/, '').trim().split(/\s+/)[0] || 'User';
        var role = isDev(name) || isDev(raw) ? 'Developer' : 'Admin';
        setText(lb, name + ' (' + role + ')');
      }
    }
  }

  tick();
  setTimeout(tick, 800);
  setTimeout(tick, 2500);
  setInterval(tick, 20000);

  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest('#portal-agent .nav-btn') ||
        e.target.closest('#portal-customer') ||
        e.target.closest('.mode-bar')) {
      setTimeout(tick, 100);
    }
  }, true);

  window.DRTopbarBrand = { refresh: tick, v: 3 };
})();
