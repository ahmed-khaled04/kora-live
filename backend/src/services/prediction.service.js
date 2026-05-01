import prisma from "../config/prisma.js";
import { enqueueNotification } from "../jobs/notification.queue.js";

export const addPrediction = async (
  userId,
  matchId,
  predictedHome,
  predictedAway,
) => {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }
  if (match.status !== "SCHEDULED") {
    const error = new Error("Match is not scheduled");
    error.statusCode = 403;
    throw error;
  }
  try {
    const prediction = await prisma.prediction.create({
      data: {
        userId: userId,
        matchId: matchId,
        predictedHome: predictedHome,
        predictedAway: predictedAway,
      },
    });
    enqueueNotification("FOLLOWER_PREDICTION", {
      senderId: userId,
      predictionId: prediction.id,
      matchId,
    });
    return prediction;
  } catch (err) {
    if (err.code === "P2002") {
      const error = new Error("Prediction already submitted");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};
