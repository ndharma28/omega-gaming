# 🔐 Security Quick Reference Card

Print this out or keep it open while developing!

## 🚨 Emergency Procedures

### If you accidentally commit a secret:
```bash
# 1. Rotate the compromised key immediately
# 2. Force-clean git history (if not pushed)
git reset --soft HEAD~1      # Undo last commit
git reset HEAD <file>        # Unstage file
# 3. Add to .gitignore
# 4. Commit again

# If already pushed, use BFG Repo Cleaner:
# https://rtyley.github.io/bfg-repo-cleaner/
```

### If someone has your API key:
```bash
# 1. Go to the provider's dashboard immediately
# 2. Delete/rotate the compromised key
# 3. Generate a new one
# 4. Update .env.local
# 5. Redeploy if on production
```

---

## 📝 Common Tasks

### Generate New Account
```bash
cd packages/hardhat
yarn account:generate
# Save the private key to DEPLOYER_PRIVATE_KEY in .env.local
```

### Deploy to Sepolia Testnet
```bash
cd packages/hardhat
# 1. Ensure .env.local is filled in
# 2. Deploy
yarn deploy --network sepolia
# 3. Copy address to frontend .env.local
```

### Get New API Keys

| Provider | URL | Steps |
|----------|-----|-------|
| **Alchemy** | https://dashboard.alchemyapi.io | Create App → Sepolia → Copy Key |
| **Etherscan** | https://etherscan.io/apis | Sign in → Create Key → Copy |
| **Reown (WalletConnect)** | https://cloud.reown.com | Create Project → Copy ID |
| **Chainlink VRF** | https://vrf.chain.link/sepolia | Create Sub → Fund → Copy ID |

### Verify Contract
```bash
cd packages/hardhat
npx hardhat verify <address> <args> --network sepolia
```

### Check Gas Usage (Optional)
```bash
REPORT_GAS=true yarn test
```

---

## ✅ Pre-Deployment Checklist

- [ ] `.env.local` files created and filled
- [ ] New deployer account generated (not old compromised key)
- [ ] All required env vars set (check error messages)
- [ ] Testnet deployment successful
- [ ] Contract address added to frontend .env.local
- [ ] Frontend works with deployed contract
- [ ] Etherscan verification successful (if mainnet)
- [ ] Git history cleaned (old key removed)

---

## 🔑 Environment Variable Quick Map

### Hardhat Package
```
┌─────────────────────────────────┐
│ .env.local (NEVER COMMIT)      │
├─────────────────────────────────┤
│ ✅ DEPLOYER_PRIVATE_KEY        │ ← NEW KEY!
│ ✅ ETHERSCAN_V2_API_KEY        │ ← Optional
│ ✅ ALCHEMY_API_KEY             │ ← Required
│ ✅ SUBSCRIPTION_ID             │ ← From VRF
│ ✅ TREASURY_ADDRESS            │ ← Your wallet
│ ⚪ REPORT_GAS                  │ ← Optional
└─────────────────────────────────┘
        Referenced by
        hardhat.config.ts
```

### Frontend Package
```
┌──────────────────────────────────┐
│ .env.local (NEVER COMMIT)       │
├──────────────────────────────────┤
│ 🔓 NEXT_PUBLIC_ALCHEMY_API_KEY  │ ← Public (rate-limited)
│ 🔓 NEXT_PUBLIC_WALLET_CONNECT.. │ ← Public (rate-limited)
│ 🔓 NEXT_PUBLIC_LOTTERY_ADDRESS  │ ← Contract addr
│ 🔓 NEXT_PUBLIC_TREASURY_ADDRESS │ ← Display only
│ ⚪ NODE_ENV                     │ ← development
│ ⚪ DEBUG                        │ ← Optional
└──────────────────────────────────┘
        Referenced by
        scaffold.config.ts
        
Key: 🔓 = Public (safe exposed)
     ⚪ = Optional
```

---

## 🛑 What NOT to Do

```javascript
// ❌ DON'T: Hardcode secrets
const privateKey = "0x...abc123...";

// ❌ DON'T: Show secrets in console logs
console.log("Private key:", privateKey);

// ❌ DON'T: Commit .env files
git add .env  // NO!

// ❌ DON'T: Share API keys
"Check this key: sk_live_abc123"  // NO!

// ❌ DON'T: Use same key for everything
MAINNET_KEY = TESTNET_KEY  // NO!

// ❌ DON'T: Store in version control
// .env file in git history = COMPROMISED
```

---

## ✅ What to Do

```javascript
// ✅ DO: Use environment variables
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

// ✅ DO: Validate environment variables
if (!privateKey) throw new Error("Missing DEPLOYER_PRIVATE_KEY");

// ✅ DO: Keep .env.local in .gitignore
// .gitignore already has: .env.local

// ✅ DO: Use different keys per environment
SEPOLIA_KEY = "0x...abc..."
MAINNET_KEY = "0x...xyz..."

// ✅ DO: Rotate keys regularly
// Delete old key → Generate new one → Update .env.local
```

---

## 🔍 Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `DEPLOYER_PRIVATE_KEY not found` | Missing .env.local | Create .env.local and add key |
| `Invalid private key format` | Wrong format | Must be 0x + 64 hex chars |
| `ALCHEMY_API_KEY missing` | No key set | Get from https://dashboard.alchemyapi.io |
| `rate limit exceeded` | Too many requests | Use your own API key (shared key is limited) |
| `SUBSCRIPTION_ID not set` | Missing VRF config | Create at https://vrf.chain.link/sepolia |
| `source account unauthorized` | Not enough gas | Fund account with testnet ETH |
| `Contract not found` | Wrong address | Check NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS |

---

## 📞 Getting Help

### For API Issues
1. Check you're using correct API key
2. Verify API key hasn't expired
3. Check rate limits on your account
4. Try a fresh API key from the dashboard

### For Deployment Issues
1. Ensure deployer account has ETH
2. Check all required env vars are set
3. Run on localhost first: `yarn deploy --network localhost`
4. Read the error message carefully (it usually tells you what's wrong)

### For Git Issues
1. Don't panic - secrets can be rotated
2. If not pushed yet: `git reset --soft HEAD~1`
3. If already pushed: Use BFG Repo Cleaner
4. Rotate all compromised keys

---

## 🎓 Learning Resources

| Topic | Resource |
|-------|----------|
| Environment Variables | [SETUP.md](./SETUP.md) |
| Security Best Practices | [SECURITY.md](./SECURITY.md) |
| Implementation Status | [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) |
| All Variables | [.env.example](./.env.example) |
| Hardhat Docs | https://hardhat.org |
| Alchemy Docs | https://docs.alchemy.com |

---

**Keep this window open while developing!**

Last Updated: April 1, 2026
