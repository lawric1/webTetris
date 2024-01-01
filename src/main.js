import { updateInput, isActionJustPressed, isActionPressed } from "../lib/input.js"
import { addLayer, createWindow, gameState, setGameState, layers, width, height, textures, preloadAll } from "../lib/globals.js";
import { clamp, randomInt } from "../lib/math.js";
import { choose } from "../lib/utils.js";
import { AudioStream } from "../lib/audio.js";


createWindow(600, 600, 1);
addLayer("background", 1, true);
addLayer("main", 2, true);
addLayer("grid", 3, true);
addLayer("foreground", 4, true);
addLayer("queue", 5, true);
addLayer("ui", 6, false);

let urls = {
    start1: "./src/assets/startscreen1.png",
    start2: "./src/assets/startscreen2.png",
    gameover: "./src/assets/gameover.png",
    bg: "./src/assets/background.png",
    bg2: "./src/assets/background2.png",
}

await preloadAll(urls);


let sfxMove = [
    new AudioStream("./src/assets/sfx/move1.wav"),
    new AudioStream("./src/assets/sfx/move2.wav"),
]
let sfxClear = new AudioStream("./src/assets/sfx/clear1.wav");
let sfxDrop = new AudioStream("./src/assets/sfx/jump1.wav");


let board = [[0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0]];


let boardWidth = 10;
let boardHeight = 20;
let cellSize = 24;

// Top left x y position of board in the canvas;
let boardX = 180;
let boardY = 60;

const tetrominos = {
    // Tetromino I
    I: [
        [
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
        ],
        [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
        ],
        [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0]
        ],
        [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
        ]
    ],
    
    // Tetromino O
    O: [
        [
        [2, 2],
        [2, 2]
        ]
    ],
    
    // Tetromino T
    T: [
        [
        [0, 3, 0],
        [3, 3, 3],
        [0, 0, 0]
        ],
        [
        [0, 3, 0],
        [0, 3, 3],
        [0, 3, 0]
        ],
        [
        [0, 0, 0],
        [3, 3, 3],
        [0, 3, 0]
        ],
        [
        [0, 3, 0],
        [3, 3, 0],
        [0, 3, 0]
        ]
    ],
    
    // Tetromino L
    L: [
        [
        [0, 0, 4],
        [4, 4, 4]
        ],
        [
        [4, 0],
        [4, 0],
        [4, 4]
        ],
        [
        [4, 4, 4],
        [4, 0, 0]
        ],
        [
        [4, 4],
        [0, 4],
        [0, 4]
        ],
    ],
    
    // Tetromino J
    J: [
        [
        [5, 0, 0],
        [5, 5, 5]
        ],
        [
        [5, 5],
        [5, 0],
        [5, 0]
        ],
        [
        [5, 5, 5],
        [0, 0, 5]
        ],
        [
        [0, 5],
        [0, 5],
        [5, 5]
        ]
    ],
    
    // Tetromino S
    S: [
        [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0]
        ],
        [
        [0, 6, 0],
        [0, 6, 6],
        [0, 0, 6]
        ]
    ],
    
    // Tetromino Z
    Z: [
        [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
        ],
        [
        [0, 0, 7],
        [0, 7, 7],
        [0, 7, 0]
        ]
    ]
};

let allTetrominos = [tetrominos.I, tetrominos.O, tetrominos.T, tetrominos.L, tetrominos.J, tetrominos.S, tetrominos.Z];

let currentTetromino = pickRandomTetromino();
let lastPickedTetromino = currentTetromino;
let currentHeldTetromino;
let holdUsed = false;

let tetrominoQueue = [];
let queueSize = 1;

let rotation = 0;
let rotationsUsed = 0;
let maxRotations = 20;

// Ghost is a preview of where the tetromino will land;
let offsetGhostRow = 0;
let offsetRow = -2;
let offsetCol = 3;

let steering = 0;
let maxSteering = 2;
let steeringSpeed = 20;

// If landingTimer reaches 0, the tetromino can land;
let t = 2;
let landingTimer = t;
let landed = false;

