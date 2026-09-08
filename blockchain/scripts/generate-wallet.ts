/**
 * generate-wallet.ts
 * Run ONCE to generate a fresh Polygon Amoy testnet issuer wallet.
 * Output is written to the root .env file automatically.
 * NEVER commit private keys — .env is gitignored.
 */
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');

const wallet = ethers.Wallet.createRandom();
console.log('\n=== MoSPI StatCap Issuer Wallet (Polygon Amoy Testnet) ===');
console.log('Address  :', wallet.address);
console.log('PrivateKey:', wallet.privateKey);
console.log('Mnemonic :', wallet.mnemonic?.phrase ?? 'N/A');
console.log('\n[IMPORTANT] Copy the address above and fund it at:');
console.log('  https://faucet.polygon.technology/');
console.log('  Select: Amoy Testnet — paste your address — request MATIC');
console.log('==========================================================\n');

// Patch .env
let envContent = fs.readFileSync(envPath, 'utf8');

const upsert = (key: string, value: string) => {
  if (envContent.includes(`${key}=`)) {
    envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }
};

upsert('BLOCKCHAIN_PRIVATE_KEY', wallet.privateKey);
upsert('BLOCKCHAIN_ISSUER_ADDRESS', wallet.address);
upsert('AMOY_RPC_URL', 'https://rpc-amoy.polygon.technology/');

fs.writeFileSync(envPath, envContent);
console.log('[generate-wallet] Keys written to .env');
console.log('[generate-wallet] CREDENTIAL_CONTRACT_ADDRESS will be added after deployment.');
