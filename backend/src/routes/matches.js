import { Router } from "express";

import { getLive, getMatch, getUpcoming } from "../controllers/matches.js";

const router = Router();

router.get("/live", getLive);
router.get("/upcoming", getUpcoming);
router.get("/:id", getMatch);

export default router;
