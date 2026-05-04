import { Router } from "express";

import {
  follow,
  getFollowers,
  getFollowing,
  getProfile,
  unfollow,
  updateAvatar,
} from "../controllers/users.js";

import { authenticate } from "../middleware/auth.js";
import { uploadAvatar } from "../middleware/upload.js";

const router = Router();

// GET /api/users/id
router.get("/:id", getProfile);

// POST /api/users/id/follow
router.post("/:id/follow", authenticate, follow);

// DELETE /api/users/id/follow
router.delete("/:id/follow", authenticate, unfollow);

router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

router.patch("/me/avatar", authenticate, uploadAvatar.single("avatar"), updateAvatar);

export default router;
