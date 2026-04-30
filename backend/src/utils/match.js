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

export const mapMatch = (event) => ({
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
