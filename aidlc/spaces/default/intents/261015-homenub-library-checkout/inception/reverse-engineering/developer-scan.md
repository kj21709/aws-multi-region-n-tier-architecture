# Avengers_Project Developer Scan

## Developer Code Scan Results

Refreshed brownfield scan for `261015-homenub-library-checkout`, Standard depth, after explicit Request Changes. Repository HEAD previously observed: `aff8fa3c19921f48026940c82bf49eb0d8d56889`. Application, infrastructure, and buildspec source were re-read for the fresh attempt; the supplied source fingerprint is unchanged. Findings describe current workspace behavior, not deployed AWS state. No AWS calls, network calls, application modifications, or deployment commands were run.

Fresh-attempt pre-scan binding supplied by conductor: repo `Avengers_Project`, paths `./`, store generation `sha256:c5db1290eb869a798b0f0c3c51054ba404df0901611b250e2b9bc0f051b04348`, source fingerprint `tree:527ccae7cbc9b9426c29e88e73f8c268b112a61db291d73ed33456eca2e1ee79`. Existing store verdict is UNVERIFIED; the earlier initial-scan findings below remain valid current-source observations. This application-focused scan stays within that source boundary, but honestly records **partial** deep coverage because framework internals and binary project documents were not scanned deeply. Do not claim `./` as analyzed deeply in the synthesized Scope of Analysis block.

### Revision Authority and Target Boundary

Exact human feedback: "Make changes to the architecture to allow dissater recovery with automatic failover to US-East2 region instead of EU-West-2. Make sure the design follow AWS Well Architected framework".

Target requirement from this feedback: retain `us-east-1` primary, change DR region to `us-east-2`, and design automatic recovery for the complete library journey, including checkout writes, with AWS Well-Architected alignment. This supersedes the earlier architecture-preservation constraint only where needed for recovery. **No automatic regional failover exists in the inspected baseline.** New recovery controllers, routing, write authority, and operational safeguards discussed below are requirements/design follow-up, not implemented features. AWS deployment and DNS changes remain deferred; no cloud access is authorized. RTO, RPO, acceptable loss of acknowledged checkouts, and budget ceilings are not supplied by the feedback and must not be invented as accepted targets.

### Scan Coverage

**Analyzed deeply** (repo-relative paths):
- `App/` — all three files: HTML markup, stylesheet, JavaScript event handlers and HTTP behavior.
- `cfn/main-stack.yml`
- `cfn/vpc-stack.yml`
- `cfn/rds+SCM.yml`
- `cfn/visitor-insert-lambda.yml` — including complete inline Python.
- `cfn/HTTP+API-v2-stack.yml`
- `cfn/s3+OAC+CF-stack.yml`
- `cfn/DBinit-lambda.yaml` — including complete inline Python and custom resource.
- `cfn/rds-readme.md`
- `buildspec/` — all three buildspecs and both Markdown documents; image excluded.

**Skimmed only / outside deep analysis**:
- `.codex/` and `.agents/` — methodology/knowledge read as instructed; application build/test claims do not treat the workflow engine as application functionality.
- `aidlc/` — active intent/state and applicable memory consulted for dispatch context; other records and framework data not reverse engineered.
- `Diagram/` and `buildspec/architecture.jpeg` — filenames only; diagrams not visually inspected.
- Root `.docx` files, including office lock file — filenames only; contents not extracted.
- Root metadata (`AGENTS.md`, `.gitignore`, `aidlc.settings.json`, `LICENSE`) — existence/inventory only; no business behavior inferred.
- `.git/` — read-only HEAD and status metadata; no history or credentials inspected.

### Packages Found

| Component | Type / language | Purpose |
|---|---|---|
| Static visitor portal (`App/`) | Browser HTML/CSS/JavaScript | Register anonymous visitor location and look up visitor details by numeric ID. |
| Visitor API (`cfn/visitor-insert-lambda.yml`) | Inline Python 3.12 Lambda | Secrets retrieval, MySQL connection, insert and lookup against `VISITOR_LOG`. |
| Schema initializer (`cfn/DBinit-lambda.yaml`) | Inline Python 3.12 Lambda / custom resource | Intended to create `VISITOR_LOG`; separate template is not referenced by master stack. |
| Infrastructure (`cfn/`) | Seven CloudFormation YAML templates | VPC, database/secrets/replica, backend, HTTP API, static distribution and schema template. |
| Deployment preparation (`buildspec/`) | CodeBuild YAML with Bash/AWS CLI/jq | Package templates, orchestrate primary/secondary deployment, publish frontend. |

