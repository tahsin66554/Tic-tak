const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

let rooms = {}; // রুম সংরক্ষণ

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinGame", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);

    if (!rooms[room]) {
      rooms[room] = { players: [], board: Array(6).fill().map(() => Array(6).fill("")) };
    }

    if (rooms[room].players.length < 2) {
      rooms[room].players.push(socket.id);
      let playerSymbol = rooms[room].players.length === 1 ? "X" : "O";
      socket.emit("playerData", { symbol: playerSymbol, room: room });
    }

    if (rooms[room].players.length === 2) {
      io.to(room).emit("gameStart", { message: "Game Started!" });
    }
  });

  socket.on("makeMove", ({ room, row, col, symbol }) => {
    if (rooms[room] && rooms[room].board[row][col] === "") {
      rooms[room].board[row][col] = symbol;
      io.to(room).emit("updateBoard", { board: rooms[room].board, row, col, symbol });

      if (checkWin(rooms[room].board, row, col, symbol)) {
        io.to(room).emit("gameOver", { winner: symbol });
        delete rooms[room];
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// ৪টি একসাথে আছে কিনা চেক
function checkWin(board, row, col, symbol) {
  return checkDirection(board, row, col, symbol, 1, 0) ||
         checkDirection(board, row, col, symbol, 0, 1) ||
         checkDirection(board, row, col, symbol, 1, 1) ||
         checkDirection(board, row, col, symbol, 1, -1);
}

function checkDirection(board, row, col, symbol, rowDir, colDir) {
  let count = 1;
  count += countMarks(board, row, col, symbol, rowDir, colDir);
  count += countMarks(board, row, col, symbol, -rowDir, -colDir);
  return count >= 4;
}

function countMarks(board, row, col, symbol, rowDir, colDir) {
  let count = 0;
  for (let i = 1; i < 4; i++) {
    let r = row + i * rowDir;
    let c = col + i * colDir;
    if (r < 0 || r >= 6 || c < 0 || c >= 6 || board[r][c] !== symbol) break;
    count++;
  }
  return count;
}

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
