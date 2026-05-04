import express from "express";
import cors from "cors";

import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import matchesRouter from "./routes/matches.js";
import leaderboardRouter from "./routes/leaderboard.js";
import notificationsRouter from "./routes/notifications.js";
import devRouter from "./routes/dev.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/notifications", notificationsRouter);
if (process.env.NODE_ENV !== "production") {
  app.use("/api/dev", devRouter);
}

app.use(errorHandler);

export default app;
