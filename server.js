const path = require("path");
const express = require("express");
const socket = require("socket.io");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const { formatMessage } = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const ENV = process.env.NODE_ENV || 'dev';
dotenv.config({path: path.resolve(__dirname, `./config/${ENV}.env`)});
const uriStr = process.env.MONGO_URI;

const client = new MongoClient(uriStr);

app.use(cors());

let collection;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ username, room }) => {
    try {
      const user = userJoin(socket.id, username, room);
      let result = await collection.findOne({"roomName": user.room});
      if(!result) {
        await collection.insertOne({"roomName": user.room, message: [] });
      };
      socket.join(user.room);
      socket.emit("message", formatMessage("Room Bot", "Welcome to Room 👋 "));
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(
            "Room Bot",
            `${user.username} has joined the Room! Hi 👋 `
          )
        );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    //collection.updateOne({"roomName": user.room})
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("Room Bot", `${user.username} has left the Room! Bye 👋`)
      );
    }
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
});

app.get("/chats", async (req, res) => {
  try {
    let result = await collection.findOne({ "_id": request.query.room });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, async () => {
  try {
    await client.connect();
    collection = client.db("Rooms").collection("chats");
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.log(err);
  }
});