(function(){
  var p = window.__DR_CHUNKS || [];
  if (!p.length) { console.error('DR chunks missing'); return; }
  var bin = atob(p.join(''));
  var code;
  try { code = new TextDecoder('utf-8').decode(Uint8Array.from(bin, function(c){ return c.charCodeAt(0); })); }
  catch(e) {
    try { code = decodeURIComponent(escape(bin)); } catch(e2) { code = bin; }
  }
  var s = document.createElement('script');
  s.text = code;
  document.head.appendChild(s);
})();
