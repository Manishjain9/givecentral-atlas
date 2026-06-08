# Designing Atlas: A Donation Processing Platform for High-Volume Financial Operations

## Executive Summary

Atlas is the donation processing and donor management platform built by GiveCentral for Catholic dioceses, parishes, schools, and faith-based nonprofits. It replaces a patchwork of legacy CRMs, Excel templates, and disconnected processing tools with a single environment for entering gifts, validating them in real time, reconciling against fund control totals, and posting clean batches to general ledger — all without the finance team leaving the workflow.

The business challenge was operational scale. A mid-sized diocese processes 200–500 gifts a week during peak appeal seasons, but the existing tooling forced finance staff to enter each gift manually across multiple systems, discover errors only after posting, and spend two to three days every week reconciling fund balances. Errors compounded, audit trails were thin, and exception handling was effectively a separate full-time job.

As Senior Product Designer on the project, I led design end-to-end — from stakeholder research and workflow mapping through interaction design, prototyping, and design-system handoff — across more than 50 internal screens and the donor-facing portal. The result is a spreadsheet-style batch-entry workspace backed by a 27-rule Accuracy Engine, real-time reconciliation, and a split-posting workflow that lets clean gifts flow through immediately while exceptions get triaged in context. Phase 1 ships at the end of June 2026 to a pilot diocese.

---

## Project Overview

| | |
|---|---|
| **Company** | GiveCentral |
| **Product** | Atlas — Donation Processing Platform |
| **Role** | Senior Product Designer |
| **Timeline** | 7 months (December 2025 – June 2026) |
| **Team** | Product Manager · 4 Engineers · QA Lead · CEO/founder · finance stakeholders from pilot diocese |

### Responsibilities

User research and stakeholder interviews, UX strategy, information architecture, interaction design and prototyping, design system foundations, accessibility review, and developer handoff for the staff CRM, the batch-entry module, and the donor-facing payment flows.

---

## The Business Problem

Catholic dioceses and parishes process donations in a fundamentally different rhythm than most consumer giving products. A single weekly batch can contain envelope gifts from a parish appeal, online recurring payments, employer matching gifts, stock transfers, pledge payments, and one-off major gifts — each routed to a different fund, each potentially needing a different acknowledgement, each subject to canonical financial controls. The existing tooling at GiveCentral's customers shared a few recurring problems:

**High volume, low automation.** Finance staff manually keyed every gift into an entry form, one at a time. A 250-gift week required somewhere between six and ten hours of pure data entry before reconciliation even began.

**Errors discovered after the fact.** Validation lived at the database level, surfaced as post-batch error reports. By the time a finance admin learned that ten rows had bad fund codes, those gifts had already been posted, acknowledged, and partially receipted — every correction required a reversing entry and a manual donor follow-up.

**Reconciliation as a separate phase.** Control totals were checked at the end of the week, against the batch as a whole. Discrepancies of even $25 triggered a top-to-bottom audit of every gift in the batch, often costing the team an additional half-day.

**Disconnected tools.** The check log, the online giving portal, the pledge tracker, and the GL system each lived in different software. Cross-referencing them — say, to verify that a recurring gift wasn't double-counted — required spreadsheets exported, sorted, and manually compared.

This mattered for four reasons. **Financial accuracy** is non-negotiable in a regulated environment with diocesan audits. **Staff efficiency** is the difference between a finance team that can take on Phase 2 modules and one that's drowning. **Compliance** — segregation of duties, audit trails, posted-batch immutability — has to be built in, not bolted on. And **donor trust** is fragile: every misnamed receipt or duplicate thank-you erodes the relationship.

---

## Understanding Users

### Primary users

- **Diocesan Finance Admins / Bookkeepers** — High-volume daily users. Comfortable in Excel, oriented toward accuracy, hold the master keys to fund coding and GL posting.
- **Parish Administrators** — Lower volume, less training, often part-time. Need a frictionless path for weekly envelope gifts.
- **Development Directors** — Read-mostly. Care about real-time fund health, campaign progress, and donor cultivation moves.
- **Gift Officers** — Operational users on the constituent side. Read into Donor 360 daily; rarely touch batch entry.

### User goals