There is no application package manifest, JavaScript bundler, standalone Python source module, local dependency lockfile, or application framework in the discovered application surface. The initialization state's JavaScript-only language detection misses inline Python and YAML infrastructure.

### Build System

- **Type:** Static frontend with no compilation; CloudFormation nested stacks; CodeBuild shell steps.
- **Config files:** `buildspec/buildspec-package.yml`, `buildspec/buildspec-deploy.yml`, `buildspec/buildspec-frontend.yml`, and seven `cfn/` YAML templates.
- **Package relationships:** master → VPC; database → VPC exports; backend → database exports and VPC exports; HTTP API → backend ARN; static stack independently creates S3 and primary-only CloudFront. Separate DB initializer → database/VPC exports, but master has no initializer nested stack.
- **Pipeline flow expressed in files:** package two regional templates → secondary initial deployment → primary deployment using secondary bucket ARN → secondary update using primary replication role and DB ARN → frontend publication. Actual CodePipeline resources and source/artifact wiring are absent, so runtime stage wiring is unverified.
- Package buildspec runs Python 3.12 CodeBuild runtime, performs no linting, checks five nested template files (omits initializer), and calls CloudFormation package in `us-east-1` and `eu-west-2` (`buildspec-package.yml:16-54`).
- Master `TemplateURL` values are already absolute S3 URLs (`main-stack.yml:47-87`); the package step does not establish that changed local child templates replace the remotely referenced content. This is a deployability gap, not evidence that new child content is uploaded.
- Package artifacts list `buildspec-deploy.yml` and `buildspec-frontend.yml` at artifact root although files reside under `buildspec/` (`buildspec-package.yml:59-64`). Neither frontend `App/` nor original nested templates are listed as output artifacts. Whether a downstream action also receives a source artifact is unknown.

### APIs Discovered

**External browser-to-backend HTTP API:** two routes, unauthenticated, AWS_PROXY payload 2.0, auto-deployed `$default` stage (`HTTP+API-v2-stack.yml:24-66`). No application throttling, authorizer, or API key is declared. CORS allows all origins; GET, POST, OPTIONS; `Content-Type` only.

| Method / path | Input | Response / behavior | Source |
|---|---|---|---|
| `POST /register` | JSON object with optional `city`, `state`, `country`; source IP from HTTP API request context | Inserts visitor; commits; counts all visitors; 200 `{message,id,visitor_count,ip}`. Missing fields default to `Unknown`. | `visitor-insert-lambda.yml:144-167` |
| `GET /register?id=...` | Required `id` query parameter, no numeric validation | 200 `{id,ip,city,region,country}`; 400 missing query ID; 404 no row. Public lookup exposes visitor data. | `visitor-insert-lambda.yml:169-189` |
| `OPTIONS` handler branch | No body needed | 200 `{ok:true}`; API Gateway also configures managed CORS. No explicit OPTIONS route in template. | `visitor-insert-lambda.yml:122-123` |

- Lambda dispatch examines method only, not path. Other methods fall through to lookup if invoked directly. JSON/base64 parser returns `{}` for JSON parse errors but base64 decoding occurs outside its parse exception handler (`visitor-insert-lambda.yml:98-107`). Valid non-object JSON can fail later on `.get`.
- DB failures become 500 with raw exception string (`visitor-insert-lambda.yml:191-192`). Environment reads before the main try can escape that response wrapper.
- Browser additionally calls third-party `ipapi.co/json/` before registration; API location fields come from client data, not backend geolocation (`App/app.js:27-40`). Google Fonts stylesheet is another external browser dependency (`App/index.html:8`).
- No `/books`, `/checkouts`, checkout reference, due date, account system, or library behavior exists. Documentation mentions `/health`, but no such route/handler exists in the analyzed templates.

