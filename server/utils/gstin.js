const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function normalizeGstin(value) {
  return (value || '').trim().toUpperCase();
}

function isValidGstinFormat(value) {
  return GSTIN_REGEX.test(normalizeGstin(value));
}

module.exports = {
  normalizeGstin,
  isValidGstinFormat,
};
