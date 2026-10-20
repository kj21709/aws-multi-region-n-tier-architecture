# Homenub Library Accessibility Checklist

## Target and Sources

Target WCAG 2.1 AA for the implemented borrower experience, as specified in the [confirmed design inputs](refined-mockups-questions.md), [requirements](../requirements-analysis/requirements.md) FR7/NFR4, [mockups](mockups.md) and [interaction specification](interaction-spec.md). This is an implementation verification checklist, not a certification or completed accessibility audit.

The 44-by-44 CSS px touch-target size is an additional design target; WCAG 2.1's 2.5.5 Target Size is Level AAA, not a claim that this size is a 2.1 AA requirement. [W3C target-size explanation](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html).

## Design Checks Completed

- [x] Defined native semantic controls, visible labels, heading hierarchy, skip link and focus destinations.
- [x] Specified text alongside availability/error colors and distinct loading/empty/error/recovery states.
- [x] Calculated the six intended contrast pairs recorded in [design-system-mapping.md](design-system-mapping.md).
- [x] Specified responsive reflow, long-text wrapping, reduced motion and persistent confirmation.

These checks concern the specification and source, not rendered behavior. No installed browser renderer was found for this pass; keyboard, screen-reader, browser-layout and automated accessibility execution remain unchecked below.

## Implementation Verification

| Check | Acceptance / method | State |
|---|---|---|
| Page semantics | English lang, viewport, one h1, logical h2/h3 order, landmarks and semantic catalog list. | Not executed |
| Skip navigation | First focusable link reaches main content without being hidden under overlays. | Not executed |
| Labels / instructions | Name and Email labels are programmatically associated; policy precedes submission; no placeholder-only labels. | Not executed |
| Keyboard | Tab order matches visual order; Enter/Space select; no trap; selected action focuses checkout heading; Change book/Browse books return to catalog appropriately. | Not executed |
| Focus visibility | Every active link/button/input has a visible outline; check all selected/error/recovery backgrounds. | Not executed |
| Errors | Specific visible messages linked by aria-describedby, invalid attributes only on invalid fields, first invalid receives focus after submit. | Not executed |
| Status | Selection/loading/completion changes announce once without reading the whole list; no required status is spinner-only. | Not executed |
| Pending / uncertain | Locked controls have a visible explanation; Retry checkout remains reachable when permitted; no duplicate-submit route or misleading cancellation. | Not executed |
| Availability | Zero stock and quarantine both have textual reasons; unknown stock is not announced as zero or available. | Not executed |
| Confirmation | Reference/date can be read and selected; heading focus works; result does not expire, hide needed information or falsely promise email. | Not executed |
| Contrast | Measure actual text/background pairs (at least 4.5:1 for ordinary text) and essential UI boundaries (3:1); no color-only signal. | Not executed |
| Zoom / reflow | Test 320/375/768/1024/1440 CSS px, breakpoint edges and 200%/400% zoom; no lost actions or horizontal page scrolling. | Not executed |
| Long / varied text | Test long titles/reference, apostrophes/Unicode names, long email/error text; wrap without clipping and retain native input behavior. | Not executed |
| Touch / motion | At least 44 px target dimensions and 8 px action gaps; no essential motion; reduced-motion preference honored. | Not executed |
| Assistive tech | Browser + screen reader exercise of catalog, fields, conflict, uncertain retry, success and full/partial recovery. | Not executed |
| Automated scan | Run an appropriate browser accessibility checker; manually evaluate what automation cannot determine. | Not executed |
| Privacy | No borrower input in URLs, browser storage, diagnostics or sample-confirmation output; hidden content not accidentally announced. | Not executed |

[W3C status-message guidance](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html) informs the announcement requirements. Exact role/live-region behavior must be tested to avoid silent changes or duplicate announcements.

## Handoff and Evidence

Implementation records browser versions, viewports, tools and results with the corresponding FR/NFR IDs. Resolve failures before claiming conformance. Backend concurrency, recovery fencing, inventory clearance, timing and data-loss objectives require separate integration/cloud evidence; accessibility checks cannot establish those properties.