### Persistence and Runtime Data Flow

- Visitor table schema exists only in initializer DDL: auto-increment integer `ID` primary key; IP varchar(45), city/state/country varchar(100), `CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP` (`DBinit-lambda.yaml:121-130`). The API assumes this table already exists.
- Registration: button → geolocation provider → POST API → Secrets Manager credentials → new MySQL connection → parameterized INSERT → commit → COUNT → JSON → success ID. A failure after commit can produce an error even though data was stored. No idempotency identifier or unique request constraint is present.
- Lookup: ID input → GET API → Secrets Manager → MySQL SELECT by parameterized ID → visitor location/IP display. SQL is parameterized; validation and confidentiality boundaries are weak.
- Every non-OPTIONS API call fetches credentials and creates a connection with 10-second connect timeout; finally attempts cursor/connection close. Cleanup exceptions are swallowed. No explicit rollback, connection pool, transaction locking, schema versioning, or availability/inventory consistency code exists.
- Initializer is a CloudFormation custom resource with create/update and delete branches. Delete sends success without dropping the visitor table (`DBinit-lambda.yaml:102-104`); DDL uses `CREATE TABLE IF NOT EXISTS`. Custom resource contains only `ServiceToken`, so changed code alone does not supply an explicit schema-version property to force an update (`DBinit-lambda.yaml:141-144`).
- Initializer environment exports `DB_SECRET_NAME`, `DB_HOST`, `DB_PORT`, `DB_NAME` (`DBinit-lambda.yaml:52-60`) but code reads undefined `SECRET_ARN` and `DB_USER` (`:109-115`), and ignores configured port. It cannot work as declared. It logs the full event, including custom-resource response URL, and uses a log-stream-based physical resource ID (`:80-100`). Failure cleanup is incomplete.

### Infrastructure Inventory and Preservation Boundaries

- **Master:** logical nested stacks `VPC`, `Database`, `LambdaBackend`, `ApiGateway`, `StaticSite`; backend/API created when primary or secondary replica endpoint exists (`main-stack.yml:34-93`). No schema initializer in this chain. Parent exports site bucket, CloudFront domain/ID, replication role, register endpoint, primary DB ARN.
- **Network:** DNS-enabled VPC; one public subnet; two private subnets in different AZs; internet gateway; one NAT gateway/EIP; public and private route tables (`vpc-stack.yml:18-121`). Exports are globally named within region (`VpcId`, `PrivateSubnet1Id`, `PrivateSubnet2Id`, `PublicSubnetId`); names are not stack-specific. No VPC endpoints declared. Retain network layout per approved plan.
- **Database:** default MySQL engine `8.0`, `db.t3.micro`, 10 allocated storage units; private Multi-AZ primary, seven-day backup retention; secondary cross-region read replica, private, single-AZ; snapshot retention on DB deletion/replacement (`rds+SCM.yml:4-23,109-155`). Lambda SG connects to RDS SG on TCP 3306. Primary creates generated credentials and replicates secret to configured replica region. No new database sizing or identity change is authorized.
- **Backend:** named Lambda/role, Python 3.12, 30-second timeout, 256 MB, private subnets, imported DB SG and endpoints (`visitor-insert-lambda.yml:16-75`). Reads database master credentials through Secrets Manager; no distinct limited SQL application user is declared.
- **HTTP API:** public HTTPS regional endpoint, permissive CORS, Lambda permission restricted to this API ARN; seven-day access log retention. Access logs include source IP (`HTTP+API-v2-stack.yml:18-22,64-74`).
- **Static hosting:** private versioned bucket with public access blocked and OAC read policy bound to CloudFront distribution. Primary-only enabled CloudFront: `index.html` root, HTTP/2, `PriceClass_100`, HTTPS redirect, compressed GET/HEAD/OPTIONS, no forwarded cookies/query strings (`s3+OAC+CF-stack.yml:41-72,150-206`). No custom alias, ACM certificate parameter/viewer certificate, Route 53 resources, or domain configuration exists.
- **Replication:** primary bucket replicates all objects/delete markers into secondary; named primary replication role and secondary bucket write policy exchange ARN parameters. Secrets replicate primary→secondary; secondary DB is a read replica. CloudFront has one primary S3 origin with no origin failover group. Secondary API exists once replica exists, but no promotion/write-enable or active failover mechanism is implemented. Do not send checkout writes or initializer DDL to a read-only replica.
- Existing deployed-stack names in buildspecs: `visitor-app-dev-primary`, `visitor-app-dev-secondary`; project/environment defaults remain `visitor-app`/`dev`. Branding changes must not silently rename existing DB identifiers, exports, roles, or nested logical IDs.

