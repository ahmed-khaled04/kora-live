import prisma from "../config/prisma.js";
import { getCache, setCache } from "./cache.service.js";
import {
  fetchLiveMatches,
  fetchUpcomingMatches,
} from "./sports.service.js";
import { mapMatch } from "../utils/match.js";

const syncLive = async () => {
  const synced = await getCache("matches:live:synced");
  if (synced) return;

  const data = await fetchLiveMatches();
  const matches = data.events.map(mapMatch);
  await Promise.all(
    matches.map((match) =>
      prisma.match.upsert({
        where: { externalId: match.externalId },
        update: match,
        create: match,
      })
    )
  );
  await setCache("matches:live:synced", true, 60);
};

const syncUpcoming = async () => {
  const synced = await getCache("matches:upcoming:synced");
  if (synced) return;

  const today = new Date().toISOString().split("T")[0];
  const data = await fetchUpcomingMatches(today);
  const matches = data.events
    .filter((event) => event.status.type === "notstarted")
    .map(mapMatch);
  await Promise.all(
    matches.map((match) =>
      prisma.match.upsert({
        where: { externalId: match.externalId },
        update: match,
        create: match,
      })
    )
  );
  await setCache("matches:upcoming:synced", true, 300);
};

export const getLiveMatches = async (page, limit) => {
  await syncLive();

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where: { status: "LIVE" },
      orderBy: { kickoff: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.match.count({ where: { status: "LIVE" } }),
  ]);

  return { matches, total, page, limit };
};

export const getUpcomingMatches = async (page, limit) => {
  await syncUpcoming();

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where: { status: "SCHEDULED" },
      orderBy: { kickoff: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.match.count({ where: { status: "SCHEDULED" } }),
  ]);

  return { matches, total, page, limit };
};

export const getMatchById = async (id) => {
  const match = await prisma.match.findUnique({ where: { id } });
  return match;
};
