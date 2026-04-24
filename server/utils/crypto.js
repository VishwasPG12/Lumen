const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
// Key must be 32 bytes (64 hex characters)
const keyString = process.env.ENCRYPTION_KEY;

if (!keyString) {
    console.error("❌ FATAL ERROR: ENCRYPTION_KEY is not defined in .env");
    process.exit(1); 
}

const key = Buffer.from(keyString, 'hex');
const ivLength = 16;

const encrypt = (text) => {
    if (!text) return text;
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
    if (!text || !text.includes(':')) return text;
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

const createBlindIndex = (text) => {
    return crypto.createHmac('sha256', process.env.ENCRYPTION_KEY)
                 .update(text.toLowerCase().trim())
                 .digest('hex');
};

module.exports = { encrypt, decrypt, createBlindIndex };