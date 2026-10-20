# Homenub Library Interaction Specification

## Sources and Data Boundaries

Implements the UI behavior of [requirements](../requirements-analysis/requirements.md) FR1–FR8 and FR11–FR14, consistent with [confirmed inputs](refined-mockups-questions.md) and [mockups](mockups.md). Logical view inputs below describe presentation needs, not new public API wire names. Contract Design will pin JSON shapes, field limits, error codes and readiness signals.

Treat remote text as data and render through text nodes. Accept nonnegative integer availability only after validating API data. Missing/malformed counts or unverified checkout eligibility cannot enable checkout. Never derive recovery clearance from a successful static-page load, DNS selection or copy count alone. No browser geolocation, public borrower lookup or external-font/image dependency is needed.

## Catalog and Book Card

| Field | Value |
|---|---|
| Component | Catalog / Book card |
| Description | Discover and select one eligible book. |
| Category | Display / action |

| Input | Logical type | Required | Default / behavior |
|---|---|---|---|
| Catalog | Collection of book presentation records | Yes | Loading until authoritative response; empty is distinct from failure. |
| Book | ID, title, author, available count, checkout eligibility | Yes | Contract validates data; unknown eligibility is blocked. |
| Selection | One book ID or none | No | None. No stock reservation is implied. |
| Recovery status | Verified available, partial block, global block, or unknown | Yes | Unknown cannot authorize checkout. |

| State | Trigger and behavior |
|---|---|
| Default / hover | Readable metadata; native Select book button; hover changes decoration only. |
| Focus | Strong visible outline on action; native Enter/Space activation. |
| Selected | Text label and outline; selection changes focus to checkout heading after explicit action. |
| Disabled | Zero stock, blocked stock, invalid record, pending/uncertain checkout or global write block; visible explanatory text. |
| Loading / error / empty | Text descriptions and applicable Retry loading button; no dummy records presented as real. |

Desktop/tablet use two catalog columns; mobile uses one compact cover/text card. Use a semantic list with card headings; decorative covers have no duplicate accessible name. Tab follows catalog buttons in DOM order. Change book returns focus to the previous selection's catalog action when possible, otherwise the catalog heading. Do not steal focus during a background count refresh.

Usage: valid catalog response → render cards → explicit selection → announce selection and focus checkout heading. Stock can still change before the server transaction; handle that conflict explicitly.

## Checkout Form and Submission Action

| Field | Value |
|---|---|
| Component | Checkout form |
| Description | Record one selected book with self-reported borrower name/email. |
| Category | Input / action |

| Input | Logical type | Required | Default / behavior |
|---|---|---|---|
| Selected book | Valid eligible book record | Yes | Show non-submitting helper when absent. |
| Name | Text | Yes | Empty; visible label and name autocomplete; no ASCII-only restriction. |
| Email | Email text | Yes | Empty; email input/autocomplete; no verification claim. |
| Loan policy | Display text | Yes | One book, due 14 days after checkout; no client-selected due date. |
| Request identity | Unique client value per new logical submission | On submit | Capture once with payload; reuse on uncertain retries. |

| State | Trigger and behavior |
|---|---|
| Default | Editable before submission; explicit Check out book action. |
| Hover / focus | Native controls and visible focus; no layout movement. |
| Invalid | On blur or submit, associate specific text errors with fields; mark invalid fields; focus first invalid on submit. |
| Disabled | No eligible book or write block; keep reason visible. Pending disables all mutation actions. |
| Loading | Checking out… label and busy state; prevent repeated event submission. |
| Definite failure | Restore appropriate editing only when the API establishes no committed loan. Keep valid fields. |
| Uncertain | Lock submitted payload; expose only a same-ID Retry checkout action for resubmission. |

Use a native form and labels linked by for/id; email type, required flags, aria-describedby for hints/errors, aria-invalid only when applicable. Permit submitting incomplete editable fields to discover errors; do not create a disabled-button dead end with no explanation. Normal invalid fields never become checkout requests. Disable submission for operational/pending conditions rather than hiding it.

