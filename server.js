const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('একজন নতুন প্লেয়ার যুক্ত হয়েছে:', socket.id);

    // প্লেয়ারকে রুমে যুক্ত করা
    socket.join('gameRoom');

    // অন্য প্লেয়ারকে জানানো নতুন প্লেয়ার এসেছে
    socket.to('gameRoom').emit('newPlayer', socket.id);

    // প্লেয়ার ডিসকানেক্ট হলে
    socket.on('disconnect', () => {
        console.log('একজন প্লেয়ার গেম ছেড়েছে:', socket.id);
        socket.to('gameRoom').emit('playerLeft', socket.id);
    });

    // গেমের আপডেট পাঠানো (যেমন প্লেয়ারের অবস্থান)
    socket.on('playerMove', (data) => {
        socket.to('gameRoom').emit('updatePosition', data);
    });
});

server.listen(3000, () => {
    console.log('সার্ভার চলছে http://localhost:3000');
});
