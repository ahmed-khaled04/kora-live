import api from "./axios";

export const getLiveMatches = (page = 1, limit = 10) =>
  api.get("/matches/live", { params: { page, limit } }).then((r) => r.data.result);

export const getUpcomingMatches = (page = 1, limit = 10) =>
  api.get("/matches/upcoming", { params: { page, limit } }).then((r) => r.data.result);

export const getMatch = (id) =>
  api.get(`/matches/${id}`).then((r) => r.data.result);

export const getComments = (matchId, page = 1) =>
  api.get(`/matches/${matchId}/comments`, { params: { page, limit: 10 } }).then((r) => r.data.result);

export const postComment = (matchId, content) =>
  api.post(`/matches/${matchId}/comments`, { content }).then((r) => r.data.result);

export const getReactions = (matchId) =>
  api.get(`/matches/${matchId}/reactions`).then((r) => r.data.result);

export const postReaction = (matchId, type) =>
  api.post(`/matches/${matchId}/reactions`, { type }).then((r) => r.data.result);

export const deleteReaction = (matchId) =>
  api.delete(`/matches/${matchId}/reactions`);

export const postPrediction = (matchId, predictedHome, predictedAway) =>
  api.post(`/matches/${matchId}/predictions`, { predictedHome, predictedAway }).then((r) => r.data.result);
