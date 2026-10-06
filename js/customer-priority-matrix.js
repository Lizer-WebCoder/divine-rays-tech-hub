/**
 * Divine Rays — Customer priority matrix (Impact × Urgency)
 * Users never pick P1/Critical directly; system calculates priority.
 * Critical path is gated (call emergency line). Matrix pinned on portal.
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUSTOMER_PRIORITY_MATRIX_V1) return;
  window.__DR_CUSTOMER_PRIORITY_MATRIX_V1 = 1;

  var STYLE_ID = 'dr-priority-matrix-css';
  var EMERGENCY_PHONE = 'Ask your site manager / call IT emergency desk';
  var EMERGENCY_NOTE =
    'System-wide outages with no workaround are Critical (P1). ' +
    'Those must be reported by phone so we can respond immediately. ' +
    'This web form will file your ticket as High and flag it for review.';

  function calcPriority(impact, urgency) {
    var key = impact + '|' + urgency;
    var map = {
      'me|blocked': 'High',
      'me|hard': 'Medium',
      'me|question': 'Low',
      'dept|blocked': 'High',
      'dept|hard': 'High',
      'dept|question': 'Low',
      'company|blocked': 'High',
      'company|hard': 'High',
      'company|question': 'Medium'
    };
    return map[key] || 'Medium';
  }

  function isEmergency(impact, urgency) {
    return impact === 'company' && urgency === 'blocked';
  }

  function injectCss() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '#portal-customer .dr-pri-wrap{margin:0 0 1rem}',
      '#portal-customer .dr-pri-row{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}',
      '@media(max-width:560px){#portal-customer .dr-pri-row{grid-template-columns:1fr}}',
      '#portal-customer .dr-pri-result{',
      '  margin-top:0.65rem;padding:0.65rem 0.85rem;border-radius:10px;',
      '  border:1px solid rgba(139,124,247,0.28);background:rgba(124,106,240,0.1);',
      '  font-size:0.86rem;color:#e9e5ff;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap',
      '}',
      '#portal-customer .dr-pri-badge{',
      '  display:inline-flex;align-items:center;padding:0.2rem 0.55rem;border-radius:8px;',
      '  font-weight:700;font-size:0.78rem;letter-spacing:0.02em',
      '}',
      '#portal-customer .dr-pri-badge.Low{background:rgba(52,211,153,0.18);color:#6ee7b7}',
      '#portal-customer .dr-pri-badge.Medium{background:rgba(96,165,250,0.2);color:#93c5fd}',
      '#portal-customer .dr-pri-badge.High{background:rgba(251,146,60,0.22);color:#fdba74}',
      '#portal-customer .dr-pri-badge.Critical{background:rgba(248,113,113,0.22);color:#fca5a5}',
      '#portal-customer .dr-pri-emergency{',
      '  margin-top:0.65rem;padding:0.85rem 1rem;border-radius:12px;',
      '  border:1px solid rgba(248,113,113,0.45);background:rgba(127,29,29,0.35);',
      '  color:#fecaca;font-size:0.86rem;line-height:1.45',
      '}',
      '#portal-customer .dr-pri-emergency strong{color:#fff;display:block;margin-bottom:0.35rem}',
      '#portal-customer .dr-pri-matrix{',
      '  margin:0 0 1rem;border-radius:14px;border:1px solid rgba(139,124,247,0.25);',
      '  background:rgba(20,18,34,0.75);overflow:hidden',
      '}',
      '#portal-customer .dr-pri-matrix summary{',
      '  cursor:pointer;list-style:none;padding:0.75rem 1rem;font-weight:650;',
      '  color:#c4b5fd;user-select:none',
      '}',
      '#portal-customer .dr-pri-matrix summary::-webkit-details-marker{display:none}',
      '#portal-customer .dr-pri-matrix .body{padding:0 1rem 1rem;overflow-x:auto}',
      '#portal-customer .dr-pri-matrix table{',
      '  width:100%;border-collapse:collapse;font-size:0.78rem;min-width:520px',
      '}',
      '#portal-customer .dr-pri-matrix th,#portal-customer .dr-pri-matrix td{',
      '  border:1px solid rgba(139,124,247,0.18);padding:0.55rem 0.65rem;text-align:left;vertical-align:top',
      '}',
      '#portal-customer .dr-pri-matrix th{background:rgba(124,106,240,0.15);color:#e9e5ff;font-weight:650}',
      '#portal-customer .dr-pri-matrix td{color:#c8c4e0}',
      'html[data-theme="light"] #portal-customer .dr-pri-matrix{background:#fff;border-color:rgba(109,94,245,0.22)}',
      'html[data-theme="light"] #portal-customer .dr-pri-matrix summary{color:#5b21b6}',
      'html[data-theme="light"] #portal-customer .dr-pri-matrix th{background:#f3f0ff;color:#4c1d95}',
      'html[data-theme="light"] #portal-customer .dr-pri-matrix td{color:#3b3560}',
      'html[data-theme="light"] #portal-customer .dr-pri-result{background:#f5f3ff;color:#1e1b4b;border-color:rgba(109,94,245,0.25)}',
      'html[data-theme="light"] #portal-customer .dr-pri-emergency{background:#fef2f2;color:#991b1b;border-color:#fca5a5}',
      'html[data-theme="light"] #portal-customer .dr-pri-emergency strong{color:#7f1d1d}',
      '#portal-customer #c-priority.dr-pri-hidden-native{',
      '  position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;',
      '  pointer-events:none!important;overflow:hidden!important',
      '}',
    ].join('');
    document.head.appendChild(s);
  }

  function ensureMatrixCard(form) {
    if (document.getElementById('dr-pri-matrix')) return;
    var details = document.createElement('details');
    details.className = 'dr-pri-matrix';
    details.id = 'dr-pri-matrix';
    details.innerHTML =
      '<summary>Priority levels — what P1–P4 mean</summary>' +
      '<div class="body">' +
      '<table>' +
      '<thead><tr><th>Priority</th><th>Definition</th><th>Example</th></tr></thead>' +
      '<tbody>' +
      '<tr><td><strong>P1 – Critical</strong></td><td>Entire system down; no workaround; financial/operational loss. <em>Report by phone — not available on this form.</em></td><td>Company-wide internet or email server outage.</td></tr>' +
      '<tr><td><strong>P2 – High</strong></td><td>Major function broken; severely limits operations; workaround may exist.</td><td>Core department cannot access accounting software.</td></tr>' +
      '<tr><td><strong>P3 – Medium</strong></td><td>Single user or minor function impacted; standard operations continue.</td><td>An employee’s local laptop screen is glitching.</td></tr>' +
      '<tr><td><strong>P4 – Low</strong></td><td>General inquiries, cosmetic bugs, or standard service requests.</td><td>Requesting a new mouse or software license update.</td></tr>' +
      '</tbody></table>' +
      '<p style="margin:0.75rem 0 0;font-size:0.8rem;opacity:0.85">Your priority is calculated from <strong>Impact</strong> and <strong>Urgency</strong> below — you do not pick Critical yourself.</p>' +
      '</div>';
    var host = form.parentNode;
    if (host) host.insertBefore(details, form);
  }

  function ensureFields(form) {
    var native = document.getElementById('c-priority');
    if (!native) return null;

    native.classList.add('dr-pri-hidden-native');
    native.setAttribute('aria-hidden', 'true');
    native.tabIndex = -1;

    Array.prototype.slice.call(native.options).forEach(function (opt) {
      if (/critical/i.test(opt.value) || /critical/i.test(opt.text)) opt.remove();
    });

    var wrap = document.getElementById('dr-pri-wrap');
    if (wrap) return wrap;

    wrap = document.createElement('div');
    wrap.className = 'dr-pri-wrap';
    wrap.id = 'dr-pri-wrap';
    wrap.innerHTML =
      '<div class="dr-pri-row">' +
      '<div class="form-group">' +
      '<label for="dr-pri-impact">Impact — how many people are affected? *</label>' +
      '<select id="dr-pri-impact" required>' +
      '<option value="">Select impact…</option>' +
      '<option value="me">Just me</option>' +
      '<option value="dept">My whole department</option>' +
      '<option value="company">The entire company</option>' +
      '</select></div>' +
      '<div class="form-group">' +
      '<label for="dr-pri-urgency">Urgency — is there a workaround? *</label>' +
      '<select id="dr-pri-urgency" required>' +
      '<option value="">Select urgency…</option>' +
      '<option value="blocked">I cannot do any work</option>' +
      '<option value="hard">I can work with difficulties</option>' +
      '<option value="question">This is a question / request</option>' +
      '</select></div></div>' +
      '<div class="dr-pri-result" id="dr-pri-result" hidden></div>' +
      '<div class="dr-pri-emergency" id="dr-pri-emergency" hidden></div>';

    var group = native.closest('.form-group');
    var row = native.closest('.form-row');
    if (row && row.parentNode) {
      row.parentNode.insertBefore(wrap, row);
      if (group) group.style.display = 'none';
    } else if (group && group.parentNode) {
      group.parentNode.insertBefore(wrap, group);
      group.style.display = 'none';
    } else {
      form.insertBefore(wrap, form.firstChild);
    }

    wrap.appendChild(native);
    return wrap;
  }

  function updateResult() {
    var impactEl = document.getElementById('dr-pri-impact');
    var urgencyEl = document.getElementById('dr-pri-urgency');
    var native = document.getElementById('c-priority');
    var result = document.getElementById('dr-pri-result');
    var emergency = document.getElementById('dr-pri-emergency');
    if (!impactEl || !urgencyEl || !native || !result) return;

    var impact = impactEl.value;
    var urgency = urgencyEl.value;
    if (!impact || !urgency) {
      result.hidden = true;
      if (emergency) emergency.hidden = true;
      native.value = 'Medium';
      return;
    }

    var pri = calcPriority(impact, urgency);
    native.value = pri;

    var label =
      pri === 'High' ? 'P2 – High' :
      pri === 'Medium' ? 'P3 – Medium' :
      pri === 'Low' ? 'P4 – Low' : pri;

    result.hidden = false;
    result.innerHTML =
      '<span>Calculated priority:</span> ' +
      '<span class="dr-pri-badge ' + pri + '">' + label + '</span>' +
      '<span style="opacity:0.8;font-size:0.8rem">Based on impact + urgency</span>';

    if (emergency) {
      if (isEmergency(impact, urgency)) {
        emergency.hidden = false;
        emergency.innerHTML =
          '<strong>Possible P1 – Critical situation</strong>' +
          EMERGENCY_NOTE +
          '<br><br><strong>Emergency contact:</strong> ' +
          EMERGENCY_PHONE +
          '<br>You may still submit below — it will be recorded as <strong>High</strong> and reviewed urgently.';
      } else {
        emergency.hidden = true;
      }
    }
  }

  function bindSubmit(form) {
    if (form.__drPriBound) return;
    form.__drPriBound = 1;
    form.addEventListener(
      'submit',
      function (e) {
        var impactEl = document.getElementById('dr-pri-impact');
        var urgencyEl = document.getElementById('dr-pri-urgency');
        var native = document.getElementById('c-priority');
        if (!impactEl || !urgencyEl) return;
        if (!impactEl.value || !urgencyEl.value) {
          e.preventDefault();
          e.stopPropagation();
          alert('Please select Impact and Urgency so we can set the right priority.');
          return;
        }
        updateResult();
        var desc = document.getElementById('c-description');
        if (desc && desc.value && desc.value.indexOf('[Impact:') === -1) {
          var impactLabel = impactEl.options[impactEl.selectedIndex].text;
          var urgencyLabel = urgencyEl.options[urgencyEl.selectedIndex].text;
          desc.value =
            desc.value.replace(/\s+$/, '') +
            '\n\n[Impact: ' +
            impactLabel +
            ' | Urgency: ' +
            urgencyLabel +
            ' | Priority: ' +
            (native ? native.value : '') +
            ']';
        }
        if (native && /critical/i.test(native.value)) native.value = 'High';
      },
      true
    );
  }

  function run() {
    var form = document.getElementById('customer-form');
    var portal = document.getElementById('portal-customer');
    if (!form || !portal) return;
    injectCss();
    ensureMatrixCard(form);
    ensureFields(form);
    bindSubmit(form);

    var impactEl = document.getElementById('dr-pri-impact');
    var urgencyEl = document.getElementById('dr-pri-urgency');
    if (impactEl && !impactEl.__drPri) {
      impactEl.__drPri = 1;
      impactEl.addEventListener('change', updateResult);
    }
    if (urgencyEl && !urgencyEl.__drPri) {
      urgencyEl.__drPri = 1;
      urgencyEl.addEventListener('change', updateResult);
    }
    updateResult();
  }

  run();
  setTimeout(run, 400);
  setTimeout(run, 1200);
  setTimeout(run, 2500);
  setInterval(run, 4000);

  try {
    new MutationObserver(function () {
      clearTimeout(window.__drPriT);
      window.__drPriT = setTimeout(run, 80);
    }).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  window.DRCustomerPriorityMatrix = { refresh: run, calc: calcPriority, v: 1 };
})();
