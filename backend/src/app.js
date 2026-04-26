import express from "express";

import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

app.use(express.json());

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);

export default app;
