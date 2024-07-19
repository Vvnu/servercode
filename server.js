const dotenv = require('dotenv');
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
dotenv.config();

const frontendURL = process.env.CLIENTURL;

app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: frontendURL,
        methods: ['GET', 'POST'],
    },
});

// Object to store user data, including username and avatar
const users = {};

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('joinroom', (data) => {
        console.log(data);
        socket.join(data.roomId);

        // Store user data when they join the room
        users[socket.id] = { username: data.username, roomId: data.roomId, avatar: data.avatar };

        // Emit updated user list to all clients in the room, including avatars
        io.to(data.roomId).emit('userList', Object.values(users));

        // Broadcast toast message to all clients in the room
        io.to(data.roomId).emit('toast', `${data.username} joined the room`);
    });

    socket.on('send', (data) => {
        console.log(data);
        io.to(data.roomId).emit('receive', data);
    });

    socket.on('disconnect', () => {
        // Get username and avatar of the disconnected user
        const { username, roomId } = users[socket.id] || {};

        console.log('yesssssssssssssssssssssssssssssss');
        // Remove user data when they disconnect
        delete users[socket.id];

        // Emit updated user list to all clients in the room, including avatars
        io.to(roomId).emit('userList', Object.values(users));

        // Broadcast toast message to all clients in the room
        io.to(roomId).emit('toast', `${username} left the room`);
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
