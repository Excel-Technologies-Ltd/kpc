# Kenya Pipeline Company (KPC) — Petroleum Operations Portal

> **Next-Generation Enterprise Digital Twin & Operational Intelligence Platform**  
> Built with **React 19**, **Three.js / React Three Fiber**, **Tailwind CSS v4**, and **Frappe Framework**.

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Technical Architecture & Technology Stack](#2-technical-architecture--technology-stack)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [Management Modules — Detailed Specifications](#4-management-modules--detailed-specifications)
   - [4.1 Executive Command (`/` or `/portal`)](#41-executive-command)
   - [4.2 Pipeline Flow (`/pipeline-flow`)](#42-pipeline-flow)
   - [4.3 Stock & Tank Farm (`/stock-tank-farm`)](#43-stock--tank-farm)
   - [4.4 Commercial & Revenue (`/commercial-revenue`)](#44-commercial--revenue)
   - [4.5 Assets & EAM (`/assets-eam`)](#45-assets--eam)
   - [4.6 Loss & Accountability (`/loss-accountability`)](#46-loss--accountability)
   - [4.7 HSE & Integrity (`/hse-integrity`)](#47-hse--integrity)
5. [Reports Modules — Regulatory & Operations](#5-reports-modules--regulatory--operations)
   - [5.1 Daily Throughput Report (`/reports/daily-throughput`)](#51-daily-throughput-report)
   - [5.2 Stock Position & Reconciliation Report (`/reports/stock-reconciliation`)](#52-stock-position--reconciliation-report)
   - [5.3 Product Loss / Unaccounted-For Report (`/reports/product-loss`)](#53-product-loss--unaccounted-for-report)
   - [5.4 Tariff Revenue & OMC Billing Report (`/reports/tariff-revenue`)](#54-tariff-revenue--omc-billing-report)
   - [5.5 HSE & Compliance Report (`/reports/hse-compliance`)](#55-hse--compliance-report)
6. [3D SCADA Digital Twin & Spatial Topology](#6-3d-scada-digital-twin--spatial-topology)
7. [Core Calculation Formulas & Business Logic](#7-core-calculation-formulas--business-logic)
   - 💡 **[Dedicated Data Visualization & Calculation Logic Guide (Plain English)](./CALCULATIONS_AND_VISUALIZATIONS.md)**
8. [Backend API Reference](#8-backend-api-reference)
9. [Development, Build & Deployment Guide](#9-development-build--deployment-guide)

---

## 1. Executive Overview

The **KPC Petroleum Operations Portal** is an enterprise-grade digital twin and operational intelligence system designed for the Kenya Pipeline Company. It delivers unified operational oversight across the entire national pipeline corridor — spanning 450+ kilometers from the **Mombasa Kipevu Oil Terminal (KOT)** through pump stations (Mtito Andei, Sultan Hamud), the central **Nairobi Terminal (Embakasi)**, to the Western Kenya depots (**Nakuru**, **Eldoret**, and **Kisumu**).

### Primary Capabilities
- **Real-Time 3D SCADA Digital Twin**: Interactive 3D WebGL corridor rendering live pumping line flow rates ($m^3/h$), active line pressure ($bar$), and tank liquid levels.
- **Stock Accounting & Physical Reconciliation**: Automated integration with tank radar gauges, manual dips, and ASTM Table 54B temperature-corrected standard volumes ($15^\circ\text{C}$).
- **Regulatory Loss Accountability**: Real-time tracking against the **EPRA statutory limit of 0.20%**, automated transmix interface cut reconciliation, and one-click **Form P-04** regulatory return generation.
- **Commercial OMC Billing & Aging**: Automated tariff calculation across Oil Marketing Companies (OMCs) like Vivo, TotalEnergies, Rubis, Ola, and Hass with 30/60/90+ day receivables aging.
- **Predictive Asset Integrity**: Real-time fleet health scoring, MTBF/MTTR tracking, vibration anomaly detection, and Permit-to-Work safety compliance.

---

## 2. Technical Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER CLIENT (PORTAL)                       │
│  React 19 (Strict Mode) · Vite 8 · Tailwind CSS v4 · TypeScript 6       │
│  Three.js / React Three Fiber / Drei · Framer Motion · Recharts         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST / Websockets
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRAPPE REACT SDK PROXY                         │
│  useFrappeGetCall · useFrappeGetDocList · useFrappeGetDocCount          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Python Whitelisted Endpoints
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRAPPE PETROLEUM OPERATIONS APP                      │
│  kpc.petroleum_operations.api.* (scada_network, reports, asset_metrics) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ ORM / MariaDB
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DOCTYPES & HISTORIAN                           │
│  Movement · OT Telemetry Log · Tank Measurement · Oil Tank · Invoice   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Frontend Stack
| Layer | Technologies | Description |
| :--- | :--- | :--- |
| **Framework & Engine** | `React 19.2`, `Vite 8.2`, `TypeScript 6.0` | Zero-compromise reactive web client running on native ES modules. |
| **Styling & Design System** | `Tailwind CSS v4.3`, `tw-animate-css` | Curated HSL color palette, dark/light theme switching, and glassmorphic elevations. |
| **3D Graphics & Physics** | `Three.js 0.185`, `@react-three/fiber 9.7`, `@react-three/drei 10.7` | WebGL 3D terrain rendering, animated pipeline flow tubes, dynamic liquid level cylinders. |
| **Motion & Micro-interactions** | `framer-motion 13.2` | Spring-based 3D card tilts, stagger animations, fluid tab transitions. |
| **Data Visualization** | `recharts 3.8`, `chart.js 4.5` | Dynamic throughput trends, revenue vs target curves, product mix area charts. |
| **Tables & Controls** | `@tanstack/react-table 8.21`, `@shadcn/react`, `lucide-react` | Enterprise sortable/filterable data grids, column visibility modals, dynamic CSV exporters. |
| **Backend Communication** | `frappe-react-sdk 1.17` | Direct communication with Frappe Auth, REST endpoints, and custom whitelisted RPCs. |

### Backend Stack
- **Platform**: Frappe Framework (Python 3.10+ / MariaDB InnoDB).
- **Core App**: `kpc` (Petroleum Operations Module).
- **Architecture**: Domain-driven submittable and non-submittable DocTypes with automated lifecycle hooks and ledger immutability.

---

## 3. System Architecture & Data Flow

1. **SCADA Historian & Sensor Ingestion**: Real-time telemetry (flow meters, pressure transducers, vibration probes) is posted via IoT gateways or SCADA API into `OT Telemetry Log` and linked to active `Movement` records.
2. **Measurement & Dip Ingestion**: Tank level radar and manual daily dip gauges populate `Tank Measurement` with observed gauge height ($mm$), temperature ($^\circ\text{C}$), and gross observed volume ($KL$).
3. **ASTM 54B Temperature Normalization**: Volume is normalized to standard volume at $15^\circ\text{C}$ using the product's base density.
4. **Backend Aggregation API**: Whitelisted Python methods in `kpc/petroleum_operations/api/` aggregate data across multiple DocTypes with database-agnostic ORM queries and sub-100ms response times.
5. **Portal Client Consumption**: Typed custom hooks in `portal/src/pages/` consume these endpoints using `useFrappeGetCall` and merge with calibrated local 3D spatial registries.

---

## 4. Management Modules — Detailed Specifications

### 4.1 Executive Command
- **Route**: `/` or `/portal`
- **Component**: `portal/src/pages/home/index.tsx`
- **Sub-components**: `NetworkMap3D`, `Kpi3DCard`, `LiveAlerts`, `ThroughputTrendChart`, `ProductMixChart`, `RevenueVsTargetChart`.
- **Visualizations**:
  - Full-width interactive **3D Kenya Pipeline SCADA Network Canvas**.
  - 4 Fluid 3D Executive KPI Cards: Active Journeys, Pipeline Line Fill, Fleet Storage Utilization, Open Safety/Integrity Alerts.
  - Interactive charts: 30-Day Throughput Trend, Product Volume Distribution (AGO, PMS, Jet A-1, DPK), and Monthly Revenue vs Nomination Target.
  - Live AI Alert stream with severity badges (`Critical`, `Watch`, `Normal`).
- **Calculation Logic**:
  - **Storage Utilization (%)**: $\frac{\sum \text{Current Stock }(KL)}{\sum \text{Safe Fill Capacity }(KL)} \times 100$
  - **Pipeline Line Fill ($m^3$)**: Total volume of product currently in transit across active `Movement` segments.

### 4.2 Pipeline Flow
- **Route**: `/pipeline-flow`
- **Component**: `portal/src/pages/pipeline-flow/index.tsx`
- **Visualizations**:
  - Hydraulic gradient line profile showing pressure drops ($bar$) between booster stations.
  - Real-time batch progression bar indicating product interfaces (e.g., AGO following PMS) moving along Line 5.
  - Telemetry gauges for flow rate ($m^3/h$), suction/discharge pressure, and pump vibration ($mm/s$).
- **Data Sources**: `Movement`, `Pipeline Batch`, `OT Telemetry Log`.
- **Calculation Logic**:
  - **Batch ETA**: $\text{Remaining Distance }(km) \div \text{Flow Velocity }(km/h)$
  - **Flow Velocity ($v$)**: $\frac{Q}{A} = \frac{\text{Flow Rate }(m^3/h)}{\pi \times (D / 2)^2}$ where $D$ is internal pipeline diameter.

### 4.3 Stock & Tank Farm
- **Route**: `/stock-tank-farm`
- **Component**: `portal/src/pages/stock-tank-farm/index.tsx`
- **Visualizations**:
  - 3D Tank Farm scene with interactive cylindrical tanks and dynamic liquid level shaders.
  - Depot overview selector (`Mombasa`, `Nairobi`, `Nakuru`, `Eldoret`, `Kisumu`).
  - Available Ullage vs Physical Stock bar charts.
- **Data Sources**: `Oil Tank`, `Tank Measurement`, `Inventory Position`.
- **Calculation Logic**:
  - **Net Standard Volume ($NSV$)**: $NSV = GOV \times VCF_{15}$ where $GOV$ is Gross Observed Volume and $VCF_{15}$ is Volume Correction Factor from ASTM Table 54B.
  - **Available Ullage**: $\text{Safe Fill Capacity }(KL) - \text{Current Net Volume }(KL)$.

### 4.4 Commercial & Revenue
- **Route**: `/commercial-revenue`
- **Component**: `portal/src/pages/commercial-revenue/index.tsx`
- **Visualizations**:
  - OMC customer receivables breakdown and credit limit utilization dials.
  - MTD tariff billing revenue curves grouped by product grade.
  - Collections cash flow forecast and overdue billing timeline.
- **Data Sources**: `Invoice`, `Invoice Line`, `Tariff`, `Customer`.
- **Calculation Logic**:
  - **Tariff Billing**: $\text{Parcel Volume }(m^3) \times \text{Tariff Rate }(\$/m^3) \times \text{USD/KES FX Rate}$.
  - **Credit Utilization (%)**: $\frac{\text{Outstanding Balance}}{\text{Credit Limit}} \times 100$.

### 4.5 Assets & EAM
- **Route**: `/assets-eam`
- **Component**: `portal/src/pages/assets-eam/index.tsx`
- **Visualizations**:
  - Asset health index matrices across mainline pumps, booster stations, and motorized valves.
  - 6-Month rolling equipment uptime percentage vs target ($98.5\%$).
  - Maintenance downtime cost trends (Emergency vs Preventive vs Corrective).
- **Data Sources**: `Plant Asset`, `Maintenance Work Order`, `Permit to Work`.
- **Calculation Logic**:
  - **Fleet Uptime (%)**:
    $$\text{Uptime } \% = \frac{\text{Total Fleet Operating Hours} - \text{Unscheduled Downtime Hours}}{\text{Total Fleet Operating Hours}} \times 100$$
  - **Monthly Capacity**: $\text{Active Assets} \times 720\text{ hours/month}$.

### 4.6 Loss & Accountability
- **Route**: `/loss-accountability`
- **Component**: `portal/src/pages/loss-accountability/index.tsx`
- **Visualizations**:
  - EPRA tolerance breach meter with safe ($<0.20\%$), warning ($0.20\% - 0.25\%$), and breach ($>0.25\%$) thresholds.
  - Physical vs Book balance variance waterfall.
  - Pipeline interface transmix contamination volume breakdown.
- **Data Sources**: `Reconciliation`, `Variance`, `Terminal Receipt`, `Dispatch`.
- **Calculation Logic**:
  - **Reconciliation Variance**:
    $$\text{Variance } (KL) = (\text{Closing Stock} + \text{Dispatches}) - (\text{Opening Stock} + \text{Receipts})$$
  - **Variance Percentage**: $\frac{|\text{Variance }(KL)|}{\text{Total Throughput }(KL)} \times 100$.

### 4.7 HSE & Integrity
- **Route**: `/hse-integrity`
- **Component**: `portal/src/pages/hse-integrity/index.tsx`
- **Visualizations**:
  - Active Permit-to-Work (PTW) status radar (Hot Work, Confined Space, Working at Height).
  - Days Without Lost Time Incident (LTI) counter.
  - Pipeline cathodic protection potential voltage map.
- **Data Sources**: `Permit to Work`, `Employee Certification`.

---

## 5. Reports Modules — Regulatory & Operations

Every report features:
- **Real-Time Frappe Sync**: Connects directly to whitelisted Frappe APIs with REST doclist fallbacks.
- **Dynamic Column Visibility**: Configurable table columns persisted in local state.
- **Operational Assistant Modals**: Built-in AI diagnosis analyzing root causes and regulatory impacts.
- **Regulator-Ready Exports**: One-click download of CSV / Excel spreadsheets and print-optimized PDF outputs.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REPORT ACTION CONTROLS                          │
│  [ Columns Modal ]   [ Export CSV / Excel ]   [ Print PDF ]   [ Assistant Modal ] │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Daily Throughput Report
- **Route**: `/reports/daily-throughput`
- **API Endpoint**: `kpc.petroleum_operations.api.get_daily_throughput_report`
- **Key Metrics**: Daily Pumping Actual, Scheduled Nomination Target, Attainment %, Monthly Cumulative Volume.
- **Calculations**:
  - $\text{Attainment } \% = \left(\frac{\text{Actual Volume } m^3}{\text{Planned Volume } m^3}\right) \times 100$
  - $\text{Variance } m^3 = \text{Actual Volume } m^3 - \text{Planned Volume } m^3$

### 5.2 Stock Position & Reconciliation Report
- **Route**: `/reports/stock-reconciliation`
- **API Endpoint**: `kpc.petroleum_operations.api.get_stock_reconciliation_report`
- **Key Metrics**: Physical Dip Stock ($KL$), Safe Fill Capacity, Available Ullage, Water Bottom ($mm$), Product Grade.
- **Calculations**:
  - $\text{Safe Fill Capacity } (KL) = \text{Gross Capacity} \times 0.95$
  - $\text{Available Ullage } (KL) = \text{Safe Fill Capacity} - \text{Net Standard Volume}$
  - $\text{Fill Percentage } \% = \left(\frac{\text{Net Volume}}{\text{Safe Fill Capacity}}\right) \times 100$

### 5.3 Product Loss / Unaccounted-For Report
- **Route**: `/reports/product-loss`
- **API Endpoint**: `kpc.petroleum_operations.api.get_product_loss_report`
- **Compliance Integration**: Generates **EPRA Form P-04** Statutory Petroleum Return.
- **Thresholds**:
  - Statutory Allowance: **$0.20\%$** maximum permissible loss.
  - Warning Threshold: **$0.20\% - 0.25\%$**.
  - Breach Level: **$>0.25\%$** (Triggers mandatory investigation and automatic reconciliation freeze).

### 5.4 Tariff Revenue & OMC Billing Report
- **Route**: `/reports/tariff-revenue`
- **API Endpoint**: `kpc.petroleum_operations.api.get_tariff_revenue_report`
- **Customer Segmentation**: Tracks major OMCs (`Vivo Energy`, `TotalEnergies KE`, `Rubis`, `Ola`, `Hass`, `Galana`).
- **Aging Classification**:
  - `Current`: 0–30 days
  - `31–60`: 31–60 days
  - `61–90`: 61–90 days
  - `90+`: Critical overdue (Flags dispatch suspension alert)

### 5.5 HSE & Compliance Report
- **Route**: `/reports/hse-compliance`
- **Key Metrics**: Active PTWs, Expired PTWs, Contractor Safety Inductions, Pipeline ROW Patrol Coverage.

---

## 6. 3D SCADA Digital Twin & Spatial Topology

The 3D Canvas uses a calibrated Three.js coordinate system mapped precisely to Kenya's topography:

```
                  [ELD-01] Eldoret (-2.26, -0.48)
                    \
  [KSM-01] Kisumu --- [NAK-01] Nakuru (-1.44, 0.28)
  (-2.77, 0.08)        \
                        [NBI-01] Nairobi (-0.69, 1.22)
                         \
                          [PS4] Sultan Hamud (-0.14, 1.89)
                           \
                            [PS3] Mtito Andei (0.68, 2.52)
                             \
                              [MSA-01] Mombasa (2.2, 3.79)
```

### Calibrated Spatial Registry
| Node Identifier | Facility Name | 3D Space Vector $[x, y, z]$ | Standard Lat / Long | Role |
| :--- | :--- | :--- | :--- | :--- |
| `MSA-01` | Mombasa Kipevu Terminal | `[2.2, 0, 3.79]` | $-4.0435^\circ\text{ S}, 39.6682^\circ\text{ E}$ | Marine Import & Main Dispatch Tank Farm |
| `PS3` | Mtito Andei Pump Station | `[0.68, 0, 2.52]` | $-2.6908^\circ\text{ S}, 38.1678^\circ\text{ E}$ | Booster Pumping Station |
| `PS4` | Sultan Hamud Pump Station | `[-0.14, 0, 1.89]` | $-2.0167^\circ\text{ S}, 37.3667^\circ\text{ E}$ | Booster Pumping Station & Anomaly Watch |
| `NBI-01` / `NBO-01` | Nairobi Terminal (Embakasi) | `[-0.69, 0, 1.22]` | $-1.2921^\circ\text{ S}, 36.8219^\circ\text{ E}$ | Central Inland Distribution Depot |
| `NAK-01` | Nakuru Regional Depot | `[-1.44, 0, 0.28]` | $-0.3031^\circ\text{ S}, 36.0800^\circ\text{ E}$ | Rift Valley Distribution & Western Split |
| `ELD-01` | Eldoret Regional Depot | `[-2.26, 0, -0.48]` | $+0.5143^\circ\text{ N}, 35.2698^\circ\text{ E}$ | North Rift & Transit Export Hub |
| `KSM-01` | Kisumu Regional Depot | `[-2.77, 0, 0.08]` | $-0.0917^\circ\text{ S}, 34.7680^\circ\text{ E}$ | Lake Victoria Jetty & Great Lakes Transit |

---

## 7. Core Calculation Formulas & Business Logic

> 💡 **For a comprehensive, beginner-friendly guide with worked examples, unit conversions, visual representations, and alarm thresholds, see the dedicated [Calculations and Visualizations Guide](./CALCULATIONS_AND_VISUALIZATIONS.md).**

### Volume Temperature Correction (ASTM D1250 / Table 54B)
$$VCF_{15} = \exp\left(-\alpha_{15} \times \Delta T \times (1 + 0.8 \times \alpha_{15} \times \Delta T)\right)$$
$$\text{Where: } \Delta T = T - 15^\circ\text{C}, \quad \alpha_{15} = \frac{K_0}{\rho_{15}^2} + \frac{K_1}{\rho_{15}}$$

### Pipeline Hydraulic Head Loss (Darcy-Weisbach)
$$h_f = f \times \frac{L}{D} \times \frac{v^2}{2g}$$
- $h_f$: Frictional head loss ($m$)
- $f$: Friction factor
- $L$: Segment length ($m$)
- $D$: Pipe internal diameter ($m$)
- $v$: Flow velocity ($m/s$)

### Asset Health Index (AHI)
$$AHI = 100 - \left(w_1 \cdot \text{Vib} + w_2 \cdot \Delta P + w_3 \cdot \text{Age} + w_4 \cdot \text{Overdue PM}\right)$$

---

## 8. Backend API Reference

All endpoints are whitelisted under `kpc.petroleum_operations.api.*`:

| API Method | File Location | Return Structure |
| :--- | :--- | :--- |
| `get_pipeline_scada_network` | `scada_network.py` | `{ terminals: [...], telemetry: {...}, segments: [...] }` |
| `get_daily_throughput_report` | `reports.py` | `{ rows: [...], footer: {...}, meta: {...}, is_live: bool }` |
| `get_stock_reconciliation_report` | `reports.py` | `{ rows: [...], footer: {...}, meta: {...}, is_live: bool }` |
| `get_product_loss_report` | `reports.py` | `{ rows: [...], footer: {...}, meta: {...}, is_live: bool }` |
| `get_tariff_revenue_report` | `reports.py` | `{ rows: [...], footer: {...}, meta: {...}, is_live: bool }` |
| `get_uptime_and_cost_summary` | `asset_metrics.py` | `{ labels: [...], uptime: [...], downtime_cost: [...] }` |
| `get_loss_accountability_kpis` | `loss_accountability.py` | `{ total_loss_kl: float, epra_breach_count: int, ... }` |
| `get_stock_movement` | `stock_movement.py` | `{ opening: float, receipts: float, deliveries: float, ... }` |

---

## 9. Development, Build & Deployment Guide

### Prerequisites
- Node.js `v20.x` or `v22.x`
- Yarn `1.22+`
- Active Frappe Bench environment with `kpc` app installed

### Environment Configuration
Create or edit `portal/.env`:
```bash
# In local development inside Frappe Bench:
VITE_FRAPPE_URL=http://localhost:8000
```

### Available Commands

```bash
# Install dependencies
yarn install

# Start local development server (port 5173 with proxy to Frappe)
yarn dev

# Run TypeScript type verification (must pass with 0 errors)
npx tsc --noEmit

# Production Build (Outputs to ../kpc/public/portal/ and updates ../kpc/www/portal.html)
yarn build

# Code Formatting
yarn format
```

### Production Bundling Workflow
The `yarn build` command automatically executes:
1. `vite build --base=/assets/kpc/portal/`: Compiles modern optimized assets into `../kpc/public/portal/`.
2. `yarn copy-html-entry`: Copies the generated `index.html` entry point to `../kpc/www/portal.html`, allowing Frappe to serve the Single Page Application directly from the native web server router at `/portal`.

---

© 2026 Kenya Pipeline Company Limited. All Rights Reserved.  
*Petroleum Operations & SCADA Telemetry Architecture.*
