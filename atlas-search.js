/* ════════════════════════════════════════════════════════════════
   Atlas Global Search · ⌘K command palette · v1
   ----------------------------------------------------------------
   One shared module, loaded on every page. It replaces the old
   "click search → full page reload" behaviour with a spotlight
   overlay that opens on top of the current screen:
     • opens on ⌘K / Ctrl+K, or a click/focus on either the sidebar
       or top-bar search field (redirect intercepted in capture phase)
     • live, grouped, typed results over a seeded in-page index
       (donors, gifts, pledges, campaigns, funds, reports, pages,
        quick actions)
     • empty state = recent searches + recently-viewed + quick actions
     • full keyboard control (↑ ↓ ↵, ⌘↵ new tab, esc)
     • category chips (All / Donors / Gifts / Campaigns / Pages)
     • a "See all results" row that hands off to atlas-search.html
   Recents persist in localStorage, shared across all pages.
   ════════════════════════════════════════════════════════════════ */
(function (w, d) {
  if (w.AtlasSearch) return;

  var LS_RECENT = 'atlas.search.recent';
  var LS_VIEWED = 'atlas.search.viewed';
  var FULL_PAGE = 'atlas-search.html';

  /* ── Seeded index ───────────────────────────────────────────── */
  var DONORS = [
    { label:"Margaret O'Brien",     meta:"Major donor · St. Mary's Cathedral · Tampa FL",   value:'$84,250 lifetime', sub:'Last gift Apr 2 · $10,000', href:'atlas-donor-360.html', kw:'obrien margaret major' },
    { label:'Robert & Susan Lin',   meta:'Major donor · Cathedral Capital · Tampa FL',       value:'$127,500 lifetime',sub:'Last gift today · $25,000', href:'atlas-donor-360.html', kw:'lin robert susan major cathedral' },
    { label:'Daniel Cho',           meta:'Recurring donor · $150/mo · Clearwater FL',        value:'$4,200 lifetime',  sub:'Last gift May 1 · $150',   href:'atlas-donor-360.html', kw:'cho daniel recurring monthly' },
    { label:'Fitzgerald Family',    meta:'Pledge donor · Building Fund',                     value:'$40,000 lifetime', sub:'Pledge balance $30,000',   href:'atlas-donor-360.html', kw:'fitzgerald family pledge' },
    { label:'Harrington Trust',     meta:'Foundation · Stock & DAF gifts',                   value:'$22,400 recent',   sub:'120 shares AAPL pending',  href:'atlas-donor-360.html', kw:'harrington trust foundation stock daf' },
    { label:'Greene Family Foundation', meta:'Prospect · Solicitation stage · capacity $100K', value:'Ask $100,000',   sub:'Proposal due in 9 days',   href:'atlas-pipeline.html',   kw:'greene family foundation prospect pipeline' },
    { label:'Tessa Greene',         meta:'First-time donor · Apple Pay',                     value:'$50 lifetime',     sub:'Welcome email queued',     href:'atlas-donor-360.html', kw:'tessa greene first-time new' },
    { label:'Alvarez Family',       meta:'Pledge donor · payment failed (NSF)',              value:'$500 instalment',  sub:'Auto-retry in 3 days',     href:'atlas-donor-360.html', kw:'alvarez family pledge nsf failed' },
    { label:'Keller Group',         meta:'Corporate donor · matching gifts',                 value:'$2,500 due',       sub:'Instalment due in 5 days', href:'atlas-donor-360.html', kw:'keller group corporate matching' },
    { label:'Nguyen Family',        meta:'Annual donor · St. Patrick parish',                value:'$6,800 lifetime',  sub:'Refund re-issued',         href:'atlas-donor-360.html', kw:'nguyen family annual' }
  ];
  var GIFTS = [
    { label:'$25,000 cash — Robert & Susan Lin', meta:'Cathedral Capital · receipt issued',            value:'$25,000', href:'atlas-gift-detail.html', kw:'gift cash lin cathedral major' },
    { label:'$15,000 DAF — Schwab Charitable',   meta:"Recommended by Margaret O'Brien",               value:'$15,000', href:'atlas-gift-detail.html', kw:'gift daf schwab obrien donor advised' },
    { label:'$10,000 cash — Margaret O’Brien', meta:'Annual Fund · Apr 2',                          value:'$10,000', href:'atlas-gift-detail.html', kw:'gift cash obrien annual' },
    { label:'120 shares AAPL — Harrington Trust',meta:'Stock gift · awaiting broker confirmation',     value:'$22,400', href:'atlas-gift-entry.html',  kw:'gift stock shares aapl harrington' }
  ];
  var PLEDGES = [
    { label:"$30,000 pledge — Margaret O'Brien", meta:'3 years · 2 instalments remaining',             value:'$20,000 open', href:'atlas-pledge-detail.html', kw:'pledge obrien instalment multi-year' },
    { label:'$40,000 pledge — Fitzgerald Family',meta:'Building Fund · 3 instalments remaining',        value:'$30,000 open', href:'atlas-pledge-detail.html', kw:'pledge fitzgerald building' },
    { label:'$500 instalment — Alvarez Family',  meta:'Payment failed (NSF) · dunning queued',          value:'Overdue',      href:'atlas-pledge-payment.html', kw:'pledge alvarez nsf instalment payment' }
  ];
  var CAMPAIGNS = [
    { label:'Cathedral Capital Campaign', meta:'75% to goal · 6 weeks ahead of pace',  value:'$3.75M / $5M', href:'atlas-campaign-dashboard.html', kw:'campaign cathedral capital' },
    { label:'Spring Music Series',        meta:'Appeal closed · ROI 4.1x',             value:'$48,200 raised',href:'atlas-appeals.html',          kw:'campaign appeal spring music series' }
  ];
  var FUNDS = [
    { label:'Building Fund',      meta:'Restricted fund', value:'', href:'atlas-funds.html', kw:'fund building restricted' },
    { label:'Scholarship Fund',   meta:'Restricted · below threshold', value:'$4,900', href:'atlas-funds.html', kw:'fund scholarship' },
    { label:'Cathedral Music Fund',meta:'Restricted fund', value:'', href:'atlas-funds.html', kw:'fund cathedral music' },
    { label:'General Fund',       meta:'Unrestricted', value:'', href:'atlas-funds.html', kw:'fund general unrestricted' }
  ];
  var REPORTS = [
    { label:'LYBUNT report',           meta:'212 donors lapsed since last year',  value:'$148K recoverable', href:'atlas-report-lybunt.html', kw:'report lybunt lapsed' },
    { label:'Weekly Giving Summary',   meta:'Scheduled · delivered to 4 recipients', value:'', href:'atlas-reports.html', kw:'report weekly giving summary scheduled' },
    { label:"Bishop's Dashboard",      meta:'Diocese-wide giving overview',        value:'', href:'atlas-report-bishop-dashboard.html', kw:'report bishop dashboard diocese' },
    { label:'Pledge Balance report',   meta:'Open pledges by fund',                value:'', href:'atlas-pledge-reports.html', kw:'report pledge balance open' }
  ];
  var PAGES = [
    { label:'Dashboard',          href:'atlas-dashboard.html',            kw:'home overview' },
    { label:'Donors',             href:'atlas-donors-list.html',          kw:'constituents people list' },
    { label:'Gifts & pledges',    href:'atlas-gifts-pledges.html',        kw:'donations ledger' },
    { label:'Gift Correction',    href:'atlas-gift-correction-center.html', kw:'reversal adjust fix' },
    { label:'Campaigns',          href:'atlas-campaign-dashboard.html',   kw:'' },
    { label:'Funds',              href:'atlas-funds.html',                kw:'designations' },
    { label:'Appeals',            href:'atlas-appeals.html',              kw:'' },
    { label:'Reports',            href:'atlas-reports.html',              kw:'analytics builder' },
    { label:'Prospect pipeline',  href:'atlas-pipeline.html',             kw:'moves management major' },
    { label:'Tasks & reminders',  href:'atlas-tasks.html',                kw:'todo' },
    { label:'Communications',     href:'atlas-communications.html',       kw:'email outreach messages' },
    { label:'Events',             href:'atlas-events-dashboard.html',     kw:'gala' },
    { label:'Volunteers',         href:'atlas-volunteer-management.html', kw:'' },
    { label:'Guru AI',            href:'atlas-guru-ai.html',              kw:'assistant intelligence insights' },
    { label:'Analytics',          href:'atlas-reports.html',              kw:'charts' },
    { label:'Users & roles',      href:'atlas-users-roles.html',          kw:'permissions team admin' },
    { label:'Tags & Segment',     href:'atlas-tags.html',                 kw:'segments' },
    { label:'Integrations',       href:'atlas-integrations.html',         kw:'quickbooks mailchimp connect' },
    { label:'Smart Triggers',     href:'atlassmarttriggers.html',         kw:'automation rules' },
    { label:'Sync',               href:'atlas-sync.html',                 kw:'givecentral' },
    { label:'Location portal',    href:'atlas-location-manage.html',      kw:'parish diocese' },
    { label:'Notifications',      href:'atlas-notifications.html',        kw:'alerts' }
  ];
  var ACTIONS = [
    { label:'Add a gift',        meta:'Record a new gift', href:'atlas-gift-entry.html',     kw:'new gift entry donation' },
    { label:'New pledge',        meta:'Create a pledge',   href:'atlas-pledge-create.html',  kw:'new pledge create' },
    { label:'Add a constituent', meta:'New donor record',  href:'atlas-add-constituent.html',kw:'new donor add person constituent' },
    { label:'Build a report',    meta:'Open the report builder', href:'atlas-reports.html',  kw:'new report builder' }
  ];

  // unified index
  function tag(arr, type) { return arr.map(function (o) { var c = Object.assign({ type: type }, o); return c; }); }
  var INDEX = [].concat(
    tag(DONORS,'donor'), tag(GIFTS,'gift'), tag(PLEDGES,'pledge'),
    tag(CAMPAIGNS,'campaign'), tag(FUNDS,'fund'), tag(REPORTS,'report'),
    tag(PAGES,'page')
  );

  var CHIPS = [
    { id:'all',       label:'All',              types:null },
    { id:'donors',    label:'Donors',           types:['donor'] },
    { id:'gifts',     label:'Gifts & pledges',  types:['gift','pledge'] },
    { id:'campaigns', label:'Campaigns & funds',types:['campaign','fund','appeal'] },
    { id:'pages',     label:'Pages',            types:['page','action','report'] }
  ];
  // display order + labels for section grouping
  var GROUPS = [
    { type:'donor',    label:'Donors' },
    { type:'gift',     label:'Gifts' },
    { type:'pledge',   label:'Pledges' },
    { type:'campaign', label:'Campaigns' },
    { type:'fund',     label:'Funds' },
    { type:'report',   label:'Reports' },
    { type:'page',     label:'Go to' }
  ];

  /* ── recents ────────────────────────────────────────────────── */
  function getArr(k) { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return []; } }
  function setArr(k, v) { try { w.localStorage.setItem(k, JSON.stringify(v.slice(0, 6))); } catch (e) {} }
  function pushRecent(q) { if (!q) return; var a = getArr(LS_RECENT).filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); }); a.unshift(q); setArr(LS_RECENT, a); }
  function pushViewed(item) {
    if (item.type !== 'donor') return;
    var a = getArr(LS_VIEWED).filter(function (x) { return x.label !== item.label; });
    a.unshift({ label: item.label, meta: item.meta, value: item.value, href: item.href });
    setArr(LS_VIEWED, a);
  }
  function seedViewed() {
    if (getArr(LS_VIEWED).length) return;
    setArr(LS_VIEWED, [
      { label:"Margaret O'Brien", meta:"Major donor · St. Mary's Cathedral", value:'$84,250 lifetime', href:'atlas-donor-360.html' },
      { label:'Robert & Susan Lin', meta:'Major donor · Cathedral Capital', value:'$127,500 lifetime', href:'atlas-donor-360.html' }
    ]);
  }

  /* ── ranking ────────────────────────────────────────────────── */
  function score(item, q) {
    var hay = (item.label + ' ' + (item.meta || '') + ' ' + (item.kw || '')).toLowerCase();
    var lab = item.label.toLowerCase();
    if (lab.indexOf(q) === 0) return 100;
    if (new RegExp('\\b' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(lab)) return 80;
    if (lab.indexOf(q) >= 0) return 60;
    if (hay.indexOf(q) >= 0) return 40;
    return 0;
  }
  function search(q, chip) {
    var types = (CHIPS.filter(function (c) { return c.id === chip; })[0] || CHIPS[0]).types;
    var pool = types ? INDEX.filter(function (i) { return types.indexOf(i.type) >= 0; }) : INDEX;
    q = (q || '').trim().toLowerCase();
    if (!q) return [];
    return pool.map(function (i) { return { i: i, s: score(i, q) }; })
               .filter(function (r) { return r.s > 0; })
               .sort(function (a, b) { return b.s - a.s; })
               .map(function (r) { return r.i; });
  }

  /* ── icons ──────────────────────────────────────────────────── */
  function ico(type) {
    var p = {
      donor:'<circle cx="7" cy="5" r="2.8"/><path d="M2 13c0-2.7 2.3-5 5-5s5 2.3 5 5"/>',
      gift:'<path d="M7 1.5v11M2 6.5h10"/>',
      pledge:'<rect x="2" y="3" width="10" height="8" rx="1.5"/><path d="M5 3v8M9 3v8"/>',
      campaign:'<rect x="1.5" y="1.5" width="11" height="11" rx="2"/><path d="M4 8.5l2-2 2 2 2.5-3"/>',
      fund:'<ellipse cx="7" cy="3.5" rx="5" ry="2"/><path d="M2 3.5v7c0 1.1 2.2 2 5 2s5-.9 5-2v-7"/>',
      report:'<path d="M1.5 3h11M1.5 7h7M1.5 11h5"/>',
      page:'<rect x="2" y="2" width="10" height="10" rx="2"/><path d="M5 5h4M5 7.5h4M5 10h2"/>',
      action:'<path d="M7 2.5v9M2.5 7h9"/>'
    };
    return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + (p[type] || p.page) + '</svg>';
  }

  /* ── styles ─────────────────────────────────────────────────── */
  var CSS = '' +
  '.as-ov{position:fixed;inset:0;background:transparent;z-index:100080;display:none;font-family:"DM Sans",sans-serif}' +
  '.as-ov.open{display:block}' +
  '.as-box{position:fixed;width:560px;max-width:calc(100vw - 24px);max-height:min(74vh,600px);background:#fff;border:1px solid #E7E2D8;border-radius:14px;box-shadow:0 20px 54px rgba(15,23,42,.24);display:flex;flex-direction:column;overflow:hidden;animation:asIn .12s ease-out}' +
  '@keyframes asIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}' +
  '.as-top{display:flex;align-items:center;gap:11px;padding:15px 18px;border-bottom:1px solid #EFEBE2}' +
  '.as-top>svg{width:19px;height:19px;color:#9A8B5E;flex:0 0 19px}' +
  '.as-top input{flex:1;border:0;outline:0;font:500 16px/1.2 "DM Sans";color:#1A2236;background:none}' +
  '.as-top input::placeholder{color:#AEB4BF}' +
  '.as-x{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border:1px solid #E2DDD1;border-radius:7px;background:#fff;color:#8A93A5;cursor:pointer;flex:0 0 26px;padding:0}' +
  '.as-x:hover{background:#F6F1E6;color:#5B6472}.as-x svg{width:13px;height:13px}' +
  '.as-chips{display:flex;gap:7px;padding:10px 16px;border-bottom:1px solid #F2EEE6;overflow-x:auto}' +
  '.as-chip{font:600 12px/1 "DM Sans";color:#5B6472;background:#F4F0E8;border:1px solid transparent;border-radius:20px;padding:7px 13px;cursor:pointer;white-space:nowrap}' +
  '.as-chip.on{background:#1A2236;color:#fff}' +
  '.as-body{overflow-y:auto;padding:8px 0 10px}' +
  '.as-sec{font:700 10.5px/1 "DM Sans";letter-spacing:.06em;text-transform:uppercase;color:#A3997E;padding:12px 18px 6px}' +
  '.as-row{display:flex;align-items:center;gap:12px;padding:9px 18px;cursor:pointer;text-decoration:none;border-left:3px solid transparent}' +
  '.as-row.sel{background:#F7F3EA;border-left-color:#C79E48}' +
  '.as-ic{width:32px;height:32px;flex:0 0 32px;border-radius:9px;display:flex;align-items:center;justify-content:center}' +
  '.as-ic svg{width:15px;height:15px}' +
  '.as-ic.donor{background:#E0E7FF;color:#4338CA}.as-ic.gift{background:#DCFCE7;color:#15803D}.as-ic.pledge{background:#DBEAFE;color:#1D4ED8}.as-ic.campaign{background:#FEF3C7;color:#B45309}.as-ic.fund{background:#F1F5F9;color:#475569}.as-ic.report{background:#EDE9FE;color:#6D28D9}.as-ic.page{background:#F1EEE7;color:#6B6150}.as-ic.action{background:#1A2236;color:#fff}' +
  '.as-tx{flex:1;min-width:0}' +
  '.as-l{font:600 13.5px/1.3 "DM Sans";color:#1A2236;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
  '.as-l em{font-style:normal;background:#FBEFC8;border-radius:3px;padding:0 2px}' +
  '.as-m{font:400 11.5px/1.35 "DM Sans";color:#8A93A5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}' +
  '.as-v{text-align:right;flex:0 0 auto;padding-left:10px}' +
  '.as-v .vv{font:600 12px/1.3 "DM Sans";color:#2A3245}' +
  '.as-v .vs{font:400 10.5px/1.3 "DM Sans";color:#AEB4BF;margin-top:1px}' +
  '.as-chiprow{display:flex;gap:6px;flex-wrap:wrap;padding:4px 18px 2px}' +
  '.as-recent{display:inline-flex;align-items:center;gap:6px;font:500 12px/1 "DM Sans";color:#5B6472;background:#F4F0E8;border-radius:16px;padding:7px 12px;cursor:pointer}' +
  '.as-recent svg{width:11px;height:11px;color:#A3997E}' +
  '.as-empty{padding:40px 20px;text-align:center;color:#9AA2B1;font:500 13px/1.5 "DM Sans"}' +
  '.as-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px;border-top:1px solid #EFEBE2;background:#FBF9F4}' +
  '.as-hints{display:flex;gap:10px;align-items:center}' +
  '.as-hints .hk{display:inline-flex;gap:4px;align-items:center}' +
  '.as-hints b{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:1px solid #E2DDD1;border-radius:5px;color:#8A93A5;background:#fff}' +
  '.as-hints b svg{width:12px;height:12px}' +
  '.as-seeall{font:600 12px/1 "DM Sans";color:#1A2236;text-decoration:none;cursor:pointer;white-space:nowrap}' +
  '.as-seeall:hover{color:#9A7B2E}';

  function injectCSS() { if (d.getElementById('as-css')) return; var s = d.createElement('style'); s.id = 'as-css'; s.textContent = CSS; d.head.appendChild(s); }

  /* ── overlay ────────────────────────────────────────────────── */
  var ov, input, chipsEl, bodyEl, seeAllEl, curChip = 'all', sel = -1, rows = [];

  function build() {
    if (ov) return;
    injectCSS(); seedViewed();
    ov = d.createElement('div'); ov.className = 'as-ov';
    ov.innerHTML =
      '<div class="as-box" role="dialog" aria-modal="true" aria-label="Search Atlas">' +
        '<div class="as-top"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>' +
        '<input type="text" placeholder="Search donors, gifts, pledges, campaigns, pages…" autocomplete="off" spellcheck="false">' +
        '<button class="as-x" data-as-close aria-label="Close search" title="Close"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></button></div>' +
        '<div class="as-chips"></div>' +
        '<div class="as-body"></div>' +
        '<div class="as-foot"><div class="as-hints">' +
          '<span class="hk" title="Navigate"><b><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10V3M5 6l3-3 3 3"/></svg></b><b><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v7M5 10l3 3 3-3"/></svg></b></span>' +
          '<span class="hk" title="Open"><b><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v3a2 2 0 0 1-2 2H4"/><path d="M6.5 6L4 8.5l2.5 2.5"/></svg></b></span>' +
          '<span class="hk" title="Close"><b><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 5l6 6M11 5l-6 6"/></svg></b></span>' +
        '</div>' +
        '<a class="as-seeall" data-as-seeall></a></div>' +
      '</div>';
    d.body.appendChild(ov);
    // NOTE: strip the accidental token if present
    input = ov.querySelector('input');
    chipsEl = ov.querySelector('.as-chips');
    bodyEl = ov.querySelector('.as-body');
    seeAllEl = ov.querySelector('[data-as-seeall]');

    CHIPS.forEach(function (c) {
      var el = d.createElement('div'); el.className = 'as-chip' + (c.id === curChip ? ' on' : '');
      el.textContent = c.label; el.setAttribute('data-chip', c.id);
      el.addEventListener('click', function () { curChip = c.id; syncChips(); render(); input.focus(); });
      chipsEl.appendChild(el);
    });

    input.addEventListener('input', function () { sel = -1; render(); });
    input.addEventListener('keydown', onKey);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('[data-as-close]')) close(); });
    seeAllEl.addEventListener('click', function () { goFull(); });
  }
  function syncChips() {
    Array.prototype.forEach.call(chipsEl.querySelectorAll('.as-chip'), function (el) {
      el.classList.toggle('on', el.getAttribute('data-chip') === curChip);
    });
  }

  var anchorEl = null;
  function defaultAnchor() {
    return d.querySelector('.topbar-search') || d.querySelector('.sidebar-search') ||
           d.querySelector('a[href="' + FULL_PAGE + '"]');
  }
  function positionBox() {
    if (!ov) return;
    var box = ov.querySelector('.as-box');
    var a = anchorEl && d.body.contains(anchorEl) ? anchorEl : defaultAnchor();
    if (!a) { box.style.top = '72px'; box.style.left = '50%'; box.style.transform = 'translateX(-50%)'; return; }
    box.style.transform = 'none';
    var r = a.getBoundingClientRect();
    var bw = box.offsetWidth || 560;
    var left = r.left;
    // keep within viewport
    left = Math.min(left, w.innerWidth - bw - 12);
    left = Math.max(12, left);
    box.style.left = left + 'px';
    box.style.top = (r.bottom + 6) + 'px';
  }
  function open(prefill, anchor) {
    build();
    anchorEl = anchor || defaultAnchor();
    ov.classList.add('open');
    curChip = 'all'; syncChips();
    input.value = prefill || '';
    sel = -1; render();
    positionBox();
    setTimeout(function () { input.focus(); positionBox(); }, 20);
  }
  function close() { if (ov) ov.classList.remove('open'); }
  function toggle(anchor) { if (ov && ov.classList.contains('open')) close(); else open('', anchor); }

  function goFull() {
    var q = input ? input.value.trim() : '';
    if (q) pushRecent(q);
    w.location = FULL_PAGE + (q ? '?q=' + encodeURIComponent(q) : '');
  }

  function hl(text, q) {
    if (!q) return esc(text);
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<em>' + esc(text.slice(i, i + q.length)) + '</em>' + esc(text.slice(i + q.length));
  }
  function esc(s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }

  function rowHtml(item, q) {
    var v = '';
    if (item.value || item.sub) v = '<div class="as-v">' + (item.value ? '<div class="vv">' + esc(item.value) + '</div>' : '') + (item.sub ? '<div class="vs">' + esc(item.sub) + '</div>' : '') + '</div>';
    return '<a class="as-row" href="' + item.href + '" data-row>' +
      '<span class="as-ic ' + item.type + '">' + ico(item.type) + '</span>' +
      '<span class="as-tx"><div class="as-l">' + hl(item.label, q) + '</div>' +
      (item.meta ? '<div class="as-m">' + esc(item.meta) + '</div>' : '') + '</span>' + v + '</a>';
  }

  function render() {
    var q = input.value.trim();
    seeAllEl.textContent = q ? 'See all results for “' + q + '” →' : 'Open full search →';

    if (!q) { renderEmpty(); return; }

    var res = search(q, curChip);
    if (!res.length) {
      bodyEl.innerHTML = '<div class="as-empty">No matches for “' + esc(q) + '”.<br>Try a donor name, a fund, or a page.</div>';
      rows = []; return;
    }
    var html = '';
    GROUPS.forEach(function (g) {
      var items = res.filter(function (r) { return r.type === g.type; });
      if (!items.length) return;
      html += '<div class="as-sec">' + g.label + '</div>';
      items.forEach(function (it) { html += rowHtml(it, q); });
    });
    bodyEl.innerHTML = html;
    bindRows();
    sel = 0; paintSel();
  }

  function renderEmpty() {
    var html = '';
    var recents = getArr(LS_RECENT);
    if (recents.length) {
      html += '<div class="as-sec">Recent searches</div><div class="as-chiprow">' +
        recents.map(function (r) { return '<span class="as-recent" data-recent="' + esc(r) + '"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="5.2"/><path d="M7 4.2V7l2 1.2"/></svg>' + esc(r) + '</span>'; }).join('') + '</div>';
    }
    var viewed = getArr(LS_VIEWED);
    if (viewed.length) {
      html += '<div class="as-sec">Recently viewed</div>';
      viewed.forEach(function (vn) { html += rowHtml(Object.assign({ type: 'donor' }, vn), ''); });
    }
    if (!html) html = '<div class="as-empty">Start typing to search donors, gifts, pledges, campaigns and pages.</div>';
    bodyEl.innerHTML = html;

    Array.prototype.forEach.call(bodyEl.querySelectorAll('[data-recent]'), function (el) {
      el.addEventListener('click', function () { input.value = el.getAttribute('data-recent'); sel = -1; render(); input.focus(); });
    });
    bindRows();
    sel = -1; paintSel();
  }

  function bindRows() {
    rows = Array.prototype.slice.call(bodyEl.querySelectorAll('[data-row]'));
    rows.forEach(function (r, idx) {
      r.addEventListener('mousemove', function () { if (sel !== idx) { sel = idx; paintSel(); } });
      r.addEventListener('click', function (e) { e.preventDefault(); openRow(r); });
    });
  }
  function paintSel() {
    rows.forEach(function (r, i) { r.classList.toggle('sel', i === sel); });
    if (sel >= 0 && rows[sel]) rows[sel].scrollIntoView({ block: 'nearest' });
  }
  function openRow(r, newTab) {
    var href = r.getAttribute('href');
    // record recents
    var q = input.value.trim(); if (q) pushRecent(q);
    var label = (r.querySelector('.as-l') || {}).textContent || '';
    var match = INDEX.filter(function (i) { return i.label === label; })[0];
    if (match) pushViewed(match);
    if (newTab) { w.open(href, '_blank'); return; }
    close(); w.location = href;
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (rows.length) { sel = Math.min(rows.length - 1, sel + 1); paintSel(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (rows.length) { sel = Math.max(0, sel - 1); paintSel(); } }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (sel >= 0 && rows[sel]) openRow(rows[sel], e.metaKey || e.ctrlKey);
      else goFull();
    }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  }

  /* ── wiring: intercept the old redirect fields ──────────────── */
  function isSearchField(t) {
    return t && t.closest && t.closest('.sidebar-search, .topbar-search, a[href="' + FULL_PAGE + '"]');
  }
  function boot() {
    // ⌘K / Ctrl+K
    d.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); toggle(); }
    });
    // capture-phase click: beat the page's own redirect handlers
    d.addEventListener('click', function (e) {
      var f = isSearchField(e.target);
      if (f) {
        var field = e.target.closest('.sidebar-search, .topbar-search');
        // don't hijack the notification bell or other real links — only search widgets
        if (field || (f.getAttribute && f.getAttribute('href') === FULL_PAGE && f.querySelector && f.querySelector('.sidebar-search, .topbar-search'))) {
          e.preventDefault(); e.stopImmediatePropagation(); open('', field || f);
        }
      }
    }, true);
    // capture-phase focus: fields that redirect on focus
    d.addEventListener('focusin', function (e) {
      if (e.target && e.target.matches && e.target.matches('.sidebar-search input, .topbar-search input')) {
        e.stopImmediatePropagation();
        var field = e.target.closest('.sidebar-search, .topbar-search');
        e.target.blur(); open('', field);
      }
    }, true);
    // keep the dropdown pinned to its field
    w.addEventListener('resize', function () { if (ov && ov.classList.contains('open')) positionBox(); });
    w.addEventListener('scroll', function () { if (ov && ov.classList.contains('open')) positionBox(); }, true);
  }
  if (d.readyState !== 'loading') boot(); else d.addEventListener('DOMContentLoaded', boot);

  w.AtlasSearch = { open: open, close: close, toggle: toggle, index: function () { return INDEX.slice(); }, search: search };

})(window, document);