Process all gifts received in a week with zero errors. See fund balances in real time. Hand a clean, posted batch to the GL system on Friday. Defend every decision (skip, flag, override) to an auditor six months later.

### Pain points

Repetitive data entry across disconnected systems. Validation that arrives too late to be useful. No way to pause a batch and resume it tomorrow. No clear signal for which exceptions actually need attention versus which can be cleared with one click. Reconciliation tooling that treats the batch as a black box.

---

## Discovery & Research

### Research activities

- **Stakeholder interviews** with finance staff at six dioceses across the pilot cohort, including two extended shadowing sessions during their weekly batch cycle.
- **Workflow reviews** documenting the current cradle-to-GL gift lifecycle — what gets entered where, what gets reconciled when, who signs off on what.
- **Existing product audit** of GiveCentral's legacy tool plus three competing platforms (CRM-X, GiftWorks, and a customer-built Excel template).
- **Support ticket analysis** — 47 tickets categorized by root cause (data entry error, validation gap, reconciliation discrepancy, training issue).

### Key insights

**Insight 1 — Errors compound.** A single misidentified donor at row 5 cascades into 15 incorrect tax receipts when the batch posts. The cost of catching that error is roughly *60×* the cost of preventing it at entry time.

**Insight 2 — The 80/20 truth.** Eighty percent of weekly volume is predictable — recurring online gifts, expected envelope gifts from regular donors, scheduled pledge payments. Twenty percent needs human judgment (new donors, stock gifts, unusual amounts). The tooling treated all 100% the same, which is why the 80% felt slow.

**Insight 3 — Validation speeds entry, not the reverse.** Finance staff weren't asking us to remove validation — they were asking for validation that ran *while* they typed, not after. Done right, an inline error costs three seconds and prevents three days of reconciliation pain.

**Insight 4 — Auditors ask "why."** Finance staff need to defend their decisions long after the fact. "Why did you flag this gift?" / "Why did you override the dup warning?" The tooling needs to preserve not just what happened, but the reasoning behind it.

---

## Defining Success

We agreed on a small set of measurable targets with the pilot diocese before design started.

- Reduce processing time per 100 gifts by **at least 50%** versus the legacy product.
- Reduce post-batch correction rate by **at least 70%**.
- Move the weekly reconciliation moment from Monday/Tuesday of the following week to **Friday EOD of the same week**.
- Improve task completion for the most common batch-entry flow from observed legacy baseline (≈68%) to **>90%**.
- Reduce onboarding time for a new finance hire from **one week to one day**.

Beyond the numbers, we tracked stakeholder confidence: would the diocesan finance director sign off on expanding Atlas to the Pledge module and the Gala module in Phase 2?

---

## Mapping the Workflow

The existing workflow was effectively four sequential phases with a long tail of cleanup.

**Current flow** — Open the entry tool → key gifts in one at a time → save the batch → run a post-batch error report → manually correct errors in each row → re-save → reconcile fund totals at the end of the week → discover discrepancies → audit the batch end-to-end → reconcile again.

Bottlenecks lived at every junction: the entry form was modal-heavy, the error report was a static PDF, corrections were file-by-file, and reconciliation discrepancies offered no drill-down.

**New flow** — Open a batch (or resume a draft) → enter gifts in a validated grid where errors surface at the cell as you type → triage exceptions inline using the right-rail Accuracy Engine → reconcile in real time against a Control Total → post clean gifts immediately, post exception gifts separately with a manager note.

The journey map exposed two specific high-leverage opportunities: collapsing the entry-and-validate phases into one (saves 60–70% of the cycle), and splitting the post step into "clean" and "exceptions" so the 80% never waits for the 20%.

---

## Design Strategy

Four principles guided every screen decision.

### Principle 1 — Design for speed

The grid had to feel like Excel. Tab moves to the next cell, Enter creates a new row, Ctrl+V pastes a multi-cell selection, autocomplete fires on every donor lookup. Where the legacy tool used modals, Atlas uses inline editors that never break flow.

### Principle 2 — Keep users in context

Validation signals, exception details, and corrections all happen in or next to the row being worked on. No modal opens to fix an error; the fix is one click on the cell. The right-rail Accuracy Engine offers a global view but never forces the user to leave their place in the grid.

