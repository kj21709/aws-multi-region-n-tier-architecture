# Homenub Library — Requirements Questions

## Established Decisions

The approved application plan and revised architecture already establish the borrower-facing catalog, name/email checkout without accounts, one book per transaction, 14-day UTC due dates, cream/green styling, additive persistence, transaction safety and request-id idempotency. Returns, accounts, staff UI and notifications remain excluded. Prepare and validate code only; do not access AWS or deploy.

The approved recovery direction is us-east-1 primary with us-east-2 standby. The user has confirmed that no live environment exists: update London/eu-west-2 references in application/deployment code and active setup documentation to Ohio/us-east-2 for initial deployment. No London-to-Ohio migration, backfill, resource retirement, or related migration/recovery runbook is required. This correction supersedes the migration assumptions in the earlier architecture assessment. Static hosting and checkout API recovery remain separate. Automatic database promotion must stop if old-writer fencing/draining or the approved loss policy cannot be verified; failback is controlled. These decisions are not being asked again.

Sources: approved implementation plan in the conversation; approved recovery revision; space-level CodeKB business-overview.md, architecture.md and code-structure.md under aidlc/spaces/default/codekb/Avengers_Project/. Initial description: project-description.json in this intent. This question file records remaining business choices, not implementation or deployment authorization.

## Q1 — Maximum Checkout Downtime

What recovery-time objective should regional failure drills target, measured from service interruption through successful public checkout in Ohio? The objective includes detection, promotion, routing and verification. It applies when safety gates permit recovery; unsafe or unverified conditions must remain a declared exception rather than silently allowing two writers. Targets require later measurement, not a promised recovery time.

A. 30 minutes (recommended starting target).
B. 60 minutes (more tolerance for recovery time).
C. 15 minutes (tighter target; may require additional cost or architecture changes).
X. Other (please specify)

[Answer]: C. 15 minutes

## Q2 — Acceptable Loss of Recent Checkouts

What recovery-point objective is acceptable after a regional disaster? With asynchronous replication, even an acknowledged checkout and its retry record may be missing in Ohio. Lost checkouts require inventory reconciliation. A maximum-loss target is not a guarantee based solely on a lag metric; unknown or excessive lag must block automatic promotion.

A. Up to 5 minutes of recent checkout data, with reconciliation (recommended starting target for the retained RDS design).
B. Up to 15 minutes of recent checkout data, with reconciliation.
C. No loss of acknowledged checkouts; revisit database/coordination design and cost before implementation.
X. Other (please specify)

[Answer]: A. Up to 5 minutes (Recommended)

## Q3 — Recovery Cost Constraint

How should the design constrain monthly AWS cost for the application across both regions, including databases, networking, replication and recovery controls? No deployed inventory or pricing estimate has been obtained, and this run does not authorize AWS deployment or spending.

A. Minimize additions to the existing RDS architecture and prepare an estimate before deployment; no fixed monthly ceiling yet (recommended).
B. Apply a hard monthly ceiling; include the total USD/month amount with your answer so feasibility can be checked.
X. Other (please specify)

[Answer]: A. Estimate before deployment (Recommended)

## Consolidated Summary Confirmation

- Keep the previously approved library experience: borrower catalog and availability, one-book checkout with name/email, 14-day UTC due dates, durable request IDs, additive data changes and cream/green styling.
- Prepare code and local validation only; no AWS access, deployment, DNS changes or spending is authorized.
- No live environment exists. Primary region remains us-east-1; recovery target is us-east-2. FR13 will require replacing active London/eu-west-2 references with Ohio/us-east-2 for initial deployment, without migration, backfill, retirement, or a related migration/recovery runbook. Earlier migration assumptions are superseded; all six Well-Architected pillars remain covered.
- Q1: Recovery-time objective is 15 minutes, measured from interruption through restored public checkout and verified by recovery drills. This is a target, not a current guarantee; failed safety checks can extend downtime and must be reported as exceptions.
- Q2: Recovery-point objective permits at most 5 minutes of lost recent checkout data, with inventory reconciliation. Unknown, stale or excessive replication lag/loss evidence must stop automatic promotion. No zero-loss or cross-region exactly-once guarantee is implied.
- Q3: Minimize additions to the existing RDS design and prepare a two-region cost estimate before deployment. No hard monthly ceiling has been set.
- Automatic recovery is conditional on demonstrated old-writer fencing/draining, target readiness and the approved loss policy. Unsafe or unverified conditions stop promotion and alert; failback remains controlled. Later design must prove the safety mechanics and target feasibility before implementation claims are accepted.
- Address the inventory-reopening ambiguity from review: after a future failover with missing or uncertain checkout/request history, keep borrower checkout blocked for all potentially affected stock until reconciliation proves availability. If affected books cannot be identified reliably, block all borrower checkout until reconciliation completes. A retried request with missing history cannot create a new loan before that clearance. Count any resulting delay against the 15-minute recovery objective.
- Correct the three broken CodeKB source links. Prior assessment/audit records retain historical facts; active implementation/setup configuration must not select London.

**Proposed FR13 Replacement**

**FR13 — Ohio region configuration for initial deployment.** Replace active London/eu-west-2 references with Ohio/us-east-2 in application code, CloudFormation defaults, packaging/deployment configuration and setup instructions. No live environment exists, so do not prepare a London-to-Ohio migration or its migration/recovery runbook.

- Given the current source and build configuration, when the update is prepared, then secondary-region and replica-region values use us-east-2, the primary remains us-east-1, and active deployment/setup paths contain no London/eu-west-2 target.
- Verify rendered/packaged configuration as well as source defaults so an override cannot silently restore the obsolete target. Check regional dependency/configuration consistency without calling AWS. The current bounded scan found five eu-west-2 values across four CloudFormation/buildspec files; implementation must also check active documentation and any newly added configuration.

**Revision Input**

Exact user feedback: "Request Changes - for FR13 no need to prepare non-destructive London-to-ohio migration and recovery runbook. We need to update the code to use Ohio any time it is referencing London. Keep in mind there is no live environment currently."

Does this all look correct before I generate the requirements artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