### Frameworks & Libraries

| Technology / dependency | Version evidence | Responsibility |
|---|---|---|
| Browser HTML/CSS/JavaScript | No pinned browser/ECMAScript target | DOM, Fetch API, JSON and styling; no frontend framework. |
| Python | Lambda runtime `python3.12`; CodeBuild Python `3.12` | Inline request and initializer handlers / pipeline tooling. |
| `boto3` | No app-pinned version; runtime import | Secrets Manager `GetSecretValue`. |
| `mysql.connector` | External Klayers layer identifier for Python 3.12, layer revision 9; package version not recorded | MySQL driver. Regional layer availability unverified. |
| MySQL | `8.0` CloudFormation default | Visitor persistence and primary/replica architecture. |
| CloudFormation | Template format `2010-09-09` | Nested infrastructure. |
| AWS CLI, jq, shell, sed | Unpinned; build environment supplied | Packaging, output extraction, stack orchestration, upload, invalidation. |
| Google Fonts / Inter; IPAPI | No pinned content/API version | Font and client geolocation. |

**Dependency adjacency:** `index.html → style.css, app.js, Google Fonts`; `app.js → browser DOM/Fetch, IPAPI, hardcoded API endpoint`; `API inline index → os,json,base64,boto3,mysql.connector`; `initializer inline index → os,json,boto3,urllib.request,mysql.connector`. There are no local Python module imports or circular local application imports. Infrastructure dependency graph is described under Build System.

### Test Coverage

- **Test directories/frameworks:** none found in the application/deployment file inventory. Framework-owned test tooling is not application test coverage.
- **Coverage configuration:** absent for application code. No test runner or dependency manifest accompanies the frontend or inline handlers.
- **Validation performed in scan:** read-only source inspection and dependency/contract tracing; no executable application test suite or CloudFormation validation was run. Do not report passing runtime, browser, SQL concurrency, or cloud tests.
- **Verification gaps relevant to approved plan:** transactional persistence and last-copy concurrency require real MySQL semantics; browser responsive/keyboard/error states need new checks; template/packaging checks must cover regional conditions and additive initializer reruns. Mocks alone cannot demonstrate database locking.

### Code Quality Indicators

- **Linting / formatting:** no application lint/formatter config or lint command discovered. Package buildspec explicitly says no linting.
- **CI/CD:** three buildspecs exist but no pipeline resource definition, automated test/coverage gate, or repository CI workflow was found outside workflow framework content. jq installation suppresses errors; deploy uses verbose shell tracing.
- **Documentation:** infrastructure notes are incomplete/stale relative to current templates: initializer described as part of RDS/WaitCondition although separate custom-resource template is not included; sample stack filenames do not exist; health/failover notes describe intentions, not implemented features.
- **Frontend accessibility/mobile:** `lang`, viewport metadata, native buttons and CSS basic sizing exist. Lookup input lacks a programmatic label; no form submit semantics, live status, alert region or focus management. Input outline is removed (`style.css:82-90`); body is fixed to viewport and hides overflow (`:13-20`), risking clipping. Two h1 headings and alert-based error UX. No catalog or borrower form.
- **Style / complexity:** readable descriptive naming overall; browser tightly couples DOM handlers/network/formatting. API handler combines parsing/secrets/SQL/response and spans ~85 lines. Both handlers use broad exception handling. No TODO/FIXME evidence needed to establish the concrete defects below.

### Technical Debt Signals

