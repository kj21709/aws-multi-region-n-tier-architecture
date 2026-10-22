# Homenub Library — Requirement-to-Unit Map

## Sources and Mapping Rules

Use the approved [requirements](../requirements-analysis/requirements.md), [component ownership](../domain-design/components.md), [unit definitions](unit-of-work.md) and [dependency DAG](unit-of-work-dependency.md). User Stories was skipped in this composed workflow; no US identifiers are invented. This file uses stable FR1–FR14 in place of story IDs and records one primary accountable Unit ID/directory per row. Supporting work is explicit and does not imply multiple entity owners.

“Assigned” or “OK” means planned ownership only. No implementation, database integration, browser audit, cloud recovery or deployment success is claimed.

## Functional Requirement Assignments

| Requirement ID | Required behavior | Unit ID | Directory | Cross-unit support |
|---|---|---|---|---|
| FR1 | Catalog titles, authors, availability and distinct empty/error states | U1 | u1-library-checkout | None; the provider and page are within U1. |
| FR2 | Explicit isolated local demo and repeat-safe owner-selected production stock | U1 | u1-library-checkout | U3 / u3-release-preparation carries explicit seed choice and invokes U1 import. |
| FR3 | One selected book, name/email, browser/API validation | U1 | u1-library-checkout | None; no accounts or verification are introduced. |
| FR4 | Persisted server UTC loan time, reference and 14-calendar-day due date | U1 | u1-library-checkout | None; the page renders the returned calendar date. |
| FR5 | Atomic stock decrement/loan persistence, rollback and last-copy concurrency | U1 | u1-library-checkout | U2 / u2-regional-recovery must preserve single-writer authority during recovery. |
| FR6 | Durable original-request retry and conflicting-payload rejection | U1 | u1-library-checkout | U2 / u2-regional-recovery handles lost history through quarantine/reconciliation, not a global exactly-once promise. |
| FR7 | Responsive cream/green UI, keyboard/focus/labels/status and safe recovery | U1 | u1-library-checkout | U2 / u2-regional-recovery provides contracted blocked/readiness state; U1 presents borrower-safe messages. |
| FR8 | Public GET /books and POST /checkouts without borrower/visitor lookup | U1 | u1-library-checkout | U2 / u2-regional-recovery configures regional stable-domain mappings to the contracted API outputs. |
| FR9 | Repeatable additive setup preserving legacy fixtures, version trigger and safe delete | U1 | u1-library-checkout | U3 / u3-release-preparation sequences initialization before readiness; U2 / u2-regional-recovery verifies standby schema parity. |
| FR10 | Complete local-template/App packaging and generated stable API configuration | U3 | u3-release-preparation | U1 / u1-library-checkout supplies config consumption/API/setup outputs; U2 / u2-regional-recovery supplies runtime/domain outputs. |
| FR11 | Virginia/Ohio standby and static/API endpoints with parity/readiness checks | U2 | u2-regional-recovery | U1 / u1-library-checkout supplies the full checkout/runtime checks; U3 / u3-release-preparation supplies complete compatible assets and manifests. |
| FR12 | Conditional safe automated recovery, quarantine and controlled failback/freeze | U2 | u2-regional-recovery | U1 / u1-library-checkout enforces current-authority clearance and transactions; U3 / u3-release-preparation respects freeze/promoted-topology eligibility. |
| FR13 | Direct Ohio replacement in active source, overrides, packages and setup docs | U3 | u3-release-preparation | U2 / u2-regional-recovery edits its regional defaults; U1 / u1-library-checkout edits any owned active region input. U3 validates all outputs; no migration work. |
| FR14 | Recovery/restore evidence, regional parity and future drill instructions | U2 | u2-regional-recovery | U1 / u1-library-checkout supplies real persistence/quarantine evidence; U3 / u3-release-preparation integrates checks and records evidence/setup inputs. |

## Non-Functional Requirement Assignments

| Requirement ID | Accountable Unit | Supporting units | Required evidence |
|---|---|---|---|
| NFR1 | U2 / u2-regional-recovery | U1 / u1-library-checkout public checkout; U3 / u3-release-preparation evidence integration | Authorized drill measures interruption through successful public Ohio checkout, including reconciliation/cache delay, against 15 minutes. Report misses. |
| NFR2 | U2 / u2-regional-recovery | U1 / u1-library-checkout history and stock admission | Prove acknowledged-history loss within five minutes; unknown evidence blocks automatic promotion; uncertain stock/history stays quarantined. |
| NFR3 | U1 / u1-library-checkout | U2 / u2-regional-recovery fencing and partition cases | Real MySQL last-copy/duplicate races and rollback; later real old-writer fence/drain/partition evidence. Never accept two writable regions. |
| NFR4 | U1 / u1-library-checkout borrower boundary; U2 / u2-regional-recovery privileged infrastructure | U3 / u3-release-preparation checks secure configuration/artifacts | Negative privacy/input/log tests; scoped SQL/IAM, private/TLS database, regional keys and OAC template/access checks. |
| NFR5 | U2 / u2-regional-recovery | U1 / u1-library-checkout redacted request references; U3 / u3-release-preparation operating inputs | Observable incident phases, independent blocked/failed/loss/target alerts and recoverable progress, with no borrower payloads. |
| NFR6 | U3 / u3-release-preparation | U2 / u2-regional-recovery capacity and control inputs; U1 / u1-library-checkout workload/connection measurements | Two-region estimate with all cost categories/pricing/workload assumptions; retain baseline sizing until measurement justifies changes. |
| NFR7 | U3 / u3-release-preparation integrates the six-pillar map | U1 / u1-library-checkout and U2 / u2-regional-recovery supply owned controls/evidence | Operational excellence, security, reliability, performance efficiency, cost optimization and sustainability each retain controls and evidence; no certification claim. |
| NFR8 | U3 / u3-release-preparation integrates CI/reporting | U1 / u1-library-checkout and U2 / u2-regional-recovery own repeatable checks | Standard strategy, stable requirement references and clear distinction between local/static, real-MySQL and future authorized cloud evidence. |

