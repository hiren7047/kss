const crypto = require('crypto');

/**
 * Generate a unique registration ID for volunteer
 * Format: VOL-YYYY-XXXXX (e.g., VOL-2026-00123)
 */
const generateRegistrationId = async (Member) => {
  const year = new Date().getFullYear();
  let registrationId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!isUnique && attempts < maxAttempts) {
    // Get count of volunteers registered this year
    const count = await Member.countDocuments({
      memberType: 'volunteer',
      registrationId: { $regex: `^VOL-${year}-` },
      softDelete: false
    });

    // Generate registration ID with zero-padded sequence
    const sequence = String(count + 1).padStart(5, '0');
    registrationId = `VOL-${year}-${sequence}`;

    // Check if it already exists
    const exists = await Member.findOne({ registrationId, softDelete: false });
    if (!exists) {
      isUnique = true;
    } else {
      attempts++;
    }
  }

  if (!isUnique) {
    // Fallback: use timestamp-based ID
    const timestamp = Date.now().toString().slice(-8);
    registrationId = `VOL-${year}-${timestamp}`;
  }

  return registrationId;
};

/**
 * Generate a random password for volunteer
 * Format: 8 characters (mix of uppercase, lowercase, numbers)
 */
const generatePassword = () => {
  const length = 8;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = uppercase + lowercase + numbers;

  // Ensure at least one character from each set
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

module.exports = {
  generateRegistrationId,
  generatePassword
};
