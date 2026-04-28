import { Router } from "express";
import { body } from "express-validator";

import { getLive, getMatch, getUpcoming } from "../controllers/matches.js";
import { fetchComments, postComment } from "../controllers/comments.js";
import {
  getReactions,
  postReaction,
  deleteReaction,
} from "../controllers/reactions.js";
import { postPrediction } from "../controllers/predictions.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Live Data
router.get("/live", getLive);
router.get("/upcoming", getUpcoming);
router.get("/:id", getMatch);

// Comments
router.get("/:id/comments", fetchComments);
router.post(
  "/:id/comments",
  authenticate,
  body("content", "Comment is empty").notEmpty(),
  postComment,
);

// Reactions
router.get("/:id/reactions", getReactions);
router.post(
  "/:id/reactions",
  authenticate,
  body("type")
    .isIn(["FIRE", "GOAL", "SHOCKED", "LAUGH", "SAD"])
    .withMessage("Invalid Type"),
  postReaction,
);
router.delete("/:id/reactions", authenticate, deleteReaction);

// Predictions
router.post(
  "/:id/predictions",
  authenticate,
  [
    body("predictedHome", "Score cant negative or empty")
      .notEmpty()
      .isInt({ min: 0 }),
    body("predictedAway", "Score cant negative or empty")
      .notEmpty()
      .isInt({ min: 0 }),
  ],
  postPrediction,
);

export default router;
