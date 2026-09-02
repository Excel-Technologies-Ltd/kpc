# Frappe API & React SDK Reference Guide

This document provides a comprehensive API reference for developing React frontend applications with Frappe and the **KPC Petroleum Operations Platform** using `frappe-react-sdk`.

---

## 📑 Table of Contents

1. [FrappeProvider Configuration](#1-frappeprovider-configuration)
2. [Authentication Hooks (`useFrappeAuth`)](#2-authentication-hooks-usefrappeauth)
3. [Document / DocType APIs (CRUD)](#3-document--doctype-apis-crud)
   - [Fetching Lists (`useFrappeGetDocList`)](#fetching-lists-usefrappegetdoclist)
   - [Fetching a Single Document (`useFrappeGetDoc`)](#fetching-a-single-document-usefrappegetdoc)
   - [Document Count (`useFrappeGetDocCount`)](#document-count-usefrappegetdoccount)
   - [Creating Documents (`useFrappeCreateDoc`)](#creating-documents-usefrappecreatedoc)
   - [Updating Documents (`useFrappeUpdateDoc`)](#updating-documents-usefrappeupdatedoc)
   - [Deleting Documents (`useFrappeDeleteDoc`)](#deleting-documents-usefrappedeletedoc)
4. [Custom Whitelisted Python Methods](#4-custom-whitelisted-python-methods)
   - [POST Calls (`useFrappePostCall`)](#post-calls-usefrappepostcall)
   - [GET Calls (`useFrappeGetCall`)](#get-calls-usefrappegetcall)
5. [File Uploads (`useFrappeFileUpload`)](#5-file-uploads-usefrappefileupload)
6. [KPC Domain DocTypes Catalog](#6-kpc-domain-doctypes-catalog)
7. [Filters & Query Syntax](#7-filters--query-syntax)

---

## 1. FrappeProvider Configuration

In `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FrappeProvider } from "frappe-react-sdk";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* When running with Vite proxy or inside Frappe www route, leave url empty or undefined */}
    <FrappeProvider enableSocket={false}>
      <App />
    </FrappeProvider>
  </StrictMode>,
);
```

---

## 2. Authentication Hooks (`useFrappeAuth`)

### Available Properties & Methods:

```tsx
const {
  currentUser, // string | null (e.g. "Administrator", "azmin@excelbd.com")
  isValidating, // boolean
  isLoading, // boolean
  error, // Error object or null
  login, // async ({ username, password }) => void
  logout, // async () => void
  updatePassword, // async ({ oldPassword, newPassword }) => void
  getUserDetails, // async () => UserDetails
} = useFrappeAuth();
```

### Example Usage:

```tsx
import { useFrappeAuth } from "frappe-react-sdk";
import { useState } from "react";

export function LoginForm() {
  const { currentUser, login, logout, isLoading } = useFrappeAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isLoading) return <div>Checking session...</div>;

  if (currentUser && currentUser !== "Guest") {
    return (
      <div>
        <p>
          Logged in as: <strong>{currentUser}</strong>
        </p>
        <button onClick={() => logout()}>Log out</button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await login({ username: email, password });
      }}
    >
      <input
        type="text"
        placeholder="Email / Username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

---

## 3. Document / DocType APIs (CRUD)

### Fetching Lists (`useFrappeGetDocList`)

```tsx
import { useFrappeGetDocList } from "frappe-react-sdk";

export function JourneyTable() {
  const { data, isLoading, error, mutate } = useFrappeGetDocList<JourneyDoc>(
    "Journey",
    {
      fields: ["name", "status", "vessel_name", "product", "creation"],
      filters: [
        ["status", "!=", "Completed"],
        ["docstatus", "<", 2],
      ],
      orderBy: {
        field: "creation",
        order: "desc",
      },
      limit_start: 0,
      limit: 20,
    },
  );

  if (isLoading) return <div>Loading journeys...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Journey ID</th>
          <th>Vessel</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{row.vessel_name}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### Fetching a Single Document (`useFrappeGetDoc`)

```tsx
import { useFrappeGetDoc } from "frappe-react-sdk";

export function TankDetails({ tankId }: { tankId: string }) {
  const { data: tank, isLoading, error } = useFrappeGetDoc("Oil Tank", tankId);

  if (isLoading) return <div>Loading tank data...</div>;
  if (error) return <div>Failed to load tank details</div>;

  return (
    <div>
      <h3>{tank?.tank_name || tank?.name}</h3>
      <p>Capacity: {tank?.capacity} m³</p>
      <p>Terminal: {tank?.terminal}</p>
      <p>Status: {tank?.status}</p>
    </div>
  );
}
```

---

### Document Count (`useFrappeGetDocCount`)

```tsx
import { useFrappeGetDocCount } from "frappe-react-sdk";

export function MetricsWidget() {
  const { data: openAlerts } = useFrappeGetDocCount("AI Alert", [
    ["status", "=", "Open"],
  ]);
  const { data: activeTanks } = useFrappeGetDocCount("Oil Tank", [
    ["status", "=", "Active"],
  ]);

  return (
    <div className="metrics-grid">
      <div className="metric-card">Open Alerts: {openAlerts ?? 0}</div>
      <div className="metric-card">Active Tanks: {activeTanks ?? 0}</div>
    </div>
  );
}
```

---

### Creating Documents (`useFrappeCreateDoc`)

```tsx
import { useFrappeCreateDoc } from "frappe-react-sdk";

export function CreateAlertButton() {
  const { createDoc, loading, error } = useFrappeCreateDoc();

  const handleCreate = async () => {
    try {
      const response = await createDoc("AI Alert", {
        alert_type: "High Pressure Warning",
        severity: "High",
        message: "Line pressure rose above standard threshold on Section 4",
        status: "Open",
      });
      console.log("Created document:", response);
      alert("Alert created successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? "Submitting..." : "Report Alert"}
    </button>
  );
}
```

---

### Updating Documents (`useFrappeUpdateDoc`)

```tsx
import { useFrappeUpdateDoc } from "frappe-react-sdk";

export function ResolveAlertButton({ alertId }: { alertId: string }) {
  const { updateDoc, loading } = useFrappeUpdateDoc();

  const handleResolve = async () => {
    await updateDoc("AI Alert", alertId, {
      status: "Resolved",
      resolution_notes: "Acknowledged and verified by operator",
    });
    alert("Alert resolved!");
  };

  return (
    <button onClick={handleResolve} disabled={loading}>
      Resolve
    </button>
  );
}
```

---

### Deleting Documents (`useFrappeDeleteDoc`)

```tsx
import { useFrappeDeleteDoc } from "frappe-react-sdk";

export function DeleteButton({
  docType,
  name,
}: {
  docType: string;
  name: string;
}) {
  const { deleteDoc, loading } = useFrappeDeleteDoc();

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteDoc(docType, name);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      Delete
    </button>
  );
}
```

---

## 4. Custom Whitelisted Python Methods

### POST Calls (`useFrappePostCall`)

Used for methods decorated with `@frappe.whitelist(methods=["POST"])` or general state-mutating actions.

```tsx
import { useFrappePostCall } from "frappe-react-sdk";

export function TelemetrySender() {
  const { call, loading, error, data } = useFrappePostCall(
    "kpc.petroleum_operations.doctype.ot_telemetry_log.ot_telemetry_log.ingest_telemetry",
  );

  const sendData = async () => {
    const result = await call({
      tag_name: "TK-01-TEMP",
      value: 32.4,
      terminal: "Kipevu Oil Terminal",
    });
    console.log("Result:", result);
  };

  return (
    <button onClick={sendData} disabled={loading}>
      {loading ? "Sending..." : "Ingest Telemetry"}
    </button>
  );
}
```

---

### GET Calls (`useFrappeGetCall`)

Used for read-only whitelist methods.

```tsx
import { useFrappeGetCall } from "frappe-react-sdk";

export function SystemContext() {
  const { data, isLoading } = useFrappeGetCall("frappe.auth.get_logged_user");

  if (isLoading) return <div>Loading...</div>;
  return <div>Logged user email: {data?.message}</div>;
}
```

---

## 5. File Uploads (`useFrappeFileUpload`)

```tsx
import { useFrappeFileUpload } from "frappe-react-sdk";
import { useState } from "react";

export function AttachmentUploader({
  doctype,
  docname,
}: {
  doctype: string;
  docname: string;
}) {
  const { upload, loading, progress } = useFrappeFileUpload();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    await upload(file, {
      doctype,
      docname,
      isPrivate: true,
    });
    alert("File attached successfully!");
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? `Uploading (${progress}%)...` : "Upload"}
      </button>
    </div>
  );
}
```

---

## 6. KPC Domain DocTypes Catalog

These DocTypes are available in your `kpc` app:

### 1. Operations & Logistics

- `Journey`: Tracks the entire shipment lifecycle (vessel arrival to GL posting).
- `Oil Shipment`: Marine vessel cargo manifests, bill of lading, and arrival data.
- `Terminal Receipt`: Stock intake at terminal manifolds.
- `Tank Measurement`: Dip readings, temperature, observed/standard density.
- `Pipeline Batch`: Pumping batch schedules, injection and arrival cuts.
- `Dispatch`: Road tanker / pipeline distribution vouchers.
- `Movement`: Inter-tank and inter-terminal transfers.

### 2. Assets & Storage

- `Oil Tank`: Physical storage tanks, strapping tables, and operational status.
- `Terminal`: Terminal locations (KOT, Mombasa, Nairobi Terminal, etc.).
- `Plant Asset`: Critical pumps, valves, meters, and compressors.
- `Product Compatibility`: Fuel grade sequencing rules (e.g. PMS, AGO, DPK).

### 3. Finance & Tariffs

- `Tariff`: Pumping and storage tariff rates.
- `Invoice` & `Invoice Line`: Customer billing for pipeline transport and demurrage.
- `Financial Posting`: GL Entry integration under the golden thread (`journey_ref`).
- `Reconciliation` & `Variance`: Physical vs ledger stock balancing and gain/loss.

### 4. AI & Decision Support

- `AI Alert`: Real-time anomaly detection (pressure spikes, thermal drift).
- `AI Prediction`: Demand forecasting and transit time estimates.
- `AI Recommendation`: Optimization suggestions for pumping schedules.
- `Decision Ledger`: Audit trail of AI decisions accepted/rejected by operators.
- `OT Telemetry Log`: High-frequency SCADA / IoT measurement intake.

### 5. Safety & HSE

- `Permit To Work`: Safety permits for hot work, confined space, and maintenance.
- `Maintenance Work Order`: Work orders tied to plant assets.
- `Employee Certification`: Operator safety licenses and validity dates.
- `Quality Result` & `Quality Parameter Result`: Lab test specifications (Flash point, API gravity, Sulphur).

---

## 7. Filters & Query Syntax

Frappe filters use an array of 3 or 4 tuples:
`[FieldName, Operator, Value]`

### Supported Operators:

- `=` (Equal)
- `!=` (Not equal)
- `>` / `<` / `>=` / `<=` (Comparison)
- `like` (Wildcard match, e.g. `['vessel_name', 'like', '%MT %']`)
- `in` (List inclusion, e.g. `['status', 'in', ['Draft', 'Submitted']]`)
- `not in`
- `between` (Date or number range, e.g. `['creation', 'between', ['2026-01-01', '2026-12-31']]`)
- `is` (e.g. `['set', 'is', 'set']` or `['set', 'is', 'not set']`)
