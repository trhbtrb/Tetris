// Get Canvas and Contexts
const gravityScoreThresholds = [25, 50, 75, 100, 125, 150, 175];
const gravityIntervals = [500, 400, 300, 200, 150, 100, 50]; // Speed increases by score
const fastDropInterval = 20; 

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');


const linesPerLevel = 5; // Number of lines cleared required to increase level

function updateLinesCleared(lines) {
    linesCleared += lines; // Increment the total lines cleared
    linesElement.innerText = linesCleared; // Update the display

    // Check if the player has reached the threshold to level up
    const newLevel = Math.floor(linesCleared / linesPerLevel) + 1;
    if (newLevel > level) {
        updateLevel(newLevel); // Update the level
        currentDropInterval = levelDropIntervals[newLevel] || levelDropIntervals[levelDropIntervals.length - 1]; // Adjust speed
    }
}


// Call these functions in your game logic when appropriate

// Define Block Size
const blockSize = 24;

// Define Colors for Each Piece Type (Original Tetris Colors)
const colors = [
    '#0C969C', // I - Cyan
    '#6BA3BE', // J - Blue
    '#E67E22', // L - Orange
    '#F2D024', // O - Yellow
    '#0A7075', // S - Green
    '#9B59B6', // T - Purple
    '#E74C3C'  // Z - Red
];

// Assuming orientPoints is already defined elsewhere

// Create the Arena (Game Board)
const arenaWidth = 10;
const arenaHeight = 20;
const arena = createMatrix(arenaWidth, arenaHeight);

// Create the Game Matrix
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Player Object
const player = {
    pos: {x: Math.floor(arenaWidth / 2), y: 0},
    matrix: null,
    rotation: 0,
    pieceType: 0
};

// Initialize Score, Lines Cleared, and Level
let score = 0;
let level = 1;
levelElement.innerText = level; 
let linesCleared = 0;

function updateScore(points) {
    score += points;
    scoreElement.innerText = score;
}

function updateLevel(newLevel) {
    level = newLevel; // Update the level variable
    levelElement.innerText = level; // Update the displayed level
    console.log(`Level updated to: ${level}`); // Debugging log (optional)
}



function updateLinesCleared(lines) {
    linesCleared += lines; // Increment the total lines cleared
    linesElement.innerText = linesCleared; // Update the display

    // Calculate the new level based on lines cleared
    const newLevel = Math.floor(linesCleared / linesPerLevel) + 1;
    if (newLevel > level) {
        updateLevel(newLevel); // Update the level
        currentDropInterval = levelDropIntervals[newLevel] || levelDropIntervals[levelDropIntervals.length - 1]; // Adjust drop speed
    }
}




// Game Over Flag
let gameOver = false;

// Define Level Drop Intervals (in milliseconds)
const levelDropIntervals = [
    500, // Level 0: Faster starting speed
    450, // Level 1
    400, // Level 2
    350, // Level 3
    300, // Level 4
    250, // Level 5
    200, // Level 6
    150, // Level 7
    120, // Level 8
    100, // Level 9: High speed
    90,  // Level 10
    80,  // Level 11
    70,  // Level 12
    60,  // Level 13
    50,  // Level 14
    40,  // Level 15
    30,  // Level 16
    20,  // Level 17: Maximum speed
    15,  // Level 18
    10   // Level 19+
];


const normalDropInterval = levelDropIntervals[level];
let gravityInterval = gravityIntervals[0];
let currentDropInterval = gravityInterval; // Starts with gravity interval
let currentGravityLevel = 0;
let dropCounter = 0;
let lastTime = 0;
let isFastDropping = false; // Track if fast drop is active

function updateGravitySpeed() {
    if (currentGravityLevel < gravityScoreThresholds.length && score >= gravityScoreThresholds[currentGravityLevel]) {
        currentGravityLevel++;
        gravityInterval = gravityIntervals[currentGravityLevel];
        if (!isFastDropping) {
            currentDropInterval = gravityInterval; // Update current drop speed if not fast dropping
        }
    }
}


// Generate a Random Piece and Update Next Piece
function randomPiece() {
    if (nextPiece === null) {
        // Set the first piece initially
        nextPiece = generateNextPiece();
    }
    player.pieceType = nextPiece;
    player.rotation = 0;
    player.matrix = orientPoints(player.pieceType, player.rotation);
    player.pos = { x: Math.floor(arenaWidth / 2), y: 0 };

    // Generate the next piece for preview
    nextPiece = generateNextPiece();

    // Check for game over
    if (collide(arena, player)) {
        gameOver = true;
    }
}


