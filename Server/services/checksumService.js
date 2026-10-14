const crypto = require('crypto');

function generateChecksum(healthRecordData) {
  
  const dataString = JSON.stringify(healthRecordData);

  return crypto
    .createHash('sha256')
    .update(dataString)
    .digest('hex');
}

function verifyChecksum(healthRecordData, expectedChecksum) {
  const actualChecksum = generateChecksum(healthRecordData);
  return actualChecksum === expectedChecksum;
}

module.exports = {
  generateChecksum,
  verifyChecksum,
};