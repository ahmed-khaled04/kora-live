import api from "./axios";

export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data.token);

export const register = (email, username, password) =>
  api.post("/auth/register", { email, username, password }).then((r) => r.data.token);

export const getMe = () =>
  api.get("/auth/me").then((r) => r.data.user);
