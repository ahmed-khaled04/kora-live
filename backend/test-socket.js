import { io } from "socket.io-client";

const BASE_URL = "http://localhost:8080";
const MATCH_ID = "453ba59d-a62e-4f0e-b010-f3f291e97522";

// --- Step 1: get a token ---
const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "test@test.com", password: "123456" }),
});
const { token } = await loginRes.json();

if (!token) {
  console.error("Login failed — update the email/password in this file");
  process.exit(1);
}
console.log("Logged in, token received");

// --- Step 2: connect two sockets ---
const socket1 = io(BASE_URL, { auth: { token } });
const socket2 = io(BASE_URL, { auth: { token } });

socket1.on("connect", () => {
  console.log("Socket 1 connected:", socket1.id);
  socket1.emit("match:join", { matchId: MATCH_ID });
  console.log("Socket 1 joined match room");
});

socket2.on("connect", () => {
  console.log("Socket 2 connected:", socket2.id);
  socket2.emit("match:join", { matchId: MATCH_ID });
  console.log("Socket 2 joined match room");
});

// --- Step 3: socket2 listens for events ---
let commentReceived = false;
let reactionReceived = false;

const tryExit = () => {
  if (commentReceived && reactionReceived) {
    socket1.disconnect();
    socket2.disconnect();
    process.exit(0);
  }
};

socket2.on("comment:created", ({ comment }) => {
  console.log(
    "Socket 2 received comment:created =>",
    comment.content,
    "by",
    comment.user.username,
  );
  commentReceived = true;
  tryExit();
});

socket2.on("reaction:updated", ({ counts }) => {
  console.log("Socket 2 received reaction:updated =>", counts);
  reactionReceived = true;
  tryExit();
});

socket1.on("connect_error", (err) =>
  console.error("Socket 1 error:", err.message),
);
socket2.on("connect_error", (err) =>
  console.error("Socket 2 error:", err.message),
);

// --- Step 4: after both connect, post a comment via HTTP ---
setTimeout(async () => {
  console.log("Posting comment via HTTP...");
  const res = await fetch(`${BASE_URL}/api/matches/${MATCH_ID}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content: "test comment from socket test" }),
  });
  const data = await res.json();
  console.log("HTTP response:", data.comment?.content ?? data);

  console.log("Posting reaction via HTTP...");
  const reactionRes = await fetch(
    `${BASE_URL}/api/matches/${MATCH_ID}/reactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type: "FIRE" }),
    },
  );
  const reactionData = await reactionRes.json();
  console.log("Reaction HTTP response:", reactionData);
}, 1000);

setTimeout(() => {
  console.error("Timeout — socket2 never received the event");
  process.exit(1);
}, 8000);
