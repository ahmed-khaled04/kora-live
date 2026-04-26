import app from "./app.js";
import prisma from "./config/prisma.js";

const PORT = process.env.PORT || 3001;

async function start() {
  await prisma.$connect();
  console.log("Database connected");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
