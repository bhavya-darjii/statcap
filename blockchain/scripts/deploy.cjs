const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("\n==========================================");
  console.log("[Deploy] Deploying MoSPICredentialRegistry...");
  console.log("[Deploy] Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("[Deploy] Deployer balance:", ethers.formatEther(balance), "POL/MATIC");

  if (balance === 0n) {
    console.log("\n==========================================");
    console.log("[NOTICE] Deployer wallet has 0 POL/MATIC.");
    console.log("Please obtain testnet tokens from Polygon Amoy Faucet:");
    console.log("1. Go to: https://faucet.polygon.technology/ (or https://www.alchemy.com/faucets/polygon-amoy)");
    console.log("2. Select Network: Polygon Amoy");
    console.log("3. Target Address:", deployer.address);
    console.log("==========================================\n");
    return;
  }

  console.log("[Deploy] Deploying contract to Polygon Amoy...");
  const Registry = await ethers.getContractFactory("MoSPICredentialRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("\n==========================================");
  console.log("[SUCCESS] Contract deployed successfully!");
  console.log("[Deploy] Contract Address:", contractAddress);
  console.log("[Deploy] PolygonScan Explorer:", `https://amoy.polygonscan.com/address/${contractAddress}`);
  console.log("==========================================\n");

  // Automatically update .env file
  const envPath = path.resolve(__dirname, "../../.env");
  let envContent = fs.readFileSync(envPath, "utf8");

  if (envContent.includes("CREDENTIAL_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /CREDENTIAL_CONTRACT_ADDRESS=.*/,
      `CREDENTIAL_CONTRACT_ADDRESS=${contractAddress}`
    );
  } else {
    envContent += `\nCREDENTIAL_CONTRACT_ADDRESS=${contractAddress}\n`;
  }
  fs.writeFileSync(envPath, envContent);
  console.log("[Deploy] CREDENTIAL_CONTRACT_ADDRESS written to root .env");
}

main().catch((err) => {
  console.error("[Deploy] Error:", err);
  process.exit(1);
});