function updateSpeedBasedOnScore() {
    // Check if current score has passed the threshold for the next speed level
    if (currentSpeedLevel < scoreThresholds.length && score >= scoreThresholds[currentSpeedLevel]) {
        currentSpeedLevel++;
        dropInterval = speedLevels[currentSpeedLevel];
    }
}


// Collision Detection
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let [x, y] of m) {
        const px = o.x + x;
        const py = o.y + y;
        if (px < 0 || px >= arenaWidth || py >= arenaHeight) {
            return true;
        }
        if (py < 0) continue;
        if (arena[py][px] !== 0) {
            return true;
        }
    }
    return false;
}

// Merge Player Piece into Arena
function merge(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let [x, y] of m) {
        const px = o.x + x;
        const py = o.y + y;
        if (py >= 0 && px >= 0 && px < arenaWidth && py < arenaHeight) {
            arena[py][px] = player.pieceType + 1;
        }
    }
}


function sweep() {
    let rowCount = 0;
    outer: for (let y = arenaHeight - 1; y >= 0; y--) {
        for (let x = 0; x < arenaWidth; x++) {
            if (arena[y][x] === 0) {
                continue outer; // Skip this row if there's an empty block
            }
        }

        // If we reach here, the row is full
        const row = arena.splice(y, 1)[0].fill(0); // Remove the row
        arena.unshift(row); // Add a new empty row at the top
        rowCount++; // Increment the cleared row count
        y++; // Stay on the same row index since rows have shifted
    }

    // If rows were cleared, update the score and lines cleared
    if (rowCount > 0) {
        updateScore(rowCount * 10); // Use updateScore to add points and update display
        updateLinesCleared(rowCount); // Update total lines cleared
        updateGravitySpeed(); // Adjust gravity based on the score
    }
}



function resetGame() {
    // Reset score, lines cleared, and level
    score = 0;
    linesCleared = 0;
    level = 1;

    // Reset game state
    gameOver = false;

    // Clear the arena
    for (let y = 0; y < arenaHeight; y++) {
        arena[y].fill(0);
    }

    // Reset gravity and drop intervals
    currentGravityLevel = 0; // Reset gravity level
    gravityInterval = gravityIntervals[0]; // Set gravity to initial interval
    currentDropInterval = gravityInterval; // Set drop interval to match gravity
    isFastDropping = false; // Ensure fast drop is disabled

    // Reset drop counters
    dropCounter = 0;
    lastTime = 0;

    // Update UI elements
    scoreElement.innerText = score;
    linesElement.innerText = linesCleared;
    levelElement.innerText = level;

    // Initialize the first piece
    randomPiece();
}






// Draw the Arena
function drawArena() {
    for (let y =0; y < arena.length; y++) {
        for (let x=0; x < arena[y].length; x++) {
            if (arena[y][x] !==0){
                const color = colors[arena[y][x]-1];
                drawShadedBlock(x * blockSize, y * blockSize, color, context);
            }
        }
    }
}

// Draw the Player
function drawPlayer() {
    const m = player.matrix;
    const o = player.pos;
    m.forEach(([x, y]) => {
        const px = (x + o.x) * blockSize;
        const py = (y + o.y) * blockSize;
        if (py <0) return;
        const color = colors[player.pieceType];
        drawShadedBlock(px, py, color, context);
    });
}

// Draw Next Piece
let nextPiece = null;


function drawNext() {
    // Clear the canvas
    nextContext.fillStyle = '#0C969C'; // Background color
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    const pieceMatrix = orientPoints(nextPiece, 0); // Get the matrix for the next piece

    // Calculate the bounding box of the piece
    const minX = Math.min(...pieceMatrix.map(([x]) => x));
    const maxX = Math.max(...pieceMatrix.map(([x]) => x));
    const minY = Math.min(...pieceMatrix.map(([_, y]) => y));
    const maxY = Math.max(...pieceMatrix.map(([_, y]) => y));

    const pieceWidth = maxX - minX + 1; // Width of the piece in blocks
    const pieceHeight = maxY - minY + 1; // Height of the piece in blocks

    // Calculate pixel offsets to center the piece in the canvas
    const offsetX = Math.floor((nextCanvas.width - pieceWidth * blockSize) / 2);
    const offsetY = Math.floor((nextCanvas.height - pieceHeight * blockSize) / 2);

    // Draw the piece centered in the canvas
    pieceMatrix.forEach(([x, y]) => {
        const px = offsetX + (x - minX) * blockSize; // Center horizontally
        const py = offsetY + (y - minY) * blockSize; // Center vertically
        const color = colors[nextPiece];
        drawShadedBlock(px, py, color, nextContext);
    });
}

// Generate Next Piece
function generateNextPiece() {
    return Math.floor(Math.random() * 7);
}

