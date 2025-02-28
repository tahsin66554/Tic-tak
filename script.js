const socket = io();
let playerSymbol = "";
let room = "";

document.getElementById("createRoomBtn").addEventListener("click", () => {
    const roomName = document.getElementById("roomInput").value;
    const password = document.getElementById("roomPassword").value;
    socket.emit("createRoom", { room: roomName, password: password });
});

document.getElementById("joinRoomBtn").addEventListener("click", () => {
    const roomName = document.getElementById("roomInput").value;
    const password = document.getElementById("roomPassword").value;
    socket.emit("joinRoom", { room: roomName, password: password });
});

socket.on("updateActiveUsers", (count) => {
    document.getElementById("activeUsers").innerText = `Active Users: ${count}`;
});

socket.on("roomList", (rooms) => {
    const roomList = document.getElementById("roomList");
    roomList.innerHTML = "";
    rooms.forEach((room) => {
        let listItem = document.createElement("li");
        listItem.innerText = room;
        roomList.appendChild(listItem);
    });
});

socket.on("roomError", (message) => {
    alert(message);
});

socket.on("playerData", (data) => {
    playerSymbol = data.symbol;
    room = data.room;
    document.getElementById("status").innerText = `You are playing as ${playerSymbol}`;
    createBoard();
});

socket.on("gameStart", (data) => {
    document.getElementById("status").innerText = data.message;
});

socket.on("updateBoard", ({ row, col, symbol }) => {
    document.querySelector(`#board .cell[data-row='${row}'][data-col='${col}']`).innerText = symbol;
});

socket.on("gameOver", ({ winner }) => {
    alert(`${winner} wins!`);
    createBoard();
});

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

function handleMove(event) {
    let row = event.target.dataset.row;
    let col = event.target.dataset.col;
    socket.emit("makeMove", { room, row, col, symbol: playerSymbol });
}
