# Frontend Design Specification — Plagiarism Checker UI

## 1. Overview
This document outlines the frontend specifications for the Campus Plagiarism Checker UI. The system integrates visually with the existing SADS (Sistem Administrasi Dosen & Mahasiswa) portal.

**Tech Stack:**
- Framework: Next.js (App Router recommended)
- Styling: Tailwind CSS
- Icons: `lucide-react`
- State Management: React Context or Zustand (for Role/Auth state)

---

## 2. Global Layout Structure

The application uses a standard dashboard layout consisting of three main parts:

### A. Sidebar (Left)
- **Width:** `w-64` (Hidden on mobile `md:flex`).
- **Header:** Height `h-16`, solid red `bg-[#cc1a22]`, white bold text "PLAGIARISM CHECKER".
- **User Profile:** Displays Avatar (Initials), NIM/NIDN, and Role based on current active user.
- **Navigation Menu:** Grouped by categories (e.g., "MAIN NAVIGATION", "INFORMASI & PANDUAN").
- **Active State:** Red text (`text-red-700`), red background tint (`bg-red-50`), and left red border (`border-l-4 border-red-700`).

### B. Top Header (Top)
- **Height:** `h-16`, white background with bottom border.
- **Left:** Page Title (e.g., "Dashboard") and mobile menu hamburger toggle.
- **Right:** Notifications (Bell icon with red dot) and Role Switcher Dropdown (for testing/admin impersonation).

### C. Main Content Area
- **Background:** Light gray `bg-gray-50`.
- **Padding:** `p-6`.
- **Containers:** Content is constrained within `max-w-6xl` (for dashboards) or smaller widths for forms (`max-w-3xl`).

---

## 3. Role-Based Navigation & Features

The UI adapts based on the active role (`mahasiswa`, `dosen`, or `admin`).

### Role 1: Mahasiswa (Student)
- **Dashboard:** Shows summary stats (Documents Checked, Avg Similarity, Status). Includes Academic Announcements.
- **Upload Dokumen:** A drag-and-drop zone (`border-dashed`) to upload PDFs. Includes a dropdown to select document type (Sempro, Skripsi, etc.).
- **Riwayat Pengecekan:** A data table showing historical checks (Title, Date, Status Badge, Similarity %).
- **Buku Panduan:** Explains TF-IDF, Cosine Similarity, and threshold rules.
- **Pusat Bantuan:** Form to submit IT support tickets.

### Role 2: Dosen (Supervisor)
- **Dashboard:** Stats on assigned students, documents needing review, and recent approvals. Includes an "Antrean Review" table.
- **Dokumen Bimbingan:** List of assigned students and their overall progress.
- **Riwayat Approval:** Log of documents the supervisor has validated.
- **Buku Panduan:** Supervisor-specific guide for interpreting similarity results.

### Role 3: Admin (IT/System)
- **Dashboard:** System health monitoring. Stats on total repository size, daily checks, NLP engine queue, and server status (Uvicorn/FastAPI status mockups).
- **Kelola Repositori:** Interface for bulk uploading past thesis documents into the comparison database.
- **Log Pengecekan:** Master table of all campus-wide plagiarism checks.
- **Kelola Pengguna:** Interface to manage Dosen and Mahasiswa access.
- **Pengaturan Sistem:** Configuration for system thresholds (e.g., setting the max allowed similarity %).

---

## 4. Component Design System (Tailwind)

Please adhere strictly to these UI tokens to maintain a clean, academic look:

### Cards & Panels
- Main containers: `bg-white rounded-xl shadow-sm border border-gray-200`
- Inner paddings: Usually `p-6` or `p-8`.

### Typography
- Titles: `text-xl` or `text-2xl font-bold text-gray-800`
- Subtitles/Labels: `text-sm font-medium text-gray-500`
- Table Headers: `text-xs uppercase tracking-wider text-gray-500 bg-gray-50`

### Status Badges
- **Selesai / Lolos (Green):** `bg-green-100 text-green-800`
- **Proses / Warning (Yellow):** `bg-yellow-100 text-yellow-800`
- **Gagal / Bahaya (Red):** `bg-red-100 text-red-800`

### Similarity Colors
- **< 20%:** `text-green-600 font-bold`
- **21% - 30%:** `text-yellow-600 font-bold`
- **> 30%:** `text-red-600 font-bold`

### Buttons
- **Primary:** `bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md`
- **Secondary (Action inside tables):** `bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs py-1.5 px-3 rounded`

---

## 5. Implementation Instructions for the AI Agent

1. **Initialize Next.js:** Scaffold a Next.js App Router project.
2. **Component Breakdown:** Do not put everything in one file. Split the layout into:
   - `components/layout/Sidebar.tsx`
   - `components/layout/Header.tsx`
   - `components/layout/DashboardLayout.tsx`
3. **Routing:** Create page routes corresponding to the navigation menus (`/dashboard`, `/upload`, `/history`, etc.).
4. **Mock Data:** Use static mock data to populate the tables and charts. Do not build the backend API yet (as per `AGENTS.md` Phase 1 rule).
5. **Role State:** Implement a global state (e.g., Context API) to toggle between `mahasiswa`, `dosen`, and `admin` roles easily from the top header.