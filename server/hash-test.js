const { generateHash } = require("./utils/hash");

// Mock Invoice
const invoice1 = {
  id: "INV-001",
  amount: 5000,
  client: "Tech Corp",
  date: "2026-04-10"
};

// Same exact data as invoice1
const invoice2 = {
  id: "INV-001",
  amount: 5000,
  client: "Tech Corp",
  date: "2026-04-10"
};

// Modified Invoice (small change: amount 5001 instead of 5000)
const invoice3_modified = {
  id: "INV-001",
  amount: 5001,
  client: "Tech Corp",
  date: "2026-04-10"
};

console.log("--- HASH GENERATION DEMO ---");
const hash1 = generateHash(invoice1);
console.log(`Invoice 1 Hash: ${hash1}`);

const hash2 = generateHash(invoice2);
console.log(`Invoice 2 Hash: ${hash2}`);
console.log(`(Same invoice -> same hash): ${hash1 === hash2 ? '✅ PASSED' : '❌ FAILED'}\n`);

const hash3 = generateHash(invoice3_modified);
console.log(`Modified Invoice Hash: ${hash3}`);
console.log(`(Modified invoice -> different hash): ${hash1 !== hash3 ? '✅ PASSED' : '❌ FAILED'}`);
