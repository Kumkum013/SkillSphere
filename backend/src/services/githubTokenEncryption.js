const crypto = require('crypto');

const getEncryptionKey = () => {
  const key = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!key || !/^[a-f0-9]{64}$/i.test(key)) {
    throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY must be a 64-character hexadecimal key');
  }
  return Buffer.from(key, 'hex');
};

const encryptToken = (token) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('hex')).join(':');
};

const decryptToken = (encryptedToken) => {
  const [ivHex, authTagHex, encryptedHex] = encryptedToken.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Stored GitHub token has an invalid format');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]).toString('utf8');
};

module.exports = { encryptToken, decryptToken };
