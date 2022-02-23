const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials:true
  },
});

io.on("connection", (socket) => {
  const id = socket.handshake.query.id;
  socket.join(id);

  socket.on("send-message", ({ recipients, text, time }) => {
    recipients.forEach((recipient) => {
      const newRecipients = recipients.filter((r) => r !== recipient);
      newRecipients.push(id);
      socket.broadcast
        .to(recipient)
        .emit("receive-message", {
          recipients: newRecipients,
          text,
          time,
          sender: id
        });
    });
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log("SERVER RUNNNING");
});