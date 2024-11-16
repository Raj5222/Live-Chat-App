import { config } from "dotenv";
const Jwt = require("jsonwebtoken");

config()


// Load secret key from environment variables
const SECRET_KEY = process.env.JWT_SECRET as string;

// Validate secret key presence
if (!SECRET_KEY) {
  throw new Error("JWT_SECRET environment variable is missing");
}

// GenerateJWT Token Function
export const generateToken = (userId: string, time: string = '100h'): string => {
  if(!time) time='100h'
  const data = { id: userId };
  const tokenTime = { expiresIn: time };
  const token = Jwt.sign(data, SECRET_KEY, tokenTime); // Token expires in 100 hours
  return token;
};

// Verify JWT Token Function
export const verifyToken = (token: string): any => {
  try {
    const decoded = Jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    return { status: false, message: "Token is invalid or expired",error:error };
  }
};
