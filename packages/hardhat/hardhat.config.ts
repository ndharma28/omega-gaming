import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "solidity-coverage";
import generateTsAbis from "./scripts/generateTsAbis";

// ── Constants ────────────────────────────────────────────────────────────────

const HARDHAT_DEFAULT_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478caded87985d6f79a7ccc66a";

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY ?? HARDHAT_DEFAULT_KEY;
const etherscanApiKey = process.env.ETHERSCAN_V2_API_KEY ?? "";
const alchemyApiKey = process.env.ALCHEMY_API_KEY ?? "cR4WnXePioePZ5fFrnSiR";

// ── Validation ───────────────────────────────────────────────────────────────

function validatePrivateKey(key: string): void {
  if (!key.startsWith("0x") || key.length !== 66) {
    throw new Error("❌ Invalid private key: must be 0x + 64 hex chars");
  }
  if (key === HARDHAT_DEFAULT_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("❌ DEPLOYER_PRIVATE_KEY must be set in production");
    }
    console.warn("⚠️  Using Hardhat default key — LOCAL DEVELOPMENT ONLY");
  }
}

function warnIfMissing(envVar: string, label: string): void {
  if (!process.env[envVar]) console.warn(`⚠️  ${label} not set — some features may be unavailable`);
}

validatePrivateKey(deployerPrivateKey);
warnIfMissing("ETHERSCAN_V2_API_KEY", "Etherscan API key");
warnIfMissing("ALCHEMY_API_KEY", "Alchemy API key");

// ── Network helpers ──────────────────────────────────────────────────────────

const alchemy = (network: string) => `https://eth-${network}.g.alchemy.com/v2/${alchemyApiKey}`;

const alchemyL2 = (slug: string) => `https://${slug}.g.alchemy.com/v2/${alchemyApiKey}`;

const accounts = [deployerPrivateKey];

// ── Config ───────────────────────────────────────────────────────────────────

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.30",
        settings: {
          evmVersion: "cancun",
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },

  defaultNetwork: "localhost",

  namedAccounts: {
    deployer: { default: 0 },
  },

  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },

    // Ethereum
    mainnet: { url: "https://mainnet.rpc.buidlguidl.com", accounts },
    sepolia: { url: alchemy("sepolia"), accounts },

    // Arbitrum
    arbitrum: { url: alchemyL2("arb-mainnet"), accounts },
    arbitrumSepolia: { url: alchemyL2("arb-sepolia"), accounts },

    // Optimism
    optimism: { url: alchemyL2("opt-mainnet"), accounts },
    optimismSepolia: { url: alchemyL2("opt-sepolia"), accounts },

    // Polygon
    polygon: { url: alchemyL2("polygon-mainnet"), accounts },
    polygonAmoy: { url: alchemyL2("polygon-amoy"), accounts },
    polygonZkEvm: { url: alchemyL2("polygonzkevm-mainnet"), accounts },
    polygonZkEvmCardona: { url: alchemyL2("polygonzkevm-cardona"), accounts },

    // Base
    base: { url: "https://mainnet.base.org", accounts },
    baseSepolia: { url: "https://sepolia.base.org", accounts },

    // Scroll
    scroll: { url: "https://rpc.scroll.io", accounts },
    scrollSepolia: { url: "https://sepolia-rpc.scroll.io", accounts },

    // Gnosis
    gnosis: { url: "https://rpc.gnosischain.com", accounts },
    chiado: { url: "https://rpc.chiadochain.net", accounts },

    // Celo
    celo: { url: "https://forno.celo.org", accounts },
    celoSepolia: { url: "https://forno.celo-sepolia.celo-testnet.org/", accounts },
  },

  etherscan: { apiKey: etherscanApiKey },
  verify: { etherscan: { apiKey: etherscanApiKey } },
  sourcify: { enabled: false },
};

// ── Tasks ────────────────────────────────────────────────────────────────────

task("deploy").setAction(async (args, hre, runSuper) => {
  await runSuper(args);
  await generateTsAbis(hre);
});

export default config;
