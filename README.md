# Decentralized Death Protocol (DDP)

> *"Your legacy shouldn't die with your private key."*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![thirdweb SDK](https://img.shields.io/badge/thirdweb-SDK-1A5AFF?style=for-the-badge&logo=thirdweb)](https://thirdweb.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Edge%20Functions-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

## Table of Contents
- [Executive Summary](#executive-summary)
- [Platform Capabilities](#platform-capabilities)
- [User Journeys](#user-journeys)
- [Architecture Overview](#architecture-overview)
- [Codebase Structure](#codebase-structure)
- [Setup & Local Development](#setup--local-development)
- [Environment Configuration](#environment-configuration)
- [Deployment & Environments](#deployment--environments)
- [Security & Compliance](#security--compliance)
- [Testing & Quality](#testing--quality)
- [Operational Considerations](#operational-considerations)
- [Roadmap](#roadmap)
- [Documentation & Resources](#documentation--resources)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Executive Summary
Decentralized Death Protocol (DDP) is an enterprise-grade Web3 platform that orchestrates cryptographic inheritance. The product enables users to secure assets, encrypted content, and final messages inside programmable vaults that unlock after verifiable inactivity. DDP fuses a polished multi-surface UX with thirdweb-managed smart contracts and Supabase-powered activity intelligence, providing a trust-minimized alternative to centralized estate services.

**DDP = Digital continuity, cryptographic inheritance, and peace of mind — on-chain.**

## Platform Capabilities

| Capability | Description | Delivery |
| --- | --- | --- |
| Vault Orchestration | Configurable vaults with owner/beneficiary metadata, inactivity timers, and simulated unlock flows. | UI complete, contract integration planned |
| Beneficiary Management | Dedicated surfaces for onboarding and managing beneficiary recipients with animated identity cards. | Implemented (mock data) |
| Activity Intelligence | Timeline, alerts, and heartbeat monitoring concepts backed by Supabase cron functions. | UI implemented, backend in progress |
| Communication Layer | Secure chat-inspired interface for legacy messaging and beneficiary updates. | Implemented (frontend) |
| Governance & Settings | Profile, security status, and settings surfaces to configure account posture. | Implemented |
| Simulation Mode | Demo workflow that emulates inactivity-triggered releases for product walkthroughs. | Implemented (UI) |

## User Journeys

| Flow | Purpose | Status | Key Surfaces |
| --- | --- | --- | --- |
| Digital Will Creation | Establish a vault, set inactivity thresholds, identify beneficiaries. | Prototype ready | `app/page.tsx`, `app/vaults/page.tsx` |
| Beneficiary Oversight | Track relationship health, review access status, update instructions. | Prototype ready | `app/beneficiary/page.tsx`, `components/beneficiaries/*` |
| Activity Operations | Monitor events, heartbeat signals, and audit trails for vault release. | Prototype ready | `app/activity/page.tsx`, `components/activity/*` |
| Resilience Simulation | Demonstrate unlock scenarios for stakeholders pre-launch. | Prototype ready | `app/demo/page.tsx` |

## Architecture Overview

### High-Level Flow

```
Wallet Owner ─┐
              │
              ▼
        Next.js (App Router) ── thirdweb Client & Hooks ──┐
              │                                          │
              ▼                                          ▼
     Supabase Edge Functions & REST APIs          Celo Networks (Mainnet & Sepolia)
              │                                          │
              ▼                                          ▼
      Encrypted Storage / Future IPFS          Vault Smart Contracts (planned)
              │
              ▼
        Beneficiary Notifications & UI Surfaces
```

### Frontend Experience
- Next.js 14 App Router with server/CSR hybrid rendering.
- Tailwind CSS 4.1 + custom design system in `components/ui`.
- Framer Motion animations and Radix UI primitives for enterprise polish.
- Zustand + custom hooks for chat, auth, and device-aware experiences.

### Web3 Infrastructure
- thirdweb SDK for wallet connection, network switching, and contract invocation via `lib/thirdweb-provider.tsx`.
- Celo Mainnet and Celo Sepolia Testnet support, preconfigured chain metadata and RPC strategy.
- Planned vault contract defined in `lib/contracts/vault-contract.ts` (placeholder) with `releaseVault` orchestration entry point.

### Off-Chain Services
- Supabase PostgreSQL for profile and activity metadata (`lib/supabase/*`).
- Edge Functions & Cron jobs to evaluate inactivity thresholds and trigger contract calls (planned).
- Supabase Storage / future IPFS for encrypted artefacts referenced by vaults.

## Codebase Structure

```text
app/                        # Next.js routes (dashboard, vaults, beneficiaries, auth, etc.)
components/
  activity/                 # Timeline, heartbeats, operational widgets
  auth/                     # Animated onboarding, login/signup experiences
  beneficiaries/            # Cards, avatars, add-beneficiary flows
  chat/                     # Conversation UI & state utilities
  dashboard/                # Layout, cards, charts, security status
  dialogs/                  # Interactive modals for confirmations & walkthroughs
  ui/                       # Reusable design system primitives (Radix composition)
data/                       # Mock data powering UI prototypes
docs/                       # Platform runbooks (Web3, auth, deployment)
hooks/                      # Custom React hooks (auth, geolocation, responsive)
lib/
  auth/                     # Wallet auth client/server utilities
  supabase/                 # Supabase client factories
  thirdweb-provider.tsx     # Thirdweb client configuration & context
  utils.ts                  # Cross-cutting helpers
styles/                     # Global stylesheets
types/                      # Shared TypeScript definitions for activity, vaults, etc.
```

## Setup & Local Development

### Prerequisites
- Node.js 18+
- `pnpm` (preferred) or `npm`
- thirdweb account for Client ID
- Supabase project for auth/activity experiments

### Install & Run

```bash
git clone <repository-url>
cd Decentralized-Death-Protocol
pnpm install       # npm install works as well
# create .env.local and populate secrets (see Environment Configuration)
pnpm dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to access the dashboard experience.

### Linting & Builds
- `pnpm lint` – Static analysis (ESLint)
- `pnpm build` – Production build (Next.js)
- `pnpm start` – Launch built application

## Environment Configuration

Configure the following variables in `.env.local` (development) and in your deployment platform:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | ✅ | thirdweb client identifier used by the SDK (`lib/thirdweb-provider.tsx`). |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL for REST + Edge functions. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key for browser access. |
| `NEXT_PUBLIC_ENCRYPTION_KEY` | ✅ | Base64 32-byte key for AES-256-GCM vault payload encryption. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `ENCRYPTION_KEY` | ⚙️ (optional) | Server-side encryption key for enhanced security (not exposed to browser). |

Additional guidance for production secrets is documented in `docs/vercel-env-setup.md`. For detailed encryption setup, see `docs/vault-encryption-setup.md`.

## Deployment & Environments

- **Hosting**: Optimized for deployment on Vercel (Next.js native). Static assets served from `public/`.
- **Web3 Connectivity**: Ensure wallet allowlists include your deployment origin. thirdweb automatically configures RPC routing via supplied Client ID.
- **Supabase Integration**: Provision `profiles` table and relevant indexes as outlined in `docs/authentication-setup.md`. Configure Edge Functions for heartbeat ingestion and cron schedules.
- **Environment Parity**: Maintain dedicated thirdweb projects and Supabase instances for `development`, `staging`, and `production` to preserve data lineage.

## Vault Encryption

DDP implements **AES-256-GCM authenticated encryption** for vault payloads containing sensitive messages, files, and personal data:

- **Algorithm**: AES-256-GCM (Galois/Counter Mode) with 32-byte keys
- **Key Format**: Base64-encoded for easy environment variable storage
- **Integrity**: SHA-256 payload hashing + GCM authentication tags
- **Cross-Platform**: Works in both browser (Web Crypto API) and Node.js
- **Future-Ready**: Version field supports key rotation strategies

**Quick Setup:**
```bash
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env.local
echo "NEXT_PUBLIC_ENCRYPTION_KEY=your-generated-key" >> .env.local
```

**Usage Example:**
```typescript
import { createEncryptedVault } from '@/lib/encryption/vault-encryption'

const vault = await createEncryptedVault(baseVault, {
  messages: [{ beneficiaryId: '1', content: 'Your message' }],
  notes: 'Private notes',
})
```

See `docs/vault-encryption-setup.md` for complete documentation, API reference, and security best practices.

## Security & Compliance
- Contracts require third-party audits before mainnet deployment; treat current artifacts as prototypes only.
- Wallet-auth flow uses nonce + signature verification (`lib/auth/wallet-auth-server.ts`); integrate JWT or session hardening prior to launch.
- Sensitive secrets must not be committed. Use environment-level secret stores (Vercel, HashiCorp Vault, etc.).
- Plan for regulatory review: DDP does **not** replace legal wills or provide fiduciary services; communicate clearly with end users.
- Pending enhancements: rate limiting on nonce routes, encryption key rotation, beneficiary KYC/AML workflows for enterprise adoption.

## Testing & Quality
- UI validated with mock data for rapid iteration; integrate Supabase test fixtures before end-to-end testing.
- Add contract unit tests (Hardhat/foundry) and Supabase integration tests to cover vault lifecycle logic.
- Recommended roadmap: Playwright smoke tests for critical user journeys, contract simulation harness for inactivity triggers.

## Operational Considerations
- **Monitoring**: Instrument thirdweb and Supabase API usage via provider dashboards; plan to forward logs to SIEM (e.g., Datadog) for enterprise observability.
- **Alerting**: Define SLA-driven alerts for heartbeat cron failures, contract transaction reverts, and stale beneficiary acknowledgements.
- **Backups**: Schedule Supabase backups and consider IPFS pinning redundancy for encrypted artefacts.
- **Incident Response**: Draft operational runbooks covering vault unlock disputes, multi-sig overrides, and chain reorg handling.

## Roadmap

| Phase | Focus | Highlights |
| --- | --- | --- |
| Alpha | Smart contract MVP | Deploy vault contract, integrate inactivity release, establish Supabase triggers. |
| Beta | Security hardening | End-to-end encryption, audit trail persistence, beneficiary claim workflows. |
| GA | Enterprise readiness | Multi-sig validators, compliance tooling, API for partner integrations, SLA-backed monitoring. |
| Beyond | Ecosystem expansion | Cross-chain support, AI-generated legacy messaging, Digital Legacy API for third-party dApps. |

## Documentation & Resources
- `PRD.md` – Strategic context, personas, and business requirements.
- `docs/thirdweb-integration.md` – Wallet connection, client configuration, and contract helpers.
- `docs/authentication-setup.md` – Wallet auth flow leveraging Supabase.
- `docs/celo-sepolia-testnet.md` – Network parameters and migration guidance.
- `docs/vercel-env-setup.md` – Environment variable playbook for Vercel deployments.

## Contributing
We welcome contributions across smart contracts, Supabase infrastructure, and UI polish. Please review the PRD and open a discussion issue before major architectural changes.

## License
[Add your license here]

## Contact
**Founder / Product Lead:** Miles  
For partnership inquiries or support, open an issue or reach out via the channels listed in the PRD.

---

**Version:** 0.2.0 (Platform Blueprint)  
**Last Updated:** November 2025
