import { createServer } from "http";

import { initSocket } from "./sockets/index.js";
import app from "./app.js";
import prisma from "./config/prisma.js";
import "./jobs/notification.worker.js";

const PORT = process.env.PORT || 3001;

async function start() {
  await prisma.$connect();
  console.log("Database connected");

  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
  });
}

start();
