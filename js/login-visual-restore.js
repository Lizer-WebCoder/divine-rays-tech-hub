/**
 * Divine Rays — login visual restore
 * Classic honeycomb + network (Oct 13 look)
 * Login card purple glow; pending orange glow + shake + toast
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_VISUAL >= 1) return;
  window.__DR_LOGIN_VISUAL = 1;

  var CSS = [
    '#login-screen .login-card,.login-screen .login-card{',
    'box-shadow:0 0 0 1px rgba(124,106,240,0.25),0 0 28px rgba(124,106,240,0.35),0 0 64px rgba(91,33,182,0.22)!important;',
    'border-color:rgba(124,106,240,0.35)!important',
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
    '}',
    '#dr-login-ambient{opacity:1!important;visibility:visible!important;pointer-events:none!important;z-index:0!important}',
    '#dr-login-ambient .dr-honeycomb{opacity:0.2!important}',
    '#dr-login-ambient .dr-network{opacity:0.55!important}',
    'html,body,#login-screen,.login-screen{',
    'background-color:#120830!important;',
    'background-image:',
    'radial-gradient(ellipse 100% 70% at 50% 45%,rgba(124,58,237,0.35),transparent 55%),',
    'radial-gradient(ellipse 70% 50% at 15% 20%,rgba(139,92,246,0.22),transparent 50%),',
    'radial-gradient(ellipse 70% 50% at 85% 80%,rgba(91,33,182,0.28),transparent 50%),',
    'linear-gradient(180deg,#2a1058 0%,#1a0a3e 35%,#120830 65%,#0a0518 100%)!important;',
    'background-attachment:fixed!important',
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
  }
  inject();
  setTimeout(inject, 400);
  setTimeout(inject, 1200);

  try {
    var bad = document.getElementById('dr-login-bg-830dac');
    if (bad && bad.parentNode) bad.parentNode.removeChild(bad);
  } catch (e) {}

  window.DRLoginVisual = { v: 1, refresh: inject };
})();
