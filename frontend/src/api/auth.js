import api from "./axios";

export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data.token);

export const register = (email, username, password, avatarFile = null) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("username", username);
  formData.append("password", password);
  if (avatarFile) formData.append("avatar", avatarFile);
  return api.post("/auth/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data.token);
};

export const getMe = () =>
  api.get("/auth/me").then((r) => r.data.user);
