const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; // Crisp 8-bit pixels

// Level configurations
const levels = [
    {
        level: 1,
        timeLimit: 120,
        initialMud: 5, // Even lower for testing
        mudRate: 0.02, // Much slower mud rate for testing
        coins: [{x: 200, y: 450}, {x: 400, y: 450}],
        bandits: [{x: 300, y: 300}], // Moved bandit away from player path
        flashPosition: {x: 600, y: 500}
    },
    {
        level: 2,
        timeLimit: 100,
        initialMud: 30,
        mudRate: 0.12,
        coins: [{x: 150, y: 400}, {x: 350, y: 400}, {x: 550, y: 400}],
        bandits: [{x: 250, y: 500}, {x: 450, y: 500}],
        flashPosition: {x: 650, y: 450}
    },
    {
        level: 3,
        timeLimit: 90,
        initialMud: 35,
        mudRate: 0.15,
        coins: [{x: 120, y: 350}, {x: 280, y: 400}, {x: 440, y: 350}, {x: 600, y: 400}],
        bandits: [{x: 200, y: 480}, {x: 350, y: 520}, {x: 500, y: 480}],
        flashPosition: {x: 700, y: 400}
    },
    {
        level: 4,
        timeLimit: 80,
        initialMud: 40,
        mudRate: 0.18,
        coins: [{x: 100, y: 300}, {x: 200, y: 450}, {x: 350, y: 350}, {x: 500, y: 450}, {x: 650, y: 350}],
        bandits: [{x: 180, y: 500}, {x: 320, y: 450}, {x: 460, y: 500}, {x: 580, y: 450}],
        flashPosition: {x: 720, y: 350}
    },
    {
        level: 5,
        timeLimit: 70,
        initialMud: 45,
        mudRate: 0.2,
        coins: [{x: 80, y: 250}, {x: 160, y: 400}, {x: 280, y: 300}, {x: 420, y: 450}, {x: 560, y: 300}, {x: 680, y: 400}],
        bandits: [{x: 150, y: 480}, {x: 250, y: 520}, {x: 350, y: 460}, {x: 450, y: 500}, {x: 550, y: 480}],
        flashPosition: {x: 750, y: 300}
    }
];

// Game state
let gameStarted = false;
let currentLevel = 0;
let gameState = 'menu'; // 'menu', 'playing', 'levelComplete', 'gameOver', 'gameWon'
let player = { x: 50, y: 500, width: 16, height: 16, speed: 5, frame: 0 };
let flash = { x: 600, y: 500, width: 16, height: 16, saved: false, frame: 0, lassoHits: 0 };
let mudMeter = 25;
let timeLeft = 120;
let score = 250;
let hearts = 3;
let keys = {};
let coins = [];
let bandits = [];
let lassoCooldown = 0; // Debounce lasso
let sparkEffect = null; // Visual feedback for Spacebar
let messageTimer = 0; // For level completion messages
let collisionCooldown = 0; // Prevent multiple collisions

// Sprites
const sprites = {
    player: [[0, 255, 0], [50, 255, 50]], // Green Grok knight
    flash: [[139, 69, 19], [160, 82, 45]], // Brown horse
    coin: [[255, 255, 0], [255, 215, 0]], // Gold coin spin
    bandit: [[255, 0, 0], [200, 0, 0]], // Red bandit
    spark: [[255, 255, 255], [200, 200, 200]] // Lasso spark
};

// Initialize level
function initLevel(levelIndex) {
    if (levelIndex >= levels.length) {
        gameState = 'gameWon';
        return;
    }
    
    const level = levels[levelIndex];
    currentLevel = levelIndex;
    
    // Reset player position
    player.x = 50;
    player.y = 500;
    player.frame = 0;
    
    // Set level parameters
    mudMeter = level.initialMud;
    timeLeft = level.timeLimit;
    
    // Initialize Flash
    flash.x = level.flashPosition.x;
    flash.y = level.flashPosition.y;
    flash.saved = false;
    flash.lassoHits = 0;
    flash.frame = 0;
    
    // Initialize coins
    coins = level.coins.map(coin => ({...coin, collected: false, frame: 0}));
    
    // Initialize bandits
    bandits = level.bandits.map(bandit => ({
        ...bandit, 
        width: 16, 
        height: 16, 
        frame: 0
    }));
    
    lassoCooldown = 0;
    sparkEffect = null;
    messageTimer = 0;
    collisionCooldown = 0;
    gameState = 'playing';
}

