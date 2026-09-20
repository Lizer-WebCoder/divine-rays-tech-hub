/**
 * Divine Rays — agent sidebar layout only when portal-agent.active
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LAYOUT_FIX_V3) return;
  window.__DR_LAYOUT_FIX_V3 = 1;
  window.__DR_LAYOUT_FIX = 1;

  function inject() {
    var id = 'dr-layout-fix-css';
    var s = document.getElementById(id);
    if (!s) {
      s = document.createElement('style');
      s.id = id;
      document.head.appendChild(s);
    }
    s.textContent = [
      'html,body{overflow-x:hidden!important}',
      '.mode-bar{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;z-index:300!important;height:49px!important}',
      '#portal-agent.active{display:block!important;position:relative!important;width:100%!important;max-width:none!important;min-height:100vh!important;padding:49px 0 0 0!important;margin:0!important;box-sizing:border-box!important}',
      '#portal-agent.active .sidebar{position:fixed!important;top:49px!important;left:0!important;width:260px!important;max-width:260px!important;height:calc(100vh - 49px)!important;overflow-y:auto!important;overflow-x:hidden!important;z-index:250!important;margin:0!important}',
      '#portal-agent.active main.main, #portal-agent.active .main{display:block!important;position:relative!important;margin:0 0 0 260px!important;margin-left:260px!important;left:0!important;width:auto!important;max-width:none!important;min-width:0!important;padding:0.5rem 1.5rem 2rem!important;box-sizing:border-box!important;transform:none!important}',
      '#portal-agent.active .main .view, #portal-agent.active .main .stats, #portal-agent.active .main .tickets-list, #portal-agent.active .main table{width:100%!important;max-width:none!important;box-sizing:border-box!important}',
      '@media (max-width:800px){',
      '#portal-agent.active{padding:0!important;display:flex!important;flex-direction:column!important}',
      '#portal-agent.active .sidebar{position:relative!important;top:auto!important;width:100%!important;max-width:none!important;height:auto!important}',
      '#portal-agent.active main.main,#portal-agent.active .main{margin-left:0!important;width:100%!important}',
      '}'
    ].join('');
  }

  function force() {
    inject();
    var pa = document.getElementById('portal-agent');
    if (!pa || !pa.classList.contains('active')) return;

    var m = document.querySelector('#portal-agent main.main, #portal-agent .main');
    var side = document.querySelector('#portal-agent .sidebar');
    var bar = document.querySelector('.mode-bar');
    if (bar) {
      bar.style.setProperty('position', 'fixed', 'important');
      bar.style.setProperty('top', '0', 'important');
      bar.style.setProperty('left', '0', 'important');
      bar.style.setProperty('right', '0', 'important');
      bar.style.setProperty('z-index', '300', 'important');
    }
    if (side) {
      side.style.setProperty('position', 'fixed', 'important');
      side.style.setProperty('top', '49px', 'important');
      side.style.setProperty('left', '0', 'important');
      side.style.setProperty('width', '260px', 'important');
      side.style.setProperty('height', 'calc(100vh - 49px)', 'important');
      side.style.setProperty('z-index', '250', 'important');
    }
    pa.style.setProperty('display', 'block', 'important');
    pa.style.setProperty('padding-top', '49px', 'important');
    pa.style.setProperty('width', '100%', 'important');
    if (m) {
      m.style.setProperty('margin-left', '260px', 'important');
      m.style.setProperty('width', 'auto', 'important');
      m.style.setProperty('max-width', 'none', 'important');
      m.style.setProperty('display', 'block', 'important');
    }
  }

  inject();
  force();
  setInterval(force, 2000);
  window.addEventListener('resize', force);
  window.DRLayoutFix = { force: force };
})();
