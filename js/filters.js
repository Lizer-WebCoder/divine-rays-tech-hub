/**
 * Divine Rays Tech Hub — search, filters, export (v6.9)
 * Credit: Lizzz · All Rights Reserved
 */
(function(){
'use strict';
function esc(s){return (window.DR&&DR.esc)?DR.esc(s):String(s||'');}
function fmt(i){return (window.DR&&DR.fmt)?DR.fmt(i):i;}
function sc(s){return (window.DR&&DR.sc)?DR.sc(s):('badge-'+String(s||'').toLowerCase().replace(/\s+/g,'-'));}
function toast(m,t){if(window.DR&&DR.toast)DR.toast(m,t);}
function matches(t,lf,names){
  if(lf.status&&t.status!==lf.status)return false;
  if(lf.priority&&t.priority!==lf.priority)return false;
  var q=(lf.q||'').trim().toLowerCase();
  if(!q)return true;
  var hay=[t.ticket_number,t.title,t.description,t.category,t.status,t.priority,names[t.requester_id]||'',names[t.assigned_to]||''].join(' ').toLowerCase();
  return hay.indexOf(q)!==-1;
}
function cardHtml(t,names){
  return '<div class="ticket-card" data-id="'+t.id+'"><div><h4>'+esc(t.title)+'</h4><div class="ticket-meta"><span class="ticket-id">'+esc(t.ticket_number)+'</span><span>'+esc(names[t.requester_id]||'Customer')+'</span><span>'+esc(t.category||'')+'</span><span>'+fmt(t.updated_at||t.created_at)+'</span></div></div><div class="badges"><span class="badge '+sc(t.priority)+'">'+esc(t.priority||'')+'</span><span class="badge '+sc(t.status)+'">'+esc(t.status)+'</span></div></div>';
}
function applyTicketFilters(){
  if(!window.DR||!DR.getListFilter)return;
  var lf=DR.getListFilter();
  var c=document.getElementById('ticket-list');
  if(!c)return;
  var all=DR.getAllTickets()||[];
  var names=DR.getNameCache()||{};
  var filtered=all.filter(function(t){return matches(t,lf,names);});
  var hint=document.getElementById('filter-hint');
  if(hint){
    var bits=[];
    if(lf.q)bits.push('"'+lf.q+'"');
    if(lf.status)bits.push(lf.status);
    if(lf.priority)bits.push(lf.priority);
    hint.textContent=bits.length?('Showing '+filtered.length+' of '+all.length+' · '+bits.join(' · ')):'';
  }
  if(!filtered.length){
    c.innerHTML='<div class="empty-state"><p>'+(lf.q||lf.status||lf.priority?'No tickets match your search/filters.':(all.length?'No tickets match.':'No tickets.'))+'</p></div>';
    return;
  }
  c.innerHTML=filtered.map(function(t){return cardHtml(t,names);}).join('');
  c.querySelectorAll('.ticket-card').forEach(function(card){
    card.addEventListener('click',function(){if(DR.openTicket)DR.openTicket(card.getAttribute('data-id'));});
  });
}
window.applyTicketFilters=function(refetch){
  if(refetch&&DR.fetchTickets){
    var lf=DR.getListFilter();
    var f={};
    if(lf.mode==='my'&&DR.getProfile())f.assignedTo=DR.getProfile().id;
    if(lf.mode==='unassigned')f.unassigned=true;
    DR.fetchTickets(f).then(async function(tickets){
      DR.setAllTickets(tickets);
      var ids=[];
      (tickets||[]).forEach(function(t){if(t.requester_id)ids.push(t.requester_id);if(t.assigned_to)ids.push(t.assigned_to);});
      if(DR.fetchProfileNames){var names=await DR.fetchProfileNames(ids);DR.setNameCache(names);}
      applyTicketFilters();
    });
    return;
  }
  applyTicketFilters();
};
function bindUI(){
  if(!window.DR||!DR.getListFilter)return;
  var lf=DR.getListFilter();
  var timer=null;
  var si=document.getElementById('search-input');
  if(si)si.addEventListener('input',function(){lf.q=si.value||'';clearTimeout(timer);timer=setTimeout(function(){window.applyTicketFilters(false);},180);});
  var fs=document.getElementById('filter-status');
  if(fs)fs.addEventListener('change',function(){lf.status=fs.value||'';window.applyTicketFilters(false);});
  var fp=document.getElementById('filter-priority');
  if(fp)fp.addEventListener('change',function(){lf.priority=fp.value||'';window.applyTicketFilters(false);});
  var clr=document.getElementById('btn-clear-filters');
  if(clr)clr.addEventListener('click',function(){lf.q='';lf.status='';lf.priority='';if(si)si.value='';if(fs)fs.value='';if(fp)fp.value='';window.applyTicketFilters(false);});
  var be=document.getElementById('btn-export');
  if(be)be.addEventListener('click',async function(){
    toast('Preparing export…','info');
    var tickets=await DR.fetchTickets({});
    var blob=new Blob([JSON.stringify({exported_at:new Date().toISOString(),count:tickets.length,tickets:tickets},null,2)],{type:'application/json'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='divine-rays-tickets-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(a.href);
    toast('Exported '+tickets.length+' tickets','success');
  });
}
document.addEventListener('DOMContentLoaded',function(){
  var n=0,t=setInterval(function(){
    n++;
    if(window.DR&&DR.getListFilter){clearInterval(t);bindUI();}
    if(n>60)clearInterval(t);
  },100);
});
})();
