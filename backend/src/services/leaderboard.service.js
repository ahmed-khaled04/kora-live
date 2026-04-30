import prisma from "../config/prisma.js";
import { getCache, setCache } from "./cache.service.js";

export const getLeaderboard = async (period, page, limit) => {
  const cached = await getCache(`leaderboard:${period}:${page}:${limit}`);
  if (cached) {
    return cached;
  }
  const where = { scored: true };
  if (period === "weekly") {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  } else if (period === "monthly") {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  }
  const leaderboard = await prisma.prediction.groupBy({
    by: ["userId"],
    where,
    _sum: { pointsEarned: true },
    orderBy: { _sum: { pointsEarned: "desc" } },
    skip: (page - 1) * limit,
    take: limit,
  });
  const userIds = leaderboard.map((entry) => entry.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, avatar: true },
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const result = leaderboard.map((entry, i) => ({
    rank: (page - 1) * limit + i + 1,
    user: userMap[entry.userId],
    points: entry._sum.pointsEarned,
  }));

  await setCache(`leaderboard:${period}:${page}:${limit}`, result, 60);

  return result;
};