let linesCleared = 0;
let targetLines = 40;

let score = 0;
let finalScore = 0;

// startTime is the time since the game starts;
// finalTime can be both the elapsed time or countdown time depending on the game mode;
let startTime = 0;
let finalTime = 0;
let countDownTime = 120;

let gameMode = "40lines";

let gameOver = false;


// Elapsed Time since game mode starts;
function getElapsedTime() {
    const elapsedTime = performance.now() - startTime;
    return elapsedTime / 1000;
}

function getCountDownTimer(time) {
    return time - getElapsedTime(); 
}

function resetGame() {
    board = [[0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0]];
    
    tetrominoQueue = [];

    linesCleared = 0;
    startTime = 0;

    score = 0;
    
    gameOver = false;
    
    resetLandingTimer();
    resetTetrominoStats();
}

function resetLandingTimer() {
    landingTimer = t;
}

function resetTetrominoStats() {
    landed = false;
    offsetRow = -2;
    offsetCol = 3;
    rotation = 0;
    rotationsUsed = 0;
    holdUsed = false;
}

function fillTetrominoQueue() {
    for (let i = 0; i < queueSize; i++) {
        let newTetromino;
    
        do {
            newTetromino = pickRandomTetromino()
        } while (newTetromino === lastPickedTetromino)
        
        tetrominoQueue.push(newTetromino);
        lastPickedTetromino = newTetromino;
    }
}

function updateTetrominoQueue() {
    // Get first tetromino in queue 
    // and push a new one different than the last generated;
    currentTetromino = tetrominoQueue.shift();

    let newTetromino;

    do {
        newTetromino = pickRandomTetromino()
    } while (newTetromino === lastPickedTetromino)
    
    tetrominoQueue.push(newTetromino);
    lastPickedTetromino = newTetromino;
}

function pickRandomTetromino() {
    return choose(allTetrominos);
}

function getCellColor(id) {
    switch (id) {
        case 0:
            return "transparent";
        case 1:
            return "cyan";
        case 2:
            return "yellow";
        case 3:
            return "purple";
        case 4:
            return "orange";
        case 5:
            return "blue";
        case 6:
            return "green";
        case 7:
            return "red";
    }
}

function getTetrominoColor(tetromino) {
    switch (tetromino) {
        case tetrominos.I:
            return "cyan";
        case tetrominos.O:
            return "yellow";
        case tetrominos.T:
            return "purple";
        case tetrominos.L:
            return "orange";
        case tetrominos.J:
            return "blue";
        case tetrominos.S:
            return "green";
        case tetrominos.Z:
            return "red";
    }
}

function moveTetromino(direction) {
    let canMoveLeft = true;
    let canMoveRight = true;

    let tetromino = currentTetromino[rotation];

    // Loop through tetromino layout, 
    // use the offsets to get correct row and col in board,
    // and check collisions;
    for (let i = 0; i < tetromino.length; i++) {
        for (let j = 0; j < tetromino[i].length; j++) {
            if (tetromino[i][j] !== 0) {
                // At spawn the offsetrow is -2, so we ignore it with Math.abs;
                let row = Math.abs(i + offsetRow);
                let col = j + offsetCol;

                let outSideBoardLeft = col - 1 < 0;
                let outSideBoardRight = col + 1 > boardWidth;
                let collisionLeft = board[row][col - 1] !== 0;
                let collissionRight = board[row][col + 1] !== 0;

                if (collisionLeft || outSideBoardLeft) { 
                    canMoveLeft = false; 
                }  
                if (collissionRight || outSideBoardRight) {
                    canMoveRight = false; 
                } 
            }
        }
    }

    if (direction === "left" && canMoveLeft) {
        offsetCol -= 1;
        sfxMove[randomInt(0, 1)].play(0.2);
    } 
    if (direction === "right" && canMoveRight) {
        offsetCol += 1;
        sfxMove[randomInt(0, 1)].play(0.2);
    }
}

