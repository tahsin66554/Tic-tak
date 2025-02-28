const socket = io();
let playerSymbol = "";
let room = "";

// গেমে যোগ দিন
function joinGame() {
    room = document.getElementById("roomInput").value;
    if (room) {
        socket.emit("joinGame", room);
    }
}

// বোর্ড তৈরি
function createBoard() {
    let boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener("click", handleMove);
            boardDiv.appendChild(cell);
        }
    }
}

// সক্রিয় প্লেয়ার আপডেট
socket.on("updatePlayers", (players) => {
    let playerList = document.getElementById("activePlayers");
    playerList.innerHTML = players.map(player => `<li>${player.id} - Room: ${player.room || 'Waiting'}</li>`).join('');
});

// খেলোয়াড় তথ্য সেট
socket.on("playerData", (data) => {
    playerSymbol = data.symbol;
    room = data.room;
    document.getElementById("status").innerText = `You are playing as ${playerSymbol}`;
    createBoard();
});

// চাল দেওয়া
function handleMove(event) {
    let row = event.target.dataset.row;
    let col = event.target.dataset.col;
    if (event.target.textContent === "") {
        socket.emit("makeMove", { room, row, col, symbol: playerSymbol });
    }
}

// বোর্ড আপডেট
socket.on("updateBoard", (board) => {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    board.forEach((row, r) => {
        row.forEach((cell, c) => {
            let cellDiv = document.createElement("div");
            cellDiv.classList.add("cell");
            cellDiv.dataset.row = r;
            cellDiv.dataset.col = c;
            cellDiv.textContent = cell || '';
            cellDiv.addEventListener("click", handleMove);
            boardDiv.appendChild(cellDiv);
        });
    });
});

// গেম শুরু
socket.on("gameStart", () => {
    alert("Game is starting in your room!");
});

// নতুন প্লেয়ার যুক্ত
socket.on("newPlayer", (playerId) => {
    console.log(`নতুন প্লেয়ার যুক্ত হয়েছে: ${playerId}`);
});

// প্লেয়ার গেম ছেড়েছে
socket.on("playerLeft", (playerId) => {
    console.log(`প্লেয়ার গেম ছেড়েছে: ${playerId}`);
});

// গেম শেষ
socket.on("gameOver", ({ winner }) => {
    alert(`${winner} wins!`);
    createBoard();
});
