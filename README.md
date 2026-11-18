# Wayfare — Multi-Modal Travel Search, Booking & Trip Orchestration Platform

> A full-stack, demo-ready travel platform inspired by the functionality of modern transit systems (Flights, Trains, Buses, Hotels, PNR Status, Live Running Status, Checkout & Price Lock, My Trips & Tiered Cancellation, Wallet, and Admin Console).

---

## Quick Start (Offline Ready, Single Command)

```bash
# 1. Install dependencies
npm install

# 2. Setup SQLite database & seed realistic travel inventory
npm run db:setup

# 3. Launch development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Accounts

All credentials work out-of-the-box with pre-seeded bookings and wallet balances:

| Role | Email | Password | Pre-loaded Data |
|---|---|---|---|
| **Traveller** | `traveller@demo.test` | `Demo1234!` | Pre-populated bookings in all states, ₹4,500 wallet balance, saved travellers |
| **Administrator** | `admin@demo.test` | `Admin1234!` | Access to `/admin` dashboard, inventory catalog, booking override, and promo engine |
| **New User** | `new@demo.test` | `New1234!` | Clean account with ₹500 welcome credit |

> **Tip:** The sign-in page (`/auth/signin`) includes **one-click demo login buttons** for instant switching between roles without typing.

---

## Verification & Tests

```bash
# Run TypeScript compilation check
npm run typecheck

# Run domain unit test suite (pricing, refunds, WL probabilities, formatters)
npm test
```

---

## Key Features

### 1. Flights Module (`/flights`)
- One-way and round-trip flight search across major Indian airport hubs (DEL, BOM, BLR, MAA, CCU, HYD, etc.).
- ±3 day fare calendar strip for fast date switching.
- 30-day price trend chart (powered by Recharts) with "Prices rising / Good time to book" hints.
- Filters for stops (Non-stop / 1 Stop), airlines, price slider, and refundable fares.
- Round-trip split view with combined floating total bar.

### 2. Trains Signature Module (`/trains`)
- Station-by-station train search (NDLS, BCT, SBC, HWH, etc.) across classes (SL, 3A, 2A, 1A, CC, 2S) and quotas (General, Tatkal, Ladies).
- Real-time seat availability chips (`AVL 42`, `RAC 6`, `WL 12`) with color-coded confirmation probabilities and 7-day calendar expansion.
- **PNR Status Checker (`/trains/pnr`)**: 10-digit PNR lookup resolving passengers, coach, berth, and chart status.
- **Live Train Running Status (`/trains/running-status`)**: Station timeline simulation with scheduled vs expected times, delays, and current train position.
- Train timetables and halt distance details (`/trains/[number]`).

### 3. Buses Module (`/buses`)
- Intercity bus search with operators (Zingbus, IntrCity, Greenline, etc.).
- Interactive 2-deck sleeper and seater layout picker with real-time seat selection, ladies-only markers, and live total calculation.
- Boarding and dropping point selection.

### 4. Hotels Module (`/hotels`)
- City-based hotel search with star ratings, amenities, and localities.
- Property detail pages with photo gallery, amenities list, guest policies, reviews, and room category selection.

### 5. Checkout & Payment Engine (`/checkout/[sessionId]`)
- **10-minute price & seat lock countdown timer** backed by server expiration.
- Passenger details autofill from saved travellers directory.
- Add-on options (baggage protection, meals, travel insurance).
- Promo code application (`FLYWAYFARE`, `WELCOME500`).
- **Test Payment Gateway**: Selectable test scenarios (Success, Failure with retry, Pending) supporting UPI, Cards, Netbanking, and Wayfare Wallet.
- **Server-Side PDF E-Ticket**: Instant generation and download via `pdf-lib` (`/api/booking/[id]/pdf`).
- Transactional email previews (`/dev/emails`).

### 6. Trip Management & Refunds (`/trips`)
- Categorized booking views: Upcoming, Completed, Cancelled, and Grouped Trips.
- **Tiered Refund Engine**: Automatic refund calculation based on time-to-departure policies (e.g. 90% if >72h, 60% 24–72h, 20% <24h).
- Instant wallet credit on cancellation with updated ledger in `/wallet`.
- **Trip Grouping**: Bundle multiple bookings (flight + hotel + train) into a unified chronological itinerary view (`/trips/[tripId]`).
- Date rescheduling / modification for flights and buses.

### 7. Smart Features & Utilities
- **Price Alerts (`/alerts`)**: Track route target prices with triggered state alerts.
- **Wayfare Wallet (`/wallet`)**: Ledger of credits, debits, refunds, and instant top-ups.
- **Notification Center (`/notifications`)**: System alerts for booking confirmations, price drops, and train delays.
- **Design System Component Showroom (`/dev/ui`)**: Living style guide of design primitives, tokens, and badges.

### 8. Role-Gated Admin Console (`/admin`)
- Operations dashboard with Recharts visualizations: 14-day booking activity and revenue by travel mode.
- Bookings registry with search, filters, and status overrides (Confirmed, Cancelled, Pending, Completed).
- User management directory with administrator role delegation.
- Promo code rules engine: create percentage or flat discount campaigns with mode restrictions and usage caps.
- Inventory catalog browser across all 4 travel modes.

---

## Design System

Designed strictly around fintech and transit authority aesthetics:
- **Canvas**: `#F5F3EE` (warm off-white)
- **Ink**: `#14181F` (primary text)
- **Ink Muted**: `#5B6472`
- **Line**: `#E3DFD6` (hairline borders)
- **Brand**: `#E8590C` (burnt orange accents)
- **Typography**: IBM Plex Sans + IBM Plex Mono

---

## Documentation

- [docs/PLAN.md](file:///Users/pranav/Downloads/ixigo/docs/PLAN.md) — Implementation roadmap and architecture plan.
- [docs/ARCHITECTURE.md](file:///Users/pranav/Downloads/ixigo/docs/ARCHITECTURE.md) — System topology, state machine, and data flow.
- [docs/POLICIES.md](file:///Users/pranav/Downloads/ixigo/docs/POLICIES.md) — Tiered cancellation and refund matrices.
- [docs/DEMO-SCRIPT.md](file:///Users/pranav/Downloads/ixigo/docs/DEMO-SCRIPT.md) — 5-minute presentation script with walkthrough steps.
- [docs/DECISIONS.md](file:///Users/pranav/Downloads/ixigo/docs/DECISIONS.md) — Architecture Decision Records (ADRs).
