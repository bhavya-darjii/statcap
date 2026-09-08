/**
 * blockchainService.ts
 * Handles all Polygon Amoy interactions for MoSPI credential anchoring.
 * Private key NEVER leaves the backend — ethers wallet is server-side only.
 */
import { ethers } from 'ethers';

// ─── ABI for MoSPICredentialRegistry ─────────────────────────────────────────
const REGISTRY_ABI = [
  'function recordCredential(bytes32 credentialHash) external',
  'function verifyCredential(bytes32 credentialHash) external view returns (bool isValid, uint256 anchoredAt, address issuer)',
  'event CredentialAnchored(bytes32 indexed credentialHash, address indexed issuer, uint256 timestamp)',
];

// ─── Singleton provider + wallet ─────────────────────────────────────────────
let _provider: ethers.JsonRpcProvider | null = null;
let _wallet: ethers.Wallet | null = null;
let _contract: ethers.Contract | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    const rpcUrl = process.env.AMOY_RPC_URL ?? 'https://polygon-amoy.drpc.org';
    _provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return _provider;
}

function getWallet(): ethers.Wallet {
  if (!_wallet) {
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    if (!privateKey) throw new Error('[blockchainService] BLOCKCHAIN_PRIVATE_KEY not set in .env');
    _wallet = new ethers.Wallet(privateKey, getProvider());
  }
  return _wallet;
}

function getContract(): ethers.Contract {
  if (!_contract) {
    const address = process.env.CREDENTIAL_CONTRACT_ADDRESS;
    if (!address) throw new Error('[blockchainService] CREDENTIAL_CONTRACT_ADDRESS not set in .env');
    _contract = new ethers.Contract(address, REGISTRY_ABI, getWallet());
  }
  return _contract;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AnchorResult {
  txHash: string;
  blockNumber: number;
  credentialHash: string; // hex string (0x...)
  gasUsed: string;
}

export interface VerifyResult {
  isValid: boolean;
  anchoredAt: Date | null;
  issuer: string | null;
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Anchor a SHA-256 credential hash on Polygon Amoy.
 * @param credentialHashHex  Hex string of SHA-256 hash (0x...)
 */
export async function anchorCredential(credentialHashHex: string): Promise<AnchorResult> {
  const contract = getContract();
  const bytes32Hash = ethers.zeroPadValue(credentialHashHex, 32);

  const tx = await contract.recordCredential(bytes32Hash);
  const receipt = await tx.wait();

  if (!receipt) throw new Error('[blockchainService] Transaction receipt was null');
  if (receipt.status === 0) throw new Error('[blockchainService] Transaction reverted on-chain');

  return {
    txHash: receipt.hash,
    blockNumber: Number(receipt.blockNumber),
    credentialHash: credentialHashHex,
    gasUsed: receipt.gasUsed.toString(),
  };
}

/**
 * Verify an on-chain credential hash.
 */
export async function verifyOnChain(credentialHashHex: string): Promise<VerifyResult> {
  const contract = getContract();
  const bytes32Hash = ethers.zeroPadValue(credentialHashHex, 32);
  const result = await contract.verifyCredential(bytes32Hash);

  return {
    isValid: result.isValid,
    anchoredAt: result.isValid ? new Date(Number(result.anchoredAt) * 1000) : null,
    issuer: result.isValid ? result.issuer : null,
  };
}

/**
 * Get the issuer wallet address (for display / DID).
 */
export function getIssuerAddress(): string {
  return getWallet().address;
}

/**
 * Check wallet balance — useful for ops monitoring.
 */
export async function getWalletBalance(): Promise<string> {
  const provider = getProvider();
  const address = getWallet().address;
  const bal = await provider.getBalance(address);
  return ethers.formatEther(bal);
}
