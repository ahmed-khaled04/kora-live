import prisma from "../config/prisma.js";

export const fetchReaction = async (matchId) => {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });
  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }
  const counts = await prisma.reaction.groupBy({
    by: ["type"],
    where: { matchId },
    _count: { type: true },
  });
  const result = counts.reduce((acc, row) => {
    acc[row.type] = row._count.type;
    return acc;
  }, {});
  return result;
};

export const addReaction = async (userId, matchId, type) => {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });
  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }
  const reaction = await prisma.reaction.upsert({
    where: { userId_matchId: { userId, matchId } },
    update: { type },
    create: { userId, matchId, type },
  });
  return reaction;
};

export const removeReaction = async (userId, matchId) => {
  await prisma.reaction.deleteMany({
    where: { userId, matchId },
  });
};
