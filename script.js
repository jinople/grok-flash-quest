const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; // Crisp 8-bit pixels

// Game state
let gameStarted = false;
let player = { x: 50, y: 500, width: 16, height: 16, speed: 5, frame: 0, invincible: 0 };
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

// Sprites using emojis
const sprites = {
    player: '🤠', // Cowboy for Grok
    flash: '🐴', // Horse for Flash
    coin: '🪙', // Coin
    bandit: '🦹', // Villain for bandit
    spark: '✨' // Sparkle for lasso effect
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

    // Lasso (Space) with cooldown and hit counter - improved hit detection range
    if (keys['space'] && lassoCooldown <= 0 && !flash.saved) {
        if (Math.abs(player.x - flash.x) < 80 && Math.abs(player.y - flash.y) < 80) { // Increased from 50 to 80
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

    // Mud and time - further reduced mud meter progression to make game more winnable
    if (!flash.saved) mudMeter += 0.01; // Reduced from 0.02 to 0.01
    timeLeft -= 1/60;
    if (mudMeter >= 100 || timeLeft <= 0) {
        alert('Game Over! Flash is stuck in the mud. Try again!');
        location.reload();
    }
    if (flash.saved) {
        alert(`🎉 Quest Complete! Flash is free! 🎉\nFinal Score: ${score}\nTime Remaining: ${Math.floor(timeLeft)}s`);
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

    // Bandit collision with invincibility frames
    if (player.invincible > 0) {
        player.invincible--;
    } else {
        bandits.forEach(b => {
            if (Math.abs(player.x - b.x) < 16 && Math.abs(player.y - b.y) < 16) {
                hearts--;
                player.invincible = 60; // 1 second of invincibility at 60fps
                sparkEffect = {x: player.x, y: player.y, frame: 0, duration: 10}; // Spark on hit
                if (hearts <= 0) {
                    alert('💀 Game Over! The bandits got you! 💀\nTry again!');
                    location.reload();
                }
            }
        });
    }

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

    // Set font for emojis
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Player (with invincibility flashing)
    if (player.invincible === 0 || Math.floor(player.invincible / 5) % 2 === 0) {
        ctx.fillText(sprites.player, player.x + player.width/2, player.y + player.height/2);
    }

    // Flash
    ctx.fillText(sprites.flash, flash.x + flash.width/2, flash.y + flash.height/2);
    if (flash.saved) {
        ctx.fillStyle = '#0f0'; ctx.font = '10px Press Start 2P';
        ctx.fillText('Saved!', flash.x, flash.y - 10);
        ctx.font = '16px Arial'; // Reset font
    } else if (flash.lassoHits > 0) {
        // Show lasso progress
        ctx.fillStyle = '#ff0'; ctx.font = '8px Press Start 2P';
        ctx.fillText(`${flash.lassoHits}/3`, flash.x + flash.width/2, flash.y - 15);
        ctx.font = '16px Arial'; // Reset font
    }

    // Coins
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.fillText(sprites.coin, coin.x + 4, coin.y + 4);
        }
    });

    // Bandits
    bandits.forEach(b => {
        ctx.fillText(sprites.bandit, b.x + b.width/2, b.y + b.height/2);
    });

    // Lasso effect
    if (keys['space'] && lassoCooldown > 25) {
        ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(player.x + 8, player.y); ctx.lineTo(flash.x, flash.y); ctx.stroke();
    }

    // Spark effect
    if (sparkEffect && sparkEffect.frame < sparkEffect.duration) {
        ctx.fillText(sprites.spark, sparkEffect.x + 4, sparkEffect.y + 4);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
