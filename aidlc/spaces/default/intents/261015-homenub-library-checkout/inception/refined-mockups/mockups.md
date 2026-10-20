# Homenub Library Mockups

## Design Intent and Sources

Use a warm neighborhood-library style for the approved borrower journey: browse, select one book, enter name/email, submit, and retain the checkout reference and server-assigned due date. Source: [approved requirements](../requirements-analysis/requirements.md), especially FR1–FR7, FR11–FR14 and NFR3–NFR4; [confirmed design inputs](refined-mockups-questions.md). Rough mockups and user stories were skipped by the composed workflow; no missing upstream artifact is being treated as existing.

The application is not deployed. Ohio configuration replaces active London configuration in implementation; no region migration UI, technical recovery dashboard, staff UI, sign-in, cart, returns or email-delivery feature is introduced.

## Visual Preview

Open [preview.html](preview.html) locally. It is a standalone design artifact with a labeled scenario selector, sample books, sample borrower fields and simulated outcomes. It has no network requests, storage or backend connection. The preview toolbar is outside the product design and is never shipped as a production control. Adjust the browser width to inspect mobile/tablet/desktop reflow. This preview illustrates appearance and transitions; it does not verify the final API, database or recovery system.

The initial populated view shows the library header, a compact loan-policy introduction, two columns of typographic book cards, and an unselected checkout panel. Available cards show title, author, count and Select book. A zero-stock card says Unavailable with a disabled action; status text is always present alongside color. Selecting shows a green outline and Selected text, updates the adjacent checkout panel, and moves focus to its heading. Book-cover tiles are decorative; authoritative titles/authors are readable HTML beside them.

Demo examples: Pride and Prejudice / Jane Austen (2 copies), The Secret Garden / Frances Hodgson Burnett (1), The Wind in the Willows / Kenneth Grahame (0), Little Women / Louisa May Alcott (3). These numbers and titles are illustrative, not production inventory. The confirmation date/reference in the preview are fixtures, not a client-computed due-date policy or a production identifier format.

## Responsive Screens

| View | Composition and behavior |
|---|---|
| Desktop, at least 1024 CSS px | Fluid container capped at 1200 px; two-column catalog beside a 360 px checkout panel with 32 px separation. The panel remains in normal document flow, so long content and zoom cannot be trapped behind a sticky viewport. |
| Tablet, 768–1023 px | Two catalog columns; checkout follows at full width. Select book explicitly scrolls/focuses the checkout heading so the form is discoverable below the list. |
| Mobile, below 768 px | Single-column book cards and checkout; cards use a compact cover beside text. No sideways carousel or hidden overflow. Minimum design viewport 320 px. |
| Zoom / long text | Reflow to the effective CSS width; wrap long titles, names, error text and references without truncating essential information. No fixed body height. |

The header contains Homenub Library and a Browse books anchor. The main heading is Find your next read. Catalog and checkout have second-level headings; book titles have third-level headings. Only local demo mode shows the persistent Sample library banner.

## Screen-State Specifications

| State | What the borrower sees | Action and resulting state | Requirement |
|---|---|---|---|
| Catalog loading | Static placeholders and Loading books text; catalog busy; no stale active action. | Wait or, on failure, use Retry loading. | FR1, FR7 |
| Empty catalog | No books are listed yet. Please check back soon. | No invented Add book or staff workflow. | FR1 |
| Catalog failed | We couldn't load the books. Please try again. | Retry loading retrieves production catalog; never substitutes sample data. | FR1–FR2 |
| Populated, unselected | Available copy counts, unavailable labels, Choose a book to get started in panel. | Select book updates panel; selecting does not reserve a copy. | FR1, FR3 |
| Book selected | Selected book title/author, 14-day loan policy, Name and Email fields, Check out book. | Explicit submit validates; Change book goes back to catalog before any submission. | FR3–FR4 |
| Invalid fields | Specific messages directly under fields; first invalid field receives focus. | Correct details; blur/submit revalidates without discarding other input. | FR3, FR7 |
| Checkout pending | Checking out… text; submitted book/details and actions locked; no claim of success. | Await a confirmed result. No spinner-only communication. | FR5–FR7 |
| Copy lost to another borrower | This book is no longer available. Please choose another. | Refresh authoritative catalog and release selection only after a definite unavailability result. | FR1, FR5 |
| Definite failure without commit | We couldn't complete the checkout. Please try again. | Re-enable appropriate correction/retry based on the documented API result. Do not classify a timeout as definite failure. | FR3, FR6 |
| Outcome uncertain | We haven't confirmed your checkout yet. Retry this checkout to check the result. | Retry checkout uses the locked original payload and request ID. No new checkout, cancellation claim or automatic regional POST replay. | FR6 |
| Request-details conflict | We couldn't confirm these checkout details. Keep your original checkout details and retry. | Preserve original submission; do not generate another request ID to conceal a conflict. Exact safe recovery mapping is completed in Contract Design. | FR6, FR8 |
| Confirmed | Checkout complete, book title, reference, Due date, and Keep this reference. | Browse books clears completed borrower details and focuses catalog. Result does not auto-dismiss or say email sent. | FR4, FR7 |
| All checkout blocked | Checkout is temporarily unavailable. Please try again later. Existing catalog may remain with Availability may have changed text. | Disable selection/submit and offer Check availability. Preserve uncertain in-flight request identity. No promised recovery ETA. | FR11–FR12, NFR2 |
| Some stock blocked | Affected cards say Checking availability instead of an asserted count; selected affected book cannot submit. | Only backend-cleared unaffected/reconciled stock can be selected. Unknown affected set blocks all checkout. | FR12, NFR2 |
| Demo | Persistent Sample library — no checkout is recorded banner; illustrative confirmation is labeled. | Simulate locally; never contact the production API. | FR2 |

Maintenance copy never exposes AWS regions, database roles, SQL errors, infrastructure configuration or the 15-minute recovery objective. Those details do not help a borrower decide what to do and the objective is not a promised outage duration.

## Boundaries and Verification

The [interaction specification](interaction-spec.md) owns retry/focus/state behavior, [design-system mapping](design-system-mapping.md) owns visual tokens, and [accessibility checklist](accessibility-checklist.md) owns verification. This stage supplies a visual/behavioral design, not a measured production accessibility or disaster-recovery result.

Required later checks include 320/375/768/1024/1440 px, 200%/400% zoom, long text, keyboard and screen-reader status behavior, all listed states, concurrent last-copy conflict, same-ID uncertain retries and inventory quarantine. There is no installed browser renderer in the workspace tooling discovered for this pass; browser execution and screenshot validation are not claimed.

Source checks passed: HTML tag nesting and 11 unique static element IDs, 14 preview-state options, no external resource/network/storage use in the preview, 22 local Markdown-link instances resolving, and inline JavaScript syntax compilation. Dynamic DOM layout and event behavior were not executed in a browser. These checks do not replace the handoff checks above.
