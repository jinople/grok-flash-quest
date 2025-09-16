const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; // Crisp 8-bit pixels

// Game state
let gameStarted = false;
let player = { x: 50, y: 500, width: 16, height: 16, speed: 5, frame: 0 };
let flash = { x: 600, y: 500, width: 16, height: 16, saved: false, frame: 0, lassoHits: 0 };
let mudMeter = 25;
let timeLeft = 120;
let score = 250;
let hearts = 3;
let keys = {};
let coins = [{x: 200, y: 450, collected: false}, {x: 400, y: 450, collected: false}];
let bandits = [{x: 300, y: 500, width: 16, height: 16, frame: 0}];
let lassoCooldown = 0; // Debounce lasso
let sparkEffect = null; // Visual feedback for Spacebar

// Sprites
const sprites = {
    player: [[0, 255, 0], [50, 255, 50]], // Green Grok knight
    flash: [[139, 69, 19], [160, 82, 45]], // Brown horse
    coin: [[255, 255, 0], [255, 215, 0]], // Gold coin spin
    bandit: [[255, 0, 0], [200, 0, 0]], // Red bandit
    spark: [[255, 255, 255], [200, 200, 200]] // Lasso spark
};

// Ensure canvas focus
canvas.tabIndex = 1; // Make canvas focusable
canvas.focus(); // Force focus on load
canvas.addEventListener('click', () => canvas.focus()); // Refocus on click

// Key listeners with e.code for reliability
window.addEventListener('keydown', (e) => {
    keys[e.code.toLowerCase()] = true;
    if (e.code === 'Space' && !gameStarted) {
        gameStarted = true;
        document.getElementById('title-screen').style.display = 'none';
        sparkEffect = {x: player.x + 8, y: player.y, frame: 0, duration: 10}; // Start spark
    }
});
window.addEventListener('keyup', (e) => keys[e.code.toLowerCase()] = false);

function update() {
    if (!gameStarted) return;

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
        if (Math.abs(player.x - flash.x) < 50 && Math.abs(player.y - flash.y) < 50) {
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
    if (!flash.saved) mudMeter += 0.1;
    timeLeft -= 1/60;
    if (mudMeter >= 100 || timeLeft <= 0) {
        alert('Game Over! Mud wins. Retry?');
        location.reload();
    }
    if (flash.saved) {
        alert('Quest Complete! Flash saved. Score: ' + score);
        location.reload();
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
    bandits.forEach(b => {
        if (Math.abs(player.x - b.x) < 16 && Math.abs(player.y - b.y) < 16) {
            hearts--;
            sparkEffect = {x: player.x, y: player.y, frame: 0, duration: 10}; // Spark on hit
            if (hearts <= 0) {
                alert('Game Over! Bandits win. Retry?');
                location.reload();
            }
        }
    });

    // Animation frames
    player.frame = (player.frame + 0.1) % 2;
    flash.frame = (flash.frame + 0.05) % 2;
    bandits.forEach(b => b.frame = (b.frame + 0.1) % 2);
    if (sparkEffect) sparkEffect.frame++;

    // UI Update
    document.getElementById('mud-meter').textContent = `Mud: ${Math.floor(mudMeter)}%`;
    document.getElementById('time').textContent = `Time: ${Math.floor(timeLeft)}/120s`;
    document.getElementById('score').textContent = `Score: ${score}`;
    let heartStr = ''; for (let i = 0; i < hearts; i++) heartStr += '❤️';
    document.getElementById('hearts').textContent = `Hearts: ${heartStr}`;
}

function draw() {
    ctx.clearRect(0, 0, 800, 600);

    // Background
    ctx.fillStyle = '#1a1a3d'; ctx.fillRect(0, 0, 800, 550);
    ctx.fillStyle = '#8B4513'; ctx.fillRect(0, 550, 800, 50);
    if (!flash.saved) {
        ctx.fillStyle = `rgba(139, 69, 19, ${mudMeter/100})`;
        ctx.fillRect(flash.x - 10, flash.y, 36, 36);
    }

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
    if (keys['space'] && lassoCooldown > 25) {
        ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(player.x + 8, player.y); ctx.lineTo(flash.x, flash.y); ctx.stroke();
    }

    // Spark effect
    if (sparkEffect && sparkEffect.frame < sparkEffect.duration) {
        ctx.fillStyle = `rgb(${sprites.spark[Math.floor(sparkEffect.frame % 2)].join(',')})`;
        ctx.fillRect(sparkEffect.x, sparkEffect.y, 8, 8);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
