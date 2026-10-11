
const QRCode = require('qrcode');
const { generateChecksum, verifyChecksum } = require('./checksumService');
async function encodeHealthRecord(healthRecordData) {
 
  const payload = {
    data: healthRecordData,
    checksum: generateChecksum(healthRecordData),
  };


  const payloadString = JSON.stringify(payload);

  const qrImage = await QRCode.toDataURL(payloadString);

  return qrImage;
}

function decodeHealthRecord(scannedText) {
  const payload = JSON.parse(scannedText);

  const isValid = verifyChecksum(payload.data, payload.checksum);

  if (!isValid) {
    throw new Error('QR data failed checksum validation — record may be corrupted or tampered with.');
  }

  return payload.data;
}

module.exports = {
  encodeHealthRecord,
  decodeHealthRecord,
};