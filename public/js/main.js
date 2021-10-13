const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".room__chat");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUser(users);
});

socket.on("message", (message) => {
  outputMessage(message);
});

chatMessages.scrollTop = chatMessages.scrollHeight;

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

const outputMessage = (message) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="data">${message.username} <span>${message.time}</span></p>
  <p class="text">
  ${message.text}
  </p>`;
  document.querySelector(".room__chat").appendChild(div);
};

const outputRoomName = (room) => {
  roomName.innerText = room;
};

const outputUser = (users) => {
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
};
