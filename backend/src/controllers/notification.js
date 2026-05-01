import {
  fetchNotifications,
  readOne,
  readAll,
} from "../services/notification.service.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await fetchNotifications(req.userId);
    res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
};

export const markOneRead = async (req, res, next) => {
  try {
    await readOne(req.params.id, req.userId);
    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await readAll(req.userId);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};
