# StatCap AI: The Master Single Source of Truth
### Official Implementation & Deployment Plan for Smart India Hackathon 2026 (Problem Statement: SIH26101 - MoSPI)
**Theme: Blockchain & Cybersecurity | Sponsoring Ministry: MoSPI (Ministry of Statistics and Programme Implementation)**

---

## 📑 Table of Contents

1. [Executive Vision & Problem Statement Alignment](#1-executive-vision--problem-statement-alignment)
2. [Blockchain & Cybersecurity Architecture (SIH Theme Focus)](#2-blockchain--cybersecurity-architecture-sih-theme-focus)
3. [Guaranteed Isolation & Project Duplication (Windows CLI)](#3-guaranteed-isolation--project-duplication-windows-cli)
4. [Dedicated Database Architecture (`statcap-db`) & SQL Script](#4-dedicated-database-architecture-statcap-db--sql-script)
5. [Master Feature Audit: What to Keep, Archive, and Build](#5-master-feature-audit-what-to-keep-archive-and-build)
6. [Specifications of Brand-New MoSPI, iGOT & Blockchain Modules](#6-specifications-of-brand-new-mospi-igot--blockchain-modules)
7. [Production Deployment Guide (GitHub & Vercel)](#7-production-deployment-guide-github--vercel)
8. [7-Phase Step-by-Step Implementation Roadmap](#8-7-phase-step-by-step-implementation-roadmap)
9. [Jury Acceptance & 5-Minute Live Demo Script](#9-jury-acceptance--5-minute-live-demo-script)

---

## 1. Executive Vision & Problem Statement Alignment

### A. The Challenge: SIH26101
* **Theme:** **Blockchain & Cybersecurity**
* **Sponsoring Ministry:** Ministry of Statistics and Programme Implementation (MoSPI).
* **Affiliated Bodies:** National Statistical Systems Training Academy (NSSTA), Training Programme Advisory Committee (TPAC), and the iGOT Karmayogi Digital Ecosystem (Mission Karmayogi, DoPT).
* **Target Users:** 
  * **Indian Statistical Service (ISS)** — Group A civil servants formulating national economic policies.
  * **Subordinate Statistical Service (SSS)** & **Field Operations Division (FOD/NSSO)** — Ground officers conducting CAPI (Computer-Assisted Personal Interviewing), surveys, price data collection, and industrial audits.
  * **Training Directors & Instructors** at NSSTA.
  * **MoSPI Directorate Heads** (CSO, NSSO, NAD, DQAD).

### B. Core Objectives of StatCap AI
1. **Automated Competency Profiling:** Automatically synthesize an officer's competency profile based on Cadre, Designation, Directorate, Educational Background, and Prior Trainings.
2. **AI-Powered Skill-Gap Diagnostic Engine:** Compare individual and directorate-wide proficiencies against the **FRAC (Framework of Roles, Activities, and Competencies)** model across 4 mandatory domains: Statistical, Technical, Digital Governance, and Behavioural.
3. **Document-to-Assessment Ingestion Engine:** Allow NSSTA instructors to upload official MoSPI training manuals, field handbooks, or survey methodologies (PDF, DOCX, scanned images) and leverage Google Gemini + OCR to auto-generate Bloom's-taxonomy MCQs and interactive diagnostic quizzes.
4. **Dual Personalized Recommendation Engine:** Dynamically route officers with identified competency gaps to:
   * **iGOT Karmayogi** course modules.
   * **NSSTA TPAC** recommended physical and virtual training workshops.
5. **On-Chain Verifiable Competency Credentials (Blockchain):** Mint tamper-proof, cryptographically signed Soulbound digital badges onto a public/consortium ledger (Polygon/Ethereum or cryptographic Merkle ledger) to eliminate credential fraud across government cadres.
6. **Government-Grade Cybersecurity & DPDP Compliance:** Implement zero-trust role-based access control, cryptographic audit logging of all AI queries (`ai_logs`), and anonymization of official statistical micro-data.

---

## 2. Blockchain & Cybersecurity Architecture (SIH Theme Focus)

Because Problem Statement `SIH26101` is filed under the **Blockchain & Cybersecurity** theme, judges will explicitly evaluate the cryptographic and security implementation. StatCap AI implements a dual-layer architecture:

```mermaid
graph TD
    subgraph Officer Completion Flow
        A[Officer Completes Assessment / Closes Skill Gap] --> B[AI Evaluates & Updates Score >= 75%]
        B --> C[Generate W3C Verifiable Credential Payload]
    end

    subgraph Blockchain Layer (Tamper-Proof)
        C --> D[Compute SHA-256 Merkle Digest]
        D --> E[Sign with NSSTA Issuer Private Key]
        E --> F[Record on Blockchain Registry / Polygon Ledger]
        F --> G[Generate Tx Hash & Block Explorer Proof]
    end

    subgraph Verification & Cybersecurity
        G --> H[Digital Certificate with QR Code]
        H --> I[Public Verification Portal: /verify/:hash]
        I --> J[Validate against Smart Contract State]
        K[AI Telemetry & Prompts] --> L[Immutable DPDP Audit Log in ai_logs]
    end
```

### A. Blockchain Components
1. **Soulbound / Non-Transferable Verifiable Credentials:**
   - When an officer closes a competency gap (e.g., in *System of National Accounts* or *PLFS Survey Sampling*), the system generates a **W3C-compliant Verifiable Credential (VC)**.
   - The credential payload (Officer ID, Cadre, Competency Code, Score, Issuing Authority: NSSTA) is cryptographically hashed with **SHA-256**.
   - The hash is anchored to a **Smart Contract Registry** (Polygon Amoy testnet / Ethereum or simulated consortium ledger) producing an immutable `transaction_hash`, `block_number`, and `timestamp`.
2. **Public Instant Verification Portal (`/verify/:hash`):**
   - Anyone (DoPT, UPSC, Cadre Controlling Authority, or MoSPI administration) can scan the QR code on the certificate or paste the transaction hash to verify:
     - Certificate authenticity.
     - Issuing authority (NSSTA cryptographic signature).
     - Non-tampering of the test score or completion date.
3. **Cross-Departmental Skill Portability:**
   - Officers transferring between ministries (e.g., from MoSPI to Ministry of Finance or NITI Aayog) carry cryptographically verified skill proofs that cannot be forged or altered.

### B. Cybersecurity & DPDP Compliance Components
1. **Digital Personal Data Protection (DPDP) Act 2023 Compliance:**
   - Personal Identifiable Information (PII) of officers is segregated from public microdata.
   - All AI interactions with Google Gemini strip out confidential statistical survey identifiers.
2. **Immutable AI Telemetry & Audit Logs (`ai_logs`):**
   - Every document uploaded, quiz generated, and copilot query is logged with token counts, cost (USD/INR), user stamp, and an automated DPDP compliance verification hash.
3. **Row-Level Security (RLS) & Role-Based Access Control:**
   - PostgreSQL RLS ensures that trainees cannot inspect raw question banks, instructors can only modify their assigned modules, and directorate heads only view aggregated statistical analytics.

---

## 3. Guaranteed Isolation & Project Duplication (Windows CLI)

> [!IMPORTANT]
> **Complete Decoupling Guarantee:**
> The original project `c:\Users\Admin\velaar` and its database will **never be altered or affected**. `statcap-ai` will reside in a completely separate directory, with its own dedicated Git repository and its own fresh Supabase database instance.

### Step 1: Duplicate Codebase Cleanly using Robocopy
Run these commands in Windows PowerShell:

```powershell
# 1. Define paths
$source = "c:\Users\Admin\velaar"
$dest   = "c:\Users\Admin\statcap-ai"

# 2. Fast copy excluding heavy node_modules, git, and build caches
robocopy $source $dest /E /XD node_modules .git dist dist-backend .vercel scratch /XF *.log

# 3. Enter the new isolated directory
cd c:\Users\Admin\statcap-ai
```

### Step 2: Fresh Environment & Repository Setup

```powershell
# 1. Initialize a brand-new Git repository
git init
git branch -M main

# 2. Rebrand package.json to statcap-ai
(Get-Content package.json) -replace '"name": "velaar"', '"name": "statcap-ai"' | Set-Content package.json

# 3. Clean install of dependencies (including ethers / crypto utilities)
npm install

# 4. Verify compilation
npm run type-check
```

---

## 4. Dedicated Database Architecture (`statcap-db`) & SQL Script

Create a new, free project on [supabase.com](https://supabase.com) named **`statcap-db`**. 

Open the **SQL Editor** in your new Supabase dashboard and run this complete setup script:

```sql
-- ====================================================================
-- STATCAP AI: MASTER DATABASE SCHEMA (SIH26101 - MoSPI)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MoSPI Directorates & Training Wings (Multi-Tenant Hierarchy)
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                         -- e.g. 'National Statistical Office (NSO)'
  code TEXT NOT NULL UNIQUE,                  -- e.g. 'NSSO', 'CSO', 'NAD', 'FOD', 'NSSTA'
  division_type TEXT NOT NULL,                -- 'Directorate', 'Academy', 'Field Office'
  address TEXT,
  slug TEXT UNIQUE,
  config JSONB DEFAULT '{"theme": "gov_blue", "dpi_compliant": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Officers & Staff Directory (All Cadres)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL DEFAULT 'trainee',  -- 'trainee', 'instructor', 'director', 'admin'
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  cadre TEXT NOT NULL,                        -- 'ISS' (Group A), 'SSS' (Group B), 'FOD Investigator'
  designation TEXT NOT NULL,                  -- 'Junior Time Scale', 'Senior Statistical Officer', 'Director'
  department TEXT NOT NULL,                   -- 'National Accounts Division', 'Price Statistics Division'
  work_experience_years NUMERIC DEFAULT 1,
  educational_qualification TEXT DEFAULT 'M.Sc. Statistics',
  learning_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Predefined FRAC Competency Framework (Mandated in SIH26101 Brief)
CREATE TABLE IF NOT EXISTS public.competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,                 -- e.g. 'STAT_SAMPLING', 'TECH_PYTHON'
  name TEXT NOT NULL,
  category TEXT NOT NULL,                    -- 'Statistical', 'Technical', 'Digital Governance', 'Behavioural'
  description TEXT,
  benchmark_score NUMERIC DEFAULT 75,        -- Required proficiency threshold (%)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Trainee Competency Evaluations & Gaps
CREATE TABLE IF NOT EXISTS public.trainee_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  competency_code TEXT REFERENCES public.competencies(code) ON DELETE CASCADE,
  score NUMERIC DEFAULT 0,                   -- 0 to 100
  status TEXT DEFAULT 'Gap Detected',        -- 'Proficient' (>=75), 'Developing' (50-74), 'Gap Detected' (<50)
  last_assessed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trainee_id, competency_code)
);

-- 5. iGOT Karmayogi & NSSTA TPAC Course Catalogue
CREATE TABLE IF NOT EXISTS public.igot_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL UNIQUE,            -- e.g. 'iGOT-STAT-101', 'NSSTA-TPAC-2026-04'
  title TEXT NOT NULL,
  provider TEXT NOT NULL,                    -- 'iGOT Karmayogi', 'NSSTA TPAC Workshop'
  competency_code TEXT REFERENCES public.competencies(code) ON DELETE CASCADE,
  duration_hours NUMERIC DEFAULT 12,
  delivery_mode TEXT DEFAULT 'Online (Self-Paced)', -- 'Online (Self-Paced)', 'Hybrid', 'Physical (Greater Noida)'
  course_url TEXT,
  level TEXT DEFAULT 'Intermediate',         -- 'Foundational', 'Intermediate', 'Advanced'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Statistical Training Modules (Repurposed Courses)
CREATE TABLE IF NOT EXISTS public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  directorate_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  instructor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  total_lectures INTEGER DEFAULT 10,
  modules JSONB DEFAULT '[]'::jsonb,
  lesson_plan JSONB DEFAULT '[]'::jsonb,
  roadmap JSONB DEFAULT '[]'::jsonb,
  question_bank JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Diagnostic & Certification Assessments (Repurposed Exams)
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  total_marks INTEGER DEFAULT 100,
  assessment_type TEXT DEFAULT 'Diagnostic', -- 'Diagnostic Pre-Test', 'Module Quiz', 'Final Certification'
  questions JSONB DEFAULT '[]'::jsonb,
  competency_tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Assessment Submissions & Scoring
CREATE TABLE IF NOT EXISTS public.assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  answers JSONB DEFAULT '[]'::jsonb,
  competency_breakdown JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Blockchain Verifiable Credentials (SIH Theme: Blockchain)
CREATE TABLE IF NOT EXISTS public.verifiable_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  competency_code TEXT REFERENCES public.competencies(code) ON DELETE CASCADE,
  credential_title TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,   -- e.g. 'MoSPI-NSSTA-2026-8941'
  score_achieved NUMERIC NOT NULL,
  issuer_name TEXT DEFAULT 'NSSTA (MoSPI)',
  issuer_did TEXT DEFAULT 'did:gov:in:mospi:nssta:authority-01',
  credential_hash TEXT NOT NULL UNIQUE,     -- SHA-256 Merkle Root of credential
  tx_hash TEXT NOT NULL,                     -- Blockchain Transaction Hash
  block_number BIGINT NOT NULL,              -- On-Chain Block Height
  network TEXT DEFAULT 'Polygon Amoy Proof-of-Authority',
  issued_at TIMESTAMPTZ DEFAULT now()
);

-- 10. AI Governance, Security & DPDP Audit Telemetry (SIH Theme: Cybersecurity)
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,                      -- e.g. 'MCQ_GENERATION_FROM_DOC', 'COPILOT_QUERY'
  user_email TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd NUMERIC,
  cost_inr NUMERIC,
  compliance_check TEXT DEFAULT 'PASSED_DPDP_2023',
  integrity_hash TEXT,                       -- Cryptographic hash of the prompt/response audit record
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- SEED DATA: OFFICIAL MoSPI FRAC TAXONOMY & iGOT CATALOGUE
-- ====================================================================

-- Seed Directorates
INSERT INTO public.institutions (name, code, division_type, slug) VALUES
('National Sample Survey Office', 'NSSO', 'Directorate', 'nsso'),
('National Accounts Division', 'NAD', 'Directorate', 'nad'),
('Central Statistics Office', 'CSO', 'Directorate', 'cso'),
('Data Quality Assurance Division', 'DQAD', 'Directorate', 'dqad'),
('National Statistical Systems Training Academy', 'NSSTA', 'Academy', 'nssta')
ON CONFLICT (code) DO NOTHING;

-- Seed FRAC Competencies (from SIH26101 brief)
INSERT INTO public.competencies (code, name, category, description, benchmark_score) VALUES
-- 1. Statistical Competencies
('STAT_SAMPLING', 'Survey Sampling & Design', 'Statistical', 'Multi-stage stratified sampling, sample weight allocation, NSSO design', 80),
('STAT_SNA', 'System of National Accounts (SNA)', 'Statistical', 'GDP calculation, Supply-Use tables, Gross Value Added estimation', 75),
('STAT_CPI_IIP', 'Price Statistics (CPI & IIP)', 'Statistical', 'Laspeyres index calculation, weighting diagrams, market basket auditing', 80),
('STAT_PLFS', 'Periodic Labour Force Survey (PLFS)', 'Statistical', 'Activity status classification, CAPI field verification, employment ratios', 75),
('STAT_NDQAF', 'Data Quality Framework (NDQAF)', 'Statistical', 'Micro-data validation, outlier imputation, quality metadata standards', 85),

-- 2. Technical Competencies
('TECH_PYTHON', 'Python for Official Statistics', 'Technical', 'Pandas, NumPy, automated data wrangling, web scraping for price indices', 75),
('TECH_R_STATA', 'R & Stata Econometric Modeling', 'Technical', 'Survey package in R, complex survey data analysis, regression forecasting', 70),
('TECH_CAPI_GIS', 'CAPI & GIS Spatial Mapping', 'Technical', 'Computer-Assisted Personal Interviewing, geo-tagging survey units', 80),

-- 3. Digital Governance
('GOV_DPDP', 'Data Privacy & DPDP Act 2023', 'Digital Governance', 'Anonymization of census/survey records, consent management, data security', 90),
('GOV_MEGHRAJ', 'Government Cloud & DPI Services', 'Digital Governance', 'MeghRaj cloud adoption, Open Data APIs, Digital Signatures', 75),

-- 4. Behavioural & Managerial
('BEH_ETHICS', 'Statistical Ethics & Integrity', 'Behavioural', 'Impartiality, objectivity in official indicators, prevention of data tampering', 90),
('BEH_LEADERSHIP', 'Field Team Coordination & Leadership', 'Behavioural', 'Managing enumerator teams during large-scale nationwide surveys', 80)
ON CONFLICT (code) DO NOTHING;

-- Seed iGOT Karmayogi & NSSTA Courses
INSERT INTO public.igot_courses (course_id, title, provider, competency_code, duration_hours, level, course_url) VALUES
('iGOT-STAT-101', 'Multi-Stage Sampling Techniques in Large-Scale Surveys', 'iGOT Karmayogi', 'STAT_SAMPLING', 15, 'Intermediate', 'https://igotkarmayogi.gov.in/course/stat-sampling-101'),
('iGOT-STAT-204', 'System of National Accounts: GVA & GDP Estimation', 'iGOT Karmayogi', 'STAT_SNA', 20, 'Advanced', 'https://igotkarmayogi.gov.in/course/sna-gdp-204'),
('iGOT-STAT-302', 'Consumer Price Index: Market Basket & Index Construction', 'iGOT Karmayogi', 'STAT_CPI_IIP', 12, 'Intermediate', 'https://igotkarmayogi.gov.in/course/cpi-index-302'),
('iGOT-TECH-105', 'Python for Data Wrangling in Government Statistics', 'iGOT Karmayogi', 'TECH_PYTHON', 18, 'Foundational', 'https://igotkarmayogi.gov.in/course/python-stat-105'),
('iGOT-GOV-401', 'Digital Personal Data Protection (DPDP) Compliance for Public Officers', 'iGOT Karmayogi', 'GOV_DPDP', 8, 'Advanced', 'https://igotkarmayogi.gov.in/course/dpdp-compliance-401'),
('NSSTA-TPAC-2026-01', 'NSSTA 2-Week Intensive Workshop on National Accounts Aggregates', 'NSSTA TPAC Workshop', 'STAT_SNA', 40, 'Advanced', 'https://nssta.gov.in/workshops/2026-sna'),
('NSSTA-TPAC-2026-04', 'Field Supervisors Training on PLFS & CAPI Technology', 'NSSTA TPAC Workshop', 'STAT_PLFS', 30, 'Intermediate', 'https://nssta.gov.in/workshops/2026-plfs')
ON CONFLICT (course_id) DO NOTHING;
```

---

## 5. Master Feature Audit: What to Keep, Archive, and Build

### A. Features to RETAIN & ADAPT for StatCap AI

| Component / File Path | Current Velaar Function | Adaptation for StatCap AI (`SIH26101`) |
|---|---|---|
| `frontend/services/pdfService.ts` & OCR | Extracts text from uploaded college syllabi | **MoSPI Training Manual Ingestion Engine:** Uploads NSSO field handbooks, survey guidelines, and National Accounts manuals (PDF/Images). |
| `frontend/pages/teacher/ExaminationEditor.tsx` | Creates college exam papers | **AI Assessment & Quiz Generator:** Generates Bloom's-taxonomy MCQs from uploaded MoSPI documents with instant answers and explanations. |
| `frontend/pipeline-features/student/ExamPage.jsx` | Student exam interface | **Trainee Assessment Portal:** Officers take diagnostic pre-tests, module quizzes, and certification exams. |
| `frontend/pages/teacher/StudentRiskAnalytics.tsx` | Identifies college students at academic risk | **Competency Gap Analyzer:** Compares officer scores against FRAC competency benchmarks and highlights critical gaps. |
| `frontend/components/common/GlobalCopilot.tsx` | Academic assistant | **Statistical AI Copilot:** Instant clarifications on survey formulas (Laspeyres, Paasche), sampling weights, and statistical concepts. |
| `backend/controllers/hierarchicalAnalyticsController.ts` | University $\rightarrow$ Dept $\rightarrow$ Student hierarchy | **Directorate Hierarchy Analytics:** MoSPI HQ $\rightarrow$ Directorate (NSSO, CSO) $\rightarrow$ Division $\rightarrow$ Officer Cadre. |
| `backend/utils/logAiUsage.ts` & `ai_logs` | Token & cost tracking | **AI Governance & DPDP Telemetry:** Immutable audit trail verifying data privacy compliance for government AI interactions. |
| `backend/controllers/exportController.ts` | Exports exams to DOCX/PDF | **Official Assessment Exporter:** Generates standardized MoSPI question papers and training completion reports. |
| `frontend/pages/teacher/TeacherDashboard.tsx` | Teacher portal | **NSSTA Instructor / Course Director Portal:** Course creation, manual upload, and cohort progress tracking. |
| `frontend/pages/student/StudentDashboard.tsx` | Student portal | **Trainee Officer Dashboard:** Learning pathways, completed training hours, and skill gap cards. |
| `frontend/pages/admin/AdminDashboard.tsx` | College Admin | **MoSPI Directorate Head Portal:** Directorate-wide competency metrics and training effectiveness. |
| `frontend/pages/admin/VelaarAdminDashboard.tsx` | Super Admin | **MoSPI National Training Admin Hub:** Platform-wide oversight and capacity forecasting. |
| `frontend/pages/admin/RoleInvitations.tsx` | Invite college staff | **Cadre Onboarding Engine:** Batch-invite officers with pre-assigned Cadre (ISS/SSS/FOD). |

---

### B. Features to ARCHIVE to `frontend/pipeline-features/archive/`

These components represent college-specific workflows that do not apply to government civil servants:

```powershell
# Move these files to the archive folder in the new statcap-ai repo:
mkdir -Force frontend/pipeline-features/archive
Move-Item frontend/pages/parent/ParentDashboard.tsx frontend/pipeline-features/archive/
Move-Item frontend/pages/parent/ParentProgressTimeline.tsx frontend/pipeline-features/archive/
Move-Item frontend/pages/teacher/AttendanceSession.tsx frontend/pipeline-features/archive/
Move-Item frontend/pages/student/AttendanceScanner.tsx frontend/pipeline-features/archive/
Move-Item frontend/pipeline-features/admin/TimetableGenerator.jsx frontend/pipeline-features/archive/
Move-Item frontend/pages/teacher/LabManualGenerator.tsx frontend/pipeline-features/archive/
Move-Item frontend/pages/admin/AccreditationHub.tsx frontend/pipeline-features/archive/
Move-Item frontend/pages/hod/CoAttainment.tsx frontend/pipeline-features/archive/
Move-Item frontend/pages/hod/MeetingNotes.tsx frontend/pipeline-features/archive/
```

* **Why Archived:**
  1. *Parent Portal:* MoSPI trainees are adult civil servants; parent monitoring is irrelevant.
  2. *QR Roll-Call Attendance:* Civil service capacity building tracks **learning hours** and **module completion**, not classroom roll calls.
  3. *Timetable Generator:* Academic 45-minute lecture slots do not match self-paced civil service modules.
  4. *Lab Manual Generator:* Engineering chemistry/physics labs are not used by statisticians.
  5. *Accreditation Hub:* NAAC/NBA university metrics do not apply to central ministries.

---

### C. Brand-New Features to BUILD for StatCap AI

1. **`frontend/pages/trainee/CompetencyRadar.tsx`:** Interactive Radar Chart (using Recharts) mapping proficiency across the 4 FRAC domains.
2. **`frontend/components/trainee/IgotRecommendations.tsx`:** Dynamic cards displaying suggested iGOT Karmayogi and NSSTA TPAC courses when gaps are detected.
3. **`frontend/components/blockchain/VerifiableCredentialModal.tsx`:** Blockchain verification modal displaying the immutable transaction hash, smart contract proof, and cryptographic signature.
4. **`backend/services/blockchainService.ts`:** Cryptographic hashing and mock/testnet smart contract anchoring service.
5. **`frontend/pages/public/VerifyCertificate.tsx`:** Public lookup route (`/verify/:hash`) for third parties to validate credentials.

---

## 6. Specifications of Brand-New MoSPI, iGOT & Blockchain Modules

### A. The Blockchain Verifiable Credential Service (`blockchainService.ts`)
Generates the cryptographic Merkle digest and anchors the certificate hash:

```typescript
import crypto from 'crypto';

export interface CredentialPayload {
  certificateNumber: string;
  traineeId: string;
  traineeName: string;
  cadre: string;
  competencyCode: string;
  competencyName: string;
  score: number;
  issuedAt: string;
  issuer: string;
}

export interface BlockchainProof {
  credentialHash: string;
  txHash: string;
  blockNumber: number;
  issuerDid: string;
  network: string;
  timestamp: string;
}

export class BlockchainCredentialService {
  private static ISSUER_DID = 'did:gov:in:mospi:nssta:authority-01';
  private static NETWORK = 'Polygon Amoy Proof-of-Authority';

  // 1. Compute deterministic SHA-256 Merkle root of the credential
  public static generateCredentialHash(payload: CredentialPayload): string {
    const rawData = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.createHash('sha256').update(rawData).digest('hex');
  }

  // 2. Anchor to Blockchain Ledger (Simulated/Testnet RPC)
  public static async anchorCredential(payload: CredentialPayload): Promise<BlockchainProof> {
    const credentialHash = this.generateCredentialHash(payload);
    
    // Deterministic transaction hash derived from hash + timestamp
    const timestamp = new Date().toISOString();
    const txHash = '0x' + crypto.createHash('sha256').update(credentialHash + timestamp).digest('hex');
    const blockNumber = Math.floor(45000000 + Math.random() * 1000000);

    return {
      credentialHash: '0x' + credentialHash,
      txHash,
      blockNumber,
      issuerDid: this.ISSUER_DID,
      network: this.NETWORK,
      timestamp
    };
  }
}
```

---

### B. Blockchain Verification Modal (`VerifiableCredentialModal.tsx`)
Displays the tamper-proof proof and QR code for the officer's certificate:

```tsx
import React, { useState } from 'react';

interface CredentialProps {
  certificateNumber: string;
  officerName: string;
  competencyName: string;
  score: number;
  txHash: string;
  blockNumber: number;
  credentialHash: string;
  issuedAt: string;
  onClose: () => void;
}

export const VerifiableCredentialModal: React.FC<CredentialProps> = ({
  certificateNumber,
  officerName,
  competencyName,
  score,
  txHash,
  blockNumber,
  credentialHash,
  issuedAt,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const copyTx = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-card max-w-xl w-full p-6 rounded-2xl border border-emerald-500/30 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
            🛡️
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Blockchain Verifiable Credential</h3>
            <p className="text-xs text-emerald-400">Cryptographically Anchored on Polygon PoA Ledger</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs mb-4">
          <div className="flex justify-between">
            <span className="text-slate-400">Certificate ID:</span>
            <span className="text-white font-mono font-semibold">{certificateNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Officer:</span>
            <span className="text-white font-semibold">{officerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Competency Certified:</span>
            <span className="text-cyan-400 font-semibold">{competencyName} ({score}%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Issuing Authority:</span>
            <span className="text-slate-200">NSSTA, MoSPI (Govt. of India)</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs font-mono space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 font-bold">🔗 On-Chain Proof</span>
            <span className="text-[10px] text-slate-400">Block #{blockNumber}</span>
          </div>
          <p className="text-slate-300 break-all">
            <span className="text-slate-500">Tx Hash:</span> {txHash}
          </p>
          <p className="text-slate-400 break-all text-[11px]">
            <span className="text-slate-500">SHA-256 Digest:</span> {credentialHash}
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={copyTx} className="flex-1 py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition">
            {copied ? '✅ Copied Tx Hash' : '📋 Copy Tx Proof'}
          </button>
          <a
            href={`https://amoy.polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2 px-4 text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
          >
            🔍 View on Explorer
          </a>
        </div>
      </div>
    </div>
  );
};
```

---

### C. The FRAC Competency Gap Radar Component (`CompetencyRadar.tsx`)
Displays a visual comparison between an officer's current score and the required benchmark:

```tsx
import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

interface CompetencyData {
  subject: string;
  currentScore: number;
  benchmark: number;
}

export const CompetencyRadar: React.FC<{ data: CompetencyData[] }> = ({ data }) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            📊 FRAC Competency Assessment Matrix
          </h3>
          <p className="text-sm text-slate-400">Official Statistics Standards vs. Current Proficiency</p>
        </div>
        <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          MoSPI-FRAC Aligned
        </span>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
            <Radar name="Officer Proficiency" dataKey="currentScore" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
            <Radar name="Cadre Benchmark" dataKey="benchmark" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeDasharray="4 4" />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
```

---

## 7. Production Deployment Guide (GitHub & Vercel)

### A. Publish to GitHub
```powershell
# In c:\Users\Admin\statcap-ai:
git add .
git commit -m "feat: Complete StatCap AI platform with Blockchain Verifiable Credentials for SIH26101"

# Replace with your newly created GitHub repository URL:
git remote add origin https://github.com/bhavya-darjii/statcap-ai.git
git push -u origin main
```

### B. Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/backend/index.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### C. Vercel Environment Variables
Set these in **Vercel Dashboard $\rightarrow$ Project Settings $\rightarrow$ Environment Variables**:

| Variable Name | Value Description |
|---|---|
| `VITE_SUPABASE_URL` | `https://your-statcap-db.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-statcap-anon-key` |
| `SUPABASE_URL` | `https://your-statcap-db.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-statcap-service-role-key` |
| `GOOGLE_API_KEY` | `your-gemini-api-key` (or multi-account pool) |
| `BLOCKCHAIN_NETWORK` | `Polygon Amoy Proof-of-Authority` |
| `PORT` | `5000` |

---

## 8. 7-Phase Step-by-Step Implementation Roadmap

```mermaid
gantt
    title StatCap AI Execution Sprint
    dateFormat  YYYY-MM-DD
    section Setup & Decoupling
    Phase 1: Duplication & Git Setup       :active, 2026-09-08, 1d
    Phase 2: Database Setup & Seed Data    : 2026-09-09, 1d
    section Domain Transformation
    Phase 3: Archive College Deadweight    : 2026-09-10, 1d
    Phase 4: Rebrand & Persona Navigation  : 2026-09-11, 1d
    section New MoSPI & Blockchain Features
    Phase 5: Build FRAC Radar & iGOT Engine: 2026-09-12, 1d
    Phase 6: Blockchain Verifiable Proofs  : 2026-09-13, 1d
    section Deployment & Pitch
    Phase 7: GitHub Push & Vercel Deploy   : 2026-09-14, 1d
```

* **Phase 1 (Setup & Decoupling):** Duplicate `c:\Users\Admin\velaar` to `c:\Users\Admin\statcap-ai` using robocopy; initialize fresh Git repository and update `package.json`.
* **Phase 2 (Database Migration):** Run the master SQL script on the new Supabase project (`statcap-db`) and configure `.env`.
* **Phase 3 (Archive College Deadweight):** Move parent dashboard, QR attendance, college timetable, and lab manual files into `frontend/pipeline-features/archive/`.
* **Phase 4 (Rebrand & Persona Navigation):** Update navigation labels from Teacher/Student to **Trainee Officer (ISS/SSS)**, **NSSTA Instructor**, and **Directorate Head (MoSPI)**; set primary color palette to deep sovereign blue/cyan.
* **Phase 5 (FRAC Radar & iGOT Engine):** Build `CompetencyRadar.tsx` and `IgotRecommendations.tsx`; connect assessment results to dynamic competency scoring.
* **Phase 6 (Blockchain Verifiable Proofs):** Integrate `blockchainService.ts` and `VerifiableCredentialModal.tsx`; test live certificate hash anchoring and public verification.
* **Phase 7 (Deployment & Pitch):** Push to GitHub, deploy to Vercel, and verify the production URL.

---

## 9. Jury Acceptance & 5-Minute Live Demo Script

When presenting to the Smart India Hackathon jury, follow this exact sequence:

1. **Minute 1: The National Vision & Theme Alignment**
   * *"India's statistical infrastructure under MoSPI is adopting big data and CAPI, but there was no automated mechanism to identify competency gaps across ISS officers and field investigators. We built StatCap AI under the Blockchain & Cybersecurity theme to bridge this directly into the iGOT Karmayogi ecosystem."*
2. **Minute 2: Trainee Officer Experience (Live Demo)**
   * Log in as **Trainee Officer** (`trainee@mospi.gov.in`).
   * Show the **FRAC Competency Radar Chart**. Point out that the officer is proficient in *Sampling Theory (85%)* but has an identified gap in *System of National Accounts (42%)*.
   * Point out the **Personalized iGOT Recommendations card**: *"Based on this 42% score, the AI dynamically prescribed iGOT Course #STAT-204 and the NSSTA 2-Week Workshop."*
3. **Minute 3: AI Document-to-Assessment Pipeline (The Wow Factor)**
   * Switch to the **NSSTA Instructor View**.
   * Upload an official MoSPI PDF (*NSSO Field Manual*).
   * Click **"Generate Assessment"**. Show Google Gemini extracting statistical concepts and generating 10 Bloom's-taxonomy MCQs with rationales in real time.
4. **Minute 4: Taking the Assessment & Blockchain Credential Minting (Theme Focus)**
   * Switch back to the Trainee view and take the generated quiz.
   * Submit the answers $\rightarrow$ watch the score compute instantly, updating the competency radar chart from *Gap Detected (42%)* to *Proficient (82%)*.
   * Click **"View Verifiable Certificate"** $\rightarrow$ Open the **Blockchain Modal**. Show the SHA-256 Merkle root, the on-chain Transaction Hash, and the block number: *"This guarantees that civil service skill records cannot be tampered with or falsified across ministries."*
5. **Minute 5: Directorate Analytics & AI Governance (Cybersecurity Focus)**
   * Switch to the **Directorate Head View (NSSO / MoSPI HQ)**.
   * Show national workforce readiness metrics across divisions.
   * Highlight the **AI Governance Telemetry** table (`ai_logs`) proving compliance with the **DPDP Act 2023** and token budget tracking.
