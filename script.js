// Player factory function
const createPlayer = (name, marker) => {
  return { name, marker };
};

// Gameboard Module (IIFE)
const Gameboard = (function () {
  const board = ['', '', '', '', '', '', '', '', ''];

  const getBoard = () => [...board]; // return copy to prevent direct mutation

  const setMarker = (index, marker) => {
    if (index < 0 || index > 8 || board[index] !== '') return false;
    board[index] = marker;
    return true;
  };

  const reset = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = '';
    }
  };

  const isFull = () => board.every(cell => cell !== '');

  return { getBoard, setMarker, reset, isFull };
})();

// Display Controller Module (IIFE)
const DisplayController = (function () {
  const cells = document.querySelectorAll('.gameCell');
  const messageElem = document.querySelector('.gameStatus');
  const restartBtn = document.querySelector('.restart-btn');

  const render = () => {
    const currentBoard = Gameboard.getBoard();
    cells.forEach((cell, i) => {
      cell.textContent = currentBoard[i];
      cell.classList.remove('X', 'O', 'winning');
      if (currentBoard[i]) {
        cell.classList.add(currentBoard[i]);
      }
    });
  };

  const setMessage = (text) => {
    messageElem.textContent = text;
  };

  const highlightWin = (winningCombo) => {
    winningCombo.forEach(index => {
      cells[index].classList.add('winning');
    });
  };

  // Public API
  return { render, setMessage, highlightWin };
})();

// Game flow (main controller - also module-like)
const Game = (function () {
  const playerX = createPlayer('Player X', 'X');
  const playerO = createPlayer('Player O', 'O');
  let activePlayer = playerX;
  let isGameOver = false;

  const winningCombos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  const checkWinner = () => {
    const board = Gameboard.getBoard();
    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return combo;
      }
    }
    return null;
  };

  const playTurn = (index) => {
    if (isGameOver) return;

    const placed = Gameboard.setMarker(index, activePlayer.marker);
    if (!placed) return;

    DisplayController.render();

    const winCombo = checkWinner();
    if (winCombo) {
      DisplayController.setMessage(`${activePlayer.name} wins!`);
      DisplayController.highlightWin(winCombo);
      isGameOver = true;
      return;
    }

    if (Gameboard.isFull()) {
      DisplayController.setMessage("It's a draw!");
      isGameOver = true;
      return;
    }

    // Switch turn
    activePlayer = activePlayer === playerX ? playerO : playerX;
    DisplayController.setMessage(`${activePlayer.name}'s turn`);
  };

  const startNewGame = () => {
    Gameboard.reset();
    activePlayer = playerX;
    isGameOver = false;
    DisplayController.render();
    DisplayController.setMessage("Player X starts – click a cell!");
  };

  // Set up event listeners once
  const cells = document.querySelectorAll('.gameCell');
  cells.forEach((cell, index) => {
    cell.addEventListener('click', () => playTurn(index));
  });

  document.querySelector('.restart-btn').addEventListener('click', startNewGame);

  // Initial setup
  startNewGame();

  // For debugging in console if needed: Game.restart()
  return { restart: startNewGame };
})();