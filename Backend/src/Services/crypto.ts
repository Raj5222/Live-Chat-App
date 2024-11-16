import * as crypto from "crypto-js";
import { config } from "dotenv";

config();

if (!process.env.SECRET_KEY || !process.env.IV) {
  console.error("Error: Missing environment variables for encryption.");
  process.exit(1);
}

const key = crypto.enc.Hex.parse(process.env.SECRET_KEY);
const iv = crypto.enc.Hex.parse(process.env.IV);

class Crypto {
  public static async encrypt(plainText: string): Promise<string> {
    if (typeof plainText !== "string") {
      throw new TypeError("Plain text must be a string.");
    }

    try {
      const encrypted = crypto.AES.encrypt(plainText, key, { iv }).toString();
      return encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  public static async decrypt(encrypted: string): Promise<string> {
    if (typeof encrypted !== "string") {
      throw new TypeError("Encrypted text must be a string.");
    }

    try {
      const decrypted = crypto.AES.decrypt(encrypted, key, { iv }).toString(
        crypto.enc.Utf8
      );
      if (!decrypted) {
        throw new Error("Decryption failed: Invalid encrypted data.");
      }
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  public static async decryptJson(encryptedJson: string): Promise<object> {
    const decryptedJson = await this.decrypt(encryptedJson);
    return JSON.parse(decryptedJson);
  }

  public static async encryptJson(jsonData: object): Promise<string> {
    if (typeof jsonData !== "object") {
      throw new TypeError("JSON data must be an object.");
    }

    const jsonStr = JSON.stringify(jsonData);
    return this.encrypt(jsonStr);
  }
}

export default Crypto;
