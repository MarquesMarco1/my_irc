const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the IRC server');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const channels = {};

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('joinChannel', (channel) => {
    socket.join(channel);
    if (!channels[channel]) {
      channels[channel] = [];
    }
    channels[channel].push(socket.id);
    io.to(channel).emit('message', `User ${socket.id} joined channel ${channel}`);
  });

  socket.on('leaveChannel', (channel) => {
    socket.leave(channel);
    if (channels[channel]) {
      channels[channel] = channels[channel].filter(id => id !== socket.id);
      io.to(channel).emit('message', `User ${socket.id} left channel ${channel}`);
    }
  });

  socket.on('message', ({ channel, message }) => {
    io.to(channel).emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    for (const channel in channels) {
      channels[channel] = channels[channel].filter(id => id !== socket.id);
      io.to(channel).emit('message', `User ${socket.id} disconnected`);
    }
  });
});

