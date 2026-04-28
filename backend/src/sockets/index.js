import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("match:join", ({ matchId }) => {
      socket.join(`match:${matchId}`);
    });

    socket.on("match:leave", ({ matchId }) => {
      socket.leave(`match:${matchId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
