const forge = require('node-forge');
require('dotenv').config();

// Generate a random key if not provided (for dev/demo purposes)
// In production, this should be a 32-byte hex string in .env
const SECRET_KEY = process.env.ENCRYPTION_KEY 
    ? forge.util.hexToBytes(process.env.ENCRYPTION_KEY) 
    : forge.random.getBytesSync(32);

// AES-256-CBC
const CIPHER_ALGO = 'AES-CBC';

const encrypt = (text) => {
    const iv = forge.random.getBytesSync(16);
    const cipher = forge.cipher.createCipher(CIPHER_ALGO, SECRET_KEY);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(text, 'utf8'));
    cipher.finish();
    const encrypted = cipher.output;
    // Return IV + Encrypted Data as Hex
    return forge.util.bytesToHex(iv + encrypted.data);
};

const decrypt = (encryptedHex) => {
    const encryptedBytes = forge.util.hexToBytes(encryptedHex);
    // Extract IV (first 16 bytes)
    const iv = encryptedBytes.slice(0, 16);
    const data = encryptedBytes.slice(16);

    const decipher = forge.cipher.createDecipher(CIPHER_ALGO, SECRET_KEY);
    decipher.start({ iv: iv });
    decipher.update(forge.util.createBuffer(data));
    const result = decipher.finish(); // Returns true if successful
    
    if (result) {
        return decipher.output.toString('utf8');
    } else {
        throw new Error('Decryption failed');
    }
};

// const key = forge.random.getBytesSync(32);

// // Encode for storage (base64 or hex)
// const base64Key = forge.util.encode64(key);

// console.log(base64Key)

module.exports = { encrypt, decrypt };
