const board = document.getElementById("board");
const statusText = document.getElementById("status");
let currentPlayer = "X";
let cells = Array(16).fill("");
let gameActive = true;

// **গেম বোর্ড তৈরি করা**
function createBoard() {
    board.innerHTML = "";
    cells.forEach((_, index) => {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = index;
        cell.addEventListener("click", handleClick);
        board.appendChild(cell);
    });
}

// **খেলোয়াড়ের চাল**
function handleClick(event) {
    if (!gameActive) return;
    let index = event.target.dataset.index;
    
    if (cells[index] === "") {
        cells[index] = currentPlayer;
        event.target.innerText = currentPlayer;
        event.target.classList.add("taken");

        if (checkWin(currentPlayer)) {
            statusText.innerText = `${currentPlayer} Wins!`;
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.innerText = `AI's Turn...`;

        setTimeout(aiMove, 500); // **AI opponent move**
    }
}

// **AI opponent (random move)**
function aiMove() {
    if (!gameActive) return;

    let available = cells.map((val, idx) => (val === "" ? idx : null)).filter(val => val !== null);
    
    if (available.length > 0) {
        let move = available[Math.floor(Math.random() * available.length)];
        cells[move] = "O";
        document.querySelector(`[data-index='${move}']`).innerText = "O";
        document.querySelector(`[data-index='${move}']`).classList.add("taken");

        if (checkWin("O")) {
            statusText.innerText = `O Wins!`;
            gameActive = false;
            return;
        }

        currentPlayer = "X";
        statusText.innerText = "Your Turn (X)";
    }
}

// **জয়ের চেক (4×4)**
function checkWin(player) {
    const winPatterns = [
        [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // **Rows**
        [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // **Columns**
        [0, 5, 10, 15], [3, 6, 9, 12] // **Diagonals**
    ];

    return winPatterns.some(pattern => pattern.every(index => cells[index] === player));
}

// **গেম রিসেট**
function resetGame() {
    cells = Array(16).fill("");
    gameActive = true;
    currentPlayer = "X";
    statusText.innerText = "Your Turn (X)";
    createBoard();
}

// **গেম চালু করুন**
createBoard();