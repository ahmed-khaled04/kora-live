import { Router } from "express";
import { body } from "express-validator";

import { getLive, getMatch, getUpcoming } from "../controllers/matches.js";
import { fetchComments, postComment } from "../controllers/comments.js";
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

export default router;
