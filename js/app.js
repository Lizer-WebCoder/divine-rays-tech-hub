/**
 * Divine Rays Tech Hub — load core app (restored)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  var urls = [
    'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@abdc47355c0342744e79b8545458cd7d729f93d1/js/app.js',
    'https://fastly.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@abdc47355c0342744e79b8545458cd7d729f93d1/js/app.js'
  ];
  function load(i) {
    if (i >= urls.length) {
      console.error('Failed to load Divine Rays app.js');
      return;
    }
    var s = document.createElement('script');
    s.src = urls[i];
    s.async = false;
    s.onerror = function () { load(i + 1); };
    document.head.appendChild(s);
  }
  load(0);
})();