1. **Broken frontend deployment configuration:** repository is `App/`, pipeline edits/syncs `app/`; sed expects `__API_URL__` while actual app has a literal deployed URL (`App/app.js:2`; `buildspec-frontend.yml:44-48`). Runtime configuration is not generated. Output extraction does not validate missing/null values before upload.
2. **Initializer not integrated and misconfigured:** master has no initializer; standalone handler reads undeclared env keys (`main-stack.yml:43-94`; `DBinit-lambda.yaml:52-60,109-115`). Production migration ordering and forcing repeatable schema updates need explicit design.
3. **Nested packaging can leave remote stale templates:** absolute child template URLs and root-vs-subdir artifact mismatch (`main-stack.yml:47-87`; `buildspec-package.yml:59-64`). Local file existence checks are not proof packaged deployment uses those files.
4. **No inventory transaction/idempotency boundary:** registration commit is independent from later count response; no library tables or request uniqueness exist (`visitor-insert-lambda.yml:151-167`). Library workflow requires new persistence semantics rather than renaming visitor fields.
5. **Public data / error leakage:** public visitor lookup exposes IP/location; raw DB exception strings returned; initializer prints full custom resource event (`visitor-insert-lambda.yml:174-192`; `DBinit-lambda.yaml:100`). New borrower records must not inherit public lookup behavior.
6. **Sensitive documentation content:** `cfn/rds-readme.md:41-46` contains operational connection details and a credential-like literal. The literal is intentionally not reproduced in this artifact. Owner follow-up is required to assess exposure; no credential use or cloud access was attempted. Nearby instructions to make RDS public conflict with the actual private architecture (`:53-58`).
7. **Read replica is not an automatic writable standby:** backend routes to regional replica endpoint in secondary; no promotion or routing orchestration. Preserve replication structure while making write eligibility explicit in future design.
8. **No custom site domain/certificate/DNS wiring:** current static distribution configuration has no Homenub domain. Future domain/certificate parameters must not require unrelated resource replacement.
9. **Availability / cost traits:** one NAT gateway per regional VPC and Multi-AZ primary plus cross-region replica are explicit current choices. Scan does not benchmark or reprice them; later human feedback authorizes necessary recovery architecture changes, with cost tradeoffs recorded explicitly.
10. **Unpinned deployment dependencies:** external regional Lambda layer and AWS CLI/jq versions lack application lock/version verification; do not claim dependency vulnerabilities or current support status without evidence.

### Fresh Revision: Regional Recovery Change-Impact Inventory

