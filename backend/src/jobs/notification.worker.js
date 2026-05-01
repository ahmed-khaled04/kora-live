import { Worker } from "bullmq";
import Redis from "ioredis";
import {
  handleFollowerPrediction,
  handlePredictionScored,
} from "../services/notification.service.js";

const connection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker(
  "notifications",
  async (job) => {
    if (job.name === "FOLLOWER_PREDICTION") {
      await handleFollowerPrediction(job.data);
    } else if (job.name === "PREDICTION_SCORED") {
      await handlePredictionScored(job.data);
    }
  },
  {
    connection,
  },
);

worker.on("failed", (job, err) => {
  console.error(`Notification job failed [${job.name}] id=${job.id}`, err);
});

export default worker;
