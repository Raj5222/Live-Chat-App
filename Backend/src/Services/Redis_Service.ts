import { config } from "dotenv";
import { createClient, RedisClientType } from "redis";

// Load environment variables
config();

let redisClient: RedisClientType | null = null; // Declare Redis client outside the function

// Redis client connection logic
const redisClientConnection = async (): Promise<RedisClientType> => {
  // Check if we already have a Redis client
  if (redisClient) return redisClient;

  // Create a new Redis client
  redisClient = createClient({
    password: process.env.redisPassword,
    socket: {
      host: process.env.redisHost,
      port: Number(process.env.redisPort),
    },
  });

  // Event listener for successful connection
  redisClient.on("connect", () => {
    console.log("Redis connected successfully");
  });

  // Event listener for connection errors
  redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  // Event listener for disconnection
  redisClient.on("end", () => {
    console.log("Redis connection lost. Attempting to reconnect...");
    setTimeout(() => redisClientConnection(), 5000); // Reconnect logic
  });

  // Connect to Redis and return the client
  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = async (): Promise<RedisClientType> => {
  // Ensure client is connected and return the client instance
  if (!redisClient) {
    await redisClientConnection(); // Ensure connection is established
  }
  return redisClient!;
};