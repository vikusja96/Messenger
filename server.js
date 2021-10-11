const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { formatMessage } = require("./utils/messages");
const { userJoin, getCurrentUser } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit("message", formatMessage("admin", "Welcome to Chat"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("admin", `${user.username} has joined to Chat`)
      );
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.io);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    io.emit("message", formatMessage("admin", "A user has left the chat"));
  });
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