### Principle 3 — Surface errors immediately

Three layers of signal. **Cell-level** — a coloured edge and inline message on the offending field. **Row-level** — a status pill on the right column showing "3 errors" or "2 warnings" with one-click drill-down. **Batch-level** — a counts strip at the top (clean / errors / warnings / info) and a sticky footer summary.

### Principle 4 — Support high-volume workflows

The Batch Library is structured for scale: Saved Drafts auto-collected from any partially-completed batch, Folders for campaign-based organisation, Templates for reusable column layouts. Live search inside the library handles dioceses with hundreds of historical batches.

---

## Information Architecture

The batch lifecycle is the spine of the system: **Draft → Validating → Clean → Exceptions → Posted → Locked**. Every screen exposes the donor's current position in that lifecycle, and the allowed transitions are explicit.

The canonical 220px navy sidebar provides constant access to the top-level domains — Dashboard, Donors, Gifts & Pledges, Campaigns, Events, Pipeline, Reports, Users & Roles — and remains identical across all 56 staff-CRM screens. Inside the batch-entry workspace, a second navigation surface (the Batch Library popover) provides scoped access to Drafts, Folders, and Templates without leaving the batch you're working in.

Entry points to batch entry come from three places: the Gifts & Pledges hub (primary), the sidebar quick-add menu (for power users), and CSV/Excel import (for bulk migrations). All three converge on the same workspace, with provenance preserved so an auditor can trace where the batch originated.

---

## Key Design Decisions

### Decision 1 — Spreadsheet-style batch entry

**Why.** Finance staff already think in rows and columns. A grid reduces cognitive switching cost, supports keyboard-first input, and scales to 100+ rows without UI degradation.

**Alternatives explored.** A one-gift-per-screen form (rejected — too slow at volume, broke the scannability finance staff rely on for cross-row pattern recognition). A card-list layout (rejected — wasted vertical space, hard to spot outliers).

**Tradeoffs.** Hostile to narrow viewports. Mitigated with horizontal scroll inside the wrap, sticky table header so column titles stay visible during scroll, and a collapsible Accuracy rail that recovers ~270px of table width when not in active triage.

### Decision 2 — Inline validation (Accuracy Engine)

**Why.** Validation that arrives after posting is validation that arrives too late. The engine runs 27 rules across 5 categories (Identity, Amount, Duplicate, Fund/GL, Date) live as the user types.

**Benefits.** Errors are surfaced in 3 seconds, not 3 days. The right-rail panel groups exceptions by severity and offers one-click fixes for the common cases. Two sliders — Outlier threshold and Duplicate window — let each diocese tune the engine to its own volume profile.

**Tradeoffs.** A lot of visual hierarchy work. Three layers of signal had to coexist without overwhelming the grid. Solved with a consistent severity palette (rose/amber/blue for error/warning/info) and a subtle row-edge inset shadow that signals severity without occupying horizontal space.

### Decision 3 — Exception management via split posting

**Why.** When 92 of 100 gifts are clean and 8 are exceptions, the legacy product forced the team to fix all 8 before posting any of the 92. That blocks the 80% on the 20%.

**Benefits.** Two terminal actions — Post 8 clean gifts (green) and Post with exceptions (amber) — generate separate audit trail entries with separate signoffs. Clean gifts flow through immediately; exceptions get attached to a manager note and routed for review.

**Tradeoffs.** Slight UX cost of two primary buttons instead of one. Resolved by visual weight — the green Post button is the strong default, the amber Post with exceptions is recessed and labeled as the deliberate alternative.

### Decision 4 — Real-time reconciliation

**Why.** Discovering a $25 discrepancy at the end of the week means auditing every row. Discovering it as it happens means fixing the single row that introduced it.

**Benefits.** A Control Total field at the top of the workspace updates a live diff badge — "$25 short" or "Reconciled ✓" — as rows change. The badge becomes an actionable filter: clicking it isolates only rows that could be sourcing the discrepancy.

**Tradeoffs.** Required reworking the stats row layout to fit the reconciliation badge alongside the existing counts (total / gifts / clean / errors / warnings / info / by-fund). Resolved with a horizontal-scroll fallback for narrow viewports.

