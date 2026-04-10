const { generateHash } = require("./utils/hash");
const { storeHash, verifyHashOnChain } = require("./utils/blockchain");

async function run() {
  try {
    // 1. We create an invoice and generate the hash
    const invoice = {
      id: "INV-XYZ999",
      amount: 15500,
      client: "Global Enterprises",
    };
    
    // Hash we tested in Task 4
    const invoiceHash = generateHash(invoice);
    console.log(`Hash to store: ${invoiceHash}`);

    // 2. Check if it's already there (Should be false initially)
    const existsBefore = await verifyHashOnChain(invoiceHash);
    console.log(`Is hash already on chain? ${existsBefore}`);

    // 3. Store on chain!
    await storeHash(invoiceHash);
    console.log(`✅ Hash successfully written to blockchain!`);

    // 4. Verify after storage
    const existsAfter = await verifyHashOnChain(invoiceHash);
    if (existsAfter) {
      console.log(`✅ VERIFIED: The hash is absolutely stored on the blockchain!`);
    } else {
      console.log(`❌ ERROR: Could not verify hash on the blockchain!`);
    }

  } catch (err) {
    console.error("Test failed:", err);
  }
}

run();
