# Code Quality Assessment

## Existing Verification Baseline

No application tests, test runner, coverage configuration, linter or formatter configuration were found. The package buildspec explicitly omits linting. Framework-owned tests are not application coverage. This reverse engineering used source inspection and contract tracing only; no runtime, browser, CloudFormation or SQL concurrency checks were run.

## Findings and Technical Debt

| Priority | Finding and evidence | Consequence for library work |
|---|---|---|
| High | `App/app.js:2` embeds URL; frontend buildspec edits lowercase `app/` and expects absent placeholder (`:44-48`). | Generate configuration and use actual casing; validate outputs before uploading. |
| High | Initializer exports DB_SECRET_NAME etc. but reads SECRET_ARN/DB_USER (`cfn/DBinit-lambda.yaml:52-60,109-115`); parent omits initializer. | Fix settings and additive schema sequencing; avoid replica DDL. |
| High | Parent references remote child URLs; package artifact paths omit source assets and mismatch subdirectory names (`main-stack.yml:47-87`, package buildspec `:59-64`). | Prove changed local templates/assets reach deployment artifact. |
| High | Public visitor lookup exposes IP/location; raw DB errors returned (`visitor-insert-lambda.yml:174-192`). | Keep borrower data private and return bounded errors. |
| High | Initializer prints full custom-resource event (`DBinit-lambda.yaml:100`). | Avoid propagating signed response URLs or sensitive payloads into logs. |
| High | Operational notes contain a credential-like literal and connection details (`cfn/rds-readme.md:41-46`). | Do not reproduce/use the literal; owner must assess exposure separately. |
| Medium | Registration commits before count/response and has no retry identity (`visitor-insert-lambda.yml:151-167`). | Checkout needs atomic inventory/loan persistence and durable request uniqueness. |
| Medium | Frontend lacks proper input label/live status/focus management; viewport overflow hidden and input outline removed. | Verify responsive layout and keyboard/status/error states for replacement UI. |
| Medium | External layer and build dependencies unpinned; guides describe missing health/failover/initializer behavior. | Document dependency limits and actual regional write eligibility. |

## Verification Required Downstream

Build-and-test must establish API/validation/error tests, additive initializer repeatability, frontend loading/empty/unavailable/retry/confirmation checks, responsive keyboard usability, CloudFormation and packaging/output contracts. Real MySQL tests must demonstrate rollback, persistence, duplicate requests and last-copy concurrency; mocks cannot prove SQL locking. Source inventory alone provides no passing test counts or coverage percentage.

## Revised Recovery Risks and Acceptance Plan

The source has no regional failure detector, promotion controller, stable API domain, readiness-gated routing, proven write fence, recovery runbook or DR test suite. Region substitution alone cannot meet the requested recovery behavior. The target safety design and six-pillar mapping are in [architecture.md](architecture.md).

| Verification layer | Required evidence before recovery claims |
|---|---|
| Local controller tests | Repeated/contradictory signals, observation window, duplicate triggers, conditional lock, restarts, retry deadlines, unknown promotion outcome and abort before/after irreversible steps. |
| Real MySQL safety tests | Last-copy concurrency, rollback and request replay; primary sessions/transactions blocked and drained before promotion; stale client and primary-return scenarios cannot create simultaneous writers. Failed or unprovable fencing must block promotion. |
| Loss/reconciliation tests | Acknowledged loan/request absent from replica; replay same ID after loss; demonstrate documented nonzero RPO and block/reconcile uncertain physical inventory rather than claiming global exactly-once. |
| Template/package tests | Ohio parameters and artifact parity, retained London resources, both OAC policies, API domains/certs, readiness-controlled routing, writable-only schema and promotion-aware deployment freeze/reconciliation. |
| Later authorized DR drills | Independently inject static-only, API-only, AZ/DB, regional/partition, secret/schema/lag and recovery-control failures; verify matrix decisions, maintenance/alerts and full public catalog → checkout → due-date/reference → durable loan journey. |
| Backup/failback drills | Restore independently retained backups, preserve divergent data, reseed replica and perform manually approved fenced failback; record measured elapsed recovery and actual lost data against later-approved objectives. |

No passing recovery tests, RTO/RPO result, cost saving or Well-Architected compliance assertion is established by these documents. Unconditional automatic write failover, accepted loss of acknowledgements, business objectives/budget and concrete fencing proof remain explicit blockers for later requirements/design, not silently accepted assumptions.
