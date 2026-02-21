import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployRandomNumber: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // IMPORTANT: Replace this with your actual Chainlink VRF Subscription ID
  // You get this from https://vrf.chain.link/sepolia
  const subscriptionId = "61929715567171764477812404321678706382866709361907132046623015877255427485329";

  await deploy("randomNumber", {
    from: deployer,
    // The constructor expects (uint256 subscriptionId)
    args: [subscriptionId],
    log: true,
    autoMine: true,
  });
};

export default deployRandomNumber;
deployRandomNumber.tags = ["randomNumber"];
