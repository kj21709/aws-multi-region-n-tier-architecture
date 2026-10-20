# Business Overview

## Existing Purpose and Functionality

The repository implements an anonymous visitor registration and lookup page for a small business. Visitors can submit inferred city, region and country, receive an integer registration ID, and retrieve saved IP/location details by ID. It contains no borrower accounts, books, loans, checkout policy or library inventory.

## Approved Change Context

Intent `261015-homenub-library-checkout` replaces that experience with Homenub Library at `www.homenub.com`: catalog availability, one-book checkout using a borrower name/email, durable retry identity, and server-calculated 14-day UTC due dates. These are approved goals, not implemented behavior. Retain the N-tier baseline and preserve visitor data and primary identities where feasible. The subsequent recovery request authorizes necessary regional recovery changes. Accounts, returns, renewals, reservations, fines, email delivery and staff UI are excluded. AWS deployment and DNS changes are deferred.

## Evidence and Limits

Synthesized from the developer handoff under the active intent's `inception/reverse-engineering/developer-scan.md`. Scope and source binding are recorded in [reverse-engineering-timestamp.md](reverse-engineering-timestamp.md). Only repository behavior was inspected; deployed inventory, data and service health remain unknown.

## Requested Recovery Revision

Human feedback requests automatic disaster recovery from `us-east-1` to `us-east-2`, replacing London (`eu-west-2`), and AWS Well-Architected alignment. This covers the whole borrower journey, including checkout writes, rather than static website availability alone. All target recovery mechanisms remain design proposals, absent from application code. Safety takes precedence over automatic promotion when the old writer cannot be fenced. Requirements must settle acceptable downtime, data loss and budget, including whether conditional automatic write recovery meets business needs. See [architecture.md](architecture.md).
