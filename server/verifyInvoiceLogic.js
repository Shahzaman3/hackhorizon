const { generateHash } = require('./utils/hash');

/**
 * MOCK of the Blockchain Ledger and MongoDB record for testing the flow
 */
const DB_STORED_INVOICE = {
  invoiceNumber: "INV-BCHAIN-02",
  amount: 50000,
  client: "BUYER_INC",
};
const STORED_HASH = generateHash(DB_STORED_INVOICE);

// Mock `verifyHashOnChain` to pretend to call: await contract.verifyInvoice(hash)
async function verifyHashOnChainMock(hash) {
  // If the hash lives on the blockchain, return true
  return hash === STORED_HASH;
}

/**
 * Controller Flow for Buyer Side Verification
 */
async function verifyInvoiceIntegrity(buyerProvidedInvoice) {
  try {
    console.log(`\n🔍 Checking Invoice: ${buyerProvidedInvoice.invoiceNumber}`);
    
    // 1. Recompute the hash from the frontend/incoming data
    const recomputedHash = generateHash({
      invoiceNumber: buyerProvidedInvoice.invoiceNumber,
      amount: buyerProvidedInvoice.amount,
      client: buyerProvidedInvoice.client,
    });
    console.log(`   - Recomputed Hash: ${recomputedHash}`);

    // Fetch stored DB hash (Extracted from the mock system)
    const storedHashInDB = STORED_HASH;

    // 2. Call the blockchain
    const isVerifiedOnChain = await verifyHashOnChainMock(recomputedHash);
    
    let status;
    // 3. Logic check requested by user
    if (recomputedHash === storedHashInDB && isVerifiedOnChain) {
      status = "VERIFIED";
    } else {
      status = "TAMPERED";
    }

    console.log(`   - Final Audit Result: [ ${status} ]`);
    return status;

  } catch (err) {
    console.error("Verification failed:", err);
    return "ERROR";
  }
}

async function runTests() {
  console.log("=========================================");
  console.log("   ⚖️  BUYER INVOICE VERIFICATION DEMO    ");
  console.log("=========================================");

  // PERFECT INVOICE (Data directly matches DB_STORED_INVOICE)
  const unalteredInvoiceData = {
    invoiceNumber: "INV-BCHAIN-02",
    amount: 50000,
    client: "BUYER_INC",
  };
  await verifyInvoiceIntegrity(unalteredInvoiceData);

  // TAMPERED INVOICE (Buyer changed amount to 50001)
  const tamperedInvoiceData = {
    invoiceNumber: "INV-BCHAIN-02",
    amount: 50001, // Changed!
    client: "BUYER_INC",
  };
  await verifyInvoiceIntegrity(tamperedInvoiceData);
  
  console.log("\n=========================================\n");
}

runTests();
