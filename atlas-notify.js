/* ════════════════════════════════════════════════════════════════
   Atlas Notification System · shared store + dataset + bell · v1
   ----------------------------------------------------------------
   One file, loaded on every page. It owns:
     • a localStorage-backed store (read / unread / snoozed /
       dismissed / muted / channel+digest+quiet-hour preferences)
     • the canonical notification dataset covering every left-menu
       module and system-level event
     • a topbar bell badge + dropdown that auto-mounts on any page
       whose bell links to atlas-notifications.html
   The notification centre page (atlas-notifications.html) consumes
   the same API via window.AtlasNotify so every surface stays in sync.
   Same-origin localStorage = state is shared across all ~90 pages.
   ════════════════════════════════════════════════════════════════ */
(function (w, d) {
  if (w.AtlasNotify) return;

  var LS_KEY = 'atlas.notify.v1';

  /* ── Category registry (maps 1:1 to left-menu modules + system) ── */
  var CATS = {
    donors:       { label: 'Donors',            ico: 'donor'  },
    gifts:        { label: 'Gifts',             ico: 'gift'   },
    pledges:      { label: 'Pledges',           ico: 'gift'   },
    corrections:  { label: 'Gift corrections',  ico: 'system' },
    campaigns:    { label: 'Campaigns & funds', ico: 'gift'   },
    reports:      { label: 'Reports & analytics', ico: 'system' },
    pipeline:     { label: 'Prospect pipeline', ico: 'donor'  },
    tasks:        { label: 'Tasks & reminders', ico: 'task'   },
    comms:        { label: 'Communications',    ico: 'system' },
    events:       { label: 'Events',            ico: 'system' },
    volunteers:   { label: 'Volunteers',        ico: 'donor'  },
    guru:         { label: 'Guru AI',           ico: 'system' },
    users:        { label: 'Users & roles',     ico: 'system' },
    tags:         { label: 'Tags & segments',   ico: 'system' },
    integrations: { label: 'Integrations',      ico: 'sync'   },
    triggers:     { label: 'Smart Triggers',    ico: 'system' },
    sync:         { label: 'Sync',              ico: 'sync'   },
    location:     { label: 'Location portal',   ico: 'system' },
    system:       { label: 'System & security', ico: 'system' }
  };

  /* ── Canonical dataset ──────────────────────────────────────────
     ts = minutes ago (drives Today / Yesterday / Earlier grouping)
     pri = 'critical' | 'high' | 'normal'
     unread = default unread state                               */
  var DATA = [
    // ---- Tasks & reminders ----
    { id:'n-task-1',  cat:'tasks',   pri:'critical', unread:true,  ts:2,
      title:'Task overdue: Call Robert & Susan Lin re: Cathedral pledge final terms',
      desc:'Critical priority · 4 days overdue · linked to Pipeline solicitation stage',
      href:'atlas-tasks.html' },
    { id:'n-task-2',  cat:'tasks',   pri:'high',     unread:true,  ts:95,
      title:'3 thank-you calls due today',
      desc:'Auto-created from first-time gifts · tap to open your task list',
      href:'atlas-tasks.html' },
    { id:'n-task-3',  cat:'tasks',   pri:'normal',   unread:false, ts:1380,
      title:'Reminder: Site visit with the Fitzgerald Foundation tomorrow 10 AM',
      desc:'Calendar hold · prep brief attached to the task',
      href:'atlas-tasks.html' },

    // ---- Gifts ----
    { id:'n-gift-1',  cat:'gifts',   pri:'high',     unread:true,  ts:14,
      title:'New major gift · $25,000 from Robert & Susan Lin',
      desc:'Cathedral Capital · auto-receipt issued · GiveCentral synced in 31s',
      href:'atlas-donor-360.html' },
    { id:'n-gift-2',  cat:'gifts',   pri:'normal',   unread:false, ts:300,
      title:'First-time gift · $50 Apple Pay from Tessa Greene',
      desc:'Welcome email auto-queued · thank-you call task created for you',
      href:'atlas-donor-360.html' },
    { id:'n-gift-3',  cat:'gifts',   pri:'normal',   unread:false, ts:600,
      title:'Recurring gift updated · Daniel Cho raised monthly $100 → $150',
      desc:'Next charge Jun 1 · card on file ending 4821',
      href:'atlas-donor-360.html' },
    { id:'n-gift-4',  cat:'gifts',   pri:'high',     unread:true,  ts:40,
      title:'Stock gift received · 120 shares AAPL from the Harrington Trust',
      desc:'Est. value $22,400 · awaiting broker confirmation to post',
      href:'atlas-gift-entry.html' },

    // ---- Pledges ----
    { id:'n-pl-1',    cat:'pledges', pri:'high',     unread:true,  ts:180,
      title:"Pledge created: $30,000 over 3 years · Margaret O'Brien",
      desc:'First instalment $10,000 paid · 2 scheduled · DocuSign #DS-2926 sent',
      href:'atlas-pledge-detail.html' },
    { id:'n-pl-2',    cat:'pledges', pri:'normal',   unread:false, ts:1440,
      title:'Pledge instalment paid: Fitzgerald Family · $10,000',
      desc:'Balance now $30,000 · 3 instalments remaining',
      href:'atlas-pledge-detail.html' },
    { id:'n-pl-3',    cat:'pledges', pri:'critical', unread:true,  ts:70,
      title:'Pledge payment failed (NSF) · Alvarez Family · $500',
      desc:'Auto-retry scheduled in 3 days · dunning email queued',
      href:'atlas-pledge-payment.html' },
    { id:'n-pl-4',    cat:'pledges', pri:'high',     unread:true,  ts:260,
      title:'Pledge instalment due in 5 days · Keller Group · $2,500',
      desc:'Reminder email sends automatically tomorrow 9 AM',
      href:'atlas-pledge-detail.html' },

    // ---- Gift corrections ----
    { id:'n-corr-1',  cat:'corrections', pri:'high', unread:true,  ts:120,
      title:'Correction pending approval · $1,000 gift reassigned to Building Fund',
      desc:'Submitted by Daniel Cho · needs DBA sign-off before posting',
      href:'atlas-gift-correction-center.html' },
    { id:'n-corr-2',  cat:'corrections', pri:'normal', unread:false, ts:720,
      title:'Gift reversed · duplicate $250 charge refunded to Nguyen Family',
      desc:'Audit entry created · receipt voided and re-issued',
      href:'atlas-gift-correction-center.html' },

    // ---- Campaigns & funds ----
    { id:'n-camp-1',  cat:'campaigns', pri:'high', unread:true,  ts:150,
      title:'Cathedral Capital Campaign crossed 75% of goal · $3.75M of $5M',
      desc:'On pace to close 6 weeks early · milestone email drafted',
      href:'atlas-campaign-dashboard.html' },
    { id:'n-camp-2',  cat:'campaigns', pri:'normal', unread:false, ts:900,
      title:'Appeal ended · Spring Music Series raised $48,200 from 312 gifts',
      desc:'Final report ready · ROI 4.1x',
      href:'atlas-appeals.html' },
    { id:'n-camp-3',  cat:'campaigns', pri:'normal', unread:false, ts:2100,
      title:'Fund balance alert · Scholarship Fund below $5,000 threshold',
      desc:'Set a top-up appeal or move designations',
      href:'atlas-funds.html' },

    // ---- Prospect pipeline ----
    { id:'n-pipe-1',  cat:'pipeline', pri:'high', unread:true,  ts:200,
      title:'Prospect advanced to Solicitation · Greene Family Foundation',
      desc:'Ask amount $100,000 · proposal due in 9 days',
      href:'atlas-pipeline.html' },
    { id:'n-pipe-2',  cat:'pipeline', pri:'normal', unread:false, ts:1500,
      title:'Wealth screening complete · 14 new major-gift prospects flagged',
      desc:'Combined capacity est. $2.3M · review and assign portfolios',
      href:'atlas-wealth-screening.html' },

    // ---- Donors ----
    { id:'n-donor-1', cat:'donors', pri:'high', unread:true,  ts:130,
      title:"@mention from Bridget McCarthy on Margaret O'Brien",
      desc:'"Let\'s prep the gift agreement before Wednesday\'s call — she was clear on $30k."',
      href:'atlas-donor-360.html' },
    { id:'n-donor-2', cat:'donors', pri:'normal', unread:false, ts:480,
      title:'Duplicate donor review · 3 high-confidence pairs',
      desc:'Auto-flagged from sync · 98%, 96% and 89% match scores',
      href:'atlas-duplicates.html' },
    { id:'n-donor-3', cat:'donors', pri:'normal', unread:false, ts:1600,
      title:'Household updated · spouse linked for the Lin record',
      desc:'Joint addressee + soft-credit rules applied automatically',
      href:'atlas-donor-360.html' },

    // ---- Communications ----
    { id:'n-comm-1',  cat:'comms', pri:'normal', unread:false, ts:1440,
      title:'Weekly recap sent · Cathedral campaign · 12 recipients',
      desc:'68% open rate · 41% click-through · 3 replies',
      href:'atlas-communications.html' },
    { id:'n-comm-2',  cat:'comms', pri:'high', unread:true,  ts:85,
      title:'Email bounce spike · 24 hard bounces in the Spring Appeal send',
      desc:'Addresses flagged for cleanup · suppression list updated',
      href:'atlas-communications.html' },
    { id:'n-comm-3',  cat:'comms', pri:'normal', unread:false, ts:2000,
      title:'Scheduled send ready · year-end statements go out tomorrow 8 AM',
      desc:'1,284 recipients · preview and approve before it runs',
      href:'atlas-communications.html' },

    // ---- Events ----
    { id:'n-evt-1',   cat:'events', pri:'high', unread:true,  ts:240,
      title:'Gala registration milestone · 150 of 200 seats filled',
      desc:'$92,000 in ticket + sponsor revenue so far',
      href:'atlas-events-dashboard.html' },
    { id:'n-evt-2',   cat:'events', pri:'normal', unread:false, ts:1800,
      title:'New sponsor confirmed · Harrington Trust · $15,000 Gold tier',
      desc:'Benefits fulfilment task created',
      href:'atlas-events-dashboard.html' },

    // ---- Volunteers ----
    { id:'n-vol-1',   cat:'volunteers', pri:'normal', unread:false, ts:1700,
      title:'5 new volunteer sign-ups for the Gala',
      desc:'Roles unassigned · open the roster to schedule',
      href:'atlas-volunteer-management.html' },

    // ---- Guru AI ----
    { id:'n-guru-1',  cat:'guru', pri:'high', unread:true,  ts:55,
      title:'Guru AI insight · 12 lapsing major donors predicted this quarter',
      desc:'Combined at-risk giving $340K · suggested outreach list ready',
      href:'atlas-guru-ai.html' },
    { id:'n-guru-2',  cat:'guru', pri:'normal', unread:false, ts:1300,
      title:'Guru AI drafted 8 personalised thank-you notes',
      desc:'Review and approve before they send',
      href:'atlas-guru-ai.html' },

    // ---- Reports & analytics ----
    { id:'n-rep-1',   cat:'reports', pri:'normal', unread:false, ts:1440,
      title:'Scheduled report delivered · Weekly Giving Summary',
      desc:'Sent to 4 recipients · also saved to Reports → Saved by me',
      href:'atlas-reports.html' },
    { id:'n-rep-2',   cat:'reports', pri:'normal', unread:false, ts:2600,
      title:'LYBUNT report ready · 212 donors gave last year but not this',
      desc:'Est. $148K recoverable · build a re-engagement appeal',
      href:'atlas-report-lybunt.html' },

    // ---- Users & roles ----
    { id:'n-user-1',  cat:'users', pri:'normal', unread:false, ts:2200,
      title:'New user invited · Priya Nair added as Gift Entry Specialist',
      desc:'Awaiting first sign-in · permissions scoped to St. Mary',
      href:'atlas-users-roles.html' },
    { id:'n-user-2',  cat:'users', pri:'high', unread:true,  ts:35,
      title:'Role change pending approval · Daniel Cho → Database Administrator',
      desc:'Elevated access · requires a second approver',
      href:'atlas-users-roles.html' },

    // ---- Tags & segments ----
    { id:'n-tag-1',   cat:'tags', pri:'normal', unread:false, ts:2400,
      title:'Smart segment refreshed · "Lapsed Majors" now 48 donors (+6)',
      desc:'Auto-recalculated overnight · ready to target',
      href:'atlas-tags.html' },

    // ---- Integrations ----
    { id:'n-int-1',   cat:'integrations', pri:'critical', unread:true, ts:25,
      title:'Integration token expiring · QuickBooks connection in 3 days',
      desc:'Re-authorise to keep nightly financial exports running',
      href:'atlas-integrations.html' },
    { id:'n-int-2',   cat:'integrations', pri:'normal', unread:false, ts:1900,
      title:'Mailchimp sync complete · 3,840 contacts updated',
      desc:'No conflicts · last run 2:00 AM',
      href:'atlas-integrations.html' },

    // ---- Smart Triggers ----
    { id:'n-trig-1',  cat:'triggers', pri:'normal', unread:false, ts:1100,
      title:'Smart Trigger fired · "Major gift > $10K" → 2 automations ran',
      desc:'Stewardship task + acknowledgement letter created',
      href:'atlassmarttriggers.html' },

    // ---- Sync ----
    { id:'n-sync-1',  cat:'sync', pri:'high', unread:true,  ts:60,
      title:'Sync recovered · form mapping for `cathedral-music` was missing',
      desc:'Daniel Cho fixed the mapping · auto-retry succeeded after 9m',
      href:'atlas-sync.html' },
    { id:'n-sync-2',  cat:'sync', pri:'critical', unread:true, ts:8,
      title:'GiveCentral sync paused · 3 failed batches need review',
      desc:'Last successful sync 42 min ago · open the sync hub to resume',
      href:'atlas-data-sync.html' },

    // ---- Location portal ----
    { id:'n-loc-1',   cat:'location', pri:'normal', unread:false, ts:2800,
      title:'Location portal · St. Patrick parish submitted 38 gifts for review',
      desc:'Pending diocese approval before they post centrally',
      href:'atlas-location-manage.html' },

    // ---- System & security / approvals / receipts / payments ----
    { id:'n-sys-1',   cat:'system', pri:'critical', unread:true, ts:18,
      title:'Suspicious login blocked · unrecognised device from Lagos, NG',
      desc:'Access denied · review account security and confirm it wasn\'t you',
      href:'atlas-users-roles.html' },
    { id:'n-sys-2',   cat:'system', pri:'high', unread:true, ts:110,
      title:'Year-end receipting run queued · 1,284 tax receipts',
      desc:'IRS-compliant PDFs · approve to generate and email',
      href:'atlas-receipts.html' },
    { id:'n-sys-3',   cat:'system', pri:'normal', unread:false, ts:3000,
      title:'Nightly backup completed · 2:14 AM · all modules',
      desc:'Restore points retained for 30 days',
      href:'atlas-dashboard.html' },
    { id:'n-sys-4',   cat:'system', pri:'normal', unread:false, ts:2600,
      title:'Scheduled maintenance · Sunday 2–4 AM ET · read-only window',
      desc:'No action needed · exports pause during the window',
      href:'atlas-dashboard.html' }
  ];

  /* ── Store ──────────────────────────────────────────────────── */
  function defaultChannels() {
    var c = {};
    Object.keys(CATS).forEach(function (k) {
      c[k] = { inapp: true, email: true, push: false, sms: false };
    });
    // sensible defaults: push for the few truly urgent categories
    c.gifts.push = true; c.pledges.push = true; c.system.push = true;
    c.system.sms = true; c.sync.sms = true;
    return c;
  }
  function freshStore() {
    return {
      read: {}, unread: {}, snoozed: {}, dismissed: {}, muted: {},
      prefs: {
        channels: defaultChannels(),
        digest: 'daily',           // off | daily | weekly
        quiet: { on: true, from: '21:00', to: '07:00' }
      }
    };
  }
  function load() {
    try {
      var raw = w.localStorage.getItem(LS_KEY);
      if (!raw) return freshStore();
      var s = JSON.parse(raw);
      var f = freshStore();
      // shallow-merge to survive schema additions
      s.read = s.read || {}; s.unread = s.unread || {}; s.snoozed = s.snoozed || {};
      s.dismissed = s.dismissed || {}; s.muted = s.muted || {};
      s.prefs = s.prefs || f.prefs;
      s.prefs.channels = s.prefs.channels || f.prefs.channels;
      Object.keys(CATS).forEach(function (k) {
        if (!s.prefs.channels[k]) s.prefs.channels[k] = f.prefs.channels[k];
      });
      if (!s.prefs.digest) s.prefs.digest = f.prefs.digest;
      if (!s.prefs.quiet) s.prefs.quiet = f.prefs.quiet;
      return s;
    } catch (e) { return freshStore(); }
  }
  var store = load();
  var listeners = [];
  function save() {
    try { w.localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch (e) {}
    listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
  }
  // cross-tab / cross-page live sync
  w.addEventListener('storage', function (e) {
    if (e.key === LS_KEY) { store = load(); listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }
  });

  /* ── Derived state helpers ──────────────────────────────────── */
  var now = Date.now();
  function snoozedActive(id) {
    var until = store.snoozed[id];
    return until && until > Date.now();
  }
  function isUnread(it) {
    if (store.unread[it.id]) return true;
    if (store.read[it.id]) return false;
    return !!it.unread;
  }
  // visible = not dismissed, not currently snoozed, category not muted
  function visible(it) {
    if (store.dismissed[it.id]) return false;
    if (store.muted[it.cat]) return false;
    if (snoozedActive(it.id)) return false;
    return true;
  }
  function activeList() { return DATA.filter(visible); }
  function unreadCount() {
    return activeList().filter(isUnread).length;
  }

  /* ── Mutations ──────────────────────────────────────────────── */
  function markRead(id)   { store.read[id] = true; delete store.unread[id]; save(); }
  function markUnread(id) { store.unread[id] = true; delete store.read[id]; save(); }
  function dismiss(id)    { store.dismissed[id] = true; save(); }
  function snooze(id, hrs){ store.snoozed[id] = Date.now() + (hrs || 24) * 3600e3; save(); }
  function muteCat(cat)   { store.muted[cat] = true; save(); }
  function unmuteCat(cat) { delete store.muted[cat]; save(); }
  function markAllRead()  { activeList().forEach(function (it) { markReadSilent(it.id); }); save(); }
  function markReadSilent(id){ store.read[id] = true; delete store.unread[id]; }
  function clearDismissed(){ store.dismissed = {}; save(); }
  function setChannel(cat, ch, val){ store.prefs.channels[cat][ch] = !!val; save(); }
  function setDigest(v){ store.prefs.digest = v; save(); }
  function setQuiet(patch){ Object.assign(store.prefs.quiet, patch); save(); }

  /* ── Public API ─────────────────────────────────────────────── */
  var API = {
    CATS: CATS,
    data: function () { return DATA.slice(); },
    all: function () { return DATA.slice(); },
    active: activeList,
    visible: visible,
    isUnread: isUnread,
    unreadCount: unreadCount,
    store: function () { return store; },
    prefs: function () { return store.prefs; },
    isMuted: function (cat) { return !!store.muted[cat]; },
    markRead: markRead, markUnread: markUnread, dismiss: dismiss,
    snooze: snooze, muteCat: muteCat, unmuteCat: unmuteCat,
    markAllRead: markAllRead, clearDismissed: clearDismissed,
    setChannel: setChannel, setDigest: setDigest, setQuiet: setQuiet,
    onChange: function (fn) { listeners.push(fn); },
    relTime: relTime, dayBucket: dayBucket
  };
  w.AtlasNotify = API;

  function relTime(mins) {
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' min ago';
    var h = Math.round(mins / 60);
    if (mins < 1440) return h + (h === 1 ? ' hour ago' : ' hours ago');
    var dys = Math.round(mins / 1440);
    if (dys === 1) return 'Yesterday';
    if (dys < 7) return dys + ' days ago';
    return Math.round(dys / 7) + 'w ago';
  }
  function dayBucket(mins) {
    if (mins < 1440) return 'Today';
    if (mins < 2880) return 'Yesterday';
    return 'Earlier';
  }

  /* ════════════════════════════════════════════════════════════
     Topbar bell: badge + dropdown, auto-mounted site-wide
     ════════════════════════════════════════════════════════════ */
  function svgIco(type) {
    var p = {
      task:  '<circle cx="7" cy="7" r="5.5"/><path d="M7 4v3.5M7 9v.5"/>',
      gift:  '<path d="M7 1.5v11M2 6.5h10"/>',
      donor: '<circle cx="7" cy="5" r="2.8"/><path d="M2 13c0-2.7 2.3-5 5-5s5 2.3 5 5"/>',
      sync:  '<path d="M2 7a5 5 0 0110 0M12 11a5 5 0 01-10 0"/>',
      system:'<rect x="2" y="3" width="10" height="8" rx="1.5"/><path d="M2 5l5 3 5-3"/>'
    };
    return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + (p[type] || p.system) + '</svg>';
  }

  var CSS = '' +
  '.anf-badge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 4px;border-radius:9px;background:#EF4444;color:#fff;font:700 10px/16px "DM Sans",sans-serif;text-align:center;box-shadow:0 0 0 2px #fff;pointer-events:none}' +
  '.anf-pop{position:fixed;width:400px;max-width:94vw;background:#fff;border:1px solid #E7E2D8;border-radius:14px;box-shadow:0 24px 60px rgba(15,23,42,.22);z-index:100040;overflow:hidden;font-family:"DM Sans",sans-serif;display:none}' +
  '.anf-pop.open{display:block}' +
  '.anf-ph{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 12px;border-bottom:1px solid #EFEBE2}' +
  '.anf-ph .anf-h5{display:flex;align-items:center;gap:8px;font:700 15px/1 "DM Sans";color:#1A2236}' +
  '.anf-ph .anf-ct{font:700 11px/18px "DM Sans";min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#BE185D;color:#fff;text-align:center}' +
  '.anf-ph .anf-mark{font:600 12px/1 "DM Sans";color:#9A7B2E;background:none;border:0;cursor:pointer;padding:5px 7px;border-radius:7px}' +
  '.anf-ph .anf-mark:hover{background:#F6F1E6}' +
  '.anf-body{max-height:min(64vh,460px);overflow-y:auto}' +
  '.anf-item{display:flex;gap:12px;padding:13px 16px;border-bottom:1px solid #F4F0E8;text-decoration:none;cursor:pointer;position:relative}' +
  '.anf-item:not(.read){background:#FCFBF8}' +
  '.anf-item:hover{background:#F7F3EA}' +
  '.anf-sev{width:9px;height:9px;flex:0 0 9px;border-radius:50%;margin-top:4px}' +
  '.anf-item.read .anf-sev{box-shadow:inset 0 0 0 1.5px currentColor;background:transparent!important}' +
  '.anf-tx{flex:1;min-width:0}' +
  '.anf-tt{font:650 13px/1.4 "DM Sans";color:#111A2E;margin:0 0 2px;display:flex;align-items:center;gap:6px}' +
  '.anf-item.read .anf-tt{font-weight:500;color:#5B6472}' +
  '.anf-ds{font:400 12px/1.5 "DM Sans";color:#6B7280;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
  '.anf-flag{font:700 8.5px/1 "DM Sans";letter-spacing:.04em;padding:2px 5px;border-radius:4px;text-transform:uppercase}' +
  '.anf-flag.critical{background:#FCE7EF;color:#BE185D}.anf-flag.high{background:#FEF0D9;color:#B45309}' +
  '.anf-meta{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-end;gap:7px;padding-left:6px}' +
  '.anf-wh{font:500 10.5px/1 "DM Sans";color:#9AA2B1;white-space:nowrap}' +
  '.anf-acts{display:none;gap:4px}' +
  '.anf-item:hover .anf-acts{display:flex}' +
  '.anf-item:hover .anf-wh{display:none}' +
  '.anf-acts button{width:24px;height:24px;border:1px solid #E6E1D5;background:#fff;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#8A93A5;padding:0}' +
  '.anf-acts button:hover{background:#1A2236;color:#fff;border-color:#1A2236}' +
  '.anf-acts button svg{width:12px;height:12px}' +
  '.anf-foot{padding:11px 16px;text-align:center;border-top:1px solid #EFEBE2}' +
  '.anf-foot a{font:600 12.5px/1 "DM Sans";color:#2563EB;text-decoration:none}' +
  '.anf-empty{padding:40px 20px;text-align:center;color:#9AA2B1;font:500 13px/1.5 "DM Sans"}' +
  '.anf-empty .ok{width:40px;height:40px;margin:0 auto 10px;border-radius:50%;background:#E9F6EE;color:#1A7F4B;display:flex;align-items:center;justify-content:center}';

  function injectCSS() {
    if (d.getElementById('anf-css')) return;
    var s = d.createElement('style'); s.id = 'anf-css'; s.textContent = CSS;
    d.head.appendChild(s);
  }

  function findBells() {
    // Any topbar notification bell: the <a> that links to the centre, or a
    // page-native bell button (e.g. the dashboard's #tb-bell). Excludes the
    // "Take the tour" button, which shares the .tb-notif class.
    return Array.prototype.slice.call(d.querySelectorAll('.tb-notif, #tb-bell'))
      .filter(function (el) {
        var href = el.getAttribute('href') || '';
        if (/guided-tour/.test(href)) return false;
        if (el.id === 'tb-bell') return true;
        if (href === 'atlas-notifications.html') return true;
        if (el.querySelector && el.querySelector('.notif-dot')) return true;
        return false;
      });
  }

  var pop = null;
  function buildPop() {
    if (pop) return pop;
    pop = d.createElement('div');
    pop.className = 'anf-pop';
    d.body.appendChild(pop);
    d.addEventListener('click', function (e) {
      if (pop.classList.contains('open') && !pop.contains(e.target) && !(e.target.closest && e.target.closest('.tb-notif, #tb-bell')))
        pop.classList.remove('open');
    });
    return pop;
  }

  // dot colour: severity first, then a per-category hue for normal items
  var CAT_HUE = {
    donors:'#4338CA', gifts:'#15803D', pledges:'#1D4ED8', corrections:'#B45309',
    campaigns:'#B45309', reports:'#6D28D9', pipeline:'#4338CA', tasks:'#D97706',
    comms:'#7C3AED', events:'#0E7490', volunteers:'#4338CA', guru:'#7C3AED',
    users:'#475569', tags:'#475569', integrations:'#0369A1', triggers:'#7C3AED',
    sync:'#0369A1', location:'#475569', system:'#64748B'
  };
  function sevColor(it) {
    if (it.pri === 'critical') return '#BE185D';
    if (it.pri === 'high') return '#D97706';
    return CAT_HUE[it.cat] || '#64748B';
  }
  var ICO_READ  = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7.5l3 3 6-7"/></svg>';
  var ICO_CLOSE = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 4l6 6M10 4l-6 6"/></svg>';

  function renderPop() {
    var p = buildPop();
    var items = activeList().sort(function (a, b) {
      var au = isUnread(a) ? 0 : 1, bu = isUnread(b) ? 0 : 1;
      if (au !== bu) return au - bu;              // unread first
      return a.ts - b.ts;                         // then newest
    });
    var top = items.slice(0, 6);
    var uc = unreadCount();
    var h = '<div class="anf-ph"><span class="anf-h5">Notifications' +
            (uc ? '<span class="anf-ct">' + uc + '</span>' : '') + '</span>' +
            (uc ? '<button class="anf-mark" data-anf-markall>Mark all read</button>' : '') +
            '</div><div class="anf-body">';
    if (!top.length) {
      h += '<div class="anf-empty"><div class="ok">' + ICO_READ + '</div>You\'re all caught up.</div>';
    } else {
      top.forEach(function (it) {
        var rd = isUnread(it) ? '' : ' read';
        var flag = (it.pri === 'critical') ? '<span class="anf-flag critical">Urgent</span>'
                 : (it.pri === 'high') ? '<span class="anf-flag high">High</span>' : '';
        h += '<a class="anf-item' + rd + '" href="' + it.href + '" data-anf-id="' + it.id + '">' +
             '<span class="anf-sev" style="color:' + sevColor(it) + ';background:' + sevColor(it) + '"></span>' +
             '<span class="anf-tx"><div class="anf-tt">' + it.title + flag + '</div>' +
             '<div class="anf-ds">' + it.desc + '</div></span>' +
             '<span class="anf-meta"><span class="anf-wh">' + relTime(it.ts) + '</span>' +
             '<span class="anf-acts">' +
               (isUnread(it) ? '<button data-act="read" title="Mark as read">' + ICO_READ + '</button>' : '') +
               '<button data-act="dismiss" title="Dismiss">' + ICO_CLOSE + '</button>' +
             '</span></span></a>';
      });
    }
    h += '</div><div class="anf-foot"><a href="atlas-notifications.html">View all notifications →</a></div>';
    p.innerHTML = h;

    var mk = p.querySelector('[data-anf-markall]');
    if (mk) mk.addEventListener('click', function (e) { e.stopPropagation(); markAllRead(); renderPop(); refreshBadges(); });

    Array.prototype.forEach.call(p.querySelectorAll('[data-anf-id]'), function (a) {
      var id = a.getAttribute('data-anf-id');
      // row click → mark read, then navigate
      a.addEventListener('click', function () { markRead(id); });
      // hover actions: don't navigate
      Array.prototype.forEach.call(a.querySelectorAll('[data-act]'), function (b) {
        b.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          if (b.getAttribute('data-act') === 'read') markRead(id); else dismiss(id);
          renderPop(); refreshBadges();
        });
      });
    });
  }

  function positionPop(bell) {
    var r = bell.getBoundingClientRect();
    var p = buildPop();
    p.style.top = (r.bottom + 10) + 'px';
    var right = Math.max(12, w.innerWidth - r.right);
    p.style.right = right + 'px';
    p.style.left = 'auto';
  }

  function refreshBadges() {
    var uc = unreadCount();
    findBells().forEach(function (bell) {
      if (getComputedStyle(bell).position === 'static') bell.style.position = 'relative';
      // hide the old static dot if present
      var old = bell.querySelector('.notif-dot'); if (old) old.style.display = 'none';
      var badge = bell.querySelector('.anf-badge');
      if (uc > 0) {
        if (!badge) { badge = d.createElement('span'); badge.className = 'anf-badge'; bell.appendChild(badge); }
        badge.textContent = uc > 99 ? '99+' : uc;
        badge.style.display = '';
      } else if (badge) { badge.style.display = 'none'; }
    });
  }

  function wireBells() {
    findBells().forEach(function (bell) {
      if (bell.getAttribute('data-anf')) return;
      // Replace the node with a clone to strip any page-native click handlers
      // (e.g. the dashboard's own hardcoded bell panel) so this shared dropdown wins.
      if (bell.parentNode) { var clean = bell.cloneNode(true); bell.parentNode.replaceChild(clean, bell); bell = clean; }
      bell.setAttribute('data-anf', '1');
      bell.addEventListener('click', function (e) {
        // On the notification centre page itself, let the link behave normally.
        var here = (location.pathname.split('/').pop() || '').toLowerCase();
        if (here === 'atlas-notifications.html') return;
        e.preventDefault();
        var p = buildPop();
        if (p.classList.contains('open')) { p.classList.remove('open'); return; }
        renderPop(); positionPop(bell); p.classList.add('open');
      });
    });
  }

  function boot() {
    injectCSS(); wireBells(); refreshBadges();
    API.onChange(function () { refreshBadges(); if (pop && pop.classList.contains('open')) renderPop(); });
    // portal/async topbars: re-scan briefly
    var tries = 0, t = setInterval(function () { wireBells(); refreshBadges(); if (++tries > 10) clearInterval(t); }, 150);
  }
  if (d.readyState !== 'loading') boot(); else d.addEventListener('DOMContentLoaded', boot);

})(window, document);
