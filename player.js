// === نظام الشخصيات واللاعبين ===

class Player {
    constructor(x, y, characterType, config) {
        this.x = x;
        this.y = y;
        this.characterType = characterType;
        this.config = config[characterType];
        
        // الخصائص الأساسية
        this.width = this.config.size.width;
        this.height = this.config.size.height;
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.speed = this.config.speed;
        this.power = this.config.power;
        this.jumpPower = this.config.jumpPower;
        this.attackSpeed = this.config.attackSpeed;
        
        // حالة الحركة
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isAttacking = false;
        this.lastAttackTime = 0;
        this.direction = 1; // 1 = يمين، -1 = يسار
        
        // الأسلحة والمخزون
        this.weapons = [];
        this.currentWeaponIndex = 0;
        this.ammunition = {};
        
        // الإحصائيات
        this.score = 0;
        this.kills = 0;
        this.damageDealt = 0;
        this.damageReceived = 0;
    }
    
    // إضافة سلاح
    addWeapon(weapon) {
        this.weapons.push(weapon);
        this.ammunition[weapon.id] = 999; // ذخيرة غير محدودة للتطوير
    }
    
    // تبديل السلاح
    switchWeapon(index) {
        if (index >= 0 && index < this.weapons.length) {
            this.currentWeaponIndex = index;
        }
    }
    
    // الحصول على السلاح الحالي
    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }
    
    // الحركة
    move(direction, gameConfig) {
        this.velocityX = direction * this.speed;
        if (direction !== 0) {
            this.direction = direction;
        }
    }
    
    // القفز
    jump(gameConfig) {
        if (!this.isJumping) {
            this.velocityY = -this.jumpPower;
            this.isJumping = true;
        }
    }
    
    // الهجوم
    attack() {
        const now = Date.now();
        if (now - this.lastAttackTime > this.attackSpeed) {
            this.isAttacking = true;
            this.lastAttackTime = now;
            return true;
        }
        return false;
    }
    
    // استقبال الضرر
    takeDamage(damage) {
        this.health -= damage;
        this.damageReceived += damage;
        if (this.health < 0) this.health = 0;
        return this.health <= 0; // إذا كان اللاعب ميتاً
    }
    
    // الشفاء
    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) this.health = this.maxHealth;
    }
    
    // تحديث حالة اللاعب
    update(gameConfig) {
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
        
        // تطبيق الاحتكاك
        this.velocityX *= gameConfig.friction;
        
        // إعادة تعيين حالة الهجوم
        this.isAttacking = false;
    }
    
    // رسم اللاعب
    draw(ctx) {
        // رسم الجسم
        ctx.fillStyle = this.characterType === 'warrior' ? '#d4a574' : '#34495e';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // رسم الرأس
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y - 10, this.width / 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // رسم العيون
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 3, this.y - 15, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + (this.width * 2) / 3, this.y - 15, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // رسم شريط الصحة
        const barWidth = this.width;
        const barHeight = 5;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 15, barWidth, barHeight);
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(this.x, this.y - 15, barWidth * healthPercent, barHeight);
        
        // رسم اسم الشخصية
        ctx.fillStyle = '#d4a574';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.config.name, this.x + this.width / 2, this.y - 25);
    }
}

// === نظام الذكاء الاصطناعي للاعب الثاني ===
class AIPlayer extends Player {
    constructor(x, y, characterType, config) {
        super(x, y, characterType, config);
        this.targetEnemy = null;
        this.aiThinkInterval = 500; // ميلي ثانية
        this.lastThinkTime = 0;
    }
    
    // التفكير الذكي للذكاء الاصطناعي
    think(enemies, gameConfig) {
        const now = Date.now();
        if (now - this.lastThinkTime < this.aiThinkInterval) return;
        
        this.lastThinkTime = now;
        
        // العثور على أقرب عدو
        if (enemies.length > 0) {
            let closest = enemies[0];
            let minDistance = Math.hypot(closest.x - this.x, closest.y - this.y);
            
            for (let enemy of enemies) {
                const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = enemy;
                }
            }
            
            this.targetEnemy = closest;
            
            // الحركة نحو العدو
            if (closest.x < this.x) {
                this.move(-1, gameConfig);
            } else if (closest.x > this.x) {
                this.move(1, gameConfig);
            }
            
            // القفز لتجنب الهجمات
            if (Math.random() > 0.7 && !this.isJumping) {
                this.jump(gameConfig);
            }
            
            // الهجوم إذا كان بالقرب
            if (minDistance < 100) {
                this.attack();
            }
        } else {
            // الحركة العشوائية عندما لا توجد أعداء
            if (Math.random() > 0.5) {
                this.move(Math.random() > 0.5 ? 1 : -1, gameConfig);
            }
        }
    }
}