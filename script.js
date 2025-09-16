// ================================
// GROK'S FLASH QUEST - Enhanced Edition
// Emoji-based adventure game
// ================================

// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TILE_SIZE: 25,
    MAP_WIDTH: 32,
    MAP_HEIGHT: 24,
    PLAYER_SPEED: 2.5,
    FLASH_SPEED: 2,
    PATROL_SPEED: 1.5,
    SPRINT_MULTIPLIER: 1.8,
    STAMINA_MAX: 100,
    STAMINA_DRAIN_RATE: 2,
    STAMINA_REGEN_RATE: 1,
    GAME_TIMER: 300, // 5 minutes max
    PICKUP_DURATION: 40, // frames (0.67s at 60fps)
    UNLOCK_DURATION: 72, // frames (1.2s at 60fps)
    CALM_FLASH_DURATION: 48, // frames (0.8s at 60fps)
    LOS_RANGE: 120,
    LOS_ANGLE: 60, // degrees
    ALERT_DECREASE_RATE: 0.5,
    MAX_STRIKES: 3,
    INVINCIBILITY_FRAMES: 120,
    SCREEN_SHAKE_DURATION: 30,
    PARTICLE_LIFETIME: 60,
    EMOJI_SIZE: 20,
    // Flash follow behavior settings
    FLASH_FOLLOW_DISTANCE: 12, // target follow distance in pixels
    FLASH_CATCHUP_DISTANCE: 64, // distance threshold for catch-up behavior
    FLASH_CATCHUP_CLOSE_DISTANCE: 32, // distance to return to normal speed
    FLASH_CATCHUP_SPEED_MULTIPLIER: 1.4, // +40% speed boost during catch-up
    FLASH_WHISTLE_COOLDOWN: 48, // frames (0.8s at 60fps)
    FLASH_WHISTLE_LERP_DURATION: 15, // frames (~250ms at 60fps for smooth interpolation)
    FLASH_EXIT_SUCCESS_RADIUS: 20 // pixels - consider Flash "in exit" within this radius
};

// Game States
const GAME_STATES = {
    TITLE: 'title',
    PLAYING: 'playing',
    VICTORY: 'victory',
    GAME_OVER: 'game_over'
};

// Tile Types
const TILE_TYPES = {
    FLOOR: 0,
    WALL: 1,
    CLOTHES_RACK: 2,
    FITTING_ROOM: 3,
    CUSTOMER_SERVICE: 4,
    STOCKROOM_DOOR: 5,
    EXIT: 6,
    PLAYER_SPAWN: 7,
    FLASH_PEN: 8
};

// Item Types  
const ITEM_TYPES = {
    HALTER: 'halter',
    LEAD_ROPE: 'lead_rope', 
    SADDLE_PAD: 'saddle_pad',
    GATE_KEY: 'gate_key'
};

// NPC Types
const NPC_TYPES = {
    SECURITY: 'security',
    ASSOCIATE1: 'associate1', 
    ASSOCIATE2: 'associate2'
};

// ================================
// TILE MAP DATA
// ================================

