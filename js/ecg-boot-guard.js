/**
 * Divine Rays — ecg-boot-guard v1
 * Blocks ancient heartbeat (94e50…) that deletes version guards and redraws during boot.
 * Lifeline stays hidden until boot is fully gone, then one clean start is allowed.
 */
(function () {
  'use strict';
  if (window.__DR_ECG_BOOT_GUARD >= 1) return;
  window.__DR_ECG_BOOT_GUARD = 1;

  var BAD = [
    '94e50c1b33158e9209a9f551eae599753a3ce75f',
    '80f8a73413ed5698b24c61856ddc5a1569714ac0',
    'a9046e485443b24e800a4f4d10747c10146ca663',
    '1887c6e9fe2436bf5402f2c4fa40dda29597416f'
  ];
  var GOOD_MIN = 32;

  try {
    var _hb = window.__DR_HEARTBEAT_DRAW || 0;
    if (_hb < GOOD_MIN) _hb = GOOD_MIN;
    Object.defineProperty(window, '__DR_HEARTBEAT_DRAW', {
      configurable: false,
      enumerable: true,
      get: function () {
        return _hb;
      },
      set: function (n) {
        var v = Number(n) || 0;
        if (v >= _hb) _hb = v;
      }
    });
  } catch (eLock) {
    window.__DR_HEARTBEAT_DRAW = GOOD_MIN;
  }

  function isBadSrc(src) {
    if (!src) return false;
    for (var i = 0; i < BAD.length; i++) {
      if (src.indexOf(BAD[i]) !== -1) return true;
    }
    return false;
  }

  function neutralizeScript(el) {
    try {
      el.type = 'text/plain';
      el.removeAttribute('src');
      if (el.parentNode) el.parentNode.removeChild(el);
    } catch (e) {}
  }

  try {
    var obs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var nodes = muts[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (!n || n.tagName !== 'SCRIPT') continue;
          if (isBadSrc(n.src || n.getAttribute('src') || '')) neutralizeScript(n);
        }
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
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
              if (isBadSrc(String(v))) {
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
      if (window.__DR_BOOT_DONE !== true) return true;
    } catch (e2) {}
    return false;
  }

  function hideLifeline() {
    try {
      var box = document.getElementById('dr-lifeline');
      if (box) {
        box.style.setProperty('opacity', '0', 'important');
        box.style.setProperty('visibility', 'hidden', 'important');
        box.setAttribute('data-dr-boot-hide', '1');
      }
    } catch (e) {}
  }

  function clearLifelineDuringBoot() {
    if (!bootStillUp()) return;
    hideLifeline();
    try {
      var box = document.getElementById('dr-lifeline');
      if (box && box.querySelector('.dr-ecg-core')) {
        box.innerHTML = '';
        window.__DR_ECG_DRAWN = 0;
      }
    } catch (e) {}
    try {
      if (window.__DR_ECG_TIMER) {
        clearTimeout(window.__DR_ECG_TIMER);
        window.__DR_ECG_TIMER = null;
      }
    } catch (e2) {}
  }

  function revealAndAllowOnce() {
    if (bootStillUp()) return false;
    try {
      window.__DR_ECG_OK = true;
      document.documentElement.setAttribute('data-ecg', 'on');
      window.__DR_BOOT_DONE = true;
    } catch (e) {}
    try {
      var box = document.getElementById('dr-lifeline');
      if (box) {
        box.style.removeProperty('opacity');
        box.style.removeProperty('visibility');
        box.removeAttribute('data-dr-boot-hide');
      }
    } catch (e2) {}
    return true;
  }

  try {
    var st = document.createElement('style');
    st.id = 'dr-ecg-boot-guard-css';
    st.textContent =
      'body.dr-boot-holding #dr-lifeline,' +
      'html:not([data-ecg="on"]) #dr-lifeline,' +
      '#dr-lifeline[data-dr-boot-hide="1"]{' +
      'opacity:0!important;visibility:hidden!important;pointer-events:none!important}';
    (document.head || document.documentElement).appendChild(st);
  } catch (eCss) {}

  var n = 0;
  var iv = setInterval(function () {
    clearLifelineDuringBoot();
    if (revealAndAllowOnce() || ++n > 80) {
      clearInterval(iv);
      setTimeout(function () {
        try {
          if (!document.querySelector('#dr-lifeline .dr-ecg-core') && window.DRHeartbeatDraw) {
            window.__DR_ECG_DRAWN = 0;
            if (typeof window.DRHeartbeatDraw.refresh === 'function') {
              window.DRHeartbeatDraw.refresh();
            }
          }
        } catch (e) {}
      }, 300);
    }
  }, 200);

  window.DREcgBootGuard = { v: 1, bootStillUp: bootStillUp };
})();
