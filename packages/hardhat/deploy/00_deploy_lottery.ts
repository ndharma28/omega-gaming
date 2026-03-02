import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLottery: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const TREASURY_ADDRESS = "0xAE543C89DE0166f17Ca1baD0f08da5Dda141730D";
  const SUBSCRIPTION_ID = BigInt("61929715567171764477812404321678706382866709361907132046623015877255427485329"); // <-- replace with REAL subscription ID
  const VRF_COORDINATOR = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
  const KEY_HASH = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

  const DEFAULT_ENTRY_FEE = hre.ethers.parseEther("0.01");
  const LOTTERY_DURATION = 3600;

  await deploy("OmegaLottery", {
    from: deployer,
    args: [TREASURY_ADDRESS, SUBSCRIPTION_ID, VRF_COORDINATOR, KEY_HASH, DEFAULT_ENTRY_FEE, LOTTERY_DURATION],
    log: true,
  });
};

export default deployLottery;
deployLottery.tags = ["OmegaLottery"];
