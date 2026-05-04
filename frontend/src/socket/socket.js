import { io } from "socket.io-client";

let socket = null;

export function initSocket(token) {
  socket = io("http://localhost:8080", { auth: { token } });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
