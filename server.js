const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require("socket.io");
const {formatMessage} = require('./utils/messages')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', (socket) => { 
  socket.emit('message', formatMessage('admin', 'Welcome to Chat'));  

  socket.broadcast.emit('message', formatMessage('admin','a user has connected to Chat'));

  socket.on('chatMessage', (msg) => {
    io.emit('message', formatMessage('user', msg));
  });

  socket.on('disconnect', () => {
    io.emit('message', formatMessage('admin','A user has left the chat'));
  });
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});