// Ensure canvas focus
canvas.tabIndex = 1; // Make canvas focusable
canvas.focus(); // Force focus on load
canvas.addEventListener('click', () => canvas.focus()); // Refocus on click

// Key listeners with e.code for reliability
window.addEventListener('keydown', (e) => {
    keys[e.code.toLowerCase()] = true;
    if (e.code === 'Space') {
        if (gameState === 'menu') {
            gameStarted = true;
            document.getElementById('title-screen').style.display = 'none';
            initLevel(0);
            sparkEffect = {x: player.x + 8, y: player.y, frame: 0, duration: 10}; // Start spark
        } else if (gameState === 'levelComplete' || gameState === 'gameOver') {
            if (gameState === 'levelComplete') {
                initLevel(currentLevel + 1);
            } else {
                // Restart from level 1
                hearts = 3;
                score = 250;
                initLevel(0);
            }
        } else if (gameState === 'gameWon') {
            // Restart the game
            hearts = 3;
            score = 250;
            gameState = 'menu';
            gameStarted = false;
            document.getElementById('title-screen').style.display = 'block';
        }
    }
});
window.addEventListener('keyup', (e) => keys[e.code.toLowerCase()] = false);

function update() {
    if (gameState !== 'playing') {
        if (messageTimer > 0) messageTimer--;
        return;
    }

    // Movement
    if (keys['arrowleft'] || keys['keya']) player.x -= player.speed;
    if (keys['arrowright'] || keys['keyd']) player.x += player.speed;
    if (keys['arrowup'] || keys['keyw']) player.y -= player.speed;
    if (keys['arrowdown'] || keys['keys']) player.y += player.speed;

    // Boundaries
    player.x = Math.max(0, Math.min(800 - player.width, player.x));
    player.y = Math.max(0, Math.min(600 - player.height, player.y));

    // Lasso (Space) with cooldown and hit counter
    if (keys['space'] && lassoCooldown <= 0 && !flash.saved) {
        if (Math.abs(player.x - flash.x) <= 50 && Math.abs(player.y - flash.y) <= 50) {
            flash.lassoHits++;
            lassoCooldown = 30; // 0.5s cooldown at ~60fps
            sparkEffect = {x: flash.x, y: flash.y, frame: 0, duration: 10}; // Spark on hit
            if (flash.lassoHits >= 3) {
                flash.saved = true;
                score += 1000;
                document.getElementById('mud-meter').textContent = '0% - Flash Saved!';
            }
        }
    }
    if (lassoCooldown > 0) lassoCooldown--;

    // Mud and time
    if (!flash.saved) mudMeter += levels[currentLevel].mudRate;
    timeLeft -= 1/60;
    
    // Check lose conditions
    if (mudMeter >= 100 || timeLeft <= 0) {
        gameState = 'gameOver';
        messageTimer = 120; // 2 seconds at 60fps
        return;
    }
    
    // Check win condition
    if (flash.saved) {
        gameState = 'levelComplete';
        messageTimer = 120; // 2 seconds at 60fps
        return;
    }

    // Coin collection
    coins.forEach(coin => {
        if (!coin.collected && Math.abs(player.x - coin.x) < 10 && Math.abs(player.y - coin.y) < 10) {
            coin.collected = true;
            score += 100;
            sparkEffect = {x: coin.x, y: coin.y, frame: 0, duration: 10}; // Spark on coin
        }
    });

    // Bandit collision
    if (collisionCooldown > 0) collisionCooldown--;
    bandits.forEach(b => {
        if (collisionCooldown <= 0 && Math.abs(player.x - b.x) < 16 && Math.abs(player.y - b.y) < 16) {
            hearts--;
            collisionCooldown = 60; // 1 second cooldown at 60fps
            sparkEffect = {x: player.x, y: player.y, frame: 0, duration: 10}; // Spark on hit
            if (hearts <= 0) {
                gameState = 'gameOver';
                messageTimer = 120; // 2 seconds at 60fps
                return;
            }
        }
    });

    // Animation frames
    player.frame = (player.frame + 0.1) % 2;
    flash.frame = (flash.frame + 0.05) % 2;
    bandits.forEach(b => b.frame = (b.frame + 0.1) % 2);
    if (sparkEffect) sparkEffect.frame++;

    // UI Update
    document.getElementById('level').textContent = `Level: ${currentLevel + 1}`;
    document.getElementById('mud-meter').textContent = `Mud: ${Math.floor(mudMeter)}%`;
    document.getElementById('time').textContent = `Time: ${Math.floor(timeLeft)}/${levels[currentLevel].timeLimit}s`;
    document.getElementById('score').textContent = `Score: ${score}`;
    let heartStr = ''; for (let i = 0; i < hearts; i++) heartStr += '❤️';
    document.getElementById('hearts').textContent = `Hearts: ${heartStr}`;
}

