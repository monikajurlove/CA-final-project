require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const main_router = require('./routers/mainRouter');
const mongoose = require('mongoose');

const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

mongoose.connect(process.env.MONGO_KEY)
    .then(() => console.log('mongodb connected'))
    .catch((err) => console.error(err));

app.use(cors());
app.use(express.json());
app.use('/', main_router);

const http_server = createServer(app);
const io = new Server(http_server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.set('io', io);

function handleJoin(socket, token) {
    try {
        const decodedUser = jwt.verify(token, jwtSecret); //decode token, get user info
        const room = `user:${decodedUser._id}`; //create private room
        socket.join(room); //join private room (for poke)

        //store userID and username in socket
        socket.data.userId = String(decodedUser._id);
        socket.data.username = decodedUser.username;

        socket.emit('joined', { ok: true }); //confirm join
    } catch (e) {
        //if token is invalid, do nothing
    }
}

io.on('connection', (socket) => {
    // auth join private room for poke
    socket.on('join', (token) => handleJoin(socket, token));

    // join global chat room
    socket.on('globalJoin', () => {
        if (!socket.data?.userId) return; // only if authenticated
        socket.join('global');
    });

    // send and receive messages to chat room
    socket.on('globalMessage', (text) => {
        if (!socket.data?.userId) return; // only if authenticated

        const t = String(text || '').trim();
        if (!t) return; // ignore if message is empty

        const msg = { //build message obj
            userId: socket.data.userId,
            username: socket.data.username,
            text: t,
            time: Date.now(),
        };

        io.to('global').emit('globalMessage', msg); // send to all in global chat
    });
});

http_server.listen(2500, () => console.log('2500'));
