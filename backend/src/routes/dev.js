import { Router } from "express";
import { pollMatches } from "../controllers/dev.controller.js";

const router = Router();

router.post("/poll-matches", pollMatches);

export default router;
