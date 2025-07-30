# 🧾 Asset Manager DApp

**Asset Manager** is a decentralized web application that allows users to deposit RGT tokens, receive corresponding "assets", and earn daily reward tokens (RWT) based on their holdings. It demonstrates a clean user flow from token approval to reward claiming, with an intuitive interface and well-documented smart contract logic.

---

## 🌍 Live Preview

- 🔗 Frontend: [https://asset-manager-gamma.vercel.app/](https://asset-manager-gamma.vercel.app/)
- 📁 GitHub Repo: [https://github.com/nanasark/asset-manager](https://github.com/nanasark/asset-manager)

---

## 🧠 Core Features

- ✅ **Deposit RGT tokens** (multiples of 10)
- 📈 **Convert tokens to assets** (10 tokens = 1 asset)
- ⏳ **Accrue daily rewards**: 0.1 RWT per asset per 24h
- 🔐 **Allowance check** before deposit
- 🎁 **Claim rewards** every 24 hours
- 📊 **View user status**: assets, claimable rewards, and countdown

---

## 🧱 Smart Contract Overview

### `deposit(uint256 tokenAmount, address assetholder)`
- Requires deposit in **multiples of 10** RGT tokens.
- Transfers tokens to contract and creates internal “assets”.
- Designed to ensure clean tracking of deposits and avoid fractional asset values.

### `claimReward()`
- Calculates pending rewards for the caller.
- Requires a full 24h cycle since the last claim.
- Transfers accumulated RWT and resets the claimable balance.

### `pendingRewards(address holder)`
- Pure view function to calculate how much reward is pending based on the number of full 24h cycles since last reward time.
- Returns 0 if user claimed recently or hasn’t waited 24h yet.

---

## 💭 Reasoning Behind Implementation

This system mimics the mechanics of a rewards platform where users gain utility by committing tokens over time. The design promotes:

- **Simple conversion** logic (10 RGT = 1 asset) to avoid decimals.
- **Time-gated rewards** to simulate a realistic yield farming model.
- **Gas-efficient reward claims** by checking eligibility only after full-day cycles.
- **Modular structure**: reward logic is separated for reusability and extensibility.
- **UX enhancement**: Read-only functions (`pendingRewards`) support frontends in delivering live status updates without extra costs.

---

## 🖥️ Frontend Stack

- 🧩 **Next.js 14**
- 🎨 **Tailwind CSS**
- 🔌 **wagmi** + **viem** for blockchain reads/writes
- 🔐 Wallet integration via MetaMask and any other injected browser wallet

---

## ⚙️ Running Locally

```bash
git clone https://github.com/nanasark/asset-manager
cd asset-manager
cd frontend
npm install
npm run dev

---
## ⚙️ Testing Contract

```bash
git clone https://github.com/nanasark/asset-manager
cd asset-manager
cd blockchain
npm install
npx hardhat test


