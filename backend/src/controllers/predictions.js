import { validationResult } from "express-validator";

import { addPrediction } from "../services/prediction.service.js";

export const postPrediction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid Data");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const matchId = req.params.id;
  const { predictedHome, predictedAway } = req.body;

  try {
    const result = await addPrediction(
      req.userId,
      matchId,
      predictedHome,
      predictedAway,
    );
    res.status(201).json({ message: "Predication submitted", result });
  } catch (err) {
    next(err);
  }
};
