# KPC Portal — Page & Section Calculation and Data Guide

> **An Everyday Person Handbook for Operations, Finance, Safety, and Engineering.**  
> *Structured page-by-page and section-by-section. Every card, chart, and table is explained in simple everyday terms, with exact DocTypes, database fields, API calls, and real-world calculation examples.*

---

## Master Table of Contents

- [Page 1: Executive Command Dashboard (`/` or `/portal`)](#page-1-executive-command-dashboard--or-portal)
  - [Section 1.1: The 4 Executive 3D KPI Cards](#section-11-the-4-executive-3d-kpi-cards)
  - [Section 1.2: 3D Kenya Pipeline SCADA Network Map](#section-12-3d-kenya-pipeline-scada-network-map)
  - [Section 1.3: Live Operational AI Alerts Stream](#section-13-live-operational-ai-alerts-stream)
  - [Section 1.4: Executive Analytics Charts](#section-14-executive-analytics-charts)
- [Page 2: Pipeline Flow Tracking (`/pipeline-flow`)](#page-2-pipeline-flow-tracking-pipeline-flow)
  - [Section 2.1: Flow Header & Telemetry Controls](#section-21-flow-header--telemetry-controls)
  - [Section 2.2: The 5 Flow KPI Cards](#section-22-the-5-flow-kpi-cards)
  - [Section 2.3: Product Flow 3D Animation & Hydraulics](#section-23-product-flow-3d-animation--hydraulics)
  - [Section 2.4: Active Batches Data Grid](#section-24-active-batches-data-grid)
- [Page 3: Stock & Tank Farm (`/stock-tank-farm`)](#page-3-stock--tank-farm-stock-tank-farm)
  - [Section 3.1: Depot Selector & Storage KPI Cards](#section-31-depot-selector--storage-kpi-cards)
  - [Section 3.2: 3D Tank Farm Cylinder Visualizer](#section-32-3d-tank-farm-cylinder-visualizer)
  - [Section 3.3: Stock Movement & Tank Reconciliation Cards](#section-33-stock-movement--tank-reconciliation-cards)
- [Page 4: Commercial & Revenue (`/commercial-revenue`)](#page-4-commercial--revenue-commercial-revenue)
  - [Section 4.1: Commercial Revenue KPI Cards](#section-41-commercial-revenue-kpi-cards)
  - [Section 4.2: Revenue by Product & Revenue Mix Charts](#section-42-revenue-by-product--revenue-mix-charts)
  - [Section 4.3: Top Customers & OMC Receivables Table](#section-43-top-customers--omc-receivables-table)
- [Page 5: Assets & Equipment Maintenance (`/assets-eam`)](#page-5-assets--equipment-maintenance-assets-eam)
  - [Section 5.1: Asset Reliability KPI Cards](#section-51-asset-reliability-kpi-cards)
  - [Section 5.2: Work Orders Kanban Board](#section-52-work-orders-kanban-board)
  - [Section 5.3: 6-Month Fleet Uptime & Downtime Cost Trends](#section-53-6-month-fleet-uptime--downtime-cost-trends)
  - [Section 5.4: Critical Rotating Equipment Table](#section-54-critical-rotating-equipment-table)
- [Page 6: Loss Accountability (`/loss-accountability`)](#page-6-loss-accountability-loss-accountability)
  - [Section 6.1: Mass-Balance & EPRA Loss KPI Cards](#section-61-mass-balance--epra-loss-kpi-cards)
  - [Section 6.2: Segment-by-Product Loss Heatmap](#section-62-segment-by-product-loss-heatmap)
  - [Section 6.3: Loss Root Cause Donut Chart](#section-63-loss-root-cause-donut-chart)
  - [Section 6.4: Segment Accountability Table & EPRA Tolerance Bar](#section-64-segment-accountability-table--epra-tolerance-bar)
- [Page 7: HSE & Safety Integrity (`/hse-integrity`)](#page-7-hse--safety-integrity-hse-integrity)
  - [Section 7.1: Safety Health KPI Cards](#section-71-safety-health-kpi-cards)
  - [Section 7.2: Pipeline Right-of-Way Incident Route Map](#section-72-pipeline-right-of-way-incident-route-map)
  - [Section 7.3: Incident Severity & Type Distribution](#section-73-incident-severity--type-distribution)
  - [Section 7.4: Live Incident Log & Corrective Actions Table](#section-74-live-incident-log--corrective-actions-table)
- [The 5 Regulatory Reports (`/reports/*`)](#the-5-regulatory-reports-reports)
  - [Report 1: Daily Throughput Report (`/reports/daily-throughput`)](#report-1-daily-throughput-report-reportsdaily-throughput)
  - [Report 2: Stock Position & Reconciliation Report (`/reports/stock-reconciliation`)](#report-2-stock-position--reconciliation-report-reportsstock-reconciliation)
  - [Report 3: Product Loss / Form P-04 Statutory Return (`/reports/product-loss`)](#report-3-product-loss--form-p-04-statutory-return-reportsproduct-loss)
  - [Report 4: Tariff Revenue & OMC Billing Report (`/reports/tariff-revenue`)](#report-4-tariff-revenue--omc-billing-report-reportstariff-revenue)
  - [Report 5: HSE & Compliance Safety Report (`/reports/hse-compliance`)](#report-5-hse--compliance-safety-report-reportshse-compliance)
- [Complete Master Quick-Reference Table](#complete-master-quick-reference-table)

---

# Page 1: Executive Command Dashboard (`/` or `/portal`)

The Executive Command view gives directors and station commanders complete oversight of national operations.

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP 3D KPIS: Throughput Today · Network Line Fill · Revenue MTD · Loss │
├───────────────────────────────────┬────────────────────────────────────┤
│ 3D SCADA KENYA PIPELINE MAP       │ LIVE AI ANOMALY ALERTS             │
│ Live Nodes & Pump Pressure        │ Critical / Watch / Normal Badges   │
├───────────────────────────────────┴────────────────────────────────────┤
│ ANALYTICS: 30-Day Throughput · Product Mix · Revenue vs Target         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Section 1.1: The 4 Executive 3D KPI Cards

### 1. Throughput Today ($m^3$)
- **What you see**: A large blue 3D card showing total fuel received today (e.g. **`9,530 m³`**) with a badge (e.g. **`▲ 3 active batches`**).
- **Everyday Explanation**: Add up the volume of every batch that finished delivering into our depot tanks today.
- **Data Source**: DocType **`Terminal Receipt`**.
- **Fields Used**: `net_standard_volume_kl` (preferred volume at $15^\circ\text{C}$), `gross_observed_volume_kl` (raw meter fallback), `posting_date`.
- **How the Portal Calls Frappe**:
  ```typescript
  const { data: receipts } = useFrappeGetDocList('Terminal Receipt', {
    fields: ['net_standard_volume_kl', 'gross_observed_volume_kl'],
    filters: [['posting_date', '=', todayDate]],
  });
  ```
- **Step-by-Step Example**:
  - Delivery 1: Line 5 (Diesel to Nairobi) = $4,850\text{ m}^3$
  - Delivery 2: Line 1 (Petrol to Nairobi) = $3,120\text{ m}^3$
  - Delivery 3: Line 4 (Jet Fuel to Kisumu) = $1,560\text{ m}^3$
  - **Total Today = $4,850 + 3,120 + 1,560 = \mathbf{9,530\text{ m}^3}$**.

---

### 2. Network Line Fill ($m^3$)
- **What you see**: A cyan 3D card showing active pipeline and storage inventory (e.g. **`145.2k m³`**).
- **Everyday Explanation**: How much fuel is physically stored inside all our trunk pipelines and operating storage tanks right now.
- **Data Source**: DocTypes **`Oil Tank`** and **`Movement`**.
- **Fields Used**: `safe_fill_capacity_kl`, `current_state`, `capacity_kl`.
- **How the Portal Calls Frappe**:
  ```typescript
  const { data: tanks } = useFrappeGetDocList('Oil Tank', {
    fields: ['safe_fill_capacity_kl', 'current_state'],
  });
  ```
- **Step-by-Step Example**:
  - 24 active storage tanks with an average safe capacity of $6,050\text{ m}^3$ each.
  - $24 \times 6,050 = 145,200\text{ m}^3$. Displayed formatted as **`145.2k m³`**.

---

### 3. Revenue MTD ($KES$)
- **What you see**: An emerald green 3D card showing billed pipeline revenue this month (e.g. **`842.50 M KES`**).
- **Everyday Explanation**: Total Kenya Shillings invoiced to Oil Marketing Companies (Vivo, Total, Rubis, etc.) for transport and storage this month.
- **Data Source**: DocType **`Invoice`**.
- **Fields Used**: `grand_total`, `docstatus` (must be `1` for approved/submitted), `posting_date`.
- **How the Portal Calls Frappe**:
  ```typescript
  const { data: invoices } = useFrappeGetDocList('Invoice', {
    fields: ['grand_total', 'docstatus'],
    filters: [['docstatus', '=', 1]],
  });
  ```
- **Step-by-Step Example**:
  - Invoices this month total $842,500,000\text{ KES}$.
  - Divide by $1,000,000$ for compact display: **`842.50 M KES`**.

---

### 4. System Loss (%)
- **What you see**: An amber or green card showing average network loss (e.g. **`0.17%`**).
- **Everyday Explanation**: What percentage of fuel was lost across all shipments this month due to evaporation or measurement drift.
- **Data Source**: DocType **`Reconciliation`**.
- **Fields Used**: `variance_percent`, `variance_kl`, `within_tolerance`.
- **Threshold Rules**:
  - **$\le 0.20\%$ (Normal / Green)**: Below national legal ceiling set by EPRA.
  - **$0.20\% - 0.25\%$ (Watch / Amber)**: Requires meter calibration inspection.
  - **$> 0.25\%$ (Breach / Red)**: Violates regulation; triggers mandatory investigation.

---

## Section 1.2: 3D Kenya Pipeline SCADA Network Map

- **What you see**: An interactive 3D map of Kenya. Glowing nodes represent Mombasa, Mtito Andei, Sultan Hamud, Nairobi, Nakuru, Eldoret, and Kisumu. Moving pulses indicate live pumping.
- **Data Source**: Custom backend Python endpoint combining 3 DocTypes (`Terminal`, `Oil Tank`, `Movement`).
- **How the Portal Calls Frappe**:
  ```typescript
  const { data } = useFrappeGetCall(
    'kpc.petroleum_operations.api.get_pipeline_scada_network'
  );
  ```
- **Calculations Behind the Map**:
  1. **Terminal Fill %**: `(Total Stock in Tanks ÷ Total Terminal Capacity) × 100`.
  2. **Pumping Pressure ($bar$)**: Real-time SCADA pressure reading from booster pump discharge sensors.
  3. **Node Status**: If any tank in that depot is in maintenance, node turns amber; if in quarantine, it turns red.

---

## Section 1.3: Live Operational AI Alerts Stream

- **What you see**: A scrollable stream of real-time operational notifications with color-coded severity badges (`Critical`, `Watch`, `Normal`).
- **Data Source**: DocType **`AI Alert`**.
- **Fields Used**: `title`, `description`, `severity`, `status`, `alert_type`, `creation`.
- **How the Portal Calls Frappe**:
  ```typescript
  const { data: alerts } = useFrappeGetDocList('AI Alert', {
    fields: ['title', 'severity', 'status', 'description', 'creation'],
    filters: [['status', '=', 'Open']],
    orderBy: { field: 'creation', order: 'desc' },
    limit: 10,
  });
  ```

---

## Section 1.4: Executive Analytics Charts

1. **30-Day Throughput Trend (Line Chart)**:
   - X-Axis: Days of the month.
   - Y-Axis: Cubic meters pumped ($m^3$).
   - Compares daily actual pumping against the nomination target curve.
2. **Product Mix (Donut / Bar Chart)**:
   - Shows percentage split of fuels moved:
     - **AGO (Diesel)**: ~45%
     - **PMS (Super Petrol)**: ~35%
     - **Jet A-1 (Aviation Fuel)**: ~15%
     - **IK (Kerosene)**: ~5%
3. **Revenue vs Target (Area Chart)**:
   - Compares actual cumulative billed shillings against the monthly budget target.

---

# Page 2: Pipeline Flow Tracking (`/pipeline-flow`)

This page gives hydraulic engineers and dispatchers a real-time view of batch slugs sliding through trunk pipelines.

```
┌────────────────────────────────────────────────────────────────────────┐
│ HEADER: Live Pump Telemetry · Shift Selector · Auto-Refresh Switch     │
├────────────────────────────────────────────────────────────────────────┤
│ 5 FLOW KPIS: Throughput Today · Avg Flow · Active Batches · Pack · Plan│
├────────────────────────────────────────────────────────────────────────┤
│ 3D FLOW DIAGRAM: Mombasa ════► Sultan Hamud ════► Nairobi ════► Western│
├────────────────────────────────────────────────────────────────────────┤
│ ACTIVE BATCHES TABLE: Batch Code · Product · Volume · ETA Countdown    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Section 2.1: Flow Header & Telemetry Controls
- **What you see**: Live timestamp, quick shift selector (Shift A / Shift B), and manual refresh button.
- **Data Source**: Context state from `PipelineFlowRefreshProvider`.

---

## Section 2.2: The 5 Flow KPI Cards

| Card Title | Value Example | Data Source DocType | Plain English Everyday Calculation |
| :--- | :--- | :--- | :--- |
| **Throughput today** | `9,530 m³` | `Movement` + `Pipeline Batch` | Sum of planned volumes for batches completed today. |
| **Avg flow rate** | `794 m³/h` | `Movement.monitored_flow_rate_m3h` | Average pumping speed of active in-transit lines. |
| **Active batches** | `3 batches` | `Movement` (where status = `In Transit`) | Count of fuel slugs currently traveling in the pipe. |
| **Line pack** | `28,400 m³` | `Pipeline Batch.planned_volume_kl` | Total volume of fuel currently inside the pipe. |
| **Plan attainment**| `103%` | `Movement` + `Pipeline Batch` | `(Completed Today ÷ Planned Today) × 100`. |

---

## Section 2.3: Product Flow 3D Animation & Hydraulics

### How Speed (Velocity) & Arrival Time (ETA) Are Calculated

```
[ Mombasa ] ═════════════════► [ BATCH: PMS ] ═════════════════► [ Nairobi ]
 Flow: 950 m³/h                  Diameter: 20 inches              Remaining: 140 km
```

1. **Step 1: Calculate the Pipe Area ($A$)**:
   - A 20-inch pipe has an inside diameter of $0.508\text{ meters}$.
   - Radius $r = 0.508 \div 2 = 0.254\text{ meters}$.
   - $\text{Area } A = 3.14159 \times (0.254)^2 \approx \mathbf{0.2027\text{ m}^2}$.
2. **Step 2: Calculate Speed ($v$)**:
   - $\text{Speed} = \text{Flow Rate } (950\text{ m}^3/\text{h}) \div \text{Area } (0.2027\text{ m}^2) = 4,687\text{ m/h}$.
   - Convert to $km/h$: $4,687 \div 1,000 = \mathbf{4.69\text{ km/h}}$.
3. **Step 3: Calculate Arrival Time (ETA)**:
   - If the batch front is at Sultan Hamud and has **$140\text{ km}$** left to Nairobi:
   - $\text{Hours Left} = 140\text{ km} \div 4.69\text{ km/h} \approx \mathbf{29.85\text{ hours}}$ (29 hours, 51 minutes).
4. **How It Looks in 3D**:
   - Animated light beads slide through the glass pipe tube. Their animation speed is linked directly to the calculated $4.69\text{ km/h}$.

---

## Section 2.4: Active Batches Data Grid

- **What you see**: A data grid listing every active fuel batch with columns:
  - **Batch Name**: e.g. `BATCH-2026-089` (from `Pipeline Batch.name`).
  - **Product**: Soft pill badge (e.g. Amber for `PMS`, Green for `AGO`, Purple for `Jet A-1`).
  - **Route**: `Mombasa → Nairobi`.
  - **Planned Vol (KL)**: e.g. `12,000 KL`.
  - **Interface Cut (KL)**: Transmix buffer volume diverted to slop tanks (e.g. `88 KL`).
  - **Schedule Window**: Pumping start and end times.
  - **Status**: `Submitted`, `In Transit`, or `Draft`.

---

# Page 3: Stock & Tank Farm (`/stock-tank-farm`)

This page provides storage tank inventory oversight across all 5 major depots.

```
┌────────────────────────────────────────────────────────────────────────┐
│ DEPOT TABS: [ All ] [ Mombasa ] [ Nairobi ] [ Nakuru ] [ Eldoret ] [ Kisumu ]
├────────────────────────────────────────────────────────────────────────┤
│ STORAGE KPIS: Physical Stock · Safe Fill Cap · Available Ullage · Alarm │
├────────────────────────────────────────────────────────────────────────┤
│ 3D TANK FARM: Cylindrical tanks with live liquid height & ullage gap   │
├────────────────────────────────────────────────────────────────────────┤
│ MOVEMENT CARDS: Inflows Today · Outflows Today · Net Variance         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Section 3.1: Depot Selector & Storage KPI Cards

1. **Total Physical Stock ($KL$)**:
   - **Everyday Meaning**: Total fuel currently sitting inside the tanks, corrected to standard $15^\circ\text{C}$ temperature.
   - **Data Source**: DocType **`Tank Measurement`** (`net_standard_volume_kl`).
2. **Safe Fill Capacity ($KL$)**:
   - **Everyday Meaning**: The maximum safe limit tanks can hold without risk of overflowing (set to $95\%$ of total tank shell size).
   - **Data Source**: DocType **`Oil Tank`** (`safe_fill_capacity_kl`).
   - **Formula**: $\text{Gross Capacity} \times 0.95$.
3. **Available Ullage ($KL$)**:
   - **Everyday Meaning**: The empty space left in the tank. "How much more fuel can we receive right now?"
   - **Formula**: $\text{Safe Fill Capacity} - \text{Current Physical Stock}$.
   - **Example**: Safe capacity = $10,000\text{ KL}$, Current stock = $7,200\text{ KL}$. Ullage = **$2,800\text{ KL}$**.
4. **Tanks in Alarm**:
   - **Everyday Meaning**: Tanks whose liquid level is above $90\%$ (High Level Alarm) or in maintenance/quarantine.

---

## Section 3.2: 3D Tank Farm Cylinder Visualizer

- **What you see**: Interactive 3D cylinders representing actual steel storage tanks.
- **Visual Behavior**:
  - The colored liquid mesh inside the cylinder rises to match the exact physical fill percentage (`fill_pct`).
  - The transparent upper space represents the available ullage.
  - Tanks with high water bottoms ($> 50\text{ mm}$) flash a drainage warning.

---

## Section 3.3: Stock Movement & Tank Reconciliation Cards

- **Inflows ($KL$)**: Deliveries received into the tank farm from incoming pipelines.
- **Outflows ($KL$)**: Dispatches pumped to road tanker loading gantries or forward pipelines.
- **Net Daily Variance ($KL$)**: Difference between physical dip measurements and inventory ledger balances.

---

# Page 4: Commercial & Revenue (`/commercial-revenue`)

This page tracks pipeline transportation billing and customer receivables across Oil Marketing Companies.

```
┌────────────────────────────────────────────────────────────────────────┐
│ KPIS: Tariff Revenue MTD · Billed Total · Customers Billed · Volume MTD│
├───────────────────────────────────┬────────────────────────────────────┤
│ REVENUE BY PRODUCT (Bar Chart)    │ PRODUCT REVENUE MIX (Donut)        │
├───────────────────────────────────┴────────────────────────────────────┤
│ TOP CUSTOMERS TABLE: OMC · Invoiced · Paid · Outstanding · Aging       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Section 4.1: Commercial Revenue KPI Cards

1. **Tariff Revenue MTD ($KES$)**:
   - Sum of all approved (`docstatus = 1`) invoices billed this month.
2. **Billed Total ($KES$)**:
   - Cumulative total accounts receivable billed across the system.
3. **Customers Billed**:
   - Count of distinct oil marketing companies invoiced this month (e.g. `6 OMCs`).
4. **Volume MTD ($KL$)**:
   - Total kilolitres allocated across submitted journeys this month.

---

## Section 4.2: Revenue by Product & Revenue Mix Charts

- **Revenue by Product**: Displays monthly billing broken down by fuel grade (AGO Diesel produces the highest tariff revenue due to heavy commercial haulage).
- **Product Revenue Mix**:
  - Petrol (PMS): ~38%
  - Diesel (AGO): ~44%
  - Jet Fuel: ~15%
  - Kerosene: ~3%

---

## Section 4.3: Top Customers & OMC Receivables Table

| Column Name | Meaning | How It Is Calculated |
| :--- | :--- | :--- |
| **Customer** | Name of the oil company | From `Invoice.customer` (e.g. `Vivo Energy`, `TotalEnergies`) |
| **Volume (KL)** | Fuel delivered to this customer | Sum of `Allocation.allocated_quantity_kl` |
| **Invoiced (KES M)** | Billed transport tariff | Volume $\times$ Approved Tariff Rate ($48\text{ KES/m}^3$) |
| **Paid (KES M)** | Payments collected | Cash remittances credited to the invoice |
| **Outstanding** | Unpaid balance | $\text{Invoiced} - \text{Paid}$ |
| **Aging** | Payment delay bracket | Current (0–30d), Due (31–60d), Overdue (61–90d), Critical (90+d) |

---

# Page 5: Assets & Equipment Maintenance (`/assets-eam`)

Monitors mainline pumps, booster stations, electric motors, and valves.

```
┌────────────────────────────────────────────────────────────────────────┐
│ KPIS: Assets Monitored · Open Work Orders · Overdue PM · Uptime · MTBF │
├───────────────────────────────────┬────────────────────────────────────┤
│ WORK ORDERS KANBAN BOARD          │ 6-MONTH UPTIME & COST TRENDS       │
├───────────────────────────────────┴────────────────────────────────────┤
│ CRITICAL ROTATING ASSETS: Pump Tag · Vibration · Pressure · Health AHI │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Section 5.1: Asset Reliability KPI Cards

1. **Assets Monitored**: Count of non-decommissioned assets in `Plant Asset` (e.g. `1,284 assets`).
2. **Open Work Orders**: Work orders in status `Not Started` or `In Progress` in `Maintenance Work Order`.
3. **Overdue PM**: Preventive maintenance jobs past their scheduled completion date.
4. **Fleet Uptime (%)**:
   - **Formula**: $\frac{\text{Operational Assets}}{\text{Total Assets}} \times 100$.
   - **Example**: 23 running pumps out of 24 = **$95.8\%$**. Target is $\ge 98.5\%$.
5. **MTBF (Mean Time Between Failures)**:
   - **Formula**: $\frac{\text{Total Operating Hours}}{\text{Number of Breakdowns}}$.
   - **Example**: 24 pumps $\times$ 720 hours = $17,280\text{ hours}$. If 12 breakdowns occurred: $\text{MTBF} = \mathbf{1,440\text{ hours}}$.

---

## Section 5.2: Work Orders Kanban Board

Columns organize jobs by workflow stage:
- **Not Started**: Scheduled jobs awaiting parts or technicians.
- **In Progress**: Active maintenance crews on site with approved Permit-to-Work.
- **Emergency**: Immediate breakdown interventions (flagged red).
- **Completed**: Repaired and cleared for pipeline restart.

---

## Section 5.3: 6-Month Fleet Uptime & Downtime Cost Trends

- **Green Line**: Equipment availability percentage vs the 98.5% reliability benchmark.
- **Red/Amber Bars**: Maintenance costs broken into Preventive vs Emergency repair spending.

---

## Section 5.4: Critical Rotating Equipment Table

- **Pump Tag**: e.g. `P-101A (Mombasa Mainline Pump)`.
- **Vibration**: Measured by IoT vibration probes in millimeters per second ($mm/s$). Safe limit is $< 2.5\text{ mm/s}$.
- **Differential Pressure ($\Delta P$)**: Pressure boost created by the pump ($bar$).
- **Asset Health Index (AHI)**: Score from 0 to 100 based on vibration, operating hours, and overdue maintenance.

---

# Page 6: Loss Accountability (`/loss-accountability`)

This module enforces fuel conservation and guarantees compliance with the EPRA $0.20\%$ maximum loss regulation.

```
┌────────────────────────────────────────────────────────────────────────┐
│ KPIS: System Loss MTD · Allowable Ceiling · Unaccounted Vol · Breaches │
├───────────────────────────────────┬────────────────────────────────────┤
│ SEGMENT-BY-PRODUCT LOSS HEATMAP   │ LOSS BY CAUSE DONUT CHART          │
├───────────────────────────────────┴────────────────────────────────────┤
│ SEGMENT TABLE: Segment · Throughput · Loss m³ · Loss % · EPRA Bar     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Section 6.1: Mass-Balance & EPRA Loss KPI Cards

1. **System Loss MTD**: Network-wide average loss percentage (e.g. **`0.17%`**).
2. **Allowable Ceiling**: The legal EPRA limit (**`0.20%`**).
3. **Volume Unaccounted**: Total physical cubic meters missing across all segments (e.g. **`312 m³`**).
4. **Segments in Breach**: Count of pipeline segments currently exceeding the 0.20% limit.
5. **Recovered Transmix**: Mixed product reprocessed at the refinery slop facility (e.g. **`88 m³`**).

---

## Section 6.2: Segment-by-Product Loss Heatmap

- A color-coded matrix showing loss percentages for every pipeline segment and fuel type:
  - Mombasa–Maungu
  - Maungu–Mtito
  - Mtito–Sultan Hamud
  - Sultan Hamud–Nairobi
  - Nairobi–Nakuru
- **Colors**: Green ($< 0.15\%$), Amber ($0.15\% - 0.20\%$), Red ($> 0.20\%$).

---

## Section 6.3: Loss Root Cause Donut Chart

Categorizes why fuel was lost (from `Variance.loss_category`):
- **Evaporation (~40%)**: Normal light-end vapor losses in storage tanks.
- **Meter Error (~24%)**: Calibration tolerances between turbine and Coriolis meters.
- **Measurement Temperature (~17%)**: Thermal expansion variations.
- **Suspected Theft / Siphoning (~19%)**: Illegal pipeline hot-taps flagged for security patrols.

---

## Section 6.4: Segment Accountability Table & EPRA Tolerance Bar

- Displays the **EPRA Tolerance Bar %**:
  $$\text{Bar Fill } \% = \min\left(100\%, \frac{\text{Actual Loss } \%}{0.20\%} \times 100\right)$$
- If a segment has a $0.10\%$ loss, the bar fills to $50\%$.
- If a segment has a $0.22\%$ loss, the bar fills to $100\%$ with a bright red **"Breach"** alert badge.

---

# Page 7: HSE & Safety Integrity (`/hse-integrity`)

Tracks environmental safety, occupational health, and pipeline cathodic corrosion protection.

```
┌────────────────────────────────────────────────────────────────────────┐
│ KPIS: Days Since LTI · Incidents MTD · Open Actions · LTIFR · CP Health│
├───────────────────────────────────┬────────────────────────────────────┤
│ CORRIDOR INCIDENT ROUTE MAP       │ INCIDENT SEVERITY BAR CHART        │
├───────────────────────────────────┴────────────────────────────────────┤
│ SAFETY LOG: Incident Ref · Date · Location · Severity · Action Status  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Section 7.1: Safety Health KPI Cards

1. **Days Since LTI**: Consecutive days without a Lost-Time Injury (e.g. **`214 days`**).
2. **Incidents MTD**: Total environmental or workplace safety events logged this month.
3. **Open Actions**: Corrective safety action items still pending.
4. **LTIFR (Lost Time Injury Frequency Rate)**:
   $$\text{LTIFR} = \frac{\text{Number of LTIs} \times 1,000,000}{\text{Total Man-Hours Worked}}$$
5. **Cathodic Protection (CP) Health**:
   - Buried pipes are protected from rusting using negative electric voltage.
   - Normal protection range is **$-0.85\text{V}$ to $-1.20\text{V}$**.
   - Score shows what percentage of test stations are within the safe protection zone (e.g. **`98%`**).

---

## Section 7.2: Pipeline Right-of-Way Incident Route Map

- A schematic map of the pipeline corridor marking where safety incidents occurred (e.g. near Sultan Hamud or Mtito Andei).

---

## Section 7.3: Incident Severity & Type Distribution

- Groups incidents into **Spill**, **Near-Miss**, **Injury**, **Fire**, and **Environmental**, categorized by severity level (Low, Medium, High).

---

## Section 7.4: Live Incident Log & Corrective Actions Table

- Detailed audit grid showing Incident Reference number, date, station location, lost volume (if a spill occurred), corrective action taken, and current status (`In Progress` or `Closed`).

---

# The 5 Regulatory Reports (`/reports/*`)

Each report features dynamic column toggling, print-to-PDF formatting, Excel/CSV downloads, and an integrated AI operational diagnostic assistant.

```
┌────────────────────────────────────────────────────────────────────────┐
│  [ Columns Modal ]   [ Export CSV / Excel ]   [ Print PDF ]   [ Ask AI ] │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Report 1: Daily Throughput Report (`/reports/daily-throughput`)

- **API Endpoint**: `kpc.petroleum_operations.api.get_daily_throughput_report`
- **Frontend Hook**:
  ```typescript
  const { data } = useFrappeGetCall(
    'kpc.petroleum_operations.api.get_daily_throughput_report',
    { date: selectedDate }
  );
  ```
- **Table Columns & Everyday Calculation**:
  - **Line & Route**: Pipeline leg (e.g. `Line 5 (Mombasa → Nairobi)`).
  - **Product**: Product grade (`PMS`, `AGO`, `Jet A-1`, `IK`).
  - **Planned ($m^3$)**: Daily schedule nomination quota agreed with OMCs.
  - **Actual ($m^3$)**: Actual delivered volume summed from `Terminal Receipt` records.
  - **Variance ($m^3$)**: `Actual - Planned`. (Positive means ahead of plan; negative means behind).
  - **Attain %**: `(Actual ÷ Planned) × 100`.
  - **Status**: `On track` ($\ge 95\%$) or `Below plan` ($< 95\%$).

---

## Report 2: Stock Position & Reconciliation Report (`/reports/stock-reconciliation`)

- **API Endpoint**: `kpc.petroleum_operations.api.get_stock_reconciliation_report`
- **Frontend Hook**:
  ```typescript
  const { data } = useFrappeGetCall(
    'kpc.petroleum_operations.api.get_stock_reconciliation_report',
    { terminal: selectedTerminal, date: selectedDate }
  );
  ```
- **Table Columns & Everyday Calculation**:
  - **Tank**: Tank code (e.g. `NRB-TK-04`).
  - **Product**: Fuel grade stored.
  - **Capacity ($KL$)**: Safe fill capacity ($95\%$ of tank shell).
  - **Book Stock ($KL$)**: What the ERP accounting ledger says we should have.
  - **Physical Stock ($KL$)**: What the radar or manual dip tape physically measures, normalized to $15^\circ\text{C}$.
  - **Variance ($KL$)**: `Physical Stock - Book Stock`.
  - **Variance %**: `(Variance ÷ Book Stock) × 100`.
  - **Available Ullage ($KL$)**: `Safe Fill Capacity - Physical Stock`.
  - **Status**: `Normal` (within 0.5% tolerance), `Watch`, or `High level` (above 90% capacity).

---

## Report 3: Product Loss / Form P-04 Statutory Return (`/reports/product-loss`)

- **API Endpoint**: `kpc.petroleum_operations.api.get_product_loss_report`
- **Frontend Hook**:
  ```typescript
  const { data } = useFrappeGetCall(
    'kpc.petroleum_operations.api.get_product_loss_report',
    { period: 'MTD' }
  );
  ```
- **Table Columns & Everyday Calculation**:
  - **Segment**: Pipeline section (e.g. `Mombasa–Maungu`, `Sultan Hamud–Nairobi`).
  - **Length**: Distance in kilometers.
  - **Throughput ($m^3$)**: Total volume pumped through this segment this month.
  - **Loss ($m^3$)**: Missing volume from mass-balance reconciliation.
  - **Loss %**: `(Loss ÷ Throughput) × 100`.
  - **Cause**: Primary root cause from `Variance.loss_category`.
  - **Flag**: `Within` ($\le 0.20\%$) or `Breach` ($> 0.20\%$).
- **One-Click Feature**: Green button exports the legal **EPRA Form P-04 Return** directly for government submission.

---

## Report 4: Tariff Revenue & OMC Billing Report (`/reports/tariff-revenue`)

- **API Endpoint**: `kpc.petroleum_operations.api.get_tariff_revenue_report`
- **Frontend Hook**:
  ```typescript
  const { data } = useFrappeGetCall(
    'kpc.petroleum_operations.api.get_tariff_revenue_report',
    { period: 'MTD' }
  );
  ```
- **Table Columns & Everyday Calculation**:
  - **Customer**: Oil Marketing Company name (e.g. `Vivo Energy`, `TotalEnergies`, `Rubis`).
  - **Volume ($m^3$)**: Total fuel delivered to this customer.
  - **Tariff Rate**: Approved regulatory charge per $m^3$ (e.g. `48 KES/m³`).
  - **Invoiced ($KES\text{ Millions}$)**: `Volume × Tariff Rate ÷ 1,000,000`.
  - **Paid ($KES\text{ Millions}$)**: Amount collected from customer.
  - **Outstanding ($KES\text{ Millions}$)**: `Invoiced - Paid`.
  - **Aging**: Overdue category (`Current`, `31–60`, `61–90`, `90+ days`).
  - **Status**: `Current`, `Due`, `Overdue`, or `On hold` (suspended dispatch).

---

## Report 5: HSE & Compliance Safety Report (`/reports/hse-compliance`)

- **What it tracks**:
  - Active and expired **Permits to Work (PTWs)**.
  - Contractor safety induction records.
  - Pipeline right-of-way foot and aerial patrol coverage percentage.
  - Safety incident close-out speed.

---

# Complete Master Quick-Reference Table

| Page & Section | Primary DocType(s) | How to Call API | Everyday Calculation |
| :--- | :--- | :--- | :--- |
| **Executive 3D Map** | `Terminal`, `Oil Tank`, `Movement` | `api.get_pipeline_scada_network` | Combines GPS coordinates, tank fill levels, and line pressure |
| **Today's Throughput** | `Terminal Receipt` | `useFrappeGetDocList('Terminal Receipt')` | Add up `net_standard_volume_kl` of all deliveries today |
| **Line Fill Capacity** | `Oil Tank` | `useFrappeGetDocList('Oil Tank')` | Sum of safe fill capacities of all active in-service storage tanks |
| **Revenue MTD** | `Invoice` | `useFrappeGetDocList('Invoice')` | Sum of `grand_total` of all approved invoices this month |
| **Batch Speed & ETA** | `Movement`, `Pipeline Batch` | `useFrappeGetDocList('Movement')` | $\text{Speed} = \frac{\text{Flow}}{\text{Area}}$, $\text{ETA} = \frac{\text{Distance}}{\text{Speed}}$ |
| **Plan Attainment** | `Movement`, `Pipeline Batch` | `api.get_daily_throughput_report` | `(Actual Volume ÷ Planned Volume) × 100` |
| **Available Ullage** | `Oil Tank`, `Tank Measurement` | `api.get_stock_reconciliation_report` | `Safe Capacity (95%) - Current Physical Stock` |
| **Fleet Uptime %** | `Plant Asset` | `useFrappeGetDocCount('Plant Asset')` | `(Operational Assets ÷ Total Assets) × 100` |
| **MTBF (Hours)** | `Maintenance Work Order` | `useFrappeGetDocCount('Maintenance Work Order')` | `Total Operating Hours ÷ Number of Breakdowns` |
| **System Loss %** | `Reconciliation`, `Variance` | `api.get_product_loss_report` | `(Loss Volume ÷ Throughput) × 100` (Ceiling: 0.20%) |
| **Safety Days (LTI)** | `AI Alert` | `useFrappeGetDocList('AI Alert')` | Calendar days elapsed since last lost-time injury incident |
| **OMC Outstanding** | `Invoice` | `api.get_tariff_revenue_report` | `Invoiced Total - Collected Payments` |

---

*© 2026 Kenya Pipeline Company Limited. Operations Intelligence & SCADA Digital Twin Platform.*
