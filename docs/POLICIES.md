# Wayfare — Travel Cancellation & Refund Policies

Wayfare operates a transparent, deterministic cancellation and refund engine implemented in pure TypeScript (`src/lib/domain/refunds.ts`). All refund calculations are time-tiered against departure or check-in timestamps and automatically credited to the user's Wayfare Wallet.

---

## 1. Flights Cancellation Policy

| Time Window to Scheduled Departure | Refund Percentage | Convenience Fee Refund | Notes |
|---|---|---|---|
| **> 72 hours** | **90%** of base fare + taxes | Non-refundable | Minimal processing deduction |
| **24 to 72 hours** | **60%** of base fare + taxes | Non-refundable | Standard airline cancellation tier |
| **< 24 hours** | **20%** of base fare + taxes | Non-refundable | Late cancellation penalty |
| **Post Departure / No-Show** | **0%** | Non-refundable | No refund applicable |

*Add-ons (baggage, meals) are refunded at 100% if cancelled > 24 hours prior to departure.*

---

## 2. Trains Cancellation Policy (Indian Railways Model)

| Booking Status | Time Window to Departure | Cancellation / Clerkage Charge | Refund |
|---|---|---|---|
| **Confirmed (CNF)** | > 48 hours | Flat ₹240 (1A/EC), ₹200 (2A), ₹180 (3A/CC), ₹120 (SL), ₹60 (2S) | Balance refunded |
| **Confirmed (CNF)** | 12 to 48 hours | 25% of fare (subject to min flat clerkage charge) | Balance refunded |
| **Confirmed (CNF)** | 4 to 12 hours | 50% of fare (subject to min flat clerkage charge) | Balance refunded |
| **Confirmed (CNF)** | < 4 hours / Chart Prepared | 100% penalty | ₹0 |
| **RAC / Waitlisted (WL)**| Up to 30 mins before departure | Flat clerkage ₹60 per passenger | Full balance refunded |

---

## 3. Buses Cancellation Policy

| Time Window to Scheduled Departure | Refund Percentage |
|---|---|
| **> 24 hours** | **85%** of ticket fare |
| **12 to 24 hours** | **50%** of ticket fare |
| **< 12 hours** | **0%** (Non-refundable) |

---

## 4. Hotels Cancellation Policy

| Time Window to Scheduled Check-in (12:00 PM IST) | Refund Percentage |
|---|---|
| **> 24 hours before check-in** | **100%** full refund |
| **< 24 hours / Post Check-in** | **0%** (First night non-refundable) |

---

## 5. Refund Method & Timeline
- Refunds are credited instantly to the user's **Wayfare Wallet** upon confirmation.
- Transactions are recorded with timestamp and reason in `/wallet`.
- Wallet funds can be redeemed at checkout with 1-click on any subsequent booking.
