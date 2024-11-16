import CryptoJS from "crypto-js"

if (!process.env.REACT_APP_SECRET_KEY || !process.env.REACT_APP_IV) {
  console.error("Error: Missing environment variables for encryption.");
  process.exit(1);
}

// Ensure key and IV are properly formatted
const key = CryptoJS.enc.Hex.parse(process.env.REACT_APP_SECRET_KEY);
const iv = CryptoJS.enc.Hex.parse(process.env.REACT_APP_IV);


  export async function encrypt(plainText) {
    if (typeof plainText !== "string") {
      throw new TypeError("Plain text must be a string.");
    }

    try {
      const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv }).toString();
      return encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  export async function decrypt(encrypted) {
    if (typeof encrypted !== "string") {
      throw new TypeError("Encrypted text must be a string.");
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv }).toString(
        CryptoJS.enc.Utf8
      );
      if (!decrypted) {
        throw new Error("Decryption failed: Invalid encrypted data.");
      }
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  export async function decryptJson(encryptedJson) {
    const decryptedJson = await this.decrypt(encryptedJson);
    return JSON.parse(decryptedJson);
  }

  export async function encryptJson(jsonData) {
    if (typeof jsonData !== "object") {
      throw new TypeError("JSON data must be an object.");
    }

    const jsonStr = JSON.stringify(jsonData);
    return encrypt(jsonStr);
  }
