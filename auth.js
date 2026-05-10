// === نظام التحقق والمصادقة ===

class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.setupEventListeners();
    }
    
    // تحميل بيانات المستخدمين من localStorage
    loadUsers() {
        const data = localStorage.getItem('malak_users');
        return data ? JSON.parse(data) : {};
    }
    
    // حفظ بيانات المستخدمين إلى localStorage
    saveUsers() {
        localStorage.setItem('malak_users', JSON.stringify(this.users));
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn) loginBtn.addEventListener('click', () => this.login());
        if (registerBtn) registerBtn.addEventListener('click', () => this.register());
    }
    
    // تسجيل مستخدم جديد
    register() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('loginMessage');
        
        // التحقق من صحة المدخلات
        if (!username || !password) {
            this.showMessage('يرجى إدخال اسم مستخدم وكلمة مرور', 'error');
            return;
        }
        
        if (username.length < 3) {
            this.showMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل', 'error');
            return;
        }
        
        if (password.length < 4) {
            this.showMessage('كلمة المرور يجب أن تكون 4 أحرف على الأقل', 'error');
            return;
        }
        
        if (this.users[username]) {
            this.showMessage('هذا الاسم مستخدم بالفعل', 'error');
            return;
        }
        
        // إنشاء حساب جديد
        this.users[username] = {
            password: this.encryptPassword(password),
            createdAt: new Date().toISOString(),
            level: 1,
            score: 0,
            character: null,
            progress: {}
        };
        
        this.saveUsers();
        this.showMessage('تم التسجيل بنجاح! يرجى تسجيل الدخول', 'success');
        
        // مسح الحقول
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        // إعادة تعيين الأزرار بعد 2 ثانية
        setTimeout(() => {
            document.getElementById('username').focus();
        }, 1000);
    }
    
    // تسجيل الدخول
    login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // التحقق من صحة المدخلات
        if (!username || !password) {
            this.showMessage('يرجى إدخال اسم مستخدم وكلمة مرور', 'error');
            return;
        }
        
        // التحقق من المستخدم
        if (!this.users[username]) {
            this.showMessage('اسم المستخدم غير موجود', 'error');
            return;
        }
        
        const user = this.users[username];
        if (user.password !== this.encryptPassword(password)) {
            this.showMessage('كلمة المرور غير صحيحة', 'error');
            return;
        }
        
        // تسجيل الدخول بنجاح
        this.currentUser = { username, ...user };
        this.showMessage('تم تسجيل الدخول بنجاح!', 'success');
        
        // الانتقال إلى شاشة اختيار الشخصية
        setTimeout(() => {
            this.showScreen('characterScreen');
        }, 1000);
    }
    
    // تشفير كلمة المرور (تشفير بسيط - يفضل استخدام تشفير حقيقي في الإنتاج)
    encryptPassword(password) {
        return btoa(password); // Base64 encoding - للتطوير فقط
    }
    
    // عرض رسالة
    showMessage(message, type) {
        const messageDiv = document.getElementById('loginMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
        }
    }
    
    // عرض شاشة معينة
    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
    }
    
    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }
    
    // تحديث بيانات المستخدم
    updateUser(userData) {
        if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...userData };
            this.users[this.currentUser.username] = this.currentUser;
            this.saveUsers();
        }
    }
    
    // تسجيل الخروج
    logout() {
        this.currentUser = null;
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        this.showScreen('loginScreen');
    }
}

// إنشاء نسخة من نظام المصادقة
const authSystem = new AuthSystem();