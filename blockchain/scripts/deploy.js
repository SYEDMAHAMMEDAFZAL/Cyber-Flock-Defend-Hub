const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying RiskResultAnchor contract...");
  const RiskResultAnchor = await hre.ethers.getContractFactory("RiskResultAnchor");
  const anchor = await RiskResultAnchor.deploy();
  await anchor.waitForDeployment();

  const contractAddress = await anchor.getAddress();
  console.log(`RiskResultAnchor successfully deployed to: ${contractAddress}`);

  // Export deployment metadata
  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "../deployment");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "contract-address.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info written to deployment/contract-address.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
