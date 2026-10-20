# Homenub Library — Domain Design Inputs

## Sources and Established Decisions

The approved [requirements](../requirements-analysis/requirements.md) and [interaction specification](../refined-mockups/interaction-spec.md) establish the borrower journey, durable checkout retries, additive initialization and conditional Virginia-to-Ohio recovery. Prior questions in Requirements Analysis and Refined Mockups were read; no business question is reopened here. There is no live environment, no London migration and no authorization to access AWS or deploy.

The [observed architecture](../../../../codekb/Avengers_Project/architecture.md) and [component inventory](../../../../codekb/Avengers_Project/component-inventory.md) describe reusable visitor-page, handler, initializer and delivery code. Their historical migration assumptions are superseded by the approved requirements. The following is a proposed logical decomposition, not a deployment topology or an implementation claim.

## Proposed Boundaries and Alternatives

**Recommended — five cohesive building blocks.** BorrowerExperience owns page interaction; Circulation owns catalog, stock, loans and checkout request history; SchemaLifecycle owns additive schema setup; RecoveryControl owns recovery decisions and evidence; DeliveryPreparation owns packaging/configuration/parity checks and deployment sequencing. Catalog and checkout can use separate internal modules while remaining one business ownership boundary. These blocks need not become five deployable services.

**Alternative — separate Catalog and Lending ownership.** This allows independent catalog evolution, but splitting ownership of availability from loan creation would complicate the one-transaction stock/loan/request invariant. Reversible later by extracting public catalog reads while retaining one inventory writer. Not recommended for this small application.

**Alternative — one all-purpose application component.** Fewer named boundaries initially, but page state, schema privileges, borrower processing, privileged recovery and build tooling have different lifecycles and security constraints. Reversible by later extraction, with more coupling to undo. Not recommended.

The recommendation remains a proposal until the confirmation below; the resulting artifacts and ADRs will record the selected boundary rationale.

## Ownership and Interaction Proposal

- **BorrowerExperience:** transient selected book, borrower input, submitted payload/request identifier and visible page state. Uses Circulation's public catalog/checkout boundary. No persisted borrower profile; no borrower-record lookup. Explicit local demo uses isolated fixtures and never production fallback. UI pieces are catalog, book card, checkout form, confirmation and status feedback, without independent domain ownership.
- **Circulation:** owns Book, Loan, CheckoutRequest and InventoryClearance. One transaction protects stock decrement, persisted loan/server date and durable request identity. Loan contains the self-reported borrower details; no separate borrower-account entity. InventoryClearance records whether stock can safely be checked out after uncertain recovery. Recovery quarantine also blocks uncertain retries; default to all stock blocked when the affected set is unknown. Public catalog projection never includes borrower/request payloads.
- **SchemaLifecycle:** owns SchemaRevision, describing completed initialization, not library stock or borrower data. Uses a database adapter only after writable-authority verification. Repeated setup preserves visitor fixtures, existing loans and stock; demo seeding remains a separate explicit action. Delete handling does not delete data. Detailed DDL and constraints come later.
- **RecoveryControl:** owns RecoveryIncident and SafetyEvidence. Calls Circulation's private operational boundary for quarantine, reconciliation evidence and checkout/readiness verification. Uses infrastructure adapters for fencing/draining, loss assessment, promotion, routing, signals and backup/restore checks. These adapters are dependencies rather than additional domain components. Circulation does not call RecoveryControl, avoiding a dependency cycle. A local clearance flag or recovery incident lock is not proof that the old SQL writer has been fenced.
- **DeliveryPreparation:** owns ReleaseManifest and DeploymentConfiguration. Packages local templates/assets, generates frontend configuration, validates primary us-east-1 / secondary us-east-2 and required domain/certificate inputs, invokes schema initialization in sequence and checks Circulation/RecoveryControl readiness and release parity. Runtime recovery does not depend on the delivery pipeline; ordinary deployment stops during recovery or unresolved promoted-topology drift.

## Ambiguity Analysis

Business choices and page behavior are already answered. The ownership proposal gives every persistent entity one owner and retains the transaction invariant without a circular call graph. Schema and recovery privileges are separate from public checkout. Concrete writer fencing, draining, loss-bound evidence and enforcement are design obligations for later functional/NFR/infrastructure stages; this proposal does not declare them solved or permit promotion without them. Wire fields/error codes, field types/limits, schema constraints, hosting units and specific AWS recovery resources are deferred to their designated stages. Retention, operating contacts, catalog and certificate identifiers remain explicit launch inputs rather than invented defaults.

## Consolidated Summary Confirmation

- Use five logical building blocks: BorrowerExperience, Circulation, SchemaLifecycle, RecoveryControl and DeliveryPreparation. This does not add five independently deployed services or change the approved N-tier stack.
- Keep books/stock, loans, checkout request identity and recovery inventory clearance under Circulation ownership. Store self-reported borrower details with the loan; no borrower accounts or public lookup.
- Reuse the existing page, handler, initializer and build configuration. Keep demo fixtures isolated and production seeding explicit; initialize additively only against verified writable authority.
- Separate privileged recovery decisions/evidence from borrower checkout. Require demonstrated fencing/draining, acceptable loss evidence, target readiness and inventory clearance before borrower writes reopen. Block all stock when the affected set is unknown; no automatic failback. The concrete enforcement protocol must still be designed and tested.
- Delivery preparation owns generated configuration, complete artifacts, Ohio consistency and release/schema parity checks; runtime recovery remains independent of the pipeline. No London migration or AWS calls are part of this work.
- Produce an entity ownership/component catalog, decision records including rejected alternatives, and traceability for all fourteen functional requirements. Record six-pillar responsibilities and later proof obligations without claiming measured recovery or Well-Architected certification.

Does this all look correct before I generate the domain design artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