// Draw the Game
function draw() {
    // Clear the main canvas
    context.fillStyle = '#032F30';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Arena and Player
    drawArena();
    drawPlayer();

    // Draw Next Piece
    drawNext();

    // If Game Over, display message
    if (gameOver) {
        displayGameOver();
    }
}

// Display Game Over Message

function displayGameOver() {
    // Overlay Background
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);

    // Display Text
    context.fillStyle = '#FFFFFF';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText('I miss you!', canvas.width / 2, canvas.height / 2 - 10);
    context.font = '24px Arial';
    context.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 40);
}


// Player Movement
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)){
        player.pos.x -= dir;
    }
}

// Player Drop
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--; // Undo the move if there's a collision
        merge(arena, player); // Lock the piece into the arena
        sweep(); // Clear full rows and update lines
        randomPiece(); // Generate the next piece

        // Check for game over after placing the piece
        if (collide(arena, player)) {
            gameOver = true;
        }
    }
    dropCounter = 0; // Reset drop counter
}


// Player Rotate
function playerRotate(dir) {
    const prevRotation = player.rotation;
    player.rotation = (player.rotation + dir + 4) % 4; // Increment rotation direction
    player.matrix = orientPoints(player.pieceType, player.rotation); // Update matrix based on rotation

    // Check for collisions after rotation
    if (collide(arena, player)) {
        player.rotation = prevRotation; // Revert to previous rotation if collision
        player.matrix = orientPoints(player.pieceType, player.rotation); // Revert to previous matrix
    }
}


// Handle Input (Movement and Rotation)
document.addEventListener('keydown', event => {
    if (gameOver) return; // Disable input if game over

    switch (event.key) {
        case 'ArrowLeft': // Move left
            playerMove(-1);
            break;

        case 'ArrowRight': // Move right
            playerMove(1);
            break;

        case 'ArrowDown': // Soft drop
            isFastDropping = true; // Enable fast drop
            currentDropInterval = fastDropInterval; // Set to fast drop interval
            break;

        case 'ArrowUp': // Rotate clockwise
            playerRotate(1);
            break;

        case 'z': // Rotate counterclockwise (if using 'Z' for counter-rotation)
            playerRotate(-1);
            break;

        case ' ': // Hard drop
            while (!collide(arena, player)) {
                player.pos.y++;
            }
            player.pos.y--; // Undo last move
            merge(arena, player); // Lock piece
            sweep(); // Clear rows
            randomPiece(); // Generate next piece
            break;

        case 'r': // Reset game
        case 'R':
            resetGame();
            break;
    }
});

// Reset drop interval when ArrowDown is released
document.addEventListener('keyup', event => {
    if (event.key === 'ArrowDown') {
        isFastDropping = false;
        currentDropInterval = gravityInterval; // Revert to gravity interval
    }
});


// Add an event listener for the "R" key to restart the game
document.addEventListener('keydown', event => {
    if (event.key === 'r' || event.key === 'R') {
        resetGame(); // Restart the game
    }
});


document.addEventListener('keyup', event => {
    if (event.key === 'ArrowDown') {
        dropInterval = normalDropInterval; // Revert to normal interval
    }
});

// Initialize the Game
randomPiece();
update();

// Main game loop with dynamic drop interval
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > currentDropInterval && !gameOver) {
        playerDrop();
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}


// Initialize the Game
randomPiece();
update();

/**
 * Helper Functions for Enhanced Block Rendering
 */

// Function to draw a block with shading to mimic original Tetris style
function drawShadedBlock(x, y, color, ctx) {
    // Main block
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);

    // Add highlights
    ctx.fillStyle = lightenColor(color, 20);
    ctx.fillRect(x, y, blockSize, blockSize / 4); // Top highlight
    ctx.fillRect(x, y, blockSize / 4, blockSize); // Left highlight

    // Add shadows
    ctx.fillStyle = darkenColor(color, 20);
    ctx.fillRect(x + (blockSize * 3) / 4, y, blockSize / 4, blockSize); // Right shadow
    ctx.fillRect(x, y + (blockSize * 3) / 4, blockSize, blockSize / 4); // Bottom shadow
}

// Function to lighten a hex color
function lightenColor(color, percent) {
    const num = parseInt(color.slice(1),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (
        0x1000000 +
        (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 +
        (B<255?B<1?0:B:255)
    ).toString(16).slice(1);
}

// Function to darken a hex color
function darkenColor(color, percent) {
    const num = parseInt(color.slice(1),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) - amt,
        G = (num >> 8 & 0x00FF) - amt,
        B = (num & 0x0000FF) - amt;
    return "#" + (
        0x1000000 +
        (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 +
        (B<255?B<1?0:B:255)
    ).toString(16).slice(1);
}
