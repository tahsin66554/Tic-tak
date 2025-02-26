const board = Array(6).fill(null).map(() => Array(6).fill(null));
const gameBoard = document.getElementById("game-board");
const statusText = document.getElementById("status");

let playerTurn = true; // True = Player, False = AI
const PLAYER_MARK = "X";
const AI_MARK = "O";

// Initialize the board
function createBoard() {
    gameBoard.innerHTML = "";
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", handlePlayerMove);
            gameBoard.appendChild(cell);
        }
    }
}

// Player move
function handlePlayerMove(event) {
    if (!playerTurn) return;

    const row = event.target.dataset.row;
    const col = event.target.dataset.col;

    if (board[row][col] === null) {
        board[row][col] = PLAYER_MARK;
        event.target.textContent = PLAYER_MARK;
        event.target.classList.add("x", "taken");
        playerTurn = false;

        if (checkWinner(PLAYER_MARK)) {
            statusText.textContent = "You Win!";
            return;
        }

        setTimeout(aiMove, 500);
    }
}

// AI move
function aiMove() {
    let bestMove = getBestMove();
    if (bestMove) {
        let { row, col } = bestMove;
        board[row][col] = AI_MARK;

        let cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = AI_MARK;
        cell.classList.add("o", "taken");

        if (checkWinner(AI_MARK)) {
            statusText.textContent = "AI Wins!";
            return;
        }
    }
    playerTurn = true;
}

// AI Logic (random mistakes)
function getBestMove() {
    let emptyCells = [];
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            if (board[row][col] === null) {
                emptyCells.push({ row, col });
            }
        }
    }

    // AI plays optimally but makes mistakes randomly
    if (Math.random() < 0.2) { // 20% mistake chance
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // Otherwise, find the best move
    return findWinningMove(AI_MARK) || findWinningMove(PLAYER_MARK) || emptyCells[0];
}

// Find winning move
function findWinningMove(mark) {
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            if (board[row][col] === null) {
                board[row][col] = mark;
                if (checkWinner(mark)) {
                    board[row][col] = null;
                    return { row, col };
                }
                board[row][col] = null;
            }
        }
    }
    return null;
}

// Check win condition (4 in a row)
function checkWinner(mark) {
    // Horizontal, Vertical, Diagonal checks
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            if (
                checkLine(row, col, 0, 1, mark) ||  // Horizontal
                checkLine(row, col, 1, 0, mark) ||  // Vertical
                checkLine(row, col, 1, 1, mark) ||  // Diagonal Right
                checkLine(row, col, 1, -1, mark)    // Diagonal Left
            ) {
                return true;
            }
        }
    }
    return false;
}

// Check 4-in-a-row in a given direction
function checkLine(row, col, rowDir, colDir, mark) {
    let count = 0;
    for (let i = 0; i < 4; i++) {
        let r = row + i * rowDir;
        let c = col + i * colDir;
        if (r >= 0 && r < 6 && c >= 0 && c < 6 && board[r][c] === mark) {
            count++;
        } else {
            break;
        }
    }
    return count === 4;
}

// Initialize the game
createBoard();
