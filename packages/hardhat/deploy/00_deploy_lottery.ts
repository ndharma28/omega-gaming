import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLottery: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Sepolia testnet values
  const VRF_COORDINATOR = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
  const SUBSCRIPTION_ID = "5381939440800401583750118558724030775370857736705249184581988840504175043599";
  const KEY_HASH = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

  await deploy("OmegaLottery", {
    from: deployer,
    args: [SUBSCRIPTION_ID, VRF_COORDINATOR, KEY_HASH],
    log: true,
    autoMine: true,
  });
};

export default deployLottery;
deployLottery.tags = ["OmegaLottery"];
