<!-- Security & Key Management Guide -->

# 🔐 Security & Key Management Guide

This document outlines security best practices and where to store sensitive keys for this Omega Lottery DApp.

## ⚠️ CRITICAL SECURITY ISSUES

### 1. Compromised Private Key
Your deployer private key has been exposed in version control:
```
0xfa8c2bc03a4dfbb1d72d26d256fee30ceab3065b129ab6c61f3f96b8620b6386
```

**ACTION REQUIRED:**
- [ ] Generate a **new account** immediately: `cd packages/hardhat && yarn account:generate`
- [ ] Deploy all contracts with the new account
- [ ] Move all assets to the new account on live networks
- [ ] Revoke access from the old account in all systems

### 2. Public API Keys in Repository
The following API keys have been committed to git history:
- Alchemy: `cR4WnXePioePZ5fFrnSiR`
- Etherscan: `DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW`

While these are shared demo keys with rate limits, they should be rotated in production.

---

## 📁 Environment Variable Structure

### Hardhat Package (`packages/hardhat/.env.local`)

```bash
# ─────────────────────────────────────────────────────
# DEPLOYER CREDENTIALS
# ─────────────────────────────────────────────────────
DEPLOYER_PRIVATE_KEY=0x...  # NEW KEY - generate with: yarn account:generate

# ─────────────────────────────────────────────────────
# API KEYS
# ─────────────────────────────────────────────────────
ETHERSCAN_V2_API_KEY=...             # From https://etherscan.io/apis
ALCHEMY_API_KEY=...                  # From https://dashboard.alchemyapi.io
COINMARKETCAP_API_KEY=...            # From https://coinmarketcap.com/api (optional)

# ─────────────────────────────────────────────────────
# CHAINLINK VRF (Sepolia Testnet)
# ─────────────────────────────────────────────────────
SUBSCRIPTION_ID=...                  # From https://vrf.chain.link/sepolia
VRF_COORDINATOR=0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
KEY_HASH=0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae

# ─────────────────────────────────────────────────────
# CONTRACT DEPLOYMENT
# ─────────────────────────────────────────────────────
TREASURY_ADDRESS=0x...               # Where fees are sent

# ─────────────────────────────────────────────────────
# OPTIONS
# ─────────────────────────────────────────────────────
REPORT_GAS=false                      # Set to true to see gas reports
```

### Next.js Package (`packages/nextjs/.env.local`)

```bash
# ─────────────────────────────────────────────────────
# PUBLIC API KEYS (Safe to expose)
# ─────────────────────────────────────────────────────
NEXT_PUBLIC_ALCHEMY_API_KEY=...      # Use rate-limited public key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...

# ─────────────────────────────────────────────────────
# SMART CONTRACT ADDRESSES
# ─────────────────────────────────────────────────────
NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_TREASURY_ADDRESS=0x...

# ─────────────────────────────────────────────────────
# APP CONFIG
# ─────────────────────────────────────────────────────
NODE_ENV=development
DEBUG=false
```

---

## 🔑 How to Get Each Key

### Alchemy API Key
1. Go to https://dashboard.alchemyapi.io
2. Click "Create App" → Choose "Ethereum" → Select "Sepolia" for testnet
3. Copy the API Key
4. **For Production:** Create separate keys for frontend (with rate limits) and backend

### Etherscan API Key
1. Go to https://etherscan.io/apis
2. Sign up / Log in
3. Click "Create new API key"
4. Copy the API Key
5. **Keep this private** - used only for verification in deployments

### Chainlink VRF Subscription
1. Go to https://vrf.chain.link/sepolia
2. Connect your wallet
3. Click "Create Subscription"
4. Copy the Subscription ID
5. Fund the subscription with testnet ETH/LINK
6. Add your contract as a consumer

### Reown (WalletConnect) Project ID
1. Go to https://cloud.reown.com (WalletConnect was rebranded to Reown)
2. Sign up / Log in
3. Create a new project
4. Copy the Project ID
5. Add your domain to the allowlist

---

## 🚀 Deployment Strategy

### Local Development
```bash
cd packages/hardhat

# Set up your account
yarn account:generate        # Creates new encrypted account
# Or import existing:
yarn account:import         # Prompts for private key

# Copy template
cp ../../.env.example .env.local

# Edit with your values
nano .env.local

# Deploy
yarn deploy
```

