// ================================
// GROK'S FLASH QUEST - Enhanced Edition
// Emoji-based adventure game
// ================================

// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_SPEED: 4,
    BANDIT_SPEED: 1.5,
    GAME_TIMER: 120,
    LASSO_RANGE: 80,
    LASSO_COOLDOWN: 60, // frames
    FLASH_HITS_NEEDED: 3,
    MUD_INCREASE_RATE: 0.02,
    MUD_DECREASE_ON_HIT: 15,
    INVINCIBILITY_FRAMES: 120,
    SCREEN_SHAKE_DURATION: 30,
    PARTICLE_LIFETIME: 60,
    EMOJI_SIZE: 24
};

// Game States
const GAME_STATES = {
    TITLE: 'title',
    PLAYING: 'playing',
    VICTORY: 'victory',
    GAME_OVER: 'game_over'
};

// ================================
// UTILITY CLASSES
// ================================

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    distance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    copy() {
        return new Vector2(this.x, this.y);
    }
}

class AABB {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    intersects(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    center() {
        return new Vector2(this.x + this.width / 2, this.y + this.height / 2);
    }
}

// ================================
// PARTICLE SYSTEM
// ================================

class Particle {
    constructor(x, y, emoji, lifetime = CONFIG.PARTICLE_LIFETIME) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4 - 2
        );
        this.emoji = emoji;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.scale = 1;
    }
    
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y += 0.1; // gravity
        this.lifetime--;
        this.scale = this.lifetime / this.maxLifetime;
        return this.lifetime > 0;
    }
    
    render(ctx) {
        const alpha = this.lifetime / this.maxLifetime;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${CONFIG.EMOJI_SIZE * this.scale}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.position.x, this.position.y);
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, emoji, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, emoji));
        }
    }
    
    update() {
        this.particles = this.particles.filter(particle => particle.update());
    }
    
    render(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
    }
}

// ================================
// GAME ENTITIES
// ================================

class Entity {
    constructor(x, y, emoji, size = CONFIG.EMOJI_SIZE) {
        this.position = new Vector2(x, y);
        this.size = size;
        this.emoji = emoji;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobSpeed = 0.05;
        this.bobAmount = 2;
    }
    
    getBounds() {
        return new AABB(this.position.x - this.size/2, this.position.y - this.size/2, this.size, this.size);
    }
    
