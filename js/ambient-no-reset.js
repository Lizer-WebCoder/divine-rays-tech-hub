/**
 * Divine Rays — freeze login ambient layer after first paint
 * force-light-bg rebuilds #dr-login-ambient on login card clicks, restarting dashed lines.
 * This locks the layer HTML after it first renders so animations keep running.
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_NO_RESET) return;
  window.__DR_AMBIENT_NO_RESET = 1;

  var LAYER_ID = 'dr-login-ambient';
  var frozenHtml = null;

  function freezeLayer(layer) {
    if (!layer || frozenHtml) return !!frozenHtml;
    if (!layer.childNodes || !layer.childNodes.length) return false;
    frozenHtml = layer.innerHTML;
    try {
      Object.defineProperty(layer, 'innerHTML', {
        configurable: true,
        enumerable: true,
        get: function () {
          return frozenHtml;
        },
        set: function (v) {
          /* Ignore rebuilds — keep continuous line animation */
          if (!frozenHtml && v) frozenHtml = v;
        }
      });
    } catch (e) {
      /* Fallback: restore HTML if wiped */
      try {
        var obs = new MutationObserver(function () {
          if (frozenHtml && layer.innerHTML !== frozenHtml && layer.childNodes.length < 2) {
            layer.innerHTML = frozenHtml;
          }
        });
        obs.observe(layer, { childList: true });
      } catch (e2) {}
    }
    return true;
  }

  function tryFreeze() {
    return freezeLayer(document.getElementById(LAYER_ID));
  }

  if (!tryFreeze()) {
    var n = 0;
    var t = setInterval(function () {
      if (tryFreeze() || ++n > 60) clearInterval(t);
    }, 200);
  }

  /* Also stop DRForceLightBg.refresh from forcing a full rebuild when ambient exists */
  function patchRefresh() {
    if (!window.DRForceLightBg || !window.DRForceLightBg.refresh) return false;
    if (window.DRForceLightBg.__noReset) return true;
    var orig = window.DRForceLightBg.refresh;
    window.DRForceLightBg.refresh = function () {
      var layer = document.getElementById(LAYER_ID);
      if (layer && layer.childNodes && layer.childNodes.length) {
        tryFreeze();
        return;
      }
      return orig.apply(this, arguments);
    };
    window.DRForceLightBg.__noReset = 1;
    return true;
  }

  if (!patchRefresh()) {
    var n2 = 0;
    var t2 = setInterval(function () {
      if (patchRefresh() || ++n2 > 60) clearInterval(t2);
    }, 200);
  }
})();
