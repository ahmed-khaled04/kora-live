import prisma from "../config/prisma.js";
import { getCache, setCache } from "./cache.service.js";
import {
  fetchLiveMatches,
  fetchMatchById,
  fetchUpcomingMatches,
} from "./sports.service.js";

const mapStatus = (type) => {
  const map = {
    inprogress: "LIVE",
    notstarted: "SCHEDULED",
    finished: "FINISHED",
    postponed: "POSTPONED",
    cancelled: "CANCELLED",
  };
  return map[type] ?? "SCHEDULED";
};

const mapMatch = (event) => ({
  externalId: event.id,
  homeTeam: event.homeTeam.name,
  awayTeam: event.awayTeam.name,
  homeLogo: `https://api.sofascore.com/api/v1/team/${event.homeTeam.id}/image`,
  awayLogo: `https://api.sofascore.com/api/v1/team/${event.awayTeam.id}/image`,
  league: event.tournament.name,
  homeScore: event.homeScore?.current ?? null,
  awayScore: event.awayScore?.current ?? null,
  kickoff: new Date(event.startTimestamp * 1000),
  venue: null,
  status: mapStatus(event.status.type),
});

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
