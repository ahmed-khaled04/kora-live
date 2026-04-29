import prisma from "../config/prisma.js";
import { getIO } from "../sockets/index.js";
import { deleteCache } from "../services/cache.service.js";
import { fetchLiveMatches } from "../services/sports.service.js";
import { mapMatch } from "../utils/match.js";
import { scorePrediction } from "./prediction-scorer.job.js";

export const matchPoller = async () => {
  console.log("[match-poller] Starting poll...");
  const data = await fetchLiveMatches();
  const liveMatches = data.events.map(mapMatch);
  console.log(`[match-poller] Fetched ${liveMatches.length} live matches`);

  const currentMatches = await prisma.$transaction(
    liveMatches.map((m) => {
      return prisma.match.findUnique({ where: { externalId: m.externalId } });
    }),
  );
  await prisma.$transaction(
    liveMatches.map((m) => {
      return prisma.match.upsert({
        where: { externalId: m.externalId },
        update: { status: m.status, homeScore: m.homeScore, awayScore: m.awayScore },
        create: m,
      });
    }),
  );
  console.log(`[match-poller] Upserted ${liveMatches.length} matches`);
  await deleteCache("matches:live");
  console.log("[match-poller] Cache invalidated");

  liveMatches.forEach((m, i) => {
    const oldMatch = currentMatches[i];
    if (!oldMatch) return;
    if (
      m.homeScore !== oldMatch.homeScore ||
      m.awayScore !== oldMatch.awayScore
    ) {
      console.log(`[match-poller] Score changed for match ${oldMatch.id} — emitting match:updated`);
      getIO().to(`match:${oldMatch.id}`).emit("match:updated", m);
    }
    if (m.status === "FINISHED" && oldMatch.status !== "FINISHED") {
      console.log(`[match-poller] Match ${oldMatch.id} just finished — triggering scorer`);
      scorePrediction(oldMatch.id);
    }
  });
  console.log("[match-poller] Poll complete");
};
