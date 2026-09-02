
const qrService = require('./qrService');

const CHIP_MODE = 'qr'; // later could become 'nfc'

async function writeToChip(healthRecordData) {
  if (CHIP_MODE === 'qr') {
    return qrService.encodeHealthRecord(healthRecordData);
  }

  throw new Error(`Chip mode "${CHIP_MODE}" is not supported yet.`);
}

/**
 * Reads (decodes) a health record from "the chip" — currently a scanned QR code.
 */
function readFromChip(scannedData) {
  if (CHIP_MODE === 'qr') {
    return qrService.decodeHealthRecord(scannedData);
  }

  throw new Error(`Chip mode "${CHIP_MODE}" is not supported yet.`);
}

module.exports = {
  writeToChip,
  readFromChip,
};