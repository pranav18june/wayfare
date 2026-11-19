# Wayfare — Data Flow Diagrams (DFDs) & Structured Analysis Specification

> **Course Mapping:** Unit 2 — Structured Analysis / Structured Design (SA/SD) Methodology  
> **Notations Used:** Gane & Sarson / Yourdon-Coad Modern Notation  
> **System:** Wayfare Multi-Modal Transit & Booking Platform

---

## Table of Contents
1. [DFD Conventions & Notation](#1-dfd-conventions--notation)
2. [Level 0 DFD: Context Analysis Diagram](#2-level-0-dfd-context-analysis-diagram)
3. [Level 1 DFD: System Functional Decomposition](#3-level-1-dfd-system-functional-decomposition)
4. [Level 2 DFDs: Detailed Sub-Process Decompositions](#4-level-2-dfds-detailed-sub-process-decompositions)
   - [2.1 Sub-Process 2.0: Multi-Modal Search & Transparent Pricing](#41-sub-process-20-multi-modal-search--transparent-pricing)
   - [2.2 Sub-Process 3.0: Collaborative Group Booking & Split Session](#42-sub-process-30-collaborative-group-booking--split-session)
   - [2.3 Sub-Process 5.0: Live Train Tracking & Fallback Telemetry](#43-sub-process-50-live-train-tracking--fallback-telemetry)
5. [Extending DFD to Structure Chart (SA/SD Methodology)](#5-extending-dfd-to-structure-chart-sasd-methodology)
6. [Data Dictionary (DD) & Balancing Verification](#6-data-dictionary-dd--balancing-verification)
7. [Examiner Viva Voce Defense on DFDs](#7-examiner-viva-voce-defense-on-dfds)

---

## 1. DFD Conventions & Notation

Data Flow Diagrams (DFDs) model how data moves through an information system, where it is transformed, and where it is stored. DFDs focus strictly on **data flow**, without modeling control loops, branches, or sequential procedural steps (unlike flowcharts).

| Element | Symbol / Representation | Meaning in Wayfare |
| :--- | :--- | :--- |
| **External Entity** | Square / Rectangle `[Entity]` | Outside actor that generates or consumes data (e.g., Traveler, IRCTC/NTES Gateway, Payment Processor). |
| **Process** | Circle or Rounded Box `((Process))` | Transformation of incoming data flows into outgoing data flows (e.g., Calculate Fare, Generate PNR). |
| **Data Store** | Two parallel lines or Open Box `[(Data Store)]` | Repository where data rests at rest (e.g., Users, Bookings, GroupSessions). |
| **Data Flow** | Directed Arrow `-->|Data|` | Pipeline transferring data packets between entities, processes, and stores. |

---

## 2. Level 0 DFD: Context Analysis Diagram

The Context Diagram defines the **system boundaries**. The entire Wayfare platform is represented as a single process (`Process 0.0`), interacting exclusively with external environment actors.

```mermaid
flowchart TD
    %% Entities
    U["Traveler / User"]
    GM["Group Member / Co-Traveler"]
    NTES["Indian Railways NTES Gateway"]
    PG["Payment Gateway (Mock Engine)"]
    NOTIF["Email / Notification Gateway"]

    %% Central System
    SYS["Process 0.0: Wayfare Transit Platform"]

    %% Data Flows
    U -->|"1. Search Parameters (Src, Dest, Date, Class)"| SYS
    U -->|"2. Passenger Manifest & Seat Preferences"| SYS
    U -->|"3. Payment Authorization"| SYS

    SYS -->|"4. Search Results & Transparent All-In Fares"| U
    SYS -->|"5. Booking Confirmation, PNR & PDF Ticket"| U
    SYS -->|"6. Real-Time Gate, Platform & Delay Alerts"| U

    GM -->|"7. Group Session Token & Passenger Details"| SYS
    SYS -->|"8. Shared Manifest & Per-Head Split Invoice"| GM

    SYS -->|"9. Live Train Query (Train No, Date, CSRF)"| NTES
    NTES -->|"10. Station GPS Timetable & Delay Minutes"| SYS

    SYS -->|"11. Transaction Charge Request"| PG
    PG -->|"12. Transaction Auth Status & Token"| SYS

    SYS -->|"13. Dispatch Confirmation Email / OTP"| NOTIF
```

---

## 3. Level 1 DFD: System Functional Decomposition

Level 1 breaks `Process 0.0` into the five core subsystems of Wayfare, demonstrating how data flows into, between, and out of internal database stores.

```mermaid
flowchart TD
    %% External Entities
    USER["Traveler / User"]
    MEMBER["Group Co-Traveler"]
    NTES["NTES Railway API"]
    PG["Payment Engine"]

    %% Data Stores
    D1[("D1: Users & Preferences")]
    D2[("D2: Transit Inventory (Flights, Trains, Buses, Hotels)")]
    D3[("D3: Bookings & PNR Records")]
    D4[("D4: GroupSessions & Invites")]
    D5[("D5: LiveStatusCache (In-Memory LRU)")]

    %% Processes
    P1["1.0: User Authentication & Profile Preferences"]
    P2["2.0: Multi-Modal Search & Transparent Pricing"]
    P3["3.0: Group Booking & Split Session Engine"]
    P4["4.0: Payment Processing & PNR Generation"]
    P5["5.0: Live Trip Companion & NTES Tracking"]

    %% Data Flows
    USER -->|"Credentials & Preferences"| P1
    P1 -->|"Write User & Preference"| D1
    D1 -->|"User Context (Berth/Seat/Tier)"| P2

    USER -->|"Search Query (Origin, Dest, Date, All-In Toggle)"| P2
    D2 -->|"Raw Schedules & Seat Inventory"| P2
    P2 -->|"Display Filtered Results & Loaded Pricing"| USER

    USER -->|"Initialize Group Session"| P3
    P3 -->|"Create Session Record"| D4
    P3 -->|"Invite URL / WhatsApp Token"| MEMBER
    MEMBER -->|"Join Token & Passenger Data"| P3
    D4 -->|"Session Manifest & Total Fare"| P3
    P3 -->|"Calculate Per-Head Split Fares"| P3
    P3 -->|"Locked Booking Intent"| P4

    USER -->|"Payment Authorization"| P4
    P4 -->|"Charge Verification"| PG
    PG -->|"Payment Approved"| P4
    P4 -->|"Commit Booking, PNR & Passengers"| D3
    P4 -->|"Update Available Seats"| D2
    P4 -->|"Issue Confirmed PDF Ticket"| USER

    D3 -->|"Confirmed PNR & Station Codes"| P5
    USER -->|"Query Train Running Status"| P5
    P5 -->|"Check Cached Status"| D5
    P5 -->|"Fetch Real-Time Status"| NTES
    NTES -->|"Live Delay & Station Arrival"| P5
    P5 -->|"Update Cache"| D5
    P5 -->|"Live Platform, Countdown & Day-of Toolkit"| USER
```

---

## 4. Level 2 DFDs: Detailed Sub-Process Decompositions

### 4.1 Sub-Process 2.0: Multi-Modal Search & Transparent Pricing

Decomposes the search query lifecycle, inventory retrieval, preference weighting, and all-in dynamic fare calculation.

```mermaid
flowchart TD
    U["Traveler"]
    D1[("D1: Users & Preferences")]
    D2[("D2: Transit Inventory")]

    P21["2.1: Parse & Validate Route Query"]
    P22["2.2: Fetch Transit Inventory by Mode"]
    P23["2.3: Apply Personalization Filter"]
    P24["2.4: Calculate All-In Transparent Fare"]

    U -->|"Source, Destination, Date, Mode"| P21
    P21 -->|"Clean Station/Airport Codes"| P22
    D2 -->|"Raw Route & Class Availability"| P22
    P22 -->|"Unfiltered Transit Cards"| P23
    D1 -->|"Preferred Berth, Bus Tier, Budget Max"| P23
    P23 -->|"Personalized Match Candidates"| P24
    U -->|"All-In Price Toggle (ON/OFF)"| P24
    P24 -->|"Compute 12% GST + ₹250 Fee + Baggage"| P24
    P24 -->|"Formatted Search Cards with Price Transparency"| U
```

---

### 4.2 Sub-Process 3.0: Collaborative Group Booking & Split Session

Decomposes the collaborative booking architecture (`/group/[token]`), showing how distributed travelers contribute to a single manifest and split the invoice.

```mermaid
flowchart TD
    HOST["Group Host"]
    GUEST["Invited Co-Traveler"]
    D4[("D4: GroupSessions")]
    P4["To 4.0: Payment Engine"]

    P31["3.1: Generate Session & Invite Token"]
    P32["3.2: Verify Token & Ingest Manifest"]
    P33["3.3: Calculate Per-Head Split & Rounding"]
    P34["3.4: Lock Session & Finalize Group Intent"]

    HOST -->|"Target Transit Item & Total Fare"| P31
    P31 -->|"Session Token (UUID)"| D4
    P31 -->|"Invite Link (WhatsApp/Web)"| GUEST

    GUEST -->|"Token + Passenger Name, Age, Berth"| P32
    D4 -->|"Verify Status == OPEN"| P32
    P32 -->|"Append Member to Session Manifest"| D4

    D4 -->|"Full Passenger Count & Base Fares"| P33
    P33 -->|"Divide Total / N + Allocate Paise Residual"| P33
    P33 -->|"Individual Shares & Split Breakdown"| HOST
    P33 -->|"Individual Shares & Split Breakdown"| GUEST

    HOST -->|"Lock Booking Trigger"| P34
    P34 -->|"Set Status = LOCKED"| D4
    P34 -->|"Group Manifest Payload"| P4
```

---

### 4.3 Sub-Process 5.0: Live Train Tracking & Fallback Telemetry

Decomposes the resilient NTES integration (`liveTrainTracker.ts`), demonstrating how cache hits, live scraping, and deterministic Prisma fallbacks are coordinated.

```mermaid
flowchart TD
    U["Traveler / Trip Mode"]
    NTES["Indian Railways NTES Gateway"]
    D5[("D5: LiveStatusCache (Memory LRU)")]
    DB[("D2: Seeded Train Routes (Prisma SQLite)")]

    P51["5.1: Validate Train No & Check Cache"]
    P52["5.2: Query NTES Live Endpoint"]
    P53["5.3: Regex Parser & Event Normalizer"]
    P54["5.4: Deterministic Schedule Fallback Engine"]

    U -->|"Train Number (e.g. 15160, 12952)"| P51
    P51 -->|"Check Key: train_date"| D5
    D5 -->|"Cache Hit (< 60s TTL)"| U

    P51 -->|"Cache Miss: Dispatch Live Request"| P52
    P52 -->|"POST /mntes/tr with CSRF (Timeout: 2500ms)"| NTES
    NTES -->|"HTML Response with Stop Rows"| P53

    P53 -->|"Extract Station Code, Delays, Expected Times"| P53
    P53 -->|"Write to Cache (TTL 60s)"| D5
    P53 -->|"Live Running Status Response"| U

    P52 -.->|"Network Timeout / 500 Error / Blocked"| P54
    DB -->|"Pre-seeded Stop Coordinates & Timetables"| P54
    P54 -->|"Deterministic Fallback Timeline"| U
```

---

## 5. Extending DFD to Structure Chart (SA/SD Methodology)

In Structured Analysis and Structured Design (SA/SD), the DFD is transformed into a **Structure Chart** using **Transform Analysis** and **Transaction Analysis**.

- **Transform Center:** Identifies the central processing hub where incoming physical data is converted into abstract data, processed, and transformed into physical output.
- **Data Couples ($o\rightarrow$):** Data passed between modules.
- **Control Flags ($\bullet\rightarrow$):** Boolean flags controlling flow (e.g., `isAuthorized`, `cacheHit`).

```mermaid
flowchart TD
    ROOT["Wayfare Root Executive Controller"]

    INPUT_CTL["Input Controller: Ingest & Validate Request"]
    TRANS_CTL["Transform Controller: Fare & Booking Processor"]
    OUTPUT_CTL["Output Controller: Dispatch & Render"]

    ROOT --> INPUT_CTL
    ROOT --> TRANS_CTL
    ROOT --> OUTPUT_CTL

    %% Input Sub-modules
    IN1["Get HTTP Search Query"]
    IN2["Verify User Session"]
    INPUT_CTL --> IN1
    INPUT_CTL --> IN2

    %% Transform Sub-modules
    TR1["Search & Filter Inventory Engine"]
    TR2["Compute Loaded Pricing & GST"]
    TR3["Split Session Allocator"]
    TR4["Live NTES Status Poller"]
    TRANS_CTL --> TR1
    TRANS_CTL --> TR2
    TRANS_CTL --> TR3
    TRANS_CTL --> TR4

    %% Output Sub-modules
    OUT1["Render JSON Response"]
    OUT2["Generate PDF Ticket Stream"]
    OUT3["Push Email / Alert Notification"]
    OUTPUT_CTL --> OUT1
    OUTPUT_CTL --> OUT2
    OUTPUT_CTL --> OUT3
```

---

## 6. Data Dictionary (DD) & Balancing Verification

### Data Dictionary Entries

```text
Search_Query = Source_Station + Destination_Station + Journey_Date + Mode + [Travel_Class] + [All_In_Toggle]

Passenger_Manifest = { Passenger_Name + Age + Gender + [Seat_Berth_Preference] }1..6

Group_Session = Session_Token + Host_User_Id + Target_Item_Id + Status + { Passenger_Manifest } + Total_Fare + Per_Head_Split
  where Status = [ "OPEN" | "LOCKED" | "COMPLETED" | "EXPIRED" ]

Live_Train_Status = Train_Number + Train_Name + Run_Date + Last_Updated + Current_Station_Code + 
                    Current_Station_Name + Overall_Delay_Mins + Is_Delayed + { Station_Stop_Timeline }

Station_Stop_Timeline = Station_Code + Station_Name + Scheduled_Arr + Scheduled_Dep + 
                        Expected_Arr + Expected_Dep + Delay_Mins + Distance_Km + Status
  where Status = [ "DEPARTED" | "CURRENT" | "UPCOMING" ]
```

### DFD Balancing Rule (Conservation of Data)
A set of DFDs is **balanced** if all input and output data flows that cross the boundary of a parent process match the net inputs and outputs of the child DFD diagram.
- **Level 0 vs Level 1 Verification:**
  - Net inputs into Context Diagram (Traveler, Co-traveler, NTES, PG, Email) $\equiv$ Net inputs entering Level 1 DFD processes.
  - Zero spontaneous data generation (**Miracle Error** avoided).
  - Zero data sinks without outputs (**Black Hole Error** avoided).
  - All data store accesses in Level 2 correspond to verified entities in Prisma ORM (`prisma/schema.prisma`).

---

## 7. Examiner Viva Voce Defense on DFDs

### Q1: *"What is the fundamental difference between a DFD and a Flowchart?"*
> **Model Answer:**
> *"A flowchart models sequential control logic—it shows step-by-step program execution paths, decision diamonds, loops, and temporal order. In contrast, a DFD models the flow and transformation of data through the system regardless of time or implementation order. A DFD has no 'loops' or 'if-else' statements; it answers **what** data moves where, while a flowchart answers **how** and **when** a program executes."*

### Q2: *"What are Black Holes, Miracles, and Grey Holes in DFD analysis, and how did you prevent them?"*
> **Model Answer:**
> - *"A **Black Hole** is a process with only input flows and no output flows."*
> - *"A **Miracle** is a process that generates output flows out of nothing without any inputs."*
> - *"A **Grey Hole** occurs when a process's outputs could not logically be generated by its inputs (e.g., an input of `UserId` generating a `FlightTicketPDF` without accessing the booking database)."*
> - *"In Wayfare, all 5 Level 1 processes were verified for strict input/output balance against our Data Dictionary, ensuring every output is mathematically derivable from its inputs and data store reads."*

### Q3: *"How does DFD Level 1 relate to your project's codebase?"*
> **Model Answer:**
> *"Every Level 1 process maps directly to a high-cohesion module in Wayfare:*
> - *Process 1.0 $\rightarrow$ `src/server/auth` and `/api/preferences`.*
> - *Process 2.0 $\rightarrow$ `src/lib/domain/pricing.ts` and `/api/{mode}/search`.*
> - *Process 3.0 $\rightarrow$ `src/app/api/group/*` and `/group/[token]`.*
> - *Process 4.0 $\rightarrow$ `/api/bookings/create` and `pdf-lib` ticket generator.*
> - *Process 5.0 $\rightarrow$ `src/server/providers/liveTrainTracker.ts` and `/trains/running-status`.*
> *This 1-to-1 traceability proves our software engineering was architecturally planned before implementation."*
