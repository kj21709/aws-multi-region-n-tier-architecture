# Component Inventory

## Static visitor portal

**Health: at-risk.** Owns browser registration/lookup presentation in `App/`. Depends on HTTP API, IPAPI and Google Fonts. Hardcoded API configuration and deployment casing disagree; keyboard/status/error presentation needs revision for the approved library journey.

## Visitor API

**Health: at-risk.** Inline Python handler in `cfn/visitor-insert-lambda.yml`; owns visitor insert/lookup SQL and JSON responses. Depends on HTTP API event contract, Secrets Manager, MySQL driver/layer and RDS connectivity. SQL is parameterized; public data lookup, raw error disclosure and missing durable retry semantics are concerns.

## Schema initializer

**Health: degraded.** Inline custom-resource Lambda in `cfn/DBinit-lambda.yaml`; owns `VISITOR_LOG` DDL, preserving data on delete. Depends on VPC/database exports, credentials and MySQL layer. Undefined environment keys and omission from the parent deployment prevent it functioning as declared.

## Infrastructure

**Health: at-risk.** Seven CloudFormation YAML templates own VPC, regional database/secrets, Lambda, HTTP API, private S3/CloudFront and initialization resources. Replication and current resource identities must be retained. No custom domain or automatic writable regional failover exists. This heading represents provisioning code, not a new domain-service boundary.

## Deployment preparation

**Health: degraded.** Three buildspecs and two Markdown guides own packaging, primary/secondary deployment choreography, output extraction and frontend publication. Depends on source/artifact paths, existing template locations, AWS CLI and jq. `App/` mismatch, ineffective placeholder substitution and incomplete artifact/nested-template packaging must be corrected. This heading represents delivery tooling, not an application service.

Health ratings describe source-level readiness for the approved change; no deployed resource health was measured.

## Proposed Regional Recovery Control

**Status: new design only, not analyzed source coverage.** Ohio-based monitoring and recovery orchestration owns incident locking, safety evidence, promotion/readiness, routing eligibility and abort/progress records. Depends on demonstrable write fencing, replication/loss policy, regional RDS/API/secrets, Route 53 and operating alerts. It does not own library loan data. This proposed component is excluded from `analyzed.components` until source exists.

## Requested Recovery Impact on Existing Components

Static visitor portal becomes the library UI and uses stable API addressing. Visitor API gains authoritative-write enforcement and retry-safe library transactions. Schema initializer runs only against verified writable authority. Infrastructure gains Ohio resources, dual-origin OAC, API domains/routing, readiness and recovery control; the existing London deployment remains a baseline fact. Deployment preparation must migrate regions additively, verify DR release parity and prevent ordinary updates from undoing promotion. Current health ratings above remain source assessments, not approval of the target safety mechanics.
