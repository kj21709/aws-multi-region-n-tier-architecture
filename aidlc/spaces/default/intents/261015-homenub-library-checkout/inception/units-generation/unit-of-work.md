# Homenub Library — Units of Work


## Sources

This decomposition implements the approved [unit proposal](units-generation-questions.md) and [plan approval](decomposition-plan-questions.md), constrained by the [component catalogue](../domain-design/components.md), [domain ADRs](../domain-design/decisions.md) and [requirements](../requirements-analysis/requirements.md). The composed workflow produced no user-story artifact; FR1–FR14 are the coverage inputs. All work prepares local code, configuration and validation. No AWS access, deployment, DNS edits or spending is authorized.

## Unit Definitions

Unit names equal their construction directory names. These are code ownership/delivery boundaries within the existing N-tier application, not three new application services or a new stack per unit. The dependency graph is in [unit-of-work-dependency.md](unit-of-work-dependency.md); this document does not select economic priority or a Bolt sequence.

| Unit ID | Unit | Directory | Kind | Deployment Model | Complexity | Components |
|---|---|---|---|---|---|---|
| U1 | u1-library-checkout | u1-library-checkout | service | shared | L | BorrowerExperience, Circulation, SchemaLifecycle |
| U2 | u2-regional-recovery | u2-regional-recovery | service | standalone | XL | RecoveryControl |
| U3 | u3-release-preparation | u3-release-preparation | packaging | embedded | L | DeliveryPreparation |

“Shared” means U1's frontend, API and initializer are distinct artifacts within the retained application deployment; it does not combine them into a single process or grant shared privileges. “Standalone” means U2's separately executable recovery controls can be tested/released against an installed compatible U1; it still needs the declared provider contracts and configured infrastructure. “Embedded” means U3's scripts/buildspecs run in local/build tooling and have no always-on application runtime.

Complexity is relative, not a calendar estimate. U2 is XL because database-authority proof, loss assessment and recovery state transitions are the highest technical uncertainty. Grouping them preserves one accountable recovery owner rather than spreading one incident protocol across units.

## Component and Entity Allocation

| Component | Implementing Unit | Entities Owned by Component |
|---|---|---|
| BorrowerExperience | U1 / u1-library-checkout | CheckoutDraft |
| Circulation | U1 / u1-library-checkout | Book, Loan, CheckoutRequest, InventoryClearance |
| SchemaLifecycle | U1 / u1-library-checkout | SchemaRevision |
| RecoveryControl | U2 / u2-regional-recovery | RecoveryIncident, SafetyEvidence |
| DeliveryPreparation | U3 / u3-release-preparation | ReleaseManifest, DeploymentConfiguration |

Every component is assigned exactly once. Grouping does not transfer entity ownership: U2 requests clearance through Circulation, U3 requests explicit inventory import through Circulation, and setup DDL does not make SchemaLifecycle the owner of stock/loan rows. Regional replication is not a second owner. Legacy visitor fixtures remain compatibility data with no new public route.

## U1 — u1-library-checkout

**Kind:** service. **Deployment model:** shared. **Complexity:** L.

**Boundary and responsibilities:** deliver the complete borrower page → HTTP API → loan/inventory path, plus separately privileged initialization. Own catalog presentation, explicit isolated demo, browser/API validation, accessible loading/error/confirmation behavior, server UTC due dates, transactional stock/loan/request identity and current-authority inventory clearance. Preserve the original submitted payload/identifier on uncertain retries. Remove visitor geolocation/public lookup behavior. Keep private operational entry points distinct from public GET /books and POST /checkouts.

**Delivered artifacts:** plain App HTML/CSS/JavaScript; the borrower API and direct routing template; additive initializer and schema revision handling; explicit repeat-safe catalog import; U1's connection/writer-admission and quarantine adapters; basic local HTTP/startup helpers and application/schema/MySQL integration tests. The service tag does not exempt its frontend from interaction, responsive, keyboard, labels, focus and announcement checks.

**Owned existing source paths:** `App/`, `cfn/visitor-insert-lambda.yml`, `cfn/HTTP+API-v2-stack.yml`, `cfn/DBinit-lambda.yaml`. Any extracted executable/schema modules and U1 tests/local helpers must receive exclusive paths in its implementation plan. U2 consumes declared template outputs rather than editing these files for domain recovery. API custom-domain/mapping additions can live in U2-owned dedicated templates using U1's API/stage outputs; Contract/Infrastructure Design pins this arrangement before code changes.

**Integration contracts provided:** public catalog/checkout; private readiness, quarantine, reconciliation and explicit import; schema setup/version result; transaction-local writer/clearance admission; template/runtime/schema outputs. Contract Design fixes their shapes and failure semantics before implementation. U1 does not synchronously call the recovery controller. Its writer authority comes from verifiable database/configuration enforcement, not a controller-health response.

**Independent verification:** run a local HTTP path through the real handler against real MySQL and verify the persisted loan, due date, single decrement and identical retry. Connect the actual page to that local API for the integrated journey; a static demo or mocked SQL test alone cannot establish the result. Repeat setup on empty and legacy-fixture databases, inject precommit failure, race the last copy and duplicate IDs, reject payload conflict and validate public privacy/error boundaries. Readiness/quarantine contract tests include stale evidence, unknown scope and missing-history retry blocks.

