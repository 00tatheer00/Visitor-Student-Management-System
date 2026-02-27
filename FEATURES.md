# IHS Visitor Management System – Features Guide

## High-Level Features & How to Use Them

---

### 1. **Visitor Categories (Visitor Type)**

**What it does:** Classifies each visitor when checking in (Guest, Parent, Vendor, Student, Staff, Contractor, Other).

**How to use:**
- When checking in a visitor, select the **Visitor Type** from the dropdown before submitting.
- Use it for reporting and filtering (e.g. how many parents vs vendors visited).
- The type appears as a badge in the Active Visitors list.

---

### 2. **Visitor Badge Printing**

**What it does:** Prints a visitor badge right after check-in.

**How to use:**
- After checking in a visitor, the **Print Visitor Badge** button appears.
- Click it to open a printable badge in a new window.
- Use your browser’s print dialog (Ctrl+P) to print.
- The badge shows name, type, purpose, person to meet, and check-in time.

---

### 3. **Bulk Student Import**

**What it does:** Imports many students at once by uploading a CSV, JSON, or Excel (XLS/XLSX) file.

**How to use:**
1. Go to **Admin Dashboard** → **Register Students**.
2. In the **Bulk Import** section, click **Upload File (CSV / JSON / XLS)**.
3. Select a file with columns: `studentId`, `name`, `department`.
4. The result shows how many were created and how many were skipped (e.g. duplicate IDs).

**Supported formats:**
- **CSV:** Header row `name,department` (or include `studentId` to use custom IDs).
- **JSON:** Array of objects, e.g. `[{"name":"Ali Khan","department":"Nursing"}]`
- **Excel:** XLS or XLSX with columns Name, Department. Student ID is auto-generated (e.g. IHS-NUR-001, IHS-PHR-001) if omitted.

---

### 4. **Dashboard Metrics & Charts**

**What it does:** Shows live counts and trends for visitors and student entries.

**How to use:**
- **Active Visitors** – People currently in the building.
- **Today's Visitors** – Visitors checked in today.
- **Student Entries** – QR scans today.
- **Visit & Entry Statistics** – Bar chart of visitors vs students over the last 7 days.
- **Entry Type Distribution** – Donut chart of visitors vs students.

---

### 5. **Toast Notifications**

**What it does:** Shows brief success/error messages for actions like check-in, scan, and import.

**How to use:**
- Large toasts for main events (QR scan, visitor added).
- Small toasts for other actions (check-out, import, errors).
- They auto-dismiss after a few seconds.

---

### 6. **Student QR / Barcode Scanning**

**What it does:** Records student entry via USB scanner or laptop camera.

**How to use:**
- Click **Scan QR Code**, then scan with the USB scanner.
- Or click **Use Laptop Camera** and show the QR code to the camera.
- Each successful scan records an entry and shows a toast.

---

### 7. **Visitor Check-In / Check-Out**

**What it does:** Registers visitors and tracks when they leave.

**How to use:**
- **Check-in:** Fill the form (name, CNIC, purpose, etc.) and submit.
- **Check-out:** In Active Visitors, click **Check Out** next to the visitor.

---

### 8. **Admin Reports & Export**

**What it does:** Lets admins view logs and export data.

**How to use:**
- **Visitor Logs** – Filter by date and search, then **Export CSV**.
- **Student Entry Logs** – View all student scans.
- **Daily Report** – Summary of today’s visitors and student entries.

---

### 9. **Dark Mode**

**What it does:** Switches the UI to a dark theme.

**How to use:**
- Click the sun/moon icon in the top bar to toggle.

---

## Quick Reference

| Feature            | Location                    | Action                          |
|--------------------|-----------------------------|---------------------------------|
| Visitor badge      | After check-in              | Print Visitor Badge              |
| Bulk import        | Admin → Register Students   | Paste CSV/JSON, Import           |
| Visitor type       | Check-in form               | Select from dropdown             |
