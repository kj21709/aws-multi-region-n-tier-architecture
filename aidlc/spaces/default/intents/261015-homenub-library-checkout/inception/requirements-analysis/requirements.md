# Homenub Library Requirements

## Intent Analysis

Provide a small library with a simple borrower-facing catalog and reliable checkout at `www.homenub.com`. Reuse the existing static frontend and AWS N-tier application while replacing visitor registration/geolocation with book availability and loans. Prepare deployable code and local verification; do not access AWS or deploy.

The approved recovery revision adds automatic disaster recovery from `us-east-1` to `us-east-2`. No live environment exists: replace active London/`eu-west-2` references with Ohio/`us-east-2` in code, deployment configuration and setup documentation for initial deployment. No London-to-Ohio migration, backfill, resource retirement or related migration/recovery runbook is required. The confirmed business targets are a 15-minute recovery time objective (RTO), a maximum 5-minute recovery point objective (RPO), and a two-region cost estimate before deployment with no hard monthly ceiling. Automatic promotion remains conditional on proven single-writer safety and acceptable data-loss evidence. These are objectives to demonstrate, not measured capabilities or an unconditional failover guarantee.

## Sources

| Tag | Authority / evidence |
|---|---|
| [desc] | Initial description: this intent's `project-description.json`, read through `aidlc engine workspace project-description`. |
| [plan] | User-approved Homenub Library Checkout implementation plan and prior user choices in the conversation. |
| [dr] | Exact user revision: "Make changes to the architecture to allow dissater recovery with automatic failover to US-East2 region instead of EU-West-2. Make sure the design follow AWS Well Architected framework"; revised assessment subsequently approved. |
| [setup] | User correction on 2026-10-19, recorded verbatim in [requirements-analysis-questions.md](requirements-analysis-questions.md): no live environment exists; replace London references with Ohio, without the proposed migration and related runbook. The revised summary also confirms inventory-reopening safety and documentation-link corrections. |
| [Q1] | Confirmed Q1 in [requirements-analysis-questions.md](requirements-analysis-questions.md): 15-minute recovery target. |
| [Q2] | Confirmed Q2 in the same file: up to 5 minutes of recent checkout-data loss, with reconciliation. |
| [Q3] | Confirmed Q3 in the same file: minimize additions and estimate before deployment; no fixed ceiling. |
| [baseline] | Space CodeKB: [business-overview.md](../../../../codekb/Avengers_Project/business-overview.md), [architecture.md](../../../../codekb/Avengers_Project/architecture.md), and [code-structure.md](../../../../codekb/Avengers_Project/code-structure.md). These distinguish existing source functionality from proposed library/recovery behavior; their London migration assumptions are superseded by [setup], not evidence of live infrastructure. |
| [method] | Active org and inception rules: testable acceptance criteria, preserved source traceability, and default test-after methodology with Standard test strategy. |

## Functional Requirements

All requirements below are Must Have for the prepared release. Acceptance criteria describe required evidence; they do not assert that tests or deployment have occurred.

### Borrower Experience

**FR1 — Catalog and availability.** Show each book's title, author and available-copy count. [desc] [plan]

- Given available and unavailable books, when the catalog loads, then each appears with its current count and only available books can be selected for checkout.
- Given an empty catalog or a failed request, then show a distinct empty or retryable-error state; never substitute demo inventory for failed production data.

**FR2 — Local demo preview.** Include clearly labeled sample books for explicit local preview, with production inventory loading/seeding kept separate. [plan]

- Given demo mode, then identify sample inventory and simulated checkout, without sending real borrower data to a production API.
- Given production configuration, then demo seeding is absent unless explicitly selected by the owner; repeated explicit seeding must not duplicate stock.

**FR3 — Checkout form.** Accept one selected book, borrower name and email, using self-reported information without accounts or email verification. [plan]

- Given a selected available book and valid required fields, then permit a checkout submission.
- Given missing/invalid fields, an unknown book, or non-object/malformed request data, then reject with useful field or request errors and make no loan or stock change. Validate in both browser and API; final field limits belong in the API contract.

**FR4 — Loan confirmation.** Return a non-guessable checkout reference, book information and a server-calculated due date 14 UTC calendar days after checkout. [desc] [plan]

- Given a successful checkout, then persist server time and the due date, and display the same reference/book/date returned by the server.
- Given a UTC date boundary or a client clock in another timezone, then the date remains the server-assigned calendar date; an API error must not display success.

**FR5 — Availability transaction.** Atomically persist a loan and decrement available stock once in the writable database. [desc] [plan]

- Given one remaining copy and concurrent different checkout requests, then exactly one succeeds, the other reports unavailability, and stock never becomes negative.
- Given failure before commit, then neither the loan nor stock update persists; an uncertain response after commit is resolved by FR6.