| Source surface | Current baseline evidence | Target impact requiring design/implementation |
|---|---|---|
| `cfn/main-stack.yml:22-24,43-93` | Replica region defaults to `eu-west-2`; nested stack parameters wire DB/secret replication and S3 replication independently. Child template URLs reference one pre-existing remote bucket. | Set DR target to `us-east-2`; parameterize new regional routing/recovery outputs and dependencies; ensure remote template/artifact availability survives primary loss. Preserve existing primary identities where possible. |
| `cfn/rds+SCM.yml:49-51,91-104,109-155` | Secret replica targets `ReplicaRegion`; primary has backups/Multi-AZ; secondary DB is explicitly a read replica in secondary VPC. No promotion controller or writer-authority resource. | Redirect replication to Ohio; specify automated promotion, readiness checks, single-writer fencing, durability limits, reconciliation/failback, and treatment of promoted resource drift. Changing template defaults does not relocate an existing London resource or its data. |
| `buildspec/buildspec-package.yml:5-9,38-54` | Primary `us-east-1`, secondary `eu-west-2`; secondary package bucket literal ends `euw2-bucket`. | Replace secondary region and supply a real Ohio packaging bucket through deployment inputs; do not presume a bucket exists or rename/move London storage in place. Package regional dependencies, including recovery components. |
| `buildspec/buildspec-deploy.yml:5-11,78-184` | Secondary/replica region both London; three-step bootstrap order exchanges secondary bucket and primary DB/role ARNs. | Switch both parameters to Ohio; update bootstrap ordering for replicated data/assets, regional API and readiness gates; separate normal deployment from recovery so a routine deploy cannot undo promotion or reactivate two writers. Keep stack-name defaults unless a reviewed migration requires change. |
| Both Lambda templates, `Layers` entries (`visitor-insert-lambda.yml:61-62`, `DBinit-lambda.yaml:62-63`) | Layer ARN region is `${AWS::Region}`, external publisher and layer revision are fixed. | No literal London ARN needs replacement; validate exact driver artifact availability in `us-east-2` during later preparation or vendor/package driver consistently. Do not assert publisher coverage from interpolation alone. Secrets are regional and must be available before DR readiness. |
| `cfn/s3+OAC+CF-stack.yml:41-72,127-206` | Versioning and primary→secondary replication exist; only primary bucket permits OAC reads; one CloudFront origin, no origin group or secondary-origin read policy. | Design static origin failover plus least-privilege OAC access to Ohio bucket; supply secondary origin domain/ARN; validate all deployment assets/config are present before serving DR. Do not confuse static origin recovery with API/write recovery. |
| `cfn/HTTP+API-v2-stack.yml:24-66,76-90`; `App/app.js:2`; frontend buildspec | Independent regional API endpoints; browser uses primary literal; frontend buildspec reads only primary outputs. No custom API domain, health/readiness routes, regional traffic switching, or POST recovery policy. | Define stable browser API addressing and automatic regional traffic control for both GET catalog and POST checkout. Specify behavior for DNS/client caches, in-flight requests, transient errors, retries with unchanged request ID, and promotion readiness. A routing switch alone must never send writes to a read-only replica. |
| Visitor API inline handler / future checkout persistence | No writer epoch, lease, primary-region eligibility check, health readiness state, or cross-region idempotency contract. Per-request DB connection uses regional imported endpoint. | Enforce one writable authority during partitions and old-primary recovery; fail closed when safe authority cannot be established. Explain how old connections/in-flight transactions and retry deduplication behave if a committed loan/request ID has not reached the DR replica. |
| Initializer template / deployment pipeline | Separate broken initializer; custom resource does not know writer role. | Apply additive schema only to verified writable DB, preserve visitor rows, and ensure DR schema exists through replication/readiness before routing borrowers. Do not run primary initialization blindly against standby. |

### Fresh Revision: Well-Architected Evidence and Gaps

This is a source-derived gap inventory across the six requested architecture concerns; it is not an AWS Well-Architected certification or an account assessment. The architect should validate service-specific failover, routing-method support, promotion, and fencing choices against current official AWS documentation before selecting the mechanism.

| Pillar | Existing evidence | Recovery design follow-up |
|---|---|---|
| Operational excellence | IaC and regional buildspecs; no executable DR workflow, runbook, drill suite, success/failure alarm, or failback automation in application inventory. | Versioned recovery procedure/state transitions with idempotent actions, audit trail, retry limits, alerts, safe abort, restore/failback runbook, and repeatable failure-injection acceptance tests. Recovery control must not depend solely on the impaired primary region. |
| Security | Private DB, SG-scoped MySQL, Secrets Manager, private S3/OAC, API HTTPS. No explicit DB `StorageEncrypted`, SQL TLS policy, KMS configuration, borrower protection, or distinct SQL application user declared; full initializer event logging and raw API errors noted above. | Assess encryption settings and migration/replacement effects before changes; scope recovery IAM separately; verify Ohio secret/key availability; redact borrower data and response URLs; preserve security controls in DR. Absence of a template property is not proof of deployed plaintext data. |
| Reliability | Multi-AZ primary, secondary read replica, S3 versioning/replication, primary seven-day backups, DB snapshot deletion/replacement policies. No health checks, replication-lag gating, promotion, single-writer fence, regional API routing, origin failover, or tested restore evidence. | Define end-to-end readiness (assets, API, secret, schema and writable DB), RTO/RPO evidence, lag/loss policy and partial-failure decisions. Replication is not independent recovery from accidental deletion/corruption; specify backup restoration and cross-region recovery verification. |
| Performance efficiency | Static content caching/compression, small Python Lambdas, one DB connection and secret retrieval per request; no measured traffic/latency baseline, concurrency limits or proxy. | Validate checkout correctness/latency under expected small-library load and DR capacity. Bound connection pressure and timeouts; measure recovery intervals. Do not introduce costly scaling services without evidence. |
| Cost optimization | `db.t3.micro` default, 10 storage units, Multi-AZ primary, secondary DB, NAT gateway per VPC, one CloudFront distribution. No budgets or price calculations. | Compare warm standby/promotion and stronger durability alternatives including continuous regional DB/NAT cost, transfer/replication, health checks, orchestration/logging, additional security/control resources and drills. Automated, safe write failover may require changing the original design; record the cost/durability tradeoff rather than promise zero loss at current cost. |
| Sustainability | Small instance defaults, static delivery/cache and no separate frontend server; no utilization or regional sustainability metrics. | Size standby/control plane to the agreed recovery objectives, reuse replicated/static artifacts, set appropriate log/artifact retention, and justify duplicated always-on capacity with recovery requirements. Do not claim measured emissions savings. |

