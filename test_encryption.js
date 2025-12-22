const { encrypt, decrypt } = require('./utils/encryption');

console.log('--- Testing Encryption Utility (node-forge) ---');

try {
    const originalText = "Hello, World! This is a secret message.";
    console.log(`Original: "${originalText}"`);

    const encrypted = encrypt(originalText);
    console.log(`Encrypted (Hex): ${encrypted}`);

    const decrypted = decrypt(encrypted);
    console.log(`Decrypted: "${decrypted}"`);

    if (originalText === decrypted) {
        console.log('✅ SUCCESS: Decryption matches original.');
    } else {
        console.error('❌ FAILED: Decryption mismatch.');
        process.exit(1);
    }
} catch (err) {
    console.error('❌ ERROR:', err);
    process.exit(1);
}
