// === نظام الأعداء والوحوش ===

class Enemy {
    constructor(x, y, enemyData) {
        this.x = x;
        this.y = y;
        this.type = enemyData.id;
        this.name = enemyData.name;
        this.health = enemyData.health;
        this.maxHealth = enemyData.health;
        this.damage = enemyData.damage;
        this.speed = enemyData.speed;
        this.experience = enemyData.experience;
        this.emoji = enemyData.emoji;
        
        // الحركة
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.direction = 1; // 1 = يمين، -1 = يسار
        
        // الحجم
        this.width = 35;
        this.height = 50;
        
        // الهجوم
        this.attackRange = 50;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000;
        
        // الحالة
        this.state = 'idle'; // idle, chasing, attacking, dead
    }
    
    // تحديث حالة العدو
    update(player, gameConfig) {
        // حساب المسافة من اللاعب
        const distanceX = player.x - this.x;
        const distanceY = player.y - this.y;
        const distance = Math.hypot(distanceX, distanceY);
        
        // AI Logic
        if (distance < 300) {
            this.state = 'chasing';
            // المتابعة
            if (distanceX > 0) {
                this.velocityX = this.speed;
                this.direction = 1;
            } else {
                this.velocityX = -this.speed;
                this.direction = -1;
            }
            
            // القفز العشوائي
            if (Math.random() > 0.95 && !this.isJumping) {
                this.velocityY = -8;
                this.isJumping = true;
            }
        } else {
            this.state = 'idle';
            this.velocityX = 0;
        }
        
        // تطبيق الجاذبية
        this.velocityY += gameConfig.gravity;
        
        // تحديث الموقع
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // معالجة الأرضية
        if (this.y + this.height >= gameConfig.groundY) {
            this.y = gameConfig.groundY - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
        
        // معالجة حدود الشاشة
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > gameConfig.canvas.width) {
            this.x = gameConfig.canvas.width - this.width;
        }
        
        // إذا كان قريباً من اللاعب، هاجم
        if (distance < this.attackRange) {
            this.state = 'attacking';
        }
    }
    
    // محاولة الهجوم
    tryAttack() {
        const now = Date.now();
        if (now - this.lastAttackTime > this.attackCooldown) {
            this.lastAttackTime = now;
            return true;
        }
        return false;
    }
    
    // استقبال الضرر
    takeDamage(damage) {
        this.health -= damage;
        if (this.health < 0) {
            this.health = 0;
            this.state = 'dead';
        }
        return this.state === 'dead';
    }
    
    // رسم العدو
    draw(ctx) {
        // رسم الجسم
        ctx.fillStyle = this.getColor();
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // رسم الرأس
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y - 10, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // رسم شريط الصحة
        const barWidth = this.width;
        const barHeight = 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 18, barWidth, barHeight);
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x, this.y - 18, barWidth * healthPercent, barHeight);
        
        // رسم الإيموجي
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji, this.x + this.width / 2, this.y + this.height / 2 + 8);
    }
    
    // الحصول على اللون بناءً على النوع
    getColor() {
        const colors = {
            'ghoul': '#8b008b',
            'vampire': '#8b0000',
            'demon': '#ff6347',
            'witch': '#4b0082'
        };
        return colors[this.type] || '#808080';
    }
    
    // التحقق من الموت
    isDead() {
        return this.health <= 0;
    }
}

// === مدير الموجات (Waves) ===
class WaveManager {
    constructor(levelData, enemyConfigs) {
        this.levelData = levelData;
        this.enemyConfigs = enemyConfigs;
        this.currentWave = 0;
        this.enemies = [];
        this.totalWaves = levelData.waves;
    }
    
    // بدء موجة جديدة
    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.enemies = [];
        
        // إنشاء الأعداء بناءً على بيانات المستوى
        for (let enemy of this.levelData.enemies) {
            const enemyConfig = this.enemyConfigs.find(e => e.id === enemy.type);
            for (let i = 0; i < enemy.count; i++) {
                const x = Math.random() * 800 + 200;
                this.enemies.push(new Enemy(x, 400, enemyConfig));
            }
        }
        
        return this.enemies.length;
    }
    
    // تحديث جميع الأعداء
    update(player, gameConfig) {
        for (let enemy of this.enemies) {
            if (!enemy.isDead()) {
                enemy.update(player, gameConfig);
            }
        }
        
        // إزالة الأعداء الموتى
        this.enemies = this.enemies.filter(e => !e.isDead());
    }
    
    // رسم جميع الأعداء
    draw(ctx) {
        for (let enemy of this.enemies) {
            enemy.draw(ctx);
        }
    }
    
    // التحقق إذا انتهت الموجة
    isWaveComplete() {
        return this.enemies.length === 0;
    }
    
    // الحصول على عدد الأعداء المتبقية
    getRemainingEnemies() {
        return this.enemies.length;
    }
}