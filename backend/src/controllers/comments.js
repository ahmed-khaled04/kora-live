import { validationResult } from "express-validator";

import { getComments, addComment } from "../services/comment.service.js";

export const fetchComments = async (req, res, next) => {
  const id = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const result = await getComments(id, page, limit);
    res.status(200).json({ message: "Success", result });
  } catch (err) {
    next(err);
  }
};

export const postComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid data");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const matchId = req.params.id;
  const content = req.body.content;
  try {
    const result = await addComment(req.userId, matchId, content);
    res.status(201).json({ message: "Comment Added", result });
  } catch (err) {
    next(err);
  }
};
