const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

let rooms = {}; // রুমের তথ্য সংরক্ষণ
let activePlayers = {}; // সক্রিয় প্লেয়ারদের তালিকা

io.on("connection", (socket) => {
    console.log("নতুন প্লেয়ার যুক্ত হয়েছে:", socket.id);
    activePlayers[socket.id] = { id: socket.id, room: null };
    io.emit("updatePlayers", Object.values(activePlayers));

    socket.on("joinGame", (room) => {
        if (!rooms[room]) {
            rooms[room] = { board: Array(6).fill(null).map(() => Array(6).fill(null)), players: [] };
        }
        
        if (rooms[room].players.length < 2) {
            const playerSymbol = rooms[room].players.length === 0 ? "X" : "O";
            rooms[room].players.push({ id: socket.id, symbol: playerSymbol });
            activePlayers[socket.id].room = room;
            socket.join(room);
            socket.emit("playerData", { symbol: playerSymbol, room });
            io.emit("updatePlayers", Object.values(activePlayers));
            io.to(room).emit("updateBoard", rooms[room].board);
            
            if (rooms[room].players.length === 2) {
                setTimeout(() => {
                    io.to(room).emit("gameStart");
                }, 10000);
            }
        }
    });

    socket.on("makeMove", ({ room, row, col, symbol }) => {
        if (rooms[room] && rooms[room].board[row][col] === null) {
            rooms[room].board[row][col] = symbol;
            io.to(room).emit("updateBoard", rooms[room].board);
            if (checkWinner(rooms[room].board, symbol)) {
                io.to(room).emit("gameOver", { winner: symbol });
                rooms[room].board = Array(6).fill(null).map(() => Array(6).fill(null));
            }
        }
    });

    socket.on("disconnect", () => {
        if (activePlayers[socket.id]) {
            const room = activePlayers[socket.id].room;
            if (room && rooms[room]) {
                rooms[room].players = rooms[room].players.filter(player => player.id !== socket.id);
            }
            delete activePlayers[socket.id];
            io.emit("updatePlayers", Object.values(activePlayers));
        }
        console.log("প্লেয়ার গেম ছেড়েছে:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("সার্ভার চলছে http://localhost:3000");
});

function checkWinner(board, symbol) {
    for (let i = 0; i < 6; i++) {
        if (board[i].every(cell => cell === symbol)) return true;
        if (board.every(row => row[i] === symbol)) return true;
    }
    if (board.every((row, i) => row[i] === symbol)) return true;
    if (board.every((row, i) => row[5 - i] === symbol)) return true;
    return false;
                    }
