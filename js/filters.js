/**
 * Divine Rays — filters + Clear (lightweight)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function toast(msg, type) {
    if (window.DR && DR.toast) return DR.toast(msg, type);
    var c = document.getElementById('toast-container');
    if (!c) return;
    var e = document.createElement('div');
    e.className = 'toast ' + (type || 'info');
    e.textContent = msg;
    c.appendChild(e);
    setTimeout(function () { e.remove(); }, 2500);
  }

  function getLF() {
    if (window.DR && typeof DR.getListFilter === 'function') {
      try { return DR.getListFilter(); } catch (e) {}
    }
    if (!window.__drListFilter) {
      window.__drListFilter = { mode: 'all', q: '', status: '', priority: '', sort: 'newest' };
    }
    return window.__drListFilter;
  }

  function refreshList() {
    if (typeof window.applyTicketFilters === 'function') {
      window.applyTicketFilters(false);
      return;
    }
    if (window.DR && typeof DR.renderTicketList === 'function') DR.renderTicketList();
  }

  function clearFilters() {
    var lf = getLF();
    lf.q = '';
    lf.status = '';
    lf.priority = '';
    lf.sort = 'newest';
    var si = document.getElementById('search-input');
    var fs = document.getElementById('filter-status');
    var fp = document.getElementById('filter-priority');
    var so = document.getElementById('filter-sort');
    if (si) si.value = '';
    if (fs) fs.value = '';
    if (fp) fp.value = '';
    if (so) so.value = 'newest';
    var hint = document.getElementById('filter-hint');
    if (hint) hint.textContent = '';
    refreshList();
    toast('Filters cleared', 'info');
  }

  function bindClear() {
    var clr = document.getElementById('btn-clear-filters');
    if (!clr || clr.__drClearBound) return;
    clr.__drClearBound = true;
    clr.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      clearFilters();
    });
  }

  function bindSearchFilters() {
    var lf = getLF();
    if (lf.sort == null) lf.sort = 'newest';
    var si = document.getElementById('search-input');
    var fs = document.getElementById('filter-status');
    var fp = document.getElementById('filter-priority');
    var so = document.getElementById('filter-sort');
    var timer;

    if (si && !si.__drFilterBound) {
      si.__drFilterBound = true;
      si.addEventListener('input', function () {
        lf.q = si.value || '';
        clearTimeout(timer);
        timer = setTimeout(function () { refreshList(); }, 200);
      });
    }
    if (fs && !fs.__drFilterBound) {
      fs.__drFilterBound = true;
      fs.addEventListener('change', function () {
        lf.status = fs.value || '';
        refreshList();
      });
    }
    if (fp && !fp.__drFilterBound) {
      fp.__drFilterBound = true;
      fp.addEventListener('change', function () {
        lf.priority = fp.value || '';
        refreshList();
      });
    }
    if (so && !so.__drFilterBound) {
      so.__drFilterBound = true;
      so.addEventListener('change', function () {
        lf.sort = so.value || 'newest';
        refreshList();
      });
    }
  }

  function boot() {
    bindClear();
    bindSearchFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setTimeout(boot, 4000);

  window.DRClearFilters = clearFilters;
})();
