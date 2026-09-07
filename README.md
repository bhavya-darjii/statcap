# StatCap AI 🇮🇳

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![SIH](https://img.shields.io/badge/SIH_2026-SIH26101-orange.svg)
![Ministry](https://img.shields.io/badge/Ministry-MoSPI-green.svg)
![Theme](https://img.shields.io/badge/Theme-Blockchain_%26_Cybersecurity-purple.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey.svg)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)

**StatCap AI** is an AI-enabled Skill Intelligence & Capacity Building Platform developed for **India's Official Statistical System (MoSPI)** in integration with the **iGOT Karmayogi** ecosystem under **Mission Karmayogi**.

Developed for **Smart India Hackathon 2026 (Problem Statement Code: SIH26101)**, StatCap AI automates competency gap analysis across civil service cadres (ISS, SSS, NSSO field investigators), auto-synthesizes Bloom's-taxonomy MCQs from official MoSPI survey manuals, recommends targeted iGOT & NSSTA training pathways, and anchors tamper-proof skill credentials to a blockchain ledger.

---

## 🏛️ Sponsoring Ministry & National Context

* **Sponsoring Ministry:** Ministry of Statistics and Programme Implementation (MoSPI), Government of India.
* **Apex Training Body:** National Statistical Systems Training Academy (NSSTA), Greater Noida.
* **National Policy Mandate:** National Training Policy & Mission Karmayogi (DoPT).
* **Target Cadres:**
  * **Indian Statistical Service (ISS)** — Formulating national accounts, inflation indices, and macroeconomic policy.
  * **Subordinate Statistical Service (SSS) & FOD Investigators** — Field surveys, CAPI data collection, PLFS, and price auditing.
  * **NSSTA Course Directors & Instructors** — Curriculum management and assessment creation.

---

## 🎯 Core Capabilities (Aligned with SIH26101 Brief)

1. **FRAC Competency Framework & Profiling:** Pre-mapped to the 4 official domains:
   * *Statistical Competencies:* Survey Sampling & Design, National Accounts (SNA), Price Statistics (CPI/IIP), Labour Statistics (PLFS), Data Quality (NDQAF).
   * *Technical Competencies:* Python, R, Stata, SQL, CAPI, GIS Spatial Mapping.
   * *Digital Governance:* DPDP Act 2023 Compliance, MeghRaj Cloud, Digital Signatures.
   * *Behavioural Competencies:* Statistical Ethics & Integrity, Field Team Coordination.
2. **AI Document-to-Assessment Ingestion Engine:** Upload official MoSPI PDFs (e.g. *NSSO Survey Guidelines*) $\rightarrow$ Tesseract.js OCR & Google Gemini synthesize 10–20 Bloom's-taxonomy MCQs with rationales and competency tags.
3. **Automated Skill-Gap Radar Analysis:** Visual spider/radar chart displaying an officer's current score against the required cadre benchmark.
4. **Dual Recommendation Bridge:** Suggests exact modules from **iGOT Karmayogi** and physical workshops from the **NSSTA TPAC Training Calendar**.
5. **Blockchain Verifiable Micro-Credentials:** Computes a SHA-256 Merkle root of completed skill certifications and anchors proof onto a smart contract ledger to eliminate credential fraud across government departments.
6. **24/7 Statistical Copilot:** In-app AI tutor answering queries on survey weights, index formulas, and data cleaning guidelines.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/en/) (v18 or higher)
* A [Supabase](https://supabase.com/) project (`statcap-db`)
* A [Google Gemini API Key](https://aistudio.google.com/)

### Database Setup
1. Create a new project in [Supabase](https://supabase.com).
2. Open **SQL Editor** and run [`docs/init_statcap_schema.sql`](docs/init_statcap_schema.sql).
3. Copy your project URL and Service Role keys into `.env`.

### Environment Configuration
Create a `.env` file in the root directory:
```env
# Gemini AI Key Pool
GOOGLE_API_KEY=your_gemini_api_key

# Supabase (statcap-db)
VITE_SUPABASE_URL=https://your-statcap-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-statcap-anon-key
SUPABASE_URL=https://your-statcap-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-statcap-service-role-key

PORT=5000
```

### Running Locally
```bash
# Run Vite frontend (:5173) and Express backend (:5000) simultaneously
npm run dev
```

---

## 📜 License
MIT License. Developed for Smart India Hackathon 2026.
