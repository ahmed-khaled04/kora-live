import prisma from "../config/prisma.js";
import { getIO } from "../sockets/index.js";
import { sendPredictionScoredEmail } from "./email.service.js";

export const handleFollowerPrediction = async (data) => {
  const { senderId, predictionId, matchId } = data;
  const followers = await prisma.follow.findMany({
    where: { followingId: senderId },
  });
  if (followers.length <= 0) {
    return;
  }
  const notifications = await prisma.$transaction(
    followers.map((f) => {
      return prisma.notification.create({
        data: {
          type: "FOLLOWER_PREDICTION",
          recipientId: f.followerId,
          senderId: senderId,
          payload: {
            predictionId,
            matchId,
          },
        },
      });
    }),
  );
  notifications.forEach((n) => {
    getIO().to(`user:${n.recipientId}`).emit("notification:new", n);
  });
};

export const fetchNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
  });
};

export const readOne = async (id, userId) => {
  const result = await prisma.notification.updateMany({
    where: { id, recipientId: userId },
    data: { read: true },
  });
  if (result.count === 0) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }
};

export const readAll = async (userId) => {
  await prisma.notification.updateMany({
    where: { recipientId: userId, read: false },
    data: { read: true },
  });
};

export const handlePredictionScored = async (data) => {
  const { userId, predictionId, matchId, points } = data;

  const [notification, user, match] = await Promise.all([
    prisma.notification.create({
      data: {
        type: "PREDICTION_SCORED",
        recipientId: userId,
        payload: { predictionId, matchId, points },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
    prisma.match.findUnique({
      where: { id: matchId },
      select: { homeTeam: true, awayTeam: true, homeScore: true, awayScore: true },
    }),
  ]);

  getIO().to(`user:${notification.recipientId}`).emit("notification:new", notification);

  if (user?.email && match) {
    await sendPredictionScoredEmail(user.email, points, match);
  }
};
