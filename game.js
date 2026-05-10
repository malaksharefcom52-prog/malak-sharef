// === محرك اللعبة الرئيسي ===

class Game {
    constructor(levelIndex) {
        this.levelIndex = levelIndex;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.uiManager = new UIManager();
        
        // الحالة
        this.running = false;
        this.paused = false;
        this.gameOver = false;
        
        // الكائنات الأساسية
        this.player = null;
        this.aiPlayer = null;
        this.levelManager = new LevelManager(GAME_CONFIG.levels);
        this.waveManager = null;
        this.weaponSystem = new WeaponSystem(GAME_CONFIG.weapons);
        this.particleSystem = new ParticleSystem();
        this.progressManager = new ProgressManager();
        this.statisticsManager = new StatisticsManager();
        
        // المدخلات
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        
        // الوقت
        this.frameCount = 0;
        this.gameTime = 0;
        
        // إعداد المستوى
        this.setupLevel();
        this.setupInputs();
    }
    
    // إعداد المستوى
    setupLevel() {
        const levelData = this.levelManager.loadLevel(this.levelIndex);
        const user = authSystem.getCurrentUser();
        
        // إنشاء اللاعب الأول
        this.player = new Player(100, 400, user.character, GAME_CONFIG.characters);
        
        // إضافة الأسلحة للاعب
        for (let weapon of GAME_CONFIG.weapons) {
            this.player.addWeapon(weapon);
        }
        
        // إنشاء لاعب الذكاء الاصطناعي
        const aiCharacter = user.character === 'warrior' ? 'shadow' : 'warrior';
        this.aiPlayer = new AIPlayer(1000, 400, aiCharacter, GAME_CONFIG.characters);
        
        // إضافة الأسلحة للاعب الثاني
        for (let weapon of GAME_CONFIG.weapons) {
            this.aiPlayer.addWeapon(weapon);
        }
        
        // إعداد مدير الموجات
        this.waveManager = new WaveManager(levelData, GAME_CONFIG.enemies);
        this.waveManager.startWave(1);
        
        // تحديث واجهة المستخدم
        this.uiManager.updatePlayerInfo(
            `${user.username} (${this.player.config.name})`,
            `المرحلة ${this.levelIndex + 1}: ${levelData.name}`
        );
    }
    
    // إعداد المدخلات
    setupInputs() {
        // لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ') this.player.jump(GAME_CONFIG.game);
            if (e.key.toLowerCase() === 'e') this.playerAttack();
            if (e.key.toLowerCase() === 'q') this.switchWeapon();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // الماوس
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });
        
        document.addEventListener('click', () => this.playerAttack());
    }
    
    // هجوم اللاعب
    playerAttack() {
        if (this.running && !this.paused && this.player.attack()) {
            const weapon = this.player.getCurrentWeapon();
            if (weapon.type === 'ranged') {
                this.weaponSystem.fire(
                    this.player,
                    this.mousePos.x,
                    this.mousePos.y
                );
            }
            this.particleSystem.createExplosion(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                5
            );
        }
    }
    
    // تبديل السلاح
    switchWeapon() {
        const currentIndex = this.player.currentWeaponIndex;
        const nextIndex = (currentIndex + 1) % this.player.weapons.length;
        this.player.switchWeapon(nextIndex);
    }
    
    // تحديث حالة اللعبة
    update() {
        if (this.paused) return;
        
        // التحكم في الحركة
        let moveDirection = 0;
        if (this.keys['arrowleft'] || this.keys['a']) moveDirection = -1;
        if (this.keys['arrowright'] || this.keys['d']) moveDirection = 1;
        this.player.move(moveDirection, GAME_CONFIG.game);
        
        // تحديث اللاعب
        this.player.update(GAME_CONFIG.game);
        
        // تحديث لاعب الذكاء الاصطناعي
        this.aiPlayer.think(this.waveManager.enemies, GAME_CONFIG.game);
        this.aiPlayer.update(GAME_CONFIG.game);
        
        // تحديث الأعداء
        this.waveManager.update(this.player, GAME_CONFIG.game);
        
        // معالجة الاصطدامات بين الأعداء واللاعب
        for (let enemy of this.waveManager.enemies) {
            const distance = Math.hypot(
                enemy.x + enemy.width / 2 - (this.player.x + this.player.width / 2),
                enemy.y + enemy.height / 2 - (this.player.y + this.player.height / 2)
            );
            
            if (distance < this.player.width + enemy.width) {
                if (enemy.tryAttack()) {
                    const dead = this.player.takeDamage(enemy.damage);
                    if (dead) this.gameOver = true;
                    this.particleSystem.createExplosion(
                        this.player.x + this.player.width / 2,
                        this.player.y + this.player.height / 2,
                        8,
                        '#e74c3c'
                    );
                }
            }
        }
        
        // تحديث المقذوفات
        this.weaponSystem.update();
        
        // معالجة الاصطدامات مع الأعداء
        const hits = this.weaponSystem.checkEnemyCollisions(this.waveManager.enemies);
        for (let hit of hits) {
            hit.enemy.takeDamage(hit.damage);
            this.player.score += 10;
            this.player.damageDealt += hit.damage;
            
            if (hit.enemy.isDead()) {
                this.player.score += hit.enemy.experience;
                this.player.kills++;
                this.particleSystem.createExplosion(
                    hit.enemy.x + hit.enemy.width / 2,
                    hit.enemy.y + hit.enemy.height / 2,
                    15,
                    '#d4a574'
                );
            }
        }
        
        // تحديث الجسيمات
        this.particleSystem.update();
        
        // تحديث واجهة المستخدم
        this.uiManager.updateHealth(this.player.health, this.player.maxHealth);
        this.uiManager.updateScore(this.player.score);
        this.uiManager.updateWave(
            1,
            this.waveManager.totalWaves
        );
        
        // التحقق من انتهاء الموجة
        if (this.waveManager.isWaveComplete()) {
            this.levelComplete();
        }
        
        // التحقق من موت اللاعب
        if (this.player.health <= 0) {
            this.gameOver = true;
        }
        
        this.frameCount++;
        this.gameTime += 16; // بناءً على 60 FPS
    }
    
    // رسم إطار اللعبة
    draw() {
        // تنظيف الشاشة
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // رسم الأرضية
        this.ctx.fillStyle = '#8b6f47';
        this.ctx.fillRect(0, GAME_CONFIG.game.groundY, this.canvas.width, this.canvas.height - GAME_CONFIG.game.groundY);
        
        // رسم الحدود
        this.ctx.strokeStyle = '#d4a574';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        
        // رسم الشخصيات
        this.player.draw(this.ctx);
        this.aiPlayer.draw(this.ctx);
        
        // رسم الأعداء
        this.waveManager.draw(this.ctx);
        
        // رسم المقذوفات
        this.weaponSystem.draw(this.ctx);
        
        // رسم الجسيمات
        this.particleSystem.draw(this.ctx);
    }
    
    // حلقة اللعبة الرئيسية
    gameLoop = () => {
        if (this.running) {
            if (!this.paused && !this.gameOver) {
                this.update();
            }
            this.draw();
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    // بدء اللعبة
    start() {
        this.running = true;
        this.paused = false;
        authSystem.showScreen('gameScreen');
        this.gameLoop();
    }
    
    // إعادة المستوى
    restart() {
        this.running = false;
        this.__init__();
        this.start();
    }
    
    // انتهاء المستوى
    levelComplete() {
        this.running = false;
        this.uiManager.showEndScreen(this.player.score, this.levelIndex + 1);
    }
}