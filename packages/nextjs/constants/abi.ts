// constants/abi.ts
export const OMEGA_LOTTERY_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "subscriptionId", type: "uint256" },
      { internalType: "address", name: "vrfCoordinator", type: "address" },
      { internalType: "bytes32", name: "_keyHash", type: "bytes32" },
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
    name: "requestWinner",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "getPlayersByLotteryId",
    outputs: [{ internalType: "address[]", name: "players", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  // ... existing ABI items
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
  // ... rest of ABI
  {
    inputs: [],
    name: "lotteryIdCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "entryFee", type: "uint256" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "uint256", name: "endTime", type: "uint256" },
    ],
    name: "createLottery",
    outputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newTreasury",
        type: "address",
      },
    ],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const; // <--- The "as const" is vital for Wagmi autocomplete!
