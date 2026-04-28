import { validationResult } from "express-validator";

import {
  fetchReaction,
  addReaction,
  removeReaction,
} from "../services/reaction.service.js";

export const getReactions = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await fetchReaction(id);
    res.status(200).json({ message: "Success", result });
  } catch (err) {
    next(err);
  }
};

export const postReaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid data");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const matchId = req.params.id;
  const type = req.body.type;
  try {
    const result = await addReaction(req.userId, matchId, type);
    res.status(201).json({ message: "Reaction upserted", result });
  } catch (err) {
    next(err);
  }
};

export const deleteReaction = async (req, res, next) => {
  const matchId = req.params.id;
  try {
    await removeReaction(req.userId, matchId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
