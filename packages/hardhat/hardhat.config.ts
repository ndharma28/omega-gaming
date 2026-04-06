import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { task } from "hardhat/config";
import generateTsAbis from "./scripts/generateTsAbis";

// ════════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VARIABLES - SECURITY CRITICAL
// ════════════════════════════════════════════════════════════════════════════════

// Deployer Private Key
// ⚠️ CRITICAL: Populated from .env.local (NEVER commit)
// Generate with: yarn account:generate
// For local testing only - use encrypted keystore for mainnet
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ||
  // Fallback to Hardhat's default test account (LOCAL DEVELOPMENT ONLY)
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478caded87985d6f79a7ccc66a";

// Etherscan API Key (for contract verification)
// Get from: https://etherscan.io/apis
const etherscanApiKey = process.env.ETHERSCAN_V2_API_KEY || "";

// Alchemy API Key (for RPC provider)
// Get from: https://dashboard.alchemyapi.io
// For production, use dedicated API keys with rate limiting
const providerApiKey = process.env.ALCHEMY_API_KEY || "cR4WnXePioePZ5fFrnSiR"; // Shared demo key

// ════════════════════════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ════════════════════════════════════════════════════════════════════════════════

function validatePrivateKey(key: string, context: string = "Deployer"): void {
  if (!key.startsWith("0x") || key.length !== 66) {
    throw new Error(`❌ Invalid private key format. Must be 0x + 64 hex chars`);
  }
  if (key === "0xac0974bec39a17e36ba4a6b4d238ff944bacb478caded87985d6f79a7ccc66a") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `❌ ${context} private key not configured for production!\n` +
          `Set DEPLOYER_PRIVATE_KEY in your environment variables.`,
      );
    }
    console.warn(`⚠️ ${context} using Hardhat default key (LOCAL DEVELOPMENT ONLY)`);
  }
}

function warnIfMissing(envVar: string, context: string = ""): void {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Missing ${context || envVar} - some features may not work`);
  }
}

// Validate critical keys on startup
validatePrivateKey(deployerPrivateKey, "Deployer");
warnIfMissing("ETHERSCAN_V2_API_KEY", "Etherscan API Key");
warnIfMissing("ALCHEMY_API_KEY", "Alchemy API Key");

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.30",
        settings: {
          evmVersion: "cancun",
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    mainnet: {
      url: "https://mainnet.rpc.buidlguidl.com",
      accounts: [deployerPrivateKey],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    arbitrumSepolia: {
      url: `https://arb-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    optimismSepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    polygonAmoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    polygonZkEvm: {
      url: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    polygonZkEvmCardona: {
      url: `https://polygonzkevm-cardona.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    gnosis: {
      url: "https://rpc.gnosischain.com",
      accounts: [deployerPrivateKey],
    },
    chiado: {
      url: "https://rpc.chiadochain.net",
      accounts: [deployerPrivateKey],
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [deployerPrivateKey],
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [deployerPrivateKey],
    },
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io",
      accounts: [deployerPrivateKey],
    },
    scroll: {
      url: "https://rpc.scroll.io",
      accounts: [deployerPrivateKey],
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [deployerPrivateKey],
    },
    celoSepolia: {
      url: "https://forno.celo-sepolia.celo-testnet.org/",
      accounts: [deployerPrivateKey],
    },
  },
  // Configuration for harhdat-verify plugin
  etherscan: {
    apiKey: `${etherscanApiKey}`,
  },
  // Configuration for etherscan-verify from hardhat-deploy plugin
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  },
  sourcify: {
    enabled: false,
  },
};

// Extend the deploy task
task("deploy").setAction(async (args, hre, runSuper) => {
  // Run the original deploy task
  await runSuper(args);
  // Force run the generateTsAbis script
  await generateTsAbis(hre);
});

export default config;
