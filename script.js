const boardSize = 6;
const winCondition = 4;
let board = Array(boardSize).fill().map(() => Array(boardSize).fill(""));
let currentPlayer = "X";
let gameOver = false;

document.addEventListener("DOMContentLoaded", () => {
    createBoard();
    document.getElementById("restart").addEventListener("click", restartGame);
});

function createBoard() {
    let boardContainer = document.getElementById("board");
    boardContainer.innerHTML = "";
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", handleMove);
            boardContainer.appendChild(cell);
        }
    }
}

function handleMove(event) {
    if (gameOver) return;
    let row = event.target.dataset.row;
    let col = event.target.dataset.col;
    
    if (board[row][col] === "") {
        board[row][col] = currentPlayer;
        event.target.textContent = currentPlayer;

        if (checkWin(row, col)) {
            document.getElementById("status").textContent = `${currentPlayer} Wins!`;
            gameOver = true;
            return;
        }
        
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        
        if (currentPlayer === "O") {
            setTimeout(AIMove, 500); 
        }
    }
}

function AIMove() {
    if (gameOver) return;
    
    let bestMove = minimax(board, "O", 0);
    
    let row = bestMove.row;
    let col = bestMove.col;
    
    if (row !== -1 && col !== -1) {
        board[row][col] = "O";
        document.querySelector(`[data-row="${row}"][data-col="${col}"]`).textContent = "O";

        if (checkWin(row, col)) {
            document.getElementById("status").textContent = "AI Wins!";
            gameOver = true;
            return;
        }

        currentPlayer = "X";
    }
}

// Minimax Algorithm (With Mistake Factor)
function minimax(board, player, depth) {
    if (Math.random() < 0.2) {  
        return getRandomMove(); 
    }

    let bestScore = player === "O" ? -Infinity : Infinity;
    let bestMove = { row: -1, col: -1 };

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === "") {
                board[row][col] = player;
                let score = evaluateBoard(board, player);
                board[row][col] = ""; 

                if (player === "O") {
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row, col };
                    }
                } else {
                    if (score < bestScore) {
                        bestScore = score;
                        bestMove = { row, col };
                    }
                }
            }
        }
    }
    return bestMove;
}

function getRandomMove() {
    let emptyCells = [];
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === "") emptyCells.push({ row, col });
        }
    }
    return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : { row: -1, col: -1 };
}

function evaluateBoard(board, player) {
    return Math.random() * 10; 
}

function checkWin(row, col) {
    return checkDirection(row, col, 1, 0) || 
           checkDirection(row, col, 0, 1) || 
           checkDirection(row, col, 1, 1) || 
           checkDirection(row, col, 1, -1);
}

function checkDirection(row, col, rowDir, colDir) {
    let count = 1;
    count += countInDirection(row, col, rowDir, colDir);
    count += countInDirection(row, col, -rowDir, -colDir);
    return count >= winCondition;
}

function countInDirection(row, col, rowDir, colDir) {
    let count = 0;
    let player = board[row][col];
    for (let i = 1; i < winCondition; i++) {
        let newRow = parseInt(row) + rowDir * i;
        let newCol = parseInt(col) + colDir * i;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && board[newRow][newCol] === player) {
            count++;
        } else {
            break;
        }
    }
    return count;
}

function restartGame() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(""));
    gameOver = false;
    currentPlayer = "X";
    document.getElementById("status").textContent = "Your Turn!";
    createBoard();
                }