    render(ctx, time = 0) {
        const bobY = Math.sin(time * this.bobSpeed + this.bobOffset) * this.bobAmount;
        
        ctx.save();
        ctx.font = `${this.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Fallback rectangle if emoji doesn't render
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.position.x - this.size/2, this.position.y - this.size/2 + bobY, this.size, this.size);
        
        ctx.fillText(this.emoji, this.position.x, this.position.y + bobY);
        ctx.restore();
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, '🤠');
        this.speed = CONFIG.PLAYER_SPEED;
        this.invincibilityFrames = 0;
        this.flashOpacity = 1;
    }
    
    update(input) {
        // Movement
        if (input.left) this.position.x -= this.speed;
        if (input.right) this.position.x += this.speed;
        if (input.up) this.position.y -= this.speed;
        if (input.down) this.position.y += this.speed;
        
        // Boundary checking
        this.position.x = Math.max(this.size/2, Math.min(CONFIG.CANVAS_WIDTH - this.size/2, this.position.x));
        this.position.y = Math.max(this.size/2, Math.min(CONFIG.CANVAS_HEIGHT - this.size/2, this.position.y));
        
        // Update invincibility
        if (this.invincibilityFrames > 0) {
            this.invincibilityFrames--;
            this.flashOpacity = Math.sin(this.invincibilityFrames * 0.3) * 0.5 + 0.5;
        } else {
            this.flashOpacity = 1;
        }
    }
    
    takeDamage() {
        if (this.invincibilityFrames <= 0) {
            this.invincibilityFrames = CONFIG.INVINCIBILITY_FRAMES;
            return true;
        }
        return false;
    }
    
    render(ctx, time = 0) {
        ctx.save();
        ctx.globalAlpha = this.flashOpacity;
        super.render(ctx, time);
        ctx.restore();
    }
}

class Horse extends Entity {
    constructor(x, y) {
        super(x, y, '🐴');
        this.saved = false;
        this.lassoHits = 0;
        this.savedAnimation = 0;
    }
    
    update() {
        if (this.saved) {
            this.savedAnimation += 0.1;
            this.bobAmount = 4 + Math.sin(this.savedAnimation) * 2;
        }
    }
    
    onLassoHit() {
        this.lassoHits++;
        if (this.lassoHits >= CONFIG.FLASH_HITS_NEEDED) {
            this.saved = true;
            this.emoji = '🐴✨'; // Add sparkles when saved
        }
    }
    
    render(ctx, time = 0) {
        super.render(ctx, time);
        
        if (this.saved) {
            // Render "SAVED!" text
            ctx.save();
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = '#0f0';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SAVED!', this.position.x, this.position.y - 40);
            ctx.restore();
        } else {
            // Show progress
            const progress = this.lassoHits / CONFIG.FLASH_HITS_NEEDED;
            ctx.save();
            ctx.strokeStyle = '#ff0';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.position.x - 20, this.position.y - 35, 40, 8);
            ctx.fillStyle = '#ff0';
            ctx.fillRect(this.position.x - 20, this.position.y - 35, 40 * progress, 8);
            ctx.restore();
        }
    }
}

class Bandit extends Entity {
    constructor(x, y) {
        super(x, y, '🏴‍☠️');
        this.speed = CONFIG.BANDIT_SPEED;
        this.direction = new Vector2(Math.random() - 0.5, Math.random() - 0.5);
        this.patrolTime = 0;
        this.chaseRange = 150;
    }
    
    update(playerPos) {
        const distToPlayer = this.position.distance(playerPos);
        
        if (distToPlayer < this.chaseRange) {
            // Chase player
            const dx = playerPos.x - this.position.x;
            const dy = playerPos.y - this.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                this.position.x += (dx / dist) * this.speed;
                this.position.y += (dy / dist) * this.speed;
            }
        } else {
            // Patrol behavior
            this.patrolTime++;
            if (this.patrolTime > 120) {
                this.direction.x = (Math.random() - 0.5) * 2;
                this.direction.y = (Math.random() - 0.5) * 2;
                this.patrolTime = 0;
            }
            
            this.position.x += this.direction.x * this.speed * 0.5;
            this.position.y += this.direction.y * this.speed * 0.5;
        }
        
        // Boundary checking
        if (this.position.x < this.size/2 || this.position.x > CONFIG.CANVAS_WIDTH - this.size/2) {
            this.direction.x *= -1;
        }
        if (this.position.y < this.size/2 || this.position.y > CONFIG.CANVAS_HEIGHT - this.size/2) {
            this.direction.y *= -1;
        }
        
        this.position.x = Math.max(this.size/2, Math.min(CONFIG.CANVAS_WIDTH - this.size/2, this.position.x));
        this.position.y = Math.max(this.size/2, Math.min(CONFIG.CANVAS_HEIGHT - this.size/2, this.position.y));
    }
}

class Coin extends Entity {
    constructor(x, y) {
        super(x, y, '💰', 20);
        this.collected = false;
        this.spinSpeed = 0.1;
        this.rotation = 0;
    }
    
    update() {
        this.rotation += this.spinSpeed;
    }
    
    render(ctx, time = 0) {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
    
    collect() {
        this.collected = true;
    }
}

// ================================
// INPUT MANAGER
// ================================

class InputManager {
    constructor() {
        this.keys = {};
        this.touch = {
            left: false,
            right: false,
            up: false,
            down: false,
            lasso: false
        };
        this.setupKeyboard();
        this.setupTouch();
    }
    
    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code.toLowerCase()] = true;
            e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code.toLowerCase()] = false;
            e.preventDefault();
        });
    }
    
    setupTouch() {
        const touchHandler = (element, action) => {
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touch[action] = true;
            });
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touch[action] = false;
            });
        };
        
        touchHandler(document.getElementById('left-btn'), 'left');
        touchHandler(document.getElementById('right-btn'), 'right');
        touchHandler(document.getElementById('up-btn'), 'up');
        touchHandler(document.getElementById('down-btn'), 'down');
        touchHandler(document.getElementById('lasso-btn'), 'lasso');
        
        // Prevent page scroll on touch controls
        document.getElementById('touch-controls').addEventListener('touchstart', (e) => e.preventDefault());
        document.getElementById('touch-controls').addEventListener('touchmove', (e) => e.preventDefault());
    }
    
    getInput() {
        return {
            left: this.keys['arrowleft'] || this.keys['keya'] || this.touch.left,
            right: this.keys['arrowright'] || this.keys['keyd'] || this.touch.right,
            up: this.keys['arrowup'] || this.keys['keyw'] || this.touch.up,
            down: this.keys['arrowdown'] || this.keys['keys'] || this.touch.down,
            lasso: this.keys['space'] || this.touch.lasso,
            start: this.keys['space'] || this.keys['enter']
        };
    }
}

// ================================
// SOUND MANAGER
// ================================

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.muted = localStorage.getItem('grok_muted') === 'true';
        this.volume = parseFloat(localStorage.getItem('grok_volume')) || 0.5;
        this.updateSoundIcon();
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playSound(frequency, duration, type = 'square') {
        if (this.muted || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playLasso() {
        this.playSound(400, 0.2, 'sawtooth');
    }
    
    playCoin() {
        this.playSound(800, 0.3, 'sine');
    }
    
    playHit() {
        this.playSound(200, 0.5, 'square');
    }
    
    playVictory() {
        this.playSound(523, 0.3);
        setTimeout(() => this.playSound(659, 0.3), 100);
        setTimeout(() => this.playSound(784, 0.3), 200);
    }
    
    playGameOver() {
        this.playSound(200, 0.8, 'sawtooth');
    }
    
    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('grok_muted', this.muted.toString());
        this.updateSoundIcon();
    }
    
    updateSoundIcon() {
        const icon = document.getElementById('sound-toggle');
        if (icon) {
            icon.textContent = this.muted ? '🔇' : '🔊';
        }
    }
}

// ================================
// EFFECTS SYSTEM
// ================================

class EffectsManager {
    constructor() {
        this.screenShake = 0;
        this.redFlash = 0;
    }
    
    addScreenShake(intensity = CONFIG.SCREEN_SHAKE_DURATION) {
        this.screenShake = Math.max(this.screenShake, intensity);
    }
    
    addRedFlash() {
        this.redFlash = 30;
    }
    
    update() {
        if (this.screenShake > 0) this.screenShake--;
        if (this.redFlash > 0) this.redFlash--;
    }
    
    applyScreenShake(ctx) {
        if (this.screenShake > 0) {
            const intensity = this.screenShake / CONFIG.SCREEN_SHAKE_DURATION;
            const offsetX = (Math.random() - 0.5) * intensity * 10;
            const offsetY = (Math.random() - 0.5) * intensity * 10;
            ctx.translate(offsetX, offsetY);
        }
    }
    
    renderRedFlash(ctx) {
        if (this.redFlash > 0) {
            const alpha = this.redFlash / 30;
            ctx.save();
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.3})`;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            ctx.restore();
        }
    }
}

