import api from "./axios";

export const getLeaderboard = (period = "all", page = 1) =>
  api.get("/leaderboard", { params: { period, page, limit: 20 } }).then((r) => r.data.result);
