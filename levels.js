// === نظام المستويات والمراحل ===

class LevelManager {
    constructor(levelConfigs) {
        this.levelConfigs = levelConfigs;
        this.currentLevel = 0;
        this.waveManager = null;
    }
    
    // تحميل مستوى
    loadLevel(levelIndex) {
        if (levelIndex >= 0 && levelIndex < this.levelConfigs.length) {
            this.currentLevel = levelIndex;
            return this.levelConfigs[levelIndex];
        }
        return null;
    }
    
    // الحصول على مستوى معين
    getLevel(index) {
        return this.levelConfigs[index];
    }
    
    // الحصول على المستوى الحالي
    getCurrentLevel() {
        return this.levelConfigs[this.currentLevel];
    }
    
    // الانتقال للمستوى التالي
    nextLevel() {
        if (this.currentLevel < this.levelConfigs.length - 1) {
            this.currentLevel++;
            return true;
        }
        return false; // لا يوجد مستوى التالي
    }
    
    // الحصول على عدد المستويات
    getTotalLevels() {
        return this.levelConfigs.length;
    }
    
    // عرض شاشة اختيار المستويات
    displayLevelsScreen() {
        const levelScreen = document.getElementById('levelScreen');
        const levelsGrid = levelScreen.querySelector('.levels-grid');
        levelsGrid.innerHTML = '';
        
        for (let i = 0; i < this.levelConfigs.length; i++) {
            const level = this.levelConfigs[i];
            const levelCard = document.createElement('div');
            levelCard.className = 'level-card';
            levelCard.innerHTML = `
                <div class="level-number">${i + 1}</div>
                <div class="level-name">${level.name}</div>
                <div class="level-story" style="font-size: 0.75rem; color: #999; margin: 8px 0;">${level.story}</div>
                <div class="level-status">الموجات: ${level.waves}</div>
            `;
            
            levelCard.addEventListener('click', () => {
                this.selectLevel(i);
            });
            
            levelsGrid.appendChild(levelCard);
        }
    }
    
    // اختيار مستوى
    selectLevel(levelIndex) {
        this.currentLevel = levelIndex;
        // سيتم التعامل مع بدء اللعبة في game.js
    }
}

// === نظام الإنجازات والتقدم ===
class ProgressManager {
    constructor() {
        this.achievements = [];
        this.saveProgress();
    }
    
    // فتح إنجاز
    unlockAchievement(achievementId) {
        if (!this.achievements.includes(achievementId)) {
            this.achievements.push(achievementId);
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    // التحقق من إنجاز
    hasAchievement(achievementId) {
        return this.achievements.includes(achievementId);
    }
    
    // حفظ التقدم
    saveProgress() {
        const user = authSystem.getCurrentUser();
        if (user) {
            user.achievements = this.achievements;
            authSystem.updateUser(user);
        }
    }
    
    // تحميل التقدم
    loadProgress() {
        const user = authSystem.getCurrentUser();
        if (user && user.achievements) {
            this.achievements = user.achievements;
        }
    }
}

// === نظام الإحصائيات === 
class StatisticsManager {
    constructor() {
        this.stats = {
            totalKills: 0,
            totalDamageDealt: 0,
            totalDamageReceived: 0,
            levelsBeat: 0,
            playtime: 0,
            accuracy: 0
        };
    }
    
    // تحديث الإحصائيات
    updateStats(playerStats) {
        this.stats.totalKills += playerStats.kills || 0;
        this.stats.totalDamageDealt += playerStats.damageDealt || 0;
        this.stats.totalDamageReceived += playerStats.damageReceived || 0;
    }
    
    // حفظ الإحصائيات
    saveStats() {
        const user = authSystem.getCurrentUser();
        if (user) {
            user.stats = this.stats;
            authSystem.updateUser(user);
        }
    }
    
    // الحصول على الإحصائيات
    getStats() {
        return this.stats;
    }
}