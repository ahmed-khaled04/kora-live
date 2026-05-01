import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

const notificationQueue = new Queue("notifications", { connection });

export const enqueueNotification = (type, data) => {
  return notificationQueue.add(type, data);
};
