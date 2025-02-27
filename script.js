// ----- Global Variables -----
const SIZE = 6;           // বোর্ডের আকার 6x6
const WIN_COUNT = 4;      // টানা 4 টি চিহ্ন মিললে জয়
const MAX_DEPTH = 3;      // Minimax গভীরতা (কম/বেশি করতে পারেন)

// বোর্ড ও খেলা সংক্রান্ত ভেরিয়েবল
let board = [];
let currentPlayer = "X";
let gameOver = false;

const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");

// ----- Initialize -----
document.addEventListener("DOMContentLoaded", () => {
  initBoard();
  restartBtn.addEventListener("click", restartGame);
});

// ----- Functions -----

// গেম বোর্ড সেটআপ
function initBoard() {
  board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(""));
  boardDiv.innerHTML = "";
  gameOver = false;
  currentPlayer = "X";
  statusText.textContent = "Your Turn (X)";

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", handlePlayerMove);
      boardDiv.appendChild(cell);
    }
  }
}

// খেলোয়াড়ের চাল
function handlePlayerMove(e) {
  if (gameOver || currentPlayer !== "X") return;

  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);

  // খালি জায়গায় চাল
  if (board[row][col] === "") {
    board[row][col] = "X";
    e.target.textContent = "X";
    e.target.classList.add("x");

    // জয় চেক
    if (checkWin(row, col, "X")) {
      statusText.textContent = "You Win!";
      gameOver = true;
      return;
    }

    // ড্র চেক
    if (isBoardFull()) {
      statusText.textContent = "Draw!";
      gameOver = true;
      return;
    }

    // পালা বদল
    currentPlayer = "O";
    statusText.textContent = "AI's Turn (O)";

    // AI চাল
    setTimeout(aiMove, 400);
  }
}

// AI চাল (Minimax + Alpha-Beta)
function aiMove() {
  if (gameOver) return;

  const bestMove = getBestMove();
  if (bestMove.row === -1 || bestMove.col === -1) {
    // কোনো মুভ নেই - ড্র
    statusText.textContent = "Draw!";
    gameOver = true;
    return;
  }

  // চাল প্রয়োগ
  board[bestMove.row][bestMove.col] = "O";
  const cell = document.querySelector(
    `[data-row='${bestMove.row}'][data-col='${bestMove.col}']`
  );
  cell.textContent = "O";
  cell.classList.add("o");

  // জয় চেক
  if (checkWin(bestMove.row, bestMove.col, "O")) {
    statusText.textContent = "AI Wins!";
    gameOver = true;
    return;
  }

  // ড্র চেক
  if (isBoardFull()) {
    statusText.textContent = "Draw!";
    gameOver = true;
    return;
  }

  // পালা বদল
  currentPlayer = "X";
  statusText.textContent = "Your Turn (X)";
}

// সেরা চাল বের করা (AI)
function getBestMove() {
  let bestVal = -Infinity;
  let move = { row: -1, col: -1 };

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === "") {
        board[r][c] = "O";
        let moveVal = alphaBeta(0, false, -Infinity, Infinity);
        board[r][c] = "";

        if (moveVal > bestVal) {
          bestVal = moveVal;
          move = { row: r, col: c };
        }
      }
    }
  }
  return move;
}

// Minimax with Alpha-Beta Pruning
function alphaBeta(depth, isMax, alpha, beta) {
  // শেষ অবস্থায় জয় বা হার চেক
  const score = evaluateState();
  if (Math.abs(score) === 9999 || depth === MAX_DEPTH || isBoardFull()) {
    return score;
  }

  if (isMax) {
    let best = -Infinity;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === "") {
          board[r][c] = "O";
          let val = alphaBeta(depth + 1, false, alpha, beta);
          board[r][c] = "";
          best = Math.max(best, val);
          alpha = Math.max(alpha, best);
          if (beta <= alpha) break;
        }
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === "") {
          board[r][c] = "X";
          let val = alphaBeta(depth + 1, true, alpha, beta);
          board[r][c] = "";
          best = Math.min(best, val);
          beta = Math.min(beta, best);
          if (beta <= alpha) break;
        }
      }
    }
    return best;
  }
}

