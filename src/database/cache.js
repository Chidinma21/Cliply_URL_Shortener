import { createClient } from "redis";
import config from "../config.js";

const redisClient = createClient({
  url: `redis://:${config.cache.password}@${config.cache.host}:${config.cache.port}`,
});

redisClient.on("connect", () => console.log("Redis: Connecting..."));
redisClient.on("ready", () => console.log("Redis: Ready to serve!"));
redisClient.on("error", (err) => console.error("Redis: Error", err));
redisClient.on("end", () => console.warn("Redis: Connection closed"));

export async function connectCache() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } else {
    console.log("Redis already open, skipping connect.");
  }
}

export default redisClient;
