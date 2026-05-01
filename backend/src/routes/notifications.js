import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import {
  getNotifications,
  markOneRead,
  markAllRead,
} from "../controllers/notification.js";

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);
router.patch("/:id/read", markOneRead);
router.patch("/read-all", markAllRead);

export default router;
