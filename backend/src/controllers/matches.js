import {
  getLiveMatches,
  getMatchById,
  getUpcomingMatches,
} from "../services/matches.service.js";

export const getLive = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const result = await getLiveMatches(page, limit);
    res.status(200).json({ message: "Success", result });
  } catch (err) {
    next(err);
  }
};

export const getUpcoming = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const result = await getUpcomingMatches(page, limit);
    res.status(200).json({ message: "Success", result });
  } catch (err) {
    next(err);
  }
};

export const getMatch = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await getMatchById(id);
    res.status(200).json({ message: "Success", result });
  } catch (err) {
    next(err);
  }
};