function rotateTetromino(direction) {
    let canRotate = true;
    let numRotations = currentTetromino.length;
    let nextRotation;

    if (direction === "left") {
        nextRotation = (rotation - 1 + numRotations) % numRotations;
    }

    if (direction === "right") {
        nextRotation = (rotation + 1 + numRotations) % numRotations;
    }

    let newOffsetRow = offsetRow;
    let newOffsetCol = offsetCol;

    // Potential tetromino;
    let rotatedTetromino = currentTetromino[nextRotation];

    // Check if the rotated tetromino cells collides with walls,
    // Update the new offset to bring it back to the board;
    for (let i = 0; i < rotatedTetromino.length; i++) {
        for (let j = 0; j < rotatedTetromino[i].length; j++) {
            let col = j + newOffsetCol;

            if (col < 0) {
                newOffsetCol += 1;
            }
            if (col > boardWidth - 1) {
                newOffsetCol -= 1;
            }
        }
    }

    // Loop through the potential rotated tetromino layout,
    // Use the new offsets to get the correct row and col in board,
    // Now check for collisions to decide if the rotated tetromino can be used;
    for (let i = 0; i < rotatedTetromino.length; i++) {
        for (let j = 0; j < rotatedTetromino[i].length; j++) {
            if (rotatedTetromino[i][j] !== 0) {
                let row = i + newOffsetRow;
                let col = j + newOffsetCol;

                if (row < 0) {
                    break;
                }

                // Wall collision, floor collision, board collision;
                if (col < 0 || col > boardWidth - 1 || row >= boardHeight - 1 || board[row][col] !== 0) {
                    canRotate = false;
                }
            }
        }
    }

    if (canRotate && rotationsUsed < maxRotations) {
        rotationsUsed += 1;
        offsetRow = newOffsetRow;
        offsetCol = newOffsetCol;
        rotation = nextRotation;
        sfxMove[randomInt(0, 1)].play(0.2);
    }
}

function checkLanding() {
    let tetromino = currentTetromino[rotation];
    
    // Check if cells bellow tetromino are filled in the board,
    // If so, decrease landingTimer, 
    // that'll give some leeway to the player to move before landing;
    for (let i = 0; i < tetromino.length; i++) {
        for (let j = 0; j < tetromino[i].length; j++) {
            if (tetromino[i][j] !== 0) {
                let row = i + offsetRow;
                let col = j + offsetCol;

                if (row + 1 < 0) { return; }

                // Top row is filled, so tetromino can't land;
                if (board[0][col] !== 0) { gameOver = true; }

                if (row + 1 >= boardHeight) {
                    landingTimer -= 1;
                    return;
                } else if (board[row + 1][col] !== 0) {
                    landingTimer -= 1;
                    return;
                }
            }
        }
    }

    // In case the tetromino is swapped while the landingTime is counting;
    resetLandingTimer();
}

function updateBoard() {
    let tetromino = currentTetromino[rotation];

    // Update Board with new tetromino landed;
    for (let i = 0; i < tetromino.length; i++) {
        for (let j = 0; j < tetromino[i].length; j++) {
            if (tetromino[i][j] !== 0) {
                let row = i + offsetRow;
                let col = j + offsetCol;
                
                // Landed tetromino is outside board;
                if (row < 0) {
                    gameOver = true;
                    return;
                }

                board[row][col] = tetromino[i][j];
            }
        }
    }
}

function updateTetrominoGhost() {
    offsetGhostRow = offsetRow;
    let reachedBottom = false;

    let tetromino = currentTetromino[rotation];


    // The ghost position is calculated by moving down one row at the time,
    // Increase the ghost offset with each while iteration;
    let i = 20;
    while (i--) {
        for (let i = 0; i < tetromino.length; i++) {
            for (let j = 0; j < tetromino[i].length; j++) {
                if (tetromino[i][j] !== 0) {
                    let row = i + offsetGhostRow;
                    let col = j + offsetCol;
    
                    // Ignore negative row at tetromino spawn;
                    if (row < 0) { row = 0 }; 

                    // Check if bottom is reached or the cell bellow is filled,
                    // if so exit for loop;
                    if (row + 1 >= boardHeight || board[row + 1][col] !== 0) {
                        reachedBottom = true;
                        break;
                    }
                }
            }
        }
        
        if (reachedBottom) {
            break; // Exit the outer while loop;
        }

        // Bottom is not reached, increase ghost offset and go to next iteration; 
        offsetGhostRow += 1; 
    }
}

