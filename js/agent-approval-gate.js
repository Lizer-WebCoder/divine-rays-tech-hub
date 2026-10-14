/**
 * Divine Rays — agent-approval-gate (compat shim)
 * Real gate is force-pending-block + admin Users Approve/Deny.
 * This file is a no-op so old REWRITE pins never break the app.
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_APPROVAL_GATE) return;
  window.__DR_AGENT_APPROVAL_GATE = 1;
})();
