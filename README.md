# Authorize Once, Then Stop Asking

A Next.js 14 application demonstrating privacy-preserving wallet authorization for recurring contributions. Built for Road to Devcon III - Problem 3.

## What This App Does

This app implements a savings circle where members authorize their wallet **once** to enable automatic weekly contributions. After authorization, the app can move funds on the member's behalf without repeated prompts.

## What the Granted Access Can and Cannot Do

### CAN:
- Withdraw up to **0.01 ETH** per transaction to the savings circle contract
- Execute contributions only on **Base Sepolia** and **Base** networks
- Access expires automatically on **2026-12-31**

### CANNOT:
- Transfer funds to any address other than the savings circle contract
- Withdraw more than 0.01 ETH in a single transaction
- Access your wallet after the expiry date
- Transfer any tokens other than ETH

## Where Limits Are Enforced

1. **Policy File** (`lib/policy.ts`): Defines the allowed contracts, max amounts, networks, and expiry
2. **Server Validation** (`app/api/contribute/route.ts`, `app/api/cron/contribute/route.ts`): Validates all wallet operations against the policy before execution
3. **Client-side** (`app/circle/join/page.tsx`): Displays policy details to the user during the authorization flow

## How Authorization Ends

1. **Expiry**: Authorization automatically expires on 2026-12-31
2. **Revocation**: Users can revoke access from their circle dashboard UI at any time
3. **Policy Changes**: If the policy is updated, existing authorizations may be invalidated

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_PRIVY_APP_ID`: Your Privy app ID
- `PRIVY_APP_SECRET`: Your Privy app secret
- `AUTHORIZATION_KEY`: Server-side authorization key for API routes
- `DATABASE_URL`: Path to SQLite database
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Savings circle contract address (deploy with `npm run compile` then `npm run deploy`)
- `NEXT_PUBLIC_ALLOWED_NETWORK`: Allowed network (base-sepolia)
- `CRON_SECRET`: Secret for cron endpoint authentication
- `PRIVATE_KEY`: Wallet private key for deployment
- `BASE_SEPOLIA_RPC_URL`: Base Sepolia RPC URL

## Deploying the Contract

1. Compile the contract:
```bash
npm run compile
```

2. Deploy to Base Sepolia:
```bash
npm run deploy
```

3. After deployment, update `.env.local` with the deployed contract address:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
contracts/
  SavingsCircle.sol    - On-chain savings circle contract
scripts/
  deploy.ts            - Hardhat deployment script
app/
  layout.tsx          - PrivyProvider wrapper
  page.tsx            - Landing/dashboard
  circle/
    page.tsx          - Circle overview
    join/
      page.tsx        - Join flow with authorization screen
    contribute/
      page.tsx        - Contribution status/history
  api/
    grant/
      route.ts        - Handle grant flow
    revoke/
      route.ts        - Revoke access
    contribute/
      route.ts        - Manual contribution trigger
    cron/
      contribute/
        route.ts      - CRON endpoint for weekly job
components/
  AuthorizationScreen.tsx
  MemberCard.tsx
  ContributionHistory.tsx
  RevokeButton.tsx
  Providers.tsx
lib/
  policy.ts           - Policy definition and validation
  privy-server.ts     - Server-side Privy config
  contributions.ts    - Contribution storage and idempotency
  contracts.ts        - Contract addresses and ABIs
```

## Key Features

### 1. Client Requests Wallet Access Through SDK Grant Flow
Users sign in with Privy and see a clear authorization screen explaining what they're permitting before calling `grantWalletAccess`.

### 2. Policy Allowlists the Contribution Contract
A committed policy restricts transactions to a specific contract address.

### 3. Policy Caps Value a Signer May Move
The policy expresses a ceiling on how much a single authorized request can move (max 0.01 ETH per contribution).

### 4. Grant Carries an Expiry
The grant or policy is time-bounded. Authorization lapses without member action on 2026-12-31.

### 5. Server Signs Wallet Requests with Authorization Key
Backend wallet requests are signed with an authorization key read from environment at runtime.

### 6. Recurring Job Refuses Second Contribution for Same Period
Re-running the job for an already-settled period does NOT produce a second contribution. Uses period tracking.

### 7. User-Reachable Control Revokes Grant
A member can trigger revocation from the product's UI. Not just a script or admin action.

### 8. Revoked/Expired Signer Resolves to Defined Outcome
Rejected wallet calls are caught and turned into a recorded/reported outcome. The run continues.

### 9. No Credentials in Tracked Files
All secrets in env vars. `.env` is gitignored.

## Security

- Server verifies all wallet operations
- Authorization key from env var
- No double contributions via idempotency
- Graceful error handling

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- @privy-io/react-auth
- @privy-io/server-auth
- Privy policy engine
- viem
- Base Sepolia testnet
