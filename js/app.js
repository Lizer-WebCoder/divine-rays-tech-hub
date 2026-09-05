/**
 * Divine Rays Tech Hub v6.6 — Admin panel
 * Credit: Lizzz · All Rights Reserved
 */
(function(){
'use strict';
var cfg=window.DR_CONFIG||{};
var sb=null, usingCloud=!!(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase);
if(usingCloud) sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
var currentProfile=null, currentCustTicketId=null, currentTicketId=null, currentView='dashboard', listFilter={mode:'all'}, nameCache={};
function toast(m,t){var c=document.getElementById('toast-container');if(!c)return;var e=document.createElement('div');e.className='toast '+(t||'info');e.textContent=m;c.appendChild(e);setTimeout(function(){e.remove();},3000);}
function esc(s){return String(s||'').replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"');}
function fmt(i){try{return new Date(i).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return i||'';}}
function sc(s){return 'badge-'+String(s||'').toLowerCase().replace(/\s+/g,'-');}
function showError(id,m){var f=document.getElementById(id);if(!f)return;var e=f.querySelector('.login-error');if(!e){e=document.createElement('div');e.className='login-error';f.insertBefore(e,f.firstChild);}e.textContent=m;}
function clearErrors(){document.querySelectorAll('.login-error').forEach(function(e){e.remove();});}
function requireCloud(){if(!usingCloud){toast('Supabase not configured','error');return false;}return true;}
async function loadProfile(){
  if(!usingCloud)return null;
  var res=await sb.auth.getSession();
  var session=res.data&&res.data.session;
  if(!session){currentProfile=null;return null;}
  var r=await sb.from('profiles').select('id,full_name,role,username').eq('id',session.user.id).maybeSingle();
  if(!r.data){
    var meta=session.user.user_metadata||{};
    await sb.from('profiles').upsert({id:session.user.id,full_name:meta.full_name||'User',role:meta.role||'customer',username:meta.username||null});
    r=await sb.from('profiles').select('id,full_name,role,username').eq('id',session.user.id).maybeSingle();
  }
  if(!r.data){currentProfile=null;return null;}
  currentProfile={id:r.data.id,name:r.data.full_name,role:r.data.role,username:r.data.username,email:session.user.email||''};
  return currentProfile;
}
async function ensureProfile(id,name,role,username){
  var row={id:id,full_name:name||'User',role:role||'customer'};
  if(username)row.username=username;
  var u=await sb.from('profiles').upsert(row,{onConflict:'id'});
  return u.error?{error:u.error.message}:{};
}
async function signUpCustomer(name,email,password){
  var r=await sb.auth.signUp({email:email.trim(),password:password,options:{data:{full_name:name.trim(),role:'customer'}}});
  if(r.error)return{error:r.error.message};
  if(!r.data.user)return{error:'Signup failed'};
  if(r.data.session){var p=await ensureProfile(r.data.user.id,name.trim(),'customer');if(p.error)return{error:p.error};}
  if(!r.data.session)return{error:'Account created. Turn OFF Confirm email in Supabase Auth, then Sign In.'};
  var profile=await loadProfile();
  return profile?{user:profile}:{error:'Try Sign In'};
}
async function signUpAgent(name,username,password,email){
  var em=email||(username.trim().toLowerCase().replace(/[^a-z0-9._-]/g,'')+'@agent.divinerays.app');
  var r=await sb.auth.signUp({email:em.trim(),password:password,options:{data:{full_name:name.trim(),role:'agent',username:username.trim().toLowerCase()}}});
  if(r.error)return{error:r.error.message};
  if(!r.data.user)return{error:'Signup failed'};
  if(r.data.session){var p=await ensureProfile(r.data.user.id,name.trim(),'agent',username.trim().toLowerCase());if(p.error)return{error:p.error};}
  if(!r.data.session)return{error:'Account created. Turn OFF Confirm email, then Sign In.'};
  var profile=await loadProfile();
  return profile?{user:profile}:{error:'Try Sign In'};
}
async function signInWithEmail(email,password){
  var r=await sb.auth.signInWithPassword({email:email.trim(),password:password});
  if(r.error)return{error:r.error.message};
  var p=await loadProfile();
  return p?{user:p}:{error:'Profile missing'};
}
async function signInAgent(login,password){
  var email=login.trim().indexOf('@')===-1?login.trim().toLowerCase().replace(/[^a-z0-9._-]/g,'')+'@agent.divinerays.app':login.trim();
  return signInWithEmail(email,password);
}
async function signOut(){if(usingCloud)await sb.auth.signOut();currentProfile=null;}
async function fetchTickets(f){
  f=f||{};var q=sb.from('tickets').select('*').order('updated_at',{ascending:false});
  if(f.requesterId)q=q.eq('requester_id',f.requesterId);
  if(f.assignedTo)q=q.eq('assigned_to',f.assignedTo);
  if(f.unassigned)q=q.is('assigned_to',null);
  if(f.status)q=q.eq('status',f.status);
  if(f.priority)q=q.eq('priority',f.priority);
  var r=await q;if(r.error){toast(r.error.message,'error');return[];}return r.data||[];
}
async function fetchTicketById(id){var r=await sb.from('tickets').select('*').eq('id',id).single();return r.error?null:r.data;}
async function fetchTicketByNumber(n){var r=await sb.from('tickets').select('*').eq('ticket_number',n.toUpperCase()).maybeSingle();return r.error?null:r.data;}
async function createTicket(p){var r=await sb.from('tickets').insert({title:p.title,description:p.description,priority:p.priority,category:p.category,status:'Open',requester_id:currentProfile.id}).select().single();return r.error?{error:r.error.message}:{ticket:r.data};}
async function updateTicket(id,p){var r=await sb.from('tickets').update(p).eq('id',id).select().single();return r.error?{error:r.error.message}:{ticket:r.data};}
async function fetchComments(tid){var r=await sb.from('comments').select('*,author:profiles(full_name)').eq('ticket_id',tid).order('created_at',{ascending:true});if(r.error){var r2=await sb.from('comments').select('*').eq('ticket_id',tid).order('created_at',{ascending:true});return r2.data||[];}return r.data||[];}
async function addComment(tid,body,internal){var row={ticket_id:tid,author_id:currentProfile.id,body:body,is_internal:!!internal};var r=await sb.from('comments').insert(row).select().single();return r.error?{error:r.error.message}:{comment:r.data};}
async function fetchAgents(){var r=await sb.from('profiles').select('id,full_name,role').in('role',['agent','admin']).order('full_name');return r.error?[]:(r.data||[]);}
async function fetchAllProfiles(){var r=await sb.from('profiles').select('id,full_name,role,username,created_at').order('created_at',{ascending:false});return r.error?[]:(r.data||[]);}
async function updateUserRole(userId,role){var r=await sb.from('profiles').update({role:role}).eq('id',userId).select().single();return r.error?{error:r.error.message}:{profile:r.data};}
async function fetchProfileNames(ids){if(!ids||!ids.length)return{};var u=ids.filter(Boolean).filter(function(x,i,a){return a.indexOf(x)===i;});if(!u.length)return{};var r=await sb.from('profiles').select('id,full_name').in('id',u);var m={};(r.data||[]).forEach(function(p){m[p.id]=p.full_name;});return m;}
function hideLoginShowApp(){var l=document.getElementById('login-screen'),a=document.getElementById('app-shell');if(l){l.hidden=true;l.classList.add('is-hidden');l.style.cssText='display:none!important;height:0!important;overflow:hidden!important;';}if(a){a.hidden=false;a.classList.remove('is-hidden');a.style.cssText='';}window.scrollTo(0,0);}
function showLoginHideApp(){var l=document.getElementById('login-screen'),a=document.getElementById('app-shell');if(l){l.hidden=false;l.classList.remove('is-hidden');l.style.cssText='';}if(a){a.hidden=true;a.classList.add('is-hidden');a.style.cssText='display:none!important;';}window.scrollTo(0,0);}
function showApp(p){
  hideLoginShowApp();
  var pc=document.getElementById('portal-customer'),pa=document.getElementById('portal-agent');
  if(pc)pc.classList.remove('active');
  if(pa)pa.classList.remove('active');
  var navAdmin=document.getElementById('nav-admin');
  if(navAdmin)navAdmin.classList.add('is-hidden');
  if(p.role==='customer'){
    if(pc)pc.classList.add('active');
    var lb=document.getElementById('logged-user-label');
    if(lb)lb.textContent=p.name+' (Customer)';
    var w=document.getElementById('cust-welcome-name');
    if(w)w.textContent=p.name.split(' ')[0];
    showCustomerTab('submit');
  }else{
    if(pa)pa.classList.add('active');
    var l2=document.getElementById('logged-user-label');
    if(l2)l2.textContent=p.name+(p.role==='admin'?' (Admin)':' (Agent)');
    var an=document.getElementById('agent-name-display');
    if(an)an.textContent=p.name+(p.role==='admin'?' · Admin':'');
    if(p.role==='admin'&&navAdmin)navAdmin.classList.remove('is-hidden');
    refreshAssignDropdown();
    showAgentView('dashboard');
  }
}
function showLoginScreen(){showLoginHideApp();clearErrors();['login-customer','login-agent','register-customer','register-agent'].forEach(function(id){var f=document.getElementById(id);if(f)f.reset();});switchLoginTab('customer');}
function switchLoginTab(tab){document.querySelectorAll('.ltab').forEach(function(b){b.classList.remove('active');});document.querySelectorAll('.login-form').forEach(function(f){f.classList.remove('active');});var t=document.querySelector('[data-ltab="'+tab+'"]');if(t)t.classList.add('active');var f=document.getElementById(tab==='customer'?'login-customer':'login-agent');if(f)f.classList.add('active');clearErrors();}
function showForm(id){document.querySelectorAll('.login-form').forEach(function(f){f.classList.remove('active');});var f=document.getElementById(id);if(f)f.classList.add('active');clearErrors();}
window.showForm=showForm;window.switchLoginTab=switchLoginTab;window.showApp=showApp;window.showLoginScreen=showLoginScreen;
function showCustomerTab(name){document.querySelectorAll('.ctab').forEach(function(b){b.classList.remove('active');});document.querySelectorAll('.ctab-panel').forEach(function(p){p.classList.remove('active');});if(name!=='detail'){var t=document.querySelector('[data-ctab="'+name+'"]');if(t)t.classList.add('active');}var p=document.getElementById('ctab-'+name);if(p)p.classList.add('active');if(name==='mytickets')renderMyTickets();}
async function renderMyTickets(){if(!currentProfile)return;var c=document.getElementById('my-tickets-list');if(!c)return;c.innerHTML='<div class="empty-state"><p>Loading…</p></div>';var tickets=await fetchTickets({requesterId:currentProfile.id});if(!tickets.length){c.innerHTML='<div class="empty-state"><p>No tickets yet.</p></div>';return;}c.innerHTML=tickets.map(function(t){return '<div class="ticket-card" data-id="'+t.id+'"><div><h4>'+esc(t.title)+'</h4><div class="ticket-meta"><span class="ticket-id">'+esc(t.ticket_number)+'</span></div></div><div class="badges"><span class="badge '+sc(t.status)+'">'+t.status+'</span></div></div>';}).join('');c.querySelectorAll('.ticket-card').forEach(function(card){card.addEventListener('click',function(){openCustomerTicket(card.getAttribute('data-id'));});});}
async function openCustomerTicket(id){var t=await fetchTicketById(id);if(!t)return;currentCustTicketId=id;showCustomerTab('detail');var d=document.getElementById('cust-ticket-detail');if(d)d.innerHTML='<h3>'+esc(t.title)+'</h3><p class="ticket-id">'+esc(t.ticket_number)+'</p><p>'+esc(t.description)+'</p>';}
function setupCustomer(){
  document.querySelectorAll('.ctab').forEach(function(b){b.addEventListener('click',function(){showCustomerTab(b.getAttribute('data-ctab'));});});
  var bb=document.getElementById('btn-cust-back');if(bb)bb.addEventListener('click',function(){showCustomerTab('mytickets');});
  var cf=document.getElementById('customer-form');
  if(cf)cf.addEventListener('submit',async function(e){e.preventDefault();if(!requireCloud()||!currentProfile)return;var r=await createTicket({title:document.getElementById('c-title').value.trim(),description:document.getElementById('c-description').value.trim(),priority:document.getElementById('c-priority').value,category:document.getElementById('c-category').value});if(r.error){toast(r.error,'error');return;}cf.hidden=true;var s=document.getElementById('submit-success');if(s)s.hidden=false;var n=document.getElementById('new-ticket-id');if(n)n.textContent=r.ticket.ticket_number;toast('Created '+r.ticket.ticket_number,'success');});
  var bg=document.getElementById('btn-go-mytickets');if(bg)bg.addEventListener('click',function(){if(cf){cf.hidden=false;cf.reset();}var s=document.getElementById('submit-success');if(s)s.hidden=true;showCustomerTab('mytickets');});
  var bt=document.getElementById('btn-track');if(bt)bt.addEventListener('click',async function(){if(!requireCloud())return;var t=await fetchTicketByNumber(document.getElementById('track-id').value.trim());var box=document.getElementById('track-result');if(!box)return;box.hidden=false;box.innerHTML=t?'<h3>'+esc(t.title)+'</h3><p>'+esc(t.ticket_number)+' · '+esc(t.status)+'</p>':'<p style="color:var(--danger)">Not found</p>';});
  var rf=document.getElementById('cust-reply-form');if(rf)rf.addEventListener('submit',async function(e){e.preventDefault();if(!currentCustTicketId)return;var text=document.getElementById('cust-reply-text').value.trim();if(!text)return;await addComment(currentCustTicketId,text,false);document.getElementById('cust-reply-text').value='';toast('Reply sent','success');openCustomerTicket(currentCustTicketId);});
}
async function refreshAssignDropdown(){var sel=document.getElementById('assign-agent');if(!sel)return;var agents=await fetchAgents();sel.innerHTML='<option value="">— Unassigned —</option>'+agents.map(function(a){return '<option value="'+a.id+'">'+esc(a.full_name)+'</option>';}).join('');}
async function renderStats(){
  var tickets=await fetchTickets({});
  var me=currentProfile?currentProfile.id:null;
  var c={
    Open:0,'In Progress':0,Waiting:0,Resolved:0,Closed:0,
    unassigned:0,critical:0,high:0,total:0,
    claimedMe:0,resolvedMe:0
  };
  var byAgent={};
  tickets.forEach(function(t){
    c.total++;
    if(c[t.status]!==undefined)c[t.status]++;
    if(!t.assigned_to&&t.status!=='Resolved'&&t.status!=='Closed')c.unassigned++;
    if(t.priority==='Critical'&&t.status!=='Resolved'&&t.status!=='Closed')c.critical++;
    if(t.priority==='High'&&t.status!=='Resolved'&&t.status!=='Closed')c.high++;
    if(me&&t.assigned_to===me){
      if(t.status!=='Resolved'&&t.status!=='Closed')c.claimedMe++;
      if(t.status==='Resolved'||t.status==='Closed')c.resolvedMe++;
    }
    if(t.assigned_to){
      if(!byAgent[t.assigned_to])byAgent[t.assigned_to]={claimed:0,resolved:0};
      if(t.status==='Resolved'||t.status==='Closed')byAgent[t.assigned_to].resolved++;
      else byAgent[t.assigned_to].claimed++;
    }
  });
  var map=[
    ['stat-open','Open'],['stat-progress','In Progress'],['stat-waiting','Waiting'],
    ['stat-unassigned','unassigned'],['stat-resolved','Resolved'],['stat-closed','Closed'],
    ['stat-critical','critical'],['stat-high','high'],['stat-total','total'],
    ['stat-claimed-me','claimedMe'],['stat-resolved-me','resolvedMe']
  ];
  map.forEach(function(x){var el=document.getElementById(x[0]);if(el)el.textContent=c[x[1]]||0;});
  var box=document.getElementById('agent-perf-list');
  if(box){
    var ids=Object.keys(byAgent);
    if(!ids.length){box.innerHTML='<p class="empty-state" style="padding:1rem">No claimed tickets yet.</p>';}
    else{
      var names=await fetchProfileNames(ids);
      var rows=ids.map(function(id){
        var a=byAgent[id];
        return {id:id,name:names[id]||'Agent',claimed:a.claimed,resolved:a.resolved};
      }).sort(function(a,b){return (b.resolved+b.claimed)-(a.resolved+a.claimed);});
      box.innerHTML='<table class="perf-table"><thead><tr><th>Agent</th><th>Active</th><th>Resolved</th><th>Total</th></tr></thead><tbody>'+
        rows.map(function(r){
          var mine=me&&r.id===me?' class="mine"':'';
          return '<tr'+mine+'><td>'+esc(r.name)+(mine?' <span class="you-tag">you</span>':'')+'</td><td>'+r.claimed+'</td><td>'+r.resolved+'</td><td>'+(r.claimed+r.resolved)+'</td></tr>';
        }).join('')+'</tbody></table>';
    }
  }
}
async function renderTicketList(){var c=document.getElementById('ticket-list');if(!c)return;c.innerHTML='<div class="empty-state"><p>Loading…</p></div>';var f={};if(listFilter.mode==='my'&&currentProfile)f.assignedTo=currentProfile.id;if(listFilter.mode==='unassigned')f.unassigned=true;var tickets=await fetchTickets(f);if(!tickets.length){c.innerHTML='<div class="empty-state"><p>No tickets.</p></div>';return;}var ids=[];tickets.forEach(function(t){if(t.requester_id)ids.push(t.requester_id);});nameCache=Object.assign(nameCache,await fetchProfileNames(ids));c.innerHTML=tickets.map(function(t){return '<div class="ticket-card" data-id="'+t.id+'"><div><h4>'+esc(t.title)+'</h4><div class="ticket-meta"><span class="ticket-id">'+esc(t.ticket_number)+'</span><span>'+esc(nameCache[t.requester_id]||'Customer')+'</span></div></div><div class="badges"><span class="badge '+sc(t.status)+'">'+t.status+'</span></div></div>';}).join('');c.querySelectorAll('.ticket-card').forEach(function(card){card.addEventListener('click',function(){openTicket(card.getAttribute('data-id'));});});}
async function openTicket(id){var t=await fetchTicketById(id);if(!t)return;currentTicketId=id;showAgentView('detail');var pt=document.getElementById('page-title');if(pt)pt.textContent=t.ticket_number;var d=document.getElementById('ticket-detail');if(d)d.innerHTML='<h3>'+esc(t.title)+'</h3><p>'+esc(t.ticket_number)+' · '+esc(t.status)+'</p><p>'+esc(t.description)+'</p>';await refreshAssignDropdown();var ae=document.getElementById('assign-agent');if(ae)ae.value=t.assigned_to||'';var se=document.getElementById('quick-status');if(se)se.value=t.status;}
function showAgentView(name){
  document.querySelectorAll('#portal-agent .view').forEach(function(v){v.classList.remove('active');});
  document.querySelectorAll('#portal-agent .nav-btn').forEach(function(b){b.classList.remove('active');});
  if(name==='detail'){
    var dv=document.getElementById('view-detail');
    if(dv)dv.classList.add('active');
    return;
  }
  currentView=name;
  var titles={dashboard:'Dashboard','my-tickets':'My Tickets',unassigned:'Unassigned','all-tickets':'All Tickets',admin:'Admin — Users'};
  var pt=document.getElementById('page-title');
  if(pt)pt.textContent=titles[name]||'Dashboard';
  var nb=document.querySelector('#portal-agent [data-view="'+name+'"]');
  if(nb)nb.classList.add('active');
  if(name==='admin'){
    var av=document.getElementById('view-admin');
    if(av)av.classList.add('active');
    var ta=document.querySelector('.topbar-actions');
    if(ta)ta.style.display='none';
    renderAdminUsers();
    return;
  }
  var ta2=document.querySelector('.topbar-actions');
  if(ta2)ta2.style.display='';
  var dash=document.getElementById('view-dashboard');
  if(dash)dash.classList.add('active');
  listFilter.mode=name==='my-tickets'?'my':(name==='unassigned'?'unassigned':'all');
  renderStats();
  renderTicketList();
}
async function renderAdminUsers(){
  if(!currentProfile||currentProfile.role!=='admin'){
    toast('Admin only','error');
    return;
  }
  var box=document.getElementById('admin-users-list');
  if(!box)return;
  box.innerHTML='<div class="empty-state"><p>Loading users…</p></div>';
  var users=await fetchAllProfiles();
  var q=(document.getElementById('admin-search')||{}).value||'';
  q=String(q).toLowerCase().trim();
  var roleFilter=(document.getElementById('admin-filter-role')||{}).value||'';
  var filtered=users.filter(function(u){
    if(roleFilter&&u.role!==roleFilter)return false;
    if(!q)return true;
    var hay=((u.full_name||'')+' '+(u.username||'')+' '+(u.role||'')).toLowerCase();
    return hay.indexOf(q)!==-1;
  });
  var counts={customer:0,agent:0,admin:0};
  users.forEach(function(u){if(counts[u.role]!==undefined)counts[u.role]++;});
  var el;
  el=document.getElementById('admin-stat-users');if(el)el.textContent=users.length;
  el=document.getElementById('admin-stat-customers');if(el)el.textContent=counts.customer;
  el=document.getElementById('admin-stat-agents');if(el)el.textContent=counts.agent;
  el=document.getElementById('admin-stat-admins');if(el)el.textContent=counts.admin;
  if(!filtered.length){
    box.innerHTML='<p class="empty-state" style="padding:1rem">No users found.</p>';
    return;
  }
  box.innerHTML='<table class="perf-table admin-table"><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead><tbody>'+
    filtered.map(function(u){
      var mine=currentProfile&&u.id===currentProfile.id;
      var roleSelect='<select class="admin-role-select" data-id="'+u.id+'