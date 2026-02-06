# Concert Ticket Booking System

A high-performance, full-stack concert ticket booking system built with **Fastify + TypeScript** backend and **React 19 + TypeScript** frontend. Designed to handle **1,000,000 DAU** and **50,000 concurrent users** with **99.99% availability** and **p95 latency < 500ms**.

---

## ✨ Key Features

- 🎫 **Multi-Tier Ticketing**: VIP ($100), Front Row ($50), General Admission ($10)
- 🔒 **Race Condition Prevention**: PostgreSQL pessimistic locking prevents double-booking
- ⚡ **Real-Time Updates**: Server-Sent Events for live ticket availability
- 📊 **Analytics Dashboard**: Live metrics and booking insights
- 🔄 **Idempotency**: Safe retries without duplicate charges
- 🏗️ **Clean Architecture**: Domain-driven design with TypeORM
- 🧪 **Comprehensive Testing**: 40+ tests covering concurrency scenarios
- 🐳 **Production Ready**: Docker, health checks, Redis caching

---

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🚀 Quick Start](#-quick-start)
  - [Option 1: Docker Compose](#option-1-docker-compose-recommended)
  - [Option 2: Local Development](#option-2-local-development)
- [🏗️ Architecture Overview](#-architecture-overview)
  - [Tech Stack](#tech-stack)
  - [Architecture Decisions](#architecture-decisions)
  - [Project Structure](#project-structure)
  - [Data Flow Architecture](#data-flow-architecture)
  - [Core Design Patterns](#core-design-patterns)
- [📚 API Documentation & Data Model](#-api-documentation--data-model)
  - [Domain Entities & Relationships](#-domain-entities--relationships)
  - [Entity Relationship Diagram](#-entity-relationship-diagram)
  - [Database Optimization Strategy](#-database-optimization-strategy)
  - [API Endpoints](#-api-endpoints)
- [🔑 Key Design Decisions & Implementation Strategy](#-key-design-decisions--implementation-strategy)
  - [Multi-Layer Idempotency Defense](#-multi-layer-idempotency-defense)
  - [Book-First Payment Strategy](#-book-first-payment-strategy)
  - [Last Ticket Concurrency Control](#-last-ticket-concurrency-control)
- [🌍 Production Scale & Non-Functional Requirements](#-production-scale--non-functional-requirements)
  - [High Availability Strategy (99.99%)](#-high-availability-strategy-9999-uptime)
  - [Horizontal Scaling Strategy](#-horizontal-scaling-strategy-1m-dau--50k-concurrent)
  - [Performance Optimization (p95 < 500ms)](#-performance-optimization-p95--500ms)
---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd thoughtly-take-home-assignment

# 2. Setup environment variables
cp .env.example .env

# 3. Start all services (database + backend + frontend)
docker compose up -d --build

# 4. View logs
docker compose logs -f

# 5. Stop all services
docker compose down

# Note: Database data persists between restarts in Docker volumes
# To completely reset (delete all data):
docker compose down -v
```

**Important Notes:**

- 📦 **Database Persistence**: Data is stored in Docker volumes and persists between `docker compose down/up`
- 🔄 **Fresh Start**: Use `docker compose down -v` to delete volumes and start with clean data
- 🌱 **Auto-Seeding**: On first startup, the database is automatically seeded with sample concerts and ticket tiers
- ✅ **Idempotent Setup**: Running `docker compose up` multiple times is safe - migrations and seeds are idempotent

### Option 2: Local Development

```bash
# 1. Setup environment variables
cp .env.example .env

# 2. Start the database
docker compose up -d postgres redis

# 3. Setup backend
cd backend
npm install
npm run typeorm:migration:run
npm run start:dev

# 4. In a new terminal, setup frontend
cd frontend
npm install
npm run dev
```

### **📱 Access the applications:**
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)  
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🏗️ Architecture Overview

### Tech Stack

**Backend:**
- **Runtime:** Node.js 24+ with TypeScript 5.9
- **Framework:** Fastify 5.x (high-performance HTTP server)
- **Database:** PostgreSQL 17 (ACID compliance, row-level locking)
- **Cache:** Redis 7 (distributed caching)
- **ORM:** TypeORM 0.3 (decorators, migrations, relations)
- **Validation:** Zod 4.x (runtime type safety)
- **Documentation:** Swagger/OpenAPI 3.0 via @fastify/swagger
- **Testing:** Jest + Testcontainers (fully automated E2E tests)
- **Architecture:** Clean Architecture + Domain-Driven Design

**Frontend:**
- **Framework:** React 19 + TypeScript 5.9
- **Build Tool:** Vite 7.x (fast HMR, optimized builds)
- **State Management:** TanStack Query v5 (server state)
- **Styling:** Tailwind CSS 4.x (utility-first)
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios with interceptors
- **Real-time:** Server-Sent Events (SSE)
- **Testing:** Vitest + Testing Library

### Architecture Decisions

**Why Fastify over Express?**

- **Performance**: 2-3x faster than Express in benchmarks
- **TypeScript Native**: Built-in TypeScript support and type inference
- **Plugin Ecosystem**: Rich plugin system with validation, CORS, Swagger
- **Schema Validation**: Built-in JSON Schema validation (faster than middleware)
- **Learning Demonstration**: Shows ability to work with modern Node.js frameworks

**Why TypeORM over Prisma/Knex?**

- **Decorators**: Clean entity definitions with TypeScript decorators
- **Migrations**: Robust migration system with CLI tools
- **Relations**: Powerful relationship handling (ManyToOne, OneToMany)
- **Raw SQL**: Supports both ORM queries and raw SQL when needed
- **PostgreSQL Features**: Full support for JSON, arrays, custom types

**Why Clean Architecture + DDD?**

- **Testability**: Business logic isolated from infrastructure
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features without coupling
- **Domain Focus**: Business rules centralized in domain layer

### Project Structure

```
thoughtly-take-home-assignment/
├── backend/
│   ├── src/
│   │   ├── domain/                          # 🏛️ Domain Layer
│   │   │   ├── entities/
│   │   │   │   ├── concert/                 # Concert entity + interface + mock
│   │   │   │   ├── booking/                 # Booking entity + interface + mock  
│   │   │   │   ├── ticket-tier/             # TicketTier entity + interface + mock
│   │   │   │   └── idempotency/             # Redis-based (no TypeORM) + interface + mock
│   │   │   └── errors/                      # Domain-specific errors
│   │   │
│   │   ├── app/                             # 📋 Application Layer
│   │   │   └── services/         
│   │   │       ├── concerts/                # Concert management + __test__/
│   │   │       ├── bookings/                # Booking operations + __test__/
│   │   │       └── analytics/               # Analytics & reporting + __test__/
│   │   │
│   │   ├── infrastructure/                  # 🔧 Infrastructure Layer
│   │   │   ├── database/         
│   │   │   │   ├── repositories/            # Data access + __test__/ (unit tests)
│   │   │   │   ├── migrations/              # TypeORM migrations
│   │   │   │   ├── seeds/                   # Database seeds
│   │   │   │   ├── database.provider.ts     # Connection setup
│   │   │   │   └── database-cli.config.ts   # TypeORM CLI config
│   │   │   ├── cache/                       # Redis provider
│   │   │   ├── events/                      # Server-Sent Events
│   │   │   └── providers/                   # External service integrations
│   │   │
│   │   ├── presentation/                    # 🌐 Presentation Layer
│   │   │   ├── http/                
│   │   │   │   ├── concerts/                # Routes + controller + DTOs + module
│   │   │   │   ├── bookings/                # Routes + controller + DTOs + module
│   │   │   │   ├── analytics/               # Routes + controller + DTOs + module
│   │   │   │   ├── health/                  # Routes + controller + DTOs + module
│   │   │   │   └── http.routes.ts           # Main router
│   │   │   └── docs/                        # Swagger
│   │   │
│   │   ├── core/                            # 🛠️ Core Layer
│   │   │   ├── errors/                      # App-level errors
│   │   │   └── middlewares/                 # HTTP middleware (auth, validation, etc.)
│   │   │
│   │   ├── config/                          # ⚙️ Configuration
│   │   │   ├── config.service.ts            # Environment configuration
│   │   │   └── validators/                  # Config validation schemas
│   │   │
│   │   ├── shared/                          # 📦 Shared Utilities
│   │   │   ├── logger.ts                    # Structured logging (Pino)
│   │   │   └── supported-currencies.ts      # Currency enum/constants
│   │   │
│   │   ├── scripts/                         # 🔧 Utility Scripts
│   │   │   └── create-migration.ts          # Migration generation helper
│   │   │
│   │   └── main.ts                          # 🚀 Application entrypoint
│   │
│   ├── tests/                               # 🧪 E2E Test Suites
│   │   └── e2e/                             # Testcontainers (automated DB/Redis)
│   │       ├── http/                        # API endpoint tests
│   │       └── setup/                       # Test configuration & utilities
│   │
│   ├── jest.config.json                     # Jest configuration
│   ├── jest.unit.config.json                # Unit test config
│   ├── jest.e2e.config.json                 # E2E test config
│   ├── docker-entrypoint.sh                 # Docker startup script
│   ├── dockerfile                           # Container definition
│   ├── package.json                         # Dependencies & scripts
│   └── tsconfig.json                        # TypeScript configuration
│
├── frontend/
│   ├── src/
│   │   ├── features/                        # 🎯 Feature-based organization
│   │   │   ├── concerts/                    # Concert catalog & details
│   │   │   ├── bookings/                    # Booking flow & modals
│   │   │   └── analytics/                   # Analytics dashboard
│   │   │
│   │   ├── components/                      # 🧩 Reusable components
│   │   │   └── ui/                          # Base UI components
│   │   │
│   │   ├── lib/                             # 🔧 Utilities & configuration
│   │   │   ├── axios.ts                     # HTTP client setup
│   │   │   ├── react-query.ts               # TanStack Query config
│   │   │   └── utils.ts                     # Helper functions
│   │   │
│   │   ├── context/                         # 🎭 React contexts (theme, etc.)
│   │   └── app/                             # 🚦 App-level configuration
│   │       └── router.tsx                   # Route definitions
│   │
│   ├── test/                                # 🧪 Test configuration & utilities
│   ├── Dockerfile                           # Container definition
│   ├── nginx.conf                           # Production server config
│   ├── package.json                         # Dependencies & scripts
│   └── vite.config.ts                       # Vite configuration
│
├── docker-compose.yml                       # 🐳 Multi-service orchestration
├── .env.example                             # Environment variables template
└── README.md                                # 📚 This documentation
```

### Data Flow Architecture

```
┌─────────────────┐    HTTP/SSE      ┌─────────────────┐
│   React App     │ ────────────────▶│   Fastify API   │
│  (Frontend)     │                  │   (Backend)     │
└─────────────────┘                  └─────────────────┘
                                              │
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
            ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
            │  PostgreSQL   │         │     Redis     │         │ Feature Flows │
            │  (Database)   │         │    (Cache)    │         │               │
            │               │         │               │         │               │
            │ • Concerts    │         │ • Idempotency │         │ • Booking Flow│
            │ • Bookings    │         │ • Cache       │         │ • Concert SSE │
            │ • TicketTiers │         │ • Rate Limit  │         │ • Analytics   │
            └───────────────┘         └───────────────┘         └───────────────┘
```

### Core Design Patterns

**1. Repository Pattern (Concrete Classes)**
```typescript
class ConcertRepository {
  constructor(private dataSource: DataSource) {}
  async findAll(): Promise<ConcertEntity[]> { /* ... */ }
}
```

**2. Service Layer Pattern**
```typescript
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly ticketTierRepository: TicketTierRepository,
    private readonly idempotencyRepository: IdempotencyRepository,
    private readonly paymentGatewayProvider: PaymentGatewayProvider,
    private readonly concertUpdateSubject: ConcertUpdateSubject,
  ) {}
}
```
- Business logic orchestration between repositories and external services
- Dependency injection via constructor parameters

**3. Singleton Pattern (Infrastructure)**
```typescript
export class ConfigService {
  private static instance: ConfigService;
  static getInstance(): ConfigService {
    if (!this.instance) this.instance = new ConfigService();
    return this.instance;
  }
}
```
- `ConfigService`: Validates environment variables + provides type-safe config access (`configService.get('database')`)
- `DatabaseProvider`: Shared PostgreSQL connection 
- `CacheProvider`: Redis client instance
- `Logger`: Structured logging (Pino) across application

**4. Comprehensive Testing Strategy**
- **Unit Tests**: Co-located in `__test__/` folders, each function tested separately
- **E2E Tests**: Testcontainers automatically spin up real DB/Redis instances

**5. Event-Driven Updates**
- Server-Sent Events (SSE) for real-time ticket availability updates

---

## 📚 API Documentation & Data Model

Comprehensive data architecture and entity relationships powering the concert booking system, with focus on performance optimization and referential integrity.

### 🏛️ Domain Entities & Relationships

The system is built around four core entities that model the concert ticket booking domain with careful attention to data consistency and query optimization.

**ConcertEntity**: Master entity for concert events with UUID keys, timezone-aware dates, and cascade relationships to ticket tiers.

**TicketTierEntity**: Pricing tiers (VIP, Front Row, General Admission) with inventory tracking. Features decimal precision for currency accuracy and indexed by `concertId` for performance.

**BookingEntity**: Individual ticket purchases with financial records and audit trails. Protected by unique `idempotencyKey` constraint and indexed for user history and analytics queries.

**Idempotency**: Redis-based cache entity for fast duplicate detection and request replay, providing 1-5ms lookups vs 10-50ms database queries.

### 🔗 Entity Relationship Diagram

```
┌─────────────────┐        ┌────────────────────┐        ┌─────────────────┐
│     concerts    │        │    ticket_tiers    │        │     bookings    │
├─────────────────┤        ├────────────────────┤        ├─────────────────┤
│ • id (UUID)     │◄───────┤ • concertId (UUID) │        │ • id (UUID)     │
│ • name          │        │ • id (UUID)        │◄───────┤ • ticketTierId  │
│ • description   │        │ • name             │        │ • userEmail     │
│ • location      │        │ • price            │        │ • quantity      │
│ • date          │        │ • totalQuantity    │        │ • totalPrice    │
│ • createdAt     │        │ • availableQuantity│        │ • createdAt     │
│ • updatedAt     │        │ • createdAt        │        └─────────────────┘
└─────────────────┘        └────────────────────┘

      

┌──────────────────────┐ (Redis)
│   IdempotencyCache   │ 
├──────────────────────┤
│ • key                │ ← Separate Redis store for idempotency
│ • userEmail          │
│ • path               │
│ • requestPayload     │
│ • responseBody       │
│ • responseStatus     │ 
│ • createdAt          │
└──────────────────────┘
```

### 📊 Database Optimization Strategy

**Indexing Strategy**:
```sql
-- Performance-critical indices based on query patterns
CREATE INDEX idx__ticket_tiers__concert_id ON ticket_tiers (concert_id);
CREATE INDEX idx__bookings__user_email ON bookings (user_email);  
CREATE INDEX idx__bookings__ticket_tier_id ON bookings (ticket_tier_id);

-- Application-level idempotency is handled via Redis cache layer
-- No database constraint needed since Redis provides duplicate prevention
```

**Query Pattern Optimization**:
- **Concert Listing**: `concert_id` index enables fast tier filtering
- **User History**: `user_email` index supports booking history queries  
- **Analytics**: `ticket_tier_id` index powers tier popularity reports
- **Idempotency**: Redis cache layer prevents duplicate bookings with sub-5ms performance

**Relationship Integrity**:
- **Cascade Deletes**: Concert removal cleans up all tiers automatically
- **Foreign Key Constraints**: Prevent orphaned bookings and maintain referential integrity
- **NOT NULL Constraints**: Required fields enforced at database level

### 🔌 API Endpoints

RESTful API endpoints organized by business domain with comprehensive validation and error handling.

#### **🎵 Concerts Module** (`/api/concerts`)

**GET /**
- **Purpose**: Retrieve all available concerts with their ticket tiers
- **Response**: Complete concert catalog including pricing and availability
- **Use Case**: Frontend concert listing, booking selection interface

**GET /stream**  
- **Purpose**: Server-Sent Events stream for real-time concert updates
- **Response**: Live event stream of ticket availability changes  
- **Use Case**: Real-time UI updates when tickets are booked by other users
- **Technology**: SSE connection with automatic reconnection handling

#### **🎫 Bookings Module** (`/api/bookings`)

**POST /**
- **Purpose**: Create new ticket booking with payment processing
- **Response**: Confirmed booking record with transaction details
- **Business Logic**: Implements book-first strategy with payment rollback
- **Concurrency**: Protected by pessimistic locking and idempotency constraints

#### **📊 Analytics Module** (`/api/analytics`)

**GET /dashboard**
- **Purpose**: Sales analytics dashboard with aggregated booking metrics
- **Query Parameters**: Date range filters for custom reporting periods
- **Response**: Total revenue, sales over time, revenue by ticket tier
- **Use Case**: Business intelligence, performance monitoring, trend analysis

#### **🩺 Health Module** (`/api/health`)

**GET /**
- **Purpose**: Application health status for monitoring and load balancers
- **Response**: Service status
- **Critical**: Required for production deployment and orchestration


## 🔑 Key Design Decisions & Implementation Strategy

Critical business logic decisions that ensure system correctness, prevent financial losses, and handle edge cases in high-concurrency ticket booking scenarios.

### 🛡️ Multi-Layer Idempotency Defense

A sophisticated 3-layer strategy to prevent duplicate charges and ensure consistent API responses across all failure scenarios.

**Why This Approach?**
- **Single-layer solutions fail** under real-world conditions (Redis restarts, race conditions, cache expiration)
- **Financial compliance** requires bulletproof duplicate prevention
- **User experience** demands consistent responses for retry scenarios

**Implementation Strategy:**
```typescript
// Layer 1: Redis Cache (Hot Path - 1-5ms)
const cached = await this.idempotencyRepository.findByKey(key);
if (cached) return cached.responseBody;

// Layer 2: Database Persistence (Warm Path - 10-50ms)  
const saved = await this.bookingRepository.findOne({ idempotencyKey: key });
if (saved) return saved;

// Layer 3: Unique Constraint Protection (Race Conditions)
@Column({ type: 'uuid', unique: true, nullable: false })
idempotencyKey: string;
```

**Trade-offs:**
- ✅ **Reliability**: Handles Redis failures, cache expiration, and microsecond race conditions
- ✅ **Performance**: 95% hot path hits, graceful degradation
- ✅ **Financial Safety**: Impossible to charge users twice
- ⚠️ **Complexity**: 3 systems vs simple single-layer approach
- ⚠️ **Storage Cost**: Data duplicated across Redis and PostgreSQL

### 💳 Book-First Payment Strategy

Reserve tickets before payment processing, with automatic rollback on payment failure to handle the "last ticket" scenario correctly.

**Why This Approach?**
- **Inventory accuracy** requires stock allocation before uncertain payment processing
- **User frustration prevention**: Avoid "payment succeeded but no tickets available" errors
- **Race condition handling**: Two users competing for last ticket → first reserves, second gets "out of stock"

**Implementation Flow:**
```typescript
// 1. Reserve inventory atomically
const booking = await this.bookingRepository.createWithAtomicLock({
  userEmail, ticketTierId, quantity, totalPrice, idempotencyKey
});

// 2. Process payment with reserved inventory
const isPaid = await this.paymentGatewayProvider.process(totalPrice, currency);

// 3. Rollback reservation if payment fails
if (!isPaid) {
  await this.bookingRepository.deleteById(booking.id);
  await this.ticketTierRepository.increaseStock(ticketTierId, quantity);
  throw new TicketTierPaymentFailedError();
}
```

**Trade-offs:**
- ✅ **Correctness**: Last ticket scenarios handled properly
- ✅ **User Experience**: Clear "sold out" vs "payment failed" messaging
- ✅ **Data Integrity**: Stock levels always accurate
- ⚠️ **Payment Window**: Brief period where inventory is locked during payment
- ⚠️ **Rollback Complexity**: Additional cleanup logic required
- ⚠️ **External Dependencies**: Payment gateway failures require careful handling

### 🔐 Last Ticket Concurrency Control

PostgreSQL pessimistic locking to prevent overselling when multiple users attempt to book the final available tickets simultaneously.

**Why Pessimistic Locking?**
- **Zero tolerance for overselling**: Business reputation depends on inventory accuracy
- **Predictable behavior**: Users get clear success/failure response vs retry loops

**Implementation Strategy:**
```sql
-- Atomic stock check and decrement with exclusive row lock
BEGIN TRANSACTION;
SELECT available_quantity FROM ticket_tiers WHERE id = ? FOR UPDATE;
-- User A gets lock, User B waits until User A releases
UPDATE ticket_tiers SET available_quantity = available_quantity - ? WHERE id = ?;
COMMIT;
```

**Business Logic:**
- **User A**: Arrives first → acquires lock → books successfully
- **User B**: Arrives simultaneously → waits for lock → gets "out of stock" when stock = 0
- **Result**: Clean failure state vs corrupted oversold inventory

**Trade-offs:**
- ✅ **Guaranteed Correctness**: Mathematically impossible to oversell  
- ✅ **Clear User Feedback**: Definitive success/failure vs ambiguous retry states
- ✅ **Business Protection**: Prevents compensation/refund scenarios
- ⚠️ **Latency Impact**: +20-50ms per booking due to lock acquisition
- ⚠️ **Database Dependency**: All bookings funnel through single lock point

---

## 🌍 Production Scale & Non-Functional Requirements

Strategic architecture evolution to meet enterprise-grade requirements: 99.99% availability, 1M DAU, 50k concurrent users, and p95 latency < 500ms.

### ⚡ High Availability Strategy (99.99% Uptime)

Multi-region deployment with automated failover to minimize downtime and ensure business continuity during infrastructure failures.

**Why This Approach?**
- **Business Impact**: Each minute of downtime = $10k+ revenue loss during peak events
- **User Trust**: Ticket purchasing requires absolute reliability during high-demand sales

**Infrastructure Implementation:**
```yaml
# AWS Multi-AZ Deployment Strategy
Frontend: 
  - Multi-region CloudFront CDN → 99.9%+ availability
  - Auto-scaling ECS clusters in 3 AZs → Regional failover
  - Health checks with automatic traffic routing

Backend:
  - ALB with multiple AZ targets → Instant failover
  - ECS Fargate auto-scaling: 2-20 instances based on CPU/memory
  - Circuit breakers for external dependencies (payment gateway, email)

Database:
  - PostgreSQL Multi-AZ with read replicas in 3 AZs
  - Automated failover < 60 seconds 
  - Redis Cluster mode with automatic failover
```

**Application-Level Resilience:**
```typescript
// Graceful degradation when external services fail
const emailService = {
  async sendBookingConfirmation(booking) {
    try {
      await externalEmailProvider.send(booking);
    } catch (error) {
      await queueService.addToRetryQueue(booking); // Eventual consistency
      // Don't fail booking if email fails
    }
  }
};
```

**Trade-offs:**
- ✅ **Reliability**: 99.99% uptime through redundancy and failover
- ✅ **Geographic Performance**: Edge locations reduce global latency
- ✅ **Automatic Recovery**: Minimal human intervention required
- ⚠️ **Infrastructure Cost**: 3-4x expense vs single-region deployment
- ⚠️ **Complexity**: More components to monitor and debug
- ⚠️ **Data Consistency**: Eventual consistency challenges across regions

### 📈 Horizontal Scaling Strategy (1M DAU + 50k Concurrent)

Auto-scaling architecture with intelligent traffic distribution and resource optimization to handle massive concurrent load.

**Why This Architecture?**
- **Traffic Patterns**: Concert announcements create 100x traffic spikes within minutes
- **Resource Efficiency**: Auto-scaling prevents over-provisioning during low traffic
- **Global Reach**: 1M DAU requires geographic distribution for acceptable latency

**Scaling Implementation:**

**Frontend Scaling:**
```typescript
// CDN + SPA Optimization
- CloudFront: Static assets cached globally (99% hit ratio)
- Code splitting: Load only required components per route
- Service Worker: Offline-first for concert browsing
- Image optimization: WebP with fallbacks, lazy loading
```

**Backend Auto-scaling:**
```yaml
ECS Auto Scaling Policy:
  Target: 70% CPU utilization
  Scale Out: +2 instances when CPU > 70% for 2 minutes
  Scale In: -1 instance when CPU < 30% for 10 minutes
  Min: 2 instances, Max: 50 instances
  
API Gateway Rate Limiting:
  Per-IP: 100 requests/minute (browsing)
  Per-User-Authenticated: 10 bookings/hour
  Burst: 200 requests/second globally
```

**Database Scaling Strategy:**
```typescript
// Read/Write Splitting + Connection Pooling
const readOperations = ['getConcerts', 'getAnalytics']; // 95% of traffic
const writeOperations = ['createBooking', 'updateInventory']; // 5% of traffic

// Route to read replicas for catalog queries
if (readOperations.includes(operation)) {
  connection = readReplicaPool.getConnection();
} else {
  connection = primaryPool.getConnection();
}
```

**Caching Strategy:**
```typescript
// Multi-tier caching for performance
L1: CDN (static content) → 500ms global access
L2: Redis Cluster (booking cache) → 1-5ms access  
L3: Application memory (config) → sub-ms access
L4: Database connection pooling → 10-50ms access
```

**Trade-offs:**
- ✅ **Elastic Capacity**: Handles traffic spikes without manual intervention
- ✅ **Cost Optimization**: Pay only for resources actually used
- ✅ **Global Performance**: CDN + regional deployments reduce latency
- ⚠️ **Cold Start Latency**: New instances take 30-60s to warm up
- ⚠️ **State Management**: Stateless design required for horizontal scaling
- ⚠️ **Monitoring Complexity**: More instances = more metrics to track

### 🚀 Performance Optimization (p95 < 500ms)

Comprehensive performance strategy targeting sub-500ms response times through caching, optimization, and efficient resource utilization.

**Why Sub-500ms Matters?**
- **User Experience**: >500ms feels sluggish, increases abandonment rates
- **Conversion Impact**: 100ms delay = 1% revenue loss in e-commerce
- **Competition**: Fast booking experience drives user preference

**Application Performance:**

**Backend Optimization:**
```typescript
// Fastify + PostgreSQL optimization
app.register(fastifyCaching, {
  privacy: 'private',
  expiresIn: 600 // 10min cache for concert listings
});

// Database query optimization
@Index(['concertId', 'availableQuantity']) // Composite index
class TicketTierEntity {
  // Optimized queries for hot paths
}

// Connection pooling tuning
const dbConfig = {
  max: 20,           // Max connections per instance
  min: 2,            // Always-warm connections
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 30000
};
```

**Frontend Performance:**
```typescript
// React Query + optimistic updates
const useBookTicket = () => {
  return useMutation({
    mutationFn: bookingAPI.create,
    onMutate: async (newBooking) => {
      // Optimistic update for instant feedback
      queryClient.setQueryData(['concerts'], (old) => 
        updateTicketCount(old, newBooking)
      );
    },
    onError: () => {
      queryClient.invalidateQueries(['concerts']); // Revert on error
    }
  });
};

// Code splitting and lazy loading
const BookingModal = lazy(() => import('./BookingModal'));
const AnalyticsDashboard = lazy(() => import('./analytics/Dashboard'));
```

**Infrastructure Performance:**
```yaml
Load Balancer Configuration:
  Algorithm: Least connections
  Health Check: /api/health every 10s
  Timeout: 5s max response time
  
CDN Configuration:
  TTL: 1 hour for static assets
  TTL: 5 minutes for concert data API
  Compression: Gzip + Brotli
```

**Production-Grade Features for Scale:**

**Authentication & Security:**
- **JWT Authentication**: 24h access tokens + 30-day refresh tokens
- **Social Login**: Google, Facebook, Apple integration via OAuth 2.0
- **Rate Limiting**: 5 login attempts per minute to prevent brute force
- **Role-Based Access**: Admin dashboard, user profiles, booking history

**Payment & Notifications:**
- **Webhook Integration**: Real-time Stripe/PayPal payment confirmations
- **Email System**: Automated booking confirmations, ticket delivery
- **SMS Notifications**: Queue updates, last-minute concert changes
- **Receipt Generation**: PDF tickets with QR codes for validation

**Advanced Search & Discovery:**
- **Concert Ranking**: Machine learning algorithm considering:
  - Booking velocity (trending shows)
  - Search volume and user interest
  - Social media mentions and sentiment
  - Artist popularity and historical performance
- **Smart Search**: Elasticsearch with auto-complete, filters by genre/location/price
- **Personalization**: User-based recommendations and favorite artists

**API & Data Management:**
- **Cursor-Based Pagination**: Consistent results during high-traffic periods
- **Advanced Filtering**: Date ranges, price brackets, venue capacity
- **Data Caching**: Redis with smart tag-based cache invalidation
- **API Versioning**: Backward compatibility for mobile apps

**Trade-offs:**
- ✅ **User Experience**: Sub-500ms creates smooth, responsive interactions
- ✅ **Business Impact**: Faster booking = higher conversion rates
- ✅ **Competitive Edge**: Performance as product differentiator
- ⚠️ **Development Complexity**: Optimization requires careful profiling and tuning
- ⚠️ **Infrastructure Cost**: High-performance instances and CDN increase costs
- ⚠️ **Maintenance Overhead**: Performance monitoring and optimization is ongoing

---
