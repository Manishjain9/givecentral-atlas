/* ════════════════════════════════════════════════════════════════
   Atlas Report · in-report donor search · v1
   ----------------------------------------------------------------
   Loaded on every report-viewer page. When the report shows a donor
   table (.dt-card with .dt-row[data-name]), it drops a "Search by
   donor" field into the report toolbar and filters the rows live by
   constituent name — driving the report engine's own render via the
   window.__rpSetQ hook, so paging, sorting and the empty state all
   keep working. No-ops on reports that have no donor rows.
   ════════════════════════════════════════════════════════════════ */
(function (w, d) {
  if (w.__atlasReportSearch) return; w.__atlasReportSearch = true;

  function boot() {
    var toolbar = d.querySelector('.rep-toolbar');
    if (!toolbar) return;
    if (d.getElementById('rp-donor-search')) return;

    // Mode A — report engine exposes a query hook:
    //   __rpSetQ : the standard .dt-row[data-name] engine (built-in reports)
    //   __rcSetQ : the custom/saved report engine
    var engineDonor = !!d.querySelector('.dt-card .dt-row[data-name]') && typeof w.__rpSetQ === 'function';
    var rcMode = typeof w.__rcSetQ === 'function';
    var engineMode = engineDonor || rcMode;

    // Mode B — DOM-filtered donor lists where there is no engine:
    //   .lb-rw rows with an assigned-officer cell (LYBUNT/SYBUNT), or
    //   any .dt-row with a .nm name cell on a page that opts in via __reportDonorRows
    var lbRows = [].slice.call(d.querySelectorAll('.lb-rw')).filter(function (r) { return r.querySelector('.who'); });
    var nmRows = (!engineMode && w.__reportDonorRows)
      ? [].slice.call(d.querySelectorAll('.dt-card .dt-row, .dt-row')).filter(function (r) { return r.querySelector('.nm'); })
      : [];
    var domRows = lbRows.concat(nmRows);
    if (!engineMode && !domRows.length) return;                      // no donor rows → no-op

    // styles
    if (!d.getElementById('rp-donor-search-css')) {
      var s = d.createElement('style'); s.id = 'rp-donor-search-css';
      s.textContent =
        '.rp-dsearch{position:relative;display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid var(--border,#E2E8F0);border-radius:9px;padding:7px 11px;min-width:250px;max-width:320px;flex:0 0 auto;order:-1}' +
        '.rp-dsearch:focus-within{border-color:var(--blue,#2563EB)}' +
        '.rp-dsearch>svg{width:14px;height:14px;color:var(--text-3,#94A3B8);flex-shrink:0}' +
        '.rp-dsearch input{border:none;outline:none;background:none;width:100%;font:400 13px "DM Sans",sans-serif;color:var(--text,#0F172A)}' +
        '.rp-dsearch input::placeholder{color:var(--text-3,#94A3B8)}' +
        '.rp-dsearch .rp-clr{cursor:pointer;color:var(--text-3,#94A3B8);font-size:15px;line-height:1;display:none;padding:0 1px}' +
        '.rp-dsearch .rp-clr:hover{color:var(--text,#0F172A)}' +
        '.rp-dmenu{position:absolute;top:calc(100% + 6px);left:0;min-width:280px;max-width:360px;background:#fff;border:1px solid var(--border,#E2E8F0);border-radius:11px;box-shadow:0 16px 40px rgba(15,23,42,.17);z-index:3000;overflow:hidden;display:none}' +
        '.rp-dmenu.open{display:block}' +
        '.rp-dmenu .rp-dh{font:700 10px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3,#94A3B8);padding:10px 13px 5px}' +
        '.rp-dmenu .rp-dscroll{max-height:264px;overflow-y:auto;padding-bottom:4px}' +
        '.rp-dopt{display:flex;align-items:center;gap:10px;padding:9px 13px;cursor:pointer}' +
        '.rp-dopt:hover,.rp-dopt.sel{background:#F7F3EA}' +
        '.rp-dopt .ic{width:26px;height:26px;flex:0 0 26px;border-radius:7px;background:#E0E7FF;color:#4338CA;display:flex;align-items:center;justify-content:center}' +
        '.rp-dopt .ic svg{width:13px;height:13px}' +
        '.rp-dopt .tx{font:500 13px "DM Sans",sans-serif;color:var(--text,#0F172A);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '.rp-dopt .tx em{font-style:normal;background:#FBEFC8;border-radius:3px}' +
        '.rp-dnone{padding:14px 13px;color:var(--text-3,#94A3B8);font:400 12.5px "DM Sans",sans-serif}' +
        '.rp-ttoolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff;border:1px solid var(--border,#E2E8F0);border-radius:11px;padding:9px 12px;margin-bottom:12px;position:sticky;top:10px;z-index:6;box-shadow:0 1px 2px rgba(15,23,42,.05)}' +
        '.rp-ttoolbar .rp-dsearch{order:0;box-shadow:none}' +
        '.rp-count{font:500 12.5px "DM Sans",sans-serif;color:var(--text-3,#64748B);white-space:nowrap;padding-right:2px}' +
        '.rp-count b{color:var(--text,#0F172A);font-weight:700}' +
        '.dt-card .dt-row:not(.dt-head):not(.dt-genhdr):not(.dt-empty),.lb-rw{cursor:pointer}' +
        '.dt-card .dt-row:not(.dt-head):not(.dt-genhdr):not(.dt-empty):hover{background:#F6F9FD}' +
        '.rp-rowhint{color:var(--text-3,#94A3B8)}' +
        '@media(max-width:720px){.rp-ttoolbar{flex-wrap:wrap}.rp-dsearch{min-width:0;flex:1 1 100%;max-width:none}.rp-dmenu{min-width:0;left:0;right:0}}';
      d.head.appendChild(s);
    }

    var box = d.createElement('div');
    box.className = 'rp-dsearch';
    box.id = 'rp-donor-search';
    box.innerHTML =
      '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6" cy="4.5" r="3"/><path d="M1 13c0-2.8 2.2-5 5-5h1c2.8 0 5 2.2 5 5"/></svg>' +
      '<input type="text" placeholder="Search by donor…" autocomplete="off" aria-label="Search by donor">' +
      '<span class="rp-clr" title="Clear">×</span>' +
      '<div class="rp-dmenu" role="listbox"></div>';

    // Option A — place the search in a sticky toolbar directly above the data table
    // (co-located with the results it filters), with a live result count.
    var bar = d.createElement('div');
    bar.className = 'rp-ttoolbar';
    bar.id = 'rp-table-toolbar';
    var count = d.createElement('span');
    count.className = 'rp-count';
    bar.appendChild(box);
    bar.appendChild(count);

    // anchor: the stable element that sits just above the table on each report type
    var anchor = d.getElementById('rc-table-mount')            // custom/saved report (table re-renders inside)
              || d.querySelector('.lb-grid')                   // LYBUNT/SYBUNT two-list grid
              || d.querySelector('.dt-card');                  // standard engine / detail
    if (!anchor || !anchor.parentNode) { toolbar.insertBefore(box, toolbar.firstChild); } // fallback: old top-bar spot
    else { anchor.parentNode.insertBefore(bar, anchor); }

    var inp = box.querySelector('input');
    var clr = box.querySelector('.rp-clr');
    var menu = box.querySelector('.rp-dmenu');
    var t = null, sel = -1, opts = [];

    // ── live result count (near the table) ──
    function updateCount() {
      var txt = '';
      if (engineMode) {
        var p = d.querySelector('.dt-card .pager .pg-status') || d.querySelector('#rc-root .pager span') || d.querySelector('.dt-card .pager span');
        if (p) txt = p.textContent.trim();
      } else if (domRows.length) {
        var shown = domRows.filter(function (r) { return r.style.display !== 'none'; }).length;
        txt = 'Showing ' + shown + ' of ' + domRows.length;
      }
      count.innerHTML = txt.replace(/\b(\d[\d,]*)\b/g, '<b>$1</b>');   // emphasise the numbers
    }

    // donor name for a DOM row: .nm cell, else the LYBUNT name cell (sibling of .who)
    function rowName(r) {
      var nm = r.querySelector('.nm'); if (nm) return nm.textContent;
      var who = r.querySelector('.who');
      if (who && who.previousElementSibling) return who.previousElementSibling.textContent;
      return (r.firstElementChild && r.firstElementChild.firstElementChild) ? r.firstElementChild.firstElementChild.textContent : r.textContent;
    }
    // Mode B: DOM-filter the donor rows, hide the "+ N more" helper rows, show per-card empty note
    function domApply(q) {
      var cards = {};
      domRows.forEach(function (r) {
        var show = !q || rowName(r).toLowerCase().indexOf(q) >= 0;
        r.style.display = show ? '' : 'none';
        var card = r.closest('.dt-card'); if (card) cards[card._id || (card._id = 'c' + Math.random())] = card;
      });
      [].slice.call(d.querySelectorAll('.lb-rw')).forEach(function (r) {
        if (!r.querySelector('.who')) r.style.display = q ? 'none' : '';     // "+ N more" rows
      });
      // the static bottom pager can't reflect a DOM filter — hide it while searching
      [].slice.call(d.querySelectorAll('.dt-card .pager')).forEach(function (pg) { pg.style.display = q ? 'none' : ''; });
      Object.keys(cards).forEach(function (k) {
        var card = cards[k];
        var shown = [].slice.call(card.querySelectorAll('.lb-rw, .dt-row')).filter(function (r) { return domRows.indexOf(r) >= 0 && r.style.display !== 'none'; }).length;
        var note = card.querySelector('.rp-lb-empty');
        if (q && shown === 0) {
          if (!note) {
            note = d.createElement('div'); note.className = 'rp-lb-empty';
            note.style.cssText = 'padding:16px 18px;color:var(--text-3,#94A3B8);font-size:12.5px';
            note.textContent = 'No donor in this list matches your search.';
            var hd = card.querySelector('.lb-hd, .dt-head');
            if (hd && hd.nextSibling) card.insertBefore(note, hd.nextSibling); else card.appendChild(note);
          }
          note.style.display = '';
        } else if (note) { note.style.display = 'none'; }
      });
    }

    function apply() {
      var q = inp.value.trim().toLowerCase();
      clr.style.display = q ? 'block' : 'none';
      if (engineMode) { try { (w.__rpSetQ || w.__rcSetQ)(q); } catch (e) {} }
      else { domApply(q); }
      updateCount();
    }

    // ── suggestion source: the report's own donors ──
    function allNames() {
      var arr = (w.__rpAllNames && w.__rpAllNames.length) ? w.__rpAllNames.slice() : domRows.map(rowName);
      var seen = {}, out = [];
      arr.forEach(function (n) { n = (n || '').trim(); var k = n.toLowerCase(); if (n && !seen[k]) { seen[k] = 1; out.push(n); } });
      out.sort(function (a, b) { return a.localeCompare(b); });
      return out;
    }
    function esc(x) { return (x || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function hl(name, q) { if (!q) return esc(name); var i = name.toLowerCase().indexOf(q); if (i < 0) return esc(name); return esc(name.slice(0, i)) + '<em>' + esc(name.slice(i, i + q.length)) + '</em>' + esc(name.slice(i + q.length)); }
    var PERSON = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="7" cy="5" r="2.8"/><path d="M2 13c0-2.7 2.3-5 5-5s5 2.3 5 5"/></svg>';

    function renderMenu() {
      var q = inp.value.trim().toLowerCase();
      var names = allNames();
      var list = (q ? names.filter(function (n) { return n.toLowerCase().indexOf(q) >= 0; }) : names).slice(0, 8);
      opts = list; sel = -1;
      var html = '<div class="rp-dh">' + (q ? 'Matching donors' : 'Donors in this report') + '</div>';
      if (!list.length) { html += '<div class="rp-dnone">No donor matches “' + esc(inp.value.trim()) + '”.</div>'; }
      else {
        html += '<div class="rp-dscroll">' + list.map(function (n, i) {
          return '<div class="rp-dopt" role="option" data-i="' + i + '"><span class="ic">' + PERSON + '</span><span class="tx">' + hl(n, q) + '</span></div>';
        }).join('') + '</div>';
      }
      menu.innerHTML = html;
      [].slice.call(menu.querySelectorAll('.rp-dopt')).forEach(function (el) {
        el.addEventListener('mousedown', function (e) { e.preventDefault(); pick(opts[+el.getAttribute('data-i')]); });
        el.addEventListener('mousemove', function () { var i = +el.getAttribute('data-i'); if (sel !== i) { sel = i; paint(); } });
      });
    }
    function paint() { [].slice.call(menu.querySelectorAll('.rp-dopt')).forEach(function (el, i) { el.classList.toggle('sel', i === sel); }); }
    function openMenu() { renderMenu(); menu.classList.add('open'); }
    function closeMenu() { menu.classList.remove('open'); sel = -1; }
    function pick(name) { if (!name) return; inp.value = name; closeMenu(); apply(); }

    inp.addEventListener('focus', openMenu);
    inp.addEventListener('input', function () { clearTimeout(t); t = setTimeout(apply, 90); openMenu(); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (!menu.classList.contains('open')) openMenu(); if (opts.length) { sel = Math.min(opts.length - 1, sel + 1); paint(); } }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (opts.length) { sel = Math.max(0, sel - 1); paint(); } }
      else if (e.key === 'Enter') { e.preventDefault(); if (sel >= 0 && opts[sel]) pick(opts[sel]); else { closeMenu(); apply(); } }
      else if (e.key === 'Escape') { if (menu.classList.contains('open')) { closeMenu(); } else { inp.value = ''; apply(); inp.blur(); } }
    });
    clr.addEventListener('click', function () { inp.value = ''; apply(); closeMenu(); inp.focus(); });
    d.addEventListener('click', function (e) { if (!box.contains(e.target)) closeMenu(); });

    updateCount();   // initial count

    // ── make table rows drill into the donor (delegated; survives engine re-render) ──
    if (!w.__rpRowDrill) {
      w.__rpRowDrill = true;
      function rowDonor(r) {
        var dn = r.getAttribute && r.getAttribute('data-name'); if (dn) return dn;
        var nm = r.querySelector && r.querySelector('.nm'); if (nm) return nm.textContent.trim();
        var who = r.querySelector && r.querySelector('.who'); if (who && who.previousElementSibling) return who.previousElementSibling.textContent.trim();
        return '';
      }
      d.addEventListener('click', function (e) {
        if (e.target.closest('a,button,input,select,.rp-dsearch,.rp-ttoolbar,.pager,[data-kebab],.filter-chip,.rc-chip')) return;
        var row = e.target.closest('.dt-row, .lb-rw');
        if (!row) return;
        if (row.classList.contains('dt-head') || row.classList.contains('dt-genhdr') || row.classList.contains('dt-empty')) return;
        var isLb = row.classList.contains('lb-rw');
        if (isLb && !row.querySelector('.who')) return;                               // the "+ N more" convenience row keeps its own handler
        if (!isLb && !row.getAttribute('data-name') && !row.querySelector('.nm')) return;  // must identify a donor
        if (w.getSelection && String(w.getSelection())) return;                       // don't hijack text selection
        var name = rowDonor(row); if (!name) return;
        w.location = 'atlas-donor-360.html?name=' + encodeURIComponent(name);
      });
    }
  }

  if (d.readyState !== 'loading') boot(); else d.addEventListener('DOMContentLoaded', boot);
})(window, document);
