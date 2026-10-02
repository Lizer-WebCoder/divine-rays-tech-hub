/**
 * Divine Rays — Users nav v5
 * Dropdown arrow; highlight active; force view-admin + load users list
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_USERS_NAV_V5) return;
  window.__DR_USERS_NAV_V5 = 1;
  window.__DR_USERS_NAV_V4 = 1;
  window.__DR_USERS_NAV_V3 = 1;
  window.__DR_USERS_NAV_V2 = 1;
  window.__DR_USERS_NAV = 1;

  var DEVELOPER_USERNAMES = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };

  function isDeveloperUser(u) {
    if (!u) return false;
    return !!DEVELOPER_USERNAMES[String(u.username || '').toLowerCase().trim()];
  }

  function injectCss() {
    var el = document.getElementById('dr-users-nav-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-users-nav-css';
      document.head.appendChild(el);
    }
    el.textContent =
      '#portal-agent .nav-btn[data-dr-users-root]{' +
      '  position:relative; display:flex!important; align-items:center; gap:0.5rem;' +
      '  width:100%; box-sizing:border-box }' +
      '#portal-agent .nav-btn[data-dr-users-root] .dr-users-chevron{' +
      '  margin-left:auto; width:16px; height:16px; flex-shrink:0; opacity:0.75;' +
      '  transition:transform 0.18s ease; display:inline-flex; align-items:center; justify-content:center }' +
      '#portal-agent .nav-btn[data-dr-users-root].dr-users-open .dr-users-chevron{' +
      '  transform:rotate(180deg); opacity:1 }' +
      '#portal-agent .nav-btn[data-dr-users-root].dr-users-open,' +
      '#portal-agent .nav-btn[data-dr-users-root].active{' +
      '  background:rgba(124,106,240,0.18)!important; color:#c4b5fd!important }' +
      '#dr-users-sub{display:none;padding:0.35rem 0 0.55rem 0.85rem}' +
      '#dr-users-sub.open{display:block}' +
      '#dr-users-sub .nav-btn{' +
      '  width:100%; text-align:left; margin:0.2rem 0; border-radius:10px;' +
      '  padding:0.45rem 0.75rem; font-size:0.88rem; transition:background 0.15s,color 0.15s }' +
      '#dr-users-sub .nav-btn.dr-users-active,' +
      '#dr-users-sub .nav-btn.active{' +
      '  background:linear-gradient(90deg,rgba(124,106,240,0.35),rgba(124,106,240,0.12))!important;' +
      '  color:#e9e5ff!important; font-weight:600!important;' +
      '  box-shadow:inset 3px 0 0 #7c6af0 }' +
      'html[data-theme="light"] #dr-users-sub .nav-btn.dr-users-active,' +
      'html[data-theme="light"] #dr-users-sub .nav-btn.active{' +
      '  background:linear-gradient(90deg,rgba(124,106,240,0.2),rgba(124,106,240,0.06))!important;' +
      '  color:#4c1d95!important }' +
      '#portal-agent .nav-btn.nav-admin:not([data-dr-users-root]),' +
      '#portal-agent .nav-btn[data-view="admin"]:not([data-dr-users-root]){display:none!important}' +
      'body.dr-view-endusers #filter-status,body.dr-view-endusers #filter-priority,body.dr-view-endusers #filter-sort,body.dr-view-endusers #btn-clear-filters{display:none!important}' +
      'body.dr-view-admin-staff #filter-status,body.dr-view-admin-staff #filter-priority,body.dr-view-admin-staff #filter-sort,body.dr-view-admin-staff #btn-clear-filters{display:none!important}' +
      '#view-admin.active{display:block!important;visibility:visible!important;opacity:1!important}' +
      '.badge-role-developer{background:rgba(251,191,36,0.2)!important;color:#fbbf24!important}' +
      '.badge-role-pending{background:rgba(251,146,60,0.2)!important;color:#fb923c!important}' +
      '.badge-role-customer{background:rgba(96,165,250,0.2)!important;color:#60a5fa!important}';
  }

  function findAdminNavBtn() {
    var byId = document.getElementById('nav-admin');
    if (byId) return byId;
    var btns = document.querySelectorAll('#portal-agent .nav-btn');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute('data-dr-users-root')) return btns[i];
    }
    for (var j = 0; j < btns.length; j++) {
      var t = (btns[j].textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var v = (btns[j].getAttribute('data-view') || '').toLowerCase();
      if (v === 'admin' || t === 'admin' || t === 'users' || t.indexOf('users') === 0) return btns[j];
    }
    return null;
  }

  function chevronSvg() {
    return (
      '<svg class="dr-users-chevron" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
      '<path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>'
    );
  }

  function setUsersLabel(root) {
    if (!root) return;
    var ico = root.querySelector('.dr-nav-ico');
    var svgKeep = root.querySelector('svg:not(.dr-users-chevron)');
    var keep = ico || svgKeep;
    var labelSpan = root.querySelector('[data-dr-users-label]');
    var chev = root.querySelector('.dr-users-chevron');

    if (!labelSpan) {
      var kids = Array.prototype.slice.call(root.childNodes);
      kids.forEach(function (n) {
        if (n !== keep) root.removeChild(n);
      });
      if (keep && !keep.parentNode) root.appendChild(keep);
      labelSpan = document.createElement('span');
      labelSpan.setAttribute('data-dr-users-label', '1');
      root.appendChild(labelSpan);
    }
    labelSpan.textContent = 'Users';

    if (!chev) {
      var wrap = document.createElement('span');
      wrap.innerHTML = chevronSvg();
      chev = wrap.firstChild;
      root.appendChild(chev);
    }

    root.classList.remove('is-hidden');
    root.style.display = '';
    root.setAttribute('data-dr-users-root', '1');
    root.setAttribute('aria-haspopup', 'true');
    root.setAttribute('aria-expanded', root.classList.contains('dr-users-open') ? 'true' : 'false');
    if (root.getAttribute('data-view') === 'admin') {
      root.setAttribute('data-view', 'users');
    }
  }

  function hideDuplicateAdminTabs(root) {
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (btn) {
      if (btn === root || btn.getAttribute('data-dr-users-root')) return;
      if (btn.closest('#dr-users-sub')) return;
      var t = (btn.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var v = (btn.getAttribute('data-view') || '').toLowerCase();
      if (v === 'admin' || t === 'admin' || btn.classList.contains('nav-admin') || btn.id === 'nav-admin') {
        btn.classList.add('is-hidden');
        btn.style.display = 'none';
        btn.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function ensureSubmenu(rootBtn) {
    if (!rootBtn) return null;
    var sub = document.getElementById('dr-users-sub');
    if (sub) return sub;
    sub = document.createElement('div');
    sub.id = 'dr-users-sub';
    sub.innerHTML =
      '<button type="button" class="nav-btn" id="dr-users-endusers">End-Users</button>' +
      '<button type="button" class="nav-btn" id="dr-users-admin">Admin</button>';
    if (rootBtn.parentNode) {
      if (rootBtn.nextSibling) rootBtn.parentNode.insertBefore(sub, rootBtn.nextSibling);
      else rootBtn.parentNode.appendChild(sub);
    }
    return sub;
  }

  function syncActiveHighlight() {
    var mode = window.__DR_USERS_LIST_MODE || '';
    var eu = document.getElementById('dr-users-endusers');
    var ad = document.getElementById('dr-users-admin');
    var root = document.querySelector('#portal-agent .nav-btn[data-dr-users-root]');
    var onUsers =
      document.body.classList.contains('dr-view-endusers') ||
      document.body.classList.contains('dr-view-admin-staff') ||
      mode === 'endusers' ||
      mode === 'staff';

    if (eu) {
      var euOn = mode === 'endusers' || document.body.classList.contains('dr-view-endusers');
      eu.classList.toggle('dr-users-active', euOn);
      eu.classList.toggle('active', euOn);
    }
    if (ad) {
      var adOn = mode === 'staff' || document.body.classList.contains('dr-view-admin-staff');
      ad.classList.toggle('dr-users-active', adOn);
      ad.classList.toggle('active', adOn);
    }
    if (root) {
      root.classList.toggle('active', !!onUsers);
      var sub = document.getElementById('dr-users-sub');
      var open = !!(sub && sub.classList.contains('open'));
      root.classList.toggle('dr-users-open', open);
      root.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  function forceAdminView() {
    var v = document.getElementById('view-admin');
    if (!v) return false;
    document.querySelectorAll('#portal-agent .view').forEach(function (x) {
      x.classList.remove('active');
      try { x.style.display = 'none'; } catch (e) {}
    });
    v.classList.add('active');
    v.style.display = 'block';
    v.style.visibility = 'visible';
    v.style.opacity = '1';
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (b) {
      if (b.closest('#dr-users-sub')) return;
      if (b.getAttribute('data-dr-users-root')) b.classList.add('active');
      else b.classList.remove('active');
    });
    return true;
  }

  function loadUsersList(mode) {
    function go() {
      if (typeof window.renderAdminUsers === 'function') {
        try {
          window.renderAdminUsers(mode);
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
    if (!go()) {
      setTimeout(function () { go(); }, 300);
      setTimeout(function () { go(); }, 900);
      setTimeout(function () { go(); }, 1800);
    }
  }

  function openEndUsers() {
    document.body.classList.add('dr-view-endusers');
    document.body.classList.remove('dr-view-admin-staff');
    window.__DR_USERS_LIST_MODE = 'endusers';
    var sub = document.getElementById('dr-users-sub');
    if (sub) sub.classList.add('open');
    forceAdminView();
    var pt = document.getElementById('page-title');
    if (pt) pt.textContent = 'Users · End-Users';
    loadUsersList('endusers');
    syncActiveHighlight();
  }

  function openAdminStaff() {
    document.body.classList.add('dr-view-admin-staff');
    document.body.classList.remove('dr-view-endusers');
    window.__DR_USERS_LIST_MODE = 'staff';
    var sub = document.getElementById('dr-users-sub');
    if (sub) sub.classList.add('open');
    forceAdminView();
    var pt = document.getElementById('page-title');
    if (pt) pt.textContent = 'Users · Admin';
    loadUsersList('staff');
    syncActiveHighlight();
  }

  function wire() {
    injectCss();
    var root = findAdminNavBtn();
    if (!root) return;
    setUsersLabel(root);
    hideDuplicateAdminTabs(root);
    var sub = ensureSubmenu(root);
    if (!root.__drUsersWired) {
      root.__drUsersWired = 1;
      root.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (sub) {
          sub.classList.toggle('open');
          root.classList.toggle('dr-users-open', sub.classList.contains('open'));
          root.setAttribute('aria-expanded', sub.classList.contains('open') ? 'true' : 'false');
        }
      });
    }
    var eu = document.getElementById('dr-users-endusers');
    var ad = document.getElementById('dr-users-admin');
    if (eu && !eu.__drWired) {
      eu.__drWired = 1;
      eu.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openEndUsers();
      });
    }
    if (ad && !ad.__drWired) {
      ad.__drWired = 1;
      ad.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openAdminStaff();
      });
    }
    syncActiveHighlight();
  }

  function tick() {
    wire();
  }

  tick();
  setInterval(tick, 2000);
  window.DRUsersNav = {
    refresh: tick,
    openEndUsers: openEndUsers,
    openAdmin: openAdminStaff,
    isDeveloperUser: isDeveloperUser
  };
})();
