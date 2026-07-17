import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = new Redis(process.env.REDIS_URL as string);
export const redisAdapter = new Redis(process.env.REDIS_URL as string);

redisClient.on("connect", () => {
    console.log("Redis client connected");
});

redisClient.on("error", (err) => {
    console.error("Redis client error:", err);
});