function draw() {
    ctx.clearRect(0, 0, 800, 600);

    // Background
    ctx.fillStyle = '#1a1a3d'; ctx.fillRect(0, 0, 800, 550);
    ctx.fillStyle = '#8B4513'; ctx.fillRect(0, 550, 800, 50);
    if (!flash.saved && gameState === 'playing') {
        ctx.fillStyle = `rgba(139, 69, 19, ${mudMeter/100})`;
        ctx.fillRect(flash.x - 10, flash.y, 36, 36);
    }

    // Only draw game elements if game has started
    if (gameStarted) {
        // Player
        ctx.fillStyle = `rgb(${sprites.player[Math.floor(player.frame)].join(',')})`;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Flash
        ctx.fillStyle = `rgb(${sprites.flash[Math.floor(flash.frame)].join(',')})`;
        ctx.fillRect(flash.x, flash.y, flash.width, flash.height);
        if (flash.saved) {
            ctx.fillStyle = '#0f0'; ctx.font = '10px Press Start 2P';
            ctx.fillText('Saved!', flash.x, flash.y - 10);
        }

        // Coins
        coins.forEach(coin => {
            if (!coin.collected) {
                ctx.fillStyle = `rgb(${sprites.coin[Math.floor((coin.frame = (coin.frame || 0) + 0.2) % 2)].join(',')})`;
                ctx.fillRect(coin.x, coin.y, 8, 8);
            }
        });

        // Bandits
        bandits.forEach(b => {
            ctx.fillStyle = `rgb(${sprites.bandit[Math.floor(b.frame)].join(',')})`;
            ctx.fillRect(b.x, b.y, b.width, b.height);
        });

        // Lasso effect
        if (keys['space'] && lassoCooldown > 25 && gameState === 'playing') {
            ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(player.x + 8, player.y); ctx.lineTo(flash.x, flash.y); ctx.stroke();
        }

        // Spark effect
        if (sparkEffect && sparkEffect.frame < sparkEffect.duration) {
            ctx.fillStyle = `rgb(${sprites.spark[Math.floor(sparkEffect.frame % 2)].join(',')})`;
            ctx.fillRect(sparkEffect.x, sparkEffect.y, 8, 8);
        }
    }

    // Game state messages
    if (gameState === 'levelComplete') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, 800, 600);
        
        ctx.fillStyle = '#0f0'; 
        ctx.font = '24px Press Start 2P';
        ctx.textAlign = 'center';
        
        if (currentLevel + 1 >= levels.length) {
            ctx.fillText('ALL LEVELS COMPLETE!', 400, 250);
            ctx.font = '16px Press Start 2P';
            ctx.fillText(`Final Score: ${score}`, 400, 300);
            ctx.fillText('Press SPACE to restart', 400, 350);
        } else {
            ctx.fillText(`LEVEL ${currentLevel + 1} COMPLETE!`, 400, 250);
            ctx.font = '16px Press Start 2P';
            ctx.fillText(`Score: ${score}`, 400, 300);
            ctx.fillText('Press SPACE for next level', 400, 350);
        }
        ctx.textAlign = 'left';
    } else if (gameState === 'gameOver') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, 800, 600);
        
        ctx.fillStyle = '#f00'; 
        ctx.font = '24px Press Start 2P';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', 400, 250);
        
        ctx.font = '16px Press Start 2P';
        ctx.fillText(`Final Score: ${score}`, 400, 300);
        ctx.fillText('Press SPACE to retry', 400, 350);
        ctx.textAlign = 'left';
    } else if (gameState === 'gameWon') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, 800, 600);
        
        ctx.fillStyle = '#ff0'; 
        ctx.font = '24px Press Start 2P';
        ctx.textAlign = 'center';
        ctx.fillText('CONGRATULATIONS!', 400, 200);
        
        ctx.font = '16px Press Start 2P';
        ctx.fillText('You completed all levels!', 400, 250);
        ctx.fillText(`Final Score: ${score}`, 400, 300);
        ctx.fillText('Press SPACE to play again', 400, 350);
        ctx.textAlign = 'left';
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
