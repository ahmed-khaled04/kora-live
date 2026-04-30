import { Router } from "express";

import { fetchLeaderboard } from "../controllers/leaderboard.js";

const router = Router();

router.get("/", fetchLeaderboard);

export default router;
