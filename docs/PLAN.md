# Wayfare — Engineering & Implementation Plan

## 1. Architecture Overview

Wayfare is a high-density, multi-modal travel search, booking, and trip management platform built with Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, and SQLite via Prisma.

### Architectural Principles:
1. **Zero External Secrets / Offline Ready**: All inventory is served via a deterministic mock data layer (`src/server/providers/`) seeded with realistic Indian transit networks.
2. **Deterministic Dynamic Pricing**: Base fare is factored by day-of-week, days-to-departure, and simulated seat scarcity.
3. **Server-Authoritative Transactions**: Client calculations are purely informative; all fare calculations, discounts, taxes, and lock state are recomputed and enforced on the server.
4. **URL Search Params as State**: Filter and search states reside in the URL for shareability, bookmarking, and reliable browser history.
5. **Utilitarian Design System**: High information density, warm canvas background (`#F5F3EE`), burnt orange brand accent (`#E8590C`), tabular monospace numerals for prices/times/trains, zero decorative clutter.

---

## 2. Directory Structure

```
ixigo/
├── prisma/
│   ├── schema.prisma       # Database schema (SQLite / Postgres-compatible)
│   └── seed.ts             # Deterministic seed script (mulberry32 PRNG)
├── docs/
│   ├── PLAN.md             # This document
│   ├── DECISIONS.md        # Architectural decision records (ADRs)
│   ├── POLICIES.md         # Cancellation and refund tier policies
│   ├── ARCHITECTURE.md     # System architecture & booking state machine
│   ├── ER-DIAGRAM.md       # Prisma ER diagram in Mermaid
│   ├── DEMO-SCRIPT.md      # 7-minute presentation walkthrough
│   └── SELF-REVIEW.md      # Verification matrix & audit notes
├── public/
│   └── img/                # Local royalty-free/SVG imagery for hotels & destinations
├── src/
│   ├── app/
│   │   ├── (account)/      # Account-bound routes (trips, wallet, alerts, profile)
│   │   ├── (admin)/        # Admin dashboard and resource CRUD
│   │   ├── (auth)/         # Sign in, Sign up
│   │   ├── (booking)/      # Checkout and booking confirmation
│   │   ├── (public)/       # Search forms and results
│   │   │   ├── flights/
│   │   │   ├── trains/
│   │   │   ├── buses/
│   │   │   └── hotels/
│   │   ├── api/            # Route handlers (auth, providers, mock checkout, etc.)
│   │   ├── dev/            # Dev email preview and UI testbed
│   │   ├── globals.css     # CSS variables & typography
│   │   ├── layout.tsx      # Root layout with IBM Plex fonts
│   │   └── page.tsx        # Home portal with mode tabs & tools
│   ├── components/
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── common/         # Common travel widgets (SearchField, DatePicker, etc.)
│   │   └── layout/         # Header, Footer, ModeNav
│   ├── features/
│   │   ├── flights/
│   │   ├── trains/
│   │   ├── buses/
│   │   ├── hotels/
│   │   ├── booking/
│   │   ├── trips/
│   │   ├── wallet/
│   │   ├── alerts/
│   │   └── admin/
│   ├── lib/
│   │   ├── auth/           # NextAuth credentials config & session helpers
│   │   ├── db/             # Prisma client singleton
│   │   ├── domain/         # Pure business logic (pricing, refunds, promo validation)
│   │   ├── pdf/            # Server-side e-ticket generator
│   │   └── utils/          # Currency formatters, date utilities, result types
│   └── server/
│       └── providers/      # Provider interfaces & mock implementations
```

---

## 3. Data Model Summary

- **Users & Auth**: `User`, `SavedTraveller`
- **Transit Geography**: `Airport`, `Station`, `City`
- **Operators**: `Airline`, `BusOperator`
- **Flight Inventory**: `Flight`, `FlightInstance`
- **Train Network**: `Train`, `TrainStop`, `TrainClassFare`, `TrainAvailability`
- **Bus Network**: `Bus`, `BusInstance`, `BusPoint`
- **Lodging**: `Hotel`, `Room`, `HotelReview`
- **Commerce & Sessions**: `CheckoutSession`, `Booking`, `BookingPassenger`, `Payment`, `Refund`, `PromoCode`
- **Trips & Engagement**: `Trip`, `PriceAlert`, `PriceHistory`, `WalletTransaction`, `Notification`, `RecentSearch`

---

## 4. Milestone Execution Plan

- **M0 – Foundation**: Project setup, Tailwind design tokens, fonts, Prisma schema, deterministic seed pipeline, shell layouts.
- **M1 – Auth & Shared Components**: Credentials auth, route protection, profile, SearchField, DatePicker, PassengerSelector, PriceTag, StatusBadge, `/dev/ui`.
- **M2 – Flights**: Search, results, filter rail, sort, ±3-day fare calendar, price trend chart, round-trip selector with sticky summary.
- **M3 – Trains**: Station autocomplete, train schedule, class availability chips (AVL/RAC/WL), 7-day expansion, PNR status checker, live running status timeline with delays, WL confirmation probability.
- **M4 – Buses**: City search, bus results, multi-deck interactive seat layout picker, boarding/dropping selection.
- **M5 – Hotels**: Hotel search, filters, property detail with local imagery gallery, room selection, reviews, date-based pricing.
- **M6 – Checkout & Payments**: 10-minute seat/price lock countdown, passenger forms, add-ons, promo validation, test payment gateway with scenario toggles, confirmation, PDF e-ticket, `/dev/emails`.
- **M7 – Trips, Cancellation, Wallet, Alerts**: My Trips tabs, booking detail, tier-based cancellation with refund preview, date modification, multi-modal trip grouping, wallet ledger, price alerts.
- **M8 – Admin Panel**: Role-gated dashboard with Recharts, CRUD tables for transit/hotel/promos, booking and user management.
- **M9 – Polish, QA & Docs**: Responsive audits (375px, 768px, 1280px), accessibility, Vitest unit tests, Playwright e2e tests, complete docs and screenshots.
