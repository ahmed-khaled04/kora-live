import prisma from "../config/prisma.js";
import { getCache, setCache } from "./cache.service.js";
import {
  fetchLiveMatches,
  fetchMatchById,
  fetchUpcomingMatches,
} from "./sports.service.js";

import { mapMatch } from "../utils/match.js";

export const getLiveMatches = async () => {
  const cached = await getCache("matches:live");
  if (cached) return cached;

  const data = await fetchLiveMatches();
  const matches = data.events.map(mapMatch);

  for (const match of matches) {
    await prisma.match.upsert({
      where: { externalId: match.externalId },
      update: match,
      create: match,
    });
  }

  await setCache("matches:live", matches, 60);
  return matches;
};

export const getUpcomingMatches = async () => {
  const cached = await getCache("matches:upcoming");
  if (cached) return cached;

  const today = new Date().toISOString().split("T")[0];
  const data = await fetchUpcomingMatches(today);
  const matches = data.events
    .filter((event) => event.status.type === "notstarted")
    .map(mapMatch);

  for (const match of matches) {
    await prisma.match.upsert({
      where: { externalId: match.externalId },
      update: match,
      create: match,
    });
  }

  await setCache("matches:upcoming", matches, 300);
  return matches;
};

export const getMatchById = async (id) => {
  const match = await prisma.match.findUnique({ where: { id } });
  return match;
};