function clearLines() {
    let cleared = 0;

    for (let row = 0; row < boardHeight; row++) {
        // Check if the row is filled;
        if (board[row].every(cell => cell !== 0)) {
            // Remove the filled row;
            board.splice(row, 1);
            
            // Add a new empty row at the top;
            board.unshift(Array(boardWidth).fill(0));

            // Since we removed a row, decrement the row index to re-check the current position;
            row--;
            cleared++;

            sfxClear.play(0.2);
        }
    }

    linesCleared += cleared;
    if (cleared > 0) {
        score += 100 * cleared;
    }
}

function handleInput(deltaTime) {
    if (landed) {
        return;
    }

    // Left / Right Movement;

    // Steering is used to determine the direction 
    // and how fast the tetromino will move when left/right is held;

    // If left/right is just tapped, set steering to the max value, so it moves instantly;
    if (isActionJustPressed("left")) {
        steering = -maxSteering;
    }
    if (isActionJustPressed("right")) {
        steering = maxSteering;
    }

    // If left/right is held, increase/decrease steering slowly, until it reaches max value;
    if (isActionPressed("left")) {
        steering -= deltaTime * steeringSpeed;
    }
    if (isActionPressed("right")) {
        steering += deltaTime * steeringSpeed;
    }
    
    if (steering <= -maxSteering) {
        moveTetromino("left");
        steering = 0;
    } else if (steering >= maxSteering) {
        moveTetromino("right");
        steering = 0;
    }


    // Rotation;
    if (isActionJustPressed("rotateCCW")) {
        rotateTetromino("left");
    }
    if (isActionJustPressed("rotateCW")) {
        rotateTetromino("right");
    }

    
    // Drop
    if (isActionPressed("softDrop")) {
        fallInterval = 50;
    } else {
        fallInterval = 500;
    }

    // Teleport the tetromino to the calculated ghost;
    if (isActionJustPressed("hardDrop")) {
        sfxDrop.play(0.2);
        offsetRow = offsetGhostRow;
        landed = true;
        return;
    }

    if (isActionJustPressed("hold") && !holdUsed) {
        resetTetrominoStats();
        resetLandingTimer();

        if (currentHeldTetromino) {
            [currentTetromino, currentHeldTetromino] = [currentHeldTetromino, currentTetromino];
        } else {
            currentHeldTetromino = currentTetromino;
            updateTetrominoQueue();
        }
        holdUsed = true;
    }
}

let lastFallTime = performance.now();
let fallInterval = 500;

function update(deltaTime) {
    if (startTime === 0) {
        // Time since game is open;
        startTime = performance.now();
    }

    if (gameMode === "40lines") {
        finalTime = getElapsedTime();

        if (linesCleared >= targetLines) {
            setGameState("gameover");

            gameOver = true;
        }
    } else if (gameMode === "blitz") {
        finalTime = getCountDownTimer(countDownTime);

        if (finalTime <= 0) {
            setGameState("gameover");

            finalScore = score;
            gameOver = true;
        };
    }


    // Fill queue at start of game;
    if (tetrominoQueue.length === 0) { fillTetrominoQueue(); }
    
    if (gameOver) {
        // Game is lost naturally, set the game mode to none so the 
        // gameover screen for the mode will not be drawn;
        if (gameState !== "gameover") {
            setGameState("gameover");
            gameMode = "none";
        }

        resetGame();
        return; 
    }

    handleInput(deltaTime);

    const currentFallTime = performance.now();
    const elapsedFallTime = currentFallTime - lastFallTime;

    // Will trigger every 500 ms;
    if (elapsedFallTime > fallInterval || landed) {
        if (!landed) {
            checkLanding();
        }

        if (landingTimer <= 0) {
            landed = true;
            resetLandingTimer();
        }

        if (landed === true) {
            updateBoard();

            resetTetrominoStats();
            updateTetrominoQueue();
            clearLines();
        }
        
        // Tetromino is still falling;
        if (!landed && landingTimer === t){
            offsetRow += 1;
        }

        lastFallTime = currentFallTime;
    }
    
    updateTetrominoGhost();
}


