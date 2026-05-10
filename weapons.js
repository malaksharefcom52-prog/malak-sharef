// === نظام الأسلحة والمقذوفات ===

class Projectile {
    constructor(x, y, targetX, targetY, weapon) {
        this.x = x;
        this.y = y;
        this.weapon = weapon;
        
        // حساب الاتجاه
        const angle = Math.atan2(targetY - y, targetX - x);
        this.velocityX = Math.cos(angle) * 8;
        this.velocityY = Math.sin(angle) * 8;
        
        this.size = 8;
        this.damage = weapon.damage;
        this.traveled = 0;
        this.maxRange = weapon.range;
    }
    
    // تحديث المقذوف
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.traveled += Math.hypot(this.velocityX, this.velocityY);
    }
    
    // التحقق من انتهاء المقذوف
    isExpired() {
        return this.traveled > this.maxRange || this.y > 600 || this.x < 0 || this.x > 1200;
    }
    
    // رسم المقذوف
    draw(ctx) {
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // خط مسار
        ctx.strokeStyle = 'rgba(243, 156, 18, 0.5)';
        ctx.beginPath();
        ctx.moveTo(this.x - this.velocityX, this.y - this.velocityY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
    
    // التحقق من الاصطدام
    checkCollision(obj) {
        const distance = Math.hypot(obj.x + obj.width / 2 - this.x, obj.y + obj.height / 2 - this.y);
        return distance < this.size + obj.width / 2;
    }
}

class WeaponSystem {
    constructor(weaponConfigs) {
        this.weaponConfigs = weaponConfigs;
        this.projectiles = [];
    }
    
    // إطلاق سلاح
    fire(player, targetX, targetY) {
        const weapon = player.getCurrentWeapon();
        if (!weapon) return;
        
        // إنشاء مقذوف جديد
        const projectile = new Projectile(
            player.x + player.width / 2,
            player.y + player.height / 2,
            targetX,
            targetY,
            weapon
        );
        
        this.projectiles.push(projectile);
    }
    
    // تحديث جميع المقذوفات
    update() {
        for (let projectile of this.projectiles) {
            projectile.update();
        }
        
        // إزالة المقذوفات المنتهية
        this.projectiles = this.projectiles.filter(p => !p.isExpired());
    }
    
    // رسم جميع المقذوفات
    draw(ctx) {
        for (let projectile of this.projectiles) {
            projectile.draw(ctx);
        }
    }
    
    // التحقق من الاصطدام مع العدو
    checkEnemyCollisions(enemies) {
        const hits = [];
        
        for (let projectile of this.projectiles) {
            for (let enemy of enemies) {
                if (projectile.checkCollision(enemy)) {
                    hits.push({
                        projectile: projectile,
                        enemy: enemy,
                        damage: projectile.damage
                    });
                }
            }
        }
        
        // إزالة المقذوفات التي اصطدمت
        for (let hit of hits) {
            const index = this.projectiles.indexOf(hit.projectile);
            if (index > -1) {
                this.projectiles.splice(index, 1);
            }
        }
        
        return hits;
    }
    
    // إنشاء تأثير عند الاصطدام
    createImpactEffect(ctx, x, y) {
        ctx.fillStyle = 'rgba(243, 156, 18, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

// === تأثيرات الجسيمات ===
class Particle {
    constructor(x, y, velocityX, velocityY, life = 500, color = '#f39c12') {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = 4;
    }
    
    // تحديث الجسيم
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.3; // الجاذبية
        this.life -= 16; // بناءً على 60 FPS
    }
    
    // رسم الجسيم
    draw(ctx) {
        const opacity = this.life / this.maxLife;
        ctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // التحقق من انتهاء الجسيم
    isAlive() {
        return this.life > 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    // إنشاء انفجار
    createExplosion(x, y, count = 10, color = '#f39c12') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 5;
            const velocityX = Math.cos(angle) * velocity;
            const velocityY = Math.sin(angle) * velocity;
            
            this.particles.push(new Particle(x, y, velocityX, velocityY, 500, color));
        }
    }
    
    // تحديث جميع الجسيمات
    update() {
        for (let particle of this.particles) {
            particle.update();
        }
        
        // إزالة الجسيمات الميتة
        this.particles = this.particles.filter(p => p.isAlive());
    }
    
    // رسم جميع الجسيمات
    draw(ctx) {
        for (let particle of this.particles) {
            particle.draw(ctx);
        }
    }
}