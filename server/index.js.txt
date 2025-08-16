// server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.use(cors());
app.use(helmet());

// simple health check
app.get("/health", (req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("move", (data) => {
    // broadcast movement to all players
    socket.broadcast.emit("player-move", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    socket.broadcast.emit("player-left", { id: socket.id });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log("Server running on port", PORT));