// বর্তমান বোর্ডের মান (জয়/হার/অন্যান্য)
function evaluateState() {
  // যদি AI (O) জিতে থাকে
  if (checkAllWins("O")) {
    return 9999;
  }
  // যদি Player (X) জিতে থাকে
  if (checkAllWins("X")) {
    return -9999;
  }
  // অন্যথায় মধ্যবর্তী স্কোর
  return heuristicScore();
}

// **Heuristic**: AI এর সম্ভাব্য 4-লাইন কত, Player এর কত, তার ভিত্তিতে স্কোর
function heuristicScore() {
  let score = 0;
  score += countPotential("O") * 10; // AI এর সম্ভাবনা
  score -= countPotential("X") * 10; // Player এর সম্ভাবনা
  return score;
}

// সম্ভাব্য 4-লাইন গণনা
function countPotential(player) {
  let count = 0;
  // সব সেল চেক করে দেখবো 4-লাইন তৈরি করা যায় কিনা
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      // 4টি দিক: ডানে, নিচে, ডায়াগোনাল ডানে, ডায়াগোনাল বামে
      if (checkPotential(r, c, 0, 1, player)) count++;
      if (checkPotential(r, c, 1, 0, player)) count++;
      if (checkPotential(r, c, 1, 1, player)) count++;
      if (checkPotential(r, c, 1, -1, player)) count++;
    }
  }
  return count;
}

// নির্দিষ্ট দিকের 4 ঘরেই player বা খালি কি না, সেটি দেখার চেষ্টা
function checkPotential(row, col, rowDir, colDir, player) {
  let cellsInLine = [];
  for (let i = 0; i < WIN_COUNT; i++) {
    let nr = row + i * rowDir;
    let nc = col + i * colDir;
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) {
      return false;
    }
    cellsInLine.push(board[nr][nc]);
  }
  // যদি বিপরীত প্লেয়ারের মার্ক থাকে, তাহলে এটি সম্ভাব্য লাইন নয়
  // player-এর মার্ক বা "" থাকলে সম্ভাবনা আছে
  for (let val of cellsInLine) {
    if (val !== "" && val !== player) {
      return false;
    }
  }
  return true;
}

// আসলে কেউ জিতেছে কিনা চেক (পুরো বোর্ড)
function checkAllWins(mark) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === mark && checkWin(r, c, mark)) {
        return true;
      }
    }
  }
  return false;
}

// নির্দিষ্ট চালের পর জিতেছে কিনা
function checkWin(row, col, mark) {
  // 4টি দিক চেক
  return (
    checkDirection(row, col, mark, 1, 0) ||
    checkDirection(row, col, mark, 0, 1) ||
    checkDirection(row, col, mark, 1, 1) ||
    checkDirection(row, col, mark, 1, -1)
  );
}

// কোনো দিক দিয়ে টানা 4 আছে কিনা
function checkDirection(row, col, mark, rowDir, colDir) {
  let count = 1;
  count += countMarks(row, col, mark, rowDir, colDir);
  count += countMarks(row, col, mark, -rowDir, -colDir);
  return count >= WIN_COUNT;
}

function countMarks(row, col, mark, rowDir, colDir) {
  let c = 0;
  for (let i = 1; i < WIN_COUNT; i++) {
    let nr = row + i * rowDir;
    let nc = col + i * colDir;
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
    if (board[nr][nc] === mark) {
      c++;
    } else {
      break;
    }
  }
  return c;
}

// বোর্ডে খালি জায়গা আছে কিনা
function isBoardFull() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === "") return false;
    }
  }
  return true;
}

// রিস্টার্ট
function restartGame() {
  initBoard();
  }