**Initial integration:** a local database with explicit local configuration and no regional controller is sufficient to exercise the integrated checkout slice. Production-style authority/clearance defaults must remain closed when proof is absent; no unimplemented U2 call is replaced with an “allow” response. Initial schema authority verification works before library tables exist. No browser PII storage or reload-safe uncertain-checkout promise is added.

**Completion boundary:** demonstrate the library feature and its private extension points at the agreed contract. This is not acceptance of full regional recovery, generated production release packaging or launch readiness; U2/U3 and later authorized cloud evidence remain required.

## U2 — u2-regional-recovery

**Kind:** service. **Deployment model:** standalone. **Complexity:** XL.

**Boundary and responsibilities:** implement RecoveryControl and regional runtime infrastructure preparation. Own failure-signal correlation, durable incident/action decisions outside Virginia, abort/deadline/retry behavior, writer fence/drain and loss evidence adapters, promotion outcome inspection, routing eligibility, inventory reconciliation coordination, independent alerts and controlled failback/deployment-freeze eligibility. Static failure, API failure and ordinary Multi-AZ recovery must not cause unnecessary regional database promotion.

**Delivered artifacts:** recovery executable/control definitions; separately privileged regional adapters and state configuration; Ohio standby/domain/static-origin/runtime wiring; backup/restore verification and recovery fault-test assets; observable incident results without borrower payloads. Preserve primary us-east-1, secondary us-east-2, the VPC layout, existing DB sizing and replication structure, and current stack-name conventions. A demonstrated feasibility problem requires an explicit design tradeoff rather than silently changing those constraints.

**Owned existing source paths:** `cfn/main-stack.yml`, `cfn/rds+SCM.yml`, `cfn/s3+OAC+CF-stack.yml`; `cfn/vpc-stack.yml` only if a necessary approved recovery integration requires a change without altering its retained layout. Own newly introduced recovery/domain templates and recovery executable/test paths, pinned during detailed design. U1 owns its direct API/initializer templates. U2 pins stable regional API IDs/stages as inputs to dedicated custom-domain/mapping resources rather than creating a second editor for U1 files.

**Dependency:** U1's compatible private operations, authority/clearance enforcement and public checkout/readiness contracts. Use those operations, not direct backdoor updates to Circulation's tables. The release-manifest schema is a shared inception contract; U2 can validate controlled immutable fixtures without U3 implementation. At runtime, require the actual published manifest and parity checks before recovery readiness. A running release pipeline is not a dependency.

**Independent verification:** exercise the state machine with fault-injected adapters, including duplicate triggers, stale/unknown proof, lost action acknowledgements, abort before/after promotion, old-primary return and blocked alerting. Integration checks use real U1/MySQL for quarantine/reconciliation/transaction boundaries. Later authorized regional drills must prove actual SQL fencing/draining and acknowledged-history loss bounds, independent controls, public checkout/retry, backup restore and measured end-to-end timing.

**Safety acceptance:** require concrete old-writer fencing/draining and acceptable loss evidence before automatic promotion; a lock, DNS/ingress change or local readiness flag is insufficient. Missing or uncertain history quarantines all potentially affected books, globally if unknown. Evidence and clearance must bind to the current incident/writer; a stale replicated clearance cannot reopen the target. Synthetic checks before reopening cannot bypass quarantine on borrower inventory. All reconciliation delay counts against the 15-minute objective. Unknown proof blocks and alerts, with no automatic failback.

**Completion boundary:** executable recovery preparation and truthful local/MySQL evidence with cloud drill steps and unmet proof clearly identified. Unit-test success is not a claim of measured RTO/RPO, cloud fencing, restore success or universal automatic failover. No London migration/backfill/retirement procedure is added.

## U3 — u3-release-preparation

**Kind:** packaging. **Deployment model:** embedded. **Complexity:** L.

**Boundary and responsibilities:** implement DeliveryPreparation for complete reproducible artifacts, generated endpoint/domain/region configuration, corrected App casing, initialization-before-readiness choreography, regional parity, freeze/topology checks and integrated CI. Package U1/U2-owned local templates instead of stale fixed remote copies. Validate defaults and explicit overrides for Ohio across source, active setup documentation and rendered output. Reject missing/null inputs before any future upload/deployment step.

**Delivered artifacts:** buildspecs and packaging/configuration/check helpers; immutable release-manifest production; frontend generated-configuration production; complete artifact assertions; integrated test entry points/CI configuration; active setup, two-region estimate/capacity assumptions and verification/evidence documentation. Production inventory choice is explicit and invokes U1's repeat-safe import; no automatic demo seed or failure fallback. No always-on runtime or business-data model is introduced by the packaging kind.

**Owned existing source paths:** `buildspec/` and active root/`cfn/` setup guides, including `cfn/rds-readme.md`; newly introduced release tooling and integrated CI paths are pinned in its implementation plan. U1 owns App source/configuration consumption; U3 owns the generated configuration producer/output rules. U3 reads and packages U1/U2 templates without taking source ownership or making routine edits to them. Required changes discovered in another unit's owned file must return to its owner through the declared contract.

