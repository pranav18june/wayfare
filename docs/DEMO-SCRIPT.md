# Wayfare — Prototype Demo Walkthrough

Use this guide to demonstrate the platform during presentations and evaluation reviews.

---

## Demo Accounts

| Account | Email | Password | Role | Pre-loaded Data |
|---|---|---|---|---|
| **Traveller** | `traveller@demo.test` | `Demo1234!` | `TRAVELLER` | Pre-existing bookings (Flight, Train, Bus, Hotel), ₹4,500 wallet balance, saved travellers |
| **Admin** | `admin@demo.test` | `Admin1234!` | `ADMIN` | Full access to `/admin` dashboard, inventory, bookings, and promo code manager |
| **New User** | `new@demo.test` | `New1234!` | `TRAVELLER` | Clean state with ₹500 welcome credit |

*(One-click login buttons are available on `/auth/signin` for instant switching without typing).*

---

## 5-Minute Evaluation Script

### Step 1: Sign in & Homepage (0:00 - 0:45)
1. Navigate to `http://localhost:3000/auth/signin` and click **"Demo Traveller"**.
2. Notice the clean fintech/transit visual language (`#F5F3EE` canvas, `#E8590C` brand accents, IBM Plex typography).
3. Switch across travel mode tabs (Flights, Trains, Buses, Hotels) with instant route search cards.

### Step 2: Trains & Signature Utilities (0:45 - 2:00)
1. Click **Trains** tab on homepage or navigate to `/trains`.
2. Notice the two signature utility cards:
   - **Check PNR Status**: enter `9823410291` → shows passengers, coach B3, berth 42 (Lower), and chart status.
   - **Live Train Running Status**: enter `12952` (Mumbai Rajdhani) → shows interactive station-by-station timeline with delays, distance, and current position.
3. Search `NDLS` to `BCT` for upcoming date:
   - View class availability chips (`AVL 42`, `RAC 6`, `WL 12`) with confirmation probability indicators.
   - Click a chip to view the 7-day seat calendar.

### Step 3: Flight Booking & 10-Minute Lock (2:00 - 3:00)
1. Go to `/flights` and search `DEL` to `BOM`.
2. Explore the ±3 day fare calendar strip and the 30-day price trend chart (Recharts).
3. Filter by Non-stop or sort by Cheapest / Fastest.
4. Select a flight to enter **Checkout**:
   - Notice the **10-minute seat lock countdown timer**.
   - Autofill saved travellers with 1 click.
   - Enter promo code `FLYWAYFARE` or `WELCOME500` for instant discount deduction.
   - Select payment scenario: "Success (Test)", pay via Wayfare Wallet or UPI.
5. On the Confirmation page:
   - Copy the booking reference and PNR.
   - Click **"Download E-Ticket"** to see the generated PDF ticket.

### Step 4: Bus Interactive Seat Picker & Hotel Detail (3:00 - 3:45)
1. Visit `/buses` and search `New Delhi` to `Jaipur`.
2. Open the bus card and click **"Select Seats"** to view the lower and upper deck seat map (available, ladies-only, selected, booked).
3. Visit `/hotels` and search `Mumbai` to inspect property photo gallery, amenities, and room pricing.

### Step 5: Trip Management & Tiered Refund (3:45 - 4:15)
1. Click **"My Trips"** in the top navigation.
2. View Upcoming, Completed, and Cancelled bookings.
3. Click **"Cancel Booking"** on an upcoming flight:
   - Notice the transparent refund preview calculated per policy tier (e.g. 90% if >72h).
   - Confirm cancellation → instant wallet credit notification!
4. Navigate to `/wallet` to see the transaction ledger entry and updated balance.
5. Inspect **"Grouped Trips"** tab to see combined multi-modal itinerary.

### Step 6: Admin Console (4:15 - 5:00)
1. Sign in as `admin@demo.test` (or switch account).
2. Visit `/admin`:
   - Interactive Recharts graphs: 14-day booking activity and revenue by travel mode.
   - High-demand route tables and KPI cards.
3. Visit `/admin/bookings` to inspect all platform bookings and test status overrides.
4. Visit `/admin/promos` to view and create active discount coupons.
