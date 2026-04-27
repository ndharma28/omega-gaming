// constants/abi.ts
export const OMEGA_LOTTERY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "treasuryAddress", type: "address" },
      { internalType: "uint256", name: "subscriptionId", type: "uint256" },
      { internalType: "address", name: "vrfCoordinator", type: "address" },
      { internalType: "bytes32", name: "keyHash", type: "bytes32" },
      { internalType: "uint256", name: "defaultEntryFee", type: "uint256" },
      { internalType: "uint256", name: "lotteryDuration", type: "uint256" },
      { internalType: "uint256", name: "winnerCut", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "getLottery",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint256", name: "entryFee", type: "uint256" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "uint256", name: "totalPot", type: "uint256" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "address", name: "winner", type: "address" },
          { internalType: "uint256", name: "randomValue", type: "uint256" },
          { internalType: "uint256", name: "requestId", type: "uint256" },
          { internalType: "uint256", name: "vrfRequestTime", type: "uint256" }, // ← new field
        ],
        internalType: "struct OmegaLottery.Lottery",
        name: "lottery",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "joinLottery",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "getPlayersByLotteryId",
    outputs: [{ internalType: "address[]", name: "players", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTreasuryAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lotteryIdCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWinnerCut",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "winnerCut", type: "uint256" }],
    name: "setWinnerCut",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "getPlayerCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "lotteryId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getStakeByUserAddress",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "lotteryId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getPlayerTickets",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "getTotalTickets",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "getLotteryStatusById",
    outputs: [{ internalType: "uint8", name: "status", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "getRandomnessDetails",
    outputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "uint256", name: "randomValue", type: "uint256" },
      { internalType: "bytes32", name: "vrfKeyHash", type: "bytes32" },
      { internalType: "uint256", name: "subscriptionId", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "recomputeWinner",
    outputs: [{ internalType: "address", name: "winnerAddress", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "lotteryId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "entryFee", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "startTime", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "endTime", type: "uint256" },
    ],
    name: "LotteryCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "lotteryId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "LotteryEntered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "lotteryId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "payout", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "totalPot", type: "uint256" },
    ],
    name: "WinnerPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "lotteryId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "WinnerSelected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "lotteryId", type: "uint256" },
      { internalType: "enum OmegaLottery.LotteryStatus", name: "lotteryStatus", type: "uint8" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "LotteryStatusUpdated",
    type: "event",
  },
] as const;

// Chain of custody — oldest to newest
export const LEGACY_CONTRACT_ADDRESS = "0x66A0203895593e39873B15771e77208FccbbB81b" as const;
export const LEGACY_CONTRACT_ADDRESS2 = "0x8A9f49D5812160a523A326eBd51a4359668B2c9b" as const;
export const CONTRACT_ADDRESS = "0xCa312D97a4fF6F4C95f154a6ED97aFF59eE3C098" as const;
