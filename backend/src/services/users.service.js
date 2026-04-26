import prisma from "../config/prisma.js";

export const getProfileService = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      avatar: true,
      createdAt: true,
      _count: { select: { followers: true, following: true } },
    },
  });
  if (!user) {
    const error = new Error("User Not Found");
    error.statusCode = 404;
    throw error;
  }
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    createdAt: user.createdAt,
    followersCount: user._count.followers,
    followingCount: user._count.following,
  };
};

export const followService = async (followerId, followingId) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: followingId },
  });
  if (!targetUser) {
    const error = new Error("User Not Found");
    error.statusCode = 404;
    throw error;
  }
  if (followerId === followingId) {
    const error = new Error("Invalid operation");
    error.statusCode = 400;
    throw error;
  }
  const followExists = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
  if (followExists) {
    return;
  }
  await prisma.follow.create({
    data: {
      followerId: followerId,
      followingId: followingId,
    },
  });
  return;
};

export const unfollowService = async (followerId, followingId) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: followingId },
  });
  if (!targetUser) {
    const error = new Error("User Not Found");
    error.statusCode = 404;
    throw error;
  }
  const followExists = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
  if (!followExists) {
    const error = new Error("Follow Not Found");
    error.statusCode = 404;
    throw error;
  }
  const result = await prisma.follow.delete({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return result;
};
