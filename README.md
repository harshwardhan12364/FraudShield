# FraudShield 360 🛡️
### AI-Assisted Fraud Intelligence & MST Blockchain Evidence Verification Platform
**Built for the MST Blockchain Buildathon**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.111-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Solidity](https://img.shields.io/badge/Blockchain-Solidity_0.8.24-363636.svg?logo=solidity&logoColor=white)](https://soliditylang.org)
[![Security](https://img.shields.io/badge/Security-Zero--Trust_SHA--256-10B981.svg)](https://csrc.nist.gov)

---

## 📌 Executive Summary

**FraudShield 360** is an enterprise-grade cybercrime intelligence and digital evidence platform designed to address the escalating crisis of digital financial fraud (UPI scams, Part-Time job extortion, electricity disconnection phishes, and crypto rugpulls).

By pairing **real-time AI Risk Heuristics** with **immutable MST Blockchain Evidence Anchoring**, FraudShield 360 provides:
1. **Citizen Fraud Reporting**: Streamlined multi-step intake with client-side SHA-256 fingerprinting.
2. **AI Threat Scoring Engine**: Multi-vector NLP and rule-based heuristics that analyze coercion language, payment patterns, and suspect artifacts.
3. **Syndicate Correlation Graph**: In-memory entity graph identifying shared mule UPI VPAs, VOIP phone numbers, and bank accounts across disparate victim reports.
4. **Court-Admissible Evidence Ledger**: Zero-Knowledge SHA-256 evidence anchoring to Solidity smart contracts (`FraudShieldRegistry.sol`) on MST Blockchain for tamper-evident chain of custody compliant with Indian Evidence Act Section 65B.
5. **Role-Based Access Control (RBAC)**: Strict segregation between citizen reporters, cyber cell investigators, and platform administrators.

---

## 🏛️ System Architecture & Trust Boundary

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              TRUST BOUNDARY ARCHITECTURE                           │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  [ CITIZEN & INVESTIGATOR BROWSER ]                                               │
│   │                                                                               │
│   ├── Client-Side SHA-256 Hashing (Raw file never leaves user browser unhashed)   │
│   ├── React 19 + TypeScript + Vite + Tailwind CSS Dark Fintech Design System      │
│   └── Recharts Interactive Threat Trends & SVG Syndicate Correlation Graph       │
│                                                                                   │
│                             ▲ HTTPS / Secure HttpOnly Cookies                     │
│                             ▼ TLS 1.3 / Strict CORS & CSRF Defense                │
│                                                                                   │
│  [ SECURE API GATEWAY - FastAPI (Python 3.11+) ]                                 │
│   │                                                                               │
│   ├── Argon2id Password Hashing & JWT Session Token Generation                   │
│   ├── Role-Based Access Control (Reporter / Analyst / Admin)                     │
│   ├── Pydantic Input Sanitation & Rate Limiting                                  │
│   ├── File Type Validation (PNG, JPG, PDF) & Server-Side Dual-Hash Audit          │
│   │                                                                               │
│   ├── [ AI FRAUD RISK ENGINE ] ──────► [ ENTITY CORRELATION GRAPH ]              │
│   │   - NLP urgency keyword analysis      - NetworkX bipartite graph              │
│   │   - Phishing URL typosquatting        - Mule VPA & phone clustering          │
│   │   - Loss threshold evaluation         - Section 91 CrPC notice generator     │
│   │                                                                               │
│   └── [ AUDIT TRAIL SERVICE ]                                                    │
│       - SHA-256 Backwards-Linked Hash Chain (Tamper-evident system log)          │
│                                                                                   │
│                             ▲ Web3.py RPC Bridge                                  │
│                             ▼ JSON-RPC                                            │
│                                                                                   │
│  [ MST BLOCKCHAIN SMART CONTRACT LEDGER ]                                         │
│   │                                                                               │
│   ├── FraudShieldRegistry.sol (Solidity 0.8.24)                                  │
│   │   - OpenZeppelin AccessControl (REGISTRAR_ROLE, REVIEWER_ROLE)               │
│   │   - Proof of Existence: SHA-256 Hash + Block Timestamp + Registrar Signature  │
│   │   - Zero PII: Zero victim names, phone numbers, or account details on-chain   │
│   │   - Non-Repudiation Court Evidence Verification Guarantee                     │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **npm**: v9.0.0 or higher

### 1. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:5173`.

### 2. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API interactive Swagger docs available at `http://localhost:8000/docs`.

### 3. Blockchain Setup (Hardhat Local / MST Testnet)
```powershell
cd blockchain
npm install
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

---

## 👥 Demo Credentials & RBAC Roles

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@fraudshield.io` | `Admin@123456` | Full system access, RBAC management, System settings |
| **Analyst** | `analyst@fraudshield.io` | `Analyst@123456` | Risk screening, Case adjudication, Graph investigation, Audit log |
| **Reporter** | `reporter@fraudshield.io` | `Reporter@123456` | File fraud incident reports, Upload evidence, Verify status |

*Tip: The Login page includes one-click quick-fill buttons for instant review.*

---

## 🌟 Key Application Features

### 1. Executive Intelligence Dashboard (`/dashboard`)
- Real-time financial loss prevention counter and threat inflow metrics.
- Recharts 7-day incident trend area charts and scam typology breakdown.
- Live investigation feed with direct deep-links to case details.
- Real-time MST Blockchain node and smart contract status indicator.

### 2. Multi-Step Fraud Reporting Intake (`/reports/new`)
- Step 1: Incident narrative, category, date, and estimated financial loss.
- Step 2: Suspect identifiers (WhatsApp/phone, UPI VPA, Mule bank account, IFSC, phishing domain, crypto wallet).
- Step 3: Client-side SHA-256 computation + optional automatic MST Blockchain anchoring.

### 3. Deep Case Inspection & Evidence Verification (`/reports/:id`)
- Visual AI Risk Index gauge (0-100) with triggered heuristic rules.
- On-chain cryptographic SHA-256 hash lookup directly validating smart contract state.
- Analyst adjudication panel (Substantiate, Under Investigation, Reject, Escalate).
- Immutable case timeline showing all lifecycle state transitions.

### 4. Interactive AI Risk Screener (`/analysis`)
- Instant playground to test suspicious SMS, WhatsApp transcripts, URLs, and VPAs.
- Instant feedback with threat categorization, rule triggers, and analyst guidance.
- Pre-loaded with 4 real-world threat templates (Task scam, Electricity bill phish, Customs extortion, Crypto rugpull).

### 5. Syndicate Correlation Graph (`/graph`)
- Canvas/SVG entity network visualizing connections between reports and suspects.
- Discovers when multiple independent victims send money to the same mule VPA or receive calls from the same virtual number.
- Inspection drawer displaying enforcement recommendations (Section 91 CrPC freeze requests).

### 6. MST Blockchain Ledger Explorer (`/blockchain`)
- Transparent block explorer showing recent evidence anchoring transactions.
- Live interactive hash verification query against `FraudShieldRegistry.sol`.
- Block height, gas usage, and timestamp confirmation.

### 7. Immutable Cryptographic Audit Log (`/audit`)
- Backwards-linked SHA-256 hash chain recording every actor login, report submission, and status change.
- "Verify Hash Chain Integrity" button proving absence of retrospective tampering.

### 8. Security & Trust Boundary Hub (`/security`)
- Visual architecture breakdown explaining Zero-Knowledge design, Section 65B Indian Evidence Act admissibility, and Argon2id cryptographic safeguards.

---

## 🔒 Cryptographic & Legal Compliance

1. **Zero-Knowledge Privacy Standard**:
   - Only `bytes32 evidenceHash = sha256(evidenceBytes)` is anchored to the public ledger.
   - Zero victim names, phone numbers, or bank account numbers are ever exposed on-chain.
2. **Indian Evidence Act Section 65B Admissibility**:
   - Timestamped blockchain commitments prove digital artifacts existed in an unaltered state at a precise block time.
3. **Argon2id Password Defense**:
   - State-of-the-art memory-hard hashing protects against offline GPU cracking.
4. **Non-Repudiation**:
   - The registrar's cryptographic signature commits the record to the contract, preventing repudiation by submitting parties.

---

## 📂 Repository Structure

```
firesheld/
├── backend/
│   ├── app/
│   │   ├── analysis/       # AI Risk rules engine & NLP heuristics
│   │   ├── api/            # API endpoints & dependency injection
│   │   │   └── routes/     # auth, reports, evidence, investigations, admin
│   │   ├── core/           # Security, config, JWT tokens, Argon2id
│   │   ├── db/             # SQLAlchemy session & SQLite/Postgres engine
│   │   ├── models/         # User, Report, Evidence, AuditEvent, Dispute
│   │   ├── schemas/        # Pydantic validation models
│   │   ├── services/       # Blockchain Web3 signer & file storage
│   │   └── main.py         # FastAPI application entry & middleware
│   ├── requirements.txt
│   └── tests/              # Pytest test suite
├── blockchain/
│   ├── contracts/          # FraudShieldRegistry.sol (OpenZeppelin)
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Solidity & Hardhat test cases
│   └── hardhat.config.ts   # EVM network configurations
├── docs/                   # Technical architecture & contract specifications
└── frontend/
    ├── src/
    │   ├── api/            # Axios API client & typed endpoints
    │   ├── components/     # Layout, Sidebar, Header, Status Badges
    │   ├── context/        # AuthContext & RBAC hooks
    │   ├── pages/          # 13 Complete Application Pages
    │   ├── utils/          # Helpers, formatters, and class utilities
    │   ├── App.tsx         # React Router v7 configuration
    │   ├── index.css       # Tailwind CSS & Dark Navy Fintech Design System
    │   └── main.tsx        # React 19 DOM entry point
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## 🏆 MST Blockchain Buildathon Submission Highlights

- **Working Full-Stack**: Functional frontend, backend, database models, smart contract, and AI heuristics.
- **Tailored for MST Blockchain**: Purpose-built `FraudShieldRegistry.sol` contract utilizing EVM compatibility to provide court-admissible evidence non-repudiation.
- **Production-Ready Visual Aesthetics**: Dark navy/teal fintech UI with smooth animations, custom glowing accents, interactive Recharts visualizations, and accessible responsive layouts.
- **Solves a Critical Real-World Challenge**: Accelerates financial fraud investigation by days, helping victims and law enforcement freeze illicit funds before withdrawal.

---
*Developed with excellence for the MST Blockchain Buildathon 2026.*
