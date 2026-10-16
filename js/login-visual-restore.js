/**
 * Divine Rays — login visual restore v3
 * Darker purple gradient + strong card glow + glass card
 * Pending orange glow + shake + toast
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_VISUAL >= 3) return;
  window.__DR_LOGIN_VISUAL = 3;

  var CSS = [
    'html,body,#login-screen,.login-screen{',
    'background-color:#0a0614!important;',
    'background-image:',
    'radial-gradient(ellipse 90% 60% at 50% 40%,rgba(88,40,180,0.28),transparent 55%),',
    'radial-gradient(ellipse 60% 45% at 12% 18%,rgba(70,30,140,0.18),transparent 50%),',
    'radial-gradient(ellipse 60% 45% at 88% 82%,rgba(55,20,110,0.2),transparent 50%),',
    'linear-gradient(180deg,#1a0c38 0%,#120828 30%,#0c0618 60%,#06040e 100%)!important;',
    'background-attachment:fixed!important',
    '}',
    '#dr-login-ambient{',
    'opacity:1!important;visibility:visible!important;pointer-events:none!important;',
    'z-index:0!important;position:fixed!important;inset:0!important',
    '}',
    '#dr-lifeline{',
    'z-index:1!important;pointer-events:none!important;',
    'opacity:1!important;visibility:visible!important',
    '}',
    '#login-screen .login-card,.login-screen .login-card{',
    'background:rgba(18,16,30,0.58)!important;',
    'background-color:rgba(18,16,30,0.58)!important;',
    'backdrop-filter:blur(16px) saturate(1.25)!important;',
    '-webkit-backdrop-filter:blur(16px) saturate(1.25)!important;',
    'border:1px solid rgba(167,139,250,0.4)!important;',
    'box-shadow:',
    '0 0 0 1px rgba(124,106,240,0.3),',
    '0 0 24px rgba(139,92,246,0.55),',
    '0 0 56px rgba(109,40,217,0.45),',
    '0 0 100px rgba(76,29,149,0.3)!important;',
    'position:relative!important;z-index:2!important',
    '}',
    '#login-screen .login-card input,.login-screen .login-card input{',
    'background:rgba(10,10,18,0.75)!important;',
    'border-color:rgba(46,46,66,0.9)!important',
    '}',
    '#login-screen .login-card .ltab:not(.active),.login-screen .login-card .ltab:not(.active){',
    'background:rgba(12,12,18,0.55)!important',
    '}',
    '.login-card.login-pending-glow{',
    'box-shadow:0 0 22px rgba(251,146,60,0.9),0 0 52px rgba(249,115,22,0.55)!important;',
    'border-color:rgba(251,146,60,0.95)!important;',
    'animation:drPendingPulse 1.2s ease-in-out infinite',
    '}',
    '@keyframes drPendingPulse{',
    '0%,100%{box-shadow:0 0 22px rgba(251,146,60,0.85),0 0 48px rgba(249,115,22,0.45)}',
    '50%{box-shadow:0 0 28px rgba(251,146,60,1),0 0 64px rgba(249,115,22,0.7)}',
    '}',
    '.login-card.dr-shake{animation:drCardShake 0.45s ease-in-out}',
    '@keyframes drCardShake{',
    '0%,100%{transform:translateX(0)}',
    '20%{transform:translateX(-8px)}',
    '40%{transform:translateX(8px)}',
    '60%{transform:translateX(-6px)}',
    '80%{transform:translateX(6px)}',
    '}',
    '.toast[data-dr-force-pending],#login-screen .toast[data-dr-force-pending]{',
    'position:fixed!important;top:1rem!important;right:1rem!important;z-index:10000!important;',
    'max-width:320px!important;padding:0.85rem 1.1rem!important;',
    'background:#1a1a28!important;border:1px solid rgba(251,146,60,0.45)!important;',
    'border-left:3px solid #fb923c!important;border-radius:12px!important;',
    'color:#eeeef6!important;font-size:0.88rem!important;line-height:1.4!important;',
    'box-shadow:0 8px 28px rgba(0,0,0,0.35)!important',
    '}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-login-visual-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-login-visual-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
    try {
      document.querySelectorAll('#login-screen .login-card, .login-screen .login-card').forEach(function (c) {
        c.style.setProperty('background', 'rgba(18,16,30,0.58)', 'important');
        c.style.setProperty('background-color', 'rgba(18,16,30,0.58)', 'important');
        c.style.setProperty('backdrop-filter', 'blur(16px) saturate(1.25)', 'important');
        c.style.setProperty('box-shadow',
          '0 0 0 1px rgba(124,106,240,0.3),0 0 24px rgba(139,92,246,0.55),0 0 56px rgba(109,40,217,0.45),0 0 100px rgba(76,29,149,0.3)',
          'important');
      });
    } catch (e) {}
    try {
      var bad = document.getElementById('dr-login-bg-830dac');
      if (bad && bad.parentNode) bad.parentNode.removeChild(bad);
    } catch (e2) {}
  }
  inject();
  setTimeout(inject, 200);
  setTimeout(inject, 600);
  setTimeout(inject, 1400);
  window.DRLoginVisual = { v: 3, refresh: inject };
})();
