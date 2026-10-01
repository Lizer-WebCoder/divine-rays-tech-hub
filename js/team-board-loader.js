/** Load stable team-board after pin shell (overrides flicker version) */
(function(){
  if (window.__DR_TEAM_BOARD_LOADER) return;
  window.__DR_TEAM_BOARD_LOADER = 1;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@6d66f6b647cf6f4c7340536dab472409bd1de5d6/js/team-board.js?v=' + Date.now();
  s.async = false;
  document.body.appendChild(s);
})();
