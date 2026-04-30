import prisma from "../config/prisma.js";
import { getIO } from "../sockets/index.js";
import { getCache, setCache, deleteCache } from "../services/cache.service.js";
import { fetchLiveMatches } from "../services/sports.service.js";
import { mapMatch } from "../utils/match.js";
import { scorePrediction } from "./prediction-scorer.job.js";

const PREV_LIVE_KEY = "poller:prev-live-ids";
const PREV_LIVE_TTL = 3600;

export const matchPoller = async () => {
  console.log("[match-poller] Starting poll...");
  const data = await fetchLiveMatches();
  const liveMatches = data.events.map(mapMatch);
  console.log(`[match-poller] Fetched ${liveMatches.length} live matches`);

  const currentLiveIds = new Set(liveMatches.map((m) => m.externalId));
  const prevLiveIds = (await getCache(PREV_LIVE_KEY)) ?? [];

  const disappearedIds = prevLiveIds.filter((id) => !currentLiveIds.has(id));
  if (disappearedIds.length > 0) {
    console.log(`[match-poller] ${disappearedIds.length} match(es) left live feed — checking if finished`);
    const disappeared = await prisma.match.findMany({
      where: { externalId: { in: disappearedIds }, status: { not: "FINISHED" } },
    });
    await prisma.match.updateMany({
      where: { externalId: { in: disappearedIds }, status: { not: "FINISHED" } },
      data: { status: "FINISHED" },
    });
    for (const match of disappeared) {
      console.log(`[match-poller] Match ${match.id} marked finished — triggering scorer`);
      scorePrediction(match.id);
    }
  }

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

  await setCache(PREV_LIVE_KEY, [...currentLiveIds], PREV_LIVE_TTL);
  await deleteCache("matches:live");
  console.log("[match-poller] Cache updated");

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
  });
  console.log("[match-poller] Poll complete");
};