// Draw
function clearUi() {
    layers.background.clearRect(0, 0, width, height);
    layers.main.clearRect(0, 0, width, height);
    layers.grid.clearRect(0, 0, width, height);
    layers.foreground.clearRect(0, 0, width, height);
    layers.queue.clearRect(0, 0, width, height);
    layers.ui.clearRect(0, 0, width, height);
    
    isBgDrawn = false;
    isGridDrawn = false;
}

// index will be used to select game mode;
let buttonIndex = 0;
function drawStart() {
    let ctx = layers.main;
    ctx.clearRect(0, 0, width, height);
    
    if (buttonIndex === 0) {
        ctx.drawImage(textures.start1, 0, 0);
    } else if (buttonIndex === 1) {
        ctx.drawImage(textures.start2, 0, 0);
    }

    if (isActionJustPressed("up")) {
        buttonIndex -= 1;
        sfxMove[randomInt(0, 1)].play(0.2);
    }
    if (isActionJustPressed("down")) {
        buttonIndex += 1;
        sfxMove[randomInt(0, 1)].play(0.2);
    }

    buttonIndex = clamp(buttonIndex, 0, 1);
};

function drawGameOver() {
    let ctx = layers.main;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(textures.gameover, 0, 0);

    if (gameMode === "40lines") {
        let formatedTime = (Math.round(finalTime * 100) / 100).toFixed(2);

        ctx.font = "48px m5x7";
        ctx.fillStyle = "#6772a9";
        ctx.fillText("Final Time", width/2 - 80, height/2);
        ctx.fillText(formatedTime, width/2 - 32, height/2 + 52);
    } else if (gameMode === "blitz") {
        ctx.font = "48px m5x7";
        ctx.fillStyle = "#6772a9";
        ctx.fillText("Final Score", width/2 - 80, height/2);
        ctx.fillText(finalScore, width/2 - 32, height/2 + 52);
    } else {
        ctx.font = "48px m5x7";
        ctx.fillStyle = "#6772a9";
        ctx.fillText("GAME OVER", width/2 - 80, height/2);
    }
    
};

let isBgDrawn = false;
function drawBackground() {
    let backgroundCtx = layers.background;
    let foregroundCtx = layers.foreground;
    backgroundCtx.drawImage(textures.bg2, 0, 0);
    foregroundCtx.drawImage(textures.bg, 0, 0);
}

let isGridDrawn = false;
function drawGrid() {
    let gridCtx = layers.grid;
    for (let row = 0; row < boardHeight; row++) {
        for (let col = 0; col < boardWidth; col++) {
            gridCtx.beginPath();
            gridCtx.lineWidth = "2";
            gridCtx.strokeStyle = "#000";
            gridCtx.rect(col*cellSize + boardX, row*cellSize + boardY, cellSize, cellSize);
            gridCtx.stroke();
        }
    }
}

function drawBoard() {
    let ctx = layers.main

    for (let row = 0; row < boardHeight; row++) {
        for (let col = 0; col < boardWidth; col++) {
            ctx.fillStyle = getCellColor(board[row][col]);
            if (gameOver && getCellColor(board[row][col]) !== "transparent") {
                ctx.fillStyle = "#ccc";
            }
            ctx.fillRect(col*cellSize + boardX, row*cellSize + boardY, cellSize, cellSize);
        }
    }
}

