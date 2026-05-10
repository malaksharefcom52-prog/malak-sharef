// === نظام واجهة المستخدم ===

class UIManager {
    constructor() {
        this.setupEventListeners();
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // شاشة اختيار الشخصية
        const selectButtons = document.querySelectorAll('.select-character');
        selectButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectCharacter(e));
        });
        
        // أزرار اللعبة
        const pauseBtn = document.getElementById('pauseBtn');
        const menuBtn = document.getElementById('menuBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const restartBtn = document.getElementById('restartBtn');
        const exitBtn = document.getElementById('exitBtn');
        const restartGameBtn = document.getElementById('restartGameBtn');
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseGame());
        if (menuBtn) menuBtn.addEventListener('click', () => this.goToMenu());
        if (resumeBtn) resumeBtn.addEventListener('click', () => this.resumeGame());
        if (restartBtn) restartBtn.addEventListener('click', () => this.restartLevel());
        if (exitBtn) exitBtn.addEventListener('click', () => this.exitGame());
        if (restartGameBtn) restartGameBtn.addEventListener('click', () => this.newGame());
        if (mainMenuBtn) mainMenuBtn.addEventListener('click', () => this.mainMenu());
    }
    
    // اختيار شخصية
    selectCharacter(event) {
        const card = event.target.closest('.character-card');
        const characterType = card.getAttribute('data-character');
        
        const user = authSystem.getCurrentUser();
        user.character = characterType;
        authSystem.updateUser(user);
        
        // الانتقال إلى شاشة المستويات
        authSystem.showScreen('levelScreen');
        
        // عرض المستويات
        const levelManager = new LevelManager(GAME_CONFIG.levels);
        levelManager.displayLevelsScreen();
        
        // إضافة مستمع الأحداث لاختيار المستوى
        const levelCards = document.querySelectorAll('.level-card');
        levelCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                this.startGame(index);
            });
        });
    }
    
    // بدء اللعبة
    startGame(levelIndex) {
        window.gameInstance = new Game(levelIndex);
        window.gameInstance.start();
    }
    
    // إيقاف اللعبة مؤقتاً
    pauseGame() {
        if (window.gameInstance) {
            window.gameInstance.paused = true;
            authSystem.showScreen('pauseScreen');
        }
    }
    
    // استئناف اللعبة
    resumeGame() {
        if (window.gameInstance) {
            window.gameInstance.paused = false;
            authSystem.showScreen('gameScreen');
        }
    }
    
    // إعادة المستوى
    restartLevel() {
        if (window.gameInstance) {
            window.gameInstance.restart();
            authSystem.showScreen('gameScreen');
        }
    }
    
    // الخروج من اللعبة
    exitGame() {
        authSystem.showScreen('levelScreen');
    }
    
    // لعبة جديدة
    newGame() {
        authSystem.showScreen('levelScreen');
    }
    
    // القائمة الرئيسية
    mainMenu() {
        authSystem.logout();
    }
    
    // الذهاب للقائمة
    goToMenu() {
        authSystem.showScreen('levelScreen');
    }
    
    // تحديث شريط الصحة
    updateHealth(health, maxHealth) {
        const healthFill = document.getElementById('healthFill');
        const healthText = document.getElementById('healthText');
        if (healthFill) {
            const percent = (health / maxHealth) * 100;
            healthFill.style.width = percent + '%';
        }
        if (healthText) {
            healthText.textContent = `${Math.ceil(health)}/${maxHealth}`;
        }
    }
    
    // تحديث النقاط
    updateScore(score) {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }
    
    // تحديث الموجة
    updateWave(wave, totalWaves) {
        const waveElement = document.getElementById('wave');
        if (waveElement) {
            waveElement.textContent = `${wave}/${totalWaves}`;
        }
    }
    
    // تحديث معلومات اللاعب
    updatePlayerInfo(playerName, levelName) {
        const playerElement = document.getElementById('playerName');
        const levelElement = document.getElementById('levelTitle');
        if (playerElement) playerElement.textContent = playerName;
        if (levelElement) levelElement.textContent = levelName;
    }
    
    // عرض شاشة النهاية
    showEndScreen(score, level) {
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalLevel').textContent = level;
        authSystem.showScreen('endScreen');
    }
}