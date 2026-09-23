/**
 * Divine Rays — change username + password (admin/agent/customer)
 * Role-aware copy; Supabase auth.updateUser for password
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ACCOUNT_SEC) return;
  window.__DR_ACCOUNT_SEC = 1;

  var CSS = [
    '#dr-acct-sec{margin:1.1rem 0 0;padding:1rem 1.1rem;border-radius:12px;',
    'border:1px solid rgba(124,106,240,.35);background:rgba(124,106,240,.08)}',
    'html[data-theme="light"] #dr-acct-sec{background:#f5f3ff;border-color:#c4b5fd}',
    '#dr-acct-sec h4{margin:0 0 .35rem;font-size:.95rem;color:#c4b5fd}',
    'html[data-theme="light"] #dr-acct-sec h4{color:#4c3fd4}',
    '#dr-acct-sec p.hint{margin:0 0 .75rem;font-size:.82rem;color:#9898b0;line-height:1.4}',
    'html[data-theme="light"] #dr-acct-sec p.hint{color:#5a5a78}',
    '#dr-acct-sec .form-row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}',
    '@media(max-width:560px){#dr-acct-sec .form-row{grid-template-columns:1fr}}',
    '#dr-acct-msg{margin-top:.55rem;font-size:.85rem;min-height:1.2em}',
    '#dr-acct-msg.ok{color:#6ee7b7}#dr-acct-msg.err{color:#fca5a5}',
    'html[data-theme="light"] #dr-acct-msg.ok{color:#047857}',
    'html[data-theme="light"] #dr-acct-msg.err{color:#b91c1c}'
  ].join('');

  function injectCss() {
    if (document.getElementById('dr-acct-sec-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-acct-sec-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }

  function myRole() {
    try {
      if (window.DR && window.DR.profile) {
        var p = window.DR.profile();
        if (p && p.role) return String(p.role).toLowerCase();
      }
    } catch (e) {}
    try {
      var me = window.currentProfile || window.__drProfile;
      if (me && me.role) return String(me.role).toLowerCase();
    } catch (e) {}
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pc && pc.classList.contains('active')) return 'customer';
    if (pa && pa.classList.contains('active')) return 'agent';
    return 'customer';
  }

  function isStaff() {
    var r = myRole();
    return r === 'admin' || r === 'agent';
  }

  function hintText() {
    if (isStaff()) {
      return 'Username is used when you sign in as agent/admin (Email or Username field). Password change applies to your login immediately. Leave password fields blank to keep the current password.';
    }
    return 'You can set an optional username for your account and change your login password here. Leave password fields blank to keep the current password. Customers still sign in with email + password.';
  }

  function toast(msg, type) {
    try {
      if (window.DR && window.DR.toast) return window.DR.toast(msg, type);
    } catch (e) {}
  }

  function setMsg(text, ok) {
    var el = document.getElementById('dr-acct-msg');
    if (!el) return;
    el.textContent = text || '';
    el.className = text ? (ok ? 'ok' : 'err') : '';
  }

  function ensureSection() {
    var body = document.getElementById('profile-body');
    if (!body) return;
    if (!document.getElementById('pf-save')) return;

    var existing = document.getElementById('dr-acct-sec');
    if (existing) {
      var hint = existing.querySelector('p.hint');
      if (hint) hint.textContent = hintText();
      return;
    }

    var actions = body.querySelector('.profile-actions');
    var box = document.createElement('div');
    box.id = 'dr-acct-sec';
    box.innerHTML =
      '<h4>Account security</h4>' +
      '<p class="hint">' + hintText() + '</p>' +
      '<div class="form-group"><label for="dr-pf-username">Username' +
      (isStaff() ? '' : ' <span style="opacity:.7;font-weight:400">(optional)</span>') +
      '</label>' +
      '<input type="text" id="dr-pf-username" autocomplete="username" placeholder="' +
      (isStaff() ? 'e.g. lizer.james' : 'Optional display username') +
      '" /></div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label for="dr-pf-pass1">New password</label>' +
      '<input type="password" id="dr-pf-pass1" autocomplete="new-password" placeholder="Min 6 characters" /></div>' +
      '<div class="form-group"><label for="dr-pf-pass2">Confirm password</label>' +
      '<input type="password" id="dr-pf-pass2" autocomplete="new-password" placeholder="Repeat password" /></div>' +
      '</div>' +
      '<button type="button" class="btn btn-primary btn-sm" id="dr-acct-update">Update username / password</button>' +
      '<div id="dr-acct-msg"></div>';

    if (actions && actions.parentNode) {
      actions.parentNode.insertBefore(box, actions);
    } else {
      body.appendChild(box);
    }

    var src = document.getElementById('pf-username');
    var dst = document.getElementById('dr-pf-username');
    if (src && dst) dst.value = src.value || '';

    var btn = document.getElementById('dr-acct-update');
    if (btn) btn.onclick = onUpdate;
  }

  async function currentUserId() {
    var client = sb();
    if (!client) return null;
    try {
      var s = await client.auth.getSession();
      return s && s.data && s.data.session && s.data.session.user && s.data.session.user.id;
    } catch (e) {
      return null;
    }
  }

  async function onUpdate() {
    var client = sb();
    if (!client) {
      setMsg('Not connected to server', false);
      return;
    }
    var uid = await currentUserId();
    if (!uid) {
      setMsg('Please sign in again', false);
      return;
    }

    var usernameEl = document.getElementById('dr-pf-username');
    var pass1 = (document.getElementById('dr-pf-pass1') || {}).value || '';
    var pass2 = (document.getElementById('dr-pf-pass2') || {}).value || '';
    var username = usernameEl ? usernameEl.value.trim() : '';

    var btn = document.getElementById('dr-acct-update');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving…';
    }
    setMsg('');

    try {
      if (username) {
        var check = await client
          .from('profiles')
          .select('id')
          .ilike('username', username)
          .neq('id', uid)
          .maybeSingle();
        if (check.data && check.data.id) {
          setMsg('That username is already taken', false);
          return;
        }
        var up = await client.from('profiles').update({ username: username }).eq('id', uid);
        if (up.error) {
          setMsg(up.error.message || 'Could not update username', false);
          return;
        }
        var pf = document.getElementById('pf-username');
        if (pf) pf.value = username;
        try {
          await client.auth.updateUser({ data: { username: username } });
        } catch (e) {}
      }

      if (pass1 || pass2) {
        if (pass1.length < 6) {
          setMsg('Password must be at least 6 characters', false);
          return;
        }
        if (pass1 !== pass2) {
          setMsg('Passwords do not match', false);
          return;
        }
        var pr = await client.auth.updateUser({ password: pass1 });
        if (pr.error) {
          setMsg(pr.error.message || 'Could not update password', false);
          return;
        }
        var p1 = document.getElementById('dr-pf-pass1');
        var p2 = document.getElementById('dr-pf-pass2');
        if (p1) p1.value = '';
        if (p2) p2.value = '';
      }

      if (!username && !pass1) {
        setMsg('Enter a username and/or new password', false);
        return;
      }

      setMsg('Saved successfully', true);
      toast('Account updated', 'success');
    } catch (e) {
      setMsg((e && e.message) || 'Update failed', false);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Update username / password';
      }
    }
  }

  function hookSave() {
    var save = document.getElementById('pf-save');
    if (!save || save.getAttribute('data-dr-acct') === '1') return;
    save.setAttribute('data-dr-acct', '1');
    save.addEventListener(
      'click',
      function () {
        var dr = document.getElementById('dr-pf-username');
        var pf = document.getElementById('pf-username');
        if (dr && pf && dr.value.trim()) pf.value = dr.value.trim();
      },
      true
    );
  }

  function tick() {
    injectCss();
    ensureSection();
    hookSave();
  }

  injectCss();
  setTimeout(tick, 400);
  setTimeout(tick, 1500);
  setInterval(tick, 2500);

  window.DRAccountSecurity = { refresh: tick };
})();
