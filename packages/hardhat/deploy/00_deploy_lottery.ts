import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLottery: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // ════════════════════════════════════════════════════════════════════════════════
  // LOAD CONFIGURATION FROM ENVIRONMENT
  // ════════════════════════════════════════════════════════════════════════════════

  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;

  // Sepolia CRE Forwarder Address (from your supported-chains output)
  const CRE_FORWARDER = process.env.CRE_FORWARDER || "0xF8344CFd5c43616a4366C34E3EEE75af79a74482";
  const WINNER_CUT = process.env.WINNER_CUT ? parseInt(process.env.WINNER_CUT) : 90; // default to 90 if not set

  // ════════════════════════════════════════════════════════════════════════════════
  // VALIDATION
  // ════════════════════════════════════════════════════════════════════════════════

  if (WINNER_CUT < 1 || WINNER_CUT > 99) {
    throw new Error(`❌ WINNER_CUT must be between 1 and 100. Current value: ${WINNER_CUT}`);
  }

  // Validate required environment variables
  if (!TREASURY_ADDRESS) {
    throw new Error(
      `❌ TREASURY_ADDRESS not set in environment for network: ${network.name}\n` +
        `Set this in your .env.local file or system environment variables.\n` +
        `Example: TREASURY_ADDRESS=0xAE543C89DE0166f17Ca1baD0f08da5Dda141730D`,
    );
  }

  // Validate address format
  if (!TREASURY_ADDRESS.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error(`❌ Invalid TREASURY_ADDRESS format. Must be 0x + 40 hex chars`);
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // DEPLOYMENT PARAMETERS
  // ════════════════════════════════════════════════════════════════════════════════

  const DEFAULT_ENTRY_FEE = hre.ethers.parseEther("0.01");
  const LOTTERY_DURATION = 3600; // 1 hour in seconds

  console.log("📋 Deployment Configuration (CRE Migration):");
  console.log(`   Network: ${network.name}`);
  console.log(`   Deployer: ${deployer}`);
  console.log(`   Treasury: ${TREASURY_ADDRESS}`);
  console.log(`   CRE Forwarder: ${CRE_FORWARDER}`);
  console.log(`   Entry Fee: 0.01 ETH`);
  console.log(`   Duration: ${LOTTERY_DURATION}s (${LOTTERY_DURATION / 3600}h)`);

  // ════════════════════════════════════════════════════════════════════════════════
  // DEPLOY CONTRACT
  // ════════════════════════════════════════════════════════════════════════════════

  const lottery = await deploy("OmegaLottery", {
    from: deployer,
    args: [TREASURY_ADDRESS, CRE_FORWARDER, DEFAULT_ENTRY_FEE, LOTTERY_DURATION, WINNER_CUT],
    log: true,
  });

  console.log("✅ OmegaLottery deployed successfully via CRE architecture!");
  console.log(`   Address: ${lottery.address}`);
  console.log(`   Tx Hash: ${lottery.transactionHash}`);

  // ════════════════════════════════════════════════════════════════════════════════
  // SAVE DEPLOYMENT ADDRESS FOR FRONTEND & CRE WORKFLOW
  // ════════════════════════════════════════════════════════════════════════════════

  console.log("\n📌 Next Steps:");
  console.log(`1. Update your workflow config.test.json targetAddress with: ${lottery.address}`);
  console.log(`2. Add to your .env.local:`);
  console.log(`   NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS=${lottery.address}`);
  console.log(`   NEXT_PUBLIC_TREASURY_ADDRESS=${TREASURY_ADDRESS}`);
};

export default deployLottery;
deployLottery.tags = ["OmegaLottery"];