### Fresh Revision: Recovery Verification Scenarios to Carry Forward

Conductor-supplied current AWS documentation constraints (external validation owned by conductor, not re-browsed in this scan): CloudFront origin failover supports GET/HEAD/OPTIONS, not checkout POST; RDS read-replica promotion stops replication, reboots and takes minutes; asynchronous replication can lose writes. AWS Well-Architected REL13-BP05 requires avoiding dependence on the failed primary/control plane and pausing high-risk automation with an abort path. These constrain target design; they are not implemented recovery behavior. Architect should carry the conductor's official source citations into design artifacts.

- Complete primary regional outage and partial failures separately: static bucket only, API only, primary DB only, secret access, impaired replication, and lost recovery-control connectivity.
- Borrower loads catalog and submits checkout through stable site/API addressing after Ohio becomes writable; confirm reference/due date and persisted loan, not merely HTTP health success.
- Duplicate failover triggers, controller retries, stale readiness, promotion failure, replica lag beyond policy, restored old-primary connectivity and in-flight checkout during transition. Demonstrate no simultaneous writable authorities; otherwise reject the design's safety claim.
- Lost response followed by retry across regions, including a previously acknowledged write missing from the replica: explicitly test/report accepted data-loss and idempotency guarantees rather than assuming a unique SQL request ID solves cross-region lag.
- Verify asset/config replication completeness and secondary OAC permission; stale API configuration must not pin DR users to the failed primary.
- Restore from backup and controlled failback/rebuild of replication; record elapsed RTO and observed RPO against later agreed targets. Local tests can validate state-machine/error logic; live recovery drills remain a later explicitly authorized deployment validation.

## Handoff Summary

- **Intent-relevant finding:** changing the page alone cannot implement checkout: current browser calls visitor registration/lookup, API operates only on `VISITOR_LOG`, and the declared initializer cannot execute correctly or participate in master deployment. Evidence: `App/app.js:27-40,67-92`, `visitor-insert-lambda.yml:144-189`, `DBinit-lambda.yaml:52-60,109-115`, `main-stack.yml:43-94`.
- **Risks / follow-up:** retain visitor rows and preserve primary identities where feasible, while designing necessary architecture changes for automatic full-application failover from `us-east-1` to `us-east-2`. Introduce additive book/loan persistence with atomic stock updates and durable idempotency; keep borrower data out of public lookup/logging; fix packaging and regional API configuration together; initialize only verified writable authority. Resolve promotion/fencing, routing of POST, replica-lag durability, control-plane independence, RTO/RPO, and failback before claiming safe automatic recovery. Treat sensitive documentation as restricted content and do not propagate its literals into synthesis.
- **Scope instruction for architect:** record `kind: partial`; use the enumerated analyzed paths (prefer individual files for `buildspec/` because its image was not inspected), exclude `./`, and list binary documents/diagrams and framework directories as shallow. This satisfies the requested application scan without misrepresenting framework/binary coverage.
- **Verification limit:** source-level evidence only; actual deployed state, existing data, certificate/hosted-zone identifiers, regional layer availability, and CodePipeline artifact wiring remain unverified. No application files changed.
