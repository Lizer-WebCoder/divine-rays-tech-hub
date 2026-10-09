/**
 * Divine Rays — Top bar brand v4 (fast paint)
 * Aggressive early ticks so brand appears as soon as portal shows
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TOPBAR_BRAND_ROLE >= 4) return;
  window.__DR_TOPBAR_BRAND_ROLE = 4;

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
    if (document.body && document.body.classList.contains('is-login')) return 'login';
    var agentOn = agent && (
      agent.classList.contains('active') ||
      agent.style.display === 'block' ||
      (agent.offsetParent !== null)
    );
    var custOn = cust && (
      cust.classList.contains('active') ||
      (cust.offsetParent !== null && (!agent || !agent.classList.contains('active')))
    );
    if (agentOn && !custOn) return 'admin';
    if (custOn) return 'enduser';
    if (agent && agent.classList.contains('active')) return 'admin';
    return 'unknown';
  }

  function ensureModeBarVisible() {
    var bar = document.querySelector('.mode-bar');
    if (!bar) return;
    bar.style.setProperty('visibility', 'visible', 'important');
    bar.style.setProperty('opacity', '1', 'important');
    bar.style.setProperty('display', '', 'important');
  }

  function tick() {
    var portal = whichPortal();
    if (portal === 'login' || portal === 'unknown') return;
    ensureModeBarVisible();

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
        if (!(mb.textContent || '').includes('Divine Rays')) {
          var s = mb.querySelector('strong');
          if (s) setText(s, brand);
        }
      }
    }

    try {
      if (window.DRTopbarActions && window.DRTopbarActions.refresh) window.DRTopbarActions.refresh();
    } catch (e) {}
  }

  tick();
  var n = 0;
  var fast = setInterval(function () {
    tick();
    n += 1;
    if (n > 50) clearInterval(fast);
  }, 150);
  setInterval(tick, 4000);
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('.nav-btn, #btn-login, button')) {
      setTimeout(tick, 80);
    }
  }, true);
  window.DRTopbarBrand = { refresh: tick, v: 4 };
})();
