# React to Full Stack — 201

_The learning path for engineers who are already productive in React and have foundational knowledge in server-side code._

|                   |                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **In React**      | **Mistakes are transient.** A refresh clears them. State resets. The blast radius is one tab.                                                    |
| **On the server** | **Mistakes are durable.** A bad write stays wrong. A missing index appears at ten million rows. A missing permission check is a client incident. |

That is why this path spends its time on data correctness, permissions and failure — not on syntax.

## Exit stages

- **Stage 1** — Given a story that needs a new table and a few endpoints, you can build it on your own.
- **Stage 2** — It broke at 11pm, you can’t reproduce it locally, and you can still find and fix it.
- **Stage 3** — You can design a solution others build from, defend it, and take someone through Stage 1.

## Module index

| #    | Module                                                                                                | Tags               | Part                       |
| ---- | ----------------------------------------------------------------------------------------------------- | ------------------ | -------------------------- |
| 1.1  | [The server as a runtime — advanced internals](#11-the-server-as-a-runtime--advanced-internals)       | Core               | Build the application half |
| 1.2  | [Project structure and configuration](#12-project-structure-and-configuration)                        | Core               | Build the application half |
| 1.3  | [HTTP as an author — advanced API design](#13-http-as-an-author--advanced-api-design)                 | Core               | Build the application half |
| 1.4  | [Routing and middleware — advanced patterns](#14-routing-and-middleware--advanced-patterns)           | Core               | Build the application half |
| 1.5  | [Application architecture](#15-application-architecture)                                              | Core               | Build the application half |
| 1.6  | [Relational data and SQL — advanced query design](#16-relational-data-and-sql--advanced-query-design) | Core, Largest gap  | Build the application half |
| 1.7  | [Migrations](#17-migrations)                                                                          | Core               | Build the application half |
| 1.8  | [Transactions and concurrency](#18-transactions-and-concurrency)                                      | Core               | Build the application half |
| 1.9  | [Authentication — advanced protocols](#19-authentication--advanced-protocols)                         | Core               | Build the application half |
| 1.10 | [Authorization — advanced enforcement](#110-authorization--advanced-enforcement)                      | Core, Highest risk | Build the application half |
| 1.11 | [Querying at scale](#111-querying-at-scale)                                                           | Core               | Build the application half |
| 1.12 | [Time, money and locale](#112-time-money-and-locale)                                                  | Core               | Build the application half |
| 1.13 | [Audit trails](#113-audit-trails)                                                                     | Core               | Build the application half |
| 1.14 | [Testing on the server — advanced practices](#114-testing-on-the-server--advanced-practices)          | Core               | Build the application half |
| 1.15 | [Document databases](#115-document-databases)                                                         | As needed          | Build the application half |
| 1.16 | [Caching fundamentals](#116-caching-fundamentals)                                                     | As needed          | Build the application half |
| 2.1  | [Logging — advanced observability](#21-logging--advanced-observability)                               | Core               | Ship it and support it     |
| 2.2  | [Telemetry and tracing](#22-telemetry-and-tracing)                                                    | Core               | Ship it and support it     |
| 2.3  | [Health checks and alerting](#23-health-checks-and-alerting)                                          | Core               | Ship it and support it     |
| 2.4  | [Resilience](#24-resilience)                                                                          | Core               | Ship it and support it     |
| 2.5  | [Idempotency](#25-idempotency)                                                                        | Core               | Ship it and support it     |
| 2.6  | [Security](#26-security)                                                                              | Core               | Ship it and support it     |
| 2.7  | [Performance](#27-performance)                                                                        | Core               | Ship it and support it     |
| 2.8  | [Background processing and messaging](#28-background-processing-and-messaging)                        | Core               | Ship it and support it     |
| 2.9  | [Scheduled and recurring work](#29-scheduled-and-recurring-work)                                      | Core               | Ship it and support it     |
| 2.10 | [Docker — advanced practices](#210-docker--advanced-practices)                                        | Core               | Ship it and support it     |
| 2.11 | [CI/CD](#211-cicd)                                                                                    | Core               | Ship it and support it     |
| 2.12 | [File processing and reporting](#212-file-processing-and-reporting)                                   | As needed          | Ship it and support it     |
| 2.13 | [Notifications and email](#213-notifications-and-email)                                               | As needed          | Ship it and support it     |
| 2.14 | [Real-time](#214-real-time)                                                                           | As needed          | Ship it and support it     |
| 2.15 | [Webhooks and third-party integration](#215-webhooks-and-third-party-integration)                     | As needed          | Ship it and support it     |
| 2.16 | [Azure identity and secrets — advanced concepts](#216-azure-identity-and-secrets--advanced-concepts)  | Core               | Ship it and support it     |
| 2.17 | [Azure compute and data — advanced concepts](#217-azure-compute-and-data--advanced-concepts)          | Core               | Ship it and support it     |
| 2.18 | [Azure storage and edge](#218-azure-storage-and-edge)                                                 | Core               | Ship it and support it     |
| 3.1  | [Distributed systems](#31-distributed-systems)                                                        | Core               | Design it                  |
| 3.2  | [Event-driven architecture](#32-event-driven-architecture)                                            | Core               | Design it                  |
| 3.3  | [Data architecture](#33-data-architecture)                                                            | Core               | Design it                  |
| 3.4  | [Scalability](#34-scalability)                                                                        | Core               | Design it                  |
| 3.5  | [Availability and disaster recovery](#35-availability-and-disaster-recovery)                          | Core               | Design it                  |
| 3.6  | [Security architecture](#36-security-architecture)                                                    | Core               | Design it                  |
| 3.7  | [Decomposition and integration](#37-decomposition-and-integration)                                    | Core               | Design it                  |
| 3.8  | [Migration and modernization](#38-migration-and-modernization)                                        | Core               | Design it                  |
| 3.9  | [Trade-offs and leadership](#39-trade-offs-and-leadership)                                            | Core               | Design it                  |

## 01 · Build the application half

_16 modules_

**Objective:** build the application layer end-to-end — server fundamentals, data modelling, and the API surface — and back it with the safety rails, correctness under concurrency, authentication, authorization and testing that make it trustworthy under real use, not just on your machine.

### 1.1 The server as a runtime — advanced internals

`Core`

> _The process is long-lived and shared. One slow request affects every user, not just one tab._

- Worker threads and the cluster module
- Streams and backpressure
- Buffer and binary data
- Child processes and native addons
- Module-scope variables are shared global state
- Server-side debugging

**Resources:** [Node.js — Learn](https://nodejs.org/en/learn)

### 1.2 Project structure and configuration

`Core`

> _Configuration arrives at runtime, not build time, and a missing value should crash startup._

- Feature-based folder structure
- Modular monolith architecture and enforcing module boundaries
- Server tsconfig
- Typed config loader with schema validation and fail-fast
- Environment overlays
- Docker Compose for local dependencies

**Resources:** [Twelve-Factor App — Config](https://12factor.net/config) · [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### 1.3 HTTP as an author — advanced API design

`Core`

> _You now choose the semantics you used to complain about._

- Safe, idempotent and cacheable methods
- Caching headers and ETags
- CORS from the server side
- Cookies and same-site
- Content types and payload limits
- API versioning
- OpenAPI and generated clients

**Resources:** [MDN — HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) · [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) · [OpenAPI Specification](https://spec.openapis.org/)

### 1.4 Routing and middleware — advanced patterns

`Core`

> _Cross-cutting concerns belong in the pipeline, not in every handler._

- Sub-router composition and mounting
- API rate limiting and throttling middleware
- Request context and correlation ID
- Body parsing and upload handling

**Resources:** [Express — Routing](https://expressjs.com/en/guide/routing.html) · [Express — Writing Middleware](https://expressjs.com/en/guide/writing-middleware.html) · [Next.js — Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

### 1.5 Application architecture

`Core`

> _Layers exist so a change in one place does not require changes everywhere._

- Where business rules live
- Dependency injection and testability
- Entities and invariants
- Structuring by feature

**Resources:** [Domain-Driven Hexagon — practical Node/TypeScript reference architecture](https://github.com/Sairyss/domain-driven-hexagon) · [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### 1.6 Relational data and SQL — advanced query design

`Core` `Largest gap`

> _The schema outlives the code, and indexes are a design decision._

- Data types and precision
- Writing SQL before touching an ORM
- Indexes, composite ordering, selectivity
- Reading a query plan
- N+1 queries
- Connection pooling
- ORM vs query builder vs raw SQL

**Resources:** [Use The Index, Luke](https://use-the-index-luke.com/) · [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html) · [explain.dalibo.com](https://explain.dalibo.com/)

### 1.7 Migrations

`Core`

> _A migration runs once, against real data, possibly during traffic._

- Tooling, ordering, checksums
- Reversible vs forward-only
- Data vs schema migrations
- Expand-and-contract for zero downtime
- Failure partway through
- Migrations as a pipeline stage

**Resources:** [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)

### 1.8 Transactions and concurrency

`Core`

> _Without a transaction boundary you have no idea what a partial failure leaves behind._

- Transaction scope
- Isolation levels and what each prevents
- Lost update, double-booking, check-then-act
- Optimistic vs pessimistic locking
- Deadlocks

> ⚠️ **Common mistake —** Requests are not guaranteed to run in order just because the UI feels sequential. Two browser tabs open at the same time are enough to break an implementation that assumes otherwise.

**Resources:** [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

### 1.9 Authentication — advanced protocols

`Core`

> _You have been receiving tokens; now you issue trust based on them._

- Authentication vs authorization
- OAuth 2.0 and OIDC flows
- Authorization code with PKCE
- Validating signature, issuer, audience and expiry
- Sessions vs tokens
- Refresh and revocation
- Token propagation
- Entra ID app registrations, scopes and app roles

**Resources:** [Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/) · [OAuth 2.0 Simplified](https://www.oauth.com/) · [jwt.io](https://jwt.io/) · [OWASP — Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) · [Passport.js documentation](https://www.passportjs.org/)

### 1.10 Authorization — advanced enforcement

`Core` `Highest risk`

> _Enforced server-side at the data layer, or not enforced._

- RBAC vs ABAC vs policy-based access control
- Delegated and scoped authorization — API keys and service accounts
- Multi-tenancy and tenant resolution from the token
- Tenant isolation strategies
- Testing the denied and wrong-tenant cases

**Resources:** [OWASP Top 10](https://owasp.org/Top10/) · [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/) · [CASL — isomorphic authorization library](https://casl.js.org/)

### 1.11 Querying at scale

`Core`

> _Every list endpoint eventually returns too many rows._

- Offset vs cursor pagination and why offset breaks
- Stable sort tiebreakers
- Full-text search and when a search service is warranted
- Response shaping

**Resources:** [Use The Index, Luke — No Offset](https://use-the-index-luke.com/no-offset)

### 1.12 Time, money and locale

`Core`

> _The classic durable-mistake area. Cheap to get right on day one, expensive to fix later._

- UTC storage and display conversion
- Timezone vs offset
- DST edge cases
- Date-only vs instant
- Decimal precision for money, never floats
- Currency codes and minor units
- Locale-aware formatting and collation

**Resources:** [PostgreSQL — Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html) · [MDN — Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

### 1.13 Audit trails

`Core`

> _Who changed what, when, and what it was before. A business requirement, not diagnostics — and routinely confused with logging._

- Audit table design vs event log
- What to capture: actor, action, entity, before, after, timestamp
- Immutability and append-only
- Retention obligations
- Exposing an audit view to users
- Why this is not your application logs

**Resources:** [pgAudit — PostgreSQL audit extension](https://github.com/pgaudit/pgaudit) · [OWASP — Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

### 1.14 Testing on the server — advanced practices

`Core`

> _A test that passes on the naive implementation is not a test._

- Business logic isolated from I/O
- Integration tests against a real database, not mocks
- Fixtures and deterministic data
- Testing failure paths — denial, constraint violation, partial failure

**Resources:** [Node.js — Learn: Test runner](https://nodejs.org/en/learn/test-runner/introduction) · [Vitest](https://vitest.dev/)

### 1.15 Document databases

`As needed`

> _Only when a project uses MongoDB._

- Documents vs rows
- Embedding vs referencing and the size ceiling
- Indexing and compound index order
- Aggregation pipeline
- Transaction limits
- Mongoose schema modelling and validation

**Resources:** [MongoDB — Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/) · [Mongoose documentation](https://mongoosejs.com/docs/guide.html)

### 1.16 Caching fundamentals

`As needed`

> _Caching is easy; invalidation is the whole problem._

- What is safely cacheable
- Cache-aside and TTL
- Invalidation and cache keys
- Redis data structures and eviction
- Cache stampede

> 💡 You already understand query cache invalidation from TanStack Query. Same problem, blast radius of everyone instead of one browser.

**Resources:** [Redis docs](https://redis.io/docs/latest/) · [Caching challenges and strategies](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/)

## 02 · Ship it and support it

_18 modules_

**Objective:** operate what you built — observability, resilience, security and the Azure deployment pipeline — so a production incident is diagnosable and fixable without reproducing it locally.

### 2.1 Logging — advanced observability

`Core`

> _A log line is a question you are answering for someone at 3am._

- Correlation ID from browser through every service
- Log sampling and noise reduction at high volume
- Redaction and masking patterns before logs leave the process
- Never logging PII, secrets or tokens
- Querying with KQL
- Volume as a cost

> ⚠️ **Common mistake —** Relying only on console.log for observability. This only works when one person is watching one browser or terminal — it does not scale to a team debugging a production incident.

**Resources:** [Pino](https://getpino.io/) · [Winston](https://github.com/winstonjs/winston) · [Node.js Logging Best Practices](https://betterstack.com/community/guides/logging/nodejs-logging-best-practices/) · [Azure Monitor — Log queries](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-query-overview)

### 2.2 Telemetry and tracing

`Core`

> _Logs alone cannot tell you where the time went once there is more than one process._

- Metrics, logs and traces — what each answers
- Spans and context propagation
- Application Insights automatic and custom instrumentation
- Dependency tracking
- End-to-end transaction view
- Diagnosing a slow request from telemetry alone

**Resources:** [OpenTelemetry — Concepts](https://opentelemetry.io/docs/concepts/) · [Application Insights overview](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

### 2.3 Health checks and alerting

`Core`

> _An alert nobody acts on is worse than no alert._

- Liveness, readiness and startup probes
- Dependency health and cascading failure
- SLI, SLO and error budget
- Choosing a threshold
- Symptom-based vs cause-based alerting
- Runbooks
- A simple health endpoint and uptime alerting for a single-instance app, without the SRE tooling

**Resources:** [Health Check Response Format for HTTP APIs (IETF draft)](https://inadarei.github.io/rfc-healthcheck/) · [Google SRE Book — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)

### 2.4 Resilience

`Core`

> _Every network call fails eventually. Design for that, not around it._

- Timeouts at every level
- Retries with exponential backoff and jitter
- Which failures are retryable
- Circuit breaker and bulkhead
- Fallback and graceful degradation
- Retry storms
- Graceful shutdown

**Resources:** [Timeouts, retries and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)

### 2.5 Idempotency

`Core`

> _A retry that duplicates a write is worse than the failure it was retrying._

- Idempotency keys — generation, storage, expiry
- At-most-once vs at-least-once
- Duplicate handling in consumers
- The outbox pattern

> ⚠️ **Common mistake —** Assuming a disabled submit button prevents a duplicate request. It does not — a flaky network retry or a second open tab can still submit the same action twice.

**Resources:** [Stripe — Idempotent requests](https://docs.stripe.com/api/idempotent_requests) · [Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

### 2.6 Security

`Core`

> _Security is a property of the diff, not a phase at the end._

- OWASP Top 10, weighted to access control and injection
- SQL and NoSQL injection
- XSS and CSRF
- Security headers
- Secrets never in code or pipeline variables
- Dependency and image scanning
- Encryption at rest and in transit
- PII classification and retention

**Resources:** [OWASP Top 10](https://owasp.org/Top10/) · [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

### 2.7 Performance

`Core`

> _Measure, change one thing, measure again._

- Profiling CPU, memory and event loop lag
- Slow query vs slow render vs slow network
- Query plans and index tuning
- Connection pool sizing
- Load testing
- Percentiles — why p50 lies and p99 matters

**Resources:** [Node.js — Diagnostics](https://nodejs.org/en/learn/diagnostics/user-journey) · [Grafana k6](https://grafana.com/docs/k6/latest/)

### 2.8 Background processing and messaging

`Core`

> _Work that can fail slowly should not happen inside a request._

- What belongs in a request
- Queues and workers
- Queues vs topics
- Message contracts and versioning
- Dead-letter queues and poison messages
- Ordering guarantees and whether you need them
- Competing consumers

**Resources:** [BullMQ documentation](https://docs.bullmq.io/) · [RabbitMQ tutorials](https://www.rabbitmq.com/tutorials) · [Azure Service Bus — Messaging overview](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview) · [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)

### 2.9 Scheduled and recurring work

`Core`

> _Every application has a nightly job, and two instances will run it twice unless you stop them._

- Timer triggers and cron expressions
- Distributed locks and leader election
- Missed runs, catch-up and overlap prevention
- Idempotent jobs
- Monitoring a job that silently stopped running
- Timezone handling in schedules

**Resources:** [node-cron](https://github.com/node-cron/node-cron) · [Redlock — distributed locks with Redis](https://github.com/mike-marcacci/node-redlock) · [Azure Functions — Timer trigger](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer)

### 2.10 Docker — advanced practices

`Core`

> _The image is the deployable unit. Everything not in it is a dependency you must declare._

- Images, layers and cache ordering
- Multi-stage builds
- Non-root user and minimal base
- Healthcheck
- Build-time vs runtime configuration
- Registries and tagging
- Image scanning

**Resources:** [Docker — Build best practices](https://docs.docker.com/build/building/best-practices/)

### 2.11 CI/CD

`Core`

> _If a check is not in the pipeline, it does not exist._

- Lint, typecheck, test, build, scan, deploy
- What runs on commit vs merge
- Artifacts and promotion across environments
- Approvals
- Database migrations as a pipeline stage
- Rolling, blue-green and canary
- Rollback and what it does to the database

**Resources:** [Azure Pipelines](https://learn.microsoft.com/en-us/azure/devops/pipelines/) · [GitHub Actions](https://docs.github.com/en/actions)

### 2.12 File processing and reporting

`As needed`

> _Blob upload is the easy half. Everything after it is where projects lose weeks._

- Parsing uploads — CSV, Excel, streaming large files without loading them into memory
- Generating PDF and Excel
- Async report generation with a job and a download link
- Virus scanning uploads
- Export size limits
- File naming, retention and cleanup

**Resources:** [SheetJS](https://docs.sheetjs.com/) · [Node.js — Stream API](https://nodejs.org/api/stream.html)

### 2.13 Notifications and email

`As needed`

> _Every application has it, nobody teaches it, so it gets built badly every time._

- Transactional email and templating
- Delivery, bounces and complaints
- SPF, DKIM and DMARC
- Unsubscribe and preference handling
- SMS and push
- In-app notification storage and read state
- Digest and batching
- Retry without spamming

**Resources:** [Resend documentation](https://resend.com/docs) · [Postmark — SPF, DKIM and DMARC guide](https://postmarkapp.com/guides/spf-dkim-dmarc) · [Azure Communication Services — Email](https://learn.microsoft.com/en-us/azure/communication-services/concepts/email/email-overview)

### 2.14 Real-time

`As needed`

> _Notifications, live updates, presence, and progress on long jobs._

- Polling vs SSE vs WebSockets and choosing between them
- Connection lifecycle, reconnection and missed messages
- Scaling across instances and why you need a backplane
- Authenticating a socket connection
- Presence and rooms
- Fallback when the connection drops

**Resources:** [Socket.IO documentation](https://socket.io/docs/v4/) · [Socket.IO — Redis adapter (scaling across instances)](https://socket.io/docs/v4/redis-adapter/) · [Azure SignalR Service](https://learn.microsoft.com/en-us/azure/azure-signalr/) · [MDN — Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

### 2.15 Webhooks and third-party integration

`As needed`

> _A developer integrates with a CRM or payment provider in their first month on a project._

- Receiving webhooks — signature verification, replay protection, respond fast and process async
- Sending webhooks — retries, backoff, consumer failures
- Partner rate limits and quotas
- Sandbox vs production credentials
- Handling partner outages
- Integration testing without hitting the partner

**Resources:** [Stripe — Webhooks](https://docs.stripe.com/webhooks) · [Standard Webhooks](https://www.standardwebhooks.com/)

### 2.16 Azure identity and secrets — advanced concepts

`Core`

> _An application should prove who it is without holding a secret._

- Managed identity, system vs user assigned
- Azure RBAC roles and scopes
- Key Vault secrets, keys and certificates
- Key Vault references from app config
- Rotation
- App roles and consent
- On-behalf-of flow

**Resources:** [Managed identities overview](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview) · [Key Vault documentation](https://learn.microsoft.com/en-us/azure/key-vault/)

### 2.17 Azure compute and data — advanced concepts

`Core`

> _The hosting choice is a trade-off between control, cost and operational burden._

- App Service, Container Apps and Functions — and choosing between them
- Scaling rules, revisions, ingress
- Triggers and bindings
- Cold start
- Azure Database for PostgreSQL tiers, HA and backups
- Private endpoints
- Cosmos DB partition keys, RUs and consistency

**Resources:** [Choose an Azure compute service](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/compute-decision-tree)

### 2.18 Azure storage and edge

`Core`

> _Large files never transit your API._

- Blob containers, tiers and lifecycle policies
- SAS tokens and direct-to-blob upload
- Event Grid for storage triggers
- CDN and static content
- API Management gateway and policies
- VNets, private endpoints, custom domains and TLS

**Resources:** [Blob Storage documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/) · [API Management documentation](https://learn.microsoft.com/en-us/azure/api-management/)

## 03 · Design it

_9 modules_

**Objective:** reason about systems, not just features — distribution, event-driven design, data ownership, scalability, availability and security architecture — well enough to propose a design, defend it under challenge, and mentor someone else through Stage 1. Not a course — it runs as design review participation, authoring a design for real work, and mentoring.

### 3.1 Distributed systems

`Core`

- CAP and PACELC in practice
- Consistency models
- Partitioning and replication
- Clock skew and ordering
- Network partitions
- Why distribution is a cost accepted for a benefit, never a default

**Resources:** [Designing Data-Intensive Applications](https://dataintensive.net/) · [Amazon Builders’ Library — Challenges with distributed systems](https://aws.amazon.com/builders-library/challenges-with-distributed-systems/)

### 3.2 Event-driven architecture

`Core`

- Commands vs events vs queries
- Pub-sub and coupling
- Event schema versioning
- Event sourcing and what it costs
- CQRS when read and write genuinely diverge
- Saga and process managers
- Outbox and inbox
- Eventual consistency as a product decision

**Resources:** [microservices.io — Patterns](https://microservices.io/patterns/) · [Martin Fowler — Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

### 3.3 Data architecture

`Core`

- Data ownership and service boundaries
- Polyglot persistence
- Shared database as anti-pattern and when it is right anyway
- Read models and projections
- Analytics separated from transactional
- Retention obligations
- Multi-tenancy at the data tier

**Resources:** [Azure Architecture Center — Data architecture guide](https://learn.microsoft.com/en-us/azure/architecture/data-guide/)

### 3.4 Scalability

`Core`

- Vertical vs horizontal ceilings
- Statelessness as the enabler
- State externalisation
- Read replicas
- Sharding and cross-shard queries
- Queue-based load levelling
- Backpressure
- Finding the actual bottleneck before scaling anything

**Resources:** [Azure Well-Architected — Performance efficiency](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/)

### 3.5 Availability and disaster recovery

`Core`

- SLA arithmetic and composite availability
- Single points of failure
- Availability zones and multi-region
- Active-active vs active-passive
- RTO and RPO as business inputs
- The restore test nobody runs
- Which features degrade first

**Resources:** [Azure Well-Architected — Reliability](https://learn.microsoft.com/en-us/azure/well-architected/reliability/)

### 3.6 Security architecture

`Core`

- Threat modelling with STRIDE
- Trust boundaries
- Zero trust and defence in depth
- Identity architecture across an estate
- Network segmentation
- Key management
- Compliance and data residency
- Audit and non-repudiation
- Supply chain

**Resources:** [Microsoft Threat Modeling Tool](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool) · [Azure Well-Architected — Security](https://learn.microsoft.com/en-us/azure/well-architected/security/)

### 3.7 Decomposition and integration

`Core`

- Modular monolith vs microservices, including team topology
- Bounded contexts
- Coupling and cohesion
- Distributed monolith as the common failure mode
- API gateway and BFF
- Versioning across many consumers
- Contract testing

**Resources:** [Martin Fowler — Microservices](https://martinfowler.com/articles/microservices.html) · [Pact — contract testing](https://docs.pact.io/)

### 3.8 Migration and modernization

`Core`

> _Most client work is not greenfield, so this is the module used first._

- Strangler fig
- Incremental extraction from legacy
- Dual-write, backfill, cutover
- Anti-corruption layer
- Sequencing so value lands before completion
- Knowing when not to migrate

**Resources:** [Martin Fowler — Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html)

### 3.9 Trade-offs and leadership

`Core`

- Framing a decision: options, criteria, constraints
- Non-functionals made measurable
- Architecture decision records others can act on
- Documenting what was rejected
- Defending a design under challenge and conceding well
- Reviewing others’ designs without taking them over
- Mentoring someone through Stage 1
- Estimating a module

**Resources:** [Architecture Decision Records](https://adr.github.io/)

## AI-assisted engineering

Practised from week one and assessed at every module.

- Specification before implementation
- Plan then build, reading the plan as the learning step
- Verification with evidence rather than assertion
- Context as a scarce resource
- Packaging conventions into reusable instructions and reviewers
- Logging what the tool got wrong and what changed so it would not recur

> ⚠️ **The rule.** You must be able to explain every line you ship, with no assistant open. Checked at every Module — three sections of your diff, picked at random.

**Resources:** [Claude Code documentation](https://docs.claude.com/en/docs/claude-code/overview)
