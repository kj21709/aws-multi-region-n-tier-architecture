# Technology Stack

## Observed Runtime and Infrastructure

| Technology | Version evidence | Use |
|---|---|---|
| HTML/CSS/JavaScript | No browser/ECMAScript pin | Native DOM, Fetch and styling; no frontend framework. |
| Python | Lambda and package buildspec specify 3.12 | Inline request and initialization handlers. |
| MySQL | Template default 8.0 | Private primary and cross-region read replica. |
| CloudFormation | Template format 2010-09-09 | Nested stack provisioning. |
| boto3 | Runtime import; application version not pinned | Secrets Manager retrieval. |
| mysql.connector | External Python 3.12 Klayers layer revision 9; package version unknown | SQL connectivity. |

## Build and Browser Dependencies

AWS CLI, jq, shell and sed are build-environment dependencies without application version locks. Google Fonts/Inter and IPAPI are external browser dependencies without pinned content/API versions. No application test framework, coverage configuration, formatter/linter configuration or package/dependency lockfile was discovered. Versions describe repository declarations; service availability, regional layer support and current security status were not verified online.

## Proposed Recovery Additions (Not Current Code)

The target retains MySQL RDS and Python Lambda, changes the standby from `eu-west-2` to `us-east-2`, and proposes Ohio EventBridge/Step Functions/Lambda orchestration with durable conditional incident state, CloudWatch/external probes and alarms, Route 53 readiness-controlled API routing, regional API Gateway custom domains/ACM certificates, and dual S3 CloudFront origins with OAC. The incident store is controller serialization, not transaction fencing. Final fencing/coordination technology remains a requirements/design gate. No new runtime package version, price, service quota, installed artifact or live resource has been verified.
