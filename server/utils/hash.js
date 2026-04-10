const crypto = require("crypto");

/**
 * Generates a consistent SHA-256 hash for an invoice object.
 * IMPORTANT: Always stringify in the same structure. Even a small change produces a different hash.
 */
function generateHash(invoice) {
  // To ensure the structure is consistent, we could sort the keys if needed, 
  // but for now, we just stringify it exactly as instructed.
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(invoice))
    .digest("hex");
}

module.exports = { generateHash };
