require("dotenv").config();
const { ethers } = require("ethers");

// Import compiled ABI
const InvoiceValidationArtifact = require("../../blockchain/artifacts/contracts/InvoiceValidation.sol/InvoiceValidation.json");
const ABI = InvoiceValidationArtifact.abi;

// For this demo, using localhost if not provided
const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
// Account #0 from hardhat default
const privateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const contract = new ethers.Contract(
  contractAddress,
  ABI,
  wallet
);

async function storeHash(hash) {
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
  const bytes32Hash = hash.startsWith("0x") ? hash : "0x" + hash;
  return await contract.verifyInvoice(bytes32Hash);
}

module.exports = { storeHash, verifyHashOnChain, contract };
