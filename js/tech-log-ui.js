/**
 * Divine Rays Tech Log UI v1 — inventory / borrow / approve / return
 * Mounts into Tech Log shell only. Does not touch Support portal.
 * Requires: sql/tech-log-schema.sql run in Supabase
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TECH_LOG_UI_V1) return;
  window.__DR_TECH_LOG_UI_V1 = 1;

  var tab = 'available';
  var cache = { assets: [], borrows: [], profiles: {} };
  var pendingAssetId = null;
  var BRANCHES = ['Abucay','Avenida','Pawing','Palo','Abuyog','Baybay','Sogod','Maasin','Kananga','Ormoc','Calbayog','Catbalogan','Catarman','Dongon'];
  var CATS = [{id:'Laptop',code:'LT'},{id:'Mouse',code:'MS'},{id:'Keyboard',code:'KB'},{id:'Camera',code:'CM'},{id:'USB Port',code:'USB'},{id:'Other',code:'OT'}];

  function sb(){ try{ if(window.DR&&DR.sb) return DR.sb(); }catch(e){} return window.sb||null; }
  function me(){ try{ if(window.DR&&DR.getProfile){ var p=DR.getProfile(); if(p&&p.id) return p; } }catch(e){} return null; }
  function isStaff(){ var r=(me()&&me().role)||''; return r==='admin'||r==='agent'; }
  function toast(m,t){ if(window.DR&&DR.toast) DR.toast(m,t); else try{ console.log('[TL]',m); }catch(e){} }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"'); }
  function catCode(n){ for(var i=0;i<CATS.length;i++) if(CATS[i].id===n) return CATS[i].code; return 'OT'; }
  function fmtDate(d){ if(!d) return '—'; try{ var x=new Date(d); return isNaN(x.getTime())?'—':x.toLocaleString(); }catch(e){ return '—'; } }
  function badge(st){
    var c={available:'#34d399',borrowed:'#fbbf24',pending:'#a78bfa',active:'#34d399',returned:'#9494ae',rejected:'#f87171',overdue:'#ef4444',maintenance:'#60a5fa',retired:'#9494ae'};
    var col=c[st]||'#c4b5fd';
    return '<span style="display:inline-block;padding:.12rem .45rem;border-radius:6px;font-size:.68rem;font-weight:700;text-transform:uppercase;border:1px solid '+col+'40;color:'+col+'">'+esc(st)+'</span>';
  }
  function nameOf(uid){ if(!uid) return '—'; var p=cache.profiles[uid]; return p?(p.full_name||p.username||p.email||uid.slice(0,8)):uid.slice(0,8); }
  function assetById(id){ for(var i=0;i<cache.assets.length;i++) if(cache.assets[i].id===id) return cache.assets[i]; return null; }

  var CSS = [
    '#tl-ui-root .tl-tabs{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem}',
    '#tl-ui-root .tl-tab{border-radius:999px;padding:.4rem .9rem;font-size:.8rem;font-weight:600;cursor:pointer;border:1px solid rgba(139,124,247,.28);background:rgba(26,26,36,.88);color:#c4b5fd}',
    '#tl-ui-root .tl-tab.on{background:linear-gradient(135deg,#7c6af0,#5b4ce0);color:#fff;border-color:transparent}',
    '#tl-ui-root .tl-panel{background:rgba(26,26,36,.95);border:1px solid rgba(139,124,247,.24);border-radius:14px;padding:1.05rem;margin-bottom:1rem}',
    '#tl-ui-root .tl-panel h2{margin:0 0 .75rem;font-size:1rem;color:#e8e8f0}',
    '#tl-ui-root .tl-row{display:grid;gap:.55rem}',
    '@media(min-width:720px){#tl-ui-root .tl-row.c2{grid-template-columns:1fr 1fr}#tl-ui-root .tl-row.c3{grid-template-columns:1fr 1fr 1fr}}',
    '#tl-ui-root .tl-field label{display:block;font-size:.72rem;color:#9494ae;margin-bottom:.25rem;font-weight:600}',
    '#tl-ui-root .tl-field input,#tl-ui-root .tl-field select,#tl-ui-root .tl-field textarea{width:100%;box-sizing:border-box;border-radius:10px;border:1px solid rgba(139,124,247,.28);background:rgba(12,12,20,.65);color:#eeeef6;padding:.5rem .65rem;font:inherit}',
    '#tl-ui-root .tl-actions{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.75rem}',
    '#tl-ui-root .tl-btn{border-radius:999px;padding:.4rem .9rem;font-size:.78rem;font-weight:600;cursor:pointer;border:none;background:linear-gradient(135deg,#7c6af0,#5b4ce0);color:#fff}',
    '#tl-ui-root .tl-btn.ghost{background:transparent;border:1px solid rgba(167,139,250,.4);color:#c4b5fd}',
    '#tl-ui-root .tl-btn.danger{background:rgba(239,68,68,.2);border:1px solid rgba(239,68,68,.45);color:#fca5a5}',
    '#tl-ui-root .tl-btn.ok{background:rgba(52,211,153,.2);border:1px solid rgba(52,211,153,.45);color:#6ee7b7}',
    '#tl-ui-root .tl-table{width:100%;border-collapse:collapse;font-size:.82rem}',
    '#tl-ui-root .tl-table th{text-align:left;padding:.5rem .45rem;color:#9494ae;font-size:.7rem;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.06)}',
    '#tl-ui-root .tl-table td{padding:.55rem .45rem;border-bottom:1px solid rgba(255,255,255,.04);color:#e8e8f0;vertical-align:top}',
    '#tl-ui-root .tl-empty{padding:1.25rem;text-align:center;color:#8b8ba3;font-size:.88rem}',
    '#tl-ui-root .tl-muted{color:#8b8ba3;font-size:.75rem}',
    '#tl-ui-root .tl-table-wrap{overflow:auto}',
    '@media print{body *{visibility:hidden!important}#tl-print-area,#tl-print-area *{visibility:visible!important}#tl-print-area{position:fixed;left:0;top:0;width:100%;padding:24px;background:#fff;color:#111}}'
  ].join('');

  function injectCss(){
    var el=document.getElementById('dr-tech-log-ui-css');
    if(!el){ el=document.createElement('style'); el.id='dr-tech-log-ui-css'; document.head.appendChild(el); }
    el.textContent=CSS;
  }

  async function loadProfiles(ids){
    var client=sb(); if(!client||!ids||!ids.length) return;
    var uniq=[]; ids.forEach(function(id){ if(id&&!cache.profiles[id]&&uniq.indexOf(id)===-1) uniq.push(id); });
    if(!uniq.length) return;
    try{
      var r=await client.from('profiles').select('id,full_name,username,email,role').in('id',uniq);
      if(r.data) r.data.forEach(function(p){ cache.profiles[p.id]=p; });
    }catch(e){}
  }

  async function refreshData(){
    var client=sb();
    if(!client){ toast('Supabase not ready','error'); return; }
    try{
      var a=await client.from('tl_assets').select('*').order('tag',{ascending:true});
      if(a.error){ toast('Run tech-log-schema.sql in Supabase first','error'); cache.assets=[]; }
      else cache.assets=a.data||[];
      var b=await client.from('tl_borrows').select('*').order('created_at',{ascending:false});
      cache.borrows=b.error?[]:(b.data||[]);
      var pids=[];
      cache.borrows.forEach(function(x){ if(x.borrower_id) pids.push(x.borrower_id); if(x.approved_by) pids.push(x.approved_by); });
      await loadProfiles(pids);
    }catch(e){
      console.warn('[TL-UI]', e);
      toast('Could not load Tech Log data','error');
    }
  }

  function nextTag(category){
    var code=catCode(category), max=0;
    cache.assets.forEach(function(a){
      var m=String(a.tag||'').toUpperCase().match(new RegExp('^DR-'+code+'-(\\d+)$'));
      if(m){ var n=parseInt(m[1],10); if(n>max) max=n; }
    });
    var num=String(max+1); while(num.length<3) num='0'+num;
    return 'DR-'+code+'-'+num;
  }

  async function addAsset(form){
    var client=sb(), p=me();
    if(!client||!p||!isStaff()){ toast('Staff only','error'); return; }
    var category=form.category.value;
    var row={ tag:(form.tag.value||'').trim()||nextTag(category), name:(form.name.value||'').trim(), category:category, branch:form.branch.value||null, status:form.status.value||'available', notes:(form.notes.value||'').trim()||null, created_by:p.id };
    if(!row.name){ toast('Name required','error'); return; }
    var r=await client.from('tl_assets').insert(row).select('*').maybeSingle();
    if(r.error){ toast(r.error.message||'Failed','error'); return; }
    toast('Added '+row.tag,'ok'); form.reset(); await refreshData(); render();
  }

  async function requestBorrow(assetId, purpose, dueAt){
    var client=sb(), p=me();
    if(!client||!p){ toast('Sign in required','error'); return; }
    var asset=assetById(assetId);
    if(!asset||asset.status!=='available'){ toast('Not available','error'); return; }
    var r=await client.from('tl_borrows').insert({ asset_id:assetId, borrower_id:p.id, status:'pending', purpose:(purpose||'').trim()||null, due_at:dueAt||null }).select('*').maybeSingle();
    if(r.error){ toast(r.error.message||'Failed','error'); return; }
    toast('Request submitted (pending approval)','ok'); await refreshData(); render();
  }

  async function approveBorrow(id){
    var client=sb(), p=me(); if(!client||!p||!isStaff()) return;
    var borrow=null; cache.borrows.forEach(function(b){ if(b.id===id) borrow=b; }); if(!borrow) return;
    var r=await client.from('tl_borrows').update({ status:'active', approved_by:p.id, borrowed_at:new Date().toISOString() }).eq('id',id);
    if(r.error){ toast(r.error.message||'Failed','error'); return; }
    await client.from('tl_assets').update({ status:'borrowed' }).eq('id',borrow.asset_id);
    toast('Approved','ok'); await refreshData(); render(); printReceipt(id);
  }

  async function rejectBorrow(id){
    var client=sb(), p=me(); if(!client||!p||!isStaff()) return;
    var r=await client.from('tl_borrows').update({ status:'rejected', approved_by:p.id }).eq('id',id);
    if(r.error){ toast(r.error.message||'Failed','error'); return; }
    toast('Rejected','ok'); await refreshData(); render();
  }

  async function returnBorrow(id){
    var client=sb(), p=me(); if(!client||!p) return;
    var borrow=null; cache.borrows.forEach(function(b){ if(b.id===id) borrow=b; }); if(!borrow) return;
    if(!isStaff()&&borrow.borrower_id!==p.id){ toast('Not your borrow','error'); return; }
    var r=await client.from('tl_borrows').update({ status:'returned', returned_at:new Date().toISOString() }).eq('id',id);
    if(r.error){ toast(r.error.message||'Failed','error'); return; }
    await client.from('tl_assets').update({ status:'available' }).eq('id',borrow.asset_id);
    toast('Returned','ok'); await refreshData(); render();
  }

  function printReceipt(id){
    var borrow=null; cache.borrows.forEach(function(b){ if(b.id===id) borrow=b; }); if(!borrow) return;
    var a=assetById(borrow.asset_id)||{};
    var old=document.getElementById('tl-print-area'); if(old) old.parentNode.removeChild(old);
    var div=document.createElement('div');
    div.id='tl-print-area';
    div.innerHTML='<h2 style="margin:0 0 8px;font-family:system-ui">Divine Rays Tech Log</h2><p style="color:#444">Borrow receipt</p>'+
      '<table style="font-size:14px;font-family:system-ui"><tr><td>Tag</td><td><b>'+esc(a.tag)+'</b></td></tr>'+
      '<tr><td>Item</td><td>'+esc(a.name)+' ('+esc(a.category)+')</td></tr>'+
      '<tr><td>Branch</td><td>'+esc(a.branch||'—')+'</td></tr>'+
      '<tr><td>Borrower</td><td>'+esc(nameOf(borrow.borrower_id))+'</td></tr>'+
      '<tr><td>Approved by</td><td>'+esc(nameOf(borrow.approved_by))+'</td></tr>'+
      '<tr><td>Borrowed</td><td>'+esc(fmtDate(borrow.borrowed_at))+'</td></tr>'+
      '<tr><td>Due</td><td>'+esc(fmtDate(borrow.due_at))+'</td></tr>'+
      '<tr><td>Purpose</td><td>'+esc(borrow.purpose||'—')+'</td></tr></table>'+
      '<p style="font-size:12px;color:#888;margin-top:16px">Boyz at the Back LRK · All Rights Reserved</p>';
    document.body.appendChild(div);
    setTimeout(function(){ window.print(); }, 200);
  }

  function renderAvailable(){
    var rows=cache.assets.filter(function(a){ return a.status==='available'; });
    var h='<div class="tl-panel"><h2>Available to borrow</h2>';
    if(!rows.length) return h+'<div class="tl-empty">No available assets yet.<br/><span class="tl-muted">Staff: open Inventory to add laptops, mice, keyboards, cameras, USB ports.</span></div></div>';
    h+='<div class="tl-table-wrap"><table class="tl-table"><thead><tr><th>Tag</th><th>Name</th><th>Category</th><th>Branch</th><th></th></tr></thead><tbody>';
    rows.forEach(function(a){
      h+='<tr><td><strong>'+esc(a.tag)+'</strong></td><td>'+esc(a.name)+'</td><td>'+esc(a.category)+'</td><td>'+esc(a.branch||'—')+'</td><td><button type="button" class="tl-btn tl-req" data-id="'+esc(a.id)+'">Request</button></td></tr>';
    });
    h+='</tbody></table></div><div class="tl-panel" style="display:none;margin-top:.75rem" id="tl-req-box"><h2>Borrow request</h2><div class="tl-row c2">'+
      '<div class="tl-field"><label>Due date</label><input type="datetime-local" id="tl-due"/></div>'+
      '<div class="tl-field"><label>Purpose</label><input type="text" id="tl-purpose" placeholder="e.g. event, ticket DR-1020"/></div></div>'+
      '<div class="tl-actions"><button type="button" class="tl-btn" id="tl-req-submit">Submit request</button><button type="button" class="tl-btn ghost" id="tl-req-cancel">Cancel</button></div>'+
      '<p class="tl-muted">Needs staff approval before the item is released.</p></div></div>';
    return h;
  }

  function renderMine(){
    var uid=me()&&me().id;
    var rows=cache.borrows.filter(function(b){ return b.borrower_id===uid; });
    var h='<div class="tl-panel"><h2>My borrows</h2>';
    if(!rows.length) return h+'<div class="tl-empty">No borrow records yet.</div></div>';
    h+='<div class="tl-table-wrap"><table class="tl-table"><thead><tr><th>Item</th><th>Status</th><th>Due</th><th></th></tr></thead><tbody>';
    rows.forEach(function(b){
      var a=assetById(b.asset_id)||{}; var acts='';
      if(b.status==='active'||b.status==='overdue'){
        acts+='<button type="button" class="tl-btn ok tl-return" data-id="'+esc(b.id)+'">Return</button> <button type="button" class="tl-btn ghost tl-receipt" data-id="'+esc(b.id)+'">Receipt</button>';
      }
      h+='<tr><td><strong>'+esc(a.tag||'—')+'</strong><div class="tl-muted">'+esc(a.name||'')+'</div></td><td>'+badge(b.status)+'</td><td>'+esc(fmtDate(b.due_at))+'</td><td>'+acts+'</td></tr>';
    });
    return h+'</tbody></table></div></div>';
  }

  function renderLoans(){
    if(!isStaff()) return '<div class="tl-panel"><div class="tl-empty">Staff only</div></div>';
    var rows=cache.borrows.filter(function(b){ return b.status==='pending'||b.status==='active'||b.status==='overdue'; });
    var h='<div class="tl-panel"><h2>Open loans & requests</h2>';
    if(!rows.length) return h+'<div class="tl-empty">None open.</div></div>';
    h+='<div class="tl-table-wrap"><table class="tl-table"><thead><tr><th>Item</th><th>Borrower</th><th>Status</th><th>Due</th><th></th></tr></thead><tbody>';
    rows.forEach(function(b){
      var a=assetById(b.asset_id)||{}; var acts='';
      if(b.status==='pending') acts+='<button type="button" class="tl-btn ok tl-approve" data-id="'+esc(b.id)+'">Approve</button> <button type="button" class="tl-btn danger tl-reject" data-id="'+esc(b.id)+'">Reject</button>';
      if(b.status==='active'||b.status==='overdue') acts+='<button type="button" class="tl-btn ok tl-return" data-id="'+esc(b.id)+'">Return</button> <button type="button" class="tl-btn ghost tl-receipt" data-id="'+esc(b.id)+'">Receipt</button>';
      h+='<tr><td><strong>'+esc(a.tag||'—')+'</strong><div class="tl-muted">'+esc(a.name||'')+'</div><div class="tl-muted">'+esc(b.purpose||'')+'</div></td><td>'+esc(nameOf(b.borrower_id))+'</td><td>'+badge(b.status)+'</td><td>'+esc(fmtDate(b.due_at))+'</td><td>'+acts+'</td></tr>';
    });
    return h+'</tbody></table></div></div>';
  }

  function renderInventory(){
    if(!isStaff()) return '<div class="tl-panel"><div class="tl-empty">Staff only</div></div>';
    var catOpts=CATS.map(function(c){ return '<option value="'+esc(c.id)+'">'+esc(c.id)+'</option>'; }).join('');
    var brOpts='<option value="">—</option>'+BRANCHES.map(function(b){ return '<option value="'+esc(b)+'">'+esc(b)+'</option>'; }).join('');
    var h='<div class="tl-panel"><h2>Add asset</h2><form id="tl-add-form"><div class="tl-row c3">'+
      '<div class="tl-field"><label>Category</label><select name="category">'+catOpts+'</select></div>'+
      '<div class="tl-field"><label>Tag (auto if blank)</label><input name="tag" placeholder="DR-LT-001"/></div>'+
      '<div class="tl-field"><label>Name</label><input name="name" required placeholder="Dell Latitude"/></div></div><div class="tl-row c3">'+
      '<div class="tl-field"><label>Branch</label><select name="branch">'+brOpts+'</select></div>'+
      '<div class="tl-field"><label>Status</label><select name="status"><option value="available">available</option><option value="maintenance">maintenance</option><option value="retired">retired</option></select></div>'+
      '<div class="tl-field"><label>Notes</label><input name="notes"/></div></div>'+
      '<div class="tl-actions"><button type="submit" class="tl-btn">Add asset</button></div></form></div>';
    h+='<div class="tl-panel"><h2>Inventory ('+cache.assets.length+')</h2>';
    if(!cache.assets.length) return h+'<div class="tl-empty">No assets yet.</div></div>';
    h+='<div class="tl-table-wrap"><table class="tl-table"><thead><tr><th>Tag</th><th>Name</th><th>Category</th><th>Branch</th><th>Status</th></tr></thead><tbody>';
    cache.assets.forEach(function(a){
      h+='<tr><td><strong>'+esc(a.tag)+'</strong></td><td>'+esc(a.name)+'</td><td>'+esc(a.category)+'</td><td>'+esc(a.branch||'—')+'</td><td>'+badge(a.status)+'</td></tr>';
    });
    return h+'</tbody></table></div></div>';
  }

  function bind(){
    var root=document.getElementById('tl-ui-root'); if(!root) return;
    root.querySelectorAll('.tl-tab').forEach(function(btn){
      btn.onclick=function(){ tab=btn.getAttribute('data-tab')||'available'; render(); };
    });
    root.querySelectorAll('.tl-req').forEach(function(btn){
      btn.onclick=function(){ pendingAssetId=btn.getAttribute('data-id'); var box=document.getElementById('tl-req-box'); if(box) box.style.display='block'; };
    });
    var cancel=document.getElementById('tl-req-cancel');
    if(cancel) cancel.onclick=function(){ pendingAssetId=null; var box=document.getElementById('tl-req-box'); if(box) box.style.display='none'; };
    var submit=document.getElementById('tl-req-submit');
    if(submit) submit.onclick=function(){
      if(!pendingAssetId) return;
      var dueEl=document.getElementById('tl-due'), purEl=document.getElementById('tl-purpose');
      var due=dueEl&&dueEl.value?new Date(dueEl.value).toISOString():null;
      requestBorrow(pendingAssetId, purEl&&purEl.value, due);
      pendingAssetId=null;
    };
    root.querySelectorAll('.tl-approve').forEach(function(btn){ btn.onclick=function(){ approveBorrow(btn.getAttribute('data-id')); }; });
    root.querySelectorAll('.tl-reject').forEach(function(btn){ btn.onclick=function(){ rejectBorrow(btn.getAttribute('data-id')); }; });
    root.querySelectorAll('.tl-return').forEach(function(btn){ btn.onclick=function(){ returnBorrow(btn.getAttribute('data-id')); }; });
    root.querySelectorAll('.tl-receipt').forEach(function(btn){ btn.onclick=function(){ printReceipt(btn.getAttribute('data-id')); }; });
    var form=document.getElementById('tl-add-form');
    if(form) form.onsubmit=function(e){ e.preventDefault(); addAsset(form); };
  }

  function render(){
    var host=document.getElementById('tl-live-mount')||document.getElementById('dr-tech-log-root');
    if(!host) return;
    injectCss();
    var staff=isStaff();
    var tabs='<div class="tl-tabs">'+
      '<button type="button" class="tl-tab'+(tab==='available'?' on':'')+'" data-tab="available">Available</button>'+
      '<button type="button" class="tl-tab'+(tab==='mine'?' on':'')+'" data-tab="mine">My borrows</button>';
    if(staff){
      tabs+='<button type="button" class="tl-tab'+(tab==='loans'?' on':'')+'" data-tab="loans">Open loans</button>'+
        '<button type="button" class="tl-tab'+(tab==='inventory'?' on':'')+'" data-tab="inventory">Inventory</button>';
    }
    tabs+='</div>';
    var body=tab==='mine'?renderMine():tab==='loans'?renderLoans():tab==='inventory'?renderInventory():renderAvailable();
    var mount=document.getElementById('tl-live-mount');
    if(mount){
      mount.innerHTML='<div id="tl-ui-root">'+tabs+body+'</div>';
    } else {
      host.innerHTML='<div id="tl-ui-root" class="tl-wrap" style="max-width:1100px;margin:0 auto">'+tabs+body+'</div>';
    }
    bind();
  }

  async function mount(){
    injectCss();
    var mountEl=document.getElementById('tl-live-mount');
    if(mountEl) mountEl.innerHTML='<div class="tl-empty">Loading inventory…</div>';
    await refreshData();
    render();
  }

  setInterval(function(){
    if(!document.body.classList.contains('dr-tl-on')) return;
    var m=document.getElementById('tl-live-mount');
    if(m && !document.getElementById('tl-ui-root')) mount();
  }, 1500);

  window.DRTechLogUI = { mount: mount, refresh: function(){ return refreshData().then(render); } };
})();