## Intra-Unit Implementation Prerequisites

These are technical prerequisites within each unit, not economic delivery priority or a selected order among units. Every checkout path must include validation, idempotency, authority/clearance and atomicity when introduced; do not build an intentionally unsafe intermediate lending path.

| Unit | Requirement groups | Local prerequisite / integration relationship |
|---|---|---|
| U1 / u1-library-checkout | FR9 supports FR1, FR3–FR6 and FR8 | Verified configuration and additive schema enable real catalog/loan SQL; initialization must be repeatable before persistence tests can assert state. |
| U1 / u1-library-checkout | FR3–FR6, FR8 and relevant FR12 support | Input, request identity, stock, loan/server date and clearance are one coherent checkout behavior with real MySQL concurrency/rollback/replay checks. |
| U1 / u1-library-checkout | FR1–FR4, FR6–FR7 | Page selection/form/status/confirmation integrate with the same public contract and actual local handler/database; accessibility and uncertain retry are part of this path. |
| U1 / u1-library-checkout | FR2 | Isolated demo fixtures/simulation and explicit production import are separately selected; neither substitutes for real persistence evidence. |
| U2 / u2-regional-recovery | FR11 and FR13 source contribution | Regional domain/runtime/credential/schema/asset inputs must be compatible before readiness can pass. |
| U2 / u2-regional-recovery | FR12 | Corroborated signals, exclusive incident actions, concrete fence/drain/loss proof and safe target state gate promotion; current-incident inventory clearance and full journey validation gate borrower reopening. |
| U2 / u2-regional-recovery | FR14 and NFR1–NFR5 | Fault/restore/old-primary-return and missing-history scenarios verify those transitions; authorized cloud drills provide the real regional proof and timing later. |
| U3 / u3-release-preparation | FR10 and FR13 | Complete source inventory, validated inputs/overrides and stable contract outputs enable generated configuration/manifests and deterministic packaging assertions. |
| U3 / u3-release-preparation | FR9, FR11–FR12, FR14 support | Setup/parity/freeze/topology/test entry points must have compatible contracts before integrated release sequencing/checks can pass. |
| U3 / u3-release-preparation | NFR6–NFR8 | Cost/capacity/retention assumptions, six-pillar evidence and integrated CI/reporting accompany the package; missing measurements stay visibly pending. |

## Cross-Cutting Integration Verification

| Scenario | Owning unit | Required collaboration / acceptance boundary |
|---|---|---|
| Last-copy race, precommit rollback and repeated request | U1 | Real MySQL, not mocked driver success. Full response/date/stock/loan checks. |
| Promoted target lacks acknowledged loan/request history | U2 | U1 rejects uncertain retry and all affected stock remains blocked; unknown scope blocks globally. Reconciliation clears only verified stock/history and its delay remains in RTO. |
| Old primary returns / stale browser or SQL session continues | U2 | U1 authority enforcement must cooperate with a proven SQL fence/drain protocol. DNS/disabled ingress is insufficient; no automatic failback. |
| Initial setup before schema exists | U1 | U3 passes explicit setup revision/inputs; independent writer verification cannot query an uncreated library ledger. |
| Manifest/configuration producer unavailable | U2 | Published compatible artifacts remain independently readable; missing or incompatible actual artifacts block readiness. U3 need not be running during recovery. |
| Promotion drift / deployment while recovering | U3 | U2 supplies actual incident/freeze/role compatibility; initial bootstrap and missing state after activation are distinguished. No routine deployment silently recreates the old replica role. |
| Ohio source/default/override/package inconsistency | U3 | File owners update their own defaults; package-wide validation rejects obsolete region targets, including active setup docs. |
| Public borrower data or privileged-operation exposure | U1 | U2/U3 integration must not add public loan/borrower lookup or publicly callable clearance/import/setup functions. |

## Coverage Verification

All fourteen functional requirements have one primary target in [traceability.json](traceability.json), matching the Unit ID and construction directory on the corresponding functional row above. All three units own primary requirements: U1 owns FR1–FR9, U2 owns FR11–FR12 and FR14, U3 owns FR10 and FR13. All five domain components are assigned once. All eight NFRs have accountable ownership and supporting evidence obligations.

Shared FR/NFR verification is tracked as supporting work, not fictitious completed coverage. In particular, local model tests cannot establish regional fencing or RTO/RPO; UI fixture preview cannot establish loan persistence; template validity cannot establish deployed domain, DNS or restore readiness.

## Assumptions & Open Questions

No additional business choice is introduced. Downstream designs must pin the interfaces and proof obligations identified in unit-of-work.md before claiming their implementation can pass. Launch inputs and future authorized cloud evidence remain outstanding exactly as recorded in requirements; this mapping does not authorize AWS access or revive London migration tasks.

