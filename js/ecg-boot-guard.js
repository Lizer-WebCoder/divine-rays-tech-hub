/**
 * Divine Rays — ecg-boot-guard v2
 * Block ancient 94e50; hide ECG during boot; load heartbeat v32 once after boot.
 */
(function () {
  'use strict';
  if (window.__DR_ECG_BOOT_GUARD >= 2) return;
  window.__DR_ECG_BOOT_GUARD = 2;

  var BAD = [
    '94e50c1b33158e9209a9f551eae599753a3ce75f',
    '80f8a73413ed5698b24c61856ddc5a1569714ac0',
    'a9046e485443b24e800a4f4d10747c10146ca663',
    '1887c6e9fe2436bf5402f2c4fa40dda29597416f'
  ];
  var GOOD_HB =
    'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@24b8859bff9763c7e547507abc3cc1fcb2c3f309/js/heartbeat-draw.js';
  var _hb = Number(window.__DR_HEARTBEAT_DRAW) || 0;
  var _loadedGood = false;

  try {
    Object.defineProperty(window, '__DR_HEARTBEAT_DRAW', {
      configurable: true,
      enumerable: true,
      get: function () {
        return _hb;
      },
      set: function (n) {
        var v = Number(n) || 0;
        if (v >= _hb) _hb = v;
      }
    });
  } catch (eLock) {}

  function isBadSrc(src) {
    if (!src) return false;
    for (var i = 0; i < BAD.length; i++) {
      if (String(src).indexOf(BAD[i]) !== -1) return true;
    }
    return false;
  }

  function neutralize(el) {
    try {
      el.type = 'text/plain';
      el.removeAttribute('src');
      if (el.parentNode) el.parentNode.removeChild(el);
    } catch (e) {}
  }

  try {
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var nodes = muts[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (n && n.tagName === 'SCRIPT' && isBadSrc(n.src || '')) neutralize(n);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (eObs) {}

  try {
    var _ce = document.createElement.bind(document);
    document.createElement = function (tag) {
      var el = _ce(tag);
      if (String(tag).toLowerCase() === 'script') {
        var desc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
        if (desc && desc.set) {
          Object.defineProperty(el, 'src', {
            configurable: true,
            enumerable: true,
            get: function () {
              return desc.get.call(this);
            },
            set: function (v) {
              if (isBadSrc(v)) {
                desc.set.call(this, 'about:blank');
                this.type = 'text/plain';
                return;
              }
              desc.set.call(this, v);
            }
          });
        }
      }
      return el;
    };
  } catch (eCe) {}

  function bootStillUp() {
    try {
      if (document.body && document.body.classList.contains('dr-boot-holding')) return true;
      var o = document.getElementById('dr-boot-overlay');
      if (o && !o.classList.contains('is-done') && !o.classList.contains('dr-boot-removed')) return true;
      if (o && o.classList.contains('is-done')) {
        try {
          if (parseFloat(window.getComputedStyle(o).opacity || '0') > 0.05) return true;
        } catch (e) {}
      }
      var login = document.getElementById('login-screen');
      if (login && !login.hidden && (!o || o.classList.contains('dr-boot-removed') || !document.body.contains(o))) {
        return false;
      }
      if (window.__DR_BOOT_DONE !== true && o) return true;
    } catch (e2) {}
    return false;
  }

  function clearPremature() {
    if (!bootStillUp()) return;
    try {
      var box = document.getElementById('dr-lifeline');
      if (box) {
        box.style.setProperty('opacity', '0', 'important');
        box.style.setProperty('visibility', 'hidden', 'important');
        if (box.querySelector('.dr-ecg-core')) {
          box.innerHTML = '';
          window.__DR_ECG_DRAWN = 0;
        }
      }
    } catch (e) {}
  }

  function loadGoodHeartbeat() {
    if (_loadedGood) return;
    if (document.querySelector('#dr-lifeline .dr-ecg-core')) {
      _loadedGood = true;
      window.__DR_ECG_DRAWN = 1;
      return;
    }
    _loadedGood = true;
    try {
      window.__DR_ECG_OK = true;
      document.documentElement.setAttribute('data-ecg', 'on');
      window.__DR_BOOT_DONE = true;
      try {
        delete window.__DR_HEARTBEAT_DRAW;
      } catch (eDel) {}
      _hb = 0;
      try {
        window.__DR_HEARTBEAT_DRAW = 0;
      } catch (eSet) {}
      var s = document.createElement('script');
      s.src = GOOD_HB + '?b=' + Date.now();
      s.async = false;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {
      _loadedGood = false;
    }
  }

  function reveal() {
    try {
      var box = document.getElementById('dr-lifeline');
      if (box) {
        box.style.removeProperty('opacity');
        box.style.removeProperty('visibility');
        box.removeAttribute('data-dr-boot-hide');
      }
    } catch (e) {}
  }

  try {
    var st = document.createElement('style');
    st.id = 'dr-ecg-boot-guard-css';
    st.textContent =
      'body.dr-boot-holding #dr-lifeline{opacity:0!important;visibility:hidden!important}';
    (document.head || document.documentElement).appendChild(st);
  } catch (eCss) {}

  var n = 0;
  var iv = setInterval(function () {
    if (bootStillUp()) {
      clearPremature();
      if (++n > 100) clearInterval(iv);
      return;
    }
    clearInterval(iv);
    reveal();
    loadGoodHeartbeat();
    setTimeout(function () {
      if (!document.querySelector('#dr-lifeline .dr-ecg-core')) {
        _loadedGood = false;
        loadGoodHeartbeat();
      }
      reveal();
    }, 600);
  }, 150);

  window.DREcgBootGuard = { v: 2, bootStillUp: bootStillUp };
})();