### Staging (Sepolia Testnet)
```bash
# 1. Update .env.local with:
#    - Your new DEPLOYER_PRIVATE_KEY
#    - SUBSCRIPTION_ID from VRF
#    - TREASURY_ADDRESS

# 2. Deploy
yarn deploy --network sepolia

# 3. Verify
npx hardhat verify <contract-address> <constructor-args> --network sepolia
```

### Production (Mainnet)
```bash
# 1. Use Hardhat's encrypted keystore (NOT .env)
yarn account:import

# 2. Set environment variables on your CI/CD platform:
#    - DO NOT use .env file
#    - Use platform's secrets manager (GitHub Secrets, Vercel Env Vars, etc.)

# 3. Deploy with extra caution
yarn deploy --network mainnet

# ⚠️ Consider using a multi-sig wallet for treasury address
```

---

## 🏢 Hosting Deployment (Vercel/AWS)

### Vercel Environment Variables
1. Go to Project Settings → Environment Variables
2. Add these environment variables:

**Development:**
```
NEXT_PUBLIC_ALCHEMY_API_KEY = <your-alchemy-key>
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = <your-wallet-connect-id>
NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS = <testnet-address>
```

**Production:**
```
NEXT_PUBLIC_ALCHEMY_API_KEY = <your-rate-limited-public-key>
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = <your-wallet-connect-id>
NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS = <mainnet-address>
```

### GitHub Actions Secrets
For automated deployments:
```
DEPLOYER_PRIVATE_KEY          # Only for testnet/staging
ETHERSCAN_V2_API_KEY         # For verification
ALCHEMY_API_KEY              # For test deployments
```

---

## 🛡️ Security Best Practices

### ✅ DO
- ✅ Use different keys for each environment (local, testnet, mainnet)
- ✅ Use encrypted keystores for production keys (`keystore/` folder)
- ✅ Store secrets in platform dashboards (Vercel, AWS Secrets Manager)
- ✅ Use rate-limited API keys for public frontends
- ✅ Rotate keys regularly
- ✅ Use multi-sig wallets for treasury in production
- ✅ Log all deployments for audit trails
- ✅ Keep `.env.local` in `.gitignore` (already configured)

### ❌ DON'T
- ❌ Commit `.env.local` or any `*.key` files to git
- ❌ Use the same private key for development and production
- ❌ Share API keys in messages, screenshots, or documentation
- ❌ Hardcode contract addresses (use environment variables)
- ❌ Use default/demo API keys in production
- ❌ Store private keys in client-side code
- ❌ Expose `.env` files in Docker builds
- ❌ Log or print private keys

---

## 🔍 Audit Checklist

- [ ] Generate new deployer account (old key is compromised)
- [ ] Create `.env.local` in both hardhat and nextjs packages
- [ ] Get API keys from Alchemy, Etherscan, WalletConnect
- [ ] Set up Chainlink VRF subscription
- [ ] Test deployment on sepolia testnet
- [ ] Verify contract on etherscan (npx hardhat verify)
- [ ] Test frontend with deployed contract address
- [ ] Set up environment variables on hosting platform
- [ ] Configure rate limiting on public API keys
- [ ] Set up treasury multi-sig wallet for mainnet
- [ ] Document all deployment parameters
- [ ] Conduct security review before mainnet deployment

---

## 📞 Troubleshooting

### Private key not found
```
Error: deployerPrivateKey is required
```
**Solution:** Ensure `DEPLOYER_PRIVATE_KEY` is set in `.env.local`

### "Invalid API Key" on RPC calls
```
Error: rate limit exceeded
```
**Solution:** Use your own Alchemy key or upgrade your API tier

### Contract deployment fails with permission error
```
Error: source account unauthorized
```
**Solution:** Ensure deployer account has enough ETH for gas

### Etherscan verification fails
```
Error: Invalid constructor arguments
```
**Solution:** Verify you're passing constructor args in same order as contract

---

## 🔗 Useful Links

- **Chainlink VRF:** https://vrf.chain.link/
- **Alchemy Dashboard:** https://dashboard.alchemyapi.io
- **Etherscan API:** https://etherscan.io/apis
- **Reown (WalletConnect):** https://cloud.reown.com/
- **Hardhat Docs:** https://hardhat.org/hardhat-runner/docs/getting-started
- **Wagmi Docs:** https://wagmi.sh/
- **Rainbow Kit:** https://www.rainbowkit.com/

---

**Last Updated:** April 1, 2026
