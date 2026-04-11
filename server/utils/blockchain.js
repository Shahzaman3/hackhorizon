require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const artifactPath = path.resolve(
  __dirname,
  "../../blockchain/artifacts/contracts/InvoiceValidation.sol/InvoiceValidation.json"
);

function loadContractAbi() {
  if (!fs.existsSync(artifactPath)) {
    console.warn(
      `[BLOCKCHAIN] Artifact not found at ${artifactPath}. Run \"npm install\" and \"npx hardhat compile\" in the blockchain folder.`
    );
    return null;
  }

  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return artifact.abi || null;
  } catch (error) {
    console.error("[BLOCKCHAIN] Failed to read contract artifact:", error.message);
    return null;
  }
}

const ABI = loadContractAbi();
const isProd = process.env.NODE_ENV === 'production';

// For this demo, using localhost if not provided
const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
// Account #0 from hardhat default
const privateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

if (isProd) {
  if (!process.env.RPC_URL || !process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
    throw new Error('Missing blockchain production environment variables: RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS');
  }
}

let contract = null;

if (ABI) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  contract = new ethers.Contract(
    contractAddress,
    ABI,
    wallet
  );
}

function ensureContractReady() {
  if (!contract) {
    throw new Error(
      "Blockchain contract is not initialized. Compile the smart contract artifacts first."
    );
  }
}

async function storeHash(hash) {
  ensureContractReady();
  console.log(`Sending transaction to store hash on-chain: ${hash}...`);
  // Ensure we pass the hash as bytes32 directly
  // '0x' prefix is needed for bytes32
  const bytes32Hash = hash.startsWith("0x") ? hash : "0x" + hash;
  
  const tx = await contract.storeInvoiceHash(bytes32Hash);
  console.log(`Transaction submitted! Hash: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  return receipt;
}

// Helper to verify if it exists
async function verifyHashOnChain(hash) {
  ensureContractReady();
  const bytes32Hash = hash.startsWith("0x") ? hash : "0x" + hash;
  return await contract.verifyInvoice(bytes32Hash);
}

module.exports = { storeHash, verifyHashOnChain, contract };
