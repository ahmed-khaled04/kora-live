import prisma from "../config/prisma.js";
import { calculatePoints } from "../utils/scoring.js";

export const scorePrediction = async (id) => {
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) {
    const error = new Error("Match Not found");
    error.statusCode = 404;
    throw error;
  }
  const predictions = await prisma.prediction.findMany({
    where: { scored: false, matchId: id },
  });
  await prisma.$transaction(
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
};
