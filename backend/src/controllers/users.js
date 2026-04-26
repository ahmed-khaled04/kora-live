import {
  getProfileService,
  followService,
  unfollowService,
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
    console.log(result);
    return res.status(200).json({ message: "Follow removed" });
  } catch (err) {
    next(err);
  }
};
export const getFollowers = (req, res, next) => {};
export const getFollowing = (req, res, next) => {};
