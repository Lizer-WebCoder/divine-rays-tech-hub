/**
 * Divine Rays — small polish (KB empty create, delete near Save)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function ensureDeleteNearSave() {
    var p = window.DR && window.DR.getProfile && window.DR.getProfile();
    if (!p || (p.role !== 'agent' && p.role !== 'admin')) return;
    if (document.getElementById('btn-delete-ticket')) return;
    var save = document.getElementById('btn-save-meta');
    if (!save || !save.parentElement) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'btn-delete-ticket';
    b.className = 'btn btn-danger';
    b.textContent = 'Delete ticket';
    b.style.marginLeft = '0.5rem';
    b.addEventListener('click', async function () {
      // Trigger same flow as delete-ticket.js if available via custom event
      try {
        var pt = document.getElementById('page-title');
        var num = pt && pt.textContent ? pt.textContent.trim() : '';
        if (!num) {
          alert('Open a ticket first');
          return;
        }
        if (!confirm('Delete ticket ' + num + '?\n\nThis cannot be undone.')) return;
        var client = window.DR && window.DR.sb && window.DR.sb();
        if (!client) {
          alert('Not connected');
          return;
        }
        var tr = await client.from('tickets').select('*').eq('ticket_number', num).maybeSingle();
        if (!tr.data) {
          alert('Ticket not found');
          return;
        }
        var ticket = tr.data;
        try {
          if (ticket.requester_id) {
            await client.from('notifications').insert({
              user_id: ticket.requester_id,
              type: 'ticket_deleted',
              title: 'Ticket deleted',
              body: 'Your ticket ' + num + ' was deleted by Tech Support.',
              read: false
            });
          }
        } catch (e) {}
        try { await client.from('comments').delete().eq('ticket_id', ticket.id); } catch (e) {}
        var del = await client.from('tickets').delete().eq('id', ticket.id);
        if (del.error) {
          alert(del.error.message || 'Delete failed');
          return;
        }
        if (window.DR && window.DR.toast) window.DR.toast('Ticket deleted', 'success');
        else alert('Ticket deleted');
        var dash = document.querySelector('#portal-agent .nav-btn[data-view="dashboard"]');
        if (dash) dash.click();
      } catch (err) {
        alert(err.message || String(err));
      }
    });
    save.parentElement.appendChild(b);
  }

  function ensureKbEmptyButton() {
    var el = document.getElementById('kb-manage-list');
    if (!el) return;
    if (el.querySelector('#kb-btn-new-empty')) return;
    if ((el.textContent || '').indexOf('No articles yet') === -1) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    btn.id = 'kb-btn-new-empty';
    btn.textContent = '+ New article';
    btn.style.marginTop = '0.75rem';
    btn.onclick = function () {
      if (window.DR_KB && window.DR_KB.openEditor) window.DR_KB.openEditor(null);
      else {
        var n = document.getElementById('kb-btn-new');
        if (n) n.click();
      }
    };
    el.appendChild(btn);
  }

  setInterval(function () {
    ensureDeleteNearSave();
    ensureKbEmptyButton();
  }, 2000);
})();
