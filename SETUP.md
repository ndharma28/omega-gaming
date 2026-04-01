# 🚀 Quick Setup for Environment Variables

Follow these steps to properly configure your environment and get the app running securely.

## Step 1: Review Compromised Keys Warning ⚠️

**Your hardhat/.env file contains a private key that has been exposed in git history.**

### Generate a New Private Key
```bash
cd packages/hardhat
yarn account:generate
```

This will create a new account and ask you to save it. Copy the private key shown.

## Step 2: Create Configuration Files

### Hardhat Configuration
```bash
# In packages/hardhat/
touch .env.local
```

Paste this template and fill in your values:
```
DEPLOYER_PRIVATE_KEY=0x<your-new-key-from-yarn-account:generate>
ETHERSCAN_V2_API_KEY=<get from https://etherscan.io/apis>
ALCHEMY_API_KEY=<get from https://dashboard.alchemyapi.io>
SUBSCRIPTION_ID=<get from https://vrf.chain.link/sepolia>
TREASURY_ADDRESS=0x<your-wallet-address>
REPORT_GAS=false
```

### Next.js Configuration
```bash
# In packages/nextjs/
touch .env.local
```

Paste this template:
```
NEXT_PUBLIC_ALCHEMY_API_KEY=<same as hardhat, can be different>
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<get from https://cloud.reown.com>
NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS=0x<will fill after deployment>
NEXT_PUBLIC_TREASURY_ADDRESS=0x<your-treasury-address>
NODE_ENV=development
DEBUG=false
```

## Step 3: Get Required API Keys

### 1. Alchemy API Key
- Go to https://dashboard.alchemyapi.io
- Click "Create App" 
- Choose "Ethereum" network and "Sepolia" testnet
- Copy the API Key
- Add to both `.env.local` files

### 2. Etherscan API Key (Optional, for contract verification)
- Go to https://etherscan.io/apis
- Sign up, create a new API key
- Add to `packages/hardhat/.env.local`

### 3. Chainlink VRF Subscription (Required for deployment)
- Go to https://vrf.chain.link/sepolia
- Connect wallet and fund with testnet ETH/LINK
- Create a subscription, copy the Subscription ID
- Add to `packages/hardhat/.env.local`

### 4. Reown (WalletConnect) Project ID (Optional, for multi-vendor wallet support)
- Go to https://cloud.reown.com (WalletConnect rebranded to Reown)
- Create a project, copy the Project ID
- Add to `packages/nextjs/.env.local`

## Step 4: Deploy Contract

```bash
cd packages/hardhat
yarn deploy --network sepolia
```

The output will show your deployed contract address.

## Step 5: Update Frontend

Copy the contract address from Step 4 and update:

```bash
# packages/nextjs/.env.local
NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS=0x<address-from-deployment>
```

## Step 6: Run Frontend

```bash
cd packages/nextjs
yarn dev
```

Open http://localhost:3000

---

## 📋 Environment Variables Reference

| Variable | Package | Required | Secret | Source |
|----------|---------|----------|--------|--------|
| `DEPLOYER_PRIVATE_KEY` | hardhat | Yes | ✅ | `yarn account:generate` |
| `ETHERSCAN_V2_API_KEY` | hardhat | No | ✅ | https://etherscan.io/apis |
| `ALCHEMY_API_KEY` | hardhat | Yes | ✅ | https://dashboard.alchemyapi.io |
| `SUBSCRIPTION_ID` | hardhat | Yes (deploy) | ✅ | https://vrf.chain.link/sepolia |
| `TREASURY_ADDRESS` | hardhat | Yes (deploy) | ❌ | Your wallet address |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | nextjs | Yes | ✅ | https://dashboard.alchemyapi.io |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | nextjs | No | ✅ | https://cloud.reown.com |
| `NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS` | nextjs | Yes | ❌ | From deployment |
| `NEXT_PUBLIC_TREASURY_ADDRESS` | nextjs | No | ❌ | Your wallet address |

## 🔒 Key Management Best Practices

✅ **DO:**
- Store `.env.local` files locally only (they're in .gitignore)
- Use different keys for testnet vs mainnet
- Rotate API keys periodically
- Use encrypted keystores in `keystore/` folder

❌ **DON'T:**
- Commit `.env.local` files
- Share API keys in messages or screenshots
- Use the same key for multiple environments
- Store keys in version control

## 📚 Additional Resources

- **Security Guide:** See [SECURITY.md](./SECURITY.md) for detailed security practices
- **Environment Examples:** See [.env.example](./.env.example) for all possible variables
- **Hardhat Docs:** https://hardhat.org/
- **Wagmi (Web3 React):** https://wagmi.sh/

---

**After completing these steps, your apps are ready to run securely!**