function drawCurrentTetromino() {
    let ctx = layers.main;
    
    // Draw tetromino and ghost.
    for (let i = 0; i < currentTetromino[rotation].length; i++) {
        for (let j = 0; j < currentTetromino[rotation][i].length; j++) {
            if (currentTetromino[rotation][i][j] !== 0) {
                let ghostRow = i + offsetGhostRow;
                let row = i + offsetRow;
                let col = j + offsetCol;

                ctx.fillStyle = getTetrominoColor(currentTetromino);
                ctx.filter = "brightness(30%)";
                ctx.fillRect(col*cellSize + boardX, ghostRow*cellSize + boardY, cellSize, cellSize);

                ctx.filter = "brightness(100%)";
                ctx.fillStyle = getTetrominoColor(currentTetromino);
                ctx.fillRect(col*cellSize + boardX, row*cellSize + boardY, cellSize, cellSize);
            }
        }
    }
}

function drawTetrominoQueue() {
    let ctx = layers.queue;

    ctx.clearRect(0, 0, width, height);

    // padding is used to add spacing between each tetromino drawn;
    let padding = 3.5;

    for (let k = 0; k < tetrominoQueue.length; k++) {
        let color = getTetrominoColor(tetrominoQueue[k]);
        let tetromino = tetrominoQueue[k][0];

        for (let i = 0; i < tetromino.length; i++) {
            for (let j = 0; j < tetromino[i].length; j++) {
                if (tetromino[i][j] !== 0) {
                    let row = i + padding;
                    let col = j + 12;
    
                    ctx.fillStyle = color;
                    ctx.fillRect(col*cellSize + boardX, row*cellSize + boardY, cellSize, cellSize);
                }
            }
        }
        padding += 3;
    }

    if (!currentHeldTetromino) { return; }

    for (let i = 0; i < currentHeldTetromino[0].length; i++) {
        for (let j = 0; j < currentHeldTetromino[0][i].length; j++) {
            if (currentHeldTetromino[0][i][j] !== 0) {
                let row = i + 3.5;
                let col = j - 5;

                ctx.fillStyle = getTetrominoColor(currentHeldTetromino);
                ctx.fillRect(col*cellSize + boardX, row*cellSize + boardY, cellSize, cellSize);
            }
        }
    }
}

function drawStats() {
    let ctx = layers.ui;
    ctx.clearRect(0, 0, width, height);
    
    if (gameMode === "40lines") {
        let formatedTime = (Math.round(finalTime * 100) / 100).toFixed(2);
    
        ctx.font = "48px m5x7";
        ctx.fillStyle = "#6772a9";
        ctx.fillText("L:" + linesCleared + "/" + targetLines, width - 160, height - 130);
        ctx.fillText("T:" + formatedTime, width - 160, height - 90);

    } else if (gameMode === "blitz") {
        let formatedTime = (Math.round(finalTime * 100) / 100).toFixed(2);

        ctx.font = "48px m5x7";
        ctx.fillStyle = "#6772a9";
        ctx.fillText("S:" + score, width - 160, height - 130);
        ctx.fillText("T:" + formatedTime, width - 160, height - 90);
    }
}

function draw() {
    if (gameOver) { return; }
    
    let ctx = layers.main;
    
    ctx.clearRect(0, 0, width, height);
  
    if (!isBgDrawn) {
        drawBackground();
        isBgDrawn = true;
    }

    if (!isGridDrawn) {
        drawGrid();
        isGridDrawn = true;
    }
    
    drawBoard();
    drawCurrentTetromino();
    drawTetrominoQueue();
    drawStats();
}

// Gameloop
let lastUpdateTime = performance.now();

function gameLoop() {
    updateInput();
    
    const currentTime = performance.now();
    const elapsedTime = currentTime - lastUpdateTime;
    let deltaTime = elapsedTime/1000;

    if (gameState === "start") { 
        clearUi();
        drawStart(); 
    }
    else if (gameState === "gameover") { 
        clearUi();
        drawGameOver(); 
    }
    else if (gameState === "run") {        
        let modes = ["40lines","blitz"];
        gameMode = modes[buttonIndex]

        update(deltaTime);
        draw();
    }

    // Handle States
    if (isActionJustPressed("start") && gameState === "start") {
        setGameState("run");
    }
    else if (isActionJustPressed("restart") && gameState === "gameover") { 
        setGameState("start"); 
    }

    lastUpdateTime = currentTime;
    requestAnimationFrame(gameLoop);
}

gameLoop();