// Walmart Clothes Department Map (32x24)
const WALMART_MAP = [
    // Row 0-3: Top wall and entrance area
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    
    // Row 4-7: Clothes racks area  
    [1,0,2,2,0,0,2,2,0,0,2,2,0,0,0,0,0,0,2,2,0,0,2,2,0,0,2,2,0,0,0,1],
    [1,0,2,2,0,0,2,2,0,0,2,2,0,0,0,0,0,0,2,2,0,0,2,2,0,0,2,2,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    
    // Row 8-11: Middle area with fitting rooms
    [1,0,2,2,0,0,2,2,0,0,0,0,0,0,3,3,3,3,0,0,2,2,0,0,2,2,0,0,2,2,0,1],
    [1,0,2,2,0,0,2,2,0,0,0,0,0,0,3,3,3,3,0,0,2,2,0,0,2,2,0,0,2,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    
    // Row 12-15: Customer service and more racks
    [1,0,2,2,0,0,2,2,0,0,0,0,4,4,0,0,0,0,0,0,2,2,0,0,2,2,0,0,2,2,0,1],
    [1,0,2,2,0,0,2,2,0,0,0,0,4,4,0,0,0,0,0,0,2,2,0,0,2,2,0,0,2,2,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    
    // Row 16-19: Lower area with stockroom
    [1,0,2,2,0,0,2,2,0,0,2,2,0,0,0,0,0,0,2,2,0,0,2,2,0,0,1,5,5,1,0,1],
    [1,0,2,2,0,0,2,2,0,0,2,2,0,0,0,0,0,0,2,2,0,0,2,2,0,0,1,8,8,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,8,8,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1],
    
    // Row 20-23: Bottom area and exit
    [1,0,2,2,0,0,2,2,0,0,2,2,0,0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0,0,0,1],
    [1,0,2,2,0,0,2,2,0,0,2,2,0,0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Item spawn locations
const ITEM_SPAWNS = {
    [ITEM_TYPES.HALTER]: { x: 4, y: 4 }, // Near clothes racks
    [ITEM_TYPES.LEAD_ROPE]: { x: 15, y: 9 }, // Near fitting rooms
    [ITEM_TYPES.SADDLE_PAD]: { x: 26, y: 20 }, // Bottom area
    [ITEM_TYPES.GATE_KEY]: { x: 13, y: 12 } // Customer service (could be randomized)
};

// NPC patrol routes
const PATROL_ROUTES = {
    [NPC_TYPES.SECURITY]: [
        { x: 6, y: 6 }, { x: 15, y: 6 }, { x: 15, y: 15 }, { x: 6, y: 15 }
    ],
    [NPC_TYPES.ASSOCIATE1]: [
        { x: 20, y: 8 }, { x: 25, y: 8 }, { x: 25, y: 12 }, { x: 20, y: 12 }
    ],
    [NPC_TYPES.ASSOCIATE2]: [
        { x: 10, y: 18 }, { x: 18, y: 18 }, { x: 18, y: 21 }, { x: 10, y: 21 }
    ]
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
        super(x, y, '🧑');
        this.speed = CONFIG.PLAYER_SPEED;
        this.invincibilityFrames = 0;
        this.flashOpacity = 1;
        this.stamina = CONFIG.STAMINA_MAX;
        this.sprinting = false;
        this.hidden = false;
        this.tileX = Math.floor(x / CONFIG.TILE_SIZE);
        this.tileY = Math.floor(y / CONFIG.TILE_SIZE);
        this.collectedItems = new Set();
        this.hasFlash = false;
        this.interactionTimer = 0;
        this.interactionTarget = null;
    }
    
    update(input, gameMap) {
        const prevX = this.position.x;
        const prevY = this.position.y;
        
        // Handle sprinting
        this.sprinting = input.sprint && this.stamina > 0;
        const currentSpeed = this.sprinting ? this.speed * CONFIG.SPRINT_MULTIPLIER : this.speed;
        
        // Update stamina
        if (this.sprinting) {
            this.stamina = Math.max(0, this.stamina - CONFIG.STAMINA_DRAIN_RATE);
        } else {
            this.stamina = Math.min(CONFIG.STAMINA_MAX, this.stamina + CONFIG.STAMINA_REGEN_RATE);
        }
        
        // Movement with collision detection
        let newX = this.position.x;
        let newY = this.position.y;
        
        if (input.left) newX -= currentSpeed;
        if (input.right) newX += currentSpeed;
        if (input.up) newY -= currentSpeed;
        if (input.down) newY += currentSpeed;
        
        // Check tile collision
        if (this.canMoveTo(newX, this.position.y, gameMap)) {
            this.position.x = newX;
        }
        if (this.canMoveTo(this.position.x, newY, gameMap)) {
            this.position.y = newY;
        }
        
        // Update tile position
        this.tileX = Math.floor(this.position.x / CONFIG.TILE_SIZE);
        this.tileY = Math.floor(this.position.y / CONFIG.TILE_SIZE);
        
        // Check if hidden in clothes rack
        const currentTile = this.getCurrentTile(gameMap);
        this.hidden = (currentTile === TILE_TYPES.CLOTHES_RACK);
        if (this.hidden && this.sprinting) {
            this.hidden = false; // Sprinting in racks reduces stealth
        }
        
        // Handle interaction timer
        if (this.interactionTimer > 0) {
            this.interactionTimer--;
            if (this.interactionTimer === 0) {
                this.completeInteraction();
            }
        }
        
        // Update invincibility
        if (this.invincibilityFrames > 0) {
            this.invincibilityFrames--;
            this.flashOpacity = Math.sin(this.invincibilityFrames * 0.3) * 0.5 + 0.5;
        } else {
            this.flashOpacity = 1;
        }
        
        // Boundary checking
        this.position.x = Math.max(CONFIG.TILE_SIZE/2, Math.min(CONFIG.CANVAS_WIDTH - CONFIG.TILE_SIZE/2, this.position.x));
        this.position.y = Math.max(CONFIG.TILE_SIZE/2, Math.min(CONFIG.CANVAS_HEIGHT - CONFIG.TILE_SIZE/2, this.position.y));
    }
    
    canMoveTo(x, y, gameMap) {
        const tileX = Math.floor(x / CONFIG.TILE_SIZE);
        const tileY = Math.floor(y / CONFIG.TILE_SIZE);
        
        if (tileX < 0 || tileX >= CONFIG.MAP_WIDTH || tileY < 0 || tileY >= CONFIG.MAP_HEIGHT) {
            return false;
        }
        
        const tile = gameMap[tileY][tileX];
        return tile !== TILE_TYPES.WALL && tile !== TILE_TYPES.FITTING_ROOM;
    }
    
    getCurrentTile(gameMap) {
        if (this.tileY < 0 || this.tileY >= CONFIG.MAP_HEIGHT || 
            this.tileX < 0 || this.tileX >= CONFIG.MAP_WIDTH) {
            return TILE_TYPES.WALL;
        }
        return gameMap[this.tileY][this.tileX];
    }
    
    startInteraction(target, duration) {
        this.interactionTarget = target;
        this.interactionTimer = duration;
    }
    
    completeInteraction() {
        if (this.interactionTarget) {
            this.interactionTarget.onInteractionComplete();
            this.interactionTarget = null;
        }
    }
    
    getInteractionProgress() {
        if (this.interactionTimer <= 0) return 1;
        const totalDuration = this.interactionTarget ? this.interactionTarget.interactionDuration : 1;
        return 1 - (this.interactionTimer / totalDuration);
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
        
        // Add stealth visual effect
        if (this.hidden) {
            ctx.globalAlpha *= 0.6;
        }
        
        super.render(ctx, time);
        ctx.restore();
        
        // Render interaction progress bar
        if (this.interactionTimer > 0) {
            const progress = this.getInteractionProgress();
            ctx.save();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.position.x - 20, this.position.y - 35, 40, 6);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(this.position.x - 20, this.position.y - 35, 40 * progress, 6);
            ctx.restore();
        }
    }
}

class Flash extends Entity {
    constructor(x, y) {
        super(x, y, '🐴');
        this.freed = false;
        this.following = false;
        this.targetPosition = new Vector2(x, y);
        this.followDelay = 30; // frames of delay
        this.followTimer = 0;
        this.calmed = false;
        this.needsCalming = true;
        this.speed = CONFIG.FLASH_SPEED;
        this.baseSpeed = CONFIG.FLASH_SPEED;
        this.catchingUp = false;
        this.whistleCooldownTimer = 0;
        this.lerpToTarget = false;
        this.lerpStartPos = new Vector2(x, y);
        this.lerpTargetPos = new Vector2(x, y);
        this.lerpTimer = 0;
        this.lerpDuration = CONFIG.FLASH_WHISTLE_LERP_DURATION;
    }
    
    update(playerPos, gameMap, isPlayerInExit = false) {
        // Update whistle cooldown
        if (this.whistleCooldownTimer > 0) {
            this.whistleCooldownTimer--;
        }
        
        if (this.following) {
            // Handle whistle lerp movement if active
            if (this.lerpToTarget && this.lerpTimer < this.lerpDuration) {
                this.lerpTimer++;
                const t = this.lerpTimer / this.lerpDuration;
                // Smooth interpolation using easeOut
                const smoothT = 1 - Math.pow(1 - t, 3);
                
                const newX = this.lerpStartPos.x + (this.lerpTargetPos.x - this.lerpStartPos.x) * smoothT;
                const newY = this.lerpStartPos.y + (this.lerpTargetPos.y - this.lerpStartPos.y) * smoothT;
                
                // Basic collision check - don't move into walls
                if (this.canMoveTo(newX, newY, gameMap)) {
                    this.position.x = newX;
                    this.position.y = newY;
                }
                
                if (this.lerpTimer >= this.lerpDuration) {
                    this.lerpToTarget = false;
                }
                return; // Skip normal following during lerp
            }
            
            this.followTimer--;
            if (this.followTimer <= 0) {
                // Calculate distance to player
                const dx = playerPos.x - this.position.x;
                const dy = playerPos.y - this.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Determine follow target position (12px behind player)
                const followDistance = CONFIG.FLASH_FOLLOW_DISTANCE;
                let targetX = playerPos.x;
                let targetY = playerPos.y;
                
                if (dist > 0) {
                    // Calculate position behind player
                    const normalizedDx = dx / dist;
                    const normalizedDy = dy / dist;
                    targetX = playerPos.x - normalizedDx * followDistance;
                    targetY = playerPos.y - normalizedDy * followDistance;
                }
                
                // Check if Flash needs to catch up (distance > 64px)
                if (dist > CONFIG.FLASH_CATCHUP_DISTANCE) {
                    this.catchingUp = true;
                    this.speed = this.baseSpeed * CONFIG.FLASH_CATCHUP_SPEED_MULTIPLIER;
                } else if (dist < CONFIG.FLASH_CATCHUP_CLOSE_DISTANCE) {
                    this.catchingUp = false;
                    this.speed = this.baseSpeed;
                }
                
                // Move towards target position if far enough away
                if (dist > followDistance) {
                    const targetDx = targetX - this.position.x;
                    const targetDy = targetY - this.position.y;
                    const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
                    
                    if (targetDist > 0) {
                        const moveX = this.position.x + (targetDx / targetDist) * this.speed;
                        const moveY = this.position.y + (targetDy / targetDist) * this.speed;
                        
                        // Basic collision check
                        if (this.canMoveTo(moveX, moveY, gameMap)) {
                            this.position.x = moveX;
                            this.position.y = moveY;
                        }
                    }
                }
                
                this.followTimer = this.followDelay;
            }
        }
    }
    
    // Simple collision check for Flash movement
    canMoveTo(x, y, gameMap) {
        const tileX = Math.floor(x / CONFIG.TILE_SIZE);
        const tileY = Math.floor(y / CONFIG.TILE_SIZE);
        
        if (tileX < 0 || tileX >= CONFIG.MAP_WIDTH || tileY < 0 || tileY >= CONFIG.MAP_HEIGHT) {
            return false;
        }
        
        const tile = gameMap[tileY][tileX];
        return tile !== TILE_TYPES.WALL && tile !== TILE_TYPES.FITTING_ROOM;
    }
    
    // Whistle/leash assist functionality
    handleWhistle(playerPos, isPlayerInExit = false) {
        if (this.whistleCooldownTimer > 0 || !this.following) {
            return false; // Cooldown active or not following
        }
        
        // Calculate target position for whistle assist (12px behind player)
        const followDistance = CONFIG.FLASH_FOLLOW_DISTANCE;
        const dx = playerPos.x - this.position.x;
        const dy = playerPos.y - this.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let targetX = playerPos.x;
        let targetY = playerPos.y;
        
        if (dist > 0) {
            const normalizedDx = dx / dist;
            const normalizedDy = dy / dist;
            targetX = playerPos.x - normalizedDx * followDistance;
            targetY = playerPos.y - normalizedDy * followDistance;
        }
        
        // If player is in exit zone, position Flash optimally for exit success
        if (isPlayerInExit) {
            // Position Flash slightly closer when in exit zone for better success rate
            const exitFollowDistance = Math.min(followDistance, 8);
            if (dist > 0) {
                const normalizedDx = dx / dist;
                const normalizedDy = dy / dist;
                targetX = playerPos.x - normalizedDx * exitFollowDistance;
                targetY = playerPos.y - normalizedDy * exitFollowDistance;
            }
        }
        
        // Start lerp movement
        this.lerpToTarget = true;
        this.lerpStartPos.x = this.position.x;
        this.lerpStartPos.y = this.position.y;
        this.lerpTargetPos.x = targetX;
        this.lerpTargetPos.y = targetY;
        this.lerpTimer = 0;
        
        // Set cooldown
        this.whistleCooldownTimer = CONFIG.FLASH_WHISTLE_COOLDOWN;
        
        return true; // Whistle was triggered
    }
    
    free() {
        this.freed = true;
        this.emoji = '🐴✨';
    }
    
    startFollowing() {
        this.following = true;
        this.needsCalming = false;
        this.calmed = true;
    }
    
    render(ctx, time = 0) {
        super.render(ctx, time);
        
        if (this.freed && !this.following) {
            // Show "Press E to calm Flash" message
            ctx.save();
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Press E to calm Flash', this.position.x, this.position.y - 40);
            ctx.restore();
        }
        
        // Show catch-up indicator when Flash is moving faster
        if (this.following && this.catchingUp) {
            ctx.save();
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = '#ffff00';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💨', this.position.x + 15, this.position.y - 10);
            ctx.restore();
        }
        
        // Show whistle cooldown indicator
        if (this.following && this.whistleCooldownTimer > 0) {
            const cooldownPercent = this.whistleCooldownTimer / CONFIG.FLASH_WHISTLE_COOLDOWN;
            ctx.save();
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y + 20, 8, 0, Math.PI * 2 * (1 - cooldownPercent));
            ctx.stroke();
            ctx.restore();
        }
        
        if (!this.freed) {
            // Show locked gate
            ctx.save();
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.position.x - 25, this.position.y - 30, 50, 20);
            ctx.fillStyle = '#888';
            ctx.fillText('🔒', this.position.x, this.position.y - 40);
            ctx.restore();
        }
    }
}

class CollectibleItem extends Entity {
    constructor(x, y, type) {
        const emojis = {
            [ITEM_TYPES.HALTER]: '🎯',
            [ITEM_TYPES.LEAD_ROPE]: '🪢', 
            [ITEM_TYPES.SADDLE_PAD]: '🛡️',
            [ITEM_TYPES.GATE_KEY]: '🗝️'
        };
        super(x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2, y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2, emojis[type], 18);
        this.type = type;
        this.collected = false;
        this.interactionDuration = CONFIG.PICKUP_DURATION;
        this.spinSpeed = 0.1;
        this.rotation = 0;
    }
    
    update() {
        this.rotation += this.spinSpeed;
    }
    
    onInteractionComplete() {
        this.collected = true;
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
}

class GateKey extends CollectibleItem {
    constructor(x, y) {
        super(x, y, ITEM_TYPES.GATE_KEY);
        this.interactionDuration = CONFIG.UNLOCK_DURATION;
    }
}

class PatrolNPC extends Entity {
    constructor(x, y, type) {
        const emojis = {
            [NPC_TYPES.SECURITY]: '👮',
            [NPC_TYPES.ASSOCIATE1]: '👩‍💼',
            [NPC_TYPES.ASSOCIATE2]: '👨‍💼'
        };
        super(x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2, y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2, emojis[type]);
        this.type = type;
        this.route = PATROL_ROUTES[type];
        this.routeIndex = 0;
        this.speed = CONFIG.PATROL_SPEED;
        this.direction = 0; // 0=right, 1=down, 2=left, 3=up
        this.patrolTimer = 0;
        this.waitTime = 60; // frames to wait at each point
        this.losAngle = CONFIG.LOS_ANGLE;
        this.losRange = CONFIG.LOS_RANGE;
        this.alertLevel = 0;
        this.maxAlert = 100;
    }
    
    update(gameMap) {
        if (this.route.length === 0) return;
        
        const target = this.route[this.routeIndex];
        const targetPixelX = target.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2;
        const targetPixelY = target.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2;
        
        const dx = targetPixelX - this.position.x;
        const dy = targetPixelY - this.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < CONFIG.TILE_SIZE / 4) {
            // Reached waypoint, wait then move to next
            this.patrolTimer++;
            if (this.patrolTimer >= this.waitTime) {
                this.routeIndex = (this.routeIndex + 1) % this.route.length;
                this.patrolTimer = 0;
            }
        } else {
            // Move towards target
            this.position.x += (dx / dist) * this.speed;
            this.position.y += (dy / dist) * this.speed;
            
            // Update direction for LOS
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 0 : 2; // right or left
            } else {
                this.direction = dy > 0 ? 1 : 3; // down or up
            }
        }
        
        // Decrease alert level over time
        this.alertLevel = Math.max(0, this.alertLevel - CONFIG.ALERT_DECREASE_RATE);
    }
    
    canSeePlayer(player, gameMap) {
        if (player.hidden) return false;
        
        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > this.losRange) return false;
        
        // Check if player is in FOV cone
        const angleToPlayer = Math.atan2(dy, dx) * 180 / Math.PI;
        const directionAngle = this.direction * 90; // Convert direction to angle
        let angleDiff = Math.abs(angleToPlayer - directionAngle);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        if (angleDiff > this.losAngle / 2) return false;
        
        // Raycast to check for obstacles
        return this.hasLineOfSight(player.position, gameMap);
    }
    
    hasLineOfSight(targetPos, gameMap) {
        const steps = Math.floor(this.position.distance(targetPos) / (CONFIG.TILE_SIZE / 4));
        const dx = (targetPos.x - this.position.x) / steps;
        const dy = (targetPos.y - this.position.y) / steps;
        
        for (let i = 1; i < steps; i++) {
            const checkX = this.position.x + dx * i;
            const checkY = this.position.y + dy * i;
            const tileX = Math.floor(checkX / CONFIG.TILE_SIZE);
            const tileY = Math.floor(checkY / CONFIG.TILE_SIZE);
            
            if (tileX < 0 || tileX >= CONFIG.MAP_WIDTH || 
                tileY < 0 || tileY >= CONFIG.MAP_HEIGHT) continue;
                
            const tile = gameMap[tileY][tileX];
            if (tile === TILE_TYPES.WALL || tile === TILE_TYPES.FITTING_ROOM) {
                return false;
            }
        }
        return true;
    }
    
    render(ctx, time = 0) {
        super.render(ctx, time);
        
        // Render LOS cone
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = this.alertLevel > 50 ? '#ff0000' : '#ffff00';
        
        const directionAngle = this.direction * 90 * Math.PI / 180;
        const halfAngle = this.losAngle * Math.PI / 360;
        
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.arc(this.position.x, this.position.y, this.losRange, 
                directionAngle - halfAngle, directionAngle + halfAngle);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        // Show alert level if elevated
        if (this.alertLevel > 25) {
            ctx.save();
            ctx.fillStyle = '#ff0000';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('!', this.position.x, this.position.y - 30);
            ctx.restore();
        }
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
            interact: this.keys['space'] || this.touch.lasso,
            sprint: this.keys['shiftleft'] || this.keys['shiftright'],
            whistle: this.keys['keye'],
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
        this.timeLeft = CONFIG.GAME_TIMER;
        this.strikes = 0;
        this.objectives = {
            [ITEM_TYPES.HALTER]: false,
            [ITEM_TYPES.LEAD_ROPE]: false, 
            [ITEM_TYPES.SADDLE_PAD]: false,
            [ITEM_TYPES.GATE_KEY]: false,
            freeFlash: false,
            reachExit: false
        };
        
        this.bestScore = parseInt(localStorage.getItem('grok_best_score')) || 0;
        
        this.initializeEntities();
        this.setupUI();
        this.start();
    }
    
    initializeEntities() {
        // Find player spawn
        const spawnTile = this.findTileType(TILE_TYPES.PLAYER_SPAWN);
        this.player = new Player(
            spawnTile.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2,
            spawnTile.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2
        );
        
        // Find Flash pen
        const flashTile = this.findTileType(TILE_TYPES.FLASH_PEN);
        this.flash = new Flash(
            flashTile.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2,
            flashTile.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2
        );
        
        // Create collectible items
        this.items = [
            new CollectibleItem(ITEM_SPAWNS[ITEM_TYPES.HALTER].x, ITEM_SPAWNS[ITEM_TYPES.HALTER].y, ITEM_TYPES.HALTER),
            new CollectibleItem(ITEM_SPAWNS[ITEM_TYPES.LEAD_ROPE].x, ITEM_SPAWNS[ITEM_TYPES.LEAD_ROPE].y, ITEM_TYPES.LEAD_ROPE),
            new CollectibleItem(ITEM_SPAWNS[ITEM_TYPES.SADDLE_PAD].x, ITEM_SPAWNS[ITEM_TYPES.SADDLE_PAD].y, ITEM_TYPES.SADDLE_PAD),
            new GateKey(ITEM_SPAWNS[ITEM_TYPES.GATE_KEY].x, ITEM_SPAWNS[ITEM_TYPES.GATE_KEY].y)
        ];
        
        // Create patrol NPCs
        this.npcs = [
            new PatrolNPC(PATROL_ROUTES[NPC_TYPES.SECURITY][0].x, PATROL_ROUTES[NPC_TYPES.SECURITY][0].y, NPC_TYPES.SECURITY),
            new PatrolNPC(PATROL_ROUTES[NPC_TYPES.ASSOCIATE1][0].x, PATROL_ROUTES[NPC_TYPES.ASSOCIATE1][0].y, NPC_TYPES.ASSOCIATE1),
            new PatrolNPC(PATROL_ROUTES[NPC_TYPES.ASSOCIATE2][0].x, PATROL_ROUTES[NPC_TYPES.ASSOCIATE2][0].y, NPC_TYPES.ASSOCIATE2)
        ];
    }
    
    findTileType(tileType) {
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                if (WALMART_MAP[y][x] === tileType) {
                    return { x, y };
                }
            }
        }
        return { x: 1, y: 1 }; // fallback
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
        this.timeLeft = CONFIG.GAME_TIMER;
        this.strikes = 0;
        this.gameTime = 0;
        
        this.objectives = {
            [ITEM_TYPES.HALTER]: false,
            [ITEM_TYPES.LEAD_ROPE]: false, 
            [ITEM_TYPES.SADDLE_PAD]: false,
            [ITEM_TYPES.GATE_KEY]: false,
            freeFlash: false,
            reachExit: false
        };
        
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
        this.player.update(input, WALMART_MAP);
        
        // Update Flash
        const isPlayerInExit = this.isPlayerInExitZone();
        this.flash.update(this.player.position, WALMART_MAP, isPlayerInExit);
        
        // Update NPCs
        this.npcs.forEach(npc => {
            npc.update(WALMART_MAP);
        });
        
        // Update items
        this.items.forEach(item => item.update());
        
        // Handle interactions
        this.handleInteractions(input);
        
        // Check NPC detection
        this.checkDetection();
        
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
    
    handleInteractions(input) {
        if (!input.interact) return;
        if (this.player.interactionTimer > 0) return; // Already interacting
        
        const playerTileX = this.player.tileX;
        const playerTileY = this.player.tileY;
        
        // Check for nearby items
        this.items.forEach(item => {
            if (item.collected) return;
            const dist = this.player.position.distance(item.position);
            if (dist < CONFIG.TILE_SIZE) {
                this.player.startInteraction(item, item.interactionDuration);
                item.onInteractionComplete = () => {
                    item.collected = true;
                    this.objectives[item.type] = true;
                    this.player.collectedItems.add(item.type);
                    this.score += 200;
                    this.particles.emit(item.position.x, item.position.y, '✨', 8);
                    this.sound.playCoin();
                };
            }
        });
        
        // Check Flash interaction
        if (!this.flash.freed && this.player.collectedItems.has(ITEM_TYPES.GATE_KEY)) {
            const dist = this.player.position.distance(this.flash.position);
            if (dist < CONFIG.TILE_SIZE * 1.5) {
                this.player.startInteraction({ 
                    interactionDuration: CONFIG.UNLOCK_DURATION,
                    onInteractionComplete: () => {
                        this.flash.free();
                        this.objectives.freeFlash = true;
                        this.score += 500;
                        this.particles.emit(this.flash.position.x, this.flash.position.y, '🔓', 10);
                        this.sound.playVictory();
                    }
                }, CONFIG.UNLOCK_DURATION);
            }
        }
        
        // Check Flash calming
        if (this.flash.freed && !this.flash.following && input.whistle) {
            const dist = this.player.position.distance(this.flash.position);
            if (dist < CONFIG.TILE_SIZE * 2) {
                this.player.startInteraction({
                    interactionDuration: CONFIG.CALM_FLASH_DURATION,
                    onInteractionComplete: () => {
                        this.flash.startFollowing();
                        this.score += 300;
                        this.particles.emit(this.flash.position.x, this.flash.position.y, '💚', 6);
                        this.sound.playCoin();
                    }
                }, CONFIG.CALM_FLASH_DURATION);
            }
        }
        
        // Check whistle/leash assist for following Flash
        if (this.flash.following && input.whistle) {
            const isPlayerInExit = this.isPlayerInExitZone();
            if (this.flash.handleWhistle(this.player.position, isPlayerInExit)) {
                this.particles.emit(this.flash.position.x, this.flash.position.y, '💨', 3);
                this.sound.playBlip(); // Add audio feedback for whistle
            }
        }
    }
    
    checkDetection() {
        this.npcs.forEach(npc => {
            if (npc.canSeePlayer(this.player, WALMART_MAP)) {
                npc.alertLevel = Math.min(npc.maxAlert, npc.alertLevel + 3);
                if (npc.alertLevel >= npc.maxAlert) {
                    this.onPlayerDetected();
                }
            }
        });
    }
    
    onPlayerDetected() {
        this.strikes++;
        this.effects.addScreenShake();
        this.effects.addRedFlash();
        this.particles.emit(this.player.position.x, this.player.position.y, '🚨', 8);
        this.sound.playHit();
        
        // Reset player to last safe position (spawn for now)
        const spawnTile = this.findTileType(TILE_TYPES.PLAYER_SPAWN);
        this.player.position.x = spawnTile.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2;
        this.player.position.y = spawnTile.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2;
        
        // Reset NPC alert levels
        this.npcs.forEach(npc => npc.alertLevel = 0);
    }
    
    checkGameState() {
        if (this.strikes >= CONFIG.MAX_STRIKES) {
            this.gameOver('Too many detections! Security caught you!');
        } else if (this.timeLeft <= 0) {
            this.gameOver('Time ran out!');
        } else if (this.flash.following && this.isAtExit()) {
            this.objectives.reachExit = true;
            this.victory();
        }
    }
    
    isPlayerInExitZone() {
        if (this.player.tileY < 0 || this.player.tileY >= CONFIG.MAP_HEIGHT ||
            this.player.tileX < 0 || this.player.tileX >= CONFIG.MAP_WIDTH) {
            return false;
        }
        
        const playerTile = WALMART_MAP[this.player.tileY][this.player.tileX];
        return playerTile === TILE_TYPES.EXIT;
    }
    
    isAtExit() {
        // Player must be in exit zone
        if (!this.isPlayerInExitZone()) {
            return false;
        }
        
        // Find the exit zone center for distance calculation
        const exitTiles = [];
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                if (WALMART_MAP[y][x] === TILE_TYPES.EXIT) {
                    exitTiles.push({x, y});
                }
            }
        }
        
        if (exitTiles.length === 0) return false;
        
        // Calculate exit center
        const exitCenterX = exitTiles.reduce((sum, tile) => sum + tile.x, 0) / exitTiles.length;
        const exitCenterY = exitTiles.reduce((sum, tile) => sum + tile.y, 0) / exitTiles.length;
        const exitCenterPixelX = exitCenterX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const exitCenterPixelY = exitCenterY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        
        // Check if Flash is within success radius of exit center
        const flashDistToExit = Math.sqrt(
            Math.pow(this.flash.position.x - exitCenterPixelX, 2) + 
            Math.pow(this.flash.position.y - exitCenterPixelY, 2)
        );
        
        return flashDistToExit <= CONFIG.FLASH_EXIT_SUCCESS_RADIUS;
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
        // Strikes instead of hearts
        document.getElementById('hearts').textContent = '🚨'.repeat(Math.max(0, this.strikes)) + '⭕'.repeat(Math.max(0, CONFIG.MAX_STRIKES - this.strikes));
        
        // Score
        document.getElementById('score').textContent = `Score: ${this.score}`;
        
        // Time
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = Math.floor(this.timeLeft % 60);
        document.getElementById('time').textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Stamina instead of mud
        const staminaPercent = Math.min(100, Math.max(0, (this.player.stamina / CONFIG.STAMINA_MAX) * 100));
        document.getElementById('mud-fill').style.width = `${staminaPercent}%`;
        document.getElementById('mud-percent').textContent = `${Math.floor(staminaPercent)}%`;
        
        // Objectives progress instead of lasso cooldown
        const completedObjectives = Object.values(this.objectives).filter(Boolean).length;
        const totalObjectives = Object.keys(this.objectives).length;
        const objectivePercent = (completedObjectives / totalObjectives) * 100;
        document.getElementById('lasso-fill').style.width = `${objectivePercent}%`;
        
        // Add pulsing for critical states
        const staminaBar = document.getElementById('mud-bar');
        const timeElement = document.getElementById('time');
        const strikesElement = document.getElementById('hearts');
        
        if (staminaPercent < 25) {
            staminaBar.style.animation = 'pulse 0.5s infinite';
        } else {
            staminaBar.style.animation = '';
        }
        
        if (this.timeLeft < 60) {
            timeElement.style.animation = 'pulse 0.5s infinite';
            timeElement.style.color = '#f66';
        } else {
            timeElement.style.animation = '';
            timeElement.style.color = '#0f0';
        }
        
        if (this.strikes >= CONFIG.MAX_STRIKES - 1) {
            strikesElement.style.animation = 'pulse 0.5s infinite';
            strikesElement.style.color = '#f66';
        } else {
            strikesElement.style.animation = '';
            strikesElement.style.color = '#0f0';
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Apply screen shake
        this.ctx.save();
        this.effects.applyScreenShake(this.ctx);
        
        // Render background and map
        this.renderWalmartMap();
        
        // Render entities
        if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.TITLE) {
            // Render NPCs first (behind player)
            this.npcs.forEach(npc => {
                npc.render(this.ctx, this.gameTime);
            });
            
            // Render items
            this.items.forEach(item => {
                item.render(this.ctx, this.gameTime);
            });
            
            // Render Flash
            this.flash.render(this.ctx, this.gameTime);
            
            // Render player on top
            this.player.render(this.ctx, this.gameTime);
            
            // Render objectives overlay
            this.renderObjectives();
        }
        
        // Render particles
        this.particles.render(this.ctx);
        
        // Render effects
        this.effects.renderRedFlash(this.ctx);
        
        this.ctx.restore();
    }
    
    renderWalmartMap() {
        // Render floor background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Render tiles
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                const tile = WALMART_MAP[y][x];
                const pixelX = x * CONFIG.TILE_SIZE;
                const pixelY = y * CONFIG.TILE_SIZE;
                
                switch (tile) {
                    case TILE_TYPES.WALL:
                        this.ctx.fillStyle = '#666';
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                        break;
                    case TILE_TYPES.CLOTHES_RACK:
                        this.ctx.fillStyle = '#8B4513';
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                        this.ctx.fillStyle = '#DDA0DD';
                        this.ctx.fillRect(pixelX + 2, pixelY + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
                        break;
                    case TILE_TYPES.FITTING_ROOM:
                        this.ctx.fillStyle = '#FFB6C1';
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                        break;
                    case TILE_TYPES.CUSTOMER_SERVICE:
                        this.ctx.fillStyle = '#87CEEB';
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                        break;
                    case TILE_TYPES.STOCKROOM_DOOR:
                        this.ctx.fillStyle = '#8B4513';
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                        break;
                    case TILE_TYPES.EXIT:
                        this.ctx.fillStyle = '#00FF00';
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                        break;
                    case TILE_TYPES.FLASH_PEN:
                        this.ctx.fillStyle = '#DDD';
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                        // Draw gate
                        this.ctx.strokeStyle = '#888';
                        this.ctx.lineWidth = 2;
                        this.ctx.strokeRect(pixelX + 2, pixelY + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
                        break;
                }
                
                // Grid lines for debugging (can be removed)
                this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(pixelX, pixelY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            }
        }
    }
    
    renderObjectives() {
        // Show current objectives in corner
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(CONFIG.CANVAS_WIDTH - 220, 10, 200, 140);
        this.ctx.strokeStyle = '#0f0';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(CONFIG.CANVAS_WIDTH - 220, 10, 200, 140);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px "Press Start 2P", monospace';
        this.ctx.textAlign = 'left';
        
        let yOffset = 30;
        const objectives = [
            { key: ITEM_TYPES.HALTER, text: 'Find Halter 🎯' },
            { key: ITEM_TYPES.LEAD_ROPE, text: 'Find Lead Rope 🪢' },
            { key: ITEM_TYPES.SADDLE_PAD, text: 'Find Saddle Pad 🛡️' },
            { key: ITEM_TYPES.GATE_KEY, text: 'Get Gate Key 🗝️' },
            { key: 'freeFlash', text: 'Free Flash 🐴' },
            { key: 'reachExit', text: 'Reach Exit 🚪' }
        ];
        
        objectives.forEach(obj => {
            const completed = this.objectives[obj.key];
            this.ctx.fillStyle = completed ? '#0f0' : '#fff';
            const prefix = completed ? '✓' : '○';
            this.ctx.fillText(`${prefix} ${obj.text}`, CONFIG.CANVAS_WIDTH - 210, yOffset);
            yOffset += 20;
        });
        
        this.ctx.restore();
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