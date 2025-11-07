const cardPatterns = {
  visa: /^4\d{12}(\d{3})?$/, // 13 or 16 digits starting with 4
  mastercard: /^(5[1-5]\d{14}|2(2[2-9]|[3-6]\d|7[01])\d{12}|2720\d{12})$/, // Mastercard (51–55 or 2221–2720)
  rupay: /^(60|65|81|35|82|508)[0-9]{14}$/, // Common patterns (simplified, not fully exhaustive)
  amex: /^3[47]\d{13}$/, // American Express: 15 digits
  diners: /^3(6|8)\d{12}$/, // Diners Club: 14 digits
  discover: /^6(?:011|5\d{2})\d{12}$/, // Discover: 16 digits
  jcb: /^35\d{14}$/, // JCB: 16 digits
};

function isValidLuhn(cardNumber) {
  let sum = 0;
  let shouldDouble = false;

  // Process digits from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.AES_SECRET_KEY, 'hex');
const iv = Buffer.from(process.env.AES_IV, 'hex');

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function validateCardNumber(cardNumber, variant, cvv) {
  if (!/^\d+$/.test(cardNumber)) {
    return { valid: false, reason: 'Card number must contain only digits' };
  }

  const trimmedCVV = cvv.trim();
  if (!/^\d+$/.test(trimmedCVV)) {
    return { valid: false, reason: 'CVV must contain only digits' };
  }

  const variantLower = variant.toLowerCase();

  const expectedLength = variantLower === 'amex' ? 4 : 3;

  if (trimmedCVV.length !== expectedLength) {
    return {
      valid: false,
      reason: `CVV must be ${expectedLength} digits for ${variant}`,
    };
  }

  const pattern = cardPatterns[variant.toLowerCase()];
  if (!pattern) {
    return { valid: false, reason: 'Unsupported card variant' };
  }

  if (!pattern.test(cardNumber)) {
    return {
      valid: false,
      reason: "Card number doesn't match the variant pattern",
    };
  }

  if (!isValidLuhn(cardNumber)) {
    return { valid: false, reason: 'Failed Luhn check' };
  }

  return { valid: true, reason: '' };
}

module.exports = {
  encrypt,
  decrypt,
  validateCardNumber,
};
