/**
 * Generate unique receipt number
 * Format: KSS-YYYYMMDD-XXXXX (e.g., KSS-20240115-00001)
 */
const generateReceiptNumber = async (Donation) => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const prefix = `KSS-${dateStr}-`;

  // Find the last receipt number for today
  const lastReceipt = await Donation.findOne({
    receiptNumber: { $regex: `^${prefix}` },
    softDelete: false
  }).sort({ receiptNumber: -1 });

  let sequence = 1;
  if (lastReceipt) {
    const lastSequence = parseInt(lastReceipt.receiptNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  // Format sequence with leading zeros (5 digits)
  const sequenceStr = sequence.toString().padStart(5, '0');
  return `${prefix}${sequenceStr}`;
};

module.exports = { generateReceiptNumber };


