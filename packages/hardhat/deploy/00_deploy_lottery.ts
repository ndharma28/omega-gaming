import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLottery: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deployments } = hre;
  const { deploy } = deployments;

  await deploy("OmegaLottery", {
    from: deployer,
    contract: "OmegaLottery",
    // UUPS Upgradeable contracts use a Proxy
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy", // hardhat-deploy handles UUPS through this
      execute: {
        init: {
          methodName: "initialize",
          args: [deployer], // This passes your address to the 'initialOwner' arg
        },
      },
    },
    log: true,
    autoMine: true,
  });
};

export default deployLottery;
deployLottery.tags = ["OmegaLottery"];
