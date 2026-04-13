import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

// ════════════════════════════════════════════════════════════════════════════════
// API KEYS - ENVIRONMENT VARIABLES
// ════════════════════════════════════════════════════════════════════════════════

// Alchemy API Key - Use a shared demo key if not configured (rate limited)
// Get your own: https://dashboard.alchemyapi.io
export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr7iRuGQ";

// WalletConnect Project ID - Shared demo ID (not recommended for production)
// Get your own: https://cloud.walletconnect.com
const DEFAULT_WALLET_CONNECT_PROJECT_ID = "3a8170812b534d0ff9d794f19a901d64";

// ════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [chains.sepolia],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // Alchemy API Key
  // 🔐 IMPORTANT: For production, use environment variable NEXT_PUBLIC_ALCHEMY_API_KEY
  // If not provided, falls back to shared demo key (rate-limited)
  // Recommended: Create a dedicated, rate-limited API key for frontend use
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // If you want to use a different RPC for a specific network, you can add it here.
  // The key is the chain ID, and the value is the HTTP RPC URL
  rpcOverrides: {
    // Example:
    // [chains.mainnet.id]: "https://mainnet.rpc.buidlguidl.com",
  },

  // WalletConnect Project ID
  // 🔐 IMPORTANT: For production, use environment variable NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
  // Get your own at: https://cloud.walletconnect.com
  // Shared demo ID has rate limits - not recommended for production
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || DEFAULT_WALLET_CONNECT_PROJECT_ID,

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
