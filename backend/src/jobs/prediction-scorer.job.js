import prisma from "../config/prisma.js";
import redis from "../config/redis.js";
import { calculatePoints } from "../utils/scoring.js";
import { enqueueNotification } from "./notification.queue.js";

export const scorePrediction = async (id) => {
  const keys = await redis.keys("leaderboard:*");
  if (keys > 0) {
    await redis.del(keys);
  }
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) {
    const error = new Error("Match Not found");
    error.statusCode = 404;
    throw error;
  }
  const predictions = await prisma.prediction.findMany({
    where: { scored: false, matchId: id },
  });
  const scored = await prisma.$transaction(
    predictions.map((p) => {
      return prisma.prediction.update({
        where: { id: p.id },
        data: {
          pointsEarned: calculatePoints(
            p.predictedHome,
            p.predictedAway,
            match.homeScore,
            match.awayScore,
          ),
          scored: true,
        },
      });
    }),
  );

  scored.forEach((p) => {
    enqueueNotification("PREDICTION_SCORED", {
      userId: p.userId,
      predictionId: p.id,
      matchId: p.matchId,
      points: p.pointsEarned,
    });
  });
};