**Dependencies:** U1's source/templates, schema version and executable test/setup interfaces; U2's compatible recovery/runtime templates, readiness/freeze/topology interfaces and recovery test entry points. Consume these interfaces from the shared contracts rather than inferring them from implementation. Initial-deployment bootstrap must distinguish deliberately uninitialized infrastructure from missing/unknown recovery state after activation; missing evidence cannot silently mean “no freeze.”

**Independent verification:** prepare artifacts locally from deterministic fixture deployment outputs, verify App assets/local nested templates/initializer/runtime dependencies are included, validate generated configuration and manifest digests, reject missing/null/obsolete overrides, check optional DNS/certificate/hosted-zone inputs and preserve template identities. Run U1/U2 check entry points in integrated CI with unavailable real-MySQL/cloud checks visibly reported, not passed by substitution. Document the future authorized deployment sequence without executing it.

**Completion boundary:** locally validated deployable preparation covering both regions. A documented cost estimate must state pricing/workload assumptions and include DB/HA, NAT/networking, transfer/replication, backups, domain/DNS/certificates, monitoring/control and drills; no current dollar value, saving or fixed ceiling is assumed here. All launch inputs and future evidence remain visible.

## Cross-Unit Ownership and Handoff

| Concern | Implementation owner | Consumers / boundary |
|---|---|---|
| Public catalog/checkout and private Circulation operations | U1 | Browser within U1; U2/U3 use only contracted private operations with appropriate authority. |
| Schema definition, version ledger and initializer | U1 | U2 checks compatibility; U3 sequences initialization before readiness. |
| SQL session/credential writer enforcement | U1 for transaction/connection admission; U2 for old-writer fencing/drain coordination/adapters | Contract Design must pin a single coherent protocol, privileges and proof ownership; neither unit assumes a flag in the other proves fencing. |
| Current-incident stock quarantine/clearance | U1 | U2 submits authorized evidence and requests transitions; it does not own stock rows. |
| Regional infrastructure, domains, role/promotion state | U2 | U3 packages and checks actual topology/freeze compatibility before future deployment. |
| ReleaseManifest / DeploymentConfiguration | U3 | U1 consumes generated public config; U2 reads immutable published manifests using the pre-agreed schema. |
| Local application and recovery test helpers | U1 and U2 at distinct paths | U3 composes those entry points in integrated CI without rewriting their tests. |
| Complete artifacts, Ohio validation and active setup docs | U3 | Source default edits remain with each file's U1/U2 owner; all outputs are checked together. |

## Decomposition Decision

**Context:** one library application needs an integrated borrower path, privileged recovery and release tooling. The domain catalogue has five logical components, with a shared stock/loan/request invariant.

**Decision:** use the three approved units above. Keep U1's frontend/API/setup integration together while preserving separate executables and privilege identities; isolate incident control and packaging lifecycles.

**Consequences:** fewer cross-unit seams for the core borrower feature, but U1 is larger than a standalone frontend task. U2 retains substantial uncertainty and must prove safety rather than letting packaging make that claim. Separate units support focused tests and change ownership; they are not independently useful as a complete production release.

**Alternatives Rejected:** five units, one per component, would increase page/API/schema coordination without an independent release need; one all-inclusive unit would mix borrower, recovery and build lifecycles and privilege concerns. Both remain reversible later without splitting the checkout transaction.

**Security and Compliance:** grouping never merges runtime/setup/recovery SQL or IAM authority, exposes private operations publicly, or authorizes deployment. Keep borrower records private and apply the approved launch retention/operating policy once supplied. No new account, staff, return, email or London migration feature is introduced.

## Verification and Design Handoff

[unit-of-work-story-map.md](unit-of-work-story-map.md) assigns every FR and all NFR responsibilities. [traceability.json](traceability.json) uses one primary Unit ID per FR; supporting-unit work remains explicit in the map. “OK” means design assignment, not implementation completion.

Contract Design must pin public wire/error semantics, private authorization and evidence interfaces, initial writable-authority bootstrap, schema/template outputs, incident-bound clearance and release-manifest/configuration shapes before construction. Functional/NFR/Infrastructure Design must supply final schema, transaction and fencing/loss/reconciliation mechanics and negative tests. No entity types/constraints, cloud proof, final file extraction layout or test results are invented here.

## Assumptions & Open Questions

No unresolved business choice is needed for this decomposition. All domain/requirements decisions carry forward. Concrete fencing and acknowledged-history proof remain mandatory design/test obligations before automatic promotion can be accepted. If they cannot satisfy the retained architecture and selected objectives, present the explicit tradeoff rather than reduce safety or claim success.

Before launch, require catalog approval, retention/deletion policy, operating/alert ownership, domain/certificate/hosted-zone inputs, driver availability, two-region pricing and authorized recovery evidence. The user confirms no live environment; Ohio replaces active London references directly. Historical assessment/audit records may preserve prior references as provenance.
