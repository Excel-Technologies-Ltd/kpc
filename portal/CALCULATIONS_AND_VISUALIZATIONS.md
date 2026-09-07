# KPC Portal — Plain English Calculation & API Guide

> **A Complete Operational & Developer Handbook**  
> *Explains every metric in plain English, specifies the exact Frappe DocTypes and fields used, provides the API call hooks, and shows step-by-step calculations with real pipeline numbers.*

---

## Table of Contents

1. [Pipeline Hydraulics: How Speed & Arrival Time (ETA) Work](#1-pipeline-hydraulics-how-speed--arrival-time-eta-work)
2. [Executive Command Dashboard (`/` or `/portal`)](#2-executive-command-dashboard--or-portal)
3. [Pipeline Flow Tracking (`/pipeline-flow`)](#3-pipeline-flow-tracking-pipeline-flow)
4. [Stock & Tank Farm Telemetry (`/stock-tank-farm`)](#4-stock--tank-farm-telemetry-stock-tank-farm)
5. [Commercial & Revenue Billing (`/commercial-revenue`)](#5-commercial--revenue-billing-commercial-revenue)
6. [Assets & Equipment Maintenance (`/assets-eam`)](#6-assets--equipment-maintenance-assets-eam)
7. [Loss Accountability & EPRA Reconciliation (`/loss-accountability`)](#7-loss-accountability--epra-reconciliation-loss-accountability)
8. [HSE & Safety Integrity (`/hse-integrity`)](#8-hse--safety-integrity-hse-integrity)
9. [The 5 Regulatory Reports: API Calls & Logic](#9-the-5-regulatory-reports-api-calls--logic)
10. [Quick Reference Cheat Sheet (DocTypes & APIs)](#10-quick-reference-cheat-sheet-doctypes--apis)

---

## 1. Pipeline Hydraulics: How Speed & Arrival Time (ETA) Work

This is the calculation used in the **Pipeline Flow** and **3D Corridor** view to tell operators when a fuel batch will reach Nairobi or Western depots.

```
PUMP STATION                                                    DESTINATION DEPOT
 [ Mombasa ] ═════════════════► [ BATCH: PMS ] ═════════════════► [ Nairobi ]
  Flow Rate: Q                     Diameter: D                   Remaining: L
  (950 m³/h)                       (20 inches)                   (140 km)
```

### 1.1 In Plain English
Think of fuel moving through a pipeline like water through a pipe:
- If your pumps push **$950\text{ cubic meters}$ of oil into the pipe every hour**, how fast is the oil actually traveling in kilometers per hour?
- That depends on the thickness of the pipe! A narrower pipe forces liquid to rush through faster, while a wider pipe moves it slower at the same flow rate.
- **Velocity** is simply: `(Volume per hour) ÷ (Inside Area of the pipe)`.
- Once you know the speed (e.g. **$4.7\text{ km/h}$**), you divide the remaining kilometers by that speed to get the **hours until arrival**.

---

### 1.2 Which DocTypes & Fields Are Used?

| DocType | Field Name | Type | What It Represents |
| :--- | :--- | :--- | :--- |
| **`Movement`** | `monitored_flow_rate_m3h` | Float | Real-time flow meter telemetry in $m^3/\text{h}$ from SCADA |
| **`Movement`** | `movement_status` | Select | Status (`In Transit`, `Completed`, `Halted`) |
| **`Movement`** | `start_datetime` / `end_datetime` | Datetime | Pumping schedule timestamps |
| **`Pipeline Batch`** | `planned_volume_kl` | Float | Total volume of this fuel slug in kilolitres |
| **`Pipeline Batch`** | `origin_terminal` | Link | e.g. `MSA-01` (Mombasa Kipevu) |
| **`Pipeline Batch`** | `destination_terminal` | Link | e.g. `NBI-01` (Nairobi Embakasi) |
| **`Pipeline Batch`** | `interface_cut_kl` | Float | Mixed transmix volume at the edge of the batch |

---

### 1.3 How to Call the API & Fetch Data

In React, the portal fetches active batches and real-time flow telemetry using `frappe-react-sdk`:

```typescript
import { useFrappeGetDocList } from 'frappe-react-sdk';

// 1. Fetch live flow telemetry from active movements
const { data: movements } = useFrappeGetDocList('Movement', {
  fields: ['name', 'pipeline_batch', 'movement_status', 'monitored_flow_rate_m3h'],
  filters: [['movement_status', '=', 'In Transit']],
  limit: 100,
});

// 2. Fetch the corresponding batch details
const { data: batches } = useFrappeGetDocList('Pipeline Batch', {
  fields: ['name', 'product', 'origin_terminal', 'destination_terminal', 'planned_volume_kl'],
  filters: [['docstatus', '!=', 2]],
  limit: 100,
});
```

---

### 1.4 Step-by-Step Calculation

#### Step A: Find the Cross-Sectional Area ($A$) of the Pipe
The pipeline is a cylinder. The area of the circular opening is:
$$\text{Area } (A) = \pi \times \text{Radius}^2$$

For Line 5 (Mombasa to Nairobi):
1. Nominal diameter = **$20\text{ inches}$**.
2. Convert inches to meters ($1\text{ inch} = 0.0254\text{ m}$):
   $$\text{Diameter } (D) = 20 \times 0.0254 = 0.508\text{ meters}$$
3. Radius is half the diameter:
   $$\text{Radius } (r) = 0.508 \div 2 = 0.254\text{ meters}$$
4. Area:
   $$A = 3.14159 \times (0.254)^2 \approx \mathbf{0.20268\text{ m}^2}$$

#### Step B: Calculate Speed (Velocity $v$)
$$\text{Speed in meters/hour} = \frac{\text{Flow Rate }(m^3/h)}{\text{Area }(m^2)}$$
$$\text{Speed} = \frac{950\text{ m}^3/h}{0.20268\text{ m}^2} \approx 4,687.2\text{ meters per hour}$$

Convert to kilometers per hour ($\div 1,000$):
$$\text{Speed} = 4,687.2 \div 1,000 \approx \mathbf{4.69\text{ km/h}}$$

#### Step C: Calculate Estimated Arrival Time (ETA)
If the batch is currently at Sultan Hamud and has **$140\text{ km}$** left until Nairobi:
$$\text{Hours to Arrival} = \frac{\text{Remaining Distance (km)}}{\text{Speed (km/h)}} = \frac{140\text{ km}}{4.69\text{ km/h}} \approx \mathbf{29.85\text{ hours}}$$

Add $29\text{ hours and } 51\text{ minutes}$ to the current time to display the ETA on the screen (e.g. `Tomorrow, 16:15`).

---

### 1.5 How It Looks on Screen

```
┌────────────────────────────────────────────────────────────────────────┐
│  ACTIVE BATCH: BATCH-2026-089 (PMS Petrol)                             │
│  [Mombasa] ========[■■■■■■■■■■■■■■■■■■■■■■■□□□□□□□□]=====> [Nairobi]   │
│  Progress: 68.9%   ·   Speed: 4.7 km/h   ·   ETA: Tomorrow, 16:15      │
└────────────────────────────────────────────────────────────────────────┘
```
1. **3D Glowing Particles**: In `ProductFlow3D`, light particles travel along the tube faster when flow rate rises and slower when flow rate drops.
2. **Progress Bar**: Fills horizontally from left to right showing where the fuel slug is located along the corridor.
3. **Data Grid**: Displays exact batch numbers, route, velocity, and computed arrival datetime.

---

## 2. Executive Command Dashboard (`/` or `/portal`)

The command center dashboard displays network-wide health, lines in operation, financial throughput, and active alarms.

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Throughput Today│ │Network Line Fill│ │   Revenue MTD   │ │   System Loss   │
│    9,530 m³     │ │    145.2k m³    │ │   842.50 M KES  │ │      0.17%      │
│  ▲ 6 active     │ │  24 tanks active│ │  ▲ 18 invoices  │ │  ▼ Below 0.20%  │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 2.1 The 4 Core Metrics Explained

#### 1. Throughput Today ($m^3$)
- **Plain English**: Total clean fuel volume received into terminal storage tanks today since midnight.
- **DocType**: `Terminal Receipt`
- **Fields Used**: `net_standard_volume_kl`, `gross_observed_volume_kl`, `posting_date`
- **API Call Hook**:
  ```typescript
  const { data: receipts } = useFrappeGetDocList('Terminal Receipt', {
    fields: ['net_standard_volume_kl', 'gross_observed_volume_kl'],
    filters: [['posting_date', '=', todayDate]],
  });
  ```
- **Calculation**:
  $$\text{Throughput} = \sum (\text{net\_standard\_volume\_kl})$$

#### 2. Network Line Fill ($m^3$)
- **Plain English**: How much fuel is physically sitting inside all trunk lines and storage tanks across Kenya right now.
- **DocType**: `Oil Tank` and `Movement`
- **Fields Used**: `safe_fill_capacity_kl`, `current_state`, `capacity_kl`
- **API Call Hook**:
  ```typescript
  const { data: tanks } = useFrappeGetDocList('Oil Tank', {
    fields: ['safe_fill_capacity_kl', 'current_state'],
  });
  ```
- **Calculation**: Sum of safe capacities of all active in-service tanks and line packs.

#### 3. Revenue MTD ($KES$)
- **Plain English**: Total billing amount invoiced to oil companies (Vivo, TotalEnergies, Rubis, etc.) for pumping and storage this month.
- **DocType**: `Invoice`
- **Fields Used**: `grand_total`, `docstatus`, `posting_date`
- **API Call Hook**:
  ```typescript
  const { data: invoices } = useFrappeGetDocList('Invoice', {
    fields: ['grand_total', 'docstatus'],
    filters: [['docstatus', '=', 1]], // 1 = Submitted (approved)
  });
  ```
- **Calculation**: Sum of all `grand_total` values from submitted invoices this month.

#### 4. System Loss (%)
- **Plain English**: Network-wide fuel variance percentage against the statutory EPRA $0.20\%$ ceiling.
- **DocType**: `Reconciliation`
- **Fields Used**: `variance_percent`, `variance_kl`, `within_tolerance`
- **API Call Hook**:
  ```typescript
  const { data: reconciliations } = useFrappeGetDocList('Reconciliation', {
    fields: ['variance_percent', 'variance_kl'],
    limit: 50,
  });
  ```
- **Calculation**:
  $$\text{Average Variance } \% = \frac{\sum |\text{variance\_percent}|}{\text{Count of Valid Reconciliations}}$$

---

### 2.2 The 3D Digital Twin Map API

To render the 3D map of Kenya with terminals and moving oil batches, the portal calls a custom whitelisted Python API:

- **API Endpoint**: `kpc.petroleum_operations.api.get_pipeline_scada_network`
- **React Hook**:
  ```typescript
  const { data } = useFrappeGetCall(
    'kpc.petroleum_operations.api.get_pipeline_scada_network'
  );
  ```
- **What the Backend Does**:
  1. Queries `Terminal` DocType for GPS coordinates (`latitude`, `longitude`).
  2. Queries `Oil Tank` and `Tank Measurement` for current stock and ullage.
  3. Queries `Movement` for real-time pumping flow rate and line pressure ($bar$).
  4. Bundles everything into a single JSON object with `terminals`, `telemetry`, and `segments`.

---

## 3. Pipeline Flow Tracking (`/pipeline-flow`)

This page monitors real-time batch movements, pumping rates, and daily quota attainment.

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Throughput today│ │  Avg flow rate  │ │ Active batches  │ │ Plan attainment │
│    9,530 m³     │ │     794 m³/h    │ │        3        │ │      103%       │
│ ▲ ahead of plan │ │     steady      │ │    in transit   │ │     ahead       │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 3.1 Metrics & Calculation Logic

#### 1. Plan Attainment (%)
- **Plain English**: Are we pumping as much fuel as we promised the oil marketing companies today?
- **DocTypes**: `Pipeline Batch` + `Movement`
- **Fields**: `planned_volume_kl`, `scheduled_start`, `scheduled_end`
- **Calculation**:
  $$\text{Plan Attainment } \% = \left(\frac{\text{Completed Volume Today}}{\text{Planned Volume Today}}\right) \times 100$$
- **Thresholds**:
  - **$\ge 100\%$**: "Ahead of plan" (Green badge)
  - **$95\% - 99\%$**: "On plan" (Blue badge)
  - **$< 95\%$**: "Behind plan" (Red/Amber badge indicating pump delays)

#### 2. Average Flow Rate ($m^3/\text{h}$)
- **Plain English**: Average pumping speed across all active lines right now.
- **DocType**: `Movement`
- **Field**: `monitored_flow_rate_m3h`
- **Calculation**:
  $$\text{Avg Flow} = \frac{\sum \text{monitored\_flow\_rate\_m3h}}{\text{Number of Active In-Transit Movements}}$$

#### 3. Line Pack ($m^3$)
- **Plain English**: Estimated volume of product currently inside the pipes moving toward depots.
- **Calculation**: Sum of `planned_volume_kl` for all batches currently with status `In Transit`.

---

## 4. Stock & Tank Farm Telemetry (`/stock-tank-farm`)

This page displays all vertical storage tanks at Mombasa, Nairobi, Nakuru, Eldoret, and Kisumu.

```
       TANK ANATOMY & CALCULATION
┌────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ── Top of Tank (5% expansion gap)
│               AVAILABLE ULLAGE                 │
├────────────────────────────────────────────────┤ ── Safe Fill Capacity (95%)
│ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █  │
│ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █  │
│          NET STANDARD VOLUME (NSV)             │
│            Temperature Corrected               │
│ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █  │
├────────────────────────────────────────────────┤ ── Dip Datum Plate
│ ~~~~~~~~~~~~~~~~~ Water Bottom ~~~~~~~~~~~~~~~ │ ── Water Layer (< 50mm)
└────────────────────────────────────────────────┘
```

### 4.1 Plain English Explanations

#### 1. Why Temperature Correction Matters (ASTM Table 54B)
- When fuel gets warm in the sun, it expands. When it cools at night, it shrinks.
- A tank may show $10,000\text{ KL}$ at $28^\circ\text{C}$ in Mombasa, but if it cools to $15^\circ\text{C}$ in Nairobi, the volume shrinks to $9,880\text{ KL}$ even though no fuel was lost!
- To prevent unfair billing disputes, all measurements are converted to standard **$15^\circ\text{C}$** volume:
  $$\text{Net Standard Volume } (NSV) = \text{Gross Observed Volume } (GOV) \times VCF_{15}$$

#### 2. Safe Fill Capacity ($KL$)
- Tanks must never be filled to the absolute top to prevent hazardous spills.
- By engineering safety standards, safe capacity is capped at **$95\%$** of total shell capacity:
  $$\text{Safe Fill Capacity} = \text{Gross Capacity} \times 0.95$$

#### 3. Available Ullage ($KL$)
- Ullage is the **empty space** left inside the tank before reaching the safe limit ("how much more fuel can this tank receive?"):
  $$\text{Available Ullage} = \text{Safe Fill Capacity} - \text{Current Net Volume}$$

---

### 4.2 Which DocTypes & Fields Are Used?

| DocType | Field Name | Type | Purpose |
| :--- | :--- | :--- | :--- |
| **`Oil Tank`** | `name` / `tank_code` | Data | Tank identifier (e.g. `TK-01`, `NRB-TK-04`) |
| **`Oil Tank`** | `capacity_kl` | Float | Total gross shell capacity |
| **`Oil Tank`** | `safe_fill_capacity_kl` | Float | $95\%$ safe operating capacity |
| **`Oil Tank`** | `current_state` | Select | `Active`, `Maintenance`, `Quarantine` |
| **`Tank Measurement`**| `observed_level_mm` | Float | Liquid height reading from radar/dip |
| **`Tank Measurement`**| `net_standard_volume_kl`| Float | Temperature-corrected stock volume |
| **`Tank Measurement`**| `water_level_mm` | Float | Water layer at the bottom of the tank |

---

### 4.3 How to Call the API

```typescript
// Fetch tanks and their current state
const { data: tanks } = useFrappeGetDocList('Oil Tank', {
  fields: ['name', 'tank_code', 'terminal', 'product', 'safe_fill_capacity_kl', 'current_state'],
  limit: 200,
});

// Fetch latest dip/radar measurements
const { data: measurements } = useFrappeGetDocList('Tank Measurement', {
  fields: ['tank', 'observed_level_mm', 'net_standard_volume_kl', 'measurement_datetime'],
  orderBy: { field: 'measurement_datetime', order: 'desc' },
  limit: 500,
});
```

---

## 5. Commercial & Revenue Billing (`/commercial-revenue`)

This module tracks tariff billing to Oil Marketing Companies (OMCs) like Vivo, TotalEnergies, Rubis, and Ola.

### 5.1 In Plain English
- When KPC moves petrol or diesel from Mombasa to Nairobi or Western Kenya, it charges the oil marketing companies a transport tariff per cubic meter (e.g. **$48.0\text{ KES per } m^3$**).
- When the delivery is finished, an **Invoice** is generated.
- This module tracks how much revenue was billed, how much has been paid, and which invoices are overdue.

---

### 5.2 Which DocTypes & Fields Are Used?

| DocType | Field Name | Type | Purpose |
| :--- | :--- | :--- | :--- |
| **`Invoice`** | `customer` | Link | The OMC company name (e.g. `Vivo Energy`) |
| **`Invoice`** | `grand_total` | Currency | Total billing amount in KES |
| **`Invoice`** | `posting_date` | Date | Date the invoice was generated |
| **`Invoice`** | `docstatus` | Int | `0` = Draft, `1` = Submitted, `2` = Cancelled |
| **`Invoice`** | `journey_ref` | Link | Pipeline batch journey reference |
| **`Allocation`** | `allocated_quantity_kl` | Float | Volume of fuel allocated to this customer |
| **`Allocation`** | `product` | Link | Fuel grade (`PMS`, `AGO`, `Jet A-1`, `IK`) |
| **`Tariff`** | `rate_per_kl` | Currency | Approved regulatory pumping tariff rate |

---

### 5.3 How It Is Calculated in Code (`derive-commercial-metrics.ts`)

```typescript
// 1. Calculate Monthly Revenue (MTD)
const revenueMtd = mtdInvoices.reduce(
  (sum, inv) => sum + (Number(inv.grand_total) || 0),
  0
);

// 2. Calculate Customer Outstanding Balance
const outstanding = Math.max(0, invoicedAmount - paidAmount);

// 3. Accounts Receivable Aging
// Invoices are placed in brackets:
// - Current: 0 to 30 days old
// - Due: 31 to 60 days old
// - Overdue: 61 to 90 days old
// - Critical: 90+ days old (flags potential loading suspension)
```

---

## 6. Assets & Equipment Maintenance (`/assets-eam`)

Mainline pumps, booster motors, and motorized valves are monitored for mechanical reliability.

```
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│     Fleet Uptime     │   │         MTBF         │   │  Asset Health Index  │
│        98.6%         │   │       1,420 h        │   │       88 / 100       │
│    ▲ Above Target    │   │      Improving       │   │    Nominal Health    │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘
```

### 6.1 Plain English Explanations

#### 1. Fleet Uptime (%)
- **Plain English**: What percentage of our mainline pumps are healthy and ready to pump right now?
- **DocType**: `Plant Asset`
- **Fields**: `status` (`Operational`, `Breakdown`, `Maintenance`, `Decommissioned`)
- **API Call Hook**:
  ```typescript
  // Operational pumps
  const { data: opCount } = useFrappeGetDocCount('Plant Asset', [
    ['status', '=', 'Operational'],
  ]);
  // Total pumps
  const { data: totalCount } = useFrappeGetDocCount('Plant Asset', [
    ['status', '!=', 'Decommissioned'],
  ]);
  ```
- **Calculation**:
  $$\text{Fleet Uptime } \% = \left(\frac{\text{Operational Assets}}{\text{Total Assets}}\right) \times 100$$
  - Example: $23\text{ operational} \div 24\text{ total} = \mathbf{95.8\%}$. Target is $\mathbf{\ge 98.5\%}$.

#### 2. Mean Time Between Failures (MTBF)
- **Plain English**: How many hours does a pump run on average before breaking down?
- **DocType**: `Maintenance Work Order`
- **Fields**: `work_order_type` (`Emergency Repair`), `execution_status` (`Completed`)
- **Calculation**:
  $$\text{MTBF (Hours)} = \frac{\text{Total Operating Hours Across All Pumps}}{\text{Number of Completed Breakdowns}}$$
  - Example: 24 pumps operating for 30 days = $17,280\text{ hours}$. If 12 breakdowns occurred:
    $$\text{MTBF} = 17,280 \div 12 = \mathbf{1,440\text{ operating hours}}$$

---

## 7. Loss Accountability & EPRA Reconciliation (`/loss-accountability`)

This module monitors mass balance reconciliation and ensures fuel losses stay below the national legal limit.

```
       PIPELINE MASS-BALANCE RECONCILIATION
┌────────────────────────────────────────────────────────┐
│ [Opening Stock] + [Receipts]  VS  [Closing Stock] + [Dispatches] │
└────────────────────────────────────────────────────────┘
                          │
                   VARIANCE (KL)
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
   Within Tolerance (< 0.20%)        EPRA BREACH (> 0.25%)
   Normal System Operation           Triggers Investigation & Form P-04
```

### 7.1 Plain English Explanations

#### 1. The Mass Balance Equation
Fuel cannot vanish into thin air. At every depot:
$$\text{Expected Book Stock} = \text{Opening Physical Stock} + \text{Receipts} - \text{Dispatches}$$
$$\text{Variance } (KL) = \text{Closing Physical Stock} - \text{Expected Book Stock}$$

- If **Variance is negative ($-$)**: We physically have less fuel than the books say. This is a **product loss**.
- If **Variance is positive ($+$)**: We have more fuel (often due to temperature expansion or meter calibration drift).

#### 2. The EPRA 0.20% Regulatory Thresholds
The Energy and Petroleum Regulatory Authority (EPRA) sets strict legal limits:
- **$\le 0.20\%$ (Normal / Green)**: Permissible operational evaporation and meter tolerance.
- **$0.20\% - 0.25\%$ (Watchlist / Amber)**: Requires meter recalibration and pipe inspection.
- **$> 0.25\%$ (Breach / Red)**: Statutory violation! Automatically generates **EPRA Form P-04** and prompts an immediate investigation.

---

### 7.2 Which DocTypes & Fields Are Used?

| DocType | Field Name | Type | Purpose |
| :--- | :--- | :--- | :--- |
| **`Reconciliation`** | `dispatched_quantity_kl` | Float | Volume sent into the pipe at Mombasa |
| **`Reconciliation`** | `received_quantity_kl` | Float | Volume received at destination depot |
| **`Reconciliation`** | `variance_kl` | Float | Difference in kilolitres |
| **`Reconciliation`** | `variance_percent` | Float | Percentage loss relative to throughput |
| **`Variance`** | `loss_category` | Select | `Evaporation`, `Meter error`, `Measurement`, `Suspected theft` |

---

## 8. HSE & Safety Integrity (`/hse-integrity`)

Safety compliance metrics protecting personnel, local communities, and the environment.

### 8.1 Metrics & Logic

#### 1. Days Since LTI (Lost Time Injury)
- **Plain English**: How many consecutive days have workers operated without an accident severe enough to cause missed shifts?
- **DocType**: `AI Alert` or `Incident Log`
- **Logic**: Automatically counts days since the last recorded High-Severity safety incident.

#### 2. Pipeline Cathodic Protection (CP) Health (%)
- **Plain English**: Buried steel pipes naturally corrode unless a protective electrical voltage is applied into the ground.
- **Normal Protection Voltage**: **$-0.85\text{ V}$ to $-1.20\text{ V}$** DC pipe-to-soil potential.
- **Health %**: Percentage of test station probes reading within the safe $-0.85\text{V}$ to $-1.20\text{V}$ window.

---

## 9. The 5 Regulatory Reports: API Calls & Logic

All reports in `/reports/*` call specialized Python backend endpoints that perform server-side calculations and return regulator-ready tables.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REPORT ACTION CONTROLS                          │
│  [ Columns Modal ]   [ Export CSV / Excel ]   [ Print PDF ]   [ Ask AI ] │
└────────────────────────────────────────────────────────────────────────┘
```

### 9.1 Daily Throughput Report (`/reports/daily-throughput`)
- **API Call**:
  ```typescript
  const { data } = useFrappeGetCall(
    'kpc.petroleum_operations.api.get_daily_throughput_report',
    { date: '2026-09-07' }
  );
  ```
- **Calculations**:
  - `Variance = Actual Volume - Planned Volume`
  - `Attainment % = (Actual Volume / Planned Volume) * 100`

---

### 9.2 Stock Position & Reconciliation Report (`/reports/stock-reconciliation`)
- **API Call**:
  ```typescript
  const { data } = useFrappeGetCall(
    'kpc.petroleum_operations.api.get_stock_reconciliation_report',
    { terminal: 'NBI-01', date: '2026-09-07' }
  );
  ```
- **Calculations**:
  - `Safe Fill Capacity = Gross Capacity * 0.95`
  - `Available Ullage = Safe Fill Capacity - Physical Net Volume`
  - `Variance = Physical Stock - Book Stock`
  - `Variance % = (Variance / Book Stock) * 100`

---

### 9.3 Product Loss / Form P-04 Report (`/reports/product-loss`)
- **API Call**:
  ```typescript
  const { data } = useFrappeGetCall(
    'kpc.petroleum_operations.api.get_product_loss_report',
    { period: 'MTD' }
  );
  ```
- **Calculations**:
  - `Segment Loss % = (Loss Volume / Segment Throughput) * 100`
  - `EPRA Breach Flag`: If `Segment Loss % > 0.20%`, sets flag to `"Breach"` and triggers one-click Form P-04 regulatory export.

---

### 9.4 Tariff Revenue & OMC Billing Report (`/reports/tariff-revenue`)
- **API Call**:
  ```typescript
  const { data } = useFrappeGetCall(
    'kpc.petroleum_operations.api.get_tariff_revenue_report',
    { period: 'MTD' }
  );
  ```
- **Calculations**:
  - `Invoiced (KES Millions) = (Volume m³ * Tariff Rate) / 1,000,000`
  - `Outstanding = Invoiced - Paid`
  - `Collection % = (Paid / Invoiced) * 100`

---

### 9.5 HSE & Compliance Report (`/reports/hse-compliance`)
- **DocTypes**: `Permit to Work`, `Employee Certification`
- **Metrics**: Counts active permits, checks for expired safety authorizations, and tracks right-of-way patrol coverage.

---

## 10. Quick Reference Cheat Sheet (DocTypes & APIs)

| Page / Feature | Primary DocTypes | Backend API Method / Hook | Key Calculation |
| :--- | :--- | :--- | :--- |
| **Corridor 3D Map** | `Terminal`, `Oil Tank`, `Movement` | `api.get_pipeline_scada_network` | Coordinates, tank fill levels, line velocity |
| **Flow Speed & ETA** | `Movement`, `Pipeline Batch` | `useFrappeGetDocList('Movement')` | $v = \frac{Q}{A}$, $\text{ETA} = \frac{\text{Distance}}{v}$ |
| **Tank Ullage** | `Oil Tank`, `Tank Measurement` | `api.get_stock_reconciliation_report` | $\text{Ullage} = \text{Safe Capacity} - \text{Net Stock}$ |
| **Plan Attainment** | `Pipeline Batch`, `Movement` | `api.get_daily_throughput_report` | $\text{Attainment } \% = \frac{\text{Actual}}{\text{Plan}} \times 100$ |
| **Tariff Billing** | `Invoice`, `Allocation`, `Tariff` | `api.get_tariff_revenue_report` | $\text{Billed} = \text{Volume} \times \text{Tariff Rate}$ |
| **Fleet Uptime** | `Plant Asset` | `useFrappeGetDocCount('Plant Asset')` | $\text{Uptime } \% = \frac{\text{Operational}}{\text{Total}} \times 100$ |
| **System Loss** | `Reconciliation`, `Variance` | `api.get_product_loss_report` | $\text{Loss } \% = \frac{|\text{Variance}|}{\text{Throughput}} \times 100$ |
| **Safety Days** | `AI Alert`, `Permit to Work` | `useFrappeGetDocList('Permit to Work')` | Calendar days elapsed since last LTI |

---

*© 2026 Kenya Pipeline Company Limited. Operations Intelligence & SCADA Telemetry.*
