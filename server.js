const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let rooms = {}; // রুমের তথ্য সংরক্ষণ করার জন্য

io.on('connection', (socket) => {
    console.log('একজন নতুন প্লেয়ার যুক্ত হয়েছে:', socket.id);

    // গেমে যোগদান
    socket.on('joinGame', (room) => {
        if (!rooms[room]) {
            rooms[room] = { board: Array(6).fill(Array(6).fill(null)), players: [] }; // 6x6 বোর্ড এবং খেলোয়াড়দের তথ্য
        }
        
        // প্লেয়ারের তথ্য পাঠানো
        const playerSymbol = rooms[room].players.length % 2 === 0 ? 'X' : 'O';
        rooms[room].players.push({ id: socket.id, symbol: playerSymbol });

        // প্লেয়ারকে রুমে যুক্ত করা
        socket.join(room);

        // প্লেয়ারের তথ্য পাঠানো
        socket.emit('playerData', { symbol: playerSymbol, room });

        // অন্য প্লেয়ারের কাছে নতুন প্লেয়ার আসার তথ্য পাঠানো
        socket.to(room).emit('newPlayer', socket.id);

        // গেমের বোর্ড স্টেট পাঠানো
        socket.emit('updateBoard', rooms[room].board);
    });

    // প্লেয়ার মুভ (চাল দেওয়া)
    socket.on('makeMove', ({ room, row, col, symbol }) => {
        if (rooms[room] && rooms[room].board[row][col] === null) {
            rooms[room].board[row][col] = symbol;

            // বোর্ড আপডেট করা
            io.to(room).emit('updateBoard', rooms[room].board);

            // গেম শেষে যদি কোনো জয়ী থাকে
            if (checkWinner(rooms[room].board, symbol)) {
                io.to(room).emit('gameOver', { winner: symbol });
                rooms[room].board = Array(6).fill(Array(6).fill(null)); // গেম শেষে বোর্ড রিসেট
            }
        }
    });

    // প্লেয়ারের ডিসকানেক্ট ইভেন্ট
    socket.on('disconnect', () => {
        for (const room in rooms) {
            const playerIndex = rooms[room].players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                rooms[room].players.splice(playerIndex, 1);
                socket.to(room).emit('playerLeft', socket.id);
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('সার্ভার চলছে http://localhost:3000');
});

// জয়ী চেক করার জন্য ফাংশন
function checkWinner(board, symbol) {
    // রো চেক করা
    for (let row = 0; row < 6; row++) {
        if (board[row].every(cell => cell === symbol)) return true;
    }
    
    // কলাম চেক করা
    for (let col = 0; col < 6; col++) {
        if (board.every(row => row[col] === symbol)) return true;
    }

    // ডায়াগোনাল চেক করা
    if (board.every((row, i) => row[i] === symbol)) return true;
    if (board.every((row, i) => row[5 - i] === symbol)) return true;

    return false;
}