**FR6 — Durable retry identity.** Accept a client-generated checkout request identifier and store its association with the loan within the checkout transaction. [desc] [plan]

- Given repeated or concurrent identical requests whose history is retained, then return the same checkout reference/due date and decrement stock once.
- Given the same request identifier with different checkout details, then reject the conflict without altering the original loan.
- Given an uncertain timeout, then retain the identifier for retry. Cross-region loss of the loan and identifier is subject to FR12; do not claim global exactly-once behavior.

**FR7 — Responsive, accessible feedback.** Apply Homenub Library cream/green branding, readable book listings and an accessible form. [plan]

- Verify mobile and desktop layouts without clipped content, keyboard-only selection/submission, visible focus, programmatic labels and announced loading/error/confirmation states.
- Given pending submission or a failed API response, then prevent accidental duplicate actions, preserve recoverable input, and offer an understandable next step.

### API, Persistence and Delivery Preparation

**FR8 — Library API boundary.** Provide `GET /books` and `POST /checkouts`; return public catalog data and the submitter's checkout result without offering public borrower/loan lookup. [desc] [plan]

- Verify both routes dispatch by path and method, use JSON responses and documented success/error contracts, and reject unsupported operations.
- Visitor location/IP registration and lookup are removed from the new page; do not expose legacy visitor data through new library routes. No browser geolocation call remains. Legacy compatibility is tested with fixtures, not an assumed live database.

**FR9 — Repeatable additive initialization.** Add book and loan persistence through repeatable initialization that also preserves any legacy visitor rows supplied in compatibility tests. Correct database initializer configuration and order it before API readiness. No live database migration is required. [desc] [plan] [baseline] [setup]

- Given an empty database or one seeded with legacy visitor fixtures, when initialization runs repeatedly, then library tables/constraints exist, fixture rows remain unchanged, and no loan or stock is reset.
- Initialization runs only against the proven writable authority; standby receives compatible schema through the selected replication procedure. Delete handling must not drop user data.
- A schema-version input and deployment dependencies must make initialization run when needed, not rely on an unrelated code update alone.

**FR10 — Reproducible packaging and configuration.** Generate frontend API configuration from deployment inputs/outputs, correct `App/` casing, and package the edited local nested templates and required assets. [desc] [plan] [baseline]

- Verify packaged artifacts contain the complete frontend, corrected initializer and changed nested templates, with no reliance on stale fixed remote copies.
- Missing/null configuration must fail preparation before upload/deployment. The production browser uses the stable regional-recovery API address; it must not embed a developer's deployed API ID.

### Regional Disaster Recovery

**FR11 — Ohio standby and stable endpoints.** Prepare primary `us-east-1` and standby `us-east-2` infrastructure/configuration for the full checkout journey. [dr] [baseline]

- Prepare `www.homenub.com` with private S3/CloudFront dual-origin static recovery, and `api.homenub.com` with pre-provisioned regional API domains/certificates and readiness-controlled routing.
- Verify compatible assets, runtime dependencies, regional secrets/keys, schema and database readiness before declaring standby ready. A static failure must not trigger database promotion.
- Checkout POST recovery uses the API recovery path, not CloudFront static-origin failover. Account for DNS caches and clients still reaching the former primary.

**FR12 — Safe automated recovery.** Prepare multi-signal failure detection and an idempotent recovery workflow outside the primary region, with recorded incident state, bounded retries and an abort control. [dr] [baseline]

- Given sustained corroborated failure, a ready target, demonstrated old-writer fencing/draining, and sufficient evidence that loss is within NFR2, then automate promotion and writable-database checks. Before reopening borrower checkout, require the inventory clearance below and full checkout/retry validation; routing or a healthy endpoint alone cannot clear inventory quarantine.
- After a future failover with missing or uncertain loan/request history, quarantine all potentially affected stock until reconciliation proves availability and resolves uncertain request identifiers. If affected books cannot be identified reliably, block all borrower checkout until reconciliation is complete. Only verified unaffected or reconciled stock may reopen. During quarantine an uncertain retry must return a retryable unavailable result without creating a loan or decrementing stock. Count reconciliation delays against NFR1. [setup]
- A single failed request, an API-only failure, or a normal Multi-AZ recovery must not initiate unnecessary regional database promotion.
- If primary writer fencing/draining cannot be proved, or loss evidence is unknown/stale/excessive, then stop automatic promotion, keep writes unavailable where necessary and alert the incident owner. DNS changes, red health checks and disabled ingress alone are not accepted fence evidence.
- Given duplicate triggers, restarts or ambiguous promotion responses, then inspect/resume recorded state without blindly reissuing irreversible actions. Abort after promotion must never reactivate the old writer automatically.
- The concrete fence/verification protocol must be designed and tested before automatic database promotion can be accepted. Ordinary recovery targets do not waive this safety requirement.
- After a future Ohio promotion, keep the former writer out of service and do not fail back automatically. Preserve divergent data and reconcile checkout history before a controlled failback decision. Freeze routine deployments during recovery and reconcile the declared database role with the promoted topology before allowing normal updates. These are prospective recovery safety requirements, not London migration or resource-retirement work.