---

## Designing for Edge Cases

The happy path covers maybe 70% of weekly volume. The interesting design work lives in the edge cases.

- **Missing donor information** — Fuzzy autocomplete on every donor field, ranked by recency and gift size. If no match exists, an inline "Create new constituent" affordance opens a side-drawer so the user never loses their place in the batch.
- **Duplicate gifts** — Configurable 7–90 day rolling window. When a potential duplicate is detected, the warning includes a one-click "View original gift" link and an "Override — these are intentionally separate" action with a required note (preserved in the audit trail).
- **Invalid payment methods** — Cell-level error with a one-click suggestion ("Switch to Check — most common for this donor").
- **Fund/GL mismatches** — When a fund is selected, the GL code field auto-suggests the canonical pairing. Manual overrides require a reason note.
- **Posting failures** — The batch stays in the Validating state if any backend write fails; it never silently goes to Posted. The user sees the failed row highlighted with the specific error.
- **Stock and matching gifts** — Special row types with conditional fields. Matching gift detection runs after the donor and amount are confirmed, checks the donor's linked employer against a 4,200-program corporate match catalog, and surfaces the eligible amount inline.

---

## Design System & Scalability

Atlas runs on a tight, consistent set of design tokens that ship in every one of the 56 staff CRM screens plus the donor-facing portal.

**Tokens.** Navy / blue / green / amber / rose / teal / purple / gold semantic colors. Six text and surface shades. A 1.5px focus ring at 30% blue opacity across all interactive controls.

**Typography.** DM Sans for UI body and labels, DM Serif Display for serif headlines and numeric callouts, Lora for donor-facing communication where warmth matters more than density.

**Components.** Status pills (clean/error/warn/info/posted), severity dots (cell-level), validation chips (row-level), the Accuracy Engine right-rail panel (collapsible), the Batch Library popover (with Drafts/Folders/Templates sections + sticky search), the canonical sidebar (with the Atlas Pillar Mark logo), the post-footer summary bar, donor avatars, fund pills.

**Tables.** 12-column grid pattern with sticky `thead`, inline editors, row-edge severity shadow, expand-on-click signal drawer. Used across batch entry, gift ledger, pledge list, audit trail.

**Forms.** Single-column with 14px input height, label-on-top, 1.5px border that transitions to blue on focus, inline help text and validation messages, required-field asterisks in rose.

**Status indicators.** Consistent five-state model — Clean / Error / Warning / Info / Posted — used across the batch grid, the Accuracy panel, the Reports queue, and the donor-facing payment retry page.

**Accessibility.** WCAG 2.1 AA contrast across all severity colors verified, full keyboard path through the batch grid (Tab/Enter/Arrow/Ctrl+combinations), screen-reader announcements for new validation signals, focus management on inline drawers, and a 44×44px minimum touch target on every interactive element.

The result is that finance staff who learn batch entry can apply the same mental model to gift entry, pledge management, campaign review, and reports — no mode-switching cost.

---

## Final Solution

The shipped batch-entry workspace combines the design decisions above into a single dense but navigable surface.

**Top chrome — two bars, two scopes.** A Library bar provides cross-batch tools (Batch Library popover, Import, Accuracy settings, + New batch, + Template). A This-Batch bar shows the breadcrumb, draft status, autosave pulse, and per-batch actions (Columns, Save as template, Save to folder, Post). The two bars are visually distinct — one tinted on a light grey gradient, one white with a blue accent stripe — so users always know which scope they're operating in.

**Config strip.** Below the top chrome, six inline configs (Batch name, Default fund, Default type, Default date, GL code, Outlier threshold slider, Dup window slider) let finance staff set the conventions for the entire batch up front. Defaults flow into every new row.

**The grid.** Twelve columns — Row #, Donor (with mini giving-history sparkline), Date, Fund/Campaign, Type, Amount, Payment, Check/Ref #, GL, Note, Accuracy, Actions. Sticky `thead`. Row-edge severity shadow on coloured rows. Inline donor autocomplete fires on third keystroke. The Donor cell shows a small bar chart of the donor's prior gifts to the same fund — outliers are visually obvious.

