/**
 * Divine Rays — force readable customer tabs in light mode (inline styles)
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TAB_CONTRAST) return;
  window.__DR_TAB_CONTRAST = 1;

  function isLight() {
    try {
      return document.documentElement.getAttribute('data-theme') === 'light';
    } catch (e) {
      return false;
    }
  }

  function paintTab(btn) {
    if (!btn || !btn.classList || !btn.classList.contains('ctab')) return;
    if (!isLight()) {
      ['color', 'background', 'background-image', 'border', 'border-color',
        'box-shadow', 'opacity', '-webkit-text-fill-color', 'font-weight', 'text-shadow'].forEach(function (p) {
        try { btn.style.removeProperty(p); } catch (e) {}
      });
      return;
    }
    var active = btn.classList.contains('active');
    if (active) {
      btn.style.setProperty('color', '#ffffff', 'important');
      btn.style.setProperty('-webkit-text-fill-color', '#ffffff', 'important');
      btn.style.setProperty('background', '#5b21b6', 'important');
      btn.style.setProperty('background-image', 'linear-gradient(135deg,#6d28d9,#4c1d95)', 'important');
      btn.style.setProperty('border', '2px solid #4c1d95', 'important');
      btn.style.setProperty('box-shadow', '0 4px 14px rgba(76,29,149,0.45)', 'important');
      btn.style.setProperty('opacity', '1', 'important');
      btn.style.setProperty('font-weight', '700', 'important');
      btn.style.setProperty('text-shadow', 'none', 'important');
    } else {
      btn.style.setProperty('color', '#111827', 'important');
      btn.style.setProperty('-webkit-text-fill-color', '#111827', 'important');
      btn.style.setProperty('background', '#ffffff', 'important');
      btn.style.setProperty('background-image', 'none', 'important');
      btn.style.setProperty('border', '2px solid #6d28d9', 'important');
      btn.style.setProperty('box-shadow', '0 2px 6px rgba(0,0,0,0.08)', 'important');
      btn.style.setProperty('opacity', '1', 'important');
      btn.style.setProperty('font-weight', '700', 'important');
      btn.style.setProperty('text-shadow', 'none', 'important');
    }
  }

  function paintAll() {
    document.querySelectorAll('#portal-customer .ctab, .customer-tabs .ctab, button.ctab').forEach(paintTab);
    if (isLight()) {
      document.querySelectorAll('#portal-customer .customer-header p, #portal-customer .portal-subtitle').forEach(function (p) {
        p.style.setProperty('color', '#1e1b4b', 'important');
        p.style.setProperty('opacity', '1', 'important');
        p.style.setProperty('font-weight', '600', 'important');
        p.style.setProperty('-webkit-text-fill-color', '#1e1b4b', 'important');
      });
    }
  }

  function wire() {
    paintAll();
    document.querySelectorAll('#portal-customer .ctab, .customer-tabs .ctab').forEach(function (btn) {
      if (btn.__drTabPaint) return;
      btn.__drTabPaint = true;
      btn.addEventListener('click', function () {
        setTimeout(paintAll, 0);
        setTimeout(paintAll, 50);
        setTimeout(paintAll, 200);
      });
    });
  }

  try {
    var mo = new MutationObserver(function () { paintAll(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    var bodyMo = new MutationObserver(function () { wire(); });
    bodyMo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  } catch (e) {}

  wire();
  setTimeout(wire, 300);
  setTimeout(wire, 1000);
  setTimeout(wire, 2500);
  setInterval(wire, 5000);

  window.DRTabContrast = { refresh: paintAll };
})();
