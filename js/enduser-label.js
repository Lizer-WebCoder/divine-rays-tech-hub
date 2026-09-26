/**
 * Divine Rays — display "End-User" instead of Customer/User for ticket creators
 * (Does not change DB role codes: customer stays customer internally)
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ENDUSER_LABEL) return;
  window.__DR_ENDUSER_LABEL = 1;

  var ROLE_LABEL = 'End-User';

  function mapRoleLabel(role) {
    var r = String(role || '').toLowerCase();
    if (r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser') return ROLE_LABEL;
    if (r === 'agent') return 'Agent';
    if (r === 'admin') return 'Admin';
    return role;
  }

  function rewriteText(t) {
    if (!t) return t;
    var s = String(t);
    s = s.replace(/\bCreate Customer Account\b/gi, 'Create End-User Account');
    s = s.replace(/\bCustomer Account\b/gi, 'End-User Account');
    s = s.replace(/\(\s*Customer\s*\)/gi, '(' + ROLE_LABEL + ')');
    s = s.replace(/\bCustomers\b/g, 'End-Users');
    s = s.replace(/\bcustomers\b/g, 'end-users');
    s = s.replace(/\bCustomer\b/g, ROLE_LABEL);
    s = s.replace(/\bcustomer\b/g, 'end-user');
    return s;
  }

  function shouldSkip(el) {
    if (!el || !el.tagName) return true;
    var tag = el.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'code' || tag === 'pre') return true;
    if (el.closest && el.closest('script, style, code, pre')) return true;
    if (tag === 'option' && el.value && /^(customer|agent|admin)$/i.test(el.value)) {
      return false;
    }
    if (tag === 'input' || tag === 'textarea') return true;
    return false;
  }

  function fixOptions() {
    document.querySelectorAll('option').forEach(function (opt) {
      var v = (opt.value || '').toLowerCase();
      if (v === 'customer') {
        if (opt.textContent.trim() !== ROLE_LABEL) opt.textContent = ROLE_LABEL;
      }
    });
  }

  function fixLoggedLabel() {
    var label = document.getElementById('logged-user-label');
    if (!label) return;
    var t = label.textContent || '';
    if (/\(Customer\)/i.test(t) || /\(User\)/i.test(t)) {
      label.textContent = t
        .replace(/\(Customer\)/gi, '(' + ROLE_LABEL + ')')
        .replace(/\(User\)/gi, '(' + ROLE_LABEL + ')');
    }
  }

  function walk(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node;
    var nodes = [];
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (n) {
      var parent = n.parentElement;
      if (shouldSkip(parent)) return;
      var before = n.nodeValue;
      if (!before || !/customer|Customer|Customers/i.test(before)) return;
      var after = rewriteText(before);
      if (after !== before) n.nodeValue = after;
    });
  }

  function apply() {
    try {
      walk(document.body);
      fixOptions();
      fixLoggedLabel();

      document.querySelectorAll('.agent-badge, .role-badge, .user-role, [data-role]').forEach(function (el) {
        var t = el.textContent || '';
        if (/customer/i.test(t)) el.textContent = rewriteText(t);
      });

      document.querySelectorAll('.ltab, [data-ltab="customer"]').forEach(function (el) {
        if ((el.getAttribute('data-ltab') || '') === 'customer' || /customer/i.test(el.textContent || '')) {
          if (/^customer$/i.test((el.textContent || '').trim())) el.textContent = ROLE_LABEL;
        }
      });

      document.querySelectorAll('.stat-label').forEach(function (el) {
        if (/^customers?$/i.test((el.textContent || '').trim())) {
          el.textContent = /s$/i.test(el.textContent) ? 'End-Users' : ROLE_LABEL;
        }
      });
    } catch (e) {}
  }

  try {
    if (window.DR) {
      window.DR.formatRoleLabel = mapRoleLabel;
    }
  } catch (e) {}

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  setTimeout(apply, 500);
  setTimeout(apply, 1500);
  setTimeout(apply, 3500);
  setInterval(apply, 8000);

  document.addEventListener(
    'click',
    function () {
      setTimeout(apply, 200);
      setTimeout(apply, 800);
    },
    true
  );

  window.DREndUserLabel = { refresh: apply, mapRoleLabel: mapRoleLabel };
})();
