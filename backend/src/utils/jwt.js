import jwt from "jsonwebtoken";

export const signToken = (userId) => {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
