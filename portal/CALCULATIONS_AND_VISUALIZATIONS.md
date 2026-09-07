# KPC Portal — Data Visualization & Calculation Logic Guide

> **A Plain-English, Step-by-Step Reference for Pipeline Operators, Engineers, and Executives.**  
> *Every formula explained with real-world examples, pipeline units, visual representations, and operational alarm thresholds.*

---

## Quick Navigation

1. [Understanding Pipeline Hydraulics: Flow Velocity & Batch ETA](#1-understanding-pipeline-hydraulics-flow-velocity--batch-eta) *(The Core Example)*
2. [Executive Command Dashboard (`/` or `/portal`)](#2-executive-command-dashboard--or-portal)
3. [Pipeline Flow Module (`/pipeline-flow`)](#3-pipeline-flow-module-pipeline-flow)
4. [Stock & Tank Farm Module (`/stock-tank-farm`)](#4-stock--tank-farm-module-stock-tank-farm)
5. [Commercial & Revenue Module (`/commercial-revenue`)](#5-commercial--revenue-module-commercial-revenue)
6. [Assets & Enterprise Asset Management (`/assets-eam`)](#6-assets--enterprise-asset-management-assets-eam)
7. [Loss & Accountability Module (`/loss-accountability`)](#7-loss--accountability-module-loss-accountability)
8. [HSE & Integrity Module (`/hse-integrity`)](#8-hse--integrity-module-hse-integrity)
9. [Regulatory Reports Calculations](#9-regulatory-reports-calculations)
10. [Comprehensive Metric & Visualization Summary Matrix](#10-comprehensive-metric--visualization-summary-matrix)

---

## 1. Understanding Pipeline Hydraulics: Flow Velocity & Batch ETA

This section demystifies the hydraulic flow calculation mentioned in operational telemetry.

```
PUMP STATION                                                    DESTINATION DEPOT
 [ Mombasa ] ═════════════════► [ BATCH: PMS ] ═════════════════► [ Nairobi ]
  Flow Rate: Q                     Diameter: D                   Remaining: L
  (m³/h)                           (meters/inches)               (km)
```

### The Plain-English Concept
Imagine a garden hose or a large steel pipeline. If pumps push fuel in at a certain volumetric speed (e.g. $950\text{ m}^3\text{ per hour}$), how fast is that fuel actually sliding forward along the pipe wall in kilometers per hour?

1. **Volume pushed per hour ($Q$)** divided by the **cross-sectional area of the pipe ($A$)** gives the **linear speed of the fuel ($v$)**.
2. Once you know how fast the fuel is traveling ($km/h$), you divide the **remaining kilometers of pipe** by that speed to find **how many hours until the batch arrives (ETA)**.

---

### Step-by-Step Mathematical Breakdown

#### Step 1: Calculate the Pipe Cross-Sectional Area ($A$)
The internal cross-section of a cylindrical pipeline is a circle:
$$\text{Area } (A) = \pi \times r^2 = \pi \times \left(\frac{D}{2}\right)^2$$

- **$D$**: Internal Pipe Diameter (measured in meters).
- **$r = \frac{D}{2}$**: Internal Pipe Radius (meters).
- **$\pi$**: Approximately $3.14159$.

> **Unit Conversion Tip**:  
> In Kenya's pipeline network, pipe diameters are commonly referred to in inches (e.g. 20-inch Line 5).  
> To convert inches to meters:  
> $$D\text{ (meters)} = D\text{ (inches)} \times 0.0254$$  
> For a **20-inch** pipeline:  
> $$D = 20 \times 0.0254 = 0.508\text{ meters}$$  
> $$r = 0.508 \div 2 = 0.254\text{ meters}$$  
> $$A = \pi \times (0.254)^2 \approx 3.14159 \times 0.064516 \approx 0.20268\text{ m}^2$$

---

#### Step 2: Calculate Flow Velocity ($v$)
Flow velocity is the distance liquid travels per unit time:
$$v = \frac{Q}{A}$$

- **$Q$**: Flow Rate in cubic meters per hour ($\text{m}^3/\text{h}$).
- **$A$**: Cross-sectional Area in square meters ($\text{m}^2$).
- **$v$**: Velocity in meters per hour ($\text{m}/\text{h}$).

To convert velocity from **meters per hour ($\text{m}/\text{h}$)** into **kilometers per hour ($\text{km}/\text{h}$)**, divide by $1,000$:
$$v\text{ (km/h)} = \frac{v\text{ (m/h)}}{1,000}$$

---

#### Step 3: Calculate Batch Arrival Time (ETA)
$$\text{Batch Travel Time (Hours)} = \frac{\text{Remaining Distance (km)}}{v\text{ (km/h)}}$$
$$\text{Estimated Arrival DateTime} = \text{Current Time} + \text{Batch Travel Time}$$

---

### Real-World Worked Example (Line 5 Mombasa → Nairobi)

| Parameter | Operational Value |
| :--- | :--- |
| **Pipeline Segment** | Line 5 (Mombasa KOT to Nairobi Terminal) |
| **Pipe Diameter ($D$)** | $20\text{ inches} = 0.508\text{ m}$ |
| **Current Flow Rate ($Q$)** | $950.0\text{ m}^3/\text{h}$ (from SCADA ultrasonic flow meter) |
| **Current Batch** | Premium Motor Spirit (PMS), 12,000 KL |
| **Batch Front Position** | Passing Sultan Hamud Booster Station |
| **Remaining Distance to Nairobi** | $140.0\text{ km}$ |

**Execution**:
1. **Area ($A$)**:  
   $$A = \pi \times (0.254)^2 = 0.20268\text{ m}^2$$
2. **Velocity ($v$) in m/h**:  
   $$v = \frac{950\text{ m}^3/\text{h}}{0.20268\text{ m}^2} \approx 4,687.2\text{ meters per hour}$$
3. **Velocity ($v$) in km/h**:  
   $$v = \frac{4,687.2}{1,000} \approx 4.69\text{ km/h}$$
4. **Hours Remaining (ETA)**:  
   $$\text{Hours} = \frac{140\text{ km}}{4.69\text{ km/h}} \approx 29.85\text{ hours (approx. 29 hours 51 minutes)}$$

---

### How This Is Visualized in the Portal

```
┌────────────────────────────────────────────────────────────────────────┐
│  ACTIVE BATCH: BATCH-2026-089 (PMS)                                    │
│  [Mombasa] ========[■■■■■■■■■■■■■■■■■■■■■■■□□□□□□□□]=====> [Nairobi]   │
│  Progress: 68.9%   ·   Speed: 4.7 km/h   ·   ETA: Tomorrow, 16:15      │
└────────────────────────────────────────────────────────────────────────┘
```

1. **3D Flow Particle Speed**:  
   In the 3D pipeline view (`ProductFlow3D`), animated light beads glide along the glass-sheathed tube. The animation playback rate is directly proportional to flow velocity: higher flow rate = faster particle movement.
2. **Interactive Progress Bar**:  
   Displays the completed segment vs remaining distance, color-coded by fuel type (Gold for PMS, Emerald for AGO, Purple for Jet A-1).
3. **ETA Countdown Column**:  
   In the Active Batches Data Grid, the calculated arrival time is dynamically updated as flow rates fluctuate in real time.

---

## 2. Executive Command Dashboard (`/` or `/portal`)

The Executive Command view provides high-level situational awareness for managing directors, operations chiefs, and terminal controllers.

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Throughput Today│ │Network Line Fill│ │   Revenue MTD   │ │   System Loss   │
│    9,530 m³     │ │    145.2k m³    │ │   842.50 M KES  │ │      0.17%      │
│  ▲ 6 active     │ │  24 tanks active│ │  ▲ 18 invoices  │ │  ▼ Below 0.20%  │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 1. Throughput Today ($m^3$)
- **What it means**: Total volume of clean refined petroleum received at all terminal intake manifolds since 00:00 hours today.
- **Formula**:
  $$\text{Throughput Today} = \sum (\text{Receipt Net Volume}_{15^\circ\text{C}})$$
- **Visualization**: Blue 3D Card with pulsating indicator + rolling 30-day area chart showing pumping consistency.

### 2. Network Line Fill ($m^3$)
- **What it means**: The volume of petroleum currently locked inside the steel pipelines between pump stations, plus active storage buffer capacity.
- **Formula**:
  $$\text{Line Fill} = \sum_{\text{active pipes}} (A_{\text{pipe}} \times L_{\text{pipe}}) + \sum (\text{Active Storage Reserve})$$
- **Visualization**: Cyan 3D Card + live 3D corridor terrain indicating product inventory in transit.

### 3. Revenue MTD ($KES$)
- **What it means**: Total dollar/shilling value of pipeline transport tariffs and depot storage charges invoiced to Oil Marketing Companies (OMCs) this month.
- **Formula**:
  $$\text{Revenue MTD} = \sum_{\text{Invoices}} \text{Invoice Grand Total (Submitted)}$$
- **Visualization**: Emerald 3D Card with positive/negative trend delta vs previous month.

### 4. System Loss (%)
- **What it means**: Overall percentage of fuel lost across the network due to evaporation, measurement error, or physical loss.
- **Formula**:
  $$\text{System Loss } \% = \frac{\sum |\text{Variance } (KL)|}{\sum \text{Throughput } (KL)} \times 100$$
- **Operational Alarm Thresholds**:
  - **$\le 0.20\%$ (Normal / Green)**: Within EPRA statutory allowance.
  - **$0.20\% - 0.25\%$ (Warning / Amber)**: Segment investigation watch.
  - **$> 0.25\%$ (Critical / Red)**: Automatic audit freeze and mandatory incident log.

---

## 3. Pipeline Flow Module (`/pipeline-flow`)

This module tracks product slug movements, flow balances, and pumping attainment.

### 1. Plan Attainment (%)
- **What it means**: How closely today's actual pumping matches the supply planning nomination agreed with the OMCs.
- **Formula**:
  $$\text{Plan Attainment } \% = \left(\frac{\text{Completed Volume Today } (m^3)}{\text{Planned Nomination Volume Today } (m^3)}\right) \times 100$$
- **Interpretation**:
  - **$\ge 100\%$**: Ahead of schedule (Green badge).
  - **$95\% - 99.9\%$**: On plan (Blue badge).
  - **$< 95\%$**: Schedule lag (Amber badge indicating pumping delays or power outages).

### 2. Interface Cut & Transmix ($KL$)
- **What it means**: Petroleum pipelines pump different products consecutively in direct contact (e.g. Diesel right behind Petrol). The boundary layer where they mix is called **Transmix** or **Interface Cut**.
- **Calculation Logic**:
  - When the interface arrives at the terminal manifold, high-precision optical densitometers detect the change in specific gravity.
  - The contaminated boundary volume ($KL$) is automatically diverted to a slop/transmix tank for reprocessing:
    $$\text{Deliverable Product} = \text{Gross Batch Volume} - \text{Interface Cut Volume}$$
- **Visualization**:
  - Displayed in the **Active Batches Table** under `Interface cut (KL)` with dedicated badges.

---

## 4. Stock & Tank Farm Module (`/stock-tank-farm`)

This module visualizes all vertical cylindrical storage tanks across Mombasa, Nairobi, Nakuru, Eldoret, and Kisumu.

```
       TANK ANATOMY & CALCULATION LAYOUT
┌────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ── Top of Tank Shell
│               AVAILABLE ULLAGE                 │    (5% expansion margin)
├────────────────────────────────────────────────┤ ── Safe Fill Capacity (95%)
│ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █  │
│ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █  │
│          NET STANDARD VOLUME (NSV)             │
│            Temperature Corrected               │
│ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █  │
├────────────────────────────────────────────────┤ ── Dip Datum Plate
│ ~~~~~~~~~~~~~~~~~ Water Bottom ~~~~~~~~~~~~~~~ │ ── Water / Sediment Layer
└────────────────────────────────────────────────┘
```

### 1. Why Temperature Correction is Critical (ASTM Table 54B)
Petroleum products expand when heated by tropical sunshine and contract in cooler weather. A tank containing $10,000\text{ KL}$ at $28^\circ\text{C}$ contains fewer molecules of fuel than the same tank at $15^\circ\text{C}$.  
To ensure fair billing, all volumes are normalized to standard **$15^\circ\text{C}$**:

$$\text{Net Standard Volume } (NSV) = \text{Gross Observed Volume } (GOV) \times VCF_{15}$$

- **$GOV$**: Physical volume read by radar or manual dip gauge ($KL$).
- **$VCF_{15}$**: Volume Correction Factor computed using ASTM D1250 / Table 54B based on density and observed temperature.
- **$NSV$**: Legal billable volume at $15^\circ\text{C}$.

---

### 2. Safe Fill Capacity ($KL$)
Tanks are never filled to $100\%$ brim capacity to avoid thermal over-pressurization and hazardous spills:
$$\text{Safe Fill Capacity } (KL) = \text{Gross Shell Volume} \times 0.95$$

---

### 3. Available Ullage ($KL$)
- **What it means**: The remaining empty capacity inside the tank before reaching the safe fill limit (i.e. "room to receive product").
- **Formula**:
  $$\text{Available Ullage } (KL) = \text{Safe Fill Capacity } (KL) - \text{Current Net Volume } (KL)$$
- **Portal Visualization**:
  - The 3D Tank Farm shows an interactive 3D cylinder. The blue/amber liquid rises to the exact physical fill percentage, leaving transparent glass for the ullage headspace.
  - Hovering over any tank reveals instant Net Volume vs Available Ullage in kilolitres.

---

### 4. Water Bottom ($mm$)
- Water is heavier than fuel and settles at the bottom of storage tanks.
- Tank radar probes or water-finding paste measure water bottom in millimeters ($mm$).
- If water exceeds **$50\text{ mm}$**, the portal raises a drain alert before dispatch to road loading gantries.

---

## 5. Commercial & Revenue Module (`/commercial-revenue`)

KPC acts as a common carrier transporting fuel for Oil Marketing Companies (OMCs).

### 1. Pipeline Tariff Revenue Billing
$$\text{Invoice Grand Total } (KES) = \text{Volume Delivered } (m^3) \times \text{Approved Tariff Rate } (KES/m^3)$$

Example:
- Vivo Energy delivers $4,120\text{ m}^3$ of AGO to Nairobi.
- Tariff rate: $48.0\text{ KES per } m^3$.
- Total Billed: $4,120 \times 48.0 = 197,760\text{ KES}$ (approx. $198\text{k KES}$).

---

### 2. Credit Utilization Ratio (%)
$$\text{Credit Utilization } \% = \left(\frac{\text{Current Outstanding Unpaid Invoices}}{\text{Bank Guarantee / Credit Limit}}\right) \times 100$$

- **$< 75\%$ (Healthy / Green)**: Normal dispatch authorized.
- **$75\% - 90\%$ (Caution / Amber)**: Finance notification sent.
- **$> 90\%$ (Critical / Red)**: Automatic system warning flagging potential loading suspension.

---

### 3. Accounts Receivable (AR) Aging Brackets
Invoices are bucketed into four standard financial periods:
1. **Current (0–30 Days)**: Normal payment window.
2. **31–60 Days**: Due for payment.
3. **61–90 Days**: Overdue; automated collection reminder issued.
4. **90+ Days (Critical Overdue)**: Triggers cash-at-risk warning on the portal summary card.

---

## 6. Assets & Enterprise Asset Management (`/assets-eam`)

Mainline centrifugal pumps, electric motors, and remote actuated valves require constant reliability tracking.

```
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│     Fleet Uptime     │   │         MTBF         │   │  Asset Health Index  │
│        98.6%         │   │       1,420 h        │   │       88 / 100       │
│    ▲ Above Target    │   │      Improving       │   │    Nominal Health    │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘
```

### 1. Fleet Uptime Percentage (%)
- **What it means**: The proportion of time rotating pump fleets are ready to pump without breakdown.
- **Formula**:
  $$\text{Fleet Uptime } \% = \left(\frac{\text{Total Fleet Operating Hours} - \text{Unscheduled Downtime Hours}}{\text{Total Fleet Operating Hours}}\right) \times 100$$
- **Simplified Operational Proxy**:
  $$\text{Uptime } \% = \left(\frac{\text{Operational Assets Count}}{\text{Total Monitored Assets Count}}\right) \times 100$$
- **Target**: KPC target is **$\ge 98.5\%$**.

---

### 2. Mean Time Between Failures (MTBF)
- **What it means**: The average operating hours a pump runs before experiencing an unplanned stoppage.
- **Formula**:
  $$\text{MTBF (Hours)} = \frac{\text{Total Fleet Operating Hours}}{\text{Total Completed Breakdowns (Emergency + Corrective)}}$$
- **Worked Example**:
  - $24$ pumps operating $24$ hours/day for $30$ days = $17,280\text{ pump hours}$.
  - During this period, $12$ emergency repair work orders occurred.
  - $\text{MTBF} = 17,280 \div 12 = 1,440\text{ operating hours}$.
- **Portal Display**: Shown as a clean metric card with `h` unit and trend direction.

---

### 3. Asset Health Index (AHI — 0 to 100 Score)
The health index combines live vibration sensors, differential pressure, asset age, and maintenance compliance:

$$\text{AHI} = 100 - \left(w_1 \cdot \text{Vibration Penalty} + w_2 \cdot \Delta P \text{ Penalty} + w_3 \cdot \text{Overdue PM Penalty}\right)$$

- **$90 - 100$ (Optimal / Green)**: Pump running with smooth bearings ($< 2.5\text{ mm/s}$ vibration).
- **$70 - 89$ (Acceptable / Blue)**: Normal operating wear.
- **$50 - 69$ (Watch / Amber)**: Minor seal leakage or high bearing temperature.
- **$< 50$ (Critical / Red)**: Immediate maintenance required before catastrophic pump trip.

---

## 7. Loss & Accountability Module (`/loss-accountability`)

Tracking mass balances and isolating pipeline theft or calibration drift.

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

### 1. The Mass Balance Equation
At every depot and pipeline segment, fuel cannot disappear without an explanation:

$$\text{Variance } (KL) = (\text{Closing Stock} + \text{Dispatches}) - (\text{Opening Stock} + \text{Receipts})$$

- If **Variance is negative ($-$)**: More fuel left the books than was physically measured (a product loss).
- If **Variance is positive ($+$)**: Gain (often caused by thermal expansion or meter drift).

---

### 2. Loss Percentage vs Regulatory Allowance
$$\text{Variance } \% = \left(\frac{|\text{Variance } (KL)|}{\text{Total Segment Throughput } (KL)}\right) \times 100$$

### 3. The Energy and Petroleum Regulatory Authority (EPRA) Thresholds
- **$0.00\% - 0.20\%$**: **Within Statutory Allowance**. Normal evaporation and metering tolerance.
- **$0.20\% - 0.25\%$**: **Watchlist**. Station managers must recalibrate Coriolis mass meters.
- **$> 0.25\%$**: **Statutory Breach**. Generates an automatic regulatory audit return (**Form P-04**) and alerts pipeline security patrols.

---

## 8. HSE & Integrity Module (`/hse-integrity`)

Safety metrics protect personnel and environment across the 450km right-of-way.

### 1. Days Since Lost Time Injury (LTI)
- An active counter of consecutive calendar days without an injury causing lost work shifts.
- Counter resets to zero upon logging a High-Severity medical treatment event.

### 2. Lost Time Injury Frequency Rate (LTIFR)
Global standard safety formula:
$$\text{LTIFR} = \frac{\text{Number of LTIs in Period} \times 1,000,000}{\text{Total Man-Hours Worked in Period}}$$
- A lower score indicates a safer workplace. KPC operates with an LTIFR $< 0.50$.

### 3. Pipeline Cathodic Protection (CP) Potential
- Steel pipelines buried underground naturally corrode due to soil moisture and electrical currents.
- KPC applies negative direct current (DC) voltage to the pipe to halt rust.
- **Normal Protection Range**: **$-0.85\text{ V}$ to $-1.20\text{ V}$** (Pipe-to-Soil Copper/Copper Sulfate Half-Cell).
- The portal shows a **$98\%$ System Health** score representing test posts within the nominal voltage range.

---

## 9. Regulatory Reports Calculations

Each report in `/reports/*` provides dynamic calculations and printable regulator-ready data sheets.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REPORT INTERFACE CONTROLS                       │
│  [ Columns Modal ]   [ Export CSV / Excel ]   [ Print PDF ]   [ Ask AI ] │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Daily Throughput Report (`/reports/daily-throughput`)
- **Variance ($m^3$)**: $\text{Actual Volume} - \text{Planned Volume}$
- **Attainment (%)**: $(\text{Actual Volume} \div \text{Planned Volume}) \times 100$
- **Cumulative MTD**: Month-to-date running sum of actual throughput across all lines.

### 2. Stock Position & Reconciliation Report (`/reports/stock-reconciliation`)
- **Book Stock ($KL$)**: Ledger volume derived from ERP stock transactions.
- **Physical Stock ($KL$)**: Dip reading multiplied by ASTM Table 54B VCF factor.
- **Stock Variance ($KL$)**: $\text{Physical Stock} - \text{Book Stock}$
- **Variance Percentage (%)**: $(\text{Stock Variance} \div \text{Book Stock}) \times 100$

### 3. Product Loss / Unaccounted-For Report (`/reports/product-loss`)
- **Segment Loss (%)**: $(\text{Loss Volume} \div \text{Segment Throughput}) \times 100$
- **Tolerance Bar %**: $\min\left(100\%, \frac{\text{Loss } \%}{0.20\%} \times 100\right)$
  - At $0.10\%$ loss, the visual progress bar fills to $50\%$.
  - At $0.20\%$ loss, the bar fills to $100\%$ (orange threshold).
  - Above $0.20\%$, the bar stays pinned at $100\%$ with a red "Breach" tag.

### 4. Tariff Revenue & OMC Billing Report (`/reports/tariff-revenue`)
- **Invoiced Amount ($KES\text{ Millions}$)**: $\text{Volume } (m^3) \times \text{Tariff} \div 10^6$
- **Outstanding Balance ($KES$)**: $\text{Invoiced Amount} - \text{Paid Amount}$
- **Collection Percentage (%)**: $(\text{Total Paid} \div \text{Total Invoiced}) \times 100$

---

## 10. Comprehensive Metric & Visualization Summary Matrix

| Metric Name | Formula / Logic | Portal Component / Visual | Safe Threshold | Alarm / Breach Threshold |
| :--- | :--- | :--- | :--- | :--- |
| **Flow Velocity ($v$)** | $v = \frac{Q}{A \times 1,000}$ | Speed of 3D glowing particles in pipe tube | $3.5 - 5.5\text{ km/h}$ | $< 1.0\text{ km/h}$ (Stagnant flow) |
| **Batch ETA** | $\text{Distance} \div v$ | Active Batches Table ETA column | On time schedule | $> 6\text{ h}$ delay |
| **Plan Attainment** | $\frac{\text{Actual}}{\text{Plan}} \times 100$ | Progress gauge & status badge | $\ge 95\%$ | $< 90\%$ (Severe deficit) |
| **Available Ullage** | $\text{Safe Cap} - \text{Net Vol}$ | Empty space in 3D cylindrical tanks | $> 1,000\text{ KL}$ | $< 200\text{ KL}$ (Tank full danger) |
| **Volume Correction** | $GOV \times VCF_{15}$ | Stock Reconciliation standard volume column | Temperature adjusted | Gross dip without VCF |
| **System Loss %** | $\frac{\text{Loss}}{\text{Throughput}} \times 100$ | EPRA Loss Meter & Segment Bar | $\le 0.20\%$ | $> 0.25\%$ (Mandatory audit) |
| **Fleet Uptime %** | $\frac{\text{Op Hours}}{\text{Total Hours}} \times 100$ | Assets EAM KPI Card & rolling line chart | $\ge 98.5\%$ | $< 95.0\%$ |
| **MTBF** | $\frac{\text{Run Hours}}{\text{Failures}}$ | EAM Gauge Card | $> 1,200\text{ h}$ | $< 500\text{ h}$ (Repeated trips) |
| **Credit Utilization** | $\frac{\text{Debt}}{\text{Credit Limit}} \times 100$ | Commercial Revenue progress bar | $< 75\%$ | $> 90\%$ (Dispatch freeze) |
| **Cathodic Protection**| Pipe-to-soil DC Volts | HSE Integrity Health % score | $-0.85\text{V}$ to $-1.20\text{V}$ | $>-0.80\text{V}$ (Active corrosion risk) |

---

*© 2026 Kenya Pipeline Company Limited. Built for transparent, safe, and efficient national petroleum logistics.*
