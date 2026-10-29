import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying FraudShieldRegistry with account:", deployer.address);
  console.log("⚠  ENVIRONMENT: LOCAL_DEVELOPMENT (Hardhat) — not MST Blockchain");

  const Factory = await ethers.getContractFactory("FraudShieldRegistry");
  const contract = await Factory.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("FraudShieldRegistry deployed to:", address);

  // Write address to a config file for the backend
  const deployInfo = {
    contractAddress: address,
    deployerAddress: deployer.address,
    network: "localhost",
    chainId: 31337,
    environment: "LOCAL_DEVELOPMENT",
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "../deployed.json");
  fs.writeFileSync(outPath, JSON.stringify(deployInfo, null, 2));
  console.log("Deployment info written to:", outPath);
  console.log("\nNext step: Set CONTRACT_ADDRESS=" + address + " in backend/.env");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
