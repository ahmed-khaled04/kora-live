import { getLeaderboard } from "../services/leaderboard.service.js";

export const fetchLeaderboard = async (req, res, next) => {
  const period = req.query.period || "all";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  try {
    const result = await getLeaderboard(period, page, limit);
    res.status(200).json({ message: "Fetched Successfully", result });
  } catch (err) {
    next(err);
  }
};