**FR13 — Ohio region configuration for initial deployment.** Replace active London/`eu-west-2` references with Ohio/`us-east-2` in application code, CloudFormation defaults, packaging/deployment configuration and setup instructions. No live environment exists, so do not prepare a London-to-Ohio migration or its migration/recovery runbook. [dr] [setup]

- Given the current source and build configuration, when the update is prepared, then secondary-region and replica-region values use `us-east-2`, the primary remains `us-east-1`, and active deployment/setup paths contain no London/`eu-west-2` target.
- Verify rendered/packaged configuration as well as source defaults so an override cannot silently restore the obsolete target. Check regional dependency/configuration consistency without calling AWS. Include active documentation and any newly added configuration in the check; historical assessment/audit records may retain references as provenance.
- No existing London resources or data are assumed. Migration, backfill, London resource retirement and a related migration/recovery runbook are outside this requirement.

**FR14 — Recoverability evidence.** Prepare backup/restore and regional parity checks, recovery monitoring and executable test instructions for future recovery drills. No live-environment or London migration runbook is required. [dr] [baseline] [setup]

- Cover separately retained recovery copies and restore validation; replication alone does not count as backup protection against corruption/deletion.
- Cover static-only failure, API failure, AZ recovery, regional loss, stale clients, in-flight transactions, concurrent triggers, stale/unknown lag, missing secret/schema/assets, interrupted promotion, abort and old-primary return.
- Verify the public journey and recorded loan/inventory, not merely a health endpoint. Record outage and recovery timestamps, loss/reconciliation evidence and unmet targets.
- Include an acknowledged checkout and its request identifier missing from the promoted database, followed by an uncertain retry: borrower checkout remains blocked for all potentially affected stock, or globally when the affected set is unknown, until reconciliation resolves availability and request history. Verify only cleared stock reopens and the entire delay is included in recovery timing.

## Non-Functional Requirements

**NFR1 — Recovery time.** Target RTO is **15 minutes** from checkout service interruption through a verified successful checkout via the stable public endpoint in Ohio, including detection, promotion, routing/cache propagation and validation. Measure in authorized recovery drills. Unsafe/unverified recovery may exceed the target; report it as a missed objective with cause, not as a silent exclusion. No claim of meeting this target is allowed before measurement. [Q1] [dr]

**NFR2 — Recovery point.** Target RPO is **at most 5 minutes** of recent checkout data. Assess acknowledged loan/request history, not just nominal replication lag. Unknown or insufficient evidence of this bound must block automatic promotion. Lost or uncertain acknowledgements require reconciliation: FR12's quarantine is mandatory until availability and request history are verified; when the affected set is unknown, all borrower checkout stays blocked. Real asynchronous-replication recovery evidence is required before claiming compliance; a last-known lag sample alone is insufficient. [Q2] [dr] [setup]

**NFR3 — Data integrity.** Use real MySQL transaction/uniqueness semantics for last-copy concurrency, rollback and retained-history idempotency. Verify using concurrent integration tests; mock-only success cannot demonstrate database locking or partition fencing. Never accept two writable regional authorities as successful recovery. [desc] [plan] [dr] [method]

**NFR4 — Privacy and security.** Keep databases private; scope runtime and recovery permissions; use TLS, appropriate encryption/key access, OAC on both static buckets, validated inputs and parameterized SQL. Do not expose credentials, raw SQL errors or borrower payloads in public responses/logs. Validate negative tests and template boundaries. New borrower records have no public lookup endpoint. Prepare secure configuration for initial deployment; no live-data encryption migration is required. [plan] [dr] [baseline] [setup]

**NFR5 — Observability.** Recovery status must distinguish detecting, blocked, promoting, validating, active and failed/aborted outcomes. Correlate actions by incident/request reference without borrower data; alert on blocked or failed recovery, lag/loss uncertainty and missed RTO/RPO. Pre-provision recovery operating access and its signal path outside the failed primary. Verify using injected failures and an authorized drill; live alert destinations are deployment inputs. [dr] [baseline]

