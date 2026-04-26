import { Router } from "express";
import { body } from "express-validator";

import { authenticate } from "../middleware/auth.js";
import { register, login, currentUser } from "../controllers/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("username", "Enter a valid username")
      .notEmpty()
      .isLength({ min: 4, max: 12 }),
    body("password").isLength({ min: 6 }).withMessage("Password is too short"),
  ],
  register,
);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password should not be empty"),
  ],
  login,
);
router.get("/me", authenticate, currentUser);

export default router;
