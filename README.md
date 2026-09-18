# StatCap AI

<div align="center">

**AI-Enabled Competency Intelligence & Tamper-Proof Credential Infrastructure for India's Official Statistical System**

**Smart India Hackathon 2026 | Problem Statement ID: SIH26101**  
**Theme:** Blockchain & Cybersecurity | **Category:** Software  
**Sponsoring Ministry:** Ministry of Statistics and Programme Implementation (MoSPI)  
**Apex Training Institute:** National Statistical Systems Training Academy (NSSTA), Greater Noida  
**Integrated Digital Public Infrastructure:** iGOT Karmayogi Ecosystem (Mission Karmayogi, DoPT)

[![Private & Proprietary](https://img.shields.io/badge/Status-Private%20%26%20Proprietary-red?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-Backend-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Polygon](https://img.shields.io/badge/Polygon-Amoy_Testnet-8247e5?style=for-the-badge&logo=polygon&logoColor=white)](https://polygon.technology)
[![Gemini](https://img.shields.io/badge/Gemini-RAG_Engine-orange?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Dual-Engine Innovation](#dual-engine-innovation)
- [Features](#features)
- [Stakeholder Architecture](#stakeholder-architecture)
- [Statutory Standards & Compliance](#statutory-standards--compliance)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [License](#license)
- [Author & Contact](#author--contact)

---

## Executive Summary

**StatCap AI** is an enterprise Competency Intelligence and Capacity Building platform engineered specifically for **India's Official Statistical Cadres** (Indian Statistical Service - ISS, and Subordinate Statistical Service - SSS).

Historically, public sector statistical training has been attendance-driven rather than evidence-driven: officers complete courses without empirical validation that specific job-role capability gaps have been addressed. Furthermore, static completion certificates are susceptible to tampering.

StatCap AI resolves this operational challenge through a **Dual-Engine Sovereign Architecture**:
1. **Vector RAG Assessment Engine (Artificial Intelligence)**: Ingests official statutory MoSPI documentation (SNA 2008, NSSO rounds, PLFS, CPI/IIP, NDQAF), indexes text into a 3,072-dimensional vector space using Google Gemini Embeddings, and synthesizes Bloom's-taxonomy evaluations where every question is mathematically grounded with verbatim statutory citations.
2. **Polygon On-Chain Credential Registry (Blockchain & Cybersecurity)**: Automatically issues tamper-proof, cryptographically verifiable competency credentials anchored on the Polygon Amoy blockchain ledger (`MoSPICredentialRegistry.sol`). Decoupled from personal identities to guarantee strict compliance with India's **Digital Personal Data Protection (DPDP) Act 2023**.

---

## Dual-Engine Innovation

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       STATCAP AI DUAL CORE                                       │
├───────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│           ENGINE 1: VECTOR RAG PIPELINE       │        ENGINE 2: POLYGON BLOCKCHAIN TRUST        │
│          (Diagnostic Competency Engine)       │           (Tamper-Proof Credentialing)           │
├───────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ - Ingests official MoSPI Manuals (PDF/DOCX)   │ - Canonical competency achievement payload       │
│ - Preserves Chapter/Section statutory headers │ - SHA-256 cryptographic payload hashing          │
│ - Google gemini-embedding-001 (3072D vectors) │ - Smart Contract: MoSPICredentialRegistry.sol    │
│ - Cosine similarity search (Top-3 to 5 chunks)│ - Anchored on Polygon Amoy Testnet (Ethers.js v6)│
│ - Slashes prompt token consumption by 95%+    │ - Zero-Knowledge PII: No officer data on-chain   │
│ - Citation Gate: Verbatim manual references   │ - Instant public verification via QR code scanner│
└───────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

---

## Features

- **Grounded Statistical Diagnostic Assessments**: Automatically generates role-specific competency evaluations citing MoSPI statutory manuals.
- **Decentralized Verifiable Credentials**: Cryptographically mints tamper-proof competency badges to the Polygon Amoy blockchain ledger.
- **Zero-Knowledge Privacy Safeguards**: Strict separation of officer Personally Identifiable Information (PII) from prompt payloads and public ledgers.
- **National Competency Telemetry**: Real-time capability analytics across statistical cadres, highlighting division-wide skill gaps.
- **Verifiable Credential Verification Portal**: Instant public credential provenance verification via cryptographic hash lookup and QR scanning.
- **Official Syllabus Ingestion Pipeline**: Ingestion engine for statutory manuals, survey guidelines, and national accounting frameworks.

---

## Stakeholder Architecture

- **Statistical Officers & Trainees (ISS & SSS Cadres)**: Complete diagnostic evaluations, track competency gaps, and receive cryptographic verifiable credentials.
- **NSSTA Academy Instructors & Course Directors**: Review competency analytics, design targeted curriculum interventions, and oversee training telemetry.
- **MoSPI Directorate Leadership & National Hub**: Access executive-level dashboards displaying nation-wide cadre capability matrices and compliance readiness.

---

## Statutory Standards & Compliance

- **Mission Karmayogi (DoPT)**: Aligned with the National Programme for Civil Services Capacity Building (NPCSCB) and the Framework of Roles, Activities, and Competencies (FRAC).
- **Digital Personal Data Protection (DPDP) Act, 2023**: Complete separation of officer identity data from AI prompt payloads and public blockchain ledgers.
- **National Data Quality Assurance Framework (NDQAF)**: Embedded validation checks ensuring generated assessment items comply with MoSPI statistical metadata guidelines.
- **W3C Verifiable Credentials Data Model**: Standardized digital educational certificates with cryptographically verifiable issuer provenance.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend Framework | React 19, TypeScript, Vite |
| Backend Server | Node.js, Express, TypeScript |
| Database & Vectors | Supabase (PostgreSQL with `pgvector`) |
| Artificial Intelligence | Google Gemini (`gemini-3.8-flash`), `gemini-embedding-001` (3072D) |
| Blockchain Ledger | Polygon Amoy Testnet, Solidity (`MoSPICredentialRegistry.sol`) |
| Web3 Integration | Ethers.js v6, Hardhat |

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account with PostgreSQL and `pgvector`
- Polygon Amoy testnet RPC endpoint and private key with test MATIC

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bhavya-darjii/statcap.git
   cd statcap
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the project root:

```env
# Frontend Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api

# Backend Configuration
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key

# Blockchain Configuration
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
```

### Running the Application

```bash
# Start frontend and backend concurrently
npm run dev

# Deploy smart contracts to Polygon Amoy
npx hardhat run scripts/deploy.ts --network amoy

# Run TypeScript compilation checks
npm run type-check
```

The application will be accessible at `http://localhost:5173`.

---

## License

**Copyright © 2026 Bhavya Darji. All Rights Reserved.**

This project and its underlying source code are **confidential, private, and proprietary**. Unauthorized copying, modification, distribution, public display, or commercial use of this software, via any medium, is strictly prohibited without explicit prior written authorization from the copyright holder.

---

## Author & Contact

**Bhavya Darji**  
- **Portfolio:** [bhavya-darji.vercel.app](https://bhavya-darji.vercel.app/)  
- **GitHub:** [@bhavya-darjii](https://github.com/bhavya-darjii)  
- **LinkedIn:** [Bhavya Darji](https://www.linkedin.com/in/bhavya-darji-181573242/)  
- **Email:** [bhavyadarji462@gmail.com](mailto:bhavyadarji462@gmail.com)

---

<p align="center">Made with ❤️ by <a href="https://bhavya-darji.vercel.app/" target="_blank" rel="noopener noreferrer"><strong>Bhavya Darji</strong></a></p>