// ================================
// MAIN GAME CLASS
// ================================

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        this.state = GAME_STATES.TITLE;
        this.lastTime = 0;
        this.gameTime = 0;
        
        this.input = new InputManager();
        this.sound = new SoundManager();
        this.effects = new EffectsManager();
        this.particles = new ParticleSystem();
        
        this.score = 0;
        this.hearts = 3;
        this.timeLeft = CONFIG.GAME_TIMER;
        this.mudPercent = 0;
        this.lassoCooldown = 0;
        
        this.bestScore = parseInt(localStorage.getItem('grok_best_score')) || 0;
        
        this.initializeEntities();
        this.setupUI();
        this.start();
    }
    
    initializeEntities() {
        this.player = new Player(50, CONFIG.CANVAS_HEIGHT - 100);
        this.horse = new Horse(CONFIG.CANVAS_WIDTH - 100, CONFIG.CANVAS_HEIGHT - 100);
        this.bandits = [
            new Bandit(300, 300),
            new Bandit(500, 200)
        ];
        this.coins = [
            new Coin(200, 400),
            new Coin(400, 300),
            new Coin(600, 450),
            new Coin(150, 200),
            new Coin(650, 250)
        ];
    }
    
    setupUI() {
        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Restart buttons
        document.getElementById('victory-restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('gameover-restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('click', () => {
            this.sound.toggleMute();
        });
        
        // Canvas focus for keyboard input
        this.canvas.tabIndex = 1;
        this.canvas.focus();
        this.canvas.addEventListener('click', () => this.canvas.focus());
    }
    
    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.hideAllScreens();
        this.resetGame();
    }
    
    resetGame() {
        this.score = 0;
        this.hearts = 3;
        this.timeLeft = CONFIG.GAME_TIMER;
        this.mudPercent = 0;
        this.lassoCooldown = 0;
        this.gameTime = 0;
        
        this.initializeEntities();
        this.particles = new ParticleSystem();
        this.effects = new EffectsManager();
        
        this.updateUI();
    }
    
    restart() {
        this.state = GAME_STATES.TITLE;
        this.showScreen('title-screen');
    }
    
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    }
    
    showScreen(screenId) {
        this.hideAllScreens();
        document.getElementById(screenId).classList.remove('hidden');
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        if (this.state === GAME_STATES.TITLE) {
            const input = this.input.getInput();
            if (input.start) {
                this.startGame();
            }
            return;
        }
        
        if (this.state !== GAME_STATES.PLAYING) return;
        
        const input = this.input.getInput();
        
        // Update player
        this.player.update(input);
        
        // Update horse
        this.horse.update();
        
        // Update bandits
        this.bandits.forEach(bandit => {
            bandit.update(this.player.position);
        });
        
        // Update coins
        this.coins.forEach(coin => coin.update());
        
        // Lasso mechanics
        if (this.lassoCooldown > 0) this.lassoCooldown--;
        
        if (input.lasso && this.lassoCooldown <= 0 && !this.horse.saved) {
            const distance = this.player.position.distance(this.horse.position);
            if (distance < CONFIG.LASSO_RANGE) {
                this.horse.onLassoHit();
                this.lassoCooldown = CONFIG.LASSO_COOLDOWN;
                this.mudPercent = Math.max(0, this.mudPercent - CONFIG.MUD_DECREASE_ON_HIT);
                this.particles.emit(this.horse.position.x, this.horse.position.y, '✨', 8);
                this.sound.playLasso();
                
                if (this.horse.saved) {
                    this.score += 1000;
                }
            }
        }
        
        // Collision detection - coins
        this.coins.forEach(coin => {
            if (!coin.collected && this.player.getBounds().intersects(coin.getBounds())) {
                coin.collect();
                this.score += 100;
                this.particles.emit(coin.position.x, coin.position.y, '💫', 5);
                this.sound.playCoin();
            }
        });
        
        // Collision detection - bandits
        this.bandits.forEach(bandit => {
            if (this.player.getBounds().intersects(bandit.getBounds())) {
                if (this.player.takeDamage()) {
                    this.hearts--;
                    this.effects.addScreenShake();
                    this.effects.addRedFlash();
                    this.particles.emit(this.player.position.x, this.player.position.y, '💥', 6);
                    this.sound.playHit();
                }
            }
        });
        
        // Update mud meter (only if horse not saved)
        if (!this.horse.saved) {
            this.mudPercent += CONFIG.MUD_INCREASE_RATE;
        }
        
        // Update timer
        this.timeLeft -= deltaTime / 1000;
        
        // Update effects and particles
        this.effects.update();
        this.particles.update();
        
        // Check win/lose conditions
        this.checkGameState();
        
        // Update UI
        this.updateUI();
    }
    
    checkGameState() {
        if (this.hearts <= 0) {
            this.gameOver('You ran out of hearts!');
        } else if (this.mudPercent >= 100) {
            this.gameOver('Flash got stuck in the mud!');
        } else if (this.timeLeft <= 0) {
            this.gameOver('Time ran out!');
        } else if (this.horse.saved) {
            this.victory();
        }
    }
    
    victory() {
        this.state = GAME_STATES.VICTORY;
        this.updateBestScore();
        this.showVictoryScreen();
        this.sound.playVictory();
    }
    
    gameOver(reason) {
        this.state = GAME_STATES.GAME_OVER;
        this.updateBestScore();
        this.showGameOverScreen(reason);
        this.sound.playGameOver();
    }
    
    updateBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('grok_best_score', this.bestScore.toString());
        }
    }
    
    showVictoryScreen() {
        document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
        document.getElementById('best-score').textContent = `Best Score: ${this.bestScore}`;
        this.showScreen('victory-screen');
    }
    
    showGameOverScreen(reason) {
        document.getElementById('game-over-reason').textContent = reason;
        document.getElementById('final-score-go').textContent = `Final Score: ${this.score}`;
        document.getElementById('best-score-go').textContent = `Best Score: ${this.bestScore}`;
        this.showScreen('gameover-screen');
    }
    
    updateUI() {
        // Hearts
        document.getElementById('hearts').textContent = '❤️'.repeat(Math.max(0, this.hearts));
        
        // Score
        document.getElementById('score').textContent = `Score: ${this.score}`;
        
        // Time
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = Math.floor(this.timeLeft % 60);
        document.getElementById('time').textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Mud meter
        const mudPercent = Math.min(100, Math.max(0, this.mudPercent));
        document.getElementById('mud-fill').style.width = `${mudPercent}%`;
        document.getElementById('mud-percent').textContent = `${Math.floor(mudPercent)}%`;
        
        // Lasso cooldown
        const lassoPercent = Math.max(0, (CONFIG.LASSO_COOLDOWN - this.lassoCooldown) / CONFIG.LASSO_COOLDOWN * 100);
        document.getElementById('lasso-fill').style.width = `${lassoPercent}%`;
        
        // Add pulsing for critical states
        const mudBar = document.getElementById('mud-bar');
        const timeElement = document.getElementById('time');
        const heartsElement = document.getElementById('hearts');
        
        if (mudPercent > 75) {
            mudBar.style.animation = 'pulse 0.5s infinite';
        } else {
            mudBar.style.animation = '';
        }
        
        if (this.timeLeft < 30) {
            timeElement.style.animation = 'pulse 0.5s infinite';
            timeElement.style.color = '#f66';
        } else {
            timeElement.style.animation = '';
            timeElement.style.color = '#0f0';
        }
        
        if (this.hearts <= 1) {
            heartsElement.style.animation = 'pulse 0.5s infinite';
            heartsElement.style.color = '#f66';
        } else {
            heartsElement.style.animation = '';
            heartsElement.style.color = '#0f0';
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Apply screen shake
        this.ctx.save();
        this.effects.applyScreenShake(this.ctx);
        
        // Render background
        this.renderBackground();
        
        // Render lasso line
        if (this.state === GAME_STATES.PLAYING && this.input.getInput().lasso && this.lassoCooldown > CONFIG.LASSO_COOLDOWN - 10) {
            this.renderLassoLine();
        }
        
        // Render entities
        if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.TITLE) {
            this.player.render(this.ctx, this.gameTime);
            this.horse.render(this.ctx, this.gameTime);
            
            this.bandits.forEach(bandit => {
                bandit.render(this.ctx, this.gameTime);
            });
            
            this.coins.forEach(coin => {
                coin.render(this.ctx, this.gameTime);
            });
        }
        
        // Render particles
        this.particles.render(this.ctx);
        
        // Render effects
        this.effects.renderRedFlash(this.ctx);
        
        this.ctx.restore();
    }
    
    renderBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
        gradient.addColorStop(0, '#1a1a3d');
        gradient.addColorStop(0.7, '#2a2a5e');
        gradient.addColorStop(1, '#3a3a7e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT * 0.8);
        
        // Ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, CONFIG.CANVAS_HEIGHT * 0.8, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT * 0.2);
        
        // Mud around horse (if not saved)
        if (!this.horse.saved && this.mudPercent > 0) {
            const mudAlpha = Math.min(1, this.mudPercent / 100);
            this.ctx.fillStyle = `rgba(139, 69, 19, ${mudAlpha * 0.7})`;
            const mudSize = 60 + (this.mudPercent / 100) * 40;
            this.ctx.fillRect(
                this.horse.position.x - mudSize/2,
                this.horse.position.y - mudSize/2,
                mudSize,
                mudSize
            );
        }
        
        // Horizon line
        this.ctx.strokeStyle = '#555';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, CONFIG.CANVAS_HEIGHT * 0.8);
        this.ctx.lineTo(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT * 0.8);
        this.ctx.stroke();
    }
    
    renderLassoLine() {
        const distance = this.player.position.distance(this.horse.position);
        if (distance < CONFIG.LASSO_RANGE) {
            this.ctx.save();
            this.ctx.strokeStyle = '#ff0';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.position.x, this.player.position.y);
            this.ctx.lineTo(this.horse.position.x, this.horse.position.y);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
    
    start() {
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(Math.min(deltaTime, 50)); // Cap delta time to prevent large jumps
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// ================================
// GAME INITIALIZATION
// ================================

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Prevent default touch behaviors on the canvas
document.getElementById('game-canvas').addEventListener('touchstart', (e) => e.preventDefault());
document.getElementById('game-canvas').addEventListener('touchmove', (e) => e.preventDefault());
document.getElementById('game-canvas').addEventListener('touchend', (e) => e.preventDefault());