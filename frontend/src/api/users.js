import api from "./axios";

export const getProfile = (id) =>
  api.get(`/users/${id}`).then((r) => r.data.user);

export const follow = (id) =>
  api.post(`/users/${id}/follow`).then((r) => r.data);

export const unfollow = (id) =>
  api.delete(`/users/${id}/follow`).then((r) => r.data);

export const getFollowers = (id, page = 1) =>
  api.get(`/users/${id}/followers`, { params: { page, limit: 10 } }).then((r) => r.data);

export const getFollowing = (id, page = 1) =>
  api.get(`/users/${id}/following`, { params: { page, limit: 10 } }).then((r) => r.data);

export const updateAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.patch("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data.user);
};
