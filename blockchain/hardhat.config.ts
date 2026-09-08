// @ts-nocheck
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const BLOCKCHAIN_PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY ?? "";
const AMOY_RPC_URL =
  process.env.AMOY_RPC_URL ?? "https://polygon-amoy.drpc.org";

if (!BLOCKCHAIN_PRIVATE_KEY) {
  console.warn(
    "[hardhat.config] BLOCKCHAIN_PRIVATE_KEY not set in .env — deploy will fail."
  );
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    amoy: {
      url: AMOY_RPC_URL,
      accounts: BLOCKCHAIN_PRIVATE_KEY ? [BLOCKCHAIN_PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
  paths: {
    sources: "./contracts",
    scripts: "./scripts",
    artifacts: "./artifacts",
    cache: "./cache",
  },
};

export default config;
