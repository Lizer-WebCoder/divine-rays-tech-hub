/**
 * Divine Rays — ambient-static v1
 * Freeze ambient CSS animations once login is up / on password focus.
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_STATIC >= 1) return;
  window.__DR_AMBIENT_STATIC = 1;

  function freeze() {
    try {
      var amb = document.getElementById('dr-login-ambient');
      if (!amb) return;
      if (amb.getAttribute('data-dr-frozen') === '1') return;
      amb.setAttribute('data-dr-frozen', '1');
      amb.style.setProperty('animation', 'none', 'important');
      var nodes = amb.querySelectorAll('*');
      for (var i = 0; i < nodes.length; i++) {
        try {
          nodes[i].style.setProperty('animation', 'none', 'important');
          nodes[i].style.setProperty('transition', 'none', 'important');
          nodes[i].style.setProperty('will-change', 'auto', 'important');
        } catch (e) {}
      }
    } catch (e2) {}
  }

  function onLoginInput(el) {
    if (!el || !el.closest) return false;
    if (!el.closest('#login-screen, #login-agent, form.login-form, .login-card')) return false;
    var tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA';
  }

  document.addEventListener(
    'focusin',
    function (ev) {
      if (onLoginInput(ev.target)) freeze();
    },
    true
  );
  document.addEventListener(
    'pointerdown',
    function (ev) {
      if (onLoginInput(ev.target)) freeze();
    },
    true
  );

  var n = 0;
  var iv = setInterval(function () {
    if (document.getElementById('dr-login-ambient')) {
      freeze();
      if (++n > 8) clearInterval(iv);
    } else if (++n > 40) clearInterval(iv);
  }, 300);
})();
