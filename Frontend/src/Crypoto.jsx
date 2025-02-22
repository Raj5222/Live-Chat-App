import CryptoJS from "crypto-js";
import { Pass } from "./components/ChatApp";

// Check for required environment variables
if (
  !process.env.REACT_APP_SECRET_KEY ||
  !process.env.REACT_APP_IV ||
  !process.env.REACT_APP_Chat_IV ||
  !process.env.REACT_APP_Chat_SECRET_KEY
) {
  if(window.raj === Pass)console.error("Error: Missing environment variables for encryption.");
  // Note: process.exit(1) is not recommended in a browser/React environment.
  throw new Error("Missing environment variables for encryption.");
}
if(window.raj === Pass)console.log("keys => ",{A: process.env.REACT_APP_SECRET_KEY,B:process.env.REACT_APP_IV,C:process.env.REACT_APP_Chat_IV
  ,D:process.env.REACT_APP_Chat_SECRET_KEY})
  // Initialize key and iv based on available credentials
  function Enc_Dec(){
  const token = localStorage.getItem("token");
  const uid = localStorage.getItem("uid");
  const username = localStorage.getItem("username");
  let key
  let iv
  if (token && (username || uid)) {
    // Use Chat keys with UTF-8 parsing (supports mixed symbols)
    key = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_Chat_SECRET_KEY);
    iv  = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_Chat_IV);
    if(window.raj === Pass)console.log("Chat Secret Used")
  } else {
    // Use default keys with Hex parsing (ensure these are valid hex strings)
    key = CryptoJS.enc.Hex.parse(process.env.REACT_APP_SECRET_KEY);
    iv  = CryptoJS.enc.Hex.parse(process.env.REACT_APP_IV);
    if(window.raj === Pass)console.log("Login Secret Used")
  }
  return [key,iv]
}

export async function encrypt(plainText) {
  if (typeof plainText !== "string") {
    throw new TypeError("Plain text must be a string.");
  }

  try {
    // Encrypt and return the Base64 string
    if(window.raj === Pass)console.log("Plain Message =>", plainText);
    const[key, iv] = Enc_Dec()
    const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv }).toString();
    if(window.raj === Pass)console.log("Enc Message =>", encrypted);
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
    // Decrypt the ciphertext and convert to a UTF-8 string
    const[key, iv] = Enc_Dec()
    const bytes = CryptoJS.AES.decrypt(encrypted, key, { iv });
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error("Decryption produced an empty result. Check the key, IV, or ciphertext.");
    }

    if(window.raj === Pass)console.log("Decrypted Message =>", decrypted);
    return decrypted;
  } catch (error) {
    if(window.raj === Pass)console.error(`Decryption failed: ${error.message}`);
    return "Invalid Message.";
  }
}

export async function decryptJson(encryptedJson) {
  // Directly call the decrypt function (avoid using 'this.decrypt')
  const decryptedJson = await decrypt(encryptedJson);
  return JSON.parse(decryptedJson);
}

export async function encryptJson(jsonData) {
  if (typeof jsonData !== "object" || jsonData === null) {
    throw new TypeError("JSON data must be a non-null object.");
  }

  const jsonStr = JSON.stringify(jsonData);
  return encrypt(jsonStr);
}
