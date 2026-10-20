# Homenub Library — Refined Design Inputs

## Sources and Prior Answers

Use the approved [requirements](../requirements-analysis/requirements.md), including FR1–FR7 for the borrower journey and FR11–FR14 for safe recovery. The approved composed workflow folds rough mockups into this stage; no prior wireframes, user-flow or stories artifacts were produced. Design directly from requirements rather than inventing those missing artifacts. No live environment exists and no migration is required.

All business questions are resolved in the approved plan and requirements. There are no new unanswered business questions for this design pass. The visual answer below is carried forward from the user's earlier selection, not a new answer chosen by the designer. Remaining layout/component choices are design proposals for the confirmation below.

## Q1 — Visual Direction (Previously Answered)

Which visual direction applies to the library page? The user already selected the first option in the planning conversation; do not ask it again.

A. Warm neighborhood library (Recommended): cream background, dark green accents, readable book cards, Homenub Library branding.
B. Keep dark styling: adapt the existing purple gradient and glass cards.
C. Clean and minimal: white background, blue accents and compact listings.
X. Other (please specify)

[Answer]: A. Warm neighborhood library (Recommended)

## Established Product Decisions

- One borrower-facing page: browse titles/authors/copy counts, select one book, provide name/email, explicitly submit and receive a reference/book/due-date confirmation. No sign-in, cart, return, staff interface or email delivery.
- Server-assigned due date is 14 UTC calendar days after checkout; selecting a book does not reserve it. Inputs are self-reported, with browser and server validation.
- Explicit local demo data is labeled and isolated from production. A production failure never falls back to demo books.
- Retry uncertain submissions with the same request identifier and unchanged payload; do not claim a checkout succeeded without a confirmed server result.
- Show borrower-facing availability/maintenance feedback during future recovery, not AWS internals. Uncertain stock stays blocked until reconciliation; all checkout remains blocked when affected books cannot be identified reliably.
- Reuse HTML/CSS/JavaScript without a new frontend framework. This is design preparation only: no application source edits, AWS access, deployment or DNS changes at this stage.

## Consolidated Summary Confirmation

- **Visual direction:** Homenub Library on a warm cream background, white cards, dark green primary actions, serif headings and a system sans-serif body; use typographic book-cover tiles rather than external image/font dependencies.
- **Layout:** one page. At desktop widths of 1024 CSS pixels and above, a two-column book-card catalog sits beside a 360-pixel checkout panel inside a fluid container capped at 1200 pixels. Tablet uses two catalog columns with checkout below. Below 768 pixels, catalog and checkout stack in one column without fixed viewport height or hidden overflow. Test down to 320 pixels and at zoom.
- **Borrowing:** each available book has a clear Select book button and copy-count text; unavailable books remain visible with a reason. Selection shows the book in an inline checkout form with visible Name and Email labels and the 14-day loan policy. Selecting explicitly moves focus to the checkout heading; submission is a separate action and does not reserve stock in advance.
- **Form and confirmation:** validate on blur and submit, retain recoverable values on error, focus the first invalid field, and disable submission while processing. Confirmed success replaces the form with the reference, title and server-assigned calendar due date; it does not disappear automatically or claim an email was sent. A Browse books action clears completed borrower details and returns focus to the catalog.
- **Retry safety:** if a submission outcome is uncertain, lock the submitted book/details and offer a deliberate Retry checkout using the same request ID and payload. Do not offer a fresh checkout as an equivalent retry or automatically submit to another regional endpoint. Final API error/state contracts are defined in Contract Design.
- **States:** specify catalog loading, empty, failed/retry, selected book, pending checkout, field/server errors, last-copy conflict, uncertain outcome, confirmed result, demo, and full/partial recovery blocks. During recovery, show a plain temporary-unavailability message without regional names, recovery promises, SQL terms or configuration details. A failed catalog load must not show demo inventory as real availability.
- **Accessibility:** target WCAG 2.1 AA with native controls, a skip link and clear headings, keyboard operation, visible focus, text alongside status colors, inline error associations, live status announcements and reduced-motion support. Use at least 44-by-44-pixel touch targets as a design choice. Verify text/UI contrast from explicit tokens; full browser/assistive-technology conformance is a later implementation check, not a completed audit.
- **Design deliverables:** mockups for desktop/mobile and all meaningful states, component/interaction specifications, token/component mapping, and an accessibility verification checklist. Keep ordinary DR tests/safety from approved requirements; do not reintroduce London migration or a live-environment runbook.

Does this all look correct before I generate the design artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
