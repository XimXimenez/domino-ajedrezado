document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');
    const boardSizeSelect = document.getElementById('board-size');
    const dominoSetSelect = document.getElementById('domino-set');
    const playBtn = document.getElementById('play-btn');
    const gameInstructions = document.getElementById('game-instructions');
    const boardContainer = document.getElementById('board-container');
    const dominoList = document.getElementById('domino-list');
    const pieceCountSpan = document.getElementById('piece-count');
    const newGameBtn = document.getElementById('new-game-btn');

    // --- Game State ---
    let boardSize = 8;
    let dominoMaxNumber = 6;
    let draggingPiece = null;
    let isVertical = false;
    let rotation = 0;
    let originPiece = null; // To remember the piece from the list
    let boardState = []; // 2D array to hold board data

    // --- DOM Elements ---
    const rotateBtn = document.getElementById('rotate-btn');
    const piecesContainer = document.getElementById('pieces-container');
    const finishBtn = document.getElementById('finish-btn');
    const savedBoardsBtn = document.getElementById('saved-boards-btn');

    // Finish Modal Elements
    const finishModal = document.getElementById('finish-modal');
    const finishSummary = document.getElementById('finish-summary');
    const saveBtn = document.getElementById('save-btn');
    const continueBtn = document.getElementById('continue-btn');

    // Saved Boards Modal Elements
    const savedBoardsModal = document.getElementById('saved-boards-modal');
    const savedGamesList = document.getElementById('saved-games-list');
    const continuePlayingBtn = document.getElementById('continue-playing-btn');


    // --- Welcome Screen Logic ---
    function populateSelectors() {
        // Board sizes 5x5 to 12x12
        for (let i = 5; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}x${i}`;
            if (i === 8) option.selected = true;
            boardSizeSelect.appendChild(option);
        }

        // Domino sets 0-3 to 0-9
        for (let i = 3; i <= 9; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === 6) option.selected = true;
            dominoSetSelect.appendChild(option);
        }
    }

    // --- Game Setup ---
    function startGame() {
        boardSize = parseInt(boardSizeSelect.value);
        dominoMaxNumber = parseInt(dominoSetSelect.value);

        // Initialize board state
        boardState = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));

        // Update instructions
        gameInstructions.textContent = `¿Cuántas piezas del dominó que va del 0 al ${dominoMaxNumber} podés poner en este tablero? Elegí una pieza y ponela en el tablero con un click. Las piezas se pueden rotar con el botón derecho.`;

        // Switch screens
        welcomeScreen.style.display = 'none';
        gameScreen.style.display = 'block';

        generateBoard(boardSize);
        generateDominoes(dominoMaxNumber);

        pieceCountSpan.textContent = '0'; // Reset count
    }

    function generateBoard(size) {
        boardContainer.innerHTML = ''; // Clear previous board
        boardContainer.style.gridTemplateColumns = `repeat(${size}, 40px)`;
        boardContainer.style.gridTemplateRows = `repeat(${size}, 40px)`;
        boardContainer.style.position = 'relative'; // For absolute positioning of pieces

        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('board-cell');
            cell.dataset.row = Math.floor(i / size);
            cell.dataset.col = i % size;
            boardContainer.appendChild(cell);
        }
    }

    function generateDominoes(maxNumber) {
        dominoList.innerHTML = ''; // Clear previous list
        for (let i = 0; i <= maxNumber; i++) {
            for (let j = i; j <= maxNumber; j++) {
                const domino = createDominoElement(i, j);
                dominoList.appendChild(domino);
            }
        }
    }

    function createDominoElement(val1, val2) {
        const domino = document.createElement('div');
        domino.classList.add('domino');
        domino.dataset.value = `${val1}-${val2}`;

        const half1 = document.createElement('div');
        half1.classList.add('domino-half');
        half1.textContent = val1;

        const half2 = document.createElement('div');
        half2.classList.add('domino-half');
        half2.textContent = val2;

        domino.appendChild(half1);
        domino.appendChild(half2);
        return domino;
    }

    // --- Piece Interaction Logic ---
// New handlers for click-based interaction to be implemented in later steps
function handlePiecePickup(e) {
    // If a piece is already being dragged, do nothing.
    if (draggingPiece) return;

    const targetDomino = e.target.closest('.domino');
    if (targetDomino) {
        // Stop the click from bubbling up to piecesContainer, which would cancel the pickup.
        e.stopPropagation();

        originPiece = targetDomino;

        // Clone the piece to create the "in-hand" piece that follows the cursor
        draggingPiece = originPiece.cloneNode(true);
        rotation = parseInt(originPiece.dataset.rotation || '0', 10);
        isVertical = draggingPiece.classList.contains('vertical');

        draggingPiece.classList.add('dragging');
        document.body.appendChild(draggingPiece);

        // Immediately move the piece to the cursor's position
        movePiece(e.pageX, e.pageY);

        // Hide the original piece from the list so it can't be picked up again
        originPiece.style.visibility = 'hidden';

        // Add listeners to track mouse movement for the piece and to handle rotation
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('contextmenu', handleRotation);
    }
}

function handleBoardPlacementClick(e) {
    // If no piece is being dragged, there's nothing to place.
    if (!draggingPiece) return;

    // We calculate the target cell from the click's coordinates relative to the board.
    // This makes placement work even if the cursor is over an existing piece.
    const boardRect = boardContainer.getBoundingClientRect();
    const x = e.clientX - boardRect.left - 20;
    const y = e.clientY - boardRect.top - 20;

    // The cell size is hardcoded to 40px in generateBoard and CSS.
    const col = Math.floor(x / 40);
    const row = Math.floor(y / 40);

    // Proceed only if the calculated cell is within the board's grid.
    if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
        const cellSelector = `.board-cell[data-row='${row}'][data-col='${col}']`;
        const boardCell = boardContainer.querySelector(cellSelector);

        if (boardCell) {
            // The handleBoardClick function already contains all the complex logic
            // for validating the placement, updating the board state, and cleaning up.
            handleBoardClick(boardCell);
        }
    }
    // If the click is outside the board grid, we do nothing, leaving the piece "in-hand".
    }

    function handleMouseMove(e) {
        if (draggingPiece) {
            movePiece(e.pageX, e.pageY);
        }
    }

    function movePiece(x, y) {
        if (!draggingPiece) return;
        // Center the piece on the cursor
        const offsetX = draggingPiece.offsetWidth / 2;
        const offsetY = draggingPiece.offsetHeight / 2;
        draggingPiece.style.left = `${x - offsetX}px`;
        draggingPiece.style.top = `${y - offsetY}px`;
    }

    function updateDraggingPieceVisuals() {
        if (!draggingPiece) return;

        // Use originPiece for the canonical values
        const originalValues = originPiece.dataset.value.split('-').map(Number);
        const halves = draggingPiece.querySelectorAll('.domino-half');
        let v1, v2;

        switch (rotation) {
            case 0: // horizontal, normal
                v1 = originalValues[0];
                v2 = originalValues[1];
                draggingPiece.classList.remove('vertical');
                isVertical = false;
                break;
            case 1: // vertical, normal
                v1 = originalValues[0];
                v2 = originalValues[1];
                draggingPiece.classList.add('vertical');
                isVertical = true;
                break;
            case 2: // horizontal, swapped
                v1 = originalValues[1];
                v2 = originalValues[0];
                draggingPiece.classList.remove('vertical');
                isVertical = false;
                break;
            case 3: // vertical, swapped
                v1 = originalValues[1];
                v2 = originalValues[0];
                draggingPiece.classList.add('vertical');
                isVertical = true;
                break;
        }

        halves[0].textContent = v1;
        halves[1].textContent = v2;
        // Update the dragging piece's value to reflect the current rotation for placement logic
        draggingPiece.dataset.value = `${v1}-${v2}`;
    }

    function handleRotation(e) {
        if (draggingPiece) {
            e.preventDefault(); // Prevent context menu
            rotation = (rotation + 1) % 4;

            updateDraggingPieceVisuals();

            // Recenter after rotation
            movePiece(e.pageX, e.pageY);
        }
    }

    function dropPiece() {
        if (!draggingPiece) return;

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('contextmenu', handleRotation);

        document.body.removeChild(draggingPiece);
        if (originPiece) {
            originPiece.style.visibility = 'visible'; // Show original piece
        }

        draggingPiece = null;
        originPiece = null;
    }

    function returnPieceToList() {
        // 1. Clear board state
        const oldRow = parseInt(originPiece.dataset.row);
        const oldCol = parseInt(originPiece.dataset.col);
        const oldIsVertical = originPiece.classList.contains('vertical');
        boardState[oldRow][oldCol] = null;
        if (oldIsVertical) {
            boardState[oldRow + 1][oldCol] = null;
        } else {
            boardState[oldRow][oldCol + 1] = null;
        }

        // 2. Add a new piece to the domino list
        const canonicalValue = originPiece.dataset.value;
        const [val1, val2] = canonicalValue.split('-').map(Number);
        const newDominoInList = createDominoElement(val1, val2);
        dominoList.appendChild(newDominoInList);

        // 3. Remove the original piece from the board DOM
        originPiece.remove();

        // 4. Generic cleanup
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('contextmenu', handleRotation);

        document.body.removeChild(draggingPiece);

        draggingPiece = null;
        originPiece = null;

        updatePieceCount();
    }

    function handleMouseUp(e) {
        if (!draggingPiece) return;

        const boardCell = e.target.closest('.board-cell');
        if (boardCell) {
            handleBoardClick(boardCell);
        } else {
            // If not on board, drop the piece
            dropPiece();
        }
    }

    function handleBoardClick(cell) {
    if (!draggingPiece) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const values = draggingPiece.dataset.value.split('-').map(Number);

        let row2 = row;
        let col2 = col;
        if (isVertical) {
            row2 += 1;
        } else {
            col2 += 1;
        }

        // Temporarily clear the origin piece from the board state for validation
        if (originPiece.parentElement.id === 'board-container') {
            const oldRow = parseInt(originPiece.dataset.row);
            const oldCol = parseInt(originPiece.dataset.col);
            const oldIsVertical = originPiece.classList.contains('vertical');
            boardState[oldRow][oldCol] = null;
            if (oldIsVertical) boardState[oldRow + 1][oldCol] = null;
            else boardState[oldRow][oldCol + 1] = null;
        }

        const canPlace = isValidPlacement(values[0], row, col, values[1], row2, col2);

        // If placement is invalid, restore the original piece's state if it was from the board
        if (!canPlace && originPiece.parentElement.id === 'board-container') {
            const oldRow = parseInt(originPiece.dataset.row);
            const oldCol = parseInt(originPiece.dataset.col);
            const oldIsVertical = originPiece.classList.contains('vertical');
            const oldValues = originPiece.dataset.value.split('-').map(Number);
            boardState[oldRow][oldCol] = { value: oldValues[0], pieceId: originPiece.dataset.value };
            if (oldIsVertical) boardState[oldRow + 1][oldCol] = { value: oldValues[1], pieceId: originPiece.dataset.value };
            else boardState[oldRow][oldCol + 1] = { value: oldValues[1], pieceId: originPiece.dataset.value };

            console.log("Invalid placement, state restored.");
            return; // Stop further execution
        }


        if (canPlace) {
            placePieceOnBoard(values, row, col, isVertical);
            // Clean up dragging state
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('contextmenu', handleRotation);

            document.body.removeChild(draggingPiece);
            originPiece.remove(); // Remove original from list or board
            draggingPiece = null;
            originPiece = null;
            updatePieceCount();

        } else {
            // If placement is invalid, don't leave the player stuck.
            // Drop the piece back where it came from.
            console.log("Invalid placement, dropping piece.");
            dropPiece();
        }
    }

    function isValidPlacement(val1, r1, c1, val2, r2, c2) {
        // 1. Bounds check
        if (r1 < 0 || r1 >= boardSize || c1 < 0 || c1 >= boardSize ||
            r2 < 0 || r2 >= boardSize || c2 < 0 || c2 >= boardSize) {
            return false;
        }

        // 2. Overlap check
        if (boardState[r1][c1] !== null || boardState[r2][c2] !== null) {
            return false;
        }

        // 3. Adjacency check
        // If it's the first piece (from the list), placement is always valid on an empty spot.
        const placedPiecesCount = document.querySelectorAll('#board-container .domino').length;
        if (placedPiecesCount === 0) {
             // This check is a bit redundant if the board is empty, but good for clarity
            if (originPiece && originPiece.parentElement.id === 'domino-list') {
                return true;
            }
        }

        const checkNeighbors = (val, r, c) => {
            const neighbors = [[r-1, c], [r+1, c], [r, c-1], [r, c+1]];
            let hasNeighbor = false;
            let goodMatch = true;
            for (const [nr, nc] of neighbors) {
                // Ignore the other half of the same piece
                if ((nr === r1 && nc === c1) || (nr === r2 && nc === c2)) continue;

                if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && boardState[nr][nc] !== null) {
                   hasNeighbor = true;
                   if (boardState[nr][nc].value !== val) {
                       goodMatch = false;
                   }
                }
            }
             // If there are neighbors, they must match. If no neighbors, it's a valid part of the placement.
            return !hasNeighbor || goodMatch;
        };

        const isAdjacentToExistingPiece = () => {
            const allNeighbors = [
                [r1 - 1, c1], [r1 + 1, c1], [r1, c1 - 1], [r1, c1 + 1],
                [r2 - 1, c2], [r2 + 1, c2], [r2, c2 - 1], [r2, c2 + 1]
            ];
            for (const [nr, nc] of allNeighbors) {
                if ((nr === r1 && nc === c1) || (nr === r2 && nc === c2)) continue;
                if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && boardState[nr][nc] !== null) {
                    return true;
                }
            }
            return false;
        };

        // After the first piece, every new piece must be adjacent to an existing one.
        if (placedPiecesCount > 0 && !isAdjacentToExistingPiece()) {
            return false;
        }


        return checkNeighbors(val1, r1, c1) && checkNeighbors(val2, r2, c2);
    }

    function placePieceOnBoard(values, row, col, isVertical) {
        const pieceId = originPiece.dataset.value; // Use canonical value for ID
        // Update board state
        boardState[row][col] = { value: values[0], pieceId: pieceId };
        if (isVertical) {
            boardState[row + 1][col] = { value: values[1], pieceId: pieceId };
        } else {
            boardState[row][col + 1] = { value: values[1], pieceId: pieceId };
        }

        // Create visual piece on board
        const dominoOnBoard = createDominoElement(values[0], values[1]);
        dominoOnBoard.dataset.value = originPiece.dataset.value;
        dominoOnBoard.dataset.rotation = rotation;
        dominoOnBoard.style.position = 'absolute';
        dominoOnBoard.style.top = `${row * 40}px`;
        dominoOnBoard.style.left = `${col * 40}px`;
        dominoOnBoard.dataset.row = row;
        dominoOnBoard.dataset.col = col;

        if (isVertical) {
            dominoOnBoard.classList.add('vertical');
        }

        boardContainer.appendChild(dominoOnBoard);
    }

    function updatePieceCount() {
        const placedPieces = document.querySelectorAll('#board-container .domino').length;
        pieceCountSpan.textContent = placedPieces;
    }


    // --- Game Control and Modal Logic ---
    function saveGame() {
        const piecesOnBoard = [];
        document.querySelectorAll('#board-container .domino').forEach(p => {
            piecesOnBoard.push({
                value: p.dataset.value,
                row: parseInt(p.dataset.row),
                col: parseInt(p.dataset.col),
                isVertical: p.classList.contains('vertical'),
                rotation: p.dataset.rotation || '0'
            });
        });

        const gameState = {
            boardSize: boardSize,
            dominoMaxNumber: dominoMaxNumber,
            pieces: piecesOnBoard,
            timestamp: new Date().getTime()
        };

        const savedGames = JSON.parse(localStorage.getItem('dominoSavedGames')) || [];
        savedGames.push(gameState);
        localStorage.setItem('dominoSavedGames', JSON.stringify(savedGames));
        alert('¡Partida guardada!');
        finishModal.style.display = 'none';
    }

    function loadAndDisplaySavedGames() {
        savedGamesList.innerHTML = '';
        const savedGames = JSON.parse(localStorage.getItem('dominoSavedGames')) || [];

        if (savedGames.length === 0) {
            savedGamesList.innerHTML = '<li>No hay partidas guardadas.</li>';
            return;
        }

        savedGames.forEach((game, index) => {
            const li = document.createElement('li');

            const textSpan = document.createElement('span');
            const date = new Date(game.timestamp).toLocaleString('es-ES');
            textSpan.textContent = `Partida del ${date} - ${game.pieces.length} piezas en tablero ${game.boardSize}x${game.boardSize}`;

            const loadButton = document.createElement('button');
            loadButton.textContent = 'Cargar';
            loadButton.dataset.gameIndex = index;
            loadButton.classList.add('load-game-btn');

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Borrar';
            deleteButton.dataset.gameIndex = index;
            deleteButton.classList.add('delete-game-btn');

            li.appendChild(textSpan);
            li.appendChild(loadButton);
            li.appendChild(deleteButton);
            savedGamesList.appendChild(li);
        });
    }

    function placeSavedPieceOnBoard(pieceData) {
        const { value, row, col, isVertical, rotation } = pieceData;
        const canonicalValues = value.split('-').map(Number);
        let displayedValues = [...canonicalValues];

        if (rotation === '2' || rotation === '3') {
            displayedValues = [canonicalValues[1], canonicalValues[0]];
        }

        boardState[row][col] = { value: displayedValues[0], pieceId: value };
        if (isVertical) {
            boardState[row + 1][col] = { value: displayedValues[1], pieceId: value };
        } else {
            boardState[row][col + 1] = { value: displayedValues[1], pieceId: value };
        }

        const dominoOnBoard = createDominoElement(displayedValues[0], displayedValues[1]);
        dominoOnBoard.dataset.value = value;
        dominoOnBoard.dataset.rotation = rotation;
        dominoOnBoard.style.position = 'absolute';
        dominoOnBoard.style.top = `${row * 40}px`;
        dominoOnBoard.style.left = `${col * 40}px`;
        dominoOnBoard.dataset.row = row;
        dominoOnBoard.dataset.col = col;

        if (isVertical) {
            dominoOnBoard.classList.add('vertical');
        }
        boardContainer.appendChild(dominoOnBoard);
    }

    function loadGame(savedGame) {
        boardSize = savedGame.boardSize;
        dominoMaxNumber = savedGame.dominoMaxNumber;
        boardSizeSelect.value = boardSize;
        dominoSetSelect.value = dominoMaxNumber;

        boardState = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
        gameInstructions.textContent = `¿Cuántas piezas del dominó que va del 0 al ${dominoMaxNumber} podés poner en este tablero? Elegí una pieza y ponela en el tablero con un click. Las piezas se pueden rotar con el botón derecho.`;

        welcomeScreen.style.display = 'none';
        gameScreen.style.display = 'block';

        generateBoard(boardSize);

        // Reconstruct the list of available pieces dynamically.
        // This is more robust than saving/loading HTML.
        generateDominoes(savedGame.dominoMaxNumber);
        const placedPiecesValues = new Set(savedGame.pieces.map(p => p.value));
        Array.from(dominoList.children).forEach(domino => {
            if (placedPiecesValues.has(domino.dataset.value)) {
                domino.remove();
            }
        });

        savedGame.pieces.forEach(piece => {
            placeSavedPieceOnBoard(piece);
        });

        updatePieceCount();
    }

    // --- Event Listeners ---
    playBtn.addEventListener('click', startGame);

    newGameBtn.addEventListener('click', () => {
        gameScreen.style.display = 'none';
        welcomeScreen.style.display = 'block';
    });

    // New event listeners for click-based interaction
    dominoList.addEventListener('click', handlePiecePickup);
     boardContainer.addEventListener('click', (e) => {
        if (draggingPiece) {
            // If we are dragging a piece, a click on the board means "place it".
            handleBoardPlacementClick(e);
        } else {
            // If we are NOT dragging a piece, a click on a piece on the board means "pick it up".
            const targetDomino = e.target.closest('.domino');
            if (targetDomino) {
                handlePiecePickup(e);
            }
        }
    });

    rotateBtn.addEventListener('click', (e) => {
        if(draggingPiece) {
           const mockEvent = {
               preventDefault: () => {},
               pageX: parseInt(draggingPiece.style.left || 0, 10),
               pageY: parseInt(draggingPiece.style.top || 0, 10)
           };
           handleRotation(mockEvent);
        }
    });

    // Drop piece if clicking on the side panel
    piecesContainer.addEventListener('click', (e) => {
        if (draggingPiece && e.target.closest('#pieces-container')) {
            // If the piece came from the board, return it to the list.
            if (originPiece && originPiece.parentElement.id === 'board-container') {
                returnPieceToList();
            } else {
                // Otherwise, just drop it back where it came from.
                dropPiece();
            }
        }
    });

    // Modal and Control Buttons
    finishBtn.addEventListener('click', () => {
        const pieceCount = document.querySelectorAll('#board-container .domino').length;
        finishSummary.textContent = `Piezas colocadas: ${pieceCount}, Dominó: 0 al ${dominoMaxNumber}, Tablero: ${boardSize}x${boardSize}`;
        finishModal.style.display = 'flex';
    });

    continueBtn.addEventListener('click', () => {
        finishModal.style.display = 'none';
    });

    saveBtn.addEventListener('click', saveGame);

    savedBoardsBtn.addEventListener('click', () => {
        loadAndDisplaySavedGames();
        savedBoardsModal.style.display = 'flex';
    });

    continuePlayingBtn.addEventListener('click', () => {
        savedBoardsModal.style.display = 'none';
    });

    savedGamesList.addEventListener('click', (e) => {
        const target = e.target;
        const gameIndex = target.dataset.gameIndex;

        if (gameIndex === undefined) return; // Click was not on a button with an index

        let savedGames = JSON.parse(localStorage.getItem('dominoSavedGames'));

        // Handle Load Button Click
        if (target.classList.contains('load-game-btn')) {
            const gameToLoad = savedGames[gameIndex];
            if (gameToLoad) {
                loadGame(gameToLoad);
                savedBoardsModal.style.display = 'none';
            }
        }

        // Handle Delete Button Click
        if (target.classList.contains('delete-game-btn')) {
            savedGames.splice(gameIndex, 1);
            localStorage.setItem('dominoSavedGames', JSON.stringify(savedGames));
            loadAndDisplaySavedGames();
        }
    });


    // --- Initial Setup ---
    populateSelectors();
});
