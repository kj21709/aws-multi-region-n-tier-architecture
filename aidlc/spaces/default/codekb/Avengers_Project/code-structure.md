# Code Structure

## Application and Deployment Layout

| Area | Classification | Contents and pattern |
|---|---|---|
| `App/` | Presentation | `index.html`, `style.css`, `app.js`; direct DOM event handlers and Fetch, no bundler. |
| `cfn/` | Infrastructure and inline application | Parent, VPC, RDS/secrets, Visitor API, HTTP API, static hosting, standalone initializer templates; `rds-readme.md` is operational documentation. |
| `buildspec/` | Deployment preparation | Package, deploy and frontend buildspecs; two instruction documents. Image excluded from deep analysis. |

## Coupling and Change Boundaries

Browser markup IDs couple directly to script selectors; script embeds an API URL. Visitor API combines parsing, credentials, SQL and HTTP response construction in one handler. Schema initializer has its own SQL/environment assumptions. CloudFormation references and exports couple nested stacks; buildspec paths couple packaging, generated outputs and frontend upload. No local application import cycles, standalone Python modules or package manifest were found.

The complete deep-path list appears only in [reverse-engineering-timestamp.md](reverse-engineering-timestamp.md). Framework tooling, other intent records and binary documents are outside deep application analysis.

## Proposed Recovery Change Surface

Existing frontend, inline API/initializer, regional templates and buildspecs require coordinated updates. New recovery orchestration/monitoring and its verification will need separately owned deployable source; its exact layout is deferred to units/infrastructure design. Preserve current source evidence above; no recovery code exists yet. Plan regional parameter changes, stable API config, dual origins, promotion-aware deployment state and non-destructive London-to-Ohio migration together rather than treating this as a region-string replacement.
