const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { formatMessage } = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

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

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users:getRoomUsers(user.room)
    })
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.io);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if(user) {
    io.to(user.room).emit("message", formatMessage("admin", `${user.username} has left the chat`));
    };

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users:getRoomUsers(user.room)
    })
  });
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
