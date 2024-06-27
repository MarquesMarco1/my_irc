const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
        origin: "http://localhost:3001",
        methods: ['GET', 'POST'],
    }
});

const channelMembers = {};

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');

    socket.on('join channel', ({ username, channel }) => {
        socket.join(channel);
        socket.username = username;
        socket.channel = channel;

        if (!channelMembers[channel]) {
            channelMembers[channel] = [];
        }
        channelMembers[channel].push(username);

        io.to(channel).emit('update members', channelMembers[channel]);

        console.log(`${username} a rejoint le channel ${channel}`);
    });

    socket.on('disconnect', () => {
        const { username, channel } = socket;
        if (channelMembers[channel]) {
            channelMembers[channel] = channelMembers[channel].filter(member => member !== username);
            io.to(channel).emit('update members', channelMembers[channel]);
        }
        console.log(`${username} a quitté le channel ${channel}`);
    });

    socket.on('chat message', (msg) => {
        console.log(`${msg.username}: ${msg.message} [Channel: ${msg.channel}]`);
        io.to(msg.channel).emit('chat message', msg);
    });
});

server.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
