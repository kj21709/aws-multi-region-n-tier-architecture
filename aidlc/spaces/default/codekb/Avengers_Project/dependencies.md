# Dependencies

## Runtime Dependency Graph

| Consumer | Direct dependencies |
|---|---|
| Static visitor portal | HTML → CSS/JavaScript/Google Fonts; JavaScript → DOM/Fetch, IPAPI, embedded API endpoint. |
| Visitor API | `os`, `json`, `base64`, `boto3`, `mysql.connector`; credentials, network and database schema. |
| Schema initializer | `os`, `json`, `boto3`, `urllib.request`, `mysql.connector`; custom-resource response URL, credentials and database exports. |

No local cross-package imports or circular application imports were discovered. Third-party Python is supplied through runtime/layer rather than a local lockfile.

## Provisioning and Delivery Dependencies

Parent Infrastructure composes VPC, Database, LambdaBackend, ApiGateway and StaticSite nested stacks. Database depends on VPC exports; backend depends on VPC/database exports; API depends on Lambda ARN. The separate initializer requires the database/VPC but is absent from parent ordering. Deployment preparation expresses package → initial secondary → primary with secondary bucket → secondary update with primary role/database ARN → frontend publication. Actual CodePipeline definitions/artifact routing are not present, so this is intended file-level ordering only.

## Change Implications

Schema initialization must finish on writable primary before library API use. Frontend publication needs validated parent outputs and correctly packaged `App/` assets. Absolute remote child-template URLs currently weaken local-source-to-deployment traceability. Preserve replica layout without assuming it accepts DDL or checkout writes; no promotion automation is present. Detailed defects and evidence are centralized in [code-quality-assessment.md](code-quality-assessment.md).

## Proposed Recovery Dependencies

Ohio recovery control must have usable artifacts, IAM/operating access, state and alarms outside Virginia before an incident. Ordered hard gates are independent multi-signal detection → incident ownership → primary fencing/drain proof → approved replication-loss policy → promotion → regional secret/schema/API/full checkout checks → writer-readiness routing. Primary inability to provide fence evidence stops this baseline, even if Ohio services are healthy. Control-plane/routing dependencies remain failure modes; the design does not promise independence from every AWS control plane.

Static CRR and CloudFront origin recovery are independent of API POST recovery. Existing London region and bucket parameters in packaging/deployment/parent templates must become Ohio inputs through a migration that retains old resources pending validation. API/cert/secret/runtime-driver availability must be established in Ohio, not inferred from interpolated ARNs. A promoted DB stops being a replica, requiring reviewed IaC reconciliation and reseeding before normal deploy/failback. See [architecture.md](architecture.md).
