/**
 * Divine Rays — hard portal separation (agent vs customer)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_GUARD) return;
  window.__DR_PORTAL_GUARD = 1;

  var CSS = [
    '#portal-customer:not(.active){display:none!important;visibility:hidden!important;pointer-events:none!important;height:0!important;overflow:hidden!important;position:absolute!important;left:-9999px!important}',
    '#portal-agent:not(.active){display:none!important;visibility:hidden!important;pointer-events:none!important}',
    '#portal-customer.active{display:block!important;visibility:visible!important;pointer-events:auto!important;height:auto!important;overflow:visible!important;position:relative!important;left:auto!important}',
    '#portal-agent.active{display:block!important;visibility:visible!important;pointer-events:auto!important}'
  ].join('');

  function inject() {
    var s = document.getElementById('dr-portal-guard-css');
    if (!s) {
      s = document.createElement('style');
      s.id = 'dr-portal-guard-css';
      document.head.appendChild(s);
    }
    s.textContent = CSS;
  }

  function sync() {
    inject();
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (!pc && !pa) return;

    var agentOn = pa && pa.classList.contains('active');
    var custOn = pc && pc.classList.contains('active');

    if (agentOn && custOn) {
      var role = 'customer';
      try {
        if (window.DR && window.DR.getProfile) {
          var p = window.DR.getProfile();
          if (p && p.role) role = p.role;
        } else if (window.__drProfile && window.__drProfile.role) {
          role = window.__drProfile.role;
        }
      } catch (e) {}
      if (role === 'agent' || role === 'admin') {
        pc.classList.remove('active');
        custOn = false;
      } else {
        pa.classList.remove('active');
        agentOn = false;
      }
    }

    if (pc) {
      if (custOn) {
        pc.style.setProperty('display', 'block', 'important');
        pc.style.removeProperty('visibility');
        pc.style.removeProperty('height');
        pc.style.removeProperty('left');
      } else {
        pc.style.setProperty('display', 'none', 'important');
      }
    }
    if (pa) {
      if (agentOn) {
        pa.style.setProperty('display', 'block', 'important');
      } else {
        pa.style.setProperty('display', 'none', 'important');
      }
    }

    var help = document.getElementById('dr-tour-help');
    var nfab = document.getElementById('dr-notif-fab');
    var npanel = document.getElementById('dr-notif-panel');
    var nbd = document.getElementById('dr-notif-panel-bd');
    if (agentOn) {
      [help, nfab, npanel, nbd].forEach(function (el) {
        if (el) el.style.setProperty('display', 'none', 'important');
      });
    } else if (custOn) {
      if (help) help.style.removeProperty('display');
      if (nfab) nfab.style.removeProperty('display');
    }
  }

  inject();
  sync();
  setInterval(sync, 1500);
  try {
    var obs = new MutationObserver(function () { sync(); });
    var shell = document.getElementById('app-shell') || document.body;
    obs.observe(shell, { attributes: true, subtree: true, attributeFilter: ['class', 'hidden', 'style'] });
  } catch (e) {}
  window.DRPortalGuard = { sync: sync };
})();
