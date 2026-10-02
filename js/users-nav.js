/**
 * Divine Rays — Users nav v6
 * Dropdown + End-Users / Admin views
 * Stats: End-Users label + exact count
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_USERS_NAV_V6) return;
  window.__DR_USERS_NAV_V6 = 1;
  window.__DR_USERS_NAV_V5 = 1;
  window.__DR_USERS_NAV = 1;

  var DEVELOPER_USERNAMES = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };

  function isDeveloperUser(u) {
    if (!u) return false;
    return !!DEVELOPER_USERNAMES[String(u.username || '').toLowerCase().trim()];
  }

  function sb() {
    try {
      if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb();
      if (window.__drSb) return window.__drSb;
    } catch (e) {}
    return null;
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
      '.badge-role-customer{background:rgba(96,165,250,0.2)!important;color:#60a5fa!important}' +
      /* End-Users view: single End-Users stat card */
      'body.dr-view-endusers .admin-stats .stat-card{display:none!important}' +
      'body.dr-view-endusers .admin-stats .stat-card.dr-eu-stat{display:flex!important;flex-direction:column;min-width:10rem}' +
      'body.dr-view-admin-staff .admin-stats .stat-card.dr-eu-stat{display:none!important}' +
      'body.dr-view-admin-staff .admin-stats .stat-card.dr-staff-stat{display:flex!important;flex-direction:column}';
  }

  function isEndUserRole(role) {
    var r = String(role || '').toLowerCase().trim();
    return r === 'customer' || r === 'end-user' || r === 'enduser' || r === 'end_user' || r === 'user';
  }

  function isStaffRole(role) {
    var r = String(role || '').toLowerCase().trim();
    if (isEndUserRole(r)) return false;
    return r === 'admin' || r === 'agent' || r === 'developer' || r === 'staff' || !!r;
  }

  function setLabelText(card, text) {
    if (!card) return;
    var lab = card.querySelector('.stat-label');
    if (lab) lab.textContent = text;
  }

  function setValueText(idOrEl, n) {
    var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.textContent = String(n == null ? 0 : n);
  }

  function polishStatLabels() {
    var mode = window.__DR_USERS_LIST_MODE || '';
    var endMode =
      mode === 'endusers' || document.body.classList.contains('dr-view-endusers');

    var usersCard = document.getElementById('admin-stat-users');
    var custCard = document.getElementById('admin-stat-customers');
    var agentCard = document.getElementById('admin-stat-agents');
    var adminCard = document.getElementById('admin-stat-admins');

    var usersWrap = usersCard ? usersCard.closest('.stat-card') : null;
    var custWrap = custCard ? custCard.closest('.stat-card') : null;
    var agentWrap = agentCard ? agentCard.closest('.stat-card') : null;
    var adminWrap = adminCard ? adminCard.closest('.stat-card') : null;

    // Permanent labels
    setLabelText(custWrap, 'End-Users');
    setLabelText(agentWrap, 'Agents');
    setLabelText(adminWrap, 'Admins');

    if (endMode) {
      // Primary card becomes End-Users with exact count
      setLabelText(usersWrap, 'End-Users');
      if (usersWrap) {
        usersWrap.classList.add('dr-eu-stat');
        usersWrap.classList.remove('dr-staff-stat');
      }
      if (custWrap) {
        custWrap.classList.add('dr-eu-stat');
      }
      // Hide staff-only cards via class for CSS
      [agentWrap, adminWrap].forEach(function (w) {
        if (w) {
          w.classList.remove('dr-eu-stat');
          w.classList.remove('dr-staff-stat');
        }
      });
    } else {
      setLabelText(usersWrap, 'Staff');
      if (usersWrap) {
        usersWrap.classList.add('dr-staff-stat');
        usersWrap.classList.remove('dr-eu-stat');
      }
      [agentWrap, adminWrap, custWrap].forEach(function (w) {
        if (w) w.classList.add('dr-staff-stat');
      });
      if (custWrap) custWrap.classList.remove('dr-eu-stat');
    }
  }

  async function refreshStatCounts() {
    polishStatLabels();
    var client = sb();
    if (!client) {
      // Fallback: count visible table rows
      var rows = document.querySelectorAll('#admin-users-list tbody tr');
      var visible = 0;
      rows.forEach(function (r) {
        if (r.style.display === 'none') return;
        visible++;
      });
      var mode = window.__DR_USERS_LIST_MODE || '';
      if (mode === 'endusers' || document.body.classList.contains('dr-view-endusers')) {
        setValueText('admin-stat-users', visible);
        setValueText('admin-stat-customers', visible);
      } else {
        setValueText('admin-stat-users', visible);
      }
      return;
    }

    try {
      var r = await client.from('profiles').select('id,role');
      var rows = r.error ? [] : r.data || [];
      var endCount = 0;
      var agentCount = 0;
      var adminCount = 0;
      var staffCount = 0;
      rows.forEach(function (u) {
        if (isEndUserRole(u.role)) {
          endCount++;
        } else if (isStaffRole(u.role)) {
          staffCount++;
          var rr = String(u.role || '').toLowerCase();
          if (rr === 'agent') agentCount++;
          if (rr === 'admin' || rr === 'developer') adminCount++;
        }
      });

      var mode = window.__DR_USERS_LIST_MODE || '';
      var endMode =
        mode === 'endusers' || document.body.classList.contains('dr-view-endusers');

      if (endMode) {
        setValueText('admin-stat-users', endCount);
        setValueText('admin-stat-customers', endCount);
      } else {
        setValueText('admin-stat-users', staffCount);
        setValueText('admin-stat-customers', endCount);
        setValueText('admin-stat-agents', agentCount);
        setValueText('admin-stat-admins', adminCount);
      }
    } catch (e) {}
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
      try {
        x.style.display = 'none';
      } catch (e) {}
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
          setTimeout(refreshStatCounts, 200);
          setTimeout(refreshStatCounts, 800);
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
    if (!go()) {
      setTimeout(function () {
        go();
      }, 300);
      setTimeout(function () {
        go();
      }, 900);
      setTimeout(function () {
        go();
      }, 1800);
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
    refreshStatCounts();
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
    refreshStatCounts();
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
    polishStatLabels();
  }

  function tick() {
    wire();
    if (
      document.body.classList.contains('dr-view-endusers') ||
      document.body.classList.contains('dr-view-admin-staff')
    ) {
      refreshStatCounts();
    }
  }

  tick();
  setInterval(tick, 2500);
  window.DRUsersNav = {
    refresh: tick,
    openEndUsers: openEndUsers,
    openAdmin: openAdminStaff,
    isDeveloperUser: isDeveloperUser,
    refreshStats: refreshStatCounts
  };
})();
