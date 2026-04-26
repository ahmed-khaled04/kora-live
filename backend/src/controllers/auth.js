import { validationResult } from "express-validator";

import {
  registerService,
  loginService,
  getCurrent,
} from "../services/auth.service.js";

export const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid data");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const { email, username, password } = req.body;

  try {
    const token = await registerService(email, username, password);
    return res
      .status(201)
      .json({ message: "User registered successfully", token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid data");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const { email, password } = req.body;

  try {
    const token = await loginService(email, password);
    return res
      .status(200)
      .json({ message: "User logged in successfully", token });
  } catch (err) {
    next(err);
  }
};

export const currentUser = async (req, res, next) => {
  try {
    const user = await getCurrent(req.userId);
    return res.status(200).json({ message: "Success", user });
  } catch (err) {
    next(err);
  }
};
