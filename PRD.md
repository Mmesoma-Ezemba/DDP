# Decentralized Death Protocol (DDP) — Product Requirements Document

**Tagline:** *"Your legacy shouldn't die with your private key."*

**Document Type:** Product Requirements Document (PRD)  
**Version:** 1.0  
**Prepared by:** Miles (Founder / Product Lead)  
**Date:** November 2025

---

## 1. Executive Summary

### Overview

Decentralized Death Protocol (DDP) is a Web3 application that empowers users to securely pass on their digital assets, data, or messages to chosen beneficiaries after verified inactivity or death — without intermediaries.

Using thirdweb smart contracts, Supabase activity tracking, and encrypted file storage, DDP enables a trustless, automated "digital will" system. This bridges a growing gap in Web3: billions in crypto and NFTs are lost annually due to forgotten keys or deceased owners.

**DDP = Digital continuity, cryptographic inheritance, and peace of mind — on-chain.**

---

## 2. Problem Statement

- Over $4.7 billion in crypto assets have been lost permanently due to forgotten private keys or deceased owners.
- There's no decentralized mechanism for inheritance or posthumous data transfer in Web3.
- Centralized solutions (like exchanges) introduce trust issues, privacy loss, and regulatory friction.

### Key Pain Points
- Lack of trustless inheritance system.
- No way to automate "after-life" smart contract execution based on verified inactivity.
- Families and partners unable to access critical data or funds.

---

## 3. Product Vision

> "To ensure that no one's digital legacy vanishes with their private key."

DDP envisions a decentralized, cross-chain ecosystem that guarantees continuity of digital ownership beyond death — without compromising user sovereignty or privacy.

---

## 4. Goals & Non-Goals

### Goals ✅
- Build a decentralized web app that executes posthumous asset/data release.
- Enable encrypted storage of personal data or "digital wills."
- Detect verified inactivity and trigger automatic smart contract execution.
- Provide an elegant user interface that builds emotional trust and technical confidence.

### Non-Goals 🚫
- DDP does not provide legal estate documentation (e.g., recognized wills).
- DDP does not integrate with centralized banking or fiat systems (initially).
- DDP does not verify biological death — only digital inactivity.

---

## 5. User Personas

| Persona | Description | Needs | Pain Points |
|---------|-------------|-------|------------|
| **Crypto Native** (Age 25–40) | Active Web3 user holding digital assets and NFTs. | Secure, automated way to pass on assets. | Fear of asset loss after death or key mismanagement. |
| **Digital Creator** (Age 20–35) | Artist, musician, or writer storing encrypted works. | Wants to pass unfinished work or farewell letters. | No way to automate message delivery securely. |
| **Family Beneficiary** (Age 25–50) | Relative of deceased crypto owner. | Receives assets/messages automatically. | Locked out of loved one's crypto accounts. |

---

## 6. User Flow

### Primary Flow: "Creating a Digital Will"

1. User connects wallet via thirdweb SDK.
2. Creates profile on Supabase (wallet + metadata).
3. Uploads encrypted file/message to Supabase storage.
4. Chooses:
   - Beneficiary wallet address
   - Inactivity duration (e.g., 90 days)
5. Smart contract deployed on-chain:
   - Stores owner, beneficiary, unlock time, and status.
6. Supabase activity tracker monitors user wallet pings.
7. If inactivity > threshold, backend triggers `contract.release()` via thirdweb.
8. Beneficiary wallet receives assets or data unlock notification.

---

## 7. Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🧠 **Smart Vault Creation** | User creates encrypted vault linked to inactivity timer. | Core |
| ⏳ **Inactivity Detection** | Backend monitors user wallet activity via Supabase cron functions. | Core |
| 🔐 **On-Chain Inheritance** | thirdweb smart contract transfers ETH/NFTs after inactivity threshold. | Core |
| 📂 **Encrypted Data Storage** | AES-256 encryption for private messages/files. | Core |
| 🧾 **Simulation Mode** | Demo feature to simulate "death" event for hackathon demo. | Core |

---

## 8. Stretch Features

| Feature | Description |
|---------|-------------|
| 🪪 **Biometric/Email Activity Pings** | Allow heartbeat signals via mobile or email to reset inactivity. |
| 🧬 **AI Legacy Messages** | Generate emotional farewell messages using AI trained on user writing tone. |
| 🪙 **NFT Asset Transfer** | On-chain inheritance of NFTs or ERC-20 tokens via thirdweb. |
| 🔗 **Multi-Sig Confirmation** | 2-of-3 validators confirm death before vault unlock. |
| 🕊️ **Digital Legacy API** | Integrate DDP with other DApps or social platforms (e.g., Lens, Farcaster). |

---

## 9. Technical Architecture

### Overview
- **Frontend:** Next.js (TypeScript + Tailwind + thirdweb SDK)
- **Backend:** Supabase (PostgreSQL, Edge Functions, Cron Jobs)
- **Blockchain:** thirdweb (Ethereum / Polygon Smart Contracts)
- **Storage:** Supabase (encrypted) or IPFS for decentralized files

### Data Flow
\`\`\`
User → Frontend (Next.js + thirdweb SDK)
     → Supabase API (activity + storage)
         → Cron Function (checks last_active)
             → thirdweb Smart Contract (releaseVault)
                 → Asset transfer to beneficiary wallet
\`\`\`

---

## 10. Smart Contract Design (thirdweb SDK)

### Schema
```solidity
struct Vault {
  address owner;
  address beneficiary;
  uint256 unlockTime;
  bool executed;
}
