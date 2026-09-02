
// This service creates and verifies a "checksum" — a short fingerprint
// of the health record data. Since the card works fully offline with
// no central database to compare against, this is our only way to
// detect if a scanned QR was corrupted or tampered with.
//
// Uses Node's built-in "crypto" module — no extra installation needed.

const crypto = require('crypto');

/**
 * Generates a checksum for a given health record.
 * Same input data will ALWAYS produce the same checksum.
 * If even one character of the data changes, the checksum changes completely.
 */
function generateChecksum(healthRecordData) {
  // Convert the record object into a consistent string first,
  // so the same data always hashes the same way.
  const dataString = JSON.stringify(healthRecordData);

  return crypto
    .createHash('sha256')
    .update(dataString)
    .digest('hex');
}

/**
 * Verifies that a health record hasn't been altered since its
 * checksum was generated. Used right after scanning a QR code,
 * BEFORE the data is trusted or displayed to staff.
 */
function verifyChecksum(healthRecordData, expectedChecksum) {
  const actualChecksum = generateChecksum(healthRecordData);
  return actualChecksum === expectedChecksum;
}

module.exports = {
  generateChecksum,
  verifyChecksum,
};