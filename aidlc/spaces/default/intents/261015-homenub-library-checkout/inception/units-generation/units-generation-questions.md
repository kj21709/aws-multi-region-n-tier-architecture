# Homenub Library — Unit Decomposition Inputs

## Sources and Established Decisions

Use the approved [component catalogue](../domain-design/components.md), [ADRs](../domain-design/decisions.md), [requirements](../requirements-analysis/requirements.md) and confirmed questions in [Domain Design](../domain-design/domain-design-questions.md), [Requirements Analysis](../requirements-analysis/requirements-analysis-questions.md) and [Refined Mockups](../refined-mockups/refined-mockups-questions.md). Their choices are carried forward, not reopened. No stories artifact was produced by this composed workflow; map FR1–FR14 directly. Delivery Planning is outside the approved composed scope; this stage supplies dependency topology, not economic priority or a Bolt delivery sequence.

No new business input is needed to propose the grouping. The implementation granularity below is a technical proposal for confirmation, followed by this stage's separate Approve Plan / Revise Plan checkpoint. Detailed contracts and final schema/fencing mechanisms remain later design work. No application source, AWS resource or DNS change occurs in this stage.

## Decomposition Proposal and Alternatives

**Recommended — three delivery units, grouped by executable integration and privilege lifecycle.**

| ID | Construction directory / unit name | Kind | Components assigned | Relative complexity |
|---|---|---|---|---|
| U1 | u1-library-checkout | service | BorrowerExperience, Circulation, SchemaLifecycle | L |
| U2 | u2-regional-recovery | service | RecoveryControl | XL |
| U3 | u3-release-preparation | packaging | DeliveryPreparation | L |

U1 is an integrated application unit: its plain frontend, API executable, separately privileged initializer and shared library rules remain distinct artifacts in the existing N-tier deployment. The service kind reflects its authoritative backend behavior, not a merger into one process; its design must include the approved UI/accessibility behavior. The initializer keeps its own execution identity/SQL privileges despite sharing implementation ownership with the API. Do not create a separate physical stack for every unit or rename existing stacks.

U2 is the separately privileged recovery execution/control unit, using U1's contracted private operations and write/clearance checks. It also owns regional runtime infrastructure preparation and recovery/restore fault-test assets. U3 supplies reproducible build/distribution artifacts, generated configuration and cross-unit integration checks. These are code delivery boundaries, not a request for three new application services.

**Alternative — five units, one per logical component.** This makes every component separately tracked, but splits the page/API/schema integration and increases cross-unit coordination without a demonstrated independent release need. Later frontend or initializer extraction remains possible without changing Circulation's data ownership.

**Alternative — one all-inclusive unit.** This reduces handoffs but obscures the very different privilege/failure lifecycle and verification risks of borrower transactions, recovery control and release tooling. Splitting later is possible, with more coupling to undo. The three-unit option keeps a demonstrable borrower path while isolating recovery and release concerns.

## Dependency and Integration Proposal

- U1 has no dependency on another implementation unit. It supplies the real catalog/checkout path, repeatable schema initialization and private operational/write-admission extension points. Those extension points are pinned in Contract Design before implementation. It can run a real local HTTP → API → MySQL journey and page integration without a recovery controller or release pipeline; fixtures are used only for independent boundary tests, not as database-integrity proof. Basic local startup/verification helpers belong to U1.
- U2 depends on U1's catalog/checkout/readiness, inventory-quarantine/reconciliation and writer-admission contracts. It must use the real U1 integration path for integration tests; isolated state-machine tests may use adapters. U1 never synchronously invokes U2; SQL authority enforcement and incident-bound clearance cannot be replaced by a controller-health check.
- U3 depends on U1 and U2's published executable/schema/recovery interfaces. It packages and validates both. Runtime recovery reads published immutable release manifests; it does not invoke U3 or depend on a functioning build pipeline. The manifest schema is fixed in Contract Design so U2 can validate fixtures before U3's packaging implementation exists.
- All three dependencies are directed toward providers: U2 → U1, U3 → U1 and U3 → U2. There is no independent pair in this proposed DAG, so no parallel implementation claim or scheduling preference is made. This topology does not prescribe an economic build order or critical path.
- U1 is the root integrated slice if the applicable Construction policy requires a walking skeleton. Its demonstration includes the browser/HTTP/API/database integration and loan persistence, rather than a document-only or mock-only layer. U1 alone is not the complete two-region production release; all required units and safety checks are needed before launch. Final verification command and checkpoint behavior follow the applicable Construction policy.

## Proposed Source Ownership

- **U1:** App source; checkout/API/initializer executable code and their direct API/initializer templates; local integrated startup and borrower/schema/transaction tests. Connection/writer-admission and quarantine behavior stay here. It does not own the release pipeline or regional promotion logic.
- **U2:** recovery executable/state-machine/adapters; regional control and runtime infrastructure templates, including parent stack wiring, RDS/replication and static/API domain recovery configuration; recovery, restore and partition/fault test assets. It consumes U1's declared template outputs and never changes the initializer's internal schema logic. Detailed Infrastructure Design will pin exact paths before code work; preserve VPC layout, sizing and stack names.
- **U3:** buildspecs, packaging/configuration/region-validation helpers, generated-artifact rules, CI integration and active setup/cost/evidence documentation. It consumes the source templates owned by U1/U2 rather than assigning a second owner. U1's local test helper and U2's recovery tests remain executable inputs to the integrated checks. U3 validates Ohio defaults/overrides/outputs across the whole package; owners of source files make any required default edits in their own units.

## Ambiguity Analysis

Every approved component has exactly one implementing unit; grouping does not change entity ownership or privilege boundaries. The unit DAG follows the component call direction, with the passive manifest contract preventing a hidden runtime cycle. Initial writable-authority/bootstrap verification, stale-clearance rejection and SQL fencing/loss-proof interfaces must be pinned in Contract/Functional/NFR/Infrastructure Design; no public borrower operation may silently depend on an unimplemented recovery service. Existing no-live-environment and no-London-migration decisions remain unchanged. Region/domain/certificate/catalog/retention/alert inputs and measured RTO/RPO remain launch obligations rather than invented values or completed tests.

## Consolidated Summary Confirmation

- Define three units: U1 u1-library-checkout (service, L), U2 u2-regional-recovery (service, XL) and U3 u3-release-preparation (packaging, L).
- U1 groups the borrower page, transactional catalog/checkout and separately privileged additive initializer as a working integrated application slice. It preserves each logical component's entity ownership and does not introduce a frontend framework or public operational endpoints.
- U2 owns privileged recovery/control and regional runtime infrastructure preparation, consuming U1's private readiness/quarantine/reconciliation contracts. U3 owns complete artifacts, generated configuration, Ohio consistency, CI and deployment sequencing. Existing stack names, baseline VPC/DB sizing and replication structure are retained.
- Dependency topology is U2 → U1, U3 → U1 and U3 → U2, with no cycle. Runtime recovery consumes a published manifest contract, not the running delivery pipeline. This stage does not select economic priority, a critical path or a Bolt sequence.
- Map all fourteen functional requirements and eight NFRs to accountable units and cross-unit verification. Keep MySQL integration evidence distinct from mocks/static checks and future authorized cloud drills. No AWS access or deployment is authorized now.
- Produce unit definitions, dependency DAG with machine-readable unit kinds, requirement-to-unit map and traceability JSON. Detailed contracts and recovery proof mechanisms follow in their designated stages; safe promotion and inventory clearance are not treated as already implemented.

Does this all look correct before I generate the unit artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
