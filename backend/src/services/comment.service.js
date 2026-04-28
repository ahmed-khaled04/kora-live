import prisma from "../config/prisma.js";
import { getIO } from "../sockets/index.js";

export const addComment = async (userId, matchId, content) => {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    const error = new Error("Match Not Found");
    error.statusCode = 404;
    throw error;
  }
  const comment = await prisma.comment.create({
    data: {
      userId: userId,
      matchId: matchId,
      content: content,
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });
  getIO().to(`match:${matchId}`).emit("comment:created", { comment });
  return comment;
};

export const getComments = async (matchId, page, limit) => {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    const error = new Error("Match Not Found");
    error.statusCode = 404;
    throw error;
  }
  const [comments, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where: { matchId },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where: { matchId } }),
  ]);
  return { comments, total };
};
