import redis from "../config/redis.js";

export const getCache = async (key) => {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
};

export const setCache = async (key, value, ttl) => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

export const deleteCache = async (key) => {
  await redis.del(key);
};
