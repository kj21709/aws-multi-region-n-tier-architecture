# Homenub Library — Decomposition Plan Approval

## Confirmed Plan

The [unit decomposition inputs](units-generation-questions.md) were explicitly confirmed with Looks correct. This separate checkpoint implements Units Generation Step 4; it does not change that confirmed proposal.

| Unit ID | Directory | Kind | Scope |
|---|---|---|---|
| U1 | u1-library-checkout | service | Integrated borrower page, transactional API and separately privileged additive initializer. |
| U2 | u2-regional-recovery | service | Recovery control and regional runtime infrastructure preparation. |
| U3 | u3-release-preparation | packaging | Complete artifacts, generated configuration, Ohio checks and CI integration. |

Dependency structure: U2 depends on U1; U3 depends on U1 and U2. No reverse dependency on the running delivery pipeline is introduced. This is dependency topology, not an economic implementation order. Deployment remains the approved N-tier model with existing stack names. All work is local preparation; no AWS calls, deployment or DNS changes.

## Plan Approval

Approve this three-unit decomposition and the proposed kinds before generating the four unit artifacts?

A. Approve Plan
B. Revise Plan
X. Other (please specify)

[Answer]: A. Approve Plan

## Consolidated Summary Confirmation

- U1 / u1-library-checkout is a service unit containing the borrower page, transactional checkout API and separately privileged additive initializer.
- U2 / u2-regional-recovery is a service unit containing privileged recovery control and regional runtime infrastructure preparation.
- U3 / u3-release-preparation is a packaging unit containing generated configuration, complete artifacts, Ohio checks and integrated CI.
- Dependencies remain U2 → U1, U3 → U1 and U3 → U2. Runtime recovery reads published manifests without depending on a running pipeline. This does not select economic delivery priority or a Bolt sequence.
- Preserve existing N-tier deployment, stack names, VPC layout, DB sizing and replication baseline; use us-east-1 primary and us-east-2 recovery. No AWS access, deployment or London migration work is authorized.
- Map all fourteen functional requirements and eight NFR responsibilities; detailed contracts, authority/fencing, incident-bound clearance and real recovery evidence remain required downstream work. No application or cloud test result is claimed by unit assignment.
- The existing approved proposal and Approve Plan answer are unchanged. Confirm this summary in this separate plan record so the four generated unit documents can be re-saved under its confirmation and receive the architecture review.

Does this all look correct before I generate the unit artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
