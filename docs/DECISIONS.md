# Architecture Decision Records (ADRs)

## ADR-001: Zero-Setup Database with SQLite and Prisma
- **Context**: The project must run offline and be trivially evaluated with zero setup by reviewers on any OS (`npm install && npm run db:setup && npm run dev`).
- **Decision**: Use SQLite with a schema designed to be fully compatible with PostgreSQL. All relations, foreign keys, and indexes are defined standardly in Prisma.
- **Consequences**: No external Docker, PostgreSQL daemon, or cloud database credentials are required.

## ADR-002: Fictional Carrier & Transit Naming
- **Context**: Real airline/bus trademarks and logos must not be infringed or hotlinked.
- **Decision**: Use realistic, fictional airline names ("Skyline Air", "Deccan Wings", "PeakJet", "Coastal Express", etc.) and distinct 2-character monogram badges instead of corporate logos.
- **Consequences**: Safe for distribution and academic evaluation without legal or trademark friction.

## ADR-003: Pure Domain Logic Layer
- **Context**: Pricing, refund calculations, seat booking concurrency checks, and promo code validations must be robust and unit-tested in isolation from UI and database adapters.
- **Decision**: Implement all core pricing, cancellation tiers, and availability algorithms in `src/lib/domain/` as pure functions returning typed results (`Result<T, E>`).
- **Consequences**: Direct testability with Vitest; easy reuse across server actions, route handlers, and checkout verifications.

## ADR-004: Server-Authoritative Checkout & 10-Minute Lock
- **Context**: In travel booking, seat availability and pricing fluctuate. Client-side tampering must be prevented.
- **Decision**: When starting checkout, an immutable `CheckoutSession` is created with a server-computed `priceSnapshot` and an `expiresAt` timestamp (now + 10 minutes). Double submission is prevented using `idempotencyKey`. If a lock expires or is tampered with, the server rejects payment.
- **Consequences**: Eliminates race conditions and prevents malicious price tampering.

## ADR-005: Deterministic Seed Pipeline with Mulberry32 PRNG
- **Context**: The mock data layer needs realistic multi-stop train schedules, dynamic flight prices across dates, and plausible AVL/RAC/WL availability without non-deterministic randomness breaking test assertions.
- **Decision**: Implement a seeded 32-bit PRNG (`mulberry32`) in `prisma/seed.ts` so every run yields identical, reproducible schedules and prices.
- **Consequences**: Consistent evaluation, reproducible testing, and predictable booking data.
