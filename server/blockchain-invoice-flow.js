// 1. Mocking mongoose to emulate DB saves without needing a live connection
const Invoice = require('./models/Invoice');
const mongoose = require('mongoose');

// Mock the save function for testing the Flow Checkpoint quickly
Invoice.prototype.save = async function() {
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId();
  }
  return this;
};

const { generateHash } = require('./utils/hash');
const { storeHash } = require('./utils/blockchain');

/**
 * Executes the Invoice Creation Pipeline
 */
async function processInvoicePipeline(sellerInput) {
  try {
    console.log("=========================================");
    console.log("➡️ Seller creates a new invoice");
    
    // 2. Generate Hash
    const invoiceHash = generateHash({
      invoiceNumber: sellerInput.invoiceNumber,
      amount: sellerInput.amount,
      client: sellerInput.buyerGstin,
    });
    console.log(`🔐 Hash generated: ${invoiceHash}`);

    // 3. Save initial tracking in DB
    const dbInvoice = new Invoice({
      invoiceNumber: sellerInput.invoiceNumber,
      sellerId: new mongoose.Types.ObjectId(), // Mock ID
      sellerGstin: "SELLER123",
      buyerGstin: sellerInput.buyerGstin,
      amount: sellerInput.amount,
      date: new Date(),
      hash: invoiceHash,
      blockchainStatus: "pending"
    });
    
    await dbInvoice.save();
    console.log(`\n💾 Saved to DB | ID: ${dbInvoice._id}`);
    console.log(`   - Hash Saved: ${dbInvoice.hash}`);
    console.log(`   - Status: ${dbInvoice.blockchainStatus}`);

    // 4. Call `storeHash(hash)`
    console.log("\n⛓️ Triggering Blockchain Transaction...");
    const txReceipt = await storeHash(invoiceHash);
    
    // 5. Update Blockchain Status in DB
    if (txReceipt && txReceipt.status === 1) {
      dbInvoice.blockchainStatus = "confirmed";
      await dbInvoice.save();
      console.log(`\n✅ Transaction confirmed! Database updated:`);
      console.log(`   - New DB blockchainStatus: ${dbInvoice.blockchainStatus}`);
      console.log("=========================================\n");
    } else {
      throw new Error("Transaction failed or reverted");
    }

  } catch (err) {
    console.error("❌ Process Failed:", err.message);
  }
}

// Run the flow
const demoInvoice = {
  invoiceNumber: "INV-BCHAIN-01",
  buyerGstin: "BUYER_CORP",
  amount: 250000
};

processInvoicePipeline(demoInvoice);
