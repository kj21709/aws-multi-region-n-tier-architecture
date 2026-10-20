# API Documentation

## Existing Public HTTP Contract

HTTP API uses Lambda proxy integration payload `2.0`, auto-deployed `$default` stage, no declared authorizer/API key, and CORS for all origins with GET/POST/OPTIONS and Content-Type. Source: `cfn/HTTP+API-v2-stack.yml:24-66`.

| Method/path | Input | Result |
|---|---|---|
| `POST /register` | JSON optional `city`, `state`, `country`; IP from request context | Inserts and commits visitor; 200 includes `message`, `id`, `visitor_count`, `ip`; absent fields become Unknown. |
| `GET /register?id=...` | Required query `id` | 200 includes `id`, `ip`, `city`, `region`, `country`; 400 if absent, 404 if no record. |
| OPTIONS handler | Direct method branch; no explicit route | 200 `{ok:true}`; API Gateway also manages CORS. |

Visitor API dispatches by method rather than path. SQL parameters are bound, but IDs lack numeric validation. Malformed JSON becomes an empty object; invalid base64 and non-object JSON can fail differently. DB exceptions return 500 with raw error details; some environment reads occur outside the wrapper. No health route, books or checkout route exists in the analyzed templates. Source: `cfn/visitor-insert-lambda.yml:98-192`.

## Internal and External Interfaces

Browser calls IPAPI geolocation and Google Fonts separately from the application API. Visitor API retrieves a secret then opens MySQL using environment configuration. Schema initializer implements CloudFormation custom-resource create/update/delete responses and intends to create `VISITOR_LOG`; declared environment names disagree with code reads. Parent exports connect endpoints and resource identities to nested stacks/buildspecs.

## Library Contract Impact

Approved additions are `GET /books` and `POST /checkouts`, including book ID, borrower name/email and request identity, returning book information, checkout reference and due date. These contracts are pending design/implementation. Do not extend the existing public visitor lookup to borrower records. Preserve historical visitor rows even if old visitor routes are retired.

## Proposed Recovery Interfaces (Not Implemented)

Use stable `https://api.homenub.com` for catalog/checkout in both regions; regional HTTP API domain mappings and certificates must exist before incidents. DNS routing must depend on promoted-writer readiness, with standby kept ineligible until successful end-to-end checks. Clients retain one checkout request identifier across retryable outages and unknown responses; server returns bounded unavailable errors while authority is uncertain. Cached DNS/direct old-region requests must be blocked by a proven server/database fence, not by client cooperation. No public borrower lookup or public recovery-control endpoint is introduced.

Proposed internal health separates liveness, dependency readiness and authoritative write readiness. Monitoring must not create arbitrary borrower loans; a controlled synthetic journey and replay validate DR before public routing. Recovery-control commands require separate operator/IAM authorization, incident/state identity, bounded retries and abort handling; exact wire contracts belong to contract design. Regional request deduplication does not protect history lost to asynchronous replication. See [architecture.md](architecture.md) for the failure matrix and safety gate.