**Accuracy Engine right rail.** Title with live counts (errors / warnings / info / clean). Severity-sorted list of every signal in the batch with one-click row jumps and inline fix actions. Collapsible to a 48px vertical strip with severity dots when more table width is needed; click any dot to re-expand.

**Sticky post-footer.** Always visible at the bottom of the viewport. Shows the summary ("8 clean · 3 errors · 2 warnings · 2 info"), Save as draft, Export CSV, Post with exceptions, and the primary Post 8 clean gifts CTA.

**The Batch Library popover.** Three labeled sections — Drafts (auto-collected from any in-progress batch), Folders (campaign-organised), Templates (reusable column layouts) — with a sticky search field at the top that filters all three.

Every decision here exists in service of one of the four principles: speed, context, immediacy, scale.

---

## Impact

### Qualitative outcomes from the pilot diocese

- Finance staff completed pilot batches **50–60% faster** than on the legacy product (timed task observation over four weekly cycles).
- Reconciliation moved from **2–3 days** to **3–4 hours** per cycle.
- Post-batch correction rate dropped meaningfully — the most common categories of error (duplicate gift, fund mismatch, missing GL) are now blocked at entry rather than fixed after posting.
- Onboarding time for a new finance hire dropped from **5–7 days** to **1–2 days**, primarily because the in-context validation does the teaching the training manual used to do.
- The pilot diocese signed off on Phase 2 expansion (Pledge module + Gala module) before Phase 1 GA.

### Stakeholder feedback

The finance director at the pilot diocese described the move from the legacy tool to Atlas as "the first time I've felt the software was working with me instead of around me." The Accuracy Engine in particular drew unprompted praise — staff who had previously distrusted automated validation reported relying on it heavily by week three.

---

## What I Learned

**Designing for operational users is a different discipline from consumer UX.** Operational users want density, not whitespace. They want shortcuts, not animations. They will trade aesthetic restraint for one fewer click every time. Several early designs that tested well in flat critique tested poorly with finance staff because they "felt slow."

**Exception handling deserves equal weight to the happy path.** A product that handles 80% of cases beautifully and 20% of cases poorly will be remembered for the 20%. Every edge case I documented in the workflow map got the same depth of design treatment as the primary flow, and that's where stakeholder confidence was built.

**Speed and accuracy are not opposing constraints.** Moving validation earlier — into the cell, at typing time — speeds entry rather than slowing it. The conventional intuition that adding checks adds friction is wrong; checks that arrive too late are friction, checks that arrive in time are tools.

**Audit-trail design is product design.** Financial software is read in two directions — forward by the operator, backward by the auditor. Every action needs a reason field, every override needs a note, every state transition needs a timestamp and an actor. Bake it in or pay for it later.

**Cross-screen consistency is operational consistency.** Standardising 56 staff screens on the same sidebar, the same severity palette, the same five-state status model meant that learning one screen meant learning all of them. The downstream training-time savings were larger than the upstream design effort.

---

## Next Steps

**Phase 2 (Q3–Q4 2026)** — AI-assisted donor matching for the autocomplete (improves the 5–10% of lookups that currently take more than one try), bulk correction workflows for generating reversing entries on already-posted batches, and a Pledge management module that shares the same grid pattern.

**Donor-facing expansion** — The payment retry redesign already shipped for the GiveCentral donor portal will get an empathic recurring-gift management module so donors can pause, resume, and update payment methods without leaving the portal. Early prototypes are tracking well in moderated usability sessions.

**Advanced reporting** — Drill-through dashboards over the posted-batch corpus. Finance directors will be able to slice gift volume by fund × campaign × time window × donor segment in a single view, with one-click export to the standard diocesan reporting templates.

**Multi-entity scoping** — Several pilot dioceses run Atlas across a Diocese / Catholic Charities / Foundation / Scholarship legal entity structure. Phase 3 work will harden the entity-scoping model so a Charities-only user never sees a Diocese gift, and vice versa, without losing the cross-entity rollup view that the development director needs.

---

*Designed by Gupesh Dhillon — Senior Product Designer, Nuclay Solutions · for GiveCentral.*