**NFR6 — Cost and resource efficiency.** Minimize additions to the retained N-tier/RDS design and prepare a documented estimate for both regions before deployment. Include DB capacity/HA, NAT/networking, replication/transfer, backups, DNS/certificates, monitoring and recovery controls, with explicit workload/pricing assumptions. No fixed monthly ceiling or savings claim is accepted yet. Keep standby capacity/retention proportional to the validated recovery objective; do not invent load or availability guarantees. [Q3] [dr]

**NFR7 — Well-Architected traceability.** Map concrete design controls and verification to operational excellence, security, reliability, performance efficiency, cost optimization and sustainability. Carry the approved architecture's responsibilities and gaps into design/tests. Measure checkout latency/DB connection pressure at the selected workload before sizing changes; document capacity/retention choices. Mapping is not certification or a completed live-account assessment. [dr] [baseline]

**NFR8 — Verification and maintainability.** Provide repeatable local checks for library behavior, initialization and packaging, and CI execution appropriate to Standard test strategy. Retain stable requirement IDs through design, code and test evidence. Clearly distinguish local/static tests from real MySQL tests and future authorized cloud recovery drills; skipped or unavailable checks must remain visible. [plan] [method]

## Constraints and Delivery Boundary

- Reuse plain HTML/CSS/JavaScript, API Gateway, Python Lambda and MySQL RDS. Reuse source structure and compatible naming where helpful; there are no live stack/resource identities or visitor records to migrate. Keep additive initialization safe against legacy fixtures. Necessary architecture changes support the approved Ohio recovery direction.
- Preserve the original checkout-only release boundaries: no accounts/email verification, returns, renewals, reservations, fines, notifications or staff UI. Future recovery reconciliation is an operational safety procedure, not a newly introduced staff application.
- No live environment exists. FR13's direct Ohio configuration requirement supersedes migration/backfill/retirement assumptions in prior assessment documents; do not implement those obsolete London migration tasks.
- No AWS calls, resource creation, deployment, DNS edits or spending are authorized in this work. Prepare configuration and validation artifacts; cloud drill/deployment evidence requires a later authorized activity.
- Production catalog loading is explicit. Demo inventory must be replaced or expressly accepted before launch. A return capability is deferred, so this release has no borrower-facing way to replenish copies.
- RDS cross-region replication remains asynchronous. The 15-minute/5-minute objectives do not imply instantaneous promotion, zero lost acknowledged writes, or global exactly-once checkout.

## Verification and Traceability

| Requirement group | Required validation / later evidence |
|---|---|
| FR1–FR4, FR7 | Browser/API catalog, empty/failure, input and UTC-date cases; keyboard/status/mobile checks. |
| FR5–FR6, NFR3 | MySQL persistence, last-copy concurrency, rollback, duplicate/concurrent identifiers and payload conflicts. |
| FR8–FR10, NFR4, NFR8 | Route/method/JSON/negative tests; repeat initialization preserving visitor data; artifact and configuration assertions; template checks. |
| FR11–FR12, NFR1–NFR2, NFR5 | Local state-machine/fault tests plus later authorized real regional drill proving fencing, loss bounds, public checkout and recovery timing. |
| FR13 | Source, active setup documentation, template defaults, overrides and packaged outputs select Ohio; no active London target or London migration task. |
| FR14 | Recovery/restore and inventory-quarantine test instructions; later authorized recovery exercises and timing evidence. |
| NFR6–NFR7 | Two-region estimate with assumptions and six-pillar design/control/evidence mapping. |

Downstream design/unit/test references are not yet created. Map each permanent FR/NFR ID when those artifacts are produced; do not fabricate completed coverage or renumber IDs.

## Assumptions & Open Questions

- **Resolved business choices:** Q1–Q3 are confirmed; the earlier library choices and conditional recovery safety boundary are already approved. Do not re-ask them.
- **Design obligation, not a proven mechanism:** define and demonstrate the concrete SQL writer fencing/draining protocol and its behavior under partitions/lost acknowledgements before enabling automatic promotion. If retained RDS cannot meet the selected safety/recovery objectives, present an explicit design tradeoff before changing database architecture or relaxing a target.
- **Environment:** the user confirms no live environment exists. Historical endpoint examples and source resource names do not establish deployed resources or data. Future deployment inputs include hosted-zone/certificate identifiers, SQL driver availability, operating/alert contacts, production catalog and two-region pricing; readiness must reject missing required values.
- **Launch policies:** borrower-data retention/deletion and operational ownership must be documented before live borrower data is accepted. No retention duration, additional public endpoint or staff feature is silently introduced by this requirement set.
- **Validation boundary:** the workspace has no existing application suite. Local tests are part of implementation; no regional outage, restore, performance result, RTO or RPO has been demonstrated at this stage.
