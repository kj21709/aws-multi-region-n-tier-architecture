# Homenub Library — Architecture Decisions

## Sources

These decisions implement the [confirmed domain proposal](domain-design-questions.md), [approved requirements](../requirements-analysis/requirements.md) and [component catalogue](components.md). The [observed architecture](../../../../codekb/Avengers_Project/architecture.md) identifies reusable code; its earlier migration assumptions are superseded. Domain decisions describe ownership and interactions, not hosting units, final schemas or proven failover mechanics.

## ADR-001: Keep checkout integrity in one Circulation boundary

**Context:** FR1 and FR3–FR6 require public availability and one-book checkout without accounts, atomic stock/loan changes and durable retry identity. The application is small; independent stock and loan ownership would put its most important invariant across boundaries.

**Decision:** Circulation owns Book, Loan, CheckoutRequest and InventoryClearance. Stock decrement, loan/server UTC due date and request association share one transaction. Catalog reads and checkout logic may use internal modules. Borrower details remain with the loan; the public catalog projection excludes them.

**Consequences:** Transaction ownership is clear and last-copy/duplicate races can be verified directly. Catalog and lending cannot independently change stock through separate writers. Circulation carries both read and write concerns, so internal modules must keep the public projection and privileged operational paths distinct. Logical entities need not map to separate tables.

**Alternatives Rejected:** (1) Separate Catalog stock owner and Lending loan owner: independent evolution is possible, but coordinating this checkout invariant adds complexity and failure states. Later extraction of read-only catalog projection remains possible. (2) One all-purpose application: fewer boundaries, but combines UI, borrower rules, DDL, recovery and build privileges/lifecycles.

**Security and Compliance:** Keep self-reported PII private, use validated/parameterized SQL and scoped runtime access, redact payloads/errors and omit public borrower lookup. Retention/deletion remains a documented launch-policy input; no identity verification or account record is implied.

## ADR-002: Separate transient borrower interaction from authoritative decisions

**Context:** FR2, FR3, FR4 and FR7 and the approved mockups require responsive accessible feedback, local preview and deliberate safe retry. Browser state cannot authorize stock changes or calculate the authoritative due date.

**Decision:** BorrowerExperience owns transient CheckoutDraft and reusable page UI pieces. It calls Circulation synchronously through the public boundary. An uncertain submission retains its original identifier/payload; confirmation displays server-returned values. Explicit demo mode is isolated from production transport/inventory.

**Consequences:** Interaction and accessibility can change independently of lending integrity. Browser validation improves feedback but must be repeated by Circulation. No browser PII persistence or page-reload recovery guarantee is added; closing an uncertain draft may require later operational assistance. Demo tests must never establish production readiness.

**Alternatives Rejected:** (1) Browser-owned lending/stock: cannot serialize concurrent borrowers or provide trusted time. (2) Server-only form feedback with an undifferentiated page: retains authoritative validation but misses the approved inline, focus and loading behavior and couples presentation to lending implementation.

**Security and Compliance:** Minimize transient PII, avoid credential/config-secret exposure and third-party geolocation collection, and never use a failed production response to enter demo mode. A confirmation reference is not authorization for public borrower lookup.

## ADR-003: Separate recovery coordination from transactional stock clearance

**Context:** FR11–FR12, FR14 and NFR1–NFR5 require conditional Ohio recovery and reconciliation after possible asynchronous history loss. Incident exclusivity, old-writer fencing and borrower stock clearance are different claims. Runtime recovery must not depend on the release pipeline.

**Decision:** RecoveryControl owns RecoveryIncident and SafetyEvidence and uses infrastructure adapters outside the primary. It calls private Circulation operations for quarantine, evidence-based reconciliation and readiness. Circulation owns/enforces InventoryClearance alongside checkout; it does not call RecoveryControl. Evidence references and immutable published manifests are data links, not reverse calls. Unknown affected stock means global quarantine. Promotion requires concrete proven fencing/draining and loss evidence; reopening additionally requires current-incident clearance and public checkout/retry validation. No automatic failback.

**Consequences:** The graph stays acyclic and recovery progress outlives HTTP requests. Clearance can be enforced where stock changes, while privileged coordination remains isolated. Detailed design must prevent stale replicated clearance from authorizing a new writer and serialize clearance changes with checkout. Safety may extend downtime beyond the 15-minute target; all delay remains measured. The current domain design does not solve or demonstrate SQL fencing or at-most-five-minute loss proof.

**Alternatives Rejected:** (1) Browser/DNS/ingress-only recovery: simple routing does not prove old SQL writes are fenced or inventory reconciled. (2) Put recovery in DeliveryPreparation: reuses tooling but couples outage response to the pipeline and its credentials/availability. (3) Make Circulation synchronously call RecoveryControl on every checkout: adds a runtime dependency and a cycle with recovery verification; it also does not itself supply a database fence.

**Security and Compliance:** Private operational functions require distinct authorization, not public routes or a staff UI. Incident/evidence records contain references and redacted results rather than borrower payloads. A recovery lock/local gate cannot substitute for SQL authority. Ordinary deployment remains frozen until actual promoted roles are reconciled; abort cannot silently reactivate the former writer.

## ADR-004: Separate additive schema setup from release preparation and runtime

**Context:** FR9–FR10 and FR13 require a repeatable corrected initializer, complete local packaging, generated endpoints and direct Ohio configuration. No live environment exists. The existing initializer and delivery files are reusable but do not provide the required sequencing/configuration.

**Decision:** SchemaLifecycle owns SchemaRevision and verified additive initialization. DeliveryPreparation owns ReleaseManifest/DeploymentConfiguration, invokes setup before readiness, packages the local App/templates and validates stable domains/Ohio inputs and release parity. Circulation owns explicit repeat-safe inventory import. Recovery reads published manifests independently. Keep existing stack-name conventions and baseline sizing/replication; directly replace obsolete active regional configuration, without London migration work.

**Consequences:** Setup privileges are absent from borrower processing, and schema-version changes can trigger verification intentionally. Partial DDL must be inspected/resumed rather than assumed to roll back transactionally. Initial writable-authority verification cannot depend on not-yet-created library tables. Delivery has cross-component coordination, but runtime checkout/recovery does not invoke it. No implicit sample seed, stock reset or destructive delete behavior is allowed.

**Alternatives Rejected:** (1) Runtime auto-create/seed on the first checkout: makes requests depend on setup privileges and risks resets or race conditions. (2) Unversioned one-time SQL plus hardcoded remote templates/endpoints: initially simple, but cannot reliably repeat initialization, package edited nested sources or validate configuration parity. (3) Embed schema setup and stock ownership inside build tooling: obscures business-data ownership and makes safe import/retry rules harder to reuse/test.

**Security and Compliance:** Separate setup/runtime/recovery credentials; reject missing configuration without logging secrets. No deployment, AWS access, DNS change or spending is authorized by these decisions. Catalog acceptance and borrower retention/deletion/operating ownership must be settled before live borrower data is accepted.

## Downstream Handoff

Units Generation chooses deployable grouping using these five components. Contract Design pins public and private operation boundaries, readiness/error semantics and evidence interfaces. Functional Design specifies entity types/constraints and transaction/reconciliation behavior; NFR and Infrastructure Design select and verify enforcement/adapters, privileges, independent recovery controls, parity and cost/capacity assumptions. Their acceptance must preserve all safety obligations rather than treating this logical design as proof of recovery.

