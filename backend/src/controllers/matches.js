import {
  getLiveMatches,
  getMatchById,
  getUpcomingMatches,
} from "../services/matches.service.js";

export const getLive = async (req, res, next) => {
  try {
    const result = await getLiveMatches();
    res.status(200).json({ message: "Success", result });
  } catch (err) {
    next(err);
  }
};
export const getUpcoming = async (req, res, next) => {
  try {
    const result = await getUpcomingMatches();
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
