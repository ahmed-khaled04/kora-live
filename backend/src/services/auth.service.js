import bcrypt from "bcryptjs";

import prisma from "../config/prisma.js";
import { signToken } from "../utils/jwt.js";

export const registerService = async (email, username, password, avatarUrl = null) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    const error = new Error(
      existing.email === email
        ? "Email already in use"
        : "Username already taken",
    );
    error.statusCode = 422;
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, username, passwordHash, avatar: avatarUrl },
  });

  return signToken(user.id);
};

export const loginService = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    const error = new Error("Incorrect email or password");
    error.statusCode = 401;
    throw error;
  }
  const isEqual = await bcrypt.compare(password, user.passwordHash);
  if (!isEqual) {
    const error = new Error("Incorrect email or password");
    error.statusCode = 401;
    throw error;
  }
  return signToken(user.id);
};

export const getCurrent = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};
