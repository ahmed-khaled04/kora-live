import {
  getProfileService,
  followService,
  unfollowService,
  getFollowersService,
} from "../services/users.service.js";

export const getProfile = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await getProfileService(id);
    return res.status(200).json({ message: "Success", user });
  } catch (err) {
    next(err);
  }
};
export const follow = async (req, res, next) => {
  const followingId = req.params.id;
  const followerId = req.userId;

  try {
    const result = await followService(followerId, followingId);
    return res.status(201).json({ message: "Follow Success" });
  } catch (err) {
    next(err);
  }
};
export const unfollow = async (req, res, next) => {
  const followingId = req.params.id;
  const followerId = req.userId;

  try {
    const result = await unfollowService(followerId, followingId);
    return res.status(200).json({ message: "Follow removed" });
  } catch (err) {
    next(err);
  }
};
export const getFollowers = async (req, res, next) => {
  const id = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  try {
    const result = await getFollowersService(id, page, limit);
    return res.status(200).json({
      message: "Fetch Successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
export const getFollowing = (req, res, next) => {};
