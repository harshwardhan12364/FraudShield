# FraudShield 360 — Architecture & Security Specification

## 1. System Overview
FraudShield 360 is engineered as a zero-trust, cryptographically verified fraud intelligence architecture. It provides an end-to-end pipeline connecting victim reporting, automated threat scoring, cross-case entity correlation, and court-admissible blockchain evidence anchoring.

## 2. Cryptographic Security Standards

### 2.1 Password Hashing (Argon2id)
All user passwords are encrypted using **Argon2id** (RFC 9106), configured with memory-hard parameters to render GPU/ASIC rainbow table and dictionary attacks computationally infeasible:
- Memory Cost: 65,536 KiB (64 MiB)
- Time Cost: 3 iterations
- Parallelism: 4 threads

### 2.2 Client-Side SHA-256 Pre-Hashing
When a reporter uploads digital evidence (such as payment receipts, WhatsApp screenshots, or APK hashes):
1. The browser's native `window.crypto.subtle.digest('SHA-256', buffer)` computes the cryptographic digest directly on the client.
2. The user inspects the SHA-256 digest before transmission.
3. Upon backend receipt, the server independently recalculates the SHA-256 digest to enforce dual-verification integrity.

### 2.3 Immutable Backwards-Linked Audit Chain
System actions (logins, status modifications, adjudication decisions) are appended to an internal audit trail where each record contains:
$$\text{Hash}_i = \text{SHA256}(\text{Action}_i \,\|\, \text{Actor}_i \,\|\, \text{Timestamp}_i \,\|\, \text{Hash}_{i-1})$$
Any deletion or modification of an earlier record alters all subsequent hashes, immediately signaling tampering during automated verification.

## 3. Blockchain Evidence Anchoring (MST Blockchain)

### 3.1 Smart Contract: `FraudShieldRegistry.sol`
- Deployed on MST Blockchain / EVM testnet.
- Stores only:
  - `reportRef`: Unique string identifier (e.g. `REP-2026-081`)
  - `evidenceHash`: `bytes32` SHA-256 digest
  - `timestamp`: Block timestamp
  - `registrar`: Authorized signer address
- **Zero Knowledge of PII**: Names, phone numbers, UPI IDs, and financial figures are NEVER written to the blockchain.

### 3.2 Indian Evidence Act Section 65B Compliance
Under Indian law, electronic records require certification that the computer system was operating properly and that the data has not been altered. FraudShield 360's blockchain anchoring produces a verifiable timestamped Merkle receipt proving:
1. The digital artifact existed in its exact state at block height $H$.
2. The hash has not been replaced or backdated.

## 4. AI Fraud Risk Engine & Entity Correlation

### 4.1 Rule-Based Heuristics
- **Urgency NLP Vector**: Detects coercion terms ("arrest", "customs", "immediate power disconnect", "24 hours to pay").
- **Mule Naming Conventions**: Recognizes common mule VPA patterns (`*task*`, `*bonus*`, `*verify*`, `*quickpay*`).
- **Domain Typo-Squatting**: Flags unofficial TLDs (`.xyz`, `.apk`, `.top`) posing as official utility or banking services.

### 4.2 Cross-Case Entity Resolution Graph
Constructs a bipartite graph $G = (V_{\text{reports}} \cup V_{\text{entities}}, E)$ where edges connect reports sharing phone numbers, UPI IDs, bank accounts, or crypto addresses. Connected components exceeding a cardinality threshold trigger automated syndicate alerts for law enforcement escalation.
