const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeGstin, isValidGstinFormat } = require('../utils/gstin');

test('normalizeGstin trims and uppercases', () => {
  assert.equal(normalizeGstin(' 27aapfu0939f1zv '), '27AAPFU0939F1ZV');
});

test('isValidGstinFormat validates canonical GSTIN', () => {
  assert.equal(isValidGstinFormat('27AAPFU0939F1ZV'), true);
  assert.equal(isValidGstinFormat('invalid-gstin'), false);
});