On mobile/tablet the panel is below catalog; explicit selection scrolls/focuses its heading without animation under reduced-motion preference. Keep card/form content in normal flow; no modal or focus trap. Before submission Change book is allowed. After an uncertain result, no misleading Cancel/Start again action may imply that an already committed loan was cancelled.

Borrower values remain in memory for the active form only. Do not persist them to local/session storage or URLs. This UI specification does not promise recovery of an interrupted checkout after closing/reloading the page; if that capability becomes required, resolve its privacy and API design before adding storage or lookup. An in-page uncertain retry preserves the original identifier and payload.

## Feedback, Recovery Banner and Confirmation

| Field | Value |
|---|---|
| Component | Inline feedback / confirmation |
| Description | Explain outcomes without exposing internals or inventing success. |
| Category | Feedback / display |

| State | Trigger and behavior |
|---|---|
| Status | Polite live region announces loading, selected book or confirmed progress once per meaningful change. |
| Error | Field-specific errors near fields; form-wide unexpected/unavailable error has a clear heading and action. |
| Recovery block | Show plain temporary-unavailability copy; suppress checkout permission until backend-proven clearance. Unknown affected stock blocks all checkout. |
| Confirmation | Show server-result reference, title and calendar due date; move focus to confirmation heading and keep result visible until explicit navigation. |

Inputs: semantic result/error class, server confirmation data, eligibility/clearance and selected book. Default no outcome is success. Validate the server result before showing confirmation. Render a YYYY-MM-DD-style calendar date without changing its day through local timezone conversion; the exact wire representation belongs to Contract Design. References wrap at narrow widths and remain selectable; do not assume a short identifier format.

Banner and confirmation use full-width normal flow at every breakpoint. Native Retry loading, Retry checkout, Check availability and Browse books buttons have descriptive labels and visible focus. A status region must not repeatedly announce an entire catalog; focus movement and announcements must avoid redundant long readings.

The confirmed result does not repeat name/email unnecessarily, auto-dismiss, claim email delivery, expose an account-history link, or offer returns. Browse books clears the completed form's personal values and selection and focuses the catalog heading.

## Transition and Failure Rules

| From / event | Next state and invariant |
|---|---|
| Catalog loading → data / error | Populated/empty or retryable catalog error; production failure never selects demo. |
| Eligible book selected | Editing form; copy count is advisory until transaction succeeds. |
| Valid form submitted | Snapshot payload + request ID; pending; exactly one in-flight action. |
| Confirmed success / replay | Same server reference/date; refresh availability; no second stock decrement. |
| Confirmed field or unavailability failure | Show correction or choose-another-book action; do not confuse with unknown commit outcome. |
| Timeout / malformed result / unclassified failure | Uncertain; keep snapshot and same request ID, no automatic new POST or changed regional endpoint. |
| Same-ID retry pending | Keep payload locked; re-use identity; a returned original confirmation resolves uncertainty. |
| Recovery begins during pending/uncertain state | Keep request snapshot while showing block; checking readiness does not submit a checkout or silently discard identity. |
| Missing/uncertain history after failover | Show unavailable for all potentially affected inventory; unknown affected set blocks all checkout, including uncertain retry creation, until reconciliation clears it. |
| Clearance permits retry | Only explicit same-ID retry of original payload; reopening is not an automatic submission. |
| Definitive request-details conflict | Preserve original details and display conflict guidance; no silent new request ID. |

Backend integrity remains authoritative (FR5–FR6, FR12, NFR2–NFR3). UI disabling is error prevention, not a transaction lock or write fence. Recovery timing includes quarantine/reconciliation; no UI timer promises the selected RTO.

## Handoff Checks

Verify all states from [mockups](mockups.md), including server rejection after apparent availability, invalid Unicode-containing names, long references, repeated submit activation, no-body/malformed responses, unknown commit, recovery during retry and cleared/un-cleared inventory. Browser refresh/closed-page recovery is explicitly not claimed. See [accessibility checklist](accessibility-checklist.md) for focus/reflow/announcement verification.
