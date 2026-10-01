/**
 * Divine Rays — Agent approval gate + staff role label
 * - Newly registered Agent/Admin cannot enter portal until approved
 * - Roles column shows chosen label (Owner / Admin / IT Tech Support)
 * - Pending login: one toast only, 5s, stack-capped (max 3 visible)
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_APPROVAL_GATE) return;
  window.__DR_AGENT_APPROVAL_GATE = 1;

  var APPROVAL_KEY = 'dr_staff_approval';
  var PENDING_MSG =
    'Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.';
  var TOAST_MS = 5000;
  var MAX_TOASTS = 3;
  var _pendingToastEl = null;
  var _pendingToastTimer = null;
  var _gateBusy = false;
  var _lastPendingShow = 0;

  function getApprovalMap() {
    try {
      return JSON.parse(localStorage.getItem(APPROVAL_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function setApprovalMap(map) {
    try {
      localStorage.setItem(APPROVAL_KEY, JSON.stringify(map || {}));
    } catch (e) {}
  }

  function markPending(userId, username, email) {
    var map = getApprovalMap();
    if (userId) map[userId] = 'pending';
    if (username) map['pending:' + String(username).toLowerCase().trim()] = 'pending';
    if (email) map['pending:' + String(email).toLowerCase().trim()] = 'pending';
    setApprovalMap(map);
  }

  function isMarkedPending(userId, username, email) {
    var map = getApprovalMap();
    if (userId && map[userId] === 'pending') return true;
    if (username && map['pending:' + String(username).toLowerCase().trim()] === 'pending') return true;
    if (email && map['pending:' + String(email).toLowerCase().trim()] === 'pending') return true;
    return false;
  }

  function isApproved(userId, username, email) {
    var map = getApprovalMap();
    if (userId && map[userId] === 'approved') return true;
    if (username && map['u:' + String(username).toLowerCase().trim()] === 'approved') return true;
    if (email && map['e:' + String(email).toLowerCase().trim()] === 'approved') return true;
    return false;
  }

  function sb() {
    try {
      if (window.DR && typeof window.DR.sb === 'function') {
        var c = window.DR.sb();
        if (c) return c;
      }
    } catch (e) {}
    return window.__drSb || window.__drAgentSb || null;
  }

  function ensureToastContainer() {
    var c = document.getElementById('toast-container');
    if (c) return c;
    c = document.createElement('div');
    c.id = 'toast-container';
    c.setAttribute('aria-live', 'polite');
    c.style.cssText =
      'position:fixed;top:1rem;right:1rem;z-index:100000;display:flex;flex-direction:column;gap:0.5rem;max-width:min(22rem,92vw);pointer-events:none;';
    document.body.appendChild(c);
    return c;
  }

  /** Keep at most MAX_TOASTS visible; remove oldest immediately when over limit. */
  function trimToastStack() {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var kids = Array.prototype.slice.call(c.querySelectorAll('.toast'));
    while (kids.length > MAX_TOASTS) {
      var old = kids.shift();
      try {
        if (old && old.parentNode) old.parentNode.removeChild(old);
      } catch (e) {}
    }
  }

  /**
   * Single pending-approval toast: never stacks duplicates.
   * Reuses one element; resets 5s timer on each Sign in click.
   * If other toasts already exist and total would exceed MAX, drop oldest.
   */
  function showPendingToast(msg) {
    var text = msg || PENDING_MSG;
    var c = ensureToastContainer();

    /* Remove any other pending-approval toasts so only one remains */
    Array.prototype.slice.call(c.querySelectorAll('.toast')).forEach(function (el) {
      if (el !== _pendingToastEl && (el.textContent || '').indexOf('pending Administrator approval') !== -1) {
        try {
          el.parentNode && el.parentNode.removeChild(el);
        } catch (e0) {}
      }
    });

    if (!_pendingToastEl || !_pendingToastEl.parentNode) {
      _pendingToastEl = document.createElement('div');
      _pendingToastEl.className = 'toast error';
      _pendingToastEl.setAttribute('data-dr-pending-approval', '1');
      _pendingToastEl.style.cssText =
        'pointer-events:auto;padding:0.85rem 1.1rem;border-radius:14px;' +
        'background:rgba(28,22,42,0.96);border:1px solid rgba(167,139,250,0.35);' +
        'color:#eeeef6;font-size:0.9rem;line-height:1.45;box-shadow:0 12px 32px rgba(0,0,0,0.45);' +
        'animation:drToastIn .2s ease;';
      c.appendChild(_pendingToastEl);
    }

    _pendingToastEl.textContent = text;

    /* Cap stack: if already 4+ (including this), fade oldest non-pending first, then oldest */
    trimToastStack();

    if (_pendingToastTimer) clearTimeout(_pendingToastTimer);
    _pendingToastTimer = setTimeout(function () {
      try {
        if (_pendingToastEl && _pendingToastEl.parentNode) {
          _pendingToastEl.parentNode.removeChild(_pendingToastEl);
        }
      } catch (e1) {}
      _pendingToastEl = null;
      _pendingToastTimer = null;
    }, TOAST_MS);

    _lastPendingShow = Date.now();
  }

  function showAgentError(msg) {
    try {
      var box = document.getElementById('error-login-agent');
      if (box) {
        box.textContent = msg;
        box.style.display = '';
      }
    } catch (e) {}

    /* Dedicated single toast — do NOT call DR.toast (that stacks) */
    showPendingToast(msg);
  }

  async function checkPendingAndBlock(user, profile, loginHint) {
    if (!user) return false;
    var meta = user.user_metadata || {};
    var uid = user.id;
    var email = (user.email || (profile && profile.email) || '').toLowerCase();
    var username =
      (meta.username || (profile && profile.username) || loginHint || '').toString().toLowerCase().trim();

    /* Explicitly approved */
    if (meta.approval_status === 'approved' || meta.approved === true) return false;
    if (isApproved(uid, username, email)) return false;

    /* Explicitly pending */
    if (meta.approval_status === 'pending' || meta.approved === false) return true;
    if (isMarkedPending(uid, username, email)) return true;

    /* No marker = legacy account → allow */
    return false;
  }

  async function forceSignOut() {
    try {
      var client = sb();
      if (client && client.auth) await client.auth.signOut({ scope: 'local' });
    } catch (e) {}
    try {
      window.__drFullLoaded = false;
      window.__drBooting = false;
    } catch (e2) {}
  }

  function stayOnLoginScreen() {
    try {
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (pc) pc.classList.remove('active');
      if (pa) pa.classList.remove('active');
      var ls = document.getElementById('login-screen');
      if (ls) {
        ls.style.display = '';
        ls.hidden = false;
      }
      var shell = document.getElementById('app-shell');
      if (shell) {
        /* keep shell if present but do not navigate away */
      }
    } catch (e2) {}
  }

  /* Intercept agent login after auth succeeds.
     Debounced so rapid "Sign in as Agent" clicks show one toast, not a stack. */
  function wireLoginGate() {
    var form = document.getElementById('login-agent');
    if (!form || form.__drApprovalGate) return;
    form.__drApprovalGate = 1;

    form.addEventListener(
      'submit',
      function (ev) {
        try {
          if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
          if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
        } catch (ePrev) {}

        /* If we just showed pending within 800ms, still refresh the single toast on click */
        if (Date.now() - _lastPendingShow < 800 && _pendingToastEl && _pendingToastEl.parentNode) {
          showPendingToast(PENDING_MSG);
          return;
        }

        if (_gateBusy) {
          /* Still allow toast refresh on click while busy */
          showPendingToast(PENDING_MSG);
          return;
        }

        var tries = 0;
        var t = setInterval(async function () {
          tries++;
          try {
            var client = sb();
            if (!client) {
              if (tries > 30) clearInterval(t);
              return;
            }
            var sess = await client.auth.getSession();
            var session = sess && sess.data && sess.data.session;
            if (!session || !session.user) {
              if (tries > 30) clearInterval(t);
              return;
            }
            var user = session.user;
            var loginHint = '';
            try {
              var inp =
                document.getElementById('agent-username') ||
                document.getElementById('agent-user');
              loginHint = inp ? (inp.value || '').trim() : '';
            } catch (e0) {}

            var profile = null;
            try {
              var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
              profile = pr && pr.data;
            } catch (e1) {}

            var pending = await checkPendingAndBlock(user, profile, loginHint);
            if (pending) {
              clearInterval(t);
              _gateBusy = true;
              await forceSignOut();
              stayOnLoginScreen();
              showAgentError(PENDING_MSG);
              setTimeout(function () {
                _gateBusy = false;
              }, 600);
              return;
            }
            clearInterval(t);
          } catch (err) {
            if (tries > 30) clearInterval(t);
          }
        }, 150);
      },
      true
    );
  }

  /* Admin table: show staff_role / job_title when present */
  function polishRoleCells() {
    var box = document.getElementById('admin-users-list');
    if (!box) return;
    box.querySelectorAll('tbody tr, .admin-user-row, tr').forEach(function (row) {
      if (row.__drRolePolished) return;
      var badge = row.querySelector('[class*="badge-role"], .badge');
      if (!badge) return;
      var uid = row.getAttribute('data-id') || '';
      var cache = window.__adminUsersCache || [];
      var user = null;
      if (uid) {
        for (var i = 0; i < cache.length; i++) {
          if (cache[i] && cache[i].id === uid) {
            user = cache[i];
            break;
          }
        }
      }
      if (!user && cache.length) {
        var cells = row.querySelectorAll('td');
        var uname = cells[1] ? (cells[1].textContent || '').trim() : '';
        for (var j = 0; j < cache.length; j++) {
          if (cache[j] && (cache[j].username === uname || cache[j].full_name === uname)) {
            user = cache[j];
            break;
          }
        }
      }
      if (!user) return;
      var label =
        user.staff_role ||
        user.job_title ||
        (user.meta && user.meta.staff_role) ||
        '';
      if (!label) {
        try {
          var map = getApprovalMap();
          var k = 'role:' + (user.username || '').toLowerCase();
          if (map[k]) label = map[k];
        } catch (e) {}
      }
      if (label) {
        badge.textContent = label;
        row.__drRolePolished = 1;
      }
    });
  }

  function patchAdminRender() {
    if (typeof window.renderAdminUsers !== 'function' || window.renderAdminUsers.__drRolePatch) return;
    var orig = window.renderAdminUsers;
    window.renderAdminUsers = async function () {
      var r = await orig.apply(this, arguments);
      setTimeout(polishRoleCells, 50);
      setTimeout(polishRoleCells, 300);
      return r;
    };
    window.renderAdminUsers.__drRolePatch = 1;
  }

  window.DRAgentApproval = {
    markPending: markPending,
    isMarkedPending: isMarkedPending,
    getApprovalMap: getApprovalMap,
    setApprovalMap: setApprovalMap,
    saveRoleLabel: function (username, label) {
      if (!username || !label) return;
      var map = getApprovalMap();
      map['role:' + String(username).toLowerCase().trim()] = label;
      setApprovalMap(map);
    },
    showPendingToast: showPendingToast
  };

  function tick() {
    wireLoginGate();
    patchAdminRender();
    polishRoleCells();
  }

  tick();
  setInterval(tick, 2000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
})();
