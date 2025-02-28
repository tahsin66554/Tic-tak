const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let rooms = {}; // রুমের তথ্য সংরক্ষণ করার জন্য
let players = []; // সক্রিয় প্লেয়ার তালিকা

io.on('connection', (socket) => {
    console.log('একজন নতুন প্লেয়ার যুক্ত হয়েছে:', socket.id);
    players.push({ id: socket.id, room: null });
    io.emit('updatePlayers', players);

    // নতুন রুম তৈরি
    socket.on('createRoom', ({ room, password }) => {
        if (!rooms[room]) {
            rooms[room] = { board: Array(6).fill(null).map(() => Array(6).fill(null)), players: [], password };
        }
    });

    // রুমে যোগদান
    socket.on('joinRoom', ({ room, password }) => {
        if (!rooms[room]) {
            socket.emit('joinError', 'Room does not exist!');
            return;
        }
        if (rooms[room].password !== password) {
            socket.emit('joinError', 'Incorrect password!');
            return;
        }
        
        if (rooms[room].players.length < 2) {
            const playerSymbol = rooms[room].players.length === 0 ? 'X' : 'O';
            rooms[room].players.push({ id: socket.id, symbol: playerSymbol });
            socket.join(room);
            socket.emit('playerData', { symbol: playerSymbol, room });
            io.to(room).emit('updateBoard', rooms[room].board);
            
            players = players.map(p => p.id === socket.id ? { ...p, room } : p);
            io.emit('updatePlayers', players);
            
            if (rooms[room].players.length === 2) {
                setTimeout(() => {
                    io.to(room).emit('gameStart');
                }, 10000); // ১০ সেকেন্ড পরে গেম শুরু হবে
            }
        }
    });

    // প্লেয়ার মুভ (চাল দেওয়া)
    socket.on('makeMove', ({ room, row, col, symbol }) => {
        if (rooms[room] && rooms[room].board[row][col] === null) {
            rooms[room].board[row][col] = symbol;
            io.to(room).emit('updateBoard', rooms[room].board);
            if (checkWinner(rooms[room].board, symbol)) {
                io.to(room).emit('gameOver', { winner: symbol });
                rooms[room].board = Array(6).fill(null).map(() => Array(6).fill(null));
            }
        }
    });

    // প্লেয়ারের ডিসকানেক্ট ইভেন্ট
    socket.on('disconnect', () => {
        players = players.filter(p => p.id !== socket.id);
        io.emit('updatePlayers', players);
        for (const room in rooms) {
            rooms[room].players = rooms[room].players.filter(player => player.id !== socket.id);
            if (rooms[room].players.length === 0) {
                delete rooms[room];
            }
        }
    });
});

server.listen(3000, () => {
    console.log('সার্ভার চলছে http://localhost:3000');
});

// জয়ী চেক করার জন্য ফাংশন
function checkWinner(board, symbol) {
    for (let row = 0; row < 6; row++) {
        if (board[row].every(cell => cell === symbol)) return true;
    }
    for (let col = 0; col < 6; col++) {
        if (board.every(row => row[col] === symbol)) return true;
    }
    if (board.every((row, i) => row[i] === symbol)) return true;
    if (board.every((row, i) => row[5 - i] === symbol)) return true;
    return false;
}
