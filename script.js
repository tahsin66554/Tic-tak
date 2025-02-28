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
    socket.emit("makeMove", { room, row, col, symbol: playerSymbol });
}

// বোর্ড আপডেট
socket.on("updateBoard", ({ row, col, symbol }) => {
    document.querySelector(`[data-row='${row}'][data-col='${col}']`).textContent = symbol;
});

// গেম শেষ
socket.on("gameOver", ({ winner }) => {
    alert(`${winner} wins!`);
    createBoard();